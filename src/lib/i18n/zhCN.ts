export const UI_LOCALE = 'zh-CN';

// Keep stored values and API enums stable; translate only their display labels.
const LABELS: Readonly<Record<string, string>> = {
  world: '世界', worlds: '世界', character: '角色', characters: '角色',
  item: '物品', items: '物品', location: '地点', locations: '地点',
  event: '事件', events: '事件', rules: '世界规则',
  skill: '技能', skills: '技能', attribute: '属性', attributes: '属性',
  fantasy: '奇幻', 'sci fi': '科幻', modern: '现代', historical: '历史',
  horror: '恐怖', mystery: '悬疑', western: '西部', cyberpunk: '赛博朋克', other: '其他',
  serious: '严肃', humorous: '幽默', dramatic: '戏剧化', lighthearted: '轻松',
  mysterious: '神秘', 'action packed': '动作冒险', contemplative: '深思', epic: '史诗', balanced: '均衡',
  simple: '简明', moderate: '适中', advanced: '进阶', literary: '文学化',
  easy: '简单', medium: '中等', hard: '困难', low: '低', high: '高',
  minor: '次要', major: '重要', critical: '关键',
  lawful: '守序', chaotic: '混乱', neutral: '中立', order: '秩序', chaos: '混乱',
  physical: '身体', mental: '心智', social: '社交', technical: '技术',
  combat: '战斗', magic: '魔法', magical: '魔法', knowledge: '知识',
  survival: '生存', general: '通用', creative: '创造', spiritual: '精神',
  equipment: '装备', valuables: '贵重物品', consumables: '消耗品', documents: '文档',
  personal: '随身物品', 'quest items': '任务物品', miscellaneous: '杂物',
  common: '普通', uncommon: '少见', rare: '稀有', legendary: '传说', unique: '独特',
  loot: '战利品', quest: '任务', purchase: '购买', craft: '制作', reward: '奖励', gift: '赠送',
  manual: '手动', system: '系统', fallback: '备用', 'starting equipment': '初始装备', unknown: '未知',
  original: '原创世界', 'inspired by': '灵感改编', 'set within': '既有世界',
  'character event': '角色事件', 'world event': '世界事件',
  'relationship change': '关系变化', achievement: '成就', discovery: '发现',
  dialogue: '对话', decision: '抉择', 'session start': '冒险开始', 'session end': '冒险结束',
  'item acquisition': '获得物品', 'item usage': '使用物品',
  triumphant: '凯旋', hopeful: '充满希望', tragic: '悲剧',
  victory: '胜利', defeat: '失败', retirement: '退隐', death: '死亡',
  narrative: '叙事', scene: '场景', action: '行动', choices: '选项',
  exploration: '探索', challenge: '挑战', crisis: '危机', routine: '日常', ending: '结局',
  active: '进行中', paused: '已暂停', completed: '已完成', abandoned: '已放弃',
  failed: '失败', cancelled: '已取消', canceled: '已取消', loading: '加载中',
  pending: '待处理', ready: '就绪', idle: '空闲', saving: '保存中', saved: '已保存',
  open: '未完成', closed: '已结束', resolved: '已解决', unresolved: '未解决',
  promised: '已承诺', delivered: '已兑现', blocked: '受阻', 'in progress': '进行中',
  error: '错误', warning: '警告', info: '信息', debug: '调试',
  network: '网络', timeout: '超时', validation: '校验', service: '服务', auth: '身份验证',
  'session private': '当前冒险私有', 'world shared': '世界共享',
  context: '上下文', mention: '提及', 'lore extraction': '设定提取',
  assertion: '事实断言', commitment: '承诺', 'scene change': '场景变化',
  pressure: '压力', opportunity: '机会', movement: '动向', threat: '威胁',
  consequence: '后果', deadline: '期限', danger: '危险', faction: '势力',
  weather: '天气', travel: '旅途', encounter: '遭遇',
  player: '玩家', npc: '非玩家角色', ally: '盟友', enemy: '敌人', companion: '同伴',
  minute: '分钟', minutes: '分钟', hour: '小时', hours: '小时', day: '天', days: '天',
  'not started': '未开始', 'not set': '未设置', none: '无', never: '从未',
};

export function displayLabel(value: string | null | undefined): string {
  if (!value) return '';
  const key = value.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  return LABELS[key] ?? value;
}
