import React from 'react';
import { phases, sections, steps } from '../services/mockData';

export interface JourneyAPI {
  getNextStepId: () => string | null;
  getPhaseIdForStep: (stepId: string) => string | null;
}

export const initJourneyState = (): JourneyAPI => {
  // Find first unlocked step (mock: first step of phase 0)
  const firstPhase = [...phases].sort((a, b) => a.order - b.order)[0];
  const firstSection = sections.filter(s => s.phaseId === firstPhase.id).sort((a, b) => a.order - b.order)[0];
  const firstStep = steps.filter(st => st.sectionId === firstSection.id).sort((a, b) => a.order - b.order)[0] || null;

  return {
    getNextStepId: () => firstStep?.id || null,
    getPhaseIdForStep: (stepId: string) => {
      const step = steps.find(s => s.id === stepId);
      if (!step) return null;
      const section = sections.find(sc => sc.id === step.sectionId);
      if (!section) return null;
      return section.phaseId;
    }
  };
};

const JourneyContext = React.createContext<JourneyAPI | null>(null);
export const JourneyProvider = JourneyContext.Provider;
export const useJourney = () => {
  const ctx = React.useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider');
  return ctx;
};


