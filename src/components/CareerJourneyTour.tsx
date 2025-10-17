import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  highlightSelector?: string;
  tooltipPosition: 'bottom-center' | 'top-center' | 'bottom-left' | 'bottom-right';
  action?: () => void; // Action to perform when entering this step
}

interface CareerJourneyTourProps {
  onComplete: () => void;
  onSkip: () => void;
  onOpenPhaseModal: (phaseIndex: number) => void;
  onClosePhaseModal: () => void;
}

const CareerJourneyTour: React.FC<CareerJourneyTourProps> = ({ onComplete, onSkip, onOpenPhaseModal, onClosePhaseModal }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Your BA Project Journey',
      description: 'This timeline shows the complete BA project lifecycle from onboarding through continuous delivery. Let me show you around!',
      tooltipPosition: 'bottom-center',
      action: () => {
        // Close any open modal
        onClosePhaseModal();
      }
    },
    {
      id: 'phase-card',
      title: 'Click any phase card',
      description: 'Click anywhere on a card to open full details. Let me open one for you...',
      highlightSelector: '[data-phase-index="0"]',
      tooltipPosition: 'bottom-center',
      action: () => {
        // Open the first phase modal
        setTimeout(() => onOpenPhaseModal(0), 500);
      }
    },
    {
      id: 'modal-topics',
      title: 'Topics & Activities',
      description: 'Inside the modal, you can see all topics for this phase. Topics with play icons are interactive - click them to start learning.',
      highlightSelector: '.phase-modal-topics',
      tooltipPosition: 'bottom-center'
    },
    {
      id: 'modal-learning',
      title: 'Learning & Practice Links',
      description: 'Each phase connects to specific Learning modules and Practice sessions. Click these buttons to jump directly to the content.',
      highlightSelector: '.phase-modal-learning',
      tooltipPosition: 'bottom-center'
    },
    {
      id: 'close-and-explore',
      title: 'You\'re ready!',
      description: 'Close this modal and explore other phases. Use the orange "You are here" banner to continue where you left off.',
      tooltipPosition: 'bottom-center',
      action: () => {
        onClosePhaseModal();
      }
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Update highlighted element when step changes
  useEffect(() => {
    // Remove previous highlight
    const previousHighlight = document.querySelector('.tour-highlight');
    if (previousHighlight) {
      previousHighlight.classList.remove('tour-highlight');
    }

    // Execute step action if defined
    if (currentStepData.action) {
      currentStepData.action();
    }

    // Small delay to let the page render before finding elements
    const timer = setTimeout(() => {
      if (currentStepData.highlightSelector) {
        const element = document.querySelector(currentStepData.highlightSelector) as HTMLElement;
        if (element) {
          element.classList.add('tour-highlight');
          
          // Scroll element into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }
    }, currentStepData.action ? 800 : 100);

    return () => {
      clearTimeout(timer);
      // Cleanup highlight when component unmounts
      const highlight = document.querySelector('.tour-highlight');
      if (highlight) {
        highlight.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, currentStepData]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <>
      {/* Simple overlay - lightweight, no performance issues */}
      <div className="fixed inset-0 bg-black/30 z-[200] pointer-events-none" />

      {/* Tour Tooltip - Jira/Monday.com Style (Fixed at bottom) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[202] w-full max-w-md px-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                aria-label="Close tour"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Footer with Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Progress */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {currentStep + 1} of {steps.length}
                </span>
                <div className="flex space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-purple-600 w-6'
                          : index < currentStep
                          ? 'bg-purple-400'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all"
                  >
                    Back
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-all flex items-center space-x-1"
                >
                  <span>{isLastStep ? 'Done' : 'Next'}</span>
                  {!isLastStep && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for highlighting - Simple and performant */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 202 !important;
          outline: 4px solid rgb(147, 51, 234) !important;
          outline-offset: 4px;
          border-radius: 12px !important;
          pointer-events: auto !important;
        }
      `}</style>
    </>
  );
};

export default CareerJourneyTour;

