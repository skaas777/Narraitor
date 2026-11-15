import React from 'react';
import { render, screen, within } from '@testing-library/react';
import PrivacyPage from '@/app/privacy/page';
import TermsPage from '@/app/terms/page';
import About from '@/components/About';

/**
 * MVP coverage for the lightweight privacy/terms surfaces (#1366).
 * Tests map to the acceptance criteria: the copy states how the app actually
 * works (local data, prompts leave the browser, no accounts, cookieless
 * analytics; use-at-your-own-risk terms), and the pages are reachable from
 * each other via the shared footer.
 */

describe('Privacy page (#1366)', () => {
  it('states the local-data model and that prompts go to the provider', () => {
    render(<PrivacyPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /隐私/i })
    ).toBeInTheDocument();
    // Local-first storage
    expect(screen.getByText(/存储在本地浏览器中/i)).toBeInTheDocument();
    // Export/import backup
    expect(screen.getByText(/将所有内容导出为文件/i)).toBeInTheDocument();
    // Prompts leave the browser for the AI provider
    expect(
      screen.getByText(/发送你的提示词.*传给负责生成的模型服务/i)
    ).toBeInTheDocument();
    // No accounts
    expect(screen.getByText(/没有注册、没有登录、没有个人资料/i)).toBeInTheDocument();
    // Cookieless analytics, no content-derived data
    expect(screen.getByText(/匿名、无 Cookie/i)).toBeInTheDocument();
    expect(
      screen.getByText(/任何源自你内容的信息/i)
    ).toBeInTheDocument();
  });

  it('states what a crash report holds and what it leaves out (#1641)', () => {
    render(<PrivacyPage />);

    expect(
      screen.getByRole('heading', { name: /当出现故障时/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/错误的类名/i)).toBeInTheDocument();
    expect(
      screen.getByText(/有意省略的内容：错误消息本身/i)
    ).toBeInTheDocument();
  });
});

describe('Terms page (#1366)', () => {
  it('states no-warranty and the do-not-paste-secrets responsibility', () => {
    render(<TermsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /条款/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/任何形式的保证/i)).toBeInTheDocument();
    expect(screen.getByText(/使用风险由你自行承担/i)).toBeInTheDocument();
    expect(
      screen.getByText(/请勿将机密信息或真实个人数据粘贴到提示词中/i)
    ).toBeInTheDocument();
  });
});

describe('Legal pages are reachable (#1366)', () => {
  it('exposes footer links to privacy, terms, and about', () => {
    render(<PrivacyPage />);

    const footer = screen.getByRole('navigation', { name: /更多信息/i });
    expect(within(footer).getByRole('link', { name: /隐私/i })).toHaveAttribute(
      'href',
      '/privacy'
    );
    expect(within(footer).getByRole('link', { name: /条款/i })).toHaveAttribute(
      'href',
      '/terms'
    );
    expect(within(footer).getByRole('link', { name: /关于/i })).toHaveAttribute(
      'href',
      '/about'
    );
  });

  it('exposes privacy and terms links from the About page', () => {
    render(<About />);

    const footer = screen.getByRole('navigation', { name: /站点信息/i });
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
