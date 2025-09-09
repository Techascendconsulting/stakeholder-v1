import React, { useState } from 'react';
import { ArrowLeft, FileText, Users, Calendar, Clock, BarChart3, RotateCcw, Target, Zap, TrendingUp, CheckCircle, Lightbulb, MessageSquare } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import BacklogRefinementSim from './ScrumPractice/BacklogRefinementSim';
import { SprintPlanningSim } from './ScrumPractice/SprintPlanningSim';

const getSections = (handleSetActiveView: (view: 'main' | 'backlog-refinement' | 'sprint-planning') => void, setSelectedTheme: (theme: string) => void) => [
  {
    title: "Requirement Documentation",
    description: "Learn how to write user stories, define acceptance criteria, and prepare backlog items for refinement.",
    icon: FileText,
    artwork: "📋✨",
    color: "from-blue-500 to-cyan-500",
    onClick: () => {
      setSelectedTheme("from-blue-500 to-cyan-500");
      console.log("Navigate to documentation");
    }
  },
  {
    title: "Backlog Refinement",
    description: "Learn how to write user stories, define acceptance criteria, and prepare backlog items for refinement.",
    icon: Users,
    artwork: "🔍💡",
    color: "from-purple-500 to-pink-500",
    onClick: () => {
      setSelectedTheme("from-purple-500 to-pink-500");
      handleSetActiveView('backlog-refinement');
    }
  },
  {
    title: "Sprint Planning",
    description: "Explore how teams commit to work for the sprint using prioritised backlog items.",
    icon: Calendar,
    artwork: "🎯📅",
    color: "from-green-500 to-emerald-500",
    onClick: () => {
      setSelectedTheme("from-green-500 to-emerald-500");
      console.log('🎯 Sprint Planning button clicked, setting activeView to sprint-planning');
      handleSetActiveView('sprint-planning');
    }
  },
  {
    title: "Daily Scrum",
    description: "Understand how teams stay aligned and surface blockers in 15-minute daily meetings.",
    icon: Clock,
    artwork: "☀️👥",
    color: "from-orange-500 to-red-500",
    onClick: () => {
      setSelectedTheme("from-orange-500 to-red-500");
      console.log("Navigate to daily");
    }
  },
  {
    title: "Sprint Review",
    description: "Learn how to present working increments and gather feedback from stakeholders.",
    icon: BarChart3,
    artwork: "🎉📈",
    color: "from-indigo-500 to-blue-500",
    onClick: () => {
      setSelectedTheme("from-indigo-500 to-blue-500");
      console.log("Navigate to review");
    }
  },
  {
    title: "Sprint Retrospective",
    description: "Reflect on team performance and discover how to improve collaboration and delivery.",
    icon: RotateCcw,
    artwork: "🔄💭",
    color: "from-teal-500 to-cyan-500",
    onClick: () => {
      setSelectedTheme("from-teal-500 to-cyan-500");
      console.log("Navigate to retrospective");
    }
  }
];

export const ScrumPracticeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [activeView, setActiveView] = useState<'main' | 'backlog-refinement' | 'sprint-planning'>('main');
  const [selectedTheme, setSelectedTheme] = useState<string>('from-blue-500 to-cyan-500');
  
  console.log('🎯 ScrumPracticeView rendered with activeView:', activeView);

  const handleSetActiveView = (view: 'main' | 'backlog-refinement' | 'sprint-planning') => {
    console.log('🎯 setActiveView called with:', view);
    setActiveView(view);
  };
  
  const sections = getSections(handleSetActiveView, setSelectedTheme);

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

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center justify-center space-x-3">
              <span>🎪</span>
              <span>Scrum Events a Business Analyst Should Learn to Take Part In</span>
              <span>🎪</span>
            </h1>
            <p className="text-lg text-blue-700 dark:text-blue-200 max-w-3xl mx-auto">
              Master the essential Scrum ceremonies and practices that every Business Analyst needs to know. 
              Practice in realistic scenarios with interactive simulations and hands-on exercises.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => (
            <div key={index} className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 text-center">
              {/* Centered Cartoon Icon */}
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg border-4 border-blue-200 dark:border-blue-700">
                  <div className="text-4xl">
                    {section.artwork}
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{section.title}</h2>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{section.description}</p>
              </div>
              
              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={section.onClick}
                  className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${selectedTheme} text-white rounded-md hover:shadow-md transition-all duration-200 font-medium text-sm`}
                >
                  Learn more →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrumPracticeView;
