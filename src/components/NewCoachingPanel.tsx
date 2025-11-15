/**
 * NewCoachingPanel Component
 * Displays coaching feedback based on question evaluation
 */

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

interface CoachingFeedback {
  verdict_label: string;
  summary: string;
  what_happened: string;
  why_it_matters: string;
  what_to_do: string;
  suggested_rewrite?: string | null;
  rewrite_explanation?: string | null;
  principle: string;
  action: 'CONTINUE' | 'ACKNOWLEDGE_AND_RETRY' | 'PAUSE_FOR_COACHING';
  acknowledgement_required: boolean;
}

interface NewCoachingPanelProps {
  coaching: CoachingFeedback | null;
  onAcknowledge: () => void;
  onUseRewrite?: (rewrite: string) => void;
  onClose?: () => void;
}

const NewCoachingPanel: React.FC<NewCoachingPanelProps> = ({
  coaching,
  onAcknowledge,
  onUseRewrite,
  onClose
}) => {
  if (!coaching) return null;

  const getVerdictIcon = () => {
    if (coaching.verdict_label.includes('✅')) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (coaching.verdict_label.includes('⚠️')) return <AlertTriangle className="w-6 h-6 text-amber-600" />;
    return <XCircle className="w-6 h-6 text-red-600" />;
  };

  const getVerdictColor = () => {
    if (coaching.verdict_label.includes('✅')) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (coaching.verdict_label.includes('⚠️')) return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
    return 'border-red-500 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className={`border-l-4 ${getVerdictColor()} p-6 rounded-r-lg shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getVerdictIcon()}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {coaching.verdict_label}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {coaching.summary && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {coaching.summary}
          </p>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
          {coaching.what_happened && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                What happened
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {coaching.what_happened}
              </p>
            </div>
          )}

          {coaching.why_it_matters && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Why this matters
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {coaching.why_it_matters}
              </p>
            </div>
          )}

          {coaching.what_to_do && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                What to do next
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {coaching.what_to_do}
              </p>
            </div>
          )}

          {coaching.suggested_rewrite && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Try asking this instead
              </h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-900 dark:text-white italic">
                  "{coaching.suggested_rewrite}"
                </p>
              </div>
              {coaching.rewrite_explanation && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {coaching.rewrite_explanation}
                </p>
              )}
            </div>
          )}
        </div>

        {coaching.principle && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              {coaching.principle}
            </p>
          </div>
        )}

        {/* Button layout based on flow requirements */}
        {coaching.acknowledgement_required && (
          <div className="space-y-2">
            {/* If suggested rewrite exists: Show primary "Use suggested question" button, secondary "Got it" */}
            {coaching.suggested_rewrite && onUseRewrite ? (
              <>
                <button
                  onClick={() => onUseRewrite(coaching.suggested_rewrite!)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Use suggested question
                </button>
                <button
                  onClick={onAcknowledge}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Got it
                </button>
              </>
            ) : (
              /* No rewrite: Show only "Got it" */
              <button
                onClick={onAcknowledge}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Got it
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewCoachingPanel;


