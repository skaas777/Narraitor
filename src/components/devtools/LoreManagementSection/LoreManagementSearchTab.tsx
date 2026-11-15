import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { LoreCategory, LoreFact } from '@/types/lore.types';
import type { EntityID } from '@/types/common.types';
import { displayLabel } from '@/lib/i18n/zhCN';

interface LoreManagementSearchTabProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  categoryFilter: LoreCategory | '';
  onCategoryFilterChange: (value: LoreCategory | '') => void;
  sessionFilter: 'all' | 'current' | EntityID;
  onSessionFilterChange: (value: 'all' | 'current' | EntityID) => void;
  currentSessionId?: EntityID;
  currentSessionWorldId?: EntityID;
  selectedWorldId: EntityID;
  sessionOptions: EntityID[];
  facts: LoreFact[];
  categoryColors: Record<LoreCategory, string>;
  onSelectFact: (id: EntityID) => void;
}

export const LoreManagementSearchTab: React.FC<LoreManagementSearchTabProps> = ({
  searchQuery,
  onSearchQueryChange,
  categoryFilter,
  onCategoryFilterChange,
  sessionFilter,
  onSessionFilterChange,
  currentSessionId,
  currentSessionWorldId,
  selectedWorldId,
  sessionOptions,
  facts,
  categoryColors,
  onSelectFact,
}) => (
  <div>
    <div>
      <Input
        placeholder="搜索事实……"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        
      />
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
    </div>

    {searchQuery && (
      <div>找到 {facts.length} 条结果，搜索词 “{searchQuery}&quot;</div>
    )}

    <div>
      {facts.map((fact) => {
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
          <span>无重要度</span>
        );

        return (
          <div
            key={fact.id}
            
            onClick={() => onSelectFact(fact.id)}
          >
            <div>
              <span className={`${categoryColors[fact.category]}`}>{displayLabel(fact.category)}</span>
              {importanceBadge}
              <span>{fact.key}</span>
            </div>
            <div>{fact.value}</div>
            {fact.metadata?.description && <div>{fact.metadata.description}</div>}
          </div>
        );
      })}
    </div>
  </div>
);
