'use client';

import React from 'react';
import Link from 'next/link';
import { useCharacterStore, type StoreCharacter } from '@/state/characterStore';
import { useWorldStore } from '@/state/worldStore';
import { Button } from '@/components/ui/button';

export interface CharacterSelectionStepProps {
  worldId: string;
  onNext: (characterId: string) => void;
  onBack: () => void;
}

export function CharacterSelectionStep({ worldId, onNext, onBack }: CharacterSelectionStepProps) {
  const { characters } = useCharacterStore();
  const { worlds } = useWorldStore();
  const world = worlds[worldId];
  
  const worldCharacters = (Object.values(characters) as StoreCharacter[]).filter(
    char => char.worldId === worldId
  );

  if (worldCharacters.length === 0) {
    return (
      <div>
        <h3>
          尚无角色
        </h3>
        <p>
          为 {world?.name} 创建一个角色以继续
        </p>
        <div>
          <Link
            href="/characters/create"
            
          >
            创建你的角色
          </Link>
          <div>
            <Button
              onClick={onBack}
              
              variant="ghost"
            >
              ← 返回世界选择
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="character-selection-step">
      <h3>
        选择你的角色
      </h3>
      <p>
        世界： {world?.name}
      </p>
      
      <div>
        {worldCharacters.map(character => (
          <Button
            key={character.id}
            onClick={() => onNext(character.id)}
            
            variant="ghost"
          >
            <div>
              <div>
                <h4>{character.name}</h4>
                <p>
                  {character.background.personality || "暂无描述"}
                </p>
              </div>
              <span>
                选择 →
              </span>
            </div>
          </Button>
        ))}
      </div>

      <div>
        <Button
          onClick={onBack}
          
          variant="ghost"
        >
          ← 返回
        </Button>
        <Link
          href="/characters/create"
          
        >
          创建新角色
        </Link>
      </div>
    </div>
  );
}
