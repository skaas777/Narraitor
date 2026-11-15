import { useCharacterStore, type StoreCharacter } from '@/state/characterStore';
import { EntityID } from '@/types/common.types';
import {
  validateText,
  validateSelectionCount,
  ValidationResult
} from '@/lib/utils/validationUtils';
import {
  calculateSkillPointPool,
  getMaxSkillSelections,
  getSkillBounds,
  type SkillRulesWorld,
} from './skillAllocation';

export const isCharacterNameUnique = (name: string, worldId: EntityID): boolean => {
  // Check uniqueness within world
  const state = useCharacterStore.getState();
  const characters = state.characters || {};
  const existingCharacters = (Object.values(characters) as StoreCharacter[]).filter(c => c.worldId === worldId);
  return !existingCharacters.some(c => c.name === name);
};

export const validateAttributes = (
  attributes: Array<{ value: number; maxValue?: number }>,
  totalPoints: number
): ValidationResult => {
  const values = attributes.map(attr => attr.value);
  if (attributes.length === 0) {
    return {
      valid: false,
      errors: ["至少需要分配一项属性。"],
    };
  }

  const pointsSpent = values.reduce((sum, value) => sum + value, 0);
  if (pointsSpent > totalPoints) {
    return {
      valid: false,
      errors: ["分配的属性点已超过可用数量。"],
    };
  }

  return { valid: true, errors: [] };
};

/**
 * Validates the wizard's skill step: selection count against the world's limit,
 * per-skill bounds, and point spend against the pool. Bounds and spend come
 * from skillAllocation so every surface counts them the same way.
 */
export const validateSkills = (
  skills: Array<{
    skillId: EntityID;
    isSelected: boolean;
    level: number;
    name?: string;
    minLevel?: number;
    maxLevel?: number;
  }>,
  skillPointPool: number,
  world: SkillRulesWorld | undefined
): ValidationResult => {
  const selections = skills.map(skill => skill.isSelected);
  const result = validateSelectionCount(selections, {
    minSelections: 1,
    maxSelections: getMaxSkillSelections(world),
    fieldName: '技能'
  });

  const errors = result.errors.map(error =>
    error === '请至少选择 1 个技能' ? "请至少选择一项技能" : error
  );

  const selectedSkills = skills.filter(skill => skill.isSelected);
  selectedSkills.forEach(skill => {
    const { minLevel, maxLevel } = getSkillBounds(skill, world);
    const skillLabel = skill.name || skill.skillId;
    if (maxLevel === minLevel) {
      errors.push(`技能 ${skillLabel} 无法升级，因为其配置中没有可用范围。`);
    }
    if (skill.level < minLevel) {
      errors.push(`技能 ${skillLabel} 低于其最低等级 ${minLevel}。`);
    }
    if (skill.level > maxLevel) {
      errors.push(`技能 ${skillLabel} 超过其最高等级 ${maxLevel}。`);
    }
  });

  const { spent } = calculateSkillPointPool(skills, world, skillPointPool);
  if (skillPointPool >= 0 && spent > skillPointPool) {
    errors.push("分配的技能点超过了可用点数。");
  }

  const uniqueErrors = Array.from(new Set(errors));

  return {
    valid: uniqueErrors.length === 0,
    errors: uniqueErrors
  };
};

export const validateBackground = (background: {
  history: string;
  personality: string;
  goals: string[];
  motivation: string;
}): ValidationResult => {
  const historyValidation = validateText(background.history, {
    minLength: 50,
    fieldName: "角色经历"
  });
  
  const personalityValidation = validateText(background.personality, {
    minLength: 20,
    fieldName: "性格描述"
  });

  const allErrors = [...historyValidation.errors, ...personalityValidation.errors];

  const fieldErrors: Record<string, string> = {};
  if (historyValidation.errors[0]) fieldErrors.history = historyValidation.errors[0];
  if (personalityValidation.errors[0]) fieldErrors.personality = personalityValidation.errors[0];

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    fieldErrors,
  };
};
