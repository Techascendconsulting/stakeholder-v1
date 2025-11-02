import React, { useState } from 'react';
import { ArrowLeft, Zap, Target, Users, Calendar, FileText, BarChart3, Play, CheckCircle, Clock, BookOpen, Workflow, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const AgilePracticeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  // Training exercises based on Scrum Essentials sections
  const scrumTrainingExercises = [
    {
      id: 'scrum-roles-practice',
      title: 'Scrum Roles Practice',
      description: 'Practice working with Product Owner, Scrum Master, and Developers in realistic scenarios',
      icon: Users,
      difficulty: 'Beginner',
      duration: '15-20 min',
      skills: ['Role Understanding', 'Collaboration', 'Communication'],
      section: 'Section 2: Scrum Roles',
      scenario: 'You\'re a BA joining a new Scrum team. Practice introducing yourself and understanding each role\'s responsibilities.'
    },
    {
      id: 'scrum-events-practice',
      title: 'Scrum Events Practice',
      description: 'Practice participating in Daily Scrum, Sprint Planning, Review, and Retrospective',
      icon: Calendar,
      difficulty: 'Intermediate',
      duration: '25-30 min',
      skills: ['Event Facilitation', 'Time Management', 'Team Coordination'],
      section: 'Section 3: Scrum Events',
      scenario: 'Lead a Sprint Planning session where you present user stories and work with the team to estimate and commit to work.'
    },
    {
      id: 'backlog-refinement-practice',
      title: 'Backlog Refinement Practice',
      description: 'Practice the BA\'s key role in making user stories ready for development',
      icon: FileText,
      difficulty: 'Intermediate',
      duration: '20-25 min',
      skills: ['Story Writing', 'Acceptance Criteria', 'Team Collaboration'],
      section: 'Section 5: Backlog Refinement',
      scenario: 'Refine a complex user story with the development team, answering questions and breaking it into smaller pieces.'
    },
    {
      id: 'requirements-docs-practice',
      title: 'Requirements Documentation Practice',
      description: 'Practice writing just-enough documentation for Scrum teams',
      icon: BookOpen,
      difficulty: 'Beginner',
      duration: '15-20 min',
      skills: ['Documentation', 'User Stories', 'Acceptance Criteria'],
      section: 'Section 6: Requirements Documentation',
      scenario: 'Write user stories and acceptance criteria for a new feature, balancing detail with agility.'
    },
    {
      id: 'delivery-flow-practice',
      title: 'End-to-End Delivery Practice',
      description: 'Practice the complete flow from problem exploration to working software',
      icon: Workflow,
      difficulty: 'Advanced',
      duration: '30-35 min',
      skills: ['Process Mapping', 'Stakeholder Management', 'Solution Design'],
      section: 'Section 7: Delivery Flow',
      scenario: 'Take a business problem through the complete BA journey: problem exploration, process mapping, requirements, and delivery.'
    },
    {
      id: 'scrum-artefacts-practice',
      title: 'Scrum Artefacts Practice',
      description: 'Practice working with Product Backlog, Sprint Backlog, and Increments',
      icon: Target,
      difficulty: 'Beginner',
      duration: '15-20 min',
      skills: ['Backlog Management', 'Sprint Planning', 'Definition of Done'],
      section: 'Section 4: Scrum Artefacts',
      scenario: 'Manage a Product Backlog, prepare items for Sprint Planning, and validate completed increments.'
    }
  ];

  const startScenario = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    // TODO: Launch the specific Scrum practice scenario
    console.log('Starting Scrum practice scenario:', scenarioId);
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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Scrum Practice</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Practice Scrum methodologies with AI team members</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('scrum-essentials')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Review Scrum Essentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">Practice Scrum Skills</h2>
            </div>
            <p className="text-purple-800 dark:text-purple-200 text-lg">
              Apply what you've learned from Scrum Essentials in realistic training scenarios. 
              Practice with AI team members to improve your role understanding, event facilitation, and story refinement skills.
            </p>
            <div className="mt-4 p-4 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">Training Focus</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Each exercise is designed to reinforce specific concepts from Scrum Essentials. 
                    Start with beginner exercises and work your way up to advanced scenarios.
                  </p>
                </div>
              </div>
            </div>
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

