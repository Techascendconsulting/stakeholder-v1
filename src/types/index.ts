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

export type AppView = 'dashboard' | 'projects' | 'project-brief' | 'stakeholders' | 'meeting' | 'notes' | 'deliverables' | 'profile' | 'analysis' | 'custom-project' | 'custom-stakeholders'