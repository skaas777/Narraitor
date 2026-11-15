'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { ActionButtonGroup } from '@/components/shared/ActionButtonGroup';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { formatRelativeTime } from '@/lib/utils';
import type { SavedSessionInfo } from '@/types/game.types';
import { useWorldStore } from '@/state/worldStore';
import { useCharacterStore } from '@/state/characterStore';

interface DashboardContinueCardProps {
  session: SavedSessionInfo;
  world: ReturnType<typeof useWorldStore.getState>['worlds'][string];
  character: ReturnType<
    typeof useCharacterStore.getState
  >['characters'][string];
  onContinue: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export function DashboardContinueCard({
  session,
  world,
  character,
  onContinue,
  onDelete,
}: DashboardContinueCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const lastPlayedText = formatRelativeTime(session.lastPlayed);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(session.id);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <section
        className="component-dashboard-continue-card"
        aria-labelledby="continue-session-heading"
      >
        {/* World image as an atmospheric background layer. Hidden by
            default; per-theme CSS opts in and applies a legibility scrim. */}
        {world.image?.url && (
          <div className="dashboard-continue-card-bg" aria-hidden="true">
            <Image src={world.image.url} alt="" fill sizes="100vw" />
          </div>
        )}

        <h2 id="continue-session-heading">继续你的冒险记录</h2>

        <div className="dashboard-continue-card-row">
          {/* Character Portrait */}
          <div className="dashboard-continue-card-portrait">
            <CharacterPortrait
              portrait={
                character.portrait || { type: 'placeholder', url: null }
              }
              characterName={character.name}
              size="large"
            />
          </div>

          {/* Game Info */}
          <div className="dashboard-continue-card-info">
            <dl className="dashboard-continue-card-fields">
              <div className="dashboard-continue-card-field">
                <dt>世界</dt>
                <dd>{world.name}</dd>
              </div>
              <div className="dashboard-continue-card-field">
                <dt>角色</dt>
                <dd>{character.name}</dd>
              </div>
            </dl>

            <p className="dashboard-continue-card-meta">
              <time dateTime={session.lastPlayed}>
                上次游玩 {lastPlayedText}
              </time>
            </p>
          </div>
        </div>

        <ActionButtonGroup
          layout="horizontal"
          gap="sm"
          actions={[
            {
              label: "继续上次冒险",
              onClick: () => onContinue(session.id),
              variant: 'default',
            },
            {
              label: "删除",
              onClick: () => setIsDeleteDialogOpen(true),
              variant: 'ghost',
            },
          ]}
        />
      </section>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="删除冒险记录"
        description="删除此冒险记录的故事进度和日志条目。此操作无法撤销。"
        itemName={`${world.name} - ${character.name}`}
        isDeleting={isDeleting}
      />
    </>
  );
}
