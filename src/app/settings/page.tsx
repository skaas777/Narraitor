'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/shared/PageLayout';
import { ExportImportControls } from '@/components/shared/ExportImportControls';
import { DarkModeToggle } from '@/components/Navigation/DarkModeToggle';
import { PERSONAL_CLOUD_ENABLED } from '@/lib/cloud/schema';

/**
 * SettingsPage - Application settings and configuration
 *
 * Provides access to application-wide settings including generation provider
 * connection, appearance color mode, and data management backup/restore.
 *
 * Rendered as open document-like sections with dotted heading dividers per
 * DS3 Mechanical Manuscript and the one-border-deep rule.
 */
export default function SettingsPage() {
  return (
    <PageLayout
      title="设置"
      description="管理你的设置并备份游戏数据。"
    >
      <div className="settings-page">
        {!PERSONAL_CLOUD_ENABLED && <section className="settings-section">
          <h2>模型服务</h2>
          <p className="settings-section-description">
            连接用于生成故事的模型服务密钥。它只会加密保存在此浏览器中，并且仅用于发起你自己的请求。
          </p>
          <div className="settings-section-actions">
            <Link
              href="/settings/providers"
              className="button button-default button-size-default"
            >
              管理模型服务
            </Link>
          </div>
        </section>}

        <section className="settings-section">
          <h2>外观</h2>
          <p className="settings-section-description">
            选择浅色、深色或跟随系统模式。你的选择会保存在此浏览器中，并应用于整个应用。
          </p>
          <div className="settings-appearance-row">
            <DarkModeToggle showLabels />
          </div>
        </section>

        <section className="settings-section">
          <h2>数据管理</h2>
          <p className="settings-section-description">
            {PERSONAL_CLOUD_ENABLED
              ? '世界、角色和游戏进度会自动保存到私有云端。你也可以额外导出备份。'
              : "备份并恢复你的世界、角色和游戏进度。"}
          </p>
          <ExportImportControls />
        </section>
      </div>
    </PageLayout>
  );
}
