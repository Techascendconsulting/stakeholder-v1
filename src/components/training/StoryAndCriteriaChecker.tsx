import React, { useState, useEffect } from 'react';
import UserStoryChecker from './UserStoryChecker';
import AcceptanceCriteriaChecker from './AcceptanceCriteriaChecker';

type CheckerMode = 'user-story' | 'acceptance-criteria' | 'both';

export default function StoryAndCriteriaChecker() {
  // Initialize mode from localStorage or default to user-story
  const [mode, setMode] = useState<CheckerMode>(() => {
    try {
      const saved = localStorage.getItem('story_checker_mode');
      if (saved && ['user-story', 'acceptance-criteria', 'both'].includes(saved)) {
        return saved as CheckerMode;
      }
    } catch (error) {
      console.log('Error loading story checker mode from localStorage:', error);
    }
    return 'user-story';
  });

  // Save mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('story_checker_mode', mode);
    } catch (error) {
      console.log('Error saving story checker mode to localStorage:', error);
    }
  }, [mode]);

  return (
    <div className="w-full h-full px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Story & Acceptance Criteria Checker
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('user-story')}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
              mode === 'user-story'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            User Story
          </button>
          <button
            onClick={() => setMode('acceptance-criteria')}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
              mode === 'acceptance-criteria'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Acceptance Criteria
          </button>
          <button
            onClick={() => setMode('both')}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
              mode === 'both'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Both
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800 min-h-[500px]">
        {mode === 'user-story' && <UserStoryChecker />}
        {mode === 'acceptance-criteria' && <AcceptanceCriteriaChecker />}
        {mode === 'both' && (
          <div className="space-y-8">
            <UserStoryChecker />
            <AcceptanceCriteriaChecker />
          </div>
        )}
      </div>
    </div>
  );
}

