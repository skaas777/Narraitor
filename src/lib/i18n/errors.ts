import { ERROR_MESSAGES } from './errorMessages';

const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exact = new Map(ERROR_MESSAGES.filter(([text]) => !text.includes('__INTERPOLATION_')));
const patterns = ERROR_MESSAGES.filter(([text]) => text.includes('__INTERPOLATION_')).sort(([a], [b]) => b.replace(/__INTERPOLATION_\d+__/g, '').length - a.replace(/__INTERPOLATION_\d+__/g, '').length).map(([text, translated]) => ({
  pattern: new RegExp('^' + text.split(/__INTERPOLATION_\d+__/).map(escapePattern).join('([\\s\\S]*?)') + '$'),
  translated,
}));

export function localizeErrorMessage(value: unknown): string {
  const message = value instanceof Error ? value.message : typeof value === 'string' ? value : '';
  if (!message) return '';
  const translated = exact.get(message);
  if (translated !== undefined) return translated;
  for (const entry of patterns) {
    const match = message.match(entry.pattern);
    if (match) return entry.translated.replace(/__INTERPOLATION_(\d+)__/g, (_token, index: string) => match[Number(index) + 1]);
  }
  if (/[\u3400-\u9fff]/.test(message)) return message;
  return '操作未能完成，请稍后重试。';
}
