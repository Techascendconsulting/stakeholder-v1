import React, { useEffect, useState } from 'react';
import { AlertCircle, Shield, Mail, Monitor, Cpu, HardDrive } from 'lucide-react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

interface DeviceLockAlertProps {
  message: string;
  isLocked: boolean;
  onClose?: () => void;
}

interface DeviceInfo {
  platform: string;
  cores: string;
  gpu: string;
}

const DeviceLockAlert: React.FC<DeviceLockAlertProps> = ({ 
  message, 
  isLocked, 
  onClose 
}) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    // Get current device info to show user
    const loadDeviceInfo = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const components = result.components;

        setDeviceInfo({
          platform: components.platform?.value || 'Unknown',
          cores: components.hardwareConcurrency?.value?.toString() || 'Unknown',
          gpu: components.vendor?.value || 'Unknown'
        });
      } catch (error) {
        console.error('Error loading device info:', error);
      }
    };

    loadDeviceInfo();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          {isLocked ? (
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          ) : (
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isLocked ? 'Account Locked' : 'Device Verification'}
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Show device info to user */}
        {deviceInfo && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
              <Monitor className="w-4 h-4 mr-2" />
              Detected Device Information:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Monitor className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                <span className="font-mono text-gray-900 dark:text-white">{deviceInfo.platform}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cpu className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">CPU Cores:</span>
                <span className="font-mono text-gray-900 dark:text-white">{deviceInfo.cores}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HardDrive className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">GPU:</span>
                <span className="font-mono text-gray-900 dark:text-white">{deviceInfo.gpu}</span>
              </div>
            </div>
          </div>
        )}

        {isLocked && (
          <>
            {/* Device Change Policy Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                Device Change Policy
              </h4>
              <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Each account is bound to ONE device for security</li>
                <li>• Device changes are permitted ONLY for legitimate reasons (new laptop, lost device, etc.)</li>
                <li>• This is a ONE-TIME courtesy - future violations may result in permanent account termination</li>
                <li>• Account sharing is strictly prohibited per Terms of Service</li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Need to Unlock Your Account?
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    Contact support at{' '}
                    <a 
                      href="mailto:support@baworkxp.com" 
                      className="underline hover:no-underline font-semibold"
                    >
                      support@baworkxp.com
                    </a>
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 italic">
                    Include the device information above in your email to help us verify your request quickly.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceLockAlert;

