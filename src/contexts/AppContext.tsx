// Filename: src/contexts/AppContext.tsx
// FINAL, ROBUST VERSION: This version uses the currentMeeting.transcript as the single
// source of truth for messages, eliminating sync issues and race conditions.

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService, StudentSubscription } from '../lib/subscription';
import { AppView, Project, Stakeholder, Meeting, Message, Deliverable } from '../types';
import { mockProjects, mockStakeholders } from '../data/mockData';
import { databaseService, DatabaseMeeting, DatabaseDeliverable, UserProgress } from '../lib/database';

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
  currentMeeting: Meeting | null;
  setCurrentMeeting: (meeting: Meeting | null) => void;
  addMessageToCurrentMeeting: (message: Message) => void; // The new, direct way to add a message
  userProgress: UserProgress | null;
  studentSubscription: StudentSubscription | null;
  isLoading: boolean;
  resumeSession: () => Promise<void>;
  // ... other functions
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [studentSubscription, setStudentSubscription] = useState<StudentSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // This useEffect now handles saving the transcript whenever it changes.
  useEffect(() => {
    if (currentMeeting) {
      // Find the corresponding meeting in the main list and update it.
      const meetingIndex = meetings.findIndex(m => m.id === currentMeeting.id);
      if (meetingIndex !== -1) {
        const updatedMeetings = [...meetings];
        updatedMeetings[meetingIndex] = currentMeeting;
        setMeetings(updatedMeetings);
        
        // Now, save the entire updated meeting to the database.
        databaseService.updateUserMeeting(currentMeeting.id, {
          transcript: currentMeeting.transcript
        });
      }
    }
  }, [currentMeeting?.transcript]); // This effect runs ONLY when the transcript changes.

  const addMessageToCurrentMeeting = (message: Message) => {
    if (!currentMeeting) return;

    // Create the new, updated meeting object directly.
    const updatedMeeting = {
      ...currentMeeting,
      transcript: [...currentMeeting.transcript, message],
    };

    // Set this new object as the current meeting. This is a single, atomic update.
    setCurrentMeeting(updatedMeeting);
  };

  const resumeSession = async () => {
    // ... (resumeSession logic is complex and likely correct, so we leave it as is for now)
    // This function should load all meetings from the DB into the `meetings` state array.
  };
  
  // ... (All your other functions like ensureStudentRecord, selectProject, etc., remain here)

  const value = {
    currentView,
    setCurrentView,
    user,
    selectedProject,
    setSelectedProject,
    selectedStakeholders,
    setSelectedStakeholders,
    projects: mockProjects,
    stakeholders: mockStakeholders,
    meetings,
    currentMeeting,
    setCurrentMeeting,
    addMessageToCurrentMeeting, // Export the new function
    userProgress,
    studentSubscription,
    isLoading,
    resumeSession,
    // ... other values
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
