import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProviderDisclosure } from '../ProviderDisclosure';
import { getPresetById } from '@/lib/ai/presets';

describe('ProviderDisclosure', () => {
  test('warns that Gemini\'s free tier trains on prompts and is read by humans', () => {
    render(
      <ProviderDisclosure type="gemini" privacyNote={getPresetById('gemini')?.privacyNote} />
    );

    const privacy = screen.getByText(/免费层级/i);
    expect(privacy).toHaveTextContent(/改进其模型/i);
    expect(privacy).toHaveTextContent(/人工评分员/i);
    expect(privacy).toHaveTextContent(/付费层级不会/i);
  });

  test('says a content rating is a safety-filter setting on Gemini', () => {
    render(<ProviderDisclosure type="gemini" />);

    expect(screen.getByText(/安全过滤设置/i)).toBeInTheDocument();
  });

  test('says plainly that a rating is guidance, not a filter, everywhere else', () => {
    render(<ProviderDisclosure type="openai-compatible" />);

    const rating = screen.getByText(/没有安全过滤设置/i);
    expect(rating).toHaveTextContent(/指导/i);
    expect(rating).toHaveTextContent(/不会强制执行/i);
  });

  test('shows only the rating line when a provider has no privacy note', () => {
    render(<ProviderDisclosure type="openai-compatible" />);

    expect(screen.queryByText(/^隐私$/)).not.toBeInTheDocument();
  });
});
