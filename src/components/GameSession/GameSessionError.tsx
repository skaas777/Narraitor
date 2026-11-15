'use client';

import React from 'react';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

interface GameSessionErrorProps {
  error: string;
  onRetry: () => void;
  onDismiss?: () => void;
}

const GameSessionError: React.FC<GameSessionErrorProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  return (
    <div data-testid="game-session-error">
      <ErrorDisplay
        variant="section"
        title="故事暂停了"
        message={error}
        severity="error"
        showRetry
        onRetry={onRetry}
        retryLabel="继续故事"
        showDismiss={!!onDismiss}
        onDismiss={onDismiss}
      />
    </div>
  );
};

export default GameSessionError;
