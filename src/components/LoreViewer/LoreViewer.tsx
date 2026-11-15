/**
 * Read-Only Lore Viewer Component
 * Displays established facts for player reference
 */

import React from 'react';
import { useLoreStore } from '@/state/loreStore';
import type { LoreCategory } from '@/types';

interface LoreViewerProps {
  worldId: string;
  sessionId?: string;
  className?: string;
}

export const LoreViewer: React.FC<LoreViewerProps> = ({ 
  worldId, 
  sessionId,
  className = '' 
}) => {
  const { getFacts } = useLoreStore();
  
  // Get facts for this world/session
  const facts = getFacts({ worldId, sessionId });
  
  // Group facts by category
  const factsByCategory = facts.reduce((acc, fact) => {
    if (!acc[fact.category]) {
      acc[fact.category] = [];
    }
    acc[fact.category].push(fact);
    return acc;
  }, {} as Record<LoreCategory, typeof facts>);

  const categoryLabels: Record<LoreCategory, string> = {
    characters: "角色",
    locations: "地点",
    events: "事件",
    rules: "世界规则"
  };

  const categoryBackgrounds: Record<LoreCategory, string> = {
    characters: 'hsl(var(--lore-characters-bg))',
    locations: 'hsl(var(--lore-locations-bg))',
    events: 'hsl(var(--lore-events-bg))',
    rules: 'hsl(var(--lore-rules-bg))'
  };

  if (facts.length === 0) {
    return (
      <div className={`${className}`}>
        <p>尚未记录任何设定事实。</p>
        <p>随着故事展开，设定事实将显示在这里。</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3>已确立的设定</h3>
      
      {(Object.keys(categoryLabels) as LoreCategory[]).map(category => {
        const categoryFacts = factsByCategory[category];
        if (!categoryFacts || categoryFacts.length === 0) return null;

        return (
          <div key={category} data-testid={`lore-category-${category}`} style={{ background: categoryBackgrounds[category] }}>
            <h4>{categoryLabels[category]}</h4>
            <ul>
              {categoryFacts.map(fact => (
                <li key={fact.id} >
                  <span>{fact.value}</span>
                  {fact.aliases && fact.aliases.length > 0 && (
                    <span>
                      （又名： {fact.aliases.join(', ')})
                    </span>
                  )}
                  {fact.metadata?.description && (
                    <p>
                      {fact.metadata.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      
      <div>
        事实总数： {facts.length}
      </div>
    </div>
  );
};
