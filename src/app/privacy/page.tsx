import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/Legal';
import { PERSONAL_CLOUD_ENABLED } from '@/lib/cloud/schema';

export const metadata: Metadata = {
  title: "隐私",
  description:
    PERSONAL_CLOUD_ENABLED
      ? '你的游戏进度保存到私人云端，模型请求由服务器转发，密钥不会下发到浏览器。'
      : 'Narraitor 如何处理你的数据：你的世界和角色保留在浏览器中，提示词会发送给生成故事的模型服务，使用情况统计是匿名且无 Cookie 的。',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="隐私"
      lead={PERSONAL_CLOUD_ENABLED
        ? '这是供你个人使用的私人版本。游戏进度会自动同步到私人云端，生成故事所需的信息会发送给已配置的模型服务。'
        : '简短而坦诚的版本：你的故事保存在浏览器中。离开浏览器的内容，是发送出去用于生成故事下一部分的提示词，以及关于应用使用情况和出错情况的匿名计数。'}
      updated={PERSONAL_CLOUD_ENABLED ? '2026年11月16日' : '2026年8月'}
    >
      <LegalSection id="privacy-data" heading="你的数据保存在哪里">
        <p>
          {PERSONAL_CLOUD_ENABLED
            ? '世界、角色、冒险记录、故事、日志、背包、目标和设定会保存到私人云端存储，当前浏览器也保留本地副本。使用你的账号登录，可以在不同设备间继续游玩。'
            : '你的世界、角色和已保存的故事都存储在本地浏览器中，也就是你当前使用的设备上。它们不会被上传到服务器——并没有服务器保存你的内容。'}
        </p>
        <p>
          {PERSONAL_CLOUD_ENABLED
            ? '你也可以在设置中导出或导入备份。清除浏览器数据后，已成功同步的进度会从云端恢复；尚未同步的本地修改可能丢失。外观偏好只保存在当前设备。'
            : '在设置中，你可以将所有内容导出为文件，再重新导入——这就是你的备份，也是已保存数据中唯一会在你选择创建时离开设备的副本。清除此站点的浏览器数据会抹掉一切，所以请为任何丢失后你会难过的内容保留一份导出。'}
        </p>
      </LegalSection>

      <LegalSection id="privacy-prompts" heading="哪些内容会离开浏览器">
        <p>
          {PERSONAL_CLOUD_ENABLED
            ? '生成时，服务器会将世界设定、角色资料、相关故事上下文和你的行动发送给 AI Genesis 提供的模型端点。当前模型为 deepseek-flash。模型密钥保存在服务器端，不会进入浏览器或游戏存档。'
            : '为了撰写故事和生成图片，应用会发送你的提示词——你创建的世界与角色详情，以及你做出的选项——经由它自己的服务器转发；该服务器不会保留副本，而是将这些内容传给负责生成的模型服务。默认情况下是 Google Gemini；如果你设置了自己的模型服务密钥，则会改为发送给你选择的模型服务。'}
        </p>
        <p>
          该模型服务如何处理你发送的内容，受其条款约束，而不是我们的条款。实际影响是：像对待任何你会粘贴到第三方服务中的内容一样对待提示词，不要在其中放入密码、机密信息，或你不想分享的真实个人数据。
        </p>
      </LegalSection>

      <LegalSection id="privacy-accounts" heading={PERSONAL_CLOUD_ENABLED ? '私人访问与登录' : '无需账户'}>
        <p>
          {PERSONAL_CLOUD_ENABLED
            ? '网站通过 Vercel 身份验证限制访问，只供你的账号使用。这个部署使用一份私人存档，不是面向多个用户的独立账号系统。'
            : '没有注册、没有登录、没有个人资料。应用不知道你是谁，也没有任何东西会把你的故事与某个身份关联起来。'}
        </p>
      </LegalSection>

      <LegalSection id="privacy-analytics" heading="使用情况统计">
        <p>
          使用情况通过 Vercel Web Analytics 统计：匿名、无 Cookie 地统计页面浏览量和少量漏斗步骤——是否有人访问站点、创建世界、开始一次冒险记录、再次回来。由于不使用 Cookie，因此没有需要点击同意的横幅。
        </p>
        <p>
          不会向它发送任何个人数据，也不会发送任何源自你内容的信息——世界名称、角色名称、提示词、故事文本。它的存在只为了回答一个问题：首次游玩流程对新用户是否真的有效。
        </p>
      </LegalSection>

      <LegalSection id="privacy-errors" heading="当出现故障时">
        <p>
          如果应用崩溃或请求失败，它会发送一份简短报告，让故障变得可见，而不是悄无声息。报告包含五项内容：哪个部分失败、错误的类名、像“网络”或“超时”这样的类别、你当时所在的页面（其中的任何 ID 都已替换），以及堆栈跟踪。
        </p>
        <p>
          它有意省略的内容：错误消息本身、来自你的世界、角色或故事的任何内容、你输入的任何内容，以及你的模型服务密钥。该消息会在你的设备上读取，以选择类别，然后被丢弃——只有类别会被发送。
        </p>
      </LegalSection>

      <LegalSection id="privacy-changes" heading="如果这一点发生变化">
        <p>
          {PERSONAL_CLOUD_ENABLED
            ? '本说明对应当前私人云端版本。登录方式、存档位置或模型服务发生变化时，应同步更新这里的说明。'
            : '本说明与当前应用的工作方式一致：本地优先，无需账户。如果这一点将来发生变化——账户、服务器端存档、跨设备同步——本说明也会随之更改，并且更改会显示在这里。'}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
