import React from 'react';
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from 'react-joyride';

interface VoiceMeetingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

// Custom tooltip component
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

const VoiceMeetingTour: React.FC<VoiceMeetingTourProps> = ({ onComplete, onSkip }) => {
  const [run, setRun] = React.useState(true);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to your voice meeting! In the next 60 seconds, I\'ll show you how to navigate this interface and have natural conversations with AI stakeholders. Let\'s get started!',
      title: 'Voice Meeting Navigation',
      disableBeacon: true,
      placement: 'center'
    },
    {
      target: '[data-tour="meeting-header"]',
      content: 'This is your meeting header. You can see the project name, live status, and how many stakeholders are in the meeting.',
      title: 'Meeting Header',
      placement: 'bottom'
    },
    {
      target: '[data-tour="mode-toggle"]',
      content: 'Auto Send: Your speech is sent immediately. Review Mode: Edit your transcribed message before sending. Choose the mode that matches your practice style!',
      title: 'Conversation Modes',
      placement: 'bottom'
    },
    {
      target: '[data-tour="transcript-toggle"]',
      content: 'Toggle the conversation history on or off. In Review Mode, it\'s always visible so you can see everything before sending.',
      title: 'Transcript Toggle',
      placement: 'left'
    },
    {
      target: '[data-tour="participants"]',
      content: 'All meeting participants appear here. Watch for green pulse when you\'re speaking, purple border when stakeholders respond. Real-time visual feedback!',
      title: 'Live Participants',
      placement: 'bottom'
    },
    {
      target: '[data-tour="mic-button"]',
      content: 'The green microphone is your main control. Click it to start speaking! The AI listens, transcribes your words, and stakeholders respond naturally. Pro tip: Mention stakeholders by name!',
      title: 'Start Speaking',
      placement: 'top'
    },
    {
      target: '[data-tour="end-meeting"]',
      content: 'End your meeting when done. Don\'t worry - your conversation auto-saves, so you can leave and return anytime. Take your time practicing!',
      title: 'End Meeting',
      placement: 'top'
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as STATUS)) {
      setRun(false);
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
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      disableCloseOnEsc
      hideCloseButton
      scrollToFirstStep
      spotlightClicks={false}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#7c3aed',
          textColor: '#111827',
        }
      }}
    />
  );
};

export default VoiceMeetingTour;

