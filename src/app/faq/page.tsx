import type { Metadata } from 'next';
import Faq from '@/components/Faq';

export const metadata: Metadata = {
  title: "常见问题",
  description:
    "关于 Narraitor 的常见问题：它是什么、为什么需要自备模型服务密钥、费用如何、你的世界和存档保存在哪里，以及出问题时该怎么办。",
};

export default function FaqPage() {
  return <Faq />;
}
