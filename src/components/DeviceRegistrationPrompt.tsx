import React, { useState } from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { deviceLockService } from '../services/deviceLockService';
import { userActivityService } from '../services/userActivityService';
import { supabase } from '../lib/supabase';

interface DeviceRegistrationPromptProps {
  userId: string;
  onComplete: () => void;
}

const DeviceRegistrationPrompt: React.FC<DeviceRegistrationPromptProps> = ({ userId, onComplete }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterDevice = async () => {
    try {
      setIsRegistering(true);
      setError(null);

      // Get current device ID
      const deviceId = await deviceLockService.getDeviceId();
      
      if (!deviceId) {
        throw new Error('Unable to generate device fingerprint');
      }

      // Register the device in the database
      const { error: dbError } = await supabase
        .from('user_profiles')
        .update({ registered_device: deviceId })
        .eq('user_id', userId);

      if (dbError) {
        throw dbError;
      }

      // Log the device registration
      await userActivityService.logActivity(
        userId,
        'device_registered',
        {
          deviceId: deviceId,
          success: true,
          metadata: { 
            registration_method: 'manual_prompt',
            device_reset_flow: true 
          }
        }
      );

      setIsRegistered(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('Error registering device:', error);
      setError(error instanceof Error ? error.message : 'Failed to register device');
    } finally {
      setIsRegistering(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
            Device Registered Successfully!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Your device has been registered and you can now access your account normally.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-blue-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
          Register Your Device
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          For security purposes, please register this device to continue using your account.
        </p>

        {error && (
          <div className="flex items-center mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleRegisterDevice}
            disabled={isRegistering}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isRegistering ? 'Registering...' : 'Register Device'}
          </button>
          
          <button
            onClick={onComplete}
            disabled={isRegistering}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Skip
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
          You can register your device later in settings if you skip now.
        </p>
      </div>
    </div>
  );
};

export default DeviceRegistrationPrompt;
