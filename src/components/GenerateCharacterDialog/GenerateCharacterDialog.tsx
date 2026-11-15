import React from 'react';
import { ActionButtonGroup } from '@/components/shared/ActionButtonGroup';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoadingState } from '@/components/ui/LoadingState';
import { SimpleModal } from '@/components/shared/SimpleModal';
import { safeTrim } from '@/lib/utils';
import './GenerateCharacterDialog.css';
import { localizeErrorMessage } from '@/lib/i18n/errors';

interface GenerateCharacterDialogProps {
  isOpen: boolean;
  isGenerating: boolean;
  generatingStatus: string;
  characterName: string;
  generationType: 'known' | 'original' | 'specific';
  worldName: string;
  error: string | null;
  onClose: () => void;
  onGenerate: () => void;
  onCharacterNameChange: (name: string) => void;
  onGenerationTypeChange: (type: 'known' | 'original' | 'specific') => void;
}

const GENERATION_TYPE_OPTIONS: Array<{
  value: 'known' | 'original' | 'specific';
  label: string;
  description: (worldName: string) => string;
}> = [
  {
    value: 'known',
    label: "知名人物",
    description: (worldName) => `根据 ${worldName} 生成一位重要角色`,
  },
  {
    value: 'original',
    label: "原创角色",
    description: () => "创建一个符合世界设定的独特角色",
  },
  {
    value: 'specific',
    label: "特定知名人物",
    description: (worldName) => `根据 ${worldName} 的设定生成一个特定角色`,
  },
];

export const GenerateCharacterDialog: React.FC<
  GenerateCharacterDialogProps
> = ({
  isOpen,
  isGenerating,
  generatingStatus,
  characterName,
  generationType,
  worldName,
  error,
  onClose,
  onGenerate,
  onCharacterNameChange,
  onGenerationTypeChange,
}) => {
  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="生成角色"
      showCloseButton={false}
      ariaDescribedBy="generate-character-desc"
      footer={
        <ActionButtonGroup
          layout="horizontal"
          gap="md"
          actions={[
            {
              label: "取消",
              onClick: onClose,
              variant: 'secondary',
              disabled: isGenerating,
            },
            {
              label: isGenerating ? "正在生成……" : "生成",
              onClick: onGenerate,
              variant: 'primary',
              disabled:
                isGenerating ||
                (generationType === 'specific' && !safeTrim(characterName)),
              flex: true,
            },
          ]}
        />
      }
    >
      <div className="component-generate-character-dialog">
        <p id="generate-character-desc" className="form-help-text">
          选择要为你的故事生成的角色类型。
        </p>

        {/* Generation Type Selection */}
        <div className="generate-character-field">
          <Label>你想创建哪种类型的角色？</Label>
          <RadioGroup
            value={generationType}
            onValueChange={(value) =>
              onGenerationTypeChange(value as 'known' | 'original' | 'specific')
            }
            disabled={isGenerating}
          >
            {GENERATION_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="generate-character-option">
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="generate-character-option-text">
                  <div className="generate-character-option-label">
                    {option.label}
                  </div>
                  <div className="generate-character-option-description">
                    {option.description(worldName)}
                  </div>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Name Input (only shown for specific type) */}
        {generationType === 'specific' && (
          <div className="generate-character-field">
            <Label htmlFor="generate-character-name">
              角色名称 <span>*</span>
            </Label>
            <Input
              id="generate-character-name"
              type="text"
              value={characterName}
              onChange={(e) => onCharacterNameChange(e.target.value)}
              placeholder="例如：Aragorn、Princess Leia、Sherlock Holmes……"
              disabled={isGenerating}
            />
            <p className="form-help-text">
              输入一个来自 {worldName} 设定中的知名角色名称
            </p>
          </div>
        )}

        {error && <div className="form-error">{localizeErrorMessage(error)}</div>}

        {isGenerating && (
          <div className="generate-character-status">
            <LoadingState variant="spinner" size="sm" />
            <span>{generatingStatus}</span>
          </div>
        )}
      </div>
    </SimpleModal>
  );
};
