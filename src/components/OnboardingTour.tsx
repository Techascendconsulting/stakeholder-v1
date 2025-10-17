import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [run, setRun] = React.useState(true);
  const [steps, setSteps] = React.useState<Step[]>([]);

  React.useEffect(() => {
    const buildSteps = async () => {
      // Build steps matching previous content
      const s: Step[] = [
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
      setSteps(s);
    };
    buildSteps();
  }, [user?.id]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      if (status === STATUS.FINISHED) onComplete(); else onSkip();
    }
  };

  return (
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
      callback={handleJoyrideCallback}
    />
  );
};

export default OnboardingTour;

