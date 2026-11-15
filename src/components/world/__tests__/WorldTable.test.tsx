/**
 * Unit tests for WorldTable component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorldTable } from '@/components/world/WorldTable';
import { useCharacterStore } from '@/state/characterStore';
import type { World } from '@/types/world.types';
import type { EntityID } from '@/types/common.types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock character store
jest.mock('@/state/characterStore', () => ({
  useCharacterStore: jest.fn(),
}));

const mockWorlds: World[] = [
  {
    id: 'world-1' as EntityID,
    name: 'Fantasy Realm',
    description: 'A magical world',
    genre: 'fantasy',
    attributes: [{
      id: 'attr-1' as EntityID,
      name: 'Strength',
      worldId: 'world-1' as EntityID,
      description: 'Physical strength',
      baseValue: 10,
      minValue: 1,
      maxValue: 20,
    }],
    skills: [{
      id: 'skill-1' as EntityID,
      name: 'Combat',
      worldId: 'world-1' as EntityID,
      description: 'Fighting ability',
      difficulty: 'medium',
      baseValue: 5,
      minValue: 0,
      maxValue: 10,
    }],
    settings: {
      maxAttributes: 10,
      maxSkills: 20,
      attributePointPool: 50,
      skillPointPool: 30,
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'world-2' as EntityID,
    name: 'Sci-Fi Universe',
    description: 'A futuristic world',
    genre: 'sci-fi',
    attributes: [{
      id: 'attr-2' as EntityID,
      name: 'Intelligence',
      worldId: 'world-2' as EntityID,
      description: 'Mental acuity',
      baseValue: 12,
      minValue: 1,
      maxValue: 20,
    }],
    skills: [],
    settings: {
      maxAttributes: 8,
      maxSkills: 15,
      attributePointPool: 40,
      skillPointPool: 25,
    },
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('WorldTable', () => {
  const mockOnDeleteWorld = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCharacterStore as unknown as jest.Mock).mockReturnValue({
      'world-1': ['char-1', 'char-2'],
      'world-2': [],
    });
  });

  it('renders table with all columns', () => {
    render(<WorldTable worlds={mockWorlds} onDeleteWorld={mockOnDeleteWorld} />);

    expect(screen.getByText("名称")).toBeInTheDocument();
    expect(screen.getByText("类型")).toBeInTheDocument();
    expect(screen.getByText("属性")).toBeInTheDocument();
    expect(screen.getByText("技能")).toBeInTheDocument();
    expect(screen.getByText("角色")).toBeInTheDocument();
    expect(screen.getByText("创建时间")).toBeInTheDocument();
    expect(screen.getByText("操作")).toBeInTheDocument();
  });

  it('renders world data correctly', () => {
    render(<WorldTable worlds={mockWorlds} onDeleteWorld={mockOnDeleteWorld} />);

    expect(screen.getByText('Fantasy Realm')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi Universe')).toBeInTheDocument();

    // Check attribute and skill counts exist (multiple "1"s and "0"s in the table)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Attribute counts
    expect(screen.getAllByText('0').length).toBeGreaterThan(0); // Skill counts
  });

  it('displays character counts from store', () => {
    render(<WorldTable worlds={mockWorlds} onDeleteWorld={mockOnDeleteWorld} />);

    const characterCells = screen.getAllByText('2');
    expect(characterCells.length).toBeGreaterThan(0); // world-1 has 2 characters
  });

  it('renders action buttons for each world', () => {
    render(<WorldTable worlds={mockWorlds} onDeleteWorld={mockOnDeleteWorld} />);

    expect(screen.getByLabelText("查看 Fantasy Realm")).toBeInTheDocument();
    expect(screen.getByLabelText("编辑 Fantasy Realm")).toBeInTheDocument();
    expect(screen.getByLabelText("删除 Fantasy Realm")).toBeInTheDocument();
  });

  it('calls onDeleteWorld when delete button clicked', () => {
    render(<WorldTable worlds={mockWorlds} onDeleteWorld={mockOnDeleteWorld} />);

    const deleteBtn = screen.getByLabelText("删除 Fantasy Realm");
    fireEvent.click(deleteBtn);

    expect(mockOnDeleteWorld).toHaveBeenCalledWith('world-1', expect.any(Object));
  });

  it('shows empty state when no worlds', () => {
    render(<WorldTable worlds={[]} onDeleteWorld={mockOnDeleteWorld} />);

    expect(screen.getByText("还没有世界。创建一个开始吧。")).toBeInTheDocument();
  });

  it('includes search functionality', () => {
    render(<WorldTable worlds={mockWorlds} onDeleteWorld={mockOnDeleteWorld} />);

    const searchInput = screen.getByPlaceholderText("搜索世界……");
    expect(searchInput).toBeInTheDocument();

    // Type in search
    fireEvent.change(searchInput, { target: { value: 'Fantasy' } });

    // Fantasy Realm should still be visible
    expect(screen.getByText('Fantasy Realm')).toBeInTheDocument();
  });

  it('includes pagination controls', () => {
    // Create more than 10 worlds to trigger pagination
    const manyWorlds = Array.from({ length: 15 }, (_, i) => ({
      ...mockWorlds[0],
      id: `world-${i}` as EntityID,
      name: `World ${i}`,
    }));

    render(<WorldTable worlds={manyWorlds} onDeleteWorld={mockOnDeleteWorld} />);

    // Pagination should show page info
    expect(screen.getByText(/第 \d+ \/ \d+/)).toBeInTheDocument();
  });
});
