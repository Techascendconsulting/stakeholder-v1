import { supabase } from '../lib/supabase';

export interface AnalyticsData {
  totalMeetings: number;
  completedMeetings: number;
  inProgressMeetings: number;
  avgMeetingDuration: number;
  totalDeliverables: number;
  subscriptionBreakdown: {
    free: number;
    premium: number;
    enterprise: number;
  };
  moduleCompletions: number;
  practiceCompletions: number;
  projectsStarted: number;
  projectsCompleted: number;
  topProjects: Array<{ project_id: string; count: number }>;
  engagementRate: number;
  avgMeetingsPerUser: number;
}

class AdminAnalyticsService {
  /**
   * Get comprehensive analytics data for admin dashboard
   */
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      console.log('📊 ANALYTICS: Loading comprehensive analytics data...');

      // Run all queries in parallel for better performance
      const [
        meetingsData,
        deliverablesData,
        subscriptionData,
        progressData,
        projectsData
      ] = await Promise.all([
        this.getMeetingsAnalytics(),
        this.getDeliverablesAnalytics(),
        this.getSubscriptionAnalytics(),
        this.getProgressAnalytics(),
        this.getProjectAnalytics()
      ]);

      console.log('📊 ANALYTICS: Data loaded successfully:', {
        meetingsData,
        deliverablesData,
        subscriptionData,
        progressData,
        projectsData
      });

      return {
        ...meetingsData,
        ...deliverablesData,
        ...subscriptionData,
        ...progressData,
        ...projectsData
      };
    } catch (error) {
      console.error('❌ ANALYTICS: Error loading analytics data:', error);
      // Return empty analytics on error
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Get meetings analytics
   */
  private async getMeetingsAnalytics(): Promise<{
    totalMeetings: number;
    completedMeetings: number;
    inProgressMeetings: number;
    avgMeetingDuration: number;
    avgMeetingsPerUser: number;
  }> {
    try {
      // Get all meetings
      const { data: meetings, error } = await supabase
        .from('user_meetings')
        .select('id, user_id, status, duration, completed_at');

      if (error) throw error;

      const totalMeetings = meetings?.length || 0;
      const completedMeetings = meetings?.filter(m => m.status === 'completed').length || 0;
      const inProgressMeetings = meetings?.filter(m => m.status === 'in_progress').length || 0;

      // Calculate average duration (only for completed meetings with duration > 0)
      const completedWithDuration = meetings?.filter(m => m.status === 'completed' && m.duration > 0) || [];
      const avgMeetingDuration = completedWithDuration.length > 0
        ? Math.round(completedWithDuration.reduce((sum, m) => sum + m.duration, 0) / completedWithDuration.length)
        : 0;

      // Calculate unique users who have had meetings
      const uniqueUsers = new Set(meetings?.map(m => m.user_id) || []).size;
      const avgMeetingsPerUser = uniqueUsers > 0 ? Math.round((totalMeetings / uniqueUsers) * 10) / 10 : 0;

      return {
        totalMeetings,
        completedMeetings,
        inProgressMeetings,
        avgMeetingDuration,
        avgMeetingsPerUser
      };
    } catch (error) {
      console.error('Error loading meetings analytics:', error);
      return {
        totalMeetings: 0,
        completedMeetings: 0,
        inProgressMeetings: 0,
        avgMeetingDuration: 0,
        avgMeetingsPerUser: 0
      };
    }
  }

  /**
   * Get deliverables analytics
   */
  private async getDeliverablesAnalytics(): Promise<{ totalDeliverables: number }> {
    try {
      const { count, error } = await supabase
        .from('user_deliverables')
        .select('id', { count: 'exact', head: true });

      if (error) throw error;

      return { totalDeliverables: count || 0 };
    } catch (error) {
      console.error('Error loading deliverables analytics:', error);
      return { totalDeliverables: 0 };
    }
  }

  /**
   * Get subscription tier breakdown
   */
  private async getSubscriptionAnalytics(): Promise<{
    subscriptionBreakdown: { free: number; premium: number; enterprise: number };
  }> {
    try {
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier');

      if (error) throw error;

      const breakdown = {
        free: users?.filter(u => !u.subscription_tier || u.subscription_tier === 'free').length || 0,
        premium: users?.filter(u => u.subscription_tier === 'premium').length || 0,
        enterprise: users?.filter(u => u.subscription_tier === 'enterprise').length || 0
      };

      return { subscriptionBreakdown: breakdown };
    } catch (error) {
      console.error('Error loading subscription analytics:', error);
      return { subscriptionBreakdown: { free: 0, premium: 0, enterprise: 0 } };
    }
  }

  /**
   * Get user progress analytics
   */
  private async getProgressAnalytics(): Promise<{
    moduleCompletions: number;
    practiceCompletions: number;
    engagementRate: number;
  }> {
    try {
      // Get module completions from module_progress table
      const { data: moduleProgress, error: moduleError } = await supabase
        .from('module_progress')
        .select('id, completed');

      if (moduleError) throw moduleError;

      const moduleCompletions = moduleProgress?.filter(m => m.completed).length || 0;

      // Get practice completions (could be from practice_sessions or similar table)
      // For now, use a simple count - adjust based on your actual table structure
      const practiceCompletions = 0; // Placeholder - update when practice tracking is implemented

      // Calculate engagement rate (users with at least 1 module completion)
      const { data: users } = await supabase
        .from('user_profiles')
        .select('user_id');

      const totalUsers = users?.length || 1;
      const uniqueProgressUsers = new Set(moduleProgress?.map(m => m.user_id) || []).size;
      const engagementRate = Math.round((uniqueProgressUsers / totalUsers) * 100);

      return {
        moduleCompletions,
        practiceCompletions,
        engagementRate
      };
    } catch (error) {
      console.error('Error loading progress analytics:', error);
      return {
        moduleCompletions: 0,
        practiceCompletions: 0,
        engagementRate: 0
      };
    }
  }

  /**
   * Get project analytics
   */
  private async getProjectAnalytics(): Promise<{
    projectsStarted: number;
    projectsCompleted: number;
    topProjects: Array<{ project_id: string; count: number }>;
  }> {
    try {
      const { data: projects, error } = await supabase
        .from('user_projects')
        .select('id, project_id, status');

      if (error) throw error;

      const projectsStarted = projects?.filter(p => p.status !== 'not_started').length || 0;
      const projectsCompleted = projects?.filter(p => p.status === 'completed').length || 0;

      // Calculate top projects by selection count
      const projectCounts: Record<string, number> = {};
      projects?.forEach(p => {
        if (p.project_id) {
          projectCounts[p.project_id] = (projectCounts[p.project_id] || 0) + 1;
        }
      });

      const topProjects = Object.entries(projectCounts)
        .map(([project_id, count]) => ({ project_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        projectsStarted,
        projectsCompleted,
        topProjects
      };
    } catch (error) {
      console.error('Error loading project analytics:', error);
      return {
        projectsStarted: 0,
        projectsCompleted: 0,
        topProjects: []
      };
    }
  }

  /**
   * Get empty analytics (fallback)
   */
  private getEmptyAnalytics(): AnalyticsData {
    return {
      totalMeetings: 0,
      completedMeetings: 0,
      inProgressMeetings: 0,
      avgMeetingDuration: 0,
      totalDeliverables: 0,
      subscriptionBreakdown: { free: 0, premium: 0, enterprise: 0 },
      revenueMetrics: { total: 0, monthly: 0 },
      moduleCompletions: 0,
      practiceCompletions: 0,
      projectsStarted: 0,
      projectsCompleted: 0,
      topProjects: [],
      engagementRate: 0,
      avgMeetingsPerUser: 0
    };
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();











