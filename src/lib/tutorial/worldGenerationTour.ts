import { Step } from 'react-joyride';

export const worldGenerationTour: Step[] = [
  {
    target: '[aria-describedby="generate-world-desc"]',
    content: "这会为你生成完整的世界设定——助你快速上手。",
    placement: 'center',
  },
  {
    target: '#world-name',
    content: "你可以在这里为世界命名，也可以留空，让系统为你创造一个名字。",
    placement: 'auto',
  },
  {
    target: '[role="radiogroup"]', // Targets the WorldTypeSelector
    content: "你可以选择“原创”来打造独特设定，或使用“灵感来自”/“设定于”来借鉴现有虚构作品或历史。",
    placement: 'auto',
  },
  {
    target: '[data-tutorial="generate-world-button"]',
    content: "准备好后，这里会创建你的世界——属性、技能和封面图都会自动生成。",
    placement: 'auto',
  },
];
