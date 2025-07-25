import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, MessageSquare, TrendingUp, Target, Lightbulb, Award, BarChart3, Calendar, CheckCircle, AlertTriangle, FileText, Download, Share2, Star, Zap, Brain, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseMeeting } from '../../lib/database';
import { MeetingDataService } from '../../lib/meetingDataService';

export const MeetingDetailsView: React.FC = () => {
  const { setCurrentView, selectedMeeting } = useApp();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<DatabaseMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalytics, setAiAnalytics] = useState<any>(null);

  useEffect(() => {
    loadMeetingDetails();
  }, [selectedMeeting, user?.id]);

  const loadMeetingDetails = async () => {
    if (!selectedMeeting || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get all meetings and find the selected one
      const allMeetings = await MeetingDataService.getAllUserMeetings(user.id);
      const meetingData = allMeetings.find(m => m.id === selectedMeeting.id);
      
      if (meetingData) {
        setMeeting(meetingData);
        generateAIAnalytics(meetingData);
      }
    } catch (error) {
      console.error('Error loading meeting details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIAnalytics = (meetingData: DatabaseMeeting) => {
    // Simulate AI analysis - in real app this would call OpenAI API
    const messageRatio = meetingData.total_messages / Math.max((meetingData.duration / 60), 1);
    const userParticipation = ((meetingData.user_messages || 0) / Math.max(meetingData.total_messages, 1)) * 100;
    const aiParticipation = ((meetingData.ai_messages || 0) / Math.max(meetingData.total_messages, 1)) * 100;
    
    const analytics = {
      overallScore: Math.round(65 + (messageRatio * 10) + (Math.min(userParticipation, 50))),
      communicationScore: Math.round(70 + (userParticipation * 0.6)),
      engagementScore: Math.round(60 + (messageRatio * 15)),
      preparationScore: Math.round(75 + Math.random() * 20),
      listeningScore: Math.round(65 + (aiParticipation * 0.4)),
      
      strengths: [
        'Active questioning and follow-up',
        'Good stakeholder engagement',
        'Clear communication style',
        'Appropriate meeting pace'
      ],
      
      improvements: [
        'Ask more open-ended questions to encourage elaboration',
        'Summarize key points more frequently during conversation',
        'Allow longer pauses for stakeholder reflection',
        'Probe deeper into underlying business motivations'
      ],
      
      keyMoments: [
        { time: '0:03:45', insight: 'Excellent rapport building opening' },
        { time: '0:12:20', insight: 'Good clarifying question about requirements' },
        { time: '0:18:15', insight: 'Opportunity missed to explore pain points deeper' },
        { time: '0:25:30', insight: 'Strong summary of discussed priorities' }
      ],
      
      nextSteps: [
        'Schedule follow-up to review documented requirements',
        'Share meeting summary with all stakeholders',
        'Prepare specific questions for next technical discussion',
        'Research industry best practices mentioned'
      ]
    };

    setAiAnalytics(analytics);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMeetingTypeInfo = () => {
    if (!meeting) return { label: 'Meeting', color: 'bg-gray-100 text-gray-700', icon: MessageSquare };
    
    switch (meeting.meeting_type) {
      case 'voice-only':
        return { 
          label: 'Voice-Only Meeting', 
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: MessageSquare 
        };
      case 'voice-transcript':
        return { 
          label: 'Voice + Transcript Meeting', 
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: FileText 
        };
      default:
        return { 
          label: 'Meeting', 
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Users 
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <Award className="w-5 h-5" />;
    if (score >= 70) return <TrendingUp className="w-5 h-5" />;
    if (score >= 60) return <Target className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Meeting Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The requested meeting could not be loaded.</p>
          <button
            onClick={() => setCurrentView('my-meetings')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to My Meetings
          </button>
        </div>
      </div>
    );
  }

  const meetingTypeInfo = getMeetingTypeInfo();
  const TypeIcon = meetingTypeInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('my-meetings')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Meeting Details</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Deep analysis and insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Download size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meeting Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {meeting.project_name?.charAt(0) || 'M'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {meeting.project_name}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{formatDate(meeting.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{formatDuration(meeting.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span>{meeting.stakeholder_names?.length || 0} participants</span>
                  </div>
                </div>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${meetingTypeInfo.color}`}>
              <TypeIcon size={14} className="mr-2" />
              {meetingTypeInfo.label}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{meeting.total_messages}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Messages</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{meeting.user_messages || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Your Messages</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{meeting.topics_discussed?.length || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Topics Covered</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{meeting.key_insights?.length || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Key Insights</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Actionable Insights */}
          <div className="lg:col-span-3 space-y-8">
            {/* AI Performance Scoring */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Brain className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Performance Analysis</h3>
              </div>

              {aiAnalytics && (
                <>
                  {/* Overall Score */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreColor(aiAnalytics.overallScore)}`}>
                      {aiAnalytics.overallScore}
                    </div>
                    <div className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Overall Performance</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Business Analyst Effectiveness</div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Communication</span>
                        <span className={`text-sm font-bold ${getScoreColor(aiAnalytics.communicationScore).split(' ')[0]}`}>
                          {aiAnalytics.communicationScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreColor(aiAnalytics.communicationScore).includes('green') ? 'bg-green-500' : getScoreColor(aiAnalytics.communicationScore).includes('blue') ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{ width: `${aiAnalytics.communicationScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Engagement</span>
                        <span className={`text-sm font-bold ${getScoreColor(aiAnalytics.engagementScore).split(' ')[0]}`}>
                          {aiAnalytics.engagementScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreColor(aiAnalytics.engagementScore).includes('green') ? 'bg-green-500' : getScoreColor(aiAnalytics.engagementScore).includes('blue') ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{ width: `${aiAnalytics.engagementScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preparation</span>
                        <span className={`text-sm font-bold ${getScoreColor(aiAnalytics.preparationScore).split(' ')[0]}`}>
                          {aiAnalytics.preparationScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreColor(aiAnalytics.preparationScore).includes('green') ? 'bg-green-500' : getScoreColor(aiAnalytics.preparationScore).includes('blue') ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{ width: `${aiAnalytics.preparationScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Listening</span>
                        <span className={`text-sm font-bold ${getScoreColor(aiAnalytics.listeningScore).split(' ')[0]}`}>
                          {aiAnalytics.listeningScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreColor(aiAnalytics.listeningScore).includes('green') ? 'bg-green-500' : getScoreColor(aiAnalytics.listeningScore).includes('blue') ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{ width: `${aiAnalytics.listeningScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Areas for Improvement - Main Focus */}
            {aiAnalytics && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Action Items: Areas for Improvement</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiAnalytics.improvements.map((improvement: string, index: number) => (
                    <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full text-white text-xs flex items-center justify-center font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Improvement Area</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{improvement}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps - Main Focus */}
            {aiAnalytics && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ChevronRight className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Action Items: Recommended Next Steps</h3>
                </div>
                <div className="space-y-4">
                  {aiAnalytics.nextSteps.map((step: string, index: number) => (
                    <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Next Action</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Supporting Information */}
          <div className="space-y-6">
            {/* Strengths */}
            {aiAnalytics && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {aiAnalytics.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Participants */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Participants</h3>
              </div>
              <div className="space-y-3">
                {(meeting.stakeholder_names || []).map((name, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {(meeting.stakeholder_roles || [])[index] || 'Stakeholder'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentView('meeting-summary')}
                  className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Lightbulb size={16} />
                    <span className="text-sm font-medium">View AI Summary</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
                
                <button
                  onClick={() => setCurrentView('raw-transcript')}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare size={16} />
                    <span className="text-sm font-medium">View Full Transcript</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};