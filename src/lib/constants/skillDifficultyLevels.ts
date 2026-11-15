/**
 * skillDifficultyLevels.ts
 *
 * This file defines the difficulty levels for skills in the world creation process.
 * These constants are used throughout the application to maintain consistency
 * in how skill difficulties are displayed and processed.
 */

import type { SkillDifficulty } from '@/types/skill-difficulty.types';

export type { SkillDifficulty } from '@/types/skill-difficulty.types';

export interface SkillDifficultyDescription {
  value: SkillDifficulty;
  label: string;
  description: string;
}

/**
 * Default difficulty level for new skills
 */
export const DEFAULT_SKILL_DIFFICULTY: SkillDifficulty = 'medium';

/**
 * Descriptions for each skill difficulty level
 */
export const SKILL_DIFFICULTIES: SkillDifficultyDescription[] = [
  { 
    value: 'easy', 
    label: "简单",
    description: "易学易用，初学者也能快速上手"
  },
  { 
    value: 'medium', 
    label: "中等",
    description: "需要适度练习才能熟练"
  },
  { 
    value: 'hard', 
    label: "困难",
    description: "需要大量练习和天赋才能掌握"
  }
];
