import React, { useState } from 'react';
import { FileText, CheckSquare, ArrowRight, BookOpen, Target, Users, Home, Building, GraduationCap } from 'lucide-react';
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
    description: 'Help parents save their progress on a long application form so they don\'t lose their work.',
    scenario: 'Parents often abandon the voucher application form midway because it\'s too long and they don\'t always have the right documents. They want a "Save Progress" feature.',
    icon: <Building className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    difficulty: 'Beginner',
    tag: 'Scenario 1'
  },
  {
    id: 'shopping-checkout',
    title: 'Shopping Checkout – Payment Failure',
    description: 'Help shoppers understand why their payment failed and guide them to complete their purchase.',
    scenario: 'A shopper using mobile data tries to pay at checkout but the payment fails. They want to know why and what to do next.',
    icon: <Target className="w-8 h-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    difficulty: 'Intermediate',
    tag: 'Scenario 2'
  },
  {
    id: 'student-homework',
    title: 'Returning Student Uploading Homework',
    description: 'Help students successfully upload their homework files with clear guidance on file types and upload process.',
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
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
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

      {/* Training Pods */}
      <div className="space-y-8 mb-12">
        {trainingPods.map((pod) => (
          <div
            key={pod.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Pod Header */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4 mb-4">
                <div className={`w-16 h-16 ${pod.bgColor} rounded-2xl flex items-center justify-center ${pod.color} shadow-md`}>
                  {pod.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {pod.title}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {pod.tag}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pod.difficulty === 'Beginner' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                    }`}>
                      {pod.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {pod.description}
                  </p>
                </div>
              </div>
              
              {/* Scenario Context */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📋 Scenario Context:</h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {pod.scenario}
                </p>
              </div>
            </div>

            {/* Training Options */}
            <div className="p-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose your training focus:
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {/* User Story Training */}
                <button
                  onClick={() => handleSelectWalkthrough(pod.id, 'user-story')}
                  className="group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Write the User Story
                    </h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Master the fundamentals of user story writing with step-by-step guidance and INVEST validation.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">5 guided steps</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  </div>
                </button>

                {/* Acceptance Criteria Training */}
                <button
                  onClick={() => handleSelectWalkthrough(pod.id, 'acceptance-criteria')}
                  className="group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-400 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <h5 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      Practice the Acceptance Criteria
                    </h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Learn the 8 essential rules for writing clear, testable acceptance criteria with real examples.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">8 rule cards</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                  </div>
                </button>
              </div>
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
