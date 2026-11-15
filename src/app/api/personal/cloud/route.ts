import { get, put, BlobPreconditionFailedError } from '@vercel/blob';
import { gunzipSync, gzipSync } from 'node:zlib';
import { PERSONAL_CLOUD_ENABLED, validRecords, type CloudSnapshot } from '@/lib/cloud/schema';
import { isSameOrigin, personalProviderInfo } from '@/lib/cloud/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const PATH = 'personal/game-save-v1.json.gz';
const MAX_UPLOAD = 4_000_000;
const MAX_SAVE = 32_000_000;
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });

async function readCloud(ifNoneMatch?: string) {
  return get(PATH, { access: 'private', useCache: false, ifNoneMatch });
}

export async function GET(request: Request) {
  if (!PERSONAL_CLOUD_ENABLED) return reply({ error: 'Cloud saves disabled' }, 404);
  const provider = personalProviderInfo();
  if (!provider) return reply({ error: 'Model configuration unavailable' }, 503);
  try {
    const result = await readCloud(request.headers.get('if-none-match') ?? undefined);
    if (result?.statusCode === 304) return new Response(null, { status: 304, headers });
    const snapshot: CloudSnapshot | null = result?.stream
      ? JSON.parse(gunzipSync(Buffer.from(await new Response(result.stream).arrayBuffer()), {
        maxOutputLength: MAX_SAVE,
      }).toString('utf8')) : null;
    return reply({ snapshot, etag: result?.blob.etag ?? null, provider });
  } catch {
    return reply({ error: 'Cloud save could not be loaded' }, 503);
  }
}

export async function POST(request: Request) {
  if (!PERSONAL_CLOUD_ENABLED) return reply({ error: 'Cloud saves disabled' }, 404);
  if (!isSameOrigin(request)) return reply({ error: 'Invalid origin' }, 403);
  let payload: { etag: string | null; records: Record<string, string>; mutationId: string };
  try {
    if (Number(request.headers.get('content-length')) > MAX_UPLOAD) return reply({ error: 'Save too large' }, 413);
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: 'Missing save' }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_UPLOAD) { await reader.cancel(); return reply({ error: 'Save too large' }, 413); }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks);
    const json = request.headers.get('content-type') === 'application/octet-stream'
      ? gunzipSync(body, { maxOutputLength: MAX_SAVE }).toString('utf8') : body.toString('utf8');
    if (Buffer.byteLength(json) > MAX_SAVE) return reply({ error: 'Save too large' }, 413);
    payload = JSON.parse(json);
    if (!payload || !validRecords(payload.records) ||
      !(payload.etag === null || (typeof payload.etag === 'string' && payload.etag.length < 200)) ||
      typeof payload.mutationId !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(payload.mutationId)) {
      return reply({ error: 'Invalid save' }, 400);
    }
  } catch { return reply({ error: 'Invalid save' }, 400); }

  const snapshot: CloudSnapshot = {
    schema: 1, records: payload.records, mutationId: payload.mutationId,
    savedAt: new Date().toISOString(),
  };
  try {
    const result = await put(PATH, gzipSync(JSON.stringify(snapshot)), {
      access: 'private', addRandomSuffix: false, contentType: 'application/gzip',
      allowOverwrite: payload.etag !== null,
      ...(payload.etag ? { ifMatch: payload.etag } : {}),
    });
    return reply({ etag: result.etag, savedAt: snapshot.savedAt, mutationId: snapshot.mutationId });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return reply({ error: 'Save changed on another device' }, 409);
    // Creating a first save is also atomic: allowOverwrite=false fails when
    // another device has already created it. A lost POST response is recoverable
    // by comparing mutationId at the next load.
    try {
      const current = await readCloud();
      if (current && current.blob.etag !== payload.etag) return reply({ error: 'Save changed on another device' }, 409);
    } catch { /* Keep the original failure private. */ }
    return reply({ error: 'Cloud save temporarily unavailable' }, 503);
  }
}
