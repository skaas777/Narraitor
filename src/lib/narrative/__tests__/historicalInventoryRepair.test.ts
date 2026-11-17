import { findHistoricalInventoryRepairs } from '../historicalInventoryRepair';
import { createMockInventoryItem } from '@/lib/test-utils';
import type { NarrativeSegment } from '@/types/narrative.types';

const gift = (metadata: Partial<NarrativeSegment['metadata']> = {}): NarrativeSegment => ({
  id: 'gift', type: 'scene', timestamp: new Date(), createdAt: '2026-11-17T08:00:00Z', updatedAt: '',
  content: '你把那捆草绳扎紧的风干芥菜从随身袋里取出来，双手递过去。她接过去，把它挂到炉门边的铁钩上。',
  metadata: { tags: [], storyMemory: { facts: [{ key: '风干芥菜交易', value: '已作为谢礼交给罗栗，不再在主角随身袋中。' }] }, ...metadata },
});
const item = () => createMockInventoryItem({ name: '风干芥菜', quantity: 1, acquisitionHistory: [] });

it('repairs the real omitted handover from the original passage and contemporaneous memory', () => {
  const held = item();
  const repairs = findHistoricalInventoryRepairs([gift()], [held]);
  expect(repairs).toMatchObject([{ segmentId: 'gift', itemId: held.id, loss: { name: '风干芥菜', quantity: 1 } }]);
  const recorded = gift({ itemsLost: [repairs[0].loss] });
  expect(findHistoricalInventoryRepairs([recorded], [held])).toEqual([]);
});

it('does not apply a historical loss again after reacquisition', () => {
  expect(findHistoricalInventoryRepairs([gift(), { ...gift(), id: 'new', metadata: { tags: [], itemsAcquired: [{ name: '风干芥菜' }] } }], [item()])).toEqual([]);
});

it('requires both sources and a single complete item', () => {
  expect(findHistoricalInventoryRepairs([gift({ storyMemory: undefined })], [item()])).toEqual([]);
  expect(findHistoricalInventoryRepairs([{ ...gift(), content: '你打算明天把风干芥菜送给罗栗。' }], [item()])).toEqual([]);
  expect(findHistoricalInventoryRepairs([gift()], [{ ...item(), quantity: 2 }])).toEqual([]);
});
