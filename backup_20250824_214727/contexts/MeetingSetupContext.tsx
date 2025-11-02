import React, { createContext, useContext, useState } from 'react';

interface MeetingSetupState {
  projectId: string;
  meetingType: string;
  selectedStakeholders: string[];
  selectedStage: string;
}

interface MeetingSetupContextType {
  setupData: MeetingSetupState;
  updateSetupData: (data: Partial<MeetingSetupState>) => void;
  resetSetupData: () => void;
}

const defaultState: MeetingSetupState = {
  projectId: '',
  meetingType: '',
  selectedStakeholders: [],
  selectedStage: ''
};

const MeetingSetupContext = createContext<MeetingSetupContextType | undefined>(undefined);

// Export the hook separately from the provider
export function useMeetingSetup() {
  const context = useContext(MeetingSetupContext);
  if (context === undefined) {
    throw new Error('useMeetingSetup must be used within a MeetingSetupProvider');
  }
  return context;
}

// Export the provider as a named export
export function MeetingSetupProvider({ children }: { children: React.ReactNode }) {
  const [setupData, setSetupData] = useState<MeetingSetupState>(defaultState);

  const updateSetupData = (data: Partial<MeetingSetupState>) => {
    setSetupData(prev => ({ ...prev, ...data }));
  };

  const resetSetupData = () => {
    setSetupData(defaultState);
  };

  return (
    <MeetingSetupContext.Provider value={{ setupData, updateSetupData, resetSetupData }}>
      {children}
    </MeetingSetupContext.Provider>
  );
}