/**
 * Tests for AI-specific user-friendly error handling
 */

import { getUserFriendlyError, userFriendlyError } from '../userFriendlyErrors';
import { ErrorType } from '@/lib/utils/errorUtils';

describe('userFriendlyErrors (AI-specific)', () => {
  describe('getUserFriendlyError', () => {
    it('should provide AI-specific context with sanitized error for network errors', () => {
      const error = new Error('network connection failed');
      const result = getUserFriendlyError(error);

      expect(result.message).toContain('模型服务');
      expect(result.message).toContain('操作未能完成，请稍后重试。');
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.retryable).toBe(true);
    });

    it('should provide AI-specific context with sanitized error for timeout errors', () => {
      const error = new Error('request timeout');
      const result = getUserFriendlyError(error);

      expect(result.message).toContain('模型服务');
      expect(result.message).toContain('超时');
      expect(result.message).toContain('操作未能完成，请稍后重试。');
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.retryable).toBe(true);
    });

    it('should provide AI-specific context with sanitized error for rate limit errors', () => {
      const error = new Error('429 rate limit');
      const result = getUserFriendlyError(error);

      expect(result.message).toContain('请求频率');
      expect(result.message).toContain('操作未能完成，请稍后重试。');
      expect(result.type).toBe(ErrorType.SERVICE);
      expect(result.retryable).toBe(true);
    });

    it('should provide AI-specific context with sanitized error for auth errors', () => {
      const error = new Error('401 unauthorized');
      const result = getUserFriendlyError(error);

      expect(result.message).toContain('拒绝了你的密钥');
      expect(result.message).toContain('操作未能完成，请稍后重试。');
      expect(result.type).toBe(ErrorType.AUTH);
      expect(result.retryable).toBe(false);
    });

    it('should sanitize file paths from error messages', () => {
      const error = new Error('network error at /usr/local/lib/node_modules/package.js');
      const result = getUserFriendlyError(error);

      expect(result.message).not.toContain('/usr/local');
      expect(result.message).toContain('操作未能完成，请稍后重试。');
    });

    it('should truncate very long error messages', () => {
      const longError = 'A'.repeat(300);
      const error = new Error(`network error: ${longError}`);

      const result = getUserFriendlyError(error);

      expect(result.message.length).toBeLessThan(250); // Base message + truncated detail
      expect(result.message).not.toContain(longError);
    });

    it('should handle rate limit text variations with sanitization', () => {
      const error = new Error('rate limit exceeded');
      const result = getUserFriendlyError(error);

      expect(result.message).toContain('请求频率');
      expect(result.message).toContain('操作未能完成，请稍后重试。');
      expect(result.retryable).toBe(true);
    });

    it('should fall back to base error handler for unknown errors', () => {
      const error = new Error('unexpected error');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("出错了");
      expect(result.type).toBe(ErrorType.UNKNOWN);
    });

    it('should preserve error structure from base handler', () => {
      const error = new Error('validation failed');
      const result = getUserFriendlyError(error);

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('retryable');
      expect(result).toHaveProperty('type');
    });
  });

  describe('userFriendlyError', () => {
    it('should return just the message string for network errors', () => {
      const error = new Error('network failure');
      const message = userFriendlyError(error);

      expect(typeof message).toBe('string');
      expect(message).toContain('模型服务');
      expect(message).toContain('操作未能完成，请稍后重试。');
    });

    it('should return just the message string for timeout errors', () => {
      const error = new Error('timeout occurred');
      const message = userFriendlyError(error);

      expect(typeof message).toBe('string');
      expect(message).toContain('超时');
      expect(message).toContain('操作未能完成，请稍后重试。');
    });

    it('should return just the message string for rate limit errors', () => {
      const error = new Error('429 rate limit');
      const message = userFriendlyError(error);

      expect(typeof message).toBe('string');
      expect(message).toContain('请求频率');
      expect(message).toContain('操作未能完成，请稍后重试。');
    });

    it('should return just the message string for auth errors', () => {
      const error = new Error('401 unauthorized');
      const message = userFriendlyError(error);

      expect(typeof message).toBe('string');
      expect(message).toContain('拒绝了你的密钥');
      expect(message).toContain('操作未能完成，请稍后重试。');
    });

    it('should return just the message string for unknown errors', () => {
      const error = new Error('something went wrong');
      const message = userFriendlyError(error);

      expect(typeof message).toBe('string');
      expect(message).toContain('操作未成功');
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
