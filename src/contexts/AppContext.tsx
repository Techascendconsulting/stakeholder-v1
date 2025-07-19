import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { mockProjects, mockStakeholders } from '../data/mockData'
import { Project, Stakeholder, Meeting, Deliverable, AppView } from '../types'
import { DatabaseService, DatabaseProgress } from '../lib/database'

interface AppContextType {
  // Current view
  currentView: AppView
  setCurrentView: (view: AppView) => void
  
  // Project data
  projects: Project[]
  selectedProject: Project | null
  selectProject: (project: Project) => Promise<void>
  
  // Stakeholder data
  stakeholders: Stakeholder[]
  selectedStakeholders: Stakeholder[]
  setSelectedStakeholders: (stakeholders: Stakeholder[]) => void
  
  // Meeting data
  meetings: Meeting[]
  currentMeeting: Meeting | null
  setCurrentMeeting: (meeting: Meeting | null) => void
  
  // Deliverables
  deliverables: Deliverable[]
  addDeliverable: (deliverable: Deliverable) => void
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void
  
  // Custom project data
  customProject: Project | null
  setCustomProject: (project: Project) => void
  
  // User data
  user: any
  userProgress: DatabaseProgress | null
  studentSubscription: any
  
  // Real database functions
  loadUserData: () => Promise<void>
  saveMeetingToDatabase: (
    projectId: string, 
    stakeholderIds: string[], 
    transcript: any[], 
    rawChat: any[], 
    meetingNotes: string, 
    duration: number
  ) => Promise<boolean>
  
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
  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [customProject, setCustomProject] = useState<Project | null>(null)
  
  // Real user data states
  const [userProgress, setUserProgress] = useState<DatabaseProgress | null>(null)
  const [userMeetings, setUserMeetings] = useState<any[]>([])
  const [userDeliverables, setUserDeliverables] = useState<any[]>([])

  // Load real user data from database
  const loadUserData = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      // Load user progress
      let progress = await DatabaseService.getUserProgress(user.id)
      if (!progress) {
        progress = await DatabaseService.initializeUserProgress(user.id)
      }
      setUserProgress(progress)

      // Load user meetings
      const meetings = await DatabaseService.getUserMeetings(user.id)
      setUserMeetings(meetings)

      // Load user deliverables  
      const deliverables = await DatabaseService.getUserDeliverables(user.id)
      setUserDeliverables(deliverables)

      console.log('Loaded real user data:', { progress, meetings: meetings.length, deliverables: deliverables.length })
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save meeting to database
  const saveMeetingToDatabase = async (
    projectId: string,
    stakeholderIds: string[],
    transcript: any[],
    rawChat: any[],
    meetingNotes: string,
    duration: number
  ): Promise<boolean> => {
    if (!user?.id) return false

    try {
      // Create meeting record
      const meetingId = await DatabaseService.createMeeting(
        user.id,
        projectId,
        stakeholderIds,
        'group'
      )

      if (!meetingId) return false

      // Save meeting data
      const success = await DatabaseService.saveMeetingData(
        meetingId,
        transcript,
        rawChat,
        meetingNotes,
        duration
      )

      if (success) {
        // Update user progress
        await DatabaseService.incrementMeetingCount(user.id)
        
        // Reload user data to refresh UI
        await loadUserData()
      }

      return success
    } catch (error) {
      console.error('Error saving meeting to database:', error)
      return false
    }
  }

  // Load user data when user changes
  useEffect(() => {
    if (user?.id) {
      loadUserData()
    }
  }, [user?.id])

  // Enhanced subscription data with real progress
  const studentSubscription = {
    id: user?.id || '',
    name: user?.email || '',
    email: user?.email || '',
    subscription_tier: 'free' as const,
    subscription_status_active: true,
    selected_project_id: selectedProject?.id || null,
    meeting_count: userProgress?.total_meetings_conducted || 0,
    stripe_customer_id: null,
    subscription_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const selectProject = async (project: Project) => {
    setSelectedProject(project)
    setCurrentView('project-brief')
    
    // Track project selection in database
    if (user?.id) {
      await DatabaseService.createUserProject(user.id, project.id)
      await loadUserData() // Refresh user data
    }
  }

  const addDeliverable = async (deliverable: Deliverable) => {
    setDeliverables(prev => [...prev, deliverable])
    
    // Save to database
    if (user?.id && selectedProject?.id) {
      await DatabaseService.createDeliverable(
        user.id,
        selectedProject.id,
        deliverable.type,
        deliverable.title,
        deliverable.content
      )
      await DatabaseService.incrementDeliverableCount(user.id)
      await loadUserData() // Refresh user data
    }
  }

  const updateDeliverable = async (id: string, updates: Partial<Deliverable>) => {
    setDeliverables(prev => 
      prev.map(d => d.id === id ? { ...d, ...updates } : d)
    )
    
    // Update in database
    if (updates.content) {
      await DatabaseService.updateDeliverable(id, updates.content)
    }
  }

  // Utility functions with real data consideration
  const canAccessProject = (projectId: string) => {
    // Allow access to all mock projects, but in production this could check subscription
    return true
  }
  
  const canSaveNotes = () => {
    // In production, this might check subscription limits
    return true
  }
  
  const canCreateMoreMeetings = () => {
    // In production, this might check subscription limits
    const meetingCount = userProgress?.total_meetings_conducted || 0
    // For free tier, maybe limit to 5 meetings
    return meetingCount < 50 // Generous limit for demo
  }

  const value = {
    currentView,
    setCurrentView,
    projects: mockProjects, // Still using mock projects for the training scenarios
    selectedProject,
    selectProject,
    stakeholders: mockStakeholders, // Still using mock stakeholders for consistency
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
    userProgress, // Now real data from database
    studentSubscription, // Enhanced with real meeting count
    loadUserData,
    saveMeetingToDatabase,
    canAccessProject,
    canSaveNotes,
    canCreateMoreMeetings,
    isLoading
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}