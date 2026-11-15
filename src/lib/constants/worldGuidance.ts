import { GENRE_LABELS, GenreValue } from '@/lib/constants/genres';

export type AIGuidanceSource = 'ai' | 'fallback' | 'template' | 'initial';

export interface WorldGuidance {
  label: string;
  tagline: string;
  nameExamples: string[];
  descriptionPrompt: string;
  descriptionExample: string;
  attributeExamples: string[];
  skillExamples: string[];
  aiFocus?: string;
}

const WORLD_GUIDANCE_MAP: Record<GenreValue | 'default', WorldGuidance> = {
  default: {
    label: "任意题材",
    tagline: "突出主要冲突、你希望玩家感受到的叙事风格，以及应出现的挑战类型。",
    nameExamples: ["极光边境", "黑曜石盟约", "翠绿回响"],
    descriptionPrompt: "说明谁居住在这里、正在发生什么变化，以及这对该世界的人们为何重要。",
    descriptionExample:
      "一个四分五裂的城邦联盟正竞相争夺能扭曲现实本身的神秘水晶。每个派系都以不同方式弯折物理法则，而民众担心失控的实验会释放出什么。",
    attributeExamples: ["决心", "机智", "影响力"],
    skillExamples: ["谈判", "野外技能", "自适应工程"],
    aiFocus: "AI 会寻找叙事风格关键词、类型线索和威胁，以推荐匹配的属性。"
  },
  fantasy: {
    label: GENRE_LABELS['fantasy'],
    tagline: "提及魔法如何运作、谁能使用它，以及你的英雄们面临的传奇级利害关系。",
    nameExamples: ["古风界域", "破碎林地", "余烬之冠"],
    descriptionPrompt: "描述标志性地点、魔法传统，以及这个世界必须应对的迫近预言或危机。",
    descriptionExample:
      "漂浮的堡垒环绕着一颗受伤的太阳，秩序与混沌法师为争夺地脉控制权而决斗。骑士驾驭狮鹫巡逻，保护村庄残片免受侵蚀现实的蔓延暗影潮汐侵袭。",
    attributeExamples: ["奥术共鸣", "狮鹫羁绊", "坚定意志"],
    skillExamples: ["织法", "符文制图", "野兽外交"],
    aiFocus: "提及魔法学派、神话生物或预言中的灾祸，有助于 AI 打造量身定制的属性。"
  },
  'sci-fi': {
    label: GENRE_LABELS['sci-fi'],
    tagline: "点明科技水平、正在探索的边疆，以及任何失控的科学实验。",
    nameExamples: ["新星巨构", "赫利俄斯边缘", "协议地平线"],
    descriptionPrompt: "说明统治派系、定义日常生活的科技，以及船员必须解决的悖论或威胁。",
    descriptionExample:
      "巨型城市环绕着虫洞晶格运行，若没有持续校准便会坍塌。企业雇佣漂流飞行员跃入事件视界，而失控的合成人则质疑人类是否还应继续掌权。",
    attributeExamples: ["量子直觉", "赛博义体配置", "零重力适应"],
    skillExamples: ["引力工程", "跃迁空间驾驶", "系统入侵"],
    aiFocus: "提及标志性装置、AI 关系和外星边疆，以引导建议。"
  },
  modern: {
    label: GENRE_LABELS['modern'],
    tagline: "聚焦城市氛围、日常风险，以及你的角色阵容面临的社会或调查压力。",
    nameExamples: ["霓虹第12区", "海港线共同体", "玻璃与钢铁"],
    descriptionPrompt: "概述社区、权力结构，以及人们私下议论的谜团或危机。",
    descriptionExample:
      "一座新兴科技重镇隐藏着一连串与爆款应用有关的失踪案。记者、街头团体的中间人和疲惫的警探争相查明，究竟是谁在云端改写记忆。",
    attributeExamples: ["街头声望", "情绪韧性", "行动洞察"],
    skillExamples: ["数字取证", "危机谈判", "社会工程"],
    aiFocus: "加入街区、机构和流行文化引用等落地细节，能提升真实感。"
  },
  historical: {
    label: GENRE_LABELS['historical'],
    tagline: "用真实事件、社会规范和传统与变革之间的张力来锚定时代。",
    nameExamples: ["蒸汽陨落时代", "镀金航路", "灯笼帝国"],
    descriptionPrompt: "说明历史时期、关键派系或阶层，以及威胁现状的动荡。",
    descriptionExample:
      "1872 年的开罗，发明家将发条装置偷运过帝国检查站，革命者则通过暗号歌剧协调起义。学者们争论进步会解放这座城市，还是会将其撕裂。",
    attributeExamples: ["文化敏锐", "工业韧劲", "社会地位"],
    skillExamples: ["密码技艺", "礼仪周旋", "蒸汽机械维修"],
    aiFocus: "具体日期、地点和真实角色有助于 AI 尊重历史细微差别。"
  },
  horror: {
    label: GENRE_LABELS['horror'],
    tagline: "描述恐惧的源头、它如何腐化熟悉之物，以及还剩下怎样脆弱的希望。",
    nameExamples: ["夜幕教区", "帷溪疯人院", "蚀空海岸"],
    descriptionPrompt: "说明萦绕世界的实体、生存规则，以及得知真相的代价。",
    descriptionExample:
      "一座废弃的海滨小镇每逢黄昏苏醒，雾中诞生的回响重演他们最后一夜。幸存者用秘密做交易来拖延附身，而由盐与记忆缝合的仪式则阻挡黑暗。",
    attributeExamples: ["胆识", "神秘感知", "信仰锚点"],
    skillExamples: ["仪式束缚", "模式识别", "结界术"],
    aiFocus: "提及感官细节、禁忌知识和不断升级的恐惧，可让提示更精准。"
  },
  mystery: {
    label: GENRE_LABELS['mystery'],
    tagline: "明确核心案件、重要嫌疑人和关键调查方法。",
    nameExamples: ["帷幕回路", "猩红账本", "午夜简报"],
    descriptionPrompt: "铺开谜题碎片——犯罪现场、动机推测，以及阻碍真相的障碍。",
    descriptionExample:
      "一座精英仲裁塔在裁决途中失去了一名法官，随即触发封锁。各企业特使隐瞒相互矛盾的证据，而加密证词正从金库系统中消失。",
    attributeExamples: ["演绎推理", "直觉", "网络接入"],
    skillExamples: ["证据整合", "伪装行动", "微表情解读"],
    aiFocus: "线索、误导线索和调查工具，能让技能搭配更明智。"
  },
  western: {
    label: GENRE_LABELS['western'],
    tagline: "突出边疆、争夺中的资源，以及民团不愿逾越的道德底线。",
    nameExamples: ["尘醒领地", "鸦之领地", "边疆子午线"],
    descriptionPrompt: "描述这座小镇、掌控它的势力，以及让所有人绷紧神经的对决。",
    descriptionExample:
      "一位铁路大亨拦河筑坝，为矿石精炼厂供能，任由峡谷中的家园枯萎。流浪者、执法者与被迫迁徙的部族在权衡：正义究竟意味着暗中破坏，还是公开战争。",
    attributeExamples: ["坚韧", "荒野直觉", "声望"],
    skillExamples: ["精准射击", "边疆医术", "骑马追击"],
    aiFocus: "地理、联盟与道德利害引导 AI 给出有现实依据的建议。"
  },
  cyberpunk: {
    label: GENRE_LABELS['cyberpunk'],
    tagline: "详述巨型企业的争斗、街头层面的抵抗，以及人们赖以依仗的义体优势。",
    nameExamples: ["铬金暗流", "霓虹零区", "突触巷"],
    descriptionPrompt: "说明城市层级、企业阴谋，以及技术失效或反叛时会发生什么。",
    descriptionExample:
      "摩天楼峡谷闪耀着神经涂鸦，改写着现实滤镜。黑客团伙抽取记忆，卖往梦境市场，而企业执政官部署扼杀共情的固件更新。",
    attributeExamples: ["义体强化阈值", "街头声望", "信号直觉"],
    skillExamples: ["神经入侵", "无人机集群控制", "生物改造手术"],
    aiFocus: "谈论植入体、数据战争与社会分层，以微调 AI 引导。"
  },
  other: {
    label: GENRE_LABELS['other'],
    tagline: "定义这个世界的独特之处——类型混搭、超现实规则，或实验性的叙事钩子。",
    nameExamples: ["多色梦域", "碎片编年史", "阈限褶皱"],
    descriptionPrompt: "说明自定义前提、现实如何运作，以及玩家应探索的主题。",
    descriptionExample:
      "时间在五种情绪状态间循环，每夜重绘各个城区。居民像建造建筑一样构筑情感，访客必须交换记忆，以免淡入集体合唱。",
    attributeExamples: ["情感共鸣", "时空漂移", "神话感知"],
    skillExamples: ["时间线调谐", "神话编织", "悖论外交"],
    aiFocus: "任何独特的规则或混搭细节都能帮助 AI 避免落入通用奇幻或科幻的俗套。"
  }
};

export function getWorldGuidance(genre?: GenreValue | null): WorldGuidance {
  if (!genre) {
    return WORLD_GUIDANCE_MAP.default;
  }

  return WORLD_GUIDANCE_MAP[genre] ?? WORLD_GUIDANCE_MAP.default;
}
