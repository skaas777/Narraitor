'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCharacterStore } from '@/state/characterStore';
import { CharacterEditor } from '@/components/CharacterEditor';
import { NotFoundState } from '@/components/shared/NotFoundState';
import { PageLayout } from '@/components/shared/PageLayout';
import { BackNavigation } from '@/components/shared/BackNavigation';

export default function CharacterEditPage() {
  const params = useParams();
  const characterId = params.id as string;
  const { characters } = useCharacterStore();
  const [mounted, setMounted] = useState(false);
  const character = characters[characterId];

  useEffect(() => setMounted(true), []);

  // Keep SSR and first client paint identical; decide after hydration
  if (!mounted) {
    return (
      <PageLayout>
        <div />
      </PageLayout>
    );
  }

  if (!character) {
    return (
      <NotFoundState
        title="未找到角色"
        message="你要编辑的角色不存在或已被删除。"
        backUrl="/characters"
        backLabel="返回角色列表"
      />
    );
  }

  return (
    <PageLayout title={`编辑角色：${character.name}`}>
      <div className="character-edit-back">
        <BackNavigation href={`/characters/${characterId}`} label="返回角色" />
      </div>

      <div className="character-edit-body">
        <CharacterEditor characterId={characterId} />
      </div>
    </PageLayout>
  );
}
