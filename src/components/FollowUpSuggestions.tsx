/**
 * FollowUpSuggestions Component
 * Displays suggested follow-up questions
 */

import React from 'react';
import { Lightbulb, ChevronRight } from 'lucide-react';

interface FollowUp {
  type: string;
  question: string;
  rationale: string;
}

interface FollowUpSuggestionsProps {
  followUps: FollowUp[];
  onSelect: (question: string) => void;
}

const FollowUpSuggestions: React.FC<FollowUpSuggestionsProps> = ({
  followUps,
  onSelect
}) => {
  if (!followUps || followUps.length === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center space-x-2 mb-3">
        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Suggested Follow-up Questions
        </h3>
      </div>

      <div className="space-y-2">
        {followUps.map((followUp, index) => (
          <button
            key={index}
            onClick={() => onSelect(followUp.question)}
            className="w-full text-left bg-white dark:bg-gray-800 rounded-lg p-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-700"
          >
            <div className="flex items-start space-x-2">
              <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white mb-1">
                  {followUp.question}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {followUp.rationale}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpSuggestions;

