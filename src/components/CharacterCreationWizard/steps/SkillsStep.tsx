import React, { useEffect, useMemo } from 'react';
import {
  wizardStyles,
  WizardFormSection,
  ToggleButton
} from '@/components/shared/wizard';
import RangeSlider from '@/components/ui/RangeSlider';
import { World } from '@/types/world.types';
import { validateSkills } from '../utils/validation';
import { getMaxSkillSelections, getSkillBounds } from '../utils/skillAllocation';
import {
  getUnmetPrerequisites,
  formatUnmetPrerequisites,
  type UnmetPrerequisite,
} from '@/lib/utils/skillPrerequisites';

interface CharacterWizardSkill {
  skillId: string;
  name: string;
  description?: string;
  level: number;
  minLevel: number;
  maxLevel: number;
  attributeIds?: string[];
  isSelected: boolean;
}

interface CharacterWizardAttribute {
  attributeId: string;
  value: number;
}

interface SkillsStepData {
  characterData: {
    skills: CharacterWizardSkill[];
    attributes?: CharacterWizardAttribute[];
  };
  pointPools: {
    skills: {
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

interface SkillsStepProps {
  data: SkillsStepData;
  onUpdate: (updates: Record<string, unknown>) => void;
  onValidation: (valid: boolean, errors: string[]) => void;
  worldConfig: World;
}

export const SkillsStep: React.FC<SkillsStepProps> = ({
  data,
  onUpdate,
  onValidation,
  worldConfig,
}) => {
  const totalSkillPoints = worldConfig?.settings?.skillPointPool ?? data.pointPools?.skills?.total ?? 0;
  const characterAttributes = useMemo(
    () => data.characterData.attributes ?? [],
    [data.characterData.attributes]
  );

  const unmetPrerequisitesBySkillId = useMemo(() => {
    const map = new Map<string, UnmetPrerequisite[]>();
    (worldConfig?.skills || []).forEach(skill => {
      map.set(
        skill.id,
        getUnmetPrerequisites(
          skill.attributePrerequisites,
          characterAttributes,
          worldConfig?.attributes || []
        )
      );
    });
    return map;
  }, [worldConfig, characterAttributes]);

  const {
    remainingPoints,
    spentPoints,
    costBySkillId,
    boundsBySkillId,
    maxAllowedLevelBySkillId,
    totalCapacity,
  } = useMemo(() => {
    const bounds = new Map<string, { minLevel: number; maxLevel: number }>();
    const costs = new Map<string, number>();

    let totalSpent = 0;
    let capacity = 0;

    data.characterData.skills.forEach(skill => {
      const { minLevel, maxLevel } = getSkillBounds(skill, worldConfig);
      bounds.set(skill.skillId, { minLevel, maxLevel });

      if (skill.isSelected) {
        const cost = Math.max(0, (skill.level ?? minLevel) - minLevel);
        costs.set(skill.skillId, cost);
        totalSpent += cost;
        capacity += Math.max(0, maxLevel - minLevel);
      } else {
        costs.set(skill.skillId, 0);
      }
    });

    const remaining = totalSkillPoints - totalSpent;

    const maxAllowed = new Map<string, number>();
    data.characterData.skills.forEach(skill => {
      const bound = bounds.get(skill.skillId);
      if (!bound) return;
      const allocated = costs.get(skill.skillId) ?? 0;
      const availableForSkill = Math.max(remaining + allocated, 0);
      const maxLevel = Math.min(bound.maxLevel, bound.minLevel + availableForSkill);
      maxAllowed.set(skill.skillId, maxLevel);
    });

    return {
      remainingPoints: remaining,
      spentPoints: totalSpent,
      costBySkillId: costs,
      boundsBySkillId: bounds,
      maxAllowedLevelBySkillId: maxAllowed,
      totalCapacity: capacity,
    };
  }, [data.characterData.skills, totalSkillPoints, worldConfig]);

  useEffect(() => {
    const validationResult = validateSkills(
      data.characterData.skills,
      totalSkillPoints,
      worldConfig
    );

    const currentValidation = data.validation[2];
    const errorsChanged =
      !currentValidation ||
      currentValidation.errors.length !== validationResult.errors.length ||
      currentValidation.errors.some((error, index) => error !== validationResult.errors[index]);

    if (
      !currentValidation ||
      currentValidation.valid !== validationResult.valid ||
      errorsChanged
    ) {
      onValidation(validationResult.valid, validationResult.errors);
    }
  }, [
    data.characterData.skills,
    data.validation,
    onValidation,
    totalSkillPoints,
    worldConfig
  ]);

  // Re-validate prerequisites when attributes change: a previously selected
  // skill whose requirements are no longer met is automatically deselected.
  useEffect(() => {
    const hasInvalidSelection = data.characterData.skills.some(
      skill =>
        skill.isSelected &&
        (unmetPrerequisitesBySkillId.get(skill.skillId)?.length ?? 0) > 0
    );
    if (!hasInvalidSelection) return;

    const updatedSkills = data.characterData.skills.map(skill => {
      const unmet = unmetPrerequisitesBySkillId.get(skill.skillId) ?? [];
      if (skill.isSelected && unmet.length > 0) {
        const bounds =
          boundsBySkillId.get(skill.skillId) ?? getSkillBounds(skill, worldConfig);
        return { ...skill, isSelected: false, level: bounds.minLevel };
      }
      return skill;
    });

    onUpdate({ skills: updatedSkills });
  }, [
    unmetPrerequisitesBySkillId,
    data.characterData.skills,
    boundsBySkillId,
    onUpdate,
    worldConfig,
  ]);

  const hasUnallocatedPoints = remainingPoints > 0;
  const selectedSkills = data.characterData.skills.filter(skill => skill.isSelected);
  const maxSelectable = getMaxSkillSelections(worldConfig);
  const handleSkillToggle = (skillId: string) => {
    const target = data.characterData.skills.find(skill => skill.skillId === skillId);
    const isLocked = (unmetPrerequisitesBySkillId.get(skillId)?.length ?? 0) > 0;
    // Prevent selecting a skill whose attribute prerequisites are not met.
    if (target && !target.isSelected && isLocked) {
      return;
    }
    // Enforce the world's selection limit.
    if (target && !target.isSelected && selectedSkills.length >= maxSelectable) {
      return;
    }

    const updatedSkills = data.characterData.skills.map(skill => {
      if (skill.skillId !== skillId) return skill;
      const bounds = boundsBySkillId.get(skillId) ?? getSkillBounds(skill, worldConfig);
      if (skill.isSelected) {
        return {
          ...skill,
          isSelected: false,
          level: bounds.minLevel,
        };
      }
      return {
        ...skill,
        isSelected: true,
        level: bounds.minLevel,
      };
    });

    onUpdate({ skills: updatedSkills });
  };
  const handleLevelChange = (skillId: string, level: number) => {
    const bounds = boundsBySkillId.get(skillId) ?? getSkillBounds(
      data.characterData.skills.find(skill => skill.skillId === skillId)!,
      worldConfig
    );
    if (!bounds) return;

    const maxAllowed = maxAllowedLevelBySkillId.get(skillId) ?? bounds.maxLevel;
    const clampedLevel = Math.max(bounds.minLevel, Math.min(maxAllowed, level));

    const updatedSkills = data.characterData.skills.map(skill => {
      if (skill.skillId !== skillId) return skill;
      if (!skill.isSelected) return skill;
      return {
        ...skill,
        level: clampedLevel,
      };
    });

    onUpdate({ skills: updatedSkills });
  };

  return (
    <div className="component-skills-step">
      <WizardFormSection
        title="分配技能点"
        description={`最多选择 ${maxSelectable} 个初始技能，并在它们之间分配 ${totalSkillPoints} 点技能点。`}
      >
      <div className="wizard-skill-intro">
        <p>
          每个已选技能从其最低等级开始。提升等级即可投入技能点。如果你想创建一个经验较少的角色，也可以保留未使用的技能点。
        </p>
      </div>

      <div className={`${wizardStyles.card.base} wizard-skill-ledger`}>
        <div className="wizard-skill-ledger-section">
          <h3 className={wizardStyles.subheading}>技能选择</h3>
          <div className="wizard-badge-row">
            <span className={`${wizardStyles.badge.base} ${wizardStyles.badge.primary}`}>已选： {selectedSkills.length}</span>
            <span className={`${wizardStyles.badge.base} ${wizardStyles.badge.secondary}`}>上限： {maxSelectable}</span>
          </div>
        </div>

        <div className="wizard-skill-ledger-section">
          <h3 className={wizardStyles.subheading}>技能点</h3>
          <div className="wizard-badge-row">
            <span className={`${wizardStyles.badge.base} ${wizardStyles.badge.secondary}`}>总计： {totalSkillPoints}</span>
            <span className={`${wizardStyles.badge.base} ${wizardStyles.badge.primary}`}>已用： {Math.max(spentPoints, 0)}</span>
            <span className={`${wizardStyles.badge.base} ${wizardStyles.badge.secondary}`}>
              剩余： {Math.max(remainingPoints, 0)}
            </span>
            {totalSkillPoints > totalCapacity && (
              <span className={`${wizardStyles.badge.base} ${wizardStyles.badge.secondary}`}>
                容量： {totalCapacity}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="wizard-skill-allocation-list" data-tutorial="skill-selection">
        {data.characterData.skills.map((skill, index) => {
          const bounds = boundsBySkillId.get(skill.skillId) ?? getSkillBounds(skill, worldConfig);
          const cost = costBySkillId.get(skill.skillId) ?? 0;
          const safeKey = skill.skillId || `${skill.name}-${index}`;
          const maxAllowedLevel = maxAllowedLevelBySkillId.get(skill.skillId) ?? bounds.maxLevel;
          const skillTitleId = `skill-allocation-title-${safeKey}`;
          const unmetPrerequisites = unmetPrerequisitesBySkillId.get(skill.skillId) ?? [];
          const isLocked = unmetPrerequisites.length > 0;
          const requirementText = formatUnmetPrerequisites(unmetPrerequisites);

          return (
          <div
            key={safeKey}
            className={`${wizardStyles.card.base} wizard-skill-card ${skill.isSelected ? wizardStyles.card.selected : ''} ${isLocked ? 'wizard-skill-card-locked' : ''}`}
          >
            <div>
              <div className="wizard-skill-card-head">
                <div className="wizard-skill-card-info">
                  <span id={skillTitleId} >{skill.name}</span>
                  {skill.description && (
                    <p>{skill.description}</p>
                  )}
                  {skill.attributeIds && skill.attributeIds.length > 0 && worldConfig?.attributes && (
                    <div className="wizard-skill-card-linked">
                      关联属性：{' '}
                      {skill.attributeIds
                        .map(attrId => worldConfig.attributes?.find(attr => attr.id === attrId)?.name || "未知")
                        .filter(name => name !== 'Unknown')
                        .join(', ') || "未知属性"}
                    </div>
                  )}
                  {isLocked && (
                    <div
                      className="wizard-skill-card-requirement"
                      role="note"
                      data-testid={`skill-requirement-${safeKey}`}
                    >
                      {requirementText}
                    </div>
                  )}
                </div>
                <ToggleButton
                  isActive={skill.isSelected}
                  activeLabel="已选择"
                  inactiveLabel={isLocked ? "已锁定" : "未选择"}
                  ariaLabel={`${skill.name}，${isLocked ? "已锁定" : skill.isSelected ? "已选择" : "未选择"}`}
                  onClick={() => handleSkillToggle(skill.skillId)}
                  testId={`skill-toggle-${safeKey}`}
                  disabled={isLocked}
                  title={isLocked ? requirementText : undefined}
                />
              </div>

              {skill.isSelected && (
                <div className="wizard-skill-level">
                  <div className="wizard-skill-level-row">
                    <span>等级： {skill.level}</span>
                    <span>已分配点数： {cost}</span>
                  </div>
                  <RangeSlider
                    value={skill.level}
                    min={bounds.minLevel}
                    max={bounds.maxLevel}
                    effectiveMax={maxAllowedLevel}
                    showLabel={false}
                    onChange={(value) => handleLevelChange(skill.skillId, value)}
                    testId={`skill-level-slider-${safeKey}`}
                    isConstrained={maxAllowedLevel < bounds.maxLevel}
                    ariaLabelledBy={skillTitleId}
                  />
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {totalSkillPoints > 0 && hasUnallocatedPoints && (
        <div className={`${wizardStyles.card.base}`}>
          <p>
            {totalSkillPoints > totalCapacity
              ? "你的技能点超过了技能可容纳的上限。把技能点满，或保留多余的点数不分配——两种做法都可以。"
              : `你还有 ${remainingPoints} 点技能点可分配。用它们强化角色的技能，或保持现状继续。`}
          </p>
        </div>
      )}

      {remainingPoints < 0 && (
        <div className={wizardStyles.errorContainer}>
          <p className={wizardStyles.form.error}>
            你分配的技能点超过了可用点数。请降低一个或多个技能的等级。
          </p>
        </div>
      )}
      </WizardFormSection>
    </div>
  );
};
