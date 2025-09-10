import React, { useState } from 'react';

interface CoachingStep {
  title: string;
  question: string;
  tip: string;
  expectedKeywords: string[];
}

const coachingSteps: CoachingStep[] = [
  {
    title: '1. Match the User Goal',
    question: 'What does the user want to do?',
    tip: "Start by clearly reflecting the action from the story. E.g., 'Upload a document' should appear in at least one AC.",
    expectedKeywords: ['upload', 'document'],
  },
  {
    title: '2. Honour the Why',
    question: 'Why does the user want to do this?',
    tip: "Translate the 'so that' into feedback or success confirmation. E.g., email sent, booking shown, confirmation message.",
    expectedKeywords: ['housing team', 'context', 'resolve'],
  },
  {
    title: '3. Define the Trigger',
    question: 'What causes this to happen?',
    tip: "Define what the user must do to trigger the action — click a button, submit a form, etc.",
    expectedKeywords: ['click', 'button', 'select', 'choose'],
  },
  {
    title: '4. Identify the Recipient or Destination',
    question: 'Where is the output going?',
    tip: "If it's an email, who receives it? If it's data, where is it stored or displayed?",
    expectedKeywords: ['housing team', 'maintenance', 'system'],
  },
  {
    title: '5. Handle the Unhappy Path',
    question: 'What if something goes wrong?',
    tip: "Add criteria for when it fails — e.g., file too large, invalid input, system error.",
    expectedKeywords: ['error', 'fail', 'invalid', 'too large'],
  },
  {
    title: '6. Define the Error Message',
    question: 'What will the user see if it fails?',
    tip: "Specify the error text or UI indicator. Helps both design and QA.",
    expectedKeywords: ['message', 'error', 'shown', 'display'],
  },
  {
    title: '7. Non-Functional Rules',
    question: 'Are there performance, speed, or security expectations?',
    tip: "Define any speed limits, mobile rules, retry limits, or access control expectations.",
    expectedKeywords: ['size', 'limit', 'mb', 'format', 'type'],
  }
];

export default function PracticeAndCoachingLayer() {
  const [stepIndex, setStepIndex] = useState(0);
  const [acInputs, setAcInputs] = useState<string[]>(Array(coachingSteps.length).fill(''));
  const [feedbacks, setFeedbacks] = useState<string[]>(Array(coachingSteps.length).fill(''));

  const userStory = "As a tenant, I want to upload a document so that the housing team has enough context to resolve the issue.";
  const scenario = "You are working on a tenant portal. Tenants need to upload photos or documents when reporting a maintenance issue, so the housing team can assess and respond effectively.";

  const handleInputChange = (value: string) => {
    const newInputs = [...acInputs];
    newInputs[stepIndex] = value;
    setAcInputs(newInputs);
  };

  const handleCheck = () => {
    const input = acInputs[stepIndex].toLowerCase();
    const keywords = coachingSteps[stepIndex].expectedKeywords;
    const matched = keywords.every(kw => input.includes(kw));
    const newFeedbacks = [...feedbacks];
    newFeedbacks[stepIndex] = matched
      ? '✔️ Good! You\'ve clearly matched the action from the user story.'
      : '⚠️ This doesn\'t seem to reflect the goal in the story. Want to try again?';
    setFeedbacks(newFeedbacks);
  };

  return (
    <div className="p-4 space-y-6">
      {/* User Story Context */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-2">User Story:</h2>
        <p className="font-medium text-gray-900 dark:text-white">{userStory}</p>
      </div>
      
      {/* Scenario Context */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
        <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Scenario:</h2>
        <p className="font-medium text-gray-900 dark:text-white">{scenario}</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {stepIndex + 1} of {coachingSteps.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(((stepIndex + 1) / coachingSteps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / coachingSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Coaching Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
        <div className="space-y-4 p-6">
          <div>
            <h3 className="text-purple-600 dark:text-purple-400 font-semibold mb-2">
              {coachingSteps[stepIndex].title}
            </h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              {coachingSteps[stepIndex].question}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {coachingSteps[stepIndex].tip}
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Acceptance Criterion:
            </label>
            <textarea
              placeholder="Type your Acceptance Criterion for this rule..."
              value={acInputs[stepIndex]}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Check Button */}
          <button
            onClick={handleCheck}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
          >
            Check My Input
          </button>

          {/* Feedback */}
          {feedbacks[stepIndex] && (
            <div className="text-sm mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="text-gray-800 dark:text-gray-200">{feedbacks[stepIndex]}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setStepIndex(prev => Math.max(prev - 1, 0))}
              disabled={stepIndex === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setStepIndex(prev => Math.min(prev + 1, coachingSteps.length - 1))}
              disabled={stepIndex === coachingSteps.length - 1}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Tip →
            </button>
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
