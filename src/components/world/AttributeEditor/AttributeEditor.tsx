import React, { useState, useEffect } from 'react';
import { WorldAttribute, WorldSkill } from '@/types/world.types';
import { EntityID } from '@/types/common.types';
import { generateUniqueId } from '@/lib/utils/generateId';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { localizeErrorMessage } from '@/lib/i18n/errors';


export interface AttributeEditorProps {
  worldId: EntityID;
  mode: 'create' | 'edit';
  attributeId?: EntityID;
  onSave: (attribute: WorldAttribute) => void;
  onDelete?: (attributeId: EntityID) => void;
  onCancel: () => void;
  existingAttributes?: WorldAttribute[];
  existingSkills?: WorldSkill[];
  /** Maximum number of attributes allowed in create mode. When specified, prevents creation beyond this limit */
  maxAttributes?: number;
}

export function AttributeEditor({
  worldId,
  mode,
  attributeId,
  onSave,
  onDelete,
  onCancel,
  existingAttributes = [],
  existingSkills = [],
  maxAttributes,
}: AttributeEditorProps) {
  const linkedSkills = existingSkills;

  const [formData, setFormData] = useState<Partial<WorldAttribute>>({
    name: '',
    description: '',
    minValue: 1,
    maxValue: 10,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteWarnings, setDeleteWarnings] = useState<string[]>([]);

  // Load existing attribute data in edit mode
  useEffect(() => {
    if (mode === 'edit' && attributeId) {
      // In a real implementation, this would fetch from the store
      // For now, we'll use the attributes passed via props
      const attribute = existingAttributes.find(attr => attr.id === attributeId);
      if (attribute) {
        setFormData({
          id: attribute.id,
          name: attribute.name,
          description: attribute.description,
          minValue: attribute.minValue,
          maxValue: attribute.maxValue,
        });
      }
    }
  }, [mode, attributeId, existingAttributes]);

  const handleChange = (field: keyof WorldAttribute, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'minValue' || field === 'maxValue' ? Number(value) : value,
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSave = () => {
    const validationErrors: string[] = [];
    
    // Basic validation
    if (!formData.name?.trim()) {
      validationErrors.push("属性名称为必填项");
    }
    
    // Check for duplicate names
    const isDuplicate = existingAttributes.some(
      attr => attr.name.toLowerCase() === formData.name?.toLowerCase() && attr.id !== attributeId
    );
    if (isDuplicate) {
      validationErrors.push("已存在同名属性");
    }
    
    // Range validation
    if (formData.minValue !== undefined && formData.maxValue !== undefined && 
        formData.minValue >= formData.maxValue) {
      validationErrors.push("最大值必须大于最小值");
    }
    
    // Check maxAttributes limit in create mode
    if (mode === 'create' && maxAttributes !== undefined && existingAttributes.length >= maxAttributes) {
      validationErrors.push(`无法创建更多属性。最多允许 ${maxAttributes} 个属性。`);
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const minVal = formData.minValue ?? 1;
    const maxVal = formData.maxValue ?? 10;
    
    const attribute: WorldAttribute = {
      id: mode === 'edit' && attributeId ? attributeId : generateUniqueId('attr'),
      worldId: worldId,
      name: formData.name?.trim() || '',
      description: formData.description?.trim() || '',
      minValue: minVal,
      maxValue: maxVal,
      baseValue: Math.floor((minVal + maxVal) / 2),
    };

    onSave(attribute);
  };

  const handleDeleteClick = () => {
    if (!attributeId) return;

    // Check for linked skills
    const skillsLinked = linkedSkills.filter(skill => skill.attributeIds?.includes(attributeId));
    if (skillsLinked.length > 0) {
      setDeleteWarnings([
        `此属性已关联 ${skillsLinked.length} 个技能${''}`,
        "删除此属性将影响这些技能"
      ]);
    }
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete && attributeId) {
      onDelete(attributeId);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div>
        <h2>
          {mode === 'create' ? "创建新属性" : "编辑属性"}
        </h2>
      </div>

      <div>
        <div>
          <Label htmlFor="attribute-name">
            属性名称 <span>*</span>
          </Label>
          <Input
            id="attribute-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="例如：力量、智力"
            aria-describedby={errors.length > 0 ? "attribute-errors" : undefined}
            aria-invalid={errors.length > 0}
          />
        </div>

        <div>
          <Label htmlFor="attribute-description">
            描述
          </Label>
          <Textarea
            id="attribute-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="描述此属性的含义"
          />
        </div>

        <div>
          <div>
            <Label htmlFor="min-value">
              最小值
            </Label>
            <Input
              id="min-value"
              type="number"
              value={formData.minValue}
              onChange={(e) => handleChange('minValue', e.target.value)}
              min={-999}
              max={999}
            />
          </div>

          <div>
            <Label htmlFor="max-value">
              最大值
            </Label>
            <Input
              id="max-value"
              type="number"
              value={formData.maxValue}
              onChange={(e) => handleChange('maxValue', e.target.value)}
              min={-999}
              max={999}
            />
          </div>
        </div>

        {errors.length > 0 && (
          <div 
            id="attribute-errors"
            role="alert" 
            aria-live="polite"
            
          >
            {errors.map((error, index) => (
              <p key={index} >
                {localizeErrorMessage(error)}
              </p>
            ))}
          </div>
        )}
      </div>

      <div>
        <div>
          {mode === 'edit' && onDelete && (
            <Button
              onClick={handleDeleteClick}
              variant="destructive"
              aria-label="删除属性"
            >
              删除属性
            </Button>
          )}
        </div>

        <div>
          <Button
            onClick={onCancel}
            variant="outline"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            variant="default"
          >
            {mode === 'create' ? "创建属性" : "保存更改"}
          </Button>
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          title="删除属性"
          description={
            deleteWarnings.length > 0 
              ? deleteWarnings.join('. ') + "。此操作无法撤销。"
              : "此操作无法撤销。"
          }
          itemName={formData.name || '此属性'}
          confirmButtonText="删除属性"
          cancelButtonText="取消"
          isDeleting={false}
        />
      )}
    </>
  );
}
