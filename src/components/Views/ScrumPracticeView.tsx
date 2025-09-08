import React, { useState } from 'react';
import { ArrowLeft, FileText, Users, Calendar, Clock, BarChart3, RotateCcw } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import BacklogRefinementSim from './ScrumPractice/BacklogRefinementSim';

const getSections = (setActiveView: (view: 'main' | 'backlog-refinement') => void) => [
  {
    title: "Requirement Documentation",
    description: "Learn how to write user stories, define acceptance criteria, and prepare backlog items for refinement.",
    icon: FileText,
    onClick: () => console.log("Navigate to documentation")
  },
  {
    title: "Backlog Refinement",
    description: "Practice shaping vague ideas into actionable user stories with developers and stakeholders.",
    icon: Users,
    onClick: () => setActiveView('backlog-refinement')
  },
  {
    title: "Sprint Planning",
    description: "Explore how teams commit to work for the sprint using prioritised backlog items.",
    icon: Calendar,
    onClick: () => console.log("Navigate to planning")
  },
  {
    title: "Daily Scrum",
    description: "Understand how teams stay aligned and surface blockers in 15-minute daily meetings.",
    icon: Clock,
    onClick: () => console.log("Navigate to daily")
  },
  {
    title: "Sprint Review",
    description: "Learn how to present working increments and gather feedback from stakeholders.",
    icon: BarChart3,
    onClick: () => console.log("Navigate to review")
  },
  {
    title: "Sprint Retrospective",
    description: "Reflect on team performance and discover how to improve collaboration and delivery.",
    icon: RotateCcw,
    onClick: () => console.log("Navigate to retrospective")
  }
];

export const ScrumPracticeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [activeView, setActiveView] = useState<'main' | 'backlog-refinement'>('main');

  const sections = getSections(setActiveView);

  // Show Backlog Refinement simulation if active
  if (activeView === 'backlog-refinement') {
    return <BacklogRefinementSim onBack={() => setActiveView('main')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('practice')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Scrum Practice</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Practice Scrum skills in realistic scenarios</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('scrum-essentials')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Review Scrum Essentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <section.icon className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{section.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{section.description}</p>
              <button
                onClick={section.onClick}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 rounded-lg font-medium transition-all duration-200"
              >
                Go to {section.title}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrumPracticeView;
