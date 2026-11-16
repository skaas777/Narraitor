import { getTimestamp } from '@/lib/utils/timestamp';
import { useSessionStore } from '../sessionStore';
import { setupTestTimers } from '@/lib/test-utils/testTimers';

jest.mock('@/lib/utils/logger', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock('../persistence', () => ({
  createIndexedDBStorage: () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  }),
}));

const resetSessionStore = () => {
  useSessionStore.setState({
    id: null,
    status: 'initializing',
    currentSceneId: null,
    playerChoices: [],
    error: null,
    worldId: null,
    characterId: null,
    savedSessions: {},
    autoSave: {
      lastSaveTime: null,
      status: 'idle',
      errorMessage: null,
      totalSaves: 0,
    },
    narrativeHeight: 600,
  });
};

describe('Session Persistence: savedSessions collection', () => {
  beforeEach(() => {
    jest.useRealTimers();
    resetSessionStore();
  });

  describe('getSavedSession', () => {
    it('resumes the most recently played matching adventure rather than the first saved key', () => {
      const save = (id: string, lastPlayed: string, characterId = 'character-one', worldId = 'world-one') => ({
        id, worldId, characterId, lastPlayed, narrativeCount: 4,
      });
      useSessionStore.setState({
        savedSessions: {
          oldest: save('oldest', '2026-11-16T18:00:00.000Z'),
          newest: save('newest', '2026-11-16T19:00:00.000Z'),
          middle: save('middle', '2026-11-16T18:30:00.000Z'),
          otherCharacter: save('other-character', '2026-11-17T00:00:00.000Z', 'character-two'),
          otherWorld: save('other-world', '2026-11-17T00:00:00.000Z', 'character-one', 'world-two'),
        },
      });

      expect(useSessionStore.getState().getSavedSession('world-one', 'character-one')?.id).toBe('newest');
      expect(useSessionStore.getState().getSavedSession('missing-world', 'character-one')).toBeUndefined();
      expect(Object.keys(useSessionStore.getState().savedSessions)).toHaveLength(5);
    });

    it('prefers a newly saved adventure when timestamps tie and tolerates legacy invalid dates', () => {
      const save = (id: string, lastPlayed: string) => ({
        id, worldId: 'world-one', characterId: 'character-one', lastPlayed, narrativeCount: 1,
      });
      useSessionStore.setState({
        savedSessions: {
          old: save('old', '2026-11-16T19:00:00.000Z'),
          fresh: save('fresh', '2026-11-16T19:00:00.000Z'),
          legacy: save('legacy', 'invalid'),
        },
      });

      expect(useSessionStore.getState().getSavedSession('world-one', 'character-one')?.id).toBe('fresh');
    });
  });

  describe('updateSavedSessionNarrativeCount', () => {
    const setActiveSessionState = (sessionId: string, worldId: string | null, characterId: string | null) => {
      useSessionStore.setState(state => ({
        ...state,
        id: sessionId,
        worldId,
        characterId,
        status: 'active',
      }));
    };

    it('should create session entry in savedSessions when session has narrative content', () => {
      const sessionId = 'session-under-test';
      const worldId = 'test-world-id';
      const characterId = 'test-character-id';

      setActiveSessionState(sessionId, worldId, characterId);

      expect(useSessionStore.getState().savedSessions[sessionId]).toBeUndefined();

      useSessionStore.getState().updateSavedSessionNarrativeCount(sessionId, 1);

      const savedSession = useSessionStore.getState().savedSessions[sessionId];
      expect(savedSession).toBeDefined();
      expect(savedSession.id).toBe(sessionId);
      expect(savedSession.worldId).toBe(worldId);
      expect(savedSession.characterId).toBe(characterId);
      expect(savedSession.narrativeCount).toBe(1);
      expect(savedSession.lastPlayed).toBeDefined();
    });

    it('should skip creating a saved session if world or character context is missing', () => {
      const sessionId = 'session-without-context';

      setActiveSessionState(sessionId, null, null);

      useSessionStore.getState().updateSavedSessionNarrativeCount(sessionId, 1);

      expect(useSessionStore.getState().savedSessions[sessionId]).toBeUndefined();
    });

    it('should update narrativeCount for existing saved session', () => {
      const sessionId = 'test-session-id';
      const worldId = 'test-world-id';
      const characterId = 'test-character-id';

      useSessionStore.setState(state => ({
        ...state,
        savedSessions: {
          ...state.savedSessions,
          [sessionId]: {
            id: sessionId,
            worldId,
            characterId,
            lastPlayed: '2025-01-01T00:00:00.000Z',
            narrativeCount: 2,
          },
        },
      }));

      useSessionStore.getState().updateSavedSessionNarrativeCount(sessionId, 3);

      const savedSession = useSessionStore.getState().savedSessions[sessionId];
      expect(savedSession.narrativeCount).toBe(3);
      expect(savedSession.lastPlayed).not.toBe('2025-01-01T00:00:00.000Z');
    });

    it('should not create session entry for non-active session', () => {
      const randomSessionId = 'random-session-id';

      useSessionStore.getState().updateSavedSessionNarrativeCount(randomSessionId, 1);

      expect(useSessionStore.getState().savedSessions[randomSessionId]).toBeUndefined();
    });

    it('should update lastPlayed timestamp when narrative count increases', () => {
      const sessionId = 'timestamp-session';
      const worldId = 'test-world-id';
      const characterId = 'test-character-id';

      setupTestTimers();
      const initialTime = new Date('2025-01-01T00:00:00.000Z');
      jest.setSystemTime(initialTime);

      useSessionStore.setState(state => ({
        ...state,
        id: sessionId,
        worldId,
        characterId,
        status: 'active',
        savedSessions: {
          ...state.savedSessions,
          [sessionId]: {
            id: sessionId,
            worldId,
            characterId,
            lastPlayed: getTimestamp(),
            narrativeCount: 1,
          },
        },
      }));

      const initialTimestamp = useSessionStore.getState().savedSessions[sessionId].lastPlayed;

      const updatedTime = new Date('2025-01-01T00:00:01.000Z');
      jest.setSystemTime(updatedTime);
      const updatedTimestamp = getTimestamp();

      useSessionStore.getState().updateSavedSessionNarrativeCount(sessionId, 2);

      const savedSession = useSessionStore.getState().savedSessions[sessionId];
      expect(savedSession.lastPlayed).not.toBe(initialTimestamp);
      expect(savedSession.lastPlayed).toBe(updatedTimestamp);
      expect(savedSession.narrativeCount).toBe(2);
    });
  });

  describe('Session persistence during gameplay', () => {
    it('should persist session when narrative content is added during normal gameplay', () => {
      const worldId = 'gameplay-world';
      const characterId = 'gameplay-character';
      const sessionId = 'gameplay-session';

      useSessionStore.setState(state => ({
        ...state,
        id: sessionId,
        status: 'active',
        worldId,
        characterId,
      }));

      expect(Object.keys(useSessionStore.getState().savedSessions)).toHaveLength(0);

      useSessionStore.getState().updateSavedSessionNarrativeCount(sessionId, 1);

      expect(Object.keys(useSessionStore.getState().savedSessions)).toHaveLength(1);
      const savedSession = useSessionStore.getState().savedSessions[sessionId];
      expect(savedSession).toBeDefined();
      expect(savedSession.worldId).toBe(worldId);
      expect(savedSession.characterId).toBe(characterId);
      expect(savedSession.narrativeCount).toBe(1);
    });
  });
});
