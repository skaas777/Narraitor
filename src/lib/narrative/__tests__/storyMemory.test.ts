import { buildStoryMemoryContext, collectStoryMemory, findStoryStateIssues, parseStoryMemory, reconcileInferredLosses } from '../storyMemory';
import { createMockInventoryItem } from '@/lib/test-utils';
import type { NarrativeGenerationResult, NarrativeSegment } from '@/types/narrative.types';

const segment = (content: string, metadata: Partial<NarrativeSegment['metadata']> = {}): NarrativeSegment => ({
  id: content, content, metadata: { tags: [], ...metadata }, type: 'scene', timestamp: new Date(),
  createdAt: '', updatedAt: '',
});
const result = (metadata: Partial<NarrativeSegment['metadata']>, content = '继续调查'): NarrativeGenerationResult => ({
  content, segmentType: 'scene', metadata: { characterIds: [], tags: [], ...metadata },
});

describe('persistent story memory', () => {
  it('carries established answers, settled investigations and losses past 58 turns and a reload', () => {
    const history = [segment('宁代书只是代抄封皮。', {
      storyMemory: { facts: [{ key: '宁代书身份', value: '仅代抄封皮，不是寄信人' }], completedSteps: [{ key: '查代书', value: '已核实抄写人' }] },
      itemsLost: [{ name: '梁信', quantity: 1, lossReason: 'stolen' }],
    }), ...Array.from({ length: 58 }, (_, i) => segment(`后续场景${i}`))];
    const restored = JSON.parse(JSON.stringify(history));
    const context = buildStoryMemoryContext(restored, [], '找宁代书');
    expect(context).toContain('仅代抄封皮，不是寄信人');
    expect(context).toContain('已核实抄写人');
    expect(context).toContain('梁信: stolen');
    expect(context).toContain('CURRENT POSSESSION');
    expect(context).toContain('- Empty');
  });

  it('preserves the latest state of a fact instead of accumulating contradictory copies', () => {
    const history = [segment('', { storyMemory: { facts: [{ key: '老周位置', value: '北湾' }] } }),
      segment('', { storyMemory: { facts: [{ key: '老周位置', value: '门房拘留' }] } })];
    expect(collectStoryMemory(history).facts).toEqual([{ key: '老周位置', value: '门房拘留' }]);
  });

  it('retrieves old original evidence for saves that predate the memory feature', () => {
    const history = [segment('给母亲的旧信'), segment('梁信被稽查收走；你已交过六枚铜板。'),
      ...Array.from({ length: 40 }, (_, i) => segment(`普通场景${i}`))];
    expect(buildStoryMemoryContext(history, [], '梁信 铜板')).toContain('梁信被稽查收走');
  });

  it('rejects malformed deltas and invalid clocks', () => {
    expect(parseStoryMemory({ facts: [null, { key: '', value: 'x' }], time: { day: 1, minute: 1440 } })).toBeUndefined();
    expect(parseStoryMemory({ facts: [{ key: ' 信 ', value: ' 已收走 ' }] })?.facts).toEqual([{ key: '信', value: '已收走' }]);
  });

  it('detects a repeated confiscation and a backward clock before committing', () => {
    const history = [segment('', { itemsLost: [{ name: '梁信' }], storyMemory: { time: { day: 1, minute: 345, label: '卯三刻' } } })];
    const issues = findStoryStateIssues(result({ itemsLost: [{ name: '梁信' }], storyMemory: { time: { day: 1, minute: 90, label: '丑时' } } }), history, []);
    expect(issues).toHaveLength(2);
    expect(issues.join(' ')).toContain('already lost');
  });

  it('allows explicit recovery of a previously confiscated item', () => {
    const history = [segment('', { itemsLost: [{ name: '梁信' }] })];
    expect(findStoryStateIssues(result({ itemsAcquired: [{ name: '梁信' }], itemsLost: [{ name: '梁信' }] }), history, [])).toEqual([]);
  });

  it('catches a confiscation repeated in prose even when the model omits its metadata', () => {
    const history = [segment('', { itemsLost: [{ name: '梁信' }] })];
    expect(findStoryStateIssues(result({}, '稽查从内袋收走你的梁信。'), history, []).join(' ')).toContain('already lost');
  });

  it('merges partial metadata with inferred Chinese losses without double deductions', () => {
    const items = ['梁信', '马灯'].map((name) => createMockInventoryItem({ name }));
    const fixed = reconcileInferredLosses(result({ itemsLost: [{ name: '马灯', lossReason: 'destroyed' }] }, '稽查收走你的梁信。马灯摔碎了。'), items);
    expect(fixed.metadata.itemsLost?.map((item) => item.name)).toEqual(['马灯', '梁信']);
  });

  it('rejects spending more coins than held even when the model omits inventory metadata', () => {
    const inventory = [createMockInventoryItem({ name: '铜板', stackable: true, quantity: 3 })];
    const draft = reconcileInferredLosses(result({}, '你把六枚铜板交给跑差。'), inventory);
    expect(findStoryStateIssues(draft, [], inventory).join(' ')).toContain('only 3 held');
  });
});
