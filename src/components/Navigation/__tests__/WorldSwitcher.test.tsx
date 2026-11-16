import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorldSwitcher } from '../WorldSwitcher';

const mockNavigationData = {
  pathname: '/dashboard',
  currentWorldId: 'world-1',
  worlds: {
    'world-1': { id: 'world-1', name: 'Cyberpunk Neo-Tokyo', genre: 'scifi' },
  },
  characters: {},
  currentWorld: {
    id: 'world-1',
    name: 'Cyberpunk Neo-Tokyo',
    genre: 'scifi',
  },
  hasWorldsStore: true,
  worldCharacterCount: 0,
  navigateWithLoading: jest.fn(),
  setCurrentWorld: jest.fn(),
};

jest.mock('../useNavigationData', () => ({
  useNavigationData: () => mockNavigationData,
}));

describe('WorldSwitcher', () => {
  beforeEach(() => {
    mockNavigationData.worldCharacterCount = 0;
  });

  const openSwitcher = () => {
    const trigger = screen.getByRole('button', { name: /Cyberpunk Neo-Tokyo/ });
    fireEvent.click(trigger);
    return trigger;
  };

  it('opens the world list from the trigger', () => {
    render(<WorldSwitcher />);

    const trigger = openSwitcher();

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText("创建世界")).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', () => {
    render(<WorldSwitcher />);

    const trigger = openSwitcher();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText("创建世界")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('labels a single character in Chinese', () => {
    mockNavigationData.worldCharacterCount = 1;

    render(<WorldSwitcher />);

    expect(screen.getByText('1 个角色')).toBeInTheDocument();
    expect(screen.queryByText('1 character')).not.toBeInTheDocument();
  });
});
