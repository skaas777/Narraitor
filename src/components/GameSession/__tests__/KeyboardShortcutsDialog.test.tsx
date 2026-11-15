import React from 'react';
import { render, screen } from '@testing-library/react';
import { KeyboardShortcutsDialog } from '../KeyboardShortcutsDialog';

describe('KeyboardShortcutsDialog', () => {
  it('is not in the document when closed', () => {
    render(<KeyboardShortcutsDialog open={false} onOpenChange={jest.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('lists the game-session keyboard shortcuts when open', () => {
    render(<KeyboardShortcutsDialog open onOpenChange={jest.fn()} />);

    const dialog = screen.getByRole('dialog', { name: /键盘快捷键/i });
    expect(dialog).toBeInTheDocument();

    expect(screen.getByText(/选择建议行动/i)).toBeInTheDocument();
    expect(screen.getByText(/打开日志/i)).toBeInTheDocument();
    expect(screen.getByText(/切换角色面板/i)).toBeInTheDocument();
    expect(screen.getByText(/关闭对话框或面板/i)).toBeInTheDocument();
    expect(screen.getByText(/显示快捷键指南/i)).toBeInTheDocument();
  });
});
