import React, { useState, useCallback, useMemo } from 'react';
import { WorldAttribute, WorldSkill } from '@/types/world.types';
import { EntityID } from '@/types/common.types';
import { AttributeEditor } from '@/components/world/AttributeEditor';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { SimpleModal } from '@/components/shared/SimpleModal';
import { displayLabel } from '@/lib/i18n/zhCN';


/**
 * Props for the WorldAttributesForm component
 */
interface WorldAttributesFormProps {
  /** Array of world attributes to display and manage */
  attributes: WorldAttribute[];
  /** Optional array of skills that may be linked to attributes */
  skills?: WorldSkill[];
  /** ID of the world these attributes belong to */
  worldId: string;
  /** Maximum number of attributes allowed for this world */
  maxAttributes: number;
  /** Callback fired when attributes are modified */
  onChange: (attributes: WorldAttribute[]) => void;
}

/**
 * WorldAttributesForm - Component for managing world attributes with CRUD operations
 * 
 * Features:
 * - Add, edit, and delete world attributes
 * - Enforces maxAttributes limit with user feedback
 * - Modal-based attribute editor
 * - Dependency warning for linked skills
 * - Accessible UI with proper ARIA labels
 * 
 * @param props - Component props
 * @returns JSX element representing the attributes management form
 */
const WorldAttributesForm: React.FC<WorldAttributesFormProps> = ({ 
  attributes, 
  skills = [],
  worldId, 
  maxAttributes,
  onChange 
}) => {
  // Component state
  const [editingAttribute, setEditingAttribute] = useState<EntityID | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<WorldAttribute | null>(null);
  
  // Computed values
  const isLimitReached = useMemo(() => 
    attributes.length >= maxAttributes, 
    [attributes.length, maxAttributes]
  );
  
  // Event handlers
  /**
   * Handles creating a new attribute and closing the modal
   */
  const handleCreateAttribute = useCallback((newAttribute: WorldAttribute) => {
    onChange([...attributes, { ...newAttribute, worldId }]);
    setShowCreateModal(false);
  }, [attributes, worldId, onChange]);
  
  /**
   * Handles updating an existing attribute and closing the editor
   */
  const handleSaveAttribute = useCallback((updatedAttribute: WorldAttribute) => {
    const index = attributes.findIndex(attr => attr.id === updatedAttribute.id);
    if (index !== -1) {
      const updatedAttributes = [...attributes];
      updatedAttributes[index] = { ...updatedAttribute, worldId };
      onChange(updatedAttributes);
    }
    setEditingAttribute(null);
  }, [attributes, worldId, onChange]);
  
  /**
   * Handles deleting an attribute by ID
   */
  const handleDeleteAttribute = useCallback((attributeId: EntityID) => {
    const updatedAttributes = attributes.filter(attr => attr.id !== attributeId);
    onChange(updatedAttributes);
    setEditingAttribute(null);
  }, [attributes, onChange]);
  
  /**
   * Initiates delete process by showing confirmation dialog
   */
  const handleDeleteClick = useCallback((attribute: WorldAttribute) => {
    setAttributeToDelete(attribute);
    setShowDeleteDialog(true);
  }, []);
  
  /**
   * Gets skills that are linked to a specific attribute
   */
  const getLinkedSkills = useCallback((attributeId: EntityID): WorldSkill[] => {
    return skills.filter(skill => skill.attributeIds?.includes(attributeId));
  }, [skills]);
  
  /**
   * Confirms deletion and cleans up dialog state
   */
  const handleDeleteConfirm = useCallback(() => {
    if (attributeToDelete) {
      handleDeleteAttribute(attributeToDelete.id);
    }
    setShowDeleteDialog(false);
    setAttributeToDelete(null);
  }, [attributeToDelete, handleDeleteAttribute]);
  
  /**
   * Generates the description text for the delete confirmation dialog
   */
  const deleteDescription = useMemo(() => {
    if (!attributeToDelete) {
      return "确定要删除此属性吗？此操作无法撤销。";
    }
    
    const linkedSkills = getLinkedSkills(attributeToDelete.id);
    if (linkedSkills.length === 0) {
      return "确定要删除此属性吗？此操作无法撤销。";
    }
    
    const skillNames = linkedSkills.map(s => s.name).join(', ');
    const skillText = '';
    return `警告：此属性已关联 ${linkedSkills.length} 个技能${skillText}：${skillNames}。删除此属性将影响这些技能。此操作无法撤销。`;
  }, [attributeToDelete, getLinkedSkills]);
  
  return (
    <section className="component-world-attributes-form">
      <div>
        <h3>属性</h3>
        <div>
          <Button
            onClick={() => setShowCreateModal(true)}
            disabled={isLimitReached}
            variant="secondary"
            size="sm"
            aria-label={
              isLimitReached 
                ? `无法添加更多属性。已达到 ${maxAttributes} 个的上限。`
                : "添加新属性"
            }
          >
            添加属性
          </Button>
          {isLimitReached && (
            <p>
              最多 {maxAttributes} 属性已达上限
            </p>
          )}
        </div>
      </div>
      
      {attributes.length === 0 ? (
        <p>尚未定义任何属性。</p>
      ) : (
        <div>
          {attributes.map((attribute, index) => (
            <div key={`${attribute.id ?? attribute.name ?? index}`} >
              <div>
                <h4>{attribute.name}</h4>
                <div className="action-button-group" data-layout="horizontal" data-gap="sm">
                  <Button
                    onClick={() => setEditingAttribute(attribute.id)}
                    variant="secondary"
                    size="sm"
                  >
                    编辑
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(attribute)}
                    variant="destructive"
                    size="sm"
                  >
                    删除
                  </Button>
                </div>
              </div>
              
              <div>
                <p>{attribute.description}</p>
                <div>
                  <div>
                    <span>范围：</span> {attribute.minValue} - {attribute.maxValue}
                  </div>
                  {attribute.category && (
                    <div>
                      <span>类别：</span> {displayLabel(attribute.category)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Modal */}
      <SimpleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建属性"
      >
        <div>
          为此世界创建一个新的自定义属性。
        </div>
        <AttributeEditor
          worldId={worldId as EntityID}
          mode="create"
          onSave={handleCreateAttribute}
          onCancel={() => setShowCreateModal(false)}
          existingAttributes={attributes}
          existingSkills={skills}
          maxAttributes={maxAttributes}
        />
      </SimpleModal>
      
      {/* Edit Modal */}
      <SimpleModal
        isOpen={!!editingAttribute}
        onClose={() => setEditingAttribute(null)}
        title="编辑属性"
      >
        <div>
          修改此世界属性的详细信息。
        </div>
        {editingAttribute && (
          <AttributeEditor
            worldId={worldId as EntityID}
            mode="edit"
            attributeId={editingAttribute}
            onSave={handleSaveAttribute}
            onDelete={handleDeleteAttribute}
            onCancel={() => setEditingAttribute(null)}
            existingAttributes={attributes}
            existingSkills={skills}
          />
        )}
      </SimpleModal>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setAttributeToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="删除属性"
        description={deleteDescription}
        itemName={attributeToDelete?.name || "此属性"}
        confirmButtonText="删除属性"
        cancelButtonText="取消"
      />
    </section>
  );
};

// Set display name for debugging
WorldAttributesForm.displayName = 'WorldAttributesForm';

export default WorldAttributesForm;
