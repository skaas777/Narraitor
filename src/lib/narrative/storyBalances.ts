import type { StoryMemoryUpdate } from '@/types/narrative.types';

type Balance = NonNullable<StoryMemoryUpdate['balances']>[number];

function chineseInteger(text: string): number {
  if (/^\d+$/.test(text)) return Number(text);
  const digits: Record<string, number> = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  let total = 0;
  let digit = 0;
  for (const char of text) {
    if (char === '十' || char === '百') { total += (digit || 1) * (char === '十' ? 10 : 100); digit = 0; }
    else digit = digits[char] ?? 0;
  }
  return total + digit;
}

/** Legacy fallback accepts an explicit personal balance, never a price or an
 * isolated coin pickup. New turns use typed transaction deltas instead. */
export function extractExplicitPersonalBalances(content: string): Balance[] {
  const matches = [...content.matchAll(/你[^。！？\n]{0,120}?(?:剩下|还剩|余下|余额(?:为|是)?|正好)\s*([0-9零一二两三四五六七八九十百]+)\s*(文|金币|银币|铜板|美元|元)/gu)];
  return matches.map((match) => ({ currency: match[2], balance: chineseInteger(match[1]), evidence: match[0] }));
}

export function parseBalances(value: unknown): Balance[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 5).flatMap((entry) => {
    if (!entry || typeof entry.currency !== 'string' || !entry.currency.trim() || entry.currency.length > 20 ||
        !Number.isSafeInteger(entry.balance) || entry.balance < 0 ||
        (entry.change !== undefined && !Number.isSafeInteger(entry.change))) return [];
    return [{ currency: entry.currency.trim(), balance: entry.balance,
      ...(entry.change !== undefined ? { change: entry.change } : {}),
      ...(typeof entry.evidence === 'string' ? { evidence: entry.evidence.trim().slice(0, 300) } : {}),
    }];
  });
}
