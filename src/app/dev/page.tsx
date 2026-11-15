'use client';

import Link from 'next/link';
import { displayLabel } from '@/lib/i18n/zhCN';

export default function DevPage() {
  const testHarnesses = {
    'Core Systems': [
      { href: '/dev/game-session', label: "游戏冒险记录", color: 'blue' },
      { href: '/dev/ending-system', label: "结局系统（AI）", color: 'blue' },
      { href: '/dev/choice-alignment', label: "选项对齐测试", color: 'blue' },
      { href: '/dev/lore-viewer', label: "设定查看器", color: 'indigo' },
    ],
    'World Management': [
      { href: '/dev/world-generation', label: "世界生成（AI）", color: 'orange' },
      { href: '/dev/test-world-generation', label: "测试世界生成（AI）", color: 'orange' },
    ],
    'Character Management': [
      { href: '/dev/character-generation', label: "角色生成（AI）", color: 'orange' },
    ],
    'Journal System': [
      { href: '/dev/journal-access', label: "基础日志访问", color: 'orange' },
    ],
    'Navigation & UI': [
      { href: '/dev/navigation-flow', label: "导航流程", color: 'teal' },
      { href: '/dev/guided-first-time-experience', label: "引导式首次体验", color: 'teal' },
    ],
  };

  return (
    <div>
      <h1>开发测试工具</h1>
      
      <div>
        {Object.entries(testHarnesses).map(([category, items]) => (
          <div key={category}>
            <h2>{displayLabel(category)}</h2>
            <div>
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
