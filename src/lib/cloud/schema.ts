/** The complete game save, excluding browser credentials and device preferences. */
export const CLOUD_STORE_NAMES = [
  'narraitor-world-store',
  'narraitor-character-store',
  'narraitor-session-store',
  'narraitor-narrative-store',
  'narraitor-inventory-store',
  'narraitor-journal-store',
  'narraitor-goal-store',
  'narraitor-npc-store',
  'lore-store',
  'narraitor-scene-store',
  'narraitor-world-thread-store',
] as const;

export const isCloudStore = (name: string): boolean =>
  (CLOUD_STORE_NAMES as readonly string[]).includes(name);

export interface CloudSnapshot {
  schema: 1;
  records: Record<string, string>;
  mutationId: string;
  savedAt: string;
}

export interface CloudProvider {
  name: string;
  model: string;
  endpoint: string;
}

export interface CloudResponse {
  snapshot: CloudSnapshot | null;
  etag: string | null;
  provider: CloudProvider;
}

export const PERSONAL_CLOUD_ENABLED = process.env.NEXT_PUBLIC_PERSONAL_CLOUD === 'true';

export function validRecords(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).every(([name, raw]) => {
    if (!isCloudStore(name) || typeof raw !== 'string') return false;
    try {
      const record = JSON.parse(raw);
      return record && typeof record.state === 'object' && record.state !== null &&
        !Array.isArray(record.state) &&
        (record.version === undefined || Number.isSafeInteger(record.version));
    } catch {
      return false;
    }
  });
}
