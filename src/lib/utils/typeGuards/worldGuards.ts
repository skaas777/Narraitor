// src/lib/utils/typeGuards/worldGuards.ts

import type { ValidationResult } from '@/lib/utils';

/**
 * World validation with detailed error messages.
 * 
 * Validates that an unknown object conforms to the World interface structure.
 * Returns a ValidationResult object containing validation status and detailed error descriptions.
 * Supports both full validation and partial validation for form inputs.
 * 
 * @param obj - The object to validate
 * @param partial - If true, only validates properties that are present (default: false)
 * @returns ValidationResult with `valid` boolean and `errors` array
 */
export function validateWorld(obj: unknown, partial: boolean = false): ValidationResult {
  const errors: string[] = [];

  if (obj === null || obj === undefined) {
    errors.push("世界对象不能为 null 或 undefined");
    return { valid: false, errors };
  }

  if (typeof obj !== 'object') {
    errors.push(`应为对象，实际为 ${typeof obj}`);
    return { valid: false, errors };
  }

  const world = obj as Record<string, unknown>;

  // Required property validation
  if (!partial) {
    if (typeof world.id !== 'string') {
      errors.push("属性“id”必须是字符串");
    }
    if (typeof world.name !== 'string') {
      errors.push("属性“name”必须是字符串");
    }
    if (typeof world.description !== 'string') {
      errors.push("属性“description”必须是字符串");
    }
    if (typeof world.genre !== 'string') {
      errors.push("属性“genre”必须是字符串");
    }
  } else {
    // Partial validation - only check present properties
    if ('id' in world && typeof world.id !== 'string') {
      errors.push("当存在时，属性“id”必须是字符串");
    }
    if ('name' in world && typeof world.name !== 'string') {
      errors.push("当存在时，属性“name”必须是字符串");
    }
    if ('description' in world && typeof world.description !== 'string') {
      errors.push("当存在时，属性“description”必须是字符串");
    }
    if ('genre' in world && typeof world.genre !== 'string') {
      errors.push("字段 “genre” 存在时必须是字符串");
    }
  }

  // For partial validation, only check present properties
  if (!partial) {
    if (!Array.isArray(world.attributes)) {
      errors.push("字段 “attributes” 必须是数组");
    } else {
      world.attributes.forEach((attr: unknown, index: number) => {
        const attrValidation = validateWorldAttribute(attr);
        if (!attrValidation.valid) {
          errors.push(`索引 ${index} 处的 WorldAttribute 无效：${attrValidation.errors.join(', ')}`);
        }
      });
    }

    if (!Array.isArray(world.skills)) {
      errors.push("字段 “skills” 必须是数组");
    } else {
      world.skills.forEach((skill: unknown, index: number) => {
        const skillValidation = validateWorldSkill(skill);
        if (!skillValidation.valid) {
          errors.push(`索引 ${index} 处的 WorldSkill 无效：${skillValidation.errors.join(', ')}`);
        }
      });
    }

    const settingsValidation = validateWorldSettings(world.settings);
    if (!settingsValidation.valid) {
      errors.push(...settingsValidation.errors.map(e => `WorldSettings：${e}`));
    }

    if (typeof world.createdAt !== 'string') {
      errors.push("字段 “createdAt” 必须是字符串");
    }
    if (typeof world.updatedAt !== 'string') {
      errors.push("字段 “updatedAt” 必须是字符串");
    }
  } else {
    // Partial validation - only check present properties
    if ('attributes' in world && !Array.isArray(world.attributes)) {
      errors.push("字段 “attributes” 存在时必须是数组");
    }
    if ('skills' in world && !Array.isArray(world.skills)) {
      errors.push("字段 “skills” 存在时必须是数组");
    }
    if ('settings' in world) {
      const settingsValidation = validateWorldSettings(world.settings, true);
      if (!settingsValidation.valid) {
        errors.push(...settingsValidation.errors.map(e => `WorldSettings：${e}`));
      }
    }
  }

  // Optional property validation
  if (world.image !== undefined && world.image !== null) {
    const imageValidation = validateGeneratedImage(world.image);
    if (!imageValidation.valid) {
      errors.push(...imageValidation.errors.map(e => `GeneratedImage：${e}`));
    }
  }

  if (world.reference !== undefined && typeof world.reference !== 'string') {
    errors.push("字段 “reference” 存在时必须是字符串");
  }

  if (
    world.relationship !== undefined &&
    !(typeof world.relationship === 'string' &&
      ['set_within', 'inspired_by'].includes(world.relationship))
  ) {
    errors.push("字段 “relationship” 存在时必须是 “set_within” 或 “inspired_by”");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Character validation with detailed error messages.
 * 
 * Validates that an unknown object conforms to the Character interface structure.
 * Returns a ValidationResult object containing validation status and detailed error descriptions.
 * Supports both full validation and partial validation for form inputs.
 */
// Domain-specific validation functions

export function validateWorldAttribute(obj: unknown): ValidationResult {
  const errors: string[] = [];

  if (obj === null || obj === undefined) {
    errors.push("WorldAttribute 不能为 null 或 undefined");
    return { valid: false, errors };
  }

  if (typeof obj !== 'object') {
    errors.push(`应为对象，实际为 ${typeof obj}`);
    return { valid: false, errors };
  }

  const attr = obj as Record<string, unknown>;

  // Property validation
  if (typeof attr.id !== 'string') errors.push("属性“id”必须是字符串");
  if (typeof attr.name !== 'string') errors.push("属性“name”必须是字符串");
  if (typeof attr.worldId !== 'string') errors.push("字段 “worldId” 必须是字符串");
  if (typeof attr.description !== 'string') errors.push("属性“description”必须是字符串");
  if (typeof attr.baseValue !== 'number') errors.push("字段 “baseValue” 必须是数字");
  if (typeof attr.minValue !== 'number') errors.push("字段 “minValue” 必须是数字");
  if (typeof attr.maxValue !== 'number') errors.push("字段 “maxValue” 必须是数字");
  
  if (typeof attr.minValue === 'number' && typeof attr.maxValue === 'number' && attr.minValue > attr.maxValue) {
    errors.push("字段 “minValue” 必须小于或等于 “maxValue”");
  }
  
  if (typeof attr.baseValue === 'number' && typeof attr.minValue === 'number' && attr.baseValue < attr.minValue) {
    errors.push("字段 “baseValue” 必须大于或等于 “minValue”");
  }
  
  if (typeof attr.baseValue === 'number' && typeof attr.maxValue === 'number' && attr.baseValue > attr.maxValue) {
    errors.push("字段 “baseValue” 必须小于或等于 “maxValue”");
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorldSkill(obj: unknown): ValidationResult {
  const errors: string[] = [];
  const validDifficulties = ['easy', 'medium', 'hard'];

  if (obj === null || obj === undefined) {
    errors.push("WorldSkill 不能为 null 或 undefined");
    return { valid: false, errors };
  }

  if (typeof obj !== 'object') {
    errors.push(`应为对象，实际为 ${typeof obj}`);
    return { valid: false, errors };
  }

  const skill = obj as Record<string, unknown>;

  if (typeof skill.id !== 'string') errors.push("属性“id”必须是字符串");
  if (typeof skill.name !== 'string') errors.push("属性“name”必须是字符串");
  if (typeof skill.worldId !== 'string') errors.push("字段 “worldId” 必须是字符串");
  if (typeof skill.description !== 'string') errors.push("属性“description”必须是字符串");
  if (typeof skill.difficulty !== 'string' || !validDifficulties.includes(skill.difficulty)) {
    errors.push(`字段 “difficulty” 必须是以下之一：${validDifficulties.join(', ')}`);
  }
  if (typeof skill.baseValue !== 'number') errors.push("字段 “baseValue” 必须是数字");
  if (typeof skill.minValue !== 'number') errors.push("字段 “minValue” 必须是数字");
  if (typeof skill.maxValue !== 'number') errors.push("字段 “maxValue” 必须是数字");
  
  if (typeof skill.minValue === 'number' && typeof skill.maxValue === 'number' && skill.minValue > skill.maxValue) {
    errors.push("字段 “minValue” 必须小于或等于 “maxValue”");
  }
  
  if (skill.attributeIds !== undefined && !Array.isArray(skill.attributeIds)) {
    errors.push("字段 “attributeIds” 存在时必须是数组");
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorldSettings(obj: unknown, partial: boolean = false): ValidationResult {
  const errors: string[] = [];

  if (obj === null || obj === undefined) {
    errors.push("WorldSettings 不能为 null 或 undefined");
    return { valid: false, errors };
  }

  if (typeof obj !== 'object') {
    errors.push(`应为对象，实际为 ${typeof obj}`);
    return { valid: false, errors };
  }

  const settings = obj as Record<string, unknown>;

  if (!partial) {
    if (typeof settings.maxAttributes !== 'number') {
      errors.push("字段 “maxAttributes” 必须是数字");
    } else if (settings.maxAttributes <= 0) {
      errors.push("字段 “maxAttributes” 必须大于 0");
    }

    if (typeof settings.maxSkills !== 'number') {
      errors.push("字段 “maxSkills” 必须是数字");
    } else if (settings.maxSkills <= 0) {
      errors.push("字段 “maxSkills” 必须大于 0");
    }

    if (typeof settings.attributePointPool !== 'number') {
      errors.push("字段 “attributePointPool” 必须是数字");
    } else if (settings.attributePointPool <= 0) {
      errors.push("字段 “attributePointPool” 必须大于 0");
    }

    if (typeof settings.skillPointPool !== 'number') {
      errors.push("字段 “skillPointPool” 必须是数字");
    } else if (settings.skillPointPool <= 0) {
      errors.push("字段 “skillPointPool” 必须大于 0");
    }
  } else {
    // Partial validation - only check present properties
    if ('maxAttributes' in settings) {
      if (typeof settings.maxAttributes !== 'number') {
        errors.push("字段 “maxAttributes” 存在时必须是数字");
      } else if (settings.maxAttributes <= 0) {
        errors.push("字段 “maxAttributes” 必须大于 0");
      }
    }
    
    if ('maxSkills' in settings) {
      if (typeof settings.maxSkills !== 'number') {
        errors.push("字段 “maxSkills” 存在时必须是数字");
      } else if (settings.maxSkills <= 0) {
        errors.push("字段 “maxSkills” 必须大于 0");
      }
    }
    
    if ('attributePointPool' in settings) {
      if (typeof settings.attributePointPool !== 'number') {
        errors.push("字段 “attributePointPool” 存在时必须是数字");
      } else if (settings.attributePointPool <= 0) {
        errors.push("字段 “attributePointPool” 必须大于 0");
      }
    }
    
    if ('skillPointPool' in settings) {
      if (typeof settings.skillPointPool !== 'number') {
        errors.push("字段 “skillPointPool” 存在时必须是数字");
      } else if (settings.skillPointPool <= 0) {
        errors.push("字段 “skillPointPool” 必须大于 0");
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateGeneratedImage(obj: unknown): ValidationResult {
  const errors: string[] = [];
  const validTypes = ['ai-generated', 'placeholder'];

  if (obj === null || obj === undefined) {
    errors.push("GeneratedImage 不能为 null 或 undefined");
    return { valid: false, errors };
  }

  if (typeof obj !== 'object') {
    errors.push(`应为对象，实际为 ${typeof obj}`);
    return { valid: false, errors };
  }

  const image = obj as Record<string, unknown>;

  if (typeof image.type !== 'string' || !validTypes.includes(image.type)) {
    errors.push(`字段 “type” 必须是以下之一：${validTypes.join(', ')}`);
  }

  if (image.url !== null && typeof image.url !== 'string') {
    errors.push("字段 “url” 必须为 null 或字符串");
  }

  if (image.generatedAt !== undefined && typeof image.generatedAt !== 'string') {
    errors.push("字段 “generatedAt” 存在时必须是字符串");
  }

  if (image.prompt !== undefined && typeof image.prompt !== 'string') {
    errors.push("字段 “prompt” 存在时必须是字符串");
  }

  return { valid: errors.length === 0, errors };
}
