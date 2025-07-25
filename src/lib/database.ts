import { supabase } from './supabase'
import { Project, Stakeholder, Meeting, Message, Deliverable } from '../types'

export interface DatabaseProject {
  id: string
  user_id: string
  project_id: string
  project_name: string
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
  project_name: string
  stakeholder_ids: string[]
  stakeholder_names: string[]
  stakeholder_roles: string[]
  transcript: Message[]
  raw_chat: Message[]
  meeting_notes: string
  meeting_summary: string
  status: 'in_progress' | 'completed'
  meeting_type: 'individual' | 'group' | 'voice-only'
  duration: number
  total_messages: number
  user_messages: number
  ai_messages: number
  topics_discussed: string[]
  key_insights: string[]
  effectiveness_score?: number
  created_at: string
  completed_at?: string
}

export interface DatabaseDeliverable {
  id: string
  user_id: string
  project_id: string
  meeting_id?: string
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
  total_voice_meetings: number
  total_transcript_meetings: number
  achievements: string[]
  created_at: string
  updated_at: string
}

export class DatabaseService {
  // User Progress Management
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

  static async initializeUserProgress(userId: string): Promise<DatabaseProgress> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          total_projects_started: 0,
          total_projects_completed: 0,
          total_meetings_conducted: 0,
          total_deliverables_created: 0,
          total_voice_meetings: 0,
          total_transcript_meetings: 0,
          achievements: []
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error initializing user progress:', error)
      throw error
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

  // Project Management
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

  static async createUserProject(userId: string, projectId: string, projectName: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: userId,
          project_id: projectId,
          project_name: projectName,
          status: 'in_progress',
          current_step: 'project-brief',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      
      // Update user progress
      await this.incrementProjectCount(userId)
      
      return data?.id || null
    } catch (error) {
      console.error('Error creating user project:', error)
      return null
    }
  }

  // Meeting Management
    static async createMeeting(
    userId: string,
    projectId: string,
    projectName: string,
    stakeholderIds: string[],
    stakeholderNames: string[],
    stakeholderRoles: string[],
    meetingType: 'individual' | 'group' | 'voice-only'
  ): Promise<string | null> {
    try {
      console.log('🗃️ DATABASE - createMeeting called with:', {
        userId,
        projectId,
        projectName,
        stakeholderIds,
        stakeholderNames,
        stakeholderRoles,
        meetingType
      });

      const meetingData = {
        user_id: userId,
        project_id: projectId,
        project_name: projectName,
        stakeholder_ids: stakeholderIds,
        stakeholder_names: stakeholderNames,
        stakeholder_roles: stakeholderRoles,
        transcript: [],
        raw_chat: [],
        meeting_notes: '',
        meeting_summary: '',
        status: 'in_progress',
        meeting_type: meetingType,
        duration: 0,
        total_messages: 0,
        user_messages: 0,
        ai_messages: 0,
        topics_discussed: [],
        key_insights: []
      };

      console.log('🗃️ DATABASE - Inserting meeting data:', meetingData);

      const { data, error } = await supabase
        .from('user_meetings')
        .insert(meetingData)
        .select()
        .single()

      console.log('🗃️ DATABASE - Insert result:', { data, error });

      if (error) throw error
      
      if (!data) {
        console.warn('🗃️ DATABASE - No data returned from insert');
        return null;
      }

      console.log('🗃️ DATABASE - Meeting created successfully with ID:', data.id);
      return data.id || null
    } catch (error) {
      console.error('🗃️ DATABASE - Error creating meeting:', error)
      return null
    }
  }

  static async saveMeetingData(
    meetingId: string,
    transcript: Message[],
    rawChat: Message[],
    meetingNotes: string,
    meetingSummary: string,
    duration: number,
    topicsDiscussed: string[],
    keyInsights: string[],
    additionalMeetingData?: {
      userId?: string;
      projectId?: string;
      projectName?: string;
      stakeholderIds?: string[];
      stakeholderNames?: string[];
      stakeholderRoles?: string[];
      meetingType?: 'voice-only' | 'voice-transcript';
    }
  ): Promise<boolean> {
    try {
      console.log('🗃️ DATABASE - saveMeetingData called with:', {
        meetingId,
        transcriptLength: transcript.length,
        rawChatLength: rawChat.length,
        meetingSummaryLength: meetingSummary.length,
        duration,
        topicsCount: topicsDiscussed.length,
        keyInsightsCount: keyInsights.length
      });

      const userMessages = transcript.filter(m => m.speaker === 'user').length
      const aiMessages = transcript.filter(m => m.speaker !== 'user').length

      console.log('🗃️ DATABASE - Message counts:', { userMessages, aiMessages, total: transcript.length });

      const updateData = {
        transcript: transcript,
        raw_chat: rawChat,
        meeting_notes: meetingNotes,
        meeting_summary: meetingSummary,
        status: 'completed',
        duration: duration,
        total_messages: transcript.length,
        user_messages: userMessages,
        ai_messages: aiMessages,
        topics_discussed: topicsDiscussed,
        key_insights: keyInsights,
        completed_at: new Date().toISOString()
      };

      console.log('🗃️ DATABASE - Attempting to update meeting with data:', updateData);

      // Always create a new meeting entry instead of updating existing ones
      // This ensures each meeting is preserved as a separate entry
      console.log('🗃️ DATABASE - Creating new meeting entry to preserve meeting history');
        
        // Create meeting record with available data
        const createData = {
          id: meetingId,
          user_id: additionalMeetingData?.userId || 'unknown',
          project_id: additionalMeetingData?.projectId || 'unknown',
          project_name: additionalMeetingData?.projectName || 'Meeting Session',
          stakeholder_ids: additionalMeetingData?.stakeholderIds || [],
          stakeholder_names: additionalMeetingData?.stakeholderNames || [],
          stakeholder_roles: additionalMeetingData?.stakeholderRoles || [],
          meeting_type: additionalMeetingData?.meetingType || 'voice-only',
          created_at: new Date().toISOString(),
          ...updateData // Include all the meeting data
        };

        console.log('🗃️ DATABASE - Creating new meeting with data:', createData);

        // Check if meeting with this ID already exists
        const { data: existingMeeting } = await supabase
          .from('user_meetings')
          .select('id')
          .eq('id', meetingId)
          .single();

        if (existingMeeting) {
          console.warn('🗃️ DATABASE - Meeting ID already exists, using upsert instead of insert:', meetingId);
          // If meeting exists, update it instead
          const { error: updateError, data: updateResult } = await supabase
            .from('user_meetings')
            .update(createData)
            .eq('id', meetingId)
            .select();
          
          console.log('🗃️ DATABASE - Update result:', { error: updateError, data: updateResult });
          return !updateError;
        }

        const { error: createError, data: createResult } = await supabase
          .from('user_meetings')
          .insert(createData)
          .select();

        console.log('🗃️ DATABASE - Create result:', { error: createError, data: createResult });

        if (createError) {
          console.error('🗃️ DATABASE - Failed to create meeting:', {
            error: createError,
            errorMessage: createError.message,
            errorDetails: createError.details,
            errorHint: createError.hint,
            createData: createData
          });
          return false;
        }

        if (createResult && createResult.length > 0) {
          console.log('🗃️ DATABASE - Meeting successfully created:', createResult[0]);
          return true;
        } else {
          console.warn('🗃️ DATABASE - Create failed for meeting:', meetingId);
          return false;
        }
    } catch (error) {
      console.error('🗃️ DATABASE - Error saving meeting data:', error)
      return false
    }
  }

  static async getUserMeetings(userId: string): Promise<DatabaseMeeting[]> {
    try {
      console.log('🗃️ DATABASE - Fetching meetings for user:', userId);
      
      const { data, error } = await supabase
        .from('user_meetings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      console.log('🗃️ DATABASE - Query result:', { data, error, count: data?.length || 0 });

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('🗃️ DATABASE - Error fetching user meetings:', error)
      return []
    }
  }

  // Debug function to verify data persistence
  static async verifyDataPersistence(userId: string): Promise<{ meetings: number; progress: boolean; raw_data: any }> {
    try {
      console.log('🔍 DATABASE - Verifying data persistence for user:', userId);
      
      // Check meetings
      const { data: meetings, error: meetingsError } = await supabase
        .from('user_meetings')
        .select('*')
        .eq('user_id', userId);

      // Check progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      const result = {
        meetings: meetings?.length || 0,
        progress: !!progress && progress.length > 0,
        raw_data: {
          meetings: meetings,
          progress: progress,
          errors: {
            meetings: meetingsError,
            progress: progressError
          }
        }
      };

      console.log('🔍 DATABASE - Verification result:', result);
      return result;
    } catch (error) {
      console.error('🔍 DATABASE - Error during verification:', error);
      return { meetings: 0, progress: false, raw_data: { error } };
    }
  }

  static async getMeetingsByProject(userId: string, projectId: string): Promise<DatabaseMeeting[]> {
    try {
      const { data, error } = await supabase
        .from('user_meetings')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching project meetings:', error)
      return []
    }
  }

  // Progress Counter Updates
  static async incrementProjectCount(userId: string): Promise<boolean> {
    try {
      const progress = await this.getUserProgress(userId)
      if (!progress) {
        await this.initializeUserProgress(userId)
        return this.incrementProjectCount(userId)
      }

      return await this.updateUserProgress(userId, {
        total_projects_started: progress.total_projects_started + 1
      })
    } catch (error) {
      console.error('Error incrementing project count:', error)
      return false
    }
  }

  static async incrementMeetingCount(userId: string, meetingType: 'voice-only' | 'transcript'): Promise<boolean> {
    try {
      const progress = await this.getUserProgress(userId)
      if (!progress) {
        await this.initializeUserProgress(userId)
        return this.incrementMeetingCount(userId, meetingType)
      }

      const updates: Partial<DatabaseProgress> = {
        total_meetings_conducted: progress.total_meetings_conducted + 1
      }

      if (meetingType === 'voice-only') {
        updates.total_voice_meetings = progress.total_voice_meetings + 1
      } else {
        updates.total_transcript_meetings = progress.total_transcript_meetings + 1
      }

      return await this.updateUserProgress(userId, updates)
    } catch (error) {
      console.error('Error incrementing meeting count:', error)
      return false
    }
  }

  // Deliverables Management
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

  static async createDeliverable(
    userId: string,
    projectId: string,
    meetingId: string | null,
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
          meeting_id: meetingId,
          type: type,
          title: title,
          content: content
        })
        .select()
        .single()

      if (error) throw error

      // Update user progress
      await this.incrementDeliverableCount(userId)

      return data?.id || null
    } catch (error) {
      console.error('Error creating deliverable:', error)
      return null
    }
  }

  static async incrementDeliverableCount(userId: string): Promise<boolean> {
    try {
      const progress = await this.getUserProgress(userId)
      if (!progress) {
        await this.initializeUserProgress(userId)
        return this.incrementDeliverableCount(userId)
      }

      return await this.updateUserProgress(userId, {
        total_deliverables_created: progress.total_deliverables_created + 1
      })
    } catch (error) {
      console.error('Error incrementing deliverable count:', error)
      return false
    }
  }
}