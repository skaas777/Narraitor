import { generateUniqueId } from '@/lib/utils/generateId';
import type { Decision, NarrativeContext, DecisionOption } from '@/types/narrative.types';
import type { World } from '@/types/world.types';
import { createFallbackContextSummary } from './choiceGenerator.parser';

export const generateFallbackChoices = (
  world: World,
  narrativeContext: NarrativeContext
): Decision => {
  const location = narrativeContext?.currentLocation || '这里';
  const prompt = `在${location}，你打算怎么做？`;
  const options: DecisionOption[] = [];
  const genre = (world?.genre || 'fantasy').toLowerCase();

  // Each genre branch contributes exactly three options, matching what the
  // generator asks the model for. A conditional fourth used to ride along here
  // and get silently dropped downstream.
  switch (genre) {
    case 'fantasy':
      options.push(
        {
          id: generateUniqueId('option'),
          text: "搜索线索",
          alignment: 'neutral',
          hint: "仔细观察，寻找重要细节",
        },
        {
          id: generateUniqueId('option'),
          text: "与附近的角色交谈",
          alignment: 'lawful',
          hint: "通过交谈收集信息",
          requirements: [
            {
              type: 'skill',
              targetId: 'persuasion',
              operator: 'gte',
              value: 3,
            },
          ],
        },
        {
          id: generateUniqueId('option'),
          text: "施放法术照亮该区域",
          alignment: 'neutral',
          hint: "用魔法揭示隐藏之物",
          requirements: [
            {
              type: 'skill',
              targetId: 'magic',
              operator: 'gte',
              value: 4,
            },
          ],
        }
      );
      break;
    case 'sci-fi':
    case 'science fiction':
      options.push(
        { id: generateUniqueId('option'), text: "扫描区域", alignment: 'neutral' },
        { id: generateUniqueId('option'), text: "访问终端", alignment: 'lawful' },
        {
          id: generateUniqueId('option'),
          text: "强行打开气闸，排空走廊",
          alignment: 'chaotic',
        }
      );
      break;
    case 'horror':
      options.push(
        { id: generateUniqueId('option'), text: "躲藏", alignment: 'neutral' },
        { id: generateUniqueId('option'), text: "呼救", alignment: 'lawful' },
        {
          id: generateUniqueId('option'),
          text: "放火烧房，冲向门口",
          alignment: 'chaotic',
        }
      );
      break;
    default:
      options.push(
        { id: generateUniqueId('option'), text: "环顾四周", alignment: 'neutral' },
        { id: generateUniqueId('option'), text: "找人交谈", alignment: 'lawful' },
        {
          id: generateUniqueId('option'),
          text: "掀翻桌子，抢占上风",
          alignment: 'chaotic',
        }
      );
  }

  return {
    id: generateUniqueId('decision'),
    prompt,
    options,
    decisionWeight: 'minor',
    contextSummary: createFallbackContextSummary(narrativeContext),
  };
};
