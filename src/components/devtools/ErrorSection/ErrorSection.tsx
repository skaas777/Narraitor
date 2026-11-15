'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { runtimeErrorLogger } from '@/lib/devtools/runtimeErrorLogger';
import { 
  ErrorSeverity, 
  ErrorCategory, 
  type RuntimeError, 
  type ErrorFilter,
  type ErrorStatistics 
} from '@/types/runtime-error.types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { displayLabel } from '@/lib/i18n/zhCN';
import { localizeErrorMessage } from '@/lib/i18n/errors';

/**
 * Component for displaying and managing runtime errors in DevTools
 */
export const ErrorSection = () => {
  const [errors, setErrors] = useState<RuntimeError[]>([]);
  const [statistics, setStatistics] = useState<ErrorStatistics | null>(null);
  const [filter, setFilter] = useState<ErrorFilter>({
    severity: [],
    category: [],
    dismissed: false
  });
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  // Load errors and statistics
  const loadData = useCallback(() => {
    const filteredErrors = runtimeErrorLogger.getErrors(filter);
    const stats = runtimeErrorLogger.getStatistics();
    setErrors(filteredErrors);
    setStatistics(stats);
  }, [filter]);

  // Load data on mount and when filter changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle filter changes
  const handleSeverityFilter = (severity: ErrorSeverity, checked: boolean) => {
    setFilter(prev => ({
      ...prev,
      severity: checked 
        ? [...(prev.severity || []), severity]
        : (prev.severity || []).filter(s => s !== severity)
    }));
  };

  const handleCategoryFilter = (category: ErrorCategory, checked: boolean) => {
    setFilter(prev => ({
      ...prev,
      category: checked
        ? [...(prev.category || []), category]
        : (prev.category || []).filter(c => c !== category)
    }));
  };

  const handleShowDismissed = (checked: boolean) => {
    setFilter(prev => ({
      ...prev,
      dismissed: checked
    }));
  };

  // Error actions
  const handleDismissError = (errorId: string) => {
    runtimeErrorLogger.dismissError(errorId);
    loadData();
  };

  const handleClearAll = () => {
    runtimeErrorLogger.clearErrors();
    loadData();
  };

  const toggleErrorExpanded = (errorId: string) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('zh-CN');
  };

  return (
    <div>
      {/* Error Statistics */}
      <div>
        <div>
          <h4>运行时错误</h4>
          {statistics && statistics.total > 0 && (
            <Button
              onClick={handleClearAll}
              variant="destructive"
              size="sm"
              
            >
              全部清除
            </Button>
          )}
        </div>
        
        {statistics && (
          <div>
            <div>
              <span>总计： {statistics.total}</span>
              <span>最近： {statistics.recentCount}</span>
            </div>
            <div>
              {Object.entries(statistics.bySeverity).map(([severity, count]) => 
                count > 0 && (
                  <span key={severity} >
                    {displayLabel(severity)}: {count}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <CollapsibleSection title="筛选" initialCollapsed={true}>
        <div>
          {/* Severity Filter */}
          <div>
            <h5>严重程度</h5>
            <div>
              {Object.values(ErrorSeverity).map(severity => (
                <label key={severity} >
                  <Checkbox
                    checked={(filter.severity || []).includes(severity)}
                    onChange={(e) => handleSeverityFilter(severity, e.target.checked)}
                    aria-label={`按 ${severity.charAt(0).toUpperCase() + severity.slice(1)} 严重程度筛选错误`}
                  />
                  <span>{displayLabel(severity)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h5>分类</h5>
            <div>
              {Object.values(ErrorCategory).map(category => (
                <label key={category} >
                  <Checkbox
                    checked={(filter.category || []).includes(category)}
                    onChange={(e) => handleCategoryFilter(category, e.target.checked)}
                    aria-label={`按 ${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} 类别筛选错误`}
                  />
                  <span>{category.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Show Dismissed Toggle */}
          <div>
            <label>
              <Checkbox
                checked={filter.dismissed || false}
                onChange={(e) => handleShowDismissed(e.target.checked)}
                aria-label="除活动错误外，还显示已忽略的错误"
              />
              <span>显示已忽略的错误</span>
            </label>
          </div>

          <Button 
            onClick={loadData} 
            size="sm" 
            
          >
            应用筛选
          </Button>
        </div>
      </CollapsibleSection>

      {/* Error List */}
      <div>
        {errors.length === 0 ? (
          <div>
            未捕获到运行时错误
          </div>
        ) : (
          errors.map((error) => (
            <div
              key={error.id}
            >
              {/* Error Header */}
              <div>
                <div>
                  <div>
                    <Badge>
                      {displayLabel(error.severity.toUpperCase())}
                    </Badge>
                    <Badge variant="outline" >
                      {displayLabel(error.category)}
                    </Badge>
                    {error.count > 1 && (
                      <Badge variant="secondary-static" >
                        {error.count}次
                      </Badge>
                    )}
                    <span>
                      {formatTimestamp(error.timestamp)}
                    </span>
                  </div>
                  <p>
                    {localizeErrorMessage(error.message)}
                  </p>
                </div>
                
                <div>
                  <Button
                    onClick={() => toggleErrorExpanded(error.id)}
                    variant="ghost"
                    size="sm"
                    
                    aria-label="查看错误详情"
                  >
                    {expandedErrors.has(error.id) ? '−' : '+'}
                  </Button>
                  {!error.dismissed && (
                    <Button
                      onClick={() => handleDismissError(error.id)}
                      variant="ghost"
                      size="sm"
                      
                      aria-label="忽略错误"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded Error Details */}
              {expandedErrors.has(error.id) && (
                <div>
                  {/* Stack Trace */}
                  {error.stack && (
                    <div>
                      <h6>堆栈跟踪</h6>
                      <pre>
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Context */}
                  {error.componentContext && (
                    <div>
                      <h6>组件上下文</h6>
                      <div>
                        <div>组件： {error.componentContext.componentName}</div>
                        <pre>
                          {error.componentContext.componentStack}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* State Snapshot */}
                  {error.stateSnapshot && (
                    <div>
                      <h6>状态快照</h6>
                      <div>
                        <div>路由： {error.stateSnapshot.route}</div>
                        <div>URL： {error.stateSnapshot.url}</div>
                        <div>用户代理： {error.stateSnapshot.userAgent}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};