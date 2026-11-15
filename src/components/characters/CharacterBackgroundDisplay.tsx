'use client';

import React from 'react';

interface CharacterBackground {
  history: string;
  personality: string;
  goals: string[];
  fears: string[];
  physicalDescription?: string;
}

interface CharacterBackgroundDisplayProps {
  background: CharacterBackground;
  showPersonality?: boolean;
}

export function CharacterBackgroundDisplay({
  background,
  showPersonality = true,
}: CharacterBackgroundDisplayProps) {
  return (
    <div className="character-detail-background">
      {/* History Section */}
      <div className="character-detail-background-section">
        <h3 className="character-detail-background-heading">历史</h3>
        <p className="character-detail-background-text">{background.history}</p>
      </div>

      {/* Personality Section (shown when not already in summary header) */}
      {showPersonality && background.personality && (
        <div className="character-detail-background-section">
          <h3 className="character-detail-background-heading">性格</h3>
          <p className="character-detail-background-text">
            {background.personality}
          </p>
        </div>
      )}

      {/* Goals Section */}
      {background.goals && background.goals.length > 0 && (
        <div className="character-detail-background-section">
          <h3 className="character-detail-background-heading">
            目标与动机
          </h3>
          {background.goals.length === 1 ? (
            <p className="character-detail-background-text">
              {background.goals[0]}
            </p>
          ) : (
            <ul className="character-detail-background-list">
              {background.goals.map((goal, index) => (
                <li key={index} className="character-detail-background-list-item">
                  {goal}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Fears Section */}
      {background.fears && background.fears.length > 0 && (
        <div className="character-detail-background-section">
          <h3 className="character-detail-background-heading">恐惧</h3>
          <ul className="character-detail-background-list">
            {background.fears.map((fear, index) => (
              <li key={index} className="character-detail-background-list-item">
                {fear}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Physical Description Section (optional) */}
      {background.physicalDescription && (
        <div className="character-detail-background-section">
          <h3 className="character-detail-background-heading">
            外貌
          </h3>
          <p className="character-detail-background-text">
            {background.physicalDescription}
          </p>
        </div>
      )}
    </div>
  );
}
