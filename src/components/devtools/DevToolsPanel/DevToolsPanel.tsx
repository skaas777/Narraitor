'use client';

import React, { useEffect, useState } from 'react';
import { useDevTools } from '../DevToolsContext';
import { StateSection } from '../StateSection';
import { AITestingPanel } from '../AITestingPanel';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { PortraitDebugSection } from '../PortraitDebugSection';
import { EndingImageDebugSection } from '../EndingImageDebugSection';
import { ConsistencyValidationSection } from '../ConsistencyValidationSection';
import { LoreManagementSection } from '../LoreManagementSection';
import { TokenBudgetPanel } from '../TokenBudgetPanel';
import { WorldClockSection } from '../WorldClockSection';
import { ErrorSection } from '../ErrorSection';
import { DecisionConsoleSection } from '../DecisionConsoleSection';
import { DecisionFlowSection } from '../DecisionFlowSection';
import { DevToolsSection } from '../shared/DevToolsSection';
import { SectionVisibilityControls } from '../SectionVisibilityControls';
import { DevToolsSection as SectionId } from '@/lib/devtools/sectionVisibilityStorage';
import { Button } from '@/components/ui/button';
import { TestDataGeneratorSection } from '../TestDataGeneratorSection';
import { QuickSetup } from '../QuickSetup';
import './DevToolsPanel.css';

/**
 * Environment info component for the DevTools panel
 */
const EnvironmentInfo = () => {
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState('N/A');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setLocation(window.location.pathname);
    }
  }, []);

  // Static values that don't change between server and client
  const nodeEnv = process.env.NODE_ENV || 'unknown';
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <DevToolsSection title="环境信息：" >
      <div>运行环境： {nodeEnv}</div>
      <div>是否客户端： {String(mounted)}</div>
      <div>是否开发环境： {String(isDev)}</div>
      <div>窗口位置： {location}</div>
    </DevToolsSection>
  );
};

/**
 * DevToolsPanel Component
 *
 * The main DevTools panel that appears at the bottom of the screen.
 * It can be collapsed/expanded and contains debugging tools.
 *
 * This component is the main container for all DevTools functionality.
 * To add new debugging tools, create a new component in the devtools directory
 * and add it to the content area of this component.
 *
 * @example
 * // Adding a new section to the DevToolsPanel
 * {isOpen && (
 *   <div>
 *     <StateSection />
 *     <MyNewSection /> // Your new section
 *   </div>
 * )}
 *
 * @see /docs/devtools/extending-devtools.md for more information
 */
export const DevToolsPanel = () => {
  const { isOpen, toggleDevTools, isSectionVisible, settings, updateSetting } = useDevTools();
  const [mounted, setMounted] = useState(false);
  const [isTestPage, setIsTestPage] = useState(false);

  // Set mounted flag and check if we're on the test page after mount
  useEffect(() => {
    setMounted(true);

    // Check if we're on the test page
    if (typeof window !== 'undefined') {
      setIsTestPage(window.location.pathname.includes('/dev/devtools-test'));
    }
  }, []);

  // Scroll DevTools into view when opened
  useEffect(() => {
    if (isOpen && mounted) {
      // Small delay to ensure the panel has expanded
      setTimeout(() => {
        const devToolsElement = document.querySelector('[data-testid="devtools-panel-container"]');
        if (devToolsElement) {
          devToolsElement.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [isOpen, mounted]);

  // Don't render anything on the server to avoid hydration issues
  if (!mounted) {
    return null;
  }

  // Only render in development environment or on test page
  if (process.env.NODE_ENV !== 'development' && !isTestPage) {
    return null;
  }

  return (
    <div className="devtools-panel" data-testid="devtools-panel-container">
      {/* Header with toggle button */}
      <div className="devtools-panel-header" data-testid="devtools-panel-header">
        <div className="devtools-panel-title">
          Narraitor 开发者工具
          {isTestPage && "（测试页面模式）"}
        </div>
        <div className="devtools-panel-controls">
          {isOpen && (
            <>
              <QuickSetup />
              <label className="devtools-panel-prompts-toggle">
                <input
                  type="checkbox"
                  checked={settings.showPromptDebugInfo}
                  onChange={(e) => updateSetting('showPromptDebugInfo', e.target.checked)}
                  title="切换叙事片段中的提示词调试信息"
                />
                <span>显示提示词</span>
              </label>
              <SectionVisibilityControls />
            </>
          )}
          <Button
            data-testid="devtools-panel-toggle"
            onClick={toggleDevTools}
            variant="ghost"
            size="sm"
          >
            {isOpen ? "隐藏开发者工具" : "显示开发者工具"}
          </Button>
        </div>
      </div>

      {/* Content area - only rendered when open */}
      {isOpen && (
        <div className="devtools-panel-content" data-testid="devtools-panel-content">
          <EnvironmentInfo />

          {/* Two-column grid layout organized by function */}
          <div className="devtools-panel-grid">
            {/* Left Column: State Management & Error Tracking */}
            <div className="devtools-panel-column">
              {/* State Management Group - only show if any child sections are visible */}
              {isSectionVisible(SectionId.STATE_SECTION) && (
                <div className="devtools-panel-group">
                  <h3 className="devtools-panel-group-title">状态管理</h3>
                  <StateSection defaultCollapsed={true} />
                </div>
              )}

              {/* Decisions Group - only show if any child sections are visible */}
              {(isSectionVisible(SectionId.DECISION_CONSOLE) ||
                isSectionVisible(SectionId.DECISION_FLOW)) && (
                <div className="devtools-panel-group">
                  <h3 className="devtools-panel-group-title">决策</h3>
                  <div className="devtools-panel-subgroup">
                    {isSectionVisible(SectionId.DECISION_CONSOLE) && (
                      <CollapsibleSection title="决策控制台" initialCollapsed={true}>
                        <DecisionConsoleSection />
                      </CollapsibleSection>
                    )}

                    {isSectionVisible(SectionId.DECISION_FLOW) && (
                      <CollapsibleSection title="决策创建流程" initialCollapsed={true}>
                        <DecisionFlowSection />
                      </CollapsibleSection>
                    )}
                  </div>
                </div>
              )}

              {/* Error Tracking Group */}
              {isSectionVisible(SectionId.ERROR_SECTION) && (
                <div className="devtools-panel-group">
                  <h3 className="devtools-panel-group-title">错误跟踪</h3>
                  <CollapsibleSection title="运行时错误" initialCollapsed={true}>
                    <ErrorSection />
                  </CollapsibleSection>
                </div>
              )}
            </div>

            {/* Right Column: AI Tools, Test Data & Content Generation */}
            <div className="devtools-panel-column">
              {/* AI Tools Group - only show if any child sections are visible */}
              {(isSectionVisible(SectionId.AI_TESTING) ||
                isSectionVisible(SectionId.CONSISTENCY_VALIDATION) ||
                isSectionVisible(SectionId.TOKEN_BUDGET) ||
                isSectionVisible(SectionId.WORLD_CLOCK) ||
                isSectionVisible(SectionId.LORE_MANAGEMENT)) && (
                <div className="devtools-panel-group">
                  <h3 className="devtools-panel-group-title">AI 工具与验证</h3>
                  <div className="devtools-panel-subgroup">
                    {isSectionVisible(SectionId.AI_TESTING) && (
                      <CollapsibleSection title="AI 测试" initialCollapsed={true}>
                        <AITestingPanel />
                      </CollapsibleSection>
                    )}

                    {isSectionVisible(SectionId.CONSISTENCY_VALIDATION) && (
                      <CollapsibleSection title="一致性验证" initialCollapsed={true}>
                        <ConsistencyValidationSection />
                      </CollapsibleSection>
                    )}

                    {isSectionVisible(SectionId.LORE_MANAGEMENT) && (
                      <CollapsibleSection title="设定管理" initialCollapsed={true}>
                        <LoreManagementSection />
                      </CollapsibleSection>
                    )}

                    {isSectionVisible(SectionId.TOKEN_BUDGET) && (
                      <CollapsibleSection title="Token 预算" initialCollapsed={true}>
                        <TokenBudgetPanel />
                      </CollapsibleSection>
                    )}

                    {isSectionVisible(SectionId.WORLD_CLOCK) && (
                      <CollapsibleSection title="世界时钟" initialCollapsed={true}>
                        <WorldClockSection />
                      </CollapsibleSection>
                    )}
                  </div>
                </div>
              )}

              {isSectionVisible(SectionId.TEST_DATA_GENERATOR) && (
                <div className="devtools-panel-group">
                  <h3 className="devtools-panel-group-title">测试数据与生成器</h3>
                  <CollapsibleSection title="测试数据生成器" initialCollapsed={true}>
                    <TestDataGeneratorSection />
                  </CollapsibleSection>
                </div>
              )}

              {/* Content Generation Group - only show if any child sections are visible */}
              {(isSectionVisible(SectionId.PORTRAIT_DEBUG) || isSectionVisible(SectionId.ENDING_IMAGE_DEBUG)) && (
                <div className="devtools-panel-group">
                  <h3 className="devtools-panel-group-title">内容生成</h3>
                  <div className="devtools-panel-subgroup">
                    {isSectionVisible(SectionId.PORTRAIT_DEBUG) && <PortraitDebugSection />}

                    {isSectionVisible(SectionId.ENDING_IMAGE_DEBUG) && <EndingImageDebugSection />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
