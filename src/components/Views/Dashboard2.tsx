import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Target, Briefcase, Lock, CheckCircle, Clock, Award, TrendingUp, Zap, PlayCircle, MessageSquare } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Dashboard2: React.FC = () => {
  const { setCurrentView, selectedProject } = useApp();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [loading, setLoading] = useState(true);
  const [learningProgress, setLearningProgress] = useState({ completed: 0, total: 10 });
  const [practiceProgress, setPracticeProgress] = useState({ completed: 0, total: 4 });
  const [projectProgress, setProjectProgress] = useState({ completed: 0, total: 6 });
  const [nextStep, setNextStep] = useState<{
    title: string;
    description: string;
    action: string;
    route: string;
    status?: string;
  } | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      // Get user type
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setUserType(profileData.user_type || 'existing');
      }

      // Get learning progress
      const { data: learningData } = await supabase
        .from('learning_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      setLearningProgress({ completed: learningData?.length || 0, total: 10 });

      // Get practice progress
      const { data: practiceData } = await supabase
        .from('practice_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      setPracticeProgress({ completed: practiceData?.length || 0, total: 4 });

      // Get project progress
      const { data: projectData } = await supabase
        .from('project_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      setProjectProgress({ completed: projectData?.length || 0, total: 6 });

      // Determine next step
      determineNextStep(profileData?.user_type, learningData?.length || 0, practiceData?.length || 0, projectData?.length || 0);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineNextStep = (type: string, learningCount: number, practiceCount: number, projectCount: number) => {
    // For new users, guide them through the journey
    if (type === 'new') {
      // PHASE 1: Learning Journey (0-10 modules)
      if (learningCount === 0) {
        setNextStep({
          title: 'Start Your BA Journey',
          description: 'Begin with Core Learning to understand BA fundamentals',
          action: 'Start Learning',
          route: 'learning-flow'
        });
      } else if (learningCount < 10) {
        setNextStep({
          title: 'Continue Learning Journey',
          description: `Module ${learningCount + 1} of 10 • Build your BA foundation`,
          action: 'Continue Learning',
          route: 'learning-flow',
          status: `${learningCount}/10 modules`
        });
      } 
      // PHASE 2: Learning Complete - Practice & Projects Unlocked
      else if (learningCount >= 10) {
        // After completing all 10 learning modules, BOTH practice and projects unlock
        // Priority: Guide to practice first, but projects are also accessible
        
        if (practiceCount === 0 && projectCount === 0) {
          // Just unlocked - suggest practice first
          setNextStep({
            title: '🎉 Practice & Projects Unlocked!',
            description: 'You completed all learning! Now practice your skills or start a project.',
            action: 'Explore Practice',
            route: 'practice-flow'
          });
        } else if (practiceCount < 4 && !selectedProject) {
          // Working on practice, haven't started project
          setNextStep({
            title: 'Continue Practice',
            description: 'Master real-world BA skills through AI practice',
            action: 'Continue Practice',
            route: 'practice-flow',
            status: `${practiceCount}/4 practice modules`
          });
        } else if (selectedProject && practiceCount < 4) {
          // Has project but practice incomplete - suggest practice
          setNextStep({
            title: 'Continue Your Journey',
            description: 'Keep practicing to sharpen your BA skills',
            action: 'Go to Practice',
            route: 'practice-flow',
            status: `${practiceCount}/4 practice modules`
          });
        } else if (selectedProject) {
          // Has project and practice done/in progress
          setNextStep({
            title: 'Build Your Portfolio',
            description: `Continue with ${selectedProject.name}`,
            action: 'Go to Project',
            route: 'project-flow'
          });
        } else {
          // Practice done but no project selected
          setNextStep({
            title: 'Select Your Project',
            description: 'Choose a real business scenario to work on',
            action: 'Browse Projects',
            route: 'project-flow'
          });
        }
      }
    } else {
      // EXISTING USERS - Full access from day 1
      if (selectedProject) {
        setNextStep({
          title: 'Resume Your Work',
          description: `Continue with ${selectedProject.name}`,
          action: 'Go to Project',
          route: 'projects'
        });
      } else {
        setNextStep({
          title: 'Explore the Platform',
          description: 'All features unlocked - choose where to start',
          action: 'View Learning',
          route: 'learning-flow'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your BA Training Dashboard
          </p>
        </div>

        {/* Hero: Your Next Step */}
        {nextStep && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-32 -translate-x-32"></div>
              
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-4">
                  {userType === 'new' ? '🎯 Your Next Step' : '🚀 Quick Start'}
                </div>
                
                <h2 className="text-3xl font-bold mb-3">{nextStep.title}</h2>
                <p className="text-purple-100 text-lg mb-6">{nextStep.description}</p>
                
                {nextStep.status && (
                  <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-medium mb-6">
                    Progress: {nextStep.status}
                  </div>
                )}
                
                <button
                  onClick={() => setCurrentView(nextStep.route as any)}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlayCircle className="w-6 h-6" />
                  <span>{nextStep.action}</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Journey Progress (New Users Only) */}
        {userType === 'new' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Learning Path</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Learning Journey */}
              <div
                onClick={() => setCurrentView('learning-flow')}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                  learningProgress.completed === learningProgress.total
                    ? 'border-green-500 hover:shadow-xl'
                    : 'border-blue-500 hover:shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    learningProgress.completed === learningProgress.total ? 'bg-green-100 dark:bg-green-900/40' : 'bg-blue-100 dark:bg-blue-900/40'
                  }`}>
                    <BookOpen className={`w-6 h-6 ${
                      learningProgress.completed === learningProgress.total ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  {learningProgress.completed === learningProgress.total && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Learning Journey</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Master BA fundamentals and concepts
                </p>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span className="font-semibold">{learningProgress.completed}/{learningProgress.total} modules</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        learningProgress.completed === learningProgress.total ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(learningProgress.completed / learningProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-sm font-semibold flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <span>{learningProgress.completed === learningProgress.total ? 'Review Journey' : 'Continue Learning'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Practice Journey */}
              <div
                onClick={() => {
                  if (learningProgress.completed >= 10) {
                    setCurrentView('practice-flow');
                  }
                }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all ${
                  learningProgress.completed < 10
                    ? 'border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed'
                    : practiceProgress.completed === practiceProgress.total
                    ? 'border-green-500 hover:shadow-xl cursor-pointer'
                    : 'border-purple-500 hover:shadow-xl cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    learningProgress.completed < 10
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : practiceProgress.completed === practiceProgress.total
                      ? 'bg-green-100 dark:bg-green-900/40'
                      : 'bg-purple-100 dark:bg-purple-900/40'
                  }`}>
                    {learningProgress.completed < 10 ? (
                      <Lock className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Target className={`w-6 h-6 ${
                        practiceProgress.completed === practiceProgress.total ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'
                      }`} />
                    )}
                  </div>
                  {practiceProgress.completed === practiceProgress.total && learningProgress.completed >= 10 && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Practice Journey</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Apply skills with AI stakeholders
                </p>
                
                {learningProgress.completed < 10 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    🔒 Complete all 10 Learning modules
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{practiceProgress.completed}/{practiceProgress.total} modules</span>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            practiceProgress.completed === practiceProgress.total ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${(practiceProgress.completed / practiceProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm font-semibold flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                      <span>{practiceProgress.completed === practiceProgress.total ? 'Review Practice' : 'Continue Practice'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </>
                )}
              </div>

              {/* Project Journey */}
              <div
                onClick={() => {
                  if (learningProgress.completed >= 10) {
                    setCurrentView('project-flow');
                  }
                }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all ${
                  learningProgress.completed < 10
                    ? 'border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed'
                    : projectProgress.completed === projectProgress.total
                    ? 'border-green-500 hover:shadow-xl cursor-pointer'
                    : 'border-orange-500 hover:shadow-xl cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    learningProgress.completed < 10
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : projectProgress.completed === projectProgress.total
                      ? 'bg-green-100 dark:bg-green-900/40'
                      : 'bg-orange-100 dark:bg-orange-900/40'
                  }`}>
                    {learningProgress.completed < 10 ? (
                      <Lock className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Briefcase className={`w-6 h-6 ${
                        projectProgress.completed === projectProgress.total ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                      }`} />
                    )}
                  </div>
                  {projectProgress.completed === projectProgress.total && learningProgress.completed >= 10 && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Project Journey</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Build real deliverables and portfolio
                </p>
                
                {learningProgress.completed < 10 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    🔒 Complete all 10 Learning modules
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{projectProgress.completed}/{projectProgress.total} tools</span>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            projectProgress.completed === projectProgress.total ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${(projectProgress.completed / projectProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm font-semibold flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                      <span>{selectedProject ? 'Continue Project' : 'Start Project'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Today's Activity / Quick Stats */}
        {userType === 'existing' && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your BA Portfolio</h3>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">{learningProgress.completed + practiceProgress.completed}</strong> Sessions
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">{projectProgress.completed}</strong> Tools Mastered
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">Full Access</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Access (Simplified) */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setCurrentView('learning-flow')}
              className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Learning</span>
            </button>

            <button
              onClick={() => setCurrentView('practice-flow')}
              className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group"
            >
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">Practice</span>
            </button>

            <button
              onClick={() => setCurrentView('project-flow')}
              className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg transition-all group"
            >
              <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">Projects</span>
            </button>

            <button
              onClick={() => setCurrentView('ba-reference')}
              className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 hover:shadow-lg transition-all group"
            >
              <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-400">Resources</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard2;

