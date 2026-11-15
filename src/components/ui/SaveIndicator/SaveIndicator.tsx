/**
 * SaveIndicator component - Shows auto-save status and controls
 */

import React from 'react';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingState } from '@/components/ui/LoadingState';
import { clsx } from 'clsx';
import { formatTime } from '@/lib/utils';
import type { SaveTriggerReason } from '@/types/game.types';

export interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaveTime?: string | null;
  errorMessage?: string | null;
  totalSaves?: number;
  onManualSave?: (reason: SaveTriggerReason) => void;
  onRetryError?: () => void;
  retryable?: boolean;
  className?: string;
  compact?: boolean;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  status,
  lastSaveTime,
  errorMessage,
  totalSaves = 0,
  onManualSave,
  onRetryError,
  retryable = false,
  className = '',
  compact = false,
}) => {
  const getStatusText = () => {
    if (status === 'saving') {
      return "保存中……";
    }
    if (lastSaveTime) {
      return `保存于 ${formatTime(lastSaveTime)}`;
    }
    return "已保存";
  };

  // Handle error state with ErrorDisplay component
  if (status === 'error') {
    return (
      <div className={clsx('save-indicator save-indicator-error', className)}>
        <ErrorDisplay
          variant={compact ? 'inline' : 'section'}
          severity="error"
          title={compact ? undefined : "自动保存错误"}
          message={errorMessage || "无法保存你的进度。你最近的操作尚未存储。"}
          showRetry={retryable && !!onRetryError}
          onRetry={onRetryError}
          showDismiss={false}
        />
      </div>
    );
  }

  // Handle saving state with LoadingState component
  if (status === 'saving') {
    return (
      <div className={clsx('save-indicator', compact && 'save-indicator-compact', className)}>
        <LoadingState
          variant="spinner"
          message={compact ? undefined : "正在保存……"}
        />
        {onManualSave && (
          <button className="save-indicator-button" disabled={true} type="button">
            立即保存
          </button>
        )}
      </div>
    );
  }

  // Handle idle/saved states
  return (
    <div className={clsx('save-indicator', compact && 'save-indicator-compact', className)}>
      <div className="save-indicator-status">
        <div className="save-indicator-copy">
          <span className="save-indicator-text">{getStatusText()}</span>

          {totalSaves > 0 && !compact && <span className="save-indicator-meta">{totalSaves} 次存档</span>}
        </div>
      </div>

      {onManualSave && (
        <button className="save-indicator-button" onClick={() => onManualSave('manual')} type="button">
          立即保存
        </button>
      )}
    </div>
  );
};
