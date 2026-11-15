'use client';

import React from 'react';
import { World } from '@/types/world.types';
import {
  WizardFormGroup,
  WizardTextArea,
  WizardFormSection,
} from '@/components/shared/wizard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getWorldGuidance,
  type AIGuidanceSource,
} from '@/lib/constants/worldGuidance';
import { type GenreValue } from '@/lib/constants/genres';
import type {
  AttributeSuggestion,
  SkillSuggestion,
} from '@/types/ai-suggestions.types';

interface AISuggestionState {
  attributes: AttributeSuggestion[];
  skills: SkillSuggestion[];
}

interface DescriptionStepProps {
  worldData: Partial<World>;
  errors: Record<string, string>;
  isProcessing: boolean;
  aiSuggestions?: AISuggestionState;
  suggestionMeta?: {
    source: AIGuidanceSource;
    generatedAt?: string;
    descriptionSnapshot?: string;
  };
  canGenerateSuggestions?: boolean;
  onUpdate: (updates: Partial<World>) => void;
  onGenerateSuggestions: () => Promise<void>;
}

const SUGGESTION_SOURCE_LABELS: Record<AIGuidanceSource, string> = {
  ai: "根据你的描述生成",
  fallback: "使用备用初始建议",
  template: "已从所选模板复制",
  initial: "已从保存的数据加载",
};

export default function DescriptionStep({
  worldData,
  errors,
  isProcessing,
  aiSuggestions,
  suggestionMeta,
  canGenerateSuggestions = true,
  onUpdate,
  onGenerateSuggestions,
}: DescriptionStepProps) {
  const MAX_DESCRIPTION_LENGTH = 3000;
  const description = worldData.description || '';
  const descriptionLength = description.length;
  const genre = worldData.genre as GenreValue | undefined;
  const guidance = getWorldGuidance(genre);

  const hasAISuggestions = Boolean(
    (aiSuggestions?.attributes?.length || 0) > 0 ||
      (aiSuggestions?.skills?.length || 0) > 0
  );

  const descriptionOutdated = Boolean(
    suggestionMeta?.descriptionSnapshot &&
      suggestionMeta.descriptionSnapshot.trim() !== description.trim()
  );

  const meetsAIMinimumLength = descriptionLength >= 50;
  const canTriggerGeneration =
    canGenerateSuggestions && meetsAIMinimumLength && !isProcessing;

  const handleDescriptionChange = (value: string) => {
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      onUpdate({ ...worldData, description: value });
    }
  };

  const renderSuggestionPreview = () => {
    if (!hasAISuggestions) {
      return (
        <div data-testid="ai-suggestion-empty">
          {canGenerateSuggestions
            ? meetsAIMinimumLength
              ? "生成建议以查看根据你的描述定制的示例。"
              : "请至少添加 50 个字符，以便我们在生成建议前了解你的世界。"
            : "建议已根据你选择的模板预先填入。"}
        </div>
      );
    }

    const attributeList = (aiSuggestions?.attributes || []).slice(0, 3);
    const skillList = (aiSuggestions?.skills || []).slice(0, 3);

    return (
      <div className="wizard-suggestion-preview" data-testid="ai-suggestion-preview">
        <div className="wizard-suggestion-preview-group">
          <h4 className="wizard-suggestion-preview-heading">可探索的属性</h4>
          <ul className="wizard-suggestion-preview-list">
            {attributeList.length > 0 ? (
              attributeList.map((attribute, index) => (
                <li
                  key={`${attribute.name}-${index}`}
                  className="wizard-suggestion-item"
                >
                  <span className="wizard-suggestion-item-name">
                    {attribute.name}
                  </span>
                  {attribute.description ? (
                    <span className="wizard-suggestion-item-desc">
                      {attribute.description}
                    </span>
                  ) : null}
                </li>
              ))
            ) : (
              <li>还没有属性建议。</li>
            )}
          </ul>
        </div>
        <div className="wizard-suggestion-preview-group">
          <h4 className="wizard-suggestion-preview-heading">技能灵感</h4>
          <ul className="wizard-suggestion-preview-list">
            {skillList.length > 0 ? (
              skillList.map((skill, index) => (
                <li
                  key={`${skill.name}-${index}`}
                  className="wizard-suggestion-item"
                >
                  <span className="wizard-suggestion-item-name">
                    {skill.name}
                  </span>
                  {skill.description ? (
                    <span className="wizard-suggestion-item-desc">
                      {skill.description}
                    </span>
                  ) : null}
                </li>
              ))
            ) : (
              <li>还没有技能建议。</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div data-testid="description-step">
      <WizardFormSection
        title="描述你的世界"
        description="描述你的世界背景、叙事风格和主要主题。这将影响我们建议的属性和技能。"
      >
        <WizardFormGroup
          label="完整描述"
          error={errors.description}
          required
          helpText={guidance.descriptionPrompt}
        >
          <WizardTextArea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="详细描述你的世界……"
            rows={12}
            error={errors.description}
            disabled={isProcessing}
            testId="world-full-description"
            dataTutorial="world-description"
          />
          <div data-testid="description-char-count">
            {descriptionLength} / {MAX_DESCRIPTION_LENGTH} 个字符
          </div>
        </WizardFormGroup>
      </WizardFormSection>

      <WizardFormSection
        title="属性与技能建议"
        description="根据你的世界描述给出的属性与技能建议。"
      >
        <div className="wizard-suggestion-section">
          <div className="wizard-suggestion-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void onGenerateSuggestions();
              }}
              disabled={!canTriggerGeneration}
              data-testid="generate-ai-suggestions"
              data-tutorial="ai-suggestions-actions"
            >
              {isProcessing
                ? "正在分析描述……"
                : hasAISuggestions
                  ? "重新生成建议"
                  : "生成建议"}
            </Button>
            {hasAISuggestions && suggestionMeta?.source && (
              <span className="wizard-suggestion-hint">
                {SUGGESTION_SOURCE_LABELS[suggestionMeta.source]}
              </span>
            )}
          </div>

          {errors.ai && (
            <Alert
              variant="warning"
              data-testid="ai-warning"
              aria-live="polite"
            >
              <AlertDescription>{errors.ai}</AlertDescription>
            </Alert>
          )}

          {descriptionOutdated && (
            <Alert
              variant="warning"
              data-testid="ai-description-outdated"
              aria-live="polite"
            >
              <AlertDescription>
                自上次生成后，你的描述已发生变化。请重新生成建议以保持一致。
              </AlertDescription>
            </Alert>
          )}

          <div data-tutorial="ai-suggestions-preview">
            {renderSuggestionPreview()}
          </div>
        </div>
      </WizardFormSection>

      {isProcessing && (
        <div data-testid="processing-overlay">
          <div>
            <div role="status">
              <span>加载中……</span>
            </div>
            <p aria-live="polite">正在分析你的世界描述……</p>
          </div>
        </div>
      )}
    </div>
  );
}
