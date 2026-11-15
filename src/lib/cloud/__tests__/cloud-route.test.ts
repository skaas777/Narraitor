/** @jest-environment node */
import { gunzipSync, gzipSync } from 'node:zlib';

let mockBlob: { body: Buffer; etag: string } | null = null;
let mockRevision = 0;
class MockPrecondition extends Error {}
jest.mock('@vercel/blob', () => ({
  BlobPreconditionFailedError: MockPrecondition,
  get: jest.fn(async (_path, options) => {
    if (!mockBlob) return null;
    if (options.ifNoneMatch === mockBlob.etag) return { statusCode: 304, stream: null, blob: { etag: mockBlob.etag } };
    return { statusCode: 200, stream: new Response(new Uint8Array(mockBlob.body)).body, blob: { etag: mockBlob.etag } };
  }),
  put: jest.fn(async (_path, body, options) => {
    if (mockBlob && (!options.allowOverwrite || options.ifMatch !== mockBlob.etag)) throw new MockPrecondition();
    mockBlob = { body: Buffer.from(body), etag: `revision-${++mockRevision}` };
    return { etag: mockBlob.etag };
  }),
}));
jest.mock('../schema', () => ({ ...jest.requireActual('../schema'), PERSONAL_CLOUD_ENABLED: true }));

import { GET, POST } from '@/app/api/personal/cloud/route';
import { resolveProvider } from '@/lib/ai/resolveApiKey';
import { NextRequest } from 'next/server';

const url = 'https://game.example/api/personal/cloud';
const raw = (title: string) => JSON.stringify({ state: { worlds: { a: { name: title } } }, version: 1 });
const post = (etag: string | null, title: string, mutationId: string) => new Request(url, {
  method: 'POST', headers: { Origin: 'https://game.example', 'Content-Type': 'application/octet-stream' },
  body: gzipSync(JSON.stringify({ etag, records: { 'narraitor-world-store': raw(title) }, mutationId })),
});

beforeEach(() => {
  mockBlob = null;
  mockRevision = 0;
  process.env.PERSONAL_AI_API_KEY = 'test-server-secret';
  process.env.PERSONAL_AI_ENDPOINT = 'https://api.ai-genesis.app/v1/chat/completions';
  process.env.PERSONAL_AI_MODEL = 'deepseek-flash';
});
afterEach(() => {
  delete process.env.PERSONAL_AI_API_KEY;
  delete process.env.PERSONAL_AI_ENDPOINT;
  delete process.env.PERSONAL_AI_MODEL;
});

test('a second device reads the complete durable save, with no model key in the response', async () => {
  expect((await POST(post(null, 'Dragon Island', 'first-save'))).status).toBe(200);
  const result = await GET(new Request(url));
  const body = await result.json();
  expect(body.snapshot.records['narraitor-world-store']).toBe(raw('Dragon Island'));
  expect(body.provider.model).toBe('deepseek-flash');
  expect(JSON.stringify(body)).not.toContain('test-server-secret');
  expect(result.headers.get('cache-control')).toContain('no-store');
  expect(JSON.parse(gunzipSync(mockBlob!.body).toString()).mutationId).toBe('first-save');
});

test('an old device cannot overwrite a newer save, including simultaneous first saves', async () => {
  const first = await (await POST(post(null, 'First', 'first'))).json();
  expect((await POST(post(null, 'Old device', 'second'))).status).toBe(409);
  expect((await POST(post(first.etag, 'New progress', 'third'))).status).toBe(200);
  expect((await POST(post(first.etag, 'Stale progress', 'fourth'))).status).toBe(409);
  expect((await (await GET(new Request(url))).json()).snapshot.records['narraitor-world-store']).toBe(raw('New progress'));
});

test('cross-origin writes and provider secrets in save records are rejected', async () => {
  const crossOrigin = new Request(url, { method: 'POST', headers: { Origin: 'https://other.example' }, body: '{}' });
  expect((await POST(crossOrigin)).status).toBe(403);
  const invalid = new Request(url, {
    method: 'POST', headers: { Origin: 'https://game.example' },
    body: JSON.stringify({ etag: null, records: { 'narraitor-provider-store': raw('secret') }, mutationId: 'x' }),
  });
  expect((await POST(invalid)).status).toBe(400);
});

test('client headers cannot redirect the server-owned model credential', () => {
  const result = resolveProvider(new NextRequest(url, { headers: {
    'x-provider-api-key': 'attacker', 'x-provider-endpoint': 'https://attacker.example/steal',
    'x-provider-type': 'openai-compatible', 'x-provider-model': 'wrong-model',
  } }));
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected configured provider');
  expect(result.descriptor.apiKey).toBe('test-server-secret');
  expect(result.descriptor.endpoint).toBe(process.env.PERSONAL_AI_ENDPOINT);
  expect(result.descriptor.model).toBe('deepseek-flash');
});

test('unchanged cloud saves can be checked without downloading the whole adventure', async () => {
  const first = await (await POST(post(null, 'First', 'first'))).json();
  const result = await GET(new Request(url, { headers: { 'If-None-Match': first.etag } }));
  expect(result.status).toBe(304);
});


test('the private provider supplies Chinese output guidance and enough room for complete character JSON', () => {
  const result = resolveProvider(new NextRequest(url));
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected configured provider');
  const provider = result.descriptor;
  expect(provider?.customSystemPromptOverride).toContain('简体中文');
  expect(provider?.customSystemPromptOverride).toContain('保留请求所要求的 JSON 字段名');
  expect(provider?.maxTokensOverride).toBeGreaterThanOrEqual(8192);
});
