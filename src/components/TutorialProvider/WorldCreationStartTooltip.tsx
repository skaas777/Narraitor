'use client';

import React from 'react';
import type { TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { useTutorial } from './useTutorial';
import { useSessionStore } from '@/state/sessionStore';

const CONTINUE_LABEL = "继续";

/** Custom data attached to tour steps via Joyride's Step.data property */
interface TourStepData {
  isEndOfPage?: boolean;
}

export function WorldCreationStartTooltip({
  backProps,
  index,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  const { content, hideBackButton, hideFooter, showSkipButton, styles, title } =
    step;
  const { pauseTour } = useTutorial();
  const updateTutorialProgress = useSessionStore(state => state.updateTutorialProgress);

  // Don't advance Joyride - the wizard-to-tour sync in TutorialProvider
  // will update the step index when the user advances through the wizard UI.
  // With spotlightClicks={true}, users can click wizard elements while
  // the tooltip is visible.
  const handleContinueClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    updateTutorialProgress('worldCreation', { lastStep: index });
    // Hide tooltip, keep tour state
    pauseTour('end-of-page');
  };

  const ariaLabel =
    typeof title === 'string'
      ? title
      : typeof content === 'string'
        ? content
        : "教程步骤";

  const stepData = step.data as TourStepData | undefined;
  const isEndOfPage = stepData?.isEndOfPage;

  const primaryLabel =
    primaryProps.title || primaryProps['aria-label'] || CONTINUE_LABEL;
  const backLabel = backProps.title || backProps['aria-label'] || "返回";
  const skipLabel = skipProps.title || skipProps['aria-label'] || "跳过世界创建教程";
  // react-joyride's skipProps doesn't formally include className, but the
  // rendered <button> accepts one. Widening here lets us strip-and-merge.
  const { className: skipClassName, ...skipButtonProps } =
    skipProps as typeof skipProps & { className?: string };

  return (
    <div
      key="JoyrideTooltip"
      aria-label={ariaLabel}
      className="react-joyride__tooltip"
      style={styles.tooltip}
      {...tooltipProps}
    >
      <div style={styles.tooltipContainer} >
        {title && <h1 style={styles.tooltipTitle}>{title}</h1>}
        <div style={styles.tooltipContent}>{content}</div>
      </div>
      {!hideFooter && (
        <div style={styles.tooltipFooter}>
          <div style={styles.tooltipFooterSpacer}>
            {showSkipButton && !isLastStep && (
              <Button
                aria-live="off"
                data-test-id="button-skip"
                type="button"
                variant="link"
                size="sm"
                className={skipClassName ? `${skipClassName}` : ''}
                {...skipButtonProps}
              >
                {skipLabel}
              </Button>
            )}
          </div>
          {!hideBackButton && index > 0 && (
            <Button
              data-test-id="button-back"
              style={styles.buttonBack}
              type="button"
              variant="ghost"
              size="sm"
              {...backProps}
            >
              {backLabel}
            </Button>
          )}
          
          <div>
            {isEndOfPage && !isLastStep ? (
              <Button
                data-test-id="button-pause"
                style={styles.buttonNext}
                type="button"
                aria-label="继续"
                title="继续"
                variant="default"
                size="sm"
                onClick={handleContinueClick}
              >
                继续
              </Button>
            ) : (
              <Button
                data-test-id="button-primary"
                style={styles.buttonNext}
                type="button"
                variant="default"
                size="sm"
                {...primaryProps}
              >
                {primaryLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
