import { isFeatureEnabled } from '@/lib/featureFlags';
import { getChapterContext } from '@/lib/narrative/chapters';
import type { NarrativeGenerator } from '@/lib/ai/narrativeGenerator';
import { mergeTurnTags } from '@/lib/narrative/turnTags';
import { useCharacterStore } from '@/state/characterStore';
import { useNarrativeStore } from '@/state/narrativeStore';
import { useWorldStore } from '@/state/worldStore';
import type { EntityID } from '@/types/common.types';
import type { InventoryItem } from '@/types/inventory.types';
import type { NarrativeGenerationResult } from '@/types/narrative.types';
import { safeTrim } from '@/lib/utils';
import { useInventoryStore } from '@/state/inventoryStore';
import { buildStoryMemoryContext } from '@/lib/narrative/storyMemory';

export interface ItemUsageNarrativeDetails {
  wasConsumed?: boolean;
  remainingQuantity?: number;
  previousQuantity?: number;
}

export interface ItemUsageNarrativeSceneState {
  location: string | null;
  presentNpcNames: string[];
  completedBeats?: readonly { id: string; text: string; turnIndex: number }[];
}

interface ItemUsageNarrativeRequest {
  item: InventoryItem;
  characterId: EntityID;
  worldId: EntityID;
  sessionId: EntityID;
  usageDetails: ItemUsageNarrativeDetails;
  sceneState?: ItemUsageNarrativeSceneState;
  /** Set when regenerating after a lethal draft on this protected turn. */
  isFatalRepair?: boolean;
}

/**
 * Builds local fallback prose for an item-use turn.
 */
export function buildUsageNarrative(
  item: InventoryItem,
  usageDetails: ItemUsageNarrativeDetails,
  tone: 'detailed' | 'simple' = 'simple'
): string {
  const previousQuantity = usageDetails.previousQuantity ?? item.quantity;
  const remainingQuantity =
    usageDetails.remainingQuantity ??
    (usageDetails.wasConsumed
      ? Math.max(previousQuantity - 1, 0)
      : previousQuantity);
  const narrativeParts: string[] = [];

  if (tone === 'detailed') {
    narrativeParts.push(
      `你使用了${previousQuantity === 1 ? '' : '其中一件 '}${item.name}。${item.description || ''}`
    );
  } else {
    if (usageDetails.wasConsumed) {
      narrativeParts.push(
        remainingQuantity > 0
          ? `你使用了其中一件 ${item.name}，还剩 ${remainingQuantity} 件。`
          : `你用完了最后一件 ${item.name}。`
      );
    } else {
      narrativeParts.push(
        `你使用了${item.name}。${item.description || ''}`
      );
    }

    return narrativeParts.map((part) => safeTrim(part)).join(' ');
  }

  if (usageDetails.wasConsumed) {
    narrativeParts.push(
      remainingQuantity > 0
        ? `你还剩 ${remainingQuantity} 件可用。`
        : "那已是这件物品的最后一件。"
    );
  } else {
    narrativeParts.push(
      "片刻过去，物品仍稳稳留在你手中。"
    );
  }

  return narrativeParts.map((part) => safeTrim(part)).join(' ');
}

/**
 * Generates an item-specific action beat through the resolver-managed
 * generator seam. Provider failures fall back to local prose.
 */
export async function generateItemUsageNarrative(
  {
    item,
    characterId,
    worldId,
    sessionId,
    usageDetails,
    sceneState,
    isFatalRepair,
  }: ItemUsageNarrativeRequest,
  generator: NarrativeGenerator
): Promise<NarrativeGenerationResult> {
  const world = useWorldStore.getState().worlds[worldId];
  const character = useCharacterStore.getState().characters[characterId];

  if (!world || !character) {
    throw new Error('World or character not found');
  }

  try {
    const allSegments = useNarrativeStore
      .getState()
      .getSessionSegments(sessionId);
    const chapter = isFeatureEnabled('CHAPTERS') ? getChapterContext(allSegments) : undefined;
    const previousSegments = chapter?.recentSegments ?? allSegments;
    const recentSegments = previousSegments.slice(-5);
    const lastSegment = allSegments[allSegments.length - 1];
    const currentTags = mergeTurnTags(lastSegment?.metadata?.tags || [], [
      'item-usage',
      `item-${item.categoryId}`,
    ]);
    const itemSituationLines = [
      `The player immediately uses the item "${item.name}".`,
      'Describe the precise motion of using it and the sensory details that follow.',
      'Show the item altering the current stakes or environment right away.',
      'Avoid simply repeating the inventory description; translate it into lived action.',
    ];

    if (
      usageDetails.wasConsumed &&
      typeof usageDetails.previousQuantity === 'number'
    ) {
      const previousQuantity = usageDetails.previousQuantity;
      const remainingQuantity =
        usageDetails.remainingQuantity ?? Math.max(previousQuantity - 1, 0);
      if (previousQuantity > 1 && remainingQuantity > 0) {
        itemSituationLines.push(
          `Only one unit is used in this moment. Make it clear the character still has ${remainingQuantity} remaining for future scenes.`
        );
      } else if (remainingQuantity === 0) {
        itemSituationLines.push(
          'This was the final unit of the item. Emphasize that the supply is now exhausted.'
        );
      }
    } else if (!usageDetails.wasConsumed) {
      itemSituationLines.push(
        'The item remains in the character’s possession after the action.'
      );
    }

    const situationLines = [...itemSituationLines];
    if (item.description) {
      situationLines.push(`The item is known for: ${item.description}.`);
    }
    situationLines.push(`Category context: ${item.categoryId}.`);

    const includedTopics = [
      `item:${item.name}`,
      `category:${item.categoryId}`,
      'item-usage-effect',
    ];
    if (item.description) {
      includedTopics.push(`item-detail:${item.description}`);
    }

    return await generator.generateSegment(
      {
        worldId,
        sessionId,
        characterIds: [characterId],
        fatalRiskAllowed: false,
        ...(isFatalRepair ? { isFatalRepair: true } : {}),
        narrativeContext: {
          worldId,
          sessionId,
          currentSceneId: `item-usage-${item.id}`,
          characterIds: [characterId],
          ...(chapter ? { chapter: { ...chapter, isEnding: false } } : {}),
          previousSegments,
          recentSegments,
          storyMemory: buildStoryMemoryContext(allSegments, useInventoryStore.getState().getCharacterItems(characterId), item.name, character.status.conditions),
          currentTags,
          currentLocation: lastSegment?.metadata?.location,
          currentSituation: situationLines.join(' '),
          importantEntities: [
            {
              id: item.id,
              type: 'item',
              name: item.name,
            },
          ],
          fatalRiskAllowed: false,
          ...(isFatalRepair ? { isFatalRepair: true } : {}),
          ...(sceneState ? { sceneState } : {}),
        },
        generationParameters: {
          segmentType: 'action',
          desiredLength: 'short',
          includedTopics,
          fatalRiskAllowed: false,
          ...(isFatalRepair ? { isFatalRepair: true } : {}),
        },
      }
    );
  } catch {
    return {
      content: buildUsageNarrative(item, usageDetails, 'detailed'),
      segmentType: 'action',
      metadata: {
        characterIds: [characterId],
        tags: ['item-usage', item.categoryId],
      },
    };
  }
}
