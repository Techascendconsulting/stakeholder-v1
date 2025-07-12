// database.ts - Supabase integration for meeting history tracking
import { createClient } from '@supabase/supabase-js'

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
}

