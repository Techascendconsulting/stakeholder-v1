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

      // IMPORTANT: Use hardware-based components only for device identification
      // This ensures the same physical device gets the same ID across:
      // - Multiple Chrome windows
      // - Multiple browser instances
      // - Browser restarts
      // But DIFFERENT devices (or different browsers like Chrome vs Firefox) get different IDs
      
      const components = result.components;
      
      // Build stable device ID from CORE hardware components only
      // These components should remain the same across different browsers on the same device
      // ONLY use the most stable components - exclude vendorFlavors as it can change
      const coreHardwareComponents = [
        components.platform?.value?.toString() || '',           // OS platform (Windows/Mac/Linux) - STABLE
        components.hardwareConcurrency?.value?.toString() || '', // CPU cores - STABLE
        components.vendor?.value?.toString() || ''               // GPU vendor - STABLE
      ].filter(Boolean);
      
      // REMOVED: screenResolution, timezone, languages - these change too frequently
      // REMOVED: vendorFlavors - can change with GPU driver updates or browser updates
      // These components can change when:
      // - Connecting external monitors (screenResolution)
      // - Traveling or daylight saving (timezone) 
      // - Changing browser language settings (languages)
      // - GPU driver updates (vendorFlavors)
      
      // Create hash of CORE hardware components only
      const hardwareString = coreHardwareComponents.join('|');
      const stableId = await this.simpleHash(hardwareString);
      
      console.log('🔐 DEVICE LOCK - Generated ULTRA-STABLE device ID:', stableId);
      console.log('🔐 DEVICE LOCK - Hardware string used:', hardwareString);
      console.log('🔐 DEVICE LOCK - CORE Hardware components (ultra-stable):', {
        platform: components.platform?.value,
        cores: components.hardwareConcurrency?.value,
        gpu_vendor: components.vendor?.value
      });
      console.log('🔐 DEVICE LOCK - Excluded for stability:', {
        gpu_flavors: components.vendorFlavors?.value,
        reason: 'Can change with driver/browser updates'
      });
      
      return stableId;
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
   */
  async checkDeviceLock(userId: string): Promise<DeviceLockResult> {
    try {
      console.log('🔐 DEVICE LOCK - Starting device lock check for user:', userId);
      
      // FIRST: Check if user is admin - admins bypass device lock entirely
      try {
        // FORCE ADMIN BYPASS FOR BA WORKXP ADMIN EMAIL
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email === 'admin@baworkxp.com' || userData?.user?.email === 'techascendconsulting1@gmail.com') {
          console.log('🔐 DEVICE LOCK - FORCED ADMIN BYPASS for', userData?.user?.email);
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
        // Fail-open: allow access on transient DB issues to avoid blocking learners
        return {
          success: true,
          locked: false,
          message: 'Proceed allowed (temporary service issue).'
        };
      }

      // If account is locked, check if user is admin or same device and auto-unlock
      if (user.locked) {
        // Admin bypass
        if (user.is_admin) {
          console.log('🔐 DEVICE LOCK - Admin user detected, bypassing device lock');
          return {
            success: true,
            locked: false,
            message: 'Admin access granted - device lock bypassed.',
            deviceId: currentDeviceId
          };
        }

        // Auto-unlock if the current device matches the registered device (including legacy format)
        const isLegacyMatch = typeof user.registered_device === 'string' && user.registered_device.startsWith(currentDeviceId + '-');
        if (user.registered_device === currentDeviceId || isLegacyMatch) {
          console.log('🔐 DEVICE LOCK - Locked but same device detected. Auto-unlocking and migrating if needed.');
          await this.unlockAccount(userId, currentDeviceId);
          return {
            success: true,
            locked: false,
            message: 'Device verified (auto-unlocked).',
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

      // Check for partial matches (same core hardware but different browser fingerprint)
      // This allows same device with different browsers
      const isPartialMatch = this.isSameCoreDevice(user.registered_device, currentDeviceId);
      if (isPartialMatch) {
        console.log('🔐 DEVICE LOCK - Partial match detected (same device, different browser). Updating device ID.');
        await this.registerDevice(userId, currentDeviceId);
        return {
          success: true,
          locked: false,
          message: 'Device verified (browser change detected).',
          deviceId: currentDeviceId
        };
      }

      // Backward compatibility: previously we stored `${visitorId}-${JSON.stringify(sessionInfo)}`
      // If the stored value starts with the current stable ID, treat as the same device and migrate it.
      try {
        if (typeof user.registered_device === 'string' && user.registered_device.startsWith(currentDeviceId + '-')) {
          console.log('🔐 DEVICE LOCK - Detected legacy registered_device format. Migrating to stable ID.');
          await this.registerDevice(userId, currentDeviceId);
          return {
            success: true,
            locked: false,
            message: 'Device verified (migrated).',
            deviceId: currentDeviceId
          };
        }
      } catch (migrationError) {
        console.log('🔐 DEVICE LOCK - Migration check failed:', migrationError);
      }

      // Shared-device policy: allow multiple users on same laptop.
      // If the registered device doesn't match with low similarity, allow access instead of locking.
      console.warn('🔐 DEVICE LOCK - Mismatch detected but allowing access (shared device policy).');
      return {
        success: true,
        locked: false,
        message: 'Device differs, but access allowed (shared device).'
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
   * Check if two device IDs represent the same core hardware (different browsers, same device)
   */
  private isSameCoreDevice(registeredDevice: string, currentDevice: string): boolean {
    try {
      // If they're exactly the same, it's definitely the same device
      if (registeredDevice === currentDevice) {
        return true;
      }

      // For legacy format: check if current device ID is contained in registered device
      // Legacy format was: `${deviceId}-${sessionInfo}`
      if (registeredDevice.includes(currentDevice)) {
        return true;
      }

      // For partial matches: check if they share core hardware characteristics
      // This is a simplified check - in practice, we'd need to store more metadata
      // For now, we'll be more permissive and allow similar device IDs
      const similarity = this.calculateDeviceSimilarity(registeredDevice, currentDevice);
      return similarity > 0.7; // 70% similarity threshold
    } catch (error) {
      console.error('Error checking device similarity:', error);
      return false;
    }
  }

  /**
   * Calculate similarity between two device IDs
   */
  private calculateDeviceSimilarity(device1: string, device2: string): number {
    // Simple character-based similarity
    const longer = device1.length > device2.length ? device1 : device2;
    const shorter = device1.length > device2.length ? device2 : device1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
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
