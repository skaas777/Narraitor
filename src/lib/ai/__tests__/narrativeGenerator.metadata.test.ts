import { analyzeSegmentMetadata } from '../narrativeGenerator.metadata';
import type { AIClient } from '../types';

describe('metadata recovery from completed narrative', () => {
  beforeEach(() => { jest.replaceProperty(process.env, 'NODE_ENV', 'production'); });
  afterEach(() => { jest.restoreAllMocks(); });

  const context = {
    heldItems: [{ name: '便携压力表', quantity: 1 }, { name: '密封胶带', quantity: 1 }],
    knownNpcs: [{ id: 'zhou-lan', name: '周岚' }, { id: 'lan-ai', name: '澜' }],
    previousLocation: '温室侧舱', playerAction: '前往加强环，把压力表交给周岚。',
  };

  it('recovers handover, current location and memory with known face-to-face NPC ids', async () => {
    const generateContent = jest.fn().mockResolvedValue({ content: JSON.stringify({
      presentCharacterIds: ['zhou-lan', 'invented-id'], items: [], location: '主控外第三道加强环',
      itemsLost: [{ name: '便携压力表', quantity: 1, lossReason: 'delivered' }],
      storyMemory: { facts: [{ key: '压力表持有人', value: '周岚持有压力表' }],
        completedSteps: [{ key: '回水支路', value: '三号阀已关闭，舱压稳定' }] },
    }) });
    const result = await analyzeSegmentMetadata(
      '你在第三道加强环取出便携压力表。周岚接过，把它卡在自己腕带上。澜在通讯中播报。',
      undefined, [], { generateContent } as unknown as AIClient, context
    );
    expect(result.presentCharacterIds).toEqual(['zhou-lan']);
    expect(result.location).toBe('主控外第三道加强环');
    expect(result.itemsLost).toEqual([{ name: '便携压力表', quantity: 1, lossReason: 'delivered' }]);
    expect(result.storyMemory?.facts?.[0].key).toBe('压力表持有人');
    expect(generateContent.mock.calls[0][0]).toContain('zhou-lan: 周岚');
    expect(generateContent.mock.calls[0][0]).toContain('different sentences');
  });

  it('rejects invented losses, different named items, overspending and nonpositive quantities', async () => {
    const client = { generateContent: jest.fn().mockResolvedValue({ content: JSON.stringify({
      items: [], presentCharacterIds: [], itemsLost: [
        { name: '测试压力表', quantity: 1, lossReason: 'delivered' },
        { name: '便携压力表', quantity: 2, lossReason: 'delivered' },
        { name: '密封胶带', quantity: 0, lossReason: 'consumed' },
        { name: '密封胶带', quantity: -1, lossReason: 'consumed' },
        null,
      ],
    }) }) } as unknown as AIClient;
    const result = await analyzeSegmentMetadata('你收起压力表和剩余胶带。', undefined, [], client, context);
    expect(result.itemsLost).toEqual([]);
  });

  it('does not mark the whole known roster present if analysis fails', async () => {
    const client = { generateContent: jest.fn().mockResolvedValue({ content: 'unusable response' }) } as unknown as AIClient;
    const result = await analyzeSegmentMetadata('你独自在侧舱等待。', undefined, [], client, context);
    expect(result.presentCharacterIds).toEqual([]);
    expect(result.itemsLost).toBeUndefined();
    expect(result.storyMemory).toBeUndefined();
  });

  it('requires quoted evidence on both sides of a claimed contradiction', async () => {
    const content = '你付了三十六文订好船票。';
    const client = { generateContent: jest.fn().mockResolvedValue({ content: JSON.stringify({
      presentCharacterIds: [], items: [], conflicts: [
        { priorEvidence: '我不订票', passageEvidence: '付了三十六文订好船票', reason: '替玩家完成了明确拒绝的购买' },
        { priorEvidence: '不存在的旧事实', passageEvidence: '付了三十六文订好船票', reason: '猜测' },
      ],
    }) }) } as unknown as AIClient;
    const result = await analyzeSegmentMetadata(content, undefined, [], client, { ...context, playerAction: '我不订票，只喝水休息。' });
    expect(result.stateConflicts).toHaveLength(1);
    expect(result.stateConflicts?.[0]).toContain('明确拒绝');
    expect(result.presenceVerified).toBe(true);
  });
});
