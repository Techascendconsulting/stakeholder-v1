import React from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CareerJourneyTourJoyrideProps {
  onComplete: () => void;
  onSkip: () => void;
  onOpenPhaseModal: (phaseIndex: number) => void;
  onClosePhaseModal: () => void;
}

const CareerJourneyTourJoyride: React.FC<CareerJourneyTourJoyrideProps> = ({ 
  onComplete, 
  onSkip, 
  onOpenPhaseModal, 
  onClosePhaseModal 
}) => {
  const { user } = useAuth();
  const [run, setRun] = React.useState(true);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [steps, setSteps] = React.useState<Step[]>([]);

  React.useEffect(() => {
    const buildSteps = async () => {
      const s: Step[] = [
        {
          target: 'body',
          placement: 'center',
          title: 'Your BA Project Journey',
          content: (
            <div className="space-y-3">
              <p>This timeline shows the complete BA project lifecycle. Each phase builds on the previous one.</p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800 mt-3">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  💡 <strong>Do this next:</strong> I'll show you how to explore each phase
                </p>
              </div>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '[data-phase-index="0"]',
          placement: 'right',
          title: 'Click Any Phase Card',
          content: (
            <div className="space-y-3">
              <p>Each card shows a phase in your BA journey. When the tour finishes, you can click any card to see detailed topics and learning modules.</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-3">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  🎯 <strong>Pro tip:</strong> Start with "Project Initiation"
                </p>
              </div>
            </div>
          )
        },
        {
          target: '.phase-modal-topics',
          placement: 'right',
          title: 'Topics & Activities',
          content: (
            <div className="space-y-3">
              <p>Each phase contains specific topics and activities. Click on any topic to dive deeper.</p>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 mt-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✅ <strong>Action:</strong> Work through topics in order
                </p>
              </div>
            </div>
          )
        },
        {
          target: '.phase-modal-learning',
          placement: 'right',
          title: 'Learning & Practice',
          content: (
            <div className="space-y-3">
              <p>This section links to specific learning modules and practice exercises for this phase.</p>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800 mt-3">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  📚 <strong>Path:</strong> Learn → Practice → Apply
                </p>
              </div>
            </div>
          )
        },
        {
          target: 'body',
          placement: 'center',
          title: 'Ready to Explore!',
          content: (
            <div className="space-y-3">
              <p>You can now click any phase card to explore. Each phase builds on the previous one.</p>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 mt-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  🚀 <strong>Start:</strong> Begin with Project Initiation
                </p>
              </div>
            </div>
          )
        }
      ];

      setSteps(s);
    };
    buildSteps();
  }, [user?.id]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type, action } = data;
    
    // Handle step progression
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      // Before step 2, open the modal
      if (nextStepIndex === 2 && action === ACTIONS.NEXT) {
        onOpenPhaseModal(0);
        setTimeout(() => {
          setStepIndex(nextStepIndex);
        }, 500);
        return;
      }
      
      // Close modal before final step
      if (nextStepIndex === 4 && action === ACTIONS.NEXT) {
        onClosePhaseModal();
      }
      
      setStepIndex(nextStepIndex);
    }
    
    // Handle completion
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      onClosePhaseModal();
      if (status === STATUS.FINISHED) {
        onComplete();
      } else {
        onSkip();
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
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

export default CareerJourneyTourJoyride;
