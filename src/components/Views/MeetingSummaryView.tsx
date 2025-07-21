import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Share2, Calendar, Clock, Users, MessageSquare, Tag, Lightbulb, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { DatabaseMeeting } from '../../lib/database';
import jsPDF from 'jspdf';

export const MeetingSummaryView: React.FC = () => {
  const { setCurrentView, selectedMeeting } = useApp();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  if (!selectedMeeting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meeting selected</h3>
          <p className="text-gray-600 mb-6">Please select a meeting to view its summary.</p>
          <button
            onClick={() => setCurrentView('my-meetings')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to My Meetings
          </button>
        </div>
      </div>
    );
  }

  const meeting = selectedMeeting as DatabaseMeeting;

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

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
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
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
              Meeting Summary
            </h1>
            <p className="text-gray-600">AI-generated analysis and insights</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Download size={16} />
            <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Meeting Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-900">{meeting.project_name}</h3>
              <p className="text-purple-700">{formatDate(meeting.created_at)} at {formatTime(meeting.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <p className="text-purple-600 font-semibold">Duration</p>
              <p className="text-purple-800 font-bold text-lg">{formatDuration(meeting.duration)}</p>
            </div>
            <div className="text-center">
              <p className="text-purple-600 font-semibold">Messages</p>
              <p className="text-purple-800 font-bold text-lg">{meeting.total_messages}</p>
            </div>
            <div className="text-center">
              <p className="text-purple-600 font-semibold">Participants</p>
              <p className="text-purple-800 font-bold text-lg">{meeting.stakeholder_names?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Summary Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FileText className="mr-3 text-purple-600" size={24} />
          AI-Generated Summary
        </h2>
        
        {meeting.meeting_summary ? (
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-500">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                {meeting.meeting_summary}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">No Summary Available</h3>
            <p className="text-gray-600 text-lg">The meeting summary could not be generated or is still processing.</p>
            <p className="text-gray-500 mt-2">Please check back later or contact support if this persists.</p>
          </div>
        )}
      </div>

      {/* Topics and Insights Grid */}
      {((meeting.topics_discussed && meeting.topics_discussed.length > 0) || (meeting.key_insights && meeting.key_insights.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Topics Discussed */}
          {meeting.topics_discussed && meeting.topics_discussed.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="mr-2 text-blue-600" size={20} />
                Topics Discussed
              </h3>
              <div className="flex flex-wrap gap-2">
                {meeting.topics_discussed.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          {meeting.key_insights && meeting.key_insights.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="mr-2 text-yellow-600" size={20} />
                Key Insights
              </h3>
              <div className="space-y-3">
                {meeting.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Meeting Participants */}
      {meeting.stakeholder_names && meeting.stakeholder_names.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 text-orange-600" size={20} />
            Meeting Participants
          </h3>
          <div className="flex flex-wrap gap-4">
            {meeting.stakeholder_names.map((name, index) => (
              <div key={index} className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg border">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{name}</p>
                  <p className="text-sm text-gray-600">{meeting.stakeholder_roles?.[index] || 'Stakeholder'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => setCurrentView('meeting-history')}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Meeting Details</span>
        </button>
        
        <button
          onClick={() => setCurrentView('raw-transcript')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <MessageSquare size={16} />
          <span>View Raw Transcript</span>
        </button>
      </div>
    </div>
  );
};

export default MeetingSummaryView;