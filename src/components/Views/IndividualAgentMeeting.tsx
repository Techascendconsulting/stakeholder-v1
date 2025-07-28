import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Mic, Square, Users, Volume2, VolumeX, PhoneOff, User } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { IndividualAgentService, IndividualAgentConfig, ConversationMessage } from '../../services/individualAgentService';

export const IndividualAgentMeeting: React.FC = () => {
  const { selectedStakeholders, setCurrentView } = useApp();
  
  // Meeting state
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Map<string, string>>(new Map());
  const [activeConnections, setActiveConnections] = useState<Map<string, string>>(new Map());
  
  // Individual agents
  const [individualAgents, setIndividualAgents] = useState<IndividualAgentConfig[]>([]);
  const [currentSpeaking, setCurrentSpeaking] = useState<string | null>(null);
  const [conversationQueue, setConversationQueue] = useState<string[]>([]);
  
  // Services
  const individualAgentServiceRef = useRef<IndividualAgentService | null>(null);
  const mediaRecorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Initialize individual agent service
  useEffect(() => {
    individualAgentServiceRef.current = IndividualAgentService.getInstance();
    return () => {
      // Cleanup on unmount
      if (individualAgentServiceRef.current) {
        individualAgentServiceRef.current.endMeeting();
      }
    };
  }, []);

  // Start meeting with individual agents
  const startMeeting = useCallback(async () => {
    if (!selectedStakeholders?.length || !individualAgentServiceRef.current) return;

    console.log('🚀 Starting Individual Agent Meeting');
    
    try {
      // Create individual agent configurations
      const agentConfigs = individualAgentServiceRef.current.createStakeholderAgents(selectedStakeholders);
      setIndividualAgents(agentConfigs);
      
      console.log(`📋 Created ${agentConfigs.length} individual agents:`, 
        agentConfigs.map(a => `${a.name} (${a.role})`));

      // Start individual agent conversations
      const connections = await individualAgentServiceRef.current.startIndividualAgentMeeting(
        agentConfigs,
        (agentId: string, message: ConversationMessage) => {
          console.log(`📝 Message from ${message.agentName}: ${message.content.substring(0, 50)}...`);
          
          // Filter out system messages
          const isSystemMessage = (
            message.content.startsWith('[') ||
            message.content.includes('CONTEXT UPDATE') ||
            message.content.includes('HUMAN BEHAVIOR MODE') ||
            message.content.length < 10
          );
          
          if (!isSystemMessage) {
            setConversationHistory(prev => [...prev, message]);
          }
        },
        (agentId: string, status: string) => {
          setAgentStatuses(prev => new Map(prev.set(agentId, status)));
          
          // Track current speaking agent - EXACT COPY from voice-only
          if (status === 'speaking') {
            setCurrentSpeaking(agentId);
          } else if (status === 'listening' && currentSpeaking === agentId) {
            setCurrentSpeaking(null);
            // Move to next in queue by removing current speaker
            setConversationQueue(prev => prev.filter(id => id !== agentId));
          }
        }
      );

      setActiveConnections(connections);
      setMeetingStarted(true);
      
      console.log(`✅ Individual Agent Meeting started with ${connections.size} active agents`);
      
    } catch (error) {
      console.error('❌ Failed to start individual agent meeting:', error);
    }
  }, [selectedStakeholders, currentSpeaking]);

  // End meeting
  const endMeeting = useCallback(async () => {
    console.log('🛑 Ending Individual Agent Meeting');
    
    try {
      // Stop recording
      if (mediaRecorderRef.current && isRecording) {
        if (mediaRecorderRef.current.audioContext) {
          mediaRecorderRef.current.audioContext.close();
        }
        setIsRecording(false);
      }
      
      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // End individual agent meeting
      if (individualAgentServiceRef.current) {
        await individualAgentServiceRef.current.endMeeting();
      }
      
      // Reset state
      setMeetingStarted(false);
      setActiveConnections(new Map());
      setAgentStatuses(new Map());
      setIndividualAgents([]);
      setCurrentSpeaking(null);
      
      console.log('✅ Individual Agent Meeting ended');
      
    } catch (error) {
      console.error('❌ Error ending meeting:', error);
    }
  }, [isRecording]);

  // Setup audio recording - EXACT COPY from working ElevenLabs meeting
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
      
      // Create AudioContext for real-time processing - EXACT COPY
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create AudioWorklet processor for PCM 16kHz conversion - EXACT COPY
      const processorNode = audioContext.createScriptProcessor(4096, 1, 1);
      
      let isRecordingRef = { value: false };
      let isUserSpeaking = false;
      let silenceTimer: NodeJS.Timeout | null = null;
      
      processorNode.onaudioprocess = async (event) => {
        if (!isRecordingRef.value) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Voice activity detection - EXACT COPY
        const average = inputData.reduce((sum, value) => sum + Math.abs(value), 0) / inputData.length;
        const voiceThreshold = 0.005;
        const peaks = inputData.filter(value => Math.abs(value) > 0.02).length;
        const hasSpeech = average > voiceThreshold || peaks > 10;
        
        if (hasSpeech) {
          if (!isUserSpeaking) {
            console.log('🎤 User started speaking');
            isUserSpeaking = true;
          }
          
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
          }
          
          silenceTimer = setTimeout(() => {
            if (isUserSpeaking) {
              console.log('🤫 User stopped speaking - processing audio');
              isUserSpeaking = false;
            }
          }, 1500);
        }
        
        // Convert float32 PCM to 16-bit PCM at 16kHz - EXACT COPY
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
        
        // Convert to 16-bit PCM - EXACT COPY
        const pcm16 = new Int16Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          const sample = Math.max(-1, Math.min(1, pcmData[i]));
          pcm16[i] = Math.round(sample * 0x7FFF);
        }
        
        // Convert to base64 - EXACT COPY
        const uint8Array = new Uint8Array(pcm16.buffer);
        const base64 = btoa(String.fromCharCode(...uint8Array));
        
        // Process audio when user stops speaking - EXACT COPY
        if (base64.length > 0 && !isUserSpeaking && isRecordingRef.value) {
          await processAudioInput(base64);
        }
      };
      
      source.connect(processorNode);
      processorNode.connect(audioContext.destination);
      
      const startRecording = () => {
        isRecordingRef.value = true;
        setIsRecording(true);
        console.log('🎤 Started recording for individual agents');
      };
      
      const stopRecording = () => {
        isRecordingRef.value = false;
        setIsRecording(false);
        console.log('🛑 Stopped recording');
      };
      
      mediaRecorderRef.current = {
        start: startRecording,
        stop: stopRecording,
        audioContext,
        processorNode
      };
      
    } catch (error) {
      console.error('❌ Error setting up audio recording:', error);
    }
  }, [processAudioInput]);

  // Process audio input with individual agents - EXACT COPY from working ElevenLabs meeting
  const processAudioInput = useCallback(async (base64Audio: string) => {
    if (!individualAgentServiceRef.current) return;
    
    try {
      console.log('🎯 Processing user input with individual agents');
      
      // Send to individual agent service for intelligent routing
      await individualAgentServiceRef.current.processUserInput(
        base64Audio,
        "User spoke" // This would be actual transcription
      );
      
    } catch (error) {
      console.error('❌ Error processing audio input:', error);
    }
  }, []);

  // Start recording once - stays on until meeting ends
  const startRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) {
      await setupAudioRecording();
      // After setup, start recording immediately
      setTimeout(() => {
        if (mediaRecorderRef.current && !isRecording) {
          mediaRecorderRef.current.start();
        }
      }, 100);
    } else if (!isRecording) {
      mediaRecorderRef.current.start();
    }
  }, [isRecording, setupAudioRecording]);

  // Get stakeholder by agent ID
  const getStakeholderByAgentId = useCallback((agentId?: string) => {
    if (!agentId) return null;
    return individualAgents.find(agent => agent.voiceConfig.agentId === agentId);
  }, [individualAgents]);

  if (!selectedStakeholders?.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Stakeholders Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please select stakeholders to start an individual agent meeting.
          </p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Individual Agent Meeting
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Human-like AI agents with individual brains & expertise
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedStakeholders.length} Individual Agents
                </span>
              </div>
              
              {!meetingStarted ? (
                <button
                  onClick={startMeeting}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Start Individual Agent Meeting
                </button>
              ) : (
                <button
                  onClick={endMeeting}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  End Meeting
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Individual Agents Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Individual AI Agents
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Each agent has their own brain, knowledge & personality
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                {individualAgents.map((agent) => {
                  const status = agentStatuses.get(agent.id) || 'idle';
                  const isActive = activeConnections.has(agent.id);
                  const isSpeaking = currentSpeaking === agent.id;
                  
                  return (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isSpeaking
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
                          isSpeaking ? 'bg-green-500' :
                          status === 'listening' ? 'bg-blue-500' :
                          status === 'thinking' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{agent.role}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {agent.department} • Individual Brain
                          </p>
                        </div>
                        <div className="flex items-center">
                          {isSpeaking && (
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
                      
                      {/* Agent Expertise */}
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <strong>Expertise:</strong> {agent.expertise.join(', ') || 'General'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
              
              {/* Meeting Status */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Human-like Agent Conversation
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {meetingStarted ? 'Agents are ready - they will ask questions and engage naturally' : 'Start meeting to begin conversation'}
                    </p>
                  </div>
                  
                  {meetingStarted && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Live Meeting
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversation History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No conversation yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {meetingStarted 
                        ? 'Start speaking - the agents will respond naturally and ask questions'
                        : 'Start the meeting to begin your conversation with individual AI agents'
                      }
                    </p>
                  </div>
                ) : (
                  conversationHistory.map((message) => {
                    const isUser = message.type === 'user_input';
                    const agent = isUser ? null : individualAgents.find(a => a.id === message.agentId);
                    const displayName = isUser ? 'You' : agent?.name || 'AI Agent';
                    
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
                              {agent && (
                                <span className="ml-1 text-xs opacity-75">
                                  ({agent.role})
                                </span>
                              )}
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

              {/* Voice Controls */}
              <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-4">
                <div className="flex items-center justify-center space-x-6">
                  
                  {/* Recording Button - Click once to start, stays on */}
                  <button
                    onClick={startRecording}
                    disabled={!meetingStarted || isRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-green-500 text-white shadow-lg animate-pulse cursor-default'
                        : !meetingStarted
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-105'
                    }`}
                  >
                    <Mic className="w-6 h-6" />
                  </button>

                  {/* Mute Toggle */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isMuted
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  {/* End Meeting Button */}
                  {meetingStarted && (
                    <button
                      onClick={endMeeting}
                      className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow-lg hover:scale-105 transition-all"
                      title="End Meeting"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Instructions */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {!meetingStarted 
                      ? 'Start the meeting to begin conversation with individual AI agents'
                      : isRecording 
                      ? 'Speak naturally - agents will respond and ask questions like real humans'
                      : 'Click the microphone once to start listening - it will stay on until you end the meeting'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};