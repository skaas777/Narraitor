import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useWorldStore } from '@/state/worldStore';
import { useCharacterStore, type StoreCharacter } from '@/state/characterStore';
import { Button } from '@/components/ui/button';
import { generateUniqueId } from '@/lib/utils/generateId';
import type { GeneratedImage } from '@/types/common.types';
import { getTimestamp } from '@/lib/utils';
import { ensureWorldNpcRoster } from '@/lib/services/worldCreationService';
import { worldApi } from '@/lib/api/worldApi';
import { characterApi } from '@/lib/api/characterApi';
import { generatePortrait } from '@/lib/api/generatePortrait';
import Logger from '@/lib/utils/logger';

const logger = new Logger('TestDataGenerator');

const TV_MOVIE_UNIVERSES = [
  'Game of Thrones',
  'Lord of the Rings',
  'Star Wars',
  'Twin Peaks',
  'Stranger Things',
  'Deadwood',
  'The Walking Dead',
  'Black Mirror',
  'The Matrix',
  'Mad Max',
  'Westworld',
  'Star Trek',
  'Dune',
];

type WorldRelationship = 'set_within' | 'inspired_by' | undefined;

/** Pick a random reference/relationship: 33% original, 33% set_within, 34% inspired_by. */
function pickRandomWorldType(): { reference?: string; relationship: WorldRelationship } {
  const roll = Math.random();
  if (roll < 0.33) return { reference: undefined, relationship: undefined };
  const reference = TV_MOVIE_UNIVERSES[Math.floor(Math.random() * TV_MOVIE_UNIVERSES.length)];
  return { reference, relationship: roll < 0.66 ? 'set_within' : 'inspired_by' };
}

/** Transform API-generated world data to the shape expected by `worldStore.createWorld`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildWorldDataForStore(testWorldData: any, reference: string | undefined, relationship: WorldRelationship): any {
  return {
    ...testWorldData,
    reference,
    relationship,
    universeReference: reference,
    universeRelationship: relationship,
    attributes: testWorldData.attributes.map((attr: Record<string, unknown>) => ({
      ...attr,
      id: generateUniqueId('attr'),
      worldId: '',
    })),
    skills: testWorldData.skills.map((skill: Record<string, unknown>) => ({
      ...skill,
      id: generateUniqueId('skill'),
      worldId: '',
    })),
  };
}

/** Fire-and-await world image generation via API, swallowing failures so world creation isn't blocked. */
async function generateWorldImageAsync(worldId: string, worldName: string): Promise<void> {
  try {
    const world = useWorldStore.getState().worlds[worldId];
    if (!world) return;

    const { imageUrl, aiGenerated } = await worldApi.generateWorldImage({ world });
    const image: GeneratedImage = {
      type: aiGenerated ? 'ai-generated' : 'placeholder',
      url: imageUrl,
      generatedAt: getTimestamp(),
    };
    useWorldStore.getState().updateWorld(worldId, { image });
  } catch (error) {
    logger.error(`Failed to generate world image for test world "${worldName}":`, error);
  }
}

export const TestDataGeneratorSection: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { worlds, currentWorldId, createWorld } = useWorldStore();
  const { createCharacter } = useCharacterStore();

  // Check if we're on the characters page and get the worldId from URL
  const isOnCharactersPage = pathname === '/characters';
  const worldIdFromUrl = isOnCharactersPage
    ? searchParams.get('worldId')
    : null;
  const effectiveWorldId = worldIdFromUrl || currentWorldId;

  const handleGenerateWorld = async () => {
    try {
      const { reference, relationship } = pickRandomWorldType();
      const existingNames = Object.values(worlds).map((w) => w.name);

      const testWorldData = await worldApi.generateWorld({
        worldReference: reference,
        worldRelationship: relationship,
        existingNames,
      });

      const worldId = createWorld(buildWorldDataForStore(testWorldData, reference, relationship));
      await ensureWorldNpcRoster(worldId);

      useWorldStore.getState().setCurrentWorld(worldId);

      await generateWorldImageAsync(worldId, testWorldData.name);
    } catch (error) {
      logger.error('[DevTools] Error generating test world:', error);
      alert(
        `生成测试世界时出错：${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  };

  const handleGenerate5Worlds = async () => {
    const createdWorlds: Array<{ id: string; name: string }> = [];

    try {
      const existingNames = Object.values(worlds).map((w) => w.name);

      for (let i = 0; i < 5; i++) {
        const { reference, relationship } = pickRandomWorldType();

        const allExistingNames = [
          ...existingNames,
          ...createdWorlds.map((w) => w.name),
        ];

        const testWorldData = await worldApi.generateWorld({
          worldReference: reference,
          worldRelationship: relationship,
          existingNames: allExistingNames,
        });

        const worldId = createWorld(buildWorldDataForStore(testWorldData, reference, relationship));
        await ensureWorldNpcRoster(worldId);
        createdWorlds.push({ id: worldId, name: testWorldData.name });

        if (i === 0) {
          useWorldStore.getState().setCurrentWorld(worldId);
        }

        await generateWorldImageAsync(worldId, testWorldData.name);
      }

      const worldNames = createdWorlds.map((w) => w.name).join(', ');
      alert(`已成功生成 5 个带图片的测试世界：${worldNames}`);
    } catch (error) {
      logger.error('[DevTools] Error generating test worlds:', error);
      alert(
        `生成测试世界时出错：${error instanceof Error ? error.message : "未知错误"}\\n\\n出错前已生成 ${createdWorlds.length} 个世界。`
      );
    }
  };

  const handleDebugStorage = () => {
    const currentWorld = effectiveWorldId ? worlds[effectiveWorldId] : null;
    if (!currentWorld) {
      alert("请先选择一个世界");
      return;
    }

    const storageKey = `character-creation-${currentWorld.id}`;
    const storedData = sessionStorage.getItem(storageKey);

    // User-invoked diagnostic: print directly so it shows regardless of Logger level.
    if (storedData) {
      console.log(
        '[TestDataGenerator] Current stored data:',
        JSON.parse(storedData)
      );
      alert(
        `在 sessionStorage 中找到键为 ${storageKey} 的数据。详情请查看控制台。`
      );
    } else {
      console.log(
        '[TestDataGenerator] No data found in sessionStorage for key:',
        storageKey
      );
      alert(`在 sessionStorage 中未找到键为 ${storageKey} 的数据`);
    }
  };

  const handleNavigateEmpty = () => {
    // Just navigate without any data
    router.push('/characters/create');
  };

  const handleGenerate5Characters = async () => {
    const currentWorld = effectiveWorldId ? worlds[effectiveWorldId] : null;
    if (!currentWorld) {
      alert("请先选择一个世界");
      return;
    }

    const createdCharacters = [];
    const { characters } = useCharacterStore.getState();
    const existingCharacterNames = (Object.values(characters) as StoreCharacter[])
      .filter((c) => c.worldId === effectiveWorldId)
      .map((c) => c.name);

    try {
      for (let i = 0; i < 5; i++) {
        // Random character type selection (50/50 between known and original)
        const types: Array<'known' | 'original'> = ['known', 'original'];
        const characterType = types[Math.floor(Math.random() * types.length)];

        const aiCharacterData = await characterApi.generateCharacter({
          worldId: currentWorld.id,
          characterType,
          existingNames: [
            ...existingCharacterNames,
            ...createdCharacters.map((c) => c.name),
          ],
          world: currentWorld,
        });

        // Convert AI-generated data to character store format
        const characterData = {
          name: aiCharacterData.name,
          description: `来自 ${currentWorld.name} 的角色`,
          worldId: currentWorld.id,
          level: aiCharacterData.level || 1,
          isPlayer: true,
          attributes: aiCharacterData.attributes.map(
            (attr: { id: string; value: number }) => {
              const worldAttr = currentWorld.attributes.find(
                (wa) => wa.id === attr.id
              );
              return {
                id: generateUniqueId('attr'),
                characterId: '', // Will be set by store
                name: worldAttr?.name || "未知",
                baseValue: attr.value,
                modifiedValue: attr.value,
                category: worldAttr?.category,
              };
            }
          ),
          skills: aiCharacterData.skills.map(
            (skill: { id: string; level: number }) => {
              const worldSkill = currentWorld.skills.find(
                (ws) => ws.id === skill.id
              );
              return {
                id: generateUniqueId('skill'),
                characterId: '', // Will be set by store
                name: worldSkill?.name || "未知",
                level: skill.level,
                category: worldSkill?.category,
              };
            }
          ),
          derivedStats: [],
          background: {
            history: aiCharacterData.background.description || '',
            personality: aiCharacterData.background.personality || '',
            physicalDescription:
              aiCharacterData.background.physicalDescription || '',
            goals: aiCharacterData.background.motivation
              ? [aiCharacterData.background.motivation]
              : [],
            fears: [],
            relationships: [],
            isKnownFigure: characterType === 'known',
          },
          status: {
            conditions: [],
          },
          inventory: {
            characterId: '', // Will be set by store
            items: [],
            capacity: 100,
            categories: [],
            itemOrder: [],
          },
        };

        const characterId = createCharacter(characterData);
        createdCharacters.push({ id: characterId, name: characterData.name });

        // Generate portrait asynchronously via API route (secure approach)
        try {
          // Get the created character from store
          const storeCharacter =
            useCharacterStore.getState().characters[characterId];
          if (storeCharacter) {
            const { portrait } = await generatePortrait({
              character: {
                name: storeCharacter.name,
                background: {
                  history: storeCharacter.background.history,
                  personality: storeCharacter.background.personality,
                  physicalDescription:
                    storeCharacter.background.physicalDescription || '',
                },
              },
              world: currentWorld,
            });

            useCharacterStore
              .getState()
              .updateCharacter(characterId, { portrait });
          }
        } catch (error) {
          logger.error(
            `[DevTools] Failed to generate portrait for ${characterType} character "${characterData.name}":`,
            error
          );
          // Don't block character creation if portrait generation fails
        }
      }

      const characterNames = createdCharacters.map((c) => c.name).join(', ');
      alert(
        `已成功生成 5 个带头像的 AI 角色（随机类型选择）：${characterNames}`
      );
    } catch (error) {
      logger.error('[DevTools] Error generating AI characters:', error);
      alert(
        `生成角色时出错：${error instanceof Error ? error.message : "未知错误"}\\n\\n出错前已生成 ${createdCharacters.length} 个角色。`
      );
    }
  };

  const handleDeleteAllWorlds = async () => {
    const worldCount = Object.keys(worlds).length;
    if (worldCount === 0) {
      alert("没有可删除的世界");
      return;
    }

    const confirmed = confirm(
      `删除所有世界？\\n\\n这将永久删除所有 ${worldCount} 个世界及其角色。\\n\\n此操作无法撤销！`
    );
    if (!confirmed) return;

    try {
      // Get fresh references to the store methods
      const characterStoreState = useCharacterStore.getState();
      const worldStoreState = useWorldStore.getState();

      // Delete all characters first
      const characterIds = Object.keys(characterStoreState.characters);
      for (const characterId of characterIds) {
        await characterStoreState.deleteCharacter(characterId);
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      // Then delete all worlds
      const worldIds = Object.keys(worldStoreState.worlds);
      for (const worldId of worldIds) {
        await worldStoreState.deleteWorld(worldId);
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      // Clear current world selection
      if (worldStoreState.currentWorldId) {
        worldStoreState.setCurrentWorld('');
      }

      alert(
        `已成功删除所有 ${worldCount} 个世界及其角色`
      );
    } catch (error) {
      logger.error('[DevTools] Error deleting all worlds:', error);
      alert(
        `删除时出错：${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  };

  const handleDeleteAllCharactersInWorld = async () => {
    const currentWorld = effectiveWorldId ? worlds[effectiveWorldId] : null;
    if (!currentWorld) {
      alert("请先选择一个世界");
      return;
    }

    const { characters } = useCharacterStore.getState();
    const worldCharacters = (Object.values(characters) as StoreCharacter[]).filter(
      (c) => c.worldId === effectiveWorldId
    );

    if (worldCharacters.length === 0) {
      alert(`在世界“${currentWorld.name}”中未找到角色`);
      return;
    }

    const confirmed = confirm(
      `删除”${currentWorld.name}”中的所有角色？\\n\\n这将永久删除 ${worldCharacters.length} 个角色。\\n\\n此操作无法撤销！`
    );
    if (!confirmed) return;

    try {
      const { deleteCharacter } = useCharacterStore.getState();

      for (const character of worldCharacters) {
        await deleteCharacter(character.id);
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      alert(
        `已成功删除 ${worldCharacters.length} 个角色（来自“${currentWorld.name}”）`
      );
    } catch (error) {
      logger.error('[DevTools] Error deleting characters:', error);
      alert(
        `删除时出错：${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  };

  const handleNukeEverything = async () => {
    const worldCount = Object.keys(worlds).length;
    const { characters } = useCharacterStore.getState();
    const characterCount = Object.keys(characters).length;
    const totalItems = worldCount + characterCount;

    if (totalItems === 0) {
      alert("无可删除内容——数据库已为空");
      return;
    }

    const confirmed = confirm(
      `核选项——删除所有内容？\\n\\n这将永久删除：\\n• ${worldCount} 个世界\\n• ${characterCount} 个角色\\n• 所有关联数据\\n\\n此操作无法撤销！\\n\\n你确定吗？`
    );
    if (!confirmed) return;

    const doubleConfirmed = confirm(
      "最终警告\\n\\n你即将删除所有内容。\\n\\n点击”确定”以继续彻底销毁数据。"
    );
    if (!doubleConfirmed) return;

    try {
      // Use the reset methods to completely clear both stores
      const characterStoreState = useCharacterStore.getState();
      const worldStoreState = useWorldStore.getState();

      // Reset character store first
      characterStoreState.reset();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Reset world store
      worldStoreState.reset();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Also clear localStorage as a backup
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('world-store');
          localStorage.removeItem('character-store');
          localStorage.removeItem('worlds'); // Legacy storage
        } catch (e) {
          logger.warn('Failed to clear localStorage:', e);
        }
      }

      alert(
        `核选项已完成\\n\\n已删除 ${worldCount} 个世界和 ${characterCount} 个角色。\\n\\n数据库现已为空。`
      );

      // Force a small delay before allowing any other operations
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      logger.error('[DevTools] Error during nuclear deletion:', error);
      alert(
        `删除过程中出错：${error instanceof Error ? error.message : "未知错误"}\\n\\n部分数据可能未被删除。请查看控制台了解详情。`
      );
    }
  };

  const handleDebugPersistence = () => {
    const worldStoreState = useWorldStore.getState();
    const characterStoreState = useCharacterStore.getState();

    // User-invoked diagnostic: print directly so it shows regardless of Logger level.
    console.log('[DevTools] Current Store States:');
    console.log('World Store:', {
      worldCount: Object.keys(worldStoreState.worlds).length,
      currentWorldId: worldStoreState.currentWorldId,
      worlds: worldStoreState.worlds,
    });
    console.log('Character Store:', {
      characterCount: Object.keys(characterStoreState.characters).length,
      currentCharacterId: characterStoreState.currentCharacterId,
      characters: characterStoreState.characters,
    });

    // Check localStorage
    if (typeof window !== 'undefined') {
      console.log('localStorage entries:');
      console.log('world-store:', localStorage.getItem('world-store'));
      console.log('character-store:', localStorage.getItem('character-store'));
      console.log('worlds (legacy):', localStorage.getItem('worlds'));
    }

    alert("调试信息已输出到控制台。请查看浏览器开发者工具。");
  };

  return (
    <div>
      <h3>测试数据生成器</h3>

      <div>
        <Button
          onClick={handleGenerateWorld}
          
          size="sm"
          variant="info"
          title="生成多样化的 AI 世界：33% 原创，33% 设定于既有宇宙，34% 基于既有宇宙"
        >
          生成多样化 AI 世界
        </Button>

        <Button
          onClick={handleGenerate5Worlds}
          
          size="sm"
          variant="info"
          title="生成 5 个多样化的 AI 世界，混合原创、“设定于”和”基于”类型"
        >
          生成 5 个多样化 AI 世界
        </Button>

        <Button
          onClick={handleGenerate5Characters}
          
          size="sm"
          variant="success"
          disabled={!effectiveWorldId}
          title="在所选世界中直接生成 5 个 AI 角色，并随机选择角色类型（50/50 已知/原创）"
        >
          为世界生成 5 个 AI 角色
        </Button>

        <Button
          onClick={handleNavigateEmpty}
          
          size="sm"
          variant="secondary"
          disabled={!effectiveWorldId}
          title="跳转到空白角色创建表单"
        >
          前往空白表单
        </Button>

        <Button
          onClick={handleDebugStorage}
          
          size="sm"
          variant="default"
          disabled={!effectiveWorldId}
          title="检查 sessionStorage 中是否存在测试数据"
        >
          调试：检查存储
        </Button>
      </div>

      <p>
        AI 生成器会创建多样化的测试内容：原创世界、“设定于”宇宙，以及“基于”世界。
        {!effectiveWorldId && "选择一个世界以启用角色生成。"}
        {worldIdFromUrl && (
          <span>
            正在使用当前页面的世界： {worlds[worldIdFromUrl]?.name}
          </span>
        )}
      </p>

      {/* Destructive Operations Section */}
      <div>
        <h4>
          破坏性操作
        </h4>
        <div>
          <Button
            onClick={handleDeleteAllCharactersInWorld}
            
            size="sm"
            variant="warning"
            disabled={!effectiveWorldId}
            title={`删除 ${effectiveWorldId ? worlds[effectiveWorldId]?.name : "所选世界"} 中的所有角色`}
          >
            删除所有角色：{' '}
            {effectiveWorldId ? worlds[effectiveWorldId]?.name : "世界"}
          </Button>

          <Button
            onClick={handleDeleteAllWorlds}
            
            size="sm"
            variant="destructive"
            title="删除所有世界及其角色"
          >
            删除所有世界
          </Button>

          <Button
            onClick={handleNukeEverything}
            
            size="sm"
            variant="destructive"
            title="核选项：删除所有内容"
          >
            彻底删除一切
          </Button>
        </div>
        <p>
          警告：这些操作是永久性的，无法撤销！
        </p>

        <Button
          onClick={handleDebugPersistence}
          
          size="sm"
          variant="default"
          title="调试当前存储状态与持久化"
        >
          调试持久化状态
        </Button>
      </div>

      <div>
        <strong>故障排查：</strong>
        <ul>
          <li>
            如果表单未预填，请尝试访问调试页面：{' '}
            <code>/dev/test-character-form</code>
          </li>
          <li>
            请在浏览器控制台中查看 <code>[TestDataGenerator]</code> 和{' '}
            <code>[CharacterCreationWizard]</code> 日志
          </li>
          <li>如有需要，请清除缓存并强制刷新（Cmd+Shift+R）</li>
        </ul>
      </div>
    </div>
  );
};
