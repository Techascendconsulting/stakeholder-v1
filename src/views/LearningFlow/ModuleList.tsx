import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, PlayCircle, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LEARNING_MODULES, Module } from './learningData';
import { 
  getLearningProgress, 
  initializeLearningProgress,
  getModuleCompletionPercentage,
  LearningProgressRow 
} from '../../utils/learningProgress';
import { processDelayedReviewsAndUnlocks, getLatestAssignment, getTimeUntilUnlock, formatTimeRemaining } from '../../utils/assignments';

interface ModuleListProps {
  onModuleSelect: (moduleId: string) => void;
}

const ModuleList: React.FC<ModuleListProps> = ({ onModuleSelect }) => {
  const { user } = useAuth();
  const [progressRows, setProgressRows] = useState<LearningProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadProgress = async () => {
      try {
        // Process any delayed unlocks first (24-hour check)
        await processDelayedReviewsAndUnlocks(user.id);
        
        // Try to load existing progress
        let progress = await getLearningProgress(user.id);
        
        // If no progress exists, initialize it
        if (progress.length === 0) {
          const moduleIds = LEARNING_MODULES.map(m => m.id);
          await initializeLearningProgress(user.id, moduleIds);
          progress = await getLearningProgress(user.id);
        }

        setProgressRows(progress);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
    
    // Refresh progress every minute to update countdown timers
    const interval = setInterval(() => {
      loadProgress();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  const getColorScheme = (color: string) => {
    const schemes: Record<string, any> = {
      blue: {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'bg-blue-100 dark:bg-blue-900/40'
      },
      purple: {
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-700 dark:text-purple-300',
        icon: 'bg-purple-100 dark:bg-purple-900/40'
      },
      green: {
        gradient: 'from-green-500 to-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        icon: 'bg-green-100 dark:bg-green-900/40'
      }
    };
    return schemes[color] || schemes.blue;
  };

  const handleModuleClick = (module: Module) => {
    const moduleProgress = progressRows.find(p => p.module_id === module.id);
    if (moduleProgress && moduleProgress.status !== 'locked') {
      onModuleSelect(module.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Your Learning Journey
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Master Business Analysis one topic at a time. Complete lessons in order to unlock the next module.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {progressRows.filter(m => m.status === 'completed').length} / {LEARNING_MODULES.length} modules completed
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${(progressRows.filter(m => m.status === 'completed').length / LEARNING_MODULES.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEARNING_MODULES.map((module, index) => {
            const moduleProgress = progressRows.find(p => p.module_id === module.id);
            const colors = getColorScheme(module.color);
            const isLocked = moduleProgress?.status === 'locked';
            const isCompleted = moduleProgress?.status === 'completed';
            const completion = getModuleCompletionPercentage(
              moduleProgress || null, 
              module.lessons.length
            );

            return (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module)}
                className={`
                  relative rounded-xl border-2 p-6 transition-all duration-200
                  ${isLocked 
                    ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed' 
                    : `${colors.bg} ${colors.border} cursor-pointer hover:shadow-xl hover:scale-105`
                  }
                `}
              >
                {/* Lock Badge */}
                {isLocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                )}

                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 ${colors.icon} rounded-xl flex items-center justify-center mb-4 text-3xl`}>
                  {module.icon}
                </div>

                {/* Content */}
                <h3 className={`text-xl font-bold mb-2 ${isLocked ? 'text-gray-500 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                  {module.title}
                </h3>
                
                <p className={`text-sm mb-4 ${isLocked ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {module.description}
                </p>

                {/* Progress Bar */}
                {!isLocked && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>{completion}% complete</span>
                      <span>{module.lessons.length} lessons</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action */}
                {isLocked ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>Complete previous topic first</span>
                  </div>
                ) : isCompleted ? (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <div className={`flex items-center space-x-2 text-sm ${colors.text} font-medium`}>
                    {completion > 0 ? (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        <span>Continue Learning</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>Start Learning</span>
                      </>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleList;

