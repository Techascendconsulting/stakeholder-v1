import { createContext, useContext, useState, ReactNode } from 'react';

type StakeholderBotContextType = {
  isOpen: boolean;
  toggleBot: () => void;
  openBot: () => void;
  closeBot: () => void;
  currentUserStory: string;
  setCurrentUserStory: (story: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

const StakeholderBotContext = createContext<StakeholderBotContextType | undefined>(undefined);

export const StakeholderBotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUserStory, setCurrentUserStory] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const toggleBot = () => setIsOpen((prev) => !prev);
  const openBot = () => setIsOpen(true);
  const closeBot = () => setIsOpen(false);

  return (
    <StakeholderBotContext.Provider
      value={{ isOpen, toggleBot, openBot, closeBot, currentUserStory, setCurrentUserStory, currentStep, setCurrentStep }}
    >
      {children}
    </StakeholderBotContext.Provider>
  );
};

export const useStakeholderBot = () => {
  const context = useContext(StakeholderBotContext);
  if (!context) {
    throw new Error('useStakeholderBot must be used within a StakeholderBotProvider');
  }
  return context;
};




