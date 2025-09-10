import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface UserStoryRule {
  rule: string;
  check: (text: string) => boolean;
  hint: string;
}

const basicChecklist: UserStoryRule[] = [
  {
    rule: "Has a clear role",
    check: (text: string) => /as a[n]?\s+[\w\s]+/i.test(text),
    hint: "Try starting with 'As a user' or 'As a customer'..."
  },
  {
    rule: "Describes what the user wants",
    check: (text: string) => /i want to\s+[a-z\s]+/i.test(text),
    hint: "Add a clear action after 'I want to'..."
  },
  {
    rule: "Explains why the user wants it",
    check: (text: string) => /so that\s+[a-z\s]+/i.test(text),
    hint: "Include a benefit using 'so that...'"
  }
];

export default function UserStoryChecker() {
  const [story, setStory] = useState("");
  const [showHints, setShowHints] = useState(false);

  const checks = basicChecklist.map(({ rule, check, hint }) => {
    const passed = check(story);
    return { rule, passed, hint };
  });

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">User Story Practice</h2>
        
        <textarea
          rows={5}
          placeholder="Write your user story here..."
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        />

        <div className="mt-6 space-y-3">
          {checks.map(({ rule, passed, hint }) => (
            <div
              key={rule}
              className={`flex items-start gap-2 p-3 rounded-md border ${
                passed 
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                  : "border-red-500 bg-red-50 dark:bg-red-900/20"
              }`}
            >
              {passed ? (
                <CheckCircle className="text-green-600 w-5 h-5 mt-0.5" />
              ) : (
                <XCircle className="text-red-600 w-5 h-5 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{rule}</p>
                {!passed && showHints && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Hint: {hint}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowHints(!showHints)}
          className="mt-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
        >
          {showHints ? "Hide Hints" : "Show Hints"}
        </button>
      </div>
    </div>
  );
}
