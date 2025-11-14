import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SecurityBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem('securityBannerDismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('securityBannerDismissed', 'true');
    // Update CSS variable to adjust header position when banner is dismissed
    document.documentElement.style.setProperty('--security-banner-height', '0px');
  };

  useEffect(() => {
    if (isVisible) {
      // Set CSS variable for header positioning
      document.documentElement.style.setProperty('--security-banner-height', '44px');
    } else {
      document.documentElement.style.setProperty('--security-banner-height', '0px');
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-purple-50 dark:bg-purple-900/30 text-gray-900 dark:text-white py-2.5 px-4 z-50 border-b border-purple-100 dark:border-purple-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm font-medium text-center flex-1">
          BA WorkXP™ will never request your card details, PIN, OTP, or banking information via call, SMS, WhatsApp, or email. Do not respond to such requests.
        </p>
        <button
          onClick={handleDismiss}
          className="ml-4 flex-shrink-0 p-1 hover:bg-purple-100 dark:hover:bg-purple-800/50 rounded transition-colors"
          aria-label="Dismiss security banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SecurityBanner;

