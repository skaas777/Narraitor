'use client';
import { useState } from 'react';
import { getCloudProvider } from '@/lib/cloud/client';
import { PageLayout } from '@/components/shared/PageLayout';
import { Button } from '@/components/ui/button';

export function PersonalModelSettings() {
  const provider = getCloudProvider();
  const [state, setState] = useState<'idle' | 'testing' | 'ok' | 'failed'>('idle');
  async function test() {
    setState('testing');
    try {
      const response = await fetch('/api/personal/model', { method: 'POST', redirect: 'error' });
      const result = await response.json();
      setState(response.ok && result.valid ? 'ok' : 'failed');
    } catch { setState('failed'); }
  }
  return <PageLayout title="模型已为你配好" description="登录你的 Vercel 账号后，所有设备使用同一个模型，游戏进度自动保存到私有云端。">
    <div className="personal-model-card">
      <h2>{provider?.name ?? 'AI Genesis DeepSeek'}</h2>
      <p>模型：{provider?.model}</p><p>端点：{provider?.endpoint}</p>
      <p>密钥保存在服务端，换设备无需重新填写。此模型支持文字冒险，图片使用默认占位图。</p>
      <Button onClick={test} disabled={state === 'testing'}>{state === 'testing' ? '正在测试……' : '测试模型连接'}</Button>
      <p role="status">{state === 'ok' ? '连接成功，可以开始冒险。' : state === 'failed' ? '暂时连接失败，请稍后重试。' : ''}</p>
    </div>
  </PageLayout>;
}
