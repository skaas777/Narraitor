import type { Decision } from '@/types/narrative.types';
import type { SessionSnapshot } from '@/types/turnResolver.types';
import { sameItemName } from '@/lib/narrative/itemLossInference';
import { getPlayerPacing } from '@/lib/narrative/playerPacing';

const bookingCommitment = /订票|订位|预订|留名|候船|记名|(?:船名|船位|名额|位子).{0,6}(?:记|留|订)|(?:记|留|订).{0,6}(?:船名|船位|名额|位子)|(?:船|航|票).{0,10}登记|登记.{0,10}(?:船|航|票)/u;

function offersBooking(text: string): boolean {
  return text.split(/[，,。！？；;\n]/u).some((clause) =>
    bookingCommitment.test(clause) &&
    !/(?:暂不|先不|不要|拒绝|不)(?:再|去|先)?(?:订|预订|登记|留名|候船|记名|把.{0,12}记)/u.test(clause)
  );
}

export function enforceChoiceState(decision: Decision, snapshot?: SessionSnapshot, invalidIds: readonly string[] = []): Decision {
  if (!snapshot) return decision;
  const unavailable = snapshot.segments.flatMap((segment) => segment.metadata.itemsLost ?? [])
    .filter((loss) => !snapshot.inventory.some((item) => sameItemName(item.name, loss.name)));
  const action = snapshot.segments.at(-1)?.metadata.causedByDecisionText ?? '';
  const declined = [...action.matchAll(/(?:暂不|先不|不要|拒绝|不)(订票|订位|登记|做菜|营业|出发|开船|取证|调查)/gu)].map((match) => match[1]);
  const declinedBooking = /(?:暂不|先不|不要|拒绝|不)(?:订票|订位|留名|候船)|(?:暂不|先不|不要|拒绝|不)[^。！？\n]{0,8}(?:船名|船位)/u.test(action);
  const quiet = getPlayerPacing(action).quietAction;
  const options = decision.options.filter((option) => {
    if (invalidIds.includes(option.id)) return false;
    // Reacquiring an item is allowed; spending/using a historically lost item
    // without first recovering it is not. Names remain exact, not fuzzy.
    if (unavailable.some((item) => option.text.includes(item.name)) &&
        !/购买|买回|领回|取回|找回|重新获取|recover|buy|retrieve/i.test(option.text)) return false;
    if (declinedBooking && offersBooking(option.text)) return false;
    return !declined.some((verb) => option.text.includes(verb) && !option.text.includes(`不${verb}`));
  });
  const alternatives = quiet
    ? ['按自己的节奏继续休息，留意眼前的风景', '整理自己的随身物品，再决定下一步', '看看附近有什么值得慢慢欣赏的地方']
    : ['观察眼前环境，再决定下一步', '整理已经掌握的信息，考虑新的做法', '先停留片刻，看看局势有没有实际变化'];
  for (const [index, text] of alternatives.entries()) {
    if (options.length >= Math.min(3, decision.options.length)) break;
    if (!options.some((option) => option.text === text)) options.push({ id: `${decision.id}-state-${index}`, text, alignment: 'neutral' });
  }
  return { ...decision, ...(decision.options.length !== options.filter((option) => decision.options.includes(option)).length
    ? { contextSummary: undefined } : {}), options };
}
