'use client';

import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGenreLabel } from '@/lib/constants/genres';
import { useWorldStore } from '@/state/worldStore';
import { WorldThumbnail } from '@/components/world/WorldThumbnail';

interface DashboardRecentWorldsProps {
  worlds: ReturnType<typeof useWorldStore.getState>['worlds'];
  maxItems: number;
  onNavigate: (path: string) => void;
}

export function DashboardRecentWorlds({
  worlds,
  maxItems,
  onNavigate,
}: DashboardRecentWorldsProps) {
  const recentWorlds = useMemo(() => {
    return Object.values(worlds)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, maxItems);
  }, [worlds, maxItems]);

  const emptySlots = maxItems - recentWorlds.length;

  if (recentWorlds.length === 0) {
    return (
      <section
        className="component-dashboard-recent-worlds"
        aria-labelledby="recent-worlds-heading"
      >
        <h2 id="recent-worlds-heading">最近的世界</h2>
        <div className="dashboard-recent-empty-state">
          <p>尚无世界</p>
          <Button onClick={() => onNavigate('/worlds')} variant="secondary">
            <Plus aria-hidden="true" />
            创建你的第一个世界
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="component-dashboard-recent-worlds"
      aria-labelledby="recent-worlds-heading"
    >
      <h2 id="recent-worlds-heading">最近的世界</h2>

      <div className="dashboard-recent-list">
        {/* Recent Worlds */}
        {recentWorlds.map((world) => (
          <div
            key={world.id}
            className="dashboard-recent-item"
            onClick={() => onNavigate(`/worlds/${world.id}`)}
            role="button"
            tabIndex={0}
            aria-label={`查看世界：${world.name}，类型：${getGenreLabel(world.genre)}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigate(`/worlds/${world.id}`);
              }
            }}
          >
            <div className="dashboard-recent-world-content">
              <WorldThumbnail url={world.image?.url} name={world.name} size="lg" />
              <div className="dashboard-recent-item-meta">
                <h3>{world.name}</h3>
                <p>{getGenreLabel(world.genre)}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Empty Slots */}
        {emptySlots > 0 &&
          Array.from({ length: emptySlots }).map((_, index) => (
            <Button
              key={`empty-${index}`}
              onClick={() => onNavigate('/worlds')}
              variant="ghost"
              size="sm"
              className="dashboard-recent-empty-slot"
            >
              <Plus aria-hidden="true" />
              创建世界
            </Button>
          ))}
      </div>
    </section>
  );
}
