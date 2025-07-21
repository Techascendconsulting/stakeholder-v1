import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Users, MessageSquare, TrendingUp, FileText, Eye, Download, Share2, Tag, Lightbulb, CheckCircle, Award, BarChart3, Target } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { DatabaseMeeting } from '../../lib/database';
import { Message } from '../../types';

export const MeetingHistoryView: React.FC = () => {
  const { setCurrentView, selectedMeeting } = useApp();
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');

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
          <p className="text-gray-600 mb-6">Please select a meeting from your meeting history.</p>
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

  // Component for rendering individual transcript messages
  const TranscriptMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.speaker === 'user';
    const stakeholderName = message.stakeholderName || message.speaker;
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] rounded-lg p-4 ${
          isUser 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-100 border border-gray-200'
        }`}>
          {!isUser && (
            <span className="text-xs font-medium text-gray-600 mb-1 block">
              {stakeholderName?.charAt(0)?.toUpperCase() + (stakeholderName?.slice(1) || '')}
            </span>
          )}
          <p className={`text-sm ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {message.content}
          </p>
          {message.timestamp && (
            <p className={`text-xs mt-1 ${
              isUser ? 'text-purple-200' : 'text-gray-500'
            }`}>
              {new Date(message.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('my-meetings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{meeting.project_name}</h1>
            <p className="text-gray-600">
              {formatDate(meeting.created_at)} • {formatTime(meeting.created_at)} • {formatDuration(meeting.duration)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            meeting.meeting_type === 'voice-only' 
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {meeting.meeting_type === 'voice-only' ? 'Voice Only' : 'With Transcript'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            meeting.status === 'completed' 
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {meeting.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>

      {/* Tab Navigation - Moved to Top */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText size={16} />
                <span>Meeting Summary</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transcript'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare size={16} />
                <span>Raw Transcript ({meeting.transcript?.length || 0} messages)</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-900 font-medium">Meeting Completed Successfully</span>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <span className="text-green-600 font-medium">{meeting.total_messages} Messages</span>
            </div>
            <div className="text-center">
              <span className="text-green-600 font-medium">{meeting.key_insights?.length || 0} Key Insights</span>
            </div>
            <div className="text-center">
              <span className="text-green-600 font-medium">{meeting.stakeholder_names?.length || 0} Participants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'summary' ? (
          <div className="space-y-6">
            {meeting.meeting_summary ? (
              <div className="prose max-w-none">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Summary</h4>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {meeting.meeting_summary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Summary Available</h3>
                <p className="text-gray-600">The meeting summary could not be generated or is still processing.</p>
              </div>
            )}

            {/* Additional Meeting Insights */}
            {meeting.key_insights && meeting.key_insights.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
                  Key Insights
                </h4>
                <div className="space-y-2">
                  {meeting.key_insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics Discussed */}
            {meeting.topics_discussed && meeting.topics_discussed.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 text-blue-600 mr-2" />
                  Topics Discussed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {meeting.topics_discussed.map((topic, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Complete Conversation</h4>
              <span className="text-sm text-gray-600">
                {meeting.transcript?.length || 0} messages • {formatDuration(meeting.duration)}
              </span>
            </div>

            {meeting.transcript && meeting.transcript.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {meeting.transcript.map((message, index) => (
                  <TranscriptMessage key={index} message={message} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Available</h3>
                <p className="text-gray-600">The conversation transcript could not be recorded or is empty.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meeting Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('my-meetings')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to My Meetings
        </button>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
            <Download size={16} className="inline mr-2" />
            Export Summary
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
            <Share2 size={16} className="inline mr-2" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingHistoryView;