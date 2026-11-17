import { getPlayerPacing } from '../playerPacing';
import { worldClockBlock } from '@/lib/promptTemplates/templates/narrative/worldClockBlock';

it.each(['喝水歇脚，暂不订票。', '午睡半个时辰后醒来。', '我不做菜，独自去观景。', '我不要睡到明天，只休息一会。'])('does not authorize a deadline time cut for %s', (action) => {
  expect(getPlayerPacing(action)).toEqual({ quietAction: true, allowTimeSkip: false });
});
it.each(['在车里睡到明天清晨。', 'Wait until morning', '等到开船再出发。'])('allows requested passage of time: %s', (action) => {
  expect(getPlayerPacing(action).allowTimeSkip).toBe(true);
});
it('suppresses booking pressure during quiet actions and never equates turn count with elapsed time', () => {
  const block = worldClockBlock({ currentTurn: 20, turnsSinceWorldMoved: 3, quietAction: true, allowTimeSkip: false,
    threads: [{ summary: '船票即将售罄', kind: 'deadline', ageTurns: 19, overdue: true, overdueByTurns: 5, dueNow: true, fired: false, strikes: 0 }] });
  expect(block).toContain('BACKGROUND CONTEXT ONLY');
  expect(block).not.toContain('In THIS segment it lands');
  expect(block).not.toContain('time may jump FORWARD');
});
