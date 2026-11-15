/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptDebugSection } from '../PromptDebugSection';
import { PromptDebugInfo } from '@/types/narrative.types';

const mockDebugInfo: PromptDebugInfo = {
  fullPrompt: 'Test prompt text that was sent to the AI',
  templateName: 'Scene Template',
  modelUsed: 'gemini-2.0-flash',
  generatedAt: new Date('2024-01-01T12:00:00Z'),
  tokenUsage: {
    promptTokens: 100,
    completionTokens: 50,
    totalTokens: 150,
  },
};

describe('PromptDebugSection', () => {
  it('should display AI model', () => {
    render(<PromptDebugSection debugInfo={mockDebugInfo} />);
    expect(screen.getByText('gemini-2.0-flash')).toBeInTheDocument();
  });

  it('should display token usage statistics', () => {
    render(<PromptDebugSection debugInfo={mockDebugInfo} />);

    expect(screen.getByText(/令牌用量/i)).toBeInTheDocument();
    expect(screen.getByText(/提示词： 100/i)).toBeInTheDocument();
    expect(screen.getByText(/补全： 50/i)).toBeInTheDocument();
    expect(screen.getByText(/总计： 150/i)).toBeInTheDocument();
  });

  it('should display tone settings when provided', () => {
    const debugInfoWithTone: PromptDebugInfo = {
      ...mockDebugInfo,
      toneSettings: {
        mood: 'mysterious',
        complexity: 'moderate',
        customTone: 'Keep it suspenseful',
      },
    };

    render(<PromptDebugSection debugInfo={debugInfoWithTone} />);

    expect(screen.getByText(/叙事风格设置/i)).toBeInTheDocument();
    expect(screen.getByText(/mysterious/i)).toBeInTheDocument();
    expect(screen.getByText(/moderate/i)).toBeInTheDocument();
    expect(screen.getByText(/Keep it suspenseful/i)).toBeInTheDocument();
  });

  it('should display character context when provided', () => {
    const debugInfoWithCharacters: PromptDebugInfo = {
      ...mockDebugInfo,
      characterContext: [
        { characterId: 'char-1', name: 'Aragorn', relevantTraits: ['brave', 'leader'] },
        { characterId: 'char-2', name: 'Gandalf', relevantTraits: ['wise', 'powerful'] },
      ],
    };

    render(<PromptDebugSection debugInfo={debugInfoWithCharacters} />);

    expect(screen.getByText(/角色上下文/i)).toBeInTheDocument();
    expect(screen.getByText('Aragorn')).toBeInTheDocument();
    expect(screen.getByText('Gandalf')).toBeInTheDocument();
  });

  it('should display active goals when provided', () => {
    const debugInfoWithGoals: PromptDebugInfo = {
      ...mockDebugInfo,
      activeGoals: ['Find the ancient artifact', 'Rescue the princess'],
    };

    render(<PromptDebugSection debugInfo={debugInfoWithGoals} />);

    expect(screen.getByText(/当前目标/i)).toBeInTheDocument();
    expect(screen.getByText('Find the ancient artifact')).toBeInTheDocument();
    expect(screen.getByText('Rescue the princess')).toBeInTheDocument();
  });

  it('should display lore context when provided', () => {
    const debugInfoWithLore: PromptDebugInfo = {
      ...mockDebugInfo,
      loreContext: [
        {
          loreId: 'lore-1',
          title: 'Ancient Magic',
          excerpt: 'Magic is rare and dangerous...',
        },
      ],
    };

    render(<PromptDebugSection debugInfo={debugInfoWithLore} />);

    expect(screen.getByText(/设定上下文/i)).toBeInTheDocument();
    expect(screen.getByText('Ancient Magic')).toBeInTheDocument();
    expect(screen.getByText(/Magic is rare and dangerous/i)).toBeInTheDocument();
  });

  it('should display inventory context when provided', () => {
    const debugInfoWithInventory: PromptDebugInfo = {
      ...mockDebugInfo,
      inventoryContext: [
        { itemName: 'Magic Sword', isEquipped: true },
        { itemName: 'Health Potion', isEquipped: false },
      ],
    };

    render(<PromptDebugSection debugInfo={debugInfoWithInventory} />);

    expect(screen.getByText(/背包上下文/i)).toBeInTheDocument();
    expect(screen.getByText('Magic Sword')).toBeInTheDocument();
    expect(screen.getByText('Health Potion')).toBeInTheDocument();
    expect(screen.getByText("已装备")).toBeInTheDocument();
  });

  it('should display recent decisions when provided', () => {
    const debugInfoWithDecisions: PromptDebugInfo = {
      ...mockDebugInfo,
      recentDecisions: [
        {
          decisionText: 'What do you do?',
          selectedOption: 'Enter the cave',
          timestamp: new Date('2024-01-01'),
        },
      ],
    };

    render(<PromptDebugSection debugInfo={debugInfoWithDecisions} />);

    expect(screen.getByText(/最近的决定/i)).toBeInTheDocument();
    expect(screen.getByText('What do you do?')).toBeInTheDocument();
    expect(screen.getByText(/Enter the cave/i)).toBeInTheDocument();
  });

  it('should display previous segment context when provided', () => {
    const debugInfoWithPrevious: PromptDebugInfo = {
      ...mockDebugInfo,
      previousSegmentContext: {
        type: 'scene',
        excerpt: 'You enter the dark cave...',
      },
    };

    render(<PromptDebugSection debugInfo={debugInfoWithPrevious} />);

    expect(screen.getByText(/上一段落/i)).toBeInTheDocument();
    expect(screen.getByText(/类型： 场景/i)).toBeInTheDocument();
    expect(screen.getByText(/You enter the dark cave/i)).toBeInTheDocument();
  });

  it('should display generation timestamp', () => {
    render(<PromptDebugSection debugInfo={mockDebugInfo} />);
    expect(screen.getByText(/生成时间：/i)).toBeInTheDocument();
  });

  it('should be collapsible', async () => {
    const user = userEvent.setup();
    render(<PromptDebugSection debugInfo={mockDebugInfo} />);

    // Click to expand using the toggle button
    const toggleButton = screen.getByRole('button', { name: /展开.*提示词调试信息/i });
    await user.click(toggleButton);

    // Now the content should be visible
    expect(screen.getByText('Scene Template')).toBeVisible();
  });

  it('should have nested collapsible for full prompt', async () => {
    const user = userEvent.setup();
    render(<PromptDebugSection debugInfo={mockDebugInfo} />);

    // Expand main section
    const mainToggle = screen.getByRole('button', { name: /展开.*提示词调试信息/i });
    await user.click(mainToggle);

    // Full prompt section should now be visible but still collapsed
    const nestedToggle = screen.getByRole('button', { name: /展开 完整提示词文本/i });
    expect(nestedToggle).toBeInTheDocument();

    // Click the nested toggle to expand
    await user.click(nestedToggle);

    // Now full prompt should be visible
    expect(screen.getByText('Test prompt text that was sent to the AI')).toBeVisible();
  });

  it('should not display optional sections when data is missing', () => {
    const minimalDebugInfo: PromptDebugInfo = {
      fullPrompt: 'Test prompt',
      templateName: 'Scene Template',
      modelUsed: 'gemini-2.0-flash',
      generatedAt: new Date(),
    };

    render(<PromptDebugSection debugInfo={minimalDebugInfo} />);

    expect(screen.queryByText(/令牌用量/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/叙事风格设置/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/角色上下文/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/当前目标/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/设定上下文/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/背包上下文/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/最近的决定/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/上一段落/i)).not.toBeInTheDocument();
  });
});
