/**
 * Tests for narrative-styled error copy (Issue #201)
 */

import { getNarrativeError, PARTIAL_RECONCILIATION_ERROR } from '../narrativeErrors';

// Jargon that must never reach the player in narrative copy.
const JARGON = [/\bAI\b/, /network/i, /\b429\b/, /timeout/i, /\bAPI\b/, /unauthorized/i, /HTTP/i];

function assertNoJargon(text: string) {
  for (const pattern of JARGON) {
    expect(text).not.toMatch(pattern);
  }
}

describe('getNarrativeError', () => {
  it('frames network errors as a story pause and offers a narrative recovery', () => {
    const result = getNarrativeError(new Error('network connection failed'));
    expect(result.title).toBe("故事暂停了");
    expect(result.retryLabel).toBe("继续故事");
    expect(result.retryable).toBe(true);
    assertNoJargon(result.title);
    assertNoJargon(result.message);
    assertNoJargon(result.suggestion ?? '');
  });

  it('lets the player continue after a stream abort', () => {
    const abort = new Error('BodyStreamBuffer was aborted');
    abort.name = 'AbortError';

    const result = getNarrativeError(abort);
    expect(result.title).toBe("故事暂停了");
    expect(result.retryable).toBe(true);
  });

  it('frames rate-limit/service errors as the story needing a moment', () => {
    const result = getNarrativeError(new Error('429 too many requests'));
    expect(result.title).toBe("故事需要稍等片刻");
    expect(result.retryable).toBe(true);
    assertNoJargon(result.message);
    assertNoJargon(result.suggestion ?? '');
  });

  it('treats auth errors as non-retryable, critical, and points to settings without jargon', () => {
    const result = getNarrativeError(new Error('401 unauthorized'));
    expect(result.retryable).toBe(false);
    expect(result.severity).toBe('critical');
    expect(result.suggestion).toMatch(/设置/);
    assertNoJargon(result.message);
    assertNoJargon(result.suggestion ?? '');
  });

  it('frames validation errors as something that did not fit the story and marks them retryable', () => {
    const result = getNarrativeError(new Error('invalid input data'));
    expect(result.title).toBe("这与故事不符");
    expect(result.retryable).toBe(true);
    assertNoJargon(result.message);
    assertNoJargon(result.suggestion ?? '');
  });

  it('gives unknown errors a gentle narrative fallback with retry', () => {
    const result = getNarrativeError(new Error('something exploded internally'));
    expect(result.title).toBe("故事出了岔子");
    expect(result.retryLabel).toBe("继续故事");
    expect(result.retryable).toBe(true);
    assertNoJargon(result.message);
    assertNoJargon(result.suggestion ?? '');
  });

  it('marks malformed API response errors as retryable (#2169)', () => {
    const result = getNarrativeError(new Error('Service error: malformed API response'));
    expect(result.retryable).toBe(true);
    expect(result.retryLabel).toBe("继续故事");
    assertNoJargon(result.title);
    assertNoJargon(result.message);
    assertNoJargon(result.suggestion ?? '');
  });

  it('marks plain 500 and 503 errors as retryable (#2169)', () => {
    const error500 = getNarrativeError(new Error('500 Internal Server Error'));
    expect(error500.retryable).toBe(true);
    expect(error500.retryLabel).toBe("继续故事");
    assertNoJargon(error500.message);

    const error503 = getNarrativeError('503 Service Unavailable');
    expect(error503.retryable).toBe(true);
    expect(error503.retryLabel).toBe("继续故事");
    assertNoJargon(error503.message);
  });

  it('leaves PARTIAL_RECONCILIATION_ERROR non-retryable (#2169)', () => {
    expect(PARTIAL_RECONCILIATION_ERROR.retryable).toBe(false);
  });

  it('accepts a raw string and still returns clean narrative copy', () => {
    const result = getNarrativeError('network unreachable');
    expect(result.title).toBe("故事暂停了");
    assertNoJargon(result.message);
  });
});
