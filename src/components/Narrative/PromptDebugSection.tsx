'use client';

import React from 'react';
import { PromptDebugInfo } from '@/types/narrative.types';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { displayLabel } from '@/lib/i18n/zhCN';

interface PromptDebugSectionProps {
  debugInfo: PromptDebugInfo;
}

/**
 * PromptDebugSection Component
 *
 * Displays prompt debug information in a collapsible section.
 * Shows all contributing factors that shaped the narrative text.
 *
 * Only rendered when DevTools "Show Prompts" toggle is enabled.
 */
export const PromptDebugSection: React.FC<PromptDebugSectionProps> = ({ debugInfo }) => {
  return (
    <div>
      <CollapsibleSection
        title="提示词调试信息"
        initialCollapsed={true}
        
      >
        <div>
          {/* Template Name */}
          <div>
            <div>使用的模板：</div>
            <div>{debugInfo.templateName}</div>
          </div>

          {/* Model Info */}
          <div>
            <div>AI 模型：</div>
            <div>{debugInfo.modelUsed}</div>
          </div>

          {/* Token Usage */}
          {debugInfo.tokenUsage && (
            <div>
              <div>令牌用量：</div>
              <div>
                <div>提示词： {debugInfo.tokenUsage.promptTokens.toLocaleString('zh-CN')}</div>
                <div>补全： {debugInfo.tokenUsage.completionTokens.toLocaleString('zh-CN')}</div>
                <div>
                  总计： {debugInfo.tokenUsage.totalTokens.toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          )}

          {/* Tone Settings */}
          {debugInfo.toneSettings && (
            <div>
              <div>叙事风格设置：</div>
              <div>
                {debugInfo.toneSettings.mood && (
                  <div>
                    <span>氛围：</span> {debugInfo.toneSettings.mood}
                  </div>
                )}
                {debugInfo.toneSettings.complexity && (
                  <div>
                    <span>复杂度：</span>{' '}
                    {debugInfo.toneSettings.complexity}
                  </div>
                )}
                {debugInfo.toneSettings.customTone && (
                  <div>
                    <span>自定义指令：</span>{' '}
                    {debugInfo.toneSettings.customTone}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Character Context */}
          {debugInfo.characterContext && debugInfo.characterContext.length > 0 && (
            <div>
              <div>角色上下文：</div>
              <div>
                {debugInfo.characterContext.map((char, idx) => (
                  <div key={idx} >
                    <div>{char.name}</div>
                    {char.relevantTraits && char.relevantTraits.length > 0 && (
                      <div>
                        特质： {char.relevantTraits.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Goals */}
          {debugInfo.activeGoals && debugInfo.activeGoals.length > 0 && (
            <div>
              <div>当前目标：</div>
              <ul>
                {debugInfo.activeGoals.map((goal, idx) => (
                  <li key={idx}>{goal}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lore Context */}
          {debugInfo.loreContext && debugInfo.loreContext.length > 0 && (
            <div>
              <div>设定上下文：</div>
              <div>
                {debugInfo.loreContext.map((lore, idx) => (
                  <div key={idx} >
                    <div>{lore.title}</div>
                    <div>{lore.excerpt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Context */}
          {debugInfo.inventoryContext && debugInfo.inventoryContext.length > 0 && (
            <div>
              <div>背包上下文：</div>
              <div>
                {debugInfo.inventoryContext.map((item, idx) => (
                  <div key={idx} >
                    <span>
                      {item.itemName}
                    </span>
                    {item.isEquipped && (
                      <span>
                        已装备
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Decisions */}
          {debugInfo.recentDecisions && debugInfo.recentDecisions.length > 0 && (
            <div>
              <div>最近的决定：</div>
              <div>
                {debugInfo.recentDecisions.map((decision, idx) => (
                  <div key={idx} >
                    <div>{decision.decisionText}</div>
                    <div>
                      → {decision.selectedOption}
                    </div>
                    <div>
                      {new Date(decision.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Segment Context */}
          {debugInfo.previousSegmentContext && (
            <div>
              <div>上一段落：</div>
              <div>
                <div>
                  类型： {displayLabel(debugInfo.previousSegmentContext.type)}
                </div>
                <div>{debugInfo.previousSegmentContext.excerpt}</div>
              </div>
            </div>
          )}

          {/* Full Prompt */}
          <div>
            <CollapsibleSection title="完整提示词文本" initialCollapsed={true}>
              <pre>
                {debugInfo.fullPrompt}
              </pre>
            </CollapsibleSection>
          </div>

          {/* Timestamp */}
          <div>
            生成时间： {new Date(debugInfo.generatedAt).toLocaleString('zh-CN')}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};
