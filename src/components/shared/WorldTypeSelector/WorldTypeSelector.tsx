'use client';

import React from 'react';
import { WorldTypeOption, WorldTypeData } from './types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import './WorldTypeSelector.css';

export interface WorldTypeSelectorProps {
  value: WorldTypeData;
  onChange: (data: WorldTypeData) => void;
  showLabels?: boolean;
  disabled?: boolean;
  className?: string;
}

const WORLD_TYPE_OPTIONS: WorldTypeOption[] = [
  {
    id: 'original',
    label: "原创世界",
    description:
      "生成一个拥有自身设定与主题的原创世界",
    requiresReference: false,
  },
  {
    id: 'inspired_by',
    label: "灵感来源",
    description:
      "生成一个受现有虚构宇宙或真实设定启发的原创世界",
    requiresReference: true,
    referenceLabel: "现有设定",
    referencePlaceholder: "例如：Star Wars、The Office、Breaking Bad",
    additionalDetailsLabel: "补充细节",
    additionalDetailsPlaceholder:
      "你的世界应从哪些方面获得灵感？它有何独特之处？",
  },
  {
    id: 'set_within',
    label: "衍生世界",
    description:
      "直接在现有虚构宇宙或真实设定中生成一个世界",
    requiresReference: true,
    referenceLabel: "现有设定",
    referencePlaceholder: "例如：Star Wars、The Office、Breaking Bad",
    additionalDetailsLabel: "具体设定/时间",
    additionalDetailsPlaceholder:
      "在这个宇宙中的具体地点？什么时间段？重点是什么？",
  },
];

export function WorldTypeSelector({
  value,
  onChange,
  showLabels = true,
  disabled = false,
  className = '',
}: WorldTypeSelectorProps) {
  // Defensive check to prevent crashes if value is undefined
  if (!value) {
    return null;
  }

  const selectedOption = WORLD_TYPE_OPTIONS.find(
    (option) => option.id === value.worldType
  );

  const handleTypeChange = (worldType: WorldTypeData['worldType']) => {
    onChange({
      ...value,
      worldType,
      // Clear reference fields when switching to original
      ...(worldType === 'original'
        ? { worldReference: '', additionalDetails: '' }
        : {}),
    });
  };

  const handleRadioChange = (value: string) => {
    handleTypeChange(value as WorldTypeData['worldType']);
  };

  const handleReferenceChange = (worldReference: string) => {
    onChange({ ...value, worldReference });
  };

  const handleAdditionalDetailsChange = (additionalDetails: string) => {
    onChange({ ...value, additionalDetails });
  };

  return (
    <div className={`component-world-type-selector ${className}`}>
      {/* World Type Selection */}
      {showLabels && (
        <Label>
          世界类型 <span>*</span>
        </Label>
      )}

      <RadioGroup
        value={value.worldType}
        onValueChange={handleRadioChange}
        disabled={disabled}
      >
        {WORLD_TYPE_OPTIONS.map((option) => (
          <label key={option.id} className="world-type-option">
            <RadioGroupItem value={option.id} />
            <div className="world-type-option-text">
              <div className="world-type-option-label">{option.label}</div>
              <div className="world-type-option-description">
                {option.description}
              </div>
            </div>
          </label>
        ))}
      </RadioGroup>

      {/* Conditional Fields */}
      {selectedOption?.requiresReference && (
        <div>
          {/* Existing Setting Field */}
          <div>
            <Label htmlFor="world-reference">
              {selectedOption.referenceLabel} <span>*</span>
            </Label>
            <Input
              id="world-reference"
              type="text"
              placeholder={selectedOption.referencePlaceholder}
              value={value.worldReference}
              onChange={(e) => handleReferenceChange(e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Additional Details Field */}
          <div>
            <Label htmlFor="additional-details">
              {selectedOption.additionalDetailsLabel}{' '}
              {value.worldType === 'set_within' ? (
                <span>（可选——会根据你命名的设定自动选择）</span>
              ) : (
                <span>*</span>
              )}
            </Label>
            <Textarea
              id="additional-details"
              rows={3}
              placeholder={selectedOption.additionalDetailsPlaceholder}
              value={value.additionalDetails}
              onChange={(e) => handleAdditionalDetailsChange(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export type { WorldTypeData };
