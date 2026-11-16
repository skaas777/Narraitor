// src/lib/narrative/__tests__/itemProcessorShared.test.ts

import { itemNamesMatch } from '../itemProcessorShared';
import { checkItemSimilarityClient } from '@/lib/inventory/checkItemSimilarityClient';

jest.mock('@/lib/utils/logger');
jest.mock('@/lib/inventory/checkItemSimilarityClient');

const mockCheckSimilarity = checkItemSimilarityClient as jest.MockedFunction<
  typeof checkItemSimilarityClient
>;

describe('itemNamesMatch dedup heuristics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckSimilarity.mockResolvedValue({
      similar: false,
      confidence: 0,
      rationale: 'AI fallback',
    });
  });

  it('matches singular/plural pairs without an AI call', async () => {
    const result = await itemNamesMatch('Gold Coin', 'Gold Coins');

    expect(result).toBe(true);
    expect(mockCheckSimilarity).not.toHaveBeenCalled();
  });

  it('matches descriptive expansions via substring without an AI call', async () => {
    const result = await itemNamesMatch('Lantern', 'Rusty Kerosene Lantern');

    expect(result).toBe(true);
    expect(mockCheckSimilarity).not.toHaveBeenCalled();
  });

  it('defers genuinely different names to the AI similarity check', async () => {
    const result = await itemNamesMatch('Healing Potion', 'Iron Shield');

    expect(result).toBe(false);
    expect(mockCheckSimilarity).toHaveBeenCalledTimes(1);
  });

  it('does not false-match short unrelated names', async () => {
    await itemNamesMatch('Key', 'Donkey');

    // "Key" is below the substring threshold, so this should defer to AI
    // rather than declaring a match locally.
    expect(mockCheckSimilarity).toHaveBeenCalledTimes(1);
  });

  it('does not treat a mid-word substring as a whole-word match', async () => {
    // "ring" is a substring of "earring" but not a whole word - declaring a
    // match here would merge genuinely different items. Defer to the AI.
    await itemNamesMatch('Ring', 'Earring');

    expect(mockCheckSimilarity).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['无寄件人的旧信', '旧信'],
    ['登记页', '撕走的登记页'],
  ])('matches an explicit story-item alias without an AI call: %s / %s', async (first, second) => {
    await expect(itemNamesMatch(first, second)).resolves.toBe(true);
    expect(mockCheckSimilarity).not.toHaveBeenCalled();
  });

  it('defers semantic Chinese item aliases to the similarity model', async () => {
    mockCheckSimilarity.mockResolvedValueOnce({ similar: true, confidence: 0.9 });
    await expect(itemNamesMatch('旧布条', '缠手布条')).resolves.toBe(true);
    expect(mockCheckSimilarity).toHaveBeenCalledTimes(1);
  });

  it('does not merge unrelated Chinese items that share a generic noun', async () => {
    await expect(itemNamesMatch('红钥匙', '蓝钥匙')).resolves.toBe(false);
    expect(mockCheckSimilarity).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the AI similarity service is unavailable', async () => {
    mockCheckSimilarity.mockRejectedValueOnce(new Error('service unavailable'));

    await expect(itemNamesMatch('登记页', '撕走的登记簿')).resolves.toBe(false);
    expect(mockCheckSimilarity).toHaveBeenCalledTimes(1);
  });
});
