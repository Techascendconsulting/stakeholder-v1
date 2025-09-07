import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  BookOpen, 
  GraduationCap, 
  MessageSquare, 
  Zap,
  ArrowRight,
  Target,
  Lightbulb
} from 'lucide-react';

const LearnView: React.FC = () => {
  const { setCurrentView } = useApp();

  const learningModules = [
    {
      id: 'core-concepts',
      title: 'BA Essentials',
      description: 'Learn the fundamental concepts and principles of Business Analysis',
      icon: BookOpen,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'from-blue-50 to-purple-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'ba-fundamentals',
      title: 'BA Fundamentals',
      description: 'Master the core skills and techniques every Business Analyst needs',
      icon: GraduationCap,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'process-mapper',
      title: 'Process Mapper',
      description: 'Learn how to map and analyze business processes effectively',
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'agile-scrum',
      title: 'Agile & Scrum',
      description: 'Understand Agile methodologies and Scrum frameworks for BAs',
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300 rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Learn
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Build your Business Analysis knowledge foundation
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Knowledge Building
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Introduction */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Master Business Analysis
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Build a solid foundation in Business Analysis with our comprehensive learning modules. 
            Start with the fundamentals and progress to advanced techniques.
          </p>
        </div>

        {/* Learning Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {learningModules.map((module) => (
            <div
              key={module.id}
              onClick={() => setCurrentView(module.id as any)}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <module.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {module.description}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Target className="w-4 h-4" />
                    <span>Click to start learning</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </div>
              
              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`}></div>
            </div>
          ))}
        </div>

        {/* Learning Path */}
        <div className="mt-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Recommended Learning Path
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Follow this sequence for the best learning experience
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            {learningModules.map((module, index) => (
              <div key={module.id} className="flex items-center">
                <div className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{module.title}</p>
                </div>
                {index < learningModules.length - 1 && (
                  <div className="hidden md:block mx-4">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Practice?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              After learning the fundamentals, apply your knowledge in our practice environment
            </p>
            <button
              onClick={() => setCurrentView('practice')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <Target className="w-4 h-4" />
              <span>Go to Practice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnView;

