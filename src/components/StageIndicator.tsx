import React from 'react';
import { MeetingStage, STAGE_CONFIGS } from '../types/stages';

interface StageIndicatorProps {
  currentStage: MeetingStage;
}

const stageEmojis = {
  problem_exploration: '🔍',
  as_is: '📋',
  to_be: '✨',
  wrap_up: '✅'
};

export const StageIndicator: React.FC<StageIndicatorProps> = ({ currentStage }) => {
  const config = STAGE_CONFIGS[currentStage];
  const emoji = stageEmojis[currentStage];
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-b border-blue-200 dark:border-blue-700">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              {currentStage.replace('_', ' ').toUpperCase()} STAGE
            </h2>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {config.stageObjective}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
