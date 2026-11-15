'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import WorldListScreen from '@/components/WorldListScreen/WorldListScreen';
import { PageLayout } from '@/components/shared/PageLayout';
import { ActionButtonGroup } from '@/components/shared/ActionButtonGroup';
import { useWorldStore } from '@/state/worldStore';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import {
  WorldTypeSelector,
  WorldTypeData,
  createInitialWorldTypeData,
} from '@/components/shared/WorldTypeSelector';
import { WorldFormFields } from '@/components/shared/WorldFormFields';
import { worldCreationService } from '@/lib/services/worldCreationService';
import { worldApi } from '@/lib/api/worldApi';
import { convertToGenerationParams } from '@/components/shared/WorldTypeSelector/utils';
import { SimpleModal } from '@/components/shared/SimpleModal';
import { useTutorial } from '@/components/TutorialProvider';
import { useSessionStore } from '@/state/sessionStore';
import { useEffect, useRef } from 'react';

export default function WorldsPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  // Tutorial integration
  const { startTour, stopTour, isTourActive } = useTutorial();
  const shouldShowTour = useSessionStore((state) =>
    state.shouldShowTutorialPhase('worldGeneration')
  );
  const completeTutorialPhase = useSessionStore(
    (state) => state.completeTutorialPhase
  );
  const tourStartedRef = useRef(false);

  useEffect(() => {
    if (!showPrompt) {
      tourStartedRef.current = false;
    }
  }, [showPrompt]);

  // Start tour when modal opens if needed (only once per modal session)
  useEffect(() => {
    if (
      showPrompt &&
      shouldShowTour &&
      !isTourActive &&
      !tourStartedRef.current
    ) {
      tourStartedRef.current = true;
      // Small delay to allow modal animation
      const timer = setTimeout(() => {
        // Re-check in case tutorial was completed during the timeout
        const stillShouldShow = useSessionStore
          .getState()
          .shouldShowTutorialPhase('worldGeneration');
        if (stillShouldShow) {
          startTour('worldGeneration');
        }
      }, 500);
      return () => clearTimeout(timer);
    } else if (!showPrompt && isTourActive) {
      stopTour();
    }
  }, [showPrompt, shouldShowTour, isTourActive, startTour, stopTour]);

  const [worldTypeData, setWorldTypeData] = useState<WorldTypeData>(
    createInitialWorldTypeData()
  );
  const [worldName, setWorldName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateWorld = () => {
    router.push('/worlds/create');
  };

  const handleGenerateWorld = async () => {
    // Validate world type data
    const { reference, relationship } =
      convertToGenerationParams(worldTypeData);

    if (relationship && !reference?.trim()) {
      setError("请输入已有的设定");
      return;
    }

    setIsGenerating(true);
    setGeneratingStatus("正在生成世界配置…");
    setError(null);

    // Complete tutorial phase if active
    if (shouldShowTour) {
      completeTutorialPhase('worldGeneration');
      stopTour();
    }

    try {
      // Get existing world names to ensure uniqueness
      const { worlds } = useWorldStore.getState();
      const existingNames = Object.values(worlds).map((w) => w.name);

      // Generate the world data using the API service
      setGeneratingStatus("正在生成世界配置…");
      const generatedData = await worldApi.generateWorld({
        worldReference: reference,
        worldRelationship: relationship,
        existingNames,
        suggestedName: worldName || undefined,
      });

      setGeneratingStatus("正在创建世界……");
      const { worldId } = await worldCreationService.createWorldFromGeneration({
        generatedData,
        customizations: worldName ? { name: worldName } : {},
        generateImage: true,
      });

      setGeneratingStatus("正在生成世界图像…");
      // Image generation is handled by the service in the background

      useWorldStore.getState().setCurrentWorld(worldId);

      // Hide the prompt and reset state
      setShowPrompt(false);
      setWorldTypeData(createInitialWorldTypeData());
      setWorldName('');
      setIsGenerating(false);

      // Stay on worlds page to see the new world
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成世界失败");
      setIsGenerating(false);
    }
  };

  const actionButtons = [
    {
      label: "创建世界",
      onClick: handleCreateWorld,
      variant: 'primary' as const,
      icon: <Plus aria-hidden="true" />,
    },
    {
      label: "生成世界",
      onClick: () => setShowPrompt(true),
      variant: 'secondary' as const,
      disabled: isGenerating,
    },
  ];

  return (
    <PageLayout
      title="我的世界"
      description="创建故事世界、管理角色，并游玩故事。"
      actions={
        <ActionButtonGroup actions={actionButtons} layout="horizontal" gap="sm" />
      }
    >
      {/* World Generation Prompt */}
      <SimpleModal
        isOpen={showPrompt}
        onClose={() => setShowPrompt(false)}
        title="生成世界"
        showCloseButton={false}
        ariaDescribedBy="generate-world-desc"
        footer={
          <ActionButtonGroup
            layout="horizontal"
            gap="md"
            actions={[
              {
                label: "取消",
                onClick: () => {
                  setShowPrompt(false);
                  setWorldTypeData(createInitialWorldTypeData());
                  setWorldName('');
                  setError(null);
                },
                variant: 'secondary',
                disabled: isGenerating,
              },
              {
                label: isGenerating ? "正在生成……" : "生成",
                onClick: handleGenerateWorld,
                variant: 'primary',
                disabled:
                  isGenerating ||
                  (worldTypeData.worldType !== 'original' &&
                    !worldTypeData.worldReference?.trim()),
                dataTutorial: 'generate-world-button',
                flex: true,
              },
            ]}
          />
        }
      >
        <div>
          <WorldFormFields.NameInput
            value={worldName}
            onChange={setWorldName}
            disabled={isGenerating}
            required={false}
            placeholder="例如：失落王国"
          />
          <p id="generate-world-desc">
            为你的世界自定义名称，或留空以生成名称
          </p>

          <WorldTypeSelector
            value={worldTypeData}
            onChange={setWorldTypeData}
            disabled={isGenerating}
            showLabels={true}
          />
          {error && <ErrorDisplay variant="inline" message={error} />}

          {isGenerating && (
            <p>
              <span />
              {generatingStatus}
            </p>
          )}
        </div>
      </SimpleModal>

      <WorldListScreen />
    </PageLayout>
  );
}
