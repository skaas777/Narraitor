'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardFlow } from '@/components/shared/wizard/hooks/useWizardFlow';
import { WizardContainer } from '@/components/shared/wizard/WizardContainer';
import { WizardStep } from '@/components/shared/wizard/WizardStep';
import { WizardNavigation } from '@/components/shared/wizard/WizardNavigation';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ConfirmationDialog/ConfirmationDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ProviderPresets } from './ProviderPresets';
import { CustomProviderForm } from './CustomProviderForm';
import { ProviderDisclosure } from './ProviderDisclosure';
import { useProviderStore } from '@/state/providerStore';
import { getPresetById, keyToSend } from '@/lib/ai/presets';
import { validateProviderKey, type ValidationResult } from '@/lib/ai/validateProviderClient';
import { discoverProviderModels } from '@/lib/api/discoverModelsClient';
import type { DiscoveredModel, ProviderType } from '@/types/provider.types';
import './provider-config.css';

interface ProviderWizardData {
  mode: 'preset' | 'custom';
  presetId: string;
  name: string;
  type: ProviderType;
  endpoint: string;
  model: string;
  apiKey: string;
  images: boolean;
  streaming: boolean;
  helpUrl: string;
  privacyNote: string;
  /** False only for a service the player runs themselves — see ProviderPreset. */
  requiresApiKey: boolean;
  /**
   * The shape of address to show as a hint. Only set for a preset that expects
   * the player to supply their own, where the path is the non-obvious part.
   */
  endpointHint: string;
}

const INITIAL_DATA: ProviderWizardData = {
  mode: 'preset',
  presetId: '',
  name: '',
  type: 'gemini',
  endpoint: '',
  model: '',
  apiKey: '',
  images: false,
  streaming: false,
  helpUrl: '',
  privacyNote: '',
  requiresApiKey: true,
  endpointHint: '',
};

const STEPS = [
  { id: 'provider', label: "模型服务" },
  { id: 'connect', label: "连接" },
  { id: 'verify', label: "验证" },
];

/**
 * A custom endpoint could be anything, so the honest disclosure is that we
 * don't know its terms — not silence, which reads as "nothing to worry about".
 */
const CUSTOM_PRIVACY_NOTE =
  "自定义端点完全取决于你指向的地址。请查看该提供商自身的数据保留条款——我们无从得知。";

interface ProviderWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

/** The failure, worded for whichever kind of provider the player picked. */
function describeVerifyError(code: string | undefined, requiresApiKey: boolean): string {
  const key = code ?? 'VALIDATION_FAILED';
  if (!requiresApiKey && SELF_HOSTED_ERROR_MESSAGES[key]) return SELF_HOSTED_ERROR_MESSAGES[key];
  return ERROR_MESSAGES[key] ?? ERROR_MESSAGES.VALIDATION_FAILED;
}

function describeDiscoveryError(code: string | null | undefined): string {
  if (code === 'NO_KEY') return "请先输入 API 密钥以加载模型。";
  if (code === 'INVALID_KEY') return "加载模型时 API 密钥被拒绝。";
  if (code === 'RATE_LIMITED') return "模型服务触发了速率限制。请稍后再试。";
  if (code === 'UNSUPPORTED_PROVIDER')
    return "此模型服务不支持实时列出模型。请在下方手动输入模型 ID。";
  if (code === 'INVALID_ENDPOINT') return "端点地址无效。";
  if (code === 'NETWORK') return "无法连接模型服务以加载模型。请在下方手动输入模型 ID。";
  return "无法加载模型列表。请在下方手动输入模型 ID。";
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_KEY: "该密钥被拒绝。请仔细检查后重试。",
  INVALID_MODEL: "此模型服务未找到该模型名称。",
  RATE_LIMITED: "模型服务当前正在限流——请稍等片刻再重试。",
  UNSUPPORTED_PROVIDER:
    "此模型服务的 API 尚不受支持。如果它接受 OpenAI 风格的聊天补全，请改为将其添加为自定义端点。",
  INVALID_ENDPOINT:
    "该端点必须是公共主机上的 https URL。发起请求的服务器无法访问本地地址。",
  NO_KEY: "请先输入 API 密钥。",
  NETWORK: "无法连接模型服务。请检查你的网络连接和端点。",
  VALIDATION_FAILED: "检查此配置时出现错误。",
};

/**
 * The same failures, worded for a server the player runs themselves, where the
 * fix is on their machine rather than in somebody's dashboard.
 */
const SELF_HOSTED_ERROR_MESSAGES: Record<string, string> = {
  NETWORK: "该地址无响应。请确认服务器正在运行，且可从你的机器外部访问。",
  INVALID_MODEL:
    "你的服务器上没有该模型。请先在其中安装，然后再次运行检查。",
  INVALID_KEY:
    "你的服务器拒绝了请求。大多数本地模型服务器只接受发往其自身机器的请求，因此通过隧道访问的服务器必须被设置为允许该地址。",
};

export function ProviderWizard({ onComplete, onCancel }: ProviderWizardProps) {
  const router = useRouter();
  const addProvider = useProviderStore((s) => s.addProvider);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const canLeaveRef = useRef(false);
  const pendingNavigationHrefRef = useRef<string | null>(null);
  const [verifyState, setVerifyState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [verifyResult, setVerifyResult] = useState<ValidationResult | null>(null);
  const [validatedConfig, setValidatedConfig] = useState<{
    apiKey?: string | null;
    type: ProviderType;
    endpoint: string;
    model: string;
  } | null>(null);
  const validationReqIdRef = useRef<symbol | null>(null);

  const [isKeyRevealed, setIsKeyRevealed] = useState(false);

  // Model discovery state
  const searchId = useId();
  const [discoveredModels, setDiscoveredModels] = useState<DiscoveredModel[]>([]);
  const [discoveryStatus, setDiscoveryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Track if user has deliberately entered or chosen a model
  const hasUserDeliberatelySetModelRef = useRef(false);
  const discoveryAbortRef = useRef<AbortController | null>(null);
  const discoveryReqIdRef = useRef<symbol | null>(null);

  // Memoized so useWizardFlow's validation effect has a stable dependency
  const validateStep = useCallback((step: number, data: ProviderWizardData) => {
    if (step === 0) {
      const preset = data.mode === 'preset' ? getPresetById(data.presetId) : null;
      const ok =
        data.mode === 'custom'
          ? Boolean(data.endpoint.trim())
          : Boolean(data.presetId) && (!preset?.requiresEndpoint || Boolean(data.endpoint.trim()));
      return { valid: ok, errors: ok ? [] : ["选择模型服务"], touched: true };
    }
    if (step === 1) {
      const hasKey = !data.requiresApiKey || Boolean(data.apiKey.trim());
      const ok = hasKey && Boolean(data.model.trim());
      return {
        valid: ok,
        errors: ok ? [] : [data.requiresApiKey ? "输入你的密钥和模型" : "输入模型"],
        touched: true,
      };
    }
    return { valid: true, errors: [], touched: true };
  }, []);

  const handleSave = useCallback(
    async (data: ProviderWizardData) => {
      await addProvider({
        type: data.type,
        name: data.name.trim() || data.presetId || "模型服务",
        endpoint: data.endpoint,
        model: data.model,
        apiKey: keyToSend(data.apiKey, data.requiresApiKey),
        capabilities: { text: true, images: data.images, streaming: data.streaming },
      });
      canLeaveRef.current = true;
      onComplete?.();
    },
    [addProvider, onComplete]
  );

  const wizard = useWizardFlow<ProviderWizardData>({
    steps: STEPS,
    initialData: INITIAL_DATA,
    onComplete: handleSave,
    onCancel,
    validateStep,
  });

  const { state, handlers, currentStep, isLastStep, stepValidation } = wizard;
  const { data } = state;

  const hasUnsavedKey = Boolean(data.apiKey.trim());

  useEffect(() => {
    if (!hasUnsavedKey) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (canLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    const handleAnchorClick = (event: MouseEvent) => {
      if (canLeaveRef.current || event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      pendingNavigationHrefRef.current = href;
      setShowCancelConfirmation(true);
    };

    window.addEventListener('beforeunload', warnBeforeUnload);
    document.addEventListener('click', handleAnchorClick, true);

    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload);
      document.removeEventListener('click', handleAnchorClick, true);
    };
  }, [hasUnsavedKey]);

  const handleCancel = () => {
    if (hasUnsavedKey && !canLeaveRef.current) {
      pendingNavigationHrefRef.current = null;
      setShowCancelConfirmation(true);
    } else {
      handlers.handleCancel();
    }
  };

  // Any change to the credentials or model invalidates a prior successful check
  useEffect(() => {
    setVerifyState('idle');
    setVerifyResult(null);
    setValidatedConfig(null);
    validationReqIdRef.current = null;
  }, [data.apiKey, data.model, data.endpoint, data.type]);

  // A catalogue belongs to the provider configuration it was loaded for.
  useEffect(() => {
    discoveryAbortRef.current?.abort();
    discoveryAbortRef.current = null;
    discoveryReqIdRef.current = null;
    setDiscoveredModels([]);
    setSearchQuery('');
    setDiscoveryStatus('idle');
    setDiscoveryError(null);
  }, [data.mode, data.presetId, data.apiKey, data.endpoint, data.type]);

  useEffect(
    () => () => {
      discoveryAbortRef.current?.abort();
      discoveryAbortRef.current = null;
      discoveryReqIdRef.current = null;
    },
    []
  );

  // Reveal is a glance, not a mode: leaving the step re-masks
  useEffect(() => {
    setIsKeyRevealed(false);
  }, [currentStep]);

  const selectPreset = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;
    const playerSuppliesEndpoint = preset.requiresEndpoint;
    hasUserDeliberatelySetModelRef.current = false;
    setDiscoveredModels([]);
    setSearchQuery('');
    setIsManualEntry(false);
    setDiscoveryStatus('idle');
    setDiscoveryError(null);

    handlers.updateData({
      mode: 'preset',
      presetId: preset.id,
      name: preset.name,
      type: preset.type,
      endpoint: playerSuppliesEndpoint ? '' : preset.endpoint,
      endpointHint: playerSuppliesEndpoint ? preset.endpoint : '',
      requiresApiKey: preset.requiresApiKey !== false,
      model: preset.defaultModel,
      images: preset.capabilities.images,
      streaming: preset.capabilities.streaming,
      helpUrl: preset.helpUrl,
      privacyNote: preset.privacyNote ?? '',
    });
  };

  const handleCustomFormChange = (
    updates: Partial<{ name: string; endpoint: string; model: string }>
  ) => {
    if (updates.model !== undefined) {
      hasUserDeliberatelySetModelRef.current = true;
    }
    handlers.updateData(updates);
  };

  const handleDiscoverModels = async () => {
    if (discoveryAbortRef.current) {
      discoveryAbortRef.current.abort();
    }
    const controller = new AbortController();
    discoveryAbortRef.current = controller;
    const reqId = Symbol();
    discoveryReqIdRef.current = reqId;

    setDiscoveryStatus('loading');
    setDiscoveryError(null);

    try {
      const result = await discoverProviderModels({
        apiKey: keyToSend(data.apiKey, data.requiresApiKey),
        type: data.type,
        endpoint: data.endpoint || undefined,
        signal: controller.signal,
      });

      if (controller.signal.aborted || discoveryReqIdRef.current !== reqId) {
        return;
      }

      if (result.error && result.models.length === 0) {
        setDiscoveryStatus('error');
        setDiscoveryError(result.error);
        return;
      }

      setDiscoveredModels(result.models);
      setDiscoveryStatus(result.models.length > 0 ? 'success' : 'idle');

      // Requirement 6: when discovery omits the suggestion, require explicit selection/manual entry rather than choosing the first result. Preserve a model the player deliberately entered.
      if (hasUserDeliberatelySetModelRef.current) {
        if (data.model && !result.models.some((m) => m.id === data.model)) {
          setIsManualEntry(true);
        }
      } else {
        const preset = getPresetById(data.presetId);
        const suggestion = preset?.defaultModel ?? '';
        const hasSuggestion = result.models.some((m) => m.id === suggestion);
        if (hasSuggestion) {
          handlers.updateData({ model: suggestion });
        } else {
          handlers.updateData({ model: '' });
        }
      }
    } catch {
      if (!controller.signal.aborted && discoveryReqIdRef.current === reqId) {
        setDiscoveryStatus('error');
        setDiscoveryError('NETWORK');
      }
    }
  };

  const runVerify = async () => {
    const targetConfig = {
      apiKey: keyToSend(data.apiKey, data.requiresApiKey),
      type: data.type,
      endpoint: data.endpoint,
      model: data.model,
    };

    const reqId = Symbol();
    validationReqIdRef.current = reqId;
    setVerifyState('loading');

    try {
      const result = await validateProviderKey({
        apiKey: targetConfig.apiKey,
        type: targetConfig.type,
        endpoint: targetConfig.endpoint,
        model: targetConfig.model,
        checkImage: data.images,
      });

      if (validationReqIdRef.current !== reqId) {
        // Drop late response if configuration changed while in flight
        return;
      }

      setVerifyResult(result);
      setVerifyState(result.valid ? 'success' : 'error');
      if (result.valid) {
        setValidatedConfig(targetConfig);
      }
    } catch {
      if (validationReqIdRef.current !== reqId) {
        return;
      }
      setVerifyResult({ valid: false, error: 'NETWORK' });
      setVerifyState('error');
    }
  };

  const hasChosenProvider = data.mode === 'preset' ? Boolean(data.presetId) : Boolean(data.endpoint.trim());
  const playerSuppliesEndpoint =
    data.mode === 'preset'
      ? Boolean(getPresetById(data.presetId)?.requiresEndpoint)
      : false;

  const isConfigValidated =
    verifyState === 'success' &&
    validatedConfig !== null &&
    validatedConfig.apiKey === keyToSend(data.apiKey, data.requiresApiKey) &&
    validatedConfig.type === data.type &&
    validatedConfig.endpoint === data.endpoint &&
    validatedConfig.model === data.model;

  const navDisabled = isLastStep ? !isConfigValidated : !(stepValidation?.valid ?? false);

  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return discoveredModels;
    return discoveredModels.filter(
      (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
    );
  }, [discoveredModels, searchQuery]);

  const preset = getPresetById(data.presetId);
  const showLoadModels = data.mode === 'custom' || preset?.modelDiscovery !== false;

  return (
    <WizardContainer title="设置模型服务" className="component-provider-wizard">
      <WizardStep error={wizard.currentError}>
        {currentStep === 0 && (
          <div className="provider-form-fields">
            <p className="form-help-text">
              选择一个模型服务。故事将使用你自己的密钥生成，密钥保存在此浏览器中。
            </p>
            <ProviderPresets selectedId={data.mode === 'preset' ? data.presetId : null} onSelect={(p) => selectPreset(p.id)} />
            {playerSuppliesEndpoint && (
              <CustomProviderForm
                value={{ name: data.name, endpoint: data.endpoint, model: data.model }}
                onChange={handleCustomFormChange}
                endpointPlaceholder={data.endpointHint}
              />
            )}
            <button
              type="button"
              className="provider-advanced-toggle"
              onClick={() => {
                hasUserDeliberatelySetModelRef.current = false;
                handlers.updateData({
                  mode: data.mode === 'custom' ? 'preset' : 'custom',
                  type: data.mode === 'custom' ? 'gemini' : 'openai-compatible',
                  privacyNote: data.mode === 'custom' ? '' : CUSTOM_PRIVACY_NOTE,
                  requiresApiKey: true,
                  endpointHint: '',
                });
              }}
            >
              {data.mode === 'custom' ? "改用预设" : "使用自定义端点"}
            </button>
            {data.mode === 'custom' && (
              <CustomProviderForm
                value={{ name: data.name, endpoint: data.endpoint, model: data.model }}
                onChange={handleCustomFormChange}
              />
            )}
            {hasChosenProvider && (
              <ProviderDisclosure type={data.type} privacyNote={data.privacyNote} />
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="provider-form-fields">
            <div className="form-group">
              <Label htmlFor="provider-name">
                名称
              </Label>
              <Input
                id="provider-name"
                value={data.name}
                placeholder="我的模型服务密钥"
                onChange={(e) => handlers.updateData({ name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <Label htmlFor="provider-key">
                API 密钥{data.requiresApiKey ? '' : "（可选）"}
              </Label>
              <div className="provider-key-field">
                <Input
                  id="provider-key"
                  type={isKeyRevealed ? 'text' : 'password'}
                  value={data.apiKey}
                  placeholder="粘贴你的密钥"
                  autoComplete="off"
                  onChange={(e) => handlers.updateData({ apiKey: e.target.value })}
                />
                <button
                  type="button"
                  className="provider-key-reveal"
                  aria-pressed={isKeyRevealed}
                  aria-label={isKeyRevealed ? "隐藏密钥" : "显示密钥"}
                  onClick={() => setIsKeyRevealed((revealed) => !revealed)}
                >
                  {isKeyRevealed ? "隐藏" : "显示"}
                </button>
              </div>
              {!data.requiresApiKey && (
                <p className="form-help-text">
                  你自己运行的服务器通常不需要密钥——留空即可。只有在它前面加了身份验证时才需要填写。
                </p>
              )}
              {data.helpUrl && (
                <p className="form-help-text">
                  <a href={data.helpUrl} target="_blank" rel="noopener noreferrer">
                    {data.requiresApiKey ? "在哪里找到我的密钥？" : "如何设置？"}
                  </a>
                </p>
              )}
            </div>

            <div className="form-group">
              <div className="provider-model-header">
                <Label htmlFor="provider-model">
                  模型
                </Label>
                {showLoadModels && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="provider-load-models-btn"
                    onClick={handleDiscoverModels}
                    disabled={discoveryStatus === 'loading' || (data.requiresApiKey && !data.apiKey.trim())}
                  >
                    {discoveryStatus === 'loading' ? "正在加载模型..." : "加载模型"}
                  </Button>
                )}
              </div>

              {discoveryStatus === 'error' && (
                <p className="form-error">
                  {describeDiscoveryError(discoveryError)}
                </p>
              )}

              {discoveredModels.length > 0 && !isManualEntry ? (
                <div className="provider-model-picker">
                  <div className="form-group">
                    <Label htmlFor={searchId}>
                      搜索模型
                    </Label>
                    <Input
                      id={searchId}
                      type="search"
                      placeholder="搜索模型..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    id="provider-model"
                    value={data.model}
                    onChange={(e) => {
                      hasUserDeliberatelySetModelRef.current = true;
                      handlers.updateData({ model: e.target.value });
                    }}
                  >
                    <option value="">选择模型...</option>
                    {filteredModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name === m.id ? m.id : `${m.name} (${m.id})`}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <Input
                  id="provider-model"
                  value={data.model}
                  placeholder="模型名称"
                  onChange={(e) => {
                    hasUserDeliberatelySetModelRef.current = true;
                    handlers.updateData({ model: e.target.value });
                  }}
                />
              )}

              {discoveredModels.length > 0 && (
                <button
                  type="button"
                  className="provider-advanced-toggle"
                  onClick={() => setIsManualEntry((prev) => !prev)}
                >
                  {isManualEntry ? "从已发现的模型中选择" : "手动输入模型 ID"}
                </button>
              )}
            </div>

            <ProviderDisclosure type={data.type} privacyNote={data.privacyNote} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="provider-verify">
            <p className="form-help-text">
              保存前先运行一次快速检查，确认你的密钥可用。
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={runVerify}
              disabled={verifyState === 'loading'}
            >
              {verifyState === 'loading' ? "检查中……" : "测试连接"}
            </Button>
            {verifyState === 'success' && (
              <div className="provider-verify-status" data-state="success">
                已连接。保存模型服务即可完成。文本： {verifyResult?.capabilities?.text ? '是' : '否'}，图像：{' '}
                {verifyResult?.capabilities?.images ? '是' : '否'}.
              </div>
            )}
            {verifyState === 'error' && (
              <div className="provider-verify-status" data-state="error">
                {describeVerifyError(verifyResult?.error, data.requiresApiKey)}
                {!data.requiresApiKey && data.helpUrl && (
                  <>
                    {' '}
                    <a href={data.helpUrl} target="_blank" rel="noopener noreferrer">
                      设置指南
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </WizardStep>

      <WizardNavigation
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onCancel={handleCancel}
        onBack={handlers.handleBack}
        onNext={handlers.handleNext}
        onComplete={handlers.handleComplete}
        nextLabel="下一步"
        completeLabel="保存模型服务"
        disabled={navDisabled}
        isLoading={state.isProcessing}
      />
      <ConfirmationDialog
        isOpen={showCancelConfirmation}
        onClose={() => {
          pendingNavigationHrefRef.current = null;
          setShowCancelConfirmation(false);
        }}
        onConfirm={() => {
          canLeaveRef.current = true;
          setShowCancelConfirmation(false);
          const destination = pendingNavigationHrefRef.current;
          pendingNavigationHrefRef.current = null;
          if (destination) {
            router.push(destination);
          } else {
            handlers.handleCancel();
          }
        }}
        title="放弃模型服务设置？"
        message="此模型服务尚未保存。离开将丢弃你输入的密钥。"
        variant="warning"
        confirmText="放弃模型服务"
        cancelText="继续编辑"
      />
    </WizardContainer>
  );
}
