let mockLocal = new Map<string, string>();
jest.mock('@/lib/storage/indexedDBAdapter', () => ({ IndexedDBAdapter: {
  create: async () => {
    const data = mockLocal;
    return {
      isInitialized: true,
      getItem: async (name: string) => data.get(name) ?? null,
      setItem: async (name: string, value: string) => { data.set(name, value); },
      removeItem: async (name: string) => { data.delete(name); },
    };
  },
} }));
jest.mock('../schema', () => ({ ...jest.requireActual('../schema'), PERSONAL_CLOUD_ENABLED: true }));

type Client = typeof import('../client');
const worldKey = 'narraitor-world-store';
const characterKey = 'narraitor-character-store';
const raw = (name: string) => JSON.stringify({ state: { name }, version: 1 });
let remote: { snapshot: { schema: 1; records: Record<string, string>; mutationId: string; savedAt: string } | null; etag: string | null };
let revision = 0;
let failAfterCommit = false;
const provider = { name: 'AI Genesis DeepSeek', model: 'deepseek-flash', endpoint: 'https://api.ai-genesis.app/v1/chat/completions' };
function client(): Client {
  let result: Client;
  jest.isolateModules(() => { result = jest.requireActual('../client'); });
  return result!;
}

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  mockLocal = new Map();
  remote = { snapshot: null, etag: null };
  revision = 0;
  failAfterCommit = false;
  Object.defineProperty(global.crypto, 'randomUUID', { configurable: true, value: () => `mutation-${Math.random().toString(36).slice(2)}` });
  Object.defineProperty(global.AbortSignal, 'timeout', { configurable: true, value: () => new AbortController().signal });
  global.fetch = jest.fn(async (_input, init) => {
    if (init?.method !== 'POST') return { ok: true, status: 200, json: async () => ({ ...remote, provider }) } as Response;
    const body = JSON.parse(init.body as string);
    if (body.etag !== remote.etag) return { ok: false, status: 409 } as Response;
    remote = { snapshot: { schema: 1, records: body.records, mutationId: body.mutationId, savedAt: new Date().toISOString() }, etag: `revision-${++revision}` };
    if (failAfterCommit) { failAfterCommit = false; throw new Error('Lost response'); }
    return { ok: true, status: 200, json: async () => ({ etag: remote.etag, savedAt: remote.snapshot!.savedAt }) } as Response;
  });
});
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });

test('first login imports all local stores and a fresh device restores them', async () => {
  mockLocal.set(worldKey, raw('Island'));
  mockLocal.set(characterKey, raw('Explorer'));
  const first = client();
  await first.initializeCloud();
  first.finishCloudHydration();
  await first.flushCloud();
  expect(remote.snapshot!.records[characterKey]).toBe(raw('Explorer'));
  localStorage.clear();
  mockLocal = new Map();
  const second = client();
  await second.initializeCloud();
  expect(await second.readCloudRecord(worldKey)).toBe(raw('Island'));
  expect(await second.readCloudRecord(characterKey)).toBe(raw('Explorer'));
  expect(second.getCloudProvider()?.model).toBe('deepseek-flash');
});

test('a returning device loads cloud progress instead of stale cached progress', async () => {
  remote = { snapshot: { schema: 1, records: { [worldKey]: raw('Chapter 4') }, mutationId: 'remote', savedAt: '2026-11-16T01:00:00Z' }, etag: 'revision-1' };
  mockLocal.set(worldKey, raw('Chapter 1'));
  const device = client();
  await device.initializeCloud();
  expect(await device.readCloudRecord(worldKey)).toBe(raw('Chapter 4'));
  expect(mockLocal.get(worldKey)).toBe(raw('Chapter 4'));
});

test('an old device pauses instead of overwriting another device', async () => {
  const first = client();
  await first.initializeCloud(); first.finishCloudHydration();
  const second = client();
  await second.initializeCloud(); second.finishCloudHydration();
  first.writeCloudRecord(worldKey, raw('New story'));
  await first.flushCloud();
  second.writeCloudRecord(worldKey, raw('Stale story'));
  await second.flushCloud();
  expect(second.getCloudStatus().phase).toBe('conflict');
  expect(remote.snapshot!.records[worldKey]).toBe(raw('New story'));
});

test('a committed save survives a lost response and retries without creating a false conflict', async () => {
  const device = client();
  await device.initializeCloud(); device.finishCloudHydration();
  device.writeCloudRecord(worldKey, raw('Safe story'));
  failAfterCommit = true;
  await device.flushCloud();
  expect(device.getCloudStatus().phase).toBe('offline');
  await device.flushCloud();
  expect(device.getCloudStatus().phase).toBe('ready');
  expect(device.getCloudStatus().pending).toBe(false);
});

test('a failed initial load blocks gameplay without replacing existing local saves', async () => {
  mockLocal.set(worldKey, raw('Keep me'));
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Offline'));
  const device = client();
  await expect(device.initializeCloud()).rejects.toThrow();
  device.finishCloudHydration();
  device.writeCloudRecord(worldKey, raw('Empty overwrite'));
  expect(device.getCloudStatus().phase).toBe('error');
  expect(mockLocal.get(worldKey)).toBe(raw('Keep me'));
  expect(remote.snapshot).toBeNull();
});
