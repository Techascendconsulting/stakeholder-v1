import React, { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

interface ClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClarify: (clarification: string) => void;
  clarificationRequest: {
    step: string;
    question: string;
    context: string;
  };
  isProcessing: boolean;
}

export default function ClarificationModal({
  isOpen,
  onClose,
  onClarify,
  clarificationRequest,
  isProcessing
}: ClarificationModalProps) {
  const [clarification, setClarification] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clarification.trim()) {
      onClarify(clarification.trim());
      setClarification('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Process Clarification Needed
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help us create a more accurate process map
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Context */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Unclear Step Detected:
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                "{clarificationRequest.step}"
              </p>
            </div>

            {/* Question */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Question:
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                {clarificationRequest.question}
              </p>
            </div>

            {/* Context */}
            {clarificationRequest.context && (
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Context:
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {clarificationRequest.context}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="clarification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Clarification *
                </label>
                <textarea
                  id="clarification"
                  value={clarification}
                  onChange={(e) => setClarification(e.target.value)}
                  placeholder="Please provide more specific details about who performs this step, what exactly happens, or any conditions that apply..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  disabled={isProcessing}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Be as specific as possible. This helps create a more accurate process map.
                </p>
              </div>

              {/* Examples */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                  Good Clarification Examples:
                </h4>
                <ul className="text-green-700 dark:text-green-300 text-xs space-y-1">
                  <li>• "The Customer Service Representative checks the customer's account status"</li>
                  <li>• "If the amount is over $500, the Finance Manager must approve it"</li>
                  <li>• "The IT Support team receives the ticket and assigns it to a technician"</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  disabled={isProcessing}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !clarification.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Update Process Map
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


















