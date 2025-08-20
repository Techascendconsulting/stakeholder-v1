import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

// Step components (to be created)
import ProjectBrief from '../MeetingSetup/ProjectBrief';
import MeetingTypeSelector from '../MeetingSetup/MeetingTypeSelector';
import StageSelector from '../MeetingSetup/StageSelector';
import StakeholderSelector from '../MeetingSetup/StakeholderSelector';
import { useMeetingSetup } from '../../contexts/MeetingSetupContext';

type SetupStep = 'brief' | 'type' | 'stage' | 'stakeholders';

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
  const { updateSetupData } = useMeetingSetup();
  const [currentStep, setCurrentStep] = useState<SetupStep>('brief');
  const [meetingData, setMeetingData] = useState({
    projectId,
    meetingType: '',
    selectedStage: '',
    selectedStakeholders: [],
  });

  const steps: SetupStep[] = ['brief', 'type', 'stage', 'stakeholders'];
  
  const stepComponents = {
    brief: ProjectBrief,
    type: MeetingTypeSelector,
    stage: StageSelector,
    stakeholders: StakeholderSelector
  };

  const stepTitles = {
    brief: 'Project Brief',
    type: 'Meeting Type',
    stage: 'Select Stage',
    stakeholders: 'Stakeholders'
  };

  // Restore progress on mount (so refresh stays on the same step)
  const restoredRef = React.useRef(false);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('meetingSetupProgress');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.projectId === projectId) {
        if (saved.meetingData) {
          setMeetingData((prev) => ({ ...prev, ...saved.meetingData }));
        }
        if (saved.currentStep && steps.includes(saved.currentStep)) {
          setCurrentStep(saved.currentStep as SetupStep);
        }
      }
    } catch {}
    restoredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Persist progress on change
  React.useEffect(() => {
    // Avoid overwriting a saved step with the initial 'brief' on first mount
    if (!restoredRef.current) return;
    try {
      localStorage.setItem(
        'meetingSetupProgress',
        JSON.stringify({ projectId, currentStep, meetingData })
      );
    } catch {}
  }, [projectId, currentStep, meetingData]);

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      try {
        updateSetupData(meetingData as any);
        localStorage.setItem('meetingSetupData', JSON.stringify(meetingData));
      } catch {}
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

      {/* Progress Steps (refined styling) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 sm:px-6 py-4 shadow-sm mb-8">
          <div className="flex items-center">
            {steps.map((step, index) => {
              const currentIndex = steps.indexOf(currentStep)
              const state = index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'upcoming'
              const canNavigate = index < currentIndex // only steps already completed are clickable
              return (
                <div key={step} className="flex items-center min-w-0">
                  <button
                    type="button"
                    onClick={() => { if (canNavigate) setCurrentStep(step) }}
                    disabled={!canNavigate}
                    className={`flex items-center px-2 sm:px-3 py-1.5 rounded-full border text-sm transition-colors select-none ${
                    state === 'active'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-300'
                      : state === 'completed'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300'
                      : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                  } ${
                    canNavigate ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed opacity-80'
                  }`}>
                    <span className={`inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full text-xs font-semibold ${
                      state === 'active'
                        ? 'bg-indigo-600 text-white'
                        : state === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`truncate ${state === 'active' ? 'font-medium' : ''}`}>{stepTitles[step]}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-3">
                      <div className={`h-0.5 rounded ${
                        index < currentIndex
                          ? 'bg-emerald-300 dark:bg-emerald-700'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
