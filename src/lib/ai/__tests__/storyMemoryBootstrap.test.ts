import { bootstrapStoryMemory } from '../storyMemoryBootstrap';
import type { AIClient } from '../types';
import type { NarrativeSegment } from '@/types/narrative.types';

describe('legacy story memory bootstrap', () => {
  it('reads the whole 58-turn archive in order and extracts canon without a story continuation', async () => {
    const history: NarrativeSegment[] = Array.from({ length: 58 }, (_, index) => ({
      id: `scene-${index}`, type: 'scene', timestamp: new Date('2026-11-16T00:00:00Z'),
      createdAt: '2026-11-16T00:00:00Z', updatedAt: '2026-11-16T00:00:00Z',
      content: `第${index + 1}次现场记录`, metadata: { tags: [] },
    }));
    const client = { generateContent: jest.fn().mockResolvedValue({ content: JSON.stringify({
      facts: [{ key: '母亲', value: '沈秋的下落仍未查明' }], completedSteps: [{ key: '核炉号', value: '已交六枚铜板核对' }],
    }) }) } as unknown as AIClient;
    const memory = await bootstrapStoryMemory(client, history, []);
    const [prompt, options] = jest.mocked(client.generateContent).mock.calls[0];
    expect(prompt).toContain('[1] 第1次现场记录');
    expect(prompt).toContain('[58] 第58次现场记录');
    expect(prompt).toContain('Do NOT continue the story');
    expect(options?.maxTokens).toBe(4096);
    expect(memory?.completedSteps?.[0].value).toBe('已交六枚铜板核对');
  });
});
