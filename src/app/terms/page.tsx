import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/Legal';
import { PERSONAL_CLOUD_ENABLED } from '@/lib/cloud/schema';

export const metadata: Metadata = {
  title: "条款",
  description:
    "Narraitor 的通俗条款：一款免费、按现状提供的创意小说工具，不提供任何保证。你的故事属于你。",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="条款"
      lead="一款免费创意小说工具的通俗条款。没有故意让你踩坑的细则——只有你可以期待的内容，以及你需要自行承担的部分。"
      updated="2026年6月"
    >
      <LegalSection id="terms-what" heading="这是什么">
        <p>
          Narraitor 是一款免费的创意小说工具，也是一个个人开源项目。它用于构建和游玩你自己的故事。使用它即表示你同意以下通俗条款。
        </p>
      </LegalSection>

      <LegalSection id="terms-warranty" heading="按现状提供，不提供任何保证">
        <p>
          它不附带任何形式的保证。它可能存在缺陷，也可能无法使用，它生成的故事和图像由模型产出——可能出错、怪异、重复，或者根本不是你想要的。使用风险由你自行承担。
        </p>
      </LegalSection>

      <LegalSection id="terms-responsibility" heading="你需要承担的部分">
        <p>
          请勿将机密信息或真实个人数据粘贴到提示词中——请参阅{' '}
          <a href="/privacy">隐私说明</a> 了解原因。你要对自己创作的内容及其使用方式负责。
        </p>
        <p>
          如果你使用自己的模型服务密钥，你还须遵守该模型服务的条款，使用该密钥产生的任何使用费用均由你承担。
        </p>
      </LegalSection>

      <LegalSection id="terms-ownership" heading="你的故事属于你">
        <p>
          {PERSONAL_CLOUD_ENABLED
            ? '本应用不会主张对你的故事的所有权。此私人版本会在你的云端存储中保存进度，并将生成所需的内容发送给模型服务。代码本身依据其仓库中的许可证开源。'
            : '本应用不会主张对你的故事的所有权；由于它们保存在你的浏览器中，本项目永远看不到它们。代码本身依据其仓库中的许可证开源。'}
        </p>
      </LegalSection>

      <LegalSection id="terms-availability" heading="它可能会改变，也可能消失">
        <p>
          这是一个个人兴趣版本。功能可能会变化，无法保证它会一直在线或持续可用。你的本地数据归你所有，可自行导出并保存，因此请备份任何你不想失去的内容。
        </p>
      </LegalSection>

      <LegalSection id="terms-questions" heading="疑问">
        <p>
          它是开源的——阅读代码，或在以下地址提交问题：{' '}
          <a
            href="https://github.com/jerseycheese/Narraitor"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
