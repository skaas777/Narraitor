/**
 * skillLevelDescriptions.ts
 * 
 * This file contains constants and utility functions for skill level descriptions
 * used throughout the application when displaying skill levels to users.
 */

export interface SkillLevelDescription {
  value: number;
  label: string;
  description: string;
}

export const MIN_SKILL_VALUE = 1;
export const MAX_SKILL_VALUE = 5;
export const SKILL_DEFAULT_VALUE = 3;

/**
 * Skill level descriptions for a 1-5 scale, used to provide meaningful
 * feedback when users are setting skill values.
 */
export const SKILL_LEVEL_DESCRIPTIONS: SkillLevelDescription[] = [
  { 
    value: 1, 
    label: "新手",
    description: "初学者水平，技能有限"
  },
  { 
    value: 2, 
    label: "学徒",
    description: "基本熟练，仍有提升空间"
  },
  { 
    value: 3, 
    label: "熟练",
    description: "在大多数情况下表现稳定"
  },
  { 
    value: 4, 
    label: "专家",
    description: "具备高级精通，表现稳定"
  },
  { 
    value: 5, 
    label: "大师",
    description: "达到专业水平的完全精通"
  },
];
