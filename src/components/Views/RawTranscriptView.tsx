import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Download, Share2, Calendar, Clock, Users, FileText, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { DatabaseMeeting } from '../../lib/database';
import { Message } from '../../types';
import jsPDF from 'jspdf';

export const RawTranscriptView: React.FC = () => {
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
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meeting selected</h3>
          <p className="text-gray-600 mb-6">Please select a meeting to view its transcript.</p>
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
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Component for rendering individual transcript messages
  const TranscriptMessage: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
    const isUser = message.speaker === 'user';
    const stakeholderName = message.stakeholderName || message.speaker;
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
        <div className={`max-w-[80%] rounded-xl p-4 shadow-sm ${
          isUser 
            ? 'bg-purple-600 text-white' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isUser ? 'text-purple-200' : 'text-gray-500'}`}>
              {isUser ? 'Business Analyst' : stakeholderName?.charAt(0)?.toUpperCase() + (stakeholderName?.slice(1) || '')}
            </span>
            {message.timestamp && (
              <span className={`text-xs ${isUser ? 'text-purple-200' : 'text-gray-400'}`}>
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
    );
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
              <MessageSquare className="mr-3" size={32} />
              Raw Transcript
            </h1>
            <p className="text-gray-600">Complete conversation record</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
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
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-900">{meeting.project_name}</h3>
              <p className="text-indigo-700">{formatDate(meeting.created_at)} at {formatTime(meeting.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <p className="text-indigo-600 font-semibold">Duration</p>
              <p className="text-indigo-800 font-bold text-lg">{formatDuration(meeting.duration)}</p>
            </div>
            <div className="text-center">
              <p className="text-indigo-600 font-semibold">Messages</p>
              <p className="text-indigo-800 font-bold text-lg">{meeting.transcript?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-indigo-600 font-semibold">Participants</p>
              <p className="text-indigo-800 font-bold text-lg">{meeting.stakeholder_names?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="mr-3 text-indigo-600" size={24} />
            Complete Conversation Transcript
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              {meeting.transcript?.length || 0} messages
            </span>
            <span className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-600">
              {formatDuration(meeting.duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Transcript Content */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-8">
        {meeting.transcript && meeting.transcript.length > 0 ? (
          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {meeting.transcript.map((message, index) => (
              <TranscriptMessage key={index} message={message} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageSquare className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">No Transcript Available</h3>
            <p className="text-gray-600 text-lg">The conversation transcript could not be recorded or is empty.</p>
            <p className="text-gray-500 mt-2">This may occur if the meeting was not properly recorded or if there were technical issues.</p>
          </div>
        )}
      </div>

      {/* Meeting Statistics */}
      {meeting.transcript && meeting.transcript.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{meeting.user_messages || 0}</div>
            <div className="text-sm text-gray-600">Your Messages</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-2">{meeting.ai_messages || 0}</div>
            <div className="text-sm text-gray-600">Stakeholder Messages</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {meeting.transcript ? Math.round((meeting.user_messages || 0) / meeting.transcript.length * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Your Participation</div>
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
          onClick={() => setCurrentView('meeting-summary')}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <FileText size={16} />
          <span>View Meeting Summary</span>
        </button>
      </div>
    </div>
  );
};

export default RawTranscriptView;