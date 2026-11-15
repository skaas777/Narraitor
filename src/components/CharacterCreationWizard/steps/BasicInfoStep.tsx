import React from 'react';
import { CharacterPortraitPlaceholder } from '../components/CharacterPortraitPlaceholder';
import { CharacterSuggestions } from '../components/CharacterSuggestions';
import { WizardFormSection } from '@/components/shared/wizard';
import { ErrorBlock } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { World } from '@/types/world.types';
import { CharacterCreationData } from '@/hooks/useCharacterCreationWizard';
import type { WizardValidation } from '@/hooks/useWizardState';

interface CharacterWizardData {
  characterData: CharacterCreationData;
  validation: {
    [stepNumber: number]: {
      valid: boolean;
      touched: boolean;
      errors: string[];
    };
  };
}

interface BasicInfoStepProps {
  data: CharacterWizardData;
  onUpdate: (updates: Partial<CharacterCreationData>) => void;
  onValidation: (valid: boolean, errors: string[]) => void;
  validateStep: () => WizardValidation;
  worldConfig?: World;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  data,
  onUpdate,
  onValidation,
  validateStep,
  worldConfig,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ description: e.target.value });
  };

  const handlePhysicalDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ 
      background: {
        ...data.characterData.background,
        physicalDescription: e.target.value
      }
    });
  };


  const handleBlur = () => {
    const result = validateStep();
    onValidation(result.valid, result.errors);
  };

  const validation = data.validation[0];
  const showErrors = validation?.touched && !validation?.valid;

  return (
    <div className="component-basic-info-step">
      <WizardFormSection title="基本信息">
      <div className="component-basic-info-layout">
        {/* Portrait placeholder */}
        <div>
          <CharacterPortraitPlaceholder name={data.characterData.name} />
        </div>

        {/* Form fields */}
        <div className="component-basic-info-fields" data-tutorial="basic-info">
          <div>
            <Label htmlFor="character-name">
              角色名称 <span>*</span>
            </Label>
            <Input
              id="character-name"
              type="text"
              value={data.characterData.name}
              onChange={handleNameChange}
              onBlur={handleBlur}
              maxLength={50}
              placeholder="输入角色名称"
            />
            <p className="form-help-text">
              长度在 2 到 50 个字符之间，且在本世界中唯一。
            </p>
          </div>

          <div>
            <Label htmlFor="character-description">
              描述（可选）
            </Label>
            <Textarea
              id="character-description"
              value={data.characterData.description}
              onChange={handleDescriptionChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="描述你角色的身份和背景"
            />
          </div>

          {worldConfig && (
            <CharacterSuggestions
              world={worldConfig}
              concept={data.characterData.description}
              characterData={data.characterData}
              onAdopt={onUpdate}
            />
          )}

          <div>
            <Label htmlFor="physical-description">
              外貌描述（可选）
            </Label>
            <Textarea
              id="physical-description"
              value={data.characterData.background?.physicalDescription || ''}
              onChange={handlePhysicalDescriptionChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="描述你角色的外貌（例如：高大健壮、银发、蓝眼、身穿皮甲）"
            />
            <p className="form-help-text">
              这将用于生成你角色的肖像。提示：添加“长得像 [演员名]”即可生成与特定人物相似的肖像。
            </p>
          </div>

        </div>
      </div>

      {/* Validation errors */}
      {showErrors && (
        <ErrorBlock errors={validation.errors} />
      )}
      </WizardFormSection>
    </div>
  );
};
