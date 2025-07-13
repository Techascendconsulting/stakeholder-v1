// Filename: src/contexts/AppContext.tsx
// FIXED VERSION: Resolving the enhancedSetCurrentView undefined error

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService, StudentSubscription } from '../lib/subscription';
import { AppView, Project, Stakeholder, Meeting, Message, Deliverable } from '../types';
import { mockProjects, mockStakeholders } from '../data/mockData';
import { DatabaseService, DatabaseMeeting, DatabaseDeliverable, UserProgress } from '../lib/database';

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
  
  // State declarations
  const [currentView, setCurrentView] = useState<AppView>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [studentSubscription, setStudentSubscription] = useState<StudentSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('📊 DEBUG: All state variables initialized');

  // Enhanced setCurrentView function
  const enhancedSetCurrentView = async (view: AppView) => {
    console.log('🔧 DEBUG: enhancedSetCurrentView called with view:', view);
    setCurrentView(view);
    if (selectedProject && user && view !== 'projects') {
      console.log('🔧 DEBUG: Updating user project current_step to:', view);
      try {
        await DatabaseService.updateUserProject(user.id, selectedProject.id, {
          current_step: view
        });
      } catch (error) {
        console.error('🔧 DEBUG: Error updating user project step:', error);
        // Don't block the UI if this fails
      }
    }
  };

  // Enhanced setSelectedProject function
  const enhancedSetSelectedProject = async (project: Project | null) => {
    console.log('🔧 DEBUG: enhancedSetSelectedProject called with project:', project?.name || 'null');
    if (project && user) {
      await selectProject(project);
    } else {
      setSelectedProject(project);
    }
  };

  // Add message to current meeting
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

  // Ensure student record exists
  const ensureStudentRecord = async () => {
    if (!user) return;
    console.log('📝 DEBUG: ensureStudentRecord called for user:', user.id);
    try {
      let subscription = await subscriptionService.getStudentSubscription(user.id);
      if (!subscription) {
        console.log('📝 DEBUG: Creating new student record');
        subscription = await subscriptionService.createStudentRecord(
          user.id,
          user.email?.split('@')[0] || 'User',
          user.email || ''
        );
      }
      setStudentSubscription(subscription);
      console.log('📝 DEBUG: Student subscription set:', subscription?.subscription_tier);
    } catch (error) {
      console.error('📝 DEBUG: Error ensuring student record:', error);
    }
  };

  // Resume user session
  const resumeSession = async () => {
    if (!user) return;
    console.log("🔄 DEBUG: Starting resumeSession for user:", user.id);
    setIsLoading(true);
    try {
      const subscription = await subscriptionService.getStudentSubscription(user.id);
      setStudentSubscription(subscription);
      console.log("🔄 DEBUG: Got subscription:", subscription?.subscription_tier);

      const sessionData = await DatabaseService.resumeUserSession(user.id);
      console.log("🔄 DEBUG: Got sessionData from database:", sessionData);
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
      console.log("🔄 DEBUG: Set meetings:", appMeetings.length);

      const appDeliverables: Deliverable[] = sessionData.deliverables.map(dbDeliverable => ({
        id: dbDeliverable.id,
        projectId: dbDeliverable.project_id,
        type: dbDeliverable.type,
        title: dbDeliverable.title,
        content: dbDeliverable.content,
        lastModified: dbDeliverable.updated_at
      }));
      setDeliverables(appDeliverables);
      console.log("🔄 DEBUG: Set deliverables:", appDeliverables.length);
      
      if (sessionData.currentProject) {
        console.log("🔄 DEBUG: Found an active project:", sessionData.currentProject.project_id);
        const projectData = mockProjects.find(p => p.id === sessionData.currentProject!.project_id);
        if (projectData) {
          setSelectedProject(projectData);
          const activeMeeting = appMeetings.find(m => m.projectId === projectData.id && m.status === 'in_progress');
          console.log("🔄 DEBUG: Found active meeting:", activeMeeting?.id || 'none');
          setCurrentMeeting(activeMeeting || null);
          setCurrentView(sessionData.currentProject.current_step as AppView);
        }
      } else {
        console.log("🔄 DEBUG: No active project found.");
        setCurrentView('projects');
      }

    } catch (error) {
      console.error('🔄 DEBUG: CRITICAL ERROR in resumeSession:', error);
    } finally {
      console.log("🔄 DEBUG: Finished resumeSession. Setting isLoading to false.");
      setIsLoading(false);
    }
  };

  // Permission functions
  const canAccessProject = (projectId: string): boolean => {
    console.log('🔐 DEBUG: canAccessProject called for:', projectId);
    return true; // Temporary bypass
  };

  const canSaveNotes = (): boolean => {
    console.log('🔐 DEBUG: canSaveNotes called');
    return true; // Temporary bypass
  };

  const canCreateMoreMeetings = (): boolean => {
    console.log('🔐 DEBUG: canCreateMoreMeetings called');
    return true; // Temporary bypass
  };

  // Select project function
  const selectProject = async (project: Project): Promise<void> => {
    if (!user) return;
    console.log('🎯 DEBUG: selectProject called with:', project.name);
    try {
      await subscriptionService.selectProject(user.id, project.id);
      const updatedSubscription = await subscriptionService.getStudentSubscription(user.id);
      setStudentSubscription(updatedSubscription);
      setSelectedProject(project);
      await DatabaseService.createUserProject(user.id, project.id, 'project-brief');
      console.log('🎯 DEBUG: Project selected successfully');
    } catch (error) {
      console.error('🎯 DEBUG: Error selecting project:', error);
      throw error;
    }
  };

  // Add meeting function
  const addMeeting = async (meeting: Meeting): Promise<Meeting | null> => {
    console.log('➕ DEBUG: addMeeting called with meeting:', meeting.id);
    if (user && !canCreateMoreMeetings()) {
      throw new Error('You have reached your meeting limit.');
    }
    
    let createdMeeting: Meeting | null = null;
    
    if (user) {
      try {
        await subscriptionService.incrementMeetingCount(user.id);
        const updatedSubscription = await subscriptionService.getStudentSubscription(user.id);
        setStudentSubscription(updatedSubscription);
        
        // Create meeting in database and get the generated ID
        const dbMeeting = await DatabaseService.createUserMeeting(user.id, meeting);
        if (dbMeeting) {
          createdMeeting = {
            id: dbMeeting.id,
            projectId: dbMeeting.project_id,
            stakeholderIds: dbMeeting.stakeholder_ids,
            transcript: dbMeeting.transcript,
            date: dbMeeting.created_at,
            duration: dbMeeting.duration,
            status: dbMeeting.status,
            meetingType: dbMeeting.meeting_type
          };
          setMeetings(prev => [...prev, createdMeeting!]);
        }
      } catch (error) {
        console.error('➕ DEBUG: Error in addMeeting:', error);
        throw error;
      }
    } else {
      // For non-authenticated users, use the meeting as-is with a generated ID
      createdMeeting = { ...meeting, id: `meeting-${Date.now()}` };
      setMeetings(prev => [...prev, createdMeeting!]);
    }
    
    console.log('➕ DEBUG: Meeting added successfully');
    return createdMeeting;
  };

  // Update meeting function
  const updateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
    console.log('📝 DEBUG: updateMeeting called for:', meetingId);
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId ? { ...meeting, ...updates } : meeting
    ));
    if (user) {
      await DatabaseService.updateUserMeeting(meetingId, updates);
    }
  };

  // Add deliverable function
  const addDeliverable = async (deliverable: Deliverable) => {
    console.log('📄 DEBUG: addDeliverable called with:', deliverable.title);
    setDeliverables(prev => [...prev, deliverable]);
    if (user) {
      await DatabaseService.createUserDeliverable(user.id, deliverable);
    }
  };

  // Update deliverable function
  const updateDeliverable = async (deliverableId: string, updates: Partial<Deliverable>) => {
    console.log('📝 DEBUG: updateDeliverable called for:', deliverableId);
    setDeliverables(prev => prev.map(deliverable => 
      deliverable.id === deliverableId ? { ...deliverable, ...updates } : deliverable
    ));
    if (user) {
      await DatabaseService.updateUserDeliverable(deliverableId, updates);
    }
  };

  // Effect to sync currentMeeting changes with meetings array
  useEffect(() => {
    console.log('⚡ DEBUG: useEffect for currentMeeting triggered');
    if (currentMeeting) {
      const meetingIndex = meetings.findIndex(m => m.id === currentMeeting.id);
      if (meetingIndex !== -1 && JSON.stringify(meetings[meetingIndex].transcript) !== JSON.stringify(currentMeeting.transcript)) {
        console.log('⚡ DEBUG: Updating meeting transcript in database');
        const updatedMeetings = [...meetings];
        updatedMeetings[meetingIndex] = currentMeeting;
        setMeetings(updatedMeetings);
        DatabaseService.updateUserMeeting(currentMeeting.id, {
          transcript: currentMeeting.transcript
        });
      }
    }
  }, [currentMeeting, meetings]);

  // Effect to handle user authentication changes
  useEffect(() => {
    console.log('⚡ DEBUG: useEffect for user authentication triggered');
    if (user) {
      console.log('⚡ DEBUG: User authenticated, resuming session and ensuring student record');
      resumeSession();
      ensureStudentRecord();
    } else {
      console.log('⚡ DEBUG: User not authenticated, resetting state');
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

  // Create the context value object
  console.log('🔧 DEBUG: Creating context value object');
  const value: AppContextType = {
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
  };

  console.log('🔧 DEBUG: AppContext value object created successfully');
  console.log('🔧 DEBUG: About to return AppContext.Provider');

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};