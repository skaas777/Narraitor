'use client';

import React from 'react';
import { DataField } from '@/components/shared/DataField';
import { WorldSettings } from '@/types/world.types';

interface WorldSettingsDisplayProps {
  settings?: WorldSettings;
}

export function WorldSettingsDisplay({ settings }: WorldSettingsDisplayProps) {
  if (
    !settings ||
    (!settings.maxAttributes &&
      !settings.maxSkills &&
      !settings.attributePointPool &&
      !settings.skillPointPool)
  ) {
    return null;
  }

  return (
    <section
      className="world-detail-section"
      aria-labelledby="settings-heading"
    >
      <h2 id="settings-heading">此世界的角色创建规则</h2>
      <div className="world-detail-meta-grid">
        <DataField
          label="属性上限"
          value={settings?.maxAttributes || "未设置"}
          variant="outline"
        />
        <DataField
          label="技能上限"
          value={settings?.maxSkills || "未设置"}
          variant="outline"
        />
        <DataField
          label="属性点池"
          value={settings?.attributePointPool || "未设置"}
          variant="outline"
        />
        <DataField
          label="技能点池"
          value={settings?.skillPointPool || "未设置"}
          variant="outline"
        />
      </div>
    </section>
  );
}
