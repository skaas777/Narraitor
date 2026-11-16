jest.unmock('../worldStore');

import { useWorldStore } from '../worldStore';
import { createTestWorldData } from './worldStore.testHelpers';

describe('world runtime state per session', () => {
  beforeEach(() => useWorldStore.getState().reset());

  it('keeps same-key relationships and threads separate after export and merge', () => {
    const worldId = useWorldStore.getState().createWorld(createTestWorldData());
    const update = useWorldStore.getState().updateWorldState;
    update(worldId, {
      npcRelationships: { guard: { trust: 80 } },
      playerCharacterThreads: {
        hero: { characterId: 'hero', summary: 'First case', appendHighlights: ['first clue'] },
      },
    }, 'session-one');
    update(worldId, {
      npcRelationships: { guard: { trustDelta: -10 } },
      playerCharacterThreads: {
        hero: { characterId: 'hero', summary: 'Second case', appendHighlights: ['second clue'] },
      },
    }, 'session-two');

    const exported = JSON.parse(JSON.stringify(useWorldStore.getState().getRawWorldState(worldId)));
    useWorldStore.setState({ worldStates: {} });
    useWorldStore.getState().mergeWorldState(exported);

    const first = useWorldStore.getState().getWorldState(worldId, { sessionId: 'session-one' });
    const second = useWorldStore.getState().getWorldState(worldId, { sessionId: 'session-two' });
    const fresh = useWorldStore.getState().getWorldState(worldId, { sessionId: 'session-fresh' });
    expect(first.npcRelationships.guard.trust).toBe(80);
    expect(second.npcRelationships.guard.trust).toBe(40);
    expect(first.playerCharacterThreads.hero.highlights).toEqual(['first clue']);
    expect(second.playerCharacterThreads.hero.highlights).toEqual(['second clue']);
    expect(first.sessionStates).toBeUndefined();
    expect(second.sessionStates).toBeUndefined();
    expect(fresh.npcRelationships).toEqual({});
    expect(fresh.playerCharacterThreads).toEqual({});
  });
});
