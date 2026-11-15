import React from 'react';
import { errorStyles } from '@/styles/errorStyles';
import { localizeErrorMessage } from '@/lib/i18n/errors';

interface ErrorBlockProps {
  errors: string[];
  className?: string;
}

export const ErrorBlock: React.FC<ErrorBlockProps> = ({ errors, className }) => (
  <div className={className || errorStyles.container}>
    {errors.map((error: string, index: number) => (
      <p key={index} className={errorStyles.message}>
        {localizeErrorMessage(error)}
      </p>
    ))}
  </div>
);