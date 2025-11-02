import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useMeetingSetup } from '../../contexts/MeetingSetupContext';
import MeetingSetupFlow from './MeetingSetupFlow';

const ProjectView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { setCurrentView, setSelectedStakeholders, stakeholders } = useApp();
  const { updateSetupData } = useMeetingSetup();

  const handleSetupComplete = () => {
    // Always route to meeting mode selection page after setup is complete
    try {
      // Set selected stakeholders in global context
      const raw = localStorage.getItem("meetingSetupProgress");
      const setup = raw ? JSON.parse(raw) : {};
      
      console.log("🔍 PROJECT_VIEW: Setup data:", setup);
      if (setup?.meetingData?.selectedStakeholders && Array.isArray(setup.meetingData.selectedStakeholders)) {
        const selectedStakeholderIds = setup.meetingData.selectedStakeholders;
        const selectedStakeholders = stakeholders.filter(stakeholder => 
          selectedStakeholderIds.includes(stakeholder.id)
        );
        console.log("👥 PROJECT_VIEW: Setting selected stakeholders:", selectedStakeholders.length);
        setSelectedStakeholders(selectedStakeholders);
      }
      
      // Route to meeting mode selection page
      console.log("🎯 PROJECT_VIEW: Routing to meeting mode selection");
      setCurrentView('meeting-mode-selection');
    } catch {
      setCurrentView('meeting-mode-selection');
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
