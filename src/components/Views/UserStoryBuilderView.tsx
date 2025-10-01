import React, { useState } from 'react';
import CoachChatSidebar from '../CoachChatSidebar';

export default function UserStoryBuilderView() {
  const [userStory, setUserStory] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [mode, setMode] = useState<'checklist' | 'bdd' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!userStory || !acceptanceCriteria || !mode) return;
    setSubmitted(true);
  };

  return (
    <div className="flex w-full h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Input Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          User Story Quality & Acceptance Criteria Checker
        </h1>

        <div className="space-y-6">
          {/* User Story Input */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
              User Story
            </label>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 h-24 mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              placeholder="e.g. As a tenant, I want to upload a photo so that the housing team can resolve my issue"
            />
          </div>

          {/* Acceptance Criteria Input */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Acceptance Criteria
            </label>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 h-32 mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              placeholder="List your acceptance criteria here..."
            />
          </div>

          {/* Mode Selection */}
          <div className="mb-4">
            <label className="font-semibold block mb-3 text-gray-700 dark:text-gray-300">
              Select Input Mode:
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setMode('checklist')}
                className={`px-6 py-3 rounded-md border-2 font-medium transition-all duration-200 ${
                  mode === 'checklist' 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-500'
                }`}
              >
                Use Checklist
              </button>
              <button
                onClick={() => setMode('bdd')}
                className={`px-6 py-3 rounded-md border-2 font-medium transition-all duration-200 ${
                  mode === 'bdd' 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-500'
                }`}
              >
                Use BDD (Given/When/Then)
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!userStory || !acceptanceCriteria || !mode}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-md hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            Check My Story
          </button>

          {/* Results Section */}
          {submitted && (
            <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Analysis Results
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    ✅ Story Quality Analysis
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your user story structure looks good! Check the AI Coach sidebar for detailed feedback on each quality aspect.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    📋 Acceptance Criteria Analysis
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Review the checklist in the AI Coach sidebar to see which areas are covered and which need attention.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Coach Sidebar */}
      <CoachChatSidebar 
        storyText={userStory} 
        acText={acceptanceCriteria} 
      />
    </div>
  );
}






