// src/components/devtools/PortraitDebugSection/PromptBreakdown.tsx

import React from 'react';
import { Character } from '@/types/character.types';
import { World } from '@/types/world.types';
import { displayLabel } from '@/lib/i18n/zhCN';

interface PromptBreakdownProps {
  characterData: Partial<Character> | null | undefined;
  worldConfig: Partial<World> | null | undefined;
  prompt: string;
}

export function PromptBreakdown({ characterData, worldConfig, prompt }: PromptBreakdownProps) {
  // Analyze the prompt construction logic
  // Note: Known figure detection is now automatic based on the character name
  // The AI will determine if it's a known figure and adjust the style accordingly
  
  // Try to determine the prompt type based on its content
  const isPhotorealisticPrompt = prompt.includes('portrait photograph') || prompt.includes('photorealistic');
  const isFantasyPrompt = prompt.includes('fantasy portrait') || prompt.includes('digital painting');
  
  // Extract personality traits logic
  const extractKeyTraits = (personality: string): string => {
    if (!personality) return '';
    const words = personality.toLowerCase().split(/\s+/);
    const descriptiveWords = words.filter(word => 
      word.length > 3 && 
      !['with', 'and', 'the', 'very', 'quite', 'rather'].includes(word)
    ).slice(0, 3);
    
    return descriptiveWords.length > 0 ? descriptiveWords.join(' ') + ' character' : '';
  };
  
  // Extract profession from history
  const extractProfession = (history: string): string | null => {
    if (!history) return null;
    const professionMatch = history.match(
      /\b(warrior|mage|wizard|rogue|thief|cleric|priest|ranger|bard|druid|paladin|sorcerer|fighter|monk)\b/i
    );
    return professionMatch ? professionMatch[0].toLowerCase() : null;
  };
  
  
  const personalityTraits = extractKeyTraits(characterData?.background?.personality || '');
  const profession = extractProfession(characterData?.background?.history || '');
  const physicalDescription = characterData?.background?.physicalDescription || '';
  
  // Break down the prompt into its components
  const promptParts = prompt.split(', ');
  
  return (
    <div>
      {/* Logic Flow Diagram */}
      <div>
        <h4>提示词构建逻辑流程</h4>
        
        <div>
          {/* Decision Tree */}
          <div>
            <div>1. 自动角色检测</div>
            <div>
              <div>AI 分析 “{characterData?.name || "未知"}&quot;</div>
              {isPhotorealisticPrompt ? (
                <div>→ 检测为已知人物（照片写实方式）</div>
              ) : isFantasyPrompt ? (
                <div>→ 检测为原创角色（奇幻艺术风格）</div>
              ) : (
                <div>→ 检测待定...</div>
              )}
            </div>
          </div>
          
          <div>
            <div>2. 开头陈述</div>
            <div>
              {isPhotorealisticPrompt ? 
                '&quot;A portrait photograph of&quot;' : 
                '&quot;A fantasy portrait of&quot;'
              }
            </div>
          </div>
          
          <div>
            <div>3. 主体细节</div>
            <div>
              <div>姓名：&quot;{characterData?.name || "未知"}&quot;</div>
              {physicalDescription && (
                <div>外貌：&quot;{physicalDescription}&quot;</div>
              )}
              {isFantasyPrompt && personalityTraits && (
                <div>特征：&quot;{personalityTraits}&quot;</div>
              )}
              {isFantasyPrompt && profession && (
                <div>职业：&quot;{profession} 职业&quot;</div>
              )}
            </div>
          </div>
          
          <div>
            <div>4. 上下文/背景</div>
            <div>
              {isPhotorealisticPrompt ? (
                <>
                  <div>• 专业半身像</div>
                  <div>• 棚拍灯光</div>
                </>
              ) : (
                <>
                  <div>• {worldConfig?.genre || 'mystical'} 场景</div>
                  <div>• 戏剧化灯光</div>
                </>
              )}
            </div>
          </div>
          
          <div>
            <div>5. 风格元素</div>
            <div>
              {isPhotorealisticPrompt ? (
                <>
                  <div>• 85毫米镜头</div>
                  <div>• 浅景深</div>
                  <div>• 写实风格</div>
                  <div>• 专业摄影</div>
                </>
              ) : (
                <>
                  <div>• 数字绘画</div>
                  <div>• 概念艺术风格</div>
                  <div>• 细节丰富</div>
                  <div>• 专业作品质量</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Prompt Breakdown */}
      <div>
        <h4>提示词组件分解</h4>
        <div>
          {promptParts.map((part, index) => {
            const trimmedPart = part.trim();
            let category = 'other';
            let color = '';
            
            // Categorize each part
            if (index === 0) {
              category = 'opening';
              color = '';
            } else if (trimmedPart === characterData?.name) {
              category = 'name';
              color = '';
            } else if (trimmedPart.includes('the') && isPhotorealisticPrompt) {
              category = 'context';
              color = '';
            } else if (trimmedPart.includes('character') || trimmedPart.includes('class')) {
              category = 'description';
              color = '';
            } else if (trimmedPart.includes('lighting') || trimmedPart.includes('headshot') || trimmedPart.includes('setting') || trimmedPart.includes('background')) {
              category = 'environment';
              color = '';
            } else if (trimmedPart.includes('lens') || trimmedPart.includes('photorealistic') || trimmedPart.includes('painting') || trimmedPart.includes('style') || trimmedPart.includes('quality')) {
              category = 'style';
              color = '';
            }
            
            return (
              <div key={index} >
                <span className={`${color}`}>
                  {displayLabel(category)}
                </span>
                <span>{trimmedPart}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Data Analysis */}
      <div>
        <h4>输入数据分析</h4>
        <div>
          <div>
            <div>
              <span>角色名称：</span>
              <span>{characterData?.name || "未设置"}</span>
            </div>
            <div>
              <span>肖像类型：</span>
              <span>
                {isPhotorealisticPrompt ? "照片级写实" : isFantasyPrompt ? "奇幻艺术" : "自动检测"}
              </span>
            </div>
            <div>
              <span>外貌描述：</span>
            <span>{physicalDescription ? `${physicalDescription.length} 个字符` : 'None'}</span>
            </div>
            <div>
              <span>性格描述长度：</span>
              <span>{characterData?.background?.personality?.length || 0} 个字符</span>
            </div>
            <div>
              <span>提取的特征：</span>
              <span>{personalityTraits || 'None'}</span>
            </div>
            <div>
              <span>历史记录包含职业：</span>
              <span>{profession || "否"}</span>
            </div>
            <div>
              <span>世界类型：</span>
              <span>{worldConfig?.genre || "未设置"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
