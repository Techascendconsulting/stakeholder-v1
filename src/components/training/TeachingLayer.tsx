import React from 'react';

interface TeachingStep {
  title: string;
  content: string;
}

const teachingSteps: TeachingStep[] = [
  {
    title: 'What is a User Story?',
    content: `A user story describes a feature or function from the user's perspective. 
It should be short, clear, and follow the format: "As a [role], I want [something] so that [benefit]."`
  },
  {
    title: 'The Role, The Need, The Why',
    content: `Every good user story starts with a clear role (the user), a specific action or goal, and a reason or benefit.
This makes sure your story is tied to real user value.`
  },
  {
    title: 'The Power of Acceptance Criteria',
    content: `Acceptance Criteria make the story testable. Think of them as the conditions that must be true for the story to be "done". 
They should cover the expected outcome, error handling, edge cases, and business rules.`
  },
  {
    title: 'Before You Write...',
    content: `Ask yourself: Who is this for? What do they want to achieve? What happens when it works or fails? 
Use this thinking to guide both your story and your criteria.`
  }
];

interface TeachingLayerProps {
  onStartPractice: () => void;
}

export default function TeachingLayer({ onStartPractice }: TeachingLayerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        📚 Learn How to Write Better User Stories
      </h1>

      <div className="space-y-6">
        {teachingSteps.map((step, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 transition hover:shadow-xl hover:scale-[1.02] duration-200"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{step.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={onStartPractice}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Start Practice →
        </button>
      </div>
    </div>
  );
}
