import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, Clock, Target, CheckCircle, Lock, Eye, Play, Pause, Square } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { SprintPlanningMeetingView } from '../SprintPlanningMeetingView';
import { ErrorBoundary } from '../../ErrorBoundary';

// AgileTicket interface (matching the one from RefinementMeetingView)
interface AgileTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  priority: 'High' | 'Medium' | 'Low';
  storyPoints: number;
  status: 'Ready' | 'In Progress' | 'Done';
  assignee?: string;
  sprint?: string;
}

interface SprintPlanningTrial {
  id: number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  locked: boolean;
  refinedStories: AgileTicket[];
  sprintGoal: string;
  teamCapacity: number;
}

export const SprintPlanningSim: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setCurrentView } = useApp();
  
  const [trials, setTrials] = useState<SprintPlanningTrial[]>([
    {
      id: 1,
      title: "Sprint 1: User Authentication & Basic Features",
      description: "Plan the first sprint focusing on user authentication and core platform features.",
      difficulty: 'Beginner',
      completed: false,
      locked: false,
      refinedStories: [
        {
          id: 'sprint-1-story-1',
          ticketNumber: 'STORY-1001',
          title: "User Registration and Login",
          description: "As a new user, I want to create an account and log in securely so that I can access the platform and my personalized dashboard.",
          acceptanceCriteria: "1. User can register with email and password\n2. Password must meet security requirements\n3. User receives confirmation email\n4. User can log in with valid credentials\n5. Invalid login attempts are handled gracefully",
          priority: 'High',
          storyPoints: 8,
          status: 'Ready'
        },
        {
          id: 'sprint-1-story-2',
          ticketNumber: 'STORY-1002',
          title: "Dashboard Overview",
          description: "As a logged-in user, I want to see a personalized dashboard with key metrics and quick actions so that I can efficiently manage my work.",
          acceptanceCriteria: "1. Dashboard displays user-specific data\n2. Quick action buttons are visible\n3. Key metrics are prominently displayed\n4. Dashboard is responsive on mobile\n5. Data loads within 2 seconds",
          priority: 'High',
          storyPoints: 5,
          status: 'Ready'
        },
        {
          id: 'sprint-1-story-3',
          ticketNumber: 'STORY-1003',
          title: "Profile Management",
          description: "As a user, I want to update my profile information and preferences so that my account reflects my current details.",
          acceptanceCriteria: "1. User can edit profile information\n2. Changes are saved and validated\n3. Profile picture can be uploaded\n4. Email changes require verification\n5. Changes are reflected immediately",
          priority: 'Medium',
          storyPoints: 3,
          status: 'Ready'
        },
        {
          id: 'sprint-1-story-4',
          ticketNumber: 'STORY-1004',
          title: "Password Reset Functionality",
          description: "As a user who forgot their password, I want to reset it securely so that I can regain access to my account.",
          acceptanceCriteria: "1. User can request password reset via email\n2. Reset link expires after 24 hours\n3. New password meets security requirements\n4. User is notified of successful reset\n5. Old password is invalidated immediately",
          priority: 'Medium',
          storyPoints: 5,
          status: 'Ready'
        },
        {
          id: 'sprint-1-story-5',
          ticketNumber: 'STORY-1005',
          title: "Basic Search Functionality",
          description: "As a user, I want to search for content within the platform so that I can quickly find relevant information.",
          acceptanceCriteria: "1. Search input is prominently displayed\n2. Search results are relevant and fast\n3. Search supports partial matches\n4. Results are paginated for large datasets\n5. Search history is maintained",
          priority: 'Low',
          storyPoints: 8,
          status: 'Ready'
        }
      ],
      sprintGoal: "Establish a secure foundation for user management and provide essential platform functionality",
      teamCapacity: 20
    },
    {
      id: 2,
      title: "Sprint 2: Advanced Features & Integration",
      description: "Plan a sprint with more complex features and external integrations.",
      difficulty: 'Intermediate',
      completed: false,
      locked: true,
      refinedStories: [],
      sprintGoal: "Implement advanced features and third-party integrations",
      teamCapacity: 18
    },
    {
      id: 3,
      title: "Sprint 3: Performance & Scalability",
      description: "Focus on performance optimization and scalability improvements.",
      difficulty: 'Advanced',
      completed: false,
      locked: true,
      refinedStories: [],
      sprintGoal: "Optimize performance and prepare for scale",
      teamCapacity: 16
    }
  ]);

  const [activeMeeting, setActiveMeeting] = useState<{
    trialId: number;
    stories: AgileTicket[];
    sprintGoal: string;
    teamCapacity: number;
    isWatching: boolean;
  } | null>(null);

  // Load active meeting from localStorage on mount
  useEffect(() => {
    const savedMeeting = localStorage.getItem('active_sprint_planning_meeting');
    if (savedMeeting) {
      try {
        const meetingData = JSON.parse(savedMeeting);
        setActiveMeeting(meetingData);
        console.log('🔄 SprintPlanningSim: Restored active meeting from localStorage');
      } catch (error) {
        console.error('Error loading active meeting:', error);
        localStorage.removeItem('active_sprint_planning_meeting');
      }
    }
  }, []);

  // Save active meeting to localStorage whenever it changes
  useEffect(() => {
    if (activeMeeting) {
      localStorage.setItem('active_sprint_planning_meeting', JSON.stringify(activeMeeting));
    } else {
      localStorage.removeItem('active_sprint_planning_meeting');
    }
  }, [activeMeeting]);

  const startTrial = (trialId: number) => {
    const trial = trials.find(t => t.id === trialId);
    if (!trial) return;

    setActiveMeeting({
      trialId: trial.id,
      stories: trial.refinedStories,
      sprintGoal: trial.sprintGoal,
      teamCapacity: trial.teamCapacity,
      isWatching: true
    });
  };

  const handleMeetingClose = () => {
    if (activeMeeting) {
      setTrials(prev => prev.map(trial => 
        trial.id === activeMeeting.trialId ? { ...trial, completed: true } : trial
      ));
    }
    setActiveMeeting(null);
    localStorage.removeItem('active_sprint_planning_meeting');
    console.log('🔄 SprintPlanningSim: Meeting closed, cleaning up state');
  };

  const unlockNextTrial = (trialId: number) => {
    setTrials(prev => prev.map(trial => 
      trial.id === trialId + 1 ? { ...trial, locked: false } : trial
    ));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 SprintPlanningSim: Component unmounting, cleaning up active meeting');
      localStorage.removeItem('active_sprint_planning_meeting');
    };
  }, []);

  if (activeMeeting) {
    return (
      <ErrorBoundary>
        <SprintPlanningMeetingView
          stories={activeMeeting.stories}
          sprintGoal={activeMeeting.sprintGoal}
          teamCapacity={activeMeeting.teamCapacity}
          onClose={handleMeetingClose}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    console.log('🔙 Back button clicked, navigating to main Scrum Practice view');
                    if (onBack) {
                      onBack();
                    } else {
                      setCurrentView('agile-practice');
                    }
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sprint Planning Practice</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Learn how teams commit to work for the sprint using prioritised backlog items</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentView('scrum-essentials')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Review Essentials</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Progress Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Progress</h2>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {trials.filter(t => t.completed).length}/{trials.length} Sprints Completed
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Complete {trials.length} sprint planning trials to master the art of sprint commitment and capacity planning.
            </p>
          </div>

          {/* Sprint Planning Trials */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sprint Planning Trials</h3>
            
            <div className="space-y-4">
              {trials.map((trial) => (
                <div key={trial.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{trial.title}</h4>
                        {trial.completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {trial.locked && <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{trial.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{trial.refinedStories.length} Stories</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{trial.teamCapacity} Points Capacity</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{trial.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => startTrial(trial.id)}
                        disabled={trial.locked}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          trial.locked
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300'
                        }`}
                      >
                        {trial.locked ? (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Locked</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Watch Planning</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Resources */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Resources</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Need a refresher? Review the sprint planning fundamentals before starting.
            </p>
            <button
              onClick={() => setCurrentView('scrum-essentials')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 rounded-lg font-medium transition-all duration-200"
            >
              <Calendar className="w-4 h-4" />
              <span>Review Essentials</span>
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SprintPlanningSim;
