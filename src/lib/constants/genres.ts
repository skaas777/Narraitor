/**
 * The single source of truth for available genres — used by UI components,
 * AI generators, and templates throughout the app.
 */

import { capitalize } from '@/lib/utils';
import type { GenreValue } from '@/types/genre.types';

export type { GenreValue } from '@/types/genre.types';

export interface GenreOption {
  value: GenreValue;
  label: string;
  description?: string;
}

/**
 * Complete list of supported genres with their display labels
 */
export const GENRES: GenreOption[] = [
  { value: 'fantasy', label: "奇幻", description: "充满魔法、神话生物与超自然元素的世界" },
  { value: 'sci-fi', label: "科幻", description: "以未来科技和太空探索为背景的科幻故事" },
  { value: 'modern', label: "现代", description: "当代背景与写实情境" },
  { value: 'historical', label: "历史", description: "过去的时代与真实的文化细节" },
  { value: 'horror', label: "恐怖", description: "黑暗恐怖、带有超自然或心理恐惧的场景" },
  { value: 'mystery', label: "悬疑", description: "调查与解谜类叙事" },
  { value: 'western', label: "西部", description: "美国边疆与牛仔冒险" },
  { value: 'cyberpunk', label: "赛博朋克", description: "高科技反乌托邦未来与企业控制" },
  { value: 'other', label: "其他", description: "标准类别未涵盖的自定义或独特类型" },
];

/**
 * Map of genre values to their display labels for quick lookup
 */
export const GENRE_LABELS: Record<string, string> = GENRES.reduce(
  (acc, genre) => ({ ...acc, [genre.value]: genre.label }),
  {}
);

/**
 * Get genre label by value
 */
export function getGenreLabel(value: string): string {
  return GENRE_LABELS[value] || capitalize(value);
}

/**
 * Normalize genre value to standard format
 * Maps common variations to canonical genre values
 */
export function normalizeGenre(value: string): string {
  // Check if it's already a valid genre
  const isValid = GENRES.some(genre => genre.value === value);
  if (isValid) {
    return value;
  }

  // Map common variations to canonical values (only for known alternate names)
  const normalized = value.toLowerCase().trim();
  const commonMappings: Record<string, string> = {
    'science fiction': 'sci-fi',
    'scifi': 'sci-fi',
    'science-fiction': 'sci-fi',
  };

  if (commonMappings[normalized]) {
    return commonMappings[normalized];
  }

  // Convert to lowercase and replace spaces with hyphens as fallback
  const converted = normalized.replace(/\s+/g, '-');

  // Return the converted/normalized value (preserves mixed genres like "cyberpunk-western")
  return converted;
}

/**
 * Coerce arbitrary input into a supported genre value.
 */
export function toGenreValue(value: string, fallback: GenreValue = 'other'): GenreValue {
  const normalized = normalizeGenre(value);
  const isValid = GENRES.some(genre => genre.value === normalized);
  return (isValid ? normalized : fallback) as GenreValue;
}
