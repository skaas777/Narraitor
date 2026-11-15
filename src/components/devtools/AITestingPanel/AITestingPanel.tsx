'use client';

import React, { useState } from 'react';
import type { AITestConfig, AIResponse, Character, GenreValue, World } from '@/types';
// Using a mock implementation for testing purposes
import { createTestContext } from '@/lib/ai/contextOverride';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getTimestamp } from '@/lib/utils';
import { GENRES, normalizeGenre } from '@/lib/constants/genres';
import Logger from '@/lib/utils/logger';
import { localizeErrorMessage } from '@/lib/i18n/errors';

const logger = new Logger('AITestingPanel');

interface AITestingPanelProps {
  className?: string;
}

export function AITestingPanel({ className = '' }: AITestingPanelProps) {
  const [testConfig, setTestConfig] = useState<AITestConfig>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toGenreValue = (value: string): GenreValue => {
    const normalized = normalizeGenre(value);
    const isKnownGenre = GENRES.some((genre) => genre.value === normalized);
    return (isKnownGenre ? normalized : 'other') as GenreValue;
  };

  // Mock base data for testing
  const mockWorld: World = {
    id: 'test-world',
    name: '测试世界',
    description: "用于测试的世界",
    genre: 'fantasy',
    attributes: [],
    skills: [],
    settings: {
      maxAttributes: 10,
      maxSkills: 10,
      attributePointPool: 20,
      skillPointPool: 20,
    },
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  };

  const mockCharacter: Character = {
    id: 'test-character',
    name: '测试角色',
    description: "一个测试角色",
    worldId: 'test-world',
    attributes: [],
    skills: [],
    derivedStats: [],
    background: {
      history: "一个没有历史记录的测试角色",
      personality: "爱冒险",
      goals: ["测试系统"],
      fears: ["无"],
      relationships: [],
    },
    inventory: {
      characterId: 'test-character',
      items: [],
      capacity: 10,
      categories: [],
      itemOrder: [],
    },
    status: {
      conditions: [],
      location: "测试区域",
    },
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  };

  const mockNarrativeContext = {
    recentSegments: [],
    activeCharacters: ['test-character'],
    currentLocation: "测试区域",
    activeQuests: [],
    mood: 'neutral',
  };

  const handleWorldNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestConfig((prev) => ({
      ...prev,
      worldOverride: {
        ...prev.worldOverride,
        name: e.target.value,
      },
    }));
  };

  const handleWorldGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestConfig((prev) => ({
      ...prev,
      worldOverride: {
        ...prev.worldOverride,
        genre: toGenreValue(e.target.value),
      },
    }));
  };

  const handleCharacterNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTestConfig((prev) => ({
      ...prev,
      characterOverride: {
        ...prev.characterOverride,
        name: e.target.value,
      },
    }));
  };

  const handleGenerateNarrative = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // Create test context with overrides
      const testContext = createTestContext(
        mockWorld,
        mockCharacter,
        mockNarrativeContext,
        testConfig
      );

      const startTime = Date.now();

      // Add realistic delay to show loading state (1.5-3 seconds)
      const delay = 1500 + Math.random() * 1500;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Generate context-aware narrative text
      const worldName = testContext.world.name;
      const worldTheme = testContext.world.genre;
      const characterName = testContext.character.name;

      const narrativeText = `在${worldTheme?.toLowerCase() || 'mysterious'}的${worldName}世界中，${characterName}站在十字路口。空气中涌动着潜能，古老的力量在你周围蠢动。你的旅程将你引至这个关键时刻，此后每一个决定都会塑造前方的道路。`;

      // Generate context-aware choices based on genre
      const generateChoices = (genre: string = 'Fantasy'): string[] => {
        const baseChoices = [
          `探索前方${genre.toLowerCase()}的景观`,
          `更仔细地观察${worldName}周围的环境`,
          `唤起${characterName}的内在力量`,
        ];

        if (genre.toLowerCase().includes('fantasy')) {
          return [
            "深入魔法森林",
            "寻找古代神庙遗迹",
            "施放法术显现路径",
          ];
        } else if (
          genre.toLowerCase().includes('sci-fi') ||
          genre.toLowerCase().includes('space')
        ) {
          return [
            "用你的科技设备扫描该区域",
            "尝试联系轨道站",
            "调查异常的能量读数",
          ];
        } else if (genre.toLowerCase().includes('steampunk')) {
          return [
            "启动你的机械装置",
            "使用黄铜罗盘导航",
            "修理受损的飞艇引擎",
          ];
        } else {
          return baseChoices;
        }
      };

      // Mock narrative generation for testing purposes
      const response: AIResponse = {
        text: narrativeText,
        choices: generateChoices(worldTheme),
        metadata: { tokens: 150 + Math.floor(Math.random() * 100) },
      };

      const responseTime = Date.now() - startTime;

      logger.debug('Response generated in', responseTime, 'ms');

      setResult(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "发生未知错误";
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`${className}`}>
      <h3>
        AI 测试面板
      </h3>

      {/* World Override Section */}
      <div>
        <h4>
          世界覆盖
        </h4>
        <div>
          <div>
            <label
              htmlFor="world-name"
              
            >
              世界名称：
            </label>
            <Input
              id="world-name"
              type="text"
              value={testConfig.worldOverride?.name || ''}
              onChange={handleWorldNameChange}
              placeholder="输入世界名称"
              
            />
          </div>
          <div>
            <label
              htmlFor="world-genre"
              
            >
              世界类型：
            </label>
            <Input
              id="world-genre"
              type="text"
              value={testConfig.worldOverride?.genre || ''}
              onChange={handleWorldGenreChange}
              placeholder="输入世界类型"
              
            />
          </div>
        </div>
      </div>

      {/* Character Override Section */}
      <div>
        <h4>
          角色覆盖
        </h4>
        <div>
          <label
            htmlFor="character-name"
            
          >
            角色名称：
          </label>
          <Input
            id="character-name"
            type="text"
            value={testConfig.characterOverride?.name || ''}
            onChange={handleCharacterNameChange}
            placeholder="输入角色名称"
            
          />
        </div>
      </div>

      {/* Generate Button */}
      <div>
        <Button
          onClick={handleGenerateNarrative}
          disabled={isGenerating}
          
          variant="default"
        >
          {isGenerating ? "正在生成……" : "生成叙事"}
        </Button>
      </div>

      {/* Results Section */}
      {isGenerating && (
        <div>
          <p>正在生成叙事...</p>
        </div>
      )}

      {error && (
        <div>
          <p>错误： {localizeErrorMessage(error)}</p>
        </div>
      )}

      {result && (
        <div>
          <h4>
            生成结果
          </h4>
          <div>
            <p>{result.text}</p>
          </div>
          {result.choices && result.choices.length > 0 && (
            <div>
              <h5>
                选项：
              </h5>
              <ul>
                {result.choices.map((choice, index) => (
                  <li
                    key={index}
                    
                  >
                    • {choice}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
