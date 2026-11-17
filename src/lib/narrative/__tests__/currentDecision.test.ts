import { getCurrentDecision } from '../currentDecision';
import type { Decision } from '@/types/narrative.types';

const decision: Decision = { id: 'decision-1', prompt: '下一步？', options: [] };

describe('current scene decision', () => {
  it('keeps an answered decision out of the composer after interruption', () => {
    expect(getCurrentDecision([{ ...decision, selectedOptionId: 'go-upstairs' }], { id: 'rooftop' })).toBeNull();
  });

  it('rejects choices bound to an earlier passage, even if unselected', () => {
    expect(getCurrentDecision([{ ...decision, narrativeSegmentId: 'corridor' }], { id: 'rooftop' })).toBeNull();
    expect(getCurrentDecision([{ ...decision, stateAuditSegmentId: 'corridor' }], { id: 'rooftop' })).toBeNull();
  });

  it('accepts current choices and legacy unselected saves without inventing a history link', () => {
    const current = { ...decision, narrativeSegmentId: 'rooftop' };
    expect(getCurrentDecision([current], { id: 'rooftop' })).toBe(current);
    expect(getCurrentDecision([decision], { id: 'rooftop' })).toBe(decision);
    expect(getCurrentDecision([decision])).toBeNull();
  });

  it('never resurrects an earlier decision when the latest one was answered', () => {
    expect(getCurrentDecision([decision, { ...decision, id: 'd2', selectedOptionId: 'chosen' }], { id: 'rooftop' })).toBeNull();
  });
});
