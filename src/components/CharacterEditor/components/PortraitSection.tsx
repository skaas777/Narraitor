import React from 'react';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { ImageGenerationSection } from '@/components/shared';

interface Portrait {
  type: 'ai-generated' | 'placeholder' | 'preset' | 'uploaded';
  url: string | null;
  generatedAt?: string;
  prompt?: string;
}

interface PortraitSectionProps {
  portrait?: Portrait;
  characterName: string;
  generatingPortrait: boolean;
  onGeneratePortrait: (customDescription?: string) => void;
  onRemovePortrait: () => void;
  error?: string | null;
}

export const PortraitSection: React.FC<PortraitSectionProps> = ({
  portrait,
  characterName,
  generatingPortrait,
  onGeneratePortrait,
  onRemovePortrait,
  error = null
}) => {
  return (
    <ImageGenerationSection
      title="角色肖像"
      description="根据此角色详情生成的肖像。"
      currentImageUrl={portrait?.url}
      currentImageType={portrait?.type}
      isGenerating={generatingPortrait}
      onGenerate={onGeneratePortrait}
      onRemove={onRemovePortrait}
      customPromptLabel="自定义用于肖像生成的外貌描述"
      customPromptPlaceholder="描述角色肖像的细节，例如服装、姿势和表情。"
      customPromptHelpText="这会仅覆盖本次肖像生成所用的角色外貌描述。提示：添加“长得像 [演员姓名]”可生成与特定人物相似的肖像。"
      generateButtonText="生成肖像"
      regenerateButtonText="重新生成肖像"
      removeButtonText="移除肖像"
      generateButtonVariant="secondary"
      defaultCustomPromptChecked={false}
      error={error}
      imageComponent={
        <CharacterPortrait
          portrait={portrait || { type: 'placeholder', url: null }}
          characterName={characterName}
          size="large"
        />
      }
    />
  );
};
