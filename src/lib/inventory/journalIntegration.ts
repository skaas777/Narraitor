// src/lib/inventory/journalIntegration.ts

import type { InventoryItem, InventoryAcquisitionMethod } from '@/types/inventory.types';
import type { JournalEntry } from '@/types/journal.types';
import type { EntityID } from '@/types/common.types';
import type { LostItemMetadata } from '@/types/narrative.types';
import { getTimestamp } from '@/lib/utils';

/**
 * Determines if an item acquisition should be marked as significant.
 * Significant items appear as major or critical entries in the journal.
 *
 * Quest items are always significant.
 * Rewards and gifts are significant.
 * Other acquisitions are minor.
 */
function determineAcquisitionSignificance(
  item: InventoryItem
): 'minor' | 'major' | 'critical' {
  // Quest items are always major significance
  if (item.categoryId === 'quest-items') {
    return 'major';
  }

  // Check acquisition method
  const latestAcquisition = item.acquisitionHistory[item.acquisitionHistory.length - 1];
  const significantMethods: InventoryAcquisitionMethod[] = ['reward', 'gift', 'quest'];

  if (latestAcquisition && significantMethods.includes(latestAcquisition.method)) {
    return 'major';
  }

  return 'minor';
}

function describeAcquisitionMethod(method: InventoryAcquisitionMethod): string {
  switch (method) {
    case 'loot': return "作为战利品";
    case 'quest': return "来自任务";
    case 'purchase': return "通过购买";
    case 'craft': return "通过制作";
    case 'reward': return "作为奖励";
    case 'gift': return "作为礼物";
    case 'manual':
    case 'unknown':
    default:
      return '';
  }
}

/**
 * Formats acquisition context as a human-readable sentence.
 * Category lives in metadata.tags; method is woven into prose when meaningful.
 */
function formatAcquisitionContext(item: InventoryItem): string {
  const latestAcquisition = item.acquisitionHistory[item.acquisitionHistory.length - 1];

  const subject = item.quantity > 1
    ? `获得 ${item.quantity}x ${item.name}`
    : `获得 ${item.name}`;

  if (!latestAcquisition) {
    return `${subject}。`;
  }

  const methodPhrase = describeAcquisitionMethod(latestAcquisition.method);
  const opener = methodPhrase ? `${subject} ${methodPhrase}。` : `${subject}。`;

  return latestAcquisition.description
    ? `${opener} ${latestAcquisition.description}`
    : opener;
}

/**
 * Creates a journal entry for an item acquisition.
 *
 * Generates a journal entry that includes:
 * - Item name and category
 * - Acquisition method and context
 * - Link back to the acquired item
 * - Appropriate significance level
 *
 * @param item - The acquired inventory item
 * @param worldId - Current world ID
 * @param characterId - Character who acquired the item
 * @returns Journal entry data (without id, sessionId, createdAt)
 */
export function createAcquisitionJournalEntry(
  item: InventoryItem,
  worldId: EntityID,
  characterId: EntityID
): Omit<JournalEntry, 'id' | 'sessionId' | 'createdAt'> {
  const significance = determineAcquisitionSignificance(item);
  const content = formatAcquisitionContext(item);

  return {
    worldId,
    characterId,
    type: 'item_acquisition',
    title: `获得：${item.name}`,
    content,
    significance,
    isRead: false,
    relatedEntities: [
      {
        type: 'item',
        id: item.id,
        name: item.name,
      },
    ],
    metadata: {
      tags: [item.categoryId],
      automaticEntry: true,
    },
    updatedAt: getTimestamp(),
  };
}

/**
 * Creates a journal entry for item loss/usage.
 * Uses INVERSE significance from acquisition (losing quest items = critical, not major).
 */
export function createLossJournalEntry(
  item: InventoryItem,
  lossMetadata: LostItemMetadata,
  worldId: EntityID,
  characterId: EntityID
): Omit<JournalEntry, 'id' | 'sessionId' | 'createdAt'> {
  const significance = determineLossSignificance(item, lossMetadata);
  const content = formatLossContext(item, lossMetadata);

  return {
    worldId,
    characterId,
    type: 'item_usage',
    title: formatLossTitle(item, lossMetadata),
    content,
    significance,
    isRead: false,
    relatedEntities: [
      {
        type: 'item',
        id: item.id,
        name: item.name,
      },
    ],
    metadata: {
      tags: [item.categoryId, lossMetadata.lossReason || 'unknown'],
      automaticEntry: true,
    },
    updatedAt: getTimestamp(),
  };
}

function determineLossSignificance(
  item: InventoryItem,
  lossMetadata: LostItemMetadata
): 'minor' | 'major' | 'critical' {
  // Quest deliveries = major (important story milestone)
  // Check this BEFORE quest-items to ensure delivered quest items aren't "critical"
  if (lossMetadata.lossReason === 'delivered') {
    return 'major';
  }

  // Quest items lost (stolen, destroyed, etc) = CRITICAL
  if (item.categoryId === 'quest-items') {
    return 'critical';
  }

  // Equipment/valuables stolen/destroyed = major
  if (
    ['equipment', 'valuables'].includes(item.categoryId) &&
    ['stolen', 'destroyed', 'dropped'].includes(lossMetadata.lossReason || '')
  ) {
    return 'major';
  }

  // Consumables used normally = minor
  return 'minor';
}

function formatLossTitle(
  item: InventoryItem,
  lossMetadata: LostItemMetadata
): string {
  const reason = lossMetadata.lossReason;

  switch (reason) {
    case 'consumed':
      return `使用：${item.name}`;
    case 'delivered':
      return `交付：${item.name}`;
    case 'stolen':
      return `被盗：${item.name}`;
    case 'destroyed':
      return `被毁：${item.name}`;
    case 'dropped':
      return `被丢弃：${item.name}`;
    case 'sold':
      return `已售出：${item.name}`;
    case 'gifted':
      return `已赠出：${item.name}`;
    case 'sacrificed':
      return `已献祭：${item.name}`;
    default:
      return `已丢失：${item.name}`;
  }
}

function describeLossReason(reason: string | undefined): string {
  switch (reason) {
    case 'consumed': return "使用后";
    case 'delivered': return "交付后";
    case 'stolen': return "被盗后";
    case 'destroyed': return "被毁后";
    case 'dropped': return "丢弃后";
    case 'sold': return "售出后";
    case 'gifted': return "赠出后";
    case 'sacrificed': return "献祭后";
    default: return '';
  }
}

function formatLossContext(
  item: InventoryItem,
  lossMetadata: LostItemMetadata
): string {
  const subject = lossMetadata.quantity && lossMetadata.quantity > 1
    ? `丢失 ${lossMetadata.quantity} 个 ${item.name}`
    : `丢失 ${item.name}`;

  const reasonPhrase = describeLossReason(lossMetadata.lossReason);
  const opener = reasonPhrase ? `${subject} ${reasonPhrase}。` : `${subject}。`;

  return lossMetadata.lossContext
    ? `${opener} ${lossMetadata.lossContext}`
    : opener;
}
