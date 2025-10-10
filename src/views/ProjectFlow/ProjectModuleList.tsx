import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { projectModules } from './projectData';
import { getAllProjectProgress, initializeProjectProgress } from '../../utils/projectProgress';
import type { ProjectProgress } from '../../utils/projectProgress';
import { CheckCircle, Play, Target, Zap, MessageSquare, FileText, Folder, Award, ArrowRight, Sparkles } from 'lucide-react';

const ProjectModuleList: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [progress, setProgress] = useState<Record<string, ProjectProgress>>({});
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

    // Load project progress
    const progressData = await getAllProjectProgress(user.id);
    setProgress(progressData);
    
    setLoading(false);
  };

  const handleModuleClick = async (module: typeof projectModules[0]) => {
    if (!user?.id) return;

    const moduleProgress = progress[module.id];
    
    // For new users: Only first module must be completed before others unlock
    if (userType === 'new' && module.order > 1) {
      const firstModule = projectModules[0];
      const firstProgress = progress[firstModule.id];
      if (firstProgress?.status !== 'completed') {
        // First module not completed - others locked
        return;
      }
    }

    // Initialize progress if first time
    if (!moduleProgress || moduleProgress.status === 'not_started') {
      await initializeProjectProgress(user.id, module.id);
    }

    // Navigate to module view
    setCurrentView(module.viewId as any);
  };

  const getModuleStatus = (moduleId: string) => {
    const moduleProgress = progress[moduleId];
    return moduleProgress?.status || 'not_started';
  };

  const isModuleLocked = (module: typeof projectModules[0]) => {
    if (userType === 'existing') return false;
    if (module.order === 1) return false;
    
    const firstModule = projectModules[0];
    const firstProgress = progress[firstModule.id];
    return firstProgress?.status !== 'completed';
  };

  const getIconComponent = (order: number) => {
    const icons = [Target, Zap, MessageSquare, FileText, Folder, Award];
    return icons[order - 1] || Target;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Separate first module from the rest
  const firstModule = projectModules[0];
  const toolModules = projectModules.slice(1);
  const firstModuleStatus = getModuleStatus(firstModule.id);
  const firstModuleCompleted = firstModuleStatus === 'completed';
  const firstModuleInProgress = firstModuleStatus === 'in_progress';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hands-On Project
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Build your BA portfolio with real-world projects
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* HERO SECTION: Select Your Project - STEP 1 */}
        <div>
          {!firstModuleCompleted && (
            <div className="mb-4 p-4 bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 border-2 border-purple-300 dark:border-purple-600 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  1
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    👇 First Step: Choose Your Project Below
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You'll use this project throughout your BA journey
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-10 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {firstModuleCompleted ? 'Your Selected Project' : 'Step 1: Select Your Project'}
            </h2>
            {!firstModuleCompleted && (
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold animate-pulse">
                START HERE
              </span>
            )}
          </div>

          {/* Hero Card for First Module */}
          <div 
            onClick={() => handleModuleClick(firstModule)}
            className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl group"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl transform -translate-x-48 translate-y-48 group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Content */}
                <div className="flex-1 text-white">
                  {/* Status Badge */}
                  {firstModuleCompleted ? (
                    <div className="inline-flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm border border-green-300/30 rounded-full px-4 py-2 mb-4">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span className="text-sm font-semibold text-green-100">✓ Completed</span>
                    </div>
                  ) : firstModuleInProgress ? (
                    <div className="inline-flex items-center space-x-2 bg-orange-500/20 backdrop-blur-sm border border-orange-300/30 rounded-full px-4 py-2 mb-4">
                      <Play className="w-4 h-4 text-orange-300" />
                      <span className="text-sm font-semibold text-orange-100">In Progress</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span className="text-sm font-semibold text-white">Start Your Journey</span>
                    </div>
                  )}

                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    {firstModule.title}
                  </h3>
                  <p className="text-lg text-purple-100 mb-6 leading-relaxed max-w-2xl">
                    {firstModule.description}
                  </p>

                  {/* Action Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModuleClick(firstModule);
                    }}
                    className="inline-flex items-center space-x-3 bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Play className="w-5 h-5" />
                    <span>{firstModuleCompleted ? 'Choose Another Project' : 'Get Started'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Visual Icon */}
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl transform group-hover:rotate-6 transition-transform duration-300">
                    <Target className="w-16 h-16 md:w-20 md:h-20 text-white" />
                  </div>
                  {firstModuleCompleted && (
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PROJECT TOOLS SECTION */}
        <div>
          {!firstModuleCompleted && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  2
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Next: Use these tools to work on your project
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Available once you've selected a project above
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-10 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {firstModuleCompleted ? 'Your Project Tools' : 'Step 2: Your Project Tools'}
            </h2>
            {firstModuleCompleted ? (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                ✓ Ready to use
              </span>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                After project selection
              </span>
            )}
          </div>

          {/* Tool Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolModules.map((module) => {
              const status = getModuleStatus(module.id);
              const isCompleted = status === 'completed';
              const isInProgress = status === 'in_progress';
              const isLocked = isModuleLocked(module);
              const IconComponent = getIconComponent(module.order);

              return (
                <div
                  key={module.id}
                  onClick={() => !isLocked && handleModuleClick(module)}
                  className={`
                    group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden border-2
                    ${isLocked ? 'opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-700' : 'hover:shadow-2xl cursor-pointer border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transform hover:-translate-y-2'}
                  `}
                >
                  {/* Status Indicator */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  {isInProgress && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 text-center">
                      🔒 Complete "Select Your Project" first
                    </div>
                  )}

                  {/* Icon Header */}
                  <div className="relative h-36 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <IconComponent className="w-14 h-14 text-white relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 min-h-[60px]">
                      {module.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ⏱️ {module.estimatedTime}
                      </span>
                      {!isLocked && (
                        <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                          <span>{isCompleted ? 'Open' : isInProgress ? 'Continue' : 'Start'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Helper Text */}
        <div className="text-center py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-200 dark:border-purple-800">
          <p className="text-gray-600 dark:text-gray-400">
            💡 <strong>How it works:</strong> Start by selecting your project, then use the tools above as you progress through your BA work
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectModuleList;
