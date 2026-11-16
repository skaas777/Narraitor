import { useSessionStore } from '../sessionStore';
import { storeEvents, StoreEventTypes } from '@/lib/state/storePubSub';

describe('useSessionStore', () => {
  beforeEach(async () => {
    // Reset the store before each test
    await useSessionStore.getState().endSession();
  });

  it('initializes a session with the given worldId', async () => {
    // Arrange
    const worldId = 'test-world-id';
    const characterId = 'test-character-id';
    const onComplete = jest.fn();
    
    // Act
    await useSessionStore.getState().initializeSession(worldId, characterId, onComplete);
    
    // Assert - after initialization
    const state = useSessionStore.getState();
    expect(state.status).toBe('active');
    expect(state.worldId).toBe(worldId);
    expect(state.characterId).toBe(characterId);
    expect(state.currentSceneId).toBe('initial-scene');
    expect(state.playerChoices).toHaveLength(0); // Empty initially - populated by AI choice generator
    expect(onComplete).toHaveBeenCalled();
  });

  it('allows ending a session', async () => {
    // Arrange - initialize a session first
    const worldId = 'test-world-id';
    const characterId = 'test-character-id';
    await useSessionStore.getState().initializeSession(worldId, characterId);
    
    // Act - end the session
    await useSessionStore.getState().endSession();
    
    // Assert
    const state = useSessionStore.getState();
    expect(state.status).toBe('initializing');
    expect(state.worldId).toBe(null);
    expect(state.characterId).toBe(null);
    expect(state.currentSceneId).toBe(null);
    expect(state.playerChoices).toHaveLength(0);
  });

  it('preserves a new adventure when the previous session finishes saving later', async () => {
    await useSessionStore.getState().initializeSession('world-one', 'character-one');
    const previousId = useSessionStore.getState().id!;
    useSessionStore.getState().updateSavedSessionNarrativeCount(previousId, 3);
    let finishSaving!: () => void;
    const pendingSave = new Promise<void>((resolve) => { finishSaving = resolve; });
    const subscription = storeEvents.subscribe(StoreEventTypes.SESSION_ENDED, () => pendingSave);
    const clock = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000);

    try {
      const ending = useSessionStore.getState().endSession();
      await useSessionStore.getState().initializeSession('world-one', 'character-one', undefined, true);
      const replacementId = useSessionStore.getState().id;
      expect(replacementId).not.toBe(previousId);
      useSessionStore.getState().setCurrentScene('new-scene');
      finishSaving();
      await ending;

      const state = useSessionStore.getState();
      expect(state.id).toBe(replacementId);
      expect(state.characterId).toBe('character-one');
      expect(state.worldId).toBe('world-one');
      expect(state.status).toBe('active');
      expect(state.currentSceneId).toBe('new-scene');
      expect(state.sessionLifecycle[replacementId!].status).toBe('active');
      expect(state.savedSessions[previousId].narrativeCount).toBe(3);
      expect(state.sessionLifecycle[previousId].status).toBe('ended');
    } finally {
      finishSaving();
      clock.mockRestore();
      subscription.unsubscribe();
    }
  });

  it('allows setting session status', () => {
    // Arrange
    const store = useSessionStore.getState();
    
    // Act
    store.setStatus('loading');
    
    // Assert
    expect(useSessionStore.getState().status).toBe('loading');
    
    // Act again
    store.setStatus('paused');
    
    // Assert again
    expect(useSessionStore.getState().status).toBe('paused');
  });

  it('allows setting error message', () => {
    // Arrange
    const store = useSessionStore.getState();
    const errorMessage = 'Test error message';
    
    // Act
    store.setError(errorMessage);
    
    // Assert
    expect(useSessionStore.getState().error).toBe(errorMessage);
  });

  it('allows setting player choices', () => {
    // Arrange
    const store = useSessionStore.getState();
    const playerChoices = [
      { id: 'choice-1', text: 'Option 1', isSelected: false },
      { id: 'choice-2', text: 'Option 2', isSelected: false },
    ];
    
    // Act
    store.setPlayerChoices(playerChoices);
    
    // Assert
    expect(useSessionStore.getState().playerChoices).toEqual(playerChoices);
  });

  it('allows selecting a player choice', async () => {
    // Arrange - initialize a session and set up player choices
    await useSessionStore.getState().initializeSession('test-world-id', 'test-character-id');
    
    const testChoices = [
      { id: 'choice-1', text: 'Option 1', isSelected: false },
      { id: 'choice-2', text: 'Option 2', isSelected: false },
    ];
    useSessionStore.getState().setPlayerChoices(testChoices);
    
    // Act - select a choice
    useSessionStore.getState().selectChoice('choice-1');
    
    // Assert
    const state = useSessionStore.getState();
    expect(state.playerChoices[0].isSelected).toBe(true);
    expect(state.playerChoices[1].isSelected).toBe(false);
    
    // Act again - select a different choice
    useSessionStore.getState().selectChoice('choice-2');
    
    // Assert again
    const updatedState = useSessionStore.getState();
    expect(updatedState.playerChoices[0].isSelected).toBe(false);
    expect(updatedState.playerChoices[1].isSelected).toBe(true);
  });

  it('allows clearing player choices', async () => {
    // Arrange - initialize a session first to get default choices
    await useSessionStore.getState().initializeSession('test-world-id', 'test-character-id');
    
    // Act - clear the choices
    useSessionStore.getState().clearPlayerChoices();
    
    // Assert
    expect(useSessionStore.getState().playerChoices).toHaveLength(0);
  });

  it('allows setting current scene', () => {
    // Arrange
    const store = useSessionStore.getState();
    const sceneId = 'new-scene-id';
    
    // Act
    store.setCurrentScene(sceneId);
    
    // Assert
    expect(useSessionStore.getState().currentSceneId).toBe(sceneId);
  });

  it('allows pausing and resuming a session', async () => {
    // Arrange - initialize a session first
    await useSessionStore.getState().initializeSession('test-world-id', 'test-character-id');
    
    // Act - pause the session
    useSessionStore.getState().pauseSession();
    
    // Assert
    expect(useSessionStore.getState().status).toBe('paused');
    
    // Act again - resume the session
    useSessionStore.getState().resumeSession();
    
    // Assert again
    expect(useSessionStore.getState().status).toBe('active');
  });

  it('mints a new session ID when force is true for a fresh session', async () => {
    const worldId = 'test-world-id';
    const characterId = 'test-character-id';
    await useSessionStore.getState().initializeSession(worldId, characterId);
    const initialSessionId = useSessionStore.getState().id;

    // Small delay to ensure timestamp differs
    await new Promise((r) => setTimeout(r, 10));

    await useSessionStore.getState().initializeSession(worldId, characterId, undefined, true);
    const freshSessionId = useSessionStore.getState().id;

    expect(freshSessionId).toBeTruthy();
    expect(freshSessionId).not.toBe(initialSessionId);
  });

  it('treats a matching saved session as previous progress after the active id is cleared', async () => {
    useSessionStore.setState({
      id: null,
      status: 'initializing',
      worldId: null,
      characterId: null,
      savedSessions: {
        old: {
          id: 'old', worldId: 'test-world-id', characterId: 'test-character-id',
          lastPlayed: new Date().toISOString(), narrativeCount: 3,
        },
      },
      sessionLifecycle: {},
    });

    await useSessionStore.getState().initializeSession(
      'test-world-id', 'test-character-id', undefined, true
    );

    expect(useSessionStore.getState().id).not.toBe('old');
  });
});
