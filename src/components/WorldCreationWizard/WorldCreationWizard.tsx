'use client';

import React, { useMemo, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorldStore } from '@/state/worldStore';
import { useSessionStore } from '@/state/sessionStore';
import { useProviderStore } from '@/state/providerStore';
import { DEFAULT_TONE_SETTINGS } from '@/types/tone-settings.types';
import { useWizardState, WizardStep as WizardStepType } from '@/hooks/useWizardState';
import { useAttemptedSteps } from '@/hooks/useAttemptedSteps';
import {
  Validator,
  alwaysValid,
  validateFields,
  createValidationRules,
  getVisibleStepError,
} from '@/lib/utils/wizardValidation';
import { 
  WizardContainer, 
  WizardProgress, 
  WizardNavigation, 
  WizardStep 
} from '@/components/shared/wizard';
import { ConfirmationDialog } from '@/components/ConfirmationDialog/ConfirmationDialog';
import { useDraftAutoSave } from '@/hooks/useDraftAutoSave';
import { RecoveryNotification } from '@/components/shared/RecoveryNotification';
import BasicInfoStep from './steps/BasicInfoStep';
import DescriptionStep from './steps/DescriptionStep';
import AttributeReviewStep from './steps/AttributeReviewStep';
import SkillReviewStep from './steps/SkillReviewStep';
import FinalizeStep from './steps/FinalizeStep';
import {
  AttributeSuggestion,
  SkillSuggestion,
  WIZARD_STEPS,
  WorldCreationData,
  WorldCreationDraft,
  WorldDraftRecoveryPreview,
  WORLD_DRAFT_STORAGE_KEY,
  isValidWorldDraft,
  analyzeWorldDraftRecovery,
  hasWorldDraftData,
  withoutSuggestedEntries,
  WIZARD_MAX_ATTRIBUTES,
  WIZARD_MAX_SKILLS,
} from './WizardState';
import { AIGuidanceSource } from '@/lib/constants/worldGuidance';
import { generateWorldImage } from '@/lib/ai/worldImageGenerator';
import { analyzeWorldDescriptionClient } from '@/lib/ai/worldAnalyzerClient';
import { ensureWorldNpcRoster } from '@/lib/services/worldCreationService';
import { useTutorial } from '@/components/TutorialProvider';
import { tourStepToWizardStep } from '@/lib/tutorial/worldCreationTour';

import Logger from '@/lib/utils/logger';
const logger = new Logger('WorldCreationWizard');

// Efficient deep comparison for arrays of objects
const areArraysEqual = <T extends object>(a: T[] = [], b: T[] = []): boolean => {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    const objA = a[i];
    const objB = b[i];
    
    // Compare object keys
    const keysA = Object.keys(objA) as (keyof T)[];
    const keysB = Object.keys(objB) as (keyof T)[];
    
    if (keysA.length !== keysB.length) return false;
    
    // Compare each property
    for (const key of keysA) {
      if (objA[key] !== objB[key]) return false;
    }
  }
  
  return true;
};

export type { AttributeSuggestion, SkillSuggestion, WorldCreationData };

export interface WorldCreationWizardProps {
  onComplete?: (worldId: string) => void;
  onCancel?: () => void;
  initialStep?: number;
  initialData?: Partial<WorldCreationData>;
}

type SuggestionMeta = NonNullable<WorldCreationData['aiSuggestionMeta']>;

const buildSuggestionMeta = (
  description: string | undefined,
  source: AIGuidanceSource
): SuggestionMeta => ({
  source,
  generatedAt: new Date().toISOString(),
  descriptionSnapshot: (description || '').trim(),
});

export default function WorldCreationWizard({
  onComplete,
  onCancel,
  initialStep = 0,
  initialData
}: WorldCreationWizardProps) {
  const router = useRouter();
  const createWorld = useWorldStore((state) => state.createWorld);
  const { startTour, setCurrentWizardStep, isTourActive, isPaused, pauseTour, resumeTour, stepIndex, currentTour } = useTutorial();
  const worldCreationProgress = useSessionStore(state => state.tutorialProgress.phases.worldCreation);
  const hasConfiguredKey = useProviderStore((s) => Object.keys(s.providers).length > 0);
  
  // Initialize world creation data
  // Note: initialData spread at the end takes precedence over defaults,
  // allowing external components to override any default values
  const initialWorldData: WorldCreationData = useMemo(() => ({
    settings: {
      maxAttributes: WIZARD_MAX_ATTRIBUTES,
      maxSkills: WIZARD_MAX_SKILLS,
      attributePointPool: 20,
      skillPointPool: 20
    },
    aiSuggestions: initialData?.aiSuggestions,
    aiSuggestionsGenerated: initialData?.aiSuggestionsGenerated || false,
    worldType: initialData?.worldType || 'original',
    // Spread initialData last to ensure external overrides take precedence
    ...initialData,
  }), [initialData]);

  // Create step validators
  const stepValidators = useMemo((): Record<number, Validator<WorldCreationData>> => {
    return {
      0: validateFields<WorldCreationData>({
        genre: [createValidationRules.required("世界类型为必填项")],
      }),
      1: validateFields<WorldCreationData>({
        description: [
          createValidationRules.required<string | undefined>("世界描述不能为空"),
          createValidationRules.minLength(50, "描述至少需要 50 个字符"),
        ],
      }),
      2: alwaysValid, // Attributes step — suggestions are optional
      3: alwaysValid, // Skills step — suggestions are optional
      4: alwaysValid, // Finalize step is always valid
    };
  }, []);

  const {
    data: autoSaveData,
    setData: setAutoSaveData,
    clearAutoSave,
    dismissRecovery,
    hasRecoveryData,
    recoveryPreview,
    hasCurrentData: autoSaveHasCurrentData,
    isLoaded: isAutoSaveLoaded,
  } = useDraftAutoSave<WorldCreationDraft, WorldDraftRecoveryPreview>({
    storageKey: WORLD_DRAFT_STORAGE_KEY,
    analyzeRecovery: analyzeWorldDraftRecovery,
    hasCurrentData: hasWorldDraftData,
    isValidDraft: isValidWorldDraft,
  });

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Per-field "has the player touched this field" tracking, keyed by step
  // index, plus which steps the player has explicitly tried to advance past
  // (clicked Next while invalid). A field's own error only surfaces once
  // it's been touched, unless the step was attempted, in which case every
  // failing field's error shows.
  const [touchedFieldsByStep, setTouchedFieldsByStep] = useState<Record<number, Set<string>>>({});
  const attemptedSteps = useAttemptedSteps();
  const { mark: markAttemptedStep, reset: resetAttemptedSteps } = attemptedSteps;
  const wizardDataRef = useRef(initialWorldData);

  React.useEffect(() => {
    if (hasRecoveryData) {
      setShowRecoveryModal(true);
    }
  }, [hasRecoveryData]);

  const wasTourPausedByRecoveryRef = React.useRef(false);

  React.useEffect(() => {
    if (showRecoveryModal) {
      if (isTourActive) {
        wasTourPausedByRecoveryRef.current = true;
        pauseTour?.();
      }
    } else if (wasTourPausedByRecoveryRef.current) {
      wasTourPausedByRecoveryRef.current = false;
      resumeTour?.();
    }
  }, [showRecoveryModal, isTourActive, pauseTour, resumeTour]);

  const handleStepValidation = useCallback(
    (stepIndex: number, data: WorldCreationData) => {
      const validator = stepValidators[stepIndex];
      return validator ? validator(data) : { valid: true, errors: [], touched: true };
    },
    [stepValidators]
  );

  // Wizard state management
  const wizard = useWizardState<WorldCreationData>({
    initialData: initialWorldData,
    initialStep,
    steps: WIZARD_STEPS,
    onStepValidation: handleStepValidation,
  });
  const {
    goToStep,
    goNext,
    goBack,
    reset,
    updateData,
    setValidation,
    setProcessing,
    setError,
    clearError,
  } = wizard;

  wizardDataRef.current = wizard.state.data;

  const prevAutoSaveRef = React.useRef<{ step: number; data: WorldCreationData } | null>(null);

  React.useEffect(() => {
    if (!isAutoSaveLoaded || !wizard.state.data || hasRecoveryData || showRecoveryModal) {
      return;
    }

    if (
      prevAutoSaveRef.current?.step === wizard.state.currentStep &&
      prevAutoSaveRef.current?.data === wizard.state.data
    ) {
      return;
    }

    prevAutoSaveRef.current = {
      step: wizard.state.currentStep,
      data: wizard.state.data,
    };

    setAutoSaveData({
      currentStep: wizard.state.currentStep,
      worldData: wizard.state.data,
    });
  }, [isAutoSaveLoaded, wizard.state.currentStep, wizard.state.data, hasRecoveryData, showRecoveryModal, setAutoSaveData]);

  const handleRecoverProgress = useCallback(() => {
    if (autoSaveData) {
      reset(
        autoSaveData.worldData,
        autoSaveData.currentStep
      );
      dismissRecovery();
    }
    setTouchedFieldsByStep({});
    resetAttemptedSteps();
    setShowRecoveryModal(false);
  }, [autoSaveData, reset, dismissRecovery, resetAttemptedSteps]);

  const handleDismissRecovery = useCallback(() => {
    clearAutoSave();
    setTouchedFieldsByStep({});
    resetAttemptedSteps();
    setShowRecoveryModal(false);
  }, [clearAutoSave, resetAttemptedSteps]);

  // Sync wizard step with tutorial provider
  React.useEffect(() => {
    setCurrentWizardStep(wizard.state.currentStep);
  }, [wizard.state.currentStep, setCurrentWizardStep]);

  const prevStepIndexRef = React.useRef(stepIndex);

  // Sync tour step index to wizard step when tour step index advances while tour is active and not paused for recovery
  React.useEffect(() => {
    const prevStepIndex = prevStepIndexRef.current;
    prevStepIndexRef.current = stepIndex;

    if (
      !isTourActive ||
      isPaused ||
      wasTourPausedByRecoveryRef.current ||
      showRecoveryModal ||
      currentTour !== 'worldCreation'
    ) {
      return;
    }

    if (prevStepIndex === stepIndex) {
      return;
    }

    const targetWizardStep = tourStepToWizardStep[stepIndex];
    if (targetWizardStep !== undefined && targetWizardStep !== wizard.state.currentStep) {
      goToStep(targetWizardStep);
    }
  }, [stepIndex, isTourActive, isPaused, showRecoveryModal, currentTour, wizard.state.currentStep, goToStep]);

  const shouldAutoStartTour = useMemo(() => {
    if (worldCreationProgress.skipped) return false;
    if (!worldCreationProgress.completed) return true;

    const stepIndices = Object.entries(tourStepToWizardStep)
      .filter(([, step]) => step === wizard.state.currentStep)
      .map(([index]) => parseInt(index, 10));

    if (stepIndices.length === 0) return false;
    const maxIndexForWizardStep = Math.max(...stepIndices);

    return worldCreationProgress.lastStep < maxIndexForWizardStep;
  }, [
    worldCreationProgress.completed,
    worldCreationProgress.skipped,
    worldCreationProgress.lastStep,
    wizard.state.currentStep,
  ]);

  // Auto-start tour if needed
  React.useEffect(() => {
    if (shouldAutoStartTour && !isTourActive) {
      // Small delay to ensure components are mounted
      const timer = setTimeout(() => {
        startTour('worldCreation');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoStartTour, isTourActive, startTour, wizard.state.currentStep]);

  // Cancel confirmation dialog state
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Dirty state detection - check if user has made meaningful changes
  const isDirty = useMemo(() => {
    const currentData = wizard.state.data;
    const initialData = initialWorldData;
    
    return (
      currentData.name !== initialData.name ||
      currentData.description !== initialData.description ||
      currentData.genre !== initialData.genre ||
      !areArraysEqual(currentData.attributes, initialData.attributes) ||
      !areArraysEqual(currentData.skills, initialData.skills) ||
      currentData.aiSuggestionsGenerated !== initialData.aiSuggestionsGenerated
    );
  }, [wizard.state.data, initialWorldData]);

  const canProceedToNext = useCallback((): boolean => {
    const currentValidation = wizard.state.validation[wizard.state.currentStep];
    return !currentValidation || currentValidation.valid;
  }, [wizard.state.validation, wizard.state.currentStep]);

  const generateAISuggestions = useCallback(async () => {
    const description = wizard.state.data.description;
    if (!description || description.trim().length < 50) {
      setError('ai', "请至少填写一小段描述（50 个字符以上），以便系统理解你的世界。");
      return;
    }

    setProcessing(true);
    clearError('ai');

    try {
      const suggestions = await analyzeWorldDescriptionClient(description);
      
      updateData({ 
        ...withoutSuggestedEntries(wizardDataRef.current),
        aiSuggestions: suggestions,
        aiSuggestionsGenerated: true,
        aiSuggestionMeta: buildSuggestionMeta(description, 'ai'),
      });
    } catch (error) {
      logger.error('Error generating suggestions:', error);
      
      // Use default suggestions as fallback
      const defaultSuggestions = getDefaultSuggestions();
      updateData({ 
        ...withoutSuggestedEntries(wizardDataRef.current),
        aiSuggestions: defaultSuggestions,
        aiSuggestionsGenerated: true,
        aiSuggestionMeta: buildSuggestionMeta(description, 'fallback'),
      });
      // The generic "service trouble" message is wrong when the real cause is
      // no provider key at all — that's not a service outage, and telling the
      // player to wait for it to "recover" is a dead end with no actual fix.
      setError(
        'ai',
        hasConfiguredKey
          ? "我们无法连接到生成服务，已为你加载初始建议。服务恢复后你可以再次生成。"
          : "生成建议需要模型服务密钥。请在设置中添加，然后重新生成——目前将使用初始建议。"
      );
    } finally {
      setProcessing(false);
    }
  }, [
    wizard.state.data.description,
    setError,
    setProcessing,
    clearError,
    updateData,
    hasConfiguredKey,
  ]);

  const clearAISuggestions = useCallback(() => {
    // Removes suggested attributes and skills on both review steps; custom
    // entries the player added stay.
    updateData({
      ...withoutSuggestedEntries(wizardDataRef.current),
      aiSuggestions: undefined,
      aiSuggestionsGenerated: false,
      aiSuggestionMeta: undefined,
    });
  }, [updateData]);

  const handleNext = useCallback(async () => {
    // The player explicitly tried to advance past this step: from here on,
    // show every failing field's error for it, not just touched ones.
    markAttemptedStep(wizard.state.currentStep);

    // Next stays enabled while the step is invalid so the player can ask why
    // they can't advance: record the step's validation (which surfaces every
    // error now that it's attempted) and stop before any AI call.
    const stepValidation = handleStepValidation(wizard.state.currentStep, wizard.state.data);
    if (!stepValidation.valid) {
      setValidation(wizard.state.currentStep, stepValidation);
      return;
    }

    // Auto-generate attribute/skill suggestions when leaving the Description step (step 1)
    if (wizard.state.currentStep === 1 && !wizard.state.data.aiSuggestionsGenerated) {
      await generateAISuggestions();
    }

    goNext();
  }, [
    wizard.state.currentStep,
    wizard.state.data,
    setValidation,
    goNext,
    handleStepValidation,
    generateAISuggestions,
    markAttemptedStep,
  ]);

  const getDefaultSuggestions = () => ({
    attributes: [
      { name: "力量", description: "身体力量与耐力", minValue: 1, maxValue: 10, baseValue: 5, category: 'Physical', accepted: true },
      { name: "智力", description: "思维敏锐度与推理能力", minValue: 1, maxValue: 10, baseValue: 7, category: 'Mental', accepted: true },
      { name: "敏捷", description: "速度与灵巧", minValue: 1, maxValue: 10, baseValue: 6, category: 'Physical', accepted: true },
    ],
    skills: [
      { name: "战斗", description: "有效作战的能力", difficulty: 'medium' as const, category: 'Combat', linkedAttributeNames: ['力量'], accepted: true, baseValue: 5, minValue: 1, maxValue: 10 },
      { name: "潜行", description: "无声无息地行动", difficulty: 'hard' as const, category: 'Physical', linkedAttributeNames: ['敏捷'], accepted: true, baseValue: 5, minValue: 1, maxValue: 10 },
      { name: "察觉", description: "察觉细节与危险", difficulty: 'easy' as const, category: 'Mental', linkedAttributeNames: ['智力'], accepted: true, baseValue: 5, minValue: 1, maxValue: 10 },
    ],
  });

  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleCancel = useCallback(() => {
    // Check if user has made meaningful changes
    if (isDirty) {
      // Show confirmation dialog
      setShowCancelConfirmation(true);
    } else {
      clearAutoSave();
      // Direct cancel for clean state
      if (onCancel) {
        onCancel();
      } else {
        router.push('/worlds');
      }
    }
  }, [isDirty, clearAutoSave, onCancel, router]);

  const handleConfirmCancel = useCallback(() => {
    clearAutoSave();
    setShowCancelConfirmation(false);
    if (onCancel) {
      onCancel();
    } else {
      router.push('/worlds');
    }
  }, [clearAutoSave, onCancel, router]);

  const handleRejectCancel = useCallback(() => {
    setShowCancelConfirmation(false);
  }, []);

  const finishWizard = useCallback((worldId: string) => {
    if (onComplete) {
      onComplete(worldId);
    } else {
      router.push('/worlds');
    }
  }, [onComplete, router]);

  const handleComplete = useCallback(async () => {
    const data = wizard.state.data;
    setCreateError(null);

    // If the world was already created (e.g. returning to finalize), just finish.
    if (data.createdWorldId) {
      clearAutoSave();
      finishWizard(data.createdWorldId);
      return;
    }

    try {
      // Create the world first
      const worldId = createWorld({
        name: data.name || "未命名世界",
        description: data.description!,
        genre: data.genre!,
        attributes: data.attributes || [],
        skills: data.skills || [],
        settings: data.settings!,
        toneSettings: data.toneSettings || DEFAULT_TONE_SETTINGS,
        image: data.image, // Include any image if already generated
        reference: data.reference, // Include reference for character generation
        relationship: data.relationship, // Include relationship for character generation
      });

      // Set the newly created world as the active world
      const { setCurrentWorld } = useWorldStore.getState();
      setCurrentWorld(worldId);

      // Store the world ID in wizard state
      updateData({ createdWorldId: worldId });
      clearAutoSave();

      // Generate world image asynchronously after creation (only if no image was already generated)
      if (!data.image?.url) {
        const runWorldImageGeneration = async () => {
          try {
            const world = useWorldStore.getState().worlds[worldId];

            if (world) {
              const image = await generateWorldImage(world);
              useWorldStore.getState().updateWorld(worldId, { image });
            }
          } catch (error) {
            logger.error('[WorldCreationWizard] Failed to generate world image:', error);
          }
        };
        
        // Start image generation in the background
        runWorldImageGeneration();
      }

      void ensureWorldNpcRoster(worldId);

      finishWizard(worldId);
    } catch (error) {
      // Stay on this step with the draft intact so the player can retry.
      logger.error('[WorldCreationWizard] createWorld failed:', error);
      setCreateError("无法创建此世界。你的进度已保存在此处，请再次尝试创建世界。");
    }
  }, [
    wizard.state.data,
    updateData,
    createWorld,
    finishWizard,
    clearAutoSave,
  ]);

  const updateWorldData = useCallback((updates: Partial<WorldCreationData>) => {
    // Step components spread the entire step data plus one changed value
    // into `updates`, so diff against the last known data to find which
    // field(s) actually changed rather than treating every key as touched.
    const prevData = wizardDataRef.current;
    const changedKeys = (Object.keys(updates) as (keyof WorldCreationData)[]).filter(
      (key) => updates[key] !== prevData[key]
    );

    if (changedKeys.length > 0) {
      const stepIndex = wizard.state.currentStep;
      setTouchedFieldsByStep((prev) => {
        const nextSet = new Set(prev[stepIndex]);
        changedKeys.forEach((key) => nextSet.add(key));
        return { ...prev, [stepIndex]: nextSet };
      });
    }

    updateData(updates);
  }, [updateData, wizard.state.currentStep]);

  const stepProps = {
    worldData: wizard.state.data,
    errors: wizard.state.errors || {},
    onUpdate: updateWorldData,
  };

  const renderCurrentStep = () => {
    switch (wizard.state.currentStep) {
      case 0:
        return (
          <div>
            <BasicInfoStep {...stepProps} />
          </div>
        );
      case 1:
        return (
          <div>
            <DescriptionStep
              {...stepProps}
              isProcessing={wizard.state.isProcessing || false}
              aiSuggestions={wizard.state.data.aiSuggestions}
              suggestionMeta={wizard.state.data.aiSuggestionMeta}
              canGenerateSuggestions
              onGenerateSuggestions={generateAISuggestions}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <AttributeReviewStep
              {...stepProps}
              onClearSuggestions={clearAISuggestions}
            />
          </div>
        );
      case 3:
        return (
          <div>
            <SkillReviewStep
              {...stepProps}
              onClearSuggestions={clearAISuggestions}
            />
          </div>
        );
      case 4:
        return (
          <div>
            <FinalizeStep {...stepProps} />
          </div>
        );
      default:
        return null;
    }
  };

  const steps: WizardStepType[] = WIZARD_STEPS.map(step => ({
    id: step.id,
    label: step.label
  }));

  const currentValidation = wizard.state.validation[wizard.state.currentStep];
  const currentError = getVisibleStepError(
    currentValidation,
    touchedFieldsByStep[wizard.state.currentStep],
    attemptedSteps.has(wizard.state.currentStep)
  );

  return (
    <WizardContainer title="创建新世界">
      <div className="component-world-creation-wizard" data-testid="wizard-container">
        <WizardProgress 
          steps={steps} 
          currentStep={wizard.state.currentStep}
        />
        
        <div className="wizard-surface">
          <WizardStep error={currentError ?? createError}>
            <div key="wizard-content" data-testid="wizard-content">
              {renderCurrentStep()}
            </div>
          </WizardStep>

          <WizardNavigation
            onCancel={handleCancel}
            onBack={wizard.canGoBack ? handleBack : undefined}
            onNext={!wizard.isLastStep ? handleNext : undefined}
            onComplete={wizard.isLastStep ? handleComplete : undefined}
            currentStep={wizard.state.currentStep}
            totalSteps={WIZARD_STEPS.length}
            completeLabel="创建世界"
            completeTestId="step-complete-button"
            completeDataTutorial="finalize-world"
            // Only Create is gated on validity; handleComplete doesn't re-validate.
            disabled={wizard.isLastStep && !canProceedToNext()}
            isLoading={wizard.state.isProcessing || false}
          />
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelConfirmation}
        onClose={handleRejectCancel}
        onConfirm={handleConfirmCancel}
        title="取消世界创建？"
        message="你的进度将丢失。确定要取消吗？"
        variant="warning"
        confirmText="是的，取消"
        cancelText="继续编辑"
      />

      {/* Recovery Notification Dialog */}
      <RecoveryNotification
        isVisible={showRecoveryModal}
        lastSaved={recoveryPreview?.lastSaved}
        recoveryData={recoveryPreview}
        hasCurrentData={autoSaveHasCurrentData}
        title="发现世界创建进度"
        stepNames={[
          '基本信息',
          '世界描述',
          '查看属性',
          '查看技能',
          '完成',
        ]}
        onRecover={handleRecoverProgress}
        onDismiss={handleDismissRecovery}
      />
    </WizardContainer>
  );
}
