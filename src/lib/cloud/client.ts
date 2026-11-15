import { IndexedDBAdapter } from '@/lib/storage/indexedDBAdapter';
import { CLOUD_STORE_NAMES, PERSONAL_CLOUD_ENABLED, type CloudResponse, type CloudProvider } from './schema';

export type SyncPhase = 'loading' | 'ready' | 'saving' | 'offline' | 'conflict' | 'error';
export interface SyncState { phase: SyncPhase; savedAt: string | null; pending: boolean }
interface Outbox { etag: string | null; mutationId: string; dirty: boolean }
const META_KEY = 'narraitor-cloud-outbox-v1';
let status: SyncState = { phase: 'loading', savedAt: null, pending: false };
let records: Record<string, string> = {};
let etag: string | null = null;
let mutationId = '';
let provider: CloudProvider | null = null;
let initialization: Promise<void> | null = null;
let initialized = false;
let writable = false;
let dirty = false;
let generation = 0;
let saving: Promise<void> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

export const getCloudStatus = () => status;
export const getCloudProvider = () => provider;
export const reportCloudStartupFailure = () => publish('error');
export function subscribeCloud(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function publish(phase: SyncPhase) {
  status = { phase, savedAt: status.savedAt, pending: dirty };
  listeners.forEach((listener) => listener());
}
function readOutbox(): Outbox | null {
  try { return JSON.parse(localStorage.getItem(META_KEY) ?? 'null'); } catch { return null; }
}
function persistOutbox() {
  // The save itself is durable in IndexedDB. This small marker remembers its
  // base revision, so a reload cannot silently replace unsent local progress.
  localStorage.setItem(META_KEY, JSON.stringify({ etag, mutationId, dirty }));
}
async function readLocal(): Promise<Record<string, string>> {
  const adapter = await IndexedDBAdapter.create();
  if (!adapter.isInitialized) throw new Error('Browser save storage is unavailable');
  const entries = await Promise.all(CLOUD_STORE_NAMES.map(async (name) => [name, await adapter.getItem(name)] as const));
  return Object.fromEntries(entries.filter((entry): entry is readonly [typeof entry[0], string] => entry[1] !== null));
}
async function cacheLocally(data: Record<string, string>) {
  const adapter = await IndexedDBAdapter.create();
  if (!adapter.isInitialized) throw new Error('Browser save storage is unavailable');
  await Promise.all(CLOUD_STORE_NAMES.map((name) =>
    data[name] === undefined ? adapter.removeItem(name) : adapter.setItem(name, data[name])));
}
async function fetchCloud(conditional = false): Promise<Response> {
  const response = await fetch('/api/personal/cloud', {
    cache: 'no-store', credentials: 'same-origin', redirect: 'error',
    signal: AbortSignal.timeout(30000),
    headers: conditional && etag ? { 'If-None-Match': etag } : {},
  });
  if (response.status !== 304 && !response.ok) throw new Error('Cloud save unavailable');
  return response;
}

export function initializeCloud(): Promise<void> {
  if (!PERSONAL_CLOUD_ENABLED || typeof window === 'undefined') return Promise.resolve();
  if (!initialization) initialization = (async () => {
    try {
      const [response, local] = await Promise.all([fetchCloud(), readLocal()]);
      const remote = await response.json() as CloudResponse;
      provider = remote.provider;
      const outbox = readOutbox();
      const sentAlready = outbox?.dirty && outbox.mutationId === remote.snapshot?.mutationId;
      if (outbox?.dirty && !sentAlready) {
        records = local;
        etag = outbox.etag;
        mutationId = outbox.mutationId;
        dirty = true;
        if (outbox.etag !== remote.etag) {
          initialized = true;
          publish('conflict');
          return;
        }
      } else if (remote.snapshot) {
        records = remote.snapshot.records;
        etag = remote.etag;
        mutationId = remote.snapshot.mutationId;
        await cacheLocally(records);
      } else {
        // The first login imports every existing game store, including stores
        // belonging to pages that have not been mounted in this session.
        records = local;
        dirty = Object.keys(local).length > 0;
        mutationId = crypto.randomUUID();
      }
      status = { ...status, savedAt: remote.snapshot?.savedAt ?? null };
      persistOutbox();
      initialized = true;
      // The UI stays in loading until all game stores have rehydrated.
    } catch (error) {
      publish('error');
      throw error;
    }
  })();
  return initialization;
}

export async function readCloudRecord(name: string): Promise<string | null> {
  await initializeCloud();
  return records[name] ?? null;
}

export function finishCloudHydration() {
  if (!initialized || status.phase === 'conflict') return;
  writable = true;
  publish(dirty ? 'saving' : 'ready');
  if (dirty) void flushCloud();
}

export function writeCloudRecord(name: string, value: string | null) {
  if (!writable || status.phase === 'conflict') return;
  if ((records[name] ?? null) === value) return;
  if (value === null) delete records[name]; else records[name] = value;
  dirty = true;
  generation++;
  mutationId = crypto.randomUUID();
  persistOutbox();
  publish('saving');
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void flushCloud(); }, 800);
}

export async function flushCloud(): Promise<void> {
  if (!writable || !dirty || status.phase === 'conflict') return;
  if (saving) return saving;
  if (timer) clearTimeout(timer);
  const sendingGeneration = generation;
  const sendingMutation = mutationId;
  const serialized = JSON.stringify({ etag, records, mutationId: sendingMutation });
  saving = (async () => {
    try {
      publish('saving');
      let body: BodyInit = serialized;
      let contentType = 'application/json';
      if (typeof CompressionStream !== 'undefined') {
        body = await new Response(new Blob([serialized]).stream().pipeThrough(new CompressionStream('gzip'))).blob();
        contentType = 'application/octet-stream';
      }
      const size = typeof body === 'string' ? new Blob([body]).size : (body as Blob).size;
      if (size > 4_000_000) throw new Error('Save too large');
      const response = await fetch('/api/personal/cloud', {
        method: 'POST', body, headers: { 'Content-Type': contentType },
        credentials: 'same-origin', redirect: 'error', cache: 'no-store',
        keepalive: size < 60000, signal: AbortSignal.timeout(45000),
      });
      if (response.status === 409) {
        // Recover a successful write whose response was lost before retrying.
        const remote = await (await fetchCloud()).json() as CloudResponse;
        if (remote.snapshot?.mutationId !== sendingMutation) { publish('conflict'); return; }
        etag = remote.etag;
        status = { ...status, savedAt: remote.snapshot.savedAt };
      } else {
        if (!response.ok) throw new Error('Save failed');
        const result = await response.json() as { etag: string; savedAt: string };
        etag = result.etag;
        status = { ...status, savedAt: result.savedAt };
      }
      dirty = generation !== sendingGeneration;
      persistOutbox();
      publish(dirty ? 'saving' : 'ready');
    } catch {
      publish('offline');
    } finally {
      saving = null;
      if (dirty && status.phase !== 'conflict') {
        timer = setTimeout(() => { void flushCloud(); }, status.phase === 'offline' ? 10000 : 800);
      }
    }
  })();
  return saving;
}

/** Check when returning to an older tab before allowing it to continue. */
export async function checkCloudVersion() {
  if (!writable || status.phase === 'conflict') return;
  if (dirty || saving) { await flushCloud(); return; }
  try {
    const response = await fetchCloud(true);
    if (response.status === 304) return;
    const remote = await response.json() as CloudResponse;
    if (remote.etag !== etag) publish('conflict');
  } catch { /* Reading can be retried; writes still use conditional revisions. */ }
}

export async function loadLatestCloud() {
  // Retain the displaced local branch for recovery, even when the player
  // chooses the newer cloud save without downloading a file first.
  const adapter = await IndexedDBAdapter.create();
  await adapter.setItem(`narraitor-cloud-recovery-${Date.now()}`, JSON.stringify(records));
  localStorage.removeItem(META_KEY);
  window.location.reload();
}

export function downloadLocalBackup() {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ schema: 1, records, savedAt: new Date().toISOString() })], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `narraitor-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
