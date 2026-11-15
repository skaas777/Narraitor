'use client';

import React, { useState } from 'react';
import { useWorldStore } from '@/state/worldStore';
import { useCharacterStore, type StoreCharacter } from '@/state/characterStore';
import {
  generateAICharacter,
  type GeneratedCharacterData,
} from '@/lib/generators/characterGenerator';
import { displayLabel } from '@/lib/i18n/zhCN';
import { localizeErrorMessage } from '@/lib/i18n/errors';

export default function CharacterGenerationTestPage() {
  const [generationType, setGenerationType] = useState<
    'known' | 'original' | 'specific'
  >(() => {
    const types: Array<'known' | 'original'> = ['known', 'original'];
    return types[Math.floor(Math.random() * types.length)];
  });
  const [suggestedName, setSuggestedName] = useState('');
  const [selectedWorldId, setSelectedWorldId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] =
    useState<GeneratedCharacterData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { worlds } = useWorldStore();
  const { characters } = useCharacterStore();

  const handleGenerate = async () => {
    if (!selectedWorldId) {
      setError("请选择一个世界");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedCharacter(null);

    try {
      const world = worlds[selectedWorldId];
      const existingNames = (Object.values(characters) as StoreCharacter[])
        .filter((c) => c.worldId === selectedWorldId)
        .map((c) => c.name);

      const result = await generateAICharacter(
        world,
        existingNames,
        generationType === 'specific' ? suggestedName : undefined,
        generationType
      );

      setGeneratedCharacter(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCharacter = () => {
    if (!generatedCharacter || !selectedWorldId) return;

    const world = worlds[selectedWorldId];

    useCharacterStore.getState().createCharacter({
      name: generatedCharacter.name,
      description: generatedCharacter.background.description || '',
      worldId: selectedWorldId,
      level: generatedCharacter.level || 1,
      attributes: generatedCharacter.attributes.map((attr) => {
        const worldAttr = world.attributes.find((wa) => wa.id === attr.id);
        return {
          id: `attr-${Date.now()}-${Math.random()}`,
          characterId: '',
          name: worldAttr?.name || "未知",
          baseValue: attr.value,
          modifiedValue: attr.value,
        };
      }),
      skills: generatedCharacter.skills.map((skill) => {
        const worldSkill = world.skills.find((ws) => ws.id === skill.id);
        return {
          id: `skill-${Date.now()}-${Math.random()}`,
          characterId: '',
          name: worldSkill?.name || "未知",
          level: skill.level,
        };
      }),
      derivedStats: [],
      background: {
        history: generatedCharacter.background.description,
        personality: generatedCharacter.background.personality,
        goals: generatedCharacter.background.motivation
          ? [generatedCharacter.background.motivation]
          : [],
        fears: generatedCharacter.background.fears || [],
        physicalDescription: generatedCharacter.background.physicalDescription,
        relationships: [],
      },
      isPlayer: true,
      status: {
        conditions: [],
      },
      inventory: {
        characterId: '',
        items: [],
        capacity: 20,
        categories: [],
        itemOrder: [],
      },
    });

    setGeneratedCharacter(null);
    setSuggestedName('');
  };

  return (
    <div>
      <h1>
        角色生成测试工具
      </h1>

      <div>
        {/* World Selection */}
        <div>
          <h2>选择世界</h2>
          <select
            value={selectedWorldId}
            onChange={(e) => setSelectedWorldId(e.target.value)}
          >
            <option value="">—— 请选择世界 ——</option>
            {Object.entries(worlds).map(([id, world]) => (
              <option key={id} value={id}>
                {world.name} ({displayLabel(world.genre)})
              </option>
            ))}
          </select>
        </div>

        {/* Generation Type */}
        <div>
          <h2>生成类型</h2>
          <div>
            <label>
              <input
                type="radio"
                value="known"
                checked={generationType === 'known'}
                onChange={(e) =>
                  setGenerationType(e.target.value as typeof generationType)
                }
              />
              <span>已知人物（来源作品中的原作角色）</span>
            </label>
            <label>
              <input
                type="radio"
                value="original"
                checked={generationType === 'original'}
                onChange={(e) =>
                  setGenerationType(e.target.value as typeof generationType)
                }
              />
              <span>原创角色（适合该世界的新角色）</span>
            </label>
            <label>
              <input
                type="radio"
                value="specific"
                checked={generationType === 'specific'}
                onChange={(e) =>
                  setGenerationType(e.target.value as typeof generationType)
                }
              />
              <span>指定角色（提供名称）</span>
            </label>
          </div>

          {generationType === 'specific' && (
            <div>
              <label>
                角色名称
              </label>
              <input
                type="text"
                value={suggestedName}
                onChange={(e) => setSuggestedName(e.target.value)}
                placeholder="输入角色名称"
              />
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedWorldId}
          >
            {isGenerating ? "正在生成……" : "生成角色"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div>
            <p>{localizeErrorMessage(error)}</p>
          </div>
        )}

        {/* Generated Character Display */}
        {generatedCharacter && (
          <div>
            <h2>已生成的角色</h2>

            <div>
              <div>
                <h3>名称：</h3>
                <p>{generatedCharacter.name}</p>
              </div>

              <div>
                <h3>等级：</h3>
                <p>{generatedCharacter.level || 1}</p>
              </div>

              <div>
                <h3>背景：</h3>
                <div>
                  <div>
                    <span>描述：</span>
                    <p>
                      {generatedCharacter.background.description}
                    </p>
                  </div>
                  <div>
                    <span>性格：</span>
                    <p>
                      {generatedCharacter.background.personality}
                    </p>
                  </div>
                  <div>
                    <span>动机：</span>
                    <p>
                      {generatedCharacter.background.motivation}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3>属性：</h3>
                <div>
                  {generatedCharacter.attributes.map((attr) => {
                    const world = worlds[selectedWorldId];
                    const worldAttr = world.attributes.find(
                      (wa) => wa.id === attr.id
                    );
                    return (
                      <div key={attr.id} >
                        <span>{worldAttr?.name}:</span>
                        <span>{attr.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3>技能：</h3>
                <div>
                  {generatedCharacter.skills.map((skill) => {
                    const world = worlds[selectedWorldId];
                    const worldSkill = world.skills.find(
                      (ws) => ws.id === skill.id
                    );
                    return (
                      <div key={skill.id} >
                        <span>{worldSkill?.name}:</span>
                        <span>{skill.level}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <button
                  onClick={handleCreateCharacter}
                >
                  创建此角色
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Characters */}
        <div>
          <h2>
            所选世界中的现有角色
          </h2>
          {selectedWorldId ? (
            <div>
              {(Object.values(characters) as StoreCharacter[])
                .filter((c) => c.worldId === selectedWorldId)
                .map((char) => (
                  <div key={char.id}>
                    <p>{char.name}</p>
                    <p>
                      等级 {char.level || 1} &bull; {char.description}
                    </p>
                  </div>
                ))}
              {(Object.values(characters) as StoreCharacter[]).filter(
                (c) => c.worldId === selectedWorldId
              ).length === 0 && (
                <p>此世界中尚无角色</p>
              )}
            </div>
          ) : (
            <p>选择世界以查看角色</p>
          )}
        </div>
      </div>
    </div>
  );
}
