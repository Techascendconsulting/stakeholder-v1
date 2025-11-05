import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const [run, setRun] = React.useState(true);
  const [steps, setSteps] = React.useState<Step[]>([]);

  React.useEffect(() => {
    const buildSteps = async () => {
      // Base steps
      const baseSteps: Step[] = [
        {
          target: 'body',
          placement: 'center',
          title: 'Welcome to BA Training!',
          content: "Let me show you around in 60 seconds. I'll walk you through the actual pages so you know exactly where everything is.",
          disableBeacon: true
        },
        {
          target: '.hero-banner',
          placement: 'right',
          title: 'My Dashboard',
          content: 'Your central hub. Follow the Next Step banner to progress.',
        },
        {
          target: '[data-tour="career-journey"]',
          placement: 'right',
          title: 'BA Project Journey',
          content: 'Complete BA lifecycle from onboarding to delivery.',
        },
        {
          target: '[data-tour="learning-journey"]',
          placement: 'right',
          title: 'My Learning Journey',
          content: 'Study modules covering BA fundamentals.',
        },
        {
          target: '[data-tour="practice-journey"]',
          placement: 'right',
          title: 'My Practice Journey',
          content: 'Practice with AI stakeholders in realistic scenarios.',
        },
        {
          target: '[data-tour="resources"]',
          placement: 'right',
          title: 'My Resources',
          content: 'Templates, guides & tools. Access anytime.',
        },
        {
          target: '[data-tour="main-menu"]',
          placement: 'right',
          title: 'Main Menu',
          content: 'Navigate to all key sections here.',
        },
        {
          target: '[data-tour="theme-toggle"]',
          placement: 'right',
          title: 'Dark/Light Mode',
          content: 'Toggle your preferred theme.',
        },
        {
          target: '[data-tour="profile-menu"]',
          placement: 'right',
          title: 'Profile & Settings',
          content: 'Manage your account here.',
        }
      ];

      // Ensure targets exist; if not, convert to a centered body step (keeps numbering consistent)
      const resolvedSteps: Step[] = baseSteps.map((step) => {
        if (step.target === 'body') return step;
        try {
          const selector = step.target as string;
          const exists = !!document.querySelector(selector);
          if (!exists) {
            return {
              ...step,
              target: 'body',
              placement: 'center'
            } as Step;
          }
        } catch {
          return { ...step, target: 'body', placement: 'center' } as Step;
        }
        return step;
      });

      setSteps(resolvedSteps);
    };
    buildSteps();
  }, [user?.id]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    console.log('🎯 Tour callback:', { status, action });
    
    // Handle all close scenarios
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      if (status === STATUS.FINISHED) {
        console.log('✅ Tour completed');
        onComplete();
      } else {
        console.log('⏭️ Tour skipped');
        onSkip();
      }
    }
    // Force close on any close action
    else if (action === 'close' || action === 'skip') {
      console.log('🚪 Tour force closed');
      setRun(false);
      onSkip();
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        disableScrolling={false}
        scrollToFirstStep
        styles={{
          options: {
            primaryColor: '#7c3aed',
            textColor: '#111827',
            zIndex: 10000
          }
        }}
        locale={{
          skip: 'Close Tour',
          last: 'Finish',
          next: 'Next',
          back: 'Back'
        }}
        callback={handleJoyrideCallback}
      />
      
      {/* Emergency close button if tour gets stuck */}
      {run && (
        <button
          onClick={() => {
            console.log('🚪 Emergency close clicked');
            setRun(false);
            onSkip();
          }}
          className="fixed top-4 right-4 z-[10001] px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg"
          style={{ zIndex: 10001 }}
        >
          ✕ Close Tour
        </button>
      )}
    </>
  );
};

export default OnboardingTour;

