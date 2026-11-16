import {
  updateNPCRelationship,
  recordMajorEvent,
  recordStoryCheckpoint,
  getActiveWorldState,
  mergeState,
  applyWorldStateUpdate,
  applyWorldStateUpdateForSession,
} from '../index';
import { createEmptyWorldState } from '@/types/world-state.types';

describe('worldStateManager', () => {
  const baseWorldId = 'world-test';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('filters relationships and events from ended sessions', () => {
    let state = createEmptyWorldState(baseWorldId);

    state = updateNPCRelationship(baseWorldId, state, 'npc-active', { trustDelta: 10 }, 'session-active');
    state = updateNPCRelationship(baseWorldId, state, 'npc-ended', { trustDelta: -20 }, 'session-ended');

    state = recordMajorEvent(
      baseWorldId,
      state,
      {
        id: 'event-ended',
        description: 'Kingdom falls into ruin',
        timestamp: new Date().toISOString(),
        characterId: 'character-1',
      },
      'session-ended'
    );

    state = recordMajorEvent(
      baseWorldId,
      state,
      {
        id: 'event-active',
        description: 'City holds a celebration',
        timestamp: new Date().toISOString(),
        characterId: 'character-2',
      },
      'session-active'
    );

    state = recordStoryCheckpoint(
      baseWorldId,
      state,
      {
        id: 'checkpoint-ended',
        segment: 'Recap of the doomed arc',
        highlights: ['Kingdom collapsed'],
        eventIds: ['event-ended'],
      },
      'session-ended'
    );

    state = recordStoryCheckpoint(
      baseWorldId,
      state,
      {
        id: 'checkpoint-active',
        segment: 'Festival recap',
        highlights: ['City celebrated the hero'],
        eventIds: ['event-active'],
      },
      'session-active'
    );

    const lookup = (sessionId: string) => (sessionId === 'session-active' ? 'active' : 'ended');

    const filtered = getActiveWorldState(baseWorldId, state, lookup);

    expect(filtered.npcRelationships).toHaveProperty('npc-active');
    expect(filtered.npcRelationships).not.toHaveProperty('npc-ended');
    expect(filtered.majorEvents.map(event => event.id)).toEqual(['event-active']);
    expect(filtered.storyCheckpoints.map(checkpoint => checkpoint.id)).toEqual(['checkpoint-active']);
  });

  it('projects a world state to one session without leaking another session', () => {
    let state = createEmptyWorldState(baseWorldId);

    state = updateNPCRelationship(baseWorldId, state, 'npc-shared', { trust: 80 }, 'session-one');
    state = updateNPCRelationship(baseWorldId, state, 'npc-other', { trust: 20 }, 'session-two');
    state = applyWorldStateUpdate(
      baseWorldId,
      state,
      {
        playerCharacterThreads: {
          'thread-one': {
            characterId: 'char-one',
            summary: 'Session one thread',
            highlights: [],
            sessionIds: ['session-one'],
          },
          'thread-both': {
            characterId: 'char-one',
            summary: 'Shared thread',
            highlights: [],
            sessionIds: ['session-one', 'session-two'],
          },
        },
        characterRelationships: {
          'char-one': {
            'char-two': { trust: 70, sentiment: 20, tension: 5 },
          },
        },
      },
      'session-one'
    );
    state = applyWorldStateUpdate(
      baseWorldId,
      state,
      {
        playerCharacterThreads: {
          'thread-two': {
            characterId: 'char-two',
            summary: 'Session two thread',
            highlights: [],
            sessionIds: ['session-two'],
          },
        },
        characterRelationships: {
          'char-two': {
            'char-one': { trust: 30, sentiment: -20, tension: 40 },
          },
        },
      },
      'session-two'
    );

    const projected = getActiveWorldState(baseWorldId, state, () => 'active', 'session-one');

    expect(Object.keys(projected.npcRelationships)).toEqual(['npc-shared']);
    expect(Object.keys(projected.playerCharacterThreads)).toEqual(['thread-one', 'thread-both']);
    expect(projected.playerCharacterThreads['thread-both'].sessionIds).toEqual(['session-one']);
    expect(projected.characterRelationships).toEqual({
      'char-one': {
        'char-two': expect.objectContaining({ trust: 70 }),
      },
    });
  });

  it('keeps same-key NPC and thread updates isolated between sessions', () => {
    let state = createEmptyWorldState(baseWorldId);

    state = applyWorldStateUpdateForSession(baseWorldId, state, {
      npcRelationships: { guard: { trust: 80 } },
      playerCharacterThreads: {
        'thread-hero': { characterId: 'hero', summary: 'First arc', highlights: ['first'] },
      },
    }, 'session-one');
    state = applyWorldStateUpdateForSession(baseWorldId, state, {
      npcRelationships: { guard: { trust: 20 } },
      playerCharacterThreads: {
        'thread-hero': { characterId: 'hero', summary: 'Second arc', highlights: ['second'] },
      },
    }, 'session-two');

    expect(getActiveWorldState(baseWorldId, state.sessionStates?.['session-one'], () => 'active', 'session-one').npcRelationships.guard.trust).toBe(80);
    expect(getActiveWorldState(baseWorldId, state.sessionStates?.['session-one'], () => 'active', 'session-one').playerCharacterThreads['thread-hero'].summary).toBe('First arc');
    expect(getActiveWorldState(baseWorldId, state.sessionStates?.['session-two'], () => 'active', 'session-two').npcRelationships.guard.trust).toBe(20);
    expect(getActiveWorldState(baseWorldId, state.sessionStates?.['session-two'], () => 'active', 'session-two').playerCharacterThreads['thread-hero'].summary).toBe('Second arc');
  });

  it('preserves legacy session records before a new session reuses their keys', () => {
    const legacy = applyWorldStateUpdate(baseWorldId, createEmptyWorldState(baseWorldId), {
      npcRelationships: { guard: { trust: 80 } },
      playerCharacterThreads: { hero: { characterId: 'hero', summary: 'Old case', highlights: ['old clue'] } },
      characterRelationships: { hero: { ally: { trust: 90 } } },
    }, 'legacy-session');
    delete legacy.sessionStates;
    const updated = applyWorldStateUpdateForSession(baseWorldId, legacy, {
      npcRelationships: { guard: { trustDelta: -10 } },
      playerCharacterThreads: { hero: { characterId: 'hero', summary: 'New case', highlights: ['new clue'] } },
      characterRelationships: { hero: { ally: { trustDelta: -5 } } },
    }, 'new-session');
    expect(updated.sessionStates?.['legacy-session'].npcRelationships.guard.trust).toBe(80);
    expect(updated.sessionStates?.['legacy-session'].playerCharacterThreads.hero.highlights).toEqual(['old clue']);
    expect(updated.sessionStates?.['legacy-session'].characterRelationships.hero.ally.trust).toBe(90);
    expect(updated.sessionStates?.['new-session'].npcRelationships.guard.trust).toBe(40);
    expect(updated.sessionStates?.['new-session'].characterRelationships.hero.ally.trust).toBe(45);
    expect(updated.sessionStates?.['legacy-session']).not.toHaveProperty('sessionStates');
  });

  it('keeps the newer archived session snapshot when merging world states', () => {
    const current = createEmptyWorldState(baseWorldId);
    current.sessionStates = {
      'session-one': {
        ...createEmptyWorldState(baseWorldId),
        lastModified: '2025-01-01T02:00:00.000Z',
      },
    };
    const incoming = createEmptyWorldState(baseWorldId);
    incoming.sessionStates = {
      'session-one': {
        ...createEmptyWorldState(baseWorldId),
        lastModified: '2025-01-01T01:00:00.000Z',
      },
    };

    const merged = mergeState(current, incoming);
    expect(merged.sessionStates?.['session-one']?.lastModified).toBe('2025-01-01T02:00:00.000Z');
  });

  it('filters character relationships and player threads by session lifecycle', () => {
    let state = createEmptyWorldState(baseWorldId);
    state = applyWorldStateUpdate(
      baseWorldId,
      state,
      {
        characterRelationships: {
          hero: { ally: { trust: 80, sentiment: 60, tension: 0 } },
        },
        playerCharacterThreads: {
          'thread-active': {
            id: 'thread-active', characterId: 'hero', summary: 'Active thread', highlights: [],
            sessionIds: ['session-active'], crossCharacterReferences: [],
          },
        },
      },
      'session-active'
    );
    state = applyWorldStateUpdate(
      baseWorldId,
      state,
      {
        characterRelationships: {
          villain: { ally: { trust: 10, sentiment: -60, tension: 70 } },
        },
        playerCharacterThreads: {
          'thread-ended': {
            id: 'thread-ended', characterId: 'hero', summary: 'Ended thread', highlights: [],
            sessionIds: ['session-ended'], crossCharacterReferences: [],
          },
        },
      },
      'session-ended'
    );

    const lookup = (sessionId: string) => sessionId === 'session-active' ? 'active' : 'ended';
    const filtered = getActiveWorldState(baseWorldId, state, lookup);

    expect(filtered.characterRelationships.hero?.ally?.trust).toBe(80);
    expect(filtered.characterRelationships.villain).toBeUndefined();
    expect(filtered.playerCharacterThreads).toHaveProperty('thread-active');
    expect(filtered.playerCharacterThreads).not.toHaveProperty('thread-ended');
  });

  it('applies relationship updates and increments version', () => {
    let state = createEmptyWorldState(baseWorldId);

    state = updateNPCRelationship(baseWorldId, state, 'npc-1', { trustDelta: 25 }, 'session-active');

    const relationship = state.npcRelationships['npc-1'];
    expect(relationship.trust).toBe(75);
    expect(relationship.sentiment).toBe(0);
    expect(state.version).toBe(1);
  });

  it('merges world states preferring most recent updates', () => {
    jest.setSystemTime(new Date('2025-01-01T01:00:00.000Z'));
    let current = createEmptyWorldState(baseWorldId);
    current = updateNPCRelationship(baseWorldId, current, 'npc-merge', { trust: 40 }, 'session-a');

    jest.setSystemTime(new Date('2025-01-01T02:00:00.000Z'));
    let incoming = createEmptyWorldState(baseWorldId);
    incoming = updateNPCRelationship(baseWorldId, incoming, 'npc-merge', { trust: 65 }, 'session-b');

    const merged = mergeState(current, incoming);
    const relationship = merged.npcRelationships['npc-merge'];

    expect(relationship.trust).toBe(65);
    expect(merged.version).toBe(Math.max(current.version, incoming.version));
    expect(merged.storyCheckpoints).toHaveLength(0);
  });

  it('removes player character threads and relationship edges when requested', () => {
    let state = createEmptyWorldState(baseWorldId);

    state = applyWorldStateUpdate(
      baseWorldId,
      state,
      {
        playerCharacterThreads: {
          'thread-charA': {
            id: 'thread-charA',
            characterId: 'charA',
            summary: 'CharA investigates the ruins.',
            highlights: ['CharA investigates the ruins.'],
            sessionIds: ['session-1'],
          },
          'thread-charB': {
            id: 'thread-charB',
            characterId: 'charB',
            summary: 'CharB patrols the marketplace.',
            highlights: ['CharB patrols the marketplace.'],
            sessionIds: ['session-1'],
            crossCharacterReferences: [
              {
                characterId: 'charA',
                summary: 'CharA asked CharB for backup.',
                lastReferencedAt: new Date().toISOString(),
                sessionId: 'session-1',
              },
            ],
          },
        },
      },
      'session-1'
    );

    state = applyWorldStateUpdate(
      baseWorldId,
      state,
      {
        characterRelationships: {
          charA: {
            charB: {
              sentiment: 35,
              trust: 70,
              tension: 15,
            },
          },
          charB: {
            charA: {
              sentiment: 20,
              trust: 55,
              tension: 10,
            },
          },
        },
      },
      'session-1'
    );

    expect(Object.keys(state.playerCharacterThreads)).toHaveLength(2);
    expect(state.characterRelationships.charA?.charB?.trust).toBe(70);

    state = applyWorldStateUpdate(
      baseWorldId,
      state,
      {
        removePlayerCharacterThreads: ['thread-charA'],
        removeCharacterRelationships: [
          { sourceId: 'charA', targetId: 'charB' },
          { sourceId: 'charB', targetId: 'charA' },
        ],
        playerCharacterThreads: {
          'thread-charB': {
            id: 'thread-charB',
            characterId: 'charB',
            crossCharacterReferences: [],
            replaceCrossCharacterReferences: true,
          },
        },
      },
      'cleanup-session'
    );

    expect(state.playerCharacterThreads).not.toHaveProperty('thread-charA');
    expect(state.characterRelationships.charA).toBeUndefined();
    expect(state.characterRelationships.charB?.charA).toBeUndefined();
    expect(state.playerCharacterThreads['thread-charB'].crossCharacterReferences).toHaveLength(0);
  });

  it('applies story checkpoint updates via world state update payloads', () => {
    const state = applyWorldStateUpdate(
      baseWorldId,
      createEmptyWorldState(baseWorldId),
      {
        storyCheckpoints: [
          {
            id: 'checkpoint-1',
            segment: 'First chapter recap',
            highlights: ['Hero met mentor'],
            eventIds: ['event-1'],
          },
        ],
      },
      'session-story'
    );

    expect(state.storyCheckpoints).toHaveLength(1);
    expect(state.storyCheckpoints[0].segment).toBe('First chapter recap');
    expect(state.storyCheckpoints[0].eventIds).toEqual(['event-1']);
    expect(state.storyCheckpoints[0].sessionId).toBe('session-story');
  });

  it('merges story checkpoints preferring the newest revisions', () => {
    const base = createEmptyWorldState(baseWorldId);
    const current = recordStoryCheckpoint(
      baseWorldId,
      base,
      {
        id: 'checkpoint-shared',
        segment: 'Old arc summary',
        highlights: ['Old highlight'],
        eventIds: ['event-old'],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      'session-a'
    );

    const incoming = recordStoryCheckpoint(
      baseWorldId,
      base,
      {
        id: 'checkpoint-shared',
        segment: 'Updated arc summary',
        highlights: ['New highlight'],
        eventIds: ['event-new'],
        createdAt: '2025-01-02T00:00:00.000Z',
      },
      'session-a'
    );

    const merged = mergeState(current, incoming);
    expect(merged.storyCheckpoints).toHaveLength(1);
    expect(merged.storyCheckpoints[0].segment).toBe('Updated arc summary');
    expect(merged.storyCheckpoints[0].eventIds).toEqual(['event-new']);
  });
});
