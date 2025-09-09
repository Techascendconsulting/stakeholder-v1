import React, { useState } from 'react';
import { ArrowLeft, FileText, Users, Calendar, Clock, BarChart3, RotateCcw } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import BacklogRefinementSim from './ScrumPractice/BacklogRefinementSim';
import { SprintPlanningSim } from './ScrumPractice/SprintPlanningSim';

const getSections = (handleSetActiveView: (view: 'main' | 'backlog-refinement' | 'sprint-planning') => void) => [
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
    onClick: () => handleSetActiveView('backlog-refinement')
  },
  {
    title: "Sprint Planning",
    description: "Explore how teams commit to work for the sprint using prioritised backlog items.",
    icon: Calendar,
    onClick: () => {
      console.log('🎯 Sprint Planning button clicked, setting activeView to sprint-planning');
      handleSetActiveView('sprint-planning');
    }
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
  const [activeView, setActiveView] = useState<'main' | 'backlog-refinement' | 'sprint-planning'>('main');
  
  console.log('🎯 ScrumPracticeView rendered with activeView:', activeView);

  const handleSetActiveView = (view: 'main' | 'backlog-refinement' | 'sprint-planning') => {
    console.log('🎯 setActiveView called with:', view);
    setActiveView(view);
  };
  
  const sections = getSections(handleSetActiveView);

  // Show Backlog Refinement simulation if active
  if (activeView === 'backlog-refinement') {
    return <BacklogRefinementSim onBack={() => handleSetActiveView('main')} />;
  }

  // Show Sprint Planning simulation if active
  if (activeView === 'sprint-planning') {
    console.log('🎯 Rendering SprintPlanningSim component');
    return <SprintPlanningSim onBack={() => handleSetActiveView('main')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Clean Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('practice')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Scrum Practice</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Practice Scrum skills in realistic scenarios</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('scrum-essentials')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <section.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">{section.description}</p>
              <button
                onClick={section.onClick}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
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
