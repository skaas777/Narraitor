import React from 'react';
import { WorldSettings } from '@/types/world.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToneSettings } from '@/types/tone-settings.types';
import { ToneSettingsForm } from './ToneSettingsForm';

interface WorldSettingsFormProps {
  settings: WorldSettings;
  toneSettings?: ToneSettings;
  onChange: (settings: WorldSettings) => void;
  onToneSettingsChange?: (toneSettings: ToneSettings) => void;
}

const WorldSettingsForm: React.FC<WorldSettingsFormProps> = ({ 
  settings, 
  toneSettings, 
  onChange, 
  onToneSettingsChange 
}) => {
  const handleChange = (field: keyof WorldSettings, value: number) => {
    onChange({
      ...settings,
      [field]: value
    });
  };
  
  return (
    <div className="component-world-settings-form">
      <section>
        <h3>世界设置</h3>

        <div>
          <div className="form-group">
            <Label htmlFor="maxAttributes">
              最大属性数
            </Label>
            <p id="maxAttributes-description">角色可拥有的最大属性数量</p>
            <Input
              id="maxAttributes"
              type="number"
              value={settings.maxAttributes}
              onChange={(e) => handleChange('maxAttributes', parseInt(e.target.value))}
              min={1}
              aria-describedby="maxAttributes-description"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="maxSkills">
              最大技能数
            </Label>
            <p id="maxSkills-description">角色可拥有的最大技能数量</p>
            <Input
              id="maxSkills"
              type="number"
              value={settings.maxSkills}
              onChange={(e) => handleChange('maxSkills', parseInt(e.target.value))}
              min={1}
              aria-describedby="maxSkills-description"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="attributePointPool">
              属性点池
            </Label>
            <p id="attributePointPool-description">可用于分配到属性上的总点数</p>
            <Input
              id="attributePointPool"
              type="number"
              value={settings.attributePointPool}
              onChange={(e) => handleChange('attributePointPool', parseInt(e.target.value))}
              min={1}
              aria-describedby="attributePointPool-description"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="skillPointPool">
              技能点池
            </Label>
            <p id="skillPointPool-description">可用于分配到技能上的总点数</p>
            <Input
              id="skillPointPool"
              type="number"
              value={settings.skillPointPool}
              onChange={(e) => handleChange('skillPointPool', parseInt(e.target.value))}
              min={1}
              aria-describedby="skillPointPool-description"
            />
          </div>
        </div>
      </section>

      {/* Tone Settings Section */}
      {onToneSettingsChange && (
        <ToneSettingsForm
          toneSettings={toneSettings}
          onToneSettingsChange={onToneSettingsChange}
        />
      )}
    </div>
  );
};

export default WorldSettingsForm;
