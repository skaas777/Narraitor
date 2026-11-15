import React from 'react';
import Link from 'next/link';
import { FAQ_GROUPS } from './faqContent';

/**
 * Faq — the answers to the questions a new player asks before they've played.
 * The same ground is covered in the README, /about, /privacy, and the provider
 * wizard, so changes here usually want a matching edit there.
 *
 * Server component, deliberately: every answer ships open, with a jump list of
 * questions on top. Nothing collapses, so in-page find works and there's no
 * client bundle. Structural treatment lives in src/app/faq.css under
 * .component-faq* selectors (mirrors the legal/about pattern).
 */
export default function Faq() {
  return (
    <div className="component-faq">
      <header className="component-faq-hero">
        <h1 className="component-faq-title">问题与解答</h1>
        <p className="component-faq-lead">
          Narraitor 是什么、它需要你提供什么，以及你的故事会经历什么。如果这里有错误或遗漏，请在 GitHub 上告诉我们。
        </p>
      </header>

      <nav className="component-faq-jumplist" aria-label="跳转到某个问题">
        {FAQ_GROUPS.map((group) => (
          <div key={group.id} className="component-faq-jumplist-group">
            <p className="component-faq-jumplist-title">{group.title}</p>
            <ul className="component-faq-jumplist-items">
              {group.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="component-faq-jumplist-link"
                  >
                    {item.question}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {FAQ_GROUPS.map((group) => (
        <section
          key={group.id}
          className="component-faq-group"
          aria-labelledby={group.id}
        >
          <h2 id={group.id} className="component-faq-group-title">
            {group.title}
          </h2>

          {group.items.map((item) => (
            <article key={item.id} className="component-faq-item">
              <h3 id={item.id} className="component-faq-question">
                {item.question}
              </h3>
              <div className="component-faq-answer">{item.answer}</div>
            </article>
          ))}
        </section>
      ))}

      <nav className="component-faq-footer" aria-label="更多信息">
        <Link href="/about" className="component-faq-footer-link">
          关于
        </Link>
        <Link href="/faq" className="component-faq-footer-link">
          常见问题
        </Link>
        <Link href="/privacy" className="component-faq-footer-link">
          隐私
        </Link>
        <Link href="/terms" className="component-faq-footer-link">
          条款
        </Link>
      </nav>
    </div>
  );
}
