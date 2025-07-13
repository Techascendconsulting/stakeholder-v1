// Mock database service for development
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
}

export interface Message {
  id: string
  meeting_id?: string
  speaker_type?: 'ba' | 'stakeholder' | 'system'
  speaker_id?: string
  content: string
  sequence_number?: number
  created_at: string
  stakeholderName?: string
  stakeholderRole?: string
  speaker?: string
  timestamp?: string
}

export interface Student {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  project_id: string
  ba_id: string
  meeting_type: 'group' | 'individual'
  status: 'in-progress' | 'completed' | 'paused'
  started_at: string
  ended_at?: string
  duration_minutes: number
  created_at: string
  updated_at: string
}

// Mock database service
export class DatabaseService {
  static async createMeeting(
    projectId: string,
    baId: string,
    stakeholderIds: string[],
    meetingType: 'group' | 'individual'
  ): Promise<string> {
    // Mock implementation
    const meetingId = `meeting-${Date.now()}`
    console.log('Created meeting:', meetingId)
    return meetingId
  }

  static async saveMessage(
    meetingId: string,
    speakerType: 'ba' | 'stakeholder' | 'system',
    content: string,
    speakerId?: string
  ): Promise<void> {
    // Mock implementation
    console.log('Saved message:', { meetingId, speakerType, content, speakerId })
  }

  static async getFirstInteractionStatus(
    baId: string,
    stakeholderIds: string[],
    projectId: string
  ): Promise<Record<string, boolean>> {
    // Mock implementation - return true for first interactions
    const status: Record<string, boolean> = {}
    stakeholderIds.forEach(id => {
      status[id] = true // Simulate first interaction
    })
    return status
  }

  static async recordInteraction(
    baId: string,
    stakeholderId: string,
    projectId: string
  ): Promise<void> {
    // Mock implementation
    console.log('Recorded interaction:', { baId, stakeholderId, projectId })
  }
}