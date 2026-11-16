import type { LoreFact } from '@/types/lore.types';

/** Model-selected visibility cannot promote a playthrough into another one's canon. */
export function isLoreVisibleToSession(fact: LoreFact, sessionId?: string): boolean {
  if (fact.source === 'narrative' && fact.sessionId &&
      fact.sessionId !== sessionId && !fact.metadata?.sharedByChapter) return false;
  return fact.visibility === 'world-shared' ||
    Boolean(sessionId && fact.visibility === 'session-private' && fact.sessionId === sessionId);
}
