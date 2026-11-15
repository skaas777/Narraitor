'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWorldStore } from '@/state/worldStore';
import { useCharacterStore } from '@/state/characterStore';
import { useRouter } from 'next/navigation';
import { GenreValue } from '@/types';
import Logger from '@/lib/utils/logger';

const logger = new Logger('QuickSetup');

/**
 * Quick Setup Button - Generates a test world and character instantly
 */
export const QuickSetup = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { createWorld } = useWorldStore();
  const { createCharacter } = useCharacterStore();

  const handleQuickSetup = async () => {
    try {
      setIsGenerating(true);

      // Create a simple test world
      const worldData = {
        name: '测试世界',
        description: "用于开发的快速测试世界",
        genre: 'fantasy' as GenreValue,
        attributes: [
          {
            id: 'attr-strength',
            worldId: '',
            name: "力量",
            description: '身体力量与耐力',
            baseValue: 10,
            minValue: 1,
            maxValue: 20,
          },
          {
            id: 'attr-intelligence',
            worldId: '',
            name: "智力",
            description: "推理与解决问题",
            baseValue: 10,
            minValue: 1,
            maxValue: 20,
          },
          {
            id: 'attr-charisma',
            worldId: '',
            name: "魅力",
            description: "存在感与说服力",
            baseValue: 10,
            minValue: 1,
            maxValue: 20,
          },
        ],
        skills: [
          {
            id: 'skill-combat',
            worldId: '',
            name: "战斗",
            description: "综合战斗能力",
            difficulty: 'medium' as const,
            attributeIds: ['attr-strength'],
            baseValue: 3,
            minValue: 0,
            maxValue: 10,
          },
          {
            id: 'skill-stealth',
            worldId: '',
            name: "潜行",
            description: "悄无声息地移动",
            difficulty: 'medium' as const,
            attributeIds: ['attr-intelligence'],
            baseValue: 3,
            minValue: 0,
            maxValue: 10,
          },
        ],
        settings: {
          maxAttributes: 3,
          maxSkills: 4,
          attributePointPool: 30,
          skillPointPool: 20,
        },
      };

      const worldId = createWorld(worldData);
      logger.info(`Created world: ${worldId}`);

      // Set as current world
      useWorldStore.getState().setCurrentWorld(worldId);

      // Create a test character
      const characterData = {
        worldId,
        name: '测试角色',
        description: "用于开发的快速测试角色",
        level: 1,
        attributes: [
          {
            id: 'char-attr-strength',
            characterId: '',
            worldAttributeId: 'attr-strength',
            name: "力量",
            baseValue: 10,
            modifiedValue: 10,
            category: 'Physical',
          },
          {
            id: 'char-attr-intelligence',
            characterId: '',
            worldAttributeId: 'attr-intelligence',
            name: "智力",
            baseValue: 10,
            modifiedValue: 10,
            category: 'Mental',
          },
          {
            id: 'char-attr-charisma',
            characterId: '',
            worldAttributeId: 'attr-charisma',
            name: "魅力",
            baseValue: 10,
            modifiedValue: 10,
            category: 'Social',
          },
        ],
        skills: [
          {
            id: 'char-skill-combat',
            characterId: '',
            worldSkillId: 'skill-combat',
            name: "战斗",
            level: 3,
            category: "生成",
          },
        ],
        derivedStats: [],
        background: {
          history: "一名被卷入神秘国度的旅人。",
          personality: "好奇而坚韧。",
          goals: ["寻找答案", "在未知中生存"],
          fears: ["失去控制"],
          physicalDescription: "破旧斗篷，目光专注",
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
      };

      const characterId = createCharacter(characterData);
      logger.info(`Created character: ${characterId}`);

      // Navigate to play page
      router.push(`/worlds/${worldId}/play`);
      logger.info(`Navigating to play session`);

    } catch (error) {
      logger.error('Error during quick setup:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleQuickSetup}
      disabled={isGenerating}
      variant="success"
      size="sm"
    >
      {isGenerating ? "正在生成……" : "⚡ 快速设置（世界 + 角色）"}
    </Button>
  );
};
