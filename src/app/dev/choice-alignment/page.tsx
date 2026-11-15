'use client';

import React, { useState, useEffect } from 'react';
import { generateChoices as generateAlignedChoices } from '@/lib/ai/choiceGenerator';
import { createDefaultGeminiClient } from '@/lib/ai/defaultGeminiClient';
import ChoiceSelector from '@/components/shared/ChoiceSelector/ChoiceSelector';
import { Decision, NarrativeContext } from '@/types/narrative.types';
import { generateUniqueId } from '@/lib/utils/generateId';
import { getTimestamp } from '@/lib/utils';
import { useWorldStore } from '@/state/worldStore';
import { ensureWorldNpcRoster } from '@/lib/services/worldCreationService';
import Logger from '@/lib/utils/logger';
import { displayLabel } from '@/lib/i18n/zhCN';
import { localizeErrorMessage } from '@/lib/i18n/errors';

const logger = new Logger('ChoiceAlignmentDev');

export default function ChoiceAlignmentTestPage() {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<'bandits' | 'merchant' | 'dragon'>('bandits');
  const [error, setError] = useState<string | null>(null);
  const [worldId, setWorldId] = useState<string | null>(null);

  const geminiClient = createDefaultGeminiClient();

  // Create a test world when component mounts
  useEffect(() => {
    try {
      const newWorldId = useWorldStore.getState().createWorld({
        name: '测试世界',
        description: "用于测试选项阵营的奇幻世界",
        genre: 'fantasy',
        attributes: [],
        skills: [],
        settings: {
          maxAttributes: 10,
          maxSkills: 10,
          attributePointPool: 100,
          skillPointPool: 100
        }
      });
      
      void ensureWorldNpcRoster(newWorldId);

      // Verify the world was created and stored
      const storedWorld = useWorldStore.getState().worlds[newWorldId];
      if (storedWorld) {
        setWorldId(newWorldId);
        logger.debug('Created test world with ID:', newWorldId, storedWorld);
      } else {
        logger.error('World was not stored properly');
        setError("创建测试世界失败");
      }
    } catch (err) {
      logger.error('Error creating world:', err);
      setError(err instanceof Error ? err.message : "创建世界失败");
    }
  }, []);

  const scenarios = {
    bandits: {
      location: "森林小径",
      situation: "一群强盗挡住了你的去路",
      context: "你正穿行于一片幽暗森林，一群全副武装的强盗从树后走出，拔出武器，要求你交纳过路费才能通过。他们的首领是个脸上带疤、咧嘴狞笑的男人，正用贪婪的目光清点着你的钱袋，而他的同伙则堵住了所有逃跑路线。"
    },
    merchant: {
      location: "城镇集市",
      situation: "一名可疑商人提出交易",
      context: "在熙熙攘攘的集市广场上，一名兜帽商人带着一件华丽、发光的器物走近你。那件物品脉动着魔力，可他却只开价几枚铜币——远低于它看上去的价值。附近的其他商人紧张地低声议论，并避免与你对视。"
    },
    dragon: {
      location: "山洞",
      situation: "一条巨龙看守着宝藏",
      context: "你在山体深处找到了传说中巨龙的巢穴。那头庞大的远古红龙盘踞在巨大的金银珠宝堆上，它那聪慧的琥珀色眼睛追随着你的一举一动。烟雾从它的鼻孔中缭绕升起，它用滚雷般的声音开口，提出一道谜题，作为让你安全通过的条件。"
    }
  };

  const generateChoices = async () => {
    if (!worldId) {
      setError("世界尚未创建。请稍等片刻后重试。");
      return;
    }
    
    // Double-check that the world still exists
    const currentWorld = useWorldStore.getState().worlds[worldId];
    if (!currentWorld) {
      setError(`世界 ${worldId} 已不存在。这可能是数据持久化问题。`);
      logger.error('Available worlds:', Object.keys(useWorldStore.getState().worlds));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const mockNarrativeContext: NarrativeContext = {
        worldId: worldId,
        currentSceneId: generateUniqueId('scene'),
        characterIds: [generateUniqueId('character')],
        previousSegments: [{
          id: generateUniqueId('segment'),
          content: scenarios[scenario].context,
          type: 'scene',
          metadata: {
            tags: ['test'],
            location: scenarios[scenario].location
          },
          timestamp: new Date(),
          createdAt: getTimestamp(),
          updatedAt: getTimestamp()
        }],
        currentTags: ['adventure'],
        sessionId: generateUniqueId('session'),
        currentLocation: scenarios[scenario].location,
        currentSituation: scenarios[scenario].situation
      };

      const result = await generateAlignedChoices(geminiClient, {
        worldId: worldId,
        narrativeContext: mockNarrativeContext,
        characterIds: [generateUniqueId('character')],
        useAlignedChoices: true
      });

      setDecision(result);
    } catch (err) {
      logger.error('Error generating choices:', err);
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceSelect = (choiceId: string) => {
    logger.debug('Selected choice:', choiceId);
    const selectedOption = decision?.options.find(opt => opt.id === choiceId);
    if (selectedOption) {
      logger.debug('Choice details:', {
        text: selectedOption.text,
        alignment: selectedOption.alignment
      });
    }
  };

  const handleCustomSubmit = (customText: string) => {
    logger.debug('Custom choice submitted:', customText);
  };

  return (
    <div>
      <div>
        <div>
          <h1>
            选项对齐测试
          </h1>
          
          {/* Controls */}
          <div>
            <h2>测试控制</h2>
            
            <div>
              <div>
                <label>
                  情景
                </label>
                <select 
                  value={scenario} 
                  onChange={(e) => setScenario(e.target.value as 'bandits' | 'merchant' | 'dragon')}
                >
                  <option value="bandits">森林强盗</option>
                  <option value="merchant">可疑商人</option>
                  <option value="dragon">遭遇巨龙</option>
                </select>
              </div>
              
              <div>
                <button
                  onClick={generateChoices}
                  disabled={loading || !worldId}
                >
                  {loading ? "正在生成……" : !worldId ? "初始化中…" : "生成阵营选项"}
                </button>
              </div>
            </div>
            
            {/* Scenario Display */}
            <div>
              <h3>当前情景：</h3>
              <p>
                <strong>地点：</strong> {scenarios[scenario].location}
              </p>
              <p>
                <strong>情况：</strong> {scenarios[scenario].situation}
              </p>
              <p>
                {scenarios[scenario].context}
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div>
              <strong>错误：</strong> {localizeErrorMessage(error)}
            </div>
          )}

          {/* Results */}
          {decision && (
            <div>
              <h2>生成的选项</h2>
              
              {/* Alignment Legend */}
              <div>
                <h3>阵营图例：</h3>
                <div>
                  <div>
                    <div />
                    <span><strong>守序：</strong> 遵守规则，尊重权威</span>
                  </div>
                  <div>
                    <div />
                    <span><strong>中立：</strong> 平衡、务实的做法</span>
                  </div>
                  <div>
                    <div />
                    <span><strong>混乱：</strong> 出人意料、具破坏性的行动</span>
                  </div>
                </div>
              </div>

              {/* Choice Selector */}
              <ChoiceSelector
                decision={decision}
                onSelect={handleChoiceSelect}
                enableCustomInput={true}
                onCustomSubmit={handleCustomSubmit}
              />

              {/* Debug Info */}
              <div>
                <h3>调试信息：</h3>
                <div>
                  <p><strong>使用的模板：</strong> 阵营选项模板</p>
                  <p><strong>选项数量：</strong> {decision.options.length}</p>
                  <p><strong>阵营分布：</strong></p>
                  <ul>
                    {['lawful', 'neutral', 'chaotic'].map(alignment => {
                      const count = decision.options.filter(opt => opt.alignment === alignment).length;
                      return (
                        <li key={alignment}>
                          {displayLabel(alignment)}: {count} 选项{''}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                <details>
                  <summary>
                    原始决策对象
                  </summary>
                  <pre>
                    {JSON.stringify(decision, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h3>测试说明</h3>
            <ul>
              <li>• 尝试不同情景，观察阵营倾向如何随情境变化</li>
              <li>• 注意颜色标识：蓝色代表守序，白色代表中立，红色代表混乱</li>
              <li>• <strong>混乱验证：</strong> 红色选项应当极其出人意料、富有戏剧性，并可能彻底改变局势</li>
              <li>• 测试混乱选项是否无视社会规范，并提供富有创意/破坏性的解决方案</li>
              <li>• 在测试阵营选项的同时测试自定义输入功能</li>
              <li>• 查看调试信息以验证阵营分布</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
