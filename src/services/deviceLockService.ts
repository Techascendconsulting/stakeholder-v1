import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { supabase } from '../lib/supabase';

export interface DeviceLockResult {
  success: boolean;
  locked: boolean;
  message: string;
  deviceId?: string;
}

class DeviceLockService {
  private fpPromise: Promise<FingerprintJS.Agent> | null = null;

  constructor() {
    this.initializeFingerprintJS();
  }

  private async initializeFingerprintJS() {
    try {
      this.fpPromise = FingerprintJS.load();
    } catch (error) {
      console.error('Failed to initialize FingerprintJS:', error);
    }
  }

  /**
   * Get the current device's unique fingerprint
   */
  async getDeviceId(): Promise<string | null> {
    try {
      if (!this.fpPromise) {
        console.error('FingerprintJS not initialized');
        return null;
      }

      const fp = await this.fpPromise;
      const result = await fp.get();
      
      // Add browser session info to make device ID more unique
      const sessionInfo = {
        isIncognito: this.isIncognito(),
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };
      
      const combinedId = `${result.visitorId}-${JSON.stringify(sessionInfo)}`;
      console.log('🔐 DEVICE LOCK - Generated device ID:', combinedId);
      
      return combinedId;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return null;
    }
  }

  private isIncognito(): boolean {
    try {
      // Check if we're in incognito mode
      return !window.indexedDB || 
             navigator.webdriver || 
             !window.chrome || 
             !window.chrome.runtime;
    } catch {
      return false;
    }
  }

  /**
   * Check device lock status and handle login logic
   */
  async checkDeviceLock(userId: string): Promise<DeviceLockResult> {
    try {
      console.log('🔐 DEVICE LOCK - Starting device lock check for user:', userId);
      
      // FIRST: Check if user is admin - admins bypass device lock entirely
      try {
        // FORCE ADMIN BYPASS FOR YOUR EMAIL
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email === 'techascendconsulting1@gmail.com') {
          console.log('🔐 DEVICE LOCK - FORCED ADMIN BYPASS for techascendconsulting1@gmail.com');
          return {
            success: true,
            locked: false,
            message: 'Admin access granted - device lock bypassed.',
            deviceId: await this.getDeviceId()
          };
        }
        
        const { data: adminCheck, error: adminError } = await supabase
          .from('user_profiles')
          .select('is_admin, is_super_admin, is_senior_admin')
          .eq('user_id', userId)
          .single();
        
        if (adminCheck && !adminError) {
          const isAdmin = adminCheck.is_admin || adminCheck.is_super_admin || adminCheck.is_senior_admin;
          if (isAdmin) {
            console.log('🔐 DEVICE LOCK - Admin user detected, bypassing device lock entirely');
            return {
              success: true,
              locked: false,
              message: 'Admin access granted - device lock bypassed.',
              deviceId: await this.getDeviceId()
            };
          }
        }
      } catch (adminCheckError) {
        console.log('🔐 DEVICE LOCK - Admin check failed, proceeding with device lock');
      }
      
      // Get current device ID
      const currentDeviceId = await this.getDeviceId();
      console.log('🔐 DEVICE LOCK - Current device ID:', currentDeviceId);
      if (!currentDeviceId) {
        return {
          success: false,
          locked: false,
          message: 'Unable to identify device. Please try again.'
        };
      }

      // Fetch user's device lock status
      // Try user_profiles table (your actual table name)
      let { data: user, error } = await supabase
        .from('user_profiles')
        .select('registered_device, locked, is_admin')
        .eq('user_id', userId)
        .single();

      console.log('🔐 DEVICE LOCK - User profiles table result:', { user, error: error?.message, code: error?.code });

      console.log('🔐 DEVICE LOCK - Final user data:', { 
        userId, 
        currentDeviceId, 
        user, 
        error: error?.message 
      });
      
      console.log('🔐 DEVICE LOCK - Device comparison:', {
        currentDevice: currentDeviceId,
        registeredDevice: user?.registered_device,
        isMatch: user?.registered_device === currentDeviceId
      });

      // Handle RLS recursion error - if we can't access user_profiles due to RLS issues,
      // we'll assume the user is not an admin and proceed with device lock
      if (error && error.code === '42P17') {
        console.log('🔐 DEVICE LOCK - RLS recursion error detected, treating as non-admin user');
        return {
          success: false,
          locked: true,
          message: 'Your account has been locked due to multiple device usage. Please contact support to unlock your account.'
        };
      }

      if (error) {
        console.error('Error fetching user device data:', error);
        return {
          success: false,
          locked: false,
          message: 'Database error. Please try again.'
        };
      }

      // If account is locked, check if user is admin
      if (user.locked) {
        // Check if user is admin - admins can bypass device lock
        if (user.is_admin) {
          console.log('🔐 DEVICE LOCK - Admin user detected, bypassing device lock');
          return {
            success: true,
            locked: false,
            message: 'Admin access granted - device lock bypassed.',
            deviceId: currentDeviceId
          };
        }
        
        return {
          success: false,
          locked: true,
          message: 'Your account has been locked due to multiple device login attempts. For security reasons, you can only access your account from the device you originally registered with. Please contact support to unlock your account.'
        };
      }

      // If no device is registered, register current device
      if (!user.registered_device) {
        await this.registerDevice(userId, currentDeviceId);
        return {
          success: true,
          locked: false,
          message: 'Device registered successfully.',
          deviceId: currentDeviceId
        };
      }

      // If registered device matches current device, allow login
      if (user.registered_device === currentDeviceId) {
        return {
          success: true,
          locked: false,
          message: 'Device verified successfully.',
          deviceId: currentDeviceId
        };
      }

      // If registered device doesn't match, lock account
      await this.lockAccount(userId);
      return {
        success: false,
        locked: true,
        message: 'Your account has been locked due to multiple device login attempts. For security reasons, you can only access your account from the device you originally registered with. Please contact support to unlock your account.'
      };

    } catch (error) {
      console.error('Device lock check failed:', error);
      return {
        success: false,
        locked: false,
        message: 'An error occurred during device verification. Please try again.'
      };
    }
  }

  /**
   * Register a new device for the user
   */
  private async registerDevice(userId: string, deviceId: string): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ registered_device: deviceId })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to register device:', error);
      throw error;
    }
  }

  /**
   * Lock the user's account
   */
  async lockAccount(userId: string): Promise<void> {
    // Check if user is admin before locking
    try {
      const { data: adminCheck, error: adminError } = await supabase
        .from('user_profiles')
        .select('is_admin, is_super_admin, is_senior_admin')
        .eq('user_id', userId)
        .single();
      
      if (adminCheck && !adminError) {
        const isAdmin = adminCheck.is_admin || adminCheck.is_super_admin || adminCheck.is_senior_admin;
        if (isAdmin) {
          console.log('🔐 DEVICE LOCK - Cannot lock admin account, skipping lock operation');
          return;
        }
      }
    } catch (adminCheckError) {
      console.log('🔐 DEVICE LOCK - Admin check failed during lock, proceeding with lock');
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ locked: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to lock account:', error);
      throw error;
    }
  }

  /**
   * Admin function to unlock an account (for manual use in Supabase dashboard)
   */
  async unlockAccount(userId: string, newDeviceId?: string): Promise<boolean> {
    try {
      const updateData: any = { locked: false };
      if (newDeviceId) {
        updateData.registered_device = newDeviceId;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to unlock account:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unlock account failed:', error);
      return false;
    }
  }

  /**
   * Get device lock status for admin purposes
   */
  async getDeviceLockStatus(userId: string): Promise<{ locked: boolean; registered_device: string | null } | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('locked, registered_device')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching device lock status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get device lock status failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const deviceLockService = new DeviceLockService();
