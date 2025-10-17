import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Eye, BookOpen, Target, ChevronRight } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  highlightSelector?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: { x: number; y: number };
}

interface CareerJourneyTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const CareerJourneyTour: React.FC<CareerJourneyTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: '🗺️ Your BA Project Journey',
      description: 'This timeline shows the complete BA project lifecycle from onboarding through continuous delivery. Let me show you how it works!',
      position: 'center'
    },
    {
      id: 'phase-card',
      title: '📋 Click Cards to View Details',
      description: 'Click anywhere on a phase card to open a modal with complete details: all topics, activities, deliverables, stakeholders, and learning resources.',
      highlightSelector: '[data-phase-index="0"]',
      position: 'right',
      offset: { x: 20, y: 0 }
    },
    {
      id: 'click-indicator',
      title: '👁️ Click Card Indicator',
      description: 'This message reminds you that clicking the card opens full details. The card will scale up and show a shadow when you hover over it.',
      highlightSelector: '[data-phase-index="0"]',
      position: 'right',
      offset: { x: 20, y: 50 }
    },
    {
      id: 'quick-actions',
      title: '⚡ Quick Actions (Optional)',
      description: 'Need to jump straight to learning or practice? These buttons let you skip the modal and go directly to the content. They appear on hover.',
      highlightSelector: '[data-phase-index="0"]',
      position: 'right',
      offset: { x: 20, y: 100 }
    },
    {
      id: 'you-are-here',
      title: '📍 Your Current Phase',
      description: 'This orange banner shows exactly where you are in your journey. Click "Continue This Phase" to jump straight to the relevant learning module.',
      highlightSelector: '.you-are-here-banner',
      position: 'bottom',
      offset: { x: 0, y: 20 }
    },
    {
      id: 'scroll-navigation',
      title: '👉 Explore All 10 Phases',
      description: 'Scroll horizontally or use these navigation arrows to see all phases. There are 10 total phases from onboarding through continuous delivery.',
      highlightSelector: '.scroll-right-arrow',
      position: 'left',
      offset: { x: -20, y: 0 }
    },
    {
      id: 'ready',
      title: '✨ You\'re All Set!',
      description: 'You now know how to navigate your BA Project Journey. Click any phase card to see full details, or use quick actions to jump straight to content.',
      position: 'center'
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Update highlighted element when step changes
  useEffect(() => {
    // Small delay to let the page render before finding elements
    const timer = setTimeout(() => {
      if (currentStepData.highlightSelector) {
        const element = document.querySelector(currentStepData.highlightSelector) as HTMLElement;
        if (element) {
          setHighlightedElement(element);
          element.classList.add('tour-highlight');
          
          // Scroll element into view first
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          
          // Then calculate tooltip position after scroll completes
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            const offset = currentStepData.offset || { x: 0, y: 0 };
            
            let top = 0;
            let left = 0;
            
            switch (currentStepData.position) {
              case 'right':
                top = rect.top + rect.height / 2 + offset.y - 100; // Adjust for tooltip height
                left = rect.right + offset.x;
                break;
              case 'left':
                top = rect.top + rect.height / 2 + offset.y - 100;
                left = rect.left + offset.x - 340; // 340px = tooltip width + margin
                break;
              case 'bottom':
                top = rect.bottom + offset.y;
                left = rect.left + rect.width / 2 + offset.x - 160; // Center
                break;
              case 'top':
                top = rect.top + offset.y - 220; // Tooltip height
                left = rect.left + rect.width / 2 + offset.x - 160; // Center
                break;
              default:
                break;
            }
            
            setTooltipPosition({ top, left });
          }, 500);
          
          return () => {
            element.classList.remove('tour-highlight');
          };
        } else {
          console.warn('Tour element not found:', currentStepData.highlightSelector);
        }
      } else {
        setHighlightedElement(null);
      }
    }, 100);

    return () => clearTimeout(timer);
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
      {/* Dark Overlay - Makes tour stand out */}
      <div className="fixed inset-0 bg-black/50 z-[200] pointer-events-none transition-opacity duration-300" />
      
      {/* Spotlight effect on highlighted element - Creates cutout */}
      {highlightedElement && (
        <div 
          className="fixed z-[201] pointer-events-none transition-all duration-500 ease-in-out"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 8,
            left: highlightedElement.getBoundingClientRect().left - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '24px'
          }}
        />
      )}

      {/* Tour Tooltip */}
      <div 
        className={`fixed z-[202] transition-all duration-300 ${
          currentStepData.position === 'center' 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
            : ''
        }`}
        style={currentStepData.position !== 'center' ? tooltipPosition : {}}
      >
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border-2 border-purple-500 ${
          currentStepData.position === 'center' ? 'w-[500px]' : 'w-[320px]'
        } animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm font-bold">{currentStepData.title}</span>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close tour"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
              {currentStepData.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Back Button */}
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}
                
                {/* Progress Dots */}
                <div className="flex items-center space-x-1.5">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'w-6 bg-purple-600'
                          : index < currentStep
                          ? 'w-1.5 bg-purple-400'
                          : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    {currentStep + 1}/{steps.length}
                  </span>
                </div>
              </div>

              {/* Next/Finish Button */}
              <button
                onClick={handleNext}
                className="inline-flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl text-sm"
              >
                <span>{isLastStep ? 'Got it!' : 'Next'}</span>
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="w-full mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Skip tour
            </button>
          </div>
        </div>
      </div>

      {/* Global CSS for highlighting */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 202 !important;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.8), 
                      0 0 0 6px rgba(168, 85, 247, 0.4),
                      0 0 20px 10px rgba(168, 85, 247, 0.3) !important;
          border-radius: 24px !important;
          animation: pulse-highlight 2s infinite;
          pointer-events: auto !important;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.8), 
                        0 0 0 6px rgba(168, 85, 247, 0.4),
                        0 0 20px 10px rgba(168, 85, 247, 0.3) !important;
          }
          50% {
            box-shadow: 0 0 0 4px rgba(168, 85, 247, 1), 
                        0 0 0 8px rgba(168, 85, 247, 0.6),
                        0 0 30px 15px rgba(168, 85, 247, 0.5) !important;
          }
        }
      `}</style>
    </>
  );
};

export default CareerJourneyTour;

