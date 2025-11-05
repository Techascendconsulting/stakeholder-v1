import React, { useState, useEffect } from 'react';
import { ArrowRight, Map, Brain, Target, Rocket, RefreshCw, ChevronRight, Lock, RotateCcw, Shield, KeyRound, Laptop } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { deviceLockService } from '../../services/deviceLockService';
import { useAuth } from '../../contexts/AuthContext';
import { JourneyProgressService, JourneyProgress, LearningProgress, PracticeProgress, NextStepGuidance } from '../../services/journeyProgressService';
import { getUserPhase, isPageAccessible, UserPhase } from '../../utils/userProgressPhase';
import { syncModuleProgressToPhases } from '../../utils/modulePhaseMapping';
import { loadResumeState } from '../../services/resumeStore';
import type { ResumeState } from '../../types/resume';

const Dashboard: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Journey progress state
  const [careerProgress, setCareerProgress] = useState<JourneyProgress | null>(null);
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null);
  const [practiceProgress, setPracticeProgress] = useState<PracticeProgress | null>(null);
  const [nextStep, setNextStep] = useState<NextStepGuidance | null>(null);
  const [userType, setUserType] = useState<'new' | 'existing' | 'admin'>('existing');
  const [userPhase, setUserPhase] = useState<UserPhase>('learning');
  const [resumeState, setResumeState] = useState<ResumeState | null>(null);
  const [registeredDevice, setRegisteredDevice] = useState<string | null>(null);
  const [showSecurityCard, setShowSecurityCard] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    const scrollToTop = () => {
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        mainContainer.scrollTop = 0;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    scrollToTop();
    setTimeout(scrollToTop, 0);
    setTimeout(scrollToTop, 50);
  }, []);

  useEffect(() => {
    loadDashboardData();
    loadSecurityHints();
    // Load resume state for "Continue where you left off"
    if (user?.id) {
      const state = loadResumeState(user.id);
      if (state && state.isReturnable && state.pageType !== 'dashboard') {
        setResumeState(state);
      }
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) {
      console.log('🚫 Dashboard - No user ID available');
      return;
    }

    try {
      setLoading(true);
      console.log('════════════════════════════════════════════════');
      console.log('🔄 Dashboard - Loading journey progress for user:', user.id);
      console.log('════════════════════════════════════════════════');
      
      // Load user type and phase first
      const type = await JourneyProgressService.getUserType(user.id);
      const phase = await getUserPhase(user.id);
      setUserType(type);
      setUserPhase(phase);
      console.log('👤 Dashboard - User type:', type, 'Phase:', phase);
      
      // Sync module completion to career journey phases
      console.log('🔄 Dashboard - Syncing module progress to career journey phases...');
      await syncModuleProgressToPhases(user.id);
      
      // Load journey progress data (after sync, so it reflects latest module completions)
      const [career, learning, practice] = await Promise.all([
        JourneyProgressService.getCareerJourneyProgress(user.id),
        JourneyProgressService.getLearningProgress(user.id),
        JourneyProgressService.getPracticeProgress(user.id)
      ]);
      
      setCareerProgress(career);
      setLearningProgress(learning);
      setPracticeProgress(practice);
      
      // Calculate next step guidance
      const guidance = await JourneyProgressService.getNextStepGuidance(user.id, type, career, learning, practice);
      setNextStep(guidance);
      
      console.log('✅ Dashboard - Journey progress loaded:');
      console.log('  📊 Career Progress:', career);
      console.log('  📚 Learning Progress:', learning);
      console.log('  🎯 Practice Progress:', practice);
      console.log('  🧭 Next Step Guidance:', guidance);
      console.log('════════════════════════════════════════════════');

    } catch (error) {
      console.error('❌ Dashboard - Error loading dashboard data:', error);
      console.error('════════════════════════════════════════════════');
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityHints = async () => {
    try {
      if (!user?.id) return;
      // Fetch device registration
      const { data } = await supabase
        .from('user_profiles')
        .select('registered_device')
        .eq('user_id', user.id)
        .single();
      const deviceRaw = (data?.registered_device as string | null) || null;
      const device = deviceRaw && typeof deviceRaw === 'string' && deviceRaw.trim().length > 0 ? deviceRaw.trim() : null;
      setRegisteredDevice(device);
      
      // If user is admin, never show the card
      const isAdminEmail = user?.email === 'admin@baworkxp.com' || user?.email === 'techascendconsulting1@gmail.com';
      if (isAdminEmail) {
        setShowSecurityCard(false);
        return;
      }

      // Compare against current device fingerprint for robustness
      let isRegistered = !!device;
      try {
        const currentDeviceId = await deviceLockService.getDeviceId();
        if (device && currentDeviceId) {
          isRegistered = device === currentDeviceId;
        }
      } catch {
        // If fingerprint unavailable, fall back to server value
        isRegistered = !!device;
      }
      // Respect dismissal
      const dismissed = localStorage.getItem(`security_card_dismissed_${user.id}`) === '1';
      // Show card ONLY when device not registered
      setShowSecurityCard(!dismissed && !isRegistered);
    } catch {
      // Non-blocking
    }
  };

  // Re-evaluate security card visibility when device registration state changes
  useEffect(() => {
    if (!user?.id) return;
    const dismissed = localStorage.getItem(`security_card_dismissed_${user.id}`) === '1';
    setShowSecurityCard(!dismissed && !registeredDevice);
  }, [registeredDevice, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Helper to get icon for next step
  const getNextStepIcon = (icon: string) => {
    switch (icon) {
      case 'career': return <Map className="w-6 h-6 text-white" />;
      case 'learning': return <Brain className="w-6 h-6 text-white" />;
      case 'practice': return <Target className="w-6 h-6 text-white" />;
      case 'project': return <Rocket className="w-6 h-6 text-white" />;
      default: return <Rocket className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-gray-100">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                console.log('🔄 Dashboard - Manual refresh triggered');
                loadDashboardData();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your stakeholder interview progress and recent activity
        </p>
      </div>

      {/* Security nudges */}
      {showSecurityCard && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400/80 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-900" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Security tips</h3>
                <ul className="text-sm text-amber-900/90 dark:text-amber-200/90 list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-medium">Change your password</span> regularly to keep your account secure.
                  </li>
                  {!registeredDevice && (
                    <li>
                      <span className="font-medium">Register this device</span> so we recognize it next time you sign in.
                    </li>
                  )}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => { localStorage.setItem('profile_target_tab', 'security'); setCurrentView('profile'); }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                  >
                    <KeyRound className="w-4 h-4" /> Change password
                  </button>
                  {!registeredDevice && (
                    <button
                      onClick={() => { localStorage.removeItem('device_registration_skipped'); setCurrentView('profile'); localStorage.setItem('profile_target_tab', 'security'); }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
                    >
                      <Laptop className="w-4 h-4" /> Register device
                    </button>
                  )}
                  <button
                    onClick={() => { if (user?.id) localStorage.setItem(`security_card_dismissed_${user.id}`, '1'); setShowSecurityCard(false); }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-300 text-amber-900 dark:text-amber-200 text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Where You Left Off */}
      {resumeState && (
        <div className="mb-6 rounded-xl p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Continue where you left off</h3>
                <p className="text-indigo-100 text-sm">
                  You were on <span className="font-semibold">{resumeState.pageTitle || resumeState.path}</span>
                  {resumeState.stepId && ` — ${resumeState.stepId}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentView(resumeState.path as any);
                // Restore scroll/step after navigation
                setTimeout(() => {
                  if (resumeState.scrollY && resumeState.scrollY > 0) {
                    window.scrollTo({ top: resumeState.scrollY, behavior: 'smooth' });
                  }
                  if (resumeState.stepId || resumeState.tabId) {
                    const element = document.querySelector(`[data-step-id="${resumeState.stepId}"]`) ||
                                  document.querySelector(`[data-topic-id="${resumeState.stepId}"]`) ||
                                  document.querySelector(`[data-tab-id="${resumeState.tabId}"]`);
                    if (element) {
                      (element as HTMLElement).click();
                    }
                  }
                }, 300);
              }}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold flex items-center space-x-2 hover:bg-indigo-50 transition-all hover:scale-105 shadow-md"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Next Step Guidance Banner */}
      {nextStep && (
        <div className={`mb-8 rounded-xl p-6 border-2 ${
          nextStep.priority === 'high' 
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-300 dark:border-purple-700' 
            : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-700'
        }`}>
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                nextStep.priority === 'high' ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                {getNextStepIcon(nextStep.icon)}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wide ${
                    nextStep.priority === 'high' ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    {nextStep.priority === 'high' ? '⚡ Recommended Next Step' : '💡 Suggested Action'}
                  </span>
              </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {nextStep.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {nextStep.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView(nextStep.actionView as any)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all hover:scale-105 ${
                nextStep.priority === 'high'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span>{nextStep.action}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
      </div>
      )}

      {/* Consolidated Journey CTA */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your BA Journey</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Career, Learning, Practice, and Project in one place</p>
          </div>
        </div>
      </div>

      {/* Journey Progress Cards */}
      {(careerProgress || learningProgress || practiceProgress) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* BA Career Journey Progress */}
          {careerProgress && (
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setCurrentView('career-journey')}
            >
          <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Map className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">BA Project Journey</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {careerProgress.phasesCompleted}/{careerProgress.totalPhases} phases
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {careerProgress.progressPercentage}%
            </span>
          </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${careerProgress.progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Current: {careerProgress.currentPhaseTitle}
                </p>
              </div>
            </div>
          )}

          {/* Learning Journey Progress */}
          {learningProgress && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setCurrentView('learning-flow')}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Learning Journey</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {learningProgress.modulesCompleted}/{learningProgress.totalModules} modules
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {learningProgress.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all"
                    style={{ width: `${learningProgress.progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {learningProgress.currentModuleTitle ? `Current: ${learningProgress.currentModuleTitle}` : 'All modules completed!'}
                </p>
              </div>
            </div>
          )}

          {/* Practice Journey Progress - Quick Exercises */}
          {practiceProgress && (
            <div 
              className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-shadow relative ${
                isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) 
                  ? 'hover:shadow-lg cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType))) {
                  setCurrentView('practice-flow');
                }
              }}
            >
              {!isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Locked</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : 'bg-gray-400 dark:bg-gray-600'
                  }`}>
                    {isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) ? (
                      <Target className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Practice Journey</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                        ? 'Quick practice exercises'
                        : 'Unlocks after 3 modules'
                      }
                    </p>
            </div>
          </div>
                {isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) && (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Exercises</span>
                  <span className={`font-semibold ${
                    isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {practiceProgress.meetingsCount || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                    ? 'Elicitation, Documentation, MVP, Scrum'
                    : '🔒 Complete 3 modules to unlock'
                  }
                </p>
              </div>
          </div>
          )}

          {/* Project Journey Progress - Hands-On Projects */}
          <div 
            className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-shadow relative ${
              isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) 
                ? 'hover:shadow-lg cursor-pointer' 
                : 'opacity-60 cursor-not-allowed'
            }`}
            onClick={() => {
              if (isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType))) {
                setCurrentView('project-flow');
              }
            }}
          >
            {!isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center space-x-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Locked</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                    : 'bg-gray-400 dark:bg-gray-600'
                }`}>
                  {isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) ? (
                    <Rocket className="w-5 h-5 text-white" />
                  ) : (
                    <Lock className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Project Journey</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                      ? 'Hands-on real projects'
                      : 'Unlocks after 10 modules'
                    }
                  </p>
                </div>
              </div>
              {isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) && (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className={`font-semibold ${
                  isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) ? 'Ready' : 'Locked'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                  ? 'Select project, conduct meetings, create deliverables'
                  : '🔒 Complete all 10 modules to unlock'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Dashboard;
