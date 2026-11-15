'use client';

import React, { useState } from 'react';
import { useWorldStore } from '@/state/worldStore';
import {
  generateWorld,
  type GeneratedWorldData,
} from '@/lib/generators/worldGenerator';
import { safeTrim, capitalize } from '@/lib/utils';
import { worldCreationService } from '@/lib/services/worldCreationService';
import { toGenreValue } from '@/lib/constants/genres';
import { displayLabel } from '@/lib/i18n/zhCN';
import { localizeErrorMessage } from '@/lib/i18n/errors';

export default function WorldGenerationTestPage() {
  const [worldReference, setWorldReference] = useState('');
  const [suggestedName, setSuggestedName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorld, setGeneratedWorld] =
    useState<GeneratedWorldData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { worlds } = useWorldStore();

  const handleGenerate = async () => {
    if (!safeTrim(worldReference)) {
      setError("请输入世界参考");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedWorld(null);

    try {
      const existingNames = Object.values(worlds).map((w) => w.name);
      const result = await generateWorld({
        method: 'ai',
        reference: safeTrim(worldReference),
        relationship: 'inspired_by',
        existingNames,
        suggestedName: safeTrim(suggestedName) || undefined,
      });

      setGeneratedWorld(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateWorld = async () => {
    if (!generatedWorld) return;

    await worldCreationService.createWorldFromGeneration({
      generatedData: generatedWorld,
      customizations: {
        name: generatedWorld.name,
        genre: toGenreValue(generatedWorld.genre),
        description: generatedWorld.description,
      },
    });

    setGeneratedWorld(null);
    setWorldReference('');
    setSuggestedName('');
  };

  const presetReferences = [
    'Lord of the Rings',
    'Star Wars',
    'Harry Potter',
    'Game of Thrones',
    'Cyberpunk 2077',
    "古罗马",
    "维多利亚时代的英格兰",
    "狂野西部",
    "末日废土",
    'space-opera',
    "蒸汽朋克",
    "现代谍战惊悚",
    "中世纪奇幻",
    "超级英雄宇宙",
  ];

  return (
    <div>
      <h1>世界生成测试工具</h1>

      <div>
        {/* World Reference Input */}
        <div>
          <h2>世界参考</h2>
          <div>
            <div>
              <label>输入虚构或非虚构的世界参考：</label>
              <input
                type="text"
                value={worldReference}
                onChange={(e) => setWorldReference(e.target.value)}
                placeholder="例如：Lord of the Rings、古罗马、Cyberpunk 2077"
              />
            </div>

            <div>
              <label>或选择一个预设：</label>
              <div>
                {presetReferences.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setWorldReference(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Name */}
        <div>
          <h2>自定义名称（可选）</h2>
          <div>
            <label>覆盖 AI 生成的名称：</label>
            <input
              type="text"
              value={suggestedName}
              onChange={(e) => setSuggestedName(e.target.value)}
              placeholder="留空则使用 AI 生成的名称"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !safeTrim(worldReference)}
          >
            {isGenerating ? "正在生成世界..." : "生成世界"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div>
            <p>{localizeErrorMessage(error)}</p>
          </div>
        )}

        {/* Generated World Display */}
        {generatedWorld && (
          <div>
            <h2>已生成的世界</h2>

            <div>
              <div>
                <h3>名称：</h3>
                <p>{generatedWorld.name}</p>
              </div>

              <div>
                <h3>类型：</h3>
                <p>{displayLabel(generatedWorld.genre)}</p>
              </div>

              <div>
                <h3>描述：</h3>
                <p>{generatedWorld.description}</p>
              </div>

              <div>
                <h3>属性（{generatedWorld.attributes.length}):</h3>
                <div>
                  {generatedWorld.attributes.map((attr, index: number) => (
                    <div key={index}>
                      <div>{attr.name}</div>
                      <div>{attr.description}</div>
                      <div>
                        范围： {attr.minValue} - {attr.maxValue} （默认：{' '}
                        {attr.baseValue})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3>技能（{generatedWorld.skills.length}):</h3>
                <div>
                  {generatedWorld.skills.map((skill, index: number) => (
                    <div key={index}>
                      <div>{skill.name}</div>
                      <div>{skill.description}</div>
                      <div>
                        <span
                          className={`${
                            skill.difficulty === 'easy'
                              ? ''
                              : skill.difficulty === 'medium'
                                ? ''
                                : ''
                          }`}
                        >
                          {capitalize(skill.difficulty)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3>设置：</h3>
                <div>
                  <div>
                    属性点池： {generatedWorld.settings.attributePointPool}
                  </div>
                  <div>
                    技能点池： {generatedWorld.settings.skillPointPool}
                  </div>
                  <div>
                    最大属性数： {generatedWorld.settings.maxAttributes}
                  </div>
                  <div>最大技能数： {generatedWorld.settings.maxSkills}</div>
                </div>
              </div>

              <div>
                <button onClick={handleCreateWorld}>创建这个世界</button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Worlds */}
        <div>
          <h2>现有世界</h2>
          <div>
            {Object.values(worlds).map((world) => (
              <div key={world.id}>
                <div>
                  <span>{world.name}</span>
                  <span>({displayLabel(world.genre)})</span>
                </div>
                <div>
                  {world.attributes.length} 项属性， {world.skills.length} 项技能
                </div>
              </div>
            ))}
            {Object.values(worlds).length === 0 && <p>尚未创建世界</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
