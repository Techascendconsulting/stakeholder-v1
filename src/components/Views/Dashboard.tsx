import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, MessageSquare, FileText, Clock, Award, Target, Calendar, ChevronRight, Play } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseService, DatabaseProgress, DatabaseMeeting } from '../../lib/database';

const Dashboard: React.FC = () => {
  const { setCurrentView, setSelectedProject } = useApp();
  const { user } = useAuth();
  const [progress, setProgress] = useState<DatabaseProgress | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<DatabaseMeeting[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Load user progress
      let userProgress = await DatabaseService.getUserProgress(user.id);
      if (!userProgress) {
        userProgress = await DatabaseService.initializeUserProgress(user.id);
      }
      setProgress(userProgress);

      // Load recent meetings
      const meetings = await DatabaseService.getUserMeetings(user.id);
      // Filter out any meetings with missing data
      const validMeetings = meetings.filter(meeting => 
        meeting && 
        meeting.project_name && 
        meeting.created_at && 
        meeting.stakeholder_names &&
        Array.isArray(meeting.stakeholder_names)
      );
      setRecentMeetings(validMeetings.slice(0, 3)); // Show last 3 meetings

    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
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
      value: progress?.total_projects_started || 0,
      icon: Target,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Meetings Conducted',
      value: progress?.total_meetings_conducted || 0,
      icon: Users,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Voice-Only Meetings',
      value: progress?.total_voice_meetings || 0,
      icon: MessageSquare,
      color: 'bg-green-500',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Deliverables Created',
      value: progress?.total_deliverables_created || 0,
      icon: FileText,
      color: 'bg-orange-500',
      change: '+6%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
        </h1>
        <p className="text-gray-600">
          Here's your stakeholder interview progress and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {/* <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">from last week</span>
                </div> */}
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('projects')}
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Start New Meeting</p>
                  <p className="text-sm text-gray-600">Begin a stakeholder interview</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
            </button>

            <button
              onClick={() => setCurrentView('my-meetings')}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Review Meetings</p>
                  <p className="text-sm text-gray-600">View summaries and transcripts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={() => setCurrentView('deliverables')}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">View Deliverables</p>
                  <p className="text-sm text-gray-600">Access generated documents</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
            </button>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Meetings</h3>
            {recentMeetings.length > 0 && (
              <button
                onClick={() => setCurrentView('my-meetings')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All
              </button>
            )}
          </div>

          {recentMeetings.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h4>
              <p className="text-gray-600 mb-4">Start your first stakeholder interview</p>
              <button
                onClick={() => setCurrentView('projects')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start First Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMeetings.map((meeting, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {meeting.project_name?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{meeting.project_name || 'Untitled Project'}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                          <span>{meeting.stakeholder_names.length}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    meeting.meeting_type === 'voice-only' 
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {meeting.meeting_type === 'voice-only' ? 'Voice' : 'Transcript'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      {progress?.achievements && progress.achievements.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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