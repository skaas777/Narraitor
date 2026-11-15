import React from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { LoreCategory, LoreFact } from '@/types/lore.types';
import type { EntityID } from '@/types/common.types';
import { displayLabel } from '@/lib/i18n/zhCN';

interface LoreManagementBrowseTabProps {
  categoryFilter: LoreCategory | '';
  onCategoryFilterChange: (value: LoreCategory | '') => void;
  sessionFilter: 'all' | 'current' | EntityID;
  onSessionFilterChange: (value: 'all' | 'current' | EntityID) => void;
  visibilityFilter: 'all' | 'session-private' | 'world-shared';
  onVisibilityFilterChange: (value: 'all' | 'session-private' | 'world-shared') => void;
  currentSessionId?: EntityID;
  currentSessionWorldId?: EntityID;
  selectedWorldId: EntityID;
  sessionOptions: EntityID[];
  facts: LoreFact[];
  factsByCategory: Record<LoreCategory, LoreFact[]>;
  categoryColors: Record<LoreCategory, string>;
  visibilityStats: {
    total: number;
    worldShared: number;
    sessionPrivate: number;
    narrativeWorldShared: number;
    narrativeSessionPrivate: number;
  };
  onSelectFact: (id: EntityID) => void;
  onDeleteFact: (id: EntityID) => void;
}

export const LoreManagementBrowseTab: React.FC<LoreManagementBrowseTabProps> = ({
  categoryFilter,
  onCategoryFilterChange,
  sessionFilter,
  onSessionFilterChange,
  visibilityFilter,
  onVisibilityFilterChange,
  currentSessionId,
  currentSessionWorldId,
  selectedWorldId,
  sessionOptions,
  facts,
  factsByCategory,
  categoryColors,
  visibilityStats,
  onSelectFact,
  onDeleteFact,
}) => (
  <div>
    <div>
      <Select
        
        value={categoryFilter}
        onChange={(e) => onCategoryFilterChange(e.target.value as LoreCategory | '')}
      >
        <option value="">全部分类</option>
        <option value="characters">角色</option>
        <option value="locations">地点</option>
        <option value="events">事件</option>
        <option value="rules">规则</option>
      </Select>
      <Select
        
        value={sessionFilter}
        onChange={(e) => onSessionFilterChange(e.target.value as typeof sessionFilter)}
      >
        <option value="all">全部冒险记录</option>
        {currentSessionId && currentSessionWorldId === selectedWorldId && (
          <option value="current">当前冒险记录（{currentSessionId})</option>
        )}
        {sessionOptions
          .filter((id) => id !== currentSessionId)
          .map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
      </Select>
      <Select
        
        value={visibilityFilter}
        onChange={(e) => onVisibilityFilterChange(e.target.value as typeof visibilityFilter)}
      >
        <option value="all">全部可见性</option>
        <option value="session-private">仅冒险记录私有</option>
        <option value="world-shared">仅世界共享</option>
      </Select>
      <div>
        事实总数： {facts.length}
      </div>
    </div>

    <div>
      <div>
        可见性统计（世界）： {visibilityStats.total} 总计 • {visibilityStats.worldShared} 世界共享 •{' '}
        {visibilityStats.sessionPrivate} 冒险记录私有
      </div>
      <div>
        叙事事实： {visibilityStats.narrativeWorldShared} 世界共享 • {visibilityStats.narrativeSessionPrivate}{' '}
        冒险记录私有
      </div>
      <div>注意：当冒险记录处于活动状态时，AI 提取的设定使用冒险记录私有可见性。</div>
    </div>

    <div>
      {(Object.keys(factsByCategory) as LoreCategory[]).map((category) => {
        const categoryFacts = factsByCategory[category];
        if (!categoryFilter && categoryFacts.length === 0) return null;

        return (
          <div key={category} >
            <h3 className={`${categoryColors[category]}`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h3>
            <div>
              {categoryFacts.map((fact) => {
                const importance = fact.metadata?.importance;
                const importanceBadge = importance ? (
                  <span
                    className={`${
                      importance === 'high'
                        ? ''
                        : importance === 'medium'
                          ? ''
                          : importance === 'low'
                            ? ''
                            : ''
                    }`}
                  >
                    {displayLabel(importance.toUpperCase())}
                  </span>
                ) : (
                  <span>
                    无重要度
                  </span>
                );

                const visibilityBadge = (
                  <span
                    className={`${
                      fact.visibility === 'session-private'
                        ? ''
                        : ''
                    }`}
                  >
                    {fact.visibility === 'session-private' ? "冒险记录私有" : "世界共享"}
                  </span>
                );

                return (
                  <div
                    key={fact.id}
                    
                    onClick={() => onSelectFact(fact.id)}
                  >
                    <div>
                      {importanceBadge}
                      {visibilityBadge}
                      <span>{fact.value}</span>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFact(fact.id);
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFact(fact.id);
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
