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
