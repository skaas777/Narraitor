import React from 'react';
import { displayLabel } from '@/lib/i18n/zhCN';
import { Badge } from '@/components/ui/badge';
import { RequirementLogic } from '@/types/narrative.types';

interface AlignmentBadgeProps {
  alignment?: string;
}

/**
 * Renders the alignment label (Lawful / Chaotic) as a colored badge.
 * Neutral alignment renders nothing (it's the unmarked default).
 */
export const AlignmentBadge: React.FC<AlignmentBadgeProps> = ({
  alignment,
}) => {
  if (!alignment || alignment === 'neutral') return null;

  const label = displayLabel(alignment);

  return (
    <span
      className={`manuscript-alignment-badge manuscript-alignment-badge-${alignment}`}
      aria-label={`${label} 阵营`}
    >
      {label}
    </span>
  );
};

interface SkillRequirement {
  skillName?: string;
  met?: boolean;
  requirement?: {
    targetId: string;
  };
}

interface ItemRequirement {
  itemName: string;
  met: boolean;
  current: number;
  required: number;
}

interface ItemRequirementGroup {
  logic: RequirementLogic;
  requirements: ItemRequirement[];
}

interface SkillRequirementBadgesProps {
  requirements: SkillRequirement[];
  optionId: string;
}

interface ItemRequirementBadgesProps {
  groups: ItemRequirementGroup[];
  optionId: string;
}

/**
 * Renders skill requirement badges (pre-selection only).
 * Shows the skill name and a RISKY qualifier when the character is under the bar.
 */
export const SkillRequirementBadges: React.FC<SkillRequirementBadgesProps> = ({
  requirements,
  optionId,
}) => {
  if (!requirements || requirements.length === 0) {
    return null;
  }

  const primaryRequirement =
    requirements.find(
      (requirement) =>
        Boolean(requirement.skillName) &&
        !['Unknown Skill', '未知技能'].includes(requirement.skillName ?? '')
    ) ?? requirements[0];

  const hasNamedSkill =
    Boolean(primaryRequirement.skillName) &&
    !['Unknown Skill', '未知技能'].includes(primaryRequirement.skillName ?? '');
  const badgeLabel = hasNamedSkill
    ? primaryRequirement.skillName!
    : "技能";
  const isAnyRisky = requirements.some((req) => req.met === false);
  const displayLabel = isAnyRisky ? `${badgeLabel} · 有风险` : badgeLabel;
  const dataMet = isAnyRisky
    ? 'false'
    : requirements.every((req) => req.met === true)
      ? 'true'
      : undefined;

  return (
    <span
      className="manuscript-skill-check-badge"
      data-option-id={optionId}
      data-met={dataMet}
      aria-label={
        isAnyRisky
          ? `${badgeLabel} 检定，对该角色有风险`
          : hasNamedSkill
            ? `${badgeLabel} 检定`
            : "需要技能检定"
      }
    >
      {displayLabel}
    </span>
  );
};

/**
 * Renders item requirement badges organized by groups
 */
export const ItemRequirementBadges: React.FC<ItemRequirementBadgesProps> = ({
  groups,
  optionId,
}) => {
  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <div>
      {groups.map((group, groupIndex) => (
        <div key={`${optionId}-item-group-${groupIndex}`}>
          <p>
            {group.logic === 'any' ? "需要满足以下任一条件：" : "需要满足以下全部条件："}
          </p>
          <div>
            {group.requirements.map((itemReq, reqIndex) => {
              const label = itemReq.met
                ? itemReq.itemName
                : `${itemReq.itemName}(${itemReq.current}/${itemReq.required})`;

              return (
                <Badge
                  key={`${optionId}-item-${groupIndex}-${reqIndex}`}
                  variant={itemReq.met ? 'success' : 'destructive'}
                >
                  {label}
                  {!itemReq.met && <span> - 未满足</span>}
                </Badge>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
