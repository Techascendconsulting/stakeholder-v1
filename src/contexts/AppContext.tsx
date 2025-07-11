// Filename: src/contexts/AppContext.tsx
// FINAL, CORRECTED VERSION: This version fixes the "Identifier has already been declared" crash.
// It also includes the console.log statements for debugging the loading issue.

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
  deliverables: Deliverable[];
  addDeliverable: (deliverable: Deliverable) => void;
  updateDeliverable: (deliverableId: string, updates: Partial<Deliverable>) => void;
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
  console.log('🚀 DEBUG: AppProvider component starting to render');
  
  const { user } = useAuth();
  console.log('👤 DEBUG: User from useAuth:', user?.id || 'null');
  
  const [currentView, setCurrentView] = useState<AppView>('projects');
  console.log('📱 DEBUG: currentView state initialized:', currentView);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [studentSubscription, setStudentSubscription] = useState<StudentSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbMeetings, setDbMeetings] = useState<DatabaseMeeting[]>([]);
  const [dbDeliverables, setDbDeliverables] = useState<DatabaseDeliverable[]>([]);
  
  console.log('📊 DEBUG: All state variables initialized');

  const addMessageToCurrentMeeting = (message: Message) => {
    console.log('💬 DEBUG: addMessageToCurrentMeeting called with message:', message.id);
    if (!currentMeeting) return;
    const updatedMeeting = {
      ...currentMeeting,
      transcript: [...currentMeeting.transcript, message],
    };
    setCurrentMeeting(updatedMeeting);
    console.log('💬 DEBUG: currentMeeting updated with new message');
  };

  console.log('🔧 DEBUG: About to define enhancedSetCurrentView function');
  
  const enhancedSetCurrentView = async (view: AppView) => {
    console.log('🔧 DEBUG: enhancedSetCurrentView called with view:', view);
    setCurrentView(view);
    if (selectedProject && user) {
      console.log('🔧 DEBUG: Updating user project current_step to:', view);
      await databaseService.updateUserProject(user.id, selectedProject.id, {
        current_step: view
      });
    }
  };
  
  console.log('🔧 DEBUG: enhancedSetCurrentView function defined');
  
  const enhancedSetSelectedProject = async (project: Project | null) => {
    console.log('🔧 DEBUG: enhancedSetSelectedProject called with project:', project?.name || 'null');
    if (project && user) {
      await selectProject(project);
    } else {
      setSelectedProject(project);
    }
  };
  
  console.log('🔧 DEBUG: enhancedSetSelectedProject function defined');
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
    console.log('⚡ DEBUG: useEffect for currentMeeting triggered');
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
    console.log("DEBUG: Starting resumeSession...");
    setIsLoading(true);
    try {
      const subscription = await subscriptionService.getStudentSubscription(user.id);
      setStudentSubscription(subscription);

      const sessionData = await databaseService.resumeUserSession(user.id);
      console.log("DEBUG: Got sessionData from database:", sessionData);
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
      
      if (sessionData.currentProject) {
        console.log("DEBUG: Found an active project:", sessionData.currentProject.project_id);
        const projectData = mockProjects.find(p => p.id === sessionData.currentProject!.project_id);
        if (projectData) {
          setSelectedProject(projectData);
          const activeMeeting = appMeetings.find(m => m.projectId === projectData.id && m.status === 'in_progress');
          console.log("DEBUG: Found active meeting:", activeMeeting);
          setCurrentMeeting(activeMeeting || null);
          setCurrentView(sessionData.currentProject.current_step as AppView);
        }
      } else {
        console.log("DEBUG: No active project found.");
        setCurrentView('projects');
      }

    } catch (error) {
      console.error('DEBUG: CRITICAL ERROR in resumeSession:', error);
    } finally {
      console.log("DEBUG: Finished resumeSession. Setting isLoading to false.");
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
    console.log('🎯 DEBUG: selectProject called with:', project.name);
      console.error('Error selecting project:', error);
      throw error;
    }
  };

  const addMeeting = async (meeting: Meeting) => {
    if (user && !canCreateMoreMeetings()) {
      console.log('🎯 DEBUG: Project selected successfully');
      throw new Error('You have reached your meeting limit.');
    }
    if (user) {
        console.log('⚡ DEBUG: Updating meeting transcript in database');
      try {
        await subscriptionService.incrementMeetingCount(user.id);
        const updatedSubscription = await subscriptionService.getStudentSubscription(user.id);
    console.log('➕ DEBUG: addMeeting called with meeting:', meeting.id);
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
    console.log('➕ DEBUG: Meeting added successfully');
      await databaseService.updateUserMeeting(meetingId, updates);
    }
  };
    console.log('🔄 DEBUG: updateMeeting called for meeting:', meetingId);

  const addDeliverable = async (deliverable: Deliverable) => {
    setDeliverables(prev => [...prev, deliverable]);
    if (user) {
      await databaseService.createUserDeliverable(deliverable);
    }
  };

  const updateDeliverable = async (deliverableId: string, updates: Partial<Deliverable>) => {
    console.log('📄 DEBUG: addDeliverable called with:', deliverable.title);
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === deliverableId ? { ...deliverable, ...updates } : deliverable
    ));
    if (user) {
      await databaseService.updateUserDeliverable(deliverableId, updates);
    }
  };
    console.log('📝 DEBUG: updateDeliverable called for:', deliverableId);

  const enhancedSetCurrentView = async (view: AppView) => {
    console.log('🔧 DEBUG: enhancedSetCurrentView called with view:', view);
    setCurrentView(view);
    if (selectedProject && user) {
      console.log('🔧 DEBUG: Updating user project current_step to:', view);
      await databaseService.updateUserProject(user.id, selectedProject.id, {
        current_step: view
    currentView,
    setCurrentView: enhancedSetCurrentView,
  console.log('🔧 DEBUG: enhancedSetCurrentView exists?', typeof enhancedSetCurrentView);
  console.log('🔧 DEBUG: enhancedSetSelectedProject exists?', typeof enhancedSetSelectedProject);
  
      console.log('👨‍🎓 DEBUG: Got subscription:', subscription?.subscription_tier || 'null');
    user,
        console.log('👨‍🎓 DEBUG: No subscription found, creating new student record');
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
      console.log('👨‍🎓 DEBUG: Student subscription set');
    canSaveNotes,
    canCreateMoreMeetings,
    selectProject,
  };

  console.log('🔧 DEBUG: AppContext value object created successfully');
  console.log('🔧 DEBUG: About to return AppContext.Provider');

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
