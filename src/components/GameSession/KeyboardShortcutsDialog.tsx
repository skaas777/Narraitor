'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ShortcutEntry {
  keys: string[];
  description: string;
}

// Only the shortcuts actually wired up in the game session. Keep this
// list in sync with ChoiceSelector's number-key handling and the 'j'/'c'/'?'
// bindings in ActiveGameSession.
const SHORTCUTS: ShortcutEntry[] = [
  { keys: ['1', '-', '3'], description: "选择建议行动" },
  { keys: ['Enter'], description: "输入时提交自定义行动" },
  { keys: ['J'], description: "打开日志" },
  { keys: ['C'], description: "切换角色面板" },
  { keys: ['Esc'], description: "关闭对话框或面板" },
  { keys: ['?'], description: "显示快捷键指南" },
];

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="keyboard-shortcuts-dialog"
        aria-describedby={undefined}
      >
        <DialogTitle>键盘快捷键</DialogTitle>
        <ul className="keyboard-shortcuts-list">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.description} className="keyboard-shortcuts-item">
              <span className="keyboard-shortcuts-keys">
                {shortcut.keys.map((key) => (
                  <kbd key={key} className="keyboard-shortcuts-key">
                    {key}
                  </kbd>
                ))}
              </span>
              <span className="keyboard-shortcuts-description">{shortcut.description}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
