import { ErrorType, createStoreError } from '@/lib/utils/errorUtils';
import { canEquipItem } from '@/lib/inventory/equippable';
import { createEnsureCharacterInventory } from './inventoryStore.helpers';
import type { InventoryStoreSet, InventoryStoreGet } from './inventoryStore.types';

/**
 * Equipment action factory: item usage (consuming stackables/consumables)
 * and the equip/unequip toggle, including equip-eligibility checks.
 */
export const createEquipmentActions = (
  set: InventoryStoreSet,
  get: InventoryStoreGet
) => {
  const ensureCharacterInventory = createEnsureCharacterInventory(set, get);

  return {
    useItem: (characterId: string, itemId: string) => {
      const state = get();
      const item = state.items[itemId];

      // Validate item exists
      if (!item) {
        const error = createStoreError(
          "未找到物品",
          "找不到指定的物品。",
          ErrorType.VALIDATION
        );
        set({ error });
        return {
          success: false,
          error: {
            type: error.type,
            title: error.title,
            message: error.message,
          },
        };
      }

      // Validate character owns this item
      const characterItems = ensureCharacterInventory(characterId, state);
      if (!characterItems.includes(itemId)) {
        const error = createStoreError(
          "物品不可用",
          "该物品不在你的背包中。",
          ErrorType.VALIDATION
        );
        set({ error });
        return {
          success: false,
          error: {
            type: error.type,
            title: error.title,
            message: error.message,
          },
        };
      }

      // Validate item has quantity > 0
      if (item.quantity <= 0) {
        const error = createStoreError(
          "物品不可用",
          "该物品已不可用。",
          ErrorType.VALIDATION
        );
        set({ error });
        return {
          success: false,
          error: {
            type: error.type,
            title: error.title,
            message: error.message,
          },
        };
      }

      // Determine if item usage should consume quantity.
      // Items explicitly categorized as consumables always consume.
      // Additionally, stackable items are treated as consumables so quantities decrement on use.
      const shouldConsume =
        item.categoryId === 'consumables' || item.stackable;
      let wasConsumed = false;
      let remainingQuantity = item.quantity;

      const previousQuantity = item.quantity;

      if (shouldConsume) {
        wasConsumed = true;
        if (item.quantity === 1) {
          // Remove the entire item
          get().delete(itemId);
          remainingQuantity = 0;
        } else {
          // Reduce quantity by 1
          get().update(itemId, { quantity: item.quantity - 1 });
          remainingQuantity = item.quantity - 1;
        }
      }

      return {
        success: true,
        itemName: item.name,
        categoryId: item.categoryId,
        wasConsumed,
        remainingQuantity,
        previousQuantity,
      };
    },

    toggleEquipItem: (characterId: string, itemId: string) => {
      const state = get();
      const item = state.items[itemId];

      if (!item) {
        const error = createStoreError(
          "未找到物品",
          "找不到指定的物品。",
          ErrorType.VALIDATION
        );
        set({ error });
        return {
          success: false,
          error: {
            type: error.type,
            title: error.title,
            message: error.message,
          },
        };
      }

      const characterItems = ensureCharacterInventory(characterId, state);
      if (!characterItems.includes(itemId)) {
        const error = createStoreError(
          "物品不在背包中",
          "指定物品不在该角色的背包中。",
          ErrorType.VALIDATION
        );
        set({ error });
        return {
          success: false,
          error: {
            type: error.type,
            title: error.title,
            message: error.message,
          },
        };
      }

      // Unequipping is always allowed; equipping is gated by compatibility.
      const nextEquipped = !item.equipped;
      if (nextEquipped) {
        const eligibility = canEquipItem(item);
        if (!eligibility.allowed) {
          const error = createStoreError(
            "无法装备物品",
            eligibility.reason ?? "该物品无法装备。",
            ErrorType.VALIDATION
          );
          set({ error });
          return {
            success: false,
            equipped: item.equipped ?? false,
            error: {
              type: error.type,
              title: error.title,
              message: error.message,
            },
          };
        }
      }

      get().update(itemId, { equipped: nextEquipped });

      return {
        success: true,
        equipped: nextEquipped,
      };
    },
  };
};
