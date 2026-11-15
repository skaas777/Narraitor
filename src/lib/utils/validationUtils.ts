/**
 * Minimal validation utilities
 * Simple, focused functions for common validation scenarios
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  /** Optional first error message per field name, for touched-field display filtering. */
  fieldErrors?: Record<string, string>;
}

/**
 * Validates that a text field meets minimum requirements
 */
export function validateText(text: string, options?: {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  fieldName?: string;
}): ValidationResult {
  const {
    minLength = 0,
    maxLength = 1000,
    required = true,
    fieldName = "字段"
  } = options || {};

  const errors: string[] = [];
  const trimmedText = text?.trim() || '';

  if (required && !trimmedText) {
    errors.push(`${fieldName}为必填项`);
  } else if (trimmedText) {
    if (minLength > 0 && trimmedText.length < minLength) {
      errors.push(`${fieldName}至少需要 ${minLength} 个字符`);
    }
    if (trimmedText.length > maxLength) {
      errors.push(`${fieldName}必须少于 ${maxLength} 个字符`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates that a selection count is within acceptable range
 */
export function validateSelectionCount(
  selections: boolean[],
  options?: {
    minSelections?: number;
    maxSelections?: number;
    fieldName?: string;
  }
): ValidationResult {
  const {
    minSelections = 1,
    maxSelections = Infinity,
    fieldName = 'items'
  } = options || {};

  const errors: string[] = [];
  const selectedCount = selections.filter(Boolean).length;

  if (selectedCount < minSelections) {
    errors.push(`请至少选择 ${minSelections} 个${fieldName}`);
  }
  if (maxSelections !== Infinity && selectedCount > maxSelections) {
    errors.push(`最多只能选择 ${maxSelections} 个${fieldName}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
