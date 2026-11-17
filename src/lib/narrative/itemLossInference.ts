import { normalizeText, NORM_NAME } from '@/lib/utils';
import { escapeRegExp } from '@/lib/utils/formatters';
import type { InventoryItem } from '@/types/inventory.types';
import type { ItemLossReason, LostItemMetadata } from '@/types/narrative.types';

const LOSS_REASON_PATTERNS: Array<{ reason: ItemLossReason; pattern: RegExp }> = [
  { reason: 'stolen', pattern: /\b(stolen|steal|stole|pickpocket|snatched|confiscated|seized)\b|收走|没收|扣走|扣下|拿走|夺走|抢走|偷走|搜走/i },
  { reason: 'consumed', pattern: /\b(drink|drank|consume|consumed|eat|ate|used up|use up|spent)\b|喝掉|喝下|吃掉|吃下|用完|用掉|耗尽|花掉|花了/i },
  { reason: 'delivered', pattern: /\b(deliver|delivered|hand over|handed over|turn in|turned in|give to|gave to)\b|交给|交出|交到|交还|递给|递交|付给|支付/i },
  { reason: 'destroyed', pattern: /\b(destroy|destroyed|shatter|shattered|break|broke|broken|ruined)\b|摔碎|打碎|砸碎|烧毁|烧成灰|彻底损坏|毁掉|损毁/i },
  { reason: 'sold', pattern: /\b(sell|sold|trade|traded)\b|卖掉|卖给|售出/i },
  { reason: 'gifted', pattern: /\b(gift|gifted|presented)\b|赠给|赠送|送给/i },
  { reason: 'sacrificed', pattern: /\b(sacrifice|sacrificed|offer|offered)\b|献祭|献出/i },
  { reason: 'dropped', pattern: /\b(drop|dropped|discard|discarded|toss|tossed|throw|threw|throw away|abandon|abandoned|leave behind|left behind|lose|lost)\b|丢掉|扔掉|扔进|抛下|遗失|丢失|落入|掉进|落进|留在原地/i },
];

const normalizeForMatch = (value: string): string =>
  normalizeText(value, NORM_NAME).toLowerCase();

// Remove only narrative presentation wrappers that do not identify an item.
// Keep colors, owners, numbers, recipients, and other arbitrary descriptors:
// "张三的信" and "李四的信" must remain different items.
const PRESENTATION_PREFIXES = /^(?:撕走的|撕下的|无寄件人的)/u;

const canonicalItemName = (value: string): string => {
  let result = normalizeForMatch(value);
  let previous = '';
  while (result && result !== previous) {
    previous = result;
    result = result.replace(PRESENTATION_PREFIXES, '');
  }
  return result;
};

const NON_EVENT = /\b(not|never|didn't|don't|would|could|might|plan|intend|remember|recall|if)\b|没有|并未|尚未|不曾|不要|别把|不肯|拒绝|打算|准备|想要|如果|假如|倘若|想起|记得|回忆|此前|先前|昨天|早已/i;
const INCOMING_ITEM = /\b(?:hands?|gives?|returns?)\s+(?:it\s+)?to you\b|\b(?:you receive|you accept)\b|交还给你|还给你|递给你|交给你|塞给你|送给你|你接过|你收下/i;
const HANDOVER = /\b(?:hand(?:ed)?|give|gave|deliver(?:ed)?|present(?:ed)?)\b|递(?:过去|给)|交给|交出|送给|赠给|递交|付给/i;
const ACCEPTANCE = /\b(?:accept(?:ed)?|take(?:s|n)?|receive(?:d)?|gets?)\b|接(?:过去|过来|下)|接受|收下|挂在|放进(?:他|她|对方)/i;

/** Conservative identity match for inference and pre-commit inventory checks. */
export function sameItemName(a: string, b: string): boolean {
  if (!a || !b) return false;
  const normalizedA = canonicalItemName(a);
  const normalizedB = canonicalItemName(b);
  if (normalizedA === normalizedB) return true;
  return false;
}

function quantityFromClause(clause: string, item: InventoryItem): number {
  if (!item.stackable) return item.quantity ?? 1;
  if (/全部|所有|剩下的|\ball (?:of )?(?:your|the)\b/i.test(clause)) return item.quantity;
  const match = clause.match(new RegExp(`([0-9一二两三四五六七八九十百]+)\\s*(?:枚|个|支|颗|瓶|张|份)?\\s*${escapeRegExp(item.name)}`, 'i'));
  if (!match) return 1;
  // Preserve the narrated amount so the pre-commit guard can reject overspending.
  if (/^\d+$/.test(match[1])) return Number(match[1]);
  const digits: Record<string, number> = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  let quantity = 0;
  let digit = 0;
  for (const char of match[1]) {
    if (char === '十' || char === '百') {
      quantity += (digit || 1) * (char === '十' ? 10 : 100);
      digit = 0;
    } else digit = digits[char] ?? 0;
  }
  return quantity + digit || 1;
}

export const inferItemsLostFromNarrative = (
  content: string,
  inventory: InventoryItem[]
): LostItemMetadata[] => {
  if (!content || inventory.length === 0) {
    return [];
  }

  // Scope the verb to the named item's clause; a loss elsewhere must not
  // remove every item mentioned in the passage. Ambiguity is left to metadata.
  const clauses = content.split(/[。！？.!?；;，,\n]+|\s+(?:and|but|while)\s+/i);
  const losses: LostItemMetadata[] = [];
  for (const item of inventory) {
    const name = normalizeForMatch(item.name);
    if (name.length < 2) continue;
    const clause = clauses.find((part) => {
      const text = normalizeForMatch(part);
      const containsName = /[\p{Script=Han}]/u.test(name)
        ? text.includes(name)
        : new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i').test(text);
      return containsName && !NON_EVENT.test(part) && !INCOMING_ITEM.test(part) &&
        LOSS_REASON_PATTERNS.some(({ pattern }) => pattern.test(part));
    });
    if (!clause) {
      // A completed handover is often narrated in two clauses: the item is
      // taken from the bag and handed over, then the recipient accepts it.
      // Keep this evidence-based: require the held item's name, a transfer
      // verb, and an acceptance/retention signal in the same short passage.
      const itemMention = /[\p{Script=Han}]/u.test(name)
        ? content.toLowerCase().indexOf(name)
        : content.search(new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i'));
      if (itemMention >= 0) {
        const window = content.slice(Math.max(0, itemMention - 80), itemMention + name.length + 180);
        const continuation = content.slice(itemMention + name.length, itemMention + name.length + 120)
          .split(/[，,。.!?！？\n]/u).slice(1, 3);
        const boundTransfer = continuation.some((part) =>
          /^(?:\s|你|双手|随即|然后|接着|再|轻轻|把它|将它)*(?:递过去|递给|交给|交出|送给|赠给)/u.test(part));
        const otherNamedItem = inventory.some((other) => other.id !== item.id &&
          other.name !== item.name && window.includes(other.name));
        if (/(?:你(?:把|从|取|拿)|\byou\b)/i.test(window) &&
            boundTransfer && HANDOVER.test(window) && ACCEPTANCE.test(window) &&
            !NON_EVENT.test(window) && !INCOMING_ITEM.test(window) && !otherNamedItem) {
          losses.push({ name: item.name, quantity: quantityFromClause(window, item), lossReason: 'delivered' });
        }
      }
      continue;
    }
    const reason = LOSS_REASON_PATTERNS.find(({ pattern }) => pattern.test(clause))!.reason;
    losses.push({ name: item.name, quantity: quantityFromClause(clause, item), lossReason: reason });
  }
  return losses;
};
