import React from 'react';
import { World } from '@/types/world.types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { GENRES } from '@/lib/constants/genres';
import type { GenreValue } from '@/types/genre.types';

interface WorldBasicInfoFormProps {
  world: World;
  onChange: (updates: Partial<World>) => void;
}

const WorldBasicInfoForm: React.FC<WorldBasicInfoFormProps> = ({ world, onChange }) => {
  return (
    <div className="component-world-basic-info-form">
      <div className="form-group">
        <Label htmlFor="worldName">
          名称
        </Label>
        <Input
          id="worldName"
          type="text"
          placeholder="输入世界名称..."
          value={world.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <Label htmlFor="worldDescription">
          描述
        </Label>
        <Textarea
          id="worldDescription"
          placeholder="输入世界描述..."
          value={world.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="form-group">
        <Label htmlFor="worldGenre">
          题材
        </Label>
        <Select
          id="worldGenre"
          value={world.genre}
          onChange={(e) => onChange({ genre: e.target.value as GenreValue })}
        >
          {GENRES.map((genre) => (
            <option key={genre.value} value={genre.value}>
              {genre.label}
            </option>
          ))}
        </Select>
      </div>
      
      {/* World Type Section */}
      <div className="form-group">
        <Label htmlFor="worldType">
          世界类型
        </Label>
        <Select
          id="worldType"
          value={world.reference ? (world.relationship === 'set_within' ? 'set_within' : 'inspired_by') : 'original'}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'original') {
              onChange({ reference: undefined, relationship: undefined });
            } else if (value === 'set_within') {
              onChange({ relationship: 'set_within', reference: world.reference || '' });
            } else if (value === 'inspired_by') {
              onChange({ relationship: 'inspired_by', reference: world.reference || '' });
            }
          }}
        >
          <option value="original">原创世界</option>
          <option value="set_within">衍生世界</option>
          <option value="inspired_by">灵感来源</option>
        </Select>
      </div>

      {/* Reference field - only show if not original world */}
      {world.reference !== undefined && (
        <div className="form-group">
          <Label htmlFor="worldReference">
            {world.relationship === 'set_within' ? "设定于同一宇宙" : "灵感来源"}
          </Label>
          <Input
            id="worldReference"
            type="text"
            placeholder="例如：星球大战、指环王、哈利·波特"
            value={world.reference || ''}
            onChange={(e) => onChange({ reference: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default WorldBasicInfoForm;
