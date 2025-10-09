import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { practiceModules } from './practiceData';
import { getAllPracticeProgress, initializePracticeProgress } from '../../utils/practiceProgress';
import type { PracticeProgress } from '../../utils/practiceProgress';
import { CheckCircle, Lock, Play, ArrowLeft } from 'lucide-react';

const PracticeModuleList: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [progress, setProgress] = useState<Record<string, PracticeProgress>>({});
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

    // Load practice progress
    const progressData = await getAllPracticeProgress(user.id);
    setProgress(progressData);
    
    setLoading(false);
  };

  const handleModuleClick = async (module: typeof practiceModules[0]) => {
    if (!user?.id) return;

    const moduleProgress = progress[module.id];
    const isCompleted = moduleProgress?.status === 'completed';
    const isInProgress = moduleProgress?.status === 'in_progress';
    
    // For new users: Check if previous modules are completed
    if (userType === 'new' && module.order > 1) {
      const previousModule = practiceModules.find(m => m.order === module.order - 1);
      if (previousModule) {
        const prevProgress = progress[previousModule.id];
        if (prevProgress?.status !== 'completed') {
          // Module is locked
          return;
        }
      }
    }

    // Initialize progress if first time
    if (!moduleProgress || moduleProgress.status === 'not_started') {
      await initializePracticeProgress(user.id, module.id);
    }

    // Navigate to practice view
    setCurrentView(module.viewId as any);
  };

  const getModuleStatus = (module: typeof practiceModules[0]) => {
    const moduleProgress = progress[module.id];
    
    if (moduleProgress?.status === 'completed') {
      return 'completed';
    }
    
    if (moduleProgress?.status === 'in_progress') {
      return 'in_progress';
    }

    // For existing users: all unlocked
    if (userType === 'existing') {
      return 'not_started';
    }

    // For new users: check if locked
    if (module.order === 1) {
      return 'not_started'; // First module always unlocked
    }

    // Check if previous module is completed
    const previousModule = practiceModules.find(m => m.order === module.order - 1);
    if (previousModule) {
      const prevProgress = progress[previousModule.id];
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Practice Journey
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Master BA skills through hands-on practice
            </p>
          </div>
        </div>
      </div>

      {/* Pathway Container */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative">
          {/* Vertical Path Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 rounded-full" />

          {/* Practice Modules */}
          <div className="space-y-16">
            {practiceModules.map((module, index) => {
              const status = getModuleStatus(module);
              const isLocked = status === 'locked';
              const isCompleted = status === 'completed';
              const isInProgress = status === 'in_progress';
              const isClickable = !isLocked || userType === 'existing'; // Existing users can click all

              // Alternate left and right
              const isLeft = index % 2 === 0;

              return (
                <div key={module.id} className="relative">
                  {/* Module Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <button
                      onClick={() => isClickable && handleModuleClick(module)}
                      disabled={isLocked && userType === 'new'}
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                        transition-all duration-300 transform hover:scale-110
                        ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' : ''}
                        ${isInProgress ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 animate-pulse' : ''}
                        ${status === 'not_started' ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-lg border-4 border-purple-500' : ''}
                        ${isLocked ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {isLocked ? (
                        <Lock className="w-6 h-6" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <span>{module.order}</span>
                      )}
                    </button>
                  </div>

                  {/* Module Card */}
                  <div className={`${isLeft ? 'pr-[55%]' : 'pl-[55%]'}`}>
                    <div
                      className={`
                        bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6
                        border-2 transition-all duration-300
                        ${isCompleted ? 'border-green-500' : ''}
                        ${isInProgress ? 'border-orange-500' : ''}
                        ${status === 'not_started' ? 'border-purple-500' : ''}
                        ${isLocked ? 'border-gray-300 dark:border-gray-700 opacity-60' : ''}
                        ${isClickable ? 'hover:shadow-2xl hover:scale-105 cursor-pointer' : ''}
                      `}
                      onClick={() => isClickable && handleModuleClick(module)}
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${isInProgress ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                          ${status === 'not_started' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                          ${isLocked ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' : ''}
                        `}>
                          {isCompleted ? '✓ Completed' : isInProgress ? '▶ In Progress' : isLocked ? '🔒 Locked' : 'Start'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {module.difficulty}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        <span className="text-purple-600 dark:text-purple-400">{module.order}.</span> {module.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {module.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ⏱️ {module.estimatedTime}
                        </span>
                        {!isLocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModuleClick(module);
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
                            <span>{isCompleted ? 'Practice Again' : isInProgress ? 'Continue' : 'Start Practice'}</span>
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
    </div>
  );
};

export default PracticeModuleList;

