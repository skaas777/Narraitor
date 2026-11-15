'use client';

import React from 'react';
import { DataField } from '@/components/shared/DataField';
import { World } from '@/types/world.types';
import { titleCase } from '@/lib/utils';

interface WorldInfoSectionProps {
  world: World;
}

export function WorldInfoSection({ world }: WorldInfoSectionProps) {
  if (!world.relationship && !world.reference) {
    return null;
  }

  return (
    <section
      className="world-detail-section"
      aria-labelledby="world-details-heading"
    >
      <h2 id="world-details-heading">世界详情</h2>
      <div className="world-detail-meta-grid">
        {world.relationship && (
          <DataField
            label="关系"
            value={titleCase(world.relationship.replace(/_/g, ' '))}
            variant="outline"
          />
        )}
        {world.reference && (
          <DataField
            label="参考"
            value={world.reference}
            variant="outline"
          />
        )}
      </div>
    </section>
  );
}
