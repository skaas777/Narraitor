import React from 'react';
import {
  wizardStyles,
  WizardFormSection
} from '@/components/shared/wizard';
import { PointPoolManager, PointAllocation } from '@/components/shared/PointPoolManager';
import { World } from '@/types/world.types';
import { validateAttributes } from '../utils/validation';
import { localizeErrorMessage } from '@/lib/i18n/errors';

interface CharacterWizardAttribute {
  attributeId: string;
  name: string;
  value: number;
  minValue: number;
  maxValue: number;
  description?: string;
}

interface AttributesStepData {
  characterData: {
    attributes: CharacterWizardAttribute[];
  };
  pointPools: {
    attributes: {
      total: number;
      spent: number;
      remaining: number;
    };
  };
  validation: Record<number, {
    valid: boolean;
    touched: boolean;
    errors: string[];
  }>;
}

interface AttributesStepProps {
  data: AttributesStepData;
  onUpdate: (updates: Record<string, unknown>) => void;
  onValidation: (valid: boolean, errors: string[]) => void;
  worldConfig: World;
}

export const AttributesStep: React.FC<AttributesStepProps> = ({
  data,
  onUpdate,
  onValidation,
}) => {
  // Convert attributes to PointAllocation format
  const allocations: PointAllocation[] = data.characterData.attributes.map((attr) => ({
    id: attr.attributeId,
    name: attr.name,
    value: attr.value,
    minValue: attr.minValue,
    maxValue: attr.maxValue,
    description: attr.description,
  }));

  const handleAttributeChange = (attributeId: string, value: number) => {
    const updatedAttributes = data.characterData.attributes.map((attr) =>
      attr.attributeId === attributeId ? { ...attr, value } : attr
    );
    onUpdate({ attributes: updatedAttributes });
    const result = validateAttributes(
      updatedAttributes,
      data.pointPools.attributes.total
    );
    onValidation(result.valid, result.errors);
  };

  const validation = data.validation[1];
  const showErrors = validation?.touched && !validation?.valid;

  // Calculate if all points are allocated
  const totalSpent = data.characterData.attributes.reduce((sum, attr) => sum + attr.value, 0);
  const remaining = data.pointPools.attributes.total - totalSpent;

  return (
    <div className="component-attributes-step">
      <WizardFormSection
        title="分配属性点"
        description="将点数分配给你的角色属性。每项属性会影响游戏玩法的不同方面。"
      >
      <PointPoolManager
        allocations={allocations}
        poolConfig={{
          total: data.pointPools.attributes.total,
          label: "属性点"
        }}
        onChange={handleAttributeChange}
        dataTutorial="attribute-allocation"
      />

      {/* Validation errors */}
      {showErrors && (
        <div className={wizardStyles.errorContainer}>
          {validation.errors.map((error: string, index: number) => (
            <p key={index} className={wizardStyles.form.error}>
              {localizeErrorMessage(error)}
            </p>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <div className={wizardStyles.card.base}>
          <p>
            未使用的点数可以现在分配，以强化你的角色；你也可以保持现状继续。
          </p>
        </div>
      )}
      </WizardFormSection>
    </div>
  );
};
