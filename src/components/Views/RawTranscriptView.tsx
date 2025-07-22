import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Download, Share2, Calendar, Clock, Users, FileText, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseMeeting, DatabaseService } from '../../lib/database';
import { Message } from '../../types';
import jsPDF from 'jspdf';
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
      
      // Auto-expand the most recent meeting (or selected one if specified)
      if (allMeetingsData.length > 0) {
        const meetingToExpand = selectedMeeting?.id || allMeetingsData[0].id;
        setExpandedMeetings(new Set([meetingToExpand]));
      }
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
          setExpandedMeetings(new Set([sortedFallback[0].id]));
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
    const newExpanded = new Set(expandedMeetings);
    if (newExpanded.has(meetingId)) {
      newExpanded.delete(meetingId);
    } else {
      newExpanded.add(meetingId);
    }
    setExpandedMeetings(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('my-meetings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Raw Transcripts</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete conversation records from your stakeholder meetings</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {allMeetings.length} meeting{allMeetings.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {allMeetings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transcripts yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start your first stakeholder interview to see conversation transcripts here.
          </p>
          <button
            onClick={() => setCurrentView('projects')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start First Meeting
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {allMeetings.map((meeting) => (
            <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Meeting Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleMeeting(meeting.id)}
                    className="flex items-center space-x-3 text-left flex-1 hover:text-purple-600 transition-colors"
                  >
                    {expandedMeetings.has(meeting.id) ? (
                      <ChevronDown className="w-5 h-5 text-purple-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {meeting.project_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(meeting.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{formatDuration(meeting.duration)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{meeting.stakeholder_names.length} stakeholder{meeting.stakeholder_names.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare size={14} />
                          <span>{meeting.total_messages} messages</span>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadTranscript(meeting)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Download transcript"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => shareTranscript(meeting)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Share transcript"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedMeetings.has(meeting.id) && (
                <div className="p-6">
                  {meeting.transcript && meeting.transcript.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {meeting.transcript.map((message, index) => (
                        <div key={index} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            {message.speaker === 'user' ? (
                              <UserAvatar 
                                userId={user?.id || ''}
                                size="sm"
                                showName={false}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                                {(message.stakeholderName || 'S').charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {message.speaker === 'user' ? 'You' : (message.stakeholderName || 'Stakeholder')}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No transcript available for this meeting</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};