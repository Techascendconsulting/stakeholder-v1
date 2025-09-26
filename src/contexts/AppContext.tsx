import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useAdmin } from './AdminContext'
import { mockProjects, mockStakeholders } from '../data/mockData'
import { Project, Stakeholder, Meeting, Deliverable, AppView } from '../types'
import { MeetingDataService } from '../lib/meetingDataService'

interface AppContextType {
  // Hydration state
  isHydrated: boolean
  
  // Current view
  currentView: AppView
  setCurrentView: (view: AppView) => void
  
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
  
  // Utility functions
  canAccessProject: (projectId: string) => boolean
  canSaveNotes: () => boolean
  canCreateMoreMeetings: () => boolean
  refreshMeetingData: () => Promise<void>
  
  // Loading state
  isLoading: boolean
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

  // Initialize currentView from localStorage or default to welcome for new work experience approach
  const [currentView, setCurrentViewState] = useState<AppView>(() => {
    console.log('🔍 INIT: AppContext initializing currentView...')
    
    try {
      const savedView = localStorage.getItem('currentView')
      console.log('🔍 INIT: Found saved view in localStorage:', savedView)
      
      // Validate that the saved view is a valid AppView
      const validViews: AppView[] = [
        'welcome',
        'get-started',
        'dashboard',
        'learn',
        'practice',
        'motivation',
        'project',
        'core-concepts',
        'agile-hub',
        'agile-scrum',
        'scrum-essentials',
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
        'process-mapper-editor',
        'diagram-creation',
        'project-setup',
        'structured-training',
        'pre-brief',
        'live-training-meeting',
        'post-brief',
        'community-hub',
        'community-admin',
        'admin',
        // Learning pages that were missing
        'project-initiation',
        'requirements-engineering',
        'documentation',
    'ba-reference',
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
        'my-progress-mentor'
      ];
      if (savedView && validViews.includes(savedView as AppView)) {
        console.log('✅ INIT: Restoring valid view from localStorage:', savedView)
        return savedView as AppView
      } else {
        console.log('⚠️ INIT: Invalid or missing saved view, defaulting to welcome. savedView:', savedView)
        return 'welcome'
      }
    } catch (error) {
      console.log('❌ INIT: Error loading saved view, defaulting to welcome:', error)
      return 'welcome'
    }
  })

  // Custom setCurrentView that handles localStorage automatically
  const setCurrentView = (view: AppView) => {
    console.log('🔄 NAVIGATE: setCurrentView called with view:', view)
    console.log('🔄 NAVIGATE: Previous view was:', currentView)
    setCurrentViewState(view)
    try {
      localStorage.setItem('currentView', view)
      console.log('💾 NAVIGATE: Saved view to localStorage:', view)
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
      console.log('👋 USER_EFFECT: Actual logout detected, clearing all saved state')
      
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
        setCurrentViewState('dashboard')
        setSelectedProjectState(null)
        setSelectedStakeholdersState([])
        setCustomProjectState(null)
      }
    } else if (user) {
      console.log('✅ USER_EFFECT: User is logged in, preserving current state')
      console.log('✅ USER_EFFECT: Current view:', currentView)
      console.log('✅ USER_EFFECT: Selected project:', selectedProject?.name || 'none')
      
      // Admin users should be redirected to admin panel immediately
      // Wait for admin loading to complete before making redirect decisions
      if (!adminLoading && isAdmin) {
        // If admin is on dashboard or any student view, redirect to admin panel
        if (currentView === 'dashboard' || currentView === 'welcome') {
          console.log('🔐 ADMIN_EFFECT: Admin user on dashboard/welcome, redirecting to admin panel')
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
          'mvp', 'motivation', 'community-hub', 'my-mentorship', 'book-session'
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
        'mvp', 'motivation', 'community-hub', 'my-mentorship', 'book-session', 'welcome'
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
    setSelectedProject(project)
    setSelectedStakeholders([]) // Clear previously selected stakeholders
    setCurrentView('project-brief')
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
  const canAccessProject = (projectId: string) => true // Allow all projects for now
  const canSaveNotes = () => true
  const canCreateMoreMeetings = () => true

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
    canAccessProject,
    canSaveNotes,
    canCreateMoreMeetings,
    refreshMeetingData,
    isLoading,
    selectedMeeting,
    setSelectedMeeting
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}