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
  // Keep fallback actions executable in every genre and scene. Genre-specific
  // props are unknown when generation fails, so they create impossible choices.
  options.push(
    { id: generateUniqueId('option'), text: "观察周围，寻找线索", alignment: 'neutral', hint: "先确认眼前的环境和可用信息" },
    { id: generateUniqueId('option'), text: "核对已知线索与当前目标", alignment: 'lawful', hint: "整理已有信息，明确下一步方向" },
    { id: generateUniqueId('option'), text: "暂缓行动，观察变化", alignment: 'chaotic', hint: "等待局势变化后再决定行动" }
  );

  return {
    id: generateUniqueId('decision'),
    prompt,
    options,
    decisionWeight: 'minor',
    contextSummary: createFallbackContextSummary(narrativeContext),
  };
};
