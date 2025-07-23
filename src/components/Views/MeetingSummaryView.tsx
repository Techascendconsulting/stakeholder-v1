import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Share2, Calendar, Clock, Users, MessageSquare, Tag, Lightbulb, CheckCircle, ChevronDown, ChevronRight, Plus, User } from 'lucide-react';
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
  }, [user?.id, selectedMeeting?.id]);

  const loadAllMeetings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // ALWAYS load ALL meetings - never just show one
      console.log('📋 Loading ALL meetings for summary view');
      
      // Load from database
      const databaseMeetings = await DatabaseService.getUserMeetings(user.id);
      
      // Load from localStorage using the same strategy as MyMeetingsView
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
      
      console.log('📋 MeetingSummaryView loaded:', {
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
          console.log('📋 Using fallback localStorage meetings:', sortedFallback.length);
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

  // Generate fallback summary for meetings without AI summaries
  const generateFallbackSummary = (meeting: any): string => {
    const transcript = meeting.transcript || meeting.raw_chat || [];
    const participants = meeting.stakeholder_names || [];
    const duration = Math.floor(meeting.duration / 60) || 0;
    const messageCount = transcript.length || 0;
    
    // Extract key information from transcript
    const userMessages = transcript.filter((m: any) => m.speaker === 'user');
    const stakeholderMessages = transcript.filter((m: any) => m.speaker !== 'user');
    
    // Generate structured summary
    const summary = `## Executive Summary

This meeting involved a ${duration}-minute stakeholder conversation for the ${meeting.project_name} project. The session included ${participants.length} stakeholder${participants.length !== 1 ? 's' : ''} and consisted of ${messageCount} total exchanges.

## Meeting Overview

**Date:** ${new Date(meeting.created_at).toLocaleDateString()}
**Duration:** ${duration} minutes
**Total Messages:** ${messageCount}
**Participants:** ${participants.join(', ')}

## Key Discussion Points

The conversation covered various aspects of the ${meeting.project_name} project with active participation from all stakeholders. ${userMessages.length} questions and comments were raised by the business analyst, generating ${stakeholderMessages.length} responses from stakeholders.

## Conversation Flow

${participants.map(participant => {
  const participantMessages = stakeholderMessages.filter((m: any) => m.stakeholderName === participant);
  return `**${participant}:** Contributed ${participantMessages.length} message${participantMessages.length !== 1 ? 's' : ''} to the discussion`;
}).join('\n')}

## Meeting Metrics

- **Engagement Level:** ${messageCount > 20 ? 'High' : messageCount > 10 ? 'Medium' : 'Low'} (${messageCount} total exchanges)
- **Discussion Balance:** ${Math.round((userMessages.length / messageCount) * 100)}% questions, ${Math.round((stakeholderMessages.length / messageCount) * 100)}% responses
- **Session Completion:** ${meeting.status === 'completed' ? 'Successfully completed' : 'In progress'}

## Next Steps

For detailed conversation analysis and specific stakeholder insights, please review the complete transcript in the Raw Transcript section. Consider scheduling follow-up sessions to dive deeper into any topics that require additional clarification.

---

*This summary was automatically generated from the meeting transcript. The complete conversation details are preserved in the raw transcript for your reference.*`;

    return summary;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Render formatted summary with proper styling
  const renderFormattedSummary = (summary: string) => {
    const sections = summary.split(/^## /gm).filter(section => section.trim());
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim();
      const content = lines.slice(1).join('\n').trim();
      
      // Skip if no content
      if (!content && index > 0) return null;
      
      // Handle the main title differently
      if (index === 0 && !title.includes('Meeting Summary')) {
        return (
          <div key={index} className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
              {section.trim()}
            </div>
          </div>
        );
      }
      
      // Render sections with icons and styling
      const getSectionIcon = (sectionTitle: string) => {
        const lowerTitle = sectionTitle.toLowerCase();
        if (lowerTitle.includes('executive') || lowerTitle.includes('summary')) return '📋';
        if (lowerTitle.includes('discussion') || lowerTitle.includes('topics')) return '💬';
        if (lowerTitle.includes('stakeholder') || lowerTitle.includes('insights')) return '👥';
        if (lowerTitle.includes('current') || lowerTitle.includes('analysis')) return '🔍';
        if (lowerTitle.includes('challenge') || lowerTitle.includes('pain')) return '⚠️';
        if (lowerTitle.includes('requirement') || lowerTitle.includes('needs')) return '📝';
        if (lowerTitle.includes('next') || lowerTitle.includes('action')) return '✅';
        if (lowerTitle.includes('detail') || lowerTitle.includes('meeting')) return '📅';
        if (lowerTitle.includes('participant')) return '👤';
        return '📄';
      };
      
      const getSectionStyles = (sectionTitle: string) => {
        const lowerTitle = sectionTitle.toLowerCase();
        if (lowerTitle.includes('executive') || lowerTitle.includes('summary')) {
          return {
            headerBg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
            textColor: 'text-blue-900 dark:text-blue-100'
          };
        }
        if (lowerTitle.includes('discussion') || lowerTitle.includes('topics')) {
          return {
            headerBg: 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
            textColor: 'text-green-900 dark:text-green-100'
          };
        }
        if (lowerTitle.includes('stakeholder') || lowerTitle.includes('insights')) {
          return {
            headerBg: 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
            textColor: 'text-purple-900 dark:text-purple-100'
          };
        }
        if (lowerTitle.includes('current') || lowerTitle.includes('analysis')) {
          return {
            headerBg: 'bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
            textColor: 'text-indigo-900 dark:text-indigo-100'
          };
        }
        if (lowerTitle.includes('challenge') || lowerTitle.includes('pain')) {
          return {
            headerBg: 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
            textColor: 'text-red-900 dark:text-red-100'
          };
        }
        if (lowerTitle.includes('requirement') || lowerTitle.includes('needs')) {
          return {
            headerBg: 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
            textColor: 'text-orange-900 dark:text-orange-100'
          };
        }
        if (lowerTitle.includes('next') || lowerTitle.includes('action')) {
          return {
            headerBg: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
            textColor: 'text-emerald-900 dark:text-emerald-100'
          };
        }
        return {
          headerBg: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20',
          textColor: 'text-gray-900 dark:text-gray-100'
        };
      };
      
      const styles = getSectionStyles(title);
      const icon = getSectionIcon(title);
      
      return (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className={`${styles.headerBg} px-6 py-4 border-b border-gray-200 dark:border-gray-700`}>
            <h3 className={`text-lg font-semibold ${styles.textColor} flex items-center`}>
              <span className="mr-3 text-xl">{icon}</span>
              {title}
            </h3>
          </div>
          <div className="p-6">
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>
        </div>
      );
    }).filter(Boolean);
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
      {/* Header - Enhanced like RawTranscriptView */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('my-meetings')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="mr-3" size={32} />
              Meeting Summaries
            </h1>
            <p className="text-gray-600 dark:text-gray-400">AI-generated analysis and insights from all stakeholder meetings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {allMeetings.length} meeting{allMeetings.length !== 1 ? 's' : ''}
          </div>
          {expandedMeetings.size > 1 && (
            <button
              onClick={collapseAll}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
            >
              <ChevronDown size={14} />
              <span>Collapse All</span>
            </button>
          )}
          <button
            onClick={() => setCurrentView('raw-transcript')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <MessageSquare size={16} />
            <span>View Transcripts</span>
          </button>
        </div>
      </div>

      {allMeetings.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">No Meeting Summaries</h3>
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
                {/* Date Header - Enhanced gradients like RawTranscriptView */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Calendar className="mr-2 text-purple-600" size={20} />
                      {formatDate(meetings[0].created_at)}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                      {meetings.length} meeting{meetings.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Meetings List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {meetings
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((meeting) => (
                      <div key={meeting.id} className="p-6">
                        {/* Meeting Header - Beautiful gradient like RawTranscriptView */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
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
                            {meeting.meeting_summary ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                AI Summary
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Auto Summary
                              </span>
                            )}
                            <button
                              onClick={() => toggleMeeting(meeting.id)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm font-medium"
                            >
                              <FileText size={14} />
                              <span>{expandedMeetings.has(meeting.id) ? 'Hide Summary' : 'View Summary'}</span>
                              {expandedMeetings.has(meeting.id) ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content - Enhanced layout */}
                        {expandedMeetings.has(meeting.id) && (
                          <div className="mt-6 space-y-6">
                            {/* Summary Content */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                    <FileText className="mr-2 text-purple-600" size={18} />
                                    {meeting.meeting_summary ? 'AI-Generated Summary' : 'Auto-Generated Summary'}
                                  </h5>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => generatePDF(meeting)}
                                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 text-sm"
                                    >
                                      <Download size={14} />
                                      <span>Download PDF</span>
                                    </button>
                                    <button
                                      onClick={() => setCurrentView('raw-transcript')}
                                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1 text-sm"
                                    >
                                      <MessageSquare size={14} />
                                      <span>View Transcript</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-6">
                                {meeting.meeting_summary ? (
                                  <div className="space-y-6">
                                    {renderFormattedSummary(meeting.meeting_summary)}
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                    {renderFormattedSummary(generateFallbackSummary(meeting))}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                                        📝 This summary was automatically generated from the meeting transcript. 
                                        For more detailed AI analysis, the full transcript is available in the Raw Transcript section.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Enhanced Statistics Cards like RawTranscriptView */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Your Questions</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{meeting.user_messages || 0}</p>
                                  </div>
                                  <User className="h-8 w-8 text-green-600" />
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Stakeholder Responses</p>
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

                            {/* Enhanced Topics and Insights */}
                            {((meeting.topics_discussed && meeting.topics_discussed.length > 0) || (meeting.key_insights && meeting.key_insights.length > 0)) && (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Topics Discussed */}
                                {meeting.topics_discussed && meeting.topics_discussed.length > 0 && (
                                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                      <h6 className="font-semibold text-gray-900 dark:text-white flex items-center">
                                        <Tag className="mr-2 text-blue-600" size={16} />
                                        Topics Discussed
                                      </h6>
                                    </div>
                                    <div className="p-4">
                                      <div className="flex flex-wrap gap-2">
                                        {meeting.topics_discussed.map((topic, index) => (
                                          <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800"
                                          >
                                            {topic}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Key Insights */}
                                {meeting.key_insights && meeting.key_insights.length > 0 && (
                                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                      <h6 className="font-semibold text-gray-900 dark:text-white flex items-center">
                                        <Lightbulb className="mr-2 text-yellow-600" size={16} />
                                        Key Insights
                                      </h6>
                                    </div>
                                    <div className="p-4">
                                      <div className="space-y-3">
                                        {meeting.key_insights.map((insight, index) => (
                                          <div key={index} className="flex items-start space-x-2">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
                                          </div>
                                        ))}
                                      </div>
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