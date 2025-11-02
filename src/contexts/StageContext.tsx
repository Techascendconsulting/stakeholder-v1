import React, { createContext, useContext, useState } from 'react';
import { MeetingStage } from '../components/StageIndicator';

interface StageContextType {
  currentStage: MeetingStage;
  stageObjective: string;
  transcripts: Record<MeetingStage, string[]>;
  attempts: number;
  setCurrentStage: (stage: MeetingStage) => void;
  addToTranscript: (stage: MeetingStage, message: string) => void;
  incrementAttempts: () => void;
  resetAttempts: () => void;
}

const StageContext = createContext<StageContextType | undefined>(undefined);

export const StageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStage, setCurrentStage] = useState<MeetingStage>('problem_exploration');
  const [transcripts, setTranscripts] = useState<Record<MeetingStage, string[]>>({
    problem_exploration: [],
    as_is: [],
    to_be: [],
    wrap_up: []
  });
  const [attempts, setAttempts] = useState(0);

  const stageObjectives: Record<MeetingStage, string> = {
    problem_exploration: 'Discover pain points and blockers. Do not propose solutions.',
    as_is: 'Map out the current process step by step.',
    to_be: 'Discuss desired improvements and future state.',
    wrap_up: 'Confirm understanding and next steps.'
  };

  const addToTranscript = (stage: MeetingStage, message: string) => {
    setTranscripts(prev => ({
      ...prev,
      [stage]: [...(prev[stage] || []), message]
    }));
  };

  const incrementAttempts = () => setAttempts(prev => Math.min(prev + 1, 3));
  const resetAttempts = () => setAttempts(0);

  return (
    <StageContext.Provider value={{
      currentStage,
      stageObjective: stageObjectives[currentStage],
      transcripts,
      attempts,
      setCurrentStage,
      addToTranscript,
      incrementAttempts,
      resetAttempts
    }}>
      {children}
    </StageContext.Provider>
  );
};

export const useStage = () => {
  const context = useContext(StageContext);
  if (context === undefined) {
    throw new Error('useStage must be used within a StageProvider');
  }
  return context;
};
