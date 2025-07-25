import React, { useState, useEffect } from 'react';
import { Clock, Users, MessageSquare, TrendingUp, Search, Filter, Calendar, Eye, FileText, ChevronRight, Star, CheckCircle, AlertCircle, BarChart3, Target, Lightbulb, ArrowRight, Plus, Sparkles, BookOpen, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseService, DatabaseMeeting } from '../../lib/database';
import { MeetingDataService } from '../../lib/meetingDataService';

interface MeetingCardProps {
  meeting: DatabaseMeeting;
  onViewDetails: (meeting: DatabaseMeeting) => void;
  onViewSummary: (meeting: DatabaseMeeting) => void;
  onViewTranscript: (meeting: DatabaseMeeting) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onViewDetails, onViewSummary, onViewTranscript }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEngagementLevel = () => {
    const messageRatio = meeting.total_messages / (meeting.duration / 60); // messages per minute
    if (messageRatio > 2) return { level: 'High', color: 'bg-emerald-100 text-emerald-700', icon: TrendingUp };
    if (messageRatio > 1) return { level: 'Medium', color: 'bg-blue-100 text-blue-700', icon: BarChart3 };
    return { level: 'Low', color: 'bg-gray-100 text-gray-600', icon: Target };
  };

  const engagement = getEngagementLevel();
  const EngagementIcon = engagement.icon;

  const hasInsights = meeting.meeting_summary && meeting.meeting_summary.trim();
  const hasTranscript = meeting.transcript && meeting.transcript.length > 0;
  const topicsCount = meeting.topics_discussed?.length || 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">
                {meeting.project_name?.charAt(0) || 'M'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {meeting.project_name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar size={12} />
                <span>{formatDate(meeting.created_at)}</span>
                <span>•</span>
                <Clock size={12} />
                <span>{formatTime(meeting.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {hasInsights && (
            <div className="p-1.5 bg-green-100 text-green-600 rounded-lg" title="AI Summary Available">
              <Lightbulb size={14} />
            </div>
          )}
          {hasTranscript && (
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg" title="Full Transcript Available">
              <MessageSquare size={14} />
            </div>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            meeting.status === 'completed' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          }`}>
            {meeting.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users size={16} className="text-purple-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.stakeholder_names?.length || 0}</div>
          <div className="text-xs text-gray-500">Stakeholders</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <MessageSquare size={16} className="text-blue-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.total_messages}</div>
          <div className="text-xs text-gray-500">Exchanges</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock size={16} className="text-green-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatDuration(meeting.duration)}</div>
          <div className="text-xs text-gray-500">Duration</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <EngagementIcon size={16} className={engagement.color.includes('emerald') ? 'text-emerald-500' : engagement.color.includes('blue') ? 'text-blue-500' : 'text-gray-400'} />
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{engagement.level}</div>
          <div className="text-xs text-gray-500">Engagement</div>
        </div>
      </div>

      {/* Stakeholders */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Users size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Meeting Participants</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(meeting.stakeholder_names || []).slice(0, 3).map((name, index) => (
            <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
              <span className="font-medium">{name}</span>
              <span className="text-purple-500">({(meeting.stakeholder_roles || [])[index]})</span>
            </div>
          ))}
          {(meeting.stakeholder_names?.length || 0) > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              +{(meeting.stakeholder_names?.length || 0) - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Content Highlights - Enhanced */}
      <div className="mb-4 space-y-3">
        {/* AI Summary Section */}
        {hasInsights ? (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-200">AI-Generated Summary</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSummary(meeting);
                }}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <Eye size={12} />
                <span>View Full Summary</span>
              </button>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 line-clamp-3 leading-relaxed">
              {meeting.meeting_summary.slice(0, 180)}...
            </p>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              ✨ Key insights, action items, and meeting highlights included
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle size={14} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">No AI Summary Available</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Meeting completed but summary generation may have been skipped
            </p>
          </div>
        )}

        {/* Transcript Section */}
        {hasTranscript ? (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  Complete Transcript ({meeting.transcript.length} messages)
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewTranscript(meeting);
                }}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <FileText size={12} />
                <span>View Transcript</span>
              </button>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Full conversation record with {meeting.stakeholder_names?.join(', ')} • 
              Perfect for detailed analysis and reference
            </p>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              📝 Complete dialogue, timestamps, and speaker attribution
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare size={14} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">No Transcript Available</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This was likely a voice-only meeting without transcript generation
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {topicsCount > 0 && (
            <div className="flex items-center space-x-1 text-gray-500">
              <TrendingUp size={12} />
              <span className="text-xs">{topicsCount} topics discussed</span>
            </div>
          )}
          <div className={`flex items-center space-x-1 ${engagement.color}`}>
            <EngagementIcon size={12} />
            <span className="text-xs">{engagement.level} engagement</span>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(meeting)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 group-hover:scale-105"
        >
          <Eye size={14} />
          <span>View Details</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export const MyMeetingsView: React.FC = () => {
  const { setCurrentView, setSelectedMeeting, refreshMeetingData } = useApp();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<DatabaseMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'voice-only' | 'transcript'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'with-summary' | 'with-transcript' | 'no-content'>('all');

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
    loadMeetings();
  }, [user?.id]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user?.id) {
        console.log('🔄 MyMeetings - Page became visible, refreshing data');
        await refreshMeetingData();
        loadMeetings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, refreshMeetingData]);

  const loadMeetings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('📋 MyMeetings - Loading meetings using unified service for user:', user.id);
      
      // Use unified meeting data service
      const allMeetings = await MeetingDataService.getAllUserMeetings(user.id);
      console.log('📋 MyMeetings - Unified service returned:', allMeetings.length, 'meetings');
      
      setMeetings(allMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMeetingDetails = (meeting: DatabaseMeeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('meeting-summary');
  };

  const handleViewSummary = (meeting: DatabaseMeeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('meeting-summary');
  };

  const handleViewTranscript = (meeting: DatabaseMeeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('raw-transcript');
  };

  // Filter meetings based on search and filters
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = searchTerm === '' || 
      meeting.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (meeting.stakeholder_names || []).some(name => name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || meeting.meeting_type === filterType;
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    
    // New content filter
    let matchesContent = true;
    switch (contentFilter) {
      case 'with-summary':
        matchesContent = meeting.meeting_summary && meeting.meeting_summary.trim() !== '';
        break;
      case 'with-transcript':
        matchesContent = meeting.transcript && meeting.transcript.length > 0;
        break;
      case 'no-content':
        matchesContent = (!meeting.meeting_summary || meeting.meeting_summary.trim() === '') && 
                        (!meeting.transcript || meeting.transcript.length === 0);
        break;
      default:
        matchesContent = true;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesContent;
  });

  // Calculate insights
  const totalMeetings = meetings.length;
  const completedMeetings = meetings.filter(m => m.status === 'completed').length;
  const totalStakeholders = new Set(meetings.flatMap(m => m.stakeholder_names)).size;
  const totalDuration = meetings.reduce((acc, m) => acc + m.duration, 0);
  const avgEngagement = meetings.length > 0 
    ? meetings.reduce((acc, m) => acc + (m.total_messages / (m.duration / 60)), 0) / meetings.length 
    : 0;
  const withInsights = meetings.filter(m => m.meeting_summary && m.meeting_summary.trim()).length;
  const withTranscripts = meetings.filter(m => m.transcript && m.transcript.length > 0).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your stakeholder meetings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Hero Header with Value Proposition */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Stakeholder Journey
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              Track, analyze, and improve your stakeholder conversations. Review AI summaries and full transcripts to enhance your skills.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('projects')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>Start New Meeting</span>
          </button>
        </div>

        {/* Enhanced Key Insights Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <CheckCircle size={20} className="text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{totalMeetings}</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Total Meetings</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                <Sparkles size={20} className="text-green-600 dark:text-green-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{withInsights}</div>
                <div className="text-sm text-green-700 dark:text-green-300">AI Summaries</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <FileText size={20} className="text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{withTranscripts}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Full Transcripts</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                <Users size={20} className="text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{totalStakeholders}</div>
                <div className="text-sm text-indigo-700 dark:text-indigo-300">Stakeholders</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                <Clock size={20} className="text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Total Time</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-800 rounded-lg">
                <TrendingUp size={20} className="text-teal-600 dark:text-teal-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                  {avgEngagement.toFixed(1)}
                </div>
                <div className="text-sm text-teal-700 dark:text-teal-300">Avg Engagement</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                <Star size={20} className="text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{completedMeetings}</div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Library Quick Access */}
        {(withInsights > 0 || withTranscripts > 0) && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 flex items-center">
                  <Zap className="mr-2" size={24} />
                  Your Meeting Content Library
                </h2>
                <p className="text-purple-100 mb-4">
                  Quick access to all your meeting insights and conversation records
                </p>
              </div>
              <div className="flex space-x-3">
                {withInsights > 0 && (
                  <button
                    onClick={() => setCurrentView('meeting-summary')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                  >
                    <Sparkles size={16} />
                    <span>View All Summaries</span>
                  </button>
                )}
                {withTranscripts > 0 && (
                  <button
                    onClick={() => setCurrentView('raw-transcript')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                  >
                    <FileText size={16} />
                    <span>View All Transcripts</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Value Proposition Banner */}
        {totalMeetings === 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-6">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-3">🚀 Master Stakeholder Conversations</h2>
              <p className="text-purple-100 mb-4 text-lg">
                Practice real-world business analysis scenarios. Get AI-powered insights. Build confidence in stakeholder management.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Target size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">Practice Scenarios</div>
                    <div className="text-sm text-purple-200">Real business situations</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Lightbulb size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">AI Insights</div>
                    <div className="text-sm text-purple-200">Smart feedback & analysis</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">Track Progress</div>
                    <div className="text-sm text-purple-200">See your improvement</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('projects')}
                className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
              >
                Start Your First Meeting
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search meetings, projects, or stakeholders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="voice-only">Voice Only</option>
              <option value="transcript">With Transcript</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
            </select>

            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Content</option>
              <option value="with-summary">With AI Summary</option>
              <option value="with-transcript">With Transcript</option>
              <option value="no-content">Missing Content</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meetings Grid */}
      {filteredMeetings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {meetings.length === 0 ? 'No meetings yet' : 'No meetings match your filters'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {meetings.length === 0 
              ? 'Start your first stakeholder interview to see your meeting history here.'
              : 'Try adjusting your search terms or filters to find more meetings.'
            }
          </p>
          {meetings.length === 0 && (
            <button
              onClick={() => setCurrentView('projects')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start First Meeting
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onViewDetails={handleViewMeetingDetails}
              onViewSummary={handleViewSummary}
              onViewTranscript={handleViewTranscript}
            />
          ))}
        </div>
      )}
    </div>
  );
};
