import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, MessageSquare, FileText, Clock, Award, Target, Calendar, ChevronRight, Play, FolderOpen, Eye, ArrowRight, Lightbulb, Zap, BookOpen } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseService, DatabaseProgress, DatabaseMeeting } from '../../lib/database';
import { MeetingDataService, MeetingStats } from '../../lib/meetingDataService';

const Dashboard: React.FC = () => {
  const { setCurrentView, setSelectedMeeting, refreshMeetingData } = useApp();
  const { user } = useAuth();
  const [progress, setProgress] = useState<DatabaseProgress | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<DatabaseMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [meetingStats, setMeetingStats] = useState<MeetingStats>({
    totalMeetings: 0,
    voiceMeetings: 0,
    transcriptMeetings: 0,
    uniqueProjects: 0,
    deliverablesCreated: 0
  });

  // Scroll to top on mount
  useEffect(() => {
    const scrollToTop = () => {
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        mainContainer.scrollTop = 0;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    scrollToTop();
    setTimeout(scrollToTop, 0);
    setTimeout(scrollToTop, 50);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  // Refresh data when coming back to dashboard (e.g., after completing a meeting)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user?.id) {
        console.log('🔄 Dashboard - Page became visible, refreshing data');
        await refreshMeetingData();
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, refreshMeetingData]);

  const loadDashboardData = async () => {
    if (!user?.id) {
      console.log('🚫 Dashboard - No user ID available');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Dashboard - Loading unified data for user:', user.id);
      
      // Load user progress
      console.log('📊 Dashboard - Loading user progress...');
      let userProgress = await DatabaseService.getUserProgress(user.id);
      if (!userProgress) {
        console.log('📊 Dashboard - No existing progress, initializing...');
        userProgress = await DatabaseService.initializeUserProgress(user.id);
      }
      console.log('📊 Dashboard - User progress loaded:', userProgress);
      setProgress(userProgress);

      // Use unified meeting data service
      const [stats, recentMeetingsData] = await Promise.all([
        MeetingDataService.getMeetingStats(user.id),
        MeetingDataService.getRecentMeetings(user.id, 3)
      ]);

      setMeetingStats(stats);
      setRecentMeetings(recentMeetingsData);

      // Update progress with real-time data from unified service
      if (userProgress) {
        userProgress.total_meetings_conducted = stats.totalMeetings;
        userProgress.total_voice_meetings = stats.voiceMeetings;
        userProgress.total_transcript_meetings = stats.transcriptMeetings;
        
        console.log('📊 Dashboard - Real-time statistics calculated:', {
          totalMeetings: stats.totalMeetings,
          voiceMeetings: stats.voiceMeetings,
          transcriptMeetings: stats.transcriptMeetings
        });
      }

      setProgress(userProgress);

    } catch (error) {
      console.error('❌ Dashboard - Error loading dashboard data:', error);
      // Set empty arrays to prevent undefined errors
      setProgress({
        id: '',
        user_id: user.id,
        total_projects_started: 0,
        total_projects_completed: 0,
        total_meetings_conducted: 0,
        total_deliverables_created: 0,
        total_voice_meetings: 0,
        total_transcript_meetings: 0,
        achievements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setRecentMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const handleViewMeetingSummary = (meeting: DatabaseMeeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('meeting-summary');
  };

  const handleViewRawTranscript = (meeting: DatabaseMeeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('raw-transcript');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Projects Started',
              value: meetingStats.uniqueProjects,
      icon: Target,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Meetings Conducted',
              value: meetingStats.totalMeetings,
      icon: Users,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Voice-Only Meetings',
              value: meetingStats.voiceMeetings,
      icon: MessageSquare,
      color: 'bg-green-500',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Transcript-Only Meetings',
              value: meetingStats.transcriptMeetings,
      icon: FileText,
      color: 'bg-orange-500',
      change: '+6%',
      changeType: 'positive' as const
    }
  ];

  // Calculate insights about meetings with summaries and transcripts
  const meetingsWithSummaries = recentMeetings.filter(m => m.meeting_summary && m.meeting_summary.trim()).length;
  const meetingsWithTranscripts = recentMeetings.filter(m => m.transcript && m.transcript.length > 0).length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-gray-100 mb-2">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your stakeholder interview progress and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white dark:text-gray-100">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => setCurrentView('projects')}
          className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <FolderOpen className="w-6 h-6" />
            <span className="font-semibold">Start Training Project</span>
          </div>
          <p className="text-purple-100 text-sm mt-2">Begin a new stakeholder interview project</p>
        </button>

        <button
          onClick={() => setCurrentView('my-meetings')}
          className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6" />
            <span className="font-semibold">View All Meetings</span>
          </div>
          <p className="text-green-100 text-sm mt-2">Review past interviews and summaries</p>
        </button>

        <button
          onClick={() => setCurrentView('deliverables')}
          className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <span className="font-semibold">Generate Deliverables</span>
          </div>
          <p className="text-blue-100 text-sm mt-2">Create reports and documentation</p>
        </button>
      </div>

      {/* Recent Meetings & Content Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Meetings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="mr-2" size={20} />
              Recent Meetings
            </h3>
            {recentMeetings.length > 0 && (
              <button
                onClick={() => setCurrentView('my-meetings')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
              >
                View All <ChevronRight size={16} className="ml-1" />
              </button>
            )}
          </div>

          {recentMeetings.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No meetings yet</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Start your first stakeholder interview</p>
              <button
                onClick={() => setCurrentView('projects')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start First Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMeetings.map((meeting, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-200 dark:hover:border-purple-700 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {meeting.project_name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{meeting.project_name || 'Untitled Project'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{formatDate(meeting.created_at)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{formatDuration(meeting.duration)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users size={12} />
                            <span>{meeting.stakeholder_names?.length || 0} stakeholders</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meeting.meeting_type === 'voice-only' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {meeting.meeting_type === 'voice-only' ? 'Voice' : 'Transcript'}
                    </span>
                  </div>

                  {/* Content Preview & Actions */}
                  <div className="space-y-3">
                    {/* Summary Preview */}
                    {meeting.meeting_summary && meeting.meeting_summary.trim() && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Lightbulb size={14} className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">AI Summary Available</span>
                          </div>
                          <button
                            onClick={() => handleViewMeetingSummary(meeting)}
                            className="text-xs text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-medium flex items-center"
                          >
                            View <ArrowRight size={12} className="ml-1" />
                          </button>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 line-clamp-2">
                          {meeting.meeting_summary.slice(0, 120)}...
                        </p>
                      </div>
                    )}

                    {/* Transcript Preview */}
                    {meeting.transcript && meeting.transcript.length > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MessageSquare size={14} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Full Transcript ({meeting.transcript.length} messages)
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewRawTranscript(meeting)}
                            className="text-xs text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-medium flex items-center"
                          >
                            View <ArrowRight size={12} className="ml-1" />
                          </button>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Complete conversation with {meeting.stakeholder_names?.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* If no content available */}
                    {(!meeting.meeting_summary || !meeting.meeting_summary.trim()) && 
                     (!meeting.transcript || meeting.transcript.length === 0) && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Meeting completed • No summary or transcript available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Insights Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <Zap className="mr-2" size={20} />
              Your Content Library
            </h3>
            <button
              onClick={() => setCurrentView('my-meetings')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View All →
            </button>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Build Your Knowledge Base</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Each meeting generates valuable summaries and transcripts for your reference
              </p>
              <button
                onClick={() => setCurrentView('projects')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Building
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{meetingsWithSummaries}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">AI Summaries</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{meetingsWithTranscripts}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Full Transcripts</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                * Stats from your 3 most recent meetings
              </p>

              {/* Quick Access Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentView('meeting-summary')}
                  className="w-full p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <Lightbulb size={20} />
                    <div className="text-left">
                      <div className="font-semibold">View All Summaries</div>
                      <div className="text-sm text-green-100">AI-generated insights & key points</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setCurrentView('raw-transcript')}
                  className="w-full p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare size={20} />
                    <div className="text-left">
                      <div className="font-semibold">View All Transcripts</div>
                      <div className="text-sm text-blue-100">Complete conversation records</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {meetingsWithSummaries > 0 && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-2 mb-1">
                      <Target size={14} className="text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Pro Tip</span>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Review your summaries to identify patterns in stakeholder feedback and improve your interview techniques.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      {progress?.achievements && progress.achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="mr-2" size={20} />
            Recent Achievements
          </h3>
          <div className="flex flex-wrap gap-3">
            {progress.achievements.map((achievement, index) => (
              <span
                key={index}
                className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium border border-yellow-200"
              >
                🏆 {achievement}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;