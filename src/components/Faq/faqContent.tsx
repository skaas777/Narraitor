import React from 'react';
import Link from 'next/link';
import { PERSONAL_CLOUD_ENABLED } from '@/lib/cloud/schema';

/**
 * FAQ content, kept apart from the markup so the page stays a single map.
 *
 * Every answer is pinned to how the app works today, not how it might work:
 * a provider is usable only once it has been checked against a live key,
 * storage is browser-local with no server copy, and there are no accounts. When
 * one of those changes, this file changes with it.
 */

const GEMINI_KEY_URL = 'https://aistudio.google.com/apikey';
const ISSUES_URL = 'https://github.com/jerseycheese/Narraitor/issues';

export interface FaqItem {
  /** Stable anchor target, linked from the jump list. Don't rename casually — external links point here. */
  id: string;
  question: string;
  answer: React.ReactNode;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

const STANDARD_FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'faq-getting-started',
    title: "开始使用",
    items: [
      {
        id: 'what-is-narraitor',
        question: "Narraitor 是什么？",
        answer: (
          <p>
            一款单人角色扮演游戏，故事会回应你构建的世界。描述一个设定，创建一个有真实长处与短处的角色，然后体验一段会对你行动做出反应的故事。它是一款带有技能检定和状态追踪的结构化角色扮演游戏，而不是聊天窗口。
          </p>
        ),
      },
      {
        id: 'do-i-need-an-account',
        question: "我需要账号吗？",
        answer: (
          <p>
            不需要。无需注册、登录、个人资料，也不用提供邮箱。打开网站即可开始构建。
          </p>
        ),
      },
      {
        id: 'what-do-i-need',
        question: "开始前需要什么？",
        answer: (
          <p>
            一个浏览器和你自己的模型服务密钥。在“设置”中进入“模型服务”完成配置大约需要两分钟。Google Gemini 是最容易上手的——{' '}
            <a href={GEMINI_KEY_URL} target="_blank" rel="noopener noreferrer">
              获取密钥
            </a>{' '}
            很快，无需银行卡，而且 Google 提供免费套餐。
          </p>
        ),
      },
      {
        id: 'first-thing-to-do',
        question: "我首先该做什么？",
        answer: (
          <p>
            构建一个世界。向导会要求你选择题材并填写描述，然后根据你写的内容建议合适的属性和技能——《Star Wars》设定中的“原力敏感”，洛夫克拉夫特式设定中的“理智”。你可以接受、编辑或替换每一项。然后创建角色并开始游戏。
          </p>
        ),
      },
    ],
  },
  {
    id: 'faq-your-key',
    title: "你的密钥、模型服务与费用",
    items: [
      {
        id: 'why-my-own-key',
        question: "为什么我需要自己的密钥？",
        answer: (
          <p>
            因为生成使用的是你的账户，而不是共享账户。这样才能让 Narraitor 无需账号、无需注册，也没有账单。密钥只需设置一次，便会保留在此浏览器中。
          </p>
        ),
      },
      {
        id: 'where-do-i-get-a-key',
        question: "在哪里获取密钥？",
        answer: (
          <p>
            Gemini 最简单：{' '}
            <a href={GEMINI_KEY_URL} target="_blank" rel="noopener noreferrer">
              Google AI Studio
            </a>{' '}
            一分钟就能给你一个。其他模型服务都从各自的控制台签发密钥，而你自己托管的模型完全不需要密钥。把你已有的密钥粘贴到“设置”&gt;“模型服务”&gt;“设置模型服务”。向导会在保存前运行连接检查，因此你能当场知道它是否可用。
          </p>
        ),
      },
      {
        id: 'what-does-it-cost',
        question: "费用是多少？",
        answer: (
          <p>
            Narraitor 不收取任何费用。生成费用会计入你所设置的密钥，Google 的免费 Gemini 套餐足以覆盖休闲游玩。如果超出额度，或使用付费模型服务，花费只在你与他们之间结算。你自己托管的模型除了自己的硬件外不产生费用。
          </p>
        ),
      },
      {
        id: 'why-only-gemini',
        question: "我可以使用哪些模型服务？",
        answer: (
          <p>
            Gemini、OpenAI、OpenRouter，以及自行托管模型时使用的 Ollama。OpenRouter 是另一个无需银行卡即可使用的服务，一个密钥就能覆盖数十个模型。设置界面还会列出 Deepseek、Mistral、Together、Groq 和 Perplexity，但这些服务只有在各自用有效密钥验证通过后才可使用。
          </p>
        ),
      },
      {
        id: 'which-model',
        question: "它使用哪个模型？",
        answer: (
          <p>
            <code>gemini-2.5-flash</code> 为默认模型。设置向导还提供{' '}
            <code>gemini-2.5-pro</code> ，若你更愿意用速度换取深度；其他模型服务都会提供自己的列表——对于自行托管的模型，你需要输入所安装模型的名称。
          </p>
        ),
      },
    ],
  },
  {
    id: 'faq-privacy',
    title: "隐私与你的数据",
    items: [
      {
        id: 'where-is-my-data',
        question: "我的数据存储在哪里？",
        answer: (
          <p>
            存储在你当前设备上浏览器的本地存储中。世界、角色、冒险记录、日志条目、背包——全部都在这里。没有后端数据库，也没有你游戏的服务器端副本。
          </p>
        ),
      },
      {
        id: 'is-my-key-safe',
        question: "我的密钥安全吗？",
        answer: (
          <p>
            它在此浏览器中加密，使用的密钥无法被页面读回；只有在需要它的请求中才会发送。明文密钥绝不会写入存储，也不会被记录到日志。
          </p>
        ),
      },
      {
        id: 'what-gets-sent',
        question: "会向模型服务发送什么？",
        answer: (
          <>
            <p>
              下一段故事的提示词：你的世界和角色详情，以及你做出的选择。它会经由我们自己的服务器转发，服务器不会保留副本。此后模型服务如何处理它，受他们的条款约束，而不是我们的条款。
            </p>
            <p>
              请像对待任何要粘贴到第三方服务的内容一样对待提示词——不要包含密码、机密，或你不想分享的真实个人数据。 <Link href="/privacy">隐私</Link>{' '}
              有完整说明。
            </p>
          </>
        ),
      },
      {
        id: 'backup-and-move',
        question: "我可以备份游戏或迁移到其他浏览器吗？",
        answer: (
          <p>
            可以。设置会导出所有内容——世界、角色、冒险记录、日志、叙事、背包和设定——到单个 JSON 文件，导入则会将其恢复。这就是在浏览器或设备之间迁移的方式。导入会替换已有内容，因此它是恢复而不是合并。
          </p>
        ),
      },
      {
        id: 'clearing-site-data',
        question: "清除站点数据会怎样？",
        answer: (
          <p>
            所有内容都会消失：世界、角色、存档以及你保存的密钥。没有服务器副本可供恢复，所以在清除任何内容之前，请先导出你不想失去的东西。
          </p>
        ),
      },
    ],
  },
  {
    id: 'faq-how-it-works',
    title: "游戏如何运作",
    items: [
      {
        id: 'whats-in-a-world',
        question: "世界包含什么？",
        answer: (
          <p>
            一段背景设定描述，以及其中重要的属性和技能。它们不是装饰——当你的角色尝试困难之事时，故事会依据它们进行判定。
          </p>
        ),
      },
      {
        id: 'where-do-attributes-come-from',
        question: "属性和技能从何而来？",
        answer: (
          <p>
            创建向导会根据你的描述给出建议，你可以逐项接受、编辑或替换。大多数世界以四到六项属性和八到十二项技能为宜——足以让选项有意义，又不会让你被选项淹没。你也可以自行编写。
          </p>
        ),
      },
      {
        id: 'how-do-choices-matter',
        question: "我的选项有什么影响？",
        answer: (
          <p>
            选择一个建议选项，或输入你自己的行动。决策会分为次要、重要或关键等级，让你看清风险所在，并会依据你角色的相关技能进行判定。判定失败会让故事转向，而不是给你一次重试机会。阵营追踪（守序、中立、混乱）会持续记录你的角色一贯的行事方式。
          </p>
        ),
      },
      {
        id: 'journal-and-inventory',
        question: "日志和背包有什么用途？",
        answer: (
          <p>
            它们记录已经发生的一切。日志抽屉保存故事历史和过往决策，背包追踪你携带的物品，而“故事至今”摘要会概括当前局势——这也是让你几周后回来时，长篇冒险仍能保持连贯的原因。
          </p>
        ),
      },
      {
        id: 'how-does-a-story-end',
        question: "故事如何结束？",
        answer: (
          <p>
            当故事接近自然的终点时，你会收到结局建议；采纳后，系统会生成一段会考虑你实际所作所为的结局。这样一场冒险就能完整收尾，而不是不了了之。
          </p>
        ),
      },
    ],
  },
  {
    id: 'faq-troubleshooting',
    title: "遇到问题时",
    items: [
      {
        id: 'key-rejected',
        question: "我的密钥被拒绝了",
        answer: (
          <p>
            请确认你复制了完整密钥且没有多余空白，并确认它是来自 AI Studio 的 API 密钥，而不是你 Google 账户中的其他东西。在“设置 &gt; 模型服务”下重新运行连接检查——未通过检查的密钥，向导不会保存。
          </p>
        ),
      },
      {
        id: 'slow-or-timing-out',
        question: "生成速度慢，或者超时了",
        answer: (
          <p>
            生成耗时很长通常意味着模型服务负载过高。稍等片刻再重试这一回合。如果持续超时，在“设置 &gt; 模型服务”下将模型从{' '}
            <code>gemini-2.5-pro</code> 切换为 <code>gemini-2.5-flash</code> 是最快的尝试办法。
          </p>
        ),
      },
      {
        id: 'rate-limited',
        question: "我遇到了速率限制",
        answer: (
          <p>
            有两种独立的限制可能阻止一回合生成。Narraitor 将单个连接每小时生成请求限制为 50 次，这通常是你先遇到的限制；提示信息会告诉你需要等待多久，而在 Google 那边做任何更改都不会缩短它。Google 还会对你的密钥施加自己的限制，将账户升级到付费层级只会提高第二种限制的额度。
          </p>
        ),
      },
      {
        id: 'saves-disappeared',
        question: "我的世界或存档不见了",
        answer: (
          <p>
            所有内容都存储在一个浏览器的存储空间中，因此清除缓存、使用无痕窗口，或换到其他浏览器/设备都不会显示它们。请确认你使用的是当初游玩的浏览器，如果有导出文件，就从导出文件恢复。
          </p>
        ),
      },
      {
        id: 'report-a-bug',
        question: "我在哪里报告错误？",
        answer: (
          <p>
            请前往{' '}
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            。Narraitor 是开源项目，错误报告和功能请求都提交到同一处。
          </p>
        ),
      },
    ],
  },
];

const PERSONAL_FAQ: Record<string, { question?: string; answer: React.ReactNode }> = {
  'do-i-need-an-account': { answer: <p>需要使用你自己的 Vercel 账号登录。这个私人版本只供你访问，无需另行注册游戏账号。</p> },
  'what-do-i-need': { answer: <p>准备一个浏览器，登录后就能开始。模型已在后台配置，换设备也无需填写密钥。</p> },
  'why-my-own-key': { question: '我需要配置模型密钥吗？', answer: <p>不需要。模型和密钥已统一配置在服务器端，所有设备都会自动使用相同配置。</p> },
  'where-do-i-get-a-key': { question: '换设备需要重新设置吗？', answer: <p>不需要。在新设备打开同一个网址，使用你的 Vercel 账号登录，系统就会恢复云端存档并使用已配置的模型。</p> },
  'what-does-it-cost': { answer: <p>游戏本身没有订阅费。模型生成消耗所配置模型服务的额度，云端运行与存储使用你的 Vercel 资源。</p> },
  'why-only-gemini': { question: '模型在哪里管理？', answer: <p>模型由这个私人版本的服务器统一管理，游戏界面无需设置模型服务。</p> },
  'which-model': { answer: <p>当前配置为 <code>deepseek-flash</code>，通过 AI Genesis 接入。世界、角色和新故事默认使用简体中文。当前模型提供文字生成，图片使用占位图。</p> },
  'where-is-my-data': { answer: <p>世界、角色、故事、日志和背包会自动保存到私人云端，当前设备也保留本地副本。使用同一个账号登录后，可以跨设备继续。</p> },
  'is-my-key-safe': { answer: <p>模型密钥保存在服务器端，不会下发到浏览器或写入游戏存档。模型请求由服务器转发。</p> },
  'what-gets-sent': { answer: <p>生成时，会将世界设定、角色信息、相关故事上下文和你的行动发送给已配置的模型服务。云端同步另外保存游戏存档。详情见<Link href="/privacy">隐私说明</Link>。</p> },
  'backup-and-move': { answer: <p>可以。进度会自动跨设备同步，无需手动迁移。你也可以在设置中导出备份。导入备份会替换现有游戏数据，并继续同步到云端。</p> },
  'clearing-site-data': { answer: <p>清除浏览器数据会移除该设备上的本地副本和外观偏好。已成功同步的云端进度会在重新登录后恢复；尚未同步的本地修改可能丢失。</p> },
  'key-rejected': { question: '提示模型连接或身份验证失败', answer: <p>先检查网络并刷新页面，必要时重新登录。模型密钥由后台统一管理；如果模型服务持续拒绝请求，需要检查后台配置或模型服务额度。</p> },
  'slow-or-timing-out': { answer: <p>模型服务繁忙时，生成可能变慢。稍等片刻再重试当前行动。避免连续重复点击；已保存的游戏进度会保留。</p> },
  'rate-limited': { answer: <p>应用或模型服务可能暂时限制请求频率。按提示等待后重试；如果持续出现，请检查模型服务的可用额度。</p> },
  'saves-disappeared': { answer: <p>确认打开的是同一个网站并登录了自己的账号，等待云端存档恢复。如果出现同步冲突，可载入最新云端进度，或先下载本地备份。网络中断时，保留当前页面并重试同步。</p> },
};

export const FAQ_GROUPS: FaqGroup[] = PERSONAL_CLOUD_ENABLED
  ? STANDARD_FAQ_GROUPS.map((group) => ({
      ...group,
      title: group.id === 'faq-your-key' ? '模型与费用' : group.title,
      items: group.items.map((item) => ({ ...item, ...PERSONAL_FAQ[item.id] })),
    }))
  : STANDARD_FAQ_GROUPS;
