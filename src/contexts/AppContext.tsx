import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AppView, Project, Stakeholder, Meeting, Message, Deliverable } from '../types'
import { mockProjects, mockStakeholders } from '../data/mockData'

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
  const [currentView, setCurrentView] = useState<AppView>('projects')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)

  const addMeeting = (meeting: Meeting) => {
    setMeetings(prev => [...prev, meeting])
  }

  const updateMeeting = (meetingId: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId ? { ...meeting, ...updates } : meeting
    ))
  }

  const addDeliverable = (deliverable: Deliverable) => {
    setDeliverables(prev => [...prev, deliverable])
  }

  const updateDeliverable = (deliverableId: string, updates: Partial<Deliverable>) => {
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === deliverableId ? { ...deliverable, ...updates } : deliverable
    ))
  }

  const value = {
    currentView,
    setCurrentView,
    selectedProject,
    setSelectedProject,
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
    setCurrentMeeting
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}