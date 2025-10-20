import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { LEARNING_MODULES } from './learningData';
import { 
  getLearningProgress, 
  initializeLearningProgress,
  LearningProgressRow 
} from '../../utils/learningProgress';
import { processDelayedReviewsAndUnlocks } from '../../utils/assignments';
import { CheckCircle, Lock, Play, ArrowLeft, BookOpen } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ModuleListProps {
  onModuleSelect: (moduleId: string) => void;
}

const ModuleList: React.FC<ModuleListProps> = ({ onModuleSelect }) => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [progressRows, setProgressRows] = useState<LearningProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');

  useEffect(() => {
    if (!user) return;
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

    // Process any delayed unlocks
    await processDelayedReviewsAndUnlocks(user.id);

    // Load progress
    const progress = await getLearningProgress(user.id);
    setProgressRows(progress);
    
    setLoading(false);
  };

  const handleModuleClick = async (module: typeof LEARNING_MODULES[0]) => {
    if (!user?.id) return;

    const moduleProgress = progressRows.find(p => p.module_id === module.id);
    const isCompleted = moduleProgress?.status === 'completed';
    
    // For new users: Check if previous modules are completed
    if (userType === 'new' && module.order > 1) {
      const previousModule = LEARNING_MODULES.find(m => m.order === module.order - 1);
      if (previousModule) {
        const prevProgress = progressRows.find(p => p.module_id === previousModule.id);
        if (prevProgress?.status !== 'completed') {
          // Module is locked
          return;
        }
      }
    }

    // Initialize progress if first time
    if (!moduleProgress || moduleProgress.status === 'not_started') {
      await initializeLearningProgress(user.id, module.id);
    }

    // Navigate to module
    onModuleSelect(module.id);
  };

  const getModuleStatus = (module: typeof LEARNING_MODULES[0]) => {
    const moduleProgress = progressRows.find(p => p.module_id === module.id);
    
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
    const previousModule = LEARNING_MODULES.find(m => m.order === module.order - 1);
    if (previousModule) {
      const prevProgress = progressRows.find(p => p.module_id === previousModule.id);
      if (prevProgress?.status === 'completed') {
        return 'not_started'; // Unlocked
      }
    }

    return 'locked';
  };

  const getModuleViewId = (moduleId: string): string => {
    // Map module IDs to their view IDs - based on actual module IDs in learningData.ts
    const moduleToViewMap: Record<string, string> = {
      'module-1-core-learning': 'core-learning',
      'module-2-project-initiation': 'project-initiation',
      'module-3-stakeholder-mapping': 'stakeholder-mapping',
      'module-4-elicitation': 'elicitation',
      'module-5-process-mapping': 'process-mapper',
      'module-6-requirements-engineering': 'requirements-engineering',
      'module-7-solution-options': 'solution-options',
      'module-8-documentation': 'documentation',
      'module-9-design': 'design-hub',
      'module-10-mvp': 'mvp-hub',
      'module-11-agile-scrum': 'scrum-essentials'
    };
    return moduleToViewMap[moduleId] || 'core-learning';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
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
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Learning Journey
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your path to becoming a skilled Business Analyst
            </p>
          </div>
        </div>
      </div>

      {/* Pathway Container */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="relative">
          {/* Vertical Path Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-cyan-200 to-indigo-200 dark:from-blue-800 dark:via-cyan-800 dark:to-indigo-800 rounded-full" />

          {/* Learning Modules */}
          <div className="space-y-16">
            {LEARNING_MODULES.map((module, index) => {
              const status = getModuleStatus(module);
              const isLocked = status === 'locked';
              const isCompleted = status === 'completed';
              const isInProgress = status === 'in_progress';
              const isClickable = !isLocked || userType === 'existing';

              console.log(`Module ${module.order} (${module.id}): status=${status}, isCompleted=${isCompleted}, isInProgress=${isInProgress}`);

              // Alternate left and right
              const isLeft = index % 2 === 0;

              return (
                <div key={module.id} className="relative">
                  {/* Module Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    <button
                      onClick={() => {
                        if (isClickable) {
                          const viewId = getModuleViewId(module.id);
                          setCurrentView(viewId as any);
                        }
                      }}
                      disabled={isLocked && userType === 'new'}
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                        transition-all duration-300 transform hover:scale-110
                        ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' : ''}
                        ${isInProgress ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 animate-pulse' : ''}
                        ${status === 'not_started' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg border-4 border-blue-500' : ''}
                        ${isLocked ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 shadow-lg border-4 border-gray-300 dark:border-gray-600 cursor-not-allowed' : ''}
                        ${!isLocked && !isCompleted && !isInProgress ? 'cursor-pointer' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <span>{module.order}</span>
                      )}
                    </button>
                    {isLocked && (
                      <Lock className="w-4 h-4 absolute -top-1 -right-1 text-gray-500 bg-white dark:bg-gray-800 rounded-full p-0.5" />
                    )}
                  </div>

                  {/* Module Card */}
                  <div className={`${isLeft ? 'pr-[55%]' : 'pl-[55%]'}`}>
                    <div
                      className={`
                        bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6
                        border-2 transition-all duration-300
                        ${isCompleted ? 'border-green-500' : ''}
                        ${isInProgress ? 'border-orange-500' : ''}
                        ${status === 'not_started' || isLocked ? 'border-blue-500' : ''}
                        ${isClickable ? 'hover:shadow-2xl hover:scale-105 cursor-pointer' : ''}
                      `}
                      onClick={() => {
                        if (isClickable) {
                          const viewId = getModuleViewId(module.id);
                          setCurrentView(viewId as any);
                        }
                      }}
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${isInProgress ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                          ${status === 'not_started' || isLocked ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        `}>
                          {isCompleted ? '✓ Completed' : isInProgress ? '▶ In Progress' : isLocked ? '🔒 Locked' : 'Start'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Module {module.order}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        <span className="text-blue-600 dark:text-blue-400">{module.order}.</span> {module.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {module.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        {!isLocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const viewId = getModuleViewId(module.id);
                              setCurrentView(viewId as any);
                            }}
                            className={`
                              flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm
                              transition-all duration-200
                              ${isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : ''}
                              ${isInProgress ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                              ${status === 'not_started' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                            `}
                          >
                            <Play className="w-4 h-4" />
                            <span>{isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start Learning'}</span>
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

export default ModuleList;











