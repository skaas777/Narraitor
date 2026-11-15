import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToneSettingsForm } from '../ToneSettingsForm';
import { DEFAULT_TONE_SETTINGS, ToneSettings } from '@/types/tone-settings.types';
import { titleCase } from '@/lib/utils';

// Mock the validation utility
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  validateToneSettings: jest.fn(() => ({ valid: true, errors: [] })),
  descriptionsToSelectOptions: jest.fn((descriptions) => 
    Object.entries(descriptions).map(([value, description]) => ({
      value,
      label: titleCase(value.replace(/-/g, ' ')),
      description
    }))
  ),
  createFormUpdater: jest.fn((state: Record<string, unknown>, onChange: (updated: Record<string, unknown>) => void) => ({
    updateField: (field: string, value: unknown) => onChange({ ...state, [field]: value }),
  })),
}));

const mockOnToneSettingsChange = jest.fn();

describe('ToneSettingsForm', () => {
  beforeEach(() => {
    mockOnToneSettingsChange.mockClear();
  });

  test('renders with default tone settings', () => {
    render(
      <ToneSettingsForm
        toneSettings={DEFAULT_TONE_SETTINGS}
        onToneSettingsChange={mockOnToneSettingsChange}
      />
    );

    expect(screen.getByText("叙事风格设置")).toBeInTheDocument();
    expect(screen.getByLabelText("内容分级")).toBeInTheDocument();
    expect(screen.getByLabelText("叙事风格")).toBeInTheDocument();
    expect(screen.getByLabelText("语言复杂度")).toBeInTheDocument();
    expect(screen.getByLabelText("自定义指令（可选）")).toBeInTheDocument();
  });

  test('calls onToneSettingsChange when content rating changes', async () => {
    const user = userEvent.setup();
    
    render(
      <ToneSettingsForm
        toneSettings={DEFAULT_TONE_SETTINGS}
        onToneSettingsChange={mockOnToneSettingsChange}
      />
    );

    const contentRatingSelect = screen.getByRole('combobox', { name: /内容分级/i });
    await user.selectOptions(contentRatingSelect, 'PG-13');

    expect(mockOnToneSettingsChange).toHaveBeenCalledWith({
      ...DEFAULT_TONE_SETTINGS,
      contentRating: 'PG-13'
    });
  });

  test('calls onToneSettingsChange when narrative style changes', async () => {
    const user = userEvent.setup();
    
    render(
      <ToneSettingsForm
        toneSettings={DEFAULT_TONE_SETTINGS}
        onToneSettingsChange={mockOnToneSettingsChange}
      />
    );

    const narrativeStyleSelect = screen.getByRole('combobox', { name: /叙事风格/i });
    await user.selectOptions(narrativeStyleSelect, 'dramatic');

    expect(mockOnToneSettingsChange).toHaveBeenCalledWith({
      ...DEFAULT_TONE_SETTINGS,
      narrativeStyle: 'dramatic'
    });
  });

  test('calls onToneSettingsChange when language complexity changes', async () => {
    const user = userEvent.setup();
    
    render(
      <ToneSettingsForm
        toneSettings={DEFAULT_TONE_SETTINGS}
        onToneSettingsChange={mockOnToneSettingsChange}
      />
    );

    const languageComplexitySelect = screen.getByRole('combobox', { name: /语言复杂度/i });
    await user.selectOptions(languageComplexitySelect, 'advanced');

    expect(mockOnToneSettingsChange).toHaveBeenCalledWith({
      ...DEFAULT_TONE_SETTINGS,
      languageComplexity: 'advanced'
    });
  });

  test('calls onToneSettingsChange when custom instructions change', async () => {
    const user = userEvent.setup();
    
    render(
      <ToneSettingsForm
        toneSettings={DEFAULT_TONE_SETTINGS}
        onToneSettingsChange={mockOnToneSettingsChange}
      />
    );

    const customInstructionsTextarea = screen.getByLabelText("自定义指令（可选）");
    await user.type(customInstructionsTextarea, 'X');

    // Verify that onToneSettingsChange was called with updated customInstructions
    expect(mockOnToneSettingsChange).toHaveBeenLastCalledWith({
      ...DEFAULT_TONE_SETTINGS,
      customInstructions: 'X'
    });
  });


  test('displays current tone settings values', () => {
    const customToneSettings: ToneSettings = {
      contentRating: 'R',
      narrativeStyle: 'dramatic',
      languageComplexity: 'literary',
      customInstructions: 'Include complex themes'
    };

    render(
      <ToneSettingsForm
        toneSettings={customToneSettings}
        onToneSettingsChange={mockOnToneSettingsChange}
      />
    );

    const customInstructionsTextarea = screen.getByLabelText("自定义指令（可选）");
    expect(customInstructionsTextarea).toHaveValue('Include complex themes');
  });


  test('displays validation errors when form is invalid', async () => {
    const { validateToneSettings } = await import('@/lib/utils');
    (validateToneSettings as jest.Mock).mockReturnValue({
      valid: false,
      errors: ['Content Rating is required', 'Narrative Style must be valid']
    });

    render(
      <ToneSettingsForm
        toneSettings={DEFAULT_TONE_SETTINGS}
        onToneSettingsChange={mockOnToneSettingsChange}
      />
    );

    expect(screen.getByText("内容分级为必填项")).toBeInTheDocument();
    expect(screen.getByText("叙事风格必须有效")).toBeInTheDocument();
  });
});
