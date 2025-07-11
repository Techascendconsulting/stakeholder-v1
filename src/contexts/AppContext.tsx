// Filename: src/contexts/AppContext.tsx
// FINAL VERSION WITH LIFTED STATE: This version includes the 'messages' state
// and the 'addMessage' function to manage the chat centrally, preventing resets.

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService, StudentSubscription } from '../lib/subscription';
import { AppView, Project, Stakeholder, Meeting, Message, Deliverable } from '../types';
import { mockProjects, mockStakeholders } from '../data/mockData';
import { databaseService, UserProject, DatabaseMeeting, DatabaseDeliverable, UserProgress } from '../lib/database';

// Interface defining the context's shape
interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: any;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  selectedStakeholders: Stakeholder[];
  setSelectedStakeholders: (stakeholders: Stakeholder[]) => void;
  projects: Project[];
  stakeholders: Stakeholder[];
  meetings: Meeting[];
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  deliverables: Deliverable[];
  addDeliverable: (deliverable: Deliverable) => void;
  updateDeliverable: (deliverableId: string, updates: Partial<Deliverable>) => void;
  currentMeeting: Meeting | null;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  userProgress: UserProgress | null;
  studentSubscription: StudentSubscription | null;
  isLoading: boolean;
  resumeSession: () => Promise<void>;
  canAccessProject: (projectId: string) => boolean;
  canSaveNotes: () => boolean;
  canCreateMoreMeetings: () => boolean;
  selectProject: (project: Project) => Promise<void>;

  // --- NEW STATE AND FUNCTIONS FOR LIFTED STATE ---
  messages: Message[]; // The new central source of truth for the chat
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void; // A helper function to add a new message
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// The provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [studentSubscription, setStudentSubscription] = useState<StudentSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbMeetings, setDbMeetings] = useState<DatabaseMeeting[]>([]);
  const [dbDeliverables, setDbDeliverables] = useState<DatabaseDeliverable[]>([]);

  // --- NEW STATE FOR MESSAGES ---
  const [messages, setMessages] = useState<Message[]>([]);

  // --- NEW HELPER FUNCTION TO ADD A MESSAGE ---
  const addMessage = (message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  // Load user data when user logs in
  useEffect(() => {
    if (user) {
      resumeSession();
      ensureStudentRecord();
    } else {
      // Clear data when user logs out
      setSelectedProject(null);
      setMeetings([]);
      setDeliverables([]);
      setUserProgress(null);
      setStudentSubscription(null);
      setCurrentView('projects');
      setMessages([]); // Clear messages on logout
    }
  }, [user]);

  const ensureStudentRecord = async () => {
    if (!user) return;
    try {
      let subscription = await subscriptionService.getStudentSubscription(user.id);
      if (!subscription) {
        subscription = await subscriptionService.createStudentRecord(
          user.id,
          user.email?.split('@')[0] || 'User',
          user.email || ''
        );
        setStudentSubscription(subscription);
      }
    } catch (error) {
      console.error('Error ensuring student record:', error);
    }
  };

  const resumeSession = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const subscription = await subscriptionService.getStudentSubscription(user.id);
      setStudentSubscription(subscription);

      const sessionData = await databaseService.resumeUserSession(user.id);
      setUserProgress(sessionData.progress);

      if (sessionData.currentProject) {
        const projectData = mockProjects.find(p => p.id === sessionData.currentProject!.project_id);
        if (projectData) {
          setSelectedProject(projectData);
          
          const appMeetings: Meeting[] = sessionData.meetings.map(dbMeeting => ({
            id: dbMeeting.id,
            projectId: dbMeeting.project_id,
            stakeholderIds: dbMeeting.stakeholder_ids,
            transcript: dbMeeting.transcript,
            date: dbMeeting.created_at,
            duration: dbMeeting.duration,
            status: dbMeeting.status,
            meetingType: dbMeeting.meeting_type
          }));
          
          const appDeliverables: Deliverable[] = sessionData.deliverables.map(dbDeliverable => ({
            id: dbDeliverable.id,
            projectId: dbDeliverable.project_id,
            type: dbDeliverable.type,
            title: dbDeliverable.title,
            content: dbDeliverable.content,
            lastModified: dbDeliverable.updated_at
          }));
          
          setMeetings(appMeetings);
          setDeliverables(appDeliverables);
          setDbMeetings(sessionData.meetings);
          setDbDeliverables(sessionData.deliverables);
          
          setCurrentView(sessionData.currentProject.current_step as AppView);
        }
      }
    } catch (error) {
      console.error('Error resuming session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canAccessProject = (projectId: string): boolean => true;
  const canSaveNotes = (): boolean => true;
  const canCreateMoreMeetings = (): boolean => true;

  const selectProject = async (project: Project): Promise<void> => {
    if (!user) return;
    try {
      await subscriptionService.selectProject(user.id, project.id);
      const updatedSubscription = await subscriptionService.getStudentSubscription(user.id);
      setStudentSubscription(updatedSubscription);
      setSelectedProject(project);
      await databaseService.createUserProject(project.id, 'project-brief');
    } catch (error) {
      console.error('Error selecting project:', error);
      throw error;
    }
  };

  const addMeeting = async (meeting: Meeting) => {
    if (user && !canCreateMoreMeetings()) {
      throw new Error('You have reached your meeting limit.');
    }
    if (user) {
      try {
        await subscriptionService.incrementMeetingCount(user.id);
        const updatedSubscription = await subscriptionService.getStudentSubscription(user.id);
        setStudentSubscription(updatedSubscription);
      } catch (error) {
        throw error;
      }
    }
    setMeetings(prev => [...prev, meeting]);
    if (user) {
      const dbMeeting = await databaseService.createUserMeeting(meeting);
      if (dbMeeting) {
        setDbMeetings(prev => [...prev, dbMeeting]);
      }
    }
  };

  const updateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId ? { ...meeting, ...updates } : meeting
    ));
    if (user) {
      const dbMeeting = dbMeetings.find(m => m.id === meetingId);
      if (dbMeeting) {
        const dbUpdates: Partial<DatabaseMeeting> = {};
        if (updates.transcript) dbUpdates.transcript = updates.transcript;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.duration) dbUpdates.duration = updates.duration;
        if (updates.status === 'completed') dbUpdates.completed_at = new Date().toISOString();
        await databaseService.updateUserMeeting(meetingId, dbUpdates);
      }
    }
  };

  const addDeliverable = async (deliverable: Deliverable) => {
    setDeliverables(prev => [...prev, deliverable]);
    if (user) {
      const dbDeliverable = await databaseService.createUserDeliverable(deliverable);
      if (dbDeliverable) {
        setDbDeliverables(prev => [...prev, dbDeliverable]);
      }
    }
  };

  const updateDeliverable = async (deliverableId: string, updates: Partial<Deliverable>) => {
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === deliverableId ? { ...deliverable, ...updates } : deliverable
    ));
    if (user) {
      const dbUpdates: Partial<DatabaseDeliverable> = {};
      if (updates.content) dbUpdates.content = updates.content;
      if (updates.title) dbUpdates.title = updates.title;
      await databaseService.updateUserDeliverable(deliverableId, dbUpdates);
    }
  };

  const enhancedSetSelectedProject = async (project: Project | null) => {
    if (project && user) {
      await selectProject(project);
    } else {
      setSelectedProject(project);
    }
  };

  const enhancedSetCurrentView = async (view: AppView) => {
    setCurrentView(view);
    if (selectedProject && user) {
      await databaseService.updateUserProject(user.id, selectedProject.id, {
        current_step: view
      });
    }
  };

  // The value provided to the context consumers
  const value = {
    currentView,
    setCurrentView: enhancedSetCurrentView,
    user,
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
    selectProject,
    // --- EXPORT THE NEW STATE AND FUNCTIONS ---
    messages,
    setMessages,
    addMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
