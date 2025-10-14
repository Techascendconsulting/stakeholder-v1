import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  highlightSelector?: string; // CSS selector to highlight
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  navigateTo?: string; // Page to navigate to during this step
  action?: {
    label: string;
    onClick: () => void;
  };
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const { setCurrentView } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: '👋 Welcome to BA Training!',
      description: 'Let me show you around in 60 seconds. I\'ll walk you through the actual pages so you know exactly where everything is.',
      position: 'center',
      navigateTo: 'dashboard',
    },
    {
      id: 'dashboard',
      title: '🎯 Your Dashboard',
      description: 'This is your home base. The "Next Step" banner shows what to do next. Check here if you\'re ever unsure where to go!',
      highlightSelector: '.hero-banner',
      position: 'center',
      navigateTo: 'dashboard',
    },
    {
      id: 'learning',
      title: '📚 Learning Journey',
      description: 'Let me show you the Learning Journey! This is where you start. You\'ll complete 10 modules covering all BA fundamentals.',
      highlightSelector: '[data-tour="learning-journey"]',
      position: 'right',
      navigateTo: 'learning-flow', // Actually navigate to Learning Journey
    },
    {
      id: 'learning-modules',
      title: '📖 Your 10 Learning Modules',
      description: 'See these cards? Each is a module with lessons and an assignment. Complete them in order - you can\'t skip ahead. This builds a strong foundation!',
      position: 'center',
      navigateTo: 'learning-flow',
    },
    {
      id: 'practice-locked',
      title: '🔒 Practice Journey (Locked)',
      description: 'Practice is locked for now. It unlocks after you complete all 10 learning modules. Let me show you what it looks like...',
      highlightSelector: '[data-tour="practice-journey"]',
      position: 'right',
      navigateTo: 'dashboard', // Back to dashboard
    },
    {
      id: 'resources',
      title: '📖 Resources Always Available',
      description: 'Good news! Resources are never locked. Access the BA Handbook, templates, and reference materials anytime you need help.',
      highlightSelector: '[data-tour="resources"]',
      position: 'right',
      navigateTo: 'dashboard',
    },
    {
      id: 'verity',
      title: '💬 Meet Verity - Your AI Assistant',
      description: 'See this button? That\'s Verity! Ask questions about BA concepts, get help with exercises, or navigate the platform. You get 20 questions per day.',
      highlightSelector: '[data-tour="verity"]',
      position: 'bottom',
      navigateTo: 'dashboard',
    },
    {
      id: 'ready',
      title: '🚀 Ready to Start Your BA Journey?',
      description: 'Your path: Learning (10 modules) → Practice (4 exercises) → Hands-On Projects. I\'ll take you to the Learning Journey now. Good luck! 🎉',
      position: 'center',
      navigateTo: 'dashboard',
      action: {
        label: 'Start Learning Journey',
        onClick: () => {
          onComplete();
          setCurrentView('learning-flow');
        }
      }
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Navigate to the page for the next step
      const nextStepData = steps[nextStep];
      if (nextStepData.navigateTo) {
        console.log('🎯 Tour: Navigating to', nextStepData.navigateTo);
        setCurrentView(nextStepData.navigateTo as any);
      }
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => onSkip(), 300); // Allow fade out animation
  };

  // Highlight element if selector provided
  useEffect(() => {
    if (currentStepData.highlightSelector) {
      const element = document.querySelector(currentStepData.highlightSelector);
      if (element) {
        element.classList.add('tour-highlight');
        return () => {
          element.classList.remove('tour-highlight');
        };
      }
    }
  }, [currentStep, currentStepData.highlightSelector]);

  if (!isVisible) return null;

  return (
    <>
      {/* Semi-transparent Overlay - allows seeing content below */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity duration-300 pointer-events-none" />

      {/* Floating Tour Tooltip - positioned based on step */}
      <div className={`fixed z-[101] transition-all duration-500 ${
        currentStepData.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
        currentStepData.position === 'top' ? 'top-24 left-1/2 -translate-x-1/2' :
        currentStepData.position === 'bottom' ? 'bottom-24 left-1/2 -translate-x-1/2' :
        currentStepData.position === 'left' ? 'top-1/2 left-24 -translate-y-1/2' :
        'top-1/2 right-24 -translate-y-1/2'
      } max-w-md w-full mx-6`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 border-4 border-purple-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Platform Tour</span>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Skip tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="text-lg font-bold mb-3">{currentStepData.title}</h2>
              
              {/* Progress Dots */}
              <div className="flex items-center space-x-1.5">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-6 bg-white'
                        : index < currentStep
                        ? 'w-1 bg-white/60'
                        : 'w-1 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {currentStepData.description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Skip Tour
              </button>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentStep + 1}/{steps.length}
                </span>
                
                {currentStepData.action ? (
                  <button
                    onClick={currentStepData.action.onClick}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl text-sm"
                  >
                    <span>{currentStepData.action.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl text-sm"
                  >
                    <span>{isLastStep ? 'Finish' : 'Next'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for highlighting */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 99;
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.4), 0 0 0 8px rgba(168, 85, 247, 0.2);
          border-radius: 12px;
          animation: pulse-highlight 2s infinite;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.4), 0 0 0 8px rgba(168, 85, 247, 0.2);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(168, 85, 247, 0.6), 0 0 0 12px rgba(168, 85, 247, 0.3);
          }
        }
      `}</style>
    </>
  );
};

export default OnboardingTour;

