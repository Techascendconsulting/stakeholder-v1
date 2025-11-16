import React from 'react';
import { Step, FeatureState } from '../types/models';
import { JourneyService } from '../services/journeyService';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { StepRenderer } from './StepRenderer';

interface StepLayoutProps {
  step: Step;
  state: FeatureState;
  onBackToPhase: () => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onCompleteStep: () => void;
}

export const StepLayout: React.FC<StepLayoutProps> = ({
  step,
  state,
  onBackToPhase,
  onPreviousStep,
  onNextStep,
  onCompleteStep
}) => {
  const section = JourneyService.getSectionForStep(state, step.id);
  const phase = section ? JourneyService.getPhaseForStep(state, step.id) : null;
  const sectionSteps = section ? JourneyService.getStepsForSection(state, section.id) : [];
  
  const currentStepIndex = sectionSteps.findIndex(s => s.id === step.id);
  const totalStepsInSection = sectionSteps.length;
  
  const hasPrevious = JourneyService.hasPreviousStep(state, step.id);
  const nextStep = JourneyService.getNextStep(state, step.id);
  const hasNext = nextStep !== null;
  
  const isStepCompleted = state.progress[step.id] === 'completed';
  const isStepUnlocked = state.progress[step.id] === 'unlocked';

  // Calculate overall progress within the phase
  const phaseProgress = phase ? JourneyService.getPhaseProgress(state, phase.id) : null;

  const handleContinue = () => {
    if (!isStepCompleted && isStepUnlocked) {
      onCompleteStep();
    }
    
    // After marking complete, navigate to next if available
    if (hasNext) {
      setTimeout(() => onNextStep(), 300);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back to phase */}
          <button
            onClick={onBackToPhase}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Back to phase</span>
          </button>

          {/* Phase and step info */}
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {phase && (
              <>
                <span className="font-medium">{phase.title.replace(/Phase \d+ — /, '')}</span>
                <span className="mx-2">·</span>
              </>
            )}
            <span>Step {currentStepIndex + 1} of {totalStepsInSection}</span>
          </div>

          {/* Progress percentage */}
          {phaseProgress && (
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {phaseProgress.percentage}%
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-start justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-4xl">
          {/* Content card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
            <StepRenderer
              step={step}
              isCompleted={isStepCompleted}
              onComplete={onCompleteStep}
            />
          </div>

          {/* Bottom navigation */}
          <div className="mt-8 flex items-center justify-between">
            {/* Previous button */}
            <button
              onClick={onPreviousStep}
              disabled={!hasPrevious}
              className={`
                inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                transition-all
                ${hasPrevious
                  ? 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                  : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {sectionSteps.map((s, idx) => {
                const stepStatus = state.progress[s.id];
                return (
                  <div
                    key={s.id}
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${stepStatus === 'completed'
                        ? 'bg-green-500'
                        : s.id === step.id
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 dark:bg-gray-600'
                      }
                    `}
                  />
                );
              })}
            </div>

            {/* Continue/Next button */}
            <button
              onClick={handleContinue}
              disabled={!isStepUnlocked && !isStepCompleted}
              className={`
                inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                transition-all
                ${(isStepUnlocked || isStepCompleted)
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <span>{isStepCompleted ? 'Next' : 'Continue'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Section progress text */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {section && (
              <>
                <span className="font-medium">{section.title.replace(/Section \d+\.\d+ — /, '')}</span>
                <span className="mx-2">·</span>
                <span>
                  {sectionSteps.filter(s => state.progress[s.id] === 'completed').length} of {totalStepsInSection} steps complete
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepLayout;

