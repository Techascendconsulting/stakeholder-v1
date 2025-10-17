import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
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
  const [steps, setSteps] = React.useState<Step[]>([]);

  React.useEffect(() => {
    const buildSteps = async () => {
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
          target: '.career-journey-container',
          placement: 'bottom',
          title: 'Your BA Project Journey',
          content: (
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                This timeline shows the complete BA project lifecycle from onboarding through continuous delivery. 
                Each phase builds on the previous one, giving you real-world experience.
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  💡 <strong>Do this next:</strong> Click any phase card to explore its contents
                </p>
              </div>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '[data-phase-index="0"]',
          placement: 'right',
          title: 'Phase Cards',
          content: (
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                Each card represents a critical phase in your BA journey. Click anywhere on a card to see 
                detailed topics, deliverables, stakeholders, and learning modules.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  🎯 <strong>Pro tip:</strong> Start with "Project Initiation" to understand the full scope
                </p>
              </div>
            </div>
          ),
          before: () => {
            onClosePhaseModal();
            return new Promise(resolve => setTimeout(resolve, 100));
          }
        },
        {
          target: '[data-phase-index="0"]',
          placement: 'right',
          title: 'Phase Details',
          content: (
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                This detailed view shows everything about the phase - topics to master, deliverables to create, 
                stakeholders to engage, and direct links to learning content.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✅ <strong>Action items:</strong> Review topics → Check deliverables → Plan stakeholder meetings
                </p>
              </div>
            </div>
          ),
          before: () => {
            onOpenPhaseModal(0);
            return new Promise(resolve => setTimeout(resolve, 300));
          }
        },
        {
          target: '.phase-modal-learning',
          placement: 'right',
          title: 'Learning Modules',
          content: (
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                These are the specific learning modules that prepare you for this phase. Each module 
                builds essential BA skills through interactive content and real-world scenarios.
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
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
              <p className="text-gray-700 dark:text-gray-300">
                These are the actual documents and artifacts you'll create as a BA. Each deliverable 
                has templates and examples to guide your work.
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  📋 <strong>Pro tip:</strong> Use the templates in My Resources to accelerate your work
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
              <p className="text-gray-700 dark:text-gray-300">
                These are the key stakeholders you'll work with in this phase. Practice conversations 
                with AI-powered versions of these stakeholders to build confidence.
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                  🎭 <strong>Practice tip:</strong> Use My Practice Journey to rehearse these conversations
                </p>
              </div>
            </div>
          )
        },
        {
          target: '.phase-modal-close',
          placement: 'top',
          title: 'Close & Explore',
          content: (
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                Close this modal to explore other phases. Each phase builds on the previous one, 
                creating a complete BA project experience.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  🚀 <strong>Ready to start?</strong> Begin with Project Initiation and work through each phase
                </p>
              </div>
            </div>
          ),
          before: () => {
            onClosePhaseModal();
            return new Promise(resolve => setTimeout(resolve, 100));
          }
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
        },
        tooltip: {
          borderRadius: 12,
          padding: 0
        },
        tooltipContent: {
          padding: '20px'
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#111827'
        },
        tooltipFooter: {
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        },
        buttonNext: {
          backgroundColor: '#7c3aed',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '8px 16px'
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '8px',
          fontSize: '14px',
          fontWeight: '500'
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '500'
        }
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default CareerJourneyTourJoyride;
