import { useCharacterStore } from '../characterStore';
import { storeEvents, StoreEventTypes } from '@/lib/state/storePubSub';
import type { StoreCharacter } from '../characterStore.types';

const character: StoreCharacter = {
  id: 'char-1',
  name: 'Ari',
  description: 'A test character',
  worldId: 'world-1',
  level: 2,
  attributes: [],
  skills: [],
  derivedStats: [{
    id: 'stat-1', characterId: 'char-1', derivedStatId: 'health', name: 'Health',
    currentValue: 2, maxValue: 10, lastCalculated: '2026-11-16T00:00:00.000Z',
  }],
  background: { history: 'kept', personality: 'kept', goals: [], fears: [], relationships: [] },
  isPlayer: true,
  status: { conditions: ['受伤'], location: '旧城' },
  inventory: { characterId: 'char-1', items: [], capacity: 20, categories: [], itemOrder: [] },
  createdAt: '2026-11-16T00:00:00.000Z',
  updatedAt: '2026-11-16T00:00:00.000Z',
};

const emit = (isForcedFresh: boolean, hasPreviousSession = true) =>
  storeEvents.emit(StoreEventTypes.SESSION_FRESH_START, {
    sessionId: 'session-new', worldId: 'world-1', characterId: 'char-1',
    isNewSession: true, isForcedFresh, hasPreviousSession,
  });

describe('characterStore SESSION_FRESH_START runtime reset', () => {
  beforeEach(() => {
    useCharacterStore.setState({
      characters: { 'char-1': { ...character } },
      entities: { 'char-1': { ...character } },
      currentCharacterId: 'char-1', currentEntityId: 'char-1', error: null, loading: false,
    });
  });

  it('resets runtime state for a forced fresh session with prior progress', async () => {
    await emit(true);
    const saved = useCharacterStore.getState().characters['char-1'];
    expect(saved.status).toEqual({ conditions: [], location: undefined });
    expect(saved.derivedStats[0].currentValue).toBe(10);
    expect(saved.background.history).toBe('kept');
  });

  it('keeps runtime state for resume and first-ever fresh sessions', async () => {
    await emit(false);
    expect(useCharacterStore.getState().characters['char-1'].status.conditions).toEqual(['受伤']);
    await emit(true, false);
    expect(useCharacterStore.getState().characters['char-1'].status.conditions).toEqual(['受伤']);
    expect(useCharacterStore.getState().characters['char-1'].derivedStats[0].currentValue).toBe(2);
  });
});
