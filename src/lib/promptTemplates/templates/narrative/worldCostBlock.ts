/**
 * Carry current conditions and require concrete consequences, including success.
 * Losses are recorded only when justified; repeated wounds or confiscations
 * cannot substitute for resolution. Rendered only when WORLD_COST is enabled.
 */
export const worldCostBlock = (conditions: string[]): string => {
  const carried = conditions.length > 0 ? conditions.join('; ') : '(nothing yet)';

  return `
WHAT THE WORLD CAN TAKE:
The character currently carries: ${carried}
- Those hold until the story changes them. Write the character as someone carrying them; do not heal, clear or forget one unless this passage shows it ending.
- A WORLD CLOCK thread changes the situation concretely when it lands: an answer established, a goal achieved or lost, a restriction lifted, a relationship changed, or a plausible cost. Resolution and success count as movement; loss is NOT mandatory.
- Only take an item actually held in CURRENT POSSESSION, and report it in itemsLost. Never confiscate the same evidence again or repeatedly dirty/reopen the same wound as a substitute for resolving the matter. Carry existing injuries consistently; do not manufacture a fresh injury every turn.
- A successful player action achieves its stated objective. A separate world event may create the NEXT problem, but must not cancel the success or require the same proof again.
`;
};
