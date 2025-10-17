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
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [run, setRun] = React.useState(true);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [steps, setSteps] = React.useState<Step[]>([]);

  React.useEffect(() => {
    const buildSteps = async () => {
      console.log('🎯 [CareerJourneyTour] Building steps...');
      
      // Get user type for dynamic content
      let userType = 'existing';
      if (user?.id) {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
        userType = data?.user_type || 'existing';
      }

      const s: Step[] = [
        {
          target: 'body',
          placement: 'center',
          title: 'Your BA Project Journey',
          content: (
            <div className="space-y-3">
              <p>This timeline shows the complete BA project lifecycle from onboarding through continuous delivery. Each phase builds on the previous one.</p>
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
              <p>Each card shows a phase in your BA journey. When the tour finishes, you can click any card to see detailed topics, deliverables, and learning modules.</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-3">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  🎯 <strong>Pro tip:</strong> Start with "Project Initiation" to understand the full scope
                </p>
              </div>
            </div>
          )
        },
        {
          target: '.phase-modal-learning',
          placement: 'right',
          title: 'Learning Modules',
          content: (
            <div className="space-y-3">
              <p>Each phase has specific learning modules that prepare you. These modules build essential BA skills through interactive content.</p>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800 mt-3">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  📚 <strong>Learning path:</strong> Complete modules in order for maximum impact
                </p>
              </div>
            </div>
          )
        },
        {
          target: '.phase-modal-deliverables',
          placement: 'right',
          title: 'Key Deliverables',
          content: (
            <div className="space-y-3">
              <p>These are the actual documents and artifacts you'll create as a BA. Each has templates and examples to guide your work.</p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800 mt-3">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  📋 <strong>Pro tip:</strong> Use templates in My Resources to accelerate your work
                </p>
              </div>
            </div>
          )
        },
        {
          target: '.phase-modal-stakeholders',
          placement: 'right',
          title: 'Stakeholder Engagement',
          content: (
            <div className="space-y-3">
              <p>These are the key stakeholders you'll work with. Practice conversations with AI-powered versions to build confidence.</p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 mt-3">
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                  🎭 <strong>Practice tip:</strong> Use My Practice Journey to rehearse these conversations
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
              <p>That's it! You can now click any phase card to explore its contents. Each phase builds on the previous one, creating a complete BA project experience.</p>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 mt-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  🚀 <strong>Ready to start?</strong> Begin with Project Initiation and work through each phase
                </p>
              </div>
            </div>
          )
        }
      ];

      console.log('🎯 [CareerJourneyTour] Built', s.length, 'steps');
      setSteps(s);
    };
    buildSteps();
  }, [user?.id]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type, action } = data;
    
    console.log('🎯 [CareerJourneyTour] Callback:', { status, index, type, action, lifecycle: data.lifecycle });
    
    // Handle step-by-step progression
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      console.log('🎯 [CareerJourneyTour] Moving from step', index, 'to', nextStepIndex);
      
      // Before step 2 (modal sections), open the modal
      if (nextStepIndex === 2 && action === ACTIONS.NEXT) {
        console.log('🎯 [CareerJourneyTour] Opening phase modal for step 2');
        onOpenPhaseModal(0);
        // Give modal time to render
        setTimeout(() => {
          setStepIndex(nextStepIndex);
        }, 400);
        return;
      }
      
      // Close modal when moving to last step
      if (nextStepIndex === 5 && action === ACTIONS.NEXT) {
        console.log('🎯 [CareerJourneyTour] Closing modal for final step');
        onClosePhaseModal();
      }
      
      setStepIndex(nextStepIndex);
    }
    
    // Handle completion
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      console.log('🎯 [CareerJourneyTour] Tour finished/skipped');
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
      scrollToFirstStep={true}
      disableOverlayClose
      spotlightClicks={false}
      styles={{
        options: {
          primaryColor: '#7c3aed',
          textColor: '#111827',
          zIndex: 10000,
          arrowColor: '#fff'
        },
        tooltip: {
          borderRadius: 12,
          padding: 20
        },
        tooltipContent: {
          padding: '8px 0'
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '8px'
        },
        buttonNext: {
          backgroundColor: '#7c3aed',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '10px 20px'
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '12px',
          fontSize: '14px'
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px'
        },
        spotlight: {
          borderRadius: 8
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          arrow: {
            length: 8,
            spread: 12
          }
        }
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default CareerJourneyTourJoyride;
