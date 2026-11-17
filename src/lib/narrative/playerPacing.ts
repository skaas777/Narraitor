/** A turn count is not elapsed story time. Forward cuts require a player action
 * that actually authorizes waiting/sleep/travel; a deadline alone never does. */
export function getPlayerPacing(action: string): { quietAction: boolean; allowTimeSkip: boolean } {
  const text = action.toLowerCase();
  const clauses = text.split(/[。；;！!]/u).filter((clause) =>
    !/(?:不|别|不要|暂不|先不|do not|don't|won't)\s*(?:等到|等待|睡|出发|赶|离开|wait|sleep|leave|travel)/i.test(clause));
  const allowTimeSkip = clauses.some((clause) =>
    /睡到|过夜|等到|等待[^。；;]{0,12}(?:天亮|明天|次日|开船)|(?:sleep|wait) until|stay overnight|travel to/i.test(clause));
  return {
    allowTimeSkip,
    quietAction: !allowTimeSkip && /休息|歇脚|午睡|睡一觉|等一会|观景|散步|喝水|聊天|送礼|告别|不订|不去登记|暂不|先不|不做菜|rest|relax|take a nap/i.test(text),
  };
}
