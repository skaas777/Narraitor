/**
 * RecoveryNotification Component
 *
 * A modal dialog that presents recovery options when saved character creation data is detected.
 * Lets the player recover previous progress or start fresh, and warns when recovering would
 * overwrite data already entered in the current form.
 *
 * @example
 * ```tsx
 * function CharacterCreationWizard() {
 *   const { hasRecoveryData, recoveryPreview, hasCurrentData, clearAutoSave } =
 *     useDraftAutoSave({ storageKey, analyzeRecovery, hasCurrentData, isValidDraft });
 *   const [showDialog, setShowDialog] = useState(false);
 *
 *   useEffect(() => {
 *     if (hasRecoveryData) setShowDialog(true);
 *   }, [hasRecoveryData]);
 *
 *   return (
 *     <RecoveryNotification
 *       isVisible={showDialog}
 *       lastSaved={recoveryPreview?.lastSaved}
 *       recoveryData={recoveryPreview}
 *       hasCurrentData={hasCurrentData}
 *       onRecover={() => setShowDialog(false)}
 *       onDismiss={() => { clearAutoSave(); setShowDialog(false); }}
 *     />
 *   );
 * }
 * ```
 */

import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { SimpleModal } from './SimpleModal';
import { formatDateTime } from '@/lib/utils';
import './RecoveryNotification.css';
import { displayLabel } from '@/lib/i18n/zhCN';

/**
 * Recovery data structure containing analyzed save information for preview display
 */
interface RecoveryData {
  /** Character or World name from saved data */
  name?: string;
  /** Genre from saved data */
  genre?: string;
  /** Description from saved data */
  description?: string;
  /** Current wizard step index (0-based) */
  currentStep?: number;
  /** ISO timestamp of when data was last saved */
  lastSaved?: string;
  /** Whether character/world has allocated attributes */
  hasAttributes?: boolean;
  /** Whether character/world has selected skills */
  hasSkills?: boolean;
  /** Whether character has completed background information */
  hasBackground?: boolean;
  /** Number of skills selected by the character */
  selectedSkillCount?: number;
  /** Total attribute points allocated across all attributes */
  totalAttributePoints?: number;
  /** Number of attributes created or present */
  attributeCount?: number;
  /** Number of skills created or present */
  skillCount?: number;
}

/**
 * Props interface for RecoveryNotification component
 */
interface RecoveryNotificationProps {
  /** Controls modal dialog visibility */
  isVisible: boolean;
  /** ISO timestamp of when data was last saved (for display purposes) */
  lastSaved?: string;
  /** Analyzed recovery data for generating user-friendly preview */
  recoveryData?: RecoveryData;
  /** Whether current form has meaningful data that would be overwritten by recovery */
  hasCurrentData?: boolean;
  /** Callback fired when user chooses to recover saved data */
  onRecover: () => void;
  /** Callback fired when user chooses to dismiss recovery and start fresh */
  onDismiss: () => void;
  /** Optional custom title for modal */
  title?: string;
  /** Optional custom description for modal */
  description?: string;
  /** Optional custom step names array */
  stepNames?: string[];
}

/**
 * RecoveryNotification Component
 *
 * Renders a modal dialog allowing users to choose between recovering saved character data
 * or starting fresh. Includes data preview and conflict warnings.
 *
 * @param props - Component props
 * @returns JSX element or null if not visible
 */
export function RecoveryNotification({
  isVisible,
  lastSaved,
  recoveryData,
  hasCurrentData = false,
  onRecover,
  onDismiss,
  title,
  description,
  stepNames,
}: RecoveryNotificationProps) {
  /** Reference to the recover button for focus management */
  const recoverButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Auto-focus the primary action button when dialog becomes visible
   * Ensures keyboard accessibility and proper focus flow
   */
  useEffect(() => {
    if (isVisible && recoverButtonRef.current) {
      recoverButtonRef.current.focus();
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  // Format timestamp with error handling
  const formattedDate = lastSaved ? formatDateTime(lastSaved) : null;
  const validDate =
    formattedDate && formattedDate !== 'Invalid date' ? formattedDate : null;

  /**
   * Maps step index to user-friendly step name
   * @param step - Zero-based step index
   * @returns Human-readable step description
   */
  const getStepDescription = (step?: number): string => {
    const names = stepNames || [
      "基本信息",
      "属性",
      "技能",
      "背景",
      "肖像",
    ];
    if (step !== undefined && step >= 0 && step < names.length) {
      return `${names[step]} 步骤`;
    }
    return "未知步骤";
  };

  return (
    <SimpleModal
      isOpen={isVisible}
      onClose={onDismiss}
      title={title || "发现角色创建进度"}
      description={description}
      showCloseButton={true}
      contentClassName="component-recovery-notification"
    >
      {hasCurrentData && (
        <div className="recovery-notification-warning" role="note">
          <AlertTriangle
            className="recovery-notification-warning-icon"
            aria-hidden="true"
          />
          <p>
            <strong>警告：</strong> 恢复将替换你已输入的所有当前表单数据。
          </p>
        </div>
      )}

      {recoveryData && (
        <div className="recovery-notification-preview">
          <h4>已保存进度预览</h4>
          <dl>
            {recoveryData.name && (
              <div className="recovery-notification-preview-row">
                <dt>名称</dt>
                <dd>{recoveryData.name}</dd>
              </div>
            )}
            {recoveryData.genre && (
              <div className="recovery-notification-preview-row">
                <dt>题材</dt>
                <dd>{displayLabel(recoveryData.genre)}</dd>
              </div>
            )}
            {recoveryData.currentStep !== undefined && (
              <div className="recovery-notification-preview-row">
                <dt>进度</dt>
                <dd>{getStepDescription(recoveryData.currentStep)}</dd>
              </div>
            )}
            {recoveryData.hasAttributes &&
              (recoveryData.totalAttributePoints !== undefined || recoveryData.attributeCount !== undefined) && (
                <div className="recovery-notification-preview-row">
                  <dt>属性</dt>
                  <dd>
                    {recoveryData.totalAttributePoints !== undefined
                      ? `已分配 ${recoveryData.totalAttributePoints} 点`
                      : recoveryData.attributeCount}
                  </dd>
                </div>
              )}
            {recoveryData.hasSkills &&
              (recoveryData.selectedSkillCount !== undefined || recoveryData.skillCount !== undefined) && (
                <div className="recovery-notification-preview-row">
                  <dt>技能</dt>
                  <dd>
                    {recoveryData.selectedSkillCount !== undefined
                      ? `已选择 ${recoveryData.selectedSkillCount} 项`
                      : recoveryData.skillCount}
                  </dd>
                </div>
              )}
            {recoveryData.hasBackground && (
              <div className="recovery-notification-preview-row">
                <dt>背景</dt>
                <dd>已完成</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {validDate && (
        <p className="recovery-notification-last-saved">
          上次保存： {validDate}
        </p>
      )}

      <div className="recovery-notification-actions">
        <Button ref={recoverButtonRef} onClick={onRecover}>
          恢复进度
        </Button>
        <Button onClick={onDismiss} variant="outline">
          重新开始
        </Button>
      </div>
    </SimpleModal>
  );
}
