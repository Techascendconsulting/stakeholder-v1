import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  highlightSelector?: string; // CSS selector to highlight
  position: 'center' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  navigateTo?: string; // Page to navigate to during this step
  action?: {
    label: string;
    onClick: () => void;
  };
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [userType, setUserType] = useState<'new' | 'existing'>('new');

  // Load user type
  useEffect(() => {
    const loadUserType = async () => {
      if (!user?.id) return;
      
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserType(data.user_type || 'new');
        }
      } catch (error) {
        console.error('Failed to load user type:', error);
      }
    };
    
    loadUserType();
  }, [user?.id]);

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
      title: '🏠 My Dashboard',
      description: userType === 'new'
        ? 'Your central hub - this is home base. Follow the "Next Step" banner to progress through your journey. New sections unlock as you complete modules.'
        : 'Your central hub - this is home base. All sections are unlocked. We recommend starting with My Learning to build strong foundational concepts before exploring Practice and Projects.',
      highlightSelector: '.hero-banner',
      position: 'top-right',
      navigateTo: 'dashboard',
    },
    {
      id: 'project-journey',
      title: '📖 BA Project Journey',
      description: 'See the big picture! This shows the complete BA project lifecycle from onboarding to delivery. Each phase connects to relevant Learning modules and Practice sessions.',
      highlightSelector: '[data-tour="career-journey"]',
      position: 'top-right',
      navigateTo: 'career-journey',
    },
    {
      id: 'learning',
      title: '📚 My Learning Journey',
      description: userType === 'new'
        ? 'Study BA concepts & modules here. Complete 11 modules covering all BA fundamentals, unlocking new sections as you progress.'
        : 'Study BA concepts & modules - 11 comprehensive modules covering all BA fundamentals. Great for refreshing concepts or filling knowledge gaps.',
      highlightSelector: '[data-tour="learning-journey"]',
      position: 'top-right',
      navigateTo: 'learning-flow',
    },
    {
      id: 'learning-modules',
      title: '📖 Your 11 Learning Modules',
      description: userType === 'new'
        ? 'Here are your 11 modules! Each has lessons and an assignment. Complete them in order - you can\'t skip ahead. This builds a strong foundation!'
        : 'Here are your 11 modules! All modules are unlocked for you. We recommend completing them in order to build strong foundational concepts.',
      position: 'top-right',
      navigateTo: 'learning-flow',
    },
    {
      id: 'practice',
      title: userType === 'new' ? '🔒 My Practice Journey' : '🎯 My Practice Journey',
      description: userType === 'new' 
        ? 'Practice with AI stakeholders in realistic scenarios. 4 practice modules - most are locked initially. Elicitation unlocks after Module 3, full access after completing all 11 learning modules.'
        : 'Practice with AI stakeholders in realistic scenarios! You have full access to all 4 practice modules. Build your skills through hands-on practice.',
      position: 'bottom-left',
      navigateTo: 'practice-flow',
    },
    {
      id: 'projects',
      title: userType === 'new' ? '🔒 My Hands-On Project' : '🚀 My Hands-On Project',
      description: userType === 'new'
        ? 'Apply skills to real projects. This unlocks after you complete all 11 learning modules - it\'s where you put everything together!'
        : 'Apply skills to real projects! Create your own BA projects and conduct stakeholder meetings. This is where theory meets practice.',
      position: 'bottom-left',
      navigateTo: 'project-flow',
    },
    {
      id: 'resources',
      title: '📁 My Resources',
      description: 'Templates, guides & tools. Your learning library with BA Handbook, Reference Library, and Motivation content. These resources are never locked - access them anytime!',
      highlightSelector: '[data-tour="resources"]',
      position: 'bottom-left',
      navigateTo: 'my-resources',
    },
    {
      id: 'support',
      title: '💬 Support',
      description: 'Get help when you need it. Access FAQs, contact support, and meet Verity - your AI assistant (purple button in the corner). You get 20 Verity questions per day.',
      highlightSelector: '[data-tour="verity"]',
      position: 'bottom-right',
      navigateTo: 'support',
    },
    {
      id: 'ready',
      title: '🚀 Ready to Start Your BA Journey?',
      description: 'Your path: Learning → Practice → Apply. I\'ll take you to the Learning Journey now. Good luck! 🎉',
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

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Navigate to the page for the previous step
      const prevStepData = steps[prevStep];
      if (prevStepData.navigateTo) {
        console.log('🎯 Tour: Navigating back to', prevStepData.navigateTo);
        setCurrentView(prevStepData.navigateTo as any);
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
      {/* Overlay - blocks clicks on page content */}
      <div className="fixed inset-0 bg-black/30 z-[200] pointer-events-none" />

      {/* Floating Tour Tooltip - positioned based on step */}
      <div className={`fixed z-[202] transition-all duration-500 ${
        currentStepData.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
        currentStepData.position === 'top-right' ? 'top-24 right-8' :
        currentStepData.position === 'bottom-left' ? 'bottom-24 left-8' :
        currentStepData.position === 'bottom-right' ? 'bottom-32 right-32' :
        currentStepData.position === 'bottom-center' ? 'bottom-24 left-1/2 -translate-x-1/2' :
        'top-1/2 right-24 -translate-y-1/2'
      } max-w-sm w-full`}>
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Arrow / Pointer */}
          {currentStepData.position !== 'center' && (
            <div
              className={`absolute w-3.5 h-3.5 rotate-45 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${
                // place the arrow on the edge closest to target
                currentStepData.position.startsWith('bottom')
                  ? 'top-[-7px] left-1/2 -translate-x-1/2 border-b-0 border-r-0'
                  : currentStepData.position.startsWith('top')
                  ? 'bottom-[-7px] left-1/2 -translate-x-1/2 border-t-0 border-l-0'
                  : currentStepData.position.includes('right')
                  ? 'left-[-7px] top-1/2 -translate-y-1/2 border-l-0 border-b-0'
                  : 'right-[-7px] top-1/2 -translate-y-1/2 border-r-0 border-t-0'
              }`}
            />
          )}
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
                
                {currentStepData.action ? (
                  <button
                    onClick={currentStepData.action.onClick}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded flex items-center space-x-1"
                  >
                    <span>{currentStepData.action.label}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded flex items-center space-x-1"
                  >
                    <span>{isLastStep ? 'Finish' : 'Next'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for highlighting - match CareerJourneyTour */}
      <style>{`
        .tour-highlight {
          position: relative !important;
          z-index: 202 !important;
          outline: 4px solid rgb(147, 51, 234) !important;
          outline-offset: 4px !important;
          border-radius: 12px !important;
          pointer-events: auto !important;
          transition: none !important;
          animation: none !important;
        }
      `}</style>
    </>
  );
};

export default OnboardingTour;

