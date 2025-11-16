import React from 'react';
import { Phase, FeatureState } from '../types/models';
import { JourneyService } from '../services/journeyService';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

interface JourneyMapProps {
  state: FeatureState;
  onBeginJourney: () => void;
  onClickPhase: (phase: Phase) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ state, onBeginJourney, onClickPhase }) => {
  const phases = JourneyService.getPhases(state);
  const nextUnlockedStep = JourneyService.getNextUnlockedStep(state);
  const hasProgress = nextUnlockedStep !== null;

  // Determine current phase
  const currentPhase = nextUnlockedStep 
    ? JourneyService.getPhaseForStep(state, nextUnlockedStep.id)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Your BA Journey
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your first weeks as a Business Analyst
          </p>
        </div>

        {/* Phase Path */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 mb-8">
          {/* Horizontal phase progression */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700" 
                 style={{ zIndex: 0 }} />
            
            {/* Phase dots */}
            <div className="relative flex justify-between items-start" style={{ zIndex: 1 }}>
              {phases.map((phase, index) => {
                const status = JourneyService.getPhaseStatus(state, phase.id);
                const progress = JourneyService.getPhaseProgress(state, phase.id);
                const isCompleted = status === 'completed';
                const isCurrent = phase.id === currentPhase?.id;
                const isLocked = status === 'locked';
                const isClickable = !isLocked;

                return (
                  <div key={phase.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                    {/* Phase dot */}
                    <button
                      onClick={() => isClickable && onClickPhase(phase)}
                      disabled={isLocked}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center relative
                        transition-all duration-300 mb-3
                        ${isCompleted 
                          ? 'bg-green-500 text-white shadow-lg scale-110' 
                          : isCurrent
                          ? 'bg-blue-600 text-white shadow-xl scale-125 ring-4 ring-blue-200 dark:ring-blue-800 animate-pulse'
                          : isLocked
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:scale-110'
                        }
                        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Circle className={`w-6 h-6 ${isCurrent ? 'fill-current' : ''}`} />
                      )}
                    </button>

                    {/* Phase label */}
                    <div className="text-center">
                      <div className={`
                        text-sm font-medium mb-1
                        ${isCurrent 
                          ? 'text-blue-600 dark:text-blue-400 font-bold' 
                          : isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : isLocked
                          ? 'text-gray-400'
                          : 'text-gray-600 dark:text-gray-300'
                        }
                      `}>
                        P{phase.order}
                      </div>
                      {!isLocked && progress.total > 0 && (
                        <div className="text-xs text-gray-500">
                          {progress.percentage}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current status message */}
          <div className="text-center mt-12">
            {currentPhase ? (
              <p className="text-lg text-gray-700 dark:text-gray-300">
                <span className="text-gray-500">You are here:</span>{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {currentPhase.title}
                </span>
              </p>
            ) : (
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Ready to begin your BA journey
              </p>
            )}
          </div>
        </div>

        {/* Primary CTA */}
        <div className="text-center">
          <button
            onClick={onBeginJourney}
            className="
              inline-flex items-center justify-center
              px-12 py-5 text-lg font-semibold
              bg-gradient-to-r from-blue-600 to-indigo-600
              text-white rounded-xl
              shadow-lg hover:shadow-2xl
              transform hover:scale-105
              transition-all duration-300
            "
          >
            {hasProgress ? 'Continue your journey' : 'Start your journey'}
            <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Optional: Phase list for mobile/accessibility */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phases.map(phase => {
            const status = JourneyService.getPhaseStatus(state, phase.id);
            const isLocked = status === 'locked';
            
            // Only show first 2 phases for now (0 and 1), rest are coming soon
            if (phase.order > 1) {
              return (
                <div key={phase.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <h3 className="font-medium text-gray-400 text-sm">{phase.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400">Coming soon</p>
                </div>
              );
            }

            return (
              <button
                key={phase.id}
                onClick={() => !isLocked && onClickPhase(phase)}
                disabled={isLocked}
                className={`
                  text-left bg-white dark:bg-gray-800 rounded-lg p-4 
                  border transition-all
                  ${isLocked 
                    ? 'border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed' 
                    : 'border-blue-200 dark:border-blue-800 hover:border-blue-400 hover:shadow-md cursor-pointer'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : status === 'current' ? (
                    <Circle className="w-5 h-5 text-blue-600 fill-current" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-blue-400" />
                  )}
                  <h3 className={`font-medium text-sm ${isLocked ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {phase.title}
                  </h3>
                </div>
                {!isLocked && (
                  <div className="text-xs text-gray-500">
                    {JourneyService.getPhaseProgress(state, phase.id).percentage}% complete
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JourneyMap;

