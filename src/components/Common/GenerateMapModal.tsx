import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import AIService from '../../services/aiService';

interface GenerateMapModalProps {
  onClose: () => void;
  onGenerate: (mapData: any) => void;
}

export default function GenerateMapModal({ onClose, onGenerate }: GenerateMapModalProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a longer process description (at least 10 characters).');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const aiService = AIService.getInstance();
      const result = await aiService.generateProcessMap(description.trim());

      if (result.success && result.map) {
        onGenerate(result.map);
        // Show success toast (you can implement toast notifications here)
        console.log('Process map generated successfully!');
      } else {
        throw new Error(result.error || 'Failed to generate process map');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate process map. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generate Process Map with AI
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description Input */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your process
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your process in plain English (e.g., When a tenant submits a complaint, the Tenant Services team logs it into the system. Then they decide if it's about maintenance, billing, or communication...)"
                className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                disabled={isGenerating}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {description.length}/1000 characters
                </span>
                {description.length < 10 && description.length > 0 && (
                  <span className="text-sm text-amber-600 dark:text-amber-400">
                    Minimum 10 characters required
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Example */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Example:</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm italic">
                "When a customer places an order, the system checks inventory. If items are available, it processes the payment. If payment succeeds, it sends confirmation and ships the order. If payment fails, it sends a retry request. If inventory is low, it notifies the warehouse manager."
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || description.trim().length < 10}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Map
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
