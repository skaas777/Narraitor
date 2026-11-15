import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillEditor } from '../SkillEditor';
import { WorldSkill, WorldAttribute } from '@/types/world.types';
// Note: SkillDifficulty type is used implicitly in WorldSkill interface

// Mock components
jest.mock('@/components/DeleteConfirmationDialog', () => {
  return function MockDeleteConfirmationDialog({ 
    isOpen, 
    onConfirm, 
    onClose
  }: {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-dialog">
        <p>Delete confirmation</p>
        <button onClick={onConfirm} data-testid="confirm-delete">Confirm</button>
        <button onClick={onClose} data-testid="cancel-delete">Cancel</button>
      </div>
    );
  };
});

// Test data
const mockWorldId = 'world-1';
const createMockAttribute = (id: string, name: string, description: string, baseValue: number): WorldAttribute => ({
  id, name, description, worldId: mockWorldId, baseValue, minValue: 1, maxValue: 10
});

const mockAttributes: WorldAttribute[] = [
  createMockAttribute('attr-1', 'Strength', 'Physical power', 8),
  createMockAttribute('attr-2', 'Intelligence', 'Mental ability', 7),
  createMockAttribute('attr-3', 'Dexterity', 'Agility and precision', 6)
];

const mockSkills: WorldSkill[] = [
  {
    id: 'skill-1',
    name: 'Swordsmanship',
    description: 'Combat with bladed weapons',
    worldId: mockWorldId,
    attributeIds: ['attr-1', 'attr-3'],
    difficulty: 'medium',
    baseValue: 5,
    minValue: 1,
    maxValue: 10,
  },
];

const mockProps = {
  worldId: mockWorldId,
  mode: 'create' as const,
  onSave: jest.fn(),
  onCancel: jest.fn(),
  existingAttributes: mockAttributes,
  existingSkills: mockSkills,
};

// Test helpers
const renderAndSetup = (props: React.ComponentProps<typeof SkillEditor> = mockProps) => {
  const user = userEvent.setup();
  render(<SkillEditor {...props} />);
  return user;
};

const fillSkillForm = async (user: ReturnType<typeof userEvent.setup>, name: string, description: string, attributeNames: string[] = []) => {
  await user.type(screen.getByLabelText(/技能名称/i), name);
  await user.type(screen.getByLabelText(/描述/i), description);
  for (const attrName of attributeNames) {
    await user.click(screen.getByLabelText(attrName));
  }
};

const createMockSkills = (count: number) => Array.from({ length: count }, (_, i) => ({
  id: `skill-${i}`, name: `Skill${i}`, description: `Description${i}`, worldId: mockWorldId,
  attributeIds: ['attr-1'], difficulty: 'easy' as const, baseValue: 5, minValue: 1, maxValue: 10,
}));

describe('SkillEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders create mode interface correctly', () => {
      render(<SkillEditor {...mockProps} />);
      
      expect(screen.getByText("创建新技能")).toBeInTheDocument();
      expect(screen.getByLabelText(/技能名称/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/描述/i)).toBeInTheDocument();
      expect(screen.getByText("关联属性")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /创建技能/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument();
    });

    it('displays all available attributes as checkboxes', () => {
      render(<SkillEditor {...mockProps} />);
      
      mockAttributes.forEach(attr => {
        expect(screen.getByLabelText(attr.name)).toBeInTheDocument();
      });
    });

    it('allows creating a skill with multiple attribute links', async () => {
      const user = renderAndSetup();
      await fillSkillForm(user, 'Acrobatics', 'Tumbling and gymnastics', ['Strength', 'Dexterity']);
      await user.click(screen.getByRole('button', { name: /创建技能/i }));
      
      expect(mockProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Acrobatics',
          description: 'Tumbling and gymnastics',
          attributeIds: ['attr-1', 'attr-3'],
          worldId: mockWorldId,
        })
      );
    });

    it('prevents creating skills with duplicate names', async () => {
      const user = renderAndSetup();
      
      await user.type(screen.getByLabelText(/技能名称/i), 'Swordsmanship'); // Duplicate name
      await user.type(screen.getByLabelText(/描述/i), 'Test description');
      await user.click(screen.getByLabelText('Strength'));
      
      await user.click(screen.getByRole('button', { name: /创建技能/i }));
      
      expect(screen.getByText(/技能名称“Swordsmanship”已存在/i)).toBeInTheDocument();
      expect(mockProps.onSave).not.toHaveBeenCalled();
    });

    it('requires at least one attribute to be selected', async () => {
      const user = renderAndSetup();
      
      await fillSkillForm(user, 'New Skill', 'Test description');
      // Don't select any attributes
      
      await user.click(screen.getByRole('button', { name: /创建技能/i }));
      
      expect(screen.getByText(/至少需要选择一个属性/i)).toBeInTheDocument();
      expect(mockProps.onSave).not.toHaveBeenCalled();
    });

    it('validates required fields', async () => {
      const user = renderAndSetup();
      
      await user.click(screen.getByRole('button', { name: /创建技能/i }));
      
      expect(screen.getByText(/技能名称不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/描述不能为空/i)).toBeInTheDocument();
      expect(mockProps.onSave).not.toHaveBeenCalled();
    });

    it('enforces maximum skills limit when provided', () => {
      render(<SkillEditor {...mockProps} existingSkills={createMockSkills(12)} maxSkills={12} />);
      expect(screen.getByText(/技能数量已达上限（12）/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /创建技能/i })).toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    const editProps = {
      ...mockProps,
      mode: 'edit' as const,
      skillId: 'skill-1',
      onDelete: jest.fn(),
    };

    it('renders edit mode interface correctly', () => {
      render(<SkillEditor {...editProps} />);
      
      expect(screen.getByText("编辑技能")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /保存更改/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /删除技能/i })).toBeInTheDocument();
    });

    it('loads existing skill data for editing', () => {
      render(<SkillEditor {...editProps} />);
      
      expect(screen.getByDisplayValue('Swordsmanship')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Combat with bladed weapons')).toBeInTheDocument();
      
      expect(screen.getByLabelText('Strength')).toBeChecked();
      expect(screen.getByLabelText('Dexterity')).toBeChecked();
      expect(screen.getByLabelText('Intelligence')).not.toBeChecked();
    });

    it('allows updating skill with new attribute links', async () => {
      const user = renderAndSetup(editProps);
      
      await user.clear(screen.getByDisplayValue('Swordsmanship'));
      await user.type(screen.getByLabelText(/技能名称/i), 'Advanced Swordsmanship');
      
      await user.click(screen.getByLabelText('Intelligence')); // Add Intelligence
      await user.click(screen.getByLabelText('Dexterity')); // Remove Dexterity
      
      await user.click(screen.getByRole('button', { name: /保存更改/i }));
      
      expect(mockProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'skill-1',
          name: 'Advanced Swordsmanship',
          attributeIds: ['attr-1', 'attr-2'], // Strength + Intelligence
        })
      );
    });

    it('handles delete confirmation dialog flow', async () => {
      const user = renderAndSetup(editProps);
      await user.click(screen.getByRole('button', { name: /删除技能/i }));
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();

      await user.click(screen.getByTestId('cancel-delete'));
      expect(editProps.onDelete).not.toHaveBeenCalled();
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /删除技能/i }));
      await user.click(screen.getByTestId('confirm-delete'));
      expect(editProps.onDelete).toHaveBeenCalledWith('skill-1');
    });
  });

  describe('Validation', () => {
    it.each([
      {
        name: 'skill name length',
        input: { name: 'a'.repeat(101), description: 'Valid' },
        errorMatch: /技能名称不能超过 100 个字符/i
      },
      {
        name: 'description length',
        input: { name: 'Valid Name', description: 'a'.repeat(501) },
        errorMatch: /描述不能超过 500 个字符/i
      },
    ])('validates $name limits', async ({ input, errorMatch }) => {
      const user = renderAndSetup();
      // Paste instead of type. These inputs run to hundreds of characters, and a
      // keystroke-by-keystroke loop that long can outrun the test timeout. Jest then
      // abandons the test while the typing keeps going, and the stray keystrokes land
      // on whatever input the next test has focused.
      await user.click(screen.getByLabelText(/技能名称/i));
      await user.paste(input.name);
      await user.click(screen.getByLabelText(/描述/i));
      await user.paste(input.description);
      await user.click(screen.getByRole('button', { name: /创建技能/i }));
      expect(screen.getByText(errorMatch)).toBeInTheDocument();
    });

    it('trims whitespace from inputs', async () => {
      const user = renderAndSetup();
      await fillSkillForm(user, 'Swimming', 'Water-based movement', ['Strength']);
      await user.click(screen.getByRole('button', { name: /创建技能/i }));
      expect(mockProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Swimming', description: 'Water-based movement' })
      );
    });
  });

  describe('Error Handling', () => {
    it('displays multiple validation errors and clears them when', async () => {
      const user = renderAndSetup();
      await user.click(screen.getByRole('button', { name: /创建技能/i }));
      expect(screen.getByText(/技能名称不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/描述不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/至少需要选择一个属性/i)).toBeInTheDocument();

      await user.type(screen.getByLabelText(/技能名称/i), 'Valid Name');
      await waitFor(() => expect(screen.queryByText(/技能名称不能为空/i)).not.toBeInTheDocument());
    });
  });

  describe('Attribute Prerequisites (Issue #392)', () => {
    it('saves attribute prerequisites set by the world creator', async () => {
      const user = renderAndSetup();
      await fillSkillForm(user, 'Climbing', 'Scale sheer walls', ['Strength']);

      await user.type(screen.getByLabelText("最低 Strength"), '4');
      await user.click(screen.getByRole('button', { name: /创建技能/i }));

      expect(mockProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Climbing',
          attributePrerequisites: [{ attributeId: 'attr-1', minValue: 4 }],
        })
      );
    });

    it('loads existing attribute prerequisites in edit mode', () => {
      const skillWithPrereq: WorldSkill = {
        ...mockSkills[0],
        attributePrerequisites: [{ attributeId: 'attr-1', minValue: 6 }],
      };

      render(
        <SkillEditor
          {...mockProps}
          mode="edit"
          skillId="skill-1"
          existingSkills={[skillWithPrereq]}
          onDelete={jest.fn()}
        />
      );

      expect(screen.getByLabelText("最低 Strength")).toHaveValue(6);
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel and does not save when cancel is clicked', async () => {
      const user = renderAndSetup();
      await user.type(screen.getByLabelText(/技能名称/i), 'Test Skill');
      await user.click(screen.getByRole('button', { name: /取消/i }));
      expect(mockProps.onSave).not.toHaveBeenCalled();
      expect(mockProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels, structure, and error messages', async () => {
      const user = renderAndSetup();
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByLabelText(/技能名称/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/描述/i)).toBeInTheDocument();
      mockAttributes.forEach(attr => expect(screen.getByLabelText(attr.name)).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: /创建技能/i }));
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });
});