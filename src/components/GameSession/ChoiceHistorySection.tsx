'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { buildDecisionHistory } from '@/lib/narrative/decisionHistory';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import type {
  DecisionHistoryEntry,
  DecisionOutcome,
} from '@/types/narrative.types';
import { useNarrativeStore } from '@/state/narrativeStore';
import type { EntityID } from '@/types/common.types';

interface ChoiceHistorySectionProps {
  sessionId: string;
  entries?: DecisionHistoryEntry[];
  initialCollapsed?: boolean;
}

const outcomeLabels: Record<DecisionOutcome, string> = {
  success: "成功",
  failure: "失败",
  mixed: "混合",
  'critical-success': "大成功",
  'critical-failure': "大失败",
};

const resolveDate = (value?: Date | string): Date | null => {
  if (!value) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getChoiceText = (entry: DecisionHistoryEntry): string => {
  const decision = entry.decision;
  const selectedOption = decision.options.find(
    (option) => option.id === decision.selectedOptionId
  );
  return selectedOption?.text || decision.selectedOptionId || "未知选项";
};

const buildExpandedSet = (previous: Set<EntityID>, decisionId: EntityID) => {
  const next = new Set(previous);
  if (next.has(decisionId)) {
    next.delete(decisionId);
  } else {
    next.add(decisionId);
  }
  return next;
};

const EMPTY_LIST: EntityID[] = [];

interface ChoiceHistoryContentProps {
  entries: DecisionHistoryEntry[];
  initialCollapsed: boolean;
}

const ChoiceHistoryContent: React.FC<ChoiceHistoryContentProps> = ({
  entries,
  initialCollapsed: _initialCollapsed,
}) => {
  const resolvedEntries = entries;
  const [expandedEntries, setExpandedEntries] = React.useState<Set<EntityID>>(
    new Set()
  );

  return (
    <section
      data-testid="choice-history-section"
    >
      {resolvedEntries.length === 0 ? (
        <p className="manuscript-choice-history-empty">
          还没有记录任何选项。当你开始做出选择后，你的决定将显示在这里。
        </p>
      ) : (
        <div className="manuscript-choice-history-list">
          {resolvedEntries.map((entry) => {
            const choiceText = getChoiceText(entry);
            const decisionPrompt = entry.decision.prompt.trim();
            const outcomeSegment = entry.outcomeSegment;
            const outcomeText =
              outcomeSegment?.content || "影响尚未可知。";
            const outcomeLocation = outcomeSegment?.metadata?.location;
            const decisionTime =
              resolveDate(entry.decision.selectedAt) ||
              resolveDate(outcomeSegment?.createdAt) ||
              resolveDate(outcomeSegment?.timestamp);
            const timeLabel = decisionTime
              ? formatRelativeTime(decisionTime)
              : "时间未知";
            const timeTitle = decisionTime
              ? formatDateTime(decisionTime)
              : undefined;
            const decisionOutcome = outcomeSegment?.metadata?.decisionOutcome;
            const decisionWeight = entry.decision.decisionWeight;
            const hasDetails = Boolean(decisionPrompt);
            const isExpanded = expandedEntries.has(entry.decision.id);
            const detailsId = `decision-details-${entry.decision.id}`;

            return (
              <article
                key={entry.decision.id}
                className="manuscript-choice-history-entry"
                data-testid="choice-history-entry"
              >
                <h4 className="manuscript-choice-history-choice">{choiceText}</h4>

                <div className="manuscript-choice-history-meta">
                  {decisionWeight && (
                    <span className="manuscript-choice-history-meta-item">
                      {decisionWeight} 权重
                    </span>
                  )}
                  {decisionOutcome && (
                    <span className="manuscript-choice-history-meta-item">
                      {outcomeLabels[decisionOutcome]}
                    </span>
                  )}
                  {decisionTime && (
                    <span className="manuscript-choice-history-meta-item" title={timeTitle}>
                      {timeLabel}
                    </span>
                  )}
                  {outcomeLocation && (
                    <span className="manuscript-choice-history-meta-item">
                      {outcomeLocation}
                    </span>
                  )}
                  {hasDetails && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="manuscript-choice-history-details-button"
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                      onClick={() => {
                        setExpandedEntries((previous) =>
                          buildExpandedSet(previous, entry.decision.id)
                        );
                      }}
                    >
                      {isExpanded ? "隐藏详情" : '详情'}
                    </Button>
                  )}
                </div>

                {hasDetails && isExpanded && (
                  <div id={detailsId} className="manuscript-choice-history-details">
                    {decisionPrompt}
                  </div>
                )}

                <div className="manuscript-choice-history-outcome">
                  {outcomeText}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

const ChoiceHistoryFromStore: React.FC<ChoiceHistorySectionProps> = ({
  sessionId,
  initialCollapsed = true,
}) => {
  const sessionDecisionIds = useNarrativeStore(
    (state) => state.sessionDecisions[sessionId] || EMPTY_LIST
  );
  const sessionSegmentIds = useNarrativeStore(
    (state) => state.sessionSegments[sessionId] || EMPTY_LIST
  );
  const decisionsById = useNarrativeStore((state) => state.decisions);
  const segmentsById = useNarrativeStore((state) => state.segments);

  const sessionDecisions = React.useMemo(
    () => sessionDecisionIds.map((id) => decisionsById[id]).filter(Boolean),
    [sessionDecisionIds, decisionsById]
  );
  const sessionSegments = React.useMemo(
    () => sessionSegmentIds.map((id) => segmentsById[id]).filter(Boolean),
    [sessionSegmentIds, segmentsById]
  );

  const resolvedEntries = React.useMemo(
    () =>
      buildDecisionHistory({
        decisions: sessionDecisions,
        segments: sessionSegments,
      }),
    [sessionDecisions, sessionSegments]
  );

  return (
    <ChoiceHistoryContent
      entries={resolvedEntries}
      initialCollapsed={initialCollapsed}
    />
  );
};

export const ChoiceHistorySection: React.FC<ChoiceHistorySectionProps> = ({
  sessionId,
  entries,
  initialCollapsed = true,
}) => {
  if (entries) {
    return (
      <ChoiceHistoryContent
        entries={entries}
        initialCollapsed={initialCollapsed}
      />
    );
  }

  return (
    <ChoiceHistoryFromStore
      sessionId={sessionId}
      initialCollapsed={initialCollapsed}
    />
  );
};
