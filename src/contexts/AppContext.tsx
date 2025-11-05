import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useAdmin } from './AdminContext'
import { mockProjects, mockStakeholders } from '../data/mockData'
import { Project, Stakeholder, Meeting, Deliverable, AppView } from '../types'
import { MeetingDataService } from '../lib/meetingDataService'
import { supabase } from '../lib/supabase'
import LockMessageToast from '../components/LockMessageToast'
import { getUserPhase, isPageAccessible } from '../utils/userProgressPhase'
import { ElicitationAccess, getElicitationAccess } from '../utils/elicitationProgress'
import { saveResumeState, loadResumeState, isReturnableRoute, getPageTitle } from '../services/resumeStore'
import type { PageType } from '../types/resume'

interface AppContextType {
  // Hydration state
  isHydrated: boolean
  
  // Current view
  currentView: AppView
  setCurrentView: (view: AppView) => void | Promise<void>
  
  // Project data
  projects: Project[]
  selectedProject: Project | null
  setSelectedProject: (project: Project | null) => void
  selectProject: (project: Project) => Promise<void>
  
  // Stakeholder data
  stakeholders: Stakeholder[]
  selectedStakeholders: Stakeholder[]
  setSelectedStakeholders: (stakeholders: Stakeholder[]) => void
  
  // Meeting data
  meetings: Meeting[]
  currentMeeting: Meeting | null
  setCurrentMeeting: (meeting: Meeting | null) => void
  selectedMeeting: any | null
  setSelectedMeeting: (meeting: any | null) => void
  
  // Deliverables
  deliverables: Deliverable[]
  addDeliverable: (deliverable: Deliverable) => void
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void
  
  // Custom project data
  customProject: Project | null
  setCustomProject: (project: Project) => void
  
  // User data
  user: any
  userProgress: any
  studentSubscription: any
  
  // Subscription and limits
  userSubscription: {
    tier: 'free' | 'premium' | 'enterprise';
    maxProjects: number;
    status: string;
  } | null
  userProjectCount: number
  userSelectedProjects: string[]
  
  // Elicitation practice access
  elicitationAccess: ElicitationAccess | null
  refreshElicitationAccess: () => Promise<void>
  
  // Utility functions
  canAccessProject: (projectId: string) => boolean
  canSaveNotes: () => boolean
  canCreateMoreMeetings: () => boolean
  refreshMeetingData: () => Promise<void>
  
  // Loading state
  isLoading: boolean
  
  // Lock message state
  lockMessage: string | null
  clearLockMessage: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  
  // Track hydration state to prevent blink effect - start as true to prevent flash
  const [isHydrated, setIsHydrated] = useState(true)
  
  // Track previous user state to detect actual logout vs initial loading
  const prevUser = useRef(user)
  
  // Lock message state
  const [lockMessage, setLockMessage] = useState<string | null>(null)
  
  // Subscription and project limit state
  const [userSubscription, setUserSubscription] = useState<{
    tier: 'free' | 'premium' | 'enterprise';
    maxProjects: number;
    status: string;
  } | null>(null)
  const [userSelectedProjects, setUserSelectedProjects] = useState<string[]>([])
  const [userProjectCount, setUserProjectCount] = useState(0)
  
  // Elicitation practice access state
  const [elicitationAccess, setElicitationAccess] = useState<ElicitationAccess | null>(null)

  // Initialize currentView from localStorage or default to dashboard for returning users
  const [currentView, setCurrentViewState] = useState<AppView>(() => {
    console.log('🔍 INIT: AppContext initializing currentView...')
    
    try {
      const savedView = localStorage.getItem('currentView')
      console.log('🔍 INIT: Found saved view in localStorage:', savedView)
      
      // Check onboarding status to determine if welcome page should be accessible
      const onboardingCompleted = localStorage.getItem('onboardingCompleted')
      const isOnboardingInProgress = localStorage.getItem('onboardingInProgress')
      
      // For existing users who don't have onboarding flags, assume they've completed onboarding
      if (!onboardingCompleted && !isOnboardingInProgress) {
        console.log('🔍 INIT: No onboarding flags found, assuming user has completed onboarding')
        localStorage.setItem('onboardingCompleted', 'true')
      }
      
      // If user has completed onboarding and is trying to access welcome page, redirect to dashboard
      if (savedView === 'welcome' && localStorage.getItem('onboardingCompleted') === 'true') {
        console.log('🔍 INIT: User has completed onboarding, preventing access to welcome page')
        return 'dashboard'
      }
      
      // SAFETY CHECK: If no saved view exists (first time after onboarding), default to dashboard
      if (!savedView) {
        console.log('🔍 INIT: No saved view found, defaulting to dashboard')
        return 'dashboard'
      }
      
      // Validate that the saved view is a valid AppView
      const validViews: AppView[] = [
        'welcome',
        'get-started',
        'dashboard',
        'learn',
        'learning-hub',
        'core-learning',
        'practice',
        'motivation',
        'project',
        'core-concepts',
        'agile-hub',
        'agile-scrum',
        'scrum-essentials',
        'scrum-learning',
        'agile-practice',
        'user-story-checker',
        'my-meetings',
        'voice-meeting',
        'settings',
        'profile',
        'custom-project',
        'create-project',
        'custom-stakeholders',
        'project-workspace',
        'projects',
        'project-brief',
        'stakeholders',
        'meeting-mode-selection',
        'meeting',
        'voice-only-meeting',
        'elevenlabs-meeting',
        'individual-agent-meeting',
        'meeting-history',
        'meeting-summary',
        'raw-transcript',
        'notes',
        'training-hub',
        'training-hub-project-selection',
        'practice-hub-cards',
        'training-practice',
        'training-assess',
        'training-feedback',
        'training-dashboard',
        'training-deliverables',
        'project-deliverables',
        'progress-tracking',
        'deliverables',
        'portfolio',
        'advanced-topics',
        'meeting-details',
        'enhanced-training-flow',
        'analysis',
        'ba-fundamentals',
        'process-mapper',
        'ai-process-mapper',
        'process-mapper-editor',
        'diagram-creation',
        'project-setup',
        'structured-training',
        'pre-brief',
        'live-training-meeting',
        'post-brief',
        // 'community-hub', // Archived for MVP
        // 'community-admin', // Archived for MVP
        'admin',
        'admin-panel',
        // Learning pages that were missing
        'project-initiation',
        'requirements-engineering',
        'documentation',
        'documentation-practice',
        'my-resources',
        'solution-options',
        'design-hub',
        'mvp-hub',
        'mvp-engine',
        'mvp-practice',
        'elicitation',
        'practice-2',
        'elicitation-hub',
        'scrum-practice',
        'my-mentorship',
        'book-session',
        'mentor-feedback',
        'career-coaching',
        'my-progress-mentor',
        'contact-us',
        'admin-contact-submissions',
        'faq',
        'career-journey',
        'learning-flow',
        'practice-flow',
        'project-flow'
      ];
      if (savedView && validViews.includes(savedView as AppView)) {
        console.log('✅ INIT: Restoring valid view from localStorage:', savedView)
        return savedView as AppView
      } else {
        console.log('⚠️ INIT: Invalid or missing saved view, using saved view as-is if exists:', savedView)
        // Return the saved view even if not in list, to preserve user's last page
        return (savedView as AppView) || 'dashboard'
      }
    } catch (error) {
      console.log('❌ INIT: Error loading saved view, defaulting to dashboard:', error)
      return 'dashboard'
    }
  })

  // Custom setCurrentView that handles localStorage automatically
  // Also enforces navigation locks for 'new' students
  const setCurrentView = async (view: AppView) => {
    console.log('🔄 NAVIGATE: setCurrentView called with view:', view)
    console.log('🔄 NAVIGATE: user?.id =', user?.id)
    
    // For 'new' students: ONLY Dashboard, Learning Journey, and My Resources are accessible
    // Everything else (Practice, Projects, Mentor, Handbook, Learning pages, etc.) is LOCKED
    const alwaysAllowed = [
      'dashboard',
      'learning-flow',    // Learning Journey hub page
      'career-journey',   // BA Project Journey - always accessible to see their progress
      // practice-flow and project-flow removed - they unlock progressively via isPageAccessible()
      'my-resources',
      'ba-reference',     // Resources section
      'handbook',         // My Resources includes Handbook
      'profile',
      'welcome',
      'motivation'
    ];

    // Check if this page should be locked for 'new' students
    const isLearningPage = [
      'core-learning', 'project-initiation', 'elicitation', 'process-mapper',
      'requirements-engineering', 'solution-options', 'documentation',
      'design-hub', 'mvp-hub', 'scrum-essentials', 'agile-hub'
    ].includes(view);

    // CRITICAL: ADMINS BYPASS ALL CONTENT LOCKS
    if (isAdmin) {
      console.log('✅ NAVIGATE: Admin user detected, bypassing ALL content locks');
      setLockMessage(null);
      // Skip all navigation lock checks - proceed directly to navigation
    }
    // Navigation locks for 'new' students - progressive unlock system
    else if (!alwaysAllowed.includes(view)) {
      try {
        // Check if user is 'new' type
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type, user_id, is_admin, is_super_admin, is_senior_admin')
          .eq('user_id', user?.id)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle missing profiles gracefully
        
        console.log('🔍 NAVIGATE: User profile query result:', { 
          userProfile, 
          profileError, 
          userId: user?.id,
          errorCode: profileError?.code,
          errorMessage: profileError?.message
        });
        
        // If query failed, check if it's an RLS error
        if (profileError) {
          console.error('❌ NAVIGATE: Failed to fetch user profile - BYPASSING locks to prevent false lockouts', profileError);
          setLockMessage(null);
          // Don't block on DB errors - fail open for existing users
        }
        // DOUBLE CHECK: If user has admin flags in DB, bypass all locks
        else if (userProfile?.is_admin || userProfile?.is_super_admin || userProfile?.is_senior_admin) {
          console.log('✅ NAVIGATE: DB admin flags detected, bypassing ALL content locks');
          setLockMessage(null);
          // Skip navigation locks
        }
        // If user_type is 'existing', bypass all locks
        else if (userProfile?.user_type === 'existing') {
          console.log('✅ NAVIGATE: Existing user detected, bypassing ALL content locks');
          setLockMessage(null);
          // Skip navigation locks for existing users
        } else {
          // Only apply locks for 'new' users or when user_type is explicitly set to 'new'
          const userType = userProfile?.user_type || 'new';
          console.log('🔐 NAVIGATE: Checking navigation permission for:', view, 'User type:', userType);

        if (userType === 'new') {
          // Get user's current phase (learning, practice, or hands-on)
          const phase = await getUserPhase(user?.id || '');
          const canAccess = isPageAccessible(view, phase, userType);

          console.log('📊 User phase:', phase, 'User type:', userType, 'Can access', view, '?', canAccess);

          if (!canAccess) {
            // Generic, user-type aware lock message
            let lockMessage = '';
            
            if (userType === 'new') {
              // Check actual progress for contextual encouragement
              const { data: learningProgress } = await supabase
                .from('learning_progress')
                .select('status')
                .eq('user_id', user?.id || '');
              
              const completedModules = learningProgress?.filter((p: any) => p.status === 'completed').length || 0;
              
              // Generic message based on user type and progress
              const header = '🎓 New User Learning Path\n\n';
              
              if (phase === 'learning') {
                // Trying to access practice section while still in learning phase
                if (completedModules === 0) {
                  lockMessage = `${header}This section unlocks as you progress through the Learning Journey.\n\nContinue learning to unlock more features.`;
                } else {
                  lockMessage = `${header}Continue your Learning Journey to unlock this section.\n\nKeep going - you're making progress!`;
                }
              } else if (phase === 'practice') {
                // Trying to access hands-on section while in practice phase
                if (completedModules >= 8) {
                  lockMessage = `${header}Almost there! Complete your learning modules to unlock this section.\n\nYou're very close!`;
                } else {
                  lockMessage = `${header}This section unlocks as you complete more modules.\n\nKeep learning and practicing!`;
                }
              } else {
                // Generic fallback
                lockMessage = `${header}This section will unlock as you progress.\n\nContinue your learning journey!`;
              }
            } else {
              // Existing users shouldn't see this, but provide fallback
              lockMessage = 'This section is currently locked.\n\nPlease contact support if you believe this is an error.';
            }

            console.log('🚫 BLOCKING navigation to:', view);
            console.log('🎯 BUT updating currentView for sidebar highlight');
            
            // Update currentView so sidebar shows the locked page
            setCurrentViewState(view);
            localStorage.setItem('currentView', view);
            
            // Show lock message
            setLockMessage(lockMessage);
            return; // Block navigation (don't render the page, just show lock screen)
          } else {
            console.log('✅ NAVIGATE: Page accessible for new user, clearing lock message');
            setLockMessage(null);
          }
          } else {
            // Existing user - always clear lock message
            console.log('✅ NAVIGATE: Existing user, clearing lock message');
            setLockMessage(null);
          }
        } // End of isDbAdmin else block
      } catch (error) {
        console.error('Error checking navigation permissions:', error);
      }
    } else {
      // Page in alwaysAllowed list - clear lock message
      console.log('✅ NAVIGATE: Page in alwaysAllowed list, clearing lock message');
      setLockMessage(null);
    }

    console.log('🔄 NAVIGATE: Previous view was:', currentView)
    console.log('🔄 NAVIGATE: About to set view to:', view)
    console.log('🔄 NAVIGATE: Calling setCurrentViewState...')
    
    setCurrentViewState(view)
    console.log('✅ NAVIGATE: setCurrentViewState called with:', view)
    
    try {
      localStorage.setItem('currentView', view)
      console.log('💾 NAVIGATE: Saved view to localStorage:', view)
      
      // Route capture: Save resume state for "Continue where you left off" feature
      if (user?.id) {
        // Determine page type based on view
        let pageType: PageType = 'dashboard';
        
        // Learning pages
        const learningPages = [
          'core-learning', 'project-initiation', 'requirements-engineering', 
          'solution-options', 'documentation', 'design-hub', 'mvp-hub',
          'stakeholder-mapping', 'elicitation', 'process-mapper', 'scrum-essentials',
          'agile-scrum', 'scrum-learning', 'learning-hub', 'core-concepts'
        ];
        
        // Practice pages
        const practicePages = [
          'training-practice', 'practice', 'practice-2', 'training-assess',
          'meeting', 'voice-only-meeting', 'voice-meeting-v2', 'scrum-practice',
          'documentation-practice'
        ];
        
        // Project pages
        const projectPages = [
          'projects', 'project', 'project-brief', 'custom-project', 'create-project',
          'project-workspace', 'project-flow', 'mvp-engine'
        ];
        
        if (learningPages.includes(view)) {
          pageType = 'learning';
        } else if (practicePages.includes(view)) {
          pageType = 'practice';
        } else if (projectPages.includes(view)) {
          pageType = 'project';
        } else if (view === 'admin' || view === 'admin-panel') {
          pageType = 'admin';
        } else if (view === 'dashboard' || view === 'welcome' || view === 'get-started') {
          pageType = 'dashboard';
        } else if (view === 'profile' || view === 'settings') {
          pageType = 'settings';
        }
        
        // Only save resume state if it's a returnable route
        if (isReturnableRoute(view) && pageType !== 'dashboard' && pageType !== 'admin' && pageType !== 'settings') {
          // Capture current scroll position
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          
          // Try to capture tab/step info from common patterns
          // This will be enhanced per-view later, but captures common cases now
          let tabId: string | undefined;
          let stepId: string | undefined;
          
          // Check for active tab in common UI patterns
          const activeTabElement = document.querySelector('[aria-selected="true"]') || 
                                   document.querySelector('.tab-active') ||
                                   document.querySelector('[data-active-tab]');
          if (activeTabElement) {
            tabId = activeTabElement.getAttribute('data-tab-id') || 
                    activeTabElement.getAttribute('id') ||
                    activeTabElement.textContent?.trim().toLowerCase().replace(/\s+/g, '-');
          }
          
          // Check for active step/lesson
          const activeStepElement = document.querySelector('[data-active-step]') ||
                                    document.querySelector('.step-active') ||
                                    document.querySelector('[aria-current="step"]');
          if (activeStepElement) {
            const stepIdAttr = activeStepElement.getAttribute('data-step-id') || activeStepElement.getAttribute('id');
            stepId = stepIdAttr || undefined;
          }
          
          saveResumeState({
            userId: user.id,
            path: view,
            pageType: pageType,
            pageTitle: getPageTitle(view),
            projectId: selectedProject?.id,
            scrollY: scrollY > 0 ? scrollY : undefined,
            tabId: tabId,
            stepId: stepId,
            exitReason: 'nav-away',
          });
          console.log('💾 RESUME: Saved resume state for view:', view, 'pageType:', pageType, 'scrollY:', scrollY);
        }
      }
      
      console.log('🎯 NAVIGATE: Navigation complete. React should re-render with new currentView:', view)
    } catch (error) {
      console.log('❌ NAVIGATE: Could not save view to localStorage:', error)
    }
  }
  
  // Initialize selectedProject from localStorage
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(() => {
    try {
      const savedProject = localStorage.getItem('selectedProject')
      if (savedProject) {
        console.log('✅ INIT: Restoring selectedProject from localStorage:', JSON.parse(savedProject).name)
        return JSON.parse(savedProject)
      }
      return null
    } catch (error) {
      console.log('❌ INIT: Error loading selectedProject from localStorage:', error)
      return null
    }
  })

  // Initialize selectedStakeholders as empty - don't restore from localStorage to avoid auto-selection
  const [selectedStakeholders, setSelectedStakeholdersState] = useState<Stakeholder[]>(() => {
    console.log('✅ INIT: Starting with empty selectedStakeholders to avoid auto-selection')
    return []
  })

  // Initialize customProject from localStorage
  const [customProject, setCustomProjectState] = useState<Project | null>(() => {
    try {
      const savedCustomProject = localStorage.getItem('customProject')
      if (savedCustomProject) {
        console.log('✅ INIT: Restoring customProject from localStorage:', JSON.parse(savedCustomProject).name)
        return JSON.parse(savedCustomProject)
      }
      return null
    } catch (error) {
      console.log('❌ INIT: Error loading customProject from localStorage:', error)
      return null
    }
  })

  // Custom setters that handle localStorage automatically
  const setSelectedProject = (project: Project | null) => {
    console.log('🎯 PROJECT: setSelectedProject called with:', project?.name || 'null')
    setSelectedProjectState(project)
    try {
      if (project) {
        localStorage.setItem('selectedProject', JSON.stringify(project))
        console.log('💾 PROJECT: Saved selectedProject to localStorage:', project.name)
      } else {
        localStorage.removeItem('selectedProject')
        console.log('💾 PROJECT: Removed selectedProject from localStorage')
      }
    } catch (error) {
      console.log('❌ PROJECT: Could not save selectedProject to localStorage:', error)
    }
  }

  const setSelectedStakeholders = (stakeholders: Stakeholder[]) => {
    console.log('👥 STAKEHOLDERS: setSelectedStakeholders called with:', stakeholders.length, 'stakeholders')
    setSelectedStakeholdersState(stakeholders)
    try {
      localStorage.setItem('selectedStakeholders', JSON.stringify(stakeholders))
      console.log('💾 STAKEHOLDERS: Saved selectedStakeholders to localStorage')
    } catch (error) {
      console.log('❌ STAKEHOLDERS: Could not save selectedStakeholders to localStorage:', error)
    }
  }

  const setCustomProject = (project: Project | null) => {
    console.log('🛠️ CUSTOM: setCustomProject called with:', project?.name || 'null')
    setCustomProjectState(project)
    try {
      if (project) {
        localStorage.setItem('customProject', JSON.stringify(project))
        console.log('💾 CUSTOM: Saved customProject to localStorage:', project.name)
      } else {
        localStorage.removeItem('customProject')
        console.log('💾 CUSTOM: Removed customProject from localStorage')
      }
    } catch (error) {
      console.log('❌ CUSTOM: Could not save customProject to localStorage:', error)
    }
  }

  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mark app as ready at HTML level to prevent any blink
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.markAppReady) {
        window.markAppReady()
        console.log('✅ APP: Marked as ready at HTML level - no more blink!')
      }
    }, 100) // Small delay to ensure everything is rendered
    
    return () => clearTimeout(timer)
  }, [user, currentView]) // Wait for user and view to be set

  // Clear view state on actual logout (not during initial load)
  useEffect(() => {
    console.log('🔍 USER_EFFECT: useEffect triggered with user:', user ? 'logged in' : user === null ? 'logged out' : 'undefined/loading')
    console.log('🔍 USER_EFFECT: Previous user was:', prevUser.current ? 'logged in' : prevUser.current === null ? 'logged out' : 'undefined/loading')
    console.log('🔍 USER_EFFECT: Current view is:', currentView)
    
    // Only clear if we had a logged-in user before and now we're explicitly logged out
    if (prevUser.current && user === null) {
      console.log('👋 USER_EFFECT: Actual logout detected, saving resume state before clearing')
      
      // IMPORTANT: Save resume state BEFORE clearing anything (if user was on a returnable page)
      const currentViewOnLogout = currentView || localStorage.getItem('currentView');
      if (prevUser.current?.id && currentViewOnLogout) {
        // Check if current view is returnable
        if (isReturnableRoute(currentViewOnLogout)) {
          // Determine page type
          let pageType: PageType = 'dashboard';
          const learningPages = ['core-learning', 'project-initiation', 'requirements-engineering', 
            'solution-options', 'documentation', 'design-hub', 'mvp-hub',
            'stakeholder-mapping', 'elicitation', 'process-mapper', 'scrum-essentials'];
          const practicePages = ['training-practice', 'practice', 'meeting', 'voice-only-meeting'];
          const projectPages = ['projects', 'project', 'custom-project', 'create-project'];
          
          if (learningPages.includes(currentViewOnLogout)) pageType = 'learning';
          else if (practicePages.includes(currentViewOnLogout)) pageType = 'practice';
          else if (projectPages.includes(currentViewOnLogout)) pageType = 'project';
          
          if (pageType !== 'dashboard') {
            // Capture scroll and state
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            
            // Try to capture active topic/step for core-learning
            let stepId: string | undefined;
            if (currentViewOnLogout === 'core-learning') {
              // Check for selected topic using data attributes
              const activeTopicElement = document.querySelector('[data-active-topic="true"]');
              if (activeTopicElement) {
                const topicIdAttr = activeTopicElement.getAttribute('data-topic-id') || activeTopicElement.getAttribute('data-lesson-id');
                stepId = topicIdAttr || undefined;
              }
              
              // Fallback: check localStorage for selectedTopicId (CoreLearning2View saves this)
              if (!stepId && prevUser.current?.id) {
                try {
                  // Try to get the last viewed topic from resume state
                  // Since we can't access component state here, we'll rely on DOM or resume state
                  const resumeState = loadResumeState(prevUser.current.id);
                  if (resumeState && resumeState.stepId) {
                    stepId = resumeState.stepId;
                  }
                } catch (error) {
                  console.warn('Error checking localStorage for topic:', error);
                }
              }
            }
            
            saveResumeState({
              userId: prevUser.current.id,
              path: currentViewOnLogout,
              pageType: pageType,
              pageTitle: getPageTitle(currentViewOnLogout),
              scrollY: scrollY > 0 ? scrollY : undefined,
              stepId: stepId,
              exitReason: 'logout',
            });
            console.log('💾 RESUME: Saved resume state on logout', { 
              path: currentViewOnLogout, 
              pageType, 
              scrollY, 
              stepId: stepId || 'none',
              userId: prevUser.current.id
            });
            
            // Verify it was saved
            const verifyState = loadResumeState(prevUser.current.id);
            console.log('✅ RESUME: Verified saved state exists:', !!verifyState, verifyState ? { path: verifyState.path, stepId: verifyState.stepId } : null);
          }
        }
      }
      
      // Check if this is a device lock error (don't redirect to dashboard)
      const deviceLockError = localStorage.getItem('deviceLockError')
      if (deviceLockError) {
        console.log('🔐 USER_EFFECT: Device lock error detected, staying on login page')
        // Don't remove deviceLockError here - let LoginSignup component handle it
        // Force view to welcome (which will show login form) to show error
        setCurrentViewState('welcome')
        localStorage.setItem('currentView', 'welcome')
        // Store device lock error flag to show login form immediately
        localStorage.setItem('showLoginForm', 'true')
        setSelectedProjectState(null)
        setSelectedStakeholdersState([])
        setCustomProjectState(null)
      } else {
        console.log('👋 USER_EFFECT: Normal logout, redirecting to dashboard')
        localStorage.removeItem('currentView')
        localStorage.removeItem('selectedProject')
        localStorage.removeItem('selectedStakeholders')
        localStorage.removeItem('customProject')
        // NOTE: We don't clear resume_state - that persists across sessions
        setCurrentViewState('dashboard')
        setSelectedProjectState(null)
        setSelectedStakeholdersState([])
        setCustomProjectState(null)
      }
    } else if (user) {
      console.log('✅ USER_EFFECT: User is logged in, preserving current state')
      console.log('✅ USER_EFFECT: Current view:', currentView)
      console.log('✅ USER_EFFECT: Selected project:', selectedProject?.name || 'none')
      
      // Check if user needs onboarding (only for non-admin users)
      if (!adminLoading && !isAdmin) {
        // Check if user has completed onboarding
        let onboardingCompleted = localStorage.getItem('onboardingCompleted')
        const isOnboardingInProgress = localStorage.getItem('onboardingInProgress')
        
        // For existing users who don't have onboarding flags, assume they've completed onboarding
        if (!onboardingCompleted && !isOnboardingInProgress) {
          console.log('🎯 ONBOARDING: No onboarding flags found, assuming user has completed onboarding')
          localStorage.setItem('onboardingCompleted', 'true')
          onboardingCompleted = 'true'
        }
        
        console.log('🎯 ONBOARDING: Raw localStorage values:', {
          onboardingCompleted: localStorage.getItem('onboardingCompleted'),
          isOnboardingInProgress: localStorage.getItem('onboardingInProgress')
        })
        
        // Temporary debug: Add a way to manually complete onboarding
        if (typeof window !== 'undefined') {
          (window as any).completeOnboarding = () => {
            localStorage.setItem('onboardingCompleted', 'true');
            localStorage.removeItem('onboardingInProgress');
            console.log('🎯 ONBOARDING: Manually completed onboarding');
            window.location.reload();
          };
          (window as any).resetOnboarding = () => {
            localStorage.removeItem('onboardingCompleted');
            localStorage.removeItem('onboardingInProgress');
            console.log('🎯 ONBOARDING: Manually reset onboarding');
            window.location.reload();
          };
        }
        
        console.log('🎯 ONBOARDING: Checking onboarding state:', { 
          onboardingCompleted: onboardingCompleted, 
          isOnboardingInProgress: isOnboardingInProgress,
          currentView 
        })
        
        // If user is on dashboard but hasn't completed onboarding, redirect to welcome
        if (currentView === 'dashboard' && !onboardingCompleted && !isOnboardingInProgress) {
          console.log('🎯 ONBOARDING: User needs onboarding, redirecting to welcome page')
          setCurrentViewState('welcome')
          localStorage.setItem('currentView', 'welcome')
        }
      }
      
      // Admin users should be redirected to admin panel immediately
      // Wait for admin loading to complete before making redirect decisions
      if (!adminLoading && isAdmin) {
        // If admin is on welcome page, redirect to admin dashboard
        if (currentView === 'welcome') {
          console.log('🔐 ADMIN_EFFECT: Admin user on welcome, redirecting to admin dashboard')
          setCurrentViewState('admin')
          localStorage.setItem('currentView', 'admin')
        }
        // Check if admin is trying to access any student/training content
        const studentViews = [
          'learn', 'practice', 'training-hub', 'training-practice', 'training-assess', 
          'training-feedback', 'training-dashboard', 'core-concepts', 'agile-hub', 
          'agile-scrum', 'scrum-essentials', 'agile-practice', 'user-story-checker',
          'mvp-practice', 'documentation-practice', 'elicitation-practice', 'elicitation',
          'project-initiation', 'requirements-engineering', 'solution-options', 'design',
          'mvp', 'motivation', 'my-mentorship', 'book-session' // 'community-hub' archived for MVP
        ];
        
        if (studentViews.includes(currentView) || currentView === 'welcome') {
          console.log('🔐 ADMIN_EFFECT: Admin user detected accessing student content, redirecting to admin panel')
          console.log('🔐 ADMIN_EFFECT: Current view that triggered redirect:', currentView)
          setCurrentViewState('admin')
          localStorage.setItem('currentView', 'admin')
        }
      } else if (adminLoading) {
        console.log('🔐 ADMIN_EFFECT: Admin status still loading, waiting...')
      }
    } else {
      console.log('⏳ USER_EFFECT: User state is loading or no change, doing nothing')
    }
    
    // Update previous user reference
    prevUser.current = user
  }, [user, currentView, selectedProject, isAdmin, adminLoading])

  // Set default view for admin users on initial load - redirect from ANY student content
  useEffect(() => {
    if (user && !adminLoading && isAdmin) {
      // If admin is on dashboard, redirect to admin panel immediately
      if (currentView === 'dashboard') {
        console.log('🔐 ADMIN_INIT: Admin user on dashboard, redirecting to admin panel')
        setCurrentViewState('admin')
        localStorage.setItem('currentView', 'admin')
        return
      }
      
      const studentViews = [
        'learn', 'practice', 'training-hub', 'training-practice', 'training-assess', 
        'training-feedback', 'training-dashboard', 'core-concepts', 'agile-hub', 
        'agile-scrum', 'scrum-essentials', 'agile-practice', 'user-story-checker',
        'mvp-practice', 'documentation-practice', 'elicitation-practice', 'elicitation',
        'project-initiation', 'requirements-engineering', 'solution-options', 'design',
        'mvp', 'motivation', 'my-mentorship', 'book-session', 'welcome' // 'community-hub' archived for MVP
      ];
      
      if (studentViews.includes(currentView)) {
        console.log('🔐 ADMIN_INIT: Admin user detected accessing student content on load, redirecting to admin panel')
        console.log('🔐 ADMIN_INIT: Current view:', currentView)
        setCurrentViewState('admin')
        localStorage.setItem('currentView', 'admin')
      }
    } else if (adminLoading) {
      console.log('🔐 ADMIN_INIT: Admin status still loading, waiting...')
    }
  }, [user, isAdmin, currentView, adminLoading])

  // Load subscription data and selected projects
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user?.id) return;
      
      try {
        // Load subscription tier from user_profiles
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('subscription_tier, max_projects, subscription_status')
          .eq('user_id', user.id)
          .single();
        
        if (profileData) {
          setUserSubscription({
            tier: profileData.subscription_tier || 'free',
            maxProjects: profileData.max_projects || 1,
            status: profileData.subscription_status || 'active'
          });
        }
        
        // Try to load user's selected projects from user_projects table
        const { data: projectsData, error } = await supabase
          .from('user_projects')
          .select('project_id')
          .eq('user_id', user.id);
        
        if (projectsData && !error) {
          const projectIds = projectsData.map((p: { project_id: string }) => p.project_id);
          setUserSelectedProjects(projectIds);
          setUserProjectCount(projectIds.length);
          // Also save to localStorage as backup
          localStorage.setItem(`userSelectedProjects_${user.id}`, JSON.stringify(projectIds));
        } else {
          // Fallback to localStorage if table doesn't exist
          console.log('⚠️ user_projects table not found, using localStorage fallback');
          const savedProjects = localStorage.getItem(`userSelectedProjects_${user.id}`);
          if (savedProjects) {
            const projectIds = JSON.parse(savedProjects);
            setUserSelectedProjects(projectIds);
            setUserProjectCount(projectIds.length);
            console.log('✅ Restored selected projects from localStorage:', projectIds);
          }
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
        // Try localStorage fallback
        try {
          const savedProjects = localStorage.getItem(`userSelectedProjects_${user.id}`);
          if (savedProjects) {
            const projectIds = JSON.parse(savedProjects);
            setUserSelectedProjects(projectIds);
            setUserProjectCount(projectIds.length);
            console.log('✅ Restored selected projects from localStorage (after error):', projectIds);
          }
        } catch (e) {
          console.error('Error loading from localStorage:', e);
        }
      }
    };
    
    loadSubscriptionData();
  }, [user?.id]);
  
  // Load elicitation practice access
  useEffect(() => {
    const loadElicitationAccess = async () => {
      if (!user?.id) {
        setElicitationAccess(null);
        return;
      }
      
      try {
        // Get user type from Supabase
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        const userType = userProfile?.user_type || 'new';
        console.log('🔍 Loading elicitation access for user type:', userType);
        
        const access = await getElicitationAccess(user.id, userType);
        setElicitationAccess(access);
        console.log('✅ Elicitation access loaded:', access);
      } catch (error) {
        console.error('❌ Error loading elicitation access:', error);
        // Set default locked state on error
        setElicitationAccess({
          chatUnlocked: false,
          voiceUnlocked: false,
          dailyInteractionCount: 0,
          dailyLimit: 20,
          voiceUnlockStatus: {
            isUnlocked: false,
            qualifyingSessions: 0,
            uniqueDays: 0,
            sessionsNeeded: 3,
            daysNeeded: 3,
          },
        });
      }
    };
    
    loadElicitationAccess();
  }, [user?.id]);
  
  // Function to refresh elicitation access (call after completing a session)
  const refreshElicitationAccess = async () => {
    if (!user?.id) return;
    
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      
      const userType = userProfile?.user_type || 'new';
      const access = await getElicitationAccess(user.id, userType);
      setElicitationAccess(access);
      console.log('🔄 Elicitation access refreshed:', access);
    } catch (error) {
      console.error('❌ Error refreshing elicitation access:', error);
    }
  };
  
  // Check onboarding status on initial load for non-admin users
  useEffect(() => {
    if (user && !adminLoading && !isAdmin) {
      let onboardingCompleted = localStorage.getItem('onboardingCompleted')
      const isOnboardingInProgress = localStorage.getItem('onboardingInProgress')
      
      // For existing users who don't have onboarding flags, assume they've completed onboarding
      if (!onboardingCompleted && !isOnboardingInProgress) {
        console.log('🎯 ONBOARDING_INIT: No onboarding flags found, assuming user has completed onboarding')
        localStorage.setItem('onboardingCompleted', 'true')
        onboardingCompleted = 'true'
      }
      
      console.log('🎯 ONBOARDING_INIT: Checking initial onboarding state:', { 
        onboardingCompleted: onboardingCompleted, 
        isOnboardingInProgress: isOnboardingInProgress,
        currentView 
      })
      
      // Only redirect to welcome if user is on dashboard and hasn't completed onboarding
      if (!onboardingCompleted && !isOnboardingInProgress && currentView === 'dashboard') {
        console.log('🎯 ONBOARDING_INIT: User needs onboarding, redirecting from dashboard to welcome page')
        setCurrentViewState('welcome')
        localStorage.setItem('currentView', 'welcome')
      }
    }
  }, [user, isAdmin, adminLoading, currentView])

  // Mock user progress data
  const userProgress = {
    total_projects_started: 1,
    total_projects_completed: 0,
    total_meetings_conducted: 2,
    total_deliverables_created: 1,
    achievements: ['First Meeting', 'Note Taker']
  }

  // Mock subscription data
  const studentSubscription = {
    id: user?.id || '',
    name: user?.email || '',
    email: user?.email || '',
    subscription_tier: 'free' as const,
    subscription_status_active: true,
    selected_project_id: selectedProject?.id || null,
    meeting_count: 2,
    stripe_customer_id: null,
    subscription_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const selectProject = async (project: Project) => {
    if (!user?.id) return;
    
    // Check if project is already selected
    const isAlreadySelected = (userSelectedProjects || []).includes(project.id);
    
    if (!isAlreadySelected) {
      // Check project limit
      const maxProjects = userSubscription?.maxProjects || 1;
      const currentCount = userProjectCount || 0;
      
      if (currentCount >= maxProjects) {
        // Show upgrade prompt
        throw new Error(`You've reached your project limit (${maxProjects} project${maxProjects > 1 ? 's' : ''}). Upgrade to select more projects!`);
      }
      
      // Add project to user_projects table (if it exists)
      try {
        const { error } = await supabase
          .from('user_projects')
          .insert({
            user_id: user.id,
            project_id: project.id,
            status: 'in_progress',
            started_at: new Date().toISOString()
          });
        
        if (error) {
          // Ignore 404 (table doesn't exist) and duplicate errors
          const errorMsg = error.message || '';
          const errorCode = (error as any).code || '';
          
          if (errorCode === '42P01' || errorMsg.includes('404') || errorMsg.includes('does not exist')) {
            console.log('⚠️ user_projects table not found - continuing without tracking');
          } else if (errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
            console.log('ℹ️ Project already selected - continuing');
          } else {
            console.error('Error adding project:', error);
            // Don't throw - allow selection to continue
          }
        }
        
        // Update local state regardless of database result
        const updatedProjects = [...(userSelectedProjects || []), project.id];
        setUserSelectedProjects(updatedProjects);
        setUserProjectCount(updatedProjects.length);
        
        // Save to localStorage as backup for persistence across refreshes
        localStorage.setItem(`userSelectedProjects_${user.id}`, JSON.stringify(updatedProjects));
        console.log('💾 Saved to localStorage: userSelectedProjects =', updatedProjects);
        
        // Mark "Select Your Project" module as completed in project_progress
        try {
          const { error: progressError } = await supabase
            .from('project_progress')
            .upsert({
              user_id: user.id,
              module_id: 'project-select-your-project',
              status: 'completed',
              completed_at: new Date().toISOString()
            });
          
          if (progressError) {
            console.log('Could not update project progress (table may not exist):', progressError);
          }
        } catch (error) {
          console.log('Error updating project progress (ignored):', error);
        }
      } catch (error) {
        console.log('Error with user_projects table (ignored):', error);
        // Continue anyway - don't block project selection
      }
    }
    
    setSelectedProject(project);
    setSelectedStakeholders([]); // Clear previously selected stakeholders
    setCurrentView('project-brief');
  }

  const addDeliverable = (deliverable: Deliverable) => {
    setDeliverables(prev => [...prev, deliverable])
  }

  const updateDeliverable = (id: string, updates: Partial<Deliverable>) => {
    setDeliverables(prev => 
      prev.map(d => d.id === id ? { ...d, ...updates } : d)
    )
  }

  // Utility functions
  const canAccessProject = (projectId: string) => {
    // User can access project if they've already selected it
    return (userSelectedProjects || []).includes(projectId);
  }
  
  const canSaveNotes = () => true
  const canCreateMoreMeetings = () => true
  
  const clearLockMessage = () => {
    setLockMessage(null)
  }

  const refreshMeetingData = async () => {
    if (user?.id) {
      console.log('🔄 AppContext - Refreshing meeting data cache for user:', user.id)
      MeetingDataService.clearCache(user.id)
      // Force refresh data in unified service
      await MeetingDataService.refreshData(user.id)
    }
  }

  const value = {
    isHydrated,
    currentView,
    setCurrentView,
    projects: mockProjects,
    selectedProject,
    setSelectedProject,
    selectProject,
    stakeholders: mockStakeholders,
    selectedStakeholders,
    setSelectedStakeholders,
    meetings,
    currentMeeting,
    setCurrentMeeting,
    deliverables,
    addDeliverable,
    updateDeliverable,
    customProject,
    setCustomProject,
    user,
    userProgress,
    studentSubscription,
    userSubscription,
    userProjectCount,
    userSelectedProjects,
    elicitationAccess,
    refreshElicitationAccess,
    canAccessProject,
    canSaveNotes,
    canCreateMoreMeetings,
    refreshMeetingData,
    isLoading,
    selectedMeeting,
    setSelectedMeeting,
    lockMessage,
    clearLockMessage
  }

  // Expose lock message state through context
  const valueWithLockMessage = {
    ...value,
    lockMessage,
    clearLockMessage: () => setLockMessage(null)
  }

  return <AppContext.Provider value={valueWithLockMessage}>{children}</AppContext.Provider>
}