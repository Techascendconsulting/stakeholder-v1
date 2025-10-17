import { supabase } from '../lib/supabase';

export interface DailyQuoteStats {
  total_quotes: number;
  total_success: number;
  total_errors: number;
  avg_success_rate: number;
  most_active_day: string;
  quotes_today: number;
}

export interface DailyQuote {
  id: string;
  quote_text: string;
  posted_at: string;
  channels_posted_to: string[];
  spaces_posted_to: string[];
  success_count: number;
  error_count: number;
  created_at: string;
}

export class DailyQuoteService {
  private static instance: DailyQuoteService;

  public static getInstance(): DailyQuoteService {
    if (!DailyQuoteService.instance) {
      DailyQuoteService.instance = new DailyQuoteService();
    }
    return DailyQuoteService.instance;
  }

  /**
   * Manually trigger the daily quote function
   */
  async triggerDailyQuote(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch('/api/daily-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Daily quote posted successfully',
          data: result
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to post daily quote'
        };
      }
    } catch (error) {
      console.error('Error triggering daily quote:', error);
      return {
        success: false,
        message: 'Failed to trigger daily quote'
      };
    }
  }

  /**
   * Get statistics about daily quotes
   */
  async getQuoteStats(daysBack: number = 30): Promise<DailyQuoteStats | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_daily_quote_stats', { days_back: daysBack });

      if (error) {
        console.error('Error fetching quote stats:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting quote stats:', error);
      return null;
    }
  }

  /**
   * Get recent daily quotes
   */
  async getRecentQuotes(limit: number = 10): Promise<DailyQuote[]> {
    try {
      const { data, error } = await supabase
        .from('recent_daily_quotes')
        .select('*')
        .limit(limit);

      if (error) {
        console.error('Error fetching recent quotes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting recent quotes:', error);
      return [];
    }
  }

  /**
   * Log a daily quote post (called by the function)
   */
  async logQuotePost(
    quoteText: string,
    channelsPostedTo: string[],
    spacesPostedTo: string[],
    successCount: number,
    errorCount: number,
    errors: string[]
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .rpc('log_daily_quote', {
          quote_text: quoteText,
          channels_posted_to: channelsPostedTo,
          spaces_posted_to: spacesPostedTo,
          success_count: successCount,
          error_count: errorCount,
          errors: errors
        });

      if (error) {
        console.error('Error logging quote post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error logging quote post:', error);
      return null;
    }
  }

  /**
   * Get today's quote if it exists
   */
  async getTodaysQuote(): Promise<DailyQuote | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_quotes')
        .select('*')
        .gte('posted_at', `${today}T00:00:00`)
        .lte('posted_at', `${today}T23:59:59`)
        .order('posted_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No quote found for today
          return null;
        }
        console.error('Error fetching today\'s quote:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting today\'s quote:', error);
      return null;
    }
  }

  /**
   * Check if a quote has been posted today
   */
  async hasQuoteBeenPostedToday(): Promise<boolean> {
    const todaysQuote = await this.getTodaysQuote();
    return todaysQuote !== null;
  }

  /**
   * Get quote posting schedule information
   */
  getScheduleInfo(): { time: string; timezone: string; description: string } {
    return {
      time: '9:30 AM',
      timezone: 'UTC',
      description: 'Daily motivational quotes are automatically posted to all cohort channels at 9:30 AM UTC every day.'
    };
  }
}

export const dailyQuoteService = DailyQuoteService.getInstance();


















