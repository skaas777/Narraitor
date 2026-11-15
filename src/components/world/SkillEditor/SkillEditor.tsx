import React, { useState, useEffect } from 'react';
import { WorldSkill, WorldAttribute } from '@/types/world.types';
import { EntityID } from '@/types/common.types';
import { generateUniqueId } from '@/lib/utils/generateId';
// SkillDifficulty type used in WorldSkill interface
import { DEFAULT_SKILL_DIFFICULTY } from '@/lib/constants/skillDifficultyLevels';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SkillPrerequisitesEditor from '@/components/forms/SkillPrerequisitesEditor';
import { localizeErrorMessage } from '@/lib/i18n/errors';

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

export interface SkillEditorProps {
  worldId: EntityID;
  mode: 'create' | 'edit';
  skillId?: EntityID;
  onSave: (skill: WorldSkill) => void;
  onDelete?: (skillId: EntityID) => void;
  onCancel: () => void;
  existingSkills?: WorldSkill[];
  existingAttributes: WorldAttribute[];
  maxSkills?: number;
}

/**
 * SkillEditor - Create and edit skills with multi-attribute linking capabilities
 *
 * This component implements the multi-attribute skill linking system.
 * Skills can now be linked to multiple attributes using a checkbox interface
 * instead of the previous single-attribute dropdown.
 *
 * Features:
 * - Create/Edit mode support
 * - Multi-attribute selection via checkboxes
 * - Form validation with user-friendly error messages
 * - Delete confirmation dialog
 * - Duplicate name prevention
 * - Skill count limits enforcement
 *
 * Data Format:
 * - Uses `attributeIds: EntityID[]` for multi-attribute linking
 * - Replaces deprecated `linkedAttributeId: EntityID` single-attribute format
 *
 * @param worldId - ID of the world this skill belongs to
 * @param mode - 'create' for new skills, 'edit' for existing skills
 * @param skillId - Required when mode is 'edit'
 * @param onSave - Callback when skill is saved successfully
 * @param onDelete - Optional callback when skill is deleted
 * @param onCancel - Callback when operation is cancelled
 * @param existingSkills - Array of existing skills for validation
 * @param existingAttributes - Array of attributes available for linking
 * @param maxSkills - Optional limit on total number of skills
 */
export function SkillEditor({
  worldId,
  mode,
  skillId,
  onSave,
  onDelete,
  onCancel,
  existingSkills = [],
  existingAttributes,
  maxSkills,
}: SkillEditorProps) {
  const [formData, setFormData] = useState<Partial<WorldSkill>>({
    name: '',
    description: '',
    attributeIds: [],
    attributePrerequisites: [],
    difficulty: DEFAULT_SKILL_DIFFICULTY,
    baseValue: 5,
    minValue: 1,
    maxValue: 10,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load existing skill data in edit mode
  useEffect(() => {
    if (mode === 'edit' && skillId) {
      const existingSkill = existingSkills.find(
        (skill) => skill.id === skillId
      );
      if (existingSkill) {
        setFormData({
          ...existingSkill,
          attributeIds: existingSkill.attributeIds || [],
          attributePrerequisites: existingSkill.attributePrerequisites || [],
        });
      }
    }
  }, [mode, skillId, existingSkills]);

  // Clear errors when form data changes
  useEffect(() => {
    if (errors.length > 0) {
      const newErrors = validateForm();
      setErrors(newErrors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.name,
    formData.description,
    formData.attributeIds,
    errors.length,
    existingSkills,
    mode,
    skillId,
  ]);

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];
    const trimmedName = formData.name?.trim() || '';
    const trimmedDescription = formData.description?.trim() || '';

    // Required field validation
    if (!trimmedName) {
      validationErrors.push("技能名称不能为空");
    }

    if (!trimmedDescription) {
      validationErrors.push("描述不能为空");
    }

    // Length validation
    if (trimmedName.length > MAX_NAME_LENGTH) {
      validationErrors.push(`技能名称不能超过 ${MAX_NAME_LENGTH} 个字符`);
    }

    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      validationErrors.push(`描述不能超过 ${MAX_DESCRIPTION_LENGTH} 个字符`);
    }

    // Duplicate name validation (only for create mode or different skill in edit mode)
    if (trimmedName) {
      const isDuplicate = existingSkills.some(
        (skill) =>
          skill.name.toLowerCase() === trimmedName.toLowerCase() &&
          (mode === 'create' || skill.id !== skillId)
      );
      if (isDuplicate) {
        validationErrors.push(`技能名称“${trimmedName}”已存在`);
      }
    }

    // Attribute selection validation
    if (!formData.attributeIds || (formData.attributeIds?.length || 0) === 0) {
      validationErrors.push("至少需要选择一个属性");
    }

    return validationErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const trimmedName = formData.name?.trim() || '';
    const trimmedDescription = formData.description?.trim() || '';

    const skillData: WorldSkill = {
      id: mode === 'edit' ? skillId! : generateUniqueId(),
      name: trimmedName,
      description: trimmedDescription,
      worldId,
      attributeIds: formData.attributeIds || [],
      attributePrerequisites: formData.attributePrerequisites || [],
      difficulty: formData.difficulty || DEFAULT_SKILL_DIFFICULTY,
      baseValue: formData.baseValue || 5,
      minValue: formData.minValue || 1,
      maxValue: formData.maxValue || 10,
    };

    onSave(skillData);
  };

  const handleAttributeToggle = (attributeId: EntityID) => {
    const currentAttributeIds = formData.attributeIds || [];
    const isSelected = currentAttributeIds.includes(attributeId);

    let newAttributeIds: EntityID[];
    if (isSelected) {
      newAttributeIds = currentAttributeIds.filter((id) => id !== attributeId);
    } else {
      newAttributeIds = [...currentAttributeIds, attributeId];
    }

    setFormData((prev) => ({
      ...prev,
      attributeIds: newAttributeIds,
    }));
  };

  const handleDelete = () => {
    if (onDelete && skillId) {
      onDelete(skillId);
    }
  };

  // Check if we're at the maximum number of skills
  const isAtMaxSkills =
    maxSkills !== undefined && existingSkills.length >= maxSkills;
  const canCreateSkill = mode === 'edit' || !isAtMaxSkills;

  return (
    <div>
      <div>
        <h2>{mode === 'create' ? "创建新技能" : "编辑技能"}</h2>
      </div>

      {mode === 'create' && isAtMaxSkills && (
        <div>
          <p>
            技能数量已达上限（{maxSkills}）。你无法再为此世界创建更多技能。
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div>
          {errors.map((error, index) => (
            <div key={index} role="alert">
              {localizeErrorMessage(error)}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} role="form">
        <div>
          <div>
            <Label htmlFor="skill-name">
              技能名称 <span>*</span>
            </Label>
            <Input
              id="skill-name"
              type="text"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="输入技能名称"
              disabled={!canCreateSkill}
            />
          </div>

          <div>
            <Label htmlFor="skill-description">
              描述 <span>*</span>
            </Label>
            <Textarea
              id="skill-description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="描述此技能代表什么"
              disabled={!canCreateSkill}
              rows={3}
            />
          </div>

          <div>
            <Label>关联属性</Label>
            <p>选择此技能所依据的一个或多个属性</p>
            <div>
              {existingAttributes.map((attribute) => (
                <div key={attribute.id}>
                  <Checkbox
                    id={`attribute-${attribute.id}`}
                    checked={
                      formData.attributeIds?.includes(attribute.id) || false
                    }
                    onChange={() => handleAttributeToggle(attribute.id)}
                    disabled={!canCreateSkill}
                  />
                  <Label htmlFor={`attribute-${attribute.id}`}>
                    {attribute.name}
                  </Label>
                  {attribute.description && (
                    <span>- {attribute.description}</span>
                  )}
                </div>
              ))}
            </div>
            {existingAttributes.length === 0 && (
              <p>
                暂无可用属性。请先创建属性，再关联技能。
              </p>
            )}
          </div>

          <SkillPrerequisitesEditor
            attributes={existingAttributes}
            prerequisites={formData.attributePrerequisites}
            onChange={(attributePrerequisites) =>
              setFormData((prev) => ({ ...prev, attributePrerequisites }))
            }
            idPrefix="skill-editor"
            disabled={!canCreateSkill}
          />
        </div>

        <div>
          <div>
            <Button type="submit" disabled={!canCreateSkill} variant="default">
              {mode === 'create' ? "创建技能" : "保存更改"}
            </Button>
            <Button type="button" onClick={onCancel} variant="outline">
              取消
            </Button>
          </div>

          {mode === 'edit' && onDelete && (
            <Button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              size="sm"
            >
              删除技能
            </Button>
          )}
        </div>
      </form>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="删除技能"
        description="确定要删除此技能吗？"
        itemName={formData.name || '此技能'}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
