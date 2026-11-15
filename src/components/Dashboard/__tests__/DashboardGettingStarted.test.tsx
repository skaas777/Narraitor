import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardGettingStarted } from '../DashboardGettingStarted';

describe('DashboardGettingStarted', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  it('shows unchecked step when world not created', () => {
    render(
      <DashboardGettingStarted
        hasWorlds={false}
        hasCharacters={false}
        hasSessions={false}
        onNavigate={mockOnNavigate}
      />
    );

    // Should show create world as next step
    expect(screen.getByRole('button', { name: /创建.*世界/i })).toBeInTheDocument();
  });

  it('shows checked step when world created', () => {
    render(
      <DashboardGettingStarted
        hasWorlds={true}
        hasCharacters={false}
        hasSessions={false}
        onNavigate={mockOnNavigate}
      />
    );

    // Should show create character as next step
    expect(screen.getByRole('button', { name: /创建.*角色/i })).toBeInTheDocument();
  });

  it('calls onNavigate with correct path when CTA clicked', async () => {
    const user = userEvent.setup();

    render(
      <DashboardGettingStarted
        hasWorlds={false}
        hasCharacters={false}
        hasSessions={false}
        onNavigate={mockOnNavigate}
      />
    );

    const createWorldButton = screen.getByRole('button', { name: /创建.*世界/i });
    await user.click(createWorldButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('/worlds');
  });

  it('progresses through steps as user completes them', () => {
    const { rerender } = render(
      <DashboardGettingStarted
        hasWorlds={false}
        hasCharacters={false}
        hasSessions={false}
        onNavigate={mockOnNavigate}
      />
    );

    // Step 1: Create World
    expect(screen.getByRole('button', { name: /创建.*世界/i })).toBeInTheDocument();

    // User creates world
    rerender(
      <DashboardGettingStarted
        hasWorlds={true}
        hasCharacters={false}
        hasSessions={false}
        onNavigate={mockOnNavigate}
      />
    );

    // Step 2: Create Character
    expect(screen.getByRole('button', { name: /创建.*角色/i })).toBeInTheDocument();

    // User creates character
    rerender(
      <DashboardGettingStarted
        hasWorlds={true}
        hasCharacters={true}
        hasSessions={false}
        onNavigate={mockOnNavigate}
      />
    );

    // Step 3: Start Playing
    expect(screen.getByRole('button', { name: /开始游玩/i })).toBeInTheDocument();
  });
});
