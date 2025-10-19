import React, { useState } from 'react';
import { ArrowLeft, FileText, Users, Calendar, Clock, BarChart3, RotateCcw } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import BacklogRefinementSim from './ScrumPractice/BacklogRefinementSim';
import { SprintPlanningSim } from './ScrumPractice/SprintPlanningSim';

const getSections = (handleSetActiveView: (view: 'main' | 'backlog-refinement' | 'sprint-planning') => void, setSelectedTheme: (theme: string) => void, setCurrentView: (view: string) => void) => [
  {
    title: "Backlog Refinement",
    description: "Learn how to write user stories, define acceptance criteria, and prepare backlog items for refinement.",
    icon: Users,
    artwork: "🔬⚡",
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
    artwork: "🎯🚀",
    color: "from-pink-500 to-purple-500",
    onClick: () => {
      setSelectedTheme("from-pink-500 to-purple-500");
      console.log('🎯 Sprint Planning button clicked, setting activeView to sprint-planning');
      handleSetActiveView('sprint-planning');
    }
  },
  {
    title: "Daily Scrum",
    description: "Understand how teams stay aligned and surface blockers in 15-minute daily meetings.",
    icon: Clock,
    artwork: "⚡👥",
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
    artwork: "🎊📊",
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
    artwork: "🔄🧠",
    color: "from-teal-500 to-cyan-500",
    onClick: () => {
      setSelectedTheme("from-teal-500 to-cyan-500");
      console.log("Navigate to retrospective");
    }
  },
  {
    title: "Agile Hub",
    description: "Jira-style workspace to create, organize, and track user stories, epics, and sprints in a real Agile environment.",
    icon: BarChart3,
    artwork: "📋✨",
    color: "from-emerald-500 to-green-500",
    onClick: () => {
      setSelectedTheme("from-emerald-500 to-green-500");
      setCurrentView('agile-scrum');
    }
  },
];

export const ScrumPracticeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [activeView, setActiveView] = useState<'main' | 'backlog-refinement' | 'sprint-planning'>('main');
  const [selectedTheme, setSelectedTheme] = useState<string>('from-pink-500 to-purple-600');
  
  console.log('🎯 ScrumPracticeView rendered with activeView:', activeView);

  const handleSetActiveView = (view: 'main' | 'backlog-refinement' | 'sprint-planning') => {
    console.log('🎯 setActiveView called with:', view);
    setActiveView(view);
  };
  
  const sections = getSections(handleSetActiveView, setSelectedTheme, setCurrentView);

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
                onClick={() => setCurrentView('practice-flow')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Back to Practice Journey"
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-blue-700 mx-6 my-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Scrum Practice
          </h1>
          <div className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto space-y-4">
            <p>
              You've just seen how requirements move from analysis and documentation into delivery, where they are shaped and managed through Scrum ceremonies. Now it's time to step inside those ceremonies and see how they actually work in practice.
            </p>
            <p>
              In Agile, requirements don't live in documents alone — they come alive in conversations, planning sessions, and feedback loops. Scrum ceremonies give rhythm to that process. They are where requirements are clarified, prioritised, and inspected as the team delivers working software.
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              In this section, you'll explore:
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Walkthrough</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">guided examples of how Scrum ceremonies play out and the role a BA takes in each.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Practice</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">interactive sessions where you step into a BA's shoes, handling real scenarios that happen inside Sprint Planning, Daily Stand-ups, Refinement, Reviews, and Retrospectives.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Advanced</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">more complex situations where you'll need to apply judgement, negotiation skills, and stakeholder management to keep the team aligned.</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-6 text-sm">
              Scrum ceremonies are not just meetings — they are the heartbeat of Agile delivery. By practising them here, you'll gain the confidence to walk into real Scrum events and know exactly what to do, what to say, and how to add value as a Business Analyst.
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center shadow-lg border-4 border-purple-200 dark:border-purple-700">
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

