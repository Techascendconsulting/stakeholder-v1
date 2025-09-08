import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, User, ClipboardList, Play, CheckCircle, Lock, Eye } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { RefinementMeetingView } from '../RefinementMeetingView';
import { ErrorBoundary } from '../../ErrorBoundary';

// AgileTicket interface (matching the one from RefinementMeetingView)
interface AgileTicket {
  id: string;
  ticketNumber: string;
  projectId: string;
  projectName: string;
  type: 'Story' | 'Task' | 'Bug' | 'Spike';
  title: string;
  description: string;
  acceptanceCriteria?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Ready for Refinement' | 'Refined' | 'In Sprint' | 'To Do' | 'In Progress' | 'In Test' | 'Done';
  storyPoints?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  attachments?: any[];
  comments?: any[];
  refinementScore?: {
    clarity: number;
    completeness: number;
    testability: number;
    overall: number;
    feedback: string[];
    aiSummary: string;
  };
}

interface RefinementTrial {
  id: number;
  title: string;
  description: string;
  story: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
  locked: boolean;
}

interface BacklogRefinementSimProps {
  onBack?: () => void;
}

export const BacklogRefinementSim: React.FC<BacklogRefinementSimProps> = ({ onBack }) => {
  const { setCurrentView } = useApp();
  
  // Debug: Log when component mounts and when setCurrentView changes
  useEffect(() => {
    console.log('🔍 BacklogRefinementSim: Component mounted, setCurrentView function:', typeof setCurrentView);
  }, [setCurrentView]);
  const [activeMeeting, setActiveMeeting] = useState<{
    trialId: number;
    stories: AgileTicket[];
    isWatching: boolean; // true for observation, false for practice
  } | null>(null);

  const [trials, setTrials] = useState<RefinementTrial[]>([
    {
      id: 1,
      title: "Maintenance Request Attachments",
      description: "Watch the AI BA refine a tenant maintenance request attachment feature with the development team.",
      story: "As a tenant, I want to upload a photo or document related to my maintenance issue, So that the housing team has enough context to understand and resolve the problem more efficiently.",
      difficulty: 'Beginner',
      completed: false,
      locked: false
    },
    {
      id: 2,
      title: "Password Reset Confirmation Email",
      description: "Observe how the BA (Victor) clarifies behavior and template details for a password reset confirmation email.",
      story: "As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot any suspicious activity.",
      difficulty: 'Intermediate',
      completed: false,
      locked: false
    },
    {
      id: 3,
      title: "Edge Cases & Business Rules",
      description: "See how the AI BA navigates complex edge cases, fraud detection, and business rule discussions.",
      story: "As a customer, I want to upload my ID online so that I can complete my account verification.",
      difficulty: 'Advanced',
      completed: false,
      locked: false
    }
  ]);

  const [completedTrials, setCompletedTrials] = useState(0);
  const [canPractice, setCanPractice] = useState(false);

  // Generate sample stories for each trial
  const generateTrialStories = (trialId: number): AgileTicket[] => {
    const baseStory = {
      id: `trial-${trialId}-story-1`,
      ticketNumber: `STORY-${trialId}001`,
      projectId: 'training-project',
      projectName: 'Customer Onboarding Training',
      type: 'Story' as const,
      title: 'Default Story Title',
      description: 'Default story description',
      priority: 'Medium' as const,
      status: 'Ready for Refinement' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'training-user',
      attachments: [],
      comments: []
    };

    switch (trialId) {
      case 1: // Maintenance Request Attachments
        return [{
          ...baseStory,
          title: "Tenant can upload attachments to support maintenance request",
          description: "Currently, tenants can only describe issues in text when submitting a maintenance request. This often leads to missing details and follow-up calls. Allowing them to upload photos or documents will give the housing team clearer context and speed up resolution.\n\nAs a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to understand and resolve the problem more efficiently.",
          acceptanceCriteria: `**Acceptance Criteria:**
1. Tenant should see an upload field labeled "Add attachment (optional)" on the maintenance request form.
2. Tenant should be able to upload one or more files to support their request.
3. Accepted file types should include JPG, PNG, and JPEG. If the tenant tries to upload a file in an unsupported format (e.g. .docx, .exe), an error message should be displayed: "Only JPG, PNG, and JPEG files are allowed."
4. Maximum file size per upload should be 5 MB. If the file is larger than 5MB, an error message should be displayed: "File size must not exceed 5MB."
5. Uploading a file should not be mandatory. The tenant should still be able to submit the request without attaching any files.
6. If a file is uploaded, it should be stored with the rest of the request data and made visible to the maintenance team.`,
          priority: 'High' as const,
          storyPoints: 5
        }];
      
      case 2: // Complex File Validation
        return [{
          ...baseStory,
          id: `trial-${trialId}-story-1`,
          ticketNumber: `STORY-${trialId}001`,
          title: "Password Reset Confirmation Email",
          description: `Currently, after a password reset, customers receive on-screen confirmation but no follow-up email.

User Story

As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot any suspicious activity.`,
          acceptanceCriteria: `Acceptance Criteria

1. A confirmation email is sent immediately after a successful password reset.
2. The email is delivered to the registered account email address.
3. The subject line reads: “Your Password Has Been Reset.”
4. The email body confirms that the password change was successful.
5. The email advises: “If you did not perform this action, please contact support immediately.”
6. No part of the new password is included in the email.

Email Template (Example)

Subject: Your Password Has Been Reset

Body:
Hello [First Name],

Your password was successfully changed on [Date, Time].

If this was you, no further action is required.

If you did not make this change, please contact our support team immediately to secure your account.

Thank you,
[Company Name] Security Team`,
          priority: 'High' as const,
          storyPoints: 2
        }];
      
      case 3: // Edge Cases & Business Rules
        return [{
          ...baseStory,
          id: `trial-${trialId}-story-1`,
          ticketNumber: `STORY-${trialId}001`,
          title: "Advanced Fraud Detection and Compliance Verification",
          description: "As a business, I want to automatically detect potentially fraudulent ID uploads and ensure compliance with regulations to protect against identity theft and maintain legal compliance.",
          acceptanceCriteria: `**Given** a customer uploads an ID document
**When** the system performs advanced verification
**Then** it should detect fraud and ensure compliance

**Acceptance Criteria:**
- **Fraud Detection:** Check against known fraud patterns and suspicious document characteristics
- **Document Authenticity:** Verify document security features (watermarks, holograms, microprinting)
- **Cross-Reference Check:** Compare against existing accounts to detect duplicate identities
- **Compliance Verification:** Ensure document meets regulatory requirements (GDPR, KYC, AML)
- **Risk Scoring:** Assign risk levels (Low, Medium, High) based on multiple factors
- **Manual Review Queue:** Flag high-risk uploads for human verification
- **Audit Trail:** Log all verification steps and decisions for compliance reporting
- **Privacy Protection:** Ensure personal data is handled according to GDPR requirements
- **Real-time Alerts:** Notify security team of suspicious activity immediately
- **Customer Communication:** Provide appropriate feedback without revealing security measures`,
          priority: 'High' as const,
          storyPoints: 13
        }];
      
      default:
        return [baseStory];
    }
  };

  // Load progress from localStorage
  useEffect(() => {
    const savedTrials = localStorage.getItem('refinement_trials_progress');
    if (savedTrials) {
      const parsedTrials = JSON.parse(savedTrials);
      // Migration: ensure all trials are unlocked and Trial 2 content updated
      const migrated = (parsedTrials as RefinementTrial[]).map((t) => {
        if (t.id === 2) {
          return {
            ...t,
            title: "Password Reset Confirmation Email",
            description: "Observe how the BA (Victor) clarifies behavior and template details for a password reset confirmation email.",
            story: "As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot any suspicious activity.",
            locked: false
          } as RefinementTrial;
        }
        if (t.id === 1 || t.id === 3) {
          return { ...t, locked: false } as RefinementTrial;
        }
        return { ...t, locked: false } as RefinementTrial;
      });
      setTrials(migrated);
      
      const completed = migrated.filter((trial: RefinementTrial) => trial.completed).length;
      setCompletedTrials(completed);
      setCanPractice(completed >= 3);
    }

    // Load active meeting state from localStorage
    const savedActiveMeeting = localStorage.getItem('active_refinement_meeting');
    if (savedActiveMeeting) {
      try {
        const parsedMeeting = JSON.parse(savedActiveMeeting);
        // Only restore if the meeting data is valid
        if (parsedMeeting.trialId && parsedMeeting.stories && Array.isArray(parsedMeeting.stories)) {
          setActiveMeeting(parsedMeeting);
        }
      } catch (error) {
        console.warn('Failed to restore active meeting state:', error);
        localStorage.removeItem('active_refinement_meeting');
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('refinement_trials_progress', JSON.stringify(trials));
    
    const completed = trials.filter(trial => trial.completed).length;
    setCompletedTrials(completed);
    setCanPractice(completed >= 3);
  }, [trials]);

  // Save active meeting state to localStorage
  useEffect(() => {
    if (activeMeeting) {
      localStorage.setItem('active_refinement_meeting', JSON.stringify(activeMeeting));
    } else {
      localStorage.removeItem('active_refinement_meeting');
    }
  }, [activeMeeting]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clean up any active meeting state when component unmounts
      if (activeMeeting) {
        console.log('🧹 BacklogRefinementSim: Component unmounting, cleaning up active meeting');
        localStorage.removeItem('active_refinement_meeting');
      }
    };
  }, [activeMeeting]);

  const startTrial = (trialId: number) => {
    console.log('Starting refinement trial:', trialId);
    
    // Generate stories for this trial
    const stories = generateTrialStories(trialId);
    
    // Launch the refinement meeting in observation mode
    setActiveMeeting({
      trialId,
      stories,
      isWatching: true
    });
  };

  const startPractice = () => {
    console.log('Starting interactive refinement practice');
    
    // Use the first trial's story for practice
    const stories = generateTrialStories(1);
    
    // Launch the refinement meeting in practice mode
    setActiveMeeting({
      trialId: 1,
      stories,
      isWatching: false
    });
  };

  const handleMeetingEnd = (results: any) => {
    console.log('Meeting ended with results:', results);
    
    // Mark the trial as completed
    if (activeMeeting) {
      setTrials(prev => prev.map(trial => 
        trial.id === activeMeeting.trialId ? { ...trial, completed: true } : trial
      ));
    }
    
    // Close the meeting
    setActiveMeeting(null);
  };

  const handleMeetingClose = () => {
    console.log('🔄 BacklogRefinementSim: Meeting closed, cleaning up state');
    setActiveMeeting(null);
    // Clear any meeting-related localStorage
    localStorage.removeItem('active_refinement_meeting');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unlockNextTrial = (trialId: number) => {
    setTrials(prev => prev.map(trial => 
      trial.id === trialId + 1 ? { ...trial, locked: false } : trial
    ));
  };

  // Show refinement meeting if active
  if (activeMeeting) {
    return (
      <RefinementMeetingView
        stories={activeMeeting.stories}
        onMeetingEnd={handleMeetingEnd}
        onClose={handleMeetingClose}
      />
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
                    // Fallback to navigating to agile-practice
                    setCurrentView('agile-practice');
                  }
                }}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Refinement Practice</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Learn by watching AI team members refine user stories</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('scrum-essentials')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Review Scrum Essentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">Learning Progress</h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{completedTrials}/3</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Trials Completed</div>
              </div>
            </div>
            <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(completedTrials / 3) * 100}%` }}
              ></div>
            </div>
            <p className="text-purple-800 dark:text-purple-200 mt-4">
              Complete 3 observation trials to unlock interactive practice mode where you'll lead refinement as the BA.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Observation Trials */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Observation Trials</h3>
            <div className="space-y-4">
              {trials.map((trial) => (
                <div key={trial.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{trial.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(trial.difficulty)}`}>
                          {trial.difficulty}
                        </span>
                        {trial.completed && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {trial.locked && (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{trial.description}</p>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">User Story:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{trial.story}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => startTrial(trial.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 rounded-lg font-medium transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{trial.completed ? 'Watch Again' : 'Watch Simulation'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interactive Practice</h3>
              </div>
              
              {canPractice ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Great! You've completed all observation trials. Now it's your turn to lead a refinement meeting as the BA.
                  </p>
                  <button
                    onClick={startPractice}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 rounded-lg font-medium transition-all duration-200"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Practice</span>
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Complete all 3 observation trials to unlock interactive practice mode.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Lock className="w-4 h-4" />
                    <span>Locked until {3 - completedTrials} more trials completed</span>
                  </div>
                </div>
              )}
            </div>

            {/* Learning Resources */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ClipboardList className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Resources</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Need a refresher? Review the backlog refinement fundamentals before starting.
              </p>
              <button
                onClick={() => setCurrentView('scrum-essentials')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 rounded-lg font-medium transition-all duration-200"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Review Essentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
};

export default BacklogRefinementSim;
