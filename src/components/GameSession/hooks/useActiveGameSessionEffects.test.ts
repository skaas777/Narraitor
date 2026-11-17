import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useNarrativeStore } from '@/state/narrativeStore';
import { useActiveGameSessionEffects } from './useActiveGameSessionEffects';

describe('useActiveGameSessionEffects', () => {
  beforeEach(() => {
    useNarrativeStore.setState({
      segments: { 'seg-1': { id: 'seg-1', sessionId: 'session-1', worldId: 'world-1', content: 'You reach the rooftop.', type: 'scene', metadata: { tags: [] }, timestamp: new Date(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } },
      sessionSegments: { 'session-1': ['seg-1'] }, decisions: {}, sessionDecisions: {},
    });
  });

  it('ends choice loading when a decision lands in the narrative store', () => {
    const { result } = renderHook(() => {
      const [isGenerating, setIsGenerating] = React.useState(false);
      const [initialized, setInitialized] = React.useState(false);
      const [isGeneratingChoices, setIsGeneratingChoices] = React.useState(true);

      useActiveGameSessionEffects({
        sessionId: 'session-1',
        controllerKey: 'controller-1',
        setIsGenerating,
        setInitialized,
        setIsGeneratingChoices,
      });

      return { isGenerating, initialized, isGeneratingChoices };
    });

    act(() => {
      useNarrativeStore.getState().addDecision('session-1', {
        prompt: 'What will you do?',
        options: [{ id: 'option-1', text: 'Look around', alignment: 'neutral' }],
        decisionWeight: 'minor',
      });
    });

    expect(result.current.isGeneratingChoices).toBe(false);

    const decision = useNarrativeStore.getState().getSessionDecisions('session-1').at(-1)!;
    act(() => {
      useNarrativeStore.getState().updateDecision(decision.id, { selectedOptionId: 'option-1' });
    });
    expect(result.current.isGeneratingChoices).toBe(true);
    act(() => {
      useNarrativeStore.getState().addDecision('session-1', {
        prompt: 'Old hallway choices', options: [], narrativeSegmentId: 'corridor',
      });
    });
    expect(result.current.isGeneratingChoices).toBe(true);
  });
});
