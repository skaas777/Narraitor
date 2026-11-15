'use client';

import React, { useState, useMemo } from 'react';
import { useLoreStore } from '@/state/loreStore';
import { useWorldStore } from '@/state/worldStore';
import { useContinuityStore } from '@/state/continuityStore';
import { generateConsistencyInstructions } from '@/lib/ai/consistencyInstructions';
import { buildLoreContext } from '@/lib/lore/loreContext';
import { JsonViewer } from '@/components/devtools/JsonViewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { DevToolsSection } from '@/components/devtools/shared/DevToolsSection';
import type { ContinuityStatus } from '@/types/continuity.types';
import { displayLabel } from '@/lib/i18n/zhCN';

const CONTINUITY_BADGE_VARIANTS: Record<
  ContinuityStatus,
  'success-static' | 'info-static' | 'warning-static'
> = {
  clean: 'success-static',
  corrected: 'info-static',
  flagged: 'warning-static',
};

/**
 * Consistency Validation Debug Section
 * 
 * A debugging interface for the AI consistency validation system.
 * This DevTools-only component provides real-time analysis of how lore facts
 * are processed and converted into consistency instructions for narrative generation.
 * 
 * ## Features
 * - **World Selection**: Choose from available worlds with lore data
 * - **Live Lore Analysis**: Real-time preview of lore context building from facts
 * - **Instruction Generation**: Generated consistency instructions preview
 * - **Categorization Viewer**: Visual breakdown of lore into categories (characters, locations, etc.)
 * - **Importance Ranking**: Validation of lore fact importance rankings
 * - **Statistics Dashboard**: Overview metrics for lore fact analysis
 * 
 * ## Usage
 * 1. Select a world from the dropdown (only worlds with lore facts are shown)
 * 2. Review the lore statistics for overview metrics
 * 3. Examine the generated consistency instructions
 * 4. Inspect the structured lore context and categorization details
 * 
 * ## Integration
 * - Uses `useLoreStore` to access stored lore facts
 * - Integrates with `buildLoreContext` for lore processing
 * - Calls `generateConsistencyInstructions` for live instruction preview
 * - Utilizes `JsonViewer` for structured data display
 * 
 * @example
 * ```tsx * // Used within DevToolsPanel * <CollapsibleSection title="Consistency Validation" initialCollapsed={true}> * <ConsistencyValidationSection /> * </CollapsibleSection> *```
 * 
 * @since 1.0.0 - AI Consistency Validation System
 */
export const ConsistencyValidationSection = () => {
  const [selectedWorldId, setSelectedWorldId] = useState<string>('');
  const { facts, getFacts } = useLoreStore();
  const { worlds } = useWorldStore();
  const { results: continuityResults, clear: clearContinuityResults } = useContinuityStore();

  // Get available world IDs from lore facts
  const availableWorldIds = useMemo(() => {
    const worldIds = new Set<string>();
    Object.values(facts).forEach(fact => {
      if (fact.worldId) {
        worldIds.add(fact.worldId);
      }
    });
    return Array.from(worldIds);
  }, [facts]);

  // Get lore facts for selected world
  const worldLoreFacts = useMemo(() => {
    if (!selectedWorldId) return [];
    return getFacts({ worldId: selectedWorldId });
  }, [selectedWorldId, getFacts]);

  // Build lore context and generate instructions
  const loreContext = useMemo(() => {
    return buildLoreContext(worldLoreFacts);
  }, [worldLoreFacts]);

  const consistencyInstructions = useMemo(() => {
    return generateConsistencyInstructions(loreContext);
  }, [loreContext]);

  // Statistics about the lore
  const loreStats = useMemo(() => {
    return {
      totalFacts: worldLoreFacts.length,
      characters: loreContext.characters.length,
      locations: loreContext.locations.length,
      worldRules: loreContext.worldRules.length,
      historicalEvents: loreContext.historicalEvents.length,
      highImportance: [
        ...loreContext.characters.filter(c => c.importance === 'high'),
        ...loreContext.locations.filter(l => l.importance === 'high'),
        ...loreContext.worldRules.filter(r => r.importance === 'high'),
        ...loreContext.historicalEvents.filter(e => e.importance === 'high')
      ].length
    };
  }, [loreContext, worldLoreFacts]);

  return (
    <div>
      {/* Runtime continuity guardrail results (#409/#412) */}
      <DevToolsSection title="运行时校验" className="devtools-continuity-validation">
        <div data-testid="devtools-continuity-validation">
          {continuityResults.length === 0 ? (
            <p className="devtools-continuity-validation-empty">
              本次冒险记录还没有校验过任何片段。
            </p>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearContinuityResults}
                data-testid="continuity-validation-clear"
              >
                清除
              </Button>
              {[...continuityResults].reverse().map((result) => (
                <div
                  key={result.id}
                  className="devtools-continuity-validation-entry"
                  data-testid={`continuity-validation-result-${result.id}`}
                >
                  <div>
                    <Badge variant={CONTINUITY_BADGE_VARIANTS[result.status]} size="sm">
                      {displayLabel(result.status)}
                    </Badge>{' '}
                    <span>{new Date(result.timestamp).toLocaleTimeString('zh-CN')}</span>
                    {' — '}
                    <span>
                      检测 {result.detectionMs} 毫秒
                      {result.correctionMs !== undefined
                        ? `，校正 ${result.correctionMs} 毫秒`
                        : ''}
                    </span>
                  </div>
                  {result.issues.length > 0 && (
                    <div>
                      问题：{' '}
                      {result.issues
                        .map((issue) => `${issue.entity} (${issue.type})`)
                        .join(', ')}
                    </div>
                  )}
                  <CollapsibleSection title="详情" initialCollapsed={true}>
                    <JsonViewer data={result} />
                  </CollapsibleSection>
                </div>
              ))}
            </>
          )}
        </div>
      </DevToolsSection>

      {/* World Selection */}
      <DevToolsSection>
        <label>
          选择要分析一致性的世界：
        </label>
        <Select 
          value={selectedWorldId} 
          onChange={(e) => setSelectedWorldId(e.target.value)}
          
        >
          <option value="">—— 请选择世界 ——</option>
          {availableWorldIds.map(worldId => (
            <option key={worldId} value={worldId}>
              {worlds[worldId]?.name || worldId}
            </option>
          ))}
        </Select>
      </DevToolsSection>

      {selectedWorldId && (
        <>
          {/* Lore Statistics */}
          <DevToolsSection title="设定统计">
            <div>
              <div>设定总数： {loreStats.totalFacts}</div>
              <div>高重要度： {loreStats.highImportance}</div>
              <div>角色： {loreStats.characters}</div>
              <div>地点： {loreStats.locations}</div>
              <div>世界规则： {loreStats.worldRules}</div>
              <div>历史事件： {loreStats.historicalEvents}</div>
            </div>
          </DevToolsSection>

          {/* Generated Consistency Instructions */}
          <DevToolsSection title="生成的一致性指令">
            <div>
              {consistencyInstructions || "未生成任何指令"}
            </div>
          </DevToolsSection>

          {/* Structured Lore Context */}
          <DevToolsSection title="结构化设定上下文">
            <div>
              <JsonViewer 
                data={loreContext} 
                
              />
            </div>
          </DevToolsSection>

          {/* Raw Lore Facts */}
          <DevToolsSection title={`原始设定事实（${worldLoreFacts.length}）`}>
            <div>
              <JsonViewer 
                data={worldLoreFacts} 
                
              />
            </div>
          </DevToolsSection>

          {/* Categorization Breakdown */}
          <DevToolsSection title="分类详情">
            <div>
              {loreContext.characters.length > 0 && (
                <div>
                  <div>角色：</div>
                  {loreContext.characters.map((char, idx) => (
                    <div key={idx} >
                      {char.name} - {displayLabel(char.importance)} 重要性 - 特质： {char.traits.join(', ')}
                    </div>
                  ))}
                </div>
              )}
              
              {loreContext.locations.length > 0 && (
                <div>
                  <div>地点：</div>
                  {loreContext.locations.map((loc, idx) => (
                    <div key={idx} >
                      {loc.name} ({displayLabel(loc.type)}) - {displayLabel(loc.importance)} 重要性
                    </div>
                  ))}
                </div>
              )}
              
              {loreContext.worldRules.length > 0 && (
                <div>
                  <div>世界规则：</div>
                  {loreContext.worldRules.map((rule, idx) => (
                    <div key={idx} >
                      {rule.rule} - {displayLabel(rule.importance)} 重要性
                    </div>
                  ))}
                </div>
              )}
              
              {loreContext.historicalEvents.length > 0 && (
                <div>
                  <div>历史事件：</div>
                  {loreContext.historicalEvents.map((event, idx) => (
                    <div key={idx} >
                      {event.event} - {displayLabel(event.importance)} 重要性
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DevToolsSection>
        </>
      )}

      {!selectedWorldId && availableWorldIds.length === 0 && (
        <div>
          未找到任何设定事实。请在冒险记录中创建一些设定，以测试一致性校验。
        </div>
      )}
    </div>
  );
};