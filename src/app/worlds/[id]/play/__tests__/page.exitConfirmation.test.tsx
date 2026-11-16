import { render, screen, fireEvent } from '@testing-library/react';
import PlayPage from '../page';

const pushMock = jest.fn();
const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();
const mockSessionMounts: boolean[] = [];

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: (...args: unknown[]) => pushMock(...args), replace: (...args: unknown[]) => mockReplace(...args) }),
  useParams: () => ({ id: 'world-1' }),
  useSearchParams: () => mockSearchParams,
  notFound: jest.fn(),
}));

jest.mock('@/components/GameSession/GameSession', () => {
  const React = jest.requireActual('react');
  return function DummyGameSession({
    worldId,
    onBack,
    onStartNew,
    onSessionStart,
    disableAutoResume = false,
  }: {
    worldId: string;
    onBack?: () => void;
    onStartNew?: () => void;
    onSessionStart?: () => void;
    disableAutoResume?: boolean;
  }) {
    const initialAutoResume = React.useRef(disableAutoResume);
    React.useEffect(() => { mockSessionMounts.push(initialAutoResume.current); }, []);
    return (
      <div>
        <div data-testid="mock-game-session">Game Session for {worldId}</div>
        <button type="button" data-testid="mock-back-btn" onClick={onBack}>
          Mock Back
        </button>
        <button type="button" data-testid="mock-start-new-btn" onClick={onStartNew}>
          Mock Start New
        </button>
        <button type="button" data-testid="mock-session-started" onClick={onSessionStart}>
          Session initialized
        </button>
      </div>
    );
  };
});

const sessionState = { id: 'session-1' };
const segmentsBySession: Record<string, string[]> = {};

jest.mock('@/state/sessionStore', () => ({
  useSessionStore: (selector: (state: typeof sessionState) => unknown) => selector(sessionState),
}));

jest.mock('@/state/narrativeStore', () => ({
  useNarrativeStore: () => ({
    getSessionSegments: (sessionId: string) => segmentsBySession[sessionId] ?? [],
  }),
}));

describe('PlayPage exit confirmation (#268)', () => {
  beforeEach(() => {
    pushMock.mockClear();
    mockReplace.mockClear();
    mockSearchParams = new URLSearchParams();
    mockSessionMounts.length = 0;
    sessionState.id = 'session-1';
    for (const key of Object.keys(segmentsBySession)) delete segmentsBySession[key];
  });

  // GameSession (which renders the mock back button) loads via next/dynamic,
  // so await its appearance before interacting.
  test('routes directly back when there is no narrative progress to abandon', async () => {
    render(<PlayPage />);

    fireEvent.click(await screen.findByTestId('mock-back-btn'));

    expect(pushMock).toHaveBeenCalledWith('/worlds/world-1');
    expect(screen.queryByText("离开故事？")).not.toBeInTheDocument();
  });

  test('prompts for confirmation when there is narrative progress', async () => {
    segmentsBySession['session-1'] = ['seg-a', 'seg-b'];
    render(<PlayPage />);

    fireEvent.click(await screen.findByTestId('mock-back-btn'));

    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByText("离开故事？")).toBeInTheDocument();
  });

  test('confirming the exit dialog navigates back to the world page', async () => {
    segmentsBySession['session-1'] = ['seg-a'];
    render(<PlayPage />);

    fireEvent.click(await screen.findByTestId('mock-back-btn'));
    fireEvent.click(screen.getByRole('button', { name: /离开故事/i }));

    expect(pushMock).toHaveBeenCalledWith('/worlds/world-1');
  });

  test('cancelling the exit dialog keeps the player on the page', async () => {
    segmentsBySession['session-1'] = ['seg-a'];
    render(<PlayPage />);

    fireEvent.click(await screen.findByTestId('mock-back-btn'));
    fireEvent.click(screen.getByRole('button', { name: /继续游玩/i }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.queryByText("离开故事？")).not.toBeInTheDocument();
  });

  test('remounts the session when an active play route requests a fresh game', async () => {
    const { rerender } = render(<PlayPage />);
    await screen.findByTestId('mock-start-new-btn');
    expect(mockSessionMounts).toEqual([false]);

    fireEvent.click(screen.getByTestId('mock-start-new-btn'));
    expect(mockSessionMounts).toEqual([false]);
    mockSearchParams = new URLSearchParams('fresh=true');
    rerender(<PlayPage />);
    expect(mockSessionMounts).toEqual([false, true]);

    // Requesting fresh again while the URL is unchanged must still restart.
    fireEvent.click(screen.getByTestId('mock-start-new-btn'));
    expect(mockSessionMounts).toEqual([false, true, true]);
  });

  test('consumes fresh after initialization so reloading resumes the new game', async () => {
    mockSearchParams = new URLSearchParams('fresh=true');
    const { rerender } = render(<PlayPage />);
    fireEvent.click(await screen.findByTestId('mock-session-started'));
    expect(mockReplace).toHaveBeenCalledWith('/worlds/world-1/play');

    // Next updates searchParams after replace; consuming the request must not
    // remount the active GameSession and interrupt its opening generation.
    mockSearchParams = new URLSearchParams();
    rerender(<PlayPage />);
    expect(mockSessionMounts).toEqual([true]);
  });
});
