'use client';

import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardGettingStartedProps {
  hasWorlds: boolean;
  hasCharacters: boolean;
  hasSessions: boolean;
  onNavigate: (path: string) => void;
}

export function DashboardGettingStarted({
  hasWorlds,
  hasCharacters,
  hasSessions,
  onNavigate,
}: DashboardGettingStartedProps) {
  const steps = [
    {
      id: 'world',
      label: "创建世界",
      completed: hasWorlds,
      cta: "创建你的世界",
      path: '/worlds',
    },
    {
      id: 'character',
      label: "创建角色",
      completed: hasCharacters,
      cta: "创建角色",
      path: '/characters',
    },
    {
      id: 'play',
      label: "开始游玩",
      completed: hasSessions,
      cta: "开始游玩",
      path: '/worlds',
    },
  ];

  const nextStep = steps.find((step) => !step.completed);

  return (
    <section
      className="component-dashboard-getting-started"
      aria-labelledby="getting-started-heading"
    >
      <h2 id="getting-started-heading">开始使用</h2>

      <ol className="dashboard-getting-started-steps">
        {steps.map((step) => {
          const Icon = step.completed ? CheckCircle : Circle;
          return (
            <li
              key={step.id}
              className={
                'dashboard-getting-started-step' +
                (step.completed ? ' dashboard-getting-started-step-complete' : '')
              }
            >
              <Icon aria-hidden="true" className="dashboard-getting-started-step-icon" />
              <span className="dashboard-getting-started-step-label">{step.label}</span>
            </li>
          );
        })}
      </ol>

      {nextStep && (
        <Button
          onClick={() => onNavigate(nextStep.path)}
          variant="default"
          size="lg"
          className="dashboard-getting-started-cta"
        >
          {nextStep.cta}
        </Button>
      )}
    </section>
  );
}
