import React from 'react';
import Link from 'next/link';

/**
 * LegalPage — shared layout for the lightweight privacy/terms surfaces.
 * Token-driven server component. Structural treatment lives in src/app/legal.css
 * under .component-legal* selectors (mirrors the About/dashboard pattern).
 */

interface LegalPageProps {
  /** Document title, e.g. "Privacy" */
  title: string;
  /** One-line plain-language summary under the title */
  lead: string;
  /** Human month/year the document was last revised, e.g. "June 2026" */
  updated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lead, updated, children }: LegalPageProps) {
  return (
    <div className="component-legal">
      <header className="component-legal-hero">
        <h1 className="component-legal-title">{title}</h1>
        <p className="component-legal-lead">{lead}</p>
        <p className="component-legal-updated">最后更新于 {updated}</p>
      </header>

      {children}

      <nav className="component-legal-footer" aria-label="更多信息">
        <Link href="/about" className="component-legal-footer-link">
          关于
        </Link>
        <Link href="/faq" className="component-legal-footer-link">
          常见问题
        </Link>
        <Link href="/privacy" className="component-legal-footer-link">
          隐私
        </Link>
        <Link href="/terms" className="component-legal-footer-link">
          条款
        </Link>
      </nav>
    </div>
  );
}

interface LegalSectionProps {
  /** Unique id, wired to the heading for aria-labelledby */
  id: string;
  heading: string;
  children: React.ReactNode;
}

export function LegalSection({ id, heading, children }: LegalSectionProps) {
  return (
    <section className="component-legal-section" aria-labelledby={id}>
      <h2 id={id} className="component-legal-section-title">
        {heading}
      </h2>
      <div className="component-legal-prose">{children}</div>
    </section>
  );
}
