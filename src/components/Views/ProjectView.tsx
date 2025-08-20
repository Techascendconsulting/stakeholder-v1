import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useMeetingSetup } from '../../contexts/MeetingSetupContext';
import MeetingSetupFlow from './MeetingSetupFlow';

const ProjectView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { setCurrentView } = useApp();
  const { updateSetupData } = useMeetingSetup();

  const handleSetupComplete = () => {
    // Route based on meeting type selected during setup
    // Default to transcript meeting if none selected
    try {
      // Meeting type is stored in context; we optimistically route to voice-only if chosen
      // Fallback to text meeting view otherwise
      // We avoid importing context here to keep this component simple
      const raw = localStorage.getItem('meetingSetupData');
      const setup = raw ? JSON.parse(raw) : {};
      const type = setup?.meetingType || '';
      if (type === 'voice') {
        setCurrentView('voice-only-meeting');
      } else {
        setCurrentView('meeting');
      }
    } catch {
      setCurrentView('meeting');
    }
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
