'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <main>
      <div>
        <header>
          <Link href="/dev">
            <h1>Narraitor 开发</h1>
          </Link>
          <p>用于组件开发的测试环境</p>
        </header>
        {children}
      </div>
    </main>
  );
}
