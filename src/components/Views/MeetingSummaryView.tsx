import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Share2, Calendar, Clock, Users, MessageSquare, Tag, Lightbulb, CheckCircle, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseMeeting, DatabaseService } from '../../lib/database';
import jsPDF from 'jspdf';

export const MeetingSummaryView: React.FC = () => {
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
  }, [user?.id]);

  const loadAllMeetings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
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

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const generatePDF = async (meeting: DatabaseMeeting) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(67, 56, 202); // Purple color
      pdf.text('Meeting Summary Report', margin, yPosition);
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
      pdf.text(`Participants: ${meeting.stakeholder_names?.join(', ') || 'N/A'}`, margin, yPosition);
      yPosition += 15;

      // Summary section
      pdf.setFontSize(16);
      pdf.setTextColor(67, 56, 202);
      pdf.text('AI-Generated Summary', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const summaryText = meeting.meeting_summary || 'No summary available.';
      const summaryLines = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin);
      pdf.text(summaryLines, margin, yPosition);
      yPosition += summaryLines.length * 4 + 10;

      // Topics discussed
      if (meeting.topics_discussed && meeting.topics_discussed.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(67, 56, 202);
        pdf.text('Topics Discussed', margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        meeting.topics_discussed.forEach((topic, index) => {
          pdf.text(`• ${topic}`, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 10;
      }

      // Key insights
      if (meeting.key_insights && meeting.key_insights.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(67, 56, 202);
        pdf.text('Key Insights', margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        meeting.key_insights.forEach((insight, index) => {
          const insightLines = pdf.splitTextToSize(`• ${insight}`, pageWidth - 2 * margin - 10);
          pdf.text(insightLines, margin + 5, yPosition);
          yPosition += insightLines.length * 4 + 2;
        });
      }

      // Save the PDF
      const fileName = `meeting-summary-${meeting.project_name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date(meeting.created_at).toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading meeting summaries...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3" size={32} />
              Meeting Summaries
            </h1>
            <p className="text-gray-600">AI-generated analysis and insights for all meetings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {allMeetings.length} meetings
          </div>
          <button
            onClick={() => setCurrentView('raw-transcript')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <MessageSquare size={16} />
            <span>View Transcripts</span>
          </button>
        </div>
      </div>

      {allMeetings.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-3">No Meeting Summaries</h3>
          <p className="text-gray-600 text-lg mb-6">You haven't conducted any meetings yet.</p>
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
              <div key={dateString} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Date Header */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="mr-2 text-purple-600" size={20} />
                      {formatDate(meetings[0].created_at)}
                    </h3>
                    <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
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
                        {/* Meeting Header - Clickable */}
                        <button
                          onClick={() => toggleMeeting(meeting.id)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
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
                                <span className="flex items-center space-x-1">
                                  <Users size={14} />
                                  <span>{meeting.stakeholder_names?.length || 0} participants</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <MessageSquare size={14} />
                                  <span>{meeting.total_messages} messages</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {meeting.meeting_summary ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                Summary Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                No Summary
                              </span>
                            )}
                            {expandedMeetings.has(meeting.id) ? (
                              <ChevronDown size={20} className="text-gray-400" />
                            ) : (
                              <ChevronRight size={20} className="text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Content */}
                        {expandedMeetings.has(meeting.id) && (
                          <div className="mt-6 space-y-6">
                            {/* Summary Content */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                                  <FileText className="mr-2 text-purple-600" size={18} />
                                  AI-Generated Summary
                                </h5>
                                <button
                                  onClick={() => generatePDF(meeting)}
                                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 text-sm"
                                >
                                  <Download size={14} />
                                  <span>PDF</span>
                                </button>
                              </div>
                              
                              {meeting.meeting_summary ? (
                                <div className="prose max-w-none">
                                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {meeting.meeting_summary}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                  <p className="text-gray-600">No summary available for this meeting.</p>
                                </div>
                              )}
                            </div>

                            {/* Topics and Insights */}
                            {((meeting.topics_discussed && meeting.topics_discussed.length > 0) || (meeting.key_insights && meeting.key_insights.length > 0)) && (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Topics Discussed */}
                                {meeting.topics_discussed && meeting.topics_discussed.length > 0 && (
                                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                      <Tag className="mr-2 text-blue-600" size={16} />
                                      Topics Discussed
                                    </h6>
                                    <div className="flex flex-wrap gap-2">
                                      {meeting.topics_discussed.map((topic, index) => (
                                        <span
                                          key={index}
                                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm border border-blue-200"
                                        >
                                          {topic}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Key Insights */}
                                {meeting.key_insights && meeting.key_insights.length > 0 && (
                                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                      <Lightbulb className="mr-2 text-yellow-600" size={16} />
                                      Key Insights
                                    </h6>
                                    <div className="space-y-2">
                                      {meeting.key_insights.map((insight, index) => (
                                        <div key={index} className="flex items-start space-x-2">
                                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                                          <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
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

export default MeetingSummaryView;