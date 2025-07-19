import { supabase } from './supabase'
import { Project, Stakeholder, Meeting, Message, Deliverable } from '../types'

export interface DatabaseProject {
  id: string
  user_id: string
  project_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  started_at?: string
  completed_at?: string
  current_step: string
  created_at: string
  updated_at: string
}

export interface DatabaseMeeting {
  id: string
  user_id: string
  project_id: string
  stakeholder_ids: string[]
  transcript: any[]
  raw_chat: any[]
  meeting_notes: string
  status: 'in_progress' | 'completed'
  meeting_type: 'individual' | 'group'
  duration: number
  created_at: string
  completed_at?: string
}

export interface DatabaseDeliverable {
  id: string
  user_id: string
  project_id: string
  type: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface DatabaseProgress {
  id: string
  user_id: string
  total_projects_started: number
  total_projects_completed: number
  total_meetings_conducted: number
  total_deliverables_created: number
  achievements: string[]
  created_at: string
  updated_at: string
}

export class DatabaseService {
  // User Projects
  static async getUserProjects(userId: string): Promise<DatabaseProject[]> {
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user projects:', error)
      return []
    }
  }

  static async createUserProject(userId: string, projectId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: userId,
          project_id: projectId,
          status: 'in_progress',
          current_step: 'project-brief',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data?.id || null
    } catch (error) {
      console.error('Error creating user project:', error)
      return null
    }
  }

  static async updateUserProject(userId: string, projectId: string, updates: Partial<DatabaseProject>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('project_id', projectId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user project:', error)
      return false
    }
  }

  // User Meetings
  static async createMeeting(
    userId: string,
    projectId: string,
    stakeholderIds: string[],
    meetingType: 'group' | 'individual'
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_meetings')
        .insert({
          user_id: userId,
          project_id: projectId,
          stakeholder_ids: stakeholderIds,
          meeting_type: meetingType,
          status: 'in_progress',
          transcript: [],
          raw_chat: [],
          meeting_notes: '',
          duration: 0
        })
        .select()
        .single()

      if (error) throw error
      return data?.id || null
    } catch (error) {
      console.error('Error creating meeting:', error)
      return null
    }
  }

  static async saveMeetingData(
    meetingId: string, 
    transcript: any[], 
    rawChat: any[], 
    meetingNotes: string, 
    duration: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_meetings')
        .update({
          transcript,
          raw_chat: rawChat,
          meeting_notes: meetingNotes,
          duration,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', meetingId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error saving meeting data:', error)
      return false
    }
  }

  static async getUserMeetings(userId: string): Promise<DatabaseMeeting[]> {
    try {
      const { data, error } = await supabase
        .from('user_meetings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user meetings:', error)
      return []
    }
  }

  // User Deliverables
  static async createDeliverable(
    userId: string,
    projectId: string,
    type: string,
    title: string,
    content: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_deliverables')
        .insert({
          user_id: userId,
          project_id: projectId,
          type,
          title,
          content
        })
        .select()
        .single()

      if (error) throw error
      return data?.id || null
    } catch (error) {
      console.error('Error creating deliverable:', error)
      return null
    }
  }

  static async getUserDeliverables(userId: string): Promise<DatabaseDeliverable[]> {
    try {
      const { data, error } = await supabase
        .from('user_deliverables')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user deliverables:', error)
      return []
    }
  }

  static async updateDeliverable(deliverableId: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_deliverables')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', deliverableId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating deliverable:', error)
      return false
    }
  }

  // User Progress
  static async getUserProgress(userId: string): Promise<DatabaseProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Error fetching user progress:', error)
      return null
    }
  }

  static async initializeUserProgress(userId: string): Promise<DatabaseProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          total_projects_started: 0,
          total_projects_completed: 0,
          total_meetings_conducted: 0,
          total_deliverables_created: 0,
          achievements: []
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error initializing user progress:', error)
      return null
    }
  }

  static async updateUserProgress(userId: string, updates: Partial<DatabaseProgress>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user progress:', error)
      return false
    }
  }

  // Helper methods
  static async incrementMeetingCount(userId: string): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId)
      if (progress) {
        await this.updateUserProgress(userId, {
          total_meetings_conducted: progress.total_meetings_conducted + 1
        })
      }
    } catch (error) {
      console.error('Error incrementing meeting count:', error)
    }
  }

  static async incrementDeliverableCount(userId: string): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId)
      if (progress) {
        await this.updateUserProgress(userId, {
          total_deliverables_created: progress.total_deliverables_created + 1
        })
      }
    } catch (error) {
      console.error('Error incrementing deliverable count:', error)
    }
  }
}