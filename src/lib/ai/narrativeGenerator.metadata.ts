import type { AIClient } from './types';
import type { GeneratedCharacterMetadata, LostItemMetadata, StoryMemoryUpdate } from '@/types/narrative.types';
import type { InventoryAcquisitionMethod } from '@/types/inventory.types';
import { safeTrim } from '@/lib/utils';
import { extractJsonObject } from './parseJSON';
import { parseStoryMemory } from '@/lib/narrative/storyMemory';
import { sameItemName } from '@/lib/narrative/itemLossInference';
import { validateLossReason } from './narrativeGenerator.response.helpers';

export interface AcquisitionContext {
  heldItems: readonly { name: string; quantity: number }[];
  previousPassage?: string;
  playerAction?: string;
  previousLocation?: string;
  knownNpcs?: readonly { id: string; name: string }[];
  storyMemoryContext?: string;
}

export const analyzeSegmentMetadata = async (
  content: string,
  characters: GeneratedCharacterMetadata[] | undefined,
  candidateIds: string[],
  geminiClient: AIClient,
  acquisitionContext?: AcquisitionContext
): Promise<{
  presentCharacterIds: string[];
  location?: string;
  itemsLost?: LostItemMetadata[];
  storyMemory?: StoryMemoryUpdate;
  items: Array<{
    name: string;
    description?: string;
    quantity?: number;
    acquisitionMethod?: InventoryAcquisitionMethod;
  }>;
}> => {
  if (!content) {
    return { presentCharacterIds: candidateIds, items: [] };
  }

  if (process.env.NODE_ENV === 'test') {
    return { presentCharacterIds: candidateIds, items: [] };
  }

  const roster = new Map<string, { name: string; description?: string }>();
  acquisitionContext?.knownNpcs?.forEach(({ id, name }) => roster.set(id, { name }));
  characters?.forEach((character) => {
    if (character?.id && character.name) {
      roster.set(character.id, {
        name: character.name,
        description: character.description,
      });
    }
  });

  const eligibleIds = [...new Set([...candidateIds, ...(acquisitionContext?.knownNpcs?.map((npc) => npc.id) ?? [])])];
  const rosterLines = eligibleIds
    .map((id) => {
      const entry = roster.get(id);
      const displayName = entry?.name || id;
      const summary = entry?.description ? ` — ${entry.description}` : '';
      return `- ${id}: ${displayName}${summary}`;
    })
    .join('\n');

  const prompt = `
You are validating metadata for an already-written narrative segment. Do not write or continue the story. Analyze the passage and produce:
1. Which of the provided NPC IDs are PHYSICALLY present in the scene with the protagonist (sharing the same location, acting together, or speaking face-to-face).
2. Any tangible items the protagonist newly acquires in this scene and still possesses at its end.
3. The protagonist's actual location at the END of the passage, not a destination they merely plan to visit or an NPC's remote location.
4. Items from the provided possessions that the protagonist actually loses, hands over, or fully consumes in THIS passage.
5. A small storyMemory delta of established facts and completed steps, preserving uncertainty and reusing existing topic keys.

Rules for presence:
- Only mark an NPC as present if the narration makes it clear they are co-located with the protagonist during this scene.
- Exclude NPCs who are merely referenced, remembered, mentioned as being elsewhere, or communicating remotely (phone, radio, etc.).
- Only use the provided candidate IDs.

Rules for items:
- Include an item only if the protagonist newly obtains it here and finishes the scene still holding or carrying it.
- Using, testing, repositioning, or continuing to carry an existing item is NOT a new acquisition.
- Do not rename or re-add tools already carried at the start of the scene. Return an empty items array when nothing new is acquired.
- Taking portable tools out of a storage cabinet for ongoing use IS acquisition, even if the character immediately uses them in the same passage. Do not confuse a newly taken portable tool with a fixed environmental instrument.
- The player action describes an attempt, not proof of success. The current passage must actually show the item being taken and retained.
- Ignore objects that are merely observed, touched briefly, or immediately set aside.
- Provide concise names and optional descriptions.

Rules for state recovery:
- The current passage is evidence; the player action is only an attempt and the previous passage is historical context.
- A completed handover removes the item even when taking it out of a bag and the recipient accepting it occur in different sentences. Preserve its exact inventory name.
- Reusing or stowing a tool is not losing it. Using a little tape and retaining the roll is not consuming the whole roll. Never infer a loss just from an intention, an NPC's own item, or a remote mention.
- storyMemory.facts: at most 8 {"key":"stable topic","value":"confirmed state or attributed uncertain claim"}.
- storyMemory.completedSteps: at most 4 {"key":"stable task","value":"result actually completed here"}. Plans and instructions are not completed tasks. Do not re-record an unchanged completed task.
- Use the narrative's language. Do not invent time, items, people, evidence or events. Use empty arrays when there is no change.

Respond with STRICT JSON in this shape (no commentary):
{
  "presentCharacterIds": ["npc-id-1", "npc-id-2"],
  "location": "Actual final location",
  "itemsLost": [{"name":"Exact held item name","quantity":1,"lossReason":"delivered","lossContext":"Actual handover shown in this passage"}],
  "storyMemory": {"facts":[],"completedSteps":[]},
  "items": [
    {
      "name": "Item name",
      "description": "Short description",
      "quantity": 1,
      "acquisitionMethod": "loot" | "quest" | "purchase" | "craft" | "reward" | "gift" | "manual" | "unknown"
    }
  ]
}

CANDIDATE NPCS:
${rosterLines || '- (none)'}

${acquisitionContext ? `POSSESSIONS BEFORE THIS PASSAGE (do not acquire these again merely by using them):
${JSON.stringify(acquisitionContext.heldItems.map(({ name, quantity }) => ({ name, quantity })))}
PREVIOUS PASSAGE (historical context, not a source of new acquisitions):
${acquisitionContext.previousPassage?.slice(-2000) || '(none)'}
PLAYER ACTION (attempt only):
${acquisitionContext.playerAction?.slice(0, 1000) || '(none)'}
PREVIOUS LOCATION (retain only if the passage does not actually move the protagonist):
${acquisitionContext.previousLocation || '(unknown)'}
EXISTING STORY MEMORY (reuse its topic keys; do not copy unchanged history):
${acquisitionContext.storyMemoryContext?.slice(0, 5000) || '(none)'}` : ''}

NARRATIVE:
"""
${content}
"""
    `.trim();

  try {
    const response = await geminiClient.generateContent(prompt);
    const raw = response.content ?? '';
    const json = extractJsonObject(raw);
    if (json === null) {
      return { presentCharacterIds: candidateIds, items: [] };
    }

    const parsed = JSON.parse(json) as {
      presentCharacterIds?: string[];
      location?: string;
      itemsLost?: Array<{ name?: string; quantity?: number; lossReason?: string; lossContext?: string }>;
      storyMemory?: unknown;
      items?: Array<{
        name?: string;
        description?: string;
        quantity?: number;
        acquisitionMethod?: InventoryAcquisitionMethod;
      }>;
    };

    const allowed = new Set(eligibleIds.map((id) => id.toLowerCase()));
    const presentCharacterIds = Array.isArray(parsed.presentCharacterIds)
      ? parsed.presentCharacterIds
          .map((id) => id?.toString().trim())
          .filter((id): id is string => Boolean(id))
          .filter((id) => allowed.has(id.toLowerCase()))
      : candidateIds;

    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    const allowedAcquisitionMethods: InventoryAcquisitionMethod[] = [
      'loot',
      'quest',
      'purchase',
      'craft',
      'reward',
      'gift',
      'manual',
      'unknown',
    ];

    const items = rawItems
      .filter((item): item is Required<typeof item> => Boolean(item?.name))
      .map((item) => {
        const rawMethod =
          item.acquisitionMethod && typeof item.acquisitionMethod === 'string'
            ? item.acquisitionMethod.toLowerCase().trim()
            : 'unknown';
        const acquisitionMethod = allowedAcquisitionMethods.includes(
          rawMethod as InventoryAcquisitionMethod
        )
          ? (rawMethod as InventoryAcquisitionMethod)
          : 'unknown';

        return {
          name: safeTrim(item.name!),
          description: item.description
            ? safeTrim(item.description)
            : undefined,
          quantity:
            typeof item.quantity === 'number' && !Number.isNaN(item.quantity)
              ? item.quantity
              : 1,
          acquisitionMethod,
        };
      })
      .filter((item) => item.name.length > 0);

    const itemsLost = Array.isArray(parsed.itemsLost) ? parsed.itemsLost.flatMap((loss) => {
      if (!loss || typeof loss.name !== 'string') return [];
      const held = acquisitionContext?.heldItems.find((item) => sameItemName(item.name, loss.name!));
      const reason = validateLossReason(loss.lossReason);
      const quantity = loss.quantity ?? 1;
      if (!held || !reason || !Number.isInteger(quantity) || quantity <= 0 || quantity > held.quantity) return [];
      return [{ name: held.name, quantity, lossReason: reason,
        ...(typeof loss.lossContext === 'string' ? { lossContext: safeTrim(loss.lossContext).slice(0, 300) } : {}) }];
    }) : undefined;

    return {
      presentCharacterIds,
      items,
      location: typeof parsed.location === 'string' ? safeTrim(parsed.location).slice(0, 160) || undefined : undefined,
      itemsLost,
      storyMemory: parseStoryMemory(parsed.storyMemory),
    };
  } catch {
    return { presentCharacterIds: candidateIds, items: [] };
  }
};
