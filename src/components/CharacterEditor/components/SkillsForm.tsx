import React, { useCallback } from 'react';
import { World } from '@/types/world.types';
import RangeSlider from '@/components/ui/RangeSlider';
import { Label } from '@/components/ui/label';
import { useSkillPointPool } from '@/hooks/usePointPoolManager';
import { PointPoolDisplay } from './PointPoolDisplay';
import { getSkillBounds } from '@/components/CharacterCreationWizard/utils/skillAllocation';
import { displayLabel } from '@/lib/i18n/zhCN';

interface CharacterSkill {
  skillId: string;
  level: number;
  experience: number;
  isActive: boolean;
}

interface SkillsFormProps {
  skills: CharacterSkill[];
  world: World;
  onSkillsChange: (skills: CharacterSkill[]) => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({
  skills,
  world,
  onSkillsChange,
}) => {
  const {
    pool,
    skills: managedSkills,
    canIncrease,
    setValue,
  } = useSkillPointPool({
    totalPoints: world.settings.skillPointPool,
    skills: skills.map(skill => {
      // Same bounds (and orphaned-skill fallback) as the editor's save guard.
      const { minLevel, maxLevel } = getSkillBounds(
        { skillId: skill.skillId, level: skill.level },
        world
      );
      return {
        id: skill.skillId,
        value: skill.level,
        minValue: minLevel,
        maxValue: maxLevel,
        isSelected: true, // All skills in editor count toward pool
      };
    }),
  });

  const handleValueChange = useCallback((skillId: string, newValue: number) => {
    setValue(skillId, newValue);

    // Update parent with new values
    const newSkills = skills.map(skill => ({
      ...skill,
      level: skill.skillId === skillId ? newValue : skill.level,
    }));
    onSkillsChange(newSkills);
  }, [setValue, skills, onSkillsChange]);

  return (
    <div className="component-skills-form">
      <div className="skills-form-header">
        <PointPoolDisplay pool={pool} label="技能点" />
      </div>

      <div className="skills-form-list">
        {managedSkills.map((skill, index) => {
          const uniqueKey = skill.id || `skill-${index}`;
          const worldSkill = world.skills.find(ws => ws.id === skill.id);
          const cannotIncrease = !canIncrease(skill.id);

          // Calculate effective max based on pool constraints
          const currentValue = skill.value;
          const effectiveMax = cannotIncrease
            ? currentValue  // Can't increase beyond current value if pool exhausted
            : skill.maxValue; // Can increase up to max if pool has points

          return (
            <div
              key={uniqueKey}
              className="skills-form-row"
            >
              <div className="skills-form-label-row">
                <Label>
                {worldSkill?.name || `技能 ${index + 1}`}
                </Label>
                {worldSkill?.difficulty && (
                  <span className="skills-form-difficulty">
                    {displayLabel(worldSkill.difficulty)}
                  </span>
                )}
              </div>
              {worldSkill?.description && (
                <p className="skills-form-description">
                  {worldSkill.description}
                </p>
              )}
              {cannotIncrease && currentValue < skill.maxValue && (
                <p className="skills-form-constraint">
                  点数已用完。请减少其他技能的点数来提升此技能。
                </p>
              )}
              <RangeSlider
                value={skill.value}
                min={skill.minValue}
                max={skill.maxValue}
                effectiveMax={effectiveMax}
                isConstrained={cannotIncrease}
                onChange={newValue => handleValueChange(skill.id, newValue)}
                disabled={false}
                showLabel={false}
                ariaLabel={`${worldSkill?.name || `技能 ${index + 1}`}的技能等级`}
                testId={`skill-${skill.id}`}
              />
              <div className="skills-form-meta">
                范围： {skill.minValue} - {skill.maxValue}
                {worldSkill?.attributeIds &&
                  worldSkill.attributeIds.length > 0 && (
                    <span>
                    • 关联至：{' '}
                      {worldSkill.attributeIds
                        .map(
                          id => world.attributes.find(a => a.id === id)?.name
                        )
                        .filter(Boolean)
                        .join(', ') || "未知"}
                    </span>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
