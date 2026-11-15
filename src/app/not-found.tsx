import type { Metadata } from 'next';
import { NotFoundState } from '@/components/shared/NotFoundState';

export const metadata: Metadata = {
  title: "页面未找到",
  description:
    "这条路不通。返回你的世界，继续故事。",
};

/**
 * Global not-found page for unknown routes.
 *
 * Renders inside the app shell via the root layout, so a stale bookmark or a
 * typo lands on branded copy with a way back into the player flow instead of
 * the framework-default 404.
 */
export default function NotFound() {
  return (
    <NotFoundState
      title="页面未找到"
      message="这条路不通——页面可能已移动，或者链接已失效。返回你的世界，继续故事。"
      backUrl="/worlds"
      backLabel="返回世界列表"
    />
  );
}
