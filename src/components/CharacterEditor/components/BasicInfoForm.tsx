import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface BasicInfoFormProps {
  name: string;
  level: number;
  isPlayer: boolean;
  onNameChange: (name: string) => void;
  onLevelChange: (level: number) => void;
  onPlayerTypeChange: (isPlayer: boolean) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  name,
  level,
  isPlayer,
  onNameChange,
  onLevelChange,
  onPlayerTypeChange
}) => {
  return (
    <div className="component-basic-info-form">
      <div className="form-group">
        <Label htmlFor="character-name">
          角色名称 <span>*</span>
        </Label>
        <Input
          id="character-name"
          type="text"
          placeholder="输入角色名称……"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="form-group">
        <Label htmlFor="character-level">
          等级
        </Label>
        <Select
          id="character-level"
          value={level}
          onChange={(e) => onLevelChange(parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
            <option key={level} value={level}>等级 {level}</option>
          ))}
        </Select>
      </div>

      <div className="form-group">
        <Label htmlFor="character-type">
          角色类型
        </Label>
        <Select
          id="character-type"
          value={isPlayer ? 'player' : 'npc'}
          onChange={(e) => onPlayerTypeChange(e.target.value === 'player')}
        >
          <option value="player">玩家角色</option>
          <option value="npc">非玩家角色（NPC）</option>
        </Select>
      </div>
    </div>
  );
};