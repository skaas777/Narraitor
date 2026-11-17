import { auditChoiceState } from '../choiceStateAudit';
import type { AIClient } from '../types';
import type { Decision, NarrativeSegment } from '@/types/narrative.types';
import type { SessionSnapshot } from '@/types/turnResolver.types';

const decision: Decision = { id: 'd', prompt: '下一步？', options: [
  { id: 'two-pots', text: '把两罐剩汤倒进锅里' }, { id: 'menu', text: '在本子里画新菜单' }, { id: 'rest', text: '坐着看云海' },
] };
const last = { id: 's', content: '你喝掉一罐，车里只剩一罐汤。', metadata: { tags: [], causedByDecisionText: '今天休息。' } } as unknown as NarrativeSegment;
const snapshot = { segments: [last], inventory: [], conditions: [] } as unknown as SessionSnapshot;

it('removes an old quantity only when the audit supplies a quote from saved evidence', async () => {
  const client = { generateContent: jest.fn().mockResolvedValue({ content: JSON.stringify({ invalid: [
    { id: 'two-pots', evidence: '车里只剩一罐汤', reason: '不能使用两罐' },
    { id: 'menu', evidence: '虚构的旧线索与场景', reason: '猜测' },
  ] }) }) } as unknown as AIClient;
  const result = await auditChoiceState(client, decision, snapshot);
  expect(result.options.map((option) => option.id)).not.toContain('two-pots');
  expect(result.options.map((option) => option.id)).toContain('menu');
  expect(result.options).toHaveLength(3);
  expect(result.stateAuditSegmentId).toBe('s');
});

it('preserves the guarded options on malformed or unavailable audits and propagates cancellation', async () => {
  const client = { generateContent: jest.fn().mockRejectedValue(new Error('offline')) } as unknown as AIClient;
  expect(await auditChoiceState(client, decision, snapshot)).toEqual(decision);
  const controller = new AbortController(); controller.abort();
  await expect(auditChoiceState(client, decision, snapshot, controller.signal)).rejects.toThrow('offline');
});
