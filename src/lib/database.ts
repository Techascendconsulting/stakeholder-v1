import { supabase } from './supabase'
import { Project, Meeting, Deliverable, Message } from '../types'

export interface UserProject {
  id: string
  user_id: string
  project_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  started_at: string
  completed_at?: string
  current_step: string
  created_at: string
  updated_at: string
}

export interface UserProgress {
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

export interface DatabaseMeeting {
  id: string
  user_id: string
  project_id: string
  stakeholder_ids: string[]
  transcript: Message[]
  status: 'scheduled' | 'in_progress' | 'completed'
  meeting_type: 'individual' | 'group'
  duration: number
  created_at: string
  completed_at?: string
}

export interface DatabaseDeliverable {
  id: string
  user_id: string
  project_id: string
  type: 'goals' | 'user-stories' | 'acceptance-criteria' | 'brd'
  title: string
  content: string
  created_at: string
  updated_at: string
}

class DatabaseService {
  // User Projects
  async getUserProjects(userId: string): Promise<UserProject[]> {
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === '42P01') {
          console.warn('Database tables not yet created. Please run the SQL setup script in Supabase.')
          return []
        }
        console.error('Error fetching user projects:', error)
        return []
      }

      if (error && error.code === '42P01') {
        console.warn('Database tables not yet created. Please run the SQL setup script in Supabase.')
        return null
      }

      if (error && error.code === '42P01') {
        console.warn('Database tables not yet created. Please run the SQL setup script in Supabase.')
        return null
      }

      return data || []
    } catch (error) {
      console.error('Database connection error:', error)
      return []
    }
  }

  async createUserProject(projectId: string, currentStep: string = 'project-brief'): Promise<UserProject | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Check if project already exists
      const existing = await this.getUserProject(user.id, projectId)
      if (existing) {
        return this.updateUserProject(user.id, projectId, { current_step: currentStep })
      }

      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          project_id: projectId,
          status: 'in_progress',
          current_step: currentStep
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user project:', error)
        return null
      }

      // Update progress stats
      await this.updateProgressStats(user.id)
      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  async getUserProject(userId: string, projectId: string): Promise<UserProject | null> {
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .maybeSingle()

      if (error && error.code === '42P01') {
        console.warn('Database tables not yet created. Please run the SQL setup script in Supabase.')
        return null
      }

      if (error) {
        console.error('Error fetching user project:', error)
        return null
      }

      return data || null
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  async updateUserProject(userId: string, projectId: string, updates: Partial<UserProject>): Promise<UserProject | null> {
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user project:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  // User Meetings
  async getUserMeetings(userId: string, projectId?: string): Promise<DatabaseMeeting[]> {
    try {
      let query = supabase
        .from('user_meetings')
        .select('*')
        .eq('user_id', userId)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        if (error.code === '42P01') {
          console.warn('Database tables not yet created. Please run the SQL setup script in Supabase.')
          return []
        }
        console.error('Error fetching user meetings:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Database connection error:', error)
      return []
    }
  }

  async createUserMeeting(meeting: Omit<Meeting, 'id'>): Promise<DatabaseMeeting | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_meetings')
        .insert({
          user_id: user.id,
          project_id: meeting.projectId,
          stakeholder_ids: meeting.stakeholderIds,
          transcript: meeting.transcript,
          status: meeting.status,
          meeting_type: meeting.meetingType,
          duration: meeting.duration
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user meeting:', error)
        return null
      }

      // Update progress stats
      await this.updateProgressStats(user.id)
      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  async updateUserMeeting(meetingId: string, updates: Partial<DatabaseMeeting>): Promise<DatabaseMeeting | null> {
    try {
      const { data, error } = await supabase
        .from('user_meetings')
        .update(updates)
        .eq('id', meetingId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user meeting:', error)
        return null
      }

      // Update progress stats if meeting completed
      if (updates.status === 'completed') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await this.updateProgressStats(user.id)
        }
      }

      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  // User Deliverables
  async getUserDeliverables(userId: string, projectId?: string): Promise<DatabaseDeliverable[]> {
    try {
      let query = supabase
        .from('user_deliverables')
        .select('*')
        .eq('user_id', userId)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        if (error.code === '42P01') {
          console.warn('Database tables not yet created. Please run the SQL setup script in Supabase.')
          return []
        }
        console.error('Error fetching user deliverables:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Database connection error:', error)
      return []
    }
  }

  async createUserDeliverable(deliverable: Omit<Deliverable, 'id' | 'lastModified'>): Promise<DatabaseDeliverable | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_deliverables')
        .insert({
          user_id: user.id,
          project_id: deliverable.projectId,
          type: deliverable.type,
          title: deliverable.title,
          content: deliverable.content
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user deliverable:', error)
        return null
      }

      // Update progress stats
      await this.updateProgressStats(user.id)
      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  async updateUserDeliverable(deliverableId: string, updates: Partial<DatabaseDeliverable>): Promise<DatabaseDeliverable | null> {
    try {
      const { data, error } = await supabase
        .from('user_deliverables')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', deliverableId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user deliverable:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  // User Progress
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code === '42P01') {
        console.warn('Database tables not yet created. Please run the SQL setup script in Supabase.')
        return null
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user progress:', error)
      }

      return data || null
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  async initializeUserProgress(userId: string): Promise<UserProgress | null> {
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

      if (error) {
        if (error.code === '42P01') {
          console.warn('Database tables not yet created. Please run the SQL setup script in Supabase.')
          return null
        }
        console.error('Error initializing user progress:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database connection error:', error)
      return null
    }
  }

  async updateProgressStats(userId: string): Promise<void> {
    try {
      // Get current counts
      const [projects, meetings, deliverables] = await Promise.all([
        this.getUserProjects(userId),
        this.getUserMeetings(userId),
        this.getUserDeliverables(userId)
      ])

      const projectsStarted = projects.length
      const projectsCompleted = projects.filter(p => p.status === 'completed').length
      const meetingsCompleted = meetings.filter(m => m.status === 'completed').length
      const deliverablesCreated = deliverables.length

      // Check for achievements
      const achievements: string[] = []
      if (meetingsCompleted >= 1) achievements.push('First Meeting')
      if (deliverablesCreated >= 1) achievements.push('Note Taker')
      if (deliverablesCreated >= 10) achievements.push('Requirements Gatherer')
      if (meetingsCompleted >= 5) achievements.push('Stakeholder Whisperer')
      if (deliverablesCreated >= 4) achievements.push('Deliverable Creator')
      if (projectsCompleted >= 3) achievements.push('BA Expert')

      // Update or create progress record
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          total_projects_started: projectsStarted,
          total_projects_completed: projectsCompleted,
          total_meetings_conducted: meetingsCompleted,
          total_deliverables_created: deliverablesCreated,
          achievements,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error updating progress stats:', error)
      }
    } catch (error) {
      console.error('Error in updateProgressStats:', error)
    }
  }

  // Utility functions
  async getCurrentUserProject(): Promise<{ project: UserProject | null, projectData: Project | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { project: null, projectData: null }

      const projects = await this.getUserProjects(user.id)
      const currentProject = projects.find(p => p.status === 'in_progress') || projects[0] || null

      return { project: currentProject, projectData: null }
    } catch (error) {
      console.error('Database connection error:', error)
      return { project: null, projectData: null }
    }
  }

  async resumeUserSession(userId: string): Promise<{
    currentProject: UserProject | null
    meetings: DatabaseMeeting[]
    deliverables: DatabaseDeliverable[]
    progress: UserProgress | null
  }> {
    try {
      const [projects, meetings, deliverables, progress] = await Promise.all([
        this.getUserProjects(userId),
        this.getUserMeetings(userId),
        this.getUserDeliverables(userId),
        this.getUserProgress(userId)
      ])

      const currentProject = projects.find(p => p.status === 'in_progress') || null

      return {
        currentProject,
        meetings: currentProject ? meetings.filter(m => m.project_id === currentProject.project_id) : [],
        deliverables: currentProject ? deliverables.filter(d => d.project_id === currentProject.project_id) : [],
        progress: progress || await this.initializeUserProgress(userId)
      }
    } catch (error) {
      console.error('Error resuming user session:', error)
      return {
        currentProject: null,
        meetings: [],
        deliverables: [],
        progress: null
      }
    }
  }
}

export const databaseService = new DatabaseService()