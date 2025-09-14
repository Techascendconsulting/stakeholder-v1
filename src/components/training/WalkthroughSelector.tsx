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
  icon: string;
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
    icon: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&auto=format&q=80',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    difficulty: 'Beginner',
    tag: 'Scenario 1'
  },
  {
    id: 'shopping-checkout',
    title: 'Student Uploading Homework',
    description: 'Students need clearer feedback when their file uploads fail.',
    scenario: 'Meet Daniel. Daniel is 15, in Year 11, and he just finished his homework at 10:47 p.m. He logs into his school portal to upload it — but nothing happens. He tries again. Still nothing. Finally, he sees the upload failed — but it didn\'t say why. He doesn\'t know if the file type was wrong, if it was too big, or if the system just broke. Now it\'s 11:02 p.m. The deadline has passed. The teacher will think he didn\'t try. He\'s frustrated. He did the work. The system failed him. You\'re the Business Analyst for the school platform. Your job is to make sure this never happens again.',
    icon: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=face&auto=format&q=80',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    difficulty: 'Beginner',
    tag: 'Scenario 2'
  },
  {
    id: 'student-homework',
    title: 'Tenant Paying Rent Online',
    description: 'Tenants want instant confirmation that their rent payment went through.',
    scenario: 'You\'re working on a rent payment portal. Your stakeholder (the Property Ops Lead) tells you: "Tenants are paying online but sometimes the page freezes and they don\'t know if payment went through. They also want an option to see payment history clearly." This sounds simple. But clarity lives in the details. Don\'t just jump into writing "As a user, I want to pay rent online." That\'s vague, weak, and it puts the thinking burden on developers. Instead, shape a clear story that reflects: Who exactly is using the feature (be specific), What they want to do now, Why it matters at that moment.',
    icon: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    difficulty: 'Intermediate',
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
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Training Pods
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose a scenario to practice both user story writing and acceptance criteria. Each pod provides end-to-end learning with one real-world example.
        </p>
      </div>

      {/* Training Pods Grid - Simplilearn Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {trainingPods.map((pod, index) => (
          <div
            key={pod.id}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Program Image Header */}
            <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
              <img 
                src={pod.icon} 
                alt={`${pod.title} illustration`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {pod.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {pod.description}
              </p>

              {/* Difficulty Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  index === 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  index === 1 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                  {pod.difficulty}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleSelectWalkthrough(pod.id, 'user-story')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors duration-200"
                >
                  Start US Walkthrough
                </button>

                <button
                  onClick={() => handleSelectWalkthrough(pod.id, 'acceptance-criteria')}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 px-4 rounded-md transition-colors duration-200"
                >
                  Start AC Walkthrough
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

