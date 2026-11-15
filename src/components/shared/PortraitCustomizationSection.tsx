import React from 'react';

interface PortraitCustomizationSectionProps {
  physicalDescription: string;
  setPhysicalDescription: (value: string) => void;
  environmentHint: string;
  setEnvironmentHint: (value: string) => void;
  className?: string;
}

export const PortraitCustomizationSection: React.FC<PortraitCustomizationSectionProps> = ({
  physicalDescription,
  setPhysicalDescription,
  environmentHint,
  setEnvironmentHint,
  className = ""
}) => {
  return (
    <div className={`${className}`}>
      <div>
        <label htmlFor="physical-desc" >
          外貌描述（用于肖像）
        </label>
        <textarea
          id="physical-desc"
          value={physicalDescription}
          onChange={(e) => setPhysicalDescription(e.target.value)}
          placeholder="例如：银色长发、绿色眼睛，身穿蓝色长袍……"
          
          rows={2}
        />
        <p>
          描述你希望在肖像中呈现的外貌细节。提示：添加“看起来像 [演员姓名]”可生成与特定人物相似的肖像。
        </p>
      </div>


      <div>
        <label htmlFor="environment" >
          环境/场景（可选）
        </label>
        <input
          id="environment"
          type="text"
          value={environmentHint}
          onChange={(e) => setEnvironmentHint(e.target.value)}
          placeholder="例如：森林中、王座厅、星舰舰桥……"
          
        />
      </div>
    </div>
  );
};
