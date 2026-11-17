import type { NarrativeGenerationResult } from '@/types/narrative.types';
import type { AIClient } from './types';
import { analyzeSegmentMetadata } from './narrativeGenerator.metadata';
import type { AcquisitionContext } from './narrativeGenerator.metadata';
import { parseNarrativeResponse } from './narrativeGenerator.response.parse';
import { normalizeNarrativeContent } from './narrativeGenerator.response.normalize';
import {
  normalizeId,
  normalizeCharacterIds,
  getWorldGenre,
  getMoodForGenre,
} from './narrativeGenerator.response.helpers';
import { FIRST_SEGMENT_LOCATION } from '@/types/narrative.types';
import { safeTrim } from '@/lib/utils';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { reconcileBalanceEvidence } from '@/lib/narrative/storyBalances';

export const formatNarrativeResponse = async (
  response: { content?: string; tokenUsage?: number },
  segmentType: string,
  geminiClient: AIClient,
  previousLocation?: string,
  currentSceneNpcIds: readonly string[] = [],
  acquisitionContext?: AcquisitionContext
): Promise<NarrativeGenerationResult> => {
  const parsed = parseNarrativeResponse(response, segmentType, currentSceneNpcIds);
  const actualContent = parsed.actualContent;
  const extractedMetadata = parsed.extractedMetadata;
  const resolvedSegmentType = parsed.segmentType;

  const fallbackMood = getMoodForGenre(getWorldGenre());
  const fallbackLocation = previousLocation || FIRST_SEGMENT_LOCATION;

  const normalizedContent = normalizeNarrativeContent(
    actualContent,
    extractedMetadata
  );

  const speakerId = normalizeId(extractedMetadata.speakerId);
  const characterIds = normalizeCharacterIds(extractedMetadata.characterIds);
  const finalCharacterIds =
    speakerId && !characterIds.includes(speakerId)
      ? [...characterIds, speakerId]
      : characterIds;

  const metadataAnalysis = await analyzeSegmentMetadata(
    normalizedContent,
    extractedMetadata.characters,
    finalCharacterIds,
    geminiClient,
    { ...acquisitionContext, heldItems: acquisitionContext?.heldItems ?? [], previousLocation }
  );
  // An explicitly empty result means no NPC is physically present.
  const confirmedCharacterIds = metadataAnalysis.presentCharacterIds;
  const analyzedItems =
    acquisitionContext?.isOpeningScene
      ? metadataAnalysis.items.filter((item) => !acquisitionContext.heldItems.some((held) =>
          held.name === item.name))
      : Array.isArray(extractedMetadata.itemsAcquired)
      ? extractedMetadata.itemsAcquired
      : metadataAnalysis.items;
  const analyzedLosses = Array.isArray(extractedMetadata.itemsLost)
    ? extractedMetadata.itemsLost : metadataAnalysis.itemsLost;
  const sanitizedMajorEvent =
    extractedMetadata.majorEvent && safeTrim(extractedMetadata.majorEvent).length > 0
      ? safeTrim(extractedMetadata.majorEvent)
      : undefined;
  const balances = reconcileBalanceEvidence(
    normalizedContent,
    extractedMetadata.storyMemory?.balances,
    metadataAnalysis.storyMemory?.balances
  );

  return {
    content: normalizedContent,
    segmentType: resolvedSegmentType as
      | 'scene'
      | 'dialogue'
      | 'action'
      | 'transition',
    metadata: {
      storyMemory: extractedMetadata.storyMemory ? {
        ...extractedMetadata.storyMemory,
        ...(balances ? { balances } : {}),
      } : metadataAnalysis.storyMemory,
      stateConflicts: metadataAnalysis.stateConflicts,
      characterIds: confirmedCharacterIds,
      presenceVerified: metadataAnalysis.presenceVerified,
      ...(isFeatureEnabled('SCENE_STATE') ? {
        ...(extractedMetadata.sceneBeat ? { sceneBeat: extractedMetadata.sceneBeat } : {}),
        sceneEntries: extractedMetadata.sceneEntries ?? [],
        sceneExits: extractedMetadata.sceneExits ?? [],
        ...(extractedMetadata.sceneTransition
          ? { sceneTransition: extractedMetadata.sceneTransition }
          : {}),
      } : {}),
      speakerId,
      // A successful end-of-passage validation can correct a stale primary
      // location; unvalidated fallback data cannot override explicit state.
      location: metadataAnalysis.presenceVerified
        ? metadataAnalysis.location || extractedMetadata.location || fallbackLocation
        : extractedMetadata.location || metadataAnalysis.location || fallbackLocation,
      mood: extractedMetadata.mood || fallbackMood,
      tags: extractedMetadata.tags || [getWorldGenre() || 'fantasy', 'narrative'],
      itemsAcquired:
        analyzedItems && analyzedItems.length > 0 ? analyzedItems : undefined,
      itemsLost:
        analyzedLosses?.length ? analyzedLosses : undefined,
      characters: [...(extractedMetadata.characters ?? []), ...(metadataAnalysis.identifiedCharacters ?? [])],
      majorEvent: sanitizedMajorEvent,
    },
    tokenUsage:
      response.tokenUsage && typeof response.tokenUsage === 'object'
        ? response.tokenUsage
        : response.tokenUsage
          ? {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: response.tokenUsage as number,
            }
          : undefined,
  };
};
