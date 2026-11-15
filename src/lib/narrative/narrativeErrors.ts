/**
 * Narrative-styled error copy for the game-session play loop.
 *
 * Errors that surface while a story is being generated should read as part of
 * the story, not as technical faults. This maps an error to genre-neutral,
 * jargon-free copy and frames the recovery action as a narrative choice.
 *
 * Scoped to the play surfaces on purpose - the global getUserFriendlyError copy
 * stays generic because it is also used in non-narrative contexts (forms, etc.).
 */

import {
  getUserFriendlyError,
  ErrorType,
  type ErrorSeverity,
} from '@/lib/utils/errorUtils';

export interface NarrativeError {
  title: string;
  message: string;
  /** Narrative-appropriate next step the player can take. */
  suggestion?: string;
  retryable: boolean;
  /** Recovery action framed as a narrative choice. */
  retryLabel: string;
  severity: ErrorSeverity;
}

export const PARTIAL_RECONCILIATION_ERROR: NarrativeError = {
  title: "故事暂停了",
  message: "故事已推进，但部分冒险记录的变更未完成。",
  suggestion: "请在此停下，不要再做出选择。",
  retryable: false,
  retryLabel: "继续故事",
  severity: 'error',
};

const RETRY_LABEL = "继续故事";

const NARRATIVE_COPY: Record<
  ErrorType,
  { title: string; message: string; suggestion: string }
> = {
  [ErrorType.NETWORK]: {
    title: "故事暂停了",
    message: "继续故事所需的连接已断开。",
    suggestion: "请检查网络连接，然后从上次停下的地方继续。",
  },
  [ErrorType.SERVICE]: {
    title: "故事需要稍等片刻",
    message: "故事推进得太快，一时难以跟上。",
    suggestion: "请稍等片刻，然后继续。",
  },
  [ErrorType.AUTH]: {
    title: "故事无法继续",
    message: "在账户设置处理妥当之前，你的故事无法继续。",
    suggestion: "请打开设置检查你的访问权限，然后返回故事。",
  },
  [ErrorType.VALIDATION]: {
    title: "这与故事不符",
    message: "发生的部分内容未能按预期衔接起来。",
    suggestion: "请尝试继续——如果问题反复出现，请刷新并恢复。",
  },
  [ErrorType.UNKNOWN]: {
    title: "故事出了岔子",
    message: "有意外情况打断了你的故事。",
    suggestion: "请尝试继续——如果问题反复出现，请刷新并恢复。",
  },
};

/**
 * Maps an error (or raw error string) to narrative-styled copy. Reuses the
 * shared categorization in errorUtils for severity and messaging, but failed
 * generation turns that did not advance the story are retryable for every
 * error type except AUTH.
 */
export function getNarrativeError(error: Error | string): NarrativeError {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  const { type, severity } = getUserFriendlyError(errorObj);
  const copy = NARRATIVE_COPY[type];

  return {
    title: copy.title,
    message: copy.message,
    suggestion: copy.suggestion,
    retryable: type !== ErrorType.AUTH,
    retryLabel: RETRY_LABEL,
    severity,
  };
}
