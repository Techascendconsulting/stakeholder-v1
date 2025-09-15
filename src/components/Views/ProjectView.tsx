import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useMeetingSetup } from '../../contexts/MeetingSetupContext';
import MeetingSetupFlow from './MeetingSetupFlow';

const ProjectView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { setCurrentView, setSelectedStakeholders, stakeholders } = useApp();
  const { updateSetupData } = useMeetingSetup();

  const handleSetupComplete = () => {
    // Route based on meeting type selected during setup
    // Default to transcript meeting if none selected
    try {
      // Meeting type is stored in context; we optimistically route to voice-only if chosen
      const raw = localStorage.getItem("meetingSetupData");
      const setup = raw ? JSON.parse(raw) : {};
      
      // Set selected stakeholders in global context
      const type = setup?.meetingType || "text";
      if (setup?.selectedStakeholders && Array.isArray(setup.selectedStakeholders)) {
        const selectedStakeholderIds = setup.selectedStakeholders;
        const selectedStakeholders = stakeholders.filter(stakeholder => 
          selectedStakeholderIds.includes(stakeholder.id)
        );
        console.log("👥 PROJECT_VIEW: Setting selected stakeholders:", selectedStakeholders.length);
        setSelectedStakeholders(selectedStakeholders);
      }
      // Hard-set to text chat with AI suggestions
      setCurrentView('meeting');
    } catch {
      setCurrentView('meeting');
    }
  };

  const handleBack = () => {
    setCurrentView('project');
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
