'use client';

import React from 'react';
import Link from 'next/link';
import { useWorldStore } from '@/state/worldStore';
import WorldCard from '@/components/WorldCard/WorldCard';
import { Button } from '@/components/ui/button';

export interface WorldSelectionStepProps {
  onNext: (worldId: string) => void;
}

export function WorldSelectionStep({ onNext }: WorldSelectionStepProps) {
  const { worlds } = useWorldStore();
  const worldList = Object.values(worlds);

  if (worldList.length === 0) {
    return (
      <div>
        <h3>
          尚无世界
        </h3>
        <p>
          创建你的第一个世界，开始你的冒险
        </p>
        <Link
          href="/worlds/create"
          
        >
          创建你的第一个世界
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="world-selection-step">
      <h3>
        选择你的世界
      </h3>
      
      <div>
        {worldList.map(world => (
          <div key={world.id} className="world-selection-step-option">
            <WorldCard
              world={world}
              isActive={false}
              onDelete={() => {/* No delete in wizard */}}
            />
            <Button onClick={() => onNext(world.id)}>
              选择 {world.name}
            </Button>
          </div>
        ))}
      </div>

      <div>
        <Link
          href="/worlds/create"
          
        >
          创建新世界
        </Link>
        <p>
          选择一个世界以继续
        </p>
      </div>
    </div>
  );
}
