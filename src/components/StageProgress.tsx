/**
 * StageProgress Component
 * Shows current meeting stage and progress
 */

import React from 'react';
import { Target, CheckCircle } from 'lucide-react';
import { MeetingStage } from '../lib/meeting/meetingContext';

interface StageProgressProps {
  currentStage: MeetingStage;
  progress: number; // 0-100
  milestone: string;
}

const STAGE_LABELS: Record<MeetingStage, string> = {
  kickoff: 'Kickoff',
  problem_exploration: 'Problem Exploration',
  as_is: 'As-Is Process',
  to_be: 'To-Be Vision',
  wrap_up: 'Wrap-Up'
};

const STAGE_DESCRIPTIONS: Record<MeetingStage, string> = {
  kickoff: 'Establish rapport and understand project scope',
  problem_exploration: 'Identify 2-3 specific pain points with examples',
  as_is: 'Map end-to-end process with systems and handoffs',
  to_be: 'Explore desired improvements and priorities',
  wrap_up: 'Confirm understanding and establish next steps'
};

const StageProgress: React.FC<StageProgressProps> = ({
  currentStage,
  progress,
  milestone
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-3">
        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {STAGE_LABELS[currentStage]}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {STAGE_DESCRIPTIONS[currentStage]}
          </p>
        </div>
        {progress >= 100 && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400">
        <span className="font-medium">Next:</span> {milestone}
      </div>
    </div>
  );
};

export default StageProgress;

