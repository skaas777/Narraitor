/**
 * Tests for npcStore validation and error handling
 * Covers input validation and error scenarios
 */

import { useNPCStore } from '../npcStore';
import { ErrorType } from '@/lib/utils/errorUtils';
import { createTestNPCData, resetNPCStore } from './npcStore.testHelpers';

describe('npcStore - Validation and Error Handling', () => {
  beforeEach(() => {
    resetNPCStore(useNPCStore);
  });

  describe('creation validation', () => {
    test('should validate required fields', () => {
      expect(() => {
        useNPCStore.getState().createNPC(createTestNPCData({
          name: '', // Empty name should fail
        }));
      }).toThrow();
    });

    test('should validate worldId is required', () => {
      expect(() => {
        useNPCStore.getState().createNPC(createTestNPCData({
          worldId: '',
        }));
      }).toThrow();
    });

    test('should validate description is required', () => {
      expect(() => {
        useNPCStore.getState().createNPC(createTestNPCData({
          description: '',
        }));
      }).toThrow();
    });
  });

  describe('update validation', () => {
    test('should handle invalid NPC updates', () => {
      useNPCStore.getState().updateNPC('nonexistent-id', { name: 'New Name' });
      const state = useNPCStore.getState();
      expect(state.error?.title).toBe("未找到非玩家角色");
      expect(state.error?.message).toBe("找不到指定的非玩家角色。");
    });

    test('should reject updates with empty name after normalization', () => {
      const npcData = createTestNPCData();

      const npcId = useNPCStore.getState().createNPC(npcData);

      // Try to update with whitespace-only name
      useNPCStore.getState().updateNPC(npcId, { name: '   ' });

      const state = useNPCStore.getState();
      expect(state.error?.title).toBe("名称无效");
      expect(state.error?.message).toBe("非玩家角色名称不能为空。");
      // NPC should not be updated
      expect(state.npcs[npcId].name).toBe('Test NPC');
    });

    test('should reject updates with empty description after normalization', () => {
      const npcData = createTestNPCData();

      const npcId = useNPCStore.getState().createNPC(npcData);

      // Try to update with whitespace-only description
      useNPCStore.getState().updateNPC(npcId, { description: '   ' });

      const state = useNPCStore.getState();
      expect(state.error?.title).toBe("描述无效");
      expect(state.error?.message).toBe("非玩家角色描述不能为空。");
      // NPC should not be updated
      expect(state.npcs[npcId].description).toBe('A test NPC for testing');
    });

    test('should reject updates with empty worldId', () => {
      const npcData = createTestNPCData();

      const npcId = useNPCStore.getState().createNPC(npcData);

      // Try to update with empty worldId
      useNPCStore.getState().updateNPC(npcId, { worldId: '' });

      const state = useNPCStore.getState();
      expect(state.error?.title).toBe("世界 ID 无效");
      expect(state.error?.message).toBe("世界 ID 为必填项。");
      // NPC should not be updated
      expect(state.npcs[npcId].worldId).toBe('world-123');
    });
  });

  describe('error state management', () => {
    test('should handle persistence errors gracefully', () => {
      // Simulate error by setting error state
      useNPCStore.getState().setError({
        title: 'Persistence failed',
        message: 'Persistence failed',
        retryable: false,
        type: ErrorType.UNKNOWN,
        severity: 'error',
      });
      expect(useNPCStore.getState().error?.title).toBe('Persistence failed');

      // Clear error
      useNPCStore.getState().clearError();
      expect(useNPCStore.getState().error).toBeNull();
    });
  });
});
