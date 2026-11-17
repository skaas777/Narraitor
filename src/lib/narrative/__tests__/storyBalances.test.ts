import { extractExplicitPersonalBalances } from '../storyBalances';
import { collectStoryMemory, findStoryStateIssues } from '../storyMemory';
import type { NarrativeGenerationResult, NarrativeSegment } from '@/types/narrative.types';

const segment = (content: string): NarrativeSegment => ({ id: content, content, type: 'scene', metadata: { tags: [] }, timestamp: new Date(), createdAt: '', updatedAt: '' });

it('recovers the latest personal balance, excluding fares, NPC money and pickup amounts', () => {
  const memory = collectStoryMemory([segment('你把先前的零钱合在一处，正好三十文。'), segment('小羽还拨着铃铛。你把账报给他听——三十文付掉两文，剩下二十八文。'), segment('船票三十六文。八文铜钱落在窗台上。')]);
  expect(memory.balances?.[0]).toMatchObject({ currency: '文', balance: 28 });
  expect(extractExplicitPersonalBalances('罗栗剩下二十八文。票价三十六文。')).toEqual([]);
});

it('rejects an arithmetically inconsistent new balance before the turn commits', () => {
  const draft: NarrativeGenerationResult = { content: '你付出六文，买下餐具。', segmentType: 'scene', metadata: { characterIds: [], tags: [], storyMemory: {
    balances: [{ currency: '文', balance: 24, change: -6, evidence: '你付出六文' }],
  } } };
  const history = [segment('你数了数，剩下二十八文。')];
  expect(findStoryStateIssues(draft, history, []).join(' ')).toContain('previous total 28');
  draft.metadata.storyMemory!.balances![0].balance = 22;
  expect(findStoryStateIssues(draft, history, [])).toEqual([]);
});
