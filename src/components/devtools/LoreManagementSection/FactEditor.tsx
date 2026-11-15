/**
 * FactEditor Component
 * Form for creating and editing lore facts
 */

import React, { useState, useEffect } from 'react';
import { useLoreStore } from '@/state/loreStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LoreCategory, LoreFact } from '@/types/lore.types';
import type { EntityID } from '@/types/common.types';
import { displayLabel } from '@/lib/i18n/zhCN';

interface FactEditorProps {
  worldId: EntityID;
  fact?: LoreFact;
  onSave?: () => void;
  onCancel?: () => void;
}

export const FactEditor: React.FC<FactEditorProps> = ({
  worldId,
  fact,
  onSave,
  onCancel
}) => {
  const [key, setKey] = useState(fact?.key || '');
  const [value, setValue] = useState(fact?.value || '');
  const [category, setCategory] = useState<LoreCategory>(fact?.category || 'characters');
  const [visibility, setVisibility] = useState<'session-private' | 'world-shared'>(
    fact?.visibility || 'session-private'
  );
  const [description, setDescription] = useState(fact?.metadata?.description || '');
  const [importance, setImportance] = useState<'low' | 'medium' | 'high'>(
    fact?.metadata?.importance || 'medium'
  );
  const [tags, setTags] = useState(fact?.metadata?.tags?.join(', ') || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDuplicate, setIsDuplicate] = useState(false);

  const {
    addFact,
    updateFact,
    validateKey,
    validateFactUniqueness
  } = useLoreStore();

  // Check for duplicates when key/value changes
  useEffect(() => {
    if (!key || !value) {
      setIsDuplicate(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!fact) { // Only check for new facts
        const isUnique = validateFactUniqueness(worldId, key, value);
        setIsDuplicate(!isUnique);
        
        if (!isUnique) {
          setErrors(prev => ({ ...prev, duplicate: "检测到重复事实" }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.duplicate;
            return newErrors;
          });
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [key, value, worldId, fact, validateFactUniqueness]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!key.trim()) {
      newErrors.key = "事实键为必填项";
    } else if (!validateKey(key)) {
      newErrors.key = "键名只能包含字母、数字和下划线，且必须以字母开头";
    }

    if (!value.trim()) {
      newErrors.value = "事实值为必填项";
    }

    if (!category) {
      newErrors.category = "分类为必填项";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (isDuplicate && !fact) return; // Don't allow duplicates for new facts

    const metadata = {
      description: description || undefined,
      importance,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
    };

    if (fact) {
      // Update existing fact
      updateFact(fact.id, {
        key,
        value,
        category,
        visibility,
        metadata
      });
    } else {
      // Create new fact
      addFact(key, value, category, 'manual', worldId, undefined, metadata, visibility);
    }

    // Reset form if creating new
    if (!fact) {
      setKey('');
      setValue('');
      setDescription('');
      setTags('');
      setImportance('medium');
    }

    onSave?.();
  };

  return (
    <form onSubmit={handleSubmit} >
      <div>
        <Label htmlFor="fact-key">事实键</Label>
        <Input
          id="fact-key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="例如：hero_name"
        />
        {errors.key && (
          <p>{errors.key}</p>
        )}
      </div>

      <div>
        <Label htmlFor="fact-value">事实值</Label>
        <Textarea
          id="fact-value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="例如：Lyra Starweaver"
          rows={2}
        />
        {errors.value && (
          <p>{errors.value}</p>
        )}
      </div>

      <div>
        <Label htmlFor="fact-category">分类</Label>
        <Select
          id="fact-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as LoreCategory)}
        >
          <option value="characters">角色</option>
          <option value="locations">地点</option>
          <option value="events">事件</option>
          <option value="rules">规则</option>
        </Select>
        {errors.category && (
          <p>{displayLabel(errors.category)}</p>
        )}
      </div>

      <div>
        <Label htmlFor="fact-visibility">可见性</Label>
        <Select
          id="fact-visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as 'session-private' | 'world-shared')}
        >
          <option value="session-private">冒险记录私有</option>
          <option value="world-shared">世界共享</option>
        </Select>
        <p>
          冒险记录私有：仅在此冒险记录中可见。世界共享：所有冒险记录均可见。
        </p>
      </div>

      <div>
        <Label htmlFor="fact-description">描述（可选）</Label>
        <Textarea
          id="fact-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="补充背景或详情……"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="fact-importance">重要性</Label>
        <Select 
          id="fact-importance"
          value={importance} 
          onChange={(e) => setImportance(e.target.value as 'low' | 'medium' | 'high')}
        >
          <option value="low">低</option>
          <option value="medium">中等</option>
          <option value="high">高</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="fact-tags">标签（可选，逗号分隔）</Label>
        <Input
          id="fact-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="例如：主角、主人公、英雄"
        />
      </div>

      {isDuplicate && !fact && (
        <Alert>
          <AlertDescription>
            检测到重复事实。该事实已存在于这个世界。
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Button type="submit" disabled={isDuplicate && !fact}>
          {fact ? "保存更改" : "添加事实"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
      </div>
    </form>
  );
};