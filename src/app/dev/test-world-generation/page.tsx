'use client';

import { useState } from 'react';
import { generateWorld } from '@/lib/generators/worldGenerator';
import type { GeneratedWorldData } from '@/lib/generators/worldGenerator';
import { displayLabel } from '@/lib/i18n/zhCN';
import { localizeErrorMessage } from '@/lib/i18n/errors';

export default function TestWorldGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorld, setGeneratedWorld] = useState<GeneratedWorldData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testCases = [
    { reference: 'The Office', relationship: 'set_within' as const, expectedGenre: 'modern' },
    { reference: 'Star Wars', relationship: 'set_within' as const, expectedGenre: 'Sci-Fi' },
    { reference: 'Lord of the Rings', relationship: 'set_within' as const, expectedGenre: 'Fantasy' },
    { reference: 'Breaking Bad', relationship: 'set_within' as const, expectedGenre: 'modern' },
    { reference: 'The Walking Dead', relationship: 'set_within' as const, expectedGenre: 'Post-Apocalyptic' },
  ];

  const runTest = async (testCase: typeof testCases[0]) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedWorld(null);

    try {
      const result = await generateWorld({
        method: 'ai',
        reference: testCase.reference,
        relationship: testCase.relationship,
        existingNames: []
      });

      setGeneratedWorld(result);

      // Check if genre matches expected
      if (result.genre !== testCase.expectedGenre) {
        setError(`预期类型为 &quot;${testCase.expectedGenre}&quot;，但实际得到 &quot;${result.genre}&quot;`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h1>世界生成类型测试</h1>
      
      <div>
        <p>
          测试设定在非奇幻宇宙中的世界不会获得奇幻类型或元素。
        </p>
      </div>

      <div>
        {testCases.map((testCase) => (
          <div key={testCase.reference} >
                        <button
                           onClick={() => runTest(testCase)}
                           disabled={isGenerating}
                         >
                           测试 “{testCase.reference}&quot;
                         </button>            <span>
              预期类型： {testCase.expectedGenre}
            </span>
          </div>
        ))}
      </div>

      {isGenerating && (
        <div>
          <p>正在生成世界……</p>
        </div>
      )}

      {error && (
        <div>
          <p>错误：</p>
          <p>{localizeErrorMessage(error)}</p>
        </div>
      )}

      {generatedWorld && (
        <div>
          <h2>已生成的世界</h2>
          
          <div>
            <div>
              <span>名称：</span> {generatedWorld.name}
            </div>
            <div>
              <span>类型：</span> {displayLabel(generatedWorld.genre)}
              {generatedWorld.genre === 'Fantasy' && !generatedWorld.name.includes('Lord') && (
                <span>（❌ 不应为奇幻！）</span>
              )}
            </div>
            <div>
              <span>描述：</span> {generatedWorld.description}
            </div>
          </div>

          <div>
            <h3>属性（{generatedWorld.attributes.length}):</h3>
            <ul>
              {generatedWorld.attributes.map((attr, i) => (
                <li key={i}>
                  <span>{attr.name}:</span> {attr.description}
                  {attr.name.match(/magic|mana|arcane/i) && (
                    <span>（❌ 奇幻元素！）</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>技能（{generatedWorld.skills.length}):</h3>
            <ul>
              {generatedWorld.skills.map((skill, i) => (
                <li key={i}>
                  <span>{skill.name}:</span> {skill.description}
                  {skill.name.match(/magic|spell|sorcery|enchant/i) && (
                    <span>（❌ 奇幻元素！）</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
