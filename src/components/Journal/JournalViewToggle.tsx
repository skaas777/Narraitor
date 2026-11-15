/**
 * JournalViewToggle - Toggle between list and table views
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { List, Table } from 'lucide-react';

export type JournalViewMode = 'list' | 'table';

interface JournalViewToggleProps {
  mode: JournalViewMode;
  onModeChange: (mode: JournalViewMode) => void;
}

/**
 * JournalViewToggle - Toggle between list and table views for journal entries
 *
 * Provides two buttons to switch the display mode of journal entries between
 * the default list/detail layout and a searchable, sortable table.
 *
 * @param props - Component properties
 * @param props.mode - The current active view mode ('list' or 'table')
 * @param props.onModeChange - Callback function triggered when a new mode is selected
 */
export function JournalViewToggle({ mode, onModeChange }: JournalViewToggleProps) {
  return (
    <div
      className="journal-view-toggle view-mode-toggle"
      role="group"
      aria-label="切换视图模式"
    >
      <Button
        variant={mode === 'list' ? 'default' : 'outline'}
        size="icon"
        onClick={() => onModeChange('list')}
        aria-label="列表视图"
        aria-pressed={mode === 'list'}
        className={mode === 'list' ? 'active' : ''}
      >
        <List />
      </Button>
      <Button
        variant={mode === 'table' ? 'default' : 'outline'}
        size="icon"
        onClick={() => onModeChange('table')}
        aria-label="表格视图"
        aria-pressed={mode === 'table'}
        className={mode === 'table' ? 'active' : ''}
      >
        <Table />
      </Button>
    </div>
  );
}
