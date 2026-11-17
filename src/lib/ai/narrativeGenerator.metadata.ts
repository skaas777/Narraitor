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
  previousPresentCharacterIds?: readonly string[];
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
  presenceVerified?: boolean;
  location?: string;
  itemsLost?: LostItemMetadata[];
  storyMemory?: StoryMemoryUpdate;
  identifiedCharacters?: GeneratedCharacterMetadata[];
  stateConflicts?: string[];
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

  const eligibleIds = [...new Set([...candidateIds, ...(acquisitionContext?.previousPresentCharacterIds ?? []), ...(acquisitionContext?.knownNpcs?.map((npc) => npc.id) ?? [])])];
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
1. Which of the provided NPC IDs are PHYSICALLY present with the protagonist at the END of the passage.
2. Any tangible items the protagonist newly acquires in this scene and still possesses at its end.
3. The protagonist's actual location at the END of the passage, not a destination they merely plan to visit or an NPC's remote location.
4. Items from the provided possessions that the protagonist actually loses, hands over, or fully consumes in THIS passage.
5. A small storyMemory delta of established facts and completed steps, preserving uncertainty and reusing existing topic keys.
6. Any definite contradiction against established memory or the submitted action. Return conflicts only with VERBATIM priorEvidence (from memory/action) and passageEvidence (from this passage) plus a concise reason. Do not flag style, uncertainty, a causal change actually shown, or an NPC's attributed rumor as established truth.

Rules for presence:
- Only mark an NPC as present if the narration makes it clear they are co-located with the protagonist at the END. People left behind, departed visitors, and people met earlier along the route are absent even if they spoke face-to-face earlier in this passage.
- Exclude NPCs who are merely referenced, remembered, mentioned as being elsewhere, or communicating remotely (phone, radio, etc.).
- The PREVIOUSLY PRESENT list is established scene state. If the protagonist stays with this group, an unmentioned NPC remains present. Silence is not a departure.
- Return absentCharacters with an exact passage quote for each previously present NPC who leaves, stays behind when the protagonist moves, or is explicitly established as elsewhere. Leaving an object is not leaving the scene.
- Return movementEvidence as an exact passage quote ONLY when the protagonist actually moves to another scene. A refined location label, an intention, a memory, or an NPC moving is not protagonist movement. On a scene move, include only NPCs established as accompanying or meeting the protagonist at the destination.
- An NPC on the other side of a closed door, airlock, window, or other separating barrier is not in the protagonist's room. Coordinating through an intercom or operating an external connector does not establish co-location.
- Only use the provided candidate IDs.
- For a candidate with no known name, return identifiedCharacters with its exact name or identifying role ONLY if that name/role appears verbatim in the passage. Do not invent a name, duplicate a known NPC, or use the ID as a display name.

Rules for items:
- Include an item only if the protagonist newly obtains it here and finishes the scene still holding or carrying it.
- Using, testing, repositioning, or continuing to carry an existing item is NOT a new acquisition.
- Do not rename or re-add tools already carried at the start of the scene. Return an empty items array when nothing new is acquired.
- Taking portable tools out of a storage cabinet for ongoing use IS acquisition, even if the character immediately uses them in the same passage. Do not confuse a newly taken portable tool with a fixed environmental instrument.
- The player action describes an attempt, not proof of success. The current passage must actually show the item being taken and retained.
- Ignore objects that are merely observed, touched briefly, or immediately set aside.
- Possession is personal, not shared by the party. Items carried by an ally, kept outside a closed door, or connected to an external supply port are not in the protagonist's inventory. A promise, a radio report, or reserving an ally's spare does not complete a handover.
- Require the passage to establish the protagonist taking or receiving the item. An unspecified "tool bag" does not establish whose bag it is; do not assume it belongs to the protagonist. If ownership or physical transfer is unclear, omit the acquisition and preserve that uncertainty in storyMemory instead.
- Provide concise names and optional descriptions.

Rules for state recovery:
- The current passage is evidence; the player action is only an attempt and the previous passage is historical context.
- A completed handover removes the item even when taking it out of a bag and the recipient accepting it occur in different sentences. Preserve its exact inventory name.
- Reusing or stowing a tool is not losing it. Using a little tape and retaining the roll is not consuming the whole roll. Never infer a loss just from an intention, an NPC's own item, or a remote mention.
- storyMemory.facts: at most 8 {"key":"stable topic","value":"confirmed state or attributed uncertain claim"}.
- storyMemory.completedSteps: at most 4 {"key":"stable task","value":"result actually completed here"}. Plans and instructions are not completed tasks. Do not re-record an unchanged completed task.
- Use the narrative's language. Do not invent time, items, people, evidence or events. Use empty arrays when there is no change.
- Keep confirmed schedules, prices and total balances stable unless this passage establishes an actual causal change. A turn count does not mean a day passed. If the player asks for a short rest or refuses booking/selling, performing a sale, booking, or a multi-day jump on their behalf is a conflict.
- storyMemory.balances: only actual money changes, [{"currency":"same established unit","balance":28,"change":-2,"evidence":"verbatim transaction here"}]. Total balance = previous confirmed total + actual net change; a single pickup is not the whole wallet. Omit unchanged balances.

Respond with STRICT JSON in this shape (no commentary):
{
  "presentCharacterIds": ["npc-id-1", "npc-id-2"],
  "absentCharacters": [{"id":"npc-id-1","evidence":"Exact quote establishing departure or separation"}],
  "movementEvidence": "Exact quote of protagonist moving, or empty string",
  "identifiedCharacters": [{"id":"npc-id-1","name":"Exact name or role from passage"}],
  "location": "Actual final location",
  "itemsLost": [{"name":"Exact held item name","quantity":1,"lossReason":"delivered","lossContext":"Actual handover shown in this passage"}],
  "storyMemory": {"facts":[],"completedSteps":[]},
  "conflicts": [{"priorEvidence":"verbatim prior fact or player instruction","passageEvidence":"verbatim contradictory passage","reason":"why these facts conflict"}],
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
PREVIOUSLY PRESENT (retain on scene continuity unless departure or separation is established):
${JSON.stringify(acquisitionContext.previousPresentCharacterIds ?? [])}
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
      // A validator failure is not evidence that every candidate is present.
      // Carrying the old candidate list into the saved segment leaves NPCs on
      // screen after they have left and produces "unnamed person" entries.
      return { presentCharacterIds: [], items: [] };
    }

    const parsed = JSON.parse(json) as {
      presentCharacterIds?: string[];
      absentCharacters?: Array<{ id?: string; evidence?: string }>;
      movementEvidence?: string;
      location?: string;
      itemsLost?: Array<{ name?: string; quantity?: number; lossReason?: string; lossContext?: string }>;
      storyMemory?: unknown;
      identifiedCharacters?: Array<{ id?: string; name?: string }>;
      conflicts?: Array<{ priorEvidence?: string; passageEvidence?: string; reason?: string }>;
      items?: Array<{
        name?: string;
        description?: string;
        quantity?: number;
        acquisitionMethod?: InventoryAcquisitionMethod;
      }>;
    };

    const allowed = new Set(eligibleIds.map((id) => id.toLowerCase()));
    const confirmedIds = Array.isArray(parsed.presentCharacterIds)
      ? parsed.presentCharacterIds
          .map((id) => id?.toString().trim())
          .filter((id): id is string => Boolean(id))
          .filter((id) => allowed.has(id.toLowerCase()))
      : [];
    const quoted = (evidence: unknown): evidence is string =>
      typeof evidence === 'string' && evidence.trim().length >= 2 && content.includes(evidence);
    const moved = quoted(parsed.movementEvidence);
    const absentIds = new Set((Array.isArray(parsed.absentCharacters) ? parsed.absentCharacters : [])
      .filter((entry) => entry && typeof entry.id === 'string' && quoted(entry.evidence))
      .map((entry) => entry.id!.toLowerCase()));
    const presentCharacterIds = [...new Set([
      ...(moved ? [] : acquisitionContext?.previousPresentCharacterIds ?? []),
      ...confirmedIds,
    ])].filter((id) => allowed.has(id.toLowerCase()) && !absentIds.has(id.toLowerCase()));

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
      presenceVerified: Array.isArray(parsed.presentCharacterIds),
      stateConflicts: (Array.isArray(parsed.conflicts) ? parsed.conflicts : []).slice(0, 3).flatMap((conflict) => {
        if (!conflict || typeof conflict.priorEvidence !== 'string' || typeof conflict.passageEvidence !== 'string' || typeof conflict.reason !== 'string') return [];
        const previous = `${acquisitionContext?.storyMemoryContext ?? ''}\n${acquisitionContext?.playerAction ?? ''}`;
        if (conflict.priorEvidence.trim().length < 4 || conflict.passageEvidence.trim().length < 4 ||
            !previous.includes(conflict.priorEvidence) || !content.includes(conflict.passageEvidence)) return [];
        return [`${conflict.reason.slice(0, 240)} Established: ${conflict.priorEvidence.slice(0, 200)}; draft: ${conflict.passageEvidence.slice(0, 200)}`];
      }),
      identifiedCharacters: (parsed.identifiedCharacters ?? []).flatMap((npc) => {
        if (!npc || typeof npc.id !== 'string' || typeof npc.name !== 'string') return [];
        const name = safeTrim(npc.name);
        return allowed.has(npc.id) && !roster.has(npc.id) && name.length >= 2 && name.length <= 40 && content.includes(name)
          ? [{ id: npc.id, name }] : [];
      }),
      items,
      location: typeof parsed.location === 'string' ? safeTrim(parsed.location).slice(0, 160) || undefined : undefined,
      itemsLost,
      storyMemory: parseStoryMemory(parsed.storyMemory),
    };
  } catch {
    return { presentCharacterIds: [], items: [] };
  }
};
