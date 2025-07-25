import { DatabaseService, DatabaseMeeting } from './database';

export interface MeetingStats {
  totalMeetings: number;
  voiceMeetings: number;
  transcriptMeetings: number;
  voiceOnlyMeetings: number;
  voiceTranscriptMeetings: number;
  uniqueProjects: number;
  deliverablesCreated: number;
}

export class MeetingDataService {
  private static cachedMeetings: Map<string, { meetings: DatabaseMeeting[]; timestamp: number }> = new Map();
  private static cacheExpiry = 1 * 1000; // 1 second for immediate updates

  /**
   * Get all meetings for a user with unified data loading logic
   */
  static async getAllUserMeetings(userId: string, forceRefresh = false): Promise<DatabaseMeeting[]> {
    if (!userId) {
      console.warn('🚫 MeetingDataService - No user ID provided');
      return [];
    }

    // Check cache first
    const cached = this.cachedMeetings.get(userId);
    const now = Date.now();
    
    if (!forceRefresh && cached && (now - cached.timestamp) < this.cacheExpiry) {
      console.log('📋 MeetingDataService - Returning cached meetings for user:', userId);
      return cached.meetings;
    }

    try {
      console.log('🔄 MeetingDataService - Loading fresh meeting data for user:', userId);
      
      // Load from database
      const dbMeetings = await DatabaseService.getUserMeetings(userId);
      console.log('🗃️ MeetingDataService - Database meetings:', dbMeetings.length);

      // Load from localStorage (temporary/backup meetings)
      const localMeetings = this.getLocalStorageMeetings(userId);
      console.log('💾 MeetingDataService - localStorage meetings:', localMeetings.length);

      // Combine and deduplicate meetings
      const allMeetings = [...dbMeetings, ...localMeetings]
        .filter((meeting, index, self) =>
          index === self.findIndex(m => m.id === meeting.id)
        );

      // Apply unified validation filter and normalize data
      const validMeetings = allMeetings
        .filter(meeting => this.isValidMeeting(meeting, userId))
        .map(meeting => this.normalizeMeetingData(meeting));

      // Sort by creation date (newest first)
      const sortedMeetings = validMeetings.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('✅ MeetingDataService - Final valid meetings:', sortedMeetings.length);

      // Update cache
      this.cachedMeetings.set(userId, {
        meetings: sortedMeetings,
        timestamp: now
      });

      return sortedMeetings;
    } catch (error) {
      console.error('❌ MeetingDataService - Error loading meetings:', error);
      return [];
    }
  }

  /**
   * Get recent meetings (for Dashboard)
   */
  static async getRecentMeetings(userId: string, limit = 3): Promise<DatabaseMeeting[]> {
    const allMeetings = await this.getAllUserMeetings(userId);
    return allMeetings.slice(0, limit);
  }

  /**
   * Calculate meeting statistics
   */
  static async getMeetingStats(userId: string): Promise<MeetingStats> {
    const allMeetings = await this.getAllUserMeetings(userId);
    
    const voiceOnlyMeetings = allMeetings.filter(m => m.meeting_type === 'voice-only').length;
    const voiceTranscriptMeetings = allMeetings.filter(m => m.meeting_type === 'voice-transcript').length;
    const legacyTranscriptMeetings = allMeetings.filter(m => m.meeting_type === 'group' || m.meeting_type === 'individual').length;
    
    const stats: MeetingStats = {
      totalMeetings: allMeetings.length,
      voiceMeetings: voiceOnlyMeetings, // Keep for backward compatibility
      transcriptMeetings: voiceTranscriptMeetings + legacyTranscriptMeetings, // All transcript meetings
      voiceOnlyMeetings: voiceOnlyMeetings,
      voiceTranscriptMeetings: voiceTranscriptMeetings + legacyTranscriptMeetings,
      uniqueProjects: new Set(allMeetings.map(m => m.project_id)).size,
      deliverablesCreated: allMeetings.filter(m => m.meeting_summary && m.meeting_summary.trim()).length
    };

    console.log('📊 MeetingDataService - Calculated stats:', stats);
    return stats;
  }

  /**
   * Clear cache when new meeting is created or data needs refresh
   */
  static clearCache(userId?: string): void {
    if (userId) {
      this.cachedMeetings.delete(userId);
      console.log('🗑️ MeetingDataService - Cleared cache for user:', userId);
    } else {
      this.cachedMeetings.clear();
      console.log('🗑️ MeetingDataService - Cleared all cache');
    }
  }

  // Force clear all cache immediately (for debugging)
  static forceClearAll(): void {
    this.cachedMeetings.clear();
    console.log('🗑️ MeetingDataService - Force cleared ALL cache');
  }

  /**
   * Get meetings from localStorage with unified logic
   */
  private static getLocalStorageMeetings(userId: string): DatabaseMeeting[] {
    const localMeetings: DatabaseMeeting[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.isLocalStorageMeetingKey(key, userId)) {
          try {
            const meetingData = JSON.parse(localStorage.getItem(key) || '{}');
            if (meetingData.user_id === userId && meetingData.id) {
              localMeetings.push(meetingData);
            }
          } catch (error) {
            console.warn('💾 MeetingDataService - Error parsing localStorage meeting:', key, error);
          }
        }
      }
    } catch (error) {
      console.error('💾 MeetingDataService - Error accessing localStorage:', error);
    }

    return localMeetings;
  }

  /**
   * Check if localStorage key is a meeting key for the user
   */
  private static isLocalStorageMeetingKey(key: string, userId: string): boolean {
    return (
      key.startsWith('temp-meeting-') ||
      key.startsWith('stored_meeting_') ||
      key.startsWith('backup_meeting_') ||
      key.startsWith(`temp-meeting-${userId}`) ||
      key.startsWith(`stored_meeting_${userId}`) ||
      key.startsWith(`backup_meeting_${userId}`) ||
      (key.includes(`-${userId}`) && (key.includes('meeting') || key.includes('transcript')))
    );
  }

  /**
   * Unified meeting validation logic
   */
  private static isValidMeeting(meeting: any, userId: string): meeting is DatabaseMeeting {
    // Debug: Log the full meeting object to understand its structure
    console.log('🔍 MeetingDataService - Validating meeting:', {
      id: meeting?.id,
      user_id: meeting?.user_id,
      project_id: meeting?.project_id,
      project_name: meeting?.project_name,
      created_at: meeting?.created_at,
      status: meeting?.status,
      meeting_type: meeting?.meeting_type,
      has_stakeholder_names: Array.isArray(meeting?.stakeholder_names),
      stakeholder_names_length: meeting?.stakeholder_names?.length,
      full_object_keys: Object.keys(meeting || {})
    });

    // More permissive validation - only check absolutely essential fields
    const hasBasicFields = meeting && meeting.id && meeting.user_id === userId;
    
         // Check project identification (either project_name or project_id should be present)
     // If project_name is missing but we have project_id, that's still valid
     const hasProjectInfo = (meeting.project_name && typeof meeting.project_name === 'string' && meeting.project_name.trim() !== '') ||
                           (meeting.project_id && typeof meeting.project_id === 'string' && meeting.project_id.trim() !== '');
    
    // Check that it has some kind of timestamp
    const hasTimestamp = meeting.created_at || meeting.updated_at;
    
    const isValid = hasBasicFields && hasProjectInfo && hasTimestamp;

    if (!isValid) {
      console.warn('🚫 MeetingDataService - Invalid meeting filtered out:', {
        hasBasicFields,
        hasProjectInfo,
        hasTimestamp,
        id: meeting?.id,
        user_id: meeting?.user_id,
        project_name: meeting?.project_name,
        project_id: meeting?.project_id,
        created_at: meeting?.created_at,
        updated_at: meeting?.updated_at
      });
    } else {
      console.log('✅ MeetingDataService - Valid meeting accepted:', meeting?.id);
    }

    return isValid;
  }

  /**
   * Normalize meeting data to ensure all required fields exist
   */
  private static normalizeMeetingData(meeting: any): DatabaseMeeting {
    return {
      ...meeting,
      stakeholder_names: meeting.stakeholder_names || [],
      stakeholder_roles: meeting.stakeholder_roles || [],
      stakeholder_ids: meeting.stakeholder_ids || [],
      transcript: meeting.transcript || [],
      raw_chat: meeting.raw_chat || [],
      topics_discussed: meeting.topics_discussed || [],
      key_insights: meeting.key_insights || [],
      meeting_notes: meeting.meeting_notes || '',
      meeting_summary: meeting.meeting_summary || '',
      total_messages: meeting.total_messages || 0,
      user_messages: meeting.user_messages || 0,
      ai_messages: meeting.ai_messages || 0,
      duration: meeting.duration || 0,
      project_name: meeting.project_name || meeting.project_id || 'Unknown Project'
    };
  }

  /**
   * Refresh data and notify listeners
   */
  static async refreshData(userId: string): Promise<DatabaseMeeting[]> {
    console.log('🔄 MeetingDataService - Force refreshing data for user:', userId);
    return this.getAllUserMeetings(userId, true);
  }
}

// Make MeetingDataService available globally for cache clearing
if (typeof window !== 'undefined') {
  (window as any).MeetingDataService = MeetingDataService;
}