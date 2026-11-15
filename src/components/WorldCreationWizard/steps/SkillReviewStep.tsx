'use client';

import React, { useState, useEffect } from 'react';
import { WorldSkill } from '@/types/world.types';
import {
  SkillSuggestion,
  WorldCreationData,
  WIZARD_MAX_SKILLS,
  adoptLegacyEntries,
} from '../WizardState';
import type { SkillDifficulty } from '@/lib/constants/skillDifficultyLevels';
import { generateUniqueId } from '@/lib/utils/generateId';
import SkillRangeEditor from '@/components/forms/SkillRangeEditor';
import { SkillEditor } from '@/components/world/SkillEditor';
import { ConfirmationDialog } from '@/components/ConfirmationDialog/ConfirmationDialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MIN_SKILL_VALUE as SKILL_MIN_VALUE,
  MAX_SKILL_VALUE as SKILL_MAX_VALUE,
  SKILL_DEFAULT_VALUE,
} from '@/lib/constants/skillLevelDescriptions';
import { SKILL_DIFFICULTIES } from '@/lib/constants/skillDifficultyLevels';
import {
  wizardStyles,
  WizardFormSection,
  WizardFormGroup,
  WizardTextField,
  WizardTextArea,
  WizardSelect,
} from '@/components/shared/wizard';
import { Button } from '@/components/ui/button';
import { displayLabel } from '@/lib/i18n/zhCN';

/** A skill suggestion plus the edit tracking the review step keeps on it. */
interface ReviewedSkill extends SkillSuggestion {
  isModified?: boolean;
  originalName?: string;
  originalDescription?: string;
  originalDifficulty?: SkillDifficulty;
}

/**
 * Props for the SkillReviewStep component
 */
interface SkillReviewStepProps {
  /** Current world data being created; suggestions come from `aiSuggestions.skills` */
  worldData: WorldCreationData;
  /** Validation errors for the form */
  errors: Record<string, string>;
  /** Callback to update world data */
  onUpdate: (updates: Partial<WorldCreationData>) => void;
  /** Callback to clear AI suggestions */
  onClearSuggestions?: () => void;
}

/** Maps a skill difficulty to its badge class names. */
const difficultyBadgeClass = (difficulty: string): string => {
  const variant =
    difficulty === 'easy'
      ? wizardStyles.badge.success
      : difficulty === 'medium'
        ? wizardStyles.badge.warning
        : wizardStyles.badge.danger;
  return `${wizardStyles.badge.base} ${variant}`;
};

/**
 * SkillReviewStep - World Creation Wizard step for reviewing and customizing skills
 *
 * This component allows users to:
 * - Review AI-generated skill suggestions
 * - Accept/reject suggested skills
 * - Customize skill properties (name, description, difficulty, linked attributes)
 * - Create custom skills from scratch
 * - Manage multi-attribute skill linking
 *
 * Key features:
 * - Up to settings.maxSkills skills total (suggested + custom)
 * - Multi-attribute linking support for complex skills
 * - Real-time validation and progress tracking
 * - Intuitive UX with "Customize" buttons and progress indicators
 *
 * @param props - Component props
 * @returns JSX element for the skill review step
 */
export default function SkillReviewStep({
  worldData,
  errors,
  onUpdate,
  onClearSuggestions,
}: SkillReviewStepProps) {
  const suggestions: ReviewedSkill[] = worldData.aiSuggestions?.skills ?? [];
  const attributes = worldData.attributes ?? [];
  const maxSkills = worldData.settings?.maxSkills ?? WIZARD_MAX_SKILLS;
  const suggestionIds = new Set(suggestions.map((s) => s.id));
  const customSkills = (worldData.skills ?? []).filter(
    (s) => !suggestionIds.has(s.id)
  );
  const acceptedCount =
    suggestions.filter((s) => s.accepted).length + customSkills.length;

  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0]));
  const [isCreatingCustomSkill, setIsCreatingCustomSkill] = useState(false);
  const [editingCustomSkillId, setEditingCustomSkillId] = useState<
    string | null
  >(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Links to attributes that were later excluded are dropped from the saved
  // skill but kept on the suggestion, so re-including the attribute restores them.
  const toWorldSkill = (s: ReviewedSkill): WorldSkill => ({
    id: s.id ?? generateUniqueId('skill'),
    worldId: '',
    name: s.name,
    description: s.description,
    difficulty: s.difficulty,
    category: s.category,
    baseValue: s.baseValue,
    minValue: SKILL_MIN_VALUE,
    maxValue: SKILL_MAX_VALUE,
    attributeIds: (s.attributeIds ?? []).filter((id) =>
      attributes.some((a) => a.id === id)
    ),
  });

  const commit = (
    nextSuggestions: ReviewedSkill[],
    nextCustom: WorldSkill[] = customSkills
  ) => {
    onUpdate({
      ...(worldData.aiSuggestions && {
        aiSuggestions: { ...worldData.aiSuggestions, skills: nextSuggestions },
      }),
      skills: [
        ...nextSuggestions.filter((s) => s.accepted).map(toWorldSkill),
        ...nextCustom,
      ],
    });
  };

  const updateSuggestion = (index: number, changes: Partial<ReviewedSkill>) => {
    commit(suggestions.map((s, i) => (i === index ? { ...s, ...changes } : s)));
  };

  // First visit after suggestions arrive: give each one a stable id, resolve
  // its linked attribute names to ids, and accept as many as the world limit
  // allows. Later visits find the ids already in worldData and change nothing.
  useEffect(() => {
    if (suggestions.length === 0 || suggestions.every((s) => s.id)) return;
    // A draft saved before suggestions carried ids still has the saved
    // skills; adopt them by name so they aren't mistaken for custom ones.
    const { adopted, remaining } = adoptLegacyEntries(suggestions, customSkills);
    let openSlots = maxSkills - remaining.length - adopted.size;
    commit(
      suggestions.map((s) => {
        const match = adopted.get(s);
        // Analyzer output can omit `accepted`; treat that as accepted.
        const accepted = match ? true : (s.accepted ?? true) && openSlots > 0;
        if (accepted && !match) openSlots -= 1;
        return {
          ...s,
          id: match?.id ?? s.id ?? generateUniqueId('skill'),
          accepted,
          baseValue: match?.baseValue ?? SKILL_DEFAULT_VALUE,
          attributeIds:
            match?.attributeIds ??
            (s.linkedAttributeNames ?? [])
              .map((name) => attributes.find((a) => a.name === name)?.id)
              .filter((id): id is string => Boolean(id)),
          originalName: s.name,
          originalDescription: s.description,
          originalDifficulty: s.difficulty,
          isModified: false,
        };
      }),
      remaining
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions]);

  const handleToggleSkill = (index: number) => {
    const target = suggestions[index];
    if (!target.accepted && acceptedCount >= maxSkills) return;
    updateSuggestion(index, { accepted: !target.accepted });
  };

  const handleModifySkill = (
    index: number,
    field: 'name' | 'description' | 'difficulty',
    value: string
  ) => {
    const updated = { ...suggestions[index], [field]: value };
    updateSuggestion(index, {
      [field]: value,
      isModified:
        updated.name !== updated.originalName ||
        updated.description !== updated.originalDescription ||
        updated.difficulty !== updated.originalDifficulty,
    });
  };

  const handleAttributeToggle = (skillIndex: number, attributeId: string) => {
    const current = suggestions[skillIndex].attributeIds ?? [];
    updateSuggestion(skillIndex, {
      attributeIds: current.includes(attributeId)
        ? current.filter((id) => id !== attributeId)
        : [...current, attributeId],
    });
  };

  const toggleDetails = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Custom skill handlers
  const handleAddCustomSkill = () => {
    setIsCreatingCustomSkill(true);
    setEditingCustomSkillId(null);
  };

  const handleSaveCustomSkill = (skill: WorldSkill) => {
    const updatedCustomSkills = editingCustomSkillId
      ? customSkills.map((s) => (s.id === editingCustomSkillId ? skill : s))
      : [...customSkills, skill];

    setIsCreatingCustomSkill(false);
    setEditingCustomSkillId(null);
    commit(suggestions, updatedCustomSkills);
  };

  const handleEditCustomSkill = (skillId: string) => {
    setEditingCustomSkillId(skillId);
    setIsCreatingCustomSkill(true);
  };

  const handleDeleteCustomSkill = (skillId: string) => {
    commit(
      suggestions,
      customSkills.filter((s) => s.id !== skillId)
    );
  };

  const handleCancelCustomSkill = () => {
    setIsCreatingCustomSkill(false);
    setEditingCustomSkillId(null);
  };

  const handleClearSuggestions = () => {
    if (onClearSuggestions) {
      onClearSuggestions();
      setShowClearConfirmation(false);
    }
  };

  const showClearButton =
    worldData.aiSuggestionMeta?.source === 'ai' && suggestions.length > 0;

  return (
    <div data-testid="skill-review-step">
      <WizardFormSection
        title="查看技能"
        description={`保留适合你的世界的技能。至少 1 个，最多 ${maxSkills} 个。`}
        dataTutorial="skill-editor"
      >
        {showClearButton && (
          <div>
            <Button
              type="button"
              onClick={() => setShowClearConfirmation(true)}
              variant="outline"
              size="sm"
              data-testid="clear-ai-suggestions-button"
            >
              清除建议
            </Button>
          </div>
        )}

        <div className="wizard-review-list">
          {(suggestions.length > 0 || customSkills.length > 0) && (
            <div
              className="wizard-difficulty-legend"
              data-testid="skill-difficulty-legend"
            >
              <span className="wizard-difficulty-legend-label">难度</span>
              {SKILL_DIFFICULTIES.map((difficulty) => (
                <span
                  key={difficulty.value}
                  className={difficultyBadgeClass(difficulty.value)}
                  title={difficulty.description}
                >
                  {difficulty.label}
                </span>
              ))}
            </div>
          )}
          <div className="wizard-review-suggestions">
            {suggestions.length === 0 ? (
              <div className="wizard-empty-state">
                <p>暂无技能建议</p>
                <p>
                  之后你可以在世界编辑器中为世界添加技能。
                </p>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`${wizardStyles.card.base} wizard-review-card`}
                  data-testid={`skill-card-${index}`}
                  {...(index === 0
                    ? { 'data-tutorial': 'skill-suggestions' }
                    : {})}
                >
                  <div className="wizard-review-card-head">
                    <div className="wizard-review-card-meta">
                      <span>{suggestion.name}</span>
                      <span className={difficultyBadgeClass(suggestion.difficulty)}>
                        {displayLabel(suggestion.difficulty)}
                      </span>
                      {suggestion.isModified && <span>已修改</span>}
                      {attributes.some((a) => suggestion.attributeIds?.includes(a.id)) && (
                        <span>
                          关联：{' '}
                          {attributes
                            .filter((a) => suggestion.attributeIds?.includes(a.id))
                            .map((a) => a.name)
                            .join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="wizard-review-card-tools">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetails(index);
                        }}
                      >
                        {expanded.has(index) ? "隐藏详情" : "自定义"}
                      </Button>
                      <Button
                        type="button"
                        data-testid={`skill-toggle-${index}`}
                        onClick={() => handleToggleSkill(index)}
                        variant="outline"
                        size="sm"
                        aria-pressed={suggestion.accepted}
                        disabled={!suggestion.accepted && acceptedCount >= maxSkills}
                      >
                        {suggestion.accepted ? "已选择" : "已排除"}
                      </Button>
                    </div>
                  </div>

                  {expanded.has(index) && (
                    <div
                      key={`skill-expanded-${index}`}
                      className="wizard-review-card-detail"
                    >
                      <WizardFormGroup label="名称">
                        <WizardTextField
                          value={suggestion.name}
                          onChange={(value) =>
                            handleModifySkill(index, 'name', value)
                          }
                          testId={`skill-name-input-${index}`}
                        />
                      </WizardFormGroup>

                      <WizardFormGroup label="描述">
                        <WizardTextArea
                          value={suggestion.description}
                          onChange={(value) =>
                            handleModifySkill(index, 'description', value)
                          }
                          rows={2}
                          testId={`skill-description-textarea-${index}`}
                        />
                      </WizardFormGroup>

                      <div className="wizard-review-detail-row">
                        <div>
                          <WizardFormGroup label="难度">
                            <WizardSelect
                              value={suggestion.difficulty}
                              onChange={(value) =>
                                handleModifySkill(index, 'difficulty', value)
                              }
                              options={SKILL_DIFFICULTIES.map((difficulty) => ({
                                value: difficulty.value,
                                label: difficulty.label,
                              }))}
                              testId={`skill-difficulty-select-${index}`}
                            />
                          </WizardFormGroup>
                        </div>

                        <div>
                          <WizardFormGroup label="关联属性">
                            <div className="form-help-text">
                              选择该技能依赖的一项或多项属性
                            </div>
                            <div
                              className="wizard-skill-attr-grid"
                              data-testid={`skill-attributes-${index}`}
                            >
                              {attributes.length > 0 ? (
                                attributes.map((attribute) => (
                                  <div
                                    key={attribute.id}
                                    className="wizard-skill-attr-option"
                                  >
                                    <Checkbox
                                      id={`skill-${index}-attribute-${attribute.id}`}
                                      checked={
                                        suggestion.attributeIds?.includes(
                                          attribute.id
                                        ) || false
                                      }
                                      onChange={() =>
                                        handleAttributeToggle(
                                          index,
                                          attribute.id
                                        )
                                      }
                                      label={attribute.name}
                                      data-testid={`skill-${index}-attribute-${attribute.name}-checkbox`}
                                    />
                                    {attribute.description && (
                                      <div>{attribute.description}</div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p>
                                  没有可用的属性。技能将不会关联任何属性。
                                </p>
                              )}
                            </div>
                          </WizardFormGroup>
                        </div>
                      </div>

                      {/* Default Value Range Editor */}
                      <div>
                        {suggestion.accepted && (
                          <SkillRangeEditor
                            skill={toWorldSkill(suggestion)}
                            onChange={(updates) => {
                              if (updates.baseValue !== undefined) {
                                updateSuggestion(index, { baseValue: updates.baseValue });
                              }
                            }}
                            showLevelDescriptions={true}
                          />
                        )}

                        <div>
                          <p>数值范围为 1（新手）到 5（大师）。</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Custom Skills Section */}
          <div className="wizard-review-custom" data-tutorial="skill-custom">
            <div className="wizard-review-custom-head">
              <div className="wizard-review-custom-heading">
                <h3 className="wizard-subheading">自定义技能</h3>
                <p>
                  为这个世界创建你自己的独特技能（{acceptedCount}
                  /{maxSkills} 个槽位已使用）
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddCustomSkill}
                variant="outline"
                size="sm"
                data-testid="add-custom-skill-button"
                disabled={acceptedCount >= maxSkills}
              >
                + 添加自定义技能
              </Button>
            </div>

            {customSkills.length === 0 && !isCreatingCustomSkill ? (
              <div className="wizard-empty-state">
                <p>还没有自定义技能</p>
                <p>
                  {acceptedCount < maxSkills
                    ? `你有 ${maxSkills - acceptedCount} 个技能槽位${''} 可用于自定义技能`
                    : "移除一些系统建议的技能，以添加自定义技能"}
                </p>
              </div>
            ) : (
              <div className="wizard-review-custom-list">
                {customSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`${wizardStyles.card.base} wizard-review-card`}
                    data-testid={`custom-skill-card-${skill.id}`}
                  >
                    <div className="wizard-review-card-head">
                      <div className="wizard-review-card-meta">
                        <span>{skill.name}</span>
                        <span>自定义</span>
                        <span className={difficultyBadgeClass(skill.difficulty)}>
                          {displayLabel(skill.difficulty)}
                        </span>
                        {skill.attributeIds &&
                          skill.attributeIds.length > 0 && (
                            <span>
                                                          关联：{' '}
                                                          {skill.attributeIds
                                                            .map(
                                                              (attrId) =>
                                                                attributes.find(
                                                                  (attr) => attr.id === attrId
                                                                )?.name
                                                            )
                                                            .filter(Boolean)
                                                            .join(', ')}                            </span>
                          )}
                      </div>
                      <div className="wizard-review-card-tools">
                        <Button
                          type="button"
                          onClick={() => handleEditCustomSkill(skill.id)}
                          variant="link"
                          size="sm"
                          data-testid={`edit-custom-skill-${skill.id}`}
                        >
                          编辑
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleDeleteCustomSkill(skill.id)}
                          variant="destructive"
                          size="sm"
                          data-testid={`delete-custom-skill-${skill.id}`}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                    <div className="wizard-review-card-detail">{skill.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Skill Editor */}
            {isCreatingCustomSkill && (
              <div className="wizard-custom-editor" data-testid="custom-skill-editor">
                <SkillEditor
                  worldId={worldData.id || ''}
                  mode={editingCustomSkillId ? 'edit' : 'create'}
                  skillId={editingCustomSkillId || undefined}
                  existingSkills={worldData.skills ?? []}
                  existingAttributes={attributes}
                  maxSkills={maxSkills}
                  onSave={handleSaveCustomSkill}
                  onDelete={
                    editingCustomSkillId ? handleDeleteCustomSkill : undefined
                  }
                  onCancel={handleCancelCustomSkill}
                />
              </div>
            )}
          </div>
        </div>

        <div
          className="wizard-slot-summary"
          data-testid="skill-count-summary"
          data-tutorial="skill-summary"
        >
          <div className="wizard-slot-summary-text">
            <div className="wizard-slot-summary-count">
              <span>已选技能： {acceptedCount} / {maxSkills}</span>
              {acceptedCount >= maxSkills && <span>（已达上限）</span>}
            </div>
            <div className="wizard-slot-summary-note">
              {acceptedCount < maxSkills
                ? `有 ${maxSkills - acceptedCount} 个槽位${''} 可用`
                : "所有槽位已满"}
            </div>
          </div>
          <div className="wizard-slot-meter-wrap">
            <div className="wizard-slot-meter">
              {Array.from({ length: maxSkills }).map((_, i) => (
                <div
                  key={i}
                  className={
                    i < acceptedCount
                      ? 'wizard-slot-cell wizard-slot-cell-filled'
                      : 'wizard-slot-cell'
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </WizardFormSection>

      {errors.skills && (
        <div className={wizardStyles.form.error}>{errors.skills}</div>
      )}

      <ConfirmationDialog
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleClearSuggestions}
        title="清除建议？"
        message="这会移除两个审核步骤中的所有建议属性和技能。你添加的自定义属性和技能会保留。你可以从描述步骤重新生成建议。"
        variant="destructive"
        confirmText="清除建议"
        cancelText="取消"
      />
    </div>
  );
}
