import type { InventoryItem } from '@/types/inventory.types';
import type { NarrativeGenerationResult, NarrativeSegment, StoryMemoryUpdate } from '@/types/narrative.types';
import { inferItemsLostFromNarrative, sameItemName } from './itemLossInference';

type MemoryEntry = { key: string; value: string };
type HistorySegment = Pick<NarrativeSegment, 'content' | 'metadata'>;
const MAX_MEMORY_CHARS = 14000;

const cleanText = (value: unknown, limit: number): string =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, limit) : '';

/** Treat model metadata as untrusted data and keep only a small, typed delta. */
export function parseStoryMemory(value: unknown, limits = { facts: 8, completedSteps: 4 }): StoryMemoryUpdate | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  const entries = (input: unknown, limit: number): MemoryEntry[] =>
    (Array.isArray(input) ? input : []).slice(0, limit).flatMap((entry) => {
      if (!entry || typeof entry !== 'object') return [];
      const key = cleanText(entry.key, 80);
      const text = cleanText(entry.value, 240);
      return key && text ? [{ key, value: text }] : [];
    });
  const facts = entries(raw.facts, limits.facts);
  const completedSteps = entries(raw.completedSteps, limits.completedSteps);
  const clock = raw.time as Record<string, unknown> | undefined;
  const time = clock && Number.isInteger(clock.day) && Number(clock.day) >= 1 &&
    Number.isInteger(clock.minute) && Number(clock.minute) >= 0 && Number(clock.minute) < 1440 &&
    cleanText(clock.label, 80)
    ? { day: Number(clock.day), minute: Number(clock.minute), label: cleanText(clock.label, 80) }
    : undefined;
  return facts.length || completedSteps.length || time
    ? { facts, completedSteps, ...(time ? { time } : {}) }
    : undefined;
}

const factKey = (text: string): string => text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');

function terms(text: string): Set<string> {
  const result = new Set(text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
  for (const run of text.match(/[\p{Script=Han}]+/gu) ?? []) {
    for (let index = 0; index < run.length - 1; index++) result.add(run.slice(index, index + 2));
  }
  return result;
}

function selectRelevant(entries: MemoryEntry[], query: string, limit: number, focus = ''): MemoryEntry[] {
  const queryTerms = terms(query);
  const focusTerms = terms(focus);
  return entries.map((entry, index) => ({
    entry, index,
    score: [...terms(`${entry.key} ${entry.value}`)].reduce((score, term) =>
      score + (queryTerms.has(term) ? 1 : 0) + (focusTerms.has(term) ? 4 : 0), 0),
  })).sort((a, b) => b.score - a.score || b.index - a.index)
    .slice(0, limit).sort((a, b) => a.index - b.index).map(({ entry }) => entry);
}

/** Reconstructs canon from saved deltas; reloading or changing devices needs no extra service. */
export function collectStoryMemory(segments: readonly HistorySegment[]): StoryMemoryUpdate {
  const facts = new Map<string, MemoryEntry>();
  const completedSteps = new Map<string, MemoryEntry>();
  let time: StoryMemoryUpdate['time'];
  for (const segment of segments) {
    const update = parseStoryMemory(segment.metadata.storyMemory, { facts: 80, completedSteps: 60 });
    for (const [target, additions] of [[facts, update?.facts], [completedSteps, update?.completedSteps]] as const) {
      for (const entry of additions ?? []) {
        const key = factKey(entry.key);
        target.delete(key);
        target.set(key, entry);
      }
    }
    if (update?.time && (!time || clockValue(update.time) >= clockValue(time))) time = update.time;
  }
  return { facts: [...facts.values()], completedSteps: [...completedSteps.values()], ...(time ? { time } : {}) };
}

const clockValue = (time: NonNullable<StoryMemoryUpdate['time']>): number => time.day * 1440 + time.minute;

/** Shared projection for prose AND choices. Legacy saves retain relevant original excerpts. */
export function buildStoryMemoryContext(
  segments: readonly HistorySegment[],
  inventory: readonly InventoryItem[],
  query = '',
  conditions: readonly string[] = []
): string {
  if (!segments.length) return '';
  const memory = collectStoryMemory(segments);
  const relevance = `${query} ${segments.at(-1)?.content ?? ''}`;
  const facts = selectRelevant(memory.facts ?? [], relevance, 35, query);
  const completed = selectRelevant(memory.completedSteps ?? [], relevance, 25, query);
  const pastLosses = new Map<string, string>();
  for (const segment of segments) {
    for (const item of segment.metadata.itemsAcquired ?? []) pastLosses.delete(factKey(item.name));
    for (const item of segment.metadata.itemsLost ?? []) {
      pastLosses.set(factKey(item.name), `${item.name}: ${item.lossReason ?? 'lost'}${item.lossContext ? ` — ${cleanText(item.lossContext, 100)}` : ''}`);
    }
  }
  const unavailable = [...pastLosses.values()].filter((loss) =>
    !inventory.some((item) => factKey(loss.split(':')[0]) === factKey(item.name))
  ).slice(-30);
  // Original text remains evidence, not an AI-generated summary promoted to canon.
  // Include the beginning plus relevant old passages, even for pre-upgrade saves.
  const oldSegments = segments.slice(0, -3);
  const excerpts = selectRelevant(oldSegments.map((segment, index) => ({
    key: String(index + 1),
    value: segment.content,
  })), relevance, 5, query);
  if (oldSegments.length && !excerpts.some((entry) => entry.key === '1')) {
    excerpts.unshift({ key: '1', value: oldSegments[0].content });
  }
  const excerptText = (text: string): string => text.length <= 650
    ? text : `${text.slice(0, 420)} … ${text.slice(-220)}`;
  const section = (title: string, entries: MemoryEntry[], budget: number): string => {
    const lines: string[] = [];
    for (const entry of entries) {
      const line = `- ${entry.key}: ${entry.value}`;
      if (lines.join('\n').length + line.length > budget) continue;
      lines.push(line);
    }
    return `${title}:\n${lines.join('\n') || '- None recorded yet.'}`;
  };
  const context = `
PERSISTENT STORY MEMORY — use together with the latest passage, for both story and choices:
${section('ESTABLISHED FACTS (latest value per stable topic)', facts, 4200)}
${section('COMPLETED INVESTIGATIONS / SETTLED RESULTS (do not require again)', completed, 2800)}
CURRENT STORY TIME: ${memory.time ? `day ${memory.time.day}, minute ${memory.time.minute}: ${memory.time.label}` : 'Not yet recorded; continue from the latest passage. Never reset to an earlier time.'}
CURRENT POSSESSION (authoritative quantities; absent items cannot be spent or confiscated):
${inventory.length ? inventory.map((item) => `- ${cleanText(item.name, 80)}: ${item.quantity}`).join('\n') : '- Empty'}
NO LONGER HELD (unless explicitly reacquired later):
${unavailable.length ? unavailable.map((entry) => `- ${entry}`).join('\n').slice(0, 1000) : '- None recorded.'}
CURRENT CONDITIONS: ${cleanText(conditions.join('; '), 400) || 'None recorded.'}
Do not turn a rumor into confirmed truth, merge two letters/recipients, repeat a settled delivery, or make the player prove the same fact again. Use completed evidence to reach an answer, decision, release, confrontation, or a changed objective. An already recorded loss or wound is not a new cost. Preserve the player's decision-making; stop before making a new consequential choice on their behalf.
EARLIER ORIGINAL EXCERPTS (historical, NOT the current location/holdings; later events supersede them):
`;
  const evidence = excerpts.map((entry) => `[Earlier passage ${entry.key}] ${excerptText(entry.value)}`).join('\n');
  return context + evidence.slice(0, Math.max(0, MAX_MEMORY_CHARS - context.length));
}

export const STORY_MEMORY_INSTRUCTIONS = `
PERSISTENT MEMORY OUTPUT (metadata.storyMemory, a SMALL DELTA, not a retelling):
- facts: up to 8 {"key":"stable topic","value":"confirmed answer/state"}. Reuse existing keys for the same person/object/question. Record only facts explicitly established in THIS passage. Preserve who said a claim and whether it remains uncertain. Never silently rewrite old canon.
- completedSteps: up to 4 {"key":"stable investigation/task","value":"what was actually learned/completed"}. A plan, permission, appointment or clue pointing elsewhere does not mean the task is completed. Record the result once it really happens.
- time: {"day":1,"minute":330,"label":"第一天卯初"} ONLY when story time is explicit. Days are 1-based; minute is 0-1439 from midnight, never before CURRENT STORY TIME. Relative advances add to the existing clock; a new day increments day. Otherwise omit time.
- Omit unchanged fields. All memory values are in the story's language, hidden from the passage.
Resolve an ongoing investigation in stages: allow assembled evidence to produce a concrete answer or outcome. Do not replace every answer with another note, confiscation, registration, postponement, or demand to re-obtain the same evidence. A successful action achieves its stated objective before any separate complication.
`;

/** Certain state conflicts stop a draft before any story/inventory mutation. */
export function findStoryStateIssues(
  result: NarrativeGenerationResult,
  segments: readonly HistorySegment[],
  inventory: readonly InventoryItem[]
): string[] {
  const issues: string[] = [];
  const memory = collectStoryMemory(segments);
  if (memory.time && result.metadata.storyMemory?.time &&
      clockValue(result.metadata.storyMemory.time) < clockValue(memory.time)) {
    issues.push(`Time moved backward from ${memory.time.label}; keep day/minute at or after ${clockValue(memory.time)} total minutes.`);
  }
  const acquired = result.metadata.itemsAcquired ?? [];
  const previouslyLost = [...new Map(segments.flatMap((segment) => segment.metadata.itemsLost ?? [])
    .map((loss) => [factKey(loss.name), loss])).values()];
  // Even an omitted itemsLost field must not let the prose replay a known loss.
  const missingItems = previouslyLost.filter((loss) => !inventory.some((item) => sameItemName(item.name, loss.name)))
    .map((loss) => ({ name: loss.name, quantity: 1, stackable: false } as InventoryItem));
  const losses = [...(result.metadata.itemsLost ?? []), ...inferItemsLostFromNarrative(result.content, missingItems)];
  for (const loss of losses) {
    const held = inventory.find((item) => loss.itemId ? item.id === loss.itemId : sameItemName(item.name, loss.name));
    // Unknown alternate names still go through the existing semantic matcher.
    const knownGone = previouslyLost.some((item) => sameItemName(item.name, loss.name));
    const newItem = acquired.find((item) => sameItemName(item.name, loss.name));
    if (!held && !newItem && knownGone) issues.push(`${loss.name} was already lost and has not been reacquired. Do not take/spend/deliver it again.`);
    if (held && (loss.quantity ?? 1) > held.quantity + (newItem?.quantity ?? 0)) {
      issues.push(`${loss.name}: only ${held.quantity} held; cannot lose/spend ${loss.quantity}.`);
    }
  }
  for (const step of result.metadata.storyMemory?.completedSteps ?? []) {
    if (memory.completedSteps?.some((old) => factKey(old.key) === factKey(step.key))) {
      issues.push(`Investigation "${step.key}" is already completed. Show its consequences instead of replaying it as a newly completed task.`);
    }
  }
  return issues;
}

/** Fill missing entries without duplicating losses the model already reported. */
export function reconcileInferredLosses(result: NarrativeGenerationResult, inventory: InventoryItem[]): NarrativeGenerationResult {
  const explicit = result.metadata.itemsLost ?? [];
  const inferred = inferItemsLostFromNarrative(result.content, inventory).filter((loss) =>
    !explicit.some((item) => sameItemName(item.name, loss.name) || item.itemId === inventory.find((held) => sameItemName(held.name, loss.name))?.id)
  );
  return inferred.length ? { ...result, metadata: { ...result.metadata, itemsLost: [...explicit, ...inferred] } } : result;
}
