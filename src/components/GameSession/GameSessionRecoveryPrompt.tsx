'use client';

import React, { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';

interface GameSessionRecoveryPromptProps {
  isOpen: boolean;
  worldName: string;
  characterName: string;
  /** ISO timestamp of the last activity before the session ended abnormally. */
  lastActivity: string;
  narrativeCount: number;
  onRestore: () => void;
  onDismiss: () => void;
}

/**
 * Recovery prompt shown when a previous game session ended unexpectedly
 * (browser crash, tab killed). Offers to restore the auto-saved session or to
 * step away and start fresh.
 *
 * Built on the Radix dialog primitives directly — with its own scoped overlay
 * and surface classes — so it presents as a centered modal with its own focus
 * trap and scrim, rather than inheriting the shared modal's in-flow rendering.
 */
export function GameSessionRecoveryPrompt({
  isOpen,
  worldName,
  characterName,
  lastActivity,
  narrativeCount,
  onRestore,
  onDismiss,
}: GameSessionRecoveryPromptProps) {
  const relativeTime = formatRelativeTime(lastActivity);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  // Lead with the primary action for keyboard users.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timer = setTimeout(() => continueButtonRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onDismiss();
        }
      }}
    >
      <DialogContent
        className="game-session-recovery-modal"
        overlayClassName="game-session-recovery-scrim"
        overlayScroll
        showCloseButton={false}
        aria-describedby="game-session-recovery-desc"
      >
        <div className="game-session-recovery-prompt">
          <div className="game-session-recovery-prompt-icon" aria-hidden="true">
            <RotateCcw />
          </div>
          <div className="game-session-recovery-prompt-body">
            <DialogTitle className="game-session-recovery-prompt-title">
              欢迎回来——要从上次中断处继续吗？
            </DialogTitle>
            <p
              id="game-session-recovery-desc"
              className="game-session-recovery-prompt-lead"
            >
              上次冒险记录在你保存进度前就结束了。别担心——你的故事已安全保留。现在就从上次离开的地方继续吧。
            </p>
            <dl className="game-session-recovery-prompt-details">
              <div className="game-session-recovery-prompt-detail">
                <dt>世界</dt>
                <dd>{worldName}</dd>
              </div>
              <div className="game-session-recovery-prompt-detail">
                <dt>角色</dt>
                <dd>{characterName}</dd>
              </div>
              {narrativeCount > 0 && (
                <div className="game-session-recovery-prompt-detail">
                  <dt>进度</dt>
                  <dd>
                    {narrativeCount} {narrativeCount === 1 ? 'scene' : 'scenes'}
                  </dd>
                </div>
              )}
              <div className="game-session-recovery-prompt-detail">
                <dt>上次游玩</dt>
                <dd>{relativeTime}</dd>
              </div>
            </dl>
            <div className="game-session-recovery-prompt-actions">
              <Button
                variant="outline"
                onClick={onDismiss}
                aria-label="关闭恢复提示并重新开始"
              >
                重新开始
              </Button>
              <Button
                ref={continueButtonRef}
                variant="default"
                onClick={onRestore}
                aria-label="继续已恢复的冒险"
              >
                继续冒险
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
