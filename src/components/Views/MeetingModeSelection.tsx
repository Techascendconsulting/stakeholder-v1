import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { MessageSquareText, Mic, Users, Clock, FileText, Volume2, Brain, Zap } from 'lucide-react';

const MeetingModeSelection: React.FC = () => {
  const { 
    selectedProject, 
    selectedStakeholders, 
    setCurrentView 
  } = useApp();

  const handleModeSelection = (mode: 'transcript' | 'voice-only' | 'individual-agents') => {
    if (mode === 'transcript') {
      setCurrentView('meeting');
    } else if (mode === 'voice-only') {
      setCurrentView('voice-only-meeting');
    } else if (mode === 'individual-agents') {
      setCurrentView('individual-agent-meeting');
    }
  };

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Setup Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please select a project and stakeholders first.</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Meeting Mode</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Select how you'd like to conduct your stakeholder interview
          </p>
        </div>

        {/* Project & Stakeholders Summary */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Meeting Setup</h3>
              <p className="text-blue-700">
                <strong>Project:</strong> {selectedProject.name}
              </p>
              <p className="text-blue-700 flex items-center mt-2">
                <Users className="w-4 h-4 mr-2" />
                <strong>Stakeholders:</strong> {selectedStakeholders.map(s => s.name).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Options */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* With Transcripts Mode */}
          <div 
            onClick={() => handleModeSelection('transcript')}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 cursor-pointer hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                <MessageSquareText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">With Transcripts</h3>
              <p className="text-blue-700 mb-4">
                Full conversation view with real-time transcripts, message history, and detailed notes.
              </p>
              
              <div className="space-y-2 text-sm text-blue-600">
                <div className="flex items-center justify-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Complete conversation transcripts</span>
                </div>
                <div className="flex items-center justify-center">
                  <MessageSquareText className="w-4 h-4 mr-2" />
                  <span>Message-by-message view</span>
                </div>
                <div className="flex items-center justify-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  <span>Audio playback controls</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                  Start Transcript Meeting
                </button>
              </div>
            </div>
          </div>

          {/* Voice-Only Mode */}
          <div 
            onClick={() => handleModeSelection('voice-only')}
            className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 cursor-pointer hover:from-green-100 hover:to-green-200 hover:border-green-300 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
                <Mic className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">Voice-Only Meeting</h3>
              <p className="text-green-700 mb-4">
                Natural conversation flow without visible transcripts. Focus on the dialogue, not the text.
              </p>
              
              <div className="space-y-2 text-sm text-green-600">
                <div className="flex items-center justify-center">
                  <Mic className="w-4 h-4 mr-2" />
                  <span>Voice-first interaction</span>
                </div>
                <div className="flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Real-time conversation</span>
                </div>
                <div className="flex items-center justify-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Natural meeting flow</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors w-full">
                  Start Voice Meeting
                </button>
              </div>
            </div>
          </div>

          {/* Individual Agents Mode */}
          <div 
            onClick={() => handleModeSelection('individual-agents')}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 cursor-pointer hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600 transition-colors">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-purple-900 mb-3">Individual AI Agents</h3>
              <p className="text-purple-700 mb-4">
                Each stakeholder is an individual AI with their own brain, knowledge, and human-like questioning behavior.
              </p>
              
              <div className="space-y-2 text-sm text-purple-600">
                <div className="flex items-center justify-center">
                  <Brain className="w-4 h-4 mr-2" />
                  <span>Individual AI brains</span>
                </div>
                <div className="flex items-center justify-center">
                  <Zap className="w-4 h-4 mr-2" />
                  <span>Human-like questioning</span>
                </div>
                <div className="flex items-center justify-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Natural curiosity & engagement</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full">
                  Start Individual Agent Meeting
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentView('stakeholders')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 transition-colors"
          >
            ← Back to Stakeholder Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingModeSelection;