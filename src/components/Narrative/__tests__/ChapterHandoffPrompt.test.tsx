import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ChapterHandoffPrompt } from '../ChapterHandoffPrompt';
import { useNarrativeStore } from '@/state/narrativeStore';
import { aiFetch } from '@/lib/ai/aiFetch';
import type { NarrativeSegment } from '@/types/narrative.types';

jest.mock('@/lib/ai/aiFetch', () => ({ aiFetch: jest.fn() }));
const mockFetch = jest.mocked(aiFetch);

it('automatically prepares one recap, resumes from persistence, and dismisses on continue', async () => {
  process.env.NEXT_PUBLIC_FEATURE_CHAPTERS = 'true';
  const boundary: NarrativeSegment = {
    id: 'boundary-ui',
    sessionId: 'session-ui',
    worldId: 'world-ui',
    type: 'ending',
    content: 'You reach the gate.',
    timestamp: new Date('2026-01-01'),
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    metadata: { tags: [], location: 'Gate', chapter: { number: 1 } },
  };
  useNarrativeStore.setState({
    _hasHydrated: true,
    segments: { [boundary.id]: boundary },
    sessionSegments: { 'session-ui': [boundary.id] },
  });
  const recap =
    '前情提要: Reached the gate.\n上次停下的地方: Gate.\n登场角色: None recorded.\n持有物品: None.\n未解线索: Cross the bridge.';
  let resolveRequest!: (response: Response) => void;
  mockFetch.mockReturnValue(
    new Promise((resolve) => {
      resolveRequest = resolve;
    })
  );
  const props = { worldId: 'world-ui', sessionId: 'session-ui' };
  const view = render(<ChapterHandoffPrompt {...props} />);
  expect(
    screen.getByRole('button', { name: "正在准备回顾" })
  ).toHaveAttribute('aria-disabled', 'true');
  await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
  await act(async () => {
    resolveRequest({
      ok: true,
      json: async () => ({ chapterRecap: recap }),
    } as Response);
  });
  expect(screen.getByText(/前情提要: Reached the gate/)).toBeInTheDocument();
  view.unmount();
  render(<ChapterHandoffPrompt {...props} />);
  expect(mockFetch).toHaveBeenCalledTimes(1);
  fireEvent.click(
    screen.getByRole('button', { name: "继续下一章" })
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(
    useNarrativeStore.getState().segments[boundary.id].metadata.chapter
      ?.continued
  ).toBe(true);
  delete process.env.NEXT_PUBLIC_FEATURE_CHAPTERS;
});
