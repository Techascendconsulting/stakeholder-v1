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
  User,
  CheckCircle,
  Circle,
  ArrowRight,
  Briefcase,
  Target,
  ChevronLeft
} from 'lucide-react';
import { ElevenLabsConversationalService, ConversationMessage } from '../../services/elevenLabsConversationalService';
import { ELEVENLABS_PROJECTS, ElevenLabsProject, ElevenLabsStakeholder, getElevenLabsProject } from '../../data/elevenLabsProjects';

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
  const [currentStep, setCurrentStep] = useState<'project-selection' | 'stakeholder-selection' | 'meeting'>('project-selection');
  const [selectedProject, setSelectedProject] = useState<ElevenLabsProject | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<ElevenLabsStakeholder[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Map<string, 'idle' | 'speaking' | 'thinking' | 'listening'>>(new Map());
  const [activeConversations, setActiveConversations] = useState<Map<string, string>>(new Map()); // stakeholderId -> conversationId
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Refs
  const conversationalServiceRef = useRef<ElevenLabsConversationalService | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const voiceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the conversational service
  const initializeSystem = useCallback(async () => {
    if (isInitialized) return;

    try {
      const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

      if (!elevenLabsKey) {
        console.error('Missing ElevenLabs API key');
        return;
      }

      // Initialize conversational service
      const service = new ElevenLabsConversationalService(elevenLabsKey);
      conversationalServiceRef.current = service;

      setIsInitialized(true);
      console.log('✅ ElevenLabs Conversational Service initialized');

    } catch (error) {
      console.error('Error initializing system:', error);
    }
  }, [isInitialized]);

  // Handle project selection
  const handleProjectSelect = useCallback((project: ElevenLabsProject) => {
    setSelectedProject(project);
    setCurrentStep('stakeholder-selection');
  }, []);

  // Handle stakeholder selection
  const handleStakeholderToggle = useCallback((stakeholder: ElevenLabsStakeholder) => {
    setSelectedStakeholders(prev => {
      const isSelected = prev.some(s => s.id === stakeholder.id);
      if (isSelected) {
        return prev.filter(s => s.id !== stakeholder.id);
      } else {
        return [...prev, stakeholder];
      }
    });
  }, []);

  // Start conversations with selected stakeholders
  const startMeeting = useCallback(async () => {
    if (!conversationalServiceRef.current || selectedStakeholders.length === 0) return;

    try {
      const service = conversationalServiceRef.current;
      const newConversations = new Map<string, string>();

      // Start conversation with each selected stakeholder
      for (const stakeholder of selectedStakeholders) {
        try {
          const conversationId = await service.startConversation(
            stakeholder,
            (message: ConversationMessage) => {
              // Add message to conversation history
              setConversationHistory(prev => [...prev, message]);
            },
            (agentId: string, status: 'speaking' | 'listening' | 'thinking' | 'idle') => {
              // Update agent status
              setAgentStatuses(prev => new Map(prev.set(agentId, status)));
            }
          );

          newConversations.set(stakeholder.id, conversationId);
          setAgentStatuses(prev => new Map(prev.set(stakeholder.agentId, 'listening')));
          
          console.log(`✅ Started conversation with ${stakeholder.name}`);
        } catch (error) {
          console.error(`❌ Failed to start conversation with ${stakeholder.name}:`, error);
        }
      }

      setActiveConversations(newConversations);
      setCurrentStep('meeting');

    } catch (error) {
      console.error('Error starting meetings:', error);
    }
  }, [selectedStakeholders]);

  // Voice activity detection
  const detectVoiceActivity = useCallback(() => {
    if (!analyserRef.current) return false;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    
    // Voice activity threshold (adjust as needed)
    const threshold = 20;
    return average > threshold;
  }, []);

  // Setup audio recording with voice detection
  const setupAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Setup audio context for voice detection
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 2048;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Try different audio formats to ensure compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use default
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
        
        // Send audio to all active conversations
        if (conversationalServiceRef.current) {
          const service = conversationalServiceRef.current;
          const promises = Array.from(activeConversations.values()).map(conversationId => 
            service.sendAudioInput(conversationId, audioBlob).catch(console.error)
          );
          await Promise.all(promises);
        }
        
        audioChunks.length = 0;
        setIsRecording(false);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      
    } catch (error) {
      console.error('Error setting up audio recording:', error);
    }
  }, [activeConversations]);

  // Interrupt agents (stop them from speaking)
  const interruptAgents = useCallback(async () => {
    if (!conversationalServiceRef.current) return;

    const service = conversationalServiceRef.current;
    const promises = Array.from(activeConversations.values()).map(conversationId => 
      service.interruptAgent(conversationId).catch(console.error)
    );
    await Promise.all(promises);
  }, [activeConversations]);

  // Auto interruption detection
  const startVoiceDetection = useCallback(() => {
    if (voiceDetectionIntervalRef.current) return;
    
    voiceDetectionIntervalRef.current = setInterval(() => {
      if (detectVoiceActivity()) {
        // User is speaking - interrupt agents if they're talking
        const speakingAgents = Array.from(agentStatuses.entries())
          .filter(([_, status]) => status === 'speaking')
          .map(([agentId, _]) => agentId);
          
        if (speakingAgents.length > 0) {
          console.log('🛑 Voice detected - interrupting agents');
          interruptAgents();
        }
      }
    }, 100); // Check every 100ms
  }, [detectVoiceActivity, agentStatuses, interruptAgents]);

  // Stop voice detection
  const stopVoiceDetection = useCallback(() => {
    if (voiceDetectionIntervalRef.current) {
      clearInterval(voiceDetectionIntervalRef.current);
      voiceDetectionIntervalRef.current = null;
    }
  }, []);

  // Toggle recording (click once to start, click again to stop)
  const toggleRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) {
      await setupAudioRecording();
      return;
    }

    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current.stop();
      stopVoiceDetection();
      setIsRecording(false);
    } else {
      // Start recording
      mediaRecorderRef.current.start();
      startVoiceDetection();
      setIsRecording(true);
    }
  }, [isRecording, setupAudioRecording, startVoiceDetection, stopVoiceDetection]);

  // Send text message for testing
  const sendTextMessage = useCallback(async () => {
    if (!conversationalServiceRef.current || !textInput.trim()) return;

    const service = conversationalServiceRef.current;
    const promises = Array.from(activeConversations.values()).map(conversationId => 
      service.sendTextInput(conversationId, textInput.trim()).catch(console.error)
    );
    
    await Promise.all(promises);
    setTextInput('');
  }, [textInput, activeConversations]);

  // End all conversations
  const endAllConversations = useCallback(async () => {
    if (!conversationalServiceRef.current) return;

    const service = conversationalServiceRef.current;
    await service.endAllConversations();
    
    // Stop recording and voice detection
    stopVoiceDetection();
    setIsRecording(false);
    
    setActiveConversations(new Map());
    setConversationHistory([]);
    setAgentStatuses(new Map());
    setCurrentStep('project-selection');
    setSelectedProject(null);
    setSelectedStakeholders([]);

    // Stop media stream and audio context
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopVoiceDetection]);

  // Get stakeholder by agent ID
  const getStakeholderByAgentId = useCallback((agentId: string) => {
    return selectedStakeholders.find(s => s.agentId === agentId);
  }, [selectedStakeholders]);

  // Initialize on mount
  useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  // Setup audio recording when meeting starts
  useEffect(() => {
    if (currentStep === 'meeting' && activeConversations.size > 0) {
      setupAudioRecording();
    }
  }, [currentStep, activeConversations.size, setupAudioRecording]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Initializing ElevenLabs Conversational AI
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Setting up real-time voice agents...
          </p>
        </div>
      </div>
    );
  }

  // Project Selection Step
  if (currentStep === 'project-selection') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Briefcase className="w-6 h-6 mr-3 text-purple-600" />
              Select a Project
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose a project to practice stakeholder conversations with ElevenLabs AI agents
            </p>
          </div>
        </div>

        {/* Project Selection */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="grid gap-6">
            {ELEVENLABS_PROJECTS.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {project.complexity} complexity
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {project.duration} minutes
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {project.stakeholders.length} stakeholders
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Stakeholders:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.stakeholders.map((stakeholder) => (
                      <span
                        key={stakeholder.id}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                      >
                        {stakeholder.name} - {stakeholder.role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Stakeholder Selection Step
  if (currentStep === 'stakeholder-selection' && selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Users className="w-6 h-6 mr-3 text-purple-600" />
                  Select Stakeholders
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedProject.name} - Choose who you want to speak with
                </p>
              </div>
              <button
                onClick={() => setCurrentStep('project-selection')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </button>
            </div>
          </div>
        </div>

        {/* Stakeholder Selection */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Available Stakeholders</h3>
            <p className="text-gray-600 dark:text-gray-400">Select one or more stakeholders to join the conversation</p>
          </div>

          <div className="grid gap-4 mb-8">
            {selectedProject.stakeholders.map((stakeholder) => {
              const isSelected = selectedStakeholders.some(s => s.id === stakeholder.id);
              
              return (
                <div
                  key={stakeholder.id}
                  onClick={() => handleStakeholderToggle(stakeholder)}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-6 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-purple-500' : 'bg-gray-400'
                      }`}>
                        <User className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {stakeholder.name}
                        </h4>
                        <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
                          {stakeholder.role} • {stakeholder.department}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {stakeholder.bio}
                        </p>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expertise: </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {stakeholder.expertise.slice(0, 3).join(', ')}
                              {stakeholder.expertise.length > 3 && '...'}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priorities: </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {stakeholder.priorities.slice(0, 2).join(', ')}
                              {stakeholder.priorities.length > 2 && '...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Meeting Button */}
          {selectedStakeholders.length > 0 && (
            <div className="text-center">
              <button
                onClick={startMeeting}
                className="inline-flex items-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Meeting with {selectedStakeholders.length} Stakeholder{selectedStakeholders.length !== 1 ? 's' : ''}
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                You'll be able to speak with all selected stakeholders in real-time
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Meeting View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Zap className="w-6 h-6 mr-3 text-purple-600" />
                ElevenLabs Voice Meeting
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedProject?.name || 'Multi-Stakeholder Conversation'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={interruptAgents}
                className="flex items-center px-3 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
              >
                <Square className="w-4 h-4 mr-2" />
                Interrupt
              </button>
              <button
                onClick={endAllConversations}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <Square className="w-4 h-4 mr-2" />
                End Meeting
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Stakeholder Panel */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Active Stakeholders
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

            {/* Stakeholders */}
            <div className="space-y-3">
              {selectedStakeholders.map((stakeholder) => {
                const status = agentStatuses.get(stakeholder.agentId) || 'idle';
                const isActive = activeConversations.has(stakeholder.id);
                
                return (
                  <div
                    key={stakeholder.id}
                    className={`p-3 rounded-lg border transition-all ${
                      status === 'speaking'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : status === 'thinking'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                        : status === 'listening'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        status === 'speaking' ? 'bg-green-500' :
                        status === 'listening' ? 'bg-blue-500' :
                        status === 'thinking' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{stakeholder.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{stakeholder.role}</p>
                      </div>
                      <div className="flex items-center">
                        {status === 'speaking' && (
                          <div className="flex items-center">
                            <Volume2 className="w-4 h-4 text-green-500 mr-1" />
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        {status === 'thinking' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                        )}
                        {status === 'listening' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                        {!isActive && (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
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
                  Ready to Start Speaking
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Hold the microphone button and start speaking to interact with your selected stakeholders
                </p>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Active Stakeholders:</h4>
                  <div className="text-purple-800 dark:text-purple-200 text-sm space-y-1">
                    {selectedStakeholders.map(s => (
                      <div key={s.id} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {s.name} - {s.role}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              conversationHistory.map((message) => {
                const isUser = message.type === 'user_input';
                const stakeholder = isUser ? null : getStakeholderByAgentId(message.agentId);
                const displayName = isUser ? 'You' : stakeholder?.name || 'AI Agent';
                
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
                      {message.metadata?.audioUrl && (
                        <audio 
                          controls 
                          className="mt-2 w-full h-8"
                          src={message.metadata.audioUrl}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Voice Input Controls */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center space-x-6">
              {/* Voice Recording Button */}
              <button
                onClick={toggleRecording}
                disabled={activeConversations.size === 0}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110 animate-pulse'
                    : activeConversations.size === 0
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-105'
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

            {/* Connection Status */}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm">
                {selectedStakeholders.map((stakeholder) => {
                  const isConnected = activeConversations.has(stakeholder.id);
                  const status = agentStatuses.get(stakeholder.agentId) || 'idle';
                  
                  return (
                    <div key={stakeholder.id} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isConnected 
                          ? status === 'speaking' ? 'bg-green-500 animate-pulse' :
                            status === 'listening' ? 'bg-blue-500 animate-pulse' :
                            status === 'thinking' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                          : 'bg-gray-400'
                      }`}></div>
                      <span className={`${
                        isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {stakeholder.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Text Input for Testing */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                  placeholder="Type a message to test (optional)..."
                  disabled={activeConversations.size === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendTextMessage}
                  disabled={!textInput.trim() || activeConversations.size === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                💬 Text input for testing - agents will respond with voice
              </p>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeConversations.size === 0 ? (
                  <span className="text-gray-500 dark:text-gray-400">
                    🔗 Connecting to stakeholders...
                  </span>
                ) : isRecording ? (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    🎤 Recording... Click again to stop and send audio
                  </span>
                ) : (
                  <span>
                    🎙️ Click the microphone to start speaking with your stakeholders
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isRecording ? (
                  '🤖 Automatic interruption detection is active - speak to interrupt agents'
                ) : (
                  'Agents will be automatically interrupted when you speak during their responses'
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