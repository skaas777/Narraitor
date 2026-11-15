import type { ProviderDescriptor } from '@/lib/ai/providers/types';
import type { CloudProvider } from './schema';
import { PERSONAL_CLOUD_ENABLED } from './schema';
import { isSafeProviderEndpoint } from '@/lib/ai/providers/endpointGuard';

/**
 * Personal deployment only. Vercel Authentication must protect ALL deployments,
 * including production and API routes. The project is a single private account,
 * not a multi-tenant service. Never enable this on a public deployment.
 * Credentials and routing are both server-owned: request headers cannot redirect
 * the server key to a caller-chosen URL.
 */
export function personalProvider(): ProviderDescriptor | null {
  if (!PERSONAL_CLOUD_ENABLED) return null;
  const apiKey = process.env.PERSONAL_AI_API_KEY?.trim();
  const endpoint = process.env.PERSONAL_AI_ENDPOINT?.trim();
  const model = process.env.PERSONAL_AI_MODEL?.trim();
  if (!apiKey || !endpoint || !model || !isSafeProviderEndpoint(endpoint)) return null;
  return { type: 'openai-compatible', apiKey, endpoint, model };
}

export function personalProviderInfo(): CloudProvider | null {
  const provider = personalProvider();
  return provider ? {
    name: 'AI Genesis DeepSeek', model: provider.model, endpoint: provider.endpoint,
  } : null;
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}
