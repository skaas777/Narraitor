import React from 'react';
import { Button } from '@/components/ui/button';
import type { LoreFact, LoreCategory, LoreUsageEvent, LoreUsageStats } from '@/types/lore.types';
import { displayLabel } from '@/lib/i18n/zhCN';

interface LoreManagementUsageTabProps {
  usageSummary: {
    totalFacts: number;
    usedFacts: number;
    totalMentions: number;
    lastUsedAt?: string;
  };
  usageRows: Array<{ fact: LoreFact; stats: LoreUsageStats }>;
  usageEvents: LoreUsageEvent[];
  categoryColors: Record<LoreCategory, string>;
  onClearUsage: () => void;
}

export const LoreManagementUsageTab: React.FC<LoreManagementUsageTabProps> = ({
  usageSummary,
  usageRows,
  usageEvents,
  categoryColors,
  onClearUsage,
}) => (
  <div>
    <div>
      <div>使用情况概览</div>
      <Button variant="outline" size="sm" onClick={onClearUsage}>
        清除使用数据
      </Button>
    </div>

    <div>
      <div>设定总数： {usageSummary.totalFacts}</div>
      <div>已用于提示词： {usageSummary.usedFacts}</div>
      <div>提及总数： {usageSummary.totalMentions}</div>
      <div>
        上次使用： {usageSummary.lastUsedAt ? new Date(usageSummary.lastUsedAt).toLocaleString('zh-CN') : "从未"}
      </div>
    </div>

    <div>
      <div>按使用情况排列的设定事实</div>
      {usageRows.length === 0 ? (
        <div>此筛选条件下未找到设定事实。</div>
      ) : (
        <div>
          {usageRows.map(({ fact, stats }) => (
            <div key={fact.id} >
              <div className={`${categoryColors[fact.category]}`}>
                {displayLabel(fact.category)}: {fact.key}
              </div>
              <div>{fact.value}</div>
              <div>
                已使用： {stats.usageCount} · 提及： {stats.mentionCount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div>
      <div>最近使用事件</div>
      {usageEvents.length === 0 ? (
        <div>尚未记录任何使用事件。</div>
      ) : (
        <div>
          {usageEvents.map((event) => (
            <div key={event.id} >
              <div>
                {event.eventType === 'context' ? "用作上下文" : "被提及"} · {displayLabel(event.source)}
              </div>
              <div>
                {new Date(event.timestamp).toLocaleString('zh-CN')} · {event.factIds.length} 条设定事实
              </div>
              {event.responseExcerpt && (
                <div>
                  &ldquo;{event.responseExcerpt}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
