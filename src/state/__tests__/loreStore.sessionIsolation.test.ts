import { useLoreStore } from '../loreStore';
import type { StructuredLoreExtraction } from '@/types/lore.types';

const WORLD = 'world-tidal';
const OLD = 'session-song';
const FRESH = 'session-fang';

beforeEach(() => useLoreStore.getState().reset());

it('hides legacy model-shared events, locations and rules from a fresh playthrough', () => {
  const store = useLoreStore.getState();
  const ids = [
    store.addFact('rescue', '柯维已切开内舱门，正在岔口等右转方向', 'events', 'narrative', WORLD, OLD, undefined, 'world-shared'),
    store.addFact('control_room', '中央控制室', 'locations', 'narrative', WORLD, OLD,
      { description: '滤芯已换好，压力为101.3' }, 'world-shared'),
    store.addFact('pump_rule', '已修复的泵压稳定在101.3', 'rules', 'narrative', WORLD, OLD, undefined, 'world-shared'),
  ];
  const configured = store.addFact('world_rule', '空间站由中央控制室与温室组成', 'rules', 'manual', WORLD);

  expect(store.getLoreContext(WORLD, FRESH).factIds).toEqual([configured]);
  expect(store.getFacts({ worldId: WORLD, sessionId: FRESH }).map(f => f.id)).toEqual([configured]);
  expect(store.getLoreContext(WORLD, OLD).factIds).toEqual(expect.arrayContaining(ids));
  expect(store.getFacts({ worldId: WORLD })).toHaveLength(4);
});

it('keeps identically named characters and repeated event text in their own sessions', () => {
  const extraction: StructuredLoreExtraction = {
    characters: [{ name: '周岚', description: '留在控制室', visibility: 'world-shared' }],
    locations: [],
    events: [{ description: '周岚关上了温室总阀', visibility: 'world-shared' }],
    rules: [],
  };
  const store = useLoreStore.getState();
  store.addStructuredLore(extraction, WORLD, OLD);
  store.addStructuredLore({ ...extraction, characters: [
    { name: '周岚', description: '正在前往侧舱救援', visibility: 'world-shared' },
  ] }, WORLD, FRESH);

  const oldFacts = store.getFacts({ worldId: WORLD, sessionId: OLD });
  const freshFacts = store.getFacts({ worldId: WORLD, sessionId: FRESH });
  expect(oldFacts).toHaveLength(2);
  expect(freshFacts).toHaveLength(2);
  expect(freshFacts.every(fact => fact.sessionId === FRESH)).toBe(true);
  expect(freshFacts.find(fact => fact.value === '周岚')?.metadata?.description).toBe('正在前往侧舱救援');
  expect(oldFacts.find(fact => fact.value === '周岚')?.metadata?.description).toBe('留在控制室');
});
