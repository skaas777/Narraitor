// src/lib/inventory/categories.ts

import type { StandardInventoryCategory } from '@/types/inventory.types';

/**
 * Array of all standard inventory categories.
 * Use this for iteration, validation, or displaying category options.
 */
export const STANDARD_CATEGORIES: StandardInventoryCategory[] = [
  'equipment',
  'valuables',
  'consumables',
  'documents',
  'personal',
  'quest-items',
  'miscellaneous',
];

/**
 * Category metadata for display and documentation purposes.
 */
export interface CategoryMetadata {
  name: string;
  description: string;
}

/**
 * Metadata mapping for all standard categories.
 */
const CATEGORY_METADATA: Record<StandardInventoryCategory, CategoryMetadata> = {
  equipment: {
    name: "装备",
    description: "用于执行任务或日常携带的物品（工具、装置、装备）",
  },
  valuables: {
    name: "贵重物品",
    description: "具有金钱或情感价值的货币、宝物与收藏品",
  },
  consumables: {
    name: "消耗品",
    description: "使用后会被消耗的一次性物品（食物、药品、燃料）",
  },
  documents: {
    name: "文件",
    description: "书面材料、数据、地图、记录与信件",
  },
  personal: {
    name: "个人物品",
    description: "衣物、饰品、随身物品、纪念品",
  },
  'quest-items': {
    name: "任务物品",
    description: "推动故事发展的关键物品",
  },
  miscellaneous: {
    name: "杂项",
    description: "不属于其他分类的物品",
  },
};

/**
 * Validates whether a string is a valid standard inventory category.
 *
 * @param value - The value to validate
 * @returns True if the value is a valid StandardInventoryCategory
 *
 * @example
 * ```typescript
 * isValidCategory('equipment'); // true
 * isValidCategory('invalid'); // false
 * ```
 */
export function isValidCategory(value: string): value is StandardInventoryCategory {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return STANDARD_CATEGORIES.includes(value as StandardInventoryCategory);
}

/**
 * Retrieves metadata for a specific category.
 *
 * @param category - The category to get metadata for
 * @returns Category metadata object or undefined if invalid
 *
 * @example
 * ```typescript
 * const metadata = getCategoryMetadata('equipment');
 * console.log(metadata.name); // "Equipment"
 * console.log(metadata.description); // "Items used for tasks or carried regularly (tools, devices, gear)"
 * ```
 */
export function getCategoryMetadata(
  category: StandardInventoryCategory
): CategoryMetadata | undefined {
  return CATEGORY_METADATA[category];
}
