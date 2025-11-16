import React from 'react';
import { Phase } from '../types/models';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface PhaseCompleteOverlayProps {
  completedPhase: Phase;
  nextPhase: Phase | null;
  onBackToJourney: () => void;
  onContinueToNextPhase?: () => void;
}

export const PhaseCompleteOverlay: React.FC<PhaseCompleteOverlayProps> = ({
  completedPhase,
  nextPhase,
  onBackToJourney,
  onContinueToNextPhase
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Success icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Congratulations message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Phase Complete!
        </h1>

        <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
          You've completed
        </p>

        <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-8">
          {completedPhase.title}
        </p>

        {/* Success message */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Great work! You have completed all steps in this phase. 
            {nextPhase 
              ? ' You are ready to move on to the next phase of your BA journey.' 
              : ' You have reached the end of the available content.'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBackToJourney}
            className="
              px-8 py-4 rounded-xl font-semibold
              bg-white dark:bg-gray-800 
              text-gray-700 dark:text-gray-300
              border-2 border-gray-300 dark:border-gray-600
              hover:border-gray-400 dark:hover:border-gray-500
              hover:shadow-lg
              transition-all
            "
          >
            Back to journey
          </button>

          {nextPhase && onContinueToNextPhase && (
            <button
              onClick={onContinueToNextPhase}
              className="
                inline-flex items-center justify-center gap-2
                px-8 py-4 rounded-xl font-semibold
                bg-gradient-to-r from-green-600 to-emerald-600
                text-white
                hover:shadow-xl
                transform hover:scale-105
                transition-all
              "
            >
              <span>Continue to next phase</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {nextPhase && (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Next: {nextPhase.title}
          </p>
        )}
      </div>
    </div>
  );
};

export default PhaseCompleteOverlay;

