import React, { useState, useEffect } from 'react';
import { Clock, Users, MessageSquare, TrendingUp, Search, Filter, Calendar, Eye, FileText, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseService, DatabaseMeeting } from '../../lib/database';

interface MeetingCardProps {
  meeting: DatabaseMeeting;
  onViewDetails: (meeting: DatabaseMeeting) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onViewDetails }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {meeting.project_name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDate(meeting.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{formatTime(meeting.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            meeting.meeting_type === 'voice-only' 
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {meeting.meeting_type === 'voice-only' ? 'Voice Only' : 'With Transcript'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            meeting.status === 'completed' 
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {meeting.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
          {(meeting as any)._isTemporary && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              Temporary
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6 mb-4">
        <div className="flex items-center space-x-2">
          <Users size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {meeting.stakeholder_names.length} stakeholder{meeting.stakeholder_names.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <MessageSquare size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {meeting.total_messages} messages
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDuration(meeting.duration)}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {meeting.stakeholder_names.slice(0, 3).map((name, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 dark:text-gray-300 rounded-md text-xs">
              {name} ({meeting.stakeholder_roles[index]})
            </span>
          ))}
          {meeting.stakeholder_names.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:text-gray-300 rounded-md text-xs">
              +{meeting.stakeholder_names.length - 3} more
            </span>
          )}
        </div>
      </div>

      {meeting.meeting_summary && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {meeting.meeting_summary.slice(0, 150)}...
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {meeting.topics_discussed.length > 0 && (
            <div className="flex items-center space-x-1">
              <TrendingUp size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {meeting.topics_discussed.length} topic{meeting.topics_discussed.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => onViewDetails(meeting)}
          className="flex items-center space-x-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
        >
          <Eye size={14} />
          <span>View Details</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export const MyMeetingsView: React.FC = () => {
  const { setCurrentView, setSelectedMeeting } = useApp();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<DatabaseMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'voice-only' | 'transcript'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress'>('all');

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

  const loadMeetings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userMeetings = await DatabaseService.getUserMeetings(user.id);
      
      // Filter out meetings with missing or invalid data
      const validMeetings = userMeetings.filter(meeting => {
        return meeting &&
               typeof meeting.project_name === 'string' &&
               meeting.project_name.trim() !== '' &&
               Array.isArray(meeting.stakeholder_names) &&
               meeting.stakeholder_names.every(name => typeof name === 'string') &&
               meeting.created_at &&
               meeting.status &&
               typeof meeting.meeting_type === 'string';
      });

      // Also load temporary meetings from localStorage
      const tempMeetings: DatabaseMeeting[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('temp-meeting-')) {
          try {
            const tempMeetingData = JSON.parse(localStorage.getItem(key) || '{}');
            if (tempMeetingData.user_id === user.id) {
              // Add a flag to indicate this is a temporary meeting
              tempMeetingData._isTemporary = true;
              tempMeetings.push(tempMeetingData);
            }
          } catch (error) {
            console.warn('Error parsing temporary meeting:', key, error);
          }
        }
      }

      // Combine real and temporary meetings, sort by date
      const allMeetings = [...validMeetings, ...tempMeetings].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      console.log('📋 Loaded meetings:', {
        database: validMeetings.length,
        temporary: tempMeetings.length,
        total: allMeetings.length
      });
      
      setMeetings(allMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
      setMeetings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (meeting: DatabaseMeeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('meeting-history');
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = (meeting.project_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (meeting.stakeholder_names || []).some(name => 
                           (name || '').toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'voice-only' && meeting.meeting_type === 'voice-only') ||
                       (filterType === 'transcript' && meeting.meeting_type !== 'voice-only');
    
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: meetings.length,
    completed: meetings.filter(m => m.status === 'completed').length,
    voiceOnly: meetings.filter(m => m.meeting_type === 'voice-only').length,
    totalDuration: meetings.reduce((acc, m) => acc + m.duration, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Meetings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review your stakeholder interviews, summaries, and key insights
            </p>
          </div>
          <button
            onClick={() => {
              console.log('🔄 Manual refresh requested');
              loadMeetings();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <TrendingUp size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Meetings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Voice-Only</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.voiceOnly}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(stats.totalDuration / 3600)}h {Math.floor((stats.totalDuration % 3600) / 60)}m
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};