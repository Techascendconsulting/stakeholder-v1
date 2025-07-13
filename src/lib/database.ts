// database.ts - Supabase integration for meeting history tracking
import { createClient } from '@supabase/supabase-js'
import { Meeting, Deliverable } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for database entities
export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Stakeholder {
  id: string
  name: string
  role: string
  department?: string
  expertise_area?: string
  azure_voice_id?: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  name: string
  email?: string
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

export interface StakeholderInteraction {
  id: string
  ba_id: string
  stakeholder_id: string
  project_id: string
  first_interaction_at: string
  total_interactions: number
  last_interaction_at: string
}

export interface Message {
  id: string
  meeting_id: string
  speaker_type: 'ba' | 'stakeholder' | 'system'
  speaker_id?: string
  content: string
  audio_url?: string
  sequence_number: number
  created_at: string
}

export interface UserProject {
  id: string
  user_id: string
  project_id: string
  current_step: string
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  current_project_id: string | null
  total_meetings: number
  total_deliverables: number
  last_activity_at: string
  created_at: string
  updated_at: string
}

export interface DatabaseMeeting {
  id: string
  user_id: string
  project_id: string
  stakeholder_ids: string[]
  transcript: any[]
  meeting_type: string
  status: string
  duration: number
  created_at: string
  updated_at: string
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

// Database utility functions
export class DatabaseService {
  
  // Check if this is the first interaction between a BA (student) and stakeholder for a project
  static async isFirstInteraction(
    baId: string, 
    stakeholderId: string, 
    projectId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('stakeholder_interactions')
      .select('id')
      .eq('ba_id', baId)
      .eq('stakeholder_id', stakeholderId)
      .eq('project_id', projectId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No record found, this is a first interaction
      return true
    }
    
    if (error) {
      console.error('Error checking first interaction:', error)
      return true // Default to first interaction on error
    }

    return false // Record exists, not a first interaction
  }

  // Record an interaction between a BA (student) and stakeholder
  static async recordInteraction(
    baId: string, 
    stakeholderId: string, 
    projectId: string
  ): Promise<void> {
    const { data: existing, error: fetchError } = await supabase
      .from('stakeholder_interactions')
      .select('*')
      .eq('ba_id', baId)
      .eq('stakeholder_id', stakeholderId)
      .eq('project_id', projectId)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // No existing record, create new one
      const { error: insertError } = await supabase
        .from('stakeholder_interactions')
        .insert({
          ba_id: baId,
          stakeholder_id: stakeholderId,
          project_id: projectId,
          first_interaction_at: new Date().toISOString(),
          total_interactions: 1,
          last_interaction_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error recording new interaction:', insertError)
      }
    } else if (!fetchError && existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('stakeholder_interactions')
        .update({
          total_interactions: existing.total_interactions + 1,
          last_interaction_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating interaction:', updateError)
      }
    }
  }

  // Get first interaction status for multiple stakeholders
  static async getFirstInteractionStatus(
    baId: string, 
    stakeholderIds: string[], 
    projectId: string
  ): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {}

    for (const stakeholderId of stakeholderIds) {
      status[stakeholderId] = await this.isFirstInteraction(baId, stakeholderId, projectId)
    }

    return status
  }

  // Create a new meeting
  static async createMeeting(
    projectId: string,
    baId: string,
    stakeholderIds: string[],
    meetingType: 'group' | 'individual'
  ): Promise<string | null> {
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        project_id: projectId,
        ba_id: baId,
        meeting_type: meetingType,
        status: 'in-progress'
      })
      .select('id')
      .single()

    if (meetingError) {
      console.error('Error creating meeting:', meetingError)
      return null
    }

    // Add participants
    const participants = stakeholderIds.map(stakeholderId => ({
      meeting_id: meeting.id,
      stakeholder_id: stakeholderId
    }))

    const { error: participantsError } = await supabase
      .from('meeting_participants')
      .insert(participants)

    if (participantsError) {
      console.error('Error adding meeting participants:', participantsError)
    }

    return meeting.id
  }

  // Save a message to the database
  static async saveMessage(
    meetingId: string,
    speakerType: 'ba' | 'stakeholder' | 'system',
    content: string,
    speakerId?: string,
    audioUrl?: string
  ): Promise<void> {
    // Get the next sequence number
    const { data: lastMessage, error: sequenceError } = await supabase
      .from('conversation_history') // Changed from 'messages'
      .select('sequence_number')
      .eq('meeting_id', meetingId)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single()

    const sequenceNumber = lastMessage ? lastMessage.sequence_number + 1 : 1

    const { error } = await supabase
      .from('conversation_history') // Changed from 'messages'
      .insert({
        meeting_id: meetingId,
        speaker_type: speakerType,
        speaker_id: speakerId,
        content: content,
        audio_url: audioUrl,
        sequence_number: sequenceNumber
      })

    if (error) {
      console.error('Error saving message:', error)
    }
  }

  // Get all projects
  static async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }

    return data || []
  }

  // Get all stakeholders
  static async getStakeholders(): Promise<Stakeholder[]> {
    const { data, error } = await supabase
      .from('stakeholders')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching stakeholders:', error)
      return []
    }

    return data || []
  }

  // Get stakeholder by ID
  static async getStakeholderById(id: string): Promise<Stakeholder | null> {
    const { data, error } = await supabase
      .from('stakeholders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching stakeholder:', error)
      return null
    }

    return data
  }

  // Get all students (Business Analysts)
  static async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching students:', error)
      return []
    }

    return data || []
  }

  // Get meeting messages
  static async getMeetingMessages(meetingId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('conversation_history') // Changed from 'messages'
      .select('*')
      .eq('meeting_id', meetingId)
      .order('sequence_number')

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return data || []
  }

  // Resume user session - get all user data
  static async resumeUserSession(userId: string): Promise<{
    progress: UserProgress | null
    meetings: DatabaseMeeting[]
    deliverables: DatabaseDeliverable[]
    currentProject: UserProject | null
  }> {
    try {
      // Get user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      // Get user meetings
      const { data: meetings } = await supabase
        .from('user_meetings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Get user deliverables
      const { data: deliverables } = await supabase
        .from('user_deliverables')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Get current project
      const { data: currentProject } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        progress: progress || null,
        meetings: meetings || [],
        deliverables: deliverables || [],
        currentProject: currentProject || null
      }
    } catch (error) {
      console.error('Error resuming user session:', error)
      return {
        progress: null,
        meetings: [],
        deliverables: [],
        currentProject: null
      }
    }
  }

  // Create user project
  static async createUserProject(userId: string, projectId: string, currentStep: string): Promise<UserProject | null> {
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: userId,
          project_id: projectId,
          current_step: currentStep
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user project:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating user project:', error)
      return null
    }
  }

  // Update user project
  static async updateUserProject(userId: string, projectId: string, updates: Partial<UserProject>): Promise<UserProject | null> {
    try {
      // First try to get existing record
      const { data: existing, error: fetchError } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .limit(1)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching user project:', fetchError)
        return null
      }

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_projects')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating user project:', error)
          return null
        }

        return data
      } else {
        // Create new record
        return this.createUserProject(userId, projectId, updates.current_step || 'initial')
      }
    } catch (error) {
      console.error('Error updating user project:', error)
      return null
    }
  }

  // Create user meeting
  static async createUserMeeting(userId: string, meeting: Meeting): Promise<DatabaseMeeting | null> {
    try {
      const { data, error } = await supabase
        .from('user_meetings')
        .insert({
          user_id: userId,
          project_id: meeting.projectId,
          stakeholder_ids: meeting.stakeholderIds,
          transcript: meeting.transcript,
          meeting_type: meeting.meetingType,
          status: meeting.status,
          duration: meeting.duration || 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user meeting:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating user meeting:', error)
      return null
    }
  }

  // Update user meeting
  static async updateUserMeeting(meetingId: string, updates: Partial<Meeting>): Promise<DatabaseMeeting | null> {
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() }
      
      if (updates.transcript) dbUpdates.transcript = updates.transcript
      if (updates.status) dbUpdates.status = updates.status
      if (updates.duration) dbUpdates.duration = updates.duration

      const { data, error } = await supabase
        .from('user_meetings')
        .update(dbUpdates)
        .eq('id', meetingId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user meeting:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating user meeting:', error)
      return null
    }
  }

  // Create user deliverable
  static async createUserDeliverable(userId: string, deliverable: Deliverable): Promise<DatabaseDeliverable | null> {
    try {
      const { data, error } = await supabase
        .from('user_deliverables')
        .insert({
          user_id: userId,
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

      return data
    } catch (error) {
      console.error('Error creating user deliverable:', error)
      return null
    }
  }

  // Update user deliverable
  static async updateUserDeliverable(deliverableId: string, updates: Partial<Deliverable>): Promise<DatabaseDeliverable | null> {
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() }
      
      if (updates.title) dbUpdates.title = updates.title
      if (updates.content) dbUpdates.content = updates.content
      if (updates.type) dbUpdates.type = updates.type

      const { data, error } = await supabase
        .from('user_deliverables')
        .update(dbUpdates)
        .eq('id', deliverableId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user deliverable:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating user deliverable:', error)
      return null
    }
  }
}