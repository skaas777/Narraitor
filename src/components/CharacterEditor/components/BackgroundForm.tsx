import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Background {
  history: string;
  personality: string;
  goals: string[];
  fears: string[];
  physicalDescription?: string;
}

interface BackgroundFormProps {
  background: Background;
  onBackgroundChange: (background: Background) => void;
}

export const BackgroundForm: React.FC<BackgroundFormProps> = ({
  background,
  onBackgroundChange
}) => {
  const handleChange = (field: keyof Background, value: string | string[]) => {
    onBackgroundChange({
      ...background,
      [field]: value
    });
  };

  return (
    <div className="component-background-form">
      <div className="background-form-fields">
        <div className="form-group">
          <Label>
            历史
          </Label>
          <Textarea
            value={background.history || ''}
            onChange={(e) => handleChange('history', e.target.value)}
            rows={4}
            placeholder="描述你角色的经历与背景……"
          />
        </div>

        <div className="form-group">
          <Label>
            性格
          </Label>
          <Textarea
            value={background.personality || ''}
            onChange={(e) => handleChange('personality', e.target.value)}
            rows={3}
            placeholder="描述你角色的性格特征……"
          />
        </div>

        <div className="form-group">
          <Label>
            目标与动机
          </Label>
          <Textarea
            value={background.goals?.join('\n') || ''}
            onChange={(e) => handleChange('goals', e.target.value.split('\n').filter(g => g.trim()))}
            rows={3}
            placeholder="列出你角色的目标与动机（每行一个）"
          />
          <p className="form-help-text">
            每行输入一个目标
          </p>
        </div>

        <div className="form-group">
          <Label>
            恐惧
          </Label>
          <Textarea
            value={background.fears?.join('\n') || ''}
            onChange={(e) => handleChange('fears', e.target.value.split('\n').filter(f => f.trim()))}
            rows={2}
            placeholder="你的角色害怕什么？（每行一个）"
          />
          <p className="form-help-text">
            每行输入一项恐惧
          </p>
        </div>

        <div className="form-group">
          <Label>
            外貌描述
          </Label>
          <Textarea
            value={background.physicalDescription || ''}
            onChange={(e) => handleChange('physicalDescription', e.target.value)}
            rows={3}
            placeholder="描述你角色的外貌、显著特征和穿衣风格……"
          />
          <p className="form-help-text">
            此描述将用于生成角色肖像。提示：添加 “长得像 [演员姓名]” 可生成与特定人物相似的肖像。
          </p>
        </div>
      </div>
    </div>
  );
};
