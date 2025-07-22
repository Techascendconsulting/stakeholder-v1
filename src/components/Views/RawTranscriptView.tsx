import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Download, Share2, Calendar, Clock, Users, FileText, ChevronDown, ChevronRight, User, Bot } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseMeeting, DatabaseService } from '../../lib/database';
import { Message } from '../../types';
import { UserAvatar } from '../Common/UserAvatar';

export const RawTranscriptView: React.FC = () => {
  const { setCurrentView, selectedMeeting } = useApp();
  const { user } = useAuth();
  const [allMeetings, setAllMeetings] = useState<DatabaseMeeting[]>([]);
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());
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

  // Load all meetings
  useEffect(() => {
    loadAllMeetings();
  }, [user?.id, selectedMeeting?.id]);

  const loadAllMeetings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // ALWAYS load ALL meetings for transcripts - never just show one
      console.log('📋 Loading ALL meetings for raw transcript view');
      
      // Load from database
      const databaseMeetings = await DatabaseService.getUserMeetings(user.id);
      
      // Load from localStorage using the same strategy as MeetingSummaryView
      const localMeetings: any[] = [];
      
      // Strategy 1: Load from meetings index
      try {
        const meetingsIndex = JSON.parse(localStorage.getItem('meetings_index') || '[]');
        for (const meetingId of meetingsIndex) {
          let meetingData = null;
          try {
            const mainKey = `stored_meeting_${meetingId}`;
            meetingData = JSON.parse(localStorage.getItem(mainKey) || 'null');
          } catch (e) {
            try {
              const backupKeys = Object.keys(localStorage).filter(k => k.includes(meetingId) && k.startsWith('backup_meeting_'));
              if (backupKeys.length > 0) {
                meetingData = JSON.parse(localStorage.getItem(backupKeys[0]) || 'null');
              }
            } catch (e2) {}
          }
          
          if (meetingData && meetingData.user_id === user.id) {
            localMeetings.push(meetingData);
          }
        }
      } catch (error) {
        console.warn('Error loading from meetings index:', error);
      }
      
      // Strategy 2: Scan localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('stored_meeting_') || key.startsWith('backup_meeting_') || key.startsWith('temp-meeting-'))) {
          try {
            const meetingData = JSON.parse(localStorage.getItem(key) || '{}');
            if (meetingData && meetingData.user_id === user.id) {
              const alreadyLoaded = localMeetings.find(m => m.id === meetingData.id);
              if (!alreadyLoaded) {
                localMeetings.push(meetingData);
              }
            }
          } catch (error) {
            console.warn('Error parsing localStorage meeting:', key, error);
          }
        }
      }
      
      // Combine all meetings and remove duplicates
      const allMeetingsData = [...databaseMeetings, ...localMeetings]
        .filter((meeting, index, self) => 
          meeting && meeting.id && meeting.project_name && meeting.created_at &&
          index === self.findIndex(m => m.id === meeting.id)
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log('📋 RawTranscriptView loaded:', {
        database: databaseMeetings.length,
        localStorage: localMeetings.length,
        total: allMeetingsData.length,
        meetingTypes: allMeetingsData.reduce((acc: any, m) => {
          acc[m.meeting_type] = (acc[m.meeting_type] || 0) + 1;
          return acc;
        }, {}),
        meetingsWithSummary: allMeetingsData.filter(m => m.meeting_summary && m.meeting_summary.trim()).length,
        meetingsWithTranscript: allMeetingsData.filter(m => m.transcript && m.transcript.length > 0).length
      });
      
      setAllMeetings(allMeetingsData);
      
      // Don't auto-expand any meetings - let users choose what to view
      setExpandedMeetings(new Set());
    } catch (error) {
      console.error('Error loading meetings:', error);
      
      // Fallback: try to load just from localStorage if database fails
      try {
        const fallbackMeetings: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('stored_meeting_') || key.startsWith('backup_meeting_'))) {
            try {
              const meetingData = JSON.parse(localStorage.getItem(key) || '{}');
              if (meetingData && meetingData.user_id === user.id) {
                fallbackMeetings.push(meetingData);
              }
            } catch (e) {}
          }
        }
        
        if (fallbackMeetings.length > 0) {
          const sortedFallback = fallbackMeetings.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setAllMeetings(sortedFallback);
          setExpandedMeetings(new Set()); // Don't auto-expand fallback meetings either
          console.log('📋 Using fallback localStorage meetings for transcripts:', sortedFallback.length);
        } else {
          setAllMeetings([]);
        }
      } catch (fallbackError) {
        console.error('Fallback loading also failed:', fallbackError);
        setAllMeetings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMeeting = (meetingId: string) => {
    setExpandedMeetings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(meetingId)) {
        newSet.delete(meetingId);
      } else {
        newSet.add(meetingId);
      }
      return newSet;
    });
  };

  const collapseAll = () => {
    setExpandedMeetings(new Set());
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const downloadTranscript = (meeting: DatabaseMeeting) => {
    try {
      const transcript = meeting.transcript || [];
      const transcriptText = transcript.map(msg => {
        const speaker = msg.speaker === 'user' ? 'Business Analyst' : (msg.stakeholderName || 'Stakeholder');
        const time = new Date(msg.timestamp).toLocaleTimeString();
        return `[${time}] ${speaker}: ${msg.content}`;
      }).join('\n\n');

      const fullContent = `RAW TRANSCRIPT - ${meeting.project_name}
Date: ${new Date(meeting.created_at).toLocaleDateString()}
Duration: ${formatDuration(meeting.duration)}
Participants: ${meeting.stakeholder_names.join(', ')}

${transcriptText}`;

      const blob = new Blob([fullContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transcript-${meeting.project_name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date(meeting.created_at).toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading transcript:', error);
    }
  };

  const shareTranscript = async (meeting: DatabaseMeeting) => {
    try {
      const transcript = meeting.transcript || [];
      const transcriptText = transcript.map(msg => {
        const speaker = msg.speaker === 'user' ? 'Business Analyst' : (msg.stakeholderName || 'Stakeholder');
        return `${speaker}: ${msg.content}`;
      }).join('\n\n');

      if (navigator.share) {
        await navigator.share({
          title: `Meeting Transcript - ${meeting.project_name}`,
          text: transcriptText
        });
      } else {
        await navigator.clipboard.writeText(transcriptText);
        alert('Transcript copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing transcript:', error);
    }
  };

  // Group meetings by date like MeetingSummaryView
  const groupedMeetings = allMeetings.reduce((acc: { [key: string]: DatabaseMeeting[] }, meeting) => {
    const dateKey = new Date(meeting.created_at).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(meeting);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversation transcripts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header - Beautiful like MeetingSummaryView */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('meeting-history')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="mr-3" size={32} />
              Raw Transcripts
            </h1>
            <p className="text-gray-600">Complete conversation records from all stakeholder meetings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {allMeetings.length} meeting{allMeetings.length !== 1 ? 's' : ''}
          </div>
          {expandedMeetings.size >= 1 && (
            <button
              onClick={collapseAll}
              className="px-3 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2 text-sm font-medium"
            >
              <ChevronDown size={14} />
              <span>Collapse All ({expandedMeetings.size})</span>
            </button>
          )}
          <button
            onClick={() => setCurrentView('meeting-summary')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <FileText size={16} />
            <span>View Summaries</span>
          </button>
        </div>
      </div>

      {allMeetings.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-20 w-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">No Conversation Transcripts</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">You haven't conducted any meetings yet.</p>
          <button
            onClick={() => setCurrentView('projects')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Your First Meeting
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMeetings)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([dateString, meetings]) => (
              <div key={dateString} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Date Header - Beautiful gradient like MeetingSummaryView */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Calendar className="mr-2 text-blue-600" size={20} />
                      {formatDate(meetings[0].created_at)}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                      {meetings.length} conversation{meetings.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Meetings List */}
                <div className="divide-y divide-gray-100">
                  {meetings
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((meeting) => (
                      <div key={meeting.id} className="p-6">
                        {/* Meeting Header - Beautiful like MeetingSummaryView */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {meeting.project_name?.charAt(0) || 'M'}
                              </span>
                            </div>
                            <div className="text-left">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.project_name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <Clock size={14} />
                                  <span>{formatTime(meeting.created_at)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock size={14} />
                                  <span>{formatDuration(meeting.duration)}</span>
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  meeting.meeting_type === 'voice-only' 
                                    ? 'bg-purple-100 text-purple-700'
                                    : meeting.meeting_type === 'group'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {meeting.meeting_type === 'voice-only' ? 'Voice Meeting' : 
                                   meeting.meeting_type === 'group' ? 'Group Meeting' : 'Individual Meeting'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {meeting.transcript && meeting.transcript.length > 0 ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                {meeting.transcript.length} messages
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                No Transcript
                              </span>
                            )}
                            <button
                              onClick={() => toggleMeeting(meeting.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm font-medium"
                            >
                              <MessageSquare size={14} />
                              <span>{expandedMeetings.has(meeting.id) ? 'Hide Transcript' : 'View Transcript'}</span>
                              {expandedMeetings.has(meeting.id) ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content - Beautiful conversation layout */}
                        {expandedMeetings.has(meeting.id) && (
                          <div className="mt-6 space-y-6">
                            {/* Transcript Content */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                    <MessageSquare className="mr-2 text-blue-600" size={18} />
                                    Complete Conversation
                                  </h5>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => downloadTranscript(meeting)}
                                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                                    >
                                      <Download size={14} />
                                      <span>Download</span>
                                    </button>
                                    <button
                                      onClick={() => shareTranscript(meeting)}
                                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1 text-sm"
                                    >
                                      <Share2 size={14} />
                                      <span>Share</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-6">
                                {meeting.transcript && meeting.transcript.length > 0 ? (
                                  <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {meeting.transcript.map((message, index) => (
                                      <div key={index} className={`flex space-x-4 p-4 rounded-lg ${
                                        message.speaker === 'user' 
                                          ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' 
                                          : 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800'
                                      }`}>
                                        <div className="flex-shrink-0">
                                          {message.speaker === 'user' ? (
                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                              <User size={20} className="text-white" />
                                            </div>
                                          ) : (
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                              <span className="text-white font-medium text-sm">
                                                {(message.stakeholderName || 'S').charAt(0)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <span className={`text-sm font-medium ${
                                              message.speaker === 'user' 
                                                ? 'text-green-800 dark:text-green-200' 
                                                : 'text-blue-800 dark:text-blue-200'
                                            }`}>
                                              {message.speaker === 'user' ? 'You (Business Analyst)' : (message.stakeholderName || 'Stakeholder')}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                                              {new Date(message.timestamp).toLocaleTimeString()}
                                            </span>
                                          </div>
                                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {message.content}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-12">
                                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h6 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Transcript Available</h6>
                                    <p className="text-gray-600 dark:text-gray-400">This meeting doesn't have a recorded conversation transcript.</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Meeting Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Your Messages</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{meeting.user_messages || 0}</p>
                                  </div>
                                  <User className="h-8 w-8 text-green-600" />
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Stakeholder Messages</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{meeting.ai_messages || 0}</p>
                                  </div>
                                  <Users className="h-8 w-8 text-blue-600" />
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Exchanges</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{meeting.total_messages || 0}</p>
                                  </div>
                                  <MessageSquare className="h-8 w-8 text-purple-600" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};