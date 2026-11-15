// src/components/devtools/EndingImageDebugSection/EndingImageDebugSection.tsx

import React, { useState } from 'react';
import Image from 'next/image';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useNarrativeStore } from '@/state/narrativeStore';
import { useCharacterStore, type StoreCharacter } from '@/state/characterStore';
import { useWorldStore } from '@/state/worldStore';
import type { StoryEnding, EndingTone, EndingType } from '@/types/narrative.types';
import { capitalize, getTimestamp } from '@/lib/utils';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateEndingImage, generateEndingImagePrompt } from '@/lib/api/endingImageApi';
import Logger from '@/lib/utils/logger';
import { displayLabel } from '@/lib/i18n/zhCN';

const logger = new Logger('EndingImageDebug');

export function EndingImageDebugSection() {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<EndingTone>('hopeful');
  const [customEpilogue, setCustomEpilogue] = useState('');
  const [customLegacy, setCustomLegacy] = useState('');
  const [customWorldImpact, setCustomWorldImpact] = useState('');
  const [lastGenerationResult, setLastGenerationResult] = useState<{ 
    tone?: string; 
    prompt?: string; 
    imageUrl?: string;
    aiGenerated?: boolean;
    service?: string;
    placeholder?: boolean;
  } | null>(null);
  
  // Get data from stores
  const { currentEnding, getSessionSegments } = useNarrativeStore();
  const characters = useCharacterStore(state => state.characters);
  const worlds = useWorldStore((state) => state.worlds);
  
  const toneOptions: EndingTone[] = ['triumphant', 'mysterious', 'tragic', 'hopeful'];
  
  // Create a mock ending for testing
  const createMockEnding = (): StoryEnding => {
    const mockCharacter = (Object.values(characters) as StoreCharacter[])[0];
    const mockWorld = Object.values(worlds)[0];
    
    return {
      id: 'debug-ending',
      sessionId: 'debug-session',
      characterId: mockCharacter?.id || 'debug-character',
      worldId: mockWorld?.id || 'debug-world',
      type: 'player-choice' as EndingType,
      tone: selectedTone,
      epilogue: customEpilogue || "英雄站在国度边缘，回望自己所成就的一切。旅途漫长且充满挑战，但最终，他们找到了自己一直在追寻的东西。故事在圆满感与地平线上新起点的氛围中落幕。",
      characterLegacy: customLegacy || "英雄将被铭记为希望与勇气的灯塔。其行动激励他人追随脚步，产生了将世代回响的深远影响。",
      worldImpact: customWorldImpact || "世界因英雄的行动而永远改变。和平重归这片土地，人们得以再次乐观地展望未来。",
      timestamp: new Date(),
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
      achievements: [
        "命运主宰：以果断行动塑造了国度的命运",
        "人民英雄：以英勇事迹拯救了无数生命",
        "传奇诞生：成为将被世代传颂的故事"
      ]
    };
  };

  const generatePromptPreview = async () => {
    setIsGenerating(true);
    
    try {
      const mockEnding = currentEnding || createMockEnding();
      const character = characters[mockEnding.characterId] || (Object.values(characters) as StoreCharacter[])[0];
      const world = worlds[mockEnding.worldId] || Object.values(worlds)[0];
      
      // Get recent narrative segments for context
      let recentNarrative: string[] = [];
      if (currentEnding) {
        const recentSegments = getSessionSegments(currentEnding.sessionId);
        recentNarrative = recentSegments
          .slice(-5)
          .map(segment => segment.content);
      } else {
        // Mock narrative for testing
        recentNarrative = [
          "最终决战在黎明打响，盟友从国度各地集结。",
          "英雄以强力一击击败了长久肆虐这片土地的古老邪恶。",
          "和平重归王国，人民欢欣鼓舞。",
          "英雄望向同伴，知道他们共同的旅程即将结束。",
          "新的篇章正在开启，但这个故事已经走到结局。"
        ];
      }
      
      const params = {
        ending: mockEnding,
        world,
        characterName: character?.name,
        recentNarrative
      };

      logger.debug('Calling ending image API with data:', params);

      const result = await generateEndingImagePrompt(params);
      logger.debug('API response result:', result);

      setGeneratedPrompt(result.prompt || result.imageGenerationPrompt || "未返回提示词");
      setLastGenerationResult(result);

    } catch (error) {
      setGeneratedPrompt(`生成提示词时出错：${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const testFullGeneration = async () => {
    setIsGenerating(true);
    
    try {
      const mockEnding = currentEnding || createMockEnding();
      const character = characters[mockEnding.characterId] || (Object.values(characters) as StoreCharacter[])[0];
      const world = worlds[mockEnding.worldId] || Object.values(worlds)[0];
      
      // Get recent narrative segments for context
      let recentNarrative: string[] = [];
      if (currentEnding) {
        const recentSegments = getSessionSegments(currentEnding.sessionId);
        recentNarrative = recentSegments
          .slice(-5)
          .map(segment => segment.content);
      } else {
        // Mock narrative for testing
        recentNarrative = [
          "最终决战在黎明打响，盟友从国度各地集结。",
          "英雄以强力一击击败了长久肆虐这片土地的古老邪恶。",
          "和平重归王国，人民欢欣鼓舞。",
          "英雄望向同伴，知道他们共同的旅程即将结束。",
          "新的篇章正在开启，但这个故事已经走到结局。"
        ];
      }
      
      const params = {
        ending: mockEnding,
        world,
        characterName: character?.name,
        recentNarrative
      };

      logger.debug('Generating full ending image with data:', params);

      const result = await generateEndingImage(params);

      setGeneratedPrompt(result.imageGenerationPrompt || result.prompt || "未返回提示词");
      setLastGeneratedImage(result.imageUrl);
      setLastGenerationResult(result);
      
    } catch (error) {
      setGeneratedPrompt(`生成失败：${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  // Helper function to get CSS class for tone (from EndingScreen component)
  const getEndingCSSClass = (tone: EndingTone) => {
    return `ending-${tone}`;
  };

  // Tone backgrounds come from the live theme (--ending-* in the ds* theme
  // files) so the preview matches what EndingScreen actually renders under
  // the active data-theme. Muted-text token as the unknown-tone fallback.
  const getToneBackgroundColor = (tone: EndingTone) =>
    `var(--ending-${tone}, var(--color-text-muted))`;

  const currentCharacter = currentEnding ? characters[currentEnding.characterId] : (Object.values(characters) as StoreCharacter[])[0];
  const currentWorld = currentEnding ? worlds[currentEnding.worldId] : Object.values(worlds)[0];

  return (
    <CollapsibleSection title="结局图像生成调试" initialCollapsed={true}>
      <div>
        
        {/* Current Ending Info */}
        {currentEnding ? (
          <div>
            <h4>存在可用结局</h4>
            <div>
              <div><strong>叙事风格：</strong> {displayLabel(currentEnding.tone)}</div>
              <div><strong>类型：</strong> {displayLabel(currentEnding.type)}</div>
              <div><strong>角色：</strong> {currentCharacter?.name || "未知"}</div>
              <div><strong>世界：</strong> {currentWorld?.name || "未知"} ({currentWorld?.genre || "无类型"})</div>
            </div>
          </div>
        ) : (
          <div>
            <h4>没有有效结局</h4>
            <p>正在使用模拟数据进行测试。生成实际结局以查看真实提示词。</p>
          </div>
        )}

        {/* Tone & CSS Class Inspection */}
        {currentEnding && (
          <div>
            <h4>AI 选定的叙事风格与 CSS 检查</h4>
            <div>
              <div>
                <div><strong>AI 选择的叙事风格：</strong> <span>{displayLabel(currentEnding.tone)}</span></div>
                <div><strong>已应用的 CSS 类：</strong> <span>{getEndingCSSClass(currentEnding.tone)}</span></div>
              </div>
              
              {/* Visual Preview */}
              <div>
                <div>结局界面预览：</div>
                <div 
                  className={getEndingCSSClass(currentEnding.tone)}
                  style={{ backgroundColor: getToneBackgroundColor(currentEnding.tone) }}
                >
                  <div>剧终</div>
                  <div>{currentCharacter?.name} • {currentWorld?.name}</div>
                </div>
              </div>
              
              {/* Tone Color Reference */}
              <div>
                <div><strong>背景颜色：</strong> {getToneBackgroundColor(currentEnding.tone)}</div>
                <div><strong>CSS 中预期为：</strong> .ending-{displayLabel(currentEnding.tone)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Mock Ending Configuration */}
        {!currentEnding && (
          <div>
            <h4>模拟结局配置</h4>
            
            <div>
              <div>
                <label>结局叙事风格：</label>
                <Select 
                  value={selectedTone} 
                  onChange={(e) => setSelectedTone(e.target.value as EndingTone)}
                  
                >
                  {toneOptions.map((tone) => (
                    <option key={tone} value={tone}>
                      {capitalize(tone)}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label>自定义尾声（可选）：</label>
                <Textarea
                  value={customEpilogue}
                  onChange={(e) => setCustomEpilogue(e.target.value)}
                  placeholder="留空以使用默认模拟尾声……"
                  
                  rows={3}
                />
              </div>
              
              <div>
                <label>自定义角色传承（可选）：</label>
                <Textarea
                  value={customLegacy}
                  onChange={(e) => setCustomLegacy(e.target.value)}
                  placeholder="留空以使用默认模拟传承……"
                  
                  rows={2}
                />
              </div>
              
              <div>
                <label>自定义世界影响（可选）：</label>
                <Textarea
                  value={customWorldImpact}
                  onChange={(e) => setCustomWorldImpact(e.target.value)}
                  placeholder="留空以使用默认模拟世界影响……"
                  
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {/* Data Summary */}
        <div>
          <h4>数据摘要</h4>
          <div>
            <div><strong>角色：</strong> {currentCharacter?.name || "没有可用角色"}</div>
            <div><strong>世界：</strong> {currentWorld?.name || "没有可用世界"} ({currentWorld?.genre || "无类型"})</div>
            <div><strong>可用角色：</strong> {Object.keys(characters).length}</div>
            <div><strong>可用世界：</strong> {Object.keys(worlds).length}</div>
          </div>
        </div>

        {/* Prompt Generation */}
        <div>
          <div>
            <Button
              onClick={generatePromptPreview}
              
              size="sm"
              variant="default"
              disabled={isGenerating}
            >
              {isGenerating ? "正在生成……" : "生成提示词预览"}
            </Button>
            <Button
              onClick={testFullGeneration}
              
              size="sm"
              variant="success"
              disabled={isGenerating}
            >
              {isGenerating ? "正在生成……" : "测试完整生成"}
            </Button>
            {generatedPrompt && (
              <Button
                onClick={copyPromptToClipboard}
                
                size="sm"
                variant="secondary"
              >
                复制提示词
              </Button>
            )}
          </div>

          {generatedPrompt && (
            <div>
              <h4>生成的提示词：</h4>
              <pre>
                {generatedPrompt}
              </pre>
            </div>
          )}
        </div>

        {/* Last Generation Results */}
        {lastGenerationResult && (
          <div>
            <h4>上次生成结果：</h4>
            <div>
              
              {/* Tone Information */}
              {lastGenerationResult.tone && (
                <div>
                  <div><strong>生成所用叙事风格：</strong> <span>{displayLabel(lastGenerationResult.tone)}</span></div>
                  <div><strong>将使用的 CSS：</strong> <span>{getEndingCSSClass(lastGenerationResult.tone as EndingTone)}</span></div>
                  
                  {/* Tone Match Check */}
                  {currentEnding && currentEnding.tone !== lastGenerationResult.tone && (
                    <div>
                      <div>
                        <strong>警告：叙事风格不匹配！</strong> 当前结局叙事风格（{displayLabel(currentEnding.tone)}）与上次生成（{displayLabel(lastGenerationResult.tone)})
                      </div>
                    </div>
                  )}
                  
                  {currentEnding && currentEnding.tone === lastGenerationResult.tone && (
                    <div>
                      <div>
                        叙事风格与当前结局一致
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* API Response Details */}
              <div>
                <div><strong>AI 生成：</strong> {lastGenerationResult.aiGenerated ? "是" : "否（使用了备用方案）"}</div>
                <div><strong>服务：</strong> {lastGenerationResult.service || "未知"}</div>
                <div><strong>占位图：</strong> {lastGenerationResult.placeholder ? "是" : "否"}</div>
              </div>
              
              {/* Generated Image */}
              {lastGeneratedImage && (
                <div>
                  <div>生成的图像：</div>
                  <div>
                    <Image
                      src={lastGeneratedImage}
                      alt="生成的结局场景"
                      fill
                      
                      unoptimized // For base64 data URLs
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt Building Tips */}
        <div>
          <h4>结局图像提示词技巧：</h4>
          <ul>
            <li>叙事风格决定视觉氛围与配色</li>
            <li>世界主题影响美术风格与场景元素</li>
            <li>尾声内容影响画面构图</li>
            <li>角色的传承增添情感背景</li>
            <li>近期叙事提供故事专属细节</li>
            <li>成就可能影响象征元素</li>
          </ul>
        </div>

        {/* API Debug Info */}
        <div>
          <h4>API 调试信息：</h4>
          <div>
            <div><strong>接口地址：</strong> /api/generate-ending-image</div>
            <div><strong>模型：</strong> gemini-2.0-flash-preview-image-generation</div>
            <div><strong>安全性：</strong> 服务端 API 密钥（安全）</div>
            <div><strong>备用方案：</strong> AI 失败时使用主题占位图</div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
