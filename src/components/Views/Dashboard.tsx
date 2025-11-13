import React, { useState, useEffect } from 'react';
import { ArrowRight, Map, Brain, Target, Rocket, RefreshCw, ChevronRight, Lock, RotateCcw, Shield, KeyRound, Laptop, Users, Calendar, Clock, HelpCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { deviceLockService } from '../../services/deviceLockService';
import { useAuth } from '../../contexts/AuthContext';
import { JourneyProgressService, JourneyProgress, LearningProgress, PracticeProgress, NextStepGuidance } from '../../services/journeyProgressService';
import { getUserPhase, isPageAccessible, UserPhase } from '../../utils/userProgressPhase';
import { syncModuleProgressToPhases } from '../../utils/modulePhaseMapping';
import { loadResumeState } from '../../services/resumeStore';
import type { ResumeState } from '../../types/resume';
import { useUserJourney } from '../../hooks/useUserJourney';
import { getUserCohort } from '../../utils/cohortHelpers';
import type { UserCohortInfo } from '../../types/cohorts';

const Dashboard: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const { getNextAction } = useUserJourney(user?.id || null);
  const next = getNextAction?.();
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
  const [cohortInfo, setCohortInfo] = useState<UserCohortInfo | null>(null);
  const [cohortLoading, setCohortLoading] = useState(true);

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
    loadCohortData();
    // Load resume state for "Continue where you left off"
    if (user?.id) {
      const state = loadResumeState(user.id);
      if (state && state.isReturnable && state.pageType !== 'dashboard') {
        setResumeState(state);
      }
    }
  }, [user?.id]);

  const loadCohortData = async () => {
    if (!user?.id) {
      setCohortLoading(false);
      return;
    }

    try {
      const data = await getUserCohort(user.id);
      setCohortInfo(data);
    } catch (error) {
      console.error('Error loading cohort:', error);
    } finally {
      setCohortLoading(false);
    }
  };

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

  const launchNavigationTour = () => {
    setCurrentView('dashboard');
    setTimeout(() => {
      window.dispatchEvent(new Event('start-onboarding-tour'));
    }, 120);
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

      {/* Guided Tour CTA */}
      <div className="mb-6 rounded-xl border border-pink-200 bg-gradient-to-r from-[#ffeff9] via-white to-[#fbe9ff] dark:from-[#501538] dark:via-[#2d1027] dark:to-[#3c1550] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ff09aa] to-[#d238ff] text-white flex items-center justify-center shadow-md">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                New here? Start the guided walkthrough.
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">
                See where everything lives, how to move between Learning, BA In Action, Practice, and why each area matters for your experience.
              </p>
            </div>
          </div>
          <button
            onClick={launchNavigationTour}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#ff09aa] via-[#ff3cbf] to-[#d238ff] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Launch Tour</span>
          </button>
        </div>
      </div>

      {/* Next Step Strip */}
      {next && (
        <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm">
          <div className="font-semibold">Next step: {next.title}</div>
          <div className="opacity-80">{next.description}</div>
        </div>
      )}

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
                  <li>
                    <span className="font-medium">Single device policy:</span> You can only sign in from one device at a time for security.
                  </li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => { localStorage.setItem('profile_target_tab', 'security'); setCurrentView('profile'); }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                  >
                    <KeyRound className="w-4 h-4" /> Change password
                  </button>
                  {/* Removed register device action: devices are auto-registered */}
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

      {/* Cohort Info Card - Show if user IS in a cohort */}
      {!cohortLoading && cohortInfo && (
        <div className="mb-6 rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-white to-indigo-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-indigo-900/20 dark:border-purple-700 p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  You're learning with {cohortInfo.name}
                </h3>
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                  Active
                </span>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {cohortInfo.description || 'Join live sessions and follow the guided learning schedule with your cohort.'}
              </p>

              {cohortInfo.upcomingSessions && cohortInfo.upcomingSessions.length > 0 ? (
                <>
                  <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                          Next Live Session
                        </p>
                        <div className="font-bold text-gray-900 dark:text-white mb-1">
                          {cohortInfo.upcomingSessions[0].topic || 'Upcoming Session'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(cohortInfo.upcomingSessions[0].starts_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  {cohortInfo.upcomingSessions.length > 1 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                      + {cohortInfo.upcomingSessions.length - 1} more {cohortInfo.upcomingSessions.length === 2 ? 'session' : 'sessions'} scheduled
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No upcoming sessions scheduled yet. Check back soon for live session dates.
                </p>
              )}

              <button
                onClick={() => setCurrentView('my-cohort')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span>View All Sessions & Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cohort Promotional Card - Only show if user is NOT in a cohort */}
      {!cohortLoading && !cohortInfo && (
        <div className="mb-6 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-700 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Want support while learning?
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Join a cohort and progress with others — you don't have to do this alone.
                </p>
                <a
                  href="https://wa.me/447359666711?text=Hi%20team,%20I'd%20like%20to%20join%20the%20cohort.%20Can%20you%20help%20me%20get%20started?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
                >
                  <span>Request to Join</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
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

      {/* Section Header - Simple & Clean */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Progress</h2>
      </div>

      {/* Journey Progress Cards - Distinct Colors */}
      {(careerProgress || learningProgress || practiceProgress) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Project Lifecycle - Purple */}
          {careerProgress && (
            <div 
              className="group bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-700 p-5 hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all cursor-pointer"
              onClick={() => setCurrentView('career-journey')}
            >              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {careerProgress.progressPercentage}%
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Project Lifecycle</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {careerProgress.phasesCompleted}/{careerProgress.totalPhases} phases done
              </p>
              <div className="w-full bg-purple-200 dark:bg-purple-900/30 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${careerProgress.progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Learning Journey - Blue */}
          {learningProgress && (
            <div 
              className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-700 p-5 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
              onClick={() => setCurrentView('learning-flow')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {learningProgress.progressPercentage}%
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Learning</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {learningProgress.modulesCompleted}/{learningProgress.totalModules} modules done
              </p>
              <div className="w-full bg-blue-200 dark:bg-blue-900/30 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${learningProgress.progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Practice Journey - Orange */}
          {practiceProgress && (
            <div 
              className={`group rounded-2xl border-2 p-5 transition-all ${
                isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) 
                  ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700 hover:shadow-xl hover:border-orange-400 dark:hover:border-orange-500 cursor-pointer' 
                  : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 opacity-70 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType))) {
                  setCurrentView('practice-flow');
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                    ? 'bg-gradient-to-br from-orange-600 to-amber-600 group-hover:scale-110'
                    : 'bg-gray-400 dark:bg-gray-600'
                } transition-transform`}>
                  {isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) ? (
                    <Target className="w-6 h-6 text-white" />
                  ) : (
                    <Lock className="w-6 h-6 text-white" />
                  )}
                </div>
                <span className={`text-2xl font-bold ${
                  isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {practiceProgress.meetingsCount || 0}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Practice</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                  ? 'Quick exercises'
                  : 'Unlocks after 3 modules'
                }
              </p>
              {isPageAccessible('practice-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) && (
                <div className="w-full bg-orange-200 dark:bg-orange-900/30 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-orange-600 to-amber-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min((practiceProgress.meetingsCount / 4) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Project Journey - Pink/Rose */}
          <div 
            className={`group rounded-2xl border-2 p-5 transition-all ${
              isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) 
                ? 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-700 hover:shadow-xl hover:border-rose-400 dark:hover:border-rose-500 cursor-pointer' 
                : 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 opacity-70 cursor-not-allowed'
            }`}
            onClick={() => {
              if (isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType))) {
                setCurrentView('project-flow');
              }
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                  ? 'bg-gradient-to-br from-rose-600 to-pink-600 group-hover:scale-110'
                  : 'bg-gray-400 dark:bg-gray-600'
              } transition-transform`}>
                {isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) ? (
                  <Rocket className="w-6 h-6 text-white" />
                ) : (
                  <Lock className="w-6 h-6 text-white" />
                )}
              </div>
              <span className={`text-2xl font-bold ${
                isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) ? 'Ready' : '🔒'}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Projects</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType))
                ? 'Real-world projects'
                : 'Complete all modules'
              }
            </p>
            {!isPageAccessible('project-flow', userPhase, (userType === 'admin' ? 'existing' : userType)) && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Unlock after 10 modules
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Dashboard;

