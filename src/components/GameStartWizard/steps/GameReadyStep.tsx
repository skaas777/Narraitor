'use client';

import React from 'react';
import { useWorldStore } from '@/state/worldStore';
import { useCharacterStore } from '@/state/characterStore';
import { Button } from '@/components/ui/button';
import { getGenreLabel } from '@/lib/constants/genres';

export interface GameReadyStepProps {
  worldId: string;
  characterId: string;
  onStart: () => void;
  onBack: () => void;
  isStarting?: boolean;
}

export function GameReadyStep({ 
  worldId, 
  characterId, 
  onStart, 
  onBack,
  isStarting = false 
}: GameReadyStepProps) {
  const { worlds } = useWorldStore();
  const { characters } = useCharacterStore();
  
  const world = worlds[worldId];
  const character = characters[characterId];

  return (
    <div data-testid="game-ready-step" >
      <h3>
        准备好开始你的故事！
      </h3>
      
      <div>
        <div>
          <div>
            <span>世界：</span>
            <p>{world?.name}</p>
            <p>{world?.genre ? getGenreLabel(world.genre) : "未知"}</p>
          </div>
          <div>
            <span>角色：</span>
            <p>{character?.name}</p>
            <p>
              {character?.background?.personality || "暂无描述"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <Button
          onClick={onStart}
          disabled={isStarting}
          
          variant="default"
        >
          {isStarting ? (
            <>
              <span>⏳</span>
              正在开始游戏...
            </>
          ) : (
            "开始游玩"
          )}
        </Button>
        
        <div>
          <Button
            onClick={onBack}
            disabled={isStarting}
            
            variant="ghost"
          >
            ← 更换角色
          </Button>
        </div>
      </div>
    </div>
  );
}
