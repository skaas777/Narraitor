import React from 'react';
import { clsx } from 'clsx';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AdvancedSettings } from '@/types/provider.types';
import './provider-config.css';

interface ProviderAdvancedSettingsProps {
  /** Used to build stable, unique field ids — several providers can be on screen at once. */
  providerId: string;
  value: AdvancedSettings | undefined;
  onChange: (settings: AdvancedSettings | undefined) => void;
  /**
   * True when this provider's model rejects a temperature/top-p being sent at
   * all (a reasoning-model preset — see hasFixedSamplingControls). The two
   * sliders are disabled rather than hidden, so it's clear the setting exists
   * but doesn't apply here.
   */
  samplingControlsFixed?: boolean;
  className?: string;
}

const TEMPERATURE_DEFAULT = 0.7;
const TOP_P_DEFAULT = 1.0;

function parsePositiveInteger(value: string): number | undefined {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Per-provider generation-parameter tuning, collapsed by default. Everything
 * here is optional: an absent field means "use this call site's own
 * default", which is also exactly what "Reset to defaults" restores.
 */
export function ProviderAdvancedSettings({
  providerId,
  value,
  onChange,
  samplingControlsFixed = false,
  className,
}: ProviderAdvancedSettingsProps) {
  const fieldId = (field: string) => `provider-${providerId}-advanced-${field}`;

  const set = <K extends keyof AdvancedSettings>(
    key: K,
    next: AdvancedSettings[K] | undefined
  ) => {
    const updated: AdvancedSettings = { ...value, [key]: next };
    if (next === undefined) delete updated[key];
    onChange(Object.keys(updated).length > 0 ? updated : undefined);
  };

  const handleReset = () => onChange(undefined);

  return (
    <CollapsibleSection
      title="高级"
      initialCollapsed
      className={clsx('component-provider-advanced-settings', className)}
    >
      <div className="provider-advanced-fields">
        {samplingControlsFixed && (
          <p className="form-help-text">
            此模型服务的模型会自行推理，并完全拒绝设置了温度或 Top-p 的请求，因此下面这两个控件已被禁用。
          </p>
        )}

        <div className="provider-advanced-field">
          <Label htmlFor={fieldId('temperature')}>
            温度： {(value?.temperature ?? TEMPERATURE_DEFAULT).toFixed(1)}
          </Label>
          <input
            id={fieldId('temperature')}
            type="range"
            min={0}
            max={2}
            step={0.1}
            disabled={samplingControlsFixed}
            value={value?.temperature ?? TEMPERATURE_DEFAULT}
            onChange={(e) => set('temperature', Number(e.target.value))}
            className="provider-advanced-slider"
            aria-label="温度"
          />
          <p className="form-help-text">
            数值越高，越有创意、越随机；数值越低，越稳定、越聚焦（0.0-2.0）。如果故事显得飘忽不定，就调低；如果显得重复，就调高。
          </p>
        </div>

        <div className="provider-advanced-field">
          <Label htmlFor={fieldId('top-p')}>
            核采样概率： {(value?.topP ?? TOP_P_DEFAULT).toFixed(2)}
          </Label>
          <input
            id={fieldId('top-p')}
            type="range"
            min={0}
            max={1}
            step={0.05}
            disabled={samplingControlsFixed}
            value={value?.topP ?? TOP_P_DEFAULT}
            onChange={(e) => set('topP', Number(e.target.value))}
            className="provider-advanced-slider"
            aria-label="核采样概率"
          />
          <p className="form-help-text">
            核采样——另一种限制回复多样性的方式（0.0-1.0）。大多数人只需调整温度；除非你明确需要，否则请保持为 1.0。
          </p>
        </div>

        <div className="provider-advanced-field">
          <Label htmlFor={fieldId('max-tokens')}>最大回复长度（token 数）</Label>
          <Input
            id={fieldId('max-tokens')}
            type="number"
            min={1}
            max={4096}
            step={1}
            placeholder="模型服务默认值"
            value={value?.maxTokens ?? ''}
            onChange={(e) =>
              set('maxTokens', e.target.value ? Number(e.target.value) : undefined)
            }
          />
          <p className="form-help-text">
            限制单次生成回复的长度（最多 4,096 个 token）。数值越高，场景可以越长，但每回合成本更高、耗时也更长。
          </p>
        </div>

        <div className="provider-advanced-field">
          <Label htmlFor={fieldId('safety-prompt')}>自定义安全指导</Label>
          <Textarea
            id={fieldId('safety-prompt')}
            rows={3}
            placeholder="留空以使用默认的内容分级指导"
            value={value?.customSafetyPrompt ?? ''}
            onChange={(e) => set('customSafetyPrompt', e.target.value || undefined)}
          />
          <Alert variant="warning">
            <AlertDescription>
              替换针对你世界内容分级所发送的指导。这不会改变模型服务自身的安全过滤——在依赖它放宽或收紧任何内容之前，请先查看该模型服务的政策。
            </AlertDescription>
          </Alert>
        </div>

        <div className="provider-advanced-field">
          <Label htmlFor={fieldId('system-prompt')}>附加系统提示词</Label>
          <Textarea
            id={fieldId('system-prompt')}
            rows={3}
            placeholder="随每次请求一并发送给此模型服务的额外指令"
            value={value?.customSystemPrompt ?? ''}
            onChange={(e) => set('customSystemPrompt', e.target.value || undefined)}
          />
          <p className="form-help-text">
            附加到该模型服务每次生成内容中的额外指令——例如偏好的文风。
          </p>
        </div>

        <div className="provider-advanced-field">
          <Checkbox
            id={fieldId('rate-limit-enabled')}
            label="每小时请求数上限"
            checked={value?.rateLimitEnabled ?? false}
            onChange={(e) => set('rateLimitEnabled', e.target.checked ? true : undefined)}
          />
          <p className="form-help-text">
            防止意外耗尽自身配额的安全网。仅在此浏览器中强制执行——它不会影响模型服务自身的限制。
          </p>
          {value?.rateLimitEnabled && (
            <div className="provider-advanced-rate-limit-value">
              <Label htmlFor={fieldId('max-requests-per-hour')}>每小时最大请求数</Label>
              <Input
                id={fieldId('max-requests-per-hour')}
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 60"
                value={value?.maxRequestsPerHour ?? ''}
                onChange={(e) =>
                  set('maxRequestsPerHour', parsePositiveInteger(e.target.value))
                }
              />
            </div>
          )}
        </div>

        <div className="provider-advanced-actions">
          <Button type="button" variant="outline" size="sm" onClick={handleReset}>
            恢复默认值
          </Button>
        </div>
      </div>
    </CollapsibleSection>
  );
}
