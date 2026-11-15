import { validateToneSettings } from '../toneSettingsValidation';
import { DEFAULT_TONE_SETTINGS } from '@/types/tone-settings.types';

describe('validateToneSettings', () => {
  it('accepts the default tone settings', () => {
    expect(validateToneSettings(DEFAULT_TONE_SETTINGS)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it('reports one error per missing required field', () => {
    const result = validateToneSettings({});

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      "内容分级为必填项",
      "叙事风格为必填项",
      "语言复杂度为必填项",
    ]);
  });

  it('rejects values outside the allowed sets', () => {
    const result = validateToneSettings({
      ...DEFAULT_TONE_SETTINGS,
      contentRating: 'X' as never,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(["内容分级必须是有效的分级"]);
  });

  it('caps custom instructions but leaves them optional', () => {
    expect(validateToneSettings(DEFAULT_TONE_SETTINGS).valid).toBe(true);

    const result = validateToneSettings({
      ...DEFAULT_TONE_SETTINGS,
      customInstructions: 'a'.repeat(501),
    });

    expect(result.errors).toEqual([
      "自定义指令不得超过 500 个字符",
    ]);
  });
});
