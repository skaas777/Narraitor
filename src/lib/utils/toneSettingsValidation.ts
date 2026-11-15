import { ToneSettings } from '@/types/tone-settings.types';
import { validateFields, createValidationRules } from './wizardValidation';
import type { ValidationResult } from './validationUtils';

const CONTENT_RATINGS: string[] = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
const NARRATIVE_STYLES: string[] = [
  'serious',
  'humorous',
  'dramatic',
  'lighthearted',
  'mysterious',
  'action-packed',
  'contemplative',
  'epic',
  'balanced',
];
const LANGUAGE_COMPLEXITIES: string[] = ['simple', 'moderate', 'advanced', 'literary'];

const MAX_CUSTOM_INSTRUCTIONS_LENGTH = 500;

const validateToneFields = validateFields<Partial<ToneSettings>>({
  contentRating: [
    createValidationRules.required("内容分级为必填项"),
    createValidationRules.custom(
      (value) => CONTENT_RATINGS.includes(value ?? ''),
      "内容分级必须是有效的分级"
    ),
  ],
  narrativeStyle: [
    createValidationRules.required("叙事风格为必填项"),
    createValidationRules.custom(
      (value) => NARRATIVE_STYLES.includes(value ?? ''),
      "叙事风格必须是有效的风格"
    ),
  ],
  languageComplexity: [
    createValidationRules.required("语言复杂度为必填项"),
    createValidationRules.custom(
      (value) => LANGUAGE_COMPLEXITIES.includes(value ?? ''),
      "语言复杂度必须是有效的等级"
    ),
  ],
  customInstructions: [
    createValidationRules.maxLength(
      MAX_CUSTOM_INSTRUCTIONS_LENGTH,
      `自定义指令不得超过 ${MAX_CUSTOM_INSTRUCTIONS_LENGTH} 个字符`
    ),
  ],
});

/**
 * Validates tone settings configuration
 */
export function validateToneSettings(
  toneSettings: Partial<ToneSettings>
): ValidationResult {
  const { valid, errors } = validateToneFields(toneSettings);
  return { valid, errors };
}
