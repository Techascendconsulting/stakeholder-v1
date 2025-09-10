import React, { useState } from 'react';

interface CoachingStep {
  rule: string;
  prompt: string;
  feedback: string;
  nudge?: string;
}

const coachingSteps: CoachingStep[] = [
  {
    rule: "1. Match the User Goal",
    prompt: "What does the user want to do?",
    feedback: "Start by clearly reflecting the action from the story. E.g., 'Upload a document' should appear in at least one AC."
  },
  {
    rule: "2. Honour the Why",
    prompt: "Why does the user want to do this?",
    feedback: "Translate the 'so that' into feedback or success confirmation. E.g., email sent, booking shown, confirmation message."
  },
  {
    rule: "3. Define the Trigger",
    prompt: "What causes this to happen?",
    feedback: "Define what the user must do to trigger the action — click a button, submit a form, etc."
  },
  {
    rule: "4. Identify the Recipient or Destination",
    prompt: "Where is the output going?",
    feedback: "If it's an email, who receives it? If it's data, where is it stored or displayed?"
  },
  {
    rule: "5. Handle the Unhappy Path",
    prompt: "What if something goes wrong?",
    feedback: "Add criteria for when it fails — e.g., file too large, invalid input, system error."
  },
  {
    rule: "6. Define the Error Message",
    prompt: "What will the user see if it fails?",
    feedback: "Specify the error text or UI indicator. Helps both design and QA."
  },
  {
    rule: "7. Non-Functional Rules",
    prompt: "Are there performance, speed, or security expectations?",
    feedback: "Define any speed limits, mobile rules, retry limits, or access control expectations."
  }
];

export default function PracticeAndCoachingLayer() {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < coachingSteps.length - 1) setCurrent(current + 1);
  };

  const handlePrevious = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleReset = () => {
    setCurrent(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        🧠 Practice & Coaching
      </h1>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {current + 1} of {coachingSteps.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(((current + 1) / coachingSteps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / coachingSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Coaching Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            {coachingSteps[current].rule}
          </p>
          <div className="flex space-x-2">
            {coachingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === current 
                    ? 'bg-purple-600' 
                    : index < current 
                      ? 'bg-green-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {coachingSteps[current].prompt}
        </h2>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
            {coachingSteps[current].feedback}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={current === 0}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
            
            {current < coachingSteps.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
              >
                Next Tip →
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  🎉 All coaching complete!
                </span>
                <button
                  onClick={handleReset}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          💡 Quick Reference
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Use these 7 steps as a checklist when writing acceptance criteria. Each step ensures your criteria are complete, testable, and user-focused.
        </p>
      </div>
    </div>
  );
}
