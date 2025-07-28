import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Mic, MicOff, Users, ArrowLeft, Play, Square } from 'lucide-react';
import { ElevenLabsConversationalService } from '../../services/elevenLabsConversationalService';

interface ConversationMessage {
  id: string;
  agentId?: string;
  agentName?: string;
  content: string;
  type: 'user_input' | 'agent_response' | 'system';
  timestamp: Date;
  metadata?: {
    audioUrl?: string;
    duration?: number;
  };
}

const IndividualAgentMeeting: React.FC = () => {
  const { selectedProject, selectedStakeholders, setCurrentView } = useApp();
  
  // States
  const [selectedStakeholder, setSelectedStakeholder] = useState<any>(null);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  // Refs
  const elevenLabsServiceRef = useRef<ElevenLabsConversationalService | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Initialize ElevenLabs service
  useEffect(() => {
    const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (elevenLabsKey) {
      elevenLabsServiceRef.current = new ElevenLabsConversationalService(elevenLabsKey);
    }
  }, []);

  // Setup audio recording - exactly like ElevenLabs sales agent
  const setupAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;
      
      // Create AudioContext for real-time processing
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      let isProcessing = false;
      
      processor.onaudioprocess = async (event) => {
        if (!isRecording || isProcessing || !conversationIdRef.current || !elevenLabsServiceRef.current) {
          console.log('🚫 Audio processing skipped:', { isRecording, isProcessing, hasConversationId: !!conversationIdRef.current, hasService: !!elevenLabsServiceRef.current });
          return;
        }
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        console.log('🎤 Processing audio chunk, length:', inputData.length);
        
        // Convert to 16-bit PCM at 16kHz (ElevenLabs format)
        const targetSampleRate = 16000;
        const sourceSampleRate = audioContext.sampleRate;
        
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
        
        if (base64.length > 0) {
          isProcessing = true;
          try {
            console.log('📤 Sending audio to ElevenLabs, length:', base64.length);
            await elevenLabsServiceRef.current.sendAudioInputPCM(conversationIdRef.current, base64);
            console.log('✅ Audio sent successfully');
          } catch (error) {
            console.error('❌ Error sending audio:', error);
          }
          isProcessing = false;
        } else {
          console.log('⚠️ Empty audio data, skipping send');
        }
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
    } catch (error) {
      console.error('❌ Error setting up audio:', error);
    }
  }, [isRecording]);

  // Start meeting with selected stakeholder
  const startMeeting = useCallback(async () => {
    if (!selectedStakeholder || !elevenLabsServiceRef.current) return;

    console.log(`🚀 Starting individual meeting with ${selectedStakeholder.name}`);
    
    try {
      // Create stakeholder object for ElevenLabs
      const stakeholderForService = {
        id: selectedStakeholder.id,
        name: selectedStakeholder.name,
        role: selectedStakeholder.role,
        agentId: selectedStakeholder.agentId, // Use the ElevenLabs agent ID
        voice: selectedStakeholder.voice,
        department: selectedStakeholder.department,
        personality: selectedStakeholder.personality,
        priorities: selectedStakeholder.priorities,
        expertise: selectedStakeholder.expertise
      };

      // Generate contextual system prompt
      const systemPrompt = generateStakeholderPrompt(selectedStakeholder);

      // Start conversation with ElevenLabs
      const conversationId = await elevenLabsServiceRef.current.startConversation(
        stakeholderForService,
        (message: ConversationMessage) => {
          console.log(`📝 Message from ${selectedStakeholder.name}: ${message.content}`);
          
          // Filter out system messages
          const isSystemMessage = (
            message.content.startsWith('[') ||
            message.content.includes('CONTEXT UPDATE') ||
            message.content.length < 10
          );
          
          if (!isSystemMessage) {
            setConversationHistory(prev => [...prev, {
              ...message,
              agentName: selectedStakeholder.name
            }]);
          }
        },
        (agentId: string, status: string) => {
          console.log(`🔄 ${selectedStakeholder.name} status: ${status}`);
          setAgentStatus(status as any);
        }
      );

      conversationIdRef.current = conversationId;
      setMeetingStarted(true);
      setAgentStatus('listening');
      
      // Automatically start recording when meeting starts
      await setupAudioRecording();
      setIsRecording(true);
      console.log('🎤 Auto-started recording');
      
      console.log(`✅ Meeting started with ${selectedStakeholder.name}`);
      
    } catch (error) {
      console.error('❌ Error starting meeting:', error);
    }
  }, [selectedStakeholder, setupAudioRecording]);

  // End meeting
  const endMeeting = useCallback(async () => {
    console.log('🛑 Ending individual agent meeting');
    
    try {
      // Stop recording
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      // End ElevenLabs conversation
      if (conversationIdRef.current && elevenLabsServiceRef.current) {
        await elevenLabsServiceRef.current.endConversation(conversationIdRef.current);
      }
      
      // Reset state
      setMeetingStarted(false);
      setIsRecording(false);
      setAgentStatus('idle');
      conversationIdRef.current = null;
      
      console.log('✅ Meeting ended');
      
    } catch (error) {
      console.error('❌ Error ending meeting:', error);
    }
  }, []);

  // Toggle recording
  const toggleRecording = useCallback(async () => {
    if (!meetingStarted) return;
    
    if (!isRecording) {
      await setupAudioRecording();
      setIsRecording(true);
      console.log('🎤 Started recording');
    } else {
      setIsRecording(false);
      console.log('🛑 Stopped recording');
    }
  }, [isRecording, meetingStarted, setupAudioRecording]);

  // Generate stakeholder-specific system prompt
  const generateStakeholderPrompt = (stakeholder: any): string => {
    return `You are ${stakeholder.name}, ${stakeholder.role} at a company, participating in a business meeting about "${selectedProject?.name}".

ABOUT YOU:
- Role: ${stakeholder.role}
- Department: ${stakeholder.department}
- Personality: ${stakeholder.personality}
- Priorities: ${stakeholder.priorities?.join(', ')}
- Expertise: ${stakeholder.expertise?.join(', ')}

PROJECT CONTEXT:
${selectedProject?.description}

BUSINESS CONTEXT:
${selectedProject?.businessContext}

PROBLEM STATEMENT:
${selectedProject?.problemStatement}

GOALS:
${selectedProject?.businessGoals?.join('\n')}

INSTRUCTIONS:
- Respond as ${stakeholder.name} would, with your specific expertise and perspective
- Be conversational and professional
- Ask relevant questions about the project
- Share insights from your department's perspective
- Keep responses concise (2-3 sentences typically)
- Act like a real human colleague, not an AI assistant

You are now ready to discuss this project. Wait for the user to start the conversation.`;
  };

  // If no stakeholders selected, show error
  if (!selectedStakeholders?.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">No Stakeholders Selected</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please select stakeholders first.</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView('meeting-mode-selection')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Mode Selection
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Individual Agent Meeting</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Have a one-on-one conversation with a single stakeholder using ElevenLabs AI
          </p>
        </div>

        {/* Stakeholder Selection */}
        {!selectedStakeholder && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select One Stakeholder</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedStakeholders.map((stakeholder) => (
                <div
                  key={stakeholder.id}
                  onClick={() => setSelectedStakeholder(stakeholder)}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 cursor-pointer hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 transition-all duration-200"
                >
                  <div className="flex items-center mb-3">
                    <img
                      src={stakeholder.photo}
                      alt={stakeholder.name}
                      className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-purple-900">{stakeholder.name}</h3>
                      <p className="text-sm text-purple-700">{stakeholder.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-600">{stakeholder.department}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Stakeholder & Meeting Controls */}
        {selectedStakeholder && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img
                  src={selectedStakeholder.photo}
                  alt={selectedStakeholder.name}
                  className="w-16 h-16 rounded-full mr-4 object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStakeholder.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedStakeholder.role}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{selectedStakeholder.department}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  agentStatus === 'idle' ? 'bg-gray-100 text-gray-700' :
                  agentStatus === 'listening' ? 'bg-green-100 text-green-700' :
                  agentStatus === 'thinking' ? 'bg-yellow-100 text-yellow-700' :
                  agentStatus === 'speaking' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}
                </div>
              </div>
            </div>

            {/* Meeting Controls */}
            <div className="flex items-center space-x-4">
              {!meetingStarted ? (
                <button
                  onClick={startMeeting}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Meeting
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleRecording}
                    className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                      isRecording 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isRecording ? <Mic className="w-5 h-5 mr-2" /> : <MicOff className="w-5 h-5 mr-2" />}
                    {isRecording ? 'Microphone On' : 'Microphone Off'}
                  </button>
                  
                  <button
                    onClick={endMeeting}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    End Meeting
                  </button>
                </>
              )}
              
              <button
                onClick={() => setSelectedStakeholder(null)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Change Stakeholder
              </button>
            </div>
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Conversation</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.type === 'user_input'
                      ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                      : 'bg-purple-50 dark:bg-purple-900/20 mr-8'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-sm">
                      {message.type === 'user_input' ? 'You' : message.agentName}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualAgentMeeting;