import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProviderAdvancedSettings } from '../ProviderAdvancedSettings';
import type { AdvancedSettings } from '@/types/provider.types';

function renderPanel(
  value: AdvancedSettings | undefined = undefined,
  onChange: (settings: AdvancedSettings | undefined) => void = jest.fn(),
  samplingControlsFixed = false
) {
  render(
    <ProviderAdvancedSettings
      providerId="p1"
      value={value}
      onChange={onChange}
      samplingControlsFixed={samplingControlsFixed}
    />
  );
}

async function expand(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /展开.*高级/i }));
}

describe('ProviderAdvancedSettings', () => {
  test('is collapsed by default', () => {
    renderPanel();

    const content = screen.getByTestId('collapsible-section-content');
    expect(content).toHaveAttribute('aria-hidden', 'true');
  });

  test('temperature and top-p sliders carry help text and update on change', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    renderPanel(undefined, onChange);
    await expand(user);

    expect(screen.getByText(/越有创意、越随机/i)).toBeInTheDocument();
    expect(screen.getByText(/核采样——另一种限制回复多样性的方式（0\.0-1\.0）。大多数人只需调整温度；除非你明确需要，否则请保持为 1\.0。/i)).toBeInTheDocument();

    const temperature = screen.getByRole('slider', { name: /温度/i });
    fireEvent.change(temperature, { target: { value: '1.5' } });
    expect(onChange).toHaveBeenCalledWith({ temperature: 1.5 });
  });

  test('max_tokens is a number input with help text, and persists the typed value', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    renderPanel(undefined, onChange);
    await expand(user);

    const maxTokens = screen.getByLabelText(/最大回复长度（token 数）/i);
    expect(maxTokens).toHaveAttribute("type", 'number');
    expect(screen.getByText(/限制单次生成回复的长度（最多 4,096 个 token）。数值越高，场景可以越长，但每回合成本更高、耗时也更长。/i)).toBeInTheDocument();

    fireEvent.change(maxTokens, { target: { value: '4096' } });
    expect(onChange).toHaveBeenCalledWith({ maxTokens: 4096 });
  });

  test('custom safety guidance carries a warning about provider policy', async () => {
    const user = userEvent.setup();
    renderPanel();
    await expand(user);

    const alert = screen.getByRole('alert');
    expect(within(alert).getByText(/模型服务自身的安全过滤/i)).toBeInTheDocument();
  });

  test('rate limiting starts off, and reveals the requests-per-hour field once enabled', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    renderPanel(undefined, onChange);
    await expand(user);

    expect(screen.queryByLabelText(/每小时最大请求数/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /每小时请求数上限/i }));
    expect(onChange).toHaveBeenCalledWith({ rateLimitEnabled: true });
  });

  test('shows the requests-per-hour field once rate limiting is already on, and updates it', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    renderPanel({ rateLimitEnabled: true, maxRequestsPerHour: 30 }, onChange);
    await expand(user);

    const perHour = screen.getByLabelText(/每小时最大请求数/i);
    fireEvent.change(perHour, { target: { value: '10' } });
    expect(onChange).toHaveBeenCalledWith({ rateLimitEnabled: true, maxRequestsPerHour: 10 });
  });

  test('rejects non-positive and fractional requests-per-hour values before persisting', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    renderPanel({ rateLimitEnabled: true, maxRequestsPerHour: 30 }, onChange);
    await expand(user);

    const perHour = screen.getByLabelText(/每小时最大请求数/i);
    fireEvent.change(perHour, { target: { value: '0' } });
    fireEvent.change(perHour, { target: { value: '-5' } });
    fireEvent.change(perHour, { target: { value: '1.5' } });

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, { rateLimitEnabled: true });
    expect(onChange).toHaveBeenNthCalledWith(2, { rateLimitEnabled: true });
    expect(onChange).toHaveBeenNthCalledWith(3, { rateLimitEnabled: true });
  });

  test('disables temperature and top-p when the provider fixes its sampling controls', async () => {
    const user = userEvent.setup();
    renderPanel(undefined, jest.fn(), true);
    await expand(user);

    expect(screen.getByRole('slider', { name: /温度/i })).toBeDisabled();
    expect(screen.getByRole('slider', { name: /核采样概率/i })).toBeDisabled();
    expect(screen.getByText(/拒绝设置了温度或 Top-p 的请求/i)).toBeInTheDocument();
  });

  test('Reset to defaults clears every override back to unset', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    renderPanel(
      { temperature: 1.9, topP: 0.2, maxTokens: 100, rateLimitEnabled: true, maxRequestsPerHour: 5 },
      onChange
    );
    await expand(user);

    await user.click(screen.getByRole('button', { name: /恢复默认值/i }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
