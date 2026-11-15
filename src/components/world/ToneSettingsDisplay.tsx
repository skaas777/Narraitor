'use client';

import React from 'react';
import { displayLabel } from '@/lib/i18n/zhCN';
import { DataField } from '@/components/shared/DataField';
import { ToneSettings } from '@/types/tone-settings.types';
import {
  CONTENT_RATING_DESCRIPTIONS,
  NARRATIVE_STYLE_DESCRIPTIONS,
  LANGUAGE_COMPLEXITY_DESCRIPTIONS,
} from '@/types/tone-settings.types';

interface ToneSettingsDisplayProps {
  toneSettings?: ToneSettings;
}

export function ToneSettingsDisplay({
  toneSettings,
}: ToneSettingsDisplayProps) {
  if (!toneSettings) {
    return null;
  }

  const getContentRatingDisplay = () => {
    const rating = toneSettings.contentRating;
    const description = CONTENT_RATING_DESCRIPTIONS[rating];
    return `${rating} - ${description}`;
  };

  const getNarrativeStyleDisplay = () => {
    const style = toneSettings.narrativeStyle;
    const description = NARRATIVE_STYLE_DESCRIPTIONS[style];
    return `${displayLabel(style)} - ${description}`;
  };

  const getLanguageComplexityDisplay = () => {
    const complexity = toneSettings.languageComplexity;
    const description = LANGUAGE_COMPLEXITY_DESCRIPTIONS[complexity];
    return `${displayLabel(complexity)} - ${description}`;
  };

  return (
    <section
      className="world-detail-section"
      aria-labelledby="tone-settings-heading"
    >
      <h2 id="tone-settings-heading">叙事风格设置</h2>
      <p>
        这些设置决定这个世界的叙事写作方式。
      </p>

      <div className="world-detail-meta-grid">
        <DataField
          label="内容分级"
          value={getContentRatingDisplay()}
          variant="stacked"
        />
        <DataField
          label="叙事风格"
          value={getNarrativeStyleDisplay()}
          variant="stacked"
        />
        <DataField
          label="语言复杂度"
          value={getLanguageComplexityDisplay()}
          variant="stacked"
        />
        {toneSettings.customInstructions && (
          <DataField
            label="自定义指令"
            value={toneSettings.customInstructions}
            variant="stacked"
          />
        )}
      </div>
    </section>
  );
}
