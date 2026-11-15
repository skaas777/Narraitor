/**
 * Tests for error utility functions
 */

import {
  ErrorType,
  isRetryableError,
  getUserFriendlyError,
  formatPlainLanguageError,
  createStoreError
} from '../errorUtils';

// A stream abort arrives as a DOM AbortError. Its message carries none of the
// words the message patterns look for, so name is the only usable signal.
function streamAbortError(): Error {
  const error = new Error('BodyStreamBuffer was aborted');
  error.name = 'AbortError';
  return error;
}

// AbortSignal.timeout raises a TimeoutError whose message carries both "aborted"
// and "timeout", so it is the case that tells the two branches apart.
function signalTimeoutError(): Error {
  const error = new Error('The operation was aborted due to timeout');
  error.name = 'TimeoutError';
  return error;
}

describe('errorUtils', () => {
  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      const error = new Error('network connection failed');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const error = new Error('request timeout exceeded');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for 429 rate limit errors', () => {
      const error = new Error('429 too many requests');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for rate limit errors', () => {
      const error = new Error('rate limit exceeded');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for a stream abort', () => {
      expect(isRetryableError(streamAbortError())).toBe(true);
    });

    it('should return false for auth errors', () => {
      const error = new Error('401 unauthorized');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for missing API key errors', () => {
      expect(isRetryableError(new Error('API key not configured'))).toBe(false);
      expect(isRetryableError(new Error('412 Precondition Failed'))).toBe(false);
    });

    it('should return false for validation errors', () => {
      const error = new Error('invalid input data');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for generic errors', () => {
      const error = new Error('something went wrong');
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('getUserFriendlyError', () => {
    it('should map network errors with generic message', () => {
      const error = new Error('network connection failed');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("连接问题");
      expect(result.message).toBe("无法连接，请检查你的网络连接。");
      expect(result.retryable).toBe(true);
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.actionLabel).toBe("重试");
    });

    it('should map timeout errors with generic message', () => {
      const error = new Error('request timeout');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("请求超时");
      expect(result.message).toBe("请求耗时过长，请重试。");
      expect(result.retryable).toBe(true);
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.actionLabel).toBe("重试");
    });

    it('should map a stream abort to the network branch', () => {
      const result = getUserFriendlyError(streamAbortError());

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.retryable).toBe(true);
      expect(result.actionLabel).toBe("重试");
    });

    it('should keep a signal timeout on the timeout branch', () => {
      const result = getUserFriendlyError(signalTimeoutError());

      expect(result.title).toBe("请求超时");
      expect(result.severity).toBe('warning');
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.retryable).toBe(true);
    });

    it('should map 429 rate limit errors with generic message', () => {
      const error = new Error('429 rate limit exceeded');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("请求过多");
      expect(result.message).toBe("请求过多。请稍等片刻后重试。");
      expect(result.retryable).toBe(true);
      expect(result.type).toBe(ErrorType.SERVICE);
      expect(result.actionLabel).toBe("稍后重试");
    });

    it('should map rate limit text errors with generic message', () => {
      const error = new Error('rate limit exceeded');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("请求过多");
      expect(result.message).toBe("请求过多。请稍等片刻后重试。");
      expect(result.retryable).toBe(true);
      expect(result.type).toBe(ErrorType.SERVICE);
    });

    it('should map 401 auth errors with generic message', () => {
      const error = new Error('401 unauthorized');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("身份验证错误");
      expect(result.message).toBe("身份验证失败。请检查你的凭据。");
      expect(result.retryable).toBe(false);
      expect(result.type).toBe(ErrorType.AUTH);
    });

    it('should map unauthorized text errors with generic message', () => {
      const error = new Error('unauthorized access');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("身份验证错误");
      expect(result.message).toBe("身份验证失败。请检查你的凭据。");
      expect(result.retryable).toBe(false);
      expect(result.type).toBe(ErrorType.AUTH);
    });

    it('should map missing API key errors to provider setup guidance', () => {
      const cases = [
        new Error('API key not configured'),
        new Error('412 Precondition Failed: API key not configured'),
        new Error('no api key configured for this provider'),
      ];

      for (const error of cases) {
        const result = getUserFriendlyError(error);
        expect(result.title).toBe("需要 API 密钥");
        expect(result.message).toBe("此模型服务未配置 API 密钥。");
        expect(result.suggestion).toBe("请在设置 > 模型服务设置中添加 API 密钥以开始游戏。");
        expect(result.retryable).toBe(false);
        expect(result.type).toBe(ErrorType.AUTH);
        expect(result.severity).toBe('critical');
      }
    });

    it('should map validation errors with generic message', () => {
      const error = new Error('validation failed: invalid email');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("检查输入");
      expect(result.message).toBe("你输入的部分内容似乎不正确。");
      expect(result.retryable).toBe(false);
      expect(result.type).toBe(ErrorType.VALIDATION);
    });

    it('should map 400 bad request errors with generic message', () => {
      const error = new Error('400 bad request');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("检查输入");
      expect(result.message).toBe("你输入的部分内容似乎不正确。");
      expect(result.retryable).toBe(false);
      expect(result.type).toBe(ErrorType.VALIDATION);
    });

    it('should map invalid errors with generic message', () => {
      const error = new Error('invalid data format');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("检查输入");
      expect(result.message).toBe("你输入的部分内容似乎不正确。");
      expect(result.retryable).toBe(false);
      expect(result.type).toBe(ErrorType.VALIDATION);
    });

    it('should map malformed errors with generic message', () => {
      const error = new Error('malformed request');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("检查输入");
      expect(result.message).toBe("你输入的部分内容似乎不正确。");
      expect(result.retryable).toBe(false);
      expect(result.type).toBe(ErrorType.VALIDATION);
    });

    it('should map unknown errors with generic message', () => {
      const error = new Error('something unexpected happened');
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("出错了");
      expect(result.message).toBe("操作未成功。");
      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.actionLabel).toBe("重试");
    });

    it('should not expose raw error details in generic handler', () => {
      const error = new Error('/secret/path/file.ts: Database connection failed with internal error');
      const result = getUserFriendlyError(error);

      // Should not contain sensitive details
      expect(result.message).not.toContain('/secret/path');
      expect(result.message).not.toContain('Database');
      expect(result.message).not.toContain('internal error');
    });

    it('should determine retryability for unknown errors', () => {
      const retryableError = new Error('network issue occurred');
      const nonRetryableError = new Error('generic failure');

      expect(getUserFriendlyError(retryableError).retryable).toBe(true);
      expect(getUserFriendlyError(nonRetryableError).retryable).toBe(false);
    });
  });

  describe('getUserFriendlyError severity and suggestions', () => {
    it('should classify auth failures as critical', () => {
      const result = getUserFriendlyError(new Error('401 unauthorized'));
      expect(result.severity).toBe('critical');
      expect(result.suggestion).toBeTruthy();
    });

    it('should classify network errors as error severity', () => {
      const result = getUserFriendlyError(new Error('network connection failed'));
      expect(result.severity).toBe('error');
    });

    it('should classify timeout, rate-limit and validation as warning', () => {
      expect(getUserFriendlyError(new Error('request timeout')).severity).toBe('warning');
      expect(getUserFriendlyError(new Error('429 rate limit')).severity).toBe('warning');
      expect(getUserFriendlyError(new Error('invalid input')).severity).toBe('warning');
    });

    it('should default unknown errors to error severity', () => {
      expect(getUserFriendlyError(new Error('boom')).severity).toBe('error');
    });

    it('should include a plain-language suggestion for every mapped type', () => {
      const cases = [
        'network down',
        'request timeout',
        '429 rate limit',
        '401 unauthorized',
        'api key not configured',
        'invalid input',
        'totally unexpected',
      ];

      for (const message of cases) {
        const result = getUserFriendlyError(new Error(message));
        expect(typeof result.suggestion).toBe('string');
        expect(result.suggestion!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('createStoreError', () => {
    it('should create error with default values', () => {
      const error = createStoreError('Not Found', 'The item could not be found');

      expect(error.title).toBe('Not Found');
      expect(error.message).toBe('The item could not be found');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.retryable).toBe(false);
      expect(error.severity).toBe('error');
    });

    it('should accept custom severity and suggestion', () => {
      const error = createStoreError(
        'Heads Up',
        'A minor issue occurred',
        ErrorType.VALIDATION,
        false,
        { severity: 'warning', suggestion: 'Double-check your input.' }
      );

      expect(error.severity).toBe('warning');
      expect(error.suggestion).toBe('Double-check your input.');
    });

    it('should create error with custom type', () => {
      const error = createStoreError(
        'Service Error',
        'The service is unavailable',
        ErrorType.SERVICE,
        true
      );

      expect(error.title).toBe('Service Error');
      expect(error.message).toBe('The service is unavailable');
      expect(error.type).toBe(ErrorType.SERVICE);
      expect(error.retryable).toBe(true);
    });

    it('should create error with network type', () => {
      const error = createStoreError(
        'Connection Failed',
        'Could not connect to server',
        ErrorType.NETWORK,
        true
      );

      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.retryable).toBe(true);
    });
  });

  describe('formatPlainLanguageError', () => {
    it('formats Payload too large into plain language with actionable next step', () => {
      const formatted = formatPlainLanguageError(new Error('Payload too large'));
      expect(formatted).toBe(
        "输入内容过大，无法生成此内容。 请缩短外貌描述或提示词后重试。"
      );
    });

    it('formats rate limit into plain language with actionable next step', () => {
      const formatted = formatPlainLanguageError(new Error('429 rate limit exceeded'));
      expect(formatted).toContain("请求过多");
      expect(formatted).toContain("请等待约一分钟后再试");
    });

    it('formats missing API key error into plain language with setup guidance', () => {
      const formatted = formatPlainLanguageError(new Error('API key not configured'));
      expect(formatted).toContain("此模型服务未配置 API 密钥");
      expect(formatted).toContain('请在设置 > 模型服务设置中添加 API 密钥以开始游戏');
    });

    it('formats generic error into plain language message and suggestion', () => {
      const formatted = formatPlainLanguageError(new Error('Unknown server crash'));
      expect(formatted).toContain("操作未成功");
      expect(formatted).toContain('请尝试重新加载页面');
    });
  });

  // Note: createAPIErrorResponse now lives in its own module (it needs a
  // transport, and errorUtils stays a pure leaf) — see its colocated test.
});
