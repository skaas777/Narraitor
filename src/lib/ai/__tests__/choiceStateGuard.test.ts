import { enforceChoiceState } from '../choiceStateGuard';
import type { Decision } from '@/types/narrative.types';
import type { SessionSnapshot } from '@/types/turnResolver.types';

const decision: Decision = { id: 'next', prompt: '接下来做什么？', options: [
  { id: 'a', text: '用风干芥菜煮汤' }, { id: 'b', text: '马上去订票' }, { id: 'c', text: '留在原地看云海' },
] };
const snapshot = {
  inventory: [], segments: [{ metadata: { itemsLost: [{ name: '风干芥菜' }], causedByDecisionText: '暂不订票，先休息。' } }],
} as unknown as SessionSnapshot;

it('replaces unavailable-item and explicitly declined goal choices while preserving free actions', () => {
  const result = enforceChoiceState(decision, snapshot);
  expect(result.options).toHaveLength(3);
  expect(result.options.some((option) => option.text.includes('芥菜') || option.text.includes('订票'))).toBe(false);
  expect(result.options).toContainEqual(decision.options[2]);
});
it('allows explicitly reacquiring an absent item', () => {
  expect(enforceChoiceState({ ...decision, options: [{ id: 'buy', text: '买回风干芥菜' }] }, snapshot).options[0].id).toBe('buy');
});

it('blocks booking synonyms after the player declines tickets', () => {
  const result = enforceChoiceState({
    id: 'booking',
    prompt: '接下来做什么？',
    options: [
      { id: 'mark', text: '去登记台请陶枝先把温泉岛船名记上' },
      { id: 'cook', text: '回车上煮一小锅汤' },
      { id: 'rest', text: '留在栈道继续休息' },
    ],
  }, {
    ...snapshot,
    segments: [{ metadata: { tags: [], causedByDecisionText: '今天不订票，也不替别人订位。' } }],
  } as unknown as SessionSnapshot);
  expect(result.options.map((option) => option.id)).toEqual(['cook', 'rest', 'booking-state-0']);
});

it.each(['去登记台问问公共水桶的位置', '登记新菜单的价格', '不订票，继续看云海', '拒绝留名并回自己的车上'])('preserves non-booking actions: %s', (text) => {
  const result = enforceChoiceState({ id: 'd', prompt: '接下来？', options: [{ id: 'safe', text }] }, snapshot);
  expect(result.options).toEqual([{ id: 'safe', text }]);
});

it('does not confuse refusing to cook with refusing boat tickets', () => {
  const result = enforceChoiceState({ id: 'd', prompt: '接下来？', options: [{ id: 'book', text: '先把温泉岛船名记上' }] }, {
    ...snapshot, segments: [{ metadata: { causedByDecisionText: '今天不做菜，想坐船旅行。' } }],
  } as unknown as SessionSnapshot);
  expect(result.options[0].id).toBe('book');
});
