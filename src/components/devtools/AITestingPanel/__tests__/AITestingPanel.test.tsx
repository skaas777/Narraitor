import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AITestingPanel } from '../AITestingPanel';

// Mock the context override utilities
jest.mock('../../../../lib/ai/contextOverride', () => ({
  createTestContext: jest.fn().mockImplementation((world, character, context, config) => ({
    world: { ...world, ...config.worldOverride },
    character: { ...character, ...config.characterOverride },
    narrativeContext: { ...context, ...config.narrativeContext }
  }))
}));

describe('AITestingPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock setTimeout to make tests run faster
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('displays custom input forms for world and character overrides', () => {
    render(<AITestingPanel />);
    
    // Verify core input sections are present
    expect(screen.getByText(/世界覆盖/i)).toBeInTheDocument();
    expect(screen.getByText(/角色覆盖/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /生成叙事/i })).toBeInTheDocument();
  });

  test('allows configuration of custom world settings', () => {
    render(<AITestingPanel />);
    
    // Test world name input
    const worldNameInput = screen.getByLabelText(/世界名称/i);
    fireEvent.change(worldNameInput, { target: { value: 'Test Fantasy World' } });
    expect(worldNameInput).toHaveValue('Test Fantasy World');
    
    // Test world genre input (changed from theme to genre)
    const worldGenreInput = screen.getByLabelText(/世界类型/i);
    fireEvent.change(worldGenreInput, { target: { value: 'fantasy' } });
    expect(worldGenreInput).toHaveValue('fantasy');
  });

  test('allows configuration of custom character settings', () => {
    render(<AITestingPanel />);
    
    // Test character name input
    const characterNameInput = screen.getByLabelText(/角色名称/i);
    fireEvent.change(characterNameInput, { target: { value: 'Test Hero' } });
    expect(characterNameInput).toHaveValue('Test Hero');
  });

  test('executes narrative generation with custom context', async () => {
    render(<AITestingPanel />);
    
    // Configure test inputs
    fireEvent.change(screen.getByLabelText(/世界名称/i), { target: { value: 'Test World' } });
    fireEvent.change(screen.getByLabelText(/角色名称/i), { target: { value: 'Test Character' } });
    
    // Execute generation
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /生成叙事/i }));
    });
    
    // Fast-forward timers to simulate the delay
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Verify the generation completed
    await waitFor(() => {
      expect(screen.getByText(/在.*世界.*站在十字路口/i)).toBeInTheDocument();
    });
  });

  test('displays generated narrative results', async () => {
    render(<AITestingPanel />);
    
    // Execute generation
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /生成叙事/i }));
    });
    
    // Fast-forward timers to simulate the delay
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Verify results are displayed
    await waitFor(() => {
      expect(screen.getByText(/在.*世界.*站在十字路口/i)).toBeInTheDocument();
      // Note: The choices are now dynamic, so we'll check for the choices section instead
      expect(screen.getByText(/选项：/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during narrative generation', async () => {
    render(<AITestingPanel />);
    
    // Start generation
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /生成叙事/i }));
    });
    
    // Verify loading state appears immediately
    expect(screen.getByText(/正在生成……/i)).toBeInTheDocument();
    expect(screen.getByText(/正在生成叙事\.\.\./i)).toBeInTheDocument();
    
    // Fast-forward timers to complete generation
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Verify results appear after generation
    await waitFor(() => {
      expect(screen.getByText(/在.*世界.*站在十字路口/i)).toBeInTheDocument();
    });
  });
});
