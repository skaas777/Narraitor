import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameSessionConfirmationDialog } from '../GameSessionConfirmationDialog';

describe('GameSessionConfirmationDialog (exit)', () => {
  it('invokes onConfirm when the player confirms leaving the story', () => {
    // onConfirm is wired to router navigation at the page level, so this guards
    // that the exit-confirmation Confirm actually fires the leave flow (#1424).
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    render(
      <GameSessionConfirmationDialog
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        type="exit"
        currentProgress={3}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /离开故事/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps the player in the session when they cancel', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    render(
      <GameSessionConfirmationDialog
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        type="exit"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /继续游玩/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe('GameSessionConfirmationDialog (character-switch)', () => {
  it('replaces "the selected character" with the character name', () => {
    render(
      <GameSessionConfirmationDialog
        isOpen
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        type="character-switch"
        characterName="Elena the Brave"
      />
    );

    expect(
      screen.getByText(
        '切换角色将结束当前冒险记录，并以Elena the Brave开始新的冒险。你现有的进度已保存，之后可以返回继续。'
      )
    ).toBeInTheDocument();
  });

  it('keeps "the selected character" when characterName is not provided', () => {
    render(
      <GameSessionConfirmationDialog
        isOpen
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        type="character-switch"
      />
    );

    expect(
      screen.getByText(
        "切换角色将结束当前冒险记录，并以所选角色开始新的冒险。你现有的进度已保存，之后可以返回继续。"
      )
    ).toBeInTheDocument();
  });
});
