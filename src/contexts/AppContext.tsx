import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useEffect } from 'react'
import { useAuth } from './AuthContext'
import { subscriptionService, StudentSubscription } from '../lib/subscription'
import { AppView, Project, Stakeholder, Meeting, Message, Deliverable } from '../types'
import { mockProjects, mockStakeholders } from '../data/mockData'
import { databaseService, UserProject, DatabaseMeeting, DatabaseDeliverable, UserProgress } from '../lib/database'

interface AppContextType {
  currentView: AppView
  setCurrentView: (view: AppView) => void
  selectedProject: Project | null
  setSelectedProject: (project: Project | null) => void
  selectedStakeholders: Stakeholder[]
  setSelectedStakeholders: (stakeholders: Stakeholder[]) => void
  projects: Project[]
  stakeholders: Stakeholder[]
  meetings: Meeting[]
  addMeeting: (meeting: Meeting) => void
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void
  deliverables: Deliverable[]
  addDeliverable: (deliverable: Deliverable) => void
  updateDeliverable: (deliverableId: string, updates: Partial<Deliverable>) => void
  currentMeeting: Meeting | null
  setCurrentMeeting: (meeting: Meeting | null) => void
  userProgress: UserProgress | null
  studentSubscription: StudentSubscription | null
  isLoading: boolean
  resumeSession: () => Promise<void>
  canAccessProject: (projectId: string) => boolean
  canSaveNotes: () => boolean
  canCreateMoreMeetings: () => boolean
  selectProject: (project: Project) => Promise<void>
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
  const [currentView, setCurrentView] = useState<AppView>('projects')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [studentSubscription, setStudentSubscription] = useState<StudentSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dbMeetings, setDbMeetings] = useState<DatabaseMeeting[]>([])
  const [dbDeliverables, setDbDeliverables] = useState<DatabaseDeliverable[]>([])

  // Load user data when user logs in
  useEffect(() => {
    if (user) {
      resumeSession()
      // Ensure student record exists for logged-in users
      ensureStudentRecord()
    } else {
      // Clear data when user logs out
      setSelectedProject(null)
      setMeetings([])
      setDeliverables([])
      setUserProgress(null)
      setStudentSubscription(null)
      setCurrentView('projects')
    }
  }, [user])

  const ensureStudentRecord = async () => {
    if (!user) return
    
    try {
      let subscription = await subscriptionService.getStudentSubscription(user.id)
      
      // If no student record exists, create one
      if (!subscription) {
        subscription = await subscriptionService.createStudentRecord(
          user.id,
          user.email?.split('@')[0] || 'User',
          user.email || ''
        )
        setStudentSubscription(subscription)
      }
    } catch (error) {
      console.error('Error ensuring student record:', error)
    }
  }

  const resumeSession = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Load student subscription data
      const subscription = await subscriptionService.getStudentSubscription(user.id)
      setStudentSubscription(subscription)

      const sessionData = await databaseService.resumeUserSession(user.id)
      
      // Set user progress
      setUserProgress(sessionData.progress)
      
      // If user has a current project, load it
      if (sessionData.currentProject) {
        const projectData = mockProjects.find(p => p.id === sessionData.currentProject!.project_id)
        if (projectData) {
          setSelectedProject(projectData)
          
          // Convert database meetings to app meetings
          const appMeetings: Meeting[] = sessionData.meetings.map(dbMeeting => ({
            id: dbMeeting.id,
            projectId: dbMeeting.project_id,
            stakeholderIds: dbMeeting.stakeholder_ids,
            transcript: dbMeeting.transcript,
            date: dbMeeting.created_at,
            duration: dbMeeting.duration,
            status: dbMeeting.status,
            meetingType: dbMeeting.meeting_type
          }))
          
          // Convert database deliverables to app deliverables
          const appDeliverables: Deliverable[] = sessionData.deliverables.map(dbDeliverable => ({
            id: dbDeliverable.id,
            projectId: dbDeliverable.project_id,
            type: dbDeliverable.type,
            title: dbDeliverable.title,
            content: dbDeliverable.content,
            lastModified: dbDeliverable.updated_at
          }))
          
          setMeetings(appMeetings)
          setDeliverables(appDeliverables)
          setDbMeetings(sessionData.meetings)
          setDbDeliverables(sessionData.deliverables)
          
          // Set current view based on project step
          setCurrentView(sessionData.currentProject.current_step as AppView)
        }
      }
    } catch (error) {
      console.error('Error resuming session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canAccessProject = (projectId: string): boolean => {
    return subscriptionService.canAccessProject(studentSubscription, projectId)
  }

  const canSaveNotes = (): boolean => {
    return subscriptionService.canSaveNotes(studentSubscription)
  }

  const canCreateMoreMeetings = (): boolean => {
    return subscriptionService.canCreateMoreMeetings(studentSubscription)
  }

  const selectProject = async (project: Project): Promise<void> => {
    if (!user) return

    try {
      await subscriptionService.selectProject(user.id, project.id)
      
      // Refresh subscription data
      const updatedSubscription = await subscriptionService.getStudentSubscription(user.id)
      setStudentSubscription(updatedSubscription)
      
      // Set the selected project
      setSelectedProject(project)
      
      // Create or update user project in database
      await databaseService.createUserProject(project.id, 'project-brief')
    } catch (error) {
      console.error('Error selecting project:', error)
      throw error
    }
  }

  const addMeeting = async (meeting: Meeting) => {
    // Check meeting limits before adding
    if (user && !canCreateMoreMeetings()) {
      throw new Error('You have reached your meeting limit. Upgrade to Premium for unlimited meetings.')
    }

    // Increment meeting count for subscription tracking
    if (user) {
      try {
        await subscriptionService.incrementMeetingCount(user.id)
        // Refresh subscription data
        const updatedSubscription = await subscriptionService.getStudentSubscription(user.id)
        setStudentSubscription(updatedSubscription)
      } catch (error) {
        throw error
      }
    }

    setMeetings(prev => [...prev, meeting])
    
    // Save to database
    if (user) {
      const dbMeeting = await databaseService.createUserMeeting(meeting)
      if (dbMeeting) {
        setDbMeetings(prev => [...prev, dbMeeting])
      }
    }
  }

  const updateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId ? { ...meeting, ...updates } : meeting
    ))
    
    // Update in database
    if (user) {
      const dbMeeting = dbMeetings.find(m => m.id === meetingId)
      if (dbMeeting) {
        const dbUpdates: Partial<DatabaseMeeting> = {}
        if (updates.transcript) dbUpdates.transcript = updates.transcript
        if (updates.status) dbUpdates.status = updates.status
        if (updates.duration) dbUpdates.duration = updates.duration
        if (updates.status === 'completed') dbUpdates.completed_at = new Date().toISOString()
        
        await databaseService.updateUserMeeting(meetingId, dbUpdates)
      }
    }
  }

  const addDeliverable = async (deliverable: Deliverable) => {
    setDeliverables(prev => [...prev, deliverable])
    
    // Save to database
    if (user) {
      const dbDeliverable = await databaseService.createUserDeliverable(deliverable)
      if (dbDeliverable) {
        setDbDeliverables(prev => [...prev, dbDeliverable])
      }
    }
  }

  const updateDeliverable = async (deliverableId: string, updates: Partial<Deliverable>) => {
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === deliverableId ? { ...deliverable, ...updates } : deliverable
    ))
    
    // Update in database
    if (user) {
      const dbUpdates: Partial<DatabaseDeliverable> = {}
      if (updates.content) dbUpdates.content = updates.content
      if (updates.title) dbUpdates.title = updates.title
      
      await databaseService.updateUserDeliverable(deliverableId, dbUpdates)
    }
  }

  // Enhanced setSelectedProject to save to database
  const enhancedSetSelectedProject = async (project: Project | null) => {
    if (project && user) {
      await selectProject(project)
    } else {
      setSelectedProject(project)
    }
  }

  // Enhanced setCurrentView to save current step
  const enhancedSetCurrentView = async (view: AppView) => {
    setCurrentView(view)
    
    if (selectedProject && user) {
      // Update current step in database
      await databaseService.updateUserProject(user.id, selectedProject.id, {
        current_step: view
      })
    }
  }

  const value = {
    currentView,
    setCurrentView: enhancedSetCurrentView,
    selectedProject,
    setSelectedProject: enhancedSetSelectedProject,
    selectedStakeholders,
    setSelectedStakeholders,
    projects: mockProjects,
    stakeholders: mockStakeholders,
    meetings,
    addMeeting,
    updateMeeting,
    deliverables,
    addDeliverable,
    updateDeliverable,
    currentMeeting,
    setCurrentMeeting,
    userProgress,
    studentSubscription,
    isLoading,
    resumeSession,
    canAccessProject,
    canSaveNotes,
    canCreateMoreMeetings,
    selectProject
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}