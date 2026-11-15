/**
 * FactInspector Component
 * Detailed view and editing of individual facts
 */

import React from 'react';
import { useLoreStore } from '@/state/loreStore';
import { FactEditor } from './FactEditor';
import { Button } from '@/components/ui/button';
import { SimpleModal } from '@/components/shared/SimpleModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EntityID } from '@/types/common.types';
import { displayLabel } from '@/lib/i18n/zhCN';

interface FactInspectorProps {
  factId: EntityID;
  onClose: () => void;
  onUpdate?: () => void;
}

export const FactInspector: React.FC<FactInspectorProps> = ({
  factId,
  onClose,
  onUpdate
}) => {
  const { facts, getFactHistory } = useLoreStore();

  const fact = facts[factId];
  const history = getFactHistory(factId) || { factId, versions: [] };

  if (!fact) {
    return null;
  }

  const handleSave = () => {
    onUpdate?.();
  };

  return (
    <SimpleModal
      isOpen={true}
      onClose={onClose}
      title="事实检查器"
    >
      <div>
        查看并编辑设定事实的详情、历史与关联。
      </div>

        <Tabs defaultValue="details" >
          <TabsList>
            <TabsTrigger value="details">详情</TabsTrigger>
            <TabsTrigger value="edit">编辑</TabsTrigger>
            <TabsTrigger value="history">历史</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" >
            <div>
              <div>
                <div>
                  <span>ID：</span>
                  <span>{fact.id}</span>
                </div>
                <div>
                  <span>世界 ID：</span>
                  <span>{fact.worldId}</span>
                </div>
              </div>

              <div>
                <span>键名：</span>
                <span>{fact.key}</span>
              </div>

              <div>
                <span>值：</span>
                <div>{fact.value}</div>
              </div>

              <div>
                <span>类别：</span>
                <span>{displayLabel(fact.category)}</span>
              </div>

              <div>
                <span>来源：</span>
                <span>{displayLabel(fact.source)}</span>
              </div>

              {fact.sessionId && (
                <div>
                  <span>冒险记录 ID：</span>
                  <span>{fact.sessionId}</span>
                </div>
              )}

              {fact.metadata && (
                <div>
                  <span>元数据：</span>
                  <div>
                    {fact.metadata.description && (
                      <div>
                        <span>描述：</span> {fact.metadata.description}
                      </div>
                    )}
                    {fact.metadata.importance && (
                      <div>
                        <span>重要性：</span> {displayLabel(fact.metadata.importance)}
                      </div>
                    )}
                    {fact.metadata.type && (
                      <div>
                        <span>类型：</span> {displayLabel(fact.metadata.type)}
                      </div>
                    )}
                    {fact.metadata.tags && fact.metadata.tags.length > 0 && (
                      <div>
                        <span>标签：</span>
                        <div>
                          {fact.metadata.tags.map((tag, index) => (
                            <span key={index} >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {fact.metadata.relatedEntities && fact.metadata.relatedEntities.length > 0 && (
                      <div>
                        <span>相关实体：</span>
                        <div>
                          {fact.metadata.relatedEntities.map((entity, index) => (
                            <span key={index} >
                              {entity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div>
                  <span>创建时间：</span>
                  <span>{new Date(fact.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <div>
                  <span>更新时间：</span>
                  <span>{new Date(fact.updatedAt).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit">
            <FactEditor
              worldId={fact.worldId}
              fact={fact}
              onSave={handleSave}
              onCancel={() => {}}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" >
            {history.length > 0 ? (
              <div>
                <div>
                  显示 {history.length} 个该事实的版本
                </div>
                {history.map((version, index) => (
                  <div key={index} >
                    <div>
                      <span>版本 {history.length - index}</span>
                      <span>
                        {new Date(version.updatedAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div>
                      <div>
                        <span>值：</span> {version.value}
                      </div>
                      {version.metadata?.description && (
                        <div>
                          <span>描述：</span> {version.metadata.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                此事实暂无历史记录
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </div>
    </SimpleModal>
  );
};
