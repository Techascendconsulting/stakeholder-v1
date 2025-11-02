export interface MeetingStage {
  id: string;
  name: string;
  objective: string;
  forbidden: string[];
  redirectMessage: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'stakeholder' | 'system';
  timestamp: Date;
  isRedirect?: boolean;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  background: string;
  selected?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  businessImpact: string;
  roiPotential: string;
  priority: 'High Priority' | 'Critical Priority';
  tier: 'Premium' | 'Enterprise';
  status: 'active' | 'available';
}

export interface MeetingType {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  features: string[];
}