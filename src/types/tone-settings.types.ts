/**
 * Content rating levels for narrative content
 */
export type ContentRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';

/**
 * Narrative style options for tone control
 */
export type NarrativeStyle = 
  | 'serious' 
  | 'humorous' 
  | 'dramatic' 
  | 'lighthearted' 
  | 'mysterious' 
  | 'action-packed' 
  | 'contemplative' 
  | 'epic'
  | 'balanced';

/**
 * Language complexity levels
 */
export type LanguageComplexity = 'simple' | 'moderate' | 'advanced' | 'literary';

/**
 * Tone settings for narrative generation
 */
export interface ToneSettings {
  /** Content rating that determines mature content filtering */
  contentRating: ContentRating;
  
  /** Overall narrative style and mood */
  narrativeStyle: NarrativeStyle;
  
  /** Language complexity and vocabulary level */
  languageComplexity: LanguageComplexity;
  
  /** Custom instructions for specific tone requirements */
  customInstructions?: string;
}

/**
 * Default tone settings for new worlds
 */
export const DEFAULT_TONE_SETTINGS: ToneSettings = {
  contentRating: 'PG',
  narrativeStyle: 'balanced',
  languageComplexity: 'moderate'
};

/**
 * Content rating descriptions for UI guidance
 */
export const CONTENT_RATING_DESCRIPTIONS: Record<ContentRating, string> = {
  'G': "大众级——无成人内容",
  'PG': "家长指导级——轻度主题与语言",
  'PG-13': "家长强烈警示级——中度主题，含部分暴力内容",
  'R': "限制级——强烈主题、暴力、成人语言",
  'NC-17': "仅限成人——露骨内容、直观主题"
};

/**
 * Narrative style descriptions for UI guidance
 */
export const NARRATIVE_STYLE_DESCRIPTIONS: Record<NarrativeStyle, string> = {
  'serious': "成熟、深思且庄重的叙事风格",
  'humorous': "轻松愉快，带有喜剧元素",
  'dramatic': "紧张激烈、富有情感的故事叙述",
  'lighthearted': "欢快乐观的基调",
  'mysterious': "充满悬念，暗藏隐藏元素",
  'action-packed': "节奏明快，充满刺激桥段",
  'contemplative': "引人反思，富有哲思",
  'epic': "宏大格局，充满英雄主题",
  'balanced': "稳健的叙事风格，随情境调整"
};

/**
 * Language complexity descriptions for UI guidance
 */
export const LANGUAGE_COMPLEXITY_DESCRIPTIONS: Record<LanguageComplexity, string> = {
  'simple': "清晰易懂，适合所有读者",
  'moderate': "标准词汇，带有一定复杂度",
  'advanced': "丰富词汇与复杂句式",
  'literary': "精妙语言，富有艺术表达"
};