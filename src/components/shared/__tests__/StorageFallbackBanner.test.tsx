import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { StorageFallbackBanner } from '../StorageFallbackBanner';
import {
  _resetStorageStatusForTesting,
  _setStorageStatusForTesting,
} from '@/state/persistence';
import { StorageStatus } from '@/lib/storage/resilientStorage';

describe('StorageFallbackBanner', () => {
  beforeEach(() => {
    _resetStorageStatusForTesting();
  });

  afterEach(() => {
    _resetStorageStatusForTesting();
  });

  it('renders ErrorBlock with warning message when storage status is unavailable', () => {
    _setStorageStatusForTesting(StorageStatus.UNAVAILABLE, {
      message: 'IndexedDB not available in this environment',
    });

    render(<StorageFallbackBanner />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('storage-fallback-banner');
    expect(screen.getByText(/无法保存到此浏览器/i)).toBeInTheDocument();
    expect(screen.getByText(/从设置中导出数据/i)).toBeInTheDocument();
    // The raw failure belongs in the log, not in the player's alert.
    expect(screen.queryByText(/IndexedDB/i)).not.toBeInTheDocument();
  });

  it('renders fallback warning when unavailable without a detailed notice message', () => {
    _setStorageStatusForTesting(StorageStatus.UNAVAILABLE, null);

    render(<StorageFallbackBanner />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Narraitor 目前无法保存到此浏览器。请保持此标签页打开，并从设置中导出数据，以免丢失进度。"
      )
    ).toBeInTheDocument();
  });

  it('reacts dynamically to storage status change events', () => {
    const { container } = render(<StorageFallbackBanner />);
    expect(container.firstChild).toBeNull();

    act(() => {
      _setStorageStatusForTesting(StorageStatus.UNAVAILABLE, {
        message: 'Quota exceeded',
      });
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/无法保存到此浏览器/i)).toBeInTheDocument();

    act(() => {
      _setStorageStatusForTesting(null, null);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
