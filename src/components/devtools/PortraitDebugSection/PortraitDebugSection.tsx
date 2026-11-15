// src/components/devtools/PortraitDebugSection/PortraitDebugSection.tsx

import React, { useState } from 'react';
import Image from 'next/image';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import {
  useCharacterStore,
  type StoreCharacter,
  type CharacterAttribute,
  type CharacterSkill,
  type CharacterStore,
} from '@/state/characterStore';
import { useWorldStore } from '@/state/worldStore';
import { PromptBreakdown } from './PromptBreakdown';
import { Character } from '@/types/character.types';
import { World } from '@/types/world.types';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getTimestamp } from '@/lib/utils';
import { generatePortrait } from '@/lib/api/generatePortrait';
import Logger from '@/lib/utils/logger';

const logger = new Logger('PortraitDebug');

interface PortraitDebugSectionProps {
  characterData?: Partial<Character>;
  worldConfig?: Partial<World>;
}

export function PortraitDebugSection({
  characterData,
  worldConfig,
}: PortraitDebugSectionProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(
    null
  );
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Get characters from store
  const characters = useCharacterStore((state: CharacterStore) => state.characters);
  const charactersArray = Object.values(characters) as StoreCharacter[];
  const selectedCharacter = selectedCharacterId
    ? characters[selectedCharacterId]
    : null;

  // Get worlds from store
  const worlds = useWorldStore((state) => state.worlds);
  const selectedWorld = selectedCharacter
    ? worlds[selectedCharacter.worldId]
    : null;

  // Use selected character data or passed props. Widened to Partial<StoreCharacter>
  // because the prop's Character type (from @/types) lacks store-only fields like
  // `level` / `isPlayer` that the mock builder reads with || fallbacks.
  const effectiveCharacterData = (selectedCharacter || characterData) as
    | Partial<StoreCharacter>
    | undefined;
  const effectiveWorldConfig = selectedWorld || worldConfig;

  /**
   * Creates a mock character object for API calls, centralizing the logic
   * to avoid duplication between different generation methods
   */
  const createMockCharacter = (id: string): StoreCharacter => {
    if (!effectiveCharacterData) {
      throw new Error("没有可用的角色数据");
    }

    // Handle the different attribute/skill formats between store and types
    type AnyAttribute = {
      id?: string;
      attributeId?: string;
      value?: number;
      baseValue?: number;
    };
    type AnySkill = {
      id?: string;
      skillId?: string;
      level?: number;
      experience?: number;
      isActive?: boolean;
    };

    // The mock shape below intentionally diverges from CharacterAttribute /
    // CharacterSkill — downstream portrait generation duck-types on these
    // loose fields. Cast at the boundary to satisfy the StoreCharacter return
    // without rewriting the mock builder.
    const mockAttributes = (effectiveCharacterData.attributes?.map(
      (attr: AnyAttribute) => ({
        attributeId: attr.attributeId || attr.id || 'attr-1',
        value: attr.value || attr.baseValue || 10,
      }),
    ) || []) as unknown as CharacterAttribute[];

    const mockSkills = (effectiveCharacterData.skills?.map(
      (skill: AnySkill) => ({
        skillId: skill.skillId || skill.id || 'skill-1',
        level: skill.level || 1,
        experience: skill.experience || 0,
        isActive: skill.isActive !== undefined ? skill.isActive : true,
      }),
    ) || []) as unknown as CharacterSkill[];

    return {
      id,
      name: effectiveCharacterData.name || "测试角色",
      description: '',
      worldId: effectiveCharacterData.worldId || 'world-1',
      level: effectiveCharacterData.level || 1,
      isPlayer: effectiveCharacterData.isPlayer || false,
      attributes: mockAttributes,
      skills: mockSkills,
      derivedStats: [],
      background: {
        history: effectiveCharacterData.background?.history || '',
        personality: effectiveCharacterData.background?.personality || '',
        goals: effectiveCharacterData.background?.goals || [],
        fears: effectiveCharacterData.background?.fears || [],
        relationships: effectiveCharacterData.background?.relationships || [],
      },
      inventory: {
        items: [],
        capacity: 100,
        categories: [],
        characterId: id,
        itemOrder: [],
      },
      status: {
        conditions: effectiveCharacterData.status?.conditions || [],
      },
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
    };
  };

  const generatePromptPreview = async () => {
    logger.debug('generatePromptPreview called');
    if (!effectiveCharacterData) {
      logger.debug('No effective character data');
      setGeneratedPrompt(
        "没有可用的角色数据。请选择角色或提供角色数据。"
      );
      return;
    }

    logger.debug('Starting prompt generation with API...');
    try {
      const mockCharacter = createMockCharacter('preview');

      // Use the server-side API for portrait generation to include character detection
      const requestBody = {
        character: mockCharacter,
        world: effectiveWorldConfig,
        customDescription: effectiveCharacterData.background?.physicalDescription,
        promptOnly: true, // Add a flag to return only the prompt
      };

      logger.debug('Calling API with character:', mockCharacter.name);
      logger.debug('Custom description:', requestBody.customDescription);
      logger.debug('Request body:', requestBody);
      logger.debug('promptOnly flag:', requestBody.promptOnly);

      const result = await generatePortrait(requestBody);
      logger.debug('API response result:', result);
      const prompt = result.prompt || result.portrait?.prompt;
      logger.debug('Extracted prompt:', prompt);

      setGeneratedPrompt(prompt ?? '');
      logger.debug('Prompt set successfully');
    } catch (error) {
      setGeneratedPrompt(
        `生成提示词时出错：${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  };

  const testPromptGeneration = async () => {
    if (!effectiveCharacterData) return;

    setIsGenerating(true);
    try {
      // Same request the preview button sends, minus promptOnly, so what this
      // panel exercises is the route the app itself uses for portraits.
      const { portrait } = await generatePortrait({
        character: createMockCharacter('test'),
        world: effectiveWorldConfig,
        customDescription: effectiveCharacterData.background?.physicalDescription,
      });

      setLastGeneratedImage(portrait?.url ?? null);
      setGeneratedPrompt(portrait?.prompt || "未返回提示词");
    } catch (error) {
      setGeneratedPrompt(
        `生成失败：${error instanceof Error ? error.message : "未知错误"}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  return (
    <CollapsibleSection
      title="肖像生成调试"
      initialCollapsed={true}
    >
      <div>
        {/* Character Selector */}
        {charactersArray.length > 0 && (
          <div>
            <label>
              选择角色：
            </label>
            <Select
              value={selectedCharacterId}
              onChange={(e) => setSelectedCharacterId(e.target.value)}
              
            >
              <option value="">-- 选择一个角色 --</option>
              {charactersArray.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name} （等级{' '}
                  {'level' in char
                    ? (char as { level?: number }).level || 1
                    : 1}
                  )
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Character Info Summary */}
        {effectiveCharacterData && (
          <div>
            <h4>
              角色概要
            </h4>
            <div>
              <div>
                <strong>名称：</strong>{' '}
                {effectiveCharacterData.name || "未设置"}
              </div>
              <div>
                <strong>世界类型：</strong>{' '}
                {effectiveWorldConfig?.genre || "未设置"}
              </div>
              <div>
                <strong>属性：</strong>{' '}
                {effectiveCharacterData.attributes?.length || 0}
              </div>
              <div>
                <strong>技能：</strong>{' '}
                {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  effectiveCharacterData.skills?.filter((s: any) =>
                    'isSelected' in s ? s.isSelected : true
                  )?.length ||
                    effectiveCharacterData.skills?.length ||
                    0
                }
              </div>
              <div>
                <strong>背景：</strong>{' '}
                {effectiveCharacterData.background?.personality
                  ? "已设置"
                  : "未设置"}
              </div>
            </div>
          </div>
        )}

        {/* Prompt Generation */}
        <div>
          <div>
            <Button
              onClick={generatePromptPreview}
              
              size="sm"
              variant="default"
              disabled={!effectiveCharacterData}
            >
              生成提示词预览
            </Button>
            <Button
              onClick={testPromptGeneration}
              
              size="sm"
              variant="default"
              disabled={!effectiveCharacterData || isGenerating}
            >
              {isGenerating ? "正在生成……" : "测试完整生成"}
            </Button>
            {generatedPrompt && (
              <>
                <Button
                  onClick={copyPromptToClipboard}
                  
                  size="sm"
                  variant="default"
                >
                  复制提示词
                </Button>
                <Button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  
                  size="sm"
                  variant="default"
                >
                  {showBreakdown ? "隐藏" : "显示"} 详情
                </Button>
              </>
            )}
          </div>

          {generatedPrompt && (
            <div>
              <h4>
                生成的提示词：
              </h4>
              <pre>
                {generatedPrompt}
              </pre>
            </div>
          )}
        </div>

        {/* Prompt Breakdown */}
        {showBreakdown && generatedPrompt && (
          <PromptBreakdown
            characterData={
              effectiveCharacterData as Partial<Character> | undefined
            }
            worldConfig={effectiveWorldConfig}
            prompt={generatedPrompt}
          />
        )}

        {/* Last Generated Image */}
        {lastGeneratedImage && (
          <div>
            <h4>
              上次生成的图像：
            </h4>
            <div>
              <Image
                src={lastGeneratedImage}
                alt="生成的头像"
                fill
                
                unoptimized // For base64 data URLs
              />
            </div>
          </div>
        )}

        {/* Prompt Building Tips */}
        <div>
          <h4>
            提示词构建技巧：
          </h4>
          <ul>
            <li>角色名称会自动包含</li>
            <li>性格特征会影响外貌描述</li>
            <li>技能决定角色职业（战士、法师等）</li>
            <li>世界主题会影响艺术风格</li>
            <li>背景历史会补充上下文</li>
          </ul>
        </div>

        {/* API Debug Info */}
        <div>
          <h4>API 调试信息：</h4>
          <div>
            <div>
              <strong>接口地址：</strong> /api/generate-portrait
            </div>
            <div>
              <strong>模型：</strong> gemini-2.0-flash-preview-image-generation
            </div>
            <div>
              <strong>安全性：</strong> 服务端 API 密钥（安全）
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
