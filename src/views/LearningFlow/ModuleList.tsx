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
    // TESTING MODE: Allow all clicks (ignore lock status)
    console.log('🖱️ Module card clicked:', module.id, module.title);
    onModuleSelect(module.id);
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

  const completedCount = progressRows.filter(m => m.status === 'completed').length;
  const progressPercentage = (completedCount / LEARNING_MODULES.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-indigo-950/20">
      {/* Hero Header with Glassmorphism */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-blue-600/10 dark:from-purple-400/5 dark:via-indigo-400/5 dark:to-blue-400/5" />
        <div className="absolute inset-0 backdrop-blur-3xl" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)' }} />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-6 shadow-2xl shadow-purple-500/30 dark:shadow-purple-500/20">
              <span className="text-4xl">🎓</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Your Learning Journey
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Master Business Analysis with our structured curriculum. Progress through each module to unlock your potential.
            </p>
          </div>

          {/* Premium Progress Card */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Your Progress</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {completedCount} of {LEARNING_MODULES.length} modules mastered
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {Math.round(progressPercentage)}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Complete</p>
                </div>
              </div>
              
              <div className="relative w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-purple-500/50"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              
              {progressPercentage > 0 && progressPercentage < 100 && (
                <p className="text-center text-sm text-purple-600 dark:text-purple-400 mt-4 font-medium">
                  🔥 Keep going! You're {Math.round(progressPercentage)}% of the way there
                </p>
              )}
              {progressPercentage === 100 && (
                <p className="text-center text-sm text-green-600 dark:text-green-400 mt-4 font-medium">
                  🎉 Congratulations! You've completed the Learning Journey!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Learning Modules
        </h2>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEARNING_MODULES.map((module, index) => {
            const moduleProgress = progressRows.find(p => p.module_id === module.id);
            const colors = getColorScheme(module.color);
            // TESTING MODE: Disable locks so all modules are accessible
            const isLocked = false; // Set to false for testing
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
                  group relative overflow-hidden rounded-2xl transition-all duration-300
                  ${isLocked 
                    ? 'bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed' 
                    : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 hover:border-purple-300 dark:hover:border-purple-700'
                  }
                `}
              >
                {/* Gradient overlay on hover */}
                {!isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-indigo-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-indigo-500/5 group-hover:to-blue-500/5 transition-all duration-300" />
                )}
                
                <div className="relative p-8">
                {/* Status Badge - Top Right */}
                <div className="absolute top-6 right-6">
                  {isLocked && (
                    <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                      <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Locked</span>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 rounded-full shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                      <span className="text-xs font-bold text-white">Completed</span>
                    </div>
                  )}
                </div>

                {/* Module Number Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-xl text-purple-700 dark:text-purple-300 font-bold text-sm border border-purple-200 dark:border-purple-700">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-400/20 dark:to-indigo-400/20 rounded-2xl flex items-center justify-center mb-4 text-4xl group-hover:scale-110 transition-transform duration-300">
                  {module.icon}
                </div>

                {/* Content */}
                <h3 className={`text-2xl font-bold mb-3 ${isLocked ? 'text-gray-500 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                  {module.title}
                </h3>
                
                <p className={`text-sm mb-6 leading-relaxed ${isLocked ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {module.description}
                </p>

                {/* Progress Bar - Modern Design */}
                {!isLocked && !isCompleted && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span>{completion}% Progress</span>
                      </span>
                      <span>{module.lessons.length} lessons</span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${completion}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button/Status */}
                <div className="mt-auto pt-4">
                  {isLocked ? (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 dark:text-gray-500 py-3">
                      <Lock className="w-4 h-4" />
                      <span>Complete previous modules</span>
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20 border border-green-200 dark:border-green-800 rounded-xl py-3 text-sm text-green-700 dark:text-green-300 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed ✨</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:from-purple-500 group-hover:to-indigo-500 text-white rounded-xl py-3 px-4 font-semibold transition-all duration-300 shadow-md group-hover:shadow-xl">
                      {completion > 0 ? (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          <span>Continue</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4" />
                          <span>Start Module</span>
                        </>
                      )}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleList;


