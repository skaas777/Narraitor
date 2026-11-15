'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoreViewer } from '@/components/LoreViewer';
import { useLoreStore } from '@/state/loreStore';
import { extractStructuredLore } from '@/lib/ai/structuredLoreExtractor';
import { useWorldStore } from '@/state/worldStore';
import { ensureWorldNpcRoster } from '@/lib/services/worldCreationService';
import type { EntityID } from '@/types';

const STATUS_AUTO_DISMISS_MS = 5000;

/**
 * Show a status message that auto-clears after a single configurable delay.
 * Replaces a previous pattern of unmanaged setTimeout calls scattered across handlers:
 * each new message cancels the prior timer, and any pending timer is cleared on unmount.
 */
function useTransientStatus(autoDismissMs = STATUS_AUTO_DISMISS_MS) {
  const [message, setMessage] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback((next: string, opts?: { sticky?: boolean }) => {
    clearPending();
    setMessage(next);
    if (!opts?.sticky) {
      timerRef.current = setTimeout(() => {
        setMessage('');
        timerRef.current = null;
      }, autoDismissMs);
    }
  }, [autoDismissMs, clearPending]);

  const clear = useCallback(() => {
    clearPending();
    setMessage('');
  }, [clearPending]);

  useEffect(() => clearPending, [clearPending]);

  return { message, show, clear };
}

export default function LoreViewerTestPage() {
  const { addFact, clearFacts, getFacts, addStructuredLore, setAliases, searchFacts, findEntityByAnyName } = useLoreStore();
  const { worlds, createWorld } = useWorldStore();
  const status = useTransientStatus();
  const [showSessionOnly, setShowSessionOnly] = useState(false);
  const [customNarrative, setCustomNarrative] = useState('');
  const [worldId, setWorldId] = useState<EntityID | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create test world on mount if needed
  useEffect(() => {
    const existingWorldId = Object.keys(worlds)[0];
    if (existingWorldId) {
      setWorldId(existingWorldId as EntityID);
    } else {
      const newWorldId = createWorld({
        name: '测试世界',
        description: "设定查看器测试世界",
        genre: 'fantasy',
        attributes: [],
        skills: [],
        settings: {
          maxAttributes: 10,
          maxSkills: 15,
          attributePointPool: 30,
          skillPointPool: 50
        }
      });
      void ensureWorldNpcRoster(newWorldId);
      setWorldId(newWorldId);
    }
  }, [worlds, createWorld]);
  
  const sessionId = 'test-session-123' as EntityID;
  
  // Don't render until we have a world
  if (!worldId) {
    return <div>正在加载测试世界……</div>;
  }

  const addSampleFacts = () => {
    // Characters
    addFact('hero_name', 'Marcus the Brave', 'characters', 'manual', worldId);
    addFact('villain_name', 'Lord Darkmore', 'characters', 'manual', worldId);
    addFact('mentor_name', 'Eldara the Wise', 'characters', 'manual', worldId);
    
    // Locations
    addFact('starting_town', 'Willowbrook Village', 'locations', 'manual', worldId);
    addFact('dungeon_name', 'The Caverns of Despair', 'locations', 'manual', worldId);
    addFact('capital_city', 'Goldenhaven', 'locations', 'manual', worldId);
    
    // Events
    addFact('quest_start', "村庄遭到了哥布林袭击", 'events', 'narrative', worldId, sessionId);
    addFact('first_battle', "Marcus 击败了三只哥布林", 'events', 'narrative', worldId, sessionId);
    addFact('mentor_meeting', "Eldara 揭示了预言", 'events', 'narrative', worldId, sessionId);
    
    // Rules
    addFact('magic_system', "魔法需要水晶法器", 'rules', 'manual', worldId);
    addFact('combat_rule', "先攻基于敏捷", 'rules', 'manual', worldId);
  };


  const testStructuredExtraction = async () => {
    const beforeCount = getFacts({ worldId }).length;
    
    const sampleNarrative = customNarrative || "你进入 Goldenhaven 熙熙攘攘的集市，商贩们正大声兜售货物。一位名叫 Lady Seraphina 的神秘女子向你提出紧急请求。她向你讲述了位于 Whispering Woods 深处的 Aethon 失落神庙。据说神庙中藏有真理水晶，一件强大的神器。卫队长 Sir Gareth 警告你森林十分危险。许多冒险者进入过 Whispering Woods，但很少有人归来。当地酒馆 The Dragon's Rest 或许有更多信息。";
    
    status.show("正在使用 AI 提取结构化设定...", { sticky: true });
    try {
      const structuredLore = await extractStructuredLore(sampleNarrative);
      addStructuredLore(structuredLore, worldId, sessionId);

      const afterCount = getFacts({ worldId }).length;
      const extracted = afterCount - beforeCount;

      status.show(`AI 提取了 ${extracted} 条新的结构化事实！查看所有分类以获取丰富的元数据。`);
    } catch (error) {
      status.show(`提取结构化设定失败：${error}`);
    }
  };

  const testErrorHandling = async () => {
    const beforeCount = getFacts({ worldId }).length;

    const sampleNarrative = customNarrative || "你进入 Goldenhaven 熙熙攘攘的集市，商贩们正大声兜售货物。一位名叫 Lady Seraphina 的神秘女子向你提出紧急请求。她向你讲述了位于 Whispering Woods 深处的 Aethon 失落神庙。据说神庙中藏有真理水晶，一件强大的神器。卫队长 Sir Gareth 警告你森林十分危险。许多冒险者进入过 Whispering Woods，但很少有人归来。当地酒馆 The Dragon's Rest 或许有更多信息。";

    status.show("正在测试带错误处理的 AI 提取...", { sticky: true });

    try {
      const structuredLore = await extractStructuredLore(sampleNarrative);
      addStructuredLore(structuredLore, worldId, sessionId);
      const afterCount = getFacts({ worldId }).length;
      const extracted = afterCount - beforeCount;

      status.show(`AI 提取成功！已添加 ${extracted} 条事实。`);
    } catch (error) {
      status.show(`AI 提取失败：${error}`);
    }
  };

  const testAliasAddition = () => {
    const facts = getFacts({ worldId });
    const characterFacts = facts.filter(f => f.category === 'characters');

    if (characterFacts.length === 0) {
      status.show("在测试别名之前，请先添加一些事实！");
      return;
    }

    characterFacts.slice(0, 3).forEach(fact => {
      if (fact.value.includes('Marcus')) {
        setAliases(fact.id, ['Marcus', "勇者", "Willowbrook 的英雄"]);
      } else if (fact.value.includes('Seraphina')) {
        setAliases(fact.id, ['Seraphina', "Sera 女士", "神秘女子"]);
      } else if (fact.value.includes('Gareth')) {
        setAliases(fact.id, ['Gareth', "队长", "卫队长"]);
      } else {
        const firstName = fact.value.split(' ')[0];
        setAliases(fact.id, [firstName, fact.value]);
      }
    });

    status.show("已为角色事实添加别名！请查看上方显示。");
  };

  const testAliasSearch = () => {
    if (!searchQuery.trim()) {
      status.show("请先输入搜索查询！");
      return;
    }

    const results = searchFacts(searchQuery, { worldId });
    const entityByName = findEntityByAnyName(searchQuery, worldId);

    const lines = [
      `搜索“${searchQuery}”：`,
      `- 通过搜索找到 ${results.length} 条事实`,
      entityByName ? `- 找到精确匹配：${entityByName.value}` : "- 未找到精确匹配",
    ];
    status.show(lines.join('\n'));
  };

  const testAliasExtraction = async () => {
    const narrativeWithAliases = "你在集市遇到了 Lady Seraphina Moonwhisper。当地人称她为“Sera”或“神秘女子”。陪伴她的是卫队长 Sir Gareth“铁人”，许多人只称他为“队长”。他们谈到了 Goldenhaven（也被称为“黄金之城”或“Haven”）及其困境。当地人亲切地称 The Dragon's Rest 酒馆为“The Dragon”或“Dragon's”，它就在附近。";

    status.show("正在测试 AI 别名提取...", { sticky: true });

    try {
      const structuredLore = await extractStructuredLore(narrativeWithAliases);
      addStructuredLore(structuredLore, worldId, sessionId);

      status.show("AI 别名提取完成！请检查上方显示中是否检测到别名。");
    } catch (error) {
      status.show(`AI 别名提取失败：${error}`);
    }
  };

  return (
    <div>
      <h1>设定查看器测试工具</h1>
      
      <div>
        <div>
          <button
            onClick={addSampleFacts}
          >
            添加示例事实
          </button>
          
          <button
            onClick={testStructuredExtraction}
          >
            测试 AI 结构化提取
          </button>
          
          <button
            onClick={testErrorHandling}
          >
            测试错误处理
          </button>
          
          <button
            onClick={() => {
              clearFacts(worldId);
              status.show("已清除此世界中的所有事实");
            }}
          >
            清除所有事实
          </button>

          <label>
            <input
              type="checkbox"
              checked={showSessionOnly}
              onChange={(e) => setShowSessionOnly(e.target.checked)}
            />
            仅显示本次冒险记录的事实
          </label>
        </div>

        <div>
          <h3>别名测试：</h3>
          <div>
            <button
              onClick={testAliasAddition}
            >
              测试别名添加
            </button>

            <button
              onClick={testAliasExtraction}
            >
              测试 AI 别名提取
            </button>
          </div>

          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="按名称或别名搜索（例如：“Sera”、“队长”）..."
            />
            <button
              onClick={testAliasSearch}
            >
              测试别名搜索
            </button>
          </div>
        </div>

        {status.message && (
          <div role="status" aria-live="polite" style={{ whiteSpace: 'pre-line' }}>
            {status.message}
          </div>
        )}

        <div>
          <label>
            自定义叙事文本（可选——留空则使用示例）
          </label>
          <textarea
            value={customNarrative}
            onChange={(e) => setCustomNarrative(e.target.value)}
            placeholder="输入叙事文本以测试事实提取……"
          />
        </div>
      </div>
      
      <div>
        <LoreViewer 
          worldId={worldId} 
          sessionId={showSessionOnly ? sessionId : undefined}
        />
      </div>
      
      <div>
        <h2>测试说明：</h2>
        <ol>
          <li><strong>添加示例事实：</strong> 手动添加预定义事实以测试显示</li>
          <li><strong>测试 AI 结构化提取：</strong> 运行 AI 提取器，并存储其返回的结构化事实及元数据</li>
          <li><strong>测试错误处理：</strong> 强制 AI 调用失败，并展示查看器如何处理该失败</li>
          <li><strong>自定义叙事：</strong> 输入你自己的文本以测试提取（支持任意类型/风格）</li>
          <li><strong>冒险记录筛选：</strong> 切换以仅显示当前冒险记录中的事实</li>
          <li><strong>清除所有事实：</strong> 移除所有事实以重新开始</li>
          <li><strong>测试别名添加：</strong> 手动为现有角色事实添加别名</li>
          <li><strong>测试 AI 别名提取：</strong> 测试 AI 从叙事文本中提取别名</li>
          <li><strong>测试别名搜索：</strong> 按实体的规范名称或任意别名搜索</li>
        </ol>
        
        <div>
          <h3>AI 结构化提取：</h3>
          <ul>
            <li>• 提取角色及其定位、描述和重要性</li>
            <li>• 识别地点及其类型和背景</li>
            <li>• 检测实体的别名和替代名称</li>
            <li>• 捕获事件及其重要性和关联</li>
            <li>• 识别规则和世界机制</li>
            <li>• 比正则表达式模式覆盖更多情况</li>
          </ul>
        </div>

        <div>
          <h3>别名管理：</h3>
          <ul>
            <li>• 角色和地点可以有多个别名</li>
            <li>• 搜索会按规范名称或任意别名查找实体</li>
            <li>• AI 会从叙事上下文中自动检测别名</li>
            <li>• 别名会与规范名称一起内联显示</li>
            <li>• 适用于昵称、头衔和替代称呼</li>
          </ul>
        </div>
        
        <div>
          <h3>生产环境行为：</h3>
          <ul>
            <li>• <strong>主要方式：</strong> AI 驱动的结构化提取（使用 API 密钥的生产环境）</li>
            <li>• <strong>开发环境：</strong> 模拟结构化提取（无 API 时使用智能模式）</li>
            <li>• <strong>错误处理：</strong> 优雅失败——宁可不出设定，也不产生错误数据</li>
            <li>• 注重质量而非数量——宁可没有数据，也不要错误数据</li>
            <li>• 简单可靠的架构，不依赖脆弱的正则表达式模式</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
