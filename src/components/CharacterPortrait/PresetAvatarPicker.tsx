'use client';

import React, { useId, useMemo, useState } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { GeneratedImage } from '@/types/common.types';
import {
  PRESET_AVATARS,
  PRESET_AVATAR_CATEGORIES,
  PresetAvatarCategory,
  searchPresetAvatars,
} from '@/lib/portraits/presetAvatars';
import './PresetAvatarPicker.css';

interface PresetAvatarPickerProps {
  onPreview: (portrait: GeneratedImage) => void;
  selectedUrl?: string | null;
  className?: string;
}

export function PresetAvatarPicker({
  onPreview,
  selectedUrl = null,
  className,
}: PresetAvatarPickerProps) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PresetAvatarCategory | 'all'>('all');

  const avatars = useMemo(
    () => searchPresetAvatars(query, category),
    [query, category]
  );

  return (
    <div className={clsx('component-preset-avatar-picker', className)}>
      <div className="preset-avatar-picker-filters">
        <div className="preset-avatar-picker-search">
          <label htmlFor={searchId}>搜索头像</label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="试试游侠、护目镜、侦探"
          />
        </div>

        <div
          className="preset-avatar-picker-categories"
          role="group"
          aria-label="按类别筛选头像"
        >
          <button
            type="button"
            className={clsx(
              'preset-avatar-picker-category',
              category === 'all' && 'preset-avatar-picker-category-active'
            )}
            aria-pressed={category === 'all'}
            onClick={() => setCategory('all')}
          >
            全部
          </button>
          {PRESET_AVATAR_CATEGORIES.map((option) => (
            <button
              key={option.id}
              type="button"
              className={clsx(
                'preset-avatar-picker-category',
                category === option.id && 'preset-avatar-picker-category-active'
              )}
              aria-pressed={category === option.id}
              onClick={() => setCategory(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {avatars.length === 0 ? (
        <p className="preset-avatar-picker-empty">
          没有头像匹配该搜索。试试其他关键词或类别。
        </p>
      ) : (
        <ul className="preset-avatar-picker-grid">
          {avatars.map((avatar) => {
            const isSelected = selectedUrl === avatar.url;

            return (
              <li key={avatar.id}>
                <button
                  type="button"
                  className={clsx(
                    'preset-avatar-picker-option',
                    isSelected && 'preset-avatar-picker-option-selected'
                  )}
                  aria-pressed={isSelected}
                  onClick={() =>
                    onPreview({ type: 'preset', url: avatar.url })
                  }
                >
                  <Image
                    src={avatar.url}
                    alt=""
                    width={72}
                    height={72}
                    unoptimized
                  />
                  <span className="preset-avatar-picker-option-name">
                    {avatar.name} 头像
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="preset-avatar-picker-count">
        {avatars.length} / {PRESET_AVATARS.length} 已显示头像
      </p>
    </div>
  );
}
