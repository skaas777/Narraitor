import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterSuggestions } from '../CharacterSuggestions';
import {
  createMockWorld,
  createMockWorldAttribute,
  createMockWorldSkill,
} from '@/lib/test-utils/testDataFactory';
import { CharacterCreationData } from '@/hooks/useCharacterCreationWizard';

const world = createMockWorld({
  attributes: [
    createMockWorldAttribute({ id: 'attr-1', name: 'Strength', minValue: 1, maxValue: 10 }),
  ],
  skills: [
    createMockWorldSkill({ id: 'skill-1', name: 'Athletics', minValue: 1, maxValue: 10 }),
  ],
});

const characterData: CharacterCreationData = {
  worldId: world.id,
  name: '',
  description: 'A wandering knight',
  portraitPlaceholder: '',
  attributes: [
    { attributeId: 'attr-1', name: 'Strength', value: 1, minValue: 1, maxValue: 10 },
  ],
  skills: [
    {
      skillId: 'skill-1',
      name: 'Athletics',
      level: 1,
      minLevel: 1,
      maxLevel: 10,
      isSelected: false,
    },
  ],
  background: { history: '', personality: '', goals: [], motivation: '' },
};

const generated = {
  name: 'Generated Hero',
  background: {
    description: 'A weathered investigator with a past.',
    personality: 'Sharp and cynical.',
    motivation: 'Find the truth.',
    fears: ['failure', 'the dark'],
    physicalDescription: 'Tall, tired eyes.',
  },
  attributes: [{ id: 'attr-1', value: 8 }],
  skills: [{ id: 'skill-1', level: 6 }],
  level: 3,
};

function mockFetchOk(data: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  }) as jest.Mock;
}

function renderPanel(onAdopt = jest.fn(), customWorld = world) {
  render(
    <CharacterSuggestions
      world={customWorld}
      concept={characterData.description}
      characterData={characterData}
      onAdopt={onAdopt}
    />
  );
  return onAdopt;
}

describe('CharacterSuggestions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generates and renders the four suggestion cards', async () => {
    mockFetchOk(generated);
    renderPanel();

    await userEvent.click(
      screen.getByRole('button', { name: "推荐角色细节" })
    );

    await waitFor(() => {
      expect(screen.getByRole('article', { name: "描述建议" })).toBeInTheDocument();
    });
    expect(screen.getByRole('article', { name: "背景建议" })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: "属性建议" })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: "技能建议" })).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/generate-character',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('adopts the description suggestion', async () => {
    mockFetchOk(generated);
    const onAdopt = renderPanel();

    await userEvent.click(
      screen.getByRole('button', { name: "推荐角色细节" })
    );
    await screen.findByRole('article', { name: "描述建议" });

    await userEvent.click(
      screen.getByRole('button', { name: "采纳描述建议" })
    );

    expect(onAdopt).toHaveBeenCalledWith({
      description: generated.background.description,
    });
  });

  it('dismisses a suggestion card', async () => {
    mockFetchOk(generated);
    renderPanel();

    await userEvent.click(
      screen.getByRole('button', { name: "推荐角色细节" })
    );
    await screen.findByRole('article', { name: "描述建议" });

    await userEvent.click(
      screen.getByRole('button', { name: "忽略描述建议" })
    );

    expect(
      screen.queryByRole('article', { name: "描述建议" })
    ).not.toBeInTheDocument();
  });

  it('edits a suggestion before adopting it', async () => {
    mockFetchOk(generated);
    const onAdopt = renderPanel();

    await userEvent.click(
      screen.getByRole('button', { name: "推荐角色细节" })
    );
    await screen.findByRole('article', { name: "描述建议" });

    await userEvent.click(
      screen.getByRole('button', { name: "编辑描述建议" })
    );

    const textarea = screen.getByLabelText("描述");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'My edited description');

    await userEvent.click(
      screen.getByRole('button', { name: "采纳描述建议" })
    );

    expect(onAdopt).toHaveBeenCalledWith({ description: 'My edited description' });
  });

  it('never adopts NaN when an attribute edit clears the input', async () => {
    mockFetchOk(generated);
    const onAdopt = renderPanel();

    await userEvent.click(
      screen.getByRole('button', { name: "推荐角色细节" })
    );
    await screen.findByRole('article', { name: "属性建议" });

    await userEvent.click(
      screen.getByRole('button', { name: "编辑属性建议" })
    );

    // Clear the Strength number input (transient state — empty string parses to NaN).
    await userEvent.clear(screen.getByLabelText('Strength 值'));

    await userEvent.click(
      screen.getByRole('button', { name: "采纳属性建议" })
    );

    const call = onAdopt.mock.calls.find((c) => c[0]?.attributes);
    expect(call).toBeDefined();
    for (const attr of call![0].attributes) {
      expect(Number.isFinite(attr.value)).toBe(true);
    }
  });

  it('shows an error when generation fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Generation exploded' }),
    }) as jest.Mock;
    renderPanel();

    await userEvent.click(
      screen.getByRole('button', { name: "推荐角色细节" })
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('操作未能完成，请稍后重试。');
    });
  });

  it('blocks adoption and shows warning when attribute exceeds pool budget', async () => {
    // Generate a suggestion that is natively over the budget limit
    const smallPoolWorld = {
      ...world,
      settings: { ...world.settings, attributePointPool: 5 },
    };
    
    mockFetchOk({
      ...generated,
      attributes: [{ id: 'attr-1', value: 8 }] // 8 is > 5 budget limit
    });
    renderPanel(jest.fn(), smallPoolWorld);

    await userEvent.click(
      screen.getByRole('button', { name: "推荐角色细节" })
    );
    await screen.findByRole('article', { name: "属性建议" });

    await userEvent.click(
      screen.getByRole('button', { name: "编辑属性建议" })
    );

    // Check for warning message immediately since 8 > 5 budget
    await waitFor(() => {
      expect(screen.getByText(/超出预算/)).toBeInTheDocument();
    });

    const adoptBtn = screen.getByRole('button', { name: "采纳属性建议" });
    expect(adoptBtn).toBeDisabled();
  });

  it('allows adoption when attribute is within pool budget', async () => {
    mockFetchOk(generated);
    const onAdopt = renderPanel();

    await userEvent.click(
      screen.getByRole('button', { name: "推荐角色细节" })
    );
    await screen.findByRole('article', { name: "属性建议" });

    await userEvent.click(
      screen.getByRole('button', { name: "编辑属性建议" })
    );

    const input = screen.getByLabelText('Strength 值');
    await userEvent.clear(input);
    await userEvent.type(input, '10'); // Within the pool budget of 30

    // Should not have the warning
    expect(screen.queryByText(/超出预算/)).not.toBeInTheDocument();

    const adoptBtn = screen.getByRole('button', { name: "采纳属性建议" });
    expect(adoptBtn).not.toBeDisabled();

    await userEvent.click(adoptBtn);

    const call = onAdopt.mock.calls.find((c) => c[0]?.attributes);
    expect(call).toBeDefined();
    expect(call![0].attributes[0].value).toBe(10);
  });
});
