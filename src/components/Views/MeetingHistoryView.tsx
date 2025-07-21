import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Users, MessageSquare, TrendingUp, FileText, Eye, Download, Share2, Tag, Lightbulb } from 'lucide-react';
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
    return `${minutes} min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const TranscriptMessage: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
    const isUser = message.speaker === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
          isUser 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            {!isUser && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {message.stakeholderName?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            <span className={`text-sm font-medium ${
              isUser ? 'text-purple-100' : 'text-gray-600'
            }`}>
              {isUser ? 'You' : message.stakeholderName || 'Assistant'}
            </span>
            {!isUser && message.stakeholderRole && (
              <span className="text-xs text-gray-500">
                ({message.stakeholderRole})
              </span>
            )}
          </div>
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('my-meetings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{meeting.project_name}</h1>
            <p className="text-gray-600">Meeting Details & Analysis</p>
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

      {/* Meeting Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Date & Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(meeting.created_at)}
              </p>
              <p className="text-sm text-gray-600">
                {formatTime(meeting.created_at)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDuration(meeting.duration)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-lg font-semibold text-gray-900">
                {meeting.total_messages}
              </p>
              <p className="text-sm text-gray-600">
                {meeting.user_messages} from you
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stakeholders</p>
              <p className="text-lg font-semibold text-gray-900">
                {meeting.stakeholder_names.length}
              </p>
              <p className="text-sm text-gray-600">participants</p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Stakeholders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="mr-2" size={20} />
          Meeting Participants
        </h3>
        <div className="flex flex-wrap gap-3">
          {meeting.stakeholder_names.map((name, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-600">{meeting.stakeholder_roles[index]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics & Insights */}
      {(meeting.topics_discussed.length > 0 || meeting.key_insights.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {meeting.topics_discussed.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="mr-2" size={20} />
                Topics Discussed
              </h3>
              <div className="flex flex-wrap gap-2">
                {meeting.topics_discussed.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {meeting.key_insights.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="mr-2" size={20} />
                Key Insights
              </h3>
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
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                <span>Raw Transcript ({meeting.transcript.length} messages)</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
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
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Summary Available</h3>
                  <p className="text-gray-600">
                    The meeting summary could not be generated or is not available yet.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {meeting.transcript.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto">
                  {meeting.transcript.map((message, index) => (
                    <TranscriptMessage key={index} message={message} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Available</h3>
                  <p className="text-gray-600">
                    The conversation transcript is not available for this meeting.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};