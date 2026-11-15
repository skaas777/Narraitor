'use client';

import React from 'react';
import { CharacterPropertyGrid } from './CharacterPropertyGrid';

interface CharacterAttribute {
  id: string;
  characterId: string;
  name: string;
  baseValue: number;
  modifiedValue: number;
  category?: string;
  description?: string;
}

interface CharacterAttributeDisplayProps {
  attributes: CharacterAttribute[];
  showCategories?: boolean;
}

export function CharacterAttributeDisplay({
  attributes,
  showCategories = false,
}: CharacterAttributeDisplayProps) {
  return (
    <CharacterPropertyGrid
      items={attributes}
      kind="attribute"
      emptyText="该角色尚未分配任何属性。"
      showCategories={showCategories}
      renderItem={(attribute) => (
        <div className="character-attribute-card">
          <div className="character-attribute-name">{attribute.name}</div>
          <div className="character-attribute-value">{attribute.modifiedValue}</div>
          {attribute.baseValue !== attribute.modifiedValue && (
            <div className="character-attribute-base">基础值： {attribute.baseValue}</div>
          )}
          {attribute.description && (
            <p className="character-attribute-description">{attribute.description}</p>
          )}
        </div>
      )}
    />
  );
}
