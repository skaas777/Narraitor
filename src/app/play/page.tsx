'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useWorldStore } from '@/state/worldStore';
import { useCharacterStore } from '@/state/characterStore';
import { useSessionStore } from '@/state/sessionStore';
import { LoadingPulse } from '@/components/ui/LoadingState';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { PageLayout } from '@/components/shared/PageLayout';
import { getGenreLabel } from '@/lib/constants/genres';
import { Button } from '@/components/ui/button';

import Logger from '@/lib/utils/logger';
const logger = new Logger('Play');

// GameSession drags in the full narrative/AI chain; load it on demand and reuse
// the page's existing loading state so first paint stays light.
const GameSession = dynamic(() => import('@/components/GameSession/GameSession'), {
  ssr: false,
  loading: () => <LoadingPulse message="正在准备你的冒险……" />,
});

type PersistApi = {
  persist?: {
    hasHydrated?: () => boolean;
    onFinishHydration?: (callback: () => void) => () => void;
  };
};

const getPersist = (store: unknown): PersistApi['persist'] =>
  (store as PersistApi).persist;

export default function PlayPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const currentWorldId = useWorldStore(state => state.currentWorldId);
  const currentWorld = useWorldStore(state => state.worlds[currentWorldId || '']);
  const currentCharacterId = useCharacterStore((state) => state.currentCharacterId);
  const initializeSession = useSessionStore(state => state.initializeSession);
  const currentSessionId = useSessionStore(state => state.id);

  // Wait for all three persisted stores to finish hydrating before reading
  // their values for redirect decisions. Reading pre-hydration causes a
  // redirect race that lands users on /worlds and surfaces a Next.js error.
  useEffect(() => {
    const persists = [
      getPersist(useWorldStore),
      getPersist(useCharacterStore),
      getPersist(useSessionStore),
    ];

    const allHydrated = persists.every(p => p?.hasHydrated?.() ?? true);
    if (allHydrated) {
      setHydrated(true);
      return;
    }

    let pending = persists.filter(p => p?.hasHydrated && !p.hasHydrated()).length;
    const unsubscribes: Array<() => void> = [];

    persists.forEach(p => {
      if (p?.onFinishHydration && p.hasHydrated && !p.hasHydrated()) {
        const unsub = p.onFinishHydration(() => {
          pending -= 1;
          if (pending <= 0) setHydrated(true);
        });
        unsubscribes.push(unsub);
      }
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const setupSession = async () => {
      try {
        // Check prerequisites
        if (!currentWorldId) {
          router.push('/worlds');
          return;
        }

        if (!currentCharacterId) {
          router.push('/characters');
          return;
        }

        // Initialize session if needed
        if (!currentSessionId) {
          await initializeSession(currentWorldId, currentCharacterId);
        }

        setIsLoading(false);
      } catch (err) {
        logger.error('Failed to initialize game session:', err);
        setError(err instanceof Error ? err.message : "启动游戏会话失败");
        setIsLoading(false);
      }
    };

    setupSession();
  }, [hydrated, currentWorldId, currentCharacterId, currentSessionId, initializeSession, router]);

  if (!hydrated || isLoading) {
    return (
      <main className="play-page play-page-loading">
        <LoadingPulse message="正在准备你的冒险……" />
      </main>
    );
  }

  if (error) {
    return (
      <div className="play-page play-page-shell play-page-shell-error">
        <PageLayout title="游戏会话错误">
          <ErrorDisplay
            variant="section"
            title="启动游戏失败"
            message={error}
            severity="error"
          />
          <div className="error-display-actions">
            <Button
              variant="outline"
              onClick={() => router.push('/worlds')}
            >
              选择世界
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/characters')}
            >
              选择角色
            </Button>
          </div>
        </PageLayout>
      </div>
    );
  }

  if (!currentSessionId) {
    return (
      <div className="play-page play-page-shell play-page-shell-warning">
        <PageLayout title="没有进行中的冒险记录">
          <ErrorDisplay
            variant="section"
            title="没有进行中的冒险记录"
            message="无法创建或继续冒险记录。"
            severity="warning"
          />
        </PageLayout>
      </div>
    );
  }

  const pageTitle = currentWorld ? `正在 ${currentWorld.name} 中进行冒险` : "冒险记录";
  const pageDescription = currentWorld?.genre ? getGenreLabel(currentWorld.genre) : undefined;

  return (
    <div className="play-page play-page-active">
      <PageLayout title={pageTitle} description={pageDescription}>
        <GameSession worldId={currentWorldId!} />
      </PageLayout>
    </div>
  );
}
