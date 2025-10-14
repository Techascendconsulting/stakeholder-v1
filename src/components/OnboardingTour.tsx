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
      description: 'Let me show you around in 60 seconds. You\'ll learn how to navigate the platform and start your BA journey.',
      position: 'center',
    },
    {
      id: 'dashboard',
      title: '🎯 Your Dashboard',
      description: 'This is your home base. The "Next Step" banner always shows what to do next. Check here if you\'re ever unsure!',
      highlightSelector: '.hero-banner', // We'll add this class
      position: 'center',
    },
    {
      id: 'learning',
      title: '📚 Learning Journey',
      description: 'Start here! Complete 10 modules to master BA fundamentals. Each module has lessons and an assignment to test your knowledge.',
      highlightSelector: '[data-tour="learning-journey"]',
      position: 'right',
    },
    {
      id: 'locks',
      title: '🔒 Progressive Unlock',
      description: 'Practice and Projects are locked at first. They unlock as you complete modules. No skipping ahead - this ensures you build a strong foundation!',
      highlightSelector: '[data-tour="practice-journey"]',
      position: 'right',
    },
    {
      id: 'resources',
      title: '📖 Resources',
      description: 'Stuck? The BA Handbook and templates are always available here. Use them as reference materials anytime.',
      highlightSelector: '[data-tour="resources"]',
      position: 'right',
    },
    {
      id: 'verity',
      title: '💬 Meet Verity',
      description: 'Your AI assistant! Ask questions about BA concepts, get help with exercises, or navigate the platform. You get 20 questions per day.',
      highlightSelector: '[data-tour="verity"]',
      position: 'bottom',
    },
    {
      id: 'ready',
      title: '🚀 You\'re All Set!',
      description: 'Your journey: Learning (10 modules) → Practice (4 exercises) → Hands-On Projects. Take it step by step, and you\'ll be a skilled BA in no time!',
      position: 'center',
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
      setCurrentStep(prev => prev + 1);
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
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300" />

      {/* Tour Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-sm font-semibold">Quick Tour</span>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Skip tour"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
              
              {/* Progress Dots */}
              <div className="flex items-center space-x-2 mt-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-8 bg-white'
                        : index < currentStep
                        ? 'w-1.5 bg-white/60'
                        : 'w-1.5 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              {currentStepData.description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Skip Tour
              </button>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentStep + 1} of {steps.length}
                </span>
                
                {currentStepData.action ? (
                  <button
                    onClick={currentStepData.action.onClick}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <span>{currentStepData.action.label}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <span>{isLastStep ? 'Get Started' : 'Next'}</span>
                    <ArrowRight className="w-5 h-5" />
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

