'use client';

import React from 'react';
import { World } from '@/types/world.types';
import { DEFAULT_TONE_SETTINGS } from '@/types/tone-settings.types';
import { ToneSettingsForm } from '@/components/forms/ToneSettingsForm';
import {
  WizardFormGroup,
  WizardTextField,
  WizardSelect,
  WizardFormSection,
} from '@/components/shared/wizard';
import Link from 'next/link';
import { useProviderStore } from '@/state/providerStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GENRES, type GenreValue } from '@/lib/constants/genres';
import { getWorldGuidance } from '@/lib/constants/worldGuidance';

interface BasicInfoStepProps {
  worldData: Partial<World>;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<World>) => void;
}

// Use centralized genre constants
const GENRE_OPTIONS = GENRES;

export default function BasicInfoStep({
  worldData,
  errors,
  onUpdate,
}: BasicInfoStepProps) {
  const combinedErrors = { ...errors };
  const guidance = getWorldGuidance(worldData.genre as GenreValue | undefined);
  const hasConfiguredKey = useProviderStore(
    (s) => Object.keys(s.providers).length > 0
  );

  return (
    <div className="component-basic-info-step" data-testid="basic-info-step">
      {!hasConfiguredKey && (
        <Alert
          variant="info"
          className="component-provider-key-disclosure wizard-byok-disclosure"
          data-testid="provider-key-disclosure"
        >
          <AlertDescription>
            Narraitor 使用你自己的模型服务密钥运行（Google Gemini、OpenAI、OpenRouter，或你自己托管的模型）。密钥仅存储在浏览器中，无需账户。{' '}
            <Link href="/settings/providers">设置模型服务</Link>.
          </AlertDescription>
        </Alert>
      )}

      <WizardFormSection title="世界详情">
        <WizardFormGroup
          label="世界名称（可选）"
          error={combinedErrors.name}
          helpText={guidance.nameExamples.length ? `示例：${guidance.nameExamples.slice(0, 3).join(', ')}` : "选择下方类型以查看名称示例"}
        >
          <WizardTextField
            value={worldData.name || ''}
            onChange={(value) => onUpdate({ ...worldData, name: value })}
            placeholder="输入你的世界名称"
            error={combinedErrors.name}
            testId="world-name-input"
            dataTutorial="world-name"
          />
        </WizardFormGroup>

        <WizardFormGroup
          label="题材"
          required
          helpText={guidance.tagline}
        >
          <WizardSelect
            value={worldData.genre || ''}
            onChange={(value) => onUpdate({ ...worldData, genre: value as GenreValue })}
            options={GENRE_OPTIONS}
            placeholder="选择题材..."
            testId="world-genre-select"
            dataTutorial="genre-picker"
          />
        </WizardFormGroup>

        <div data-tutorial="world-type">
          <WizardFormGroup
            label="世界类型"
            error={combinedErrors.relationship}
            helpText="选择此世界应在多大程度上遵循现有设定。"
          >
            <RadioGroup
              name="world-type"
              value={worldData.relationship || 'original'}
              onValueChange={(val: string) => {
                if (val === 'original') {
                  onUpdate({ ...worldData, relationship: undefined, reference: '' });
                } else {
                  onUpdate({ ...worldData, relationship: val as 'inspired_by' | 'set_within' });
                }
              }}
              className="wizard-radio-group"
            >
              <label className="wizard-radio-option" htmlFor="relationship-none">
                <RadioGroupItem
                  value="original"
                  id="relationship-none"
                  data-testid="relationship-none-radio"
                />
                <div className="wizard-radio-option-text">
                  <span className="wizard-radio-option-title">原创世界</span>
                  <p className="wizard-radio-option-desc">
                    完全凭借想象创造一个原创世界
                  </p>
                </div>
              </label>

              <label className="wizard-radio-option" htmlFor="relationship-based-on">
                <RadioGroupItem
                  value="inspired_by"
                  id="relationship-based-on"
                  data-testid="relationship-based-on-radio"
                />
                <div className="wizard-radio-option-text">
                  <span className="wizard-radio-option-title">灵感来源</span>
                  <p className="wizard-radio-option-desc">
                    受现有虚构宇宙或真实背景启发，创作一个原创世界
                  </p>
                </div>
              </label>

              <label className="wizard-radio-option" htmlFor="relationship-set-in">
                <RadioGroupItem
                  value="set_within"
                  id="relationship-set-in"
                  data-testid="relationship-set-in-radio"
                />
                <div className="wizard-radio-option-text">
                  <span className="wizard-radio-option-title">衍生世界</span>
                  <p className="wizard-radio-option-desc">
                    将你的世界直接置于现有虚构宇宙或真实背景之中
                  </p>
                </div>
              </label>
            </RadioGroup>
          </WizardFormGroup>
        </div>

        {worldData.relationship && (
          <WizardFormGroup
            label="现有设定"
            error={combinedErrors.reference}
            required
            helpText="填写虚构宇宙（例如《星球大战》《被遗忘的国度》）、时代（例如维多利亚时代的伦敦、古罗马）或参考素材。这有助于生成符合叙事风格与正典设定的示例。"
          >
            <WizardTextField
              value={worldData.reference || ''}
              onChange={(value) => onUpdate({ ...worldData, reference: value })}
              placeholder="例如：Star Wars、维多利亚时代的伦敦、古罗马、20世纪60年代的纽约"
              error={combinedErrors.reference}
              testId="world-reference-input"
              dataTutorial="world-reference"
            />
            <div>
              {worldData.relationship === 'set_within'
                ? "输入你的世界所在的虚构宇宙或真实背景。角色和地点将来自这一设定。"
                : "输入将为你的世界提供灵感的虚构宇宙或真实背景。你的世界将拥有主题相似的原创角色和地点。"
              }
            </div>
          </WizardFormGroup>
        )}
      </WizardFormSection>

      <WizardFormSection
        title="叙事设置"
        description="配置你的世界中故事的讲述方式。"
      >
        <ToneSettingsForm
          toneSettings={worldData.toneSettings || DEFAULT_TONE_SETTINGS}
          onToneSettingsChange={(toneSettings) => onUpdate({ ...worldData, toneSettings })}
          showHeader={false}
        />
      </WizardFormSection>
    </div>
  );
}
