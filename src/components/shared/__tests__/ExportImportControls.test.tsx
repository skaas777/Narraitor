/**
 * Tests for ExportImportControls component
 * Tests UI for manual save/load functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportImportControls } from '../ExportImportControls';
import * as exportService from '../../../lib/storage/exportService';

jest.mock('../../../lib/storage/exportService');

const mockedDownloadGameState = exportService.downloadGameState as jest.MockedFunction<
  typeof exportService.downloadGameState
>;
const mockedImportFromFile = exportService.importFromFile as jest.MockedFunction<
  typeof exportService.importFromFile
>;

describe('ExportImportControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedDownloadGameState.mockResolvedValue(undefined);
    mockedImportFromFile.mockResolvedValue({
      success: true,
      message: 'Import successful',
    });
  });

  describe('export functionality', () => {
    test('shows progress indicator during export', async () => {
      render(<ExportImportControls />);

      const exportButton = screen.getByRole('button', { name: /导出游戏数据/i });
      fireEvent.click(exportButton);

      expect(screen.getByText(/正在导出/i)).toBeInTheDocument();
    });

    test('shows success message after successful export', async () => {
      render(<ExportImportControls />);

      const exportButton = screen.getByRole('button', { name: /导出游戏数据/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/导出成功/i)).toBeInTheDocument();
      });
    });

    test('shows error message on export failure', async () => {
      mockedDownloadGameState.mockRejectedValue(new Error('Export failed'));

      render(<ExportImportControls />);

      const exportButton = screen.getByRole('button', { name: /导出游戏数据/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/无法导出你的数据/i)).toBeInTheDocument();
      });
    });
  });

  describe('import functionality', () => {
    test('handles file selection', async () => {
      render(<ExportImportControls />);

      const fileInput = screen.getByLabelText(/导入游戏/i);
      const mockFile = new File(['{"test": "data"}'], 'save.json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText(/正在导入/i)).toBeInTheDocument();
      });
    });

    test('shows import success message', async () => {
      render(<ExportImportControls />);

      const fileInput = screen.getByLabelText(/导入游戏/i);
      const mockFile = new File(['{"test": "data"}'], 'save.json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText(/操作未能完成，请稍后重试。/i)).toBeInTheDocument();
      });
    });

    test('shows import error message', async () => {
      mockedImportFromFile.mockResolvedValue({ success: false, error: 'Invalid file' });

      render(<ExportImportControls />);

      const fileInput = screen.getByLabelText(/导入游戏/i);
      const mockFile = new File(['invalid'], 'save.json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText(/操作未能完成，请稍后重试。/i)).toBeInTheDocument();
      });
    });
  });

  describe('user interaction', () => {
    test('disables buttons during operations', async () => {
      render(<ExportImportControls />);

      const exportButton = screen.getByRole('button', { name: /导出游戏数据/i });
      fireEvent.click(exportButton);

      expect(exportButton).toBeDisabled();
    });

    test('clears messages after timeout', async () => {
      jest.useFakeTimers();

      render(<ExportImportControls />);

      const exportButton = screen.getByRole('button', { name: /导出游戏数据/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/导出成功/i)).toBeInTheDocument();
      });

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByText(/导出成功/i)).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });
});
