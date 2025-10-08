import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, PlayCircle, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
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
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');

  // Load user type
  useEffect(() => {
    const loadUserType = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setUserType(data.user_type || 'existing');
        }
      } catch (error) {
        console.error('Failed to load user type:', error);
      }
    };

    loadUserType();
  }, [user?.id]);

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

      {/* Modules Section - Horizontal Pathway */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
          Your Learning Path
        </h2>

        {/* Vertical Pathway with Connected Modules */}
        <div className="relative space-y-8">
          {/* Connection Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-200 via-indigo-200 to-blue-200 dark:from-purple-900/40 dark:via-indigo-900/40 dark:to-blue-900/40" />
          
          {LEARNING_MODULES.map((module, index) => {
            const moduleProgress = progressRows.find(p => p.module_id === module.id);
            const colors = getColorScheme(module.color);
            
            // Lock logic based on user type
            const isLocked = userType === 'new' 
              ? (index > 0 && progressRows.find(p => p.module_id === LEARNING_MODULES[index - 1].id)?.status !== 'completed')
              : false; // Existing users: all unlocked
            
            const isCompleted = moduleProgress?.status === 'completed';
            const isInProgress = moduleProgress?.status === 'in_progress' || (moduleProgress && !isCompleted);
            const isNotStarted = !moduleProgress || moduleProgress.status === 'not_started';
            
            const completion = getModuleCompletionPercentage(
              moduleProgress || null, 
              module.lessons.length
            );

            return (
              <div key={module.id} className="relative flex items-start">
                {/* Pathway Node - Circle on the line */}
                <div className="relative z-10 flex-shrink-0">
                  <div 
                    className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 shadow-xl
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 ring-4 ring-green-500/20' 
                        : isInProgress
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 ring-4 ring-orange-500/20'
                        : isLocked
                        ? 'bg-gray-300 dark:bg-gray-700'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6 text-gray-500" />
                    ) : isInProgress ? (
                      <span>{module.icon}</span>
                    ) : (
                      <span className="opacity-60">{module.icon}</span>
                    )}
                  </div>
                </div>

                {/* Module Content Card */}
                <div
                  onClick={() => handleModuleClick(module)}
                  className={`
                    group relative ml-6 flex-1 rounded-2xl p-6 transition-all duration-300
                    ${isLocked 
                      ? 'bg-gray-100/50 dark:bg-gray-800/30 border border-gray-300 dark:border-gray-700 opacity-60 cursor-not-allowed' 
                      : isCompleted
                      ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 border-green-300 dark:border-green-700 cursor-pointer hover:shadow-xl hover:shadow-green-500/10 hover:scale-[1.01]'
                      : isInProgress
                      ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 border-orange-300 dark:border-orange-700 cursor-pointer hover:shadow-xl hover:shadow-orange-500/20 hover:scale-[1.01]'
                      : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:scale-[1.01] hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {/* Hover glow effect */}
                  {!isLocked && isInProgress && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:via-orange-500/5 group-hover:to-orange-500/5 rounded-2xl transition-all duration-300" />
                  )}
                  {!isLocked && isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/3 group-hover:via-green-500/3 group-hover:to-green-500/3 rounded-2xl transition-all duration-300" />
                  )}
                  
                  <div className="relative">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`text-sm font-bold ${
                          isCompleted ? 'text-green-600 dark:text-green-400' :
                          isInProgress ? 'text-orange-600 dark:text-orange-400' :
                          'text-gray-500 dark:text-gray-400'
                        }`}>
                          Module {index + 1}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs font-semibold text-green-700 dark:text-green-300">
                            <CheckCircle className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}
                        {isInProgress && !isCompleted && (
                          <span className="inline-flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full text-xs font-semibold text-orange-700 dark:text-orange-300">
                            <PlayCircle className="w-3 h-3" />
                            <span>In Progress</span>
                          </span>
                        )}
                        {isLocked && (
                          <span className="inline-flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs font-medium text-gray-500">
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${isLocked ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                        {module.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${isLocked ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        {module.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row - Progress & Action */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Progress Info */}
                    <div className="flex items-center space-x-4">
                      {isInProgress && !isCompleted && (
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                            {completion}%
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {module.lessons.length} lessons
                      </span>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isLocked ? (
                        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Complete previous first</span>
                        </div>
                      ) : isCompleted ? (
                        <button className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-semibold hover:bg-green-100 dark:hover:bg-green-900/30 transition-all">
                          <span>Review</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : isInProgress ? (
                        <button className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-bold hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg hover:shadow-xl">
                          <span>Continue</span>
                          <PlayCircle className="w-4 h-4" />
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <button className="flex items-center space-x-2 px-6 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-600 dark:hover:bg-gray-500 transition-all shadow-lg hover:shadow-xl">
                          <span>Start</span>
                          <BookOpen className="w-4 h-4" />
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
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


