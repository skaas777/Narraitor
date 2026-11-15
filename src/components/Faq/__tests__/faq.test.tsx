import React from 'react';
import { render, screen, within } from '@testing-library/react';
import FaqPage from '@/app/faq/page';
import { FAQ_GROUPS } from '@/components/Faq';

/**
 * MVP coverage for the FAQ surface.
 *
 * The one failure worth a test is the jump list going stale: it's generated
 * from the same data as the answers, so a link pointing at an id that isn't
 * rendered means the data shape broke. Beyond that, the assertions pin the
 * facts the page exists to state — bring your own key, browser-local storage,
 * no accounts — so a copy edit that reverses one of them fails here.
 */

describe('FAQ page', () => {
  it('renders every group and question', () => {
    render(<FaqPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /问题与解答/i })
    ).toBeInTheDocument();

    for (const group of FAQ_GROUPS) {
      expect(
        screen.getByRole('heading', { level: 2, name: group.title })
      ).toBeInTheDocument();

      for (const item of group.items) {
        expect(
          screen.getByRole('heading', { level: 3, name: item.question })
        ).toBeInTheDocument();
      }
    }
  });

  it('points every jump-list link at a question that exists', () => {
    const { container } = render(<FaqPage />);

    const jumpList = screen.getByRole('navigation', {
      name: /跳转到某个问题/i,
    });
    const links = within(jumpList).getAllByRole('link');

    expect(links).toHaveLength(
      FAQ_GROUPS.reduce((total, group) => total + group.items.length, 0)
    );

    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      expect(href).toMatch(/^#/);
      expect(container.querySelector(href)).not.toBeNull();
    }
  });

  it('states how the key, storage, and accounts actually work', () => {
    render(<FaqPage />);

    expect(screen.getByText(/无需注册、登录、个人资料/i)).toBeInTheDocument();
    expect(
      screen.getByText(/没有后端数据库，也没有你游戏的服务器端副本/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/生成费用会计入你所设置的密钥/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gemini、OpenAI、OpenRouter，以及自行托管模型时使用的 Ollama。OpenRouter 是另一个无需银行卡即可使用的服务，一个密钥就能覆盖数十个模型。设置界面还会列出 Deepseek、Mistral、Together、Groq 和 Perplexity，但这些服务只有在各自用有效密钥验证通过后才可使用。/i)
    ).toBeInTheDocument();
  });

  it('exposes footer links to about, privacy, and terms', () => {
    render(<FaqPage />);

    const footer = screen.getByRole('navigation', { name: /更多信息/i });
    expect(within(footer).getByRole('link', { name: /关于/i })).toHaveAttribute(
      'href',
      '/about'
    );
    expect(within(footer).getByRole('link', { name: /隐私/i })).toHaveAttribute(
      'href',
      '/privacy'
    );
    expect(within(footer).getByRole('link', { name: /条款/i })).toHaveAttribute(
      'href',
      '/terms'
    );
  });
});
