'use client';

import React, { useState } from 'react';
import { GameStartWizard } from '@/components/GameStartWizard';
import { Breadcrumbs } from '@/components/Navigation/Breadcrumbs';
import { useWorldStore } from '@/state/worldStore';
import { useCharacterStore, type StoreCharacter } from '@/state/characterStore';
import { useSessionStore } from '@/state/sessionStore';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { formatDateTime } from '@/lib/utils';
import Logger from '@/lib/utils/logger';
import { displayLabel } from '@/lib/i18n/zhCN';

const logger = new Logger('NavigationFlowDev');

export default function NavigationFlowTestPage() {
  const [activeTest, setActiveTest] = useState<'wizard' | 'breadcrumbs' | 'flow'>('wizard');
  const [wizardWorldId, setWizardWorldId] = useState<string>('');
  const [wizardCharacterId, setWizardCharacterId] = useState<string>('');
  
  const { worlds } = useWorldStore();
  const { characters } = useCharacterStore();
  const { savedSessions } = useSessionStore();
  const { getNextStep, canQuickStart, getQuickStartInfo, getCurrentFlowStep } = useNavigationFlow();

  const worldList = Object.values(worlds);
  const characterList = Object.values(characters) as StoreCharacter[];
  const sessionList = Object.values(savedSessions);

  return (
    <div>
      <div>
        <header>
          <h1>导航流程测试台</h1>
          <p>
            测试增强的导航组件与流程逻辑
          </p>
        </header>

        {/* Test Navigation */}
        <div>
          <h2>测试组件</h2>
          <div>
            <button
              onClick={() => setActiveTest('wizard')}
              className={`${
                activeTest === 'wizard'
                  ? ''
                  : ''
              }`}
            >
              游戏开始向导
            </button>
            <button
              onClick={() => setActiveTest('breadcrumbs')}
              className={`${
                activeTest === 'breadcrumbs'
                  ? ''
                  : ''
              }`}
            >
              增强面包屑导航
            </button>
            <button
              onClick={() => setActiveTest('flow')}
              className={`${
                activeTest === 'flow'
                  ? ''
                  : ''
              }`}
            >
              流程逻辑
            </button>
          </div>
        </div>

        {/* Current State Display */}
        <div>
          <h2>当前应用状态</h2>
          <div>
            <div>
              <h3>世界（{worldList.length})</h3>
              <div>
                {worldList.length === 0 ? (
                  <p>尚未创建世界</p>
                ) : (
                  worldList.map(world => (
                    <div key={world.id} >
                      {world.name} ({displayLabel(world.genre)})
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3>角色（{characterList.length})</h3>
              <div>
                {characterList.length === 0 ? (
                  <p>尚未创建角色</p>
                ) : (
                  characterList.map(character => (
                    <div key={character.id} >
                      {character.name} ({worlds[character.worldId]?.name || "未知世界"})
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3>已保存的冒险记录（{sessionList.length})</h3>
              <div>
                {sessionList.length === 0 ? (
                  <p>暂无已保存的冒险记录</p>
                ) : (
                  sessionList.map(session => (
                    <div key={session.id} >
                      {worlds[session.worldId]?.name || "未知"} / {characters[session.characterId]?.name || "未知"}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Component Display */}
        <div>
          {activeTest === 'wizard' && (
            <div>
              <h2>游戏开始向导</h2>
              <div>
                <h3>向导配置</h3>
                <div>
                  <div>
                    <label>
                      初始世界 ID（可选）
                    </label>
                    <select
                      value={wizardWorldId}
                      onChange={(e) => setWizardWorldId(e.target.value)}
                    >
                      <option value="">不预选</option>
                      {worldList.map(world => (
                        <option key={world.id} value={world.id}>{world.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>
                      初始角色 ID（可选）
                    </label>
                    <select
                      value={wizardCharacterId}
                      onChange={(e) => setWizardCharacterId(e.target.value)}
                      disabled={!wizardWorldId}
                    >
                      <option value="">不预选</option>
                      {characterList
                        .filter(char => !wizardWorldId || char.worldId === wizardWorldId)
                        .map(character => (
                          <option key={character.id} value={character.id}>{character.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
              <GameStartWizard
                initialWorldId={wizardWorldId || undefined}
                initialCharacterId={wizardCharacterId || undefined}
                onCancel={() => logger.debug('Wizard cancelled')}
              />
            </div>
          )}

          {activeTest === 'breadcrumbs' && (
            <div>
              <h2>增强面包屑导航</h2>
              <div>
                <div>
                  <h3>标准面包屑导航</h3>
                  <div>
                    <Breadcrumbs />
                  </div>
                </div>
                <div>
                  <h3>带下一步引导</h3>
                  <div>
                    <Breadcrumbs showNextStep />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTest === 'flow' && (
            <div>
              <h2>导航流程逻辑</h2>
              <div>
                <div>
                  <div>
                    <h3>当前流程状态</h3>
                    <div>
                      <div>
                        <span>当前步骤：</span>{' '}
                        <span>{getCurrentFlowStep()}</span>
                      </div>
                      <div>
                        <span>可快速开始：</span>{' '}
                        <span>
                          {canQuickStart() ? "是" : "否"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3>下一步</h3>
                    <div>
                      {(() => {
                        const nextStep = getNextStep();
                        if (!nextStep) {
                          return <p>没有下一步（已在游玩中）</p>;
                        }
                        return (
                          <div>
                            <div><span>标签：</span> {nextStep.label}</div>
                            <div><span>操作：</span> {nextStep.action}</div>
                            <div><span>链接：</span> {nextStep.href}</div>
                            <div><span>已启用：</span> {nextStep.isEnabled ? "是" : "否"}</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3>快速开始信息</h3>
                  <div>
                    {(() => {
                      const quickStartInfo = getQuickStartInfo();
                      if (!quickStartInfo) {
                        return <p>暂无快速开始</p>;
                      }
                      return (
                        <div>
                          <div><span>世界：</span> {quickStartInfo.worldName}</div>
                          <div><span>角色：</span> {quickStartInfo.characterName}</div>
                          <div><span>进度：</span> {quickStartInfo.narrativeCount} 条</div>
                          <div><span>上次游玩：</span> {formatDateTime(quickStartInfo.lastPlayed)}</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
