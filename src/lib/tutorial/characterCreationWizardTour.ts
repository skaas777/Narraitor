import { Step } from 'react-joyride';
import { TutorialContent } from '@/components/TutorialProvider/TutorialContent';

export const characterCreationWizardTour: Step[] = [
  {
    target: '[data-tutorial="basic-info"]',
    content: TutorialContent({
      children: "在这里为你的角色命名并添加描述。",
      example: "“Kira Nightshade”，并附上类似“一个有着神秘过往的狡黠盗贼”的背景提示",
    }),
    placement: 'bottom',
    disableBeacon: true,
    disableScrolling: true,
  },
  {
    target: '[data-tutorial="attribute-allocation"]',
    content: TutorialContent({
      children: "在这里，你可以把点数分配到核心属性上，这些属性决定了角色天生的强项与弱点。",
      example: "为依赖体力的战士分配高力量",
    }),
    placement: 'bottom',
    disableBeacon: true,
    disableScrolling: true,
  },
  {
    target: '[data-tutorial="skill-selection"]',
    content: TutorialContent({
      children: "在这里，你可以选择能体现角色专长的技能。",
      example: "为偏好避免正面冲突的角色选择潜行",
    }),
    placement: 'bottom',
    disableBeacon: true,
    disableScrolling: true,
  },
  {
    target: '[data-tutorial="background-editor"]',
    content: TutorialContent({
      children: "这一部分用于充实你的背景故事。你来自哪里？你的动机是什么？",
      example: "“战争期间成为孤儿”，以此解释他们对权威的不信任",
    }),
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
  },
  {
    target: '[data-tutorial="portrait-generator-action"]',
    content: "你可以根据角色描述生成独特的肖像，也可以上传自己的图片。",
    placement: 'top',
    disableBeacon: true,
    disableScrolling: true,
  },
];

export const tourStepToWizardStep: Record<number, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
};
