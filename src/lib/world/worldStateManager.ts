// src/lib/world/worldStateManager.ts

import { EntityID } from '@/types/common.types';
import {
  WorldState,
  WorldStateUpdate,
  NPCRelationshipState,
  SessionWorldState,
} from '@/types/world-state.types';
import { SessionLifecycleStatus } from '@/types/session.types';
import {
  ensureState,
  mergeRelationships,
  mergeEvents,
  mergeCheckpoints,
  mergePlayerCharacterThreads,
  mergeCharacterRelationships,
  compareTimestamps,
} from './utils';
import { recordMajorEvent, recordStoryCheckpoint } from './events';
import {
  updateNPCRelationship,
  updateCharacterRelationship,
  updatePlayerCharacterThread,
  removePlayerCharacterThreads,
  removeCharacterRelationshipEdges,
} from './relationships';

type SessionStatusLookup = (sessionId: EntityID) => SessionLifecycleStatus | undefined;

export const mergeState = (current: WorldState, incoming: WorldState): WorldState => {
  const version = Math.max(current.version, incoming.version);
  const lastModified =
    compareTimestamps(incoming.lastModified, current.lastModified) >= 0
      ? incoming.lastModified
      : current.lastModified;

  const sessionStates: Record<EntityID, SessionWorldState> = { ...(current.sessionStates ?? {}) };
  for (const [sessionId, incomingSession] of Object.entries(incoming.sessionStates ?? {})) {
    const currentSession = sessionStates[sessionId];
    if (!currentSession || compareTimestamps(incomingSession.lastModified, currentSession.lastModified) >= 0) {
      sessionStates[sessionId] = incomingSession;
    }
  }

  return {
    worldId: current.worldId,
    version,
    lastModified,
    npcRelationships: mergeRelationships(current.npcRelationships, incoming.npcRelationships),
    majorEvents: mergeEvents(current.majorEvents, incoming.majorEvents),
    storyCheckpoints: mergeCheckpoints(current.storyCheckpoints ?? [], incoming.storyCheckpoints ?? []),
    playerCharacterThreads: mergePlayerCharacterThreads(
      current.playerCharacterThreads ?? {},
      incoming.playerCharacterThreads ?? {},
    ),
    characterRelationships: mergeCharacterRelationships(
      current.characterRelationships ?? {},
      incoming.characterRelationships ?? {},
    ),
    ...(Object.keys(sessionStates).length ? { sessionStates } : {}),
  };
};

export const applyWorldStateUpdate = (
  worldId: EntityID,
  state: WorldState | undefined,
  update: WorldStateUpdate,
  sessionId: EntityID,
): WorldState => {
  let workingState = ensureState(state, worldId);

  if (update.npcRelationships) {
    for (const [npcId, relationshipUpdate] of Object.entries(update.npcRelationships)) {
      workingState = updateNPCRelationship(worldId, workingState, npcId, relationshipUpdate, sessionId);
    }
  }

  if (update.majorEvents?.length) {
    for (const event of update.majorEvents) {
      workingState = recordMajorEvent(worldId, workingState, event, sessionId);
    }
  }

  if (update.storyCheckpoints?.length) {
    for (const checkpoint of update.storyCheckpoints) {
      workingState = recordStoryCheckpoint(worldId, workingState, checkpoint, sessionId);
    }
  }

  if (update.playerCharacterThreads) {
    for (const [threadKey, threadUpdate] of Object.entries(update.playerCharacterThreads)) {
      workingState = updatePlayerCharacterThread(worldId, workingState, threadKey, threadUpdate, sessionId);
    }
  }

  if (update.characterRelationships) {
    for (const [sourceCharacterId, relationships] of Object.entries(update.characterRelationships)) {
      for (const [targetCharacterId, relationshipUpdate] of Object.entries(relationships)) {
        workingState = updateCharacterRelationship(
          worldId,
          workingState,
          sourceCharacterId,
          targetCharacterId,
          relationshipUpdate,
          sessionId,
        );
      }
    }
  }

  if (update.removePlayerCharacterThreads?.length) {
    workingState = removePlayerCharacterThreads(worldId, workingState, update.removePlayerCharacterThreads);
  }

  if (update.removeCharacterRelationships?.length) {
    workingState = removeCharacterRelationshipEdges(worldId, workingState, update.removeCharacterRelationships);
  }

  return workingState;
};

/**
 * Applies an update against only one session's projection, then merges the
 * result back with the world's other session records. This prevents a fresh
 * session from using another session's relationship/thread values as deltas.
 */
export const applyWorldStateUpdateForSession = (
  worldId: EntityID,
  state: WorldState | undefined,
  update: WorldStateUpdate,
  sessionId: EntityID,
  lookupStatus?: SessionStatusLookup,
): WorldState => {
  const currentState = ensureState(state, worldId);
  // Snapshot legacy sessions before a same-key update replaces their aggregate
  // records. Existing archives remain authoritative, including removed records.
  const sessionStates = { ...(currentState.sessionStates ?? {}) };
  const legacySessionIds = new Set([
    ...Object.values(currentState.npcRelationships).map((value) => value.sessionId),
    ...currentState.majorEvents.map((value) => value.sessionId),
    ...currentState.storyCheckpoints.map((value) => value.sessionId),
    ...Object.values(currentState.playerCharacterThreads).flatMap((value) => value.sessionIds ?? []),
    ...Object.values(currentState.characterRelationships).flatMap((edges) =>
      Object.values(edges).map((value) => value.sessionId)),
  ]);
  for (const legacySessionId of legacySessionIds) {
    if (legacySessionId && !sessionStates[legacySessionId]) {
      sessionStates[legacySessionId] = getActiveWorldState(worldId, currentState, lookupStatus, legacySessionId);
    }
  }
  const sessionState = sessionStates[sessionId]
    ? ensureState(sessionStates[sessionId], worldId)
    : getActiveWorldState(worldId, currentState, lookupStatus ?? (() => 'active'), sessionId);
  const updatedSessionState = applyWorldStateUpdate(worldId, sessionState, update, sessionId);

  // Keep records owned by other sessions and overlay this session's updated
  // records. `mergeState` handles entity-level timestamp conflict resolution.
  const mergedState = mergeState(
    {
      ...currentState,
      npcRelationships: Object.fromEntries(
        Object.entries(currentState.npcRelationships).filter(([, value]) => value.sessionId !== sessionId),
      ),
      majorEvents: currentState.majorEvents.filter((event) => event.sessionId !== sessionId),
      storyCheckpoints: currentState.storyCheckpoints.filter((checkpoint) => checkpoint.sessionId !== sessionId),
      playerCharacterThreads: Object.fromEntries(
        Object.entries(currentState.playerCharacterThreads).filter(
          ([, thread]) => !(thread.sessionIds ?? []).includes(sessionId),
        ),
      ),
      characterRelationships: Object.fromEntries(
        Object.entries(currentState.characterRelationships).map(([sourceId, relationships]) => [
          sourceId,
          Object.fromEntries(
            Object.entries(relationships).filter(([, value]) => value.sessionId !== sessionId),
          ),
        ]).filter(([, relationships]) => Object.keys(relationships as Record<string, unknown>).length > 0),
      ),
    },
    updatedSessionState,
  );

  return {
    ...mergedState,
    sessionStates: {
      ...sessionStates,
      [sessionId]: updatedSessionState,
    },
  };
};

export const getActiveWorldState = (
  worldId: EntityID,
  state: WorldState | undefined,
  lookupStatus?: SessionStatusLookup,
  targetSessionId?: EntityID,
): WorldState => {
  const currentState = ensureState(state, worldId);

  if (!lookupStatus && !targetSessionId) {
    return currentState;
  }

  const isVisibleSession = (sessionId: EntityID): boolean => {
    if (targetSessionId) return sessionId === targetSessionId;
    const status = lookupStatus?.(sessionId);
    return !status || status === 'active';
  };

  const activeRelationships = Object.entries(currentState.npcRelationships).reduce<
    Record<EntityID, NPCRelationshipState>
  >((acc, [npcId, relationship]) => {
    if (isVisibleSession(relationship.sessionId)) {
      acc[npcId] = relationship;
    }
    return acc;
  }, {});

  const activeEvents = currentState.majorEvents.filter(event => {
    return isVisibleSession(event.sessionId);
  });
  const activeCheckpoints = currentState.storyCheckpoints.filter(checkpoint => {
    return isVisibleSession(checkpoint.sessionId);
  });

  // These fields are runtime projections too. Filter them by lifecycle so a
  // fresh session in the same world cannot inherit an ended session's trust,
  // relationships, or unresolved player thread.
  const activeCharacterRelationships = Object.entries(currentState.characterRelationships ?? {})
    .reduce<Record<EntityID, Record<EntityID, (typeof currentState.characterRelationships)[string][string]>>>(
      (outer, [sourceId, relationships]) => {
        const active = Object.entries(relationships).reduce<Record<EntityID, (typeof relationships)[string]>>(
          (inner, [targetId, relationship]) => {
            if (isVisibleSession(relationship.sessionId)) inner[targetId] = relationship;
            return inner;
          },
          {}
        );
        if (Object.keys(active).length) outer[sourceId] = active;
        return outer;
      },
      {}
    );

  const activePlayerCharacterThreads = Object.entries(currentState.playerCharacterThreads ?? {})
    .reduce<Record<EntityID, (typeof currentState.playerCharacterThreads)[string]>>(
      (acc, [threadId, thread]) => {
        const sessionIds = (thread.sessionIds ?? []).filter(isVisibleSession);
        if (!sessionIds.length) return acc;
        acc[threadId] = {
          ...thread,
          sessionIds,
          crossCharacterReferences: (thread.crossCharacterReferences ?? []).filter((reference) => {
            return reference.sessionId ? isVisibleSession(reference.sessionId) : !targetSessionId;
          }),
        };
        return acc;
      },
      {}
    );

  const { sessionStates: _sessionStates, ...projectedState } = currentState;
  return {
    ...projectedState,
    npcRelationships: activeRelationships,
    majorEvents: activeEvents,
    storyCheckpoints: activeCheckpoints,
    characterRelationships: activeCharacterRelationships,
    playerCharacterThreads: activePlayerCharacterThreads,
  };
};
