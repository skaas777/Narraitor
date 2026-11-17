import { formatNarrativeResponse } from '../narrativeGenerator.response';
import { analyzeSegmentMetadata } from '../narrativeGenerator.metadata';
import type { AIClient } from '../types';

jest.mock('../narrativeGenerator.metadata', () => ({ analyzeSegmentMetadata: jest.fn() }));
const mockAnalysis = analyzeSegmentMetadata as jest.MockedFunction<typeof analyzeSegmentMetadata>;
const client = { generateContent: jest.fn() } as unknown as AIClient;

beforeEach(() => {
  mockAnalysis.mockResolvedValue({
    presentCharacterIds: [],
    items: [{ name: '测试压力表', quantity: 1 }],
  });
});

it('respects no-new-items metadata instead of re-acquiring a renamed carried tool', async () => {
  const result = await formatNarrativeResponse({ content: JSON.stringify({
    content: '你把机械压力表交给周岚，自己只保留扳手。',
    metadata: { itemsAcquired: [], itemsLost: [{ name: '机械压力表', lossReason: 'delivered' }] },
  }) }, 'scene', client);
  expect(result.metadata.itemsAcquired).toBeUndefined();
  expect(result.metadata.itemsLost?.[0].name).toBe('机械压力表');
});

it('keeps analysis-based acquisition as fallback only when the primary field is absent', async () => {
  const result = await formatNarrativeResponse({ content: JSON.stringify({
    content: '你从工具架领取一只测试压力表。', metadata: {},
  }) }, 'scene', client);
  expect(result.metadata.itemsAcquired).toEqual([{ name: '测试压力表', quantity: 1 }]);
});

it('keeps an empty physical-presence result instead of restoring a remote NPC candidate', async () => {
  const result = await formatNarrativeResponse({ content: JSON.stringify({
    content: '你独自在库房听见通讯器里的声音。',
    metadata: { characterIds: ['npc-radio'], itemsAcquired: [] },
  }) }, 'scene', client);
  expect(result.metadata.characterIds).toEqual([]);
});

it('recovers a final location, multi-sentence handover and memory when the response has only prose', async () => {
  const memory = { facts: [{ key: '压力表持有人', value: '周岚持有压力表' }], completedSteps: [] };
  mockAnalysis.mockResolvedValueOnce({
    presentCharacterIds: ['zhou-lan'], items: [],
    location: '主控外第三道加强环',
    itemsLost: [{ name: '便携压力表', quantity: 1, lossReason: 'delivered' }],
    storyMemory: memory,
  });
  const result = await formatNarrativeResponse({
    content: '你在第三道加强环取出便携压力表。周岚接过，把它卡在自己腕带上。',
  }, 'scene', client, '温室侧舱', [], {
    heldItems: [{ name: '便携压力表', quantity: 1 }], knownNpcs: [{ id: 'zhou-lan', name: '周岚' }],
  });
  expect(result.metadata.location).toBe('主控外第三道加强环');
  expect(result.metadata.itemsLost?.[0].name).toBe('便携压力表');
  expect(result.metadata.storyMemory).toEqual(memory);
  expect(result.metadata.characterIds).toEqual(['zhou-lan']);
});

it('preserves explicit no-loss and primary state when fallback analysis disagrees', async () => {
  const memory = { facts: [{ key: '工具', value: '仍由方棠持有' }], completedSteps: [] };
  mockAnalysis.mockResolvedValueOnce({ presentCharacterIds: [], items: [],
    location: '别处', itemsLost: [{ name: '便携压力表', lossReason: 'delivered' }],
    storyMemory: { facts: [{ key: '工具', value: '已交出' }], completedSteps: [] },
  });
  const result = await formatNarrativeResponse({ content: JSON.stringify({
    content: '你仍在侧舱，收好压力表。',
    metadata: { location: '温室侧舱', characterIds: [], itemsLost: [], storyMemory: memory },
  }) }, 'scene', client, '走廊', [], {
    heldItems: [{ name: '便携压力表', quantity: 1 }], knownNpcs: [{ id: 'zhou-lan', name: '周岚' }],
  });
  expect(result.metadata.itemsLost).toBeUndefined();
  expect(result.metadata.location).toBe('温室侧舱');
  expect(result.metadata.storyMemory).toEqual(memory);
  expect(mockAnalysis.mock.calls.at(-1)?.[4]?.knownNpcs).toEqual([{ id: 'zhou-lan', name: '周岚' }]);
});
