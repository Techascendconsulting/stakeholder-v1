import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, CheckCircle, Play, ArrowRight } from 'lucide-react';

/**
 * StakeholderConversationsFlow
 * A dedicated view showing the 3-step workflow for stakeholder conversations
 */
const StakeholderConversationsFlow: React.FC = () => {
  const { setCurrentView, selectedProject } = useApp();
  const { user } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Load completed steps from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('stakeholder-flow-completed');
    if (saved) {
      setCompletedSteps(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleStepClick = (stepNumber: number, viewId: string) => {
    // Mark previous steps as completed
    const newCompleted = new Set(completedSteps);
    for (let i = 1; i < stepNumber; i++) {
      newCompleted.add(i);
    }
    setCompletedSteps(newCompleted);
    sessionStorage.setItem('stakeholder-flow-completed', JSON.stringify(Array.from(newCompleted)));
    
    // Navigate to the view
    setCurrentView(viewId as any);
  };

  const steps = [
    {
      number: 1,
      title: 'Select Stakeholders',
      description: 'Choose which stakeholders you want to interview based on their roles and relevance to the project.',
      icon: '👥',
      estimatedTime: '5-10 min',
      viewId: 'stakeholders'
    },
    {
      number: 2,
      title: 'Conduct Meeting',
      description: 'Have AI-powered conversations with your selected stakeholders to gather requirements and understand pain points. You can choose your meeting format (voice or transcript) when you start.',
      icon: '💬',
      estimatedTime: '30-45 min',
      viewId: 'meeting-mode-selection'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Back Button */}
          <button
            onClick={() => setCurrentView('project-journey')}
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Project Journey</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Stakeholder Conversations
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedProject ? `Project: ${selectedProject.name}` : 'Complete the 3-step meeting workflow'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 border-2 border-green-300 dark:border-green-600 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              💬
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Complete Meeting Workflow
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Follow these 3 steps to conduct stakeholder interviews. Each step builds on the previous one.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Container */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.number);
            const isLocked = step.number > 1 && !completedSteps.has(step.number - 1);
            const canClick = !isLocked;

            return (
              <div
                key={step.number}
                className={`
                  relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8
                  border-2 transition-all duration-300
                  ${isCompleted ? 'border-green-500' : 'border-green-300 dark:border-green-700'}
                  ${canClick ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                `}
                onClick={() => canClick ? handleStepClick(step.number, step.viewId) : undefined}
              >
                {/* Step Number and Status */}
                <div className="flex items-start space-x-6">
                  {/* Step Circle */}
                  <div className="flex-shrink-0">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold
                      transition-all duration-300
                      ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-4 border-green-500'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <span>{step.icon}</span>
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    {/* Title and Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        <span className="text-green-600 dark:text-green-400">Step {step.number}:</span> {step.title}
                      </h3>
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}
                      `}>
                        {isCompleted ? '✓ Completed' : isLocked ? '🔒 Locked' : '▶ Ready'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ⏱️ {step.estimatedTime}
                      </span>
                      {canClick ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepClick(step.number, step.viewId);
                          }}
                          className={`
                            flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-sm
                            transition-all duration-200
                            ${isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : 'bg-green-600 text-white hover:bg-green-700'}
                          `}
                        >
                          <Play className="w-4 h-4" />
                          <span>{isCompleted ? 'Review Step' : 'Start Step'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                          Complete previous step to unlock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connector Arrow (between steps) */}
                {index < steps.length - 1 && (
                  <div className="absolute -bottom-3 left-8 w-0.5 h-6 bg-green-300 dark:bg-green-700"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StakeholderConversationsFlow;

