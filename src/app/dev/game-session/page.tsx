'use client';

import React, { useState, useEffect } from 'react';
import { World } from '@/types/world.types';
import GameSession from '@/components/GameSession/GameSession';
import { useWorldStore } from '@/state/worldStore';
import { useSessionStore } from '@/state/sessionStore';
import { useCharacterStore } from '@/state/characterStore';
import { useNarrativeStore } from '@/state/narrativeStore';
import { useInventoryStore } from '@/state/inventoryStore';
import { useNPCStore } from '@/state/npcStore';
import Logger from '@/lib/utils/logger';
import type { StandardInventoryCategory } from '@/types/inventory.types';
import { getTimestamp } from '@/lib/utils';

// Mock world
const mockWorld: World = {
  id: 'world-1',
  name: "奇幻领域",
  description: "一个充满魔法与冒险的高奇幻世界",
  genre: 'fantasy',
  attributes: [
    {
      id: 'strength',
      name: "力量",
      description: "体能与肌肉力量",
      worldId: 'world-1',
      baseValue: 1,
      minValue: 1,
      maxValue: 20,
    },
    {
      id: 'intelligence',
      name: "智力",
      description: "思维敏锐度与推理能力",
      worldId: 'world-1',
      baseValue: 1,
      minValue: 1,
      maxValue: 20,
    },
  ],
  skills: [
    {
      id: 'lockpicking',
      name: "开锁",
      description: "不使用钥匙开锁的技艺",
      worldId: 'world-1',
      difficulty: 'medium',
      baseValue: 1,
      minValue: 1,
      maxValue: 10,
    },
    {
      id: 'intimidation',
      name: "恐吓",
      description: "利用气场与恐惧影响他人",
      worldId: 'world-1',
      difficulty: 'hard',
      baseValue: 1,
      minValue: 1,
      maxValue: 10,
    },
    {
      id: 'stealth',
      name: "潜行",
      description: "无声无息地行动",
      worldId: 'world-1',
      difficulty: 'medium',
      baseValue: 1,
      minValue: 1,
      maxValue: 10,
    },
    {
      id: 'magic',
      name: "魔法",
      description: "驾驭奥术力量",
      worldId: 'world-1',
      difficulty: 'hard',
      baseValue: 1,
      minValue: 1,
      maxValue: 10,
    },
    {
      id: 'persuasion',
      name: "说服",
      description: "通过言辞与魅力说服他人",
      worldId: 'world-1',
      difficulty: 'easy',
      baseValue: 1,
      minValue: 1,
      maxValue: 10,
    },
  ],
  settings: {
    maxAttributes: 10,
    maxSkills: 10,
    attributePointPool: 100,
    skillPointPool: 100,
  },
  createdAt: '2023-01-01T10:00:00Z',
  updatedAt: '2023-01-01T10:00:00Z',
};

// Mock character
const mockCharacter = {
  id: 'test-character-123',
  name: "测试英雄",
  description: "用于调试的测试角色",
  worldId: 'world-1',
  level: 5,
  background: {
    history: "生于测试工具，长于调试",
    personality: "确定且可靠",
    goals: ["通过所有测试"],
    fears: ["空指针异常", "无限循环"],
    physicalDescription: "一个结构良好的测试角色",
    relationships: [],
  },
  portrait: {
    type: 'placeholder' as const,
    url: null,
  },
  attributes: [
    {
      id: 'attr1',
      characterId: 'test-character-123',
      worldAttributeId: 'strength',
      name: "力量",
      baseValue: 14,
      modifiedValue: 14,
      category: 'physical',
    },
    {
      id: 'attr2',
      characterId: 'test-character-123',
      worldAttributeId: 'intelligence',
      name: "智力",
      baseValue: 16,
      modifiedValue: 16,
      category: 'mental',
    },
  ],
  skills: [
    {
      id: 'skill1',
      characterId: 'test-character-123',
      worldSkillId: 'lockpicking',
      name: "开锁",
      level: 8,
      category: 'stealth',
    },
    {
      id: 'skill2',
      characterId: 'test-character-123',
      worldSkillId: 'intimidation',
      name: "恐吓",
      level: 6,
      category: 'social',
    },
    {
      id: 'skill3',
      characterId: 'test-character-123',
      worldSkillId: 'stealth',
      name: "潜行",
      level: 4,
      category: 'stealth',
    },
    {
      id: 'skill4',
      characterId: 'test-character-123',
      worldSkillId: 'magic',
      name: "魔法",
      level: 9,
      category: 'arcane',
    },
    {
      id: 'skill5',
      characterId: 'test-character-123',
      worldSkillId: 'persuasion',
      name: "说服",
      level: 3,
      category: 'social',
    },
  ],
  derivedStats: [],
  isPlayer: true,
  status: {
    conditions: [],
  },
  inventory: {
    characterId: 'test-character-123',
    items: [],
    capacity: 20,
    categories: [],
    itemOrder: [],
  },
  createdAt: getTimestamp(),
  updatedAt: getTimestamp(),
};

type HydrationApi = {
  hasHydrated?: () => boolean;
  onFinishHydration?: (callback: () => void) => () => void;
};

type SessionStateDisplay = {
  status?: string;
  currentSceneId?: string | null;
  playerChoices?: unknown[];
  error?: string | null;
  worldId?: string | null;
  [key: string]: unknown;
};

export default function GameSessionTestHarness() {
  const [showRealComponent, setShowRealComponent] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [currentState, setCurrentState] = useState<SessionStateDisplay>({});
  const logger = React.useMemo(() => new Logger('GameSessionTestHarness'), []);

  // Create mock world and character for testing
  const createTestWorld = React.useCallback(() => {
    const worlds = useWorldStore.getState().worlds || {};
    const characters = useCharacterStore.getState().characters || {};

    // Only create if they don't exist
    if (!worlds[mockWorld.id]) {
      useWorldStore.setState({
        worlds: {
          ...worlds,
          [mockWorld.id]: mockWorld,
        },
      });
      logger.info('Test world created');
    }

    if (!characters[mockCharacter.id]) {
      useCharacterStore.setState({
        characters: {
          ...characters,
          [mockCharacter.id]: mockCharacter,
        },
        currentCharacterId: mockCharacter.id,
        error: null,
        loading: false,
      });
      logger.info('Test character created');
    }

    // Seed a couple of NPCs so consequence targets resolve by name in the
    // choice contract and the SceneStatus disposition labels have data.
    const npcStore = useNPCStore.getState();
    const seededNpcs = [
      { id: 'npc-marta', name: 'Marta' },
      { id: 'npc-guard-bren', name: "守卫 Bren" },
    ];
    const missingNpcs = seededNpcs.filter((npc) => !npcStore.npcs[npc.id]);
    if (missingNpcs.length > 0) {
      const now = getTimestamp();
      useNPCStore.setState((state) => ({
        npcs: {
          ...state.npcs,
          ...Object.fromEntries(
            missingNpcs.map((npc) => [
              npc.id,
              { ...npc, description: "开发测试工具 NPC", worldId: mockWorld.id, createdAt: now, updatedAt: now },
            ])
          ),
        },
        worldNpcs: {
          ...state.worldNpcs,
          [mockWorld.id]: [
            ...(state.worldNpcs[mockWorld.id] ?? []),
            ...missingNpcs.map((npc) => npc.id),
          ],
        },
      }));
      logger.info('Test NPCs created');
    }
  }, [logger]);

  // Add test inventory items to simulate starting inventory
  const addTestInventoryItems = React.useCallback(() => {
    const inventoryStore = useInventoryStore.getState();

    // Clear existing inventory first
    inventoryStore.clearCharacterInventory(mockCharacter.id);

    // Add various test items across categories
    const createAcquisition = (quantity: number = 1) => ({
      acquiredAt: new Date().toISOString(),
      method: 'manual' as const,
      quantity,
    });

    const createCategorization = (categoryId: StandardInventoryCategory) => ({
      categoryId,
      source: 'system' as const,
      classifiedAt: new Date().toISOString(),
      confidence: 0.9,
    });

    inventoryStore.addItem(mockCharacter.id, {
      name: "钢剑",
      description: "一把精工打造的剑",
      quantity: 1,
      stackable: false,
      categorization: createCategorization('equipment'),
      acquisition: createAcquisition(1),
    });

    inventoryStore.addItem(mockCharacter.id, {
      name: "治疗药水",
      description: "恢复 50 HP",
      quantity: 5,
      stackable: true,
      maxStack: 10,
      categorization: createCategorization('consumables'),
      acquisition: createAcquisition(5),
    });

    inventoryStore.addItem(mockCharacter.id, {
      name: "金币",
      description: "货币",
      quantity: 150,
      stackable: true,
      maxStack: 999,
      categorization: createCategorization('valuables'),
      acquisition: createAcquisition(150),
    });

    inventoryStore.addItem(mockCharacter.id, {
      name: "古老地图",
      description: "显示地点",
      quantity: 1,
      stackable: false,
      categorization: createCategorization('documents'),
      acquisition: createAcquisition(1),
    });

    inventoryStore.addItem(mockCharacter.id, {
      name: "魔法戒指",
      description: "任务物品——微微发光",
      quantity: 1,
      stackable: false,
      categorization: createCategorization('quest-items'),
      acquisition: createAcquisition(1),
    });

    logger.info('Test inventory items added');
  }, [logger]);

  // Wait for persisted test data before mounting the session.
  useEffect(() => {
    // IndexedDB hydration can replace seeds written before either store is ready.
    const seedStores = [useWorldStore, useCharacterStore].map(
      (store) => (store as unknown as { persist?: HydrationApi }).persist
    );
    const seedSubscriptions: (() => void)[] = [];
    let hasSeededWorld = false;
    const seedWorldOnce = () => {
      if (
        hasSeededWorld ||
        seedStores.some(
          (persist) => persist?.onFinishHydration && !persist.hasHydrated?.()
        )
      ) {
        return;
      }
      hasSeededWorld = true;
      seedSubscriptions.forEach((unsubscribe) => unsubscribe());
      createTestWorld();
      setIsClient(true);
    };
    seedStores.forEach((persist) => {
      if (persist?.onFinishHydration && !persist.hasHydrated?.()) {
        seedSubscriptions.push(persist.onFinishHydration(seedWorldOnce));
      }
    });
    seedWorldOnce();

    // Add test inventory items after persistence hydrates so test data is consistent
    const inventoryPersist = (
      useInventoryStore as unknown as {
        persist?: HydrationApi;
      }
    ).persist;
    let unsubscribeHydration: (() => void) | undefined;

    const seedInventoryOnce = () => {
      unsubscribeHydration?.();
      unsubscribeHydration = undefined;
      addTestInventoryItems();
    };

    if (inventoryPersist?.hasHydrated?.()) {
      seedInventoryOnce();
    } else if (inventoryPersist?.onFinishHydration) {
      unsubscribeHydration =
        inventoryPersist.onFinishHydration(seedInventoryOnce);
    } else {
      seedInventoryOnce();
    }

    // Don't auto-start sessions - let the GameSession component handle it
    // This prevents conflicts between test harness and component initialization
    logger.info(
      'Test harness ready - GameSession component will handle session initialization'
    );

    // Get initial state
    setCurrentState({ ...useSessionStore.getState() });

    // Setup state display refreshing
    const intervalId = setInterval(() => {
      setCurrentState({ ...useSessionStore.getState() });
    }, 1000);

    return () => {
      // Clean up
      clearInterval(intervalId);
      unsubscribeHydration?.();
      seedSubscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [createTestWorld, addTestInventoryItems, logger]);

  const handleSessionStart = () => {
    logger.info('Session started');
  };

  const handleSessionEnd = () => {
    logger.info('Session ended');
    setShowRealComponent(false);
  };

  if (!isClient) {
    // Return loading placeholder to avoid hydration mismatch
    return (
      <div>
        <h1>游戏冒险记录测试工具</h1>
        <div>正在加载测试工具……</div>
      </div>
    );
  }

  return (
    <div className="game-session-test-harness">
      {!showRealComponent && (
        <>
          <h2>游戏冒险记录测试工具</h2>

          <div>
            <button onClick={() => setShowRealComponent(true)}>
              显示组件
            </button>
          </div>

          <div>
            <button onClick={createTestWorld}>
              确保测试世界与角色存在
            </button>

            <button
              onClick={() => {
                logger.info('Starting new session');
                const store = useSessionStore.getState();
                if (store.initializeSession) {
                  store.initializeSession(
                    mockWorld.id,
                    mockCharacter.id,
                    handleSessionStart
                  );
                } else {
                  logger.error('initializeSession method not found');
                }
              }}
            >
              开始冒险记录
            </button>

            <button
              onClick={() => {
                logger.info('Ending session');
                useSessionStore.getState().endSession();
              }}
            >
              结束冒险记录
            </button>

            <button
              onClick={() => {
                logger.info('Resetting all session and narrative state');

                useSessionStore.setState({
                  id: null,
                  status: 'initializing',
                  currentSceneId: null,
                  playerChoices: [],
                  error: null,
                  worldId: null,
                  characterId: null,
                  savedSessions: {},
                  autoSave: {
                    lastSaveTime: null,
                    status: 'idle',
                    errorMessage: null,
                    totalSaves: 0,
                  },
                });

                const narrativeStore = useNarrativeStore.getState();
                narrativeStore.reset();
                narrativeStore.clearEnding();

                useCharacterStore.getState().setCurrentCharacter(mockCharacter.id);

                setTimeout(() => {
                  logger.info('Forcing page refresh for complete reset');
                  window.location.reload();
                }, 500);
              }}
            >
              重置状态并刷新
            </button>
          </div>

          <div>
            <h2>当前冒险记录状态</h2>
            <p>
              状态：{' '}
              <span>{currentState.status || 'unknown'}</span>
            </p>
            <p>
              存储方法：{' '}
              {Object.keys(useSessionStore.getState())
                .filter((key) => {
                  const value =
                    useSessionStore.getState()[
                      key as keyof typeof useSessionStore.getState
                    ];
                  return typeof value === 'function';
                })
                .join(', ')}
            </p>
            <div>
              {JSON.stringify(currentState, null, 2)}
            </div>
          </div>

          <div>
            <h2>测试世界数据</h2>
            <div>
              {JSON.stringify(mockWorld, null, 2)}
            </div>
          </div>
        </>
      )}

      {showRealComponent && (
        <GameSession
          worldId={mockWorld.id}
          onSessionStart={handleSessionStart}
          onSessionEnd={handleSessionEnd}
        />
      )}
    </div>
  );
}
