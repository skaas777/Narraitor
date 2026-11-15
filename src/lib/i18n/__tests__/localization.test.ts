import { displayLabel } from '../zhCN';
import { localizeErrorMessage } from '../errors';

it('translates stored enums only when displaying them and preserves player names', () => {
  const stored = { genre: 'sci-fi', status: 'in_progress', name: 'Cloud Harbor' };
  expect(displayLabel(stored.genre)).toBe('科幻');
  expect(displayLabel(stored.status)).toBe('进行中');
  expect(displayLabel(stored.name)).toBe('Cloud Harbor');
  expect(stored).toEqual({ genre: 'sci-fi', status: 'in_progress', name: 'Cloud Harbor' });
});

it('localizes known API errors while retaining the referenced entity', () => {
  expect(localizeErrorMessage(new Error('Character not found: char-17'))).toBe('未找到角色：char-17');
  expect(localizeErrorMessage('Failed to load ending image (502)')).toBe('加载结局图片失败（502）');
});

it('keeps Chinese errors and hides unknown English diagnostics from players', () => {
  expect(localizeErrorMessage('网络连接暂时不可用')).toBe('网络连接暂时不可用');
  expect(localizeErrorMessage('Unhandled provider diagnostic at /internal/private.js')).toBe('操作未能完成，请稍后重试。');
  expect(localizeErrorMessage(null)).toBe('');
});

it('prefers specific validation translations over generic field patterns', () => {
  expect(localizeErrorMessage('World name must be at least 3 characters')).toBe('世界名称至少需要 3 个字符');
  expect(localizeErrorMessage('Character history must be at least 50 characters')).toBe('角色经历至少需要 50 个字符');
});
