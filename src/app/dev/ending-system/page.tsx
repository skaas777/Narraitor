// src/app/dev/ending-system/page.tsx

'use client';

import React, { useState } from 'react';
import { EndingScreen } from '../../../components/GameSession/EndingScreen';
import { useNarrativeStore } from '../../../state/narrativeStore';
import type { EndingType, EndingTone, StoryEnding } from '../../../types/narrative.types';
import { capitalize, getTimestamp } from '@/lib/utils';

export default function EndingSystemTestHarness() {
  const { generateEnding, currentEnding, isGeneratingEnding, endingError, clearEnding } = useNarrativeStore();
  const [endingType, setEndingType] = useState<EndingType>('story-complete');
  const [desiredTone, setDesiredTone] = useState<EndingTone>('triumphant');
  const [customPrompt, setCustomPrompt] = useState('');

  const mockSessionId = 'test-session-123';
  const mockCharacterId = 'test-char-456';
  const mockWorldId = 'test-world-789';

  const handleGenerateEnding = async () => {
    await generateEnding(endingType, {
      sessionId: mockSessionId,
      characterId: mockCharacterId,
      worldId: mockWorldId,
      desiredTone,
      customPrompt: customPrompt || undefined
    });
  };

  const mockEndingData: StoryEnding = {
    id: 'mock-ending-123',
    sessionId: mockSessionId,
    characterId: mockCharacterId,
    worldId: mockWorldId,
    type: endingType,
    tone: desiredTone,
    epilogue: `夕阳西下，余晖洒满王国，我们勇敢的英雄${endingType === 'character-retirement' ? "决定放下剑，平静地生活" : "在伟大的冒险后胜利屹立"}。

这段始于迷茫的旅程最终以${desiredTone === 'tragic' ? "伟大的牺牲" : desiredTone === 'mysterious' ? "挥之不去的疑问" : 'celebration'}收尾。这片土地将世世代代铭记这一天，一个平凡的冒险者成为了${desiredTone === 'mysterious' ? "传奇中神秘莫测的人物" : "王国需要的英雄"}。

历经重重考验与磨难，他们证明了勇气与决心能够战胜任何阻碍。当星辰开始在夜空闪烁，我们的英雄${endingType === 'character-retirement' ? "平静地微笑，知道自己冒险的岁月已经过去" : "望向地平线，准备迎接前方的一切冒险"}。`,
    characterLegacy: `整个王国都会带着${desiredTone === 'tragic' ? "庄严的敬意" : "钦佩"}提起这位英雄的名字。

他们的${endingType === 'character-retirement' ? "在权力巅峰时明智隐退的决定" : "从卑微起点到传奇地位的非凡旅程"}激励了无数人踏上自己的冒险之路。

年轻的战士会刻苦训练，希望能追随他们的脚步；吟游诗人则会在未来数百年里传唱他们的${desiredTone === 'mysterious' ? "神秘莫测的事迹" : "英雄事迹"}。`,
    worldImpact: `英雄的所作所为永远改变了这个世界。${endingType === 'story-complete' ? "主线任务完成后，和平重归大地" : endingType === 'character-retirement' ? "英雄的隐退标志着一个时代的终结" : "冒险的落幕带来了新的可能"}。

贸易路线重新开放，联盟得到巩固，人民带着${desiredTone === 'hopeful' ? "毫无保留的乐观" : desiredTone === 'tragic' ? "尽管有所损失仍怀有的谨慎希望" : "重拾的信心"}展望未来。

世界得救了，所有人都知道，像这样的英雄总会在需要时挺身而出。`,
    timestamp: new Date(),
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
    achievements: [
      "传奇英雄",
      "疆域守护者",
      `${endingType === 'character-retirement' ? "平静隐退" : "任务完成"}`,
      `${capitalize(desiredTone)} 结局`,
      "故事完结"
    ],
    playTime: 7200 // 2 hours
  };

  const handleUseMockData = () => {
    useNarrativeStore.setState({
      currentEnding: mockEndingData,
      isGeneratingEnding: false,
      endingError: null
    });
  };

  if (currentEnding && !isGeneratingEnding) {
    return <EndingScreen />;
  }

  return (
    <div>
      <div>
        <div>
          <h1>
            结局系统测试工具
          </h1>
          
          <div>
            {/* Status Display */}
            <div>
              <h2>当前状态</h2>
              <div>
                <p><strong>正在生成：</strong> {isGeneratingEnding ? "是" : "否"}</p>
                <p><strong>已有结局：</strong> {currentEnding ? "是" : "否"}</p>
                <p><strong>错误：</strong> {endingError || 'None'}</p>
              </div>
            </div>

            {/* Test Controls */}
            <div>
              <div>
                <label>
                  结局类型
                </label>
                <select
                  value={endingType}
                  onChange={(e) => setEndingType(e.target.value as EndingType)}
                >
                  <option value="player-choice">玩家选择</option>
                  <option value="story-complete">故事完结</option>
                  <option value="session-limit">冒险记录上限</option>
                  <option value="character-retirement">角色隐退</option>
                </select>
              </div>

              <div>
                <label>
                  期望叙事风格
                </label>
                <select
                  value={desiredTone}
                  onChange={(e) => setDesiredTone(e.target.value as EndingTone)}
                >
                  <option value="triumphant">凯旋</option>
                  <option value="mysterious">神秘</option>
                  <option value="tragic">悲剧</option>
                  <option value="hopeful">希望</option>
                </select>
              </div>
            </div>

            <div>
              <label>
                自定义提示（可选）
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="输入对结局的任何具体说明……"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div>
              <button
                onClick={handleGenerateEnding}
                disabled={isGeneratingEnding}
              >
                {isGeneratingEnding ? "正在生成……" : "生成 AI 结局"}
              </button>

              <button
                onClick={handleUseMockData}
              >
                使用模拟结局数据
              </button>

              <button
                onClick={clearEnding}
                disabled={!currentEnding}
              >
                清除结局
              </button>
            </div>

            {/* Test Information */}
            <div>
              <h3>测试信息</h3>
              <div>
                <p><strong>冒险记录 ID：</strong> {mockSessionId}</p>
                <p><strong>角色 ID：</strong> {mockCharacterId}</p>
                <p><strong>世界 ID：</strong> {mockWorldId}</p>
                <p><strong>注意：</strong> 此测试工具使用模拟 ID 仅用于测试。</p>
              </div>
            </div>

            {/* Error Display */}
            {endingError && (
              <div>
                <h3>错误</h3>
                <p>{endingError}</p>
              </div>
            )}

            {/* Loading State */}
            {isGeneratingEnding && (
              <div>
                <h3>正在生成结局</h3>
                <p>请稍候，正在为你的故事生成结局……</p>
                <div>
                  <div>
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
