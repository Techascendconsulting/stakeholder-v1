import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  highlightSelector?: string;
  tooltipPosition: 'bottom-center' | 'top-center' | 'bottom-left' | 'bottom-right' | 'top-right' | 'middle-right' | 'middle-left';
  fixedPosition?: 'top-left' | 'middle-left' | 'bottom-left';
}

interface SidebarTourProps {
  onComplete: () => void;
  onSkip: () => void;
  isAdmin?: boolean;
}

const SidebarTour: React.FC<SidebarTourProps> = ({ onComplete, onSkip, isAdmin = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<{ top: number; left: number } | null>(null);

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Sidebar Navigation',
      description: 'Let me show you how to navigate the app and customize your experience.',
      tooltipPosition: 'bottom-center'
    },
    {
      id: 'main-menu',
      title: 'Main Navigation',
      description: 'Access all key sections here: Dashboard, BA Project Journey, Learning, Practice, and Resources. Click any item to navigate.',
      highlightSelector: '[data-tour="main-menu"]',
      tooltipPosition: 'middle-right',
      fixedPosition: 'middle-left'
    },
    {
      id: 'theme-toggle',
      title: 'Dark/Light Mode',
      description: 'Toggle between dark and light themes to match your preference. Your choice is saved automatically.',
      highlightSelector: '[data-tour="theme-toggle"]',
      tooltipPosition: 'middle-right',
      fixedPosition: 'bottom-left'
    },
    ...(isAdmin ? [{
      id: 'admin-section',
      title: 'Admin Features',
      description: 'As an admin, you have access to additional management features: user management, content administration, and system settings.',
      highlightSelector: '[data-tour="admin-section"]',
      tooltipPosition: 'middle-right',
      fixedPosition: 'bottom-left' as const
    }] : []),
    {
      id: 'profile-menu',
      title: 'Profile & Settings',
      description: 'Click your profile to access account settings, view your progress, or sign out.',
      highlightSelector: '[data-tour="profile-menu"]',
      tooltipPosition: 'middle-right',
      fixedPosition: 'bottom-left'
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    console.log('🎯 SIDEBAR TOUR: Step changed to:', currentStep, currentStepData.id);
    
    const timer = setTimeout(() => {
      if (currentStepData.highlightSelector) {
        const element = document.querySelector(currentStepData.highlightSelector) as HTMLElement;
        console.log('🎯 SIDEBAR TOUR: Found element:', element);
        
        const previousHighlight = document.querySelector('.tour-highlight');
        if (previousHighlight && previousHighlight !== element) {
          previousHighlight.classList.remove('tour-highlight');
        }
        
        if (element && !element.classList.contains('tour-highlight')) {
          element.classList.add('tour-highlight');
          
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const tooltipWidth = 340;
            const tooltipHeight = 140;
            const margin = 16;

            if (currentStepData.fixedPosition === 'top-left') {
              setTooltipStyle({ top: margin, left: rect.right + margin });
              return;
            }
            if (currentStepData.fixedPosition === 'middle-left') {
              setTooltipStyle({ top: Math.max(margin, (vh - tooltipHeight) / 2), left: rect.right + margin });
              return;
            }
            if (currentStepData.fixedPosition === 'bottom-left') {
              setTooltipStyle({ top: vh - tooltipHeight - (margin * 8), left: rect.right + margin });
              return;
            }
          }, 200);
        }
      } else {
        const previousHighlight = document.querySelector('.tour-highlight');
        if (previousHighlight) {
          previousHighlight.classList.remove('tour-highlight');
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const highlight = document.querySelector('.tour-highlight');
      if (highlight) {
        highlight.classList.remove('tour-highlight');
      }
    };
  }, [currentStep]);

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

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[200] pointer-events-none" />

      <div
        className={
          tooltipStyle || currentStepData.highlightSelector
            ? 'fixed z-[202]'
            : 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[202]'
        }
        style={tooltipStyle ? { top: tooltipStyle.top, left: tooltipStyle.left, width: 340 } : undefined}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-[340px]">
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
                onClick={onSkip}
                className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                aria-label="Close tour"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
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

      <style>{`
        * {
          outline: 0px solid transparent !important;
        }
        
        .tour-highlight {
          position: relative !important;
          z-index: 202 !important;
          outline: 4px solid rgb(147, 51, 234) !important;
          outline-offset: 4px !important;
          border-radius: 12px !important;
          pointer-events: auto !important;
          transition: none !important;
          animation: none !important;
          -webkit-transition: none !important;
          -moz-transition: none !important;
          -o-transition: none !important;
          -webkit-animation: none !important;
          -moz-animation: none !important;
          -o-animation: none !important;
        }
        
        .tour-highlight * {
          transition: none !important;
          animation: none !important;
        }
      `}</style>
    </>
  );
};

export default SidebarTour;

