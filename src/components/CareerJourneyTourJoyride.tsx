import React from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS, TooltipRenderProps } from 'react-joyride';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface CareerJourneyTourJoyrideProps {
  onComplete: () => void;
  onSkip: () => void;
  onOpenPhaseModal: (phaseIndex: number) => void;
  onClosePhaseModal: () => void;
}

// Custom tooltip component - NO progress indicator (will be separate)
const CustomTooltip: React.FC<TooltipRenderProps> = ({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps
}) => {
  return (
    <div {...tooltipProps}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-purple-500" style={{ maxWidth: '28rem' }}>
        {/* Content */}
        <div style={{ padding: '24px' }}>
          {step.title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {step.title}
            </h3>
          )}
          <div className="text-gray-700 dark:text-gray-300">
            {step.content}
          </div>
        </div>

        {/* Footer with buttons */}
        <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }} className="flex items-center justify-between dark:border-gray-700">
          <button
            {...skipProps}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
          >
            Skip Tour
          </button>
          <div className="flex items-center space-x-2">
            {index > 0 && (
              <button
                {...backProps}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
              >
                Back
              </button>
            )}
            <button
              {...primaryProps}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {continuous ? 'Next' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Debug: Log when tour renders and inspect DOM
  React.useEffect(() => {
    if (run) {
      console.log('═══════════════════════════════════════');
      console.log('🔍 TOUR DEBUG: Tour is running, stepIndex:', stepIndex);
      console.log('═══════════════════════════════════════');
      setTimeout(() => {
        // Find and log all Joyride elements
        const tooltips = document.querySelectorAll('[class*="react-joyride"], [class*="__floater"], [role="status"], [data-test-id]');
        console.log('🔍 TOUR DEBUG: Found elements:', tooltips.length);
        tooltips.forEach((el, i) => {
          const htmlEl = el as HTMLElement;
          console.log(`🔍 TOUR DEBUG Element ${i}:`);
          console.log('  className:', htmlEl.className);
          console.log('  role:', htmlEl.getAttribute('role'));
          console.log('  innerHTML:', htmlEl.innerHTML?.substring(0, 150));
          console.log('  position:', window.getComputedStyle(htmlEl).position);
          console.log('  top:', window.getComputedStyle(htmlEl).top);
          console.log('  bottom:', window.getComputedStyle(htmlEl).bottom);
        });
        
        // Try to find progress specifically
        const progress = document.querySelector('[role="status"]');
        if (progress) {
          const htmlProgress = progress as HTMLElement;
          console.log('✅ TOUR DEBUG: Progress element found!');
          console.log('  className:', htmlProgress.className);
          console.log('  innerHTML:', htmlProgress.innerHTML);
          console.log('  position:', window.getComputedStyle(htmlProgress).position);
          console.log('  top:', window.getComputedStyle(htmlProgress).top);
          console.log('  right:', window.getComputedStyle(htmlProgress).right);
          console.log('  bottom:', window.getComputedStyle(htmlProgress).bottom);
          console.log('  left:', window.getComputedStyle(htmlProgress).left);
        } else {
          console.log('❌ TOUR DEBUG: No progress element found with role="status"');
          console.log('   Searching for alternatives...');
          
          // Try other possible selectors
          const alt1 = document.querySelector('.react-joyride__tooltip-progress');
          const alt2 = document.querySelector('[aria-live="polite"]');
          const alt3 = document.querySelectorAll('div[style*="position"]');
          
          console.log('   .react-joyride__tooltip-progress:', alt1 ? 'FOUND' : 'not found');
          console.log('   [aria-live="polite"]:', alt2 ? 'FOUND' : 'not found');
          console.log('   divs with position style:', alt3.length);
        }
        console.log('═══════════════════════════════════════');
      }, 500);
    }
  }, [run, stepIndex]);

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

      const isNewUser = userType === 'new';

      const s: Step[] = [
        {
          target: 'body',
          placement: 'center',
          title: 'Welcome to Your BA Project Lifecycle',
          content: (
            <div className="space-y-3">
              <p>This timeline shows the complete BA project lifecycle. Each phase builds on the previous one.</p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800 mt-3">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  💡 <strong>Click Next</strong> and I'll show you how to explore each phase
                </p>
              </div>
            </div>
          ),
          disableBeacon: true
        },
        {
          target: '[data-phase-index="0"]',
          placement: 'right',
          title: isNewUser ? 'Click Unlocked Phase Cards' : 'Click Any Phase Card',
          content: (
            <div className="space-y-3">
              <p>
                {isNewUser 
                  ? 'Each card shows a phase in your BA journey. Phases 1 (Onboarding) and 2 (Discovery) are unlocked for you to start. Other phases unlock as you complete the previous one. Click any unlocked card to see detailed topics and learning modules.'
                  : 'Each card shows a phase in your BA journey. When the tour finishes, you can click any card to see detailed topics and learning modules.'
                }
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-3">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  🎯 <strong>Pro tip:</strong> {isNewUser ? 'Start with Phase 1 (Onboarding)' : 'Start with Phase 2 (Discovery)'}
                </p>
              </div>
            </div>
          )
        },
        {
          target: '.phase-modal-container',
          placement: 'right',
          title: 'Topics & Activities',
          content: (
            <div className="space-y-3">
              <p>The modal shows detailed phase information. The first section contains all topics and activities - click on any topic to dive deeper.</p>
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
          placement: 'bottom',
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
          title: "You're All Set!",
          content: (
            <div className="space-y-3">
              <p>You can now click any phase card to explore. Each phase builds on the previous one.</p>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 mt-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  🚀 <strong>Start:</strong> Begin with Project Initiation
                </p>
              </div>
            </div>
          ),
          locale: {
            last: 'Done'
          }
        }
      ];

      setSteps(s);
    };
    buildSteps();
  }, [user?.id]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    try {
      const { status, index, type, action } = data;
      
      console.log('🔍 TOUR CALLBACK:', { status, index, type, action });
    
    // Handle step progression
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      console.log('🔍 TOUR: Moving from', index, 'to', nextStepIndex, 'action:', action);
      
      // FORWARD navigation
      if (action === ACTIONS.NEXT) {
        // Going to step 2 (index 2) - open modal
        if (nextStepIndex === 2) {
          console.log('🔍 TOUR: Opening modal for step 2');
          onOpenPhaseModal(0);
          setTimeout(() => {
            setStepIndex(nextStepIndex);
          }, 500);
          return;
        }
        
        // Going to step 4 (index 4) - close modal
        if (nextStepIndex === 4) {
          console.log('🔍 TOUR: Closing modal for step 4');
          onClosePhaseModal();
        }
      }
      
      // BACKWARD navigation
      if (action === ACTIONS.PREV) {
        // Going back to step 4 (index 3) or step 3 (index 2) - ensure modal is open
        if (nextStepIndex === 3 || nextStepIndex === 2) {
          console.log('🔍 TOUR: Re-opening modal for step', nextStepIndex + 1);
          onOpenPhaseModal(0);
          setTimeout(() => {
            setStepIndex(nextStepIndex);
          }, 500);
          return;
        }
        
        // Going back to step 2 (index 1) - close modal
        if (nextStepIndex === 1) {
          console.log('🔍 TOUR: Closing modal, going back to step 2');
          onClosePhaseModal();
        }
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
    } catch (error) {
      console.error('❌ TOUR ERROR:', error);
      // Gracefully handle tour errors
      onSkip();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={false}
      showSkipButton={true}
      stepIndex={stepIndex}
      disableScrolling={false}
      scrollToFirstStep
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          primaryColor: '#7c3aed',
          textColor: '#111827',
          zIndex: 10000
        },
        tooltipTitle: {
          textAlign: 'left',
          marginTop: '20px'
        },
        tooltipContent: {
          padding: '12px 0'
        },
        buttonNext: {
          backgroundColor: '#7c3aed',
          borderRadius: '8px',
          padding: '8px 24px'
        },
        buttonBack: {
          color: '#7c3aed',
          marginRight: '8px'
        },
        buttonSkip: {
          color: '#6b7280'
        }
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: 'none'
          }
        }
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Done',
        next: 'Next',
        skip: 'Skip Tour'
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default CareerJourneyTourJoyride;
