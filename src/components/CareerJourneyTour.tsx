import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  highlightSelector?: string;
  tooltipPosition: 'bottom-center' | 'top-center' | 'bottom-left' | 'bottom-right';
  action?: () => void; // Action to perform when entering this step
  preferredSides?: Array<'bottom' | 'top' | 'right' | 'left'>; // Order to try when placing tooltip
  fixedPosition?: 'top-right' | 'middle-right' | 'bottom-right'; // Viewport-pinned positions on the right side
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
      description: 'Inside the modal, you can see all topics for this phase. Topics with play icons are interactive - click them to start learning. Scroll down to see more.',
      highlightSelector: '.phase-modal-topics',
      tooltipPosition: 'bottom-center',
      preferredSides: ['right', 'left', 'bottom', 'top'],
      fixedPosition: 'middle-right'
    },
    {
      id: 'modal-learning',
      title: 'Learning & Practice Links',
      description: 'Scroll down to see the Learning & Practice buttons. Each phase connects to specific modules - click these buttons to jump directly to the content.',
      highlightSelector: '.phase-modal-learning',
      tooltipPosition: 'bottom-center',
      preferredSides: ['right', 'left', 'bottom', 'top']
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
  const [tooltipStyle, setTooltipStyle] = useState<{ top: number; left: number } | null>(null);

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
          // Auto-place tooltip near the element without covering it
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const tooltipWidth = 340; // px
            const tooltipHeight = 140; // approx px
            const margin = 16;

            // Try placements in priority order: bottom, top, right, left
            let top = 0;
            let left = 0;
            let placed = false;

            // Fixed placements for requested steps
            if (currentStepData.fixedPosition === 'middle-right') {
              setTooltipStyle({ top: Math.max(margin, (vh - tooltipHeight) / 2), left: vw - tooltipWidth - margin });
              return;
            }

            // Use caller preference, but ensure we place tooltip OUTSIDE modal content for steps 2-4
            const tryOrders: Array<'bottom'|'top'|'right'|'left'> = currentStepData.preferredSides ?? ['right','left','bottom','top'];
            for (const pos of tryOrders) {
              if (pos === 'bottom' && vh - rect.bottom > tooltipHeight + margin) {
                top = rect.bottom + margin;
                left = Math.min(vw - tooltipWidth - margin, Math.max(margin, rect.left + rect.width / 2 - tooltipWidth / 2));
                placed = true; break;
              }
              if (pos === 'top' && rect.top > tooltipHeight + margin) {
                top = rect.top - tooltipHeight - margin;
                left = Math.min(vw - tooltipWidth - margin, Math.max(margin, rect.left + rect.width / 2 - tooltipWidth / 2));
                placed = true; break;
              }
              if (pos === 'right' && vw - rect.right > tooltipWidth + margin) {
                top = Math.min(vh - tooltipHeight - margin, Math.max(margin, rect.top));
                left = rect.right + margin;
                placed = true; break;
              }
              if (pos === 'left' && rect.left > tooltipWidth + margin) {
                top = Math.min(vh - tooltipHeight - margin, Math.max(margin, rect.top));
                left = rect.left - tooltipWidth - margin;
                placed = true; break;
              }
            }

            // Fallback: bottom center clamped
            if (!placed) {
              top = Math.min(vh - tooltipHeight - margin, Math.max(margin, rect.bottom + margin));
              left = Math.min(vw - tooltipWidth - margin, Math.max(margin, rect.left + rect.width / 2 - tooltipWidth / 2));
            }

            setTooltipStyle({ top, left });
          }, 200);
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

      {/* Tour Tooltip - Auto-placed near target (falls back to bottom-center when no highlight) */}
      <div
        className={
          tooltipStyle || currentStepData.highlightSelector
            ? 'fixed z-[202]'
            : 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[202]'
        }
        style={tooltipStyle ? { top: tooltipStyle.top, left: tooltipStyle.left, width: 340 } : undefined}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-[340px]">
          {/* Content */}
          <div className="p-5">
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
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              {/* Progress */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {currentStep + 1} of {steps.length}
                </span>
                <div className="flex space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
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
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    Back
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded flex items-center space-x-1"
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

