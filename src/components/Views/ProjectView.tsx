import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useMeetingSetup } from '../../contexts/MeetingSetupContext';
import MeetingSetupFlow from './MeetingSetupFlow';

const ProjectView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { setCurrentView } = useApp();
  const { updateSetupData } = useMeetingSetup();

  const handleSetupComplete = () => {
    setCurrentView('meeting');
  };

  const handleBack = () => {
    setCurrentView('projects');
  };

  return (
    <MeetingSetupFlow
      projectId={projectId}
      onComplete={handleSetupComplete}
      onBack={handleBack}
    />
  );
};

export default ProjectView;
