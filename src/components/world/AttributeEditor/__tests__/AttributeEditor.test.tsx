import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AttributeEditor } from '../AttributeEditor';
import { WorldAttribute, WorldSkill } from '@/types/world.types';
import { EntityID } from '@/types/common.types';

describe('AttributeEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnCancel = jest.fn();

  const mockWorldId = 'world-123' as EntityID;
  const mockAttributeId = 'attr-123' as EntityID;

  const mockAttribute: WorldAttribute = {
    id: mockAttributeId,
    worldId: mockWorldId,
    name: 'Strength',
    description: 'Physical power and endurance',
    minValue: 1,
    maxValue: 10,
    baseValue: 5,
  };

  const mockSkill: WorldSkill = {
    id: 'skill-123' as EntityID,
    worldId: mockWorldId,
    name: 'Athletics',
    description: 'Physical activities',
    attributeIds: [mockAttributeId],
    difficulty: 'medium',
    minValue: 1,
    maxValue: 10,
    baseValue: 5,
  };

  const mockAttributes: WorldAttribute[] = [mockAttribute];
  const mockSkills: WorldSkill[] = [mockSkill];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders create form with empty fields', () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="create"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          existingAttributes={[]}
          existingSkills={[]}
        />
      );

      expect(screen.getByLabelText(/属性名称/i)).toHaveValue('');
      expect(screen.getByLabelText(/描述/i)).toHaveValue('');
      expect(screen.getByLabelText(/最小值/i)).toHaveValue(1);
      expect(screen.getByLabelText(/最大值/i)).toHaveValue(10);
      expect(screen.getByText(/创建属性/i)).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="create"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          existingAttributes={[]}
          existingSkills={[]}
        />
      );

      const saveButton = screen.getByText(/创建属性/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/属性名称为必填项/i)).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('creates new attribute with valid data', async () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="create"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          existingAttributes={[]}
          existingSkills={[]}
        />
      );

      fireEvent.change(screen.getByLabelText(/属性名称/i), {
        target: { value: 'Intelligence' },
      });
      fireEvent.change(screen.getByLabelText(/描述/i), {
        target: { value: 'Mental acuity and reasoning' },
      });
      fireEvent.change(screen.getByLabelText(/最小值/i), {
        target: { value: '0' },
      });
      fireEvent.change(screen.getByLabelText(/最大值/i), {
        target: { value: '20' },
      });

      fireEvent.click(screen.getByText(/创建属性/i));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Intelligence',
            description: 'Mental acuity and reasoning',
            minValue: 0,
            maxValue: 20,
            worldId: mockWorldId,
          })
        );
      });
    });
  });

  describe('Edit Mode', () => {
    it('renders edit form with existing attribute data', () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="edit"
          attributeId={mockAttributeId}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onCancel={mockOnCancel}
          existingAttributes={mockAttributes}
          existingSkills={mockSkills}
        />
      );

      expect(screen.getByLabelText(/属性名称/i)).toHaveValue('Strength');
      expect(screen.getByLabelText(/描述/i)).toHaveValue('Physical power and endurance');
      expect(screen.getByLabelText(/最小值/i)).toHaveValue(1);
      expect(screen.getByLabelText(/最大值/i)).toHaveValue(10);
      expect(screen.getByText(/保存更改/i)).toBeInTheDocument();
      expect(screen.getByText(/删除属性/i)).toBeInTheDocument();
    });

    it('updates existing attribute', async () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="edit"
          attributeId={mockAttributeId}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onCancel={mockOnCancel}
          existingAttributes={mockAttributes}
          existingSkills={mockSkills}
        />
      );

      fireEvent.change(screen.getByLabelText(/属性名称/i), {
        target: { value: 'Power' },
      });

      fireEvent.click(screen.getByText(/保存更改/i));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockAttributeId,
            name: 'Power',
            description: 'Physical power and endurance',
            minValue: 1,
            maxValue: 10,
          })
        );
      });
    });

    it('prevents duplicate attribute names', async () => {
      const multipleAttributes = [
        mockAttribute,
        {
          id: 'attr-456' as EntityID,
          worldId: mockWorldId,
          name: 'Dexterity',
          description: 'Agility and reflexes',
          minValue: 1,
          maxValue: 10,
          baseValue: 5,
        },
      ];

      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="edit"
          attributeId={mockAttributeId}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onCancel={mockOnCancel}
          existingAttributes={multipleAttributes}
          existingSkills={mockSkills}
        />
      );

      fireEvent.change(screen.getByLabelText(/属性名称/i), {
        target: { value: 'Dexterity' },
      });

      fireEvent.click(screen.getByText(/保存更改/i));

      await waitFor(() => {
        expect(screen.getByText(/已存在同名属性/i)).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('shows delete confirmation dialog', async () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="edit"
          attributeId={mockAttributeId}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onCancel={mockOnCancel}
          existingAttributes={mockAttributes}
          existingSkills={mockSkills}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /删除属性/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/此操作无法撤销/i)).toBeInTheDocument();
      });
    });

    it('warns when deleting attribute linked to skills', async () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="edit"
          attributeId={mockAttributeId}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onCancel={mockOnCancel}
          existingAttributes={mockAttributes}
          existingSkills={mockSkills}
        />
      );

      fireEvent.click(screen.getByText(/删除属性/i));

      await waitFor(() => {
        expect(screen.getByText(/此属性已关联 1 个技能/i)).toBeInTheDocument();
      });
    });

    it('deletes attribute after confirmation', async () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="edit"
          attributeId={mockAttributeId}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onCancel={mockOnCancel}
          existingAttributes={mockAttributes}
          existingSkills={[]} // No linked skills to avoid warning
        />
      );

      // Click the delete button in the form
      const deleteButton = screen.getByLabelText(/删除属性/i);
      fireEvent.click(deleteButton);
      
      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Find the confirm button in the dialog and click it (use more specific label)
      const dialogDeleteButton = screen.getByRole('button', { name: /删除属性Strength/i });
      fireEvent.click(dialogDeleteButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(mockAttributeId);
      });
    });
  });

  describe('Common Functionality', () => {
    it('calls onCancel when cancel button is clicked', () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="create"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          existingAttributes={[]}
          existingSkills={[]}
        />
      );

      fireEvent.click(screen.getByText(/取消/i));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('validates min/max value ranges', async () => {
      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="create"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          existingAttributes={[]}
          existingSkills={[]}
        />
      );

      fireEvent.change(screen.getByLabelText(/属性名称/i), {
        target: { value: 'Test Attribute' },
      });
      fireEvent.change(screen.getByLabelText(/最小值/i), {
        target: { value: '10' },
      });
      fireEvent.change(screen.getByLabelText(/最大值/i), {
        target: { value: '5' },
      });

      fireEvent.click(screen.getByText(/创建属性/i));

      await waitFor(() => {
        expect(screen.getByText(/最大值必须大于最小值/i)).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('prevents creation when maxAttributes limit is reached', async () => {
      const twoAttributes: WorldAttribute[] = [
        mockAttribute,
        { ...mockAttribute, id: 'attr-2' as EntityID, name: 'Intelligence' }
      ];

      render(
        <AttributeEditor
          worldId={mockWorldId}
          mode="create"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          existingAttributes={twoAttributes}
          existingSkills={[]}
          maxAttributes={2}
        />
      );

      fireEvent.change(screen.getByLabelText(/属性名称/i), {
        target: { value: 'New Attribute' },
      });

      fireEvent.click(screen.getByText(/创建属性/i));

      await waitFor(() => {
        expect(screen.getByText(/无法创建更多属性.*最多.*2/i)).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
