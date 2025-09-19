import React from 'react';
import { Target, Zap, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import TrainingUI from './TrainingUI';

const DocumentationView: React.FC = () => {
  const { setCurrentView } = useApp();

  const sections = [
    {
      title: "Practice",
      description: "Practice user stories and acceptance criteria with interactive exercises and feedback.",
      icon: Target,
      artwork: "🎯💪",
      color: "from-purple-600 to-pink-600",
      onClick: () => {
        setCurrentView('user-story-checker');
        // Navigate to TrainingUI with practice view
        localStorage.setItem('trainingUI_view', 'practice');
      }
    },
    {
      title: "Advanced Practice",
      description: "Advanced exercises and complex scenarios for experienced practitioners.",
      icon: Zap,
      artwork: "⚡🔥",
      color: "from-blue-500 to-purple-600",
      onClick: () => {
        setCurrentView('user-story-checker');
        // Navigate to TrainingUI with advanced view
        localStorage.setItem('trainingUI_view', 'advanced');
      }
    },
    {
      title: "Scrum Hub",
      description: "Access the comprehensive Scrum Hub with all agile tools and features.",
      icon: TrendingUp,
      artwork: "🚀📊",
      color: "from-green-600 to-emerald-600",
      onClick: () => {
        setCurrentView('agile-scrum');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Documentation Practice</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Practice user stories and acceptance criteria</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section, index) => (
            <div key={index} className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 text-center">
              {/* Centered Cartoon Icon */}
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center shadow-lg border-4 border-purple-200 dark:border-purple-700">
                  <div className="text-3xl">
                    {section.artwork}
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{section.title}</h2>
              </div>
              
              {/* Description */}
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{section.description}</p>
              </div>
              
              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={section.onClick}
                  className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${section.color} text-white rounded-md hover:shadow-md transition-all duration-200 font-medium text-sm`}
                >
                  Start →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TrainingUI Component */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <TrainingUI />
      </div>
    </div>
  );
};

export default DocumentationView;
