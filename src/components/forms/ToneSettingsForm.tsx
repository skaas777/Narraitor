import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ErrorBlock } from '@/components/shared';
import {
  ToneSettings,
  ContentRating,
  NarrativeStyle,
  LanguageComplexity,
  CONTENT_RATING_DESCRIPTIONS,
  NARRATIVE_STYLE_DESCRIPTIONS,
  LANGUAGE_COMPLEXITY_DESCRIPTIONS,
  DEFAULT_TONE_SETTINGS
} from '@/types/tone-settings.types';
import { 
  descriptionsToSelectOptions,
  validateToneSettings 
} from '@/lib/utils';
import { createFormUpdater } from '@/lib/utils/formHelpers';

export interface ToneSettingsFormProps {
  toneSettings?: ToneSettings;
  onToneSettingsChange: (toneSettings: ToneSettings) => void;
  showHeader?: boolean;
}

export const ToneSettingsForm: React.FC<ToneSettingsFormProps> = ({
  toneSettings = DEFAULT_TONE_SETTINGS,
  onToneSettingsChange,
  showHeader = true
}) => {
  // Create form updater utilities
  const formUpdater = createFormUpdater(toneSettings, onToneSettingsChange);
  
  // Convert description objects to select options.
  // Content rating keys (G, PG, PG-13, ...) are already correctly cased —
  // the default titleCase formatter would mangle "PG" into "Pg".
  const contentRatingOptions = descriptionsToSelectOptions(
    CONTENT_RATING_DESCRIPTIONS,
    (key) => key
  );
  const narrativeStyleOptions = descriptionsToSelectOptions(NARRATIVE_STYLE_DESCRIPTIONS);
  const languageComplexityOptions = descriptionsToSelectOptions(LANGUAGE_COMPLEXITY_DESCRIPTIONS);

  // Validation state
  const validationResult = validateToneSettings(toneSettings);

  const handleCustomInstructionsChange = (value: string) => {
    formUpdater.updateField('customInstructions', value === '' ? undefined : value);
  };

  return (
    <div>
      {showHeader && (
        <div>
          <h3>叙事风格设置</h3>
        </div>
      )}
      <div className="component-tone-settings-form">
        {/* Tone Settings Grid */}
        <div className="component-tone-settings-form-grid">
          {/* Content Rating */}
          <div className="form-group">
            <Label htmlFor="content-rating">内容分级</Label>
            <Select
              id="content-rating"
              value={toneSettings.contentRating}
              onChange={(e) => formUpdater.updateField('contentRating', e.target.value as ContentRating)}
              data-tutorial="tone-content-rating"
            >
              {contentRatingOptions.map((option) => (
                <option key={option.value} value={option.value} title={option.description}>
                  {option.label} - {option.description}
                </option>
              ))}
            </Select>
          </div>

          {/* Narrative Style */}
          <div className="form-group">
            <Label htmlFor="narrative-style">叙事风格</Label>
            <Select
              id="narrative-style"
              value={toneSettings.narrativeStyle}
              onChange={(e) => formUpdater.updateField('narrativeStyle', e.target.value as NarrativeStyle)}
              data-tutorial="tone-narrative-style"
            >
              {narrativeStyleOptions.map((option) => (
                <option key={option.value} value={option.value} title={option.description}>
                  {option.label} - {option.description}
                </option>
              ))}
            </Select>
          </div>

          {/* Language Complexity */}
          <div className="form-group">
            <Label htmlFor="language-complexity">语言复杂度</Label>
            <Select
              id="language-complexity"
              value={toneSettings.languageComplexity}
              onChange={(e) => formUpdater.updateField('languageComplexity', e.target.value as LanguageComplexity)}
              data-tutorial="tone-language-complexity"
            >
              {languageComplexityOptions.map((option) => (
                <option key={option.value} value={option.value} title={option.description}>
                  {option.label} - {option.description}
                </option>
              ))}
            </Select>
          </div>

          {/* Custom Instructions */}
          <div className="form-group">
            <Label htmlFor="custom-instructions">自定义指令（可选）</Label>
            <p id="custom-instructions-description" className="form-help-text">添加关于叙事风格、文风或叙事元素的具体说明</p>
            <Textarea
              id="custom-instructions"
              placeholder="输入具体的叙事风格或文风说明……"
              value={toneSettings.customInstructions || ''}
              onChange={(e) => handleCustomInstructionsChange(e.target.value)}
              
              aria-describedby="custom-instructions-description"
              data-tutorial="tone-custom-instructions"
            />
          </div>
        </div>

        {/* Validation Errors */}
        {!validationResult.valid && (
          <ErrorBlock errors={validationResult.errors} />
        )}

      </div>
    </div>
  );
};
