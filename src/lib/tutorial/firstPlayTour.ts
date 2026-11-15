import { Step } from 'react-joyride';

// Targets the manuscript play surface (progressive disclosure, default ON):
// narrative + choices are always rendered, and the character sheet / inventory /
// story recap / choice history / journal now live behind the always-present
// "Character" and "Tools" HUD buttons. Steps 2-3 point at those entry points
// rather than the individual controls (which only mount once a panel/drawer is
// open), so the tour never anchors to an element that isn't on screen yet.
export const firstPlayTour: Step[] = [
  {
    target: '[data-tutorial="narrative-display"]',
    content: "你的故事将在这里展开。请仔细阅读叙事，它会随你的选择而变化。",
    placement: 'bottom',
    // The narrative sits directly above the decision block with no reserved
    // gap (the action rail was removed), so Joyride's default
    // placement lands the tooltip on top of the choice buttons instead of in
    // dead space below the narrative -- there isn't any. Pull it back up over
    // the narrative itself, which is what this step is describing anyway.
    offset: -140,
    data: { autoScroll: 'down' },
  },
  {
    target: '[data-tutorial="player-choices"]',
    content: "当故事停顿时，由你决定接下来发生什么。你的选择会塑造世界和你角色的命运。",
    placement: 'top',
    data: { autoScroll: 'down' },
  },
  {
    target: '[data-tutorial="session-character"]',
    content: "随时打开角色面板，查看你的属性和当前状态。",
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="session-tools"]',
    content: "你的背包、“故事回顾”摘要、选择历史以及日志都在这里。",
    placement: 'bottom',
  },
];
