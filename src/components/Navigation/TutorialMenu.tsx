'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTutorial } from '@/components/TutorialProvider';
import { useSessionStore } from '@/state/sessionStore';
import { Button } from '@/components/ui/button';
import { HelpCircle, RefreshCw, CheckCircle } from 'lucide-react';
import Logger from '@/lib/utils/logger';

const logger = new Logger('TutorialMenu');
const RESET_DELAY_MS = 100;

export function TutorialMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { resetTutorial } = useTutorial();
  const tutorialProgress = useSessionStore((state) => state.tutorialProgress);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleRestart = async () => {
    if (confirm("确定要重置所有教程进度吗？")) {
      try {
        resetTutorial();
        setIsOpen(false);
        // Best-effort delay for IndexedDB persist to complete
        // Zustand persist doesn't expose a flush/ready API for writes,
        // so we use a small delay. 100ms is generally sufficient for
        // IndexedDB operations on modern browsers.
        await new Promise((resolve) => setTimeout(resolve, RESET_DELAY_MS));
        window.location.reload();
      } catch (error) {
        logger.error('Failed to reset tutorial', error);
      }
    }
  };

  return (
    <div ref={dropdownRef} className="tutorial-menu">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        aria-label="帮助与教程"
      >
        <HelpCircle />
      </Button>

      {isOpen && (
        <div>
          <div>
            <h4>教程进度</h4>
          </div>

          <div>
            {Object.entries(tutorialProgress.phases).map(([phase, data]) => (
              <div key={phase}>
                <span>{phase.replace(/([A-Z])/g, '$1')}</span>
                {data.completed ? (
                  <CheckCircle />
                ) : data.skipped ? (
                  <span>已跳过</span>
                ) : 'lastStep' in data &&
                  (data as { lastStep: number }).lastStep > 0 ? (
                  <span>进行中</span>
                ) : (
                  <span>未开始</span>
                )}
              </div>
            ))}
          </div>

          <div>
            <Button variant="ghost" onClick={handleRestart}>
              <RefreshCw />
              重置所有教程
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
