import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { mockProjects, mockStakeholders } from '../data/mockData'
import { Project, Stakeholder, Meeting, Deliverable, AppView } from '../types'

interface AppContextType {
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
  
  // Initialize currentView from localStorage or default to dashboard
  const [currentView, setCurrentViewState] = useState<AppView>(() => {
    console.log('🔍 INIT: AppContext initializing currentView...')
    try {
      const savedView = localStorage.getItem('currentView')
      console.log('🔍 INIT: Found saved view in localStorage:', savedView)
      
      // Validate that the saved view is a valid AppView
      const validViews: AppView[] = ['dashboard', 'projects', 'meeting-history', 'deliverables', 'voice-meeting', 'meeting-summary', 'raw-transcript']
      if (savedView && validViews.includes(savedView as AppView)) {
        console.log('✅ INIT: Restoring valid view from localStorage:', savedView)
        return savedView as AppView
      } else {
        console.log('⚠️ INIT: Invalid or missing saved view, defaulting to dashboard. savedView:', savedView)
        return 'dashboard'
      }
    } catch (error) {
      console.log('❌ INIT: Error loading saved view, defaulting to dashboard:', error)
      return 'dashboard'
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
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [customProject, setCustomProject] = useState<Project | null>(null)

  // Clear view state on user logout (but not on initial load)
  useEffect(() => {
    console.log('🔍 USER_EFFECT: useEffect triggered with user:', user ? 'logged in' : 'not logged in')
    console.log('🔍 USER_EFFECT: Current view is:', currentView)
    
    // Only clear if user explicitly becomes null (logout), not during initial undefined state
    if (user === null) {
      console.log('👋 USER_EFFECT: User logged out, clearing saved view')
      localStorage.removeItem('currentView')
      setCurrentViewState('dashboard')
    } else if (user) {
      console.log('✅ USER_EFFECT: User is logged in, preserving current view:', currentView)
    } else {
      console.log('⏳ USER_EFFECT: User state is undefined (still loading), doing nothing')
    }
  }, [user, currentView])

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

  const value = {
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
    isLoading,
    selectedMeeting,
    setSelectedMeeting
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}