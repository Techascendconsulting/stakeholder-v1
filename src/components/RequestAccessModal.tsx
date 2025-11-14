import React from 'react';
import { X, Mail, Shield, ArrowRight, Copy, CheckCircle, GraduationCap } from 'lucide-react';

interface RequestAccessModalProps {
  onClose: () => void;
  onBackToHome?: () => void;
  onSignIn?: () => void;
}

const RequestAccessModal: React.FC<RequestAccessModalProps> = ({ onClose, onBackToHome, onSignIn }) => {
  const [copied, setCopied] = React.useState(false);
  const email = 'support@baworkxp.com';
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Beautiful Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/95 via-indigo-600/95 to-purple-800/95">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 border border-white/20">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-10"></div>
          <div className="relative flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {onBackToHome ? (
                <button
                  onClick={onBackToHome}
                  className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                  title="Back to home"
                >
                  <GraduationCap className="w-6 h-6 text-white" />
                </button>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Request Access
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {onBackToHome ? 'Click logo to return home' : 'Join BA WorkXP™ Today'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:rotate-90 transform duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Badge */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-full px-4 py-2">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Invite-Only Platform</span>
            </div>
          </div>

          {/* Description */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              BA WorkXP™ is currently invite-only for <span className="font-semibold text-purple-600 dark:text-purple-400">individual learners</span> and <span className="font-semibold text-indigo-600 dark:text-indigo-400">training platform partnerships</span>.
            </p>
          </div>

          {/* Email Box */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-5 shadow-inner">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Send your request to:
              </p>
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {email}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 hover:from-purple-200 hover:to-indigo-200 dark:hover:from-purple-800/50 dark:hover:to-indigo-800/50 rounded-lg transition-all transform hover:scale-105"
                title="Copy email"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* What to Include */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <span>📋</span>
              <span>Please include:</span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                <span>Your name</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                <span>Individual or Training Platform</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                <span>How you heard about us</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex space-x-3">
              <a
                href={`mailto:${email}?subject=Access%20Request%20-%20BA%20WorkXP™&body=Hello,%0D%0A%0D%0AI'm interested in accessing BA WorkXP™.%0D%0A%0D%0AName:%0D%0AInterest: (Individual / Training Platform Partnership)%0D%0AOrganization (if applicable):%0D%0AHow I heard about you:%0D%0A%0D%0AThank you!`}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                <span>Open Email Client</span>
              </a>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
            
            {/* Sign In Option */}
            {onSignIn && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="text-center mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?
                  </p>
                </div>
                <button
                  onClick={onSignIn}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Response Time */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-2">
              <span>⏱️</span>
              <span>We typically respond within 24 hours</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAccessModal;

