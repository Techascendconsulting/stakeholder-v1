import { supabase } from './supabase';

export class DatabaseCleanup {
  /**
   * Reset all user data - meetings and progress
   */
  static async resetUserData(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ DatabaseCleanup - Starting user data reset for:', userId);

      // Delete all user meetings
      const { error: meetingsError } = await supabase
        .from('user_meetings')
        .delete()
        .eq('user_id', userId);

      if (meetingsError) {
        console.error('❌ DatabaseCleanup - Error deleting meetings:', meetingsError);
        return { success: false, message: `Error deleting meetings: ${meetingsError.message}` };
      }

      // Reset user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', userId);

      if (progressError) {
        console.error('❌ DatabaseCleanup - Error deleting progress:', progressError);
        return { success: false, message: `Error deleting progress: ${progressError.message}` };
      }

      // Clear localStorage as well
      this.clearLocalStorage(userId);

      console.log('✅ DatabaseCleanup - User data reset completed');
      return { success: true, message: 'All user data has been reset successfully. You can now start fresh!' };

    } catch (error) {
      console.error('❌ DatabaseCleanup - Unexpected error:', error);
      return { success: false, message: `Unexpected error: ${error}` };
    }
  }

  /**
   * Fix corrupted meetings by deleting ones with missing required fields
   */
  static async fixCorruptedMeetings(userId: string): Promise<{ success: boolean; message: string; deletedCount: number }> {
    try {
      console.log('🔧 DatabaseCleanup - Fixing corrupted meetings for:', userId);

      // Get all meetings for the user
      const { data: meetings, error: fetchError } = await supabase
        .from('user_meetings')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) {
        console.error('❌ DatabaseCleanup - Error fetching meetings:', fetchError);
        return { success: false, message: `Error fetching meetings: ${fetchError.message}`, deletedCount: 0 };
      }

      if (!meetings || meetings.length === 0) {
        return { success: true, message: 'No meetings found to fix', deletedCount: 0 };
      }

      // Find corrupted meetings (missing project_name and project_id)
      const corruptedMeetings = meetings.filter(meeting => 
        !meeting.project_name && !meeting.project_id
      );

      console.log(`🔧 DatabaseCleanup - Found ${corruptedMeetings.length} corrupted meetings out of ${meetings.length} total`);

      if (corruptedMeetings.length === 0) {
        return { success: true, message: 'No corrupted meetings found', deletedCount: 0 };
      }

      // Delete corrupted meetings
      const corruptedIds = corruptedMeetings.map(m => m.id);
      const { error: deleteError } = await supabase
        .from('user_meetings')
        .delete()
        .in('id', corruptedIds);

      if (deleteError) {
        console.error('❌ DatabaseCleanup - Error deleting corrupted meetings:', deleteError);
        return { success: false, message: `Error deleting corrupted meetings: ${deleteError.message}`, deletedCount: 0 };
      }

      console.log(`✅ DatabaseCleanup - Deleted ${corruptedMeetings.length} corrupted meetings`);
      return { 
        success: true, 
        message: `Successfully deleted ${corruptedMeetings.length} corrupted meetings`, 
        deletedCount: corruptedMeetings.length 
      };

    } catch (error) {
      console.error('❌ DatabaseCleanup - Unexpected error:', error);
      return { success: false, message: `Unexpected error: ${error}`, deletedCount: 0 };
    }
  }

  /**
   * Clear localStorage for a specific user
   */
  static clearLocalStorage(userId: string): void {
    try {
      console.log('🗑️ DatabaseCleanup - Clearing localStorage for user:', userId);
      
      const keysToRemove: string[] = [];
      
      // Find all localStorage keys related to this user
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes(userId) ||
          key.startsWith('temp-meeting-') ||
          key.startsWith('stored_meeting_') ||
          key.startsWith('backup_meeting_') ||
          key.includes('meeting') ||
          key.includes('transcript')
        )) {
          keysToRemove.push(key);
        }
      }

      // Remove the keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ DatabaseCleanup - Removed localStorage key: ${key}`);
      });

      console.log(`✅ DatabaseCleanup - Cleared ${keysToRemove.length} localStorage items`);
    } catch (error) {
      console.error('❌ DatabaseCleanup - Error clearing localStorage:', error);
    }
  }

  /**
   * Get statistics about user's data
   */
  static async getUserDataStats(userId: string): Promise<{
    totalMeetings: number;
    corruptedMeetings: number;
    validMeetings: number;
    hasProgress: boolean;
  }> {
    try {
      // Get meetings
      const { data: meetings, error: meetingsError } = await supabase
        .from('user_meetings')
        .select('*')
        .eq('user_id', userId);

      // Get progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      const totalMeetings = meetings?.length || 0;
      const corruptedMeetings = meetings?.filter(m => !m.project_name && !m.project_id).length || 0;
      const validMeetings = totalMeetings - corruptedMeetings;
      const hasProgress = !!(progress && progress.length > 0);

      return {
        totalMeetings,
        corruptedMeetings,
        validMeetings,
        hasProgress
      };
    } catch (error) {
      console.error('❌ DatabaseCleanup - Error getting stats:', error);
      return {
        totalMeetings: 0,
        corruptedMeetings: 0,
        validMeetings: 0,
        hasProgress: false
      };
    }
  }
}