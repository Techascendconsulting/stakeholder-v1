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
        ? 'Study BA concepts & modules here. Complete 10 modules covering all BA fundamentals, unlocking new sections as you progress.'
        : 'Study BA concepts & modules - 10 comprehensive modules covering all BA fundamentals. Great for refreshing concepts or filling knowledge gaps.',
      highlightSelector: '[data-tour="learning-journey"]',
      position: 'top-right',
      navigateTo: 'learning-flow',
    },
    {
      id: 'learning-modules',
      title: '📖 Your 10 Learning Modules',
      description: userType === 'new'
        ? 'Here are your 10 modules! Each has lessons and an assignment. Complete them in order - you can\'t skip ahead. This builds a strong foundation!'
        : 'Here are your 10 modules! All modules are unlocked for you. We recommend completing them in order to build strong foundational concepts.',
      position: 'top-right',
      navigateTo: 'learning-flow',
    },
    {
      id: 'practice',
      title: userType === 'new' ? '🔒 My Practice Journey' : '🎯 My Practice Journey',
      description: userType === 'new' 
        ? 'Practice with AI stakeholders in realistic scenarios. 4 practice modules - most are locked initially. Elicitation unlocks after Module 3, full access after completing all 10 learning modules.'
        : 'Practice with AI stakeholders in realistic scenarios! You have full access to all 4 practice modules. Build your skills through hands-on practice.',
      position: 'bottom-left',
      navigateTo: 'practice-flow',
    },
    {
      id: 'projects',
      title: userType === 'new' ? '🔒 My Hands-On Project' : '🚀 My Hands-On Project',
      description: userType === 'new'
        ? 'Apply skills to real projects. This unlocks after you complete all 10 learning modules - it\'s where you put everything together!'
        : 'Apply skills to real projects! Create your own BA projects and conduct stakeholder meetings. This is where theory meets practice.',
      position: 'bottom-left',
      navigateTo: 'dashboard',
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
      navigateTo: 'dashboard',
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
      <div className="fixed inset-0 bg-black/20 z-[100] transition-opacity duration-300" />

      {/* Floating Tour Tooltip - positioned based on step */}
      <div className={`fixed z-[101] transition-all duration-500 ${
        currentStepData.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
        currentStepData.position === 'top-right' ? 'top-24 right-8' :
        currentStepData.position === 'bottom-left' ? 'bottom-24 left-8' :
        currentStepData.position === 'bottom-right' ? 'bottom-32 right-32' : // Position above Verity
        currentStepData.position === 'bottom-center' ? 'bottom-24 left-1/2 -translate-x-1/2' :
        'top-1/2 right-24 -translate-y-1/2'
      } max-w-sm w-full`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 border-2 border-purple-500">
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold">{currentStepData.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSkip}
                className="px-2 py-1 text-xs text-white/90 hover:text-white hover:bg-white/20 rounded transition-colors font-medium"
              >
                Skip Tour
              </button>
              <button
                onClick={handleSkip}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close tour"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {currentStepData.description}
            </p>

            {/* Progress & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Back Button - Same style as Next */}
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow"
                    title="Go back"
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
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'w-4 bg-purple-600'
                          : index < currentStep
                          ? 'w-1 bg-purple-400'
                          : 'w-1 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    {currentStep + 1}/{steps.length}
                  </span>
                </div>
              </div>

              {currentStepData.action ? (
                <button
                  onClick={currentStepData.action.onClick}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl text-xs"
                >
                  <span>{currentStepData.action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl text-xs"
                >
                  <span>{isLastStep ? 'Finish' : 'Next'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
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

