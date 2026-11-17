import { formatNarrativeResponse } from '../narrativeGenerator.response';
import { analyzeSegmentMetadata } from '../narrativeGenerator.metadata';
import type { AIClient } from '../types';
import { findStoryStateIssues } from '@/lib/narrative/storyMemory';
import type { NarrativeSegment } from '@/types/narrative.types';

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

it('initializes validated opening gear even when the draft reports no new acquisitions', async () => {
  const result = await formatNarrativeResponse({ content: JSON.stringify({
    content: '你收好自己的测试压力表。', metadata: { itemsAcquired: [] },
  }) }, 'scene', client, undefined, [], { heldItems: [], isOpeningScene: true });
  expect(result.metadata.itemsAcquired).toEqual([{ name: '测试压力表', quantity: 1 }]);
});

it('does not initialize starting gear again when it is already registered', async () => {
  const result = await formatNarrativeResponse({ content: '你收好测试压力表。' }, 'scene', client,
    undefined, [], { heldItems: [{ name: '测试压力表', quantity: 1 }], isOpeningScene: true });
  expect(result.metadata.itemsAcquired).toBeUndefined();
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

describe('transaction evidence reconciliation', () => {
  const content = '你把三文铜钱一枚一枚按在她筐沿上：「两把云萝卜。」她伸手一拨，铜钱落进布兜里。回到餐车，你点清零钱：二十五文。';
  const prior = [{ content: '你点清零钱，剩下二十八文。', metadata: { tags: [] } }] as unknown as NarrativeSegment[];
  const trade = { currency: '文', balance: 25, change: -3,
    evidence: '把三文铜钱一枚一枚按在筐沿上，她伸手一拨，铜钱落进布兜里' };
  const exactEvidence = '把三文铜钱一枚一枚按在她筐沿上';

  it('repairs a stitched quote when independent analysis agrees on the full transaction', async () => {
    mockAnalysis.mockResolvedValueOnce({ presentCharacterIds: [], items: [], storyMemory: {
      balances: [{ ...trade, evidence: exactEvidence }],
    } });
    const result = await formatNarrativeResponse({ content: JSON.stringify({ content,
      metadata: { storyMemory: { balances: [trade] } },
    }) }, 'scene', client);
    expect(result.metadata.storyMemory?.balances).toEqual([{ ...trade, evidence: exactEvidence }]);
    expect(findStoryStateIssues(result, prior, [])).toEqual([]);
  });

  it.each([
    { balance: 24 }, { change: -4 }, { currency: '金币' },
    { evidence: '你付出三文买下两把萝卜。' },
  ])('keeps a disputed or unsupported transaction blocked (%j)', async (difference) => {
    mockAnalysis.mockResolvedValueOnce({ presentCharacterIds: [], items: [], storyMemory: {
      balances: [{ ...trade, evidence: exactEvidence, ...difference }],
    } });
    const result = await formatNarrativeResponse({ content: JSON.stringify({ content,
      metadata: { storyMemory: { balances: [trade] } },
    }) }, 'scene', client);
    expect(result.metadata.storyMemory?.balances?.[0].evidence).toBe(trade.evidence);
    expect(findStoryStateIssues(result, prior, []).join(' ')).toContain('verbatim transaction');
  });

  it('does not let a matching citation bypass the wallet arithmetic', async () => {
    const wrong = { ...trade, balance: 24 };
    mockAnalysis.mockResolvedValueOnce({ presentCharacterIds: [], items: [], storyMemory: {
      balances: [{ ...wrong, evidence: exactEvidence }],
    } });
    const result = await formatNarrativeResponse({ content: JSON.stringify({ content,
      metadata: { storyMemory: { balances: [wrong] } },
    }) }, 'scene', client);
    expect(findStoryStateIssues(result, prior, []).join(' ')).toContain('previous total 28');
  });
});
