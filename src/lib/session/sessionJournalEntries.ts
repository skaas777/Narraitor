import { useJournalStore } from '@/state/journalStore';
import { useWorldStore } from '@/state/worldStore';
import { useCharacterStore } from '@/state/characterStore';
import { useNarrativeStore } from '@/state/narrativeStore';
import { formatSessionDuration, calculateNextSessionNumber } from '@/lib/utils/sessionUtils';
import type { SessionStartedEvent, SessionEndedEvent } from '@/lib/state/storePubSub';

/**
 * Session-boundary journal entries.
 *
 * Relocated out of sessionStore so it doesn't import sibling stores —
 * sessionStore emits SESSION_STARTED / SESSION_ENDED and these handlers
 * (subscribed in src/state/storeEventWiring.ts) do the cross-store reads.
 */

export const handleSessionStarted = ({ sessionId, worldId, characterId, startedAt }: SessionStartedEvent): void => {
  const journalStore = useJournalStore.getState();
  const world = useWorldStore.getState().worlds[worldId];
  const character = useCharacterStore.getState().characters[characterId];

  // Get all journal entries to calculate session number
  const allEntries = Object.values(journalStore.entries).flat();
  const sessionNumber = calculateNextSessionNumber(allEntries);

  journalStore.addEntry(sessionId, {
    type: 'session_start',
    worldId,
    characterId,
    title: "冒险开始",
    content: `新的旅程开始了${world ? `，地点在${world.name}` : ''}`,
    significance: 'minor' as const,
    isRead: false,
    relatedEntities: [],
    metadata: {
      tags: ['system', 'session'],
      automaticEntry: true,
      sessionStartTime: startedAt,
      sessionContext: {
        worldName: world?.name || "未知世界",
        characterName: character?.name || "未知角色",
        sessionNumber
      }
    },
    updatedAt: startedAt
  });
};

export const handleSessionEnded = ({ sessionId, worldId, characterId, endedAt }: SessionEndedEvent): void => {
  const journalStore = useJournalStore.getState();
  const sessionEntries = journalStore.getSessionEntries(sessionId);

  // Calculate session duration by looking for the session start entry
  let sessionDuration = 0;
  const sessionStartEntry = sessionEntries.find(entry => entry.type === 'session_start');
  if (sessionStartEntry?.metadata.sessionStartTime) {
    const startTime = new Date(sessionStartEntry.metadata.sessionStartTime);
    const endTime = new Date(endedAt);
    sessionDuration = endTime.getTime() - startTime.getTime();
  }

  const world = useWorldStore.getState().worlds[worldId];
  const character = useCharacterStore.getState().characters[characterId];
  const narrativeSegments = useNarrativeStore.getState().getSessionSegments(sessionId);

  const durationText = sessionDuration > 0 ? formatSessionDuration(sessionDuration) : "未知时长";
  const segmentCount = narrativeSegments.length;

  journalStore.addEntry(sessionId, {
    type: 'session_end',
    worldId,
    characterId,
    title: "冒险结束",
    content: `本次冒险记录历时${durationText}后结束${segmentCount > 0 ? `，包含${segmentCount}段故事${''}` : ''}`,
    significance: 'minor' as const,
    isRead: false,
    relatedEntities: [],
    metadata: {
      tags: ['system', 'session'],
      automaticEntry: true,
      sessionDuration,
      sessionContext: {
        worldName: world?.name || "未知世界",
        characterName: character?.name || "未知角色",
        sessionNumber: sessionStartEntry?.metadata.sessionContext?.sessionNumber ?? calculateNextSessionNumber(Object.values(journalStore.entries).flat())
      }
    },
    updatedAt: endedAt
  });
};
