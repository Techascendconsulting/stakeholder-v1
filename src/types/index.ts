export interface Project {
  id: string
  name: string
  description: string
  businessContext: string
  problemStatement: string
  asIsProcess: string
  businessGoals: string[]
  duration: string
  complexity: 'Beginner' | 'Intermediate' | 'Advanced'
  isCustom?: boolean
  stakeholderRoles?: string[]
  industry?: string
  projectType?: string
}

export interface Stakeholder {
  id: string
  name: string
  role: string
  department: string
  bio: string
  photo: string
  personality: string
  priorities: string[]
  voice: string
  expertise: string[]
  isCustom?: boolean
}

export interface Meeting {
  id: string
  projectId: string
  stakeholderIds: string[]
  transcript: Message[]
  date: string
  duration: number
  status: 'scheduled' | 'in_progress' | 'completed'
  meetingType: 'individual' | 'group'
}

export interface Message {
  id: string
  speaker: 'user' | string // stakeholder ID for group meetings
  content: string
  timestamp: string
  stakeholderName?: string
  stakeholderRole?: string
}

export interface Deliverable {
  id: string
  projectId: string
  type: 'goals' | 'user-stories' | 'acceptance-criteria' | 'brd'
  title: string
  content: string
  lastModified: string
}

export interface CoreConcept {
  id: string;
  title: string;
  summary: string;
  description: string;
  keyPoints: string[];
  videoUrl?: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export type AppView = 
  | 'dashboard' 
  | 'training-projects' 
  | 'core-concepts'
  | 'my-meetings' 
  | 'voice-meeting' 
  | 'settings' 
  | 'profile'
  | 'custom-project'
  | 'custom-stakeholders'
  | 'guided-practice-hub'
  | 'projects'
  | 'project-brief'
  | 'stakeholders'
  | 'meeting-mode-selection'
  | 'meeting'
  | 'voice-only-meeting'
  | 'meeting-history'
  | 'meeting-summary'
  | 'raw-transcript'
  | 'notes'
  | 'deliverables'
  | 'analysis';