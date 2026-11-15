'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/shared/PageLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/button';
import { ProviderCard } from '@/components/ai/ProviderCard';
import { ProviderWizard } from '@/components/ai/ProviderWizard';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog/DeleteConfirmationDialog';
import { useProviderStore } from '@/state/providerStore';
import { useProviderHydration } from '@/hooks/useProviderHydration';
import { presetHasFixedSamplingControlsForEndpoint } from '@/lib/ai/presets';
import '@/components/ai/provider-config.css';
import { PERSONAL_CLOUD_ENABLED } from '@/lib/cloud/schema';
import { PersonalModelSettings } from '@/components/cloud/PersonalModelSettings';

/**
 * Provider management — list saved providers, switch / re-check / remove them,
 * and launch the setup wizard. Stories are generated with the player's own key,
 * stored in this browser.
 */
export default function ProvidersSettingsPage() {
  return PERSONAL_CLOUD_ENABLED ? <PersonalModelSettings /> : <LocalProvidersSettingsPage />;
}

function LocalProvidersSettingsPage() {
  const hasHydrated = useProviderHydration();
  const providers = useProviderStore((s) => s.providers);
  const activeProviderId = useProviderStore((s) => s.activeProviderId);
  const validationStatus = useProviderStore((s) => s.validationStatus);
  const setActiveProvider = useProviderStore((s) => s.setActiveProvider);
  const removeProvider = useProviderStore((s) => s.removeProvider);
  const validateProvider = useProviderStore((s) => s.validateProvider);
  const updateAdvancedSettings = useProviderStore((s) => s.updateAdvancedSettings);

  const [showWizard, setShowWizard] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [providerToRemoveId, setProviderToRemoveId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const list = Object.values(providers);

  const handleValidate = async (id: string) => {
    setValidatingId(id);
    try {
      await validateProvider(id);
    } finally {
      setValidatingId(null);
    }
  };

  // Once confirmed, removal runs to completion: cancel/escape are inert while
  // the await is in flight, and the dialog closes when it settles.
  const handleCloseRemoveDialog = () => {
    if (isRemoving) return;
    setProviderToRemoveId(null);
  };

  const handleConfirmRemove = async () => {
    if (!providerToRemoveId || isRemoving) return;
    setIsRemoving(true);
    try {
      await removeProvider(providerToRemoveId);
    } finally {
      setIsRemoving(false);
      setProviderToRemoveId(null);
    }
  };

  // Removal is destructive: the key is gone for good, and removing the last
  // provider also clears the stored encryption key. Spell out the stakes.
  const providerToRemove = providerToRemoveId ? providers[providerToRemoveId] : undefined;
  const removeMessage = !providerToRemove
    ? ''
    : list.length === 1
      ? "移除你唯一的模型服务也会清除存储在此浏览器中的加密密钥。游玩前你需要重新设置模型服务。"
      : providerToRemove.id === activeProviderId
        ? "此模型服务当前正在使用。将改用另一个已保存的模型服务。"
        : "确定要移除此模型服务吗？其已保存的密钥将从此浏览器中删除。";

  return (
    <PageLayout
      title="模型服务"
      description="添加用于生成故事的模型服务密钥。它会加密保存在此浏览器中，仅用于发起你自己的请求。"
      actions={
        hasHydrated && !showWizard && list.length > 0 ? (
          <Button onClick={() => setShowWizard(true)}>添加模型服务</Button>
        ) : undefined
      }
    >
      <div className="component-providers-page">
        {!hasHydrated ? (
          <LoadingState variant="skeleton" message="正在加载模型服务..." />
        ) : showWizard ? (
          <ProviderWizard
            onComplete={() => setShowWizard(false)}
            onCancel={() => setShowWizard(false)}
          />
        ) : list.length === 0 ? (
          <div className="providers-empty">
            <p>尚无模型服务。添加一个即可开始游玩。</p>
            <Button onClick={() => setShowWizard(true)}>设置模型服务</Button>
            <p className="providers-empty-help">
              不确定为什么需要自己的密钥，或者费用是多少？{' '}
              <Link href="/faq#why-my-own-key">常见问题中有说明</Link>.
            </p>
          </div>
        ) : (
          <div className="providers-list">
            {list.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isActive={provider.id === activeProviderId}
                validation={validationStatus[provider.id]}
                onSetActive={setActiveProvider}
                onValidate={handleValidate}
                onDelete={setProviderToRemoveId}
                onUpdateAdvancedSettings={updateAdvancedSettings}
                samplingControlsFixed={presetHasFixedSamplingControlsForEndpoint(provider.endpoint)}
                isValidating={validatingId === provider.id}
              />
            ))}
          </div>
        )}

        <DeleteConfirmationDialog
          isOpen={providerToRemoveId !== null}
          onClose={handleCloseRemoveDialog}
          onConfirm={handleConfirmRemove}
          title="移除模型服务"
          description={removeMessage}
          itemName={providerToRemove?.name || '此模型服务'}
          confirmButtonText="移除"
          isDeleting={isRemoving}
        />
      </div>
    </PageLayout>
  );
}
