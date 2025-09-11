import { createContext, useContext, useState, ReactNode } from 'react';

export type StakeholderPersona = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  focus: string;
  responseStyle: string;
};

type StakeholderBotContextType = {
  isOpen: boolean;
  toggleBot: () => void;
  openBot: () => void;
  closeBot: () => void;
  currentUserStory: string;
  setCurrentUserStory: (story: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  currentScenario: any;
  setBotCurrentScenario: (scenario: any) => void;
  currentStakeholder: StakeholderPersona | null;
  setCurrentStakeholder: (stakeholder: StakeholderPersona | null) => void;
};

// Stakeholder personas
export const STAKEHOLDER_PERSONAS: StakeholderPersona[] = [
  {
    id: 'product-manager',
    name: 'Sarah Chen',
    role: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    color: 'from-blue-500 to-blue-600',
    focus: 'Business value, user needs, and product strategy',
    responseStyle: 'Focuses on business impact and user value. Asks about ROI and user adoption.'
  },
  {
    id: 'operations-manager',
    name: 'Mike Rodriguez',
    role: 'Operations Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    color: 'from-green-500 to-green-600',
    focus: 'Operational efficiency, process optimization, and daily workflow',
    responseStyle: 'Focuses on operational impact and process efficiency. Asks about workflow optimization and business operations.'
  },
  {
    id: 'technical-lead',
    name: 'Alex Kim',
    role: 'Technical Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    color: 'from-purple-500 to-purple-600',
    focus: 'Technical feasibility, performance, and system integration',
    responseStyle: 'Focuses on technical constraints and implementation. Asks about performance and integration.'
  },
  {
    id: 'business-stakeholder',
    name: 'Emma Thompson',
    role: 'Business Stakeholder',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    color: 'from-orange-500 to-orange-600',
    focus: 'Requirements clarity, process improvement, and data quality',
    responseStyle: 'Focuses on requirements clarity and process efficiency. Asks about data validation and edge cases.'
  }
];

const StakeholderBotContext = createContext<StakeholderBotContextType | undefined>(undefined);

export const StakeholderBotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUserStory, setCurrentUserStory] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [currentStakeholder, setCurrentStakeholder] = useState<StakeholderPersona | null>(null);

  const toggleBot = () => setIsOpen((prev) => !prev);
  const openBot = () => {
    // Randomly select a stakeholder when opening the bot
    const randomStakeholder = STAKEHOLDER_PERSONAS[Math.floor(Math.random() * STAKEHOLDER_PERSONAS.length)];
    setCurrentStakeholder(randomStakeholder);
    setIsOpen(true);
  };
  const closeBot = () => setIsOpen(false);
  const setBotCurrentScenario = (scenario: any) => setCurrentScenario(scenario);

  return (
    <StakeholderBotContext.Provider
      value={{ isOpen, toggleBot, openBot, closeBot, currentUserStory, setCurrentUserStory, currentStep, setCurrentStep, currentScenario, setBotCurrentScenario, currentStakeholder, setCurrentStakeholder }}
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




