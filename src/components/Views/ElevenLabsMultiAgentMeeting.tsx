import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Users, 
  MessageSquare, 
  Settings,
  RefreshCw,
  Zap,
  Clock,
  User
} from 'lucide-react';
import { MultiAgentOrchestrator, ConversationMessage, MeetingContext } from '../../services/multiAgentOrchestrator';
import { DEFAULT_VOICE_AGENTS, VoiceAgent } from '../../services/elevenLabsService';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const ElevenLabsMultiAgentMeeting: React.FC = () => {
  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [transcriptText, setTranscriptText] = useState('');
  const [agentStatuses, setAgentStatuses] = useState<Map<string, 'idle' | 'speaking' | 'thinking'>>(new Map());
  const [meetingPhase, setMeetingPhase] = useState<'opening' | 'discussion' | 'decision' | 'closing'>('opening');
  const [processingInput, setProcessingInput] = useState(false);

  // Refs
  const orchestratorRef = useRef<MultiAgentOrchestrator | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Meeting configuration
  const [meetingConfig] = useState<MeetingContext>({
    topic: "E-commerce Platform Enhancement Strategy",
    objective: "Discuss and prioritize feature improvements for our e-commerce platform to increase conversion rates and customer satisfaction",
    duration: 30,
    participants: [
      { id: 'user', type: 'user', name: 'You', role: 'Business Analyst' },
      ...DEFAULT_VOICE_AGENTS.map(agent => ({
        id: agent.id,
        type: 'agent' as const,
        name: agent.name,
        role: agent.role
      }))
    ]
  });

  // Initialize the multi-agent system
  const initializeSystem = useCallback(async () => {
    if (isInitialized) return;

    try {
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

      if (!openaiKey || !elevenLabsKey) {
        console.error('Missing API keys for OpenAI or ElevenLabs');
        return;
      }

      // Initialize orchestrator
      const orchestrator = new MultiAgentOrchestrator(
        openaiKey,
        elevenLabsKey,
        meetingConfig
      );

      // Add all voice agents
      DEFAULT_VOICE_AGENTS.forEach(agent => {
        orchestrator.addVoiceAgent(agent);
        setAgentStatuses(prev => new Map(prev.set(agent.id, 'idle')));
      });

      orchestratorRef.current = orchestrator;

      // Initialize speech recognition
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsRecording(true);
          isListeningRef.current = true;
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscriptText(finalTranscript || interimTranscript);

          if (finalTranscript.trim()) {
            handleUserSpeech(finalTranscript.trim());
          }
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsRecording(false);
          isListeningRef.current = false;
          setTranscriptText('');
        };

        recognition.onerror = (event: Event) => {
          console.error('Speech recognition error:', event);
          setIsRecording(false);
          isListeningRef.current = false;
        };

        speechRecognitionRef.current = recognition;
      }

      setIsInitialized(true);
      console.log('✅ ElevenLabs Multi-Agent System initialized');

    } catch (error) {
      console.error('Error initializing system:', error);
    }
  }, [isInitialized, meetingConfig]);

  // Handle user speech input
  const handleUserSpeech = useCallback(async (transcript: string) => {
    if (!orchestratorRef.current || processingInput) return;

    setProcessingInput(true);
    setTranscriptText('');

    // Add user message to conversation
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      participantId: 'user',
      content: transcript,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      await orchestratorRef.current.processUserInput(
        transcript,
        (agentId: string, message: string) => {
          // Agent started speaking
          setAgentStatuses(prev => new Map(prev.set(agentId, 'speaking')));
          setCurrentSpeaker(agentId);
          
          // Add agent message to conversation
          const agentMessage: ConversationMessage = {
            id: `${agentId}-${Date.now()}`,
            participantId: agentId,
            content: message,
            timestamp: new Date()
          };
          setConversationHistory(prev => [...prev, agentMessage]);
        },
        (agentId: string) => {
          // Agent finished speaking
          setAgentStatuses(prev => new Map(prev.set(agentId, 'idle')));
          setCurrentSpeaker(null);
        }
      );

      // Update meeting phase
      const state = orchestratorRef.current.getConversationState();
      setMeetingPhase(state.phase);

    } catch (error) {
      console.error('Error processing user input:', error);
    } finally {
      setProcessingInput(false);
    }
  }, [processingInput]);

  // Start voice recording
  const startRecording = useCallback(() => {
    if (speechRecognitionRef.current && !isListeningRef.current) {
      try {
        speechRecognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, []);

  // Stop voice recording
  const stopRecording = useCallback(() => {
    if (speechRecognitionRef.current && isListeningRef.current) {
      speechRecognitionRef.current.stop();
    }
  }, []);

  // Reset conversation
  const resetConversation = useCallback(() => {
    if (orchestratorRef.current) {
      orchestratorRef.current.resetConversation();
      setConversationHistory([]);
      setCurrentSpeaker(null);
      setMeetingPhase('opening');
      setProcessingInput(false);
      DEFAULT_VOICE_AGENTS.forEach(agent => {
        setAgentStatuses(prev => new Map(prev.set(agent.id, 'idle')));
      });
    }
  }, []);

  // Get agent display info
  const getAgentInfo = useCallback((agentId: string) => {
    return DEFAULT_VOICE_AGENTS.find(agent => agent.id === agentId);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Initializing ElevenLabs Multi-Agent System
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Setting up voice agents and AI orchestrator...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Zap className="w-6 h-6 mr-3 text-purple-600" />
                ElevenLabs Multi-Agent Meeting
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {meetingConfig.topic}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                Phase: <span className="ml-1 font-medium capitalize">{meetingPhase}</span>
              </div>
              <button
                onClick={resetConversation}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Agent Panel */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Meeting Participants
            </h3>
            
            {/* User */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">You</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Business Analyst</p>
                </div>
              </div>
            </div>

            {/* Agents */}
            <div className="space-y-3">
              {DEFAULT_VOICE_AGENTS.map((agent) => {
                const status = agentStatuses.get(agent.id) || 'idle';
                const isCurrentSpeaker = currentSpeaker === agent.id;
                
                return (
                  <div
                    key={agent.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrentSpeaker
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : status === 'thinking'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCurrentSpeaker ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{agent.role}</p>
                      </div>
                      <div className="flex items-center">
                        {isCurrentSpeaker && (
                          <div className="flex items-center">
                            <Volume2 className="w-4 h-4 text-green-500 mr-1" />
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        {status === 'thinking' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {conversationHistory.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Ready to Start the Meeting
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Click the microphone button and start speaking to interact with the AI stakeholders
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Meeting Topic:</h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">{meetingConfig.topic}</p>
                </div>
              </div>
            ) : (
              conversationHistory.map((message) => {
                const isUser = message.participantId === 'user';
                const agent = isUser ? null : getAgentInfo(message.participantId);
                const displayName = isUser ? 'You' : agent?.name || message.participantId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span className={`text-xs font-medium ${
                          isUser ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {displayName}
                        </span>
                        <span className={`text-xs ml-2 ${
                          isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Processing indicator */}
            {processingInput && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                    <span className="text-sm">AI agents are thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Voice Input Controls */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center space-x-6">
              {/* Voice Recording Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={processingInput}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110'
                    : processingInput
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <Square className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              {/* Mute Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Live Transcript */}
            {transcriptText && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Speaking:</span> {transcriptText}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRecording ? (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    🎤 Listening... Speak now or click to stop
                  </span>
                ) : processingInput ? (
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    🤔 AI agents are processing your input...
                  </span>
                ) : (
                  'Click the microphone to start speaking with the AI stakeholders'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsMultiAgentMeeting;