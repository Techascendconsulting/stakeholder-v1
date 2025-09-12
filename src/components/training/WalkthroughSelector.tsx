import React, { useState } from 'react';
import { FileText, Smartphone, ArrowRight, BookOpen, Target, Users, CheckSquare } from 'lucide-react';
import UserStoryWalkthrough from './UserStoryWalkthrough';
import AcceptanceCriteriaWalkthrough from './AcceptanceCriteriaWalkthrough';

interface WalkthroughSelectorProps {
  onStartPractice: () => void;
  onBack: () => void;
}

interface WalkthroughOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  difficulty: string;
  focus: string;
}

const walkthroughOptions: WalkthroughOption[] = [
  {
    id: 'user-story',
    title: 'Write a Real User Story in 5 Steps',
    description: 'Master the fundamentals of user story writing with a clear, step-by-step approach. Perfect for beginners or as a refresher.',
    icon: <FileText className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    difficulty: 'Beginner',
    focus: 'Core Story Writing'
  },
  {
    id: 'acceptance-criteria',
    title: 'Master Acceptance Criteria Rules',
    description: 'Learn the 8 essential rules for writing clear, testable acceptance criteria. Practice with real scenarios and get detailed feedback.',
    icon: <CheckSquare className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    difficulty: 'Intermediate',
    focus: 'AC Rules & Testing'
  }
];

export default function WalkthroughSelector({ onStartPractice, onBack }: WalkthroughSelectorProps) {
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<string | null>(null);

  const handleSelectWalkthrough = (id: string) => {
    setSelectedWalkthrough(id);
  };

  const handleBackToSelector = () => {
    setSelectedWalkthrough(null);
  };

  // If a walkthrough is selected, render it
  if (selectedWalkthrough === 'user-story') {
    return <UserStoryWalkthrough onStartPractice={onStartPractice} onBack={handleBackToSelector} />;
  }

  if (selectedWalkthrough === 'acceptance-criteria') {
    return <AcceptanceCriteriaWalkthrough onStartPractice={onStartPractice} onBack={handleBackToSelector} />;
  }

  // Render the selector
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Walkthrough
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select a guided walkthrough to practice writing user stories. Each walkthrough focuses on different scenarios and skill levels.
        </p>
      </div>

      {/* Walkthrough Options */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {walkthroughOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleSelectWalkthrough(option.id)}
            className="group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {/* Icon and Header */}
            <div className="flex items-start space-x-4 mb-6">
              <div className={`w-16 h-16 ${option.bgColor} rounded-2xl flex items-center justify-center ${option.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {option.title}
                </h3>
                <div className="flex items-center space-x-4 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    option.difficulty === 'Beginner' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                  }`}>
                    {option.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {option.focus}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {option.description}
            </p>

            {/* Features */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Target className="w-4 h-4" />
                <span>5 guided steps</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>Real-world scenarios</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <FileText className="w-4 h-4" />
                <span>INVEST criteria check</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Click to start walkthrough
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mx-auto"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Learning</span>
        </button>
      </div>
    </div>
  );
}
