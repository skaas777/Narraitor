import type { InventoryItem } from '@/types/inventory.types';
import type { NarrativeSegment, LostItemMetadata } from '@/types/narrative.types';
import { inferItemsLostFromNarrative, sameItemName } from './itemLossInference';

export interface HistoricalInventoryRepair {
  segmentId: string;
  itemId: string;
  loss: LostItemMetadata;
}

/** Recover only an unambiguous, whole, single-item handover omitted by old builds.
 * Both the original passage AND its contemporaneous memory must agree. Never
 * infer a repair from the player's intention or a later generated summary.
 */
export function findHistoricalInventoryRepairs(
  segments: readonly NarrativeSegment[],
  inventory: readonly InventoryItem[]
): HistoricalInventoryRepair[] {
  return inventory.flatMap((item) => {
    if (item.quantity !== 1) return [];
    for (let index = segments.length - 1; index >= 0; index--) {
      const segment = segments[index];
      // A later reacquisition supersedes all earlier losses; an explicit loss
      // has already gone through settlement and must never be applied twice.
      if (segment.metadata.itemsAcquired?.some((entry) => sameItemName(entry.name, item.name)) ||
          segment.metadata.itemsLost?.some((entry) => sameItemName(entry.name, item.name))) return [];
      const entries = segment.metadata.storyMemory?.facts ?? [];
      const corroborated = entries.some((entry) => `${entry.key} ${entry.value}`.includes(item.name) &&
        /不再(?:在|由|持有|属于)|已(?:经)?(?:交给|交出|送给|赠送)|no longer (?:held|carried|in your possession)/i.test(entry.value));
      if (!corroborated) continue;
      const latestAcquisition = item.acquisitionHistory?.at(-1);
      if (latestAcquisition?.sourceId && segments.slice(index).some((entry) => entry.id === latestAcquisition.sourceId)) return [];
      if (latestAcquisition?.acquiredAt && segment.createdAt &&
          Date.parse(latestAcquisition.acquiredAt) > Date.parse(segment.createdAt)) return [];
      const loss = inferItemsLostFromNarrative(segment.content, [item])
        .find((entry) => ['delivered', 'gifted'].includes(entry.lossReason ?? ''));
      if (loss?.quantity === 1) {
        return [{ segmentId: segment.id, itemId: item.id, loss: {
          ...loss, itemId: item.id,
          lossContext: '历史存档自动补扣：原文完成交接，且当段记忆确认不再持有。',
        } }];
      }
    }
    return [];
  });
}
