import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeMenu } from '../ThemeMenu';

const setColorScheme = jest.fn();

jest.mock('@/lib/theme', () => ({
  useTheme: () => ({
    colorScheme: 'light',
    setColorScheme,
  }),
}));

describe('ThemeMenu', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens to show the color scheme control and selects an option', () => {
    render(<ThemeMenu />);

    // Closed by default.
    expect(
      screen.queryByRole('radiogroup', { name: "配色方案" })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: "外观" }));

    // Single design system now — the Appearance menu is just light/dark/system.
    expect(
      screen.getByRole('radiogroup', { name: "配色方案" })
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: "浅色" })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: "深色" })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: "系统" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: "深色" }));
    expect(setColorScheme).toHaveBeenCalledWith('dark');
  });
});
