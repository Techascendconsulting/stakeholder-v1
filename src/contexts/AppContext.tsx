import React, { createContext, useContext, useState, ReactNode } from 'react'
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
  selectProject: (project: Project) => Promise<void>
  
  // Stakeholder data
  stakeholders: Stakeholder[]
  selectedStakeholders: Stakeholder[]
  setSelectedStakeholders: (stakeholders: Stakeholder[]) => void
  
  // Meeting data
  meetings: Meeting[]
  currentMeeting: Meeting | null
  
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
  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([])
  const [meetings] = useState<Meeting[]>([])
  const [currentMeeting] = useState<Meeting | null>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [customProject, setCustomProject] = useState<Project | null>(null)

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
  const canAccessProject = () => true // Allow all projects for now
  const canSaveNotes = () => true
  const canCreateMoreMeetings = () => true

  const value = {
    currentView,
    setCurrentView,
    projects: mockProjects,
    selectedProject,
    selectProject,
    stakeholders: mockStakeholders,
    selectedStakeholders,
    setSelectedStakeholders,
    meetings,
    currentMeeting,
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
    isLoading: false
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}