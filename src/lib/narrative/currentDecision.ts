import type { Decision, NarrativeSegment } from '@/types/narrative.types';

/** Answered or superseded choices belong to history, never the live composer. */
export function getCurrentDecision(
  decisions: readonly Decision[],
  latestSegment?: Pick<NarrativeSegment, 'id'>
): Decision | null {
  const latest = decisions.at(-1);
  if (!latest || latest.selectedOptionId || !latestSegment) return null;
  const sourceId = latest.narrativeSegmentId ?? latest.stateAuditSegmentId;
  return sourceId && sourceId !== latestSegment.id ? null : latest;
}
