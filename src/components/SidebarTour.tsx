import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  highlightSelector?: string;
  tooltipPosition: 'middle-left';
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
      description: 'I\'ll point out the key parts of the left sidebar.',
      tooltipPosition: 'middle-left'
    },
    {
      id: 'main-menu',
      title: 'Main Navigation',
      description: 'Dashboard, Project Lifecycle, Learning, Practice, Resources.',
      highlightSelector: '[data-tour="main-menu"]',
      tooltipPosition: 'middle-left'
    },
    {
      id: 'theme-toggle',
      title: 'Dark/Light Mode',
      description: 'Toggle the app theme here. Your choice is saved.',
      highlightSelector: '[data-tour="theme-toggle"]',
      tooltipPosition: 'middle-left'
    },
    ...(isAdmin ? [{
      id: 'admin-section',
      title: 'Admin Features',
      description: 'Admin-only controls live here.',
      highlightSelector: '[data-tour="admin-section"]',
      tooltipPosition: 'middle-left' as const
    }] : []),
    {
      id: 'profile-menu',
      title: 'Profile & Settings',
      description: 'Open your profile to manage your account.',
      highlightSelector: '[data-tour="profile-menu"]',
      tooltipPosition: 'middle-left'
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    // Position bubble alongside the sidebar target; no highlight outline for sidebar
    const timer = setTimeout(() => {
      const selector = currentStepData.highlightSelector;
      console.debug('[SidebarTour] step', { step: currentStepData.id, selector });
      if (!selector) {
        const fallback = { top: 100, left: 260 };
        console.debug('[SidebarTour] no selector, using fallback', fallback);
        setTooltipStyle(fallback);
        return;
      }
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        console.warn('[SidebarTour] element not found for selector', selector);
        return;
      }
      const rect = el.getBoundingClientRect();
      const sidebarWidth = rect.right - rect.left;
      const tooltipWidth = 340;
      const tooltipHeight = 140;
      const margin = 16;
      const top = Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, rect.top + rect.height / 2 - tooltipHeight / 2));
      // If sidebar is collapsed or narrow, still anchor bubble at a safe x
      const baseLeft = rect.right + margin;
      const safeLeft = Math.max(200, baseLeft); // ensure bubble stays near left edge but visible
      console.debug('[SidebarTour] rect', { rect, sidebarWidth, baseLeft, safeLeft, top });
      setTooltipStyle({ top, left: safeLeft });
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNext = () => {
    if (isLastStep) onComplete(); else setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[200] pointer-events-none" />

      <div className="fixed z-[202]" style={tooltipStyle ? { top: tooltipStyle.top, left: tooltipStyle.left, width: 340 } : { visibility: 'hidden' }}>
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-[340px]">
          {/* Left-edge pointer aiming toward the sidebar */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-r-0 border-t-0" />

          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{currentStepData.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{currentStepData.description}</p>
              </div>
              <button onClick={onSkip} className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" aria-label="Close tour">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{currentStep + 1} of {steps.length}</span>
                <div className="flex space-x-1">
                  {steps.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-purple-600 w-6' : i < currentStep ? 'bg-purple-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {currentStep > 0 && (
                  <button onClick={handleBack} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Back</button>
                )}
                <button onClick={handleNext} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded">{isLastStep ? 'Done' : 'Next'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarTour;

