import React from 'react';
import { wizardStyles } from './styles/wizardStyles';
import { localizeErrorMessage } from '@/lib/i18n/errors';

interface WizardStepProps {
  children: React.ReactNode;
  error?: string | null;
  className?: string;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  children,
  error,
  className = '',
}) => {
  return (
    <div className={`${wizardStyles.step.content} ${className}`}>
      {error && (
        <div key="wizard-step-error" className={wizardStyles.errorContainer}>
          <p>{localizeErrorMessage(error)}</p>
        </div>
      )}
      {children}
    </div>
  );
};
