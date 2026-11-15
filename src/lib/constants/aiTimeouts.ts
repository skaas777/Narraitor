/**
 * Shared AI request budgets (milliseconds), importable from both the browser
 * and API-route code. The invariant: a browser-side ceiling must be derived
 * from the server-side budget of the route it calls (server budget + headroom),
 * never sized independently — otherwise the two drift and the client ends up
 * waiting on a response the server gave up on long ago.
 */

/**
 * Server budget for a single provider attempt: makeRequest / provider client's
 * AbortController timeout and per-attempt abort signal. Personal cloud uses
 * a reasoning model, which can take longer before returning text.
 */
const isPersonalCloud = process.env.NEXT_PUBLIC_PERSONAL_CLOUD === 'true';
export const AI_ATTEMPT_TIMEOUT_MS = isPersonalCloud ? 90_000 : 30_000;

/**
 * Headroom the browser grants on top of the server budget it's waiting on:
 * transport, serverless cold start, queuing, and JSON handling. Module-local —
 * only used to derive the single-attempt ceiling below.
 */
const AI_CLIENT_HEADROOM_MS = 15_000;

/**
 * Browser ceiling for single-attempt text routes (/api/narrative/generate,
 * /api/narrative/choices). Those routes make exactly one attempt via the
 * provider request — no retries — so the client budget is one attempt plus
 * headroom, not the retry-loop worst case.
 */
export const SINGLE_ATTEMPT_TEXT_TIMEOUT_MS =
  AI_ATTEMPT_TIMEOUT_MS + AI_CLIENT_HEADROOM_MS;

/**
 * Browser ceiling for routes that run GeminiClient's retry loop server-side
 * (3 attempts plus exponential backoff) or image generation. Includes the
 * longer personal cloud attempt budget. Also aiFetch's default when no
 * tighter budget is given.
 */
export const RETRYING_ROUTE_TIMEOUT_MS = isPersonalCloud ? 300_000 : 120_000;
