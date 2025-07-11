// Filename: src/contexts/AppContext.tsx
// FINAL, CORRECTED VERSION: This version fixes the infinite "Loading Meeting..." bug
// by correctly finding and setting the currentMeeting after the session is resumed.

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService, StudentSubscription } from '../lib/subscription';
import { AppView, Project, Stakeholder, Meeting, Message, Deliverable } from '../types';
import { mockProjects, mockStakeholders } from '../data/mockData';
import { databaseService, DatabaseMeeting, DatabaseDeliverable, UserProgress } from '../lib/database';

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
  currentMeeting: Meeting | null;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  addMessageToCurrentMeeting: (message: Message) => void;
  userProgress: UserProgress | null;
  studentSubscription: StudentSubscription | null;
  isLoading: boolean;
  resumeSession: () => Promise<void>;
  canAccessProject: (projectId: string) => boolean;
  canSaveNotes: () => boolean;
  canCreateMoreMeetings: () => boolean;
  selectProject: (project: Project) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

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
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [dbMeetings, setDbMeetings] = useState<DatabaseMeeting[]>([]);
  const [dbDeliverables, setDbDeliverables] = useState<DatabaseDeliverable[]>([]);

  const addMessageToCurrentMeeting = (message: Message) => {
    if (!currentMeeting) return;
    const updatedMeeting = {
      ...currentMeeting,
      transcript: [...currentMeeting.transcript, message],
    };
    setCurrentMeeting(updatedMeeting);
  };

  useEffect(() => {
    if (currentMeeting) {
      const meetingIndex = meetings.findIndex(m => m.id === currentMeeting.id);
      if (meetingIndex !== -1 && JSON.stringify(meetings[meetingIndex].transcript) !== JSON.stringify(currentMeeting.transcript)) {
        const updatedMeetings = [...meetings];
        updatedMeetings[meetingIndex] = currentMeeting;
        setMeetings(updatedMeetings);
        databaseService.updateUserMeeting(currentMeeting.id, {
          transcript: currentMeeting.transcript
        });
      }
    }
  }, [currentMeeting]);

  useEffect(() => {
    if (user) {
      resumeSession();
      ensureStudentRecord();
    } else {
      setIsLoading(false);
      setSelectedProject(null);
      setMeetings([]);
      setDeliverables([]);
      setUserProgress(null);
      setStudentSubscription(null);
      setCurrentView('projects');
      setCurrentMeeting(null);
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
      }
      setStudentSubscription(subscription);
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
      setMeetings(appMeetings);

      const appDeliverables: Deliverable[] = sessionData.deliverables.map(dbDeliverable => ({
        id: dbDeliverable.id,
        projectId: dbDeliverable.project_id,
        type: dbDeliverable.type,
        title: dbDeliverable.title,
        content: dbDeliverable.content,
        lastModified: dbDeliverable.updated_at
      }));
      setDeliverables(appDeliverables);
      
      // --- THE CORE FIX IS HERE ---
      if (sessionData.currentProject) {
        const projectData = mockProjects.find(p => p.id === sessionData.currentProject!.project_id);
        if (projectData) {
          setSelectedProject(projectData);
          // Find the active meeting for this project and set it as current
          const activeMeeting = appMeetings.find(m => m.projectId === projectData.id && m.status === 'in_progress');
          setCurrentMeeting(activeMeeting || null); // Set the meeting, or null if none is active
          setCurrentView(sessionData.currentProject.current_step as AppView);
        }
      } else {
        // If no active project, ensure we are on the projects page
        setCurrentView('projects');
      }

    } catch (error) {
      console.error('Error resuming session:', error);
    } finally {
      setIsLoading(false); // Stop loading at the very end
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
      await databaseService.createUserMeeting(meeting);
    }
  };

  const updateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId ? { ...meeting, ...updates } : meeting
    ));
    if (user) {
      await databaseService.updateUserMeeting(meetingId, updates);
    }
  };

  const addDeliverable = async (deliverable: Deliverable) => {
    setDeliverables(prev => [...prev, deliverable]);
    if (user) {
      await databaseService.createUserDeliverable(deliverable);
    }
  };

  const updateDeliverable = async (deliverableId: string, updates: Partial<Deliverable>) => {
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === deliverableId ? { ...deliverable, ...updates } : deliverable
    ));
    if (user) {
      await databaseService.updateUserDeliverable(deliverableId, updates);
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
    addMessageToCurrentMeeting,
    userProgress,
    studentSubscription,
    isLoading,
    resumeSession,
    canAccessProject,
    canSaveNotes,
    canCreateMoreMeetings,
    selectProject,
    selectProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
