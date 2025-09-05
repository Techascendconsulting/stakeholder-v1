import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { FoundationProgressService, FoundationStep } from '../../lib/foundationProgressService';
import { ChevronLeft, ChevronRight, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { BusinessContextStep } from '../Foundation/BusinessContextStep';
import { WhyBAsExistStep } from '../Foundation/WhyBAsExistStep';
import { HowProjectsRunStep } from '../Foundation/HowProjectsRunStep';

interface FoundationWizardViewProps {
  initialStep?: string;
}

export const FoundationWizardView: React.FC<FoundationWizardViewProps> = ({ initialStep }) => {
  const { user } = useAuth();
  const { setCurrentView } = useApp();
  const [steps, setSteps] = useState<FoundationStep[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadProgress = async () => {
      try {
        setLoading(true);
        
        // Get all foundation steps
        const allSteps = FoundationProgressService.getFoundationSteps();
        
        // Get completed steps from database
        const completedSteps = await FoundationProgressService.getCompletedSteps(user.id);
        
        // Update unlock status based on completion
        const updatedSteps = FoundationProgressService.updateStepUnlockStatus(allSteps, completedSteps);
        setSteps(updatedSteps);
        
        // Determine current step
        const currentStep = initialStep || FoundationProgressService.getCurrentStep(updatedSteps);
        setCurrentStepId(currentStep || 'business-context');
        
        // Calculate progress
        const completedCount = completedSteps.length;
        const totalSteps = allSteps.length;
        setProgress((completedCount / totalSteps) * 100);
        
      } catch (error) {
        console.error('Error loading foundation progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user?.id, initialStep]);

  const handleStepComplete = async (stepId: string, quizScore?: number, taskData?: any) => {
    if (!user?.id) return;
    
    try {
      await FoundationProgressService.markStepCompleted(user.id, stepId, quizScore, taskData);
      
      // Reload progress
      const completedSteps = await FoundationProgressService.getCompletedSteps(user.id);
      const updatedSteps = FoundationProgressService.updateStepUnlockStatus(steps, completedSteps);
      setSteps(updatedSteps);
      
      // Calculate new progress
      const completedCount = completedSteps.length;
      const totalSteps = steps.length;
      setProgress((completedCount / totalSteps) * 100);
      
      // Check if foundation is complete
      if (FoundationProgressService.isFoundationComplete(completedSteps)) {
        // Unlock project brief
        await FoundationProgressService.markStepCompleted(user.id, 'project-brief-unlock');
        setCurrentView('project-brief');
        return;
      }
      
      // Move to next step
      const nextStep = FoundationProgressService.getCurrentStep(updatedSteps);
      if (nextStep) {
        setCurrentStepId(nextStep);
      }
      
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep.isUnlocked) {
        setCurrentStepId(nextStep.id);
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex > 0) {
      setCurrentStepId(steps[currentIndex - 1].id);
    }
  };

  const currentStep = steps.find(step => step.id === currentStepId);
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  const canGoNext = currentIndex < steps.length - 1 && steps[currentIndex + 1]?.isUnlocked;
  const canGoPrevious = currentIndex > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Foundation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Foundation Journey</h1>
              <p className="text-gray-600">Master the fundamentals before diving into projects</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="text-lg font-semibold text-purple-600">{Math.round(progress)}%</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step.isCompleted 
                    ? 'bg-green-500 text-white' 
                    : step.isUnlocked 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-300 text-gray-500'
                  }
                `}>
                  {step.isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : step.isUnlocked ? (
                    index + 1
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-2
                    ${step.isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStep && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Step Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
                <div className="text-sm text-gray-500">
                  Step {currentIndex + 1} of {steps.length}
                </div>
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {currentStep.cluster.replace('-', ' ')} • {currentStep.type}
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {currentStep.type === 'content' && (
                <ContentStep 
                  stepId={currentStep.id} 
                  onComplete={() => handleStepComplete(currentStep.id)}
                />
              )}
              {currentStep.type === 'quiz' && (
                <QuizStep 
                  stepId={currentStep.id} 
                  onComplete={(score) => handleStepComplete(currentStep.id, score)}
                />
              )}
              {currentStep.type === 'task' && (
                <TaskStep 
                  stepId={currentStep.id} 
                  onComplete={(data) => handleStepComplete(currentStep.id, undefined, data)}
                />
              )}
              {currentStep.type === 'reflection' && (
                <ReflectionStep 
                  stepId={currentStep.id} 
                  onComplete={(data) => handleStepComplete(currentStep.id, undefined, data)}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className={`
                  flex items-center px-4 py-2 rounded-lg font-medium transition-colors
                  ${canGoPrevious 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="flex items-center space-x-2">
                {currentStep.isCompleted && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`
                  flex items-center px-4 py-2 rounded-lg font-medium transition-colors
                  ${canGoNext 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Content step component that renders the appropriate content based on stepId
const ContentStep: React.FC<{ stepId: string; onComplete: () => void }> = ({ stepId, onComplete }) => {
  switch (stepId) {
    case 'business-context':
      return <BusinessContextStep onComplete={onComplete} />;
    case 'why-bas-exist':
      return <WhyBAsExistStep onComplete={onComplete} />;
    case 'how-projects-run':
      return <HowProjectsRunStep onComplete={onComplete} />;
    default:
      return (
        <div>
          <p>Content for {stepId} will be implemented here.</p>
          <button 
            onClick={onComplete}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Mark as Complete
          </button>
        </div>
      );
  }
};

const QuizStep: React.FC<{ stepId: string; onComplete: (score: number) => void }> = ({ stepId, onComplete }) => {
  return (
    <div>
      <p>Quiz for {stepId} will be implemented here.</p>
      <button 
        onClick={() => onComplete(85)}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
      >
        Complete Quiz
      </button>
    </div>
  );
};

const TaskStep: React.FC<{ stepId: string; onComplete: (data: any) => void }> = ({ stepId, onComplete }) => {
  return (
    <div>
      <p>Task for {stepId} will be implemented here.</p>
      <button 
        onClick={() => onComplete({ completed: true })}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
      >
        Complete Task
      </button>
    </div>
  );
};

const ReflectionStep: React.FC<{ stepId: string; onComplete: (data: any) => void }> = ({ stepId, onComplete }) => {
  return (
    <div>
      <p>Reflection for {stepId} will be implemented here.</p>
      <button 
        onClick={() => onComplete({ reflection: 'completed' })}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
      >
        Complete Reflection
      </button>
    </div>
  );
};
