import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Circle,
  Clock,
  Users,
  Award,
  MessageSquare,
  Lightbulb,
  FileText,
  Eye,
  Calendar,
  BarChart3,
  X
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

// Types for Training Dashboard
interface TrainingMeeting {
  id: string;
  stage: string;
  date: Date;
  coverage: number;
  technique: number;
  missedAreas: string[];
  transcript: string;
  feedback: string[];
  projectName: string;
  duration: number;
  stakeholderCount: number;
}

interface TrainingProgress {
  completedStages: string[];
  currentStage: string;
  totalStages: number;
  stageScores: Record<string, number>;
}

interface TrainingMetrics {
  averageScore: number;
  totalMissedAreas: number;
  completedMeetings: number;
  averageTechnique: number;
  averageCoverage: number;
  topFeedbackTips: string[];
}

// Stage configuration
const STAGES = [
  { id: 'kickoff', name: 'Kickoff', description: 'Project Introduction' },
  { id: 'problem_exploration', name: 'Problem Exploration', description: 'Understanding Issues' },
  { id: 'as_is', name: 'As-Is Process', description: 'Current State Analysis' },
  { id: 'as_is_mapping', name: 'As-Is Process Map', description: 'Process Documentation' },
  { id: 'to_be', name: 'To-Be Process', description: 'Future State Design' },
  { id: 'solution_design', name: 'Solution Design', description: 'Technical Requirements' }
];

const TrainingDashboardView: React.FC = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  
  // Add console log to verify component is loading
  console.log('🎯 Training Dashboard View loaded!');
  
  const [trainingMeetings, setTrainingMeetings] = useState<TrainingMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<TrainingMeeting | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<TrainingProgress>({
    completedStages: ['kickoff', 'problem_exploration'],
    currentStage: 'as_is',
    totalStages: 6,
    stageScores: {
      kickoff: 85,
      problem_exploration: 78
    }
  });
  const [metrics, setMetrics] = useState<TrainingMetrics>({
    averageScore: 81.5,
    totalMissedAreas: 12,
    completedMeetings: 8,
    averageTechnique: 82,
    averageCoverage: 81,
    topFeedbackTips: [
      "Ask more follow-up questions to dig deeper into stakeholder responses",
      "Focus on open-ended questions rather than yes/no questions",
      "Remember to explore constraints and limitations in each stage"
    ]
  });

  // Get user's display name
  const getUserDisplayName = () => {
    // This should come from user profile or metadata
    // For now, extract from email as fallback
    return user?.email?.split('@')[0] || 'User';
  };

  // Load real training data
  useEffect(() => {
    const loadTrainingData = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call to get training sessions
        // const response = await fetch('/api/training/sessions?type=training');
        // const sessions = await response.json();
        
        // For now, check sessionStorage for any training sessions
        const trainingConfig = sessionStorage.getItem('trainingConfig');
        const trainingMessages = sessionStorage.getItem('trainingMessages');
        
        if (trainingConfig && trainingMessages) {
          const config = JSON.parse(trainingConfig);
          const messages = JSON.parse(trainingMessages);
          
          // Create a training meeting from actual session data
          const realTrainingMeeting: TrainingMeeting = {
            id: config.sessionId || 'session-1',
            stage: config.stage || 'problem_exploration',
            date: new Date(),
            coverage: 75, // This should come from actual scoring
            technique: 80, // This should come from actual scoring
            missedAreas: ['Project Timeline', 'Stakeholder Roles'], // From actual analysis
            transcript: formatTranscriptFromMessages(messages, getUserDisplayName()),
            feedback: ['Good introduction', 'Could ask more about timeline'],
            projectName: config.projectName || 'Training Project',
            duration: 12,
            stakeholderCount: 2
          };
          
          setTrainingMeetings([realTrainingMeeting]);
        } else {
          // No real training data found, show empty state
          setTrainingMeetings([]);
        }
      } catch (error) {
        console.error('Error loading training data:', error);
        setTrainingMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainingData();
  }, [user]);

  // Format actual messages into a readable transcript
  const formatTranscriptFromMessages = (messages: any[], userName: string): string => {
    if (!messages || messages.length === 0) {
      return 'No conversation data available.';
    }

    return messages.map((message: any) => {
      const speaker = message.role === 'user' ? userName : message.stakeholderName || 'Stakeholder';
      return `${speaker}: ${message.content}`;
    }).join('\n\n');
  };

  const getNextSuggestedStage = () => {
    const allStages = STAGES.map(s => s.id);
    const incompleteStages = allStages.filter(stage => 
      !progress.completedStages.includes(stage)
    );
    return incompleteStages[0] || null;
  };

  const getStageColor = (stageId: string) => {
    if (progress.completedStages.includes(stageId)) {
      return 'text-green-600 dark:text-green-400';
    } else if (stageId === progress.currentStage) {
      return 'text-purple-600 dark:text-purple-400';
    } else {
      return 'text-gray-400 dark:text-gray-500';
    }
  };

  const getStageIcon = (stageId: string) => {
    if (progress.completedStages.includes(stageId)) {
      return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
    } else if (stageId === progress.currentStage) {
      return <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    } else {
      return <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />;
    }
  };

  const nextStage = getNextSuggestedStage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-indigo-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your training data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-indigo-900/10">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Training Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track your stakeholder interview practice progress
              </p>
            </div>
          </div>
          
          {/* Continue Training Button - Top Right */}
          <button
            onClick={() => setCurrentView('training-hub')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Play className="w-4 h-4" />
            <span>Continue Training</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Training Progress Tracker - Redesigned */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Training Progress Tracker</span>
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {progress.completedStages.length} of {progress.totalStages} stages completed
            </div>
          </div>

          {/* Improved Stage Progress */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STAGES.map((stage, index) => (
              <div key={stage.id} className="flex flex-col items-center space-y-3 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: progress.completedStages.includes(stage.id) 
                    ? '#10b981' 
                    : stage.id === progress.currentStage 
                    ? '#9333ea' 
                    : '#e5e7eb'
                }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700">
                  {getStageIcon(stage.id)}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${getStageColor(stage.id)}`}>
                    {stage.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stage.description}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {progress.stageScores[stage.id] ? `${progress.stageScores[stage.id]}%` : 'Not started'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Training Meetings - Enhanced */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Recent Training Meetings</span>
              </h3>

              {trainingMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Start Your Training Journey
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Complete your first training session to see your progress and conversation transcripts here.
                  </p>
                  <button
                    onClick={() => setCurrentView('training-hub')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Training</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {trainingMeetings.map((meeting) => (
                    <div key={meeting.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium rounded-full">
                            Training: {STAGES.find(s => s.id === meeting.stage)?.name}
                          </span>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{meeting.date.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {meeting.coverage}%
                            </div>
                            <div className="text-xs text-gray-500">Coverage</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                              {meeting.technique}%
                            </div>
                            <div className="text-xs text-gray-500">Technique</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {meeting.projectName}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{meeting.duration} min</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{meeting.stakeholderCount} stakeholders</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Missed areas: {meeting.missedAreas.join(', ')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setShowTranscript(true);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Transcript</span>
                        </button>
                        <button
                          onClick={() => setCurrentView('training-hub')}
                          className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span>Practice Again</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Suggested Stage */}
            {nextStage && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200/30 dark:border-purple-700/30 mt-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Next Suggested Stage</span>
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Continue your training with: <strong>{STAGES.find(s => s.id === nextStage)?.name}</strong>
                </p>
                <button
                  onClick={() => setCurrentView('training-hub')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start {STAGES.find(s => s.id === nextStage)?.name}</span>
                </button>
              </div>
            )}
          </div>

          {/* Training Metrics */}
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Training Metrics</span>
              </h3>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {metrics.averageScore}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Average Score
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {metrics.averageTechnique}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Technique
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {metrics.averageCoverage}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Coverage
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {metrics.totalMissedAreas}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total Missed Areas
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {metrics.completedMeetings}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Training Meetings
                  </div>
                </div>
              </div>
            </div>

            {/* Top Feedback Tips */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Top Improvement Tips</span>
              </h4>
              <div className="space-y-3">
                {metrics.topFeedbackTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Stats */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200/30 dark:border-purple-700/30">
              <h4 className="text-md font-bold text-gray-900 dark:text-white mb-3">
                Quick Stats
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sessions Today</span>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Best Score</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">3 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      {showTranscript && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Training Meeting Transcript
              </h3>
              <button
                onClick={() => setShowTranscript(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded">
                    {STAGES.find(s => s.id === selectedMeeting.stage)?.name}
                  </span>
                  <span>{selectedMeeting.date.toLocaleDateString()}</span>
                  <span>{selectedMeeting.duration} minutes</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedMeeting.projectName}
                </h4>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans">
                  {selectedMeeting.transcript}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingDashboardView;
