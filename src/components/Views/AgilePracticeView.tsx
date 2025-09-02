import React, { useState } from 'react';
import { ArrowLeft, Zap, Target, Users, Calendar, FileText, BarChart3 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const AgilePracticeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const agileScenarios = [
    {
      id: 'refinement-practice',
      title: 'Story Refinement Practice',
      description: 'Practice running refinement meetings with AI team members',
      icon: Users,
      difficulty: 'Beginner',
      duration: '15-20 min',
      skills: ['Story Writing', 'Refinement', 'Team Collaboration']
    },
    {
      id: 'sprint-planning-practice',
      title: 'Sprint Planning Practice',
      description: 'Practice sprint planning with AI product owners and team',
      icon: Calendar,
      difficulty: 'Intermediate',
      duration: '20-30 min',
      skills: ['Sprint Planning', 'Estimation', 'Capacity Planning']
    },
    {
      id: 'backlog-grooming-practice',
      title: 'Backlog Grooming Practice',
      description: 'Practice organizing and prioritizing product backlog',
      icon: FileText,
      difficulty: 'Beginner',
      duration: '15-20 min',
      skills: ['Backlog Management', 'Prioritization', 'User Stories']
    },
    {
      id: 'retrospective-practice',
      title: 'Retrospective Practice',
      description: 'Practice facilitating team retrospectives',
      icon: BarChart3,
      difficulty: 'Intermediate',
      duration: '15-20 min',
      skills: ['Facilitation', 'Team Dynamics', 'Continuous Improvement']
    }
  ];

  const startScenario = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    // TODO: Launch the specific Agile practice scenario
    console.log('Starting Agile practice scenario:', scenarioId);
  };

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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Agile Practice</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Practice Agile methodologies in safe training scenarios</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('agile-scrum')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Learn Agile Concepts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Practice Agile Skills</h2>
            </div>
            <p className="text-blue-800 dark:text-blue-200 text-lg">
              Apply what you've learned about Agile methodologies in realistic training scenarios. 
              Practice with AI team members to improve your facilitation, story writing, and team collaboration skills.
            </p>
          </div>
        </div>

        {/* Practice Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {agileScenarios.map((scenario) => {
            const IconComponent = scenario.icon;
            return (
              <div
                key={scenario.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {scenario.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        scenario.difficulty === 'Beginner' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {scenario.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {scenario.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ⏱️ {scenario.duration}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills You'll Practice:</h4>
                    <div className="flex flex-wrap gap-2">
                      {scenario.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startScenario(scenario.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Start Practice
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Section */}
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Agile Practice Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Scenarios Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Skills Mastered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hours Practiced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">Beginner</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgilePracticeView;

