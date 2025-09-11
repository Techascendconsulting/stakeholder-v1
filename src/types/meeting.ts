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
  priorities?: string[];
  personality?: string;
  expertise?: string;
  photo?: string;
  bio?: string;
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
  complexity?: string;
  duration?: string;
  asIsProcess?: string;
  priorities?: string[];
  personality?: string;
  expertise?: string;
  relevantStakeholders?: string[];
  photo?: string;
  bio?: string;
}

export interface MeetingType {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  features: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: Date;
  participants: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'diagram' | 'report' | 'presentation';
  status: 'draft' | 'review' | 'approved' | 'published';
  dueDate: Date;
  assignedTo: string;
}