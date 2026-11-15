import { Step } from 'react-joyride';

import { WorldCreationStartTooltip } from '@/components/TutorialProvider/WorldCreationStartTooltip';
import { TutorialContent } from '@/components/TutorialProvider/TutorialContent';

export const worldCreationTour: Step[] = [
  {
    target: '[data-tutorial="world-name"]',
    content: TutorialContent({
      children: "在这里为你的世界命名，让它显得与众不同。",
      example: "“破碎国度”能营造出分崩离析的奇幻王国氛围",
    }),
    placement: 'right',
    disableBeacon: true,
    hideBackButton: true,
  },
  {
    target: '[data-tutorial="genre-picker"]',
    content: TutorialContent({
      children: "在这里选择题材，以确定叙事风格和可用选项。",
      example: "赛博朋克，适合霓虹闪烁、黑客与巨型企业并存的反乌托邦",
    }),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tutorial="world-type"]',
    content: TutorialContent({
      children: "在这里选择你的世界是原创、受启发创作，还是置于已有设定之中。",
      example: "选择“受启发”，在你喜爱的宇宙上做出自己的演绎",
    }),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tutorial="world-reference"]',
    content: TutorialContent({
      children: "在这里输入你的世界要沿用的背景设定。",
      example: "“Star Wars 旧共和国时期”可锁定那个特定时代",
    }),
    placement: 'top',
    disableBeacon: true,
    data: { skipIfMissing: true },
  },
  {
    target: '[data-tutorial="tone-content-rating"]',
    content: TutorialContent({
      children: "在这里设置内容分级，以匹配你的受众。",
      example: "PG-13：适合适度主题与动作内容，不含露骨内容",
    }),
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
    data: { autoScroll: true },
  },
  {
    target: '[data-tutorial="tone-narrative-style"]',
    content: TutorialContent({
      children: "在这里选择适合你世界的叙事风格。",
      example: "史诗，适合具有英雄主题的宏大故事",
    }),
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
  },
  {
    target: '[data-tutorial="tone-language-complexity"]',
    content: TutorialContent({
      children: "此设置会调整语言复杂度，以匹配你的阅读偏好。",
      example: "文学，适合富有艺术表达的精妙文笔",
    }),
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
  },
  {
    target: '[data-tutorial="tone-custom-instructions"]',
    content: TutorialContent({
      children: "你可以补充故事讲述方式的额外指引。",
      example: "“强调道德困境”能让选择更有分量",
    }),
    placement: 'top',
    tooltipComponent: WorldCreationStartTooltip,
    disableBeacon: true,
    disableScrolling: true,
    data: { isEndOfPage: true },
  },
  {
    target: '[data-tutorial="world-description"]',
    content: TutorialContent({
      children: "在这里详细描述你的世界。系统将据此生成丰富的设定、地点和历史。",
      example: "“一个战火纷飞、魔法逐渐消退的王国”能奠定冲突与风险",
    }),
    placement: 'top',
    disableBeacon: true,
    hideBackButton: true,
  },
  {
    target: '[data-tutorial="ai-suggestions-actions"]',
    content: TutorialContent({
      children: "你可以点击“生成”，根据描述获取推荐的属性与技能。",
      example: "赛博朋克世界可能会推荐“黑客”与“街头声望”",
    }),
    placement: 'top',
    offset: 12,
    spotlightPadding: 8,
    disableBeacon: true,
  },
  {
    target: '[data-tutorial="ai-suggestions-preview"]',
    content: "先预览推荐内容，再详细审阅。你可以在后续步骤中接受、修改或拒绝每一项。",
    placement: 'top',
    tooltipComponent: WorldCreationStartTooltip,
    disableBeacon: true,
    disableScrolling: true,
    data: { isEndOfPage: true },
  },
  {
    target: '[data-tutorial="attribute-editor"]',
    content: TutorialContent({
      children: "在这里审阅并自定义塑造角色的核心属性。",
      example: "“意志力”可代表恐怖设定中的精神韧性",
    }),
    placement: 'top',
    disableBeacon: true,
    hideBackButton: true,
  },
  {
    target: '[data-tutorial="attribute-suggestions"]',
    content: TutorialContent({
      children: "你可以使用推荐的属性，也可以自行自定义。",
      example: "将“力量”重命名为“威能”，更有奇幻感",
    }),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tutorial="attribute-custom"]',
    content: TutorialContent({
      children: "此部分可让你添加专属于该设定的自定义属性。",
      example: "“腐化”可追踪黑暗魔法在你世界中的影响",
    }),
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
    data: { autoScroll: 'down' },
  },
  {
    target: '[data-tutorial="attribute-summary"]',
    content: "留意剩余属性槽位。大多数世界使用 4-6 个核心属性效果最佳。",
    placement: 'top',
    tooltipComponent: WorldCreationStartTooltip,
    disableBeacon: true,
    disableScrolling: true,
    data: { isEndOfPage: true },
  },
  {
    target: '[data-tutorial="skill-editor"]',
    content: TutorialContent({
      children: "在这里定义角色可以学习的技能。",
      example: "“说服”适用于社交遭遇和谈判",
    }),
    placement: 'top',
    disableBeacon: true,
    hideBackButton: true,
  },
  {
    target: '[data-tutorial="skill-suggestions"]',
    content: TutorialContent({
      children: "你可以审阅推荐的技能并进行微调。",
      example: "将“近战战斗”重命名为“刃舞”，营造独特风格",
    }),
    placement: 'bottom',
    offset: 12,
    disableBeacon: true,
  },
  {
    target: '[data-tutorial="skill-custom"]',
    content: TutorialContent({
      children: "此部分可让你为世界创建自定义技能。",
      example: "“骑龙”可让你的奇幻世界展开空中冒险",
    }),
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
    data: { autoScroll: 'down' },
  },
  {
    target: '[data-tutorial="skill-summary"]',
    content: "留意已选技能数量。建议控制在 8-12 个，让角色拥有有意义的选择，又不会选项过多。",
    placement: 'top',
    tooltipComponent: WorldCreationStartTooltip,
    disableBeacon: true,
    disableScrolling: true,
    data: { isEndOfPage: true },
  },
  {
    target: '[data-tutorial="finalize-review"]',
    content: "在最终确认前，审阅核心世界详情。",
    placement: 'top',
    disableBeacon: true,
    hideBackButton: true,
  },
  {
    target: '[data-tutorial="finalize-image"]',
    content: "你可以根据描述和题材生成世界图像，将设定可视化。",
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tutorial="finalize-attributes"]',
    content: "在这里复核已选属性。你仍可返回进行更改。",
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
  },
  {
    target: '[data-tutorial="finalize-skills"]',
    content: "在这里可以在创建世界前确认技能列表。你仍可返回进行更改。",
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
    data: { autoScroll: 'down' },
  },
  {
    target: '[data-tutorial="finalize-world"]',
    content: "在这里，你可以查看世界详情并创建它！距离你的冒险只差一步。",
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
  },
];

export const tourStepToWizardStep: Record<number, number> = {
  // Basic Information (step 0)
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  // World Description (step 1)
  8: 1,
  9: 1,
  10: 1,
  // Review Attributes (step 2)
  11: 2,
  12: 2,
  13: 2,
  14: 2,
  // Review Skills (step 3)
  15: 3,
  16: 3,
  17: 3,
  18: 3,
  // Finalize (step 4)
  19: 4,
  20: 4,
  21: 4,
  22: 4,
  23: 4,
};
