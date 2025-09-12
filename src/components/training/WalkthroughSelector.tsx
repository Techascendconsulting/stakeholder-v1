import React, { useState } from 'react';
import { FileText, CheckSquare, ArrowRight, BookOpen, Target, Users, Home, Building, GraduationCap, BookOpenCheck, FileEdit } from 'lucide-react';
import UserStoryWalkthrough from './UserStoryWalkthrough';
import AcceptanceCriteriaWalkthrough from './AcceptanceCriteriaWalkthrough';

interface WalkthroughSelectorProps {
  onStartPractice: () => void;
  onBack: () => void;
}

interface TrainingPod {
  id: string;
  title: string;
  description: string;
  scenario: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  difficulty: string;
  tag: string;
}

const trainingPods: TrainingPod[] = [
  {
    id: 'childcare-voucher',
    title: 'Childcare Voucher Application',
    description: 'Parents want to save their progress midway through a long application form.',
    scenario: 'Parents often abandon the voucher application form midway because it\'s too long and they don\'t always have the right documents. They want a "Save Progress" feature.',
    icon: <Building className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    difficulty: 'Beginner',
    tag: 'Scenario 1'
  },
  {
    id: 'shopping-checkout',
    title: 'POS System Discount Tool',
    description: 'Store staff want to quickly apply discount codes at checkout without delays.',
    scenario: 'A shopper using mobile data tries to pay at checkout but the payment fails. They want to know why and what to do next.',
    icon: <Target className="w-8 h-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    difficulty: 'Intermediate',
    tag: 'Scenario 2'
  },
  {
    id: 'student-homework',
    title: 'Homework Upload Feedback',
    description: 'Students need clearer feedback when their file uploads fail.',
    scenario: 'A returning student using a school laptop needs to upload a document to submit their homework. They\'re struggling with file types and unclear upload messages.',
    icon: <GraduationCap className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    difficulty: 'Beginner',
    tag: 'Scenario 3'
  }
];

export default function WalkthroughSelector({ onStartPractice, onBack }: WalkthroughSelectorProps) {
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<string | null>(null);
  const [currentPod, setCurrentPod] = useState<string | null>(null);

  const handleSelectWalkthrough = (podId: string, walkthroughType: string) => {
    setCurrentPod(podId);
    setSelectedWalkthrough(walkthroughType);
  };

  const handleBackToSelector = () => {
    setSelectedWalkthrough(null);
    setCurrentPod(null);
  };

  // If a walkthrough is selected, render it
  if (selectedWalkthrough === 'user-story') {
    return <UserStoryWalkthrough onStartPractice={onStartPractice} onBack={handleBackToSelector} scenarioId={currentPod || undefined} />;
  }

  if (selectedWalkthrough === 'acceptance-criteria') {
    return <AcceptanceCriteriaWalkthrough onStartPractice={onStartPractice} onBack={handleBackToSelector} scenarioId={currentPod || undefined} />;
  }

  // Render the selector
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Training Pods
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose a scenario to practice both user story writing and acceptance criteria. Each pod provides end-to-end learning with one real-world example.
        </p>
      </div>

      {/* Training Pods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {trainingPods.map((pod) => (
          <div
            key={pod.id}
            className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
          >
            {/* Pod Header */}
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-12 h-12 ${pod.bgColor} rounded-xl flex items-center justify-center ${pod.color} shadow-md`}>
                  {pod.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {pod.tag}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      pod.difficulty === 'Beginner' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                    }`}>
                      {pod.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pod.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pod.description}
              </p>
            </div>

            {/* Training Options */}
            <div className="flex items-center justify-between gap-3 mt-4">
              <button
                onClick={() => handleSelectWalkthrough(pod.id, 'user-story')}
                className="flex items-center justify-center gap-2 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg transition-all"
              >
                <FileEdit className="w-4 h-4" />
                Write the User Story
              </button>

              <button
                onClick={() => handleSelectWalkthrough(pod.id, 'acceptance-criteria')}
                className="flex items-center justify-center gap-2 text-sm font-medium bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg transition-all"
              >
                <BookOpenCheck className="w-4 h-4" />
                Match the Acceptance Criteria
              </button>
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
