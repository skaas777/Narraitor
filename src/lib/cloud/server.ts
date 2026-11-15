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
  return {
    type: 'openai-compatible', apiKey, endpoint, model,
    // Chinese character sheets and reasoning share the provider's output budget.
    // The default 2048-token ceiling can cut a valid JSON response in half.
    maxTokensOverride: 8192,
    customSystemPromptOverride: '所有面向玩家的内容必须使用简体中文，包括世界与角色介绍、属性和技能名称、故事叙述、对白、行动选项、日志、任务与物品说明、章节回顾和结局。保留用户明确指定的专有名称。严格保留请求所要求的 JSON 字段名、ID、枚举值与结构，不要翻译程序协议中的英文标识。仅翻译字段内供玩家阅读的文字。',
  };
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
