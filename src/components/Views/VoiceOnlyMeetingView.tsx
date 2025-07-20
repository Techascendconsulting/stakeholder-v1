import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Users, Clock, Volume2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useVoice } from '../../contexts/VoiceContext';
import AIService, { StakeholderContext, ConversationContext } from '../../services/aiService';

interface SpeakerGridProps {
  currentSpeaker: string | null;
  stakeholders: any[];
  user: { name: string; role: string };
}

const SpeakerGrid: React.FC<SpeakerGridProps> = ({ currentSpeaker, stakeholders, user }) => {
  const allParticipants = [user, ...stakeholders];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      {allParticipants.map((participant) => {
        const isCurrentSpeaker = currentSpeaker === participant.name;
        const avatarColor = participant.name === user.name ? 'bg-blue-500' : 'bg-purple-500';
        
        return (
          <div
            key={participant.name}
            className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
              isCurrentSpeaker 
                ? 'border-green-400 bg-green-50 scale-105 shadow-lg' 
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Speaking indicator */}
            {isCurrentSpeaker && (
              <div className="absolute -top-2 -right-2 bg-green-400 rounded-full p-1 animate-pulse">
                <Volume2 className="h-4 w-4 text-white" />
              </div>
            )}
            
            {/* Avatar */}
            <div className={`w-16 h-16 mx-auto mb-2 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-xl`}>
              {participant.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Name and Role */}
            <div className="text-center">
              <div className={`font-medium ${isCurrentSpeaker ? 'text-green-700' : 'text-gray-900'}`}>
                {participant.name}
              </div>
              <div className="text-sm text-gray-500">{participant.role}</div>
            </div>
            
            {/* Speaking animation */}
            {isCurrentSpeaker && (
              <div className="flex justify-center mt-2 space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface MeetingQueueProps {
  queue: string[];
  currentSpeaker: string | null;
}

const MeetingQueue: React.FC<MeetingQueueProps> = ({ queue, currentSpeaker }) => {
  if (!currentSpeaker && queue.length === 0) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Users className="h-5 w-5 text-blue-600 mr-2" />
        <span className="font-medium text-blue-900">Speaking Queue</span>
      </div>
      
      {currentSpeaker && (
        <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-2">
          <div className="flex items-center">
            <Volume2 className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Currently Speaking: {currentSpeaker}</span>
          </div>
        </div>
      )}
      
      {queue.length > 0 && (
        <div>
          <div className="text-sm text-blue-700 mb-2">Up Next:</div>
          {queue.map((speaker, index) => (
            <div key={index} className="bg-white border border-blue-200 rounded p-2 mb-1 flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                {index + 1}
              </span>
              <span className="text-blue-900">{speaker}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const VoiceOnlyMeetingView: React.FC = () => {
  const { currentProject, selectedStakeholders, setCurrentView } = useApp();
  const { isSpeaking, setIsSpeaking, speakText, stopSpeaking } = useVoice();
  
  const [meetingStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [speakingQueue, setSpeakingQueue] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - meetingStartTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [meetingStartTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const user = {
    name: 'You',
    role: 'Meeting Participant'
  };

  const handleQuestionSubmit = async () => {
    if (!question.trim() || isProcessing) return;
    
    const userQuestion = question.trim();
    setQuestion('');
    setIsProcessing(true);
    
    try {
      // Set user as current speaker for the question
      setCurrentSpeaker('You');
      
      // Speak the user's question
      await speakText(userQuestion, 'You');
      
      // Get AI service instance
      const aiService = AIService.getInstance();
      
      // Detect mentions and get responses
      const mentionResult = await aiService.detectStakeholderMentions(userQuestion, selectedStakeholders);
      
      if (mentionResult.mentionedStakeholders.length > 0 && mentionResult.confidence >= AIService.getMentionConfidenceThreshold()) {
        // Add stakeholders to speaking queue
        setSpeakingQueue(mentionResult.mentionedStakeholders.map(s => s.name));
        
        // Process each stakeholder response
        for (const stakeholder of mentionResult.mentionedStakeholders) {
          // Update current speaker
          setCurrentSpeaker(stakeholder.name);
          
          // Remove from queue
          setSpeakingQueue(prev => prev.filter(name => name !== stakeholder.name));
          
          // Convert stakeholder to context format
          const stakeholderContext: StakeholderContext = {
            name: stakeholder.name,
            role: stakeholder.role,
            department: stakeholder.department || '',
            priorities: stakeholder.priorities || [],
            personality: stakeholder.personality || '',
            expertise: stakeholder.expertise || []
          };
          
          // Create conversation context
          const conversationContext: ConversationContext = {
            project: {
              name: currentProject?.name || '',
              description: currentProject?.description || '',
              type: currentProject?.type || ''
            },
            conversationHistory: [],
            stakeholders: selectedStakeholders.map(s => ({
              name: s.name,
              role: s.role,
              department: s.department || '',
              priorities: s.priorities || [],
              personality: s.personality || '',
              expertise: s.expertise || []
            }))
          };
          
          // Generate and speak response
          const response = await aiService.generateStakeholderResponse(
            userQuestion,
            stakeholderContext,
            conversationContext
          );
          
          if (response) {
            await speakText(response, stakeholder.name);
          }
          
          // Small pause between speakers
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        // No mentions - have a random stakeholder respond
        const randomStakeholder = selectedStakeholders[Math.floor(Math.random() * selectedStakeholders.length)];
        setCurrentSpeaker(randomStakeholder.name);
        
        // Convert stakeholder to context format
        const stakeholderContext: StakeholderContext = {
          name: randomStakeholder.name,
          role: randomStakeholder.role,
          department: randomStakeholder.department || '',
          priorities: randomStakeholder.priorities || [],
          personality: randomStakeholder.personality || '',
          expertise: randomStakeholder.expertise || []
        };
        
        // Create conversation context
        const conversationContext: ConversationContext = {
          project: {
            name: currentProject?.name || '',
            description: currentProject?.description || '',
            type: currentProject?.type || ''
          },
          conversationHistory: [],
          stakeholders: selectedStakeholders.map(s => ({
            name: s.name,
            role: s.role,
            department: s.department || '',
            priorities: s.priorities || [],
            personality: s.personality || '',
            expertise: s.expertise || []
          }))
        };
        
        const response = await aiService.generateStakeholderResponse(
          userQuestion,
          stakeholderContext,
          conversationContext
        );
        
        if (response) {
          await speakText(response, randomStakeholder.name);
        }
      }
      
    } catch (error) {
      console.error('Error processing question:', error);
    } finally {
      setCurrentSpeaker(null);
      setSpeakingQueue([]);
      setIsProcessing(false);
    }
  };

  const handleEndMeeting = () => {
    stopSpeaking();
    setCurrentSpeaker(null);
    setSpeakingQueue([]);
    setCurrentView('stakeholders');
  };

  const handleVoiceInput = () => {
    // Toggle voice input (placeholder for now)
    setIsListening(!isListening);
  };

  if (!currentProject || !selectedStakeholders.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No meeting configured</h2>
          <p className="text-gray-600">Please select a project and stakeholders first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleEndMeeting}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Voice Meeting: {currentProject?.name}
              </h1>
              <p className="text-sm text-gray-600">Listen & Learn Mode</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
            <button
              onClick={handleEndMeeting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              End Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Speaker Grid */}
        <SpeakerGrid 
          currentSpeaker={currentSpeaker}
          stakeholders={selectedStakeholders}
          user={user}
        />
        
        {/* Meeting Queue */}
        <MeetingQueue 
          queue={speakingQueue}
          currentSpeaker={currentSpeaker}
        />
        
        {/* Question Input Area */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask a Question
            </label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isProcessing}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleVoiceInput}
                  className={`p-3 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={isProcessing}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleQuestionSubmit}
                  disabled={!question.trim() || isProcessing}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {isProcessing && (
            <div className="text-center text-gray-600">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Processing your question...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};