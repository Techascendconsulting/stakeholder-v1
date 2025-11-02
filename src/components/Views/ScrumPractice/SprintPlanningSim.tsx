import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Users, Clock, Target, CheckCircle, Lock, Eye, Play, Pause, Square } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import SprintPlanningMeetingView from '../SprintPlanningMeetingView';
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
  console.log('🎯 SprintPlanningSim component rendered');
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
          id: 'trial-1-story-1',
          ticketNumber: 'STORY-1001',
          projectId: 'training-project',
          projectName: 'Customer Onboarding Training',
          type: 'Story',
          title: "Tenant can upload attachments to support maintenance request",
          description: "Currently, tenants can only describe issues in text when submitting a maintenance request. This often leads to missing details and follow-up calls. Allowing them to upload photos or documents will give the housing team clearer context and speed up resolution.\n\nAs a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to understand and resolve the problem more efficiently.",
          acceptanceCriteria: "**Acceptance Criteria:**\n1. Tenant should see an upload field labeled \"Add attachment (optional)\" on the maintenance request form.\n2. Tenant should be able to upload one or more files to support their request.\n3. Accepted file types should include JPG, PNG, and JPEG. If the tenant tries to upload a file in an unsupported format (e.g. .docx, .exe), an error message should be displayed: \"Only JPG, PNG, and JPEG files are allowed.\"\n4. Maximum file size per upload should be 5 MB. If the file is larger than 5MB, an error message should be displayed: \"File size must not exceed 5MB.\"\n5. Uploading a file should not be mandatory. The tenant should still be able to submit the request without attaching any files.\n6. If a file is uploaded, it should be stored with the rest of the request data and made visible to the maintenance team.",
          priority: 'High',
          storyPoints: 5,
          status: 'Refined',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'system'
        },
        {
          id: 'trial-2-story-1',
          ticketNumber: 'STORY-1002',
          projectId: 'training-project',
          projectName: 'Customer Onboarding Training',
          type: 'Story',
          title: "Password Reset Confirmation Email",
          description: "Currently, after a password reset, customers receive on-screen confirmation but no follow-up email.\n\nUser Story\n\nAs a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot any suspicious activity.",
          acceptanceCriteria: "Acceptance Criteria\n\n1. A confirmation email is sent immediately after a successful password reset.\n2. The email is delivered to the registered account email address.\n3. The subject line reads: \"Your Password Has Been Reset.\"\n4. The email body confirms that the password change was successful.\n5. The email advises: \"If you did not perform this action, please contact support immediately.\"\n6. No part of the new password is included in the email.\n\nEmail Template (Example)\n\nSubject: Your Password Has Been Reset\n\nBody:\nHello [First Name],\n\nYour password was successfully changed on [Date, Time].\n\nIf this was you, no further action is required.\n\nIf you did not make this change, please contact our support team immediately to secure your account.\n\nThank you,\n[Company Name] Security Team",
          priority: 'High',
          storyPoints: 2,
          status: 'Refined',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'system'
        },
        {
          id: 'trial-3-story-1',
          ticketNumber: 'STORY-1003',
          projectId: 'training-project',
          projectName: 'Customer Onboarding Training',
          type: 'Story',
          title: "Advanced Fraud Detection and Compliance Verification",
          description: "As a business, I want to automatically detect potentially fraudulent ID uploads and ensure compliance with regulations to protect against identity theft and maintain legal compliance.",
          acceptanceCriteria: "**Given** a customer uploads an ID document\n**When** the system performs advanced verification\n**Then** it should detect fraud and ensure compliance\n\n**Acceptance Criteria:**\n- **Fraud Detection:** Check against known fraud patterns and suspicious document characteristics\n- **Document Authenticity:** Verify document security features (watermarks, holograms, microprinting)\n- **Cross-Reference Check:** Compare against existing accounts to detect duplicate identities\n- **Compliance Verification:** Ensure document meets regulatory requirements (GDPR, KYC, AML)\n- **Risk Scoring:** Assign risk levels (Low, Medium, High) based on multiple factors\n- **Manual Review Queue:** Flag high-risk uploads for human verification\n- **Audit Trail:** Log all verification steps and decisions for compliance reporting\n- **Privacy Protection:** Ensure personal data is handled according to GDPR requirements\n- **Real-time Alerts:** Notify security team of suspicious activity immediately\n- **Customer Communication:** Provide appropriate feedback without revealing security measures",
          priority: 'High',
          storyPoints: 13,
          status: 'Refined',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'system'
        },
        {
          id: 'sprint-1-story-4',
          ticketNumber: 'STORY-1004',
          projectId: 'training-project',
          projectName: 'Customer Onboarding Training',
          type: 'Story',
          title: "User Registration and Login",
          description: "As a new user, I want to create an account and log in securely so that I can access the platform and my personalized dashboard.",
          acceptanceCriteria: "1. User can register with email and password\n2. Password must meet security requirements\n3. User receives confirmation email\n4. User can log in with valid credentials\n5. Invalid login attempts are handled gracefully",
          priority: 'High',
          storyPoints: 8,
          status: 'Ready for Refinement',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'system'
        },
        {
          id: 'sprint-1-story-5',
          ticketNumber: 'STORY-1005',
          projectId: 'training-project',
          projectName: 'Customer Onboarding Training',
          type: 'Story',
          title: "Dashboard Overview",
          description: "As a logged-in user, I want to see a personalized dashboard with key metrics and quick actions so that I can efficiently manage my work.",
          acceptanceCriteria: "1. Dashboard displays user-specific data\n2. Quick action buttons are visible\n3. Key metrics are prominently displayed\n4. Dashboard is responsive on mobile\n5. Data loads within 2 seconds",
          priority: 'High',
          storyPoints: 5,
          status: 'Ready for Refinement',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'system'
        },
        {
          id: 'sprint-1-story-6',
          ticketNumber: 'STORY-1006',
          projectId: 'training-project',
          projectName: 'Customer Onboarding Training',
          type: 'Story',
          title: "Profile Management",
          description: "As a user, I want to update my profile information and preferences so that my account reflects my current details.",
          acceptanceCriteria: "1. User can edit profile information\n2. Changes are saved and validated\n3. Profile picture can be uploaded\n4. Email changes require verification\n5. Changes are reflected immediately",
          priority: 'Medium',
          storyPoints: 3,
          status: 'Ready for Refinement',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'system'
        },
        {
          id: 'sprint-1-story-7',
          ticketNumber: 'STORY-1007',
          projectId: 'training-project',
          projectName: 'Customer Onboarding Training',
          type: 'Story',
          title: "Password Reset Functionality",
          description: "As a user who forgot their password, I want to reset it securely so that I can regain access to my account.",
          acceptanceCriteria: "1. User can request password reset via email\n2. Reset link expires after 24 hours\n3. New password meets security requirements\n4. User is notified of successful reset\n5. Old password is invalidated immediately",
          priority: 'Medium',
          storyPoints: 5,
          status: 'Ready for Refinement',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'system'
        },
        {
          id: 'sprint-1-story-8',
          ticketNumber: 'STORY-1008',
          projectId: 'training-project',
          projectName: 'Customer Onboarding Training',
          type: 'Story',
          title: "Basic Search Functionality",
          description: "As a user, I want to search for content within the platform so that I can quickly find relevant information.",
          acceptanceCriteria: "1. Search input is prominently displayed\n2. Search results are relevant and fast\n3. Search supports partial matches\n4. Results are paginated for large datasets\n5. Search history is maintained",
          priority: 'Low',
          storyPoints: 8,
          status: 'Ready for Refinement',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'system'
        }
      ],
      sprintGoal: "Implement core customer onboarding features including maintenance request attachments, password reset confirmations, and fraud detection",
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
      stories: trial.refinedStories, // These are the Sprint Planning stories, not Refinement stories
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
          onMeetingEnd={(results) => {
            console.log('Sprint Planning meeting ended:', results);
            handleMeetingClose();
          }}
          onClose={handleMeetingClose}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Simple Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sprint Planning Practice</h1>
                  <p className="text-gray-600 dark:text-gray-300">Learn how teams commit to work for the sprint using prioritised backlog items</p>
                </div>
              </div>
              
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

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Progress Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Learning Progress</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Complete {trials.length} sprint planning trials to master the art of sprint commitment and capacity planning.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {trials.filter(t => t.completed).length}/{trials.length} Sprints Completed
            </div>
          </div>

          {/* Sprint Planning Trials */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sprint Planning Trials</h2>
            
            <div className="space-y-4">
              {trials.map((trial) => (
                <div key={trial.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{trial.title}</h3>
                        {trial.completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {trial.locked && <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{trial.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
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
                    
                    <div className="ml-6">
                      <button
                        onClick={() => startTrial(trial.id)}
                        disabled={trial.locked}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          trial.locked
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {trial.locked ? (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Locked</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Start Planning</span>
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
          <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Learning Resources</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Need a refresher? Review the sprint planning fundamentals before starting.
            </p>
            <button
              onClick={() => setCurrentView('scrum-essentials')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
