import { SINGLE_ATTEMPT_TEXT_TIMEOUT_MS } from './aiTimeouts';

/**
 * Centralized AI-generation and loading-safety timeouts (milliseconds).
 */

/**
 * A narrative turn may make several sequential provider calls (prose,
 * continuity checks, and repairs). Personal cloud reasoning models need a
 * turn budget larger than the ceiling for one provider request.
 */
export const AI_GENERATION_TIMEOUT_MS =
  process.env.NEXT_PUBLIC_PERSONAL_CLOUD === 'true'
    ? 300_000
    : SINGLE_ATTEMPT_TEXT_TIMEOUT_MS;

/** Safety timeout to auto-clear a stuck navigation loading state. */
export const NAV_SAFETY_TIMEOUT_MS = 30000;
