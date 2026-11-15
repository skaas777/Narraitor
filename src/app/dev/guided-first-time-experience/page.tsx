'use client';

import React, { useState } from 'react';
import { GuidedFirstTimeExperience } from '@/components/GuidedFirstTimeExperience';
import { useSessionStore } from '@/state/sessionStore';
import Logger from '@/lib/utils/logger';

const logger = new Logger('GuidedFTEDev');

export default function GuidedFirstTimeExperienceTestHarness() {
  const [resetKey, setResetKey] = useState(0);
  const {
    completeTutorialPhase,
    resetTutorialProgress,
    shouldShowOnboarding,
    isFirstTimeUser,
  } = useSessionStore();

  const showOnboarding = shouldShowOnboarding();

  const handleReset = () => {
    resetTutorialProgress();
    setResetKey(prev => prev + 1);
  };

  const handleMarkCompleted = () => {
    completeTutorialPhase('intro');
    setResetKey(prev => prev + 1);
  };

  const handleClearStorage = async () => {
    // Clear IndexedDB storage completely
    if (typeof window !== 'undefined') {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            if (db.name) {
              const deleteReq = indexedDB.deleteDatabase(db.name);
              return new Promise((resolve, reject) => {
                deleteReq.onsuccess = () => resolve(undefined);
                deleteReq.onerror = () => reject(deleteReq.error);
              });
            }
          })
        );
        
        // Also clear localStorage
        localStorage.clear();
        
        // Force page reload to reinitialize stores
        window.location.reload();
      } catch (error) {
        logger.error('Error clearing storage:', error);
      }
    }
  };

  return (
    <div>
      <div>
        <div>
          <h1>
            引导式首次体验测试台
          </h1>
          
          <div>
            <div>
              <span>
                引导状态：
              </span>
              <span className={`${
                !showOnboarding
                  ? ''
                  : ''
              }`}>
                {!showOnboarding ? "已完成" : "未完成"}
              </span>
            </div>

            {/* Debug info */}
            <div>
              显示引导： {showOnboarding.toString()} | 是否首次使用： {isFirstTimeUser?.().toString() || 'undefined'}
            </div>
            
            <button
              onClick={handleReset}
            >
              重置（显示引导）
            </button>
            
            <button
              onClick={handleMarkCompleted}
            >
              标记为已完成（隐藏引导）
            </button>
            
            <button
              onClick={handleClearStorage}
            >
              清除所有存储并重新加载
            </button>
          </div>
          
          <div>
            <h2>测试说明：</h2>
            <ul>
              <li>• 测试完整的三步引导流程</li>
              <li>• 验证跳过功能是否正常工作</li>
              <li>• 通过调整窗口大小测试移动端适配</li>
              <li>• 确保进度指示器正确更新</li>
              <li>• 验证完成时的世界创建与跳转</li>
              <li>• 测试标记为已完成后引导不再显示</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div>
        <div>
          <div key={resetKey} >
            <GuidedFirstTimeExperience />

            {!showOnboarding && (
              <div>
                <div>
                  <h3>
                    引导已完成
                  </h3>
                  <p>
                    回访用户不会看到引导体验。
                  </p>
                  <button
                    onClick={handleReset}
                  >
                    重置以再次测试
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
