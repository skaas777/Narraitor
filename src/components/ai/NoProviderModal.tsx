import React from 'react';
import { useRouter } from 'next/navigation';
import { SimpleModal } from '@/components/shared/SimpleModal';
import { Button } from '@/components/ui/button';
import './provider-config.css';

interface NoProviderModalProps {
  isOpen: boolean;
  /** Optional override; defaults to navigating to the providers settings page. */
  onConfigure?: () => void;
}

/**
 * Blocking modal shown when a player tries to play without a configured
 * provider. There's no close button and the backdrop won't dismiss it — the
 * only way forward is to set up a provider.
 */
export function NoProviderModal({ isOpen, onConfigure }: NoProviderModalProps) {
  const router = useRouter();

  const handleConfigure = () => {
    if (onConfigure) {
      onConfigure();
    } else {
      router.push('/settings/providers');
    }
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={() => {}}
      title="连接模型服务以开始游戏"
      showCloseButton={false}
      closeOnBackdropClick={false}
      closeOnEscape={false}
      description="故事将使用你自己的模型服务密钥生成，密钥保存在此浏览器中。添加一个即可开始游戏。"
    >
      <div className="component-no-provider-modal">
        <div className="no-provider-actions">
          <Button variant="default" onClick={handleConfigure}>
            设置模型服务
          </Button>
        </div>
      </div>
    </SimpleModal>
  );
}
