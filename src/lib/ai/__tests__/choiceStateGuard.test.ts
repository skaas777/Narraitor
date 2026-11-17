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
