/**
 * ContextTracker Component
 * Shows topics covered and pain points identified
 */

import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

interface PainPoint {
  area: string;
  impact: string;
  emotion: string;
  layer: number;
}

interface ContextTrackerProps {
  topicsCovered: string[];
  painPoints: PainPoint[];
  informationLayer: number;
}

const ContextTracker: React.FC<ContextTrackerProps> = ({
  topicsCovered,
  painPoints,
  informationLayer
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          What You've Learned So Far
        </h3>
      </div>

      {topicsCovered.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Topics Covered
          </h4>
          <div className="flex flex-wrap gap-2">
            {topicsCovered.map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {painPoints.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Problems Found ({painPoints.length})
            </h4>
          </div>
          <div className="space-y-2">
            {painPoints.map((point, index) => (
              <div
                key={index}
                className="bg-red-50 dark:bg-red-900/20 rounded p-2 border border-red-200 dark:border-red-800"
              >
                <div className="text-xs font-medium text-red-900 dark:text-red-100">
                  {point.area}
                </div>
                <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {point.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">How deep you've gone:</span>{' '}
          {informationLayer === 1 ? 'Surface level - basic info' :
            informationLayer === 2 ? 'Getting specific - examples and details' :
            informationLayer === 3 ? 'Understanding feelings - frustrations and impact' :
            informationLayer === 4 ? 'Finding root causes - why this happens' :
            'Deep insights - what they\'ve tried and what might work'}
        </div>
      </div>
    </div>
  );
};

export default ContextTracker;
