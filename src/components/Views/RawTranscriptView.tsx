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
      
      // If we have a selected meeting passed in (from voice meeting), prioritize it
      if (selectedMeeting && selectedMeeting.id) {
        console.log('🎯 Displaying selected meeting transcript:', selectedMeeting);
        setAllMeetings([selectedMeeting]);
        setExpandedMeetings(new Set([selectedMeeting.id]));
        setLoading(false);
        return;
      }
      
      // Otherwise load from database
      const meetings = await DatabaseService.getUserMeetings(user.id);
      const validMeetings = meetings.filter(meeting => 
        meeting && meeting.id && meeting.project_name && meeting.created_at
      );
      setAllMeetings(validMeetings);
      
      // Auto-expand the selected meeting if it exists
      if (selectedMeeting) {
        setExpandedMeetings(new Set([selectedMeeting.id]));
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
      
      // If database fails but we have a selected meeting, use it
      if (selectedMeeting && selectedMeeting.id) {
        console.log('📋 Database failed, using selected meeting transcript:', selectedMeeting);
        setAllMeetings([selectedMeeting]);
        setExpandedMeetings(new Set([selectedMeeting.id]));
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

  const generatePDF = async (meeting: DatabaseMeeting) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(67, 56, 202); // Purple color
      pdf.text('Meeting Transcript', margin, yPosition);
      yPosition += 15;

      // Meeting details
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Project: ${meeting.project_name}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Date: ${formatDate(meeting.created_at)}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Time: ${formatTime(meeting.created_at)}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Duration: ${formatDuration(meeting.duration)}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Total Messages: ${meeting.transcript?.length || 0}`, margin, yPosition);
      yPosition += 15;

      // Transcript section
      pdf.setFontSize(16);
      pdf.setTextColor(67, 56, 202);
      pdf.text('Complete Conversation', margin, yPosition);
      yPosition += 10;

      // Add transcript messages
      if (meeting.transcript && meeting.transcript.length > 0) {
        pdf.setFontSize(10);
        meeting.transcript.forEach((message, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }

          const speaker = message.speaker === 'user' ? 'Business Analyst' : (message.stakeholderName || 'Stakeholder');
          const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }) : '';

          // Speaker and timestamp
          pdf.setTextColor(67, 56, 202);
          pdf.text(`[${timestamp}] ${speaker}:`, margin, yPosition);
          yPosition += 5;

          // Message content
          pdf.setTextColor(0, 0, 0);
          const messageLines = pdf.splitTextToSize(message.content, pageWidth - 2 * margin - 10);
          pdf.text(messageLines, margin + 5, yPosition);
          yPosition += messageLines.length * 4 + 5;
        });
      }

      // Save the PDF
      const fileName = `meeting-transcript-${meeting.project_name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date(meeting.created_at).toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Component for rendering individual transcript messages
  const TranscriptMessage: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
    const isUser = message.speaker === 'user';
    const stakeholderName = message.stakeholderName || message.speaker;
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start space-x-3 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          {isUser ? (
            <UserAvatar 
              userId={user?.id || ''} 
              email={user?.email} 
              size="sm" 
              className="flex-shrink-0 mt-1"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
              {stakeholderName?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          )}
          
          {/* Message Content */}
          <div className={`rounded-xl p-4 shadow-sm ${
            isUser 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${isUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                {isUser ? 'Business Analyst' : stakeholderName?.charAt(0)?.toUpperCase() + (stakeholderName?.slice(1) || '')}
              </span>
              {message.timestamp && (
                <span className={`text-xs ${isUser ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              )}
            </div>
            <p className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Group meetings by date
  const groupedMeetings = allMeetings.reduce((groups, meeting) => {
    const date = new Date(meeting.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meeting);
    return groups;
  }, {} as Record<string, DatabaseMeeting[]>);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading meeting transcripts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
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
            <p className="text-gray-600">Complete conversation records for all meetings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {allMeetings.length} meetings
          </div>
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
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">No Meeting Transcripts</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">You haven't conducted any meetings yet.</p>
          <button
            onClick={() => setCurrentView('projects')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
                {/* Date Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Calendar className="mr-2 text-indigo-600" size={20} />
                      {formatDate(meetings[0].created_at)}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                      {meetings.length} meeting{meetings.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Meetings List */}
                <div className="divide-y divide-gray-100">
                  {meetings
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((meeting) => (
                      <div key={meeting.id} className="p-6">
                        {/* Meeting Header - Non-clickable Info */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {meeting.project_name?.charAt(0) || 'M'}
                              </span>
                            </div>
                            <div className="text-left">
                              <h4 className="text-lg font-semibold text-gray-900">{meeting.project_name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {meeting.meeting_type === 'voice-only' ? 'Voice Only' : 'With Transcript'}
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
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 text-sm font-medium"
                            >
                              <MessageSquare size={14} />
                              <span>{expandedMeetings.has(meeting.id) ? 'Hide Transcript' : 'See Transcript'}</span>
                              {expandedMeetings.has(meeting.id) ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedMeetings.has(meeting.id) && (
                          <div className="mt-6 space-y-6">
                            {/* Transcript Content */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                  <MessageSquare className="mr-2 text-indigo-600" size={18} />
                                  Complete Conversation Transcript
                                </h5>
                                <button
                                  onClick={() => generatePDF(meeting)}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1 text-sm"
                                >
                                  <Download size={14} />
                                  <span>PDF</span>
                                </button>
                              </div>
                              
                              {meeting.transcript && meeting.transcript.length > 0 ? (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                                  <div className="space-y-3">
                                    {meeting.transcript.map((message, index) => (
                                      <TranscriptMessage key={index} message={message} index={index} />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                  <p className="text-gray-600">No transcript available for this meeting.</p>
                                </div>
                              )}
                            </div>

                            {/* Meeting Statistics */}
                            {meeting.transcript && meeting.transcript.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                                  <div className="text-xl font-bold text-purple-600 mb-1">{meeting.user_messages || 0}</div>
                                  <div className="text-xs text-gray-600">Your Messages</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                                  <div className="text-xl font-bold text-indigo-600 mb-1">{meeting.ai_messages || 0}</div>
                                  <div className="text-xs text-gray-600">Stakeholder Messages</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                                  <div className="text-xl font-bold text-green-600 mb-1">
                                    {meeting.transcript ? Math.round((meeting.user_messages || 0) / meeting.transcript.length * 100) : 0}%
                                  </div>
                                  <div className="text-xs text-gray-600">Your Participation</div>
                                </div>
                              </div>
                            )}
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

export default RawTranscriptView;