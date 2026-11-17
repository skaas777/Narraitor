import { RateLimiter } from '../rateLimiter';

// Explicit limits rather than the constructor's environment-aware defaults, so
// these cases don't change meaning when NODE_ENV does.
const MAX_REQUESTS = 3;
const WINDOW_MS = 60 * 1000;

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    limiter = new RateLimiter(MAX_REQUESTS, WINDOW_MS);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('supports a long production game while still enforcing its hourly cap', () => {
    jest.replaceProperty(process, 'env', { ...process.env, NODE_ENV: 'production' });
    const productionLimiter = new RateLimiter();
    // Budget for fifty turns with ten supporting AI calls per turn.
    for (let i = 0; i < 500; i++) {
      expect(productionLimiter.checkLimit('player').allowed).toBe(true);
    }
    for (let i = 500; i < productionLimiter.maxRequests; i++) {
      productionLimiter.checkLimit('player');
    }
    expect(productionLimiter.checkLimit('player').allowed).toBe(false);
    jest.advanceTimersByTime(60 * 60 * 1000 + 1);
    expect(productionLimiter.checkLimit('player').allowed).toBe(true);
  });

  it('allows requests up to the limit and denies the next one', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(limiter.checkLimit('1.2.3.4').allowed).toBe(true);
    }

    const denied = limiter.checkLimit('1.2.3.4');
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
  });

  it('starts a fresh window once the old one expires', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      limiter.checkLimit('1.2.3.4');
    }
    expect(limiter.checkLimit('1.2.3.4').allowed).toBe(false);

    jest.advanceTimersByTime(WINDOW_MS + 1);

    expect(limiter.checkLimit('1.2.3.4').allowed).toBe(true);
  });

  it('clears an identifier on reset', () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      limiter.checkLimit('1.2.3.4');
    }
    expect(limiter.checkLimit('1.2.3.4').allowed).toBe(false);

    limiter.reset('1.2.3.4');

    expect(limiter.checkLimit('1.2.3.4').allowed).toBe(true);
  });
});
