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

// Add a simple test function at the top of the component
const testConnection = async (agentId: string, apiKey: string) => {
  console.log('🧪 TEST: Starting simple connection test...');
  console.log('🧪 TEST: Agent ID:', agentId);
  console.log('🧪 TEST: API Key present:', !!apiKey);
  
  try {
    // Test 1: Try to get signed URL
    console.log('🧪 TEST: Step 1 - Getting signed URL...');
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );
    
    console.log('🧪 TEST: Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🧪 TEST: FAILED - Signed URL error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('🧪 TEST: ✅ Got signed URL successfully');
    
    // Test 2: Try to connect WebSocket
    console.log('🧪 TEST: Step 2 - Connecting WebSocket...');
    const websocket = new WebSocket(data.signed_url);
    
    websocket.onopen = () => {
      console.log('🧪 TEST: ✅ WebSocket connected!');
      
      // Test 3: Send init message
      const initMessage = {
        type: 'conversation_initiation_client_data',
        conversation_config_override: {},
        custom_llm_extra_body: {},
        dynamic_variables: {}
      };
      websocket.send(JSON.stringify(initMessage));
      console.log('🧪 TEST: ✅ Init message sent');
    };
    
    websocket.onmessage = (event) => {
      console.log('🧪 TEST: ✅ Received message:', JSON.parse(event.data));
    };
    
    websocket.onclose = (event) => {
      console.log('🧪 TEST: ❌ Connection closed:', event.code, event.reason);
    };
    
    websocket.onerror = (error) => {
      console.error('🧪 TEST: ❌ WebSocket error:', error);
    };
    
  } catch (error) {
    console.error('🧪 TEST: ❌ Exception:', error);
  }
};

const ElevenLabsMultiAgentMeeting: React.FC = () => {
  // State management
  const [currentStep, setCurrentStep] = useState<'project-selection' | 'stakeholder-selection' | 'meeting'>('project-selection');
  const [selectedProject, setSelectedProject] = useState<ElevenLabsProject | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<ElevenLabsStakeholder[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Map<string, 'idle' | 'speaking' | 'thinking' | 'listening'>>(new Map());
  const [activeConversations, setActiveConversations] = useState<Map<string, string>>(new Map()); // stakeholderId -> conversationId
  const [lastResponseTime, setLastResponseTime] = useState<number>(0);
  const [respondingAgent, setRespondingAgent] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [meetingMode, setMeetingMode] = useState<'single' | 'multi-voice' | 'multi-agent'>('single');


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

  // Handle stakeholder selection (multiple selection enabled for multi-agent meetings)
  const handleStakeholderToggle = useCallback((stakeholder: ElevenLabsStakeholder) => {
    setSelectedStakeholders(prev => {
      const isSelected = prev.some(s => s.id === stakeholder.id);
      if (isSelected) {
        const newSelection = prev.filter(s => s.id !== stakeholder.id);
        // Reset to single mode if only one stakeholder left
        if (newSelection.length <= 1) {
          setMeetingMode('single');
        }
        return newSelection;
      } else {
        const newSelection = [...prev, stakeholder];
        // Set default to multi-voice mode when multiple stakeholders selected
        if (newSelection.length > 1 && meetingMode === 'single') {
          setMeetingMode('multi-voice');
        }
        return newSelection;
      }
    });
  }, [meetingMode]);

  // Detect which stakeholder is speaking from message content
  const detectSpeakingStakeholder = useCallback((content: string, stakeholders: ElevenLabsStakeholder[]) => {
    const lowerContent = content.toLowerCase();
    
    // Look for role-based indicators and expertise keywords
    for (const stakeholder of stakeholders) {
      const indicators = [
        // Role-based
        stakeholder.role.toLowerCase(),
        // Name-based (without brackets)
        stakeholder.name.toLowerCase(),
        // Expertise keywords based on roles
        ...(stakeholder.role.includes('Customer') ? ['customer', 'user experience', 'ux', 'user satisfaction'] : []),
        ...(stakeholder.role.includes('Business') ? ['business', 'process', 'operational', 'efficiency'] : []),
        ...(stakeholder.role.includes('IT') || stakeholder.role.includes('Systems') ? ['technical', 'it', 'system', 'implementation', 'development'] : [])
      ];
      
      // Check if any indicators are present
      if (indicators.some(indicator => lowerContent.includes(indicator))) {
        return stakeholder;
      }
    }
    
    // Rotate through stakeholders based on message timing if no clear indicator
    const messageTime = Date.now();
    const stakeholderIndex = Math.floor((messageTime / 10000)) % stakeholders.length; // Switch every 10 seconds
    return stakeholders[stakeholderIndex];
  }, []);

  // Start conversations with selected stakeholders (with multi-voice simulation)
  const startMeeting = useCallback(async () => {
    if (!conversationalServiceRef.current || selectedStakeholders.length === 0) return;

    try {
      const service = conversationalServiceRef.current;
      
      // End any existing conversations first
      if (activeConversations.size > 0) {
        console.log('🛑 Ending existing conversations...');
        await service.endAllConversations();
        setActiveConversations(new Map());
      }

      // Clear any playing audio
      const { ElevenLabsConversationalService } = await import('../../services/elevenLabsConversationalService');
      ElevenLabsConversationalService.clearAudioQueue();

      const newConversations = new Map<string, string>();

            // Start conversation based on selected mode
      if (selectedStakeholders.length === 1 || meetingMode === 'single') {
        // Single stakeholder - normal conversation
        const stakeholder = selectedStakeholders[0];
        console.log(`🚀 Starting single conversation with ${stakeholder.name}...`);
        
        try {
          const conversationId = await service.startConversation(
            stakeholder,
            (message: ConversationMessage) => {
              setConversationHistory(prev => [...prev, { 
                ...message, 
                stakeholderName: stakeholder.name 
              }]);
            },
            (agentId: string, status: 'speaking' | 'listening' | 'thinking' | 'idle') => {
              setAgentStatuses(prev => new Map(prev.set(agentId, status)));
            }
          );

          newConversations.set(stakeholder.id, conversationId);
          setAgentStatuses(prev => new Map(prev.set(stakeholder.agentId, 'listening')));
          console.log(`✅ Started conversation with ${stakeholder.name}`);
        } catch (error) {
          console.error(`❌ Failed to start conversation with ${stakeholder.name}:`, error);
        }
      } else if (meetingMode === 'multi-voice') {
        // Multi-stakeholder simulation using ONE agent with multiple personalities
        console.log(`🎭 Starting multi-voice simulation with ${selectedStakeholders.length} stakeholders...`);
        
        // Use the first stakeholder's agent but with multi-personality prompt
        const primaryStakeholder = selectedStakeholders[0];
        
        try {
          const conversationId = await service.startConversation(
            primaryStakeholder,
            (message: ConversationMessage) => {
                             // Parse which stakeholder is speaking from the message
               const speakingStakeholder = detectSpeakingStakeholder(message.content, selectedStakeholders);
              setConversationHistory(prev => [...prev, { 
                ...message, 
                stakeholderName: speakingStakeholder.name 
              }]);
              
              // Update current speaker for UI
              setRespondingAgent(speakingStakeholder.agentId);
            },
            (agentId: string, status: 'speaking' | 'listening' | 'thinking' | 'idle') => {
              setAgentStatuses(prev => new Map(prev.set(agentId, status)));
            }
          );

          // Send multi-personality context
          const stakeholderDetails = selectedStakeholders.map(s => 
            `${s.name} (${s.role}): ${s.bio}`
          ).join('\n\n');
          
                     const multiPersonalityPrompt = `You are in a meeting room with these stakeholders. You will speak AS different people, naturally switching between their perspectives. Here are the participants:

${stakeholderDetails}

CRITICAL RULES:
1. NEVER use name tags like "[James Walker]:" - speak naturally as each person
2. Use role-based transitions: "From a customer experience perspective..." or "On the technical side..."
3. Stakeholders MUST respond to each other's questions and comments
4. When someone asks "What do you think, [Name]?" - that person responds next
5. Build on each other's ideas, agree/disagree, ask follow-up questions
6. Keep individual contributions 2-3 sentences, then naturally transition
7. Show different expertise: UX concerns vs business processes vs technical constraints

INTERACTION EXAMPLES:
User: "How should we approach this project?"
Response: "From a customer experience standpoint, we need to focus on user journey mapping first. The data shows our current onboarding has a 40% drop-off rate. But I'm curious about the technical feasibility - what's your take on the development timeline? Well, from the IT side, we're looking at about 12 weeks if we use our existing framework. Though Aisha might have concerns about how this impacts current business processes. Actually yes, we'd need to coordinate with three different departments, which could add complexity to the rollout timeline."

Make it feel like real people having a natural business conversation!`;

           setTimeout(() => {
             service.sendTextInput(conversationId, multiPersonalityPrompt).catch(console.error);
           }, 1000);

          newConversations.set('multi-agent', conversationId);
          selectedStakeholders.forEach(s => {
            setAgentStatuses(prev => new Map(prev.set(s.agentId, 'listening')));
          });
          
          console.log(`✅ Started multi-voice simulation conversation`);
                 } catch (error) {
           console.error(`❌ Failed to start multi-voice conversation:`, error);
         }
       } else if (meetingMode === 'multi-agent') {
         // Real multi-agent mode (multiple ElevenLabs agents - expensive!)
         console.log(`🚀 Starting REAL multi-agent with ${selectedStakeholders.length} agents...`);
         
         for (const stakeholder of selectedStakeholders) {
           try {
             console.log(`🚀 Starting conversation with ${stakeholder.name}...`);
             
             const conversationId = await service.startConversation(
               stakeholder,
               (message: ConversationMessage) => {
                 setConversationHistory(prev => [...prev, { 
                   ...message, 
                   stakeholderName: stakeholder.name 
                 }]);
               },
               (agentId: string, status: 'speaking' | 'listening' | 'thinking' | 'idle') => {
                 setAgentStatuses(prev => new Map(prev.set(agentId, status)));
               }
             );

             newConversations.set(stakeholder.id, conversationId);
             setAgentStatuses(prev => new Map(prev.set(stakeholder.agentId, 'listening')));
             
             console.log(`✅ Started conversation with ${stakeholder.name}`);
             
             // Small delay between starting conversations
             await new Promise(resolve => setTimeout(resolve, 500));
           } catch (error) {
             console.error(`❌ Failed to start conversation with ${stakeholder.name}:`, error);
           }
         }
       }

      setActiveConversations(newConversations);
      setCurrentStep('meeting');

    } catch (error) {
      console.error('Error starting meeting:', error);
    }
  }, [selectedStakeholders, activeConversations, detectSpeakingStakeholder, meetingMode]);

  // Voice activity detection with better filtering
  const detectVoiceActivity = useCallback(() => {
    if (!analyserRef.current) return false;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    
    // More conservative thresholds to avoid false positives
    const threshold = 25; // Higher threshold to avoid background noise
    const peaks = dataArray.filter(value => value > 50).length; // Higher peak threshold
    
    // Voice detected only if BOTH average AND peaks are significant
    const hasVoiceActivity = average > threshold && peaks > 8;
    
    if (hasVoiceActivity) {
      console.log('🎤 Strong voice activity detected:', { average, peaks, threshold });
    }
    
    return hasVoiceActivity;
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
      
      // Create AudioWorklet processor for PCM 16kHz conversion
      // Use the existing audioContext
      const processorNode = audioContext.createScriptProcessor(4096, 1, 1);
      
      let isRecordingRef = { value: false };
      
             processorNode.onaudioprocess = async (event) => {
         if (!isRecordingRef.value) return;
         
         const inputBuffer = event.inputBuffer;
         const inputData = inputBuffer.getChannelData(0);
         
         // Convert float32 PCM to 16-bit PCM at 16kHz
         const targetSampleRate = 16000;
         const sourceSampleRate = audioContext.sampleRate;
         
         // Downsample if needed
         let pcmData: Float32Array;
         if (sourceSampleRate !== targetSampleRate) {
           const ratio = sourceSampleRate / targetSampleRate;
           const newLength = Math.round(inputData.length / ratio);
           pcmData = new Float32Array(newLength);
           
           for (let i = 0; i < newLength; i++) {
             const sourceIndex = Math.round(i * ratio);
             pcmData[i] = inputData[sourceIndex] || 0;
           }
         } else {
           pcmData = inputData;
         }
         
         // Convert to 16-bit PCM
         const pcm16 = new Int16Array(pcmData.length);
         for (let i = 0; i < pcmData.length; i++) {
           const sample = Math.max(-1, Math.min(1, pcmData[i]));
           pcm16[i] = Math.round(sample * 0x7FFF);
         }
         
         // Convert to base64
         const uint8Array = new Uint8Array(pcm16.buffer);
         const base64 = btoa(String.fromCharCode(...uint8Array));
         
                   // Send audio to only ONE agent at a time (round-robin) to prevent multiple responses
          if (conversationalServiceRef.current && base64.length > 0 && activeConversations.size > 0) {
            const service = conversationalServiceRef.current;
            const activeIds = Array.from(activeConversations.values());
            
            if (activeIds.length > 0) {
              // Select one agent using round-robin based on time
              const now = Date.now();
              const agentIndex = Math.floor((now / 3000)) % activeIds.length; // Switch every 3 seconds
              const selectedConversationId = activeIds[agentIndex];
              
              try {
                await service.sendAudioInputPCM(selectedConversationId, base64);
                console.log(`🎯 Sent audio to agent ${agentIndex + 1}/${activeIds.length} (round-robin)`);
              } catch (error) {
                // If conversation ended, remove it from active list
                if (error.message.includes('No active session')) {
                  console.log('🔌 Conversation ended, removing from active list');
                  activeConversations.forEach((id, key) => {
                    if (id === selectedConversationId) {
                      activeConversations.delete(key);
                    }
                  });
                }
              }
            }
          }
       };
      
      source.connect(processorNode);
      processorNode.connect(audioContext.destination);
      
      // Store recording state
      const startRecording = async () => {
        // Immediately clear any playing audio when user starts speaking
        const { ElevenLabsConversationalService } = await import('../../services/elevenLabsConversationalService');
        ElevenLabsConversationalService.clearAudioQueue();
        console.log('🛑 Cleared audio queue on recording start');
        
        isRecordingRef.value = true;
        setIsRecording(true);
        console.log('🎤 Started PCM recording at 16kHz');
      };
      
      const stopRecording = () => {
        isRecordingRef.value = false;
        setIsRecording(false);
        console.log('🛑 Stopped PCM recording');
      };
      
      // Store functions for later use
      (window as any).elevenLabsRecording = {
        start: startRecording,
        stop: stopRecording
      };
      
      // Store processor node instead of mediaRecorder
      (mediaRecorderRef as any).current = {
        start: startRecording,
        stop: stopRecording,
        processorNode
      };
      
    } catch (error) {
      console.error('Error setting up audio recording:', error);
    }
  }, [activeConversations]);

  // Interrupt agents (stop them from speaking)
  const interruptAgents = useCallback(async () => {
    if (!conversationalServiceRef.current) return;

    // Clear any playing audio immediately
    const { ElevenLabsConversationalService } = await import('../../services/elevenLabsConversationalService');
    ElevenLabsConversationalService.clearAudioQueue();

    const service = conversationalServiceRef.current;
    const promises = Array.from(activeConversations.values()).map(conversationId => 
      service.interruptAgent(conversationId).catch(console.error)
    );
    await Promise.all(promises);
  }, [activeConversations]);

  // Auto interruption detection with agent audio awareness
  const lastInterruptionRef = useRef<number>(0);
  const INTERRUPTION_COOLDOWN = 2000; // 2 seconds cooldown
  const isAgentSpeakingRef = useRef<boolean>(false);
  
  const startVoiceDetection = useCallback(() => {
    if (voiceDetectionIntervalRef.current) return;
    
          voiceDetectionIntervalRef.current = setInterval(async () => {
        // Don't interrupt if any agent is currently speaking (prevent self-interruption)
        const anySpeaking = Array.from(agentStatuses.values()).some(status => status === 'speaking');
        const audioPlaying = (window as any).elevenLabsAgentSpeaking || false;
        
        if (anySpeaking || isAgentSpeakingRef.current || audioPlaying) {
          return; // Skip detection while agents are speaking or audio is playing
        }
      
      if (detectVoiceActivity()) {
        // Check if enough time has passed since last interruption
        const now = Date.now();
        if (now - lastInterruptionRef.current < INTERRUPTION_COOLDOWN) {
          return; // Skip interruption, too soon
        }
        
        // User is speaking - interrupt all audio
        console.log('🛑 User voice detected - interrupting agent audio');
        lastInterruptionRef.current = now;
        isAgentSpeakingRef.current = false; // Reset agent speaking flag
        
        // Clear audio queue first (most important)
        const { ElevenLabsConversationalService } = await import('../../services/elevenLabsConversationalService');
        ElevenLabsConversationalService.clearAudioQueue();
        
        // Then interrupt agents
        interruptAgents();
      }
    }, 200); // Check every 200ms, less aggressive
  }, [detectVoiceActivity, interruptAgents, agentStatuses]);

  // Stop voice detection
  const stopVoiceDetection = useCallback(() => {
    if (voiceDetectionIntervalRef.current) {
      clearInterval(voiceDetectionIntervalRef.current);
      voiceDetectionIntervalRef.current = null;
    }
  }, []);

  // Toggle recording (click once to start, click again to stop)
  const toggleRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current as any;
    if (!recorder) {
      await setupAudioRecording();
      return;
    }

    if (isRecording) {
      // Stop recording
      recorder.stop();
      stopVoiceDetection();
    } else {
      // Start recording
      recorder.start();
      startVoiceDetection();
      setIsRecording(true);
    }
  }, [isRecording, setupAudioRecording, startVoiceDetection, stopVoiceDetection]);



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
              Select Stakeholders & Meeting Mode
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedProject.name} - Choose who you want to speak with and how
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

          {/* Meeting Mode Selection */}
          {selectedStakeholders.length > 1 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose Meeting Mode
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Multi-Voice Simulation */}
                <div 
                  onClick={() => setMeetingMode('multi-voice')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    meetingMode === 'multi-voice' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">💰</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Multi-Voice Simulation
                    </h4>
                    <span className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    One AI agent roleplays all stakeholders with different personalities. 
                    <strong> Cost-effective!</strong> UI shows which person is speaking.
                  </p>
                </div>

                {/* Multi-Agent (Real) */}
                <div 
                  onClick={() => setMeetingMode('multi-agent')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    meetingMode === 'multi-agent' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">💸</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Real Multi-Agent
                    </h4>
                    <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
                      Premium
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Separate AI agents for each stakeholder. More realistic but 
                    <strong> 3x the cost!</strong> Each agent runs independently.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Start Meeting Button */}
          {selectedStakeholders.length > 0 && (
            <div className="text-center">
              <button
                onClick={startMeeting}
                className="inline-flex items-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                <Play className="w-5 h-5 mr-2" />
                {selectedStakeholders.length > 0 
                  ? `Start ${
                      selectedStakeholders.length === 1 
                        ? `Conversation with ${selectedStakeholders[0].name}`
                        : meetingMode === 'multi-voice' 
                          ? `Multi-Voice Simulation (${selectedStakeholders.length} voices)`
                          : `Real Multi-Agent Meeting (${selectedStakeholders.length} agents)`
                    }`
                  : 'Select Stakeholders'}
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Have a real-time voice conversation with multiple AI stakeholders simultaneously
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Meeting View
  if (currentStep === 'meeting') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Simple Test Section */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🧪 Connection Test</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              Let's test the basic connection first before the full conversation
            </p>
            <div className="flex space-x-3">
              {selectedStakeholders.map((stakeholder) => (
                <button
                  key={stakeholder.id}
                  onClick={() => {
                    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
                    if (!apiKey) {
                      console.error('🧪 TEST: No API key found in environment');
                      return;
                    }
                    testConnection(stakeholder.agentId, apiKey);
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                >
                  Test {stakeholder.name}
                </button>
              ))}
            </div>
          </div>
        </div>

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
              {selectedProject?.name} - {selectedStakeholders.length} participant{selectedStakeholders.length > 1 ? 's' : ''}: {selectedStakeholders.map(s => s.name).join(', ')}
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
  }

  return null; // Should not happen if currentStep is handled correctly
};

export default ElevenLabsMultiAgentMeeting;