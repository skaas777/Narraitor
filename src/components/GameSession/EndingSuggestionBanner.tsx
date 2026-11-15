import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface EndingSuggestionBannerProps {
  reason: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export function EndingSuggestionBanner({
  reason,
  onAccept,
  onDismiss,
}: EndingSuggestionBannerProps) {
  return (
    <Alert variant="warning" className="ending-suggestion-banner">
      <AlertTitle>
        你的故事可以在此结束
      </AlertTitle>
      <AlertDescription>{reason}</AlertDescription>
      <div className="ending-suggestion-banner-actions">
        <Button size="sm" onClick={onAccept}>
          查看结局
        </Button>
        <Button size="sm" variant="secondary" onClick={onDismiss}>
          继续游玩
        </Button>
      </div>
    </Alert>
  );
}
