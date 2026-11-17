import type { Decision } from '@/types/narrative.types';
import type { SessionSnapshot } from '@/types/turnResolver.types';
import type { AIClient } from './types';
import { extractJsonObject } from './parseJSON';
import { buildStoryMemoryContext } from '@/lib/narrative/storyMemory';
import { enforceChoiceState } from './choiceStateGuard';

/** Checks the generated alternatives separately from writing them. The latest
 * original passages supersede older inventory counts, not another summary. */
export async function auditChoiceState(
  client: AIClient,
  decision: Decision,
  snapshot?: SessionSnapshot,
  signal?: AbortSignal
): Promise<Decision> {
  if (!snapshot?.segments.length) return decision;
  const archive = snapshot.segments.slice(-5).map((segment, index) =>
    `[${index + 1}] PLAYER ACTION: ${segment.metadata.causedByDecisionText ?? '(none)'}\n${segment.content}`
  ).join('\n\n');
  const memory = buildStoryMemoryContext(snapshot.segments, snapshot.inventory, snapshot.segments.at(-1)?.content);
  const evidence = `${archive}\n${memory}`;
  try {
    const response = await client.generateContent(`Validate these proposed choices, do not write a story or new choices. Passages are oldest to newest. Return ONLY JSON {"invalid":[{"id":"exact option id","evidence":"verbatim quote from supplied history/action/memory","reason":"specific contradiction"}]}.
Reject only a DEFINITE factual impossibility or explicit refusal: unavailable/already consumed items, quantities larger than the remaining stock, another person's belongings treated as the player's, spending beyond the latest total balance, an unchanged completed task offered as a missing prerequisite, or a goal explicitly declined in the latest action. A new version of a menu or a voluntary new plan is not the same as repeating a settled task. Retrieval/purchase of an absent item is allowed. Treat each option independently; do not assume another option happens first. Do not invent resources, visitors, handovers or recoveries to make a choice possible. Uncertain facts alone are not a contradiction. Every rejection needs an exact supporting quote; return [] when all are feasible.
HISTORY AND CURRENT STATE:
${evidence}
CHOICES:
${JSON.stringify(decision.options.map(({ id, text }) => ({ id, text })))}`, { signal, maxTokens: 1200 });
    const json = extractJsonObject(response.content);
    if (!json) return decision;
    const parsed = JSON.parse(json) as { invalid?: Array<{ id?: string; evidence?: string; reason?: string }> };
    if (!Array.isArray(parsed.invalid)) return decision;
    const invalid = (Array.isArray(parsed.invalid) ? parsed.invalid : []).flatMap((entry) => {
      if (!entry || typeof entry.id !== 'string' || typeof entry.evidence !== 'string' ||
          typeof entry.reason !== 'string' || entry.evidence.trim().length < 6 ||
          !evidence.includes(entry.evidence) || !decision.options.some((option) => option.id === entry.id)) return [];
      return [entry.id];
    });
    const checked = invalid.length ? enforceChoiceState(decision, snapshot, invalid) : decision;
    return { ...checked, stateAuditSegmentId: snapshot.segments.at(-1)?.id };
  } catch (error) {
    if (signal?.aborted) throw error;
    // Temporary audit unavailability retains the deterministic state guard.
    return decision;
  }
}
