/**
 * GENERATED FILE — do not hand-edit.
 *
 * Real output from the product's own generation chain, produced by
 * scripts/generate-homepage-showcase.mjs. The homepage presents this as
 * evidence of what the product writes, so editing it by hand would turn it
 * back into a claim nobody checked. Re-run the script instead.
 *
 * Model: gemini-2.5-flash
 * Generated: 2026-08-09T19:18:49.036Z
 * Turns played per world: 3 (the last one is what's kept)
 *
 * The player's side of the exchange is authored, standing in for what someone
 * would bring: the typed description, the world caption, the genre, and the
 * character the story is played as. Everything else here came back from the
 * model: the attribute and skill names, the opening prose, the decision and
 * its options, and the consequence. The skill check numbers are a real roll
 * from the production evaluator, rolled until it failed so the page can show
 * a failure honestly.
 *
 * The attributes and skills came from the typed description on its own, the
 * same single-field call the creation wizard makes. "opening" is turn 1,
 * written from that world plus the authored character. The decision, options,
 * check and consequence are turn 3, played forward from it.
 */

export interface ShowcaseOption {
  text: string;
  alignment: string;
  taken: boolean;
}

export interface ShowcaseCheck {
  skillName: string;
  diceRoll: number;
  skillLevel: number;
  attributeBonus: number;
  total: number;
  dc: number;
}

export interface ShowcaseWorld {
  id: string;
  caption: string;
  genre: string;
  typed: string;
  protagonist: string;
  attributeNames: string[];
  skillNames: string[];
  opening: string;
  /** The passage the choices below answer. Turn 2's scene, not the opening. */
  situation: string;
  decisionPrompt: string;
  options: ShowcaseOption[];
  check: ShowcaseCheck;
  consequence: string;
}

export const HOMEPAGE_SHOWCASE: ShowcaseWorld[] = [
  {
    "id": "port-city",
    "caption": "一座被雨水浸透的港口城市",
    "genre": "mystery",
    "typed": "一座被雨水浸透的港口城市，这里雨从不停歇，每个警察都拿某人的钱。故事设定在四十年代，但光线的颜色不对劲。",
    "protagonist": "Vaughn",
    "attributeNames": [
      "蛮力",
      "敏捷",
      "机智",
      "决心"
    ],
    "skillNames": [
      "街头智慧",
      "调查",
      "恐吓",
      "说服",
      "跟踪",
      "虚张声势"
    ],
    "opening": "The perpetual drizzle clung to your trench coat, a cold, insistent reminder of this city's melancholic grip as you navigated the slick, uneven cobblestones of the waterfront. Under the sickly yellow glow of a flickering gas lamp, the overturned fishing trawler, the 'Sea Serpent,' listed heavily against the barnacle-encrusted pier, its splintered hull a gaping maw to the unforgiving grey sky. A lone, uniformed figure, clearly a beat cop too far from his usual patrol, stood silhouetted against the unnatural twilight, his shoulders hunched, his hat brim pulled low, the faint glint of something metallic in his hand suggesting a fresh, illicit payment. You felt the familiar knot in your gut, the one that always tightened when a job pulled you back into the murky waters you'd sworn to leave behind, but the dead man sprawled across the trawler's deck, half-submerged in a growing pool of crimson, wasn't going to investigate himself.",
    "situation": "“有逃犯！”你喊道，手指越过“Sea Serpent”号的船头，指向一条狭窄小巷深处被雨水划出条纹的浓密阴影。这个词沉甸甸地悬在潮湿的空气中，平淡而缺乏说服力，毫无紧迫感。那名巡警肩膀仍然缩着，只是换了换重心，目光始终牢牢盯着你，手里还攥着纸包着的硬币。一个缓慢而心照不宣的冷笑在他脸上蔓延开来，无声地承认了你那笨拙的尝试。",
    "decisionPrompt": "What will you do?",
    "options": [
      {
        "text": "“你说逃犯？我要征用你的协助。”",
        "alignment": "lawful",
        "taken": false
      },
      {
        "text": "拿你自己的硬币收买警察，让他指出逃犯的路线。",
        "alignment": "neutral",
        "taken": true
      },
      {
        "text": "无视警察，走向巷口，搜寻痕迹。",
        "alignment": "neutral",
        "taken": false
      },
      {
        "text": "从警察手里夺过纸包硬币，冲进小巷。",
        "alignment": "chaotic",
        "taken": false
      }
    ],
    "check": {
      "skillName": "街头智慧",
      "diceRoll": 3,
      "skillLevel": 3,
      "attributeBonus": 1,
      "total": 7,
      "dc": 12
    },
    "consequence": "你伸手探进外套，掏出一个小皮袋，那熟悉的重量让你感到一丝安心。当你把它递向巡警，眼里闪着希望时，他只是低声笑了笑——那是一种低沉沙哑、仿佛能震动潮湿空气的声音。他举起手里那卷硬币，带着嘲弄的意味，然后随手让它落进外套口袋。“早就买通、付过钱了，Vaughn，”他嘶哑地说，目光仍然紧盯着你，先前的冷笑如今变成了毫不掩饰的讥笑。“而且你来晚了。”"
  },
  {
    "id": "survey-ship",
    "caption": "一艘失联六个月的勘测船",
    "genre": "sci-fi",
    "typed": "一艘勘测船已静默航行六个月，船员只剩四人，而货舱里有一件不在舱单上的东西。",
    "protagonist": "Aiya",
    "attributeNames": [
      "体质",
      "敏捷",
      "智力",
      "机智"
    ],
    "skillNames": [
      "驾驶",
      "工程",
      "安防系统",
      "急救",
      "生存（舰船）",
      "异星学"
    ],
    "opening": "飞船生命维持系统的嗡鸣平时令人安心，如今却像低沉的震颤贴着你的骨头，不断提醒你已在虚空中漂流了六个月。你用手指描过那台古老数据板上的褪色文字：‘货物舱单，星历 247.03.12。’你的手指悬停在那个不符之处上：一条单项记录，‘低温封存单元，实验型’，它两个月前出现在维护日志里，是飞船内部记录中的一个幽灵，似乎没有别人注意到，或者也许根本懒得去找。前方狭窄走廊里闪烁的应急灯投下长长晃动的影子，让你走向货舱时觉得这艘船不像一艘船，倒更像一座坟墓，一股病态的不祥预感在胃里盘绕。",
    "situation": "你迅速操作古老数据板的界面，几下精准的点击与滑动隔离了货舱的空气，伴随着一声低沉液压嘶响，封死了厚重的防爆门。飞船内部传感器嗡鸣着，此刻完全锁定在那个脉动的红点上。它那有节奏的信号原本微弱，如今呈现出更清晰、更明确的节拍，在飞船生命维持系统逐渐失效的背景中，像一阵缓慢而稳定的搏动。你屏住呼吸，随着你盯着屏幕上那一个孤立的心跳信号，空气中的寒意越发深重。",
    "decisionPrompt": "What will you do?",
    "options": [
      {
        "text": "查看飞船日志，寻找货舱异常。",
        "alignment": "lawful",
        "taken": false
      },
      {
        "text": "将剩余生命维持系统输送到这一区域。",
        "alignment": "neutral",
        "taken": true
      },
      {
        "text": "准备防化服和破拆工具。",
        "alignment": "neutral",
        "taken": false
      },
      {
        "text": "打开货舱防爆门，并触发紧急净化。",
        "alignment": "chaotic",
        "taken": false
      }
    ],
    "check": {
      "skillName": "工程",
      "diceRoll": 4,
      "skillLevel": 3,
      "attributeBonus": 1,
      "total": 8,
      "dc": 12
    },
    "consequence": "你手掌猛拍古老的操控台，试图强行切换供电导管，但失灵的系统只以一声抗议般的哀鸣回应。能量没有改道，剩余的生命维持系统反而紊乱地闪烁，前方走廊里昏暗的应急灯彻底熄灭，将通道抛入令人窒息的墨黑之中。货舱传来的有节奏搏动如今回荡得更响、更清晰，在令人窒息的寂静中成为唯一的心跳，与渗入你骨髓的越来越重的寒意形成鲜明对照。"
  },
  {
    "id": "normandy",
    "caption": "诺曼底，1944年6月",
    "genre": "historical",
    "typed": "诺曼底，1944年6月。一个步枪班与部队失散，没有无线电，正穿过树篱向内陆推进。",
    "protagonist": "Ade下士",
    "attributeNames": [
      "力量",
      "敏捷",
      "耐力",
      "感知"
    ],
    "skillNames": [
      "步枪射击",
      "潜行",
      "生存（野战）",
      "导航",
      "急救",
      "观察"
    ],
    "opening": "潮湿泥土与碎裂混凝土的气味紧贴空气，你拨开纠缠的荆棘，沉甸甸的 M1 加兰德步枪在手中如同铅块。远处炮火的轰鸣像持续而令人作呕的心跳，透过你磨损靴底传来，提醒着你在海滩上勉强逃脱的混乱。汗水刺痛双眼，使前方本已茂密的树篱变得模糊——那是一堵吞噬声音与光线的绿色高墙，让每一次窸窣都可能是敌人。你回头瞥了一眼跟在身后的四张严峻面孔，这是你的新小队，他们的性命如今沉甸甸地压在你肩上；你成为下士是形势所迫，而非出于选择。",
    "situation": "你试图从树篱最茂密的地方穿过去，但粗壮交缠的枝条不肯让路，勾住你的制服和装备。你试图推开一根比手臂还粗的树枝时，它带着惊人的力道弹回，重重撞在步枪侧面，发出一声在压抑寂静中传得过远的脆响。前方那条原本只是绕开的鹿径，此刻看起来成了极其明显、也更容易走的路，但机会已经失去。",
    "decisionPrompt": "What will you do?",
    "options": [
      {
        "text": "停止移动，凝神倾听敌人是否有任何反应。",
        "alignment": "lawful",
        "taken": false
      },
      {
        "text": "小心原路返回，寻找一条更不显眼的新路线。",
        "alignment": "neutral",
        "taken": true
      },
      {
        "text": "强行穿过树篱，暂时无视那声响。",
        "alignment": "neutral",
        "taken": false
      },
      {
        "text": "故意再折断一根树枝，以掩盖第一声脆响。",
        "alignment": "chaotic",
        "taken": false
      }
    ],
    "check": {
      "skillName": "潜行",
      "diceRoll": 7,
      "skillLevel": 3,
      "attributeBonus": 1,
      "total": 11,
      "dc": 12
    },
    "consequence": "你挪动重心，从勾住你的枝条间缓缓退开，尽力不惊动一片叶子地沿原路返回。然而步枪的脆响已经传得太远。你靴下的一根细枝啪地折断，紧接着前方、偏离主路的地方传来被扰动的树叶窸窣声。你僵住，背靠一棵粗橡树粗糙的树皮，把 M1 加兰德步枪紧紧横在胸前；冰冷的钢铁与你掌心突然冒出的冷汗形成鲜明对比。"
  },
  {
    "id": "debt-court",
    "caption": "靠债务运转的宫廷",
    "genre": "fantasy",
    "typed": "在这座宫廷里，没人使用钱币，每一份人情都被记录下来，而账本则是所有人唯一畏惧的法律。",
    "protagonist": "Sennen",
    "attributeNames": [
      "敏锐",
      "沉着",
      "影响力",
      "勤勉"
    ],
    "skillNames": [
      "记账",
      "谈判",
      "流言与传闻",
      "礼仪",
      "辩论与修辞",
      "恐吓"
    ],
    "opening": "The flickering glow of a single tallow candle casts long, dancing shadows across the meticulously stacked ledgers, their leather-bound spines groaning under the weight of countless obligations. Each page, filled with the elegant script of debts owed and favors granted, represents a life intricately woven into the court's unforgiving fabric, and you, a junior clerk, feel the chilling echo of that power as you carefully turn a brittle leaf. A sudden, sharp rap on the heavy oaken door sends a tremor through the quiet chamber, the sound too abrupt, too insistent for a casual visitor, pulling your gaze from the intricate web of ancient promises. You instinctively adjust the worn satchel at your hip, the familiar weight of your own uncalled debt a cold comfort against the sudden, unwelcome intrusion, as the latch clicks with an ominous finality.",
    "situation": "你迎上塞隆大师的目光，自己的神情毫不动摇，账本摊开的书页就明明白白地摆在你们之间。陈旧羊皮纸与正在晾干的墨迹散发淡淡气味，那是你熟悉的慰藉。他端详你许久，那双如抛光黑曜石般深暗的眼睛仿佛能刺穿你镇定的外壳；随后，他姿态中细微的变化透露出勉强的接受。房间里的紧张气氛如同烛光中飞舞的尘埃般浓重，直到他终于把注意力转向那张脆页上精准而优雅的字迹，才几乎难以察觉地缓和下来。",
    "decisionPrompt": "What will you do?",
    "options": [
      {
        "text": "指出脆页上那精准而优雅的字迹。",
        "alignment": "lawful",
        "taken": false
      },
      {
        "text": "请塞隆大师说明是哪个条目令他担忧。",
        "alignment": "neutral",
        "taken": true
      },
      {
        "text": "为账本中那些微妙的条目给出含蓄的解释。",
        "alignment": "neutral",
        "taken": false
      },
      {
        "text": "随手从账本上撕下那张脆页，提出重写它。",
        "alignment": "chaotic",
        "taken": false
      }
    ],
    "check": {
      "skillName": "谈判",
      "diceRoll": 6,
      "skillLevel": 3,
      "attributeBonus": 1,
      "total": 10,
      "dc": 12
    },
    "consequence": "塞隆大师眯起眼睛，烛焰的闪动在他眼底映出一丝冷光。他没有直接回答你的问题。相反，他的目光从你脸上移到账本，又移回来，那无声而沉重的审视让你皮肤发紧。小房间里的空气似乎更沉重了，压得你透不过气，直到宫廷远处机械装置低沉的嗡鸣也像一种审判。"
  }
];
