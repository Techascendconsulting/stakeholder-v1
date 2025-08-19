import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

// Step components (to be created)
import ProjectBrief from '../MeetingSetup/ProjectBrief';
import MeetingTypeSelector from '../MeetingSetup/MeetingTypeSelector';
import StakeholderSelector from '../MeetingSetup/StakeholderSelector';
import StageSelector from '../MeetingSetup/StageSelector';
import ReadyScreen from '../MeetingSetup/ReadyScreen';

type SetupStep = 'brief' | 'type' | 'stakeholders' | 'stage' | 'ready';

interface MeetingSetupFlowProps {
  projectId: string;
  onComplete: () => void;
  onBack: () => void;
}

const MeetingSetupFlow: React.FC<MeetingSetupFlowProps> = ({
  projectId,
  onComplete,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('brief');
  const [meetingData, setMeetingData] = useState({
    projectId,
    meetingType: '',
    selectedStakeholders: [],
    selectedStage: '',
  });

  const steps: SetupStep[] = ['brief', 'type', 'stakeholders', 'stage', 'ready'];
  
  const stepComponents = {
    brief: ProjectBrief,
    type: MeetingTypeSelector,
    stakeholders: StakeholderSelector,
    stage: StageSelector,
    ready: ReadyScreen
  };

  const stepTitles = {
    brief: 'Project Brief',
    type: 'Meeting Type',
    stakeholders: 'Stakeholders',
    stage: 'Select Stage',
    ready: 'Ready'
  };

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex === 0) {
      onBack();
    } else {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const CurrentStepComponent = stepComponents[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Projects</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === currentStep
                    ? 'bg-indigo-600 text-white'
                    : index < steps.indexOf(currentStep)
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`ml-2 ${
                  step === currentStep
                    ? 'text-gray-900 dark:text-white font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {stepTitles[step]}
              </span>
              {index < steps.length - 1 && (
                <div className="w-full h-0.5 bg-gray-200 dark:bg-gray-700 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CurrentStepComponent
          data={meetingData}
          onUpdate={(newData) => setMeetingData({ ...meetingData, ...newData })}
          onNext={handleNext}
        />
      </div>
    </div>
  );
};

export default MeetingSetupFlow;
