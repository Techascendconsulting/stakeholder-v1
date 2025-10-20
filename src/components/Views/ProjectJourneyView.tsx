import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { projectJourneyStages } from '../../views/ProjectFlow/projectJourneyData';
import { getAllProjectJourneyProgress, initializeProjectJourneyProgress } from '../../utils/projectJourneyProgress';
import type { ProjectJourneyProgress } from '../../utils/projectJourneyProgress';
import { CheckCircle, Lock, Play, ArrowLeft, Rocket } from 'lucide-react';

const ProjectJourneyView: React.FC = () => {
  const { setCurrentView, selectedProject } = useApp();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [progress, setProgress] = useState<Record<string, ProjectJourneyProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    // Load user type
    try {
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();
      
      if (userData) {
        setUserType(userData.user_type || 'existing');
      }
    } catch (error) {
      console.error('Failed to load user type:', error);
    }

    // Load project journey progress
    const progressData = await getAllProjectJourneyProgress(user.id);
    setProgress(progressData);
    
    setLoading(false);
  };

  const handleStageClick = async (stage: typeof projectJourneyStages[0]) => {
    if (!user?.id) return;

    const stageProgress = progress[stage.id];
    const isCompleted = stageProgress?.status === 'completed';
    const isInProgress = stageProgress?.status === 'in_progress';
    
    // For new users: Check if previous stages are completed
    if (userType === 'new' && stage.order > 1) {
      const previousStage = projectJourneyStages.find(s => s.order === stage.order - 1);
      if (previousStage) {
        const prevProgress = progress[previousStage.id];
        if (prevProgress?.status !== 'completed') {
          // Stage is locked
          return;
        }
      }
    }

    // Initialize progress if first time
    if (!stageProgress || stageProgress.status === 'not_started') {
      await initializeProjectJourneyProgress(user.id, stage.id);
    }

    // Navigate to stage view
    setCurrentView(stage.viewId as any);
  };

  const getStageStatus = (stage: typeof projectJourneyStages[0]) => {
    const stageProgress = progress[stage.id];
    
    if (stageProgress?.status === 'completed') {
      return 'completed';
    }
    
    if (stageProgress?.status === 'in_progress') {
      return 'in_progress';
    }

    // For existing users: all unlocked
    if (userType === 'existing') {
      return 'not_started';
    }

    // For new users: check if locked
    if (stage.order === 1) {
      return 'not_started'; // First stage always unlocked
    }

    // Check if previous stage is completed
    const previousStage = projectJourneyStages.find(s => s.order === stage.order - 1);
    if (previousStage) {
      const prevProgress = progress[previousStage.id];
      if (prevProgress?.status === 'completed') {
        return 'not_started'; // Unlocked
      }
    }

    return 'locked';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Back Button */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <Rocket className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Project Journey
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedProject ? `Working on: ${selectedProject.name}` : 'Build a complete BA project from start to finish'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Info Banner */}
      {!selectedProject && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 border-2 border-purple-300 dark:border-purple-600 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                💡
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Start Your BA Project Journey
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Follow the stages below to complete a full business analysis project. Each stage builds on the previous one, giving you hands-on experience with real BA work.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pathway Container */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative">
          {/* Vertical Path Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 rounded-full" />

          {/* Project Journey Stages */}
          <div className="space-y-16">
            {projectJourneyStages.map((stage, index) => {
              const status = getStageStatus(stage);
              const isLocked = status === 'locked';
              const isCompleted = status === 'completed';
              const isInProgress = status === 'in_progress';
              const isClickable = !isLocked || userType === 'existing'; // Existing users can click all

              // Alternate left and right
              const isLeft = index % 2 === 0;

              return (
                <div key={stage.id} className="relative">
                  {/* Stage Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    <button
                      onClick={() => isClickable && handleStageClick(stage)}
                      disabled={isLocked && userType === 'new'}
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                        transition-all duration-300 transform hover:scale-110
                        ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' : ''}
                        ${isInProgress ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 animate-pulse' : ''}
                        ${status === 'not_started' ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-lg border-4 border-purple-500' : ''}
                        ${isLocked ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 shadow-lg border-4 border-gray-300 dark:border-gray-600 cursor-not-allowed' : ''}
                        ${!isLocked && !isCompleted && !isInProgress ? 'cursor-pointer' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <span>{stage.icon}</span>
                      )}
                    </button>
                    {isLocked && (
                      <Lock className="w-4 h-4 absolute -top-1 -right-1 text-gray-500 bg-white dark:bg-gray-800 rounded-full p-0.5" />
                    )}
                  </div>

                  {/* Stage Card */}
                  <div className={`${isLeft ? 'pr-[55%]' : 'pl-[55%]'}`}>
                    <div
                      className={`
                        bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6
                        border-2 transition-all duration-300
                        ${isCompleted ? 'border-green-500' : ''}
                        ${isInProgress ? 'border-orange-500' : ''}
                        ${status === 'not_started' || isLocked ? 'border-purple-500' : ''}
                        ${isClickable ? 'hover:shadow-2xl hover:scale-105 cursor-pointer' : ''}
                      `}
                      onClick={() => isClickable && handleStageClick(stage)}
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${isInProgress ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                          ${status === 'not_started' || isLocked ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                        `}>
                          {isCompleted ? '✓ Completed' : isInProgress ? '▶ In Progress' : isLocked ? '🔒 Locked' : 'Ready to Start'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {stage.difficulty}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        <span className="text-purple-600 dark:text-purple-400">{stage.order}.</span> {stage.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {stage.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ⏱️ {stage.estimatedTime}
                        </span>
                        {!isLocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStageClick(stage);
                            }}
                            className={`
                              flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm
                              transition-all duration-200
                              ${isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : ''}
                              ${isInProgress ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                              ${status === 'not_started' ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}
                            `}
                          >
                            <Play className="w-4 h-4" />
                            <span>{isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start Stage'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Help Text */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="text-center py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-200 dark:border-purple-800">
          <p className="text-gray-600 dark:text-gray-400">
            💡 <strong>Tip:</strong> Complete each stage in order to build your BA portfolio. You can always come back to review or update your work.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectJourneyView;
