import { personalProvider, isSameOrigin } from '@/lib/cloud/server';
import { PERSONAL_CLOUD_ENABLED } from '@/lib/cloud/schema';
import { getProviderAdapter } from '@/lib/ai/providers/adapterRegistry';
import { sendProviderRequest } from '@/lib/ai/providers/core/request';

export const maxDuration = 60;
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  if (!PERSONAL_CLOUD_ENABLED) return Response.json({ valid: false }, { status: 404, headers });
  if (!isSameOrigin(request)) return Response.json({ valid: false }, { status: 403, headers });
  const provider = personalProvider();
  if (!provider) return Response.json({ valid: false }, { status: 503, headers });
  try {
    const adapter = getProviderAdapter(provider.type)!;
    const spec = { prompt: 'Reply with OK.', maxTokens: 16, temperature: 0, contentRating: null, stream: false };
    const response = await sendProviderRequest(adapter.buildUrl(provider, spec), {
      ...adapter.buildHeaders(provider), 'Content-Type': 'application/json',
    }, adapter.buildBody(provider, spec), { timeoutMs: 20000, playerSuppliedEndpoint: true });
    return Response.json({ valid: response.ok, model: provider.model }, { headers });
  } catch { return Response.json({ valid: false }, { headers }); }
}
