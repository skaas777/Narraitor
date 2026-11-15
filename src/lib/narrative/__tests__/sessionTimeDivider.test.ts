import { getSessionTimeDividerLabel } from '../sessionTimeDivider';
import type { NarrativeSegment } from '@/types/narrative.types';

function makeSegment(timestamp: Date): NarrativeSegment {
  return {
    id: 'segment-id',
    content: 'content',
    type: 'scene',
    metadata: { tags: [] },
    timestamp,
    createdAt: timestamp.toISOString(),
    updatedAt: timestamp.toISOString(),
  };
}

const BASE = new Date('2026-08-09T12:00:00Z');
const minutesLater = (n: number) => new Date(BASE.getTime() + n * 60_000);
const hoursLater = (n: number) => new Date(BASE.getTime() + n * 60 * 60_000);
const daysLater = (n: number) => new Date(BASE.getTime() + n * 24 * 60 * 60_000);

describe('getSessionTimeDividerLabel', () => {
  it('labels the first segment as the beginning of the session', () => {
    expect(getSessionTimeDividerLabel(makeSegment(BASE), null)).toBe("冒险记录开始");
  });

  it('labels a sub-minute gap as just now', () => {
    const previous = makeSegment(BASE);
    const current = makeSegment(minutesLater(0.5));
    expect(getSessionTimeDividerLabel(current, previous)).toBe("刚刚");
  });

  it('labels a multi-minute gap with a singular/plural minute bucket', () => {
    const previous = makeSegment(BASE);
    expect(getSessionTimeDividerLabel(makeSegment(minutesLater(1)), previous)).toBe("1 分钟前");
    expect(getSessionTimeDividerLabel(makeSegment(minutesLater(5)), previous)).toBe("5 分钟前");
  });

  it('labels an hour-scale gap with an hour bucket', () => {
    const previous = makeSegment(BASE);
    expect(getSessionTimeDividerLabel(makeSegment(hoursLater(1)), previous)).toBe("1 小时前");
    expect(getSessionTimeDividerLabel(makeSegment(hoursLater(3)), previous)).toBe("3 小时前");
  });

  it('labels a day-scale gap with a day bucket', () => {
    const previous = makeSegment(BASE);
    expect(getSessionTimeDividerLabel(makeSegment(daysLater(1)), previous)).toBe("1 天前");
    expect(getSessionTimeDividerLabel(makeSegment(daysLater(2)), previous)).toBe("2 天前");
  });

  it('clamps an out-of-order timestamp to just now instead of going negative', () => {
    const previous = makeSegment(minutesLater(5));
    const current = makeSegment(BASE);
    expect(getSessionTimeDividerLabel(current, previous)).toBe("刚刚");
  });

  it('handles a rehydrated segment whose timestamp came back as an ISO string', () => {
    const previous = { ...makeSegment(BASE), timestamp: BASE.toISOString() as unknown as Date };
    const current = { ...makeSegment(minutesLater(5)), timestamp: minutesLater(5).toISOString() as unknown as Date };
    expect(getSessionTimeDividerLabel(current, previous)).toBe("5 分钟前");
  });
});
