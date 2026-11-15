'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ActiveGameSession from '@/components/GameSession/ActiveGameSession';
import { useSessionStore } from '@/state/sessionStore';
import { useCharacterStore } from '@/state/characterStore';
import { useJournalStore } from '@/state/journalStore';
import { useNarrativeStore } from '@/state/narrativeStore';
import { useWorldStore } from '@/state/worldStore';
import { JournalEntry } from '@/types/journal.types';
import { getTimestamp } from '@/lib/utils';
import Logger from '@/lib/utils/logger';

const logger = new Logger('JournalAccessDev');

/**
 * Test Harness for Journal Access During Gameplay
 * Stage 2 Verification: Integration testing with realistic data
 *
 * Interactive Features:
 * - Toggle character presence
 * - Add/remove journal entries
 * - Change game session status
 * - Test journal page navigation
 * - Verify state preservation
 */
export default function JournalAccessTestPage() {
  const [hasCharacter, setHasCharacter] = React.useState(true);
  const [gameStatus, setGameStatus] = React.useState<
    'active' | 'paused' | 'ended'
  >('active');
  const [entryCount, setEntryCount] = React.useState(3);
  const router = useRouter();

  // Setup stores
  React.useEffect(() => {
    // Clear any existing ending state from narrative store
    useNarrativeStore.getState().clearEnding();

    // Clear the "ended sessions" record for our test session to ensure it's not marked as ended
    useNarrativeStore.setState((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { 'test-session-1': removed, ...remainingEndedSessions } =
        state.endedSessions;
      return {
        ...state,
        endedSessions: remainingEndedSessions,
      };
    });

    if (hasCharacter) {
      useSessionStore.setState({
        characterId: 'test-char-1',
        id: 'test-session-1',
        status: gameStatus,
        currentSceneId: null,
        playerChoices: [],
        error: null,
        worldId: 'test-world-1',
        savedSessions: {},
      });

      const timestamp = getTimestamp();
      const testWorld = {
        id: 'test-world-1',
        name: '测试世界',
        description: "用于日志测试的轻量世界。",
        genre: 'modern' as const,
        attributes: [],
        skills: [],
        settings: {
          maxAttributes: 6,
          maxSkills: 8,
          attributePointPool: 12,
          skillPointPool: 10,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const testCharacter = {
        id: 'test-char-1',
        name: "测试冒险者",
        description: "一位正在测试日志访问功能的勇敢探险者",
        worldId: 'test-world-1',
        level: 1,
        isPlayer: true,
        attributes: [],
        skills: [],
        derivedStats: [],
        background: {
          history: "一位正在测试日志访问功能的勇敢探险者",
          personality: "好奇而严谨",
          goals: ["掌握日志系统"],
          fears: ["遗漏重要的故事细节"],
          physicalDescription: "目光敏锐、意志坚定的冒险者",
          relationships: [],
          isKnownFigure: false,
        },
        inventory: {
          characterId: 'test-char-1',
          items: [],
          capacity: 10,
          categories: [],
          itemOrder: [],
        },
        status: {
          conditions: [],
          location: "测试区域",
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      useCharacterStore.setState({
        characters: {
          'test-char-1': testCharacter,
        },
        currentCharacterId: 'test-char-1',
        error: null,
        loading: false,
      });

      useWorldStore.setState({
        worlds: { 'test-world-1': testWorld },
        entities: { 'test-world-1': testWorld },
      });
    } else {
      useSessionStore.setState({
        characterId: null,
        id: 'test-session-1',
        status: gameStatus,
        currentSceneId: null,
        playerChoices: [],
        error: null,
        worldId: 'test-world-1',
        savedSessions: {},
      });

      useCharacterStore.setState({
        characters: {},
        currentCharacterId: null,
        error: null,
        loading: false,
      });

      useWorldStore.setState({
        worlds: {},
        entities: {},
      });
    }
  }, [hasCharacter, gameStatus]);

  // Setup journal entries
  React.useEffect(() => {
    const { addEntry, reset } = useJournalStore.getState();
    reset();

    const mockEntries: Omit<JournalEntry, 'id' | 'sessionId' | 'createdAt'>[] =
      [
        {
          worldId: 'test-world-1',
          characterId: 'test-char-1',
          type: 'character_event',
          title: "上班第一天",
          content: "今天我在录像店开始了工作班次。",
          detailedContent:
            "又开店值了一个班。同样的荧光灯，同样的地毯清洁剂气味。顾客还是无视电影推荐。",
          significance: 'minor',
          isRead: false,
          relatedEntities: [
            { id: 'loc-1', type: 'location', name: "录像店" },
          ],
          metadata: {
            tags: ['opening', 'introduction', 'work'],
            automaticEntry: true,
          },
          updatedAt: getTimestamp(),
        },
        {
          worldId: 'test-world-1',
          characterId: 'test-char-1',
          type: 'world_event',
          title: "意外相遇",
          content:
            "我向一位来电者询问了对方遇到的问题，得知是一个包裹丢失了。",
          detailedContent:
            "顾客打电话说租的《Citizen Kane》不见了。就 Orson Welles 抱怨了二十分钟。检查后发现它就在他们车里。大约同一时间，Marco 应付了另一位难缠的顾客。",
          significance: 'minor',
          isRead: true,
          relatedEntities: [
            { id: 'char-2', type: 'character', name: 'Marco' },
            { id: 'char-3', type: 'character', name: "愤怒的顾客" },
          ],
          metadata: {
            tags: ['dialogue', 'employee', 'customer-service'],
            automaticEntry: true,
          },
          updatedAt: getTimestamp(),
        },
        {
          worldId: 'test-world-1',
          characterId: 'test-char-1',
          type: 'decision',
          title: "帮助陌生人",
          content:
            "在酒馆遇到可疑人物时选择帮助陌生人",
          detailedContent:
            "一个披斗篷的人走近，询问稀有书籍。尽管对方形迹可疑，我还是决定为对方指去图书馆的路。这可能会带来有趣的发展。",
          significance: 'major',
          isRead: false,
          relatedEntities: [
            { id: 'char-4', type: 'character', name: "披斗篷的陌生人" },
            { id: 'loc-2', type: 'location', name: "村庄酒馆" },
          ],
          metadata: {
            tags: ['decision', 'stranger', 'tavern'],
            automaticEntry: true,
            decisionId: 'decision-help-stranger',
            choiceText: "帮助陌生人",
            decisionPrompt:
              "你在酒馆遇到一个可疑人物。你会怎么做？",
          },
          updatedAt: getTimestamp(),
        },
        {
          worldId: 'test-world-1',
          characterId: 'test-char-1',
          type: 'discovery',
          title: "改变一切的选项",
          content: "得知有一个包裹，本应在 Myposian 之前送达……",
          detailedContent:
            "整理了员工推荐专区。意识到自己每天都困在同一套日常里。同一家店，同样关于滞纳金的抱怨。考虑过明天不再来了。",
          significance: 'critical',
          isRead: false,
          relatedEntities: [
            { id: 'item-1', type: 'item', name: "员工推荐展示" },
          ],
          metadata: {
            tags: ['browsing', 'selection', 'life-decision', 'epiphany'],
            automaticEntry: true,
          },
          updatedAt: getTimestamp(),
        },
      ];

    for (let i = 0; i < entryCount && i < mockEntries.length; i++) {
      addEntry('test-session-1', mockEntries[i]);
    }
  }, [entryCount]);

  return (
    <div>
      {/* Test Controls */}
      <div>
        <h1>
          📖 日志访问测试工具 - Issue #278
        </h1>

        <div>
          {/* Character Toggle */}
          <div>
            <h3>角色在场</h3>
            <label>
              <input
                type="checkbox"
                checked={hasCharacter}
                onChange={(e) => setHasCharacter(e.target.checked)}
              />
              <span>有角色（AC1：按钮可见性）</span>
            </label>
          </div>

          {/* Game Status */}
          <div>
            <h3>游戏状态</h3>
            <select
              value={gameStatus}
              onChange={(e) =>
                setGameStatus(e.target.value as 'active' | 'paused' | 'ended')
              }
            >
              <option value="active">
                进行中（AC3：任意时刻可用）
              </option>
              <option value="paused">
                已暂停（AC3：任意时刻可用）
              </option>
              <option value="ended">已结束</option>
            </select>
          </div>

          {/* Journal Entries */}
          <div>
            <h3>日志条目</h3>
            <input
              type="range"
              min="0"
              max="4"
              value={entryCount}
              onChange={(e) => setEntryCount(parseInt(e.target.value))}
            />
            <span>{entryCount} 条</span>
          </div>

          {/* Journal Controls */}
          <div>
            <h3>日志调试</h3>
            <button
              onClick={() => router.push('/worlds/test-world-1/play/journal')}
            >
              打开日志页面
            </button>
            <button
              onClick={() => {
                useJournalStore.getState().reset();
                // Force re-creation with proper content
                setEntryCount(0);
                setTimeout(() => setEntryCount(3), 100);
              }}
            >
              清除并重新生成日志
            </button>
          </div>
        </div>

        {/* Acceptance Criteria Checklist */}
        <div>
          <h3>
            ✅ 验收标准测试
          </h3>
          <ul>
            <li>
              🎯 <strong>检查1：</strong> 角色在场时显示日志按钮
            </li>
            <li>
              🎯 <strong>检查2：</strong> 打开日志时保留游戏状态
            </li>
            <li>
              🎯 <strong>检查3：</strong> 日志在进行中/已暂停状态下可用
            </li>
            <li>
              🎯 <strong>检查4：</strong> 页面过渡流畅，并具备适当的无障碍支持
            </li>
            <li>
              🎯 <strong>检查5：</strong> 打开日志时叙事组件仍可正常使用
            </li>
          </ul>
        </div>
      </div>

      {/* Game Session Component */}
      <div>
        <div>
          <ActiveGameSession
            worldId="test-world-1"
            sessionId="test-session-1"
            status={gameStatus}
            onChoiceSelected={(choiceId) =>
              logger.debug('Choice selected:', choiceId)
            }
          />
        </div>
      </div>

      {/* Testing Instructions */}
      <div>
        <div>
          <h3>
            🧪 测试说明
          </h3>
          <div>
            <div>
              <h4>
                交互测试：
              </h4>
              <ul>
                <li>• 切换角色在场状态以测试 AC1</li>
                <li>• 更改游戏状态以测试 AC3</li>
                <li>• 调整条目数量以测试不同的日志状态</li>
                <li>• 点击日志按钮以测试 AC4（页面过渡）</li>
                <li>
                  • 验证 AC2：访问日志期间游戏状态保持不变
                </li>
                <li>• 检查 AC5：叙事组件仍然可见</li>
              </ul>
            </div>
            <div>
              <h4>
                预期行为：
              </h4>
              <ul>
                <li>• 只有角色在场时才显示日志按钮</li>
                <li>• 日志以整页视图打开</li>
                <li>• 日志条目正确显示</li>
                <li>• 返回导航会回到游戏玩法</li>
                <li>• 冒险记录全程保持完整</li>
                <li>• 无障碍功能正常工作</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
