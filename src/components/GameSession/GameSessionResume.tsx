'use client';

import React from 'react';
import { SavedSessionInfo } from '@/types/game.types';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

interface GameSessionResumeProps {
  savedSession: SavedSessionInfo;
  onResume: () => void;
  onNewGame: () => void;
}

const GameSessionResume: React.FC<GameSessionResumeProps> = ({
  savedSession,
  onResume,
  onNewGame,
}) => {
  const formattedDate = formatDateTime(savedSession.lastPlayed);

  return (
    <div data-testid="game-session-resume" >
      <div>
        <h2>继续你的故事？</h2>
        
        <div>
          <p>上次游玩： {formattedDate}</p>
          <p>进度： {savedSession.narrativeCount} 个场景</p>
        </div>
        
        <div>
          <Button
            onClick={onResume}
            
            data-testid="resume-session-button"
            variant="default"
          >
            继续冒险
          </Button>
          
          <Button
            onClick={onNewGame}
            
            data-testid="new-session-button"
            variant="secondary"
          >
            开始新冒险
          </Button>
        </div>
        
        <p>
          开始新冒险将保存当前进度
        </p>
      </div>
    </div>
  );
};

export default GameSessionResume;
