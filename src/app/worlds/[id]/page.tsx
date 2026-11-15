'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Play, Users, Settings } from 'lucide-react';
import { useWorldStore } from '@/state/worldStore';
import { useCharacterStore, type StoreCharacter } from '@/state/characterStore';
import { WorldDetailsDisplay } from '@/components/world/WorldDetailsDisplay';
import { NotFoundState } from '@/components/shared/NotFoundState';
import { ActionButtonGroup } from '@/components/shared/ActionButtonGroup';
import { PageLayout } from '@/components/shared/PageLayout';
import { Hero } from '@/components/shared/Hero';
import { getGenreLabel } from '@/lib/constants/genres';

export default function WorldViewPage() {
  const params = useParams();
  const router = useRouter();
  const worldId = params.id as string;
  const [mounted, setMounted] = useState(false);
  const world = useWorldStore((state) => state.worlds[worldId]);
  const currentWorldId = useWorldStore((state) => state.currentWorldId);
  const setCurrentWorld = useWorldStore((state) => state.setCurrentWorld);
  const characters = useCharacterStore((state) => state.characters);

  const worldCharacters = Object.values(characters).filter((char): char is StoreCharacter => char.worldId === worldId);
  const isActive = currentWorldId === worldId;

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Keep SSR/client markup stable; decide after hydration
    return (
      <PageLayout>
        <div />
      </PageLayout>
    );
  }

  if (!world) {
    return (
      <NotFoundState
        title="未找到世界"
        message="你查找的世界不存在。"
        backUrl="/worlds"
        backLabel="返回世界列表"
      />
    );
  }

  const handlePlayInWorld = () => {
    if (worldCharacters.length === 0) {
      // No characters in this world, redirect to characters page
      router.push(`/characters?worldId=${worldId}`);
    } else {
      // Has characters, go to play page
      router.push(`/worlds/${worldId}/play`);
    }
  };

  const handleMakeActive = () => {
    setCurrentWorld(worldId);
  };

  const actionButtons = [
    // Only show Make Active button if world is not currently active
    ...(!isActive ? [{
      label: "设为当前",
      onClick: handleMakeActive,
      variant: 'secondary' as const
    }] : []),
    {
      label: "查看角色",
      onClick: () => router.push(`/characters?worldId=${worldId}`),
      variant: 'secondary' as const,
      icon: (
        <Users aria-hidden="true" />
      )
    },
    {
      label: "编辑世界",
      onClick: () => router.push(`/worlds/${worldId}/edit`),
      variant: 'secondary' as const,
      icon: (
        <Settings aria-hidden="true" />
      )
    },
    {
      label: "在世界中游玩",
      onClick: handlePlayInWorld,
      variant: 'default' as const,
      icon: (
        <Play aria-hidden="true" />
      )
    }
  ];

  const headerBackground = world.image?.url ? (
    <div className="characters-header-vignette world-detail-vignette" aria-hidden="true">
      <Hero
        image={{
          url: world.image.url,
          alt: `${world.name} 世界`,
        }}
        treatment="colour"
      />
    </div>
  ) : null;

  return (
    <PageLayout
      title={world.name}
      description={world.genre ? getGenreLabel(world.genre) : undefined}
      actions={
        <ActionButtonGroup
          actions={actionButtons.map(btn => ({
            ...btn,
            flex: btn.variant === 'default'
          }))}
          layout="horizontal"
          gap="sm"
        />
      }
      headerBackground={headerBackground}
      headerClassName="characters-world-masthead world-detail-masthead"
    >
      <section className="world-detail-body" aria-label="世界详情">
        <WorldDetailsDisplay world={world} />
      </section>
    </PageLayout>
  );
}
