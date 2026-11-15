'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { World } from '@/types/world.types';
import WorldCard from '@/components/WorldCard/WorldCard';
import { useCharacterStore, type StoreCharacter } from '@/state/characterStore';
import { ActionButtonGroup } from '@/components/shared/ActionButtonGroup';

interface WorldListProps {
  worlds: World[];
  currentWorldId?: string | null;
  onDeleteWorld: (worldId: string) => void;
  onCreateWorld?: () => void;
}

const WorldList: React.FC<WorldListProps> = ({
  worlds,
  currentWorldId,
  onDeleteWorld,
  onCreateWorld,
}) => {
  const router = useRouter();
  // Get character counts and character data for each world using proper hook
  const characters = useCharacterStore((state) => state.characters);
  const allCharacters = Object.values(characters) as StoreCharacter[];
  const charactersByWorld = worlds.reduce(
    (acc, world) => {
      acc[world.id] = allCharacters.filter((char) => char.worldId === world.id);
      return acc;
    },
    {} as Record<string, StoreCharacter[]>
  );

  const handleCreateWorld = () => {
    if (onCreateWorld) {
      onCreateWorld();
    } else {
      router.push('/worlds/create');
    }
  };

  if (worlds.length === 0) {
    return (
      <section
        data-testid="world-list-empty-message"
        className="world-list-empty"
      >
        <div className="world-list-empty-lead">
          <h2 className="world-list-empty-title">
            每个故事都始于一个世界。
          </h2>
          <p className="world-list-empty-lede">
            世界承载着背景设定、衡量角色的规则，以及故事的叙事风格。创建一个世界，Narraitor 的其余内容才有发生的舞台。
          </p>
          <p className="world-list-empty-description">
            你可以保留任意数量的世界，并随时在它们之间切换。
          </p>
          <ActionButtonGroup
            layout="horizontal"
            gap="sm"
            actions={[
              {
                label: "创建世界",
                onClick: handleCreateWorld,
                variant: 'primary',
                size: 'lg',
              },
            ]}
          />
        </div>

        <ol className="world-list-empty-steps">
          <li>
            <span className="world-list-empty-step-title">创建世界</span>
            <span className="world-list-empty-step-body">
              设定主题、构建角色所依据的属性，以及游玩所遵循的规则。
            </span>
          </li>
          <li>
            <span className="world-list-empty-step-title">
              创建角色
            </span>
            <span className="world-list-empty-step-body">
              你可以自行编写角色，也可以根据刚才描述的世界生成一个。
            </span>
          </li>
          <li>
            <span className="world-list-empty-step-title">开始游玩</span>
            <span className="world-list-empty-step-body">
              选择接下来发生什么，故事会保留相应的后果。
            </span>
          </li>
        </ol>
      </section>
    );
  }

  const sortedWorlds = [...worlds].sort((a, b) => {
    if (a.id === currentWorldId) return -1;
    if (b.id === currentWorldId) return 1;
    return 0;
  });

  return (
    <section data-testid="world-list-container" className="world-list">
      <div className="world-list-grid">
        {sortedWorlds.map((world) => (
          <WorldCard
            key={world.id}
            world={world}
            isActive={world.id === currentWorldId}
            characters={charactersByWorld[world.id] || []}
            onDelete={onDeleteWorld}
          />
        ))}
      </div>
    </section>
  );
};

export default WorldList;
