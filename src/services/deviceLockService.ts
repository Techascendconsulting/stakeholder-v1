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
   * Uses hardware-based components to ensure same device = same ID across browser instances
   */
  async getDeviceId(): Promise<string | null> {
    try {
      if (!this.fpPromise) {
        console.error('FingerprintJS not initialized');
        return null;
      }

      const fp = await this.fpPromise;
      const result = await fp.get();
      // Use FingerprintJS visitorId to strictly bind to a single device/browser profile
      const deviceId = result.visitorId;
      console.log('🔐 DEVICE LOCK - Using FingerprintJS visitorId as device ID:', deviceId);
      return deviceId || null;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return null;
    }
  }

  /**
   * Simple hash function for creating stable device IDs
   */
  private async simpleHash(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 32); // Return first 32 chars
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
   * SECURITY: Uses server-side RPC function to prevent client-side tampering
   */
  async checkDeviceLock(userId: string): Promise<DeviceLockResult> {
    try {
      console.debug('🔐 [devicelock] start checkDeviceLock', { userId });
      
      // Get current device ID
      const currentDeviceId = await this.getDeviceId();
      console.debug('🔐 [devicelock] currentDeviceId', { currentDeviceId });
      
      if (!currentDeviceId) {
        // Fail-closed: deny access if we can't identify the device
        return {
          success: false,
          locked: true,
          message: 'Unable to verify device. Please enable JavaScript and cookies.'
        };
      }

      // Call secure server-side RPC function
      // This function handles ALL logic server-side to prevent client tampering
      console.debug('🔐 [devicelock] Calling secure RPC: register_user_device');
      const { data, error } = await supabase.rpc('register_user_device', {
        p_user_id: userId,
        p_device_id: currentDeviceId
      });

      if (error) {
        console.error('🔐 [devicelock] RPC ERROR', { 
          error: error.message, 
          code: (error as any)?.code, 
          details: (error as any)?.details 
        });
        // SECURITY: Fail-closed - deny access when device check cannot complete
        return {
          success: false,
          locked: true,
          message: 'Device verification failed. Please contact support if this persists.'
        };
      }

      console.debug('🔐 [devicelock] RPC result', data);

      // Parse RPC response
      const result = data as { success: boolean; locked: boolean; message: string };
      
      return {
        success: result.success,
        locked: result.locked,
        message: result.message,
        deviceId: result.success ? currentDeviceId : undefined
      };

    } catch (error) {
      console.error('🔐 [devicelock] check failed', error);
      // SECURITY: Fail-closed on unexpected errors
      return {
        success: false,
        locked: true,
        message: 'An error occurred during device verification. Please contact support.'
      };
    }
  }

  /**
   * Register a new device for the user
   * DEPRECATED: Device registration now handled by secure server-side RPC
   * Keeping this for backward compatibility but it should not be called
   */
  private async registerDevice(userId: string, deviceId: string): Promise<void> {
    console.warn('⚠️ registerDevice() is deprecated - device registration is now handled server-side');
    // No-op: device registration is now handled by register_user_device RPC
  }

  /**
   * Lock the user's account
   */
  async lockAccount(userId: string): Promise<void> {
    console.debug('🔐 [devicelock] lockAccount START', { userId });
    
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
          console.log('🔐 [devicelock] Cannot lock admin account, skipping lock operation');
          return;
        }
      }
    } catch (adminCheckError) {
      console.log('🔐 [devicelock] Admin check failed during lock, proceeding with lock');
    }

    console.debug('🔐 [devicelock] Attempting to update locked=true for userId', { userId });
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ locked: true })
      .eq('user_id', userId)
      .select('user_id, locked'); // Select back to verify update

    if (error) {
      console.error('🔐 [devicelock] FAILED to lock account', { 
        userId, 
        error: error.message, 
        code: (error as any)?.code, 
        details: (error as any)?.details,
        hint: (error as any)?.hint 
      });
      // Don't throw - log but continue, as the lock message will still be shown to user
      // The admin will need to manually verify in Supabase dashboard if RLS is blocking
      return;
    }

    // Verify the update succeeded
    if (data && data.length > 0) {
      const updated = data[0];
      console.debug('🔐 [devicelock] Account locked successfully', { 
        userId, 
        locked: updated.locked,
        updatedRowCount: data.length 
      });
      
      if (!updated.locked) {
        console.warn('🔐 [devicelock] WARNING: Update returned but locked is still false!', { userId, data });
      }
    } else {
      console.warn('🔐 [devicelock] WARNING: Update returned no rows - account may not exist or RLS blocked', { userId });
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
   * Check if two device IDs represent the same core hardware (different browsers, same device)
   */
  private isSameCoreDevice(registeredDevice: string, currentDevice: string): boolean {
    return registeredDevice === currentDevice;
  }

  /**
   * Calculate similarity between two device IDs
   */
  private calculateDeviceSimilarity(device1: string, device2: string): number {
    return device1 === device2 ? 1 : 0;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(_str1: string, _str2: string): number { return 0; }

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

  /**
   * Parse device ID string to extract hardware components
   */
  private parseDeviceId(deviceId: string): {
    platform: string;
    cores: string;
    gpu: string;
  } {
    try {
      // Device ID format: platform_cores_gpu_...
      const parts = deviceId.split('_');
      return {
        platform: parts[0] || 'Unknown',
        cores: parts[1] || 'Unknown',
        gpu: parts[2] || 'Unknown'
      };
    } catch {
      return {
        platform: 'Unknown',
        cores: 'Unknown',
        gpu: 'Unknown'
      };
    }
  }

  /**
   * Compare current device with registered device for admin verification
   * Returns detailed device information for admin decision-making
   */
  async compareDevicesForAdmin(userId: string): Promise<{
    isSameDevice: boolean;
    similarity: number;
    registeredDeviceInfo: {
      platform: string;
      cores: string;
      gpu: string;
    } | null;
    currentDeviceInfo: {
      platform: string;
      cores: string;
      gpu: string;
    } | null;
    recommendation: 'unlock_only' | 'reset_device' | 'unknown';
    explanation: string;
  }> {
    try {
      // Get registered device from database
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('registered_device')
        .eq('user_id', userId)
        .single();

      if (error || !user?.registered_device) {
        return {
          isSameDevice: false,
          similarity: 0,
          registeredDeviceInfo: null,
          currentDeviceInfo: null,
          recommendation: 'reset_device',
          explanation: 'No registered device found. User needs to register a new device.'
        };
      }

      // Parse registered device info
      const registeredDeviceInfo = this.parseDeviceId(user.registered_device);

      // Get current device fingerprint
      const currentDeviceId = await this.getDeviceId();
      if (!currentDeviceId) {
        return {
          isSameDevice: false,
          similarity: 0,
          registeredDeviceInfo,
          currentDeviceInfo: null,
          recommendation: 'unknown',
          explanation: 'Unable to detect current device. Manual verification required.'
        };
      }

      // Get current device info from FingerprintJS for display
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const components = result.components;

      const currentDeviceInfo = {
        platform: components.platform?.value || 'Unknown',
        cores: components.hardwareConcurrency?.value?.toString() || 'Unknown',
        gpu: components.vendor?.value || 'Unknown'
      };

      // Check if same device
      const isSame = this.isSameCoreDevice(user.registered_device, currentDeviceId);
      const similarity = this.calculateDeviceSimilarity(user.registered_device, currentDeviceId);

      // Recommendation based on similarity
      let recommendation: 'unlock_only' | 'reset_device' | 'unknown';
      let explanation: string;

      if (similarity > 0.9) {
        recommendation = 'unlock_only';
        explanation = 'Same device detected. User likely switched browser (Chrome → Firefox, etc.). Safe to unlock without device reset.';
      } else if (similarity > 0.5) {
        recommendation = 'unknown';
        explanation = 'Partial match detected. Could be same device with hardware changes or different device. Verify with user before deciding.';
      } else {
        recommendation = 'reset_device';
        explanation = 'Different device detected. If legitimate (new laptop, lost device), reset device binding. Otherwise, possible account sharing.';
      }

      return {
        isSameDevice: isSame,
        similarity: Math.round(similarity * 100),
        registeredDeviceInfo,
        currentDeviceInfo,
        recommendation,
        explanation
      };
    } catch (error) {
      console.error('Error comparing devices:', error);
      return {
        isSameDevice: false,
        similarity: 0,
        registeredDeviceInfo: null,
        currentDeviceInfo: null,
        recommendation: 'unknown',
        explanation: 'Error comparing devices. Manual verification required.'
      };
    }
  }
}

// Export singleton instance
export const deviceLockService = new DeviceLockService();
