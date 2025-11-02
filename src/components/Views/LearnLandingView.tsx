import React from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Zap,
  ArrowRight,
  Play,
  BookText,
  Users,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface LearnCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  actionText: string;
  viewId: string;
}

const LearnLandingView: React.FC = () => {
  const { setCurrentView } = useApp();

  const learnCategories: LearnCategory[] = [
    {
      id: 'ba-essentials',
      title: 'BA Essentials',
      description: 'Master the fundamental concepts and principles of Business Analysis',
      icon: BookText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      features: [
        'Requirements Gathering',
        'Stakeholder Analysis',
        'Business Process Modeling',
        'Documentation Standards'
      ],
      actionText: 'Start Learning',
      viewId: 'core-concepts'
    },
    {
      id: 'process-mapper',
      title: 'Process Mapper',
      description: 'Learn to create and analyze business process diagrams',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      features: [
        'BPMN Notation',
        'Process Flow Diagrams',
        'Swimlane Diagrams',
        'Process Optimization'
      ],
      actionText: 'Explore Mapper',
      viewId: 'process-mapper'
    },
    {
      id: 'scrum-essentials',
      title: 'Scrum Essentials',
      description: 'Understand Agile methodologies and Scrum framework',
      icon: Zap,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      features: [
        'Agile Principles',
        'Scrum Roles & Events',
        'Sprint Planning',
        'User Stories & Backlog'
      ],
      actionText: 'Learn Scrum',
      viewId: 'scrum-essentials'
    }
  ];

  const handleCategoryClick = (viewId: string) => {
    setCurrentView(viewId as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Header */}
      <div className="relative bg-white dark:bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Learning Hub
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Build your Business Analysis foundation with comprehensive learning modules
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Learning Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {learnCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => handleCategoryClick(category.viewId)}
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                {/* Category Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 ${category.bgColor} rounded-2xl`}>
                    <Icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>

                {/* Category Content */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <ul className="space-y-2">
                    {category.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg group-hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(category.viewId);
                  }}
                >
                  {category.actionText}
                </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join our comprehensive learning program and master the essential skills of Business Analysis.
            </p>
            <button
              onClick={() => handleCategoryClick('core-concepts')}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Begin Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnLandingView;



