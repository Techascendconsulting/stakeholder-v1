import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, SkipForward, HelpCircle } from 'lucide-react';

interface GuideStep {
  id: number;
  title: string;
  body: string;
  target: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface ProcessGuideProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
}

const ProcessGuide: React.FC<ProcessGuideProps> = ({
  isOpen,
  onClose,
  currentStep,
  onStepChange,
  onComplete
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const guideSteps: GuideStep[] = [
    {
      id: 0,
      title: 'Choose your mode',
      body: 'Pick As-Is (how it works today) or To-Be (how it should work). This keeps your map focused.',
      target: '#pm-toolbar',
      placement: 'bottom'
    },
    {
      id: 1,
      title: 'Add roles/teams',
      body: 'From the palette, drag Pool/Lane onto the canvas. Rename lanes to your actors (e.g., Customer, App, Support).',
      target: '#pm-palette',
      placement: 'right'
    },
    {
      id: 2,
      title: 'Add a Start Event',
      body: 'Drag the Start (circle) into the first lane that kicks things off. Label it with a trigger (e.g., "Customer submits request").',
      target: '#pm-canvas',
      placement: 'top'
    },
    {
      id: 3,
      title: 'Add the first step',
      body: 'Drag Task into the same lane. Name it verb + object (e.g., "Validate request details"). Avoid vague labels like "Check stuff".',
      target: '#pm-canvas',
      placement: 'top'
    },
    {
      id: 4,
      title: 'Join steps',
      body: 'Use the connector to draw a Sequence Flow from Start → Task (left-to-right).',
      target: '#pm-canvas',
      placement: 'top'
    },
    {
      id: 5,
      title: 'Add a decision (gateway)',
      body: 'Drag a Gateway (diamond) after the task. Phrase it as a question (e.g., "Is customer verified?").',
      target: '#pm-canvas',
      placement: 'top'
    },
    {
      id: 6,
      title: 'Label outcomes',
      body: 'Click each outgoing arrow and label it (e.g., "Yes", "No"). Unlabeled branches cause confusion.',
      target: '#pm-canvas',
      placement: 'top'
    },
    {
      id: 7,
      title: 'Complete the happy path',
      body: 'Add the next Task in the correct lane (owner), then continue the flow.',
      target: '#pm-canvas',
      placement: 'top'
    },
    {
      id: 8,
      title: 'Handle exceptions',
      body: 'Add a Task that happens when the answer is "No" (e.g., "Request ID documents") and connect it. Keep owners accurate via lanes.',
      target: '#pm-canvas',
      placement: 'top'
    },
    {
      id: 9,
      title: 'Add statements/notes',
      body: 'Use Text Annotation to capture rules/SLA (e.g., "Accept passport or driving licence only"). Attach to the relevant step.',
      target: '#pm-canvas',
      placement: 'top'
    },
    {
      id: 10,
      title: 'Add an End Event',
      body: 'Add one or more End (bold circle) to show where each branch finishes (e.g., "Request approved", "Request rejected").',
      target: '#pm-canvas',
      placement: 'top'
    },
    {
      id: 11,
      title: 'Check my map',
      body: 'Toggle AI Coach → ON and click Check My Map. The coach flags missing end events, vague task names, unlabeled branches, or misplaced steps.',
      target: '#pm-toolbar',
      placement: 'bottom'
    },
    {
      id: 12,
      title: 'Save and export',
      body: 'Click Save to store the XML, and Export to get a PNG/SVG/PDF for your portfolio.',
      target: '#pm-toolbar',
      placement: 'bottom'
    }
  ];

  const currentGuideStep = guideSteps[currentStep];

  useEffect(() => {
    if (isOpen && currentGuideStep) {
      const element = document.querySelector(currentGuideStep.target) as HTMLElement;
      setTargetElement(element);
    }
  }, [isOpen, currentStep, currentGuideStep]);

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      onStepChange(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen || !currentGuideStep) return null;

  return (
    <>

      


      {/* Compact Tooltip - Fixed Position - Always Visible */}
      <div className="fixed top-16 right-6 z-40 w-64 bg-white rounded-lg shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Step {currentStep + 1} of {guideSteps.length}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">{currentGuideStep.title}</h4>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            {currentGuideStep.body}
          </p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / guideSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / guideSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                <ChevronLeft size={12} />
                <span>Prev</span>
              </button>
              
              <button
                onClick={handleSkip}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 rounded"
              >
                <SkipForward size={12} />
                <span>Skip</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              <span>{currentStep === guideSteps.length - 1 ? 'Finish' : 'Next'}</span>
              {currentStep < guideSteps.length - 1 && <ChevronRight size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* Compact Mini Stepper - Positioned very close under the step modal */}
      <div className="fixed right-6 top-80 z-40">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 max-h-64 overflow-y-auto w-64">
          <div className="text-xs font-medium text-gray-700 mb-2 px-1">Quick Jump</div>
          <div className="space-y-0.5">
            {guideSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => onStepChange(index)}
                className={`w-full text-left px-1.5 py-0.5 rounded text-xs transition-colors ${
                  index === currentStep
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : index < currentStep
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <div className={`w-1 h-1 rounded-full flex-shrink-0 ${
                    index === currentStep ? 'bg-blue-600' : 
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="truncate text-xs leading-tight">{index + 1}. {step.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessGuide;
