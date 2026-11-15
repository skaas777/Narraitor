/**
 * LoreManagementSection Component
 * Store world facts for developer tools and debugging
 * 
 * Provides developer-facing interface for managing world facts
 */

import React, { useState } from 'react';
import { useLoreStore } from '@/state/loreStore';
import { useWorldStore } from '@/state/worldStore';
import { useSessionStore } from '@/state/sessionStore';
import { DevToolsSection } from '@/components/devtools/shared/DevToolsSection';
import { FactEditor } from './FactEditor';
import { FactInspector } from './FactInspector';
import { useLoreManagementData } from './useLoreManagementData';
import { LoreManagementBrowseTab } from './LoreManagementBrowseTab';
import { LoreManagementSearchTab } from './LoreManagementSearchTab';
import { LoreManagementImportExportTab } from './LoreManagementImportExportTab';
import { LoreManagementUsageTab } from './LoreManagementUsageTab';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LoreCategory } from '@/types/lore.types';
import type { EntityID } from '@/types/common.types';
import { logger } from '@/lib/utils/logger';

export const LoreManagementSection: React.FC = () => {
  const [selectedWorldId, setSelectedWorldId] = useState<EntityID>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<LoreCategory | ''>('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'session-private' | 'world-shared'>('all');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'current' | EntityID>('all');
  const [selectedFactId, setSelectedFactId] = useState<EntityID | null>(null);
  const [importData, setImportData] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exportedData, setExportedData] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { worlds } = useWorldStore();
  const currentSessionId = useSessionStore((state) => state.id);
  const currentSessionWorldId = useSessionStore((state) => state.worldId);
  const {
    facts: allFacts,
    getFacts,
    searchFacts,
    deleteFact,
    exportFacts,
    importFacts,
    loreUsage,
    loreUsageEvents,
    clearLoreUsage
  } = useLoreStore();

  const {
    sessionOptions,
    facts,
    factsByCategory,
    visibilityStats,
    usageSummary,
    usageRows,
    usageEvents,
  } = useLoreManagementData({
    selectedWorldId,
    searchQuery,
    categoryFilter,
    visibilityFilter,
    sessionFilter,
    currentSessionId: currentSessionId || undefined,
    allFacts,
    getFacts,
    searchFacts,
    loreUsage,
    loreUsageEvents
  });

  const handleWorldChange = (worldId: EntityID) => {
    setSelectedWorldId(worldId);
    setSelectedFactId(null);
    setMessage(null);
    if (currentSessionId && currentSessionWorldId === worldId) {
      setSessionFilter('current');
    } else {
      setSessionFilter('all');
    }
  };

  const handleDeleteFact = (factId: EntityID) => {
    if (window.confirm("确定要删除这条设定吗？")) {
      deleteFact(factId);
      setSelectedFactId(null);
      setMessage({ type: 'success', text: "设定删除成功" });
    }
  };

  const handleExport = () => {
    if (!selectedWorldId) return;
    
    const data = exportFacts(selectedWorldId);
    setExportedData(data);
    setMessage({ type: 'success', text: "设定导出成功" });
    
    // Copy to clipboard
    navigator.clipboard.writeText(data);
  };

  const handleImport = () => {
    if (!selectedWorldId || !importData) return;
    
    try {
      importFacts(selectedWorldId, importData);
      setImportData('');
      setShowImportDialog(false);
      setMessage({ type: 'success', text: "设定导入成功" });
    } catch (e) {
      logger.error('Error importing facts', { error: e });
      setMessage({ type: 'error', text: `导入设定失败：${e instanceof Error ? e.message : "请检查 JSON 格式。"}` });
    }
  };

  const categoryColors: Record<LoreCategory, string> = {
    characters: '',
    locations: '',
    events: '',
    rules: ''
  };

  const handleClearUsage = () => {
    if (!selectedWorldId) return;
    if (window.confirm("确定要清除此世界的所有设定使用数据吗？此操作无法撤销。")) {
      clearLoreUsage(selectedWorldId);
      setMessage({ type: 'success', text: "设定使用数据已清除" });
    }
  };

  return (
    <DevToolsSection title="设定管理">
      {/* World Selector */}
      <div>
        <label htmlFor="world-select" >
          选择世界
        </label>
        <Select 
          id="world-select"
          value={selectedWorldId} 
          onChange={(e) => handleWorldChange(e.target.value)}
        >
          <option value="">选择世界</option>
          {Object.values(worlds).map(world => (
            <option key={world.id} value={world.id}>
              {world.name}
            </option>
          ))}
        </Select>
      </div>

      {selectedWorldId && (
        <Tabs defaultValue="browse" >
          <TabsList>
            <TabsTrigger value="browse">浏览</TabsTrigger>
            <TabsTrigger value="create">创建</TabsTrigger>
            <TabsTrigger value="search">搜索</TabsTrigger>
            <TabsTrigger value="import-export">导入/导出</TabsTrigger>
            <TabsTrigger value="usage">使用情况</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse">
            <LoreManagementBrowseTab
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              sessionFilter={sessionFilter}
              onSessionFilterChange={setSessionFilter}
              visibilityFilter={visibilityFilter}
              onVisibilityFilterChange={setVisibilityFilter}
              currentSessionId={currentSessionId || undefined}
              currentSessionWorldId={currentSessionWorldId || undefined}
              selectedWorldId={selectedWorldId}
              sessionOptions={sessionOptions}
              facts={facts}
              factsByCategory={factsByCategory}
              categoryColors={categoryColors}
              visibilityStats={visibilityStats}
              onSelectFact={(id) => setSelectedFactId(id)}
              onDeleteFact={handleDeleteFact}
            />
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create">
            <FactEditor
              worldId={selectedWorldId}
              onSave={() => {
                setMessage({ type: 'success', text: "设定创建成功" });
              }}
            />
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <LoreManagementSearchTab
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              sessionFilter={sessionFilter}
              onSessionFilterChange={setSessionFilter}
              currentSessionId={currentSessionId || undefined}
              currentSessionWorldId={currentSessionWorldId || undefined}
              selectedWorldId={selectedWorldId}
              sessionOptions={sessionOptions}
              facts={facts}
              categoryColors={categoryColors}
              onSelectFact={(id) => setSelectedFactId(id)}
            />
          </TabsContent>

          {/* Import/Export Tab */}
          <TabsContent value="import-export">
            <LoreManagementImportExportTab
              exportedData={exportedData}
              showImportDialog={showImportDialog}
              importData={importData}
              onExport={handleExport}
              onImport={handleImport}
              onShowImportDialog={setShowImportDialog}
              onImportDataChange={setImportData}
            />
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
            <LoreManagementUsageTab
              usageSummary={usageSummary}
              usageRows={usageRows}
              usageEvents={usageEvents}
              categoryColors={categoryColors}
              onClearUsage={handleClearUsage}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Message Display */}
      {message && (
        <Alert>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Fact Inspector Modal */}
      {selectedFactId && (
        <FactInspector
          factId={selectedFactId}
          onClose={() => setSelectedFactId(null)}
          onUpdate={() => {
            setMessage({ type: 'success', text: "设定更新成功" });
          }}
        />
      )}
    </DevToolsSection>
  );
};
