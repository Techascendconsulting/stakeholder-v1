import { supabase } from '../lib/supabase';
import { slackService } from './slackService';

export interface TrainingSession {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  slack_reminder_channel: string | null;
  created_at: string;
}

class SessionService {
  // Get all training sessions
  async getAllSessions(): Promise<TrainingSession[]> {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching training sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSessions:', error);
      return [];
    }
  }

  // Get upcoming sessions
  async getUpcomingSessions(): Promise<TrainingSession[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .gte('start_time', now)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUpcomingSessions:', error);
      return [];
    }
  }

  // Create new training session
  async createSession(
    title: string,
    description: string,
    startTime: string,
    endTime?: string,
    reminderChannel?: string
  ): Promise<TrainingSession | null> {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .insert({
          title,
          description,
          start_time: startTime,
          end_time: endTime || null,
          slack_reminder_channel: reminderChannel || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating training session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createSession:', error);
      return null;
    }
  }

  // Update training session
  async updateSession(
    sessionId: string,
    updates: Partial<Omit<TrainingSession, 'id' | 'created_at'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating training session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSession:', error);
      return false;
    }
  }

  // Delete training session
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting training session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSession:', error);
      return false;
    }
  }

  // Send session reminders (called by scheduled job)
  async sendSessionReminders(): Promise<void> {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Find sessions starting in the next hour
      const { data: sessions, error } = await supabase
        .from('training_sessions')
        .select('*')
        .gte('start_time', now.toISOString())
        .lte('start_time', oneHourFromNow.toISOString())
        .not('slack_reminder_channel', 'is', null);

      if (error) {
        console.error('Error fetching sessions for reminders:', error);
        return;
      }

      // Send reminders
      for (const session of sessions || []) {
        if (session.slack_reminder_channel) {
          const startTime = new Date(session.start_time).toLocaleString();
          await slackService.postSessionReminder(
            session.slack_reminder_channel,
            session.title,
            startTime
          );
        }
      }
    } catch (error) {
      console.error('Error in sendSessionReminders:', error);
    }
  }

  // Get sessions by date range
  async getSessionsByDateRange(startDate: string, endDate: string): Promise<TrainingSession[]> {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching sessions by date range:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSessionsByDateRange:', error);
      return [];
    }
  }

  // Get session by ID
  async getSessionById(sessionId: string): Promise<TrainingSession | null> {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching session by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSessionById:', error);
      return null;
    }
  }
}

export const sessionService = new SessionService();
export default sessionService;

















