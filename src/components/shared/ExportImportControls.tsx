/**
 * ExportImportControls component
 * Provides UI for manual game state export and import functionality
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay/ErrorDisplay';
import { downloadGameState, importFromFile } from '@/lib/storage/exportService';

// Bound how big an import file can be before we even try to parse it.
// `downloadGameState()` enforces no matching cap and saves embed full
// `characterState` (AI portraits as base64 `data:image/...`) plus accumulated
// narrative history, so legitimate self-exported backups can easily run into
// the tens of MB. This ceiling is set high enough to accept any plausible
// self-export while still rejecting obviously-wrong files (a 4 GB video, a
// disk image) before we read them into memory.
const MAX_IMPORT_FILE_SIZE_BYTES = 250 * 1024 * 1024;

interface ExportImportControlsProps {
  className?: string;
}

export function ExportImportControls({ className = '' }: ExportImportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleExport = async () => {
    if (isExporting || isImporting) return;

    setIsExporting(true);
    
    try {
      await downloadGameState();
      showMessage("导出成功", 'success');
    } catch {
      showMessage("无法导出你的数据。请稍后再试。", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const clearInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    // The accept=".json" attribute is a UI hint only; users can still pick
    // anything via "All Files". Validate at the boundary before reading.
    if (!file.name.toLowerCase().endsWith('.json')) {
      showMessage("导入失败。请选择 .json 文件。", 'error');
      clearInput();
      return;
    }

    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      const limitMb = Math.round(MAX_IMPORT_FILE_SIZE_BYTES / (1024 * 1024));
      showMessage(`导入失败。文件超过 ${limitMb} MB 限制。`, 'error');
      clearInput();
      return;
    }

    setIsImporting(true);

    try {
      const result = await importFromFile(file);

      if (result.success) {
        showMessage(result.message || "导入成功", 'success');
      } else {
        showMessage(result.error || "导入失败", 'error');
      }
    } catch {
      showMessage("导入失败。请检查文件格式。", 'error');
    } finally {
      setIsImporting(false);
      clearInput();
    }
  };

  const isLoading = isExporting || isImporting;

  return (
    <div className={`settings-export-import ${className}`.trim()}>
      <div className="settings-export-import-actions">
        <Button
          onClick={handleExport}
          disabled={isLoading}
          variant="outline"

        >
          {isExporting ? "正在导出..." : "导出游戏数据"}
        </Button>

        <div className="settings-export-import-files">
          {/* Visually hidden: the styled Button below is the trigger (clicks this
              via ref). Kept in the DOM with an aria-label for assistive tech. */}
          <input
            id="import-file"
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={isLoading}
            className="sr-only"
            aria-label="从文件导入游戏数据"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            variant="outline"

          >
            {isImporting ? "正在导入..." : "导入游戏数据"}
          </Button>
        </div>
      </div>

      {message && (
        <ErrorDisplay
          variant="section"
          severity={messageType === 'success' ? 'info' : 'error'}
          message={message}
          showDismiss={true}
          onDismiss={() => setMessage(null)}
        />
      )}

      <div className="settings-export-import-help">
        <p>
          <strong>导出：</strong> 创建包含完整游戏状态的备份文件，包括世界、角色和进度。
        </p>
        <p>
          <strong>导入：</strong> 从之前导出的备份文件恢复游戏状态。这将替换你当前的数据。
        </p>
      </div>
    </div>
  );
}