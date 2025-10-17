import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { CAREER_JOURNEY_PHASES, type JourneyPhase, type JourneyTopic } from '../../data/careerJourneyData';
import CareerJourneyTourJoyride from '../CareerJourneyTourJoyride';
import { syncModuleProgressToPhases } from '../../utils/modulePhaseMapping';
import { 
  CheckCircle, 
  Lock, 
  Play, 
  ArrowLeft, 
  Sparkles,
  MapPin,
  X,
  Users as UsersIcon,
  BookOpen,
  Target,
  Rocket,
  ArrowRight,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Zap,
  Eye,
  Maximize2
} from 'lucide-react';

interface PhaseProgress {
  phase_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_topics: string[];
  started_at?: string;
  completed_at?: string;
}

// Helper to get learning module info for a phase
const getPhaseModuleInfo = (phase: JourneyPhase) => {
  // Proper mapping from module IDs to view IDs (matches ModuleList.tsx)
  const moduleIdToViewId: Record<string, string> = {
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
  
  // If phase has multiple modules defined, use those
  if (phase.learningModuleIds && phase.learningModuleNames) {
    return {
      modules: phase.learningModuleIds.map((id, idx) => ({
        id,
        name: phase.learningModuleNames![idx],
        viewId: moduleIdToViewId[id] || id
      })),
      isMultiple: true
    };
  }
  
  // Otherwise, use single module from learningModuleId
  if (phase.learningModuleId) {
    // Map common view IDs to their display names
    const viewIdToDisplayName: Record<string, string> = {
      'core-learning': 'Module 1: Core Learning',
      'project-initiation': 'Module 2: Project Initiation',
      'stakeholder-mapping': 'Module 3: Stakeholder Mapping',
      'elicitation': 'Module 4: Requirements Elicitation',
      'process-mapper': 'Module 5: Process Mapping',
      'requirements-engineering': 'Module 6: Requirements Engineering',
      'solution-options': 'Module 7: Solution Options',
      'documentation': 'Module 8: Documentation',
      'design-hub': 'Module 9: Design',
      'mvp-hub': 'Module 10: MVP',
      'agile-scrum': 'Module 11: Agile/Scrum',
      'scrum-essentials': 'Module 11: Agile/Scrum'
    };
    
    return {
      modules: [{
        id: phase.learningModuleId,
        name: viewIdToDisplayName[phase.learningModuleId] || 'Learning Module',
        viewId: phase.learningModuleId
      }],
      isMultiple: false
    };
  }
  
  return null;
};

// Helper to get practice module info for a phase
const getPhasePracticeInfo = (phase: JourneyPhase) => {
  // Map practice module IDs to their viewIds
  const practiceModuleToViewId: Record<string, string> = {
    'practice-1-elicitation': 'practice-2',
    'practice-2-documentation': 'documentation-practice',
    'practice-3-mvp': 'mvp-practice',
    'practice-4-scrum': 'scrum-practice'
  };
  
  // If phase has multiple practice modules defined, use those
  if (phase.practiceModuleIds && phase.practiceModuleNames) {
    return {
      modules: phase.practiceModuleIds.map((id, idx) => ({
        id,
        name: phase.practiceModuleNames![idx],
        viewId: practiceModuleToViewId[id] || 'practice-flow'
      })),
      isMultiple: true
    };
  }
  
  // Otherwise, use single module from practiceModuleId (backward compatibility)
  if (phase.practiceModuleId && phase.practiceModuleTitle) {
    return {
      modules: [{
        id: phase.practiceModuleId,
        name: phase.practiceModuleTitle,
        viewId: practiceModuleToViewId[phase.practiceModuleId] || 'practice-flow'
      }],
      isMultiple: false
    };
  }
  
  return null;
};

// Helper to get color classes based on phase color
const getColorClasses = (phaseColor: string) => {
  const colorMap: Record<string, { text: string; hover: string; bg: string }> = {
    'purple': { text: 'text-purple-500', hover: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    'blue': { text: 'text-blue-500', hover: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    'emerald': { text: 'text-emerald-500', hover: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    'amber': { text: 'text-amber-500', hover: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    'green': { text: 'text-green-500', hover: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    'teal': { text: 'text-teal-500', hover: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/30' },
    'indigo': { text: 'text-indigo-500', hover: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    'cyan': { text: 'text-cyan-500', hover: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/30' }
  };
  return colorMap[phaseColor] || colorMap['purple'];
};

const CareerJourneyView: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [progress, setProgress] = useState<PhaseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadUserData();
  }, [user?.id]);

  // Check for first visit and show welcome overlay
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenCareerJourneyWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeOverlay(true);
    }
  }, []);

  // Auto-scroll to current phase on load
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
      // Calculate current phase index
      const inProgressPhase = CAREER_JOURNEY_PHASES.findIndex(p => getPhaseStatus(p) === 'in_progress');
      const notStartedPhase = CAREER_JOURNEY_PHASES.findIndex(p => getPhaseStatus(p) === 'not_started');
      const currentIdx = inProgressPhase !== -1 ? inProgressPhase : notStartedPhase !== -1 ? notStartedPhase : CAREER_JOURNEY_PHASES.length - 1;
      
      // Scroll to current phase after a short delay (keep header visible)
      setTimeout(() => {
        const phaseElements = scrollContainerRef.current?.querySelectorAll('[data-phase-index]');
        if (phaseElements && phaseElements[currentIdx]) {
          // Scroll within the horizontal container only, don't scroll the page vertically
          const element = phaseElements[currentIdx] as HTMLElement;
          const container = scrollContainerRef.current;
          if (container && element) {
            const elementLeft = element.offsetLeft;
            const containerWidth = container.clientWidth;
            const elementWidth = element.clientWidth;
            const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);
            container.scrollTo({
              left: scrollLeft,
              behavior: 'smooth'
            });
          }
        }
      }, 300);
    }
  }, [loading, progress, userType]);

  // Check scroll position for navigation arrows
  useEffect(() => {
    const checkScrollPosition = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [loading]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    setLoading(true);

    // Load user type
    try {
      console.log('🔍 Career Journey - Loading user type for:', user.id, user.email);
      
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('user_type, user_id, created_at')
        .eq('user_id', user.id)
        .single();
      
      console.log('🔍 Career Journey - User type query result:', { userData, error: userError });
      
      if (userError) {
        console.warn('⚠️ Career Journey - Could not load user_type, defaulting to existing:', userError);
        setUserType('existing'); // Safe default: all phases unlocked
      } else if (userData) {
        const resolvedType = userData.user_type || 'existing';
        console.log(`✅ Career Journey - User type set to: "${resolvedType}" (${resolvedType === 'existing' ? 'ALL PHASES UNLOCKED' : 'PROGRESSIVE UNLOCK'})`);
        setUserType(resolvedType);
      } else {
        console.warn('⚠️ Career Journey - No user_profiles record found, defaulting to existing');
        setUserType('existing'); // Safe default: all phases unlocked
      }
    } catch (error) {
      console.error('❌ Career Journey - Failed to load user type:', error);
      setUserType('existing'); // Safe default on error: all phases unlocked
    }

    // Sync module completions to career journey phases
    console.log('🔄 Career Journey - Syncing module progress to phases...');
    await syncModuleProgressToPhases(user.id);

    // Load career journey progress (after sync)
    try {
      const { data: progressData, error } = await supabase
        .from('career_journey_progress')
        .select('*')
        .eq('user_id', user.id);

      if (!error && progressData) {
        setProgress(progressData);
        console.log('✅ Career Journey - Phase progress loaded:', progressData.length, 'phases');
      }
    } catch (error) {
      console.log('Career journey progress table not found, using defaults');
    }
    
    setLoading(false);
  };

  const getPhaseStatus = (phase: JourneyPhase): 'completed' | 'in_progress' | 'not_started' | 'locked' => {
    const phaseProgress = progress.find(p => p.phase_id === phase.id);
    
    if (phaseProgress?.status === 'completed') {
      return 'completed';
    }
    
    if (phaseProgress?.status === 'in_progress') {
      return 'in_progress';
    }

    // For existing users: all unlocked (NO RESTRICTIONS)
    if (userType === 'existing') {
      // Log once for first phase to avoid console spam
      if (phase.order === 1) {
        console.log('🔓 User type is "existing" - ALL phases unlocked, no progressive restrictions');
      }
      return 'not_started';
    }

    // For new users: ONLY Phase 1 is unlocked by default
    if (phase.order === 1) {
      return 'not_started'; // Phase 1 always unlocked
    }

    // All other phases require previous phase completion
    const previousPhase = CAREER_JOURNEY_PHASES.find(p => p.order === phase.order - 1);
    if (previousPhase) {
      const prevProgress = progress.find(p => p.phase_id === previousPhase.id);
      if (prevProgress?.status === 'completed') {
        return 'not_started'; // Unlocked because previous phase is completed
      }
    }

    return 'locked'; // Locked until previous phase is completed
  };

  const handlePhaseClick = (phaseIndex: number) => {
    const phase = CAREER_JOURNEY_PHASES[phaseIndex];
    const status = getPhaseStatus(phase);
    if (status === 'locked' && userType === 'new') return;

    // Show modal with phase details
    setSelectedPhaseIndex(phaseIndex);
  };

  const handleGoToLearning = (phase: JourneyPhase) => {
    // Store that user came from Project Journey
    localStorage.setItem('previousView', 'career-journey');
    
    // Navigate directly to the specific learning module page
    if (phase.learningModuleId) {
      setCurrentView(phase.learningModuleId as any);
    }
  };

  const handleTopicClick = (topic: JourneyTopic) => {
    // Store that user came from Project Journey
    localStorage.setItem('previousView', 'career-journey');
    
    // Navigate to the topic's view if it has one
    if (topic.viewId) {
      setCurrentView(topic.viewId as any);
      setSelectedPhaseIndex(null); // Close modal
    }
  };

  const getPhaseProgress = (phase: JourneyPhase): number => {
    const phaseProgress = progress.find(p => p.phase_id === phase.id);
    if (!phaseProgress) return 0;
    
    const completedTopics = phaseProgress.completed_topics?.length || 0;
    const totalTopics = phase.topics.length;
    
    return Math.round((completedTopics / totalTopics) * 100);
  };

  // Scroll navigation handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Handle welcome overlay actions  
  const handleStartTour = () => {
    setShowWelcomeOverlay(false);
    localStorage.setItem('hasSeenCareerJourneyWelcome', 'true');
    setShowTour(true);
  };

  const handleSkipWelcome = () => {
    setShowWelcomeOverlay(false);
    localStorage.setItem('hasSeenCareerJourneyWelcome', 'true');
  };

  const handleTourComplete = () => {
    setShowTour(false);
    setSelectedPhaseIndex(null); // Close any open modal
  };

  const handleTourSkip = () => {
    setShowTour(false);
    setSelectedPhaseIndex(null); // Close any open modal
  };

  const handleTourOpenPhaseModal = (phaseIndex: number) => {
    setSelectedPhaseIndex(phaseIndex);
  };

  const handleTourClosePhaseModal = () => {
    setSelectedPhaseIndex(null);
  };

  // Quick action handlers
  const handleQuickLearn = (phase: JourneyPhase, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    localStorage.setItem('previousView', 'career-journey');
    
    const moduleInfo = getPhaseModuleInfo(phase);
    if (moduleInfo && moduleInfo.modules.length > 0) {
      setCurrentView(moduleInfo.modules[0].viewId as any);
    }
  };

  const handleQuickPractice = (phase: JourneyPhase, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    localStorage.setItem('previousView', 'career-journey');
    
    const practiceInfo = getPhasePracticeInfo(phase);
    if (practiceInfo && practiceInfo.modules.length > 0) {
      setCurrentView(practiceInfo.modules[0].viewId as any);
    } else {
      // Fallback to general practice
      setCurrentView('practice-flow');
    }
  };

  // Get current phase index
  const getCurrentPhaseIndex = (): number => {
    // Find the first in-progress or not-started phase
    const inProgressPhase = CAREER_JOURNEY_PHASES.findIndex(p => getPhaseStatus(p) === 'in_progress');
    if (inProgressPhase !== -1) return inProgressPhase;

    const notStartedPhase = CAREER_JOURNEY_PHASES.findIndex(p => getPhaseStatus(p) === 'not_started');
    if (notStartedPhase !== -1) return notStartedPhase;

    return CAREER_JOURNEY_PHASES.length - 1; // All completed, show last
  };

  // Continue current phase
  const handleContinuePhase = () => {
    const currentPhaseIdx = getCurrentPhaseIndex();
    const currentPhase = CAREER_JOURNEY_PHASES[currentPhaseIdx];
    if (currentPhase) {
      const moduleInfo = getPhaseModuleInfo(currentPhase);
      if (moduleInfo && moduleInfo.modules.length > 0) {
        localStorage.setItem('previousView', 'career-journey');
        setCurrentView(moduleInfo.modules[0].viewId as any);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Calculate current phase index for rendering
  const currentPhaseIndex = getCurrentPhaseIndex();
  const selectedPhaseData = selectedPhaseIndex !== null ? CAREER_JOURNEY_PHASES[selectedPhaseIndex] : null;

  // Color mapping for your app's purple/indigo theme
  const colorClasses: Record<string, string> = {
    'purple': 'from-purple-500 to-indigo-600',
    'blue': 'from-blue-500 to-cyan-600',
    'emerald': 'from-emerald-500 to-teal-600',
    'amber': 'from-amber-500 to-orange-600',
    'pink': 'from-pink-500 to-rose-600',
    'indigo': 'from-indigo-500 to-purple-600',
    'cyan': 'from-cyan-500 to-blue-600',
    'green': 'from-green-500 to-emerald-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Animated Background Elements for WOW effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300/20 dark:bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Welcome Overlay - First Visit */}
      {showWelcomeOverlay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-purple-500 animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                🗺️ Welcome to Your BA Project Journey!
              </h2>
            </div>
            <div className="p-8">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                This timeline shows the complete BA project lifecycle from onboarding through continuous delivery.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Click any phase to explore</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">See topics, activities, and deliverables for each phase</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Scroll to see all 10 phases</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Use arrows or scroll horizontally to navigate</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Each phase links to Learning & Practice</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quick access to relevant modules and exercises</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleStartTour}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Show Me Around (30 sec)
                </button>
                <button
                  onClick={handleSkipWelcome}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Skip, I Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Header with gradient and animations */}
      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900 backdrop-blur-sm border-b-2 border-purple-400/50 dark:border-purple-700/50 sticky top-0 z-20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center space-x-2 text-purple-100 hover:text-white transition-all duration-200 hover:translate-x-[-4px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            
            {/* Help Button - Prominent with pulse on first visit */}
            <button
              onClick={() => setShowTour(true)}
              className="relative inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 text-white text-sm font-medium shadow-lg hover:shadow-xl"
            >
              {!localStorage.getItem('hasSeenCareerJourneyWelcome') && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
              )}
              <HelpCircle className="w-4 h-4" />
              <span>How does this work?</span>
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg mb-3">
              Your BA Project Journey
            </h1>
            <p className="text-base md:text-lg text-purple-100 max-w-4xl mx-auto leading-relaxed font-medium">
              Follow the complete BA lifecycle from onboarding to continuous delivery
            </p>
            <div className="mt-5 inline-flex items-center gap-6 bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20">
              <div className="text-center">
                <div className="text-3xl font-black text-white">
                  {progress.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-xs text-purple-200 font-semibold uppercase tracking-wide">Completed</div>
              </div>
              <div className="w-px h-12 bg-purple-300/30"></div>
              <div className="text-center">
                <div className="text-3xl font-black text-white">
                  {CAREER_JOURNEY_PHASES.length}
                </div>
                <div className="text-xs text-purple-200 font-semibold uppercase tracking-wide">Total Phases</div>
              </div>
              <div className="w-px h-12 bg-purple-300/30"></div>
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-300">
                  {Math.round((progress.filter(p => p.status === 'completed').length / CAREER_JOURNEY_PHASES.length) * 100)}%
                </div>
                <div className="text-xs text-purple-200 font-semibold uppercase tracking-wide">Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Component */}
      {showTour && (
        <CareerJourneyTourJoyride 
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
          onOpenPhaseModal={handleTourOpenPhaseModal}
          onClosePhaseModal={handleTourClosePhaseModal}
        />
      )}

      {/* "You Are Here" Enhanced Banner */}
      {CAREER_JOURNEY_PHASES[currentPhaseIndex] && (
        <div className="max-w-7xl mx-auto px-6 py-6 you-are-here-banner">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 rounded-xl p-6 shadow-xl border-2 border-orange-300 dark:border-orange-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center animate-pulse">
                  <Zap className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-orange-100 mb-1">
                    ⚡ You are here
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Phase {CAREER_JOURNEY_PHASES[currentPhaseIndex].order}: {CAREER_JOURNEY_PHASES[currentPhaseIndex].shortTitle}
                  </h3>
                  <p className="text-orange-100 text-sm mt-1">
                    {getPhaseProgress(CAREER_JOURNEY_PHASES[currentPhaseIndex])}% complete
                  </p>
                </div>
              </div>
              <button
                onClick={handleContinuePhase}
                className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                Continue This Phase
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journey Timeline - Beautiful Curved Path */}
      <div className="py-12 relative max-w-full">
        {/* Left Navigation Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full items-center justify-center shadow-2xl hover:scale-110 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {/* Right Navigation Arrow with Hint */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-30 items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-3 shadow-2xl hover:scale-110 transition-all group scroll-right-arrow"
            aria-label="Scroll right"
          >
            <span className="text-sm font-semibold whitespace-nowrap">More phases</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
        
        {/* Constrained horizontal scroll container */}
        <div className="max-w-full overflow-x-auto pb-8 pt-4" ref={scrollContainerRef}>
          <div className="relative min-w-max px-8 max-w-none">
            {/* Curved Path SVG - Purple/Indigo Gradient (Hidden on mobile, visible on desktop) */}
            <svg className="hidden md:block absolute top-[260px] left-0 h-2 pointer-events-none" style={{ zIndex: 0, width: `${CAREER_JOURNEY_PHASES.length * 280}px` }}>
              <defs>
                <linearGradient id="careerPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.4 }} />
                  <stop offset="25%" style={{ stopColor: '#6366f1', stopOpacity: 0.4 }} />
                  <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.4 }} />
                  <stop offset="75%" style={{ stopColor: '#a855f7', stopOpacity: 0.4 }} />
                  <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0.4 }} />
                </linearGradient>
              </defs>
              <path
                d={`M 0 4 Q ${CAREER_JOURNEY_PHASES.length * 60} -10, ${CAREER_JOURNEY_PHASES.length * 280} 4`}
                stroke="url(#careerPathGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            {/* Mobile: Vertical Stack | Desktop: Horizontal Scroll */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-4 relative" style={{ zIndex: 1 }}>
              {CAREER_JOURNEY_PHASES.map((phase, index) => {
                const status = getPhaseStatus(phase);
                const isLocked = status === 'locked';
                const isCompleted = status === 'completed';
                const isInProgress = status === 'in_progress';
                const isClickable = !isLocked || userType === 'existing';
                const isSelected = selectedPhaseIndex === index;
                const isCurrent = currentPhaseIndex === index;
                const isEven = index % 2 === 0;
                const gradientClass = colorClasses[phase.color] || colorClasses['purple'];

                return (
                  <div key={phase.id} className="relative flex flex-col items-center group/phase w-full md:w-[280px]" data-phase-index={index}>
                    {/* Phase Card - Mobile: normal stack | Desktop: Alternates top/bottom */}
                    <div className={`transition-all duration-500 w-full ${isEven ? 'md:mb-32' : 'md:mt-32 md:order-2'}`}>
                      {/* Phase Badge - Outside card at top */}
                      <div className={`flex justify-center mb-3`}>
                        <div className={`inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r ${gradientClass} text-white px-3 py-1.5 rounded-full shadow-md`}>
                          <MapPin className="w-3 h-3" />
                          Phase {phase.order}
                        </div>
                      </div>

                      <div
                        onClick={() => (isLocked && userType === 'new' ? undefined : handlePhaseClick(index))}
                        role="button"
                        aria-disabled={isLocked && userType === 'new'}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!(isLocked && userType === 'new')) handlePhaseClick(index);
                          }
                        }}
                        className={`group relative transition-all duration-500 w-full ${
                          isSelected ? 'scale-105' : 'hover:scale-105'
                        } ${isLocked && userType === 'new' ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'}`}
                        title={isLocked ? 'Complete previous phase to unlock' : 'Click to view full phase details'}
                      >
                        <div className={`relative rounded-xl shadow-2xl border-2 transition-all duration-500 overflow-hidden z-10 ${
                          // Selected state (modal open)
                          isSelected ? 'ring-4 ring-purple-300 dark:ring-purple-600 shadow-2xl shadow-purple-200/50 dark:shadow-purple-900/50 border-purple-500 dark:border-purple-600 bg-gradient-to-br from-white via-gray-50 to-white dark:bg-gray-800' : 
                          // Completed phase - Green background with checkmark feel
                          isCompleted ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-green-900/30 border-green-500 dark:border-green-600 shadow-green-200/50 dark:shadow-green-900/50' :
                          // Current phase (You are here) - Orange/amber background with pulse
                          isInProgress ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-orange-900/30 border-orange-500 dark:border-orange-600 shadow-orange-200/50 dark:shadow-orange-900/50 ring-2 ring-orange-300 dark:ring-orange-700' :
                          // Locked phase - Gray, muted
                          isLocked ? 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800/50 dark:via-gray-700/50 dark:to-gray-800/50 border-gray-300 dark:border-gray-600 opacity-60' :
                          // Not started but unlocked - Original white/clean look
                          'bg-gradient-to-br from-white via-gray-50 to-white dark:bg-gray-800 border-purple-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-purple-100/50 hover:border-purple-400 dark:hover:border-purple-600'
                        }`}>
                          {/* Subtle gradient overlay based on status */}
                          <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{
                            backgroundImage: isCompleted 
                              ? 'linear-gradient(135deg, #10b981 0%, transparent 100%)'  // Green for completed
                              : isInProgress
                              ? 'linear-gradient(135deg, #f59e0b 0%, transparent 100%)'  // Orange for current
                              : isLocked
                              ? 'linear-gradient(135deg, #6b7280 0%, transparent 100%)'  // Gray for locked
                              : `linear-gradient(135deg, ${phase.color === 'purple' ? '#a855f7' : phase.color === 'blue' ? '#3b82f6' : phase.color === 'emerald' ? '#10b981' : phase.color === 'amber' ? '#f59e0b' : phase.color === 'pink' ? '#ec4899' : phase.color === 'indigo' ? '#6366f1' : phase.color === 'cyan' ? '#06b6d4' : '#22c55e'} 0%, transparent 100%)`
                          }} />

                          <div className="relative p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg flex items-center justify-center transform transition-transform duration-300 ${
                                isSelected ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                              }`}>
                                {isCompleted ? <CheckCircle className="w-7 h-7 text-white" /> : isLocked ? <Lock className="w-7 h-7 text-white" /> : <phase.icon className="w-7 h-7 text-white" />}
                              </div>

                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-1">
                                  {phase.shortTitle}
                                </h3>
                              </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
                              {phase.description}
                            </p>

                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-gray-700">
                              <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">{phase.topics.length} topics</span>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                Key Topics
                              </div>
                              {phase.topics.slice(0, 3).map((topic, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradientClass}`} />
                                  <span className="text-xs text-slate-700 dark:text-gray-300 font-medium leading-tight">
                                    {topic.title}
                                  </span>
                                </div>
                              ))}
                              {phase.topics.length > 3 && (
                                <div className="text-xs text-slate-500 dark:text-gray-400 font-medium pl-3.5">
                                  +{phase.topics.length - 3} more topics
                                </div>
                              )}
                            </div>

                            {/* Click to View Full Details - Always Visible */}
                            {!isLocked && (
                              <div className="mb-3">
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-gray-400 font-medium bg-slate-50 dark:bg-gray-700/50 py-2 rounded-lg">
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Click card for full details</span>
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            )}

                            {/* Quick Action Buttons - Show on hover (desktop) or always (mobile) */}
                            {!isLocked && (
                              <div className="pt-3 border-t border-slate-100 dark:border-gray-700 opacity-0 group-hover/phase:opacity-100 md:transition-opacity md:duration-200 opacity-100 md:opacity-0">
                                <div className="text-xs text-center text-slate-500 dark:text-gray-400 mb-2 font-medium">
                                  Quick Actions:
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => handleQuickLearn(phase, e)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r ${gradientClass} text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all hover:scale-105`}
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Learn
                                  </button>
                                  <button
                                    onClick={(e) => handleQuickPractice(phase, e)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold hover:shadow-lg transition-all hover:scale-105"
                                  >
                                    <Target className="w-3.5 h-3.5" />
                                    Practice
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className={`h-1.5 bg-gradient-to-r ${gradientClass}`} />
                        </div>
                      </div>
                    </div>

                    {/* Phase Dot on Path - Hidden on mobile, visible on desktop */}
                    <div className={`hidden md:block absolute ${isEven ? 'bottom-[80px]' : 'top-[80px]'} left-1/2 transform -translate-x-1/2 z-50`}>
                      <div className={`relative w-6 h-6 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg border-4 border-white dark:border-gray-900 transition-all duration-300 ${
                        isSelected ? 'scale-150 ring-4 ring-offset-2 ring-purple-200 dark:ring-purple-600' : isCurrent ? 'scale-125 ring-4 ring-offset-2 ring-orange-200 dark:ring-orange-600' : 'hover:scale-125'
                      }`}>
                        {isCurrent && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-600 animate-ping opacity-75" />
                        )}
                        {isLocked && (
                          <Lock className="absolute inset-0 w-3 h-3 m-auto text-white" />
                        )}
                      </div>

                      {/* "You are here" indicator - Always visible on desktop, inherits z-50 from parent */}
                      {isCurrent && (
                        <div className={`absolute ${isEven ? 'bottom-full mb-4' : 'top-full mt-4'} left-1/2 transform -translate-x-1/2 whitespace-nowrap`}>
                          <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                            ⚡ You are here
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Mobile "You are here" indicator - Show on mobile below card */}
                    {isCurrent && (
                      <div className="md:hidden mt-3 flex justify-center">
                        <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg inline-flex items-center gap-2">
                          <Zap className="w-3 h-3" />
                          <span>You are here</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Phase Detail Modal */}
      {selectedPhaseData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhaseIndex(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden phase-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const phase = selectedPhaseData;
              const status = getPhaseStatus(phase);
              const phaseProgress = progress.find(p => p.phase_id === phase.id);
              const gradientClass = colorClasses[phase.color] || colorClasses['purple'];

              return (
                <>
                  {/* Modal Header */}
                  <div className={`bg-gradient-to-r ${gradientClass} p-8 text-white relative`}>
                    <button
                      onClick={() => setSelectedPhaseIndex(null)}
                      className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200 z-10"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 mb-3 pr-14">
                      <phase.icon className="w-12 h-12" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full inline-block mb-2">
                          Phase {phase.order}
                        </div>
                        <h2 className="text-3xl font-bold">{phase.title}</h2>
                      </div>
                    </div>
                    <p className="text-purple-50 text-lg">{phase.realWorldContext}</p>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="mb-8 phase-modal-topics">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <phase.icon className="w-5 h-5" />
                        Topics & Activities
                      </h3>
                      <div className="space-y-4">
                        {phase.topics.map((topic, topicIndex) => {
                          const isTopicCompleted = phaseProgress?.completed_topics?.includes(topic.id);
                          const isPhaseClickable = status !== 'locked' || userType === 'existing';
                          const isClickable = topic.viewId && isPhaseClickable;

                          return (
                            <div 
                              key={topic.id} 
                              onClick={() => isClickable && handleTopicClick(topic)}
                              className={`border-2 rounded-xl p-5 transition-all duration-200 ${
                                isTopicCompleted ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20' :
                                'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20'
                              } ${isClickable ? 'hover:shadow-md cursor-pointer hover:border-purple-400 dark:hover:border-purple-500' : ''}`}
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0`}>
                                  {isTopicCompleted ? <CheckCircle className="w-5 h-5 text-white" /> : topic.viewId ? <Play className="w-5 h-5 text-white" /> : <span className="text-white font-bold text-sm">{topicIndex + 1}</span>}
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-bold text-slate-800 dark:text-white mb-1">{topic.title}</h4>
                                  <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed">{topic.description}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deliverables & Stakeholders */}
                    {((phase as any).deliverables || (phase as any).stakeholders) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        {/* Key Deliverables */}
                        {(phase as any).deliverables && (phase as any).deliverables.length > 0 && (
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              Key Deliverables
                            </h3>
                            <ul className="space-y-2">
                              {(phase as any).deliverables.map((deliverable: string, index: number) => (
                                <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-gray-300">
                                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                  <span>{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Key Stakeholders */}
                        {(phase as any).stakeholders && (phase as any).stakeholders.length > 0 && (
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                              <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              Key Stakeholders
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {(phase as any).stakeholders.map((stakeholder: string, index: number) => (
                                <span
                                  key={index}
                                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium border-2 border-blue-200 dark:border-blue-800"
                                >
                                  {stakeholder}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* WHERE TO LEARN & PRACTICE THIS PHASE - NEW SECTION */}
                    <div className="mt-8 pt-8 border-t-2 border-purple-200 dark:border-purple-700 phase-modal-learning">
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        Where to Learn & Practice This Phase
                      </h3>
                      <p className="text-slate-600 dark:text-gray-400 mb-6">
                        This phase connects to specific areas in the app where you can learn, practice, and apply these skills.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Learning Module Link */}
                        {(() => {
                          const moduleInfo = getPhaseModuleInfo(phase);
                          if (!moduleInfo) return null;
                          
                          const colors = getColorClasses(phase.color);
                          const gradientClass = colorClasses[phase.color] || colorClasses['purple'];
                          
                          return (
                            <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-5 hover:shadow-lg transition-all duration-200`}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                                  <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                    Learning
                                  </div>
                                  <div className="text-sm font-bold text-slate-800 dark:text-white">
                                    {moduleInfo.isMultiple ? `${moduleInfo.modules.length} Modules` : moduleInfo.modules[0].name}
                                  </div>
                                </div>
                              </div>
                              
                              {/* List all modules */}
                              <div className="space-y-2">
                                {moduleInfo.modules.map((module, idx) => (
                                  <button
                                    key={idx} 
                                    className={`w-full flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 cursor-pointer hover:${colors.bg} transition-all group`}
                                    onClick={() => {
                                      localStorage.setItem('previousView', 'career-journey');
                                      setCurrentView(module.viewId as any);
                                      setSelectedPhaseIndex(null);
                                    }}>
                                    <Play className={`w-4 h-4 ${colors.text} group-hover:${colors.hover}`} />
                                    <span className="font-medium flex-1 text-left">{module.name}</span>
                                    <ArrowRight className={`w-4 h-4 ${colors.text} group-hover:translate-x-1 transition-transform`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Practice Link */}
                        {(() => {
                          const practiceInfo = getPhasePracticeInfo(phase);
                          if (!practiceInfo) return (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-5 opacity-60">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                                  <Target className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Practice
                                  </div>
                                  <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                    General Practice
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                No specific practice module available for this phase yet
                              </p>
                            </div>
                          );
                          
                          const colors = getColorClasses(phase.color);
                          const gradientClass = colorClasses[phase.color] || colorClasses['purple'];
                          
                          return (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                                  <Target className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                                    Practice
                                  </div>
                                  <div className="text-sm font-bold text-slate-800 dark:text-white">
                                    {practiceInfo.isMultiple ? `${practiceInfo.modules.length} Modules` : practiceInfo.modules[0].name}
                                  </div>
                                </div>
                              </div>
                              
                              {/* List all practice modules */}
                              <div className="space-y-2">
                                {practiceInfo.modules.map((module, idx) => (
                                  <button
                                    key={idx} 
                                    className={`w-full flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 cursor-pointer hover:${colors.bg} transition-all group`}
                                    onClick={() => {
                                      setCurrentView(module.viewId as any);
                                      setSelectedPhaseIndex(null);
                                    }}>
                                    <Play className={`w-4 h-4 ${colors.text} group-hover:${colors.hover}`} />
                                    <span className="font-medium flex-1 text-left">{module.name}</span>
                                    <ArrowRight className={`w-4 h-4 ${colors.text} group-hover:translate-x-1 transition-transform`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Hands-On Project Link */}
                        <div className="bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                             onClick={() => setCurrentView('project-flow')}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                              <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                                Apply
                              </div>
                              <div className="text-sm font-bold text-slate-800 dark:text-white">
                                Hands-On Project
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-gray-300 mb-3">
                            Apply these skills to your real hands-on BA project
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600 dark:text-gray-400">
                              Click to work on project
                            </span>
                            <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Recommended Learning Path with Specific Modules */}
                      <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-600 rounded-lg p-5">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-base">Recommended Learning Path for This Phase</h4>
                            {(() => {
                              const moduleInfo = getPhaseModuleInfo(phase);
                              if (!moduleInfo) return null;
                              
                              return (
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3">
                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">1</span>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-slate-800 dark:text-white">Learn the Concepts</p>
                                      <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                                        {moduleInfo.modules.length === 1 
                                          ? `Study ${moduleInfo.modules[0].name}` 
                                          : `Study ${moduleInfo.modules.length} modules: ${moduleInfo.modules.map(m => m.name.replace('Module ', '')).join(', ')}`
                                        }
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-3">
                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">2</span>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-slate-800 dark:text-white">Practice with AI</p>
                                      <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                                        Practice these skills with AI stakeholders in realistic scenarios
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-3">
                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">3</span>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-slate-800 dark:text-white">Apply to Project</p>
                                      <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                                        Apply what you learned to your hands-on BA project
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Journey Guide */}
      {!selectedPhaseData && (
        <div className="max-w-4xl mx-auto px-6 py-12 journey-guide">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Your BA Career Simulation
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              This journey simulates your first major BA project from start to finish. Each phase represents a real stage
              in the BA workflow, with topics that teach you exactly what BAs do at each point.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Click any phase to explore topics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">See what you'll learn and do in each stage</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Play className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Topics with play icons are interactive</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click to start practice sessions or view content</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {userType === 'new' ? 'Complete phases in order to unlock next' : 'All phases unlocked for you'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userType === 'new' 
                      ? 'Build your skills progressively through the complete BA workflow'
                      : 'We recommend following the sequence for the best learning experience'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerJourneyView;
