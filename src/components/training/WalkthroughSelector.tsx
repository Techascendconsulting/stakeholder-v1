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
    icon: <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face&auto=format&q=80" alt="Parent character" className="w-12 h-12 rounded-full object-cover" />,
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
    icon: <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&auto=format&q=80" alt="Student character" className="w-12 h-12 rounded-full object-cover" />,
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
    icon: <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80" alt="Tenant character" className="w-12 h-12 rounded-full object-cover" />,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {trainingPods.map((pod, index) => (
          <div
            key={pod.id}
            className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-105"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${
              index === 0 ? 'from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20' :
              index === 1 ? 'from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20' :
              'from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20'
            } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Header with Character and Badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-300 ring-2 ring-white dark:ring-gray-700">
                  {pod.icon}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                    {pod.tag}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    pod.difficulty === 'Beginner' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                  } shadow-sm`}>
                    {pod.difficulty}
                  </span>
                </div>
              </div>

              {/* Title and Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                  {pod.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {pod.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSelectWalkthrough(pod.id, 'user-story')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <FileEdit className="w-4 h-4" />
                  Write Story
                </button>

                <button
                  onClick={() => handleSelectWalkthrough(pod.id, 'acceptance-criteria')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <BookOpenCheck className="w-4 h-4" />
                  Match AC
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-lg group-hover:scale-125 transition-transform duration-500" />
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
