'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  initializeCloud, getCloudStatus, subscribeCloud, getCloudProvider,
  finishCloudHydration, checkCloudVersion, flushCloud, loadLatestCloud, downloadLocalBackup,
  reportCloudStartupFailure,
} from '@/lib/cloud/client';
import { PERSONAL_CLOUD_ENABLED } from '@/lib/cloud/schema';
import { useProviderStore } from '@/state/providerStore';
import './personal-cloud.css';

/** Mount gameplay only after the complete cloud save has been restored. */
export function PersonalCloudGate({ children }: { children: React.ReactNode }) {
  const status = useSyncExternalStore(subscribeCloud, getCloudStatus, getCloudStatus);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!PERSONAL_CLOUD_ENABLED) return;
    let active = true;
    void (async () => {
      await initializeCloud();
      if (getCloudStatus().phase === 'conflict') return;
      const modules = await Promise.all([
        import('@/state/worldStore'), import('@/state/characterStore'), import('@/state/sessionStore'),
        import('@/state/narrativeStore'), import('@/state/inventoryStore'), import('@/state/journalStore'),
        import('@/state/goalStore'), import('@/state/npcStore'), import('@/state/loreStore'),
        import('@/state/sceneStore'), import('@/state/worldThreadStore'),
      ]);
      const stores = modules.flatMap((module) => Object.values(module)).filter((value) =>
        typeof value === 'function' && 'persist' in value) as unknown as { persist: { rehydrate: () => Promise<void> } }[];
      await Promise.all(stores.map((store) => store.persist.rehydrate()));
      await useProviderStore.persist.rehydrate();
      const provider = getCloudProvider();
      if (provider) {
        const id = 'personal-cloud-provider';
        useProviderStore.setState((state) => ({
          providers: { ...state.providers, [id]: {
            ...provider, id, type: 'openai-compatible',
            capabilities: { text: true, images: false, streaming: true },
            createdAt: '2026-11-16T00:00:00Z', updatedAt: '2026-11-16T00:00:00Z',
          } }, activeProviderId: id,
        }));
      }
      finishCloudHydration();
      if (active) setHydrated(true);
    })().catch(reportCloudStartupFailure);
    const focus = () => { void checkCloudVersion(); };
    const visibility = () => {
      if (document.visibilityState === 'hidden') void flushCloud(); else focus();
    };
    window.addEventListener('focus', focus);
    window.addEventListener('online', focus);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      active = false;
      window.removeEventListener('focus', focus);
      window.removeEventListener('online', focus);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  if (!PERSONAL_CLOUD_ENABLED) return children;
  if (status.phase === 'conflict') {
    return <div className="personal-cloud-screen"><h1>另一台设备的进度已更新</h1>
      <p>为保护存档，当前页面已暂停。载入最新云端进度后就能继续。</p>
      <button onClick={loadLatestCloud}>载入云端最新进度</button>
      <button onClick={downloadLocalBackup}>下载当前设备的备份</button>
    </div>;
  }
  if (status.phase === 'error') {
    return <div className="personal-cloud-screen"><h1>暂时无法读取云端存档</h1>
      <p>请检查网络或重新登录。已有存档会保留。</p>
      <button onClick={() => window.location.reload()}>重试</button>
    </div>;
  }
  if (!hydrated) return <div className="personal-cloud-screen" role="status">正在恢复你的云端冒险……</div>;
  return <>
    {status.phase === 'offline' && <div className="personal-cloud-status personal-cloud-offline" role="status">
      <span>连接中断，进度已保留在此设备，正在重试同步</span>
      <button onClick={() => { void flushCloud(); }}>立即重试</button>
    </div>}
    {children}
  </>;
}
