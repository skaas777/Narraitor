import React, { useState } from 'react';
import { World } from '@/types/world.types';
import { GeneratedImage } from '@/types/common.types';
import { generateWorldImage } from '@/lib/ai/worldImageGenerator';
import { ImageGenerationSection } from '@/components/shared';
import { WorldImage as WorldImageComponent } from '@/components/WorldImage';
import { getTimestamp } from '@/lib/utils';

interface WorldImageFormProps {
  world: World;
  onChange: (updates: Partial<World>) => void;
}

const WorldImageForm: React.FC<WorldImageFormProps> = ({ world, onChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async (customPrompt?: string) => {
    setIsGenerating(true);

    try {
      const image = await generateWorldImage(world, customPrompt);

      onChange({ image });
    } catch (err) {
      throw err; // Let ImageGenerationSection handle the error display
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveImage = () => {
    const placeholderImage: GeneratedImage = {
      type: 'placeholder',
      url: null,
      generatedAt: getTimestamp()
    };

    onChange({ image: placeholderImage });
  };

  return (
    <ImageGenerationSection
      title="世界图片"
      description="为你的世界生成的环境图像。它会显示在世界卡片上，并作为世界详情页的主图。"
      currentImageUrl={world.image?.url}
      currentImageType={world.image?.type}
      isGenerating={isGenerating}
      onGenerate={handleGenerateImage}
      onRemove={handleRemoveImage}
      customPromptLabel="自定义世界图像生成描述"
      customPromptPlaceholder="描述世界图片中的具体元素，例如景观、建筑和氛围。"
      customPromptHelpText="这将覆盖基于世界详情自动生成的提示词，仅对本次生成生效"
      generateButtonText="生成世界图像"
      regenerateButtonText="重新生成世界图像"
      removeButtonText="移除世界图像"
      generateButtonVariant="secondary"
      imageComponent={
        <WorldImageComponent
          image={world.image || { type: 'placeholder', url: null }}
          worldName={world.name}
          size="large"
        />
      }
    />
  );
};

export default WorldImageForm;
