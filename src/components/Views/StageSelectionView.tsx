import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ArrowRight, CheckCircle, Target } from 'lucide-react';

const StageSelectionView: React.FC = () => {
  const { selectedProject, setCurrentView } = useApp();
  const [selectedStage, setSelectedStage] = useState<string>('');

  const stages = [
    { id: 'initiation', name: 'Project Initiation', description: 'Understand the project goals and initial requirements' },
    { id: 'discovery', name: 'Discovery & Analysis', description: 'Deep dive into stakeholder needs and pain points' },
    { id: 'requirements', name: 'Requirements Definition', description: 'Document detailed requirements and acceptance criteria' },
    { id: 'solution', name: 'Solution Design', description: 'Define the solution approach and architecture' },
    { id: 'delivery', name: 'Delivery Planning', description: 'Plan sprints, epics, and user stories' }
  ];

  const handleContinue = () => {
    if (selectedStage) {
      // Save the selected stage to localStorage
      localStorage.setItem('selectedMeetingStage', selectedStage);
      // Go to stakeholders selection
      setCurrentView('stakeholders');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Select Meeting Stage
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Choose which stage of the project you want to focus on during your stakeholder conversations.
          </p>
        </div>

        {/* Project Context */}
        {selectedProject && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Project: {selectedProject.name}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {selectedProject.challenge}
            </p>
          </div>
        )}

        {/* Stage Options */}
        <div className="space-y-4 mb-8">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                selectedStage === stage.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                    {stage.name}
                    {selectedStage === stage.id && (
                      <CheckCircle className="w-5 h-5 text-blue-500 ml-2" />
                    )}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {stage.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedStage}
            className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
              selectedStage
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Continue to Stakeholders</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageSelectionView;

