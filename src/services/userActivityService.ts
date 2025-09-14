import { supabase } from '../lib/supabase';

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  device_id?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  success: boolean;
  failure_reason?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserActivitySummary {
  last_sign_in?: string;
  last_active?: string;
  total_sign_ins: number;
  failed_sign_ins: number;
  unique_devices: number;
  unique_ips: number;
}

export interface RecentActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  activity_type: string;
  device_id?: string;
  ip_address?: string;
  success: boolean;
  failure_reason?: string;
  created_at: string;
}

class UserActivityService {
  /**
   * Log user activity with comprehensive tracking data
   */
  async logActivity(
    userId: string,
    activityType: string,
    options: {
      deviceId?: string;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      success?: boolean;
      failureReason?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string | null> {
    try {
      const {
        deviceId,
        ipAddress,
        userAgent = navigator.userAgent,
        sessionId,
        success = true,
        failureReason,
        metadata = {}
      } = options;

      const { data, error } = await supabase.rpc('log_user_activity', {
        user_uuid: userId,
        activity_type_param: activityType,
        device_id_param: deviceId,
        ip_address_param: ipAddress,
        user_agent_param: userAgent,
        session_id_param: sessionId,
        success_param: success,
        failure_reason_param: failureReason,
        metadata_param: metadata
      });

      if (error) {
        console.error('Error logging user activity:', error);
        return null;
      }

      console.log(`✅ User activity logged: ${activityType} for user ${userId}`);
      return data;
    } catch (error) {
      console.error('Error logging user activity:', error);
      return null;
    }
  }

  /**
   * Log successful sign-in
   */
  async logSignIn(
    userId: string,
    deviceId?: string,
    sessionId?: string
  ): Promise<string | null> {
    return this.logActivity(userId, 'sign_in', {
      deviceId,
      sessionId,
      success: true,
      metadata: {
        sign_in_method: 'password',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log failed sign-in attempt
   */
  async logSignInFailure(
    userId: string,
    failureReason: string,
    deviceId?: string
  ): Promise<string | null> {
    return this.logActivity(userId, 'sign_in', {
      deviceId,
      success: false,
      failureReason,
      metadata: {
        sign_in_method: 'password',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log sign-out
   */
  async logSignOut(
    userId: string,
    sessionId?: string
  ): Promise<string | null> {
    return this.logActivity(userId, 'sign_out', {
      sessionId,
      success: true,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log last active time (for session tracking)
   */
  async logLastActive(
    userId: string,
    sessionId?: string
  ): Promise<string | null> {
    return this.logActivity(userId, 'last_active', {
      sessionId,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        page_url: window.location.href
      }
    });
  }

  /**
   * Log device lock failure
   */
  async logDeviceLockFailure(
    userId: string,
    deviceId: string,
    reason: string
  ): Promise<string | null> {
    return this.logActivity(userId, 'device_lock_failed', {
      deviceId,
      success: false,
      failureReason: reason,
      metadata: {
        timestamp: new Date().toISOString(),
        security_event: true
      }
    });
  }

  /**
   * Log password reset request
   */
  async logPasswordResetRequest(
    userId: string,
    deviceId?: string
  ): Promise<string | null> {
    return this.logActivity(userId, 'password_reset_request', {
      deviceId,
      success: true,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get user's activity summary
   */
  async getUserActivitySummary(userId: string): Promise<UserActivitySummary | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_last_activity', {
        user_uuid: userId
      });

      if (error) {
        console.error('Error getting user activity summary:', error);
        return null;
      }

      return data?.[0] || {
        total_sign_ins: 0,
        failed_sign_ins: 0,
        unique_devices: 0,
        unique_ips: 0
      };
    } catch (error) {
      console.error('Error getting user activity summary:', error);
      return null;
    }
  }

  /**
   * Get recent activity logs for admin dashboard
   */
  async getRecentActivityLogs(limit: number = 50): Promise<RecentActivityLog[]> {
    try {
      const { data, error } = await supabase.rpc('get_recent_user_activity', {
        limit_count: limit
      });

      if (error) {
        console.error('Error getting recent activity logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting recent activity logs:', error);
      return [];
    }
  }

  /**
   * Get activity logs for a specific user
   */
  async getUserActivityLogs(
    userId: string,
    limit: number = 100
  ): Promise<UserActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting user activity logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      return [];
    }
  }

  /**
   * Get client IP address (simplified)
   */
  private getClientIP(): string {
    // In a real application, you'd get this from your backend
    // For now, we'll use a placeholder
    return 'unknown';
  }
}

// Export singleton instance
export const userActivityService = new UserActivityService();
