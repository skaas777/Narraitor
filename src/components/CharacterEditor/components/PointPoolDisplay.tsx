import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface PointPool {
  total: number;
  spent: number;
  remaining: number;
}

interface PointPoolDisplayProps {
  pool: PointPool;
  label?: string;
}

export const PointPoolDisplay: React.FC<PointPoolDisplayProps> = ({
  pool,
  label = "点数池",
}) => {
  const isOverBudget = pool.remaining < 0;
  const statusText = isOverBudget
    ? `超出预算 ${Math.abs(pool.remaining)} 点！`
    : pool.remaining === 0
      ? "所有点数已分配！"
      : `剩余 ${pool.remaining} 点`;

  return (
    <div
      className={clsx(
        'component-point-pool-display',
        isOverBudget && 'is-over-budget'
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div>
        <div>
          <span>{label}</span>
          <div className="component-point-pool-display-stats">
            <span>
              总计： <span>{pool.total}</span>
            </span>
            <span className={clsx(isOverBudget && 'point-pool-over-budget')}>
              {isOverBudget ? `超出预算：${Math.abs(pool.remaining)}` : `剩余：${pool.remaining}`}
            </span>
          </div>
        </div>
        <div>
          {pool.remaining === 0 && (
            <span>
              <CheckCircle aria-hidden="true" />
              已全部分配！
            </span>
          )}
          {isOverBudget && (
            <span className="point-pool-error-tag">
              <AlertCircle aria-hidden="true" />
              超出预算！
            </span>
          )}
        </div>
      </div>
      <span className="sr-only">{statusText}</span>
    </div>
  );
};
