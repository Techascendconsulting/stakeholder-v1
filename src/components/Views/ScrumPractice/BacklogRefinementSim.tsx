import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, User, ClipboardList, Play, CheckCircle, Lock, Eye } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';

interface RefinementTrial {
  id: number;
  title: string;
  description: string;
  story: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  locked: boolean;
}

export const BacklogRefinementSim: React.FC = () => {
  const { setCurrentView } = useApp();
  const [trials, setTrials] = useState<RefinementTrial[]>([
    {
      id: 1,
      title: "Basic ID Upload Story",
      description: "Watch the AI BA refine a simple customer ID upload requirement with the development team.",
      story: "As a customer, I want to upload my ID online so that I can complete my account verification.",
      difficulty: 'Beginner',
      completed: false,
      locked: false
    },
    {
      id: 2,
      title: "Complex File Validation",
      description: "Observe how the AI BA handles detailed questions about file formats, size limits, and error handling.",
      story: "As a customer, I want to upload my ID online so that I can complete my account verification.",
      difficulty: 'Intermediate',
      completed: false,
      locked: true
    },
    {
      id: 3,
      title: "Edge Cases & Business Rules",
      description: "See how the AI BA navigates complex edge cases, fraud detection, and business rule discussions.",
      story: "As a customer, I want to upload my ID online so that I can complete my account verification.",
      difficulty: 'Advanced',
      completed: false,
      locked: true
    }
  ]);

  const [completedTrials, setCompletedTrials] = useState(0);
  const [canPractice, setCanPractice] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    const savedTrials = localStorage.getItem('refinement_trials_progress');
    if (savedTrials) {
      const parsedTrials = JSON.parse(savedTrials);
      setTrials(parsedTrials);
      
      const completed = parsedTrials.filter((trial: RefinementTrial) => trial.completed).length;
      setCompletedTrials(completed);
      setCanPractice(completed >= 3);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('refinement_trials_progress', JSON.stringify(trials));
    
    const completed = trials.filter(trial => trial.completed).length;
    setCompletedTrials(completed);
    setCanPractice(completed >= 3);
  }, [trials]);

  const startTrial = (trialId: number) => {
    // TODO: Launch the refinement meeting simulation
    console.log('Starting refinement trial:', trialId);
    
    // Mark trial as completed (for demo purposes)
    setTrials(prev => prev.map(trial => 
      trial.id === trialId ? { ...trial, completed: true } : trial
    ));
  };

  const startPractice = () => {
    // TODO: Launch interactive refinement where user is the BA
    console.log('Starting interactive refinement practice');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unlockNextTrial = (trialId: number) => {
    setTrials(prev => prev.map(trial => 
      trial.id === trialId + 1 ? { ...trial, locked: false } : trial
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('agile-practice')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Backlog Refinement Simulation</h1>
                <p className="text-sm text-gray-600">Learn by watching AI team members refine user stories</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('scrum-essentials')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Review Scrum Essentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-purple-900">Learning Progress</h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{completedTrials}/3</div>
                <div className="text-sm text-purple-700">Trials Completed</div>
              </div>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(completedTrials / 3) * 100}%` }}
              ></div>
            </div>
            <p className="text-purple-800 mt-4">
              Complete 3 observation trials to unlock interactive practice mode where you'll lead refinement as the BA.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Observation Trials */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Observation Trials</h3>
            <div className="space-y-4">
              {trials.map((trial) => (
                <div key={trial.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{trial.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(trial.difficulty)}`}>
                          {trial.difficulty}
                        </span>
                        {trial.completed && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {trial.locked && (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{trial.description}</p>
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700 font-medium mb-1">User Story:</p>
                        <p className="text-sm text-gray-600 italic">"{trial.story}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {trial.locked ? (
                      <button
                        disabled
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Complete previous trial</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startTrial(trial.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 rounded-lg font-medium transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{trial.completed ? 'Watch Again' : 'Watch Simulation'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Interactive Practice</h3>
              </div>
              
              {canPractice ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Great! You've completed all observation trials. Now it's your turn to lead a refinement meeting as the BA.
                  </p>
                  <button
                    onClick={startPractice}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 rounded-lg font-medium transition-all duration-200"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Practice</span>
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Complete all 3 observation trials to unlock interactive practice mode.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span>Locked until {3 - completedTrials} more trials completed</span>
                  </div>
                </div>
              )}
            </div>

            {/* Learning Resources */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ClipboardList className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Learning Resources</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Need a refresher? Review the backlog refinement fundamentals before starting.
              </p>
              <button
                onClick={() => setCurrentView('scrum-essentials')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 rounded-lg font-medium transition-all duration-200"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Review Essentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklogRefinementSim;
