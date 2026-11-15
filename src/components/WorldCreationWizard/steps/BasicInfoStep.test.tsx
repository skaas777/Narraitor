import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BasicInfoStep from './BasicInfoStep';
import { World } from '@/types/world.types';
import { useProviderStore } from '@/state/providerStore';

describe('BasicInfoStep', () => {
  const mockWorldData: Partial<World> = {
    name: '',
    description: '',
    genre: 'fantasy',
  };

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useProviderStore.setState({ providers: {} });
  });

  test('renders all required form fields', () => {
    render(
      <BasicInfoStep
        worldData={mockWorldData}
        errors={{}}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByPlaceholderText(/输入你的世界名称/i)).toBeInTheDocument();
    expect(screen.getByTestId('world-genre-select')).toBeInTheDocument();
  });

  // #1529: the visible WizardFormGroup labels must be programmatically wired
  // to the controls they describe, or screen readers announce them unlabeled.
  test('associates visible labels with their form controls', () => {
    render(
      <BasicInfoStep
        worldData={mockWorldData}
        errors={{}}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByLabelText("世界名称（可选）")).toBe(
      screen.getByTestId('world-name-input')
    );
    // The Genre label renders a trailing required marker, so match by prefix
    expect(screen.getByLabelText(/^题材/i)).toBe(
      screen.getByTestId('world-genre-select')
    );
  });

  test('displays error for world name when provided', () => {
    // Since BasicInfoStep no longer handles validation directly,
    // we test that errors passed in are displayed correctly
    const errors = { name: 'World name must be at least 3 characters' };
    
    render(
      <BasicInfoStep
        worldData={{ ...mockWorldData, name: 'ab' }}
        errors={errors}
        onUpdate={mockOnUpdate}
      />
    );

    // Should display the error
    expect(screen.getByText("世界名称至少需要 3 个字符")).toBeInTheDocument();
  });


  test('updates world data through form interactions', () => {
    const TestWrapper = () => {
      const [worldData, setWorldData] = React.useState(mockWorldData);
      
      return (
        <div>
          <BasicInfoStep
            worldData={worldData}
            errors={{}}
            onUpdate={setWorldData}
          />
          <div aria-label="World preview">
            Name: {worldData.name || 'Not set'} | 
            Genre: {worldData.genre} | 
            Description: {worldData.description || 'Not set'}
          </div>
        </div>
      );
    };

    render(<TestWrapper />);

    // Initially should show empty values
    expect(screen.getByLabelText('World preview')).toHaveTextContent('Name: Not set');
    expect(screen.getByLabelText('World preview')).toHaveTextContent('Genre: fantasy');

    // Change name
    fireEvent.change(screen.getByPlaceholderText(/输入你的世界名称/i), {
      target: { value: 'My New World' },
    });
    expect(screen.getByLabelText('World preview')).toHaveTextContent('Name: My New World');

    // Change genre
    const genreSelect = screen.getByTestId('world-genre-select');
    fireEvent.change(genreSelect, {
      target: { value: 'sci-fi' },
    });
    expect(screen.getByLabelText('World preview')).toHaveTextContent('Genre: sci-fi');
  });

  test('renders with valid data', () => {
    render(
      <BasicInfoStep
        worldData={{
          name: 'Valid World Name',
          genre: 'fantasy',
        }}
        errors={{}}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByDisplayValue('Valid World Name')).toBeInTheDocument();
    const genreSelect = screen.getByTestId('world-genre-select');
    expect(genreSelect).toHaveValue('fantasy');
  });

  test('displays error messages for invalid inputs', () => {
    const errors = {
      name: 'Name is too short',
    };

    render(
      <BasicInfoStep
        worldData={mockWorldData}
        errors={errors}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText("操作未能完成，请稍后重试。")).toBeInTheDocument();
  });

  test('renders provider key requirement disclosure with accessible alert role', () => {
    render(
      <BasicInfoStep
        worldData={mockWorldData}
        errors={{}}
        onUpdate={mockOnUpdate}
      />
    );

    const disclosure = screen.getByTestId('provider-key-disclosure');
    expect(disclosure).toBeInTheDocument();
    expect(disclosure).toHaveAttribute('role', 'alert');
    expect(disclosure).toHaveTextContent(
      /Narraitor 使用你自己的模型服务密钥运行/
    );
    expect(disclosure).toHaveTextContent(
      /密钥仅存储在浏览器中，无需账户/
    );
    expect(screen.getByRole('link', { name: "设置模型服务" })).toHaveAttribute(
      'href',
      '/settings/providers'
    );
  });

  test('does not render provider key requirement disclosure when a provider is configured', () => {
    useProviderStore.setState({
      providers: {
        p1: {
          id: 'p1',
          name: 'Gemini',
          type: 'gemini',
          endpoint: 'https://example.test',
          model: 'gemini-2.5-flash',
          capabilities: { text: true, images: false, streaming: true },
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      },
    });

    render(
      <BasicInfoStep
        worldData={mockWorldData}
        errors={{}}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.queryByTestId('provider-key-disclosure')).not.toBeInTheDocument();
  });

  test('groups world type radio options under shared name for keyboard navigation', () => {
    render(
      <BasicInfoStep
        worldData={mockWorldData}
        errors={{}}
        onUpdate={mockOnUpdate}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThanOrEqual(3);
    radios.forEach(radio => {
      expect(radio).toHaveAttribute("name", 'world-type');
    });
  });
});
