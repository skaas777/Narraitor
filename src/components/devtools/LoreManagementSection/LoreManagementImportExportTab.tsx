import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LoreManagementImportExportTabProps {
  exportedData: string | null;
  showImportDialog: boolean;
  importData: string;
  onExport: () => void;
  onImport: () => void;
  onShowImportDialog: (value: boolean) => void;
  onImportDataChange: (value: string) => void;
}

export const LoreManagementImportExportTab: React.FC<LoreManagementImportExportTabProps> = ({
  exportedData,
  showImportDialog,
  importData,
  onExport,
  onImport,
  onShowImportDialog,
  onImportDataChange,
}) => (
  <div>
    <div>
      <h3>导出设定事实</h3>
      <Button onClick={onExport}>导出为 JSON</Button>
      {exportedData && (
        <div>
          <div>已导出数据（已复制到剪贴板）：</div>
          <pre>{exportedData}</pre>
        </div>
      )}
    </div>

    <div>
      <h3>导入设定事实</h3>
      {!showImportDialog ? (
        <Button onClick={() => onShowImportDialog(true)}>从 JSON 导入</Button>
      ) : (
        <div>
          <Textarea
            
            placeholder="在此粘贴 JSON 数据..."
            value={importData}
            onChange={(e) => onImportDataChange(e.target.value)}
          />
          <div>
            <Button onClick={onImport}>确认导入</Button>
            <Button
              variant="outline"
              onClick={() => {
                onShowImportDialog(false);
                onImportDataChange('');
              }}
            >
              取消
            </Button>
          </div>
        </div>
      )}
    </div>
  </div>
);
