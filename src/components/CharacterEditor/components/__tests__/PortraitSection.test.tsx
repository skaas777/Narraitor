import React from 'react';
import { render, screen } from '@testing-library/react';
import { PortraitSection } from '../PortraitSection';

describe('PortraitSection', () => {
  test('renders regenerate and remove buttons when portrait image exists', () => {
    render(
      <PortraitSection
        portrait={{
          type: 'ai-generated',
          url: 'https://example.com/portrait.png',
        }}
        characterName="Alice"
        generatingPortrait={false}
        onGeneratePortrait={jest.fn()}
        onRemovePortrait={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /重新生成肖像/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /移除肖像/i })).toBeInTheDocument();
  });

  test('renders generate button when portrait is placeholder', () => {
    render(
      <PortraitSection
        portrait={{
          type: 'placeholder',
          url: null,
        }}
        characterName="Alice"
        generatingPortrait={false}
        onGeneratePortrait={jest.fn()}
        onRemovePortrait={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /生成肖像/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /移除肖像/i })).not.toBeInTheDocument();
  });
});
