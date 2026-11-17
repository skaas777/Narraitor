'use client';

import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useNarrativeStore } from '@/state/narrativeStore';
import Logger from '@/lib/utils/logger';

const logger = new Logger('ActiveGameSessionEffects');

interface UseActiveGameSessionEffectsOptions {
  sessionId: string;
  controllerKey: string;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  setInitialized: Dispatch<SetStateAction<boolean>>;
  setIsGeneratingChoices: Dispatch<SetStateAction<boolean>>;
}

/**
 * Drives session initialization and keeps the choice-loading flag in step with
 * narrativeStore. The decision itself is read from the store, and fallbacks
 * have one owner each: NarrativeController for the opening scene, and
 * usePlayerChoices for choices.
 */
export const useActiveGameSessionEffects = ({
  sessionId,
  controllerKey,
  setIsGenerating,
  setInitialized,
  setIsGeneratingChoices,
}: UseActiveGameSessionEffectsOptions) => {
  // Initialize the session once instead of clearing and recreating each time
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    const setupNarrative = async () => {
      try {
        // Imported dynamically to avoid circular dependencies
        const { useNarrativeStore } = await import('@/state/narrativeStore');
        if (!isMounted) return;

        // Any existing segments mean a resumed session; keep its history.
        const hasSegments =
          useNarrativeStore.getState().getSessionSegments(sessionId).length > 0;

        if (hasSegments) {
          const [{ useSessionStore }, { repairHistoricalInventory }, { assembleSessionSnapshot }, { enforceChoiceState }] = await Promise.all([
            import('@/state/sessionStore'),
            import('@/lib/narrative/turnResolver'),
            import('@/lib/narrative/sessionSnapshotAssembler'),
            import('@/lib/ai/choiceStateGuard'),
          ]);
          if (!isMounted) return;
          const active = useSessionStore.getState();
          if (active.id === sessionId && active.worldId && active.characterId) {
            repairHistoricalInventory(sessionId, active.characterId);
            const snapshot = assembleSessionSnapshot(sessionId, { worldId: active.worldId, characterId: active.characterId });
            const latest = snapshot.decisions.at(-1);
            if (latest && !latest.selectedOptionId) {
              const checked = enforceChoiceState(latest, snapshot);
              if (checked.options.some((option, index) => option.id !== latest.options[index]?.id)) {
                useNarrativeStore.getState().updateDecision(latest.id, { options: checked.options, contextSummary: checked.contextSummary });
              }
              if (latest.stateAuditSegmentId !== snapshot.segments.at(-1)?.id) {
                const [{ auditChoiceState }, { createDefaultGeminiClient }] = await Promise.all([
                  import('@/lib/ai/choiceStateAudit'), import('@/lib/ai/defaultGeminiClient'),
                ]);
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 20000);
                try {
                  const audited = await auditChoiceState(createDefaultGeminiClient(), checked, snapshot, controller.signal);
                  const current = useNarrativeStore.getState().decisions[latest.id];
                  if (isMounted && current && !current.selectedOptionId &&
                      useSessionStore.getState().id === sessionId) {
                    useNarrativeStore.getState().updateDecision(latest.id, {
                      options: audited.options, contextSummary: audited.contextSummary,
                      stateAuditSegmentId: audited.stateAuditSegmentId,
                    });
                  }
                } catch { /* The deterministic guard remains when an audit is unavailable. */ }
                finally { clearTimeout(timeout); }
              }
            }
          }
        }

        setInitialized(true);
        setIsGenerating(!hasSegments);
      } catch (error) {
        // Stop the generating state so the UI recovers instead of spinning forever.
        logger.error('Failed to set up narrative', error);
        setInitialized(true);
        setIsGenerating(false);
      }
    };

    setupNarrative();

    return () => {
      isMounted = false;
    };
  }, [sessionId, controllerKey, setIsGenerating, setInitialized]);

  // Track choice loading from the store: a decision ends it, and a session with
  // narrative but no decision is waiting on choices. Gated on this session's
  // decision and segment lists, since segments stream in token by token.
  useEffect(() => {
    let initialized = false;
    let prevDecisionIds: unknown;
    let prevSegmentIds: unknown;

    const unsubscribe = useNarrativeStore.subscribe((state) => {
      const decisionIds = state.sessionDecisions[sessionId];
      const segmentIds = state.sessionSegments[sessionId];

      if (
        initialized &&
        decisionIds === prevDecisionIds &&
        segmentIds === prevSegmentIds
      ) {
        return;
      }
      initialized = true;
      prevDecisionIds = decisionIds;
      prevSegmentIds = segmentIds;

      if ((decisionIds?.length ?? 0) > 0) {
        setIsGeneratingChoices(false);
      } else if ((segmentIds?.length ?? 0) > 0) {
        setIsGeneratingChoices(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId, setIsGeneratingChoices]);
};
