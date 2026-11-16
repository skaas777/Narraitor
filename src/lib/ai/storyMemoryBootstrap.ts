import type { AIClient } from './types';
import type { InventoryItem } from '@/types/inventory.types';
import type { NarrativeSegment, StoryMemoryUpdate } from '@/types/narrative.types';
import { parseJsonFromLLM } from './parseJSON';
import { parseStoryMemory } from '@/lib/narrative/storyMemory';

/** One-time migration of an existing adventure, without advancing or rewriting its story. */
export async function bootstrapStoryMemory(
  client: AIClient,
  segments: readonly NarrativeSegment[],
  inventory: readonly InventoryItem[],
  signal?: AbortSignal
): Promise<StoryMemoryUpdate | undefined> {
  const archive = segments.map((segment, index) =>
    `[${index + 1}] ${segment.metadata.causedByDecisionText ? `Action: ${segment.metadata.causedByDecisionText}\n` : ''}${segment.content}`
  );
  // Include every passage of an ordinary long save. For unusually huge archives,
  // distribute the remaining budget across passages instead of dropping the beginning.
  const perPassage = Math.max(16, Math.floor(120000 / Math.max(1, archive.length)) - 5);
  const text = archive.map((passage) => passage.length <= perPassage
    ? passage : `${passage.slice(0, Math.floor(perPassage * 0.65))} … ${passage.slice(-Math.floor(perPassage * 0.35))}`
  ).join('\n\n').slice(0, 120000);
  const response = await client.generateContent(`Extract the persistent canon of this saved interactive adventure. Do NOT continue the story or invent anything. Passages are oldest to newest; later explicit changes supersede earlier states. Existing prose may contradict itself: preserve the first established identity of each distinct letter/person, use the latest clearly established location/state, and label disputed claims as uncertain rather than choosing a convenient answer.
Return ONLY JSON: {"facts":[{"key":"stable topic","value":"confirmed fact, speaker and uncertainty when relevant"}],"completedSteps":[{"key":"stable investigation/task","value":"what was actually learned/completed"}],"time":{"day":1,"minute":330,"label":"story time"}}.
Keep at most 30 concise facts and 20 completed steps; each value must be under 70 characters. Use the story's language. Preserve names, relationships, different letters and recipients, witness statements, investigated evidence, confiscations/deliveries and resolved questions. Appointment/permission is not an accomplished task. time is optional: day starts at 1, minute is 0-1439; use the latest established present time, never a future appointment or a remembered earlier event.
The current recorded inventory (may contain historical inconsistencies; do not invent recoveries) is:
${inventory.map((item) => `${item.name}: ${item.quantity}`).join('\n') || '(empty)'}
ARCHIVE:
${text}`, { signal, maxTokens: 4096 });
  return parseStoryMemory(parseJsonFromLLM(response.content), { facts: 60, completedSteps: 40 });
}
