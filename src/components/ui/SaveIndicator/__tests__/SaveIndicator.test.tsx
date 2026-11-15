/**
 * Tests for SaveIndicator component - TDD Implementation
 */

import { render, screen } from '@testing-library/react';
import { SaveIndicator } from '../SaveIndicator';

describe('SaveIndicator', () => {
  it('should display idle status', () => {
    render(<SaveIndicator status="idle" />);

    expect(screen.getByText(/已保存/i)).toBeInTheDocument();
  });

  it('should display saving status with loading indicator', () => {
    render(<SaveIndicator status="saving" />);
    
    expect(screen.getByText(/正在保存/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display saved status with timestamp', () => {
    const lastSaveTime = '2023-01-01T12:00:00.000Z';
    render(<SaveIndicator status="saved" lastSaveTime={lastSaveTime} />);
    
    expect(screen.getByText(/保存于/i)).toBeInTheDocument();
    // Check for time format (could be 07:00 AM due to timezone)
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it('should display error status with error message', () => {
    render(<SaveIndicator status="error" errorMessage="Save failed" />);
    
    expect(screen.getByText(/错误/i)).toBeInTheDocument();
    expect(screen.getByText(/存档失败/i)).toBeInTheDocument();
  });

  it('should display total saves count', () => {
    render(<SaveIndicator status="saved" totalSaves={5} />);
    
    expect(screen.getByText(/5 次/)).toBeInTheDocument();
  });

  it('should allow manual save trigger when provided', () => {
    const mockTriggerSave = jest.fn();
    render(<SaveIndicator status="idle" onManualSave={mockTriggerSave} />);
    
    const saveButton = screen.getByText(/立即保存/i);
    expect(saveButton).toBeInTheDocument();
    
    saveButton.click();
    expect(mockTriggerSave).toHaveBeenCalledWith('manual');
  });

  it('should disable manual save button when saving', () => {
    const mockTriggerSave = jest.fn();
    render(<SaveIndicator status="saving" onManualSave={mockTriggerSave} />);
    
    const saveButton = screen.getByText(/立即保存/i);
    expect(saveButton).toBeDisabled();
  });
});