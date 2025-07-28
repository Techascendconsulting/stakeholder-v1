import { ElevenLabsStakeholder } from '../data/elevenLabsProjects';

interface ConversationConfig {
  agentId: string;
  elevenLabsApiKey: string;
}

interface ConversationSession {
  conversationId: string;
  agentId: string;
  websocket: WebSocket | null;
  isActive: boolean;
  stakeholder: ElevenLabsStakeholder;
  isInitialized: boolean;
  systemPrompt?: string;
}

interface ConversationMessage {
  id: string;
  agentId: string;
  content: string;
  type: 'user_input' | 'agent_response';
  timestamp: Date;
  metadata?: {
    audioUrl?: string;
    duration?: number;
  };
}

class ElevenLabsConversationalService {
  private apiKey: string;
  private activeSessions: Map<string, ConversationSession> = new Map();
  private messageHandlers: Map<string, (message: ConversationMessage) => void> = new Map();
  private statusHandlers: Map<string, (status: 'speaking' | 'listening' | 'thinking' | 'idle') => void> = new Map();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get signed URL for agent conversation
   */
  private async getSignedUrl(agentId: string): Promise<string> {
    try {
      console.log(`🔐 Requesting signed URL for agent: ${agentId}`);
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      console.log(`🔐 Signed URL response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Signed URL error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to get signed URL: ${response.status}`);
      }

      const data = await response.json();
      console.log(`🔐 Signed URL received:`, data.signed_url.substring(0, 100) + '...');
      return data.signed_url;
    } catch (error) {
      console.error('❌ Error getting signed URL:', error);
      throw error;
    }
  }

  /**
   * Start conversation with an ElevenLabs agent
   */
  async startConversation(
    stakeholder: ElevenLabsStakeholder,
    onMessage?: (message: ConversationMessage) => void,
    onStatusChange?: (agentId: string, status: 'speaking' | 'listening' | 'thinking' | 'idle') => void
  ): Promise<string> {
    try {
      // Use signed URL for proper authentication
      console.log(`🔗 Getting signed URL for ${stakeholder.name} (${stakeholder.agentId})`);
      const websocketUrl = await this.getSignedUrl(stakeholder.agentId);
      
      // Create WebSocket connection
      const websocket = new WebSocket(websocketUrl);
      
      const conversationId = `conv-${stakeholder.id}-${Date.now()}`;
      
      const session: ConversationSession = {
        conversationId,
        agentId: stakeholder.agentId,
        websocket,
        isActive: false,
        stakeholder,
        isInitialized: false
      };

      // Store handlers
      if (onMessage) {
        this.messageHandlers.set(conversationId, onMessage);
      }
      if (onStatusChange) {
        this.statusHandlers.set(conversationId, (status) => onStatusChange(stakeholder.agentId, status));
      }

      // Set up WebSocket event handlers
      websocket.onopen = async () => {
        console.log(`✅ DEBUG: Connected to ElevenLabs agent: ${stakeholder.name}`, {
          conversationId,
          agentId: stakeholder.agentId,
          readyState: websocket.readyState
        });
        session.isActive = true;
        this.activeSessions.set(conversationId, session);
        onStatusChange?.(stakeholder.agentId, 'listening');
        
        // Send initial context as a user message to set the scene
        if (stakeholder.systemPrompt) {
          try {
            // Wait a moment for the connection to fully establish
            setTimeout(async () => {
              try {
                console.log('📝 Sending initial context message...');
                await this.sendTextInput(conversationId, stakeholder.systemPrompt);
                console.log('✅ Initial context message sent successfully');
              } catch (error) {
                console.error('❌ Error sending initial context:', error);
              }
            }, 500);
          } catch (error) {
            console.error('❌ Error setting up initial context:', error);
          }
        }
        
        console.log('🔗 DEBUG: WebSocket connection established, ready for interaction');
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`📨 WebSocket message for ${stakeholder.name}:`, data);
          this.handleWebSocketMessage(conversationId, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      websocket.onclose = (event) => {
        console.log(`🔌 DEBUG: Connection closed for agent: ${stakeholder.name}`, {
          conversationId,
          agentId: stakeholder.agentId,
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          sessionWasActive: session.isActive
        });
        
        // Log specific error codes
        if (event.code === 1008) {
          console.error('❌ DEBUG: Invalid message format sent to ElevenLabs');
        } else if (event.code === 1006) {
          console.error('❌ DEBUG: Connection closed abnormally');
        } else if (event.code === 1000) {
          console.log('✅ DEBUG: Normal closure');
        }
        
        session.isActive = false;
        onStatusChange?.(stakeholder.agentId, 'idle');
        
        // Don't cleanup immediately - allow for potential reconnection
        console.log(`🔍 DEBUG: Scheduling cleanup for ${conversationId} in 1 second`);
        setTimeout(() => {
          console.log(`🧹 DEBUG: Cleaning up session ${conversationId}`);
          this.cleanup(conversationId);
        }, 1000);
      };

      websocket.onerror = (error) => {
        console.error(`❌ WebSocket error for agent: ${stakeholder.name}`, error);
        session.isActive = false;
        onStatusChange?.(stakeholder.agentId, 'idle');
        this.cleanup(conversationId);
      };

      return conversationId;

    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(conversationId: string, data: any) {
    const session = this.activeSessions.get(conversationId);
    const messageHandler = this.messageHandlers.get(conversationId);
    const statusHandler = this.statusHandlers.get(conversationId);

    if (!session) return;

    switch (data.type) {
      case 'conversation_initiation_metadata':
        console.log('🎤 Conversation initiated:', data);
        const metadata = {
          conversationId: data.conversation_initiation_metadata_event?.conversation_id,
          agentAudioFormat: data.conversation_initiation_metadata_event?.agent_output_audio_format,
          userAudioFormat: data.conversation_initiation_metadata_event?.user_input_audio_format
        };
        console.log('📋 Conversation metadata:', metadata);
        
        // Store the audio format for proper playback
        if (session) {
          (session as any).agentAudioFormat = metadata.agentAudioFormat;
        }
        
        statusHandler?.('listening');
        break;

      case 'agent_response':
        console.log('🤖 Agent response:', data);
        statusHandler?.('speaking');
        
        if (messageHandler && data.agent_response_event?.agent_response) {
          const message: ConversationMessage = {
            id: `msg-${Date.now()}`,
            agentId: session.agentId,
            content: data.agent_response_event.agent_response,
            type: 'agent_response',
            timestamp: new Date(),
            metadata: {
              audioUrl: data.audio_url,
              duration: data.duration
            }
          };
          messageHandler(message);
        }
        break;

      case 'user_transcript':
        console.log('👤 User transcript:', data);
        
        if (messageHandler && data.user_transcription_event?.user_transcript) {
          const message: ConversationMessage = {
            id: `msg-${Date.now()}`,
            agentId: session.agentId,
            content: data.user_transcription_event.user_transcript,
            type: 'user_input',
            timestamp: new Date()
          };
          messageHandler(message);
        }
        break;

      case 'agent_response_start':
        console.log('🎵 Agent started speaking');
        statusHandler?.('speaking');
        break;

      case 'agent_response_end':
        console.log('🔇 Agent finished speaking');
        statusHandler?.('listening');
        break;

      case 'user_speech_start':
        console.log('🎤 User started speaking');
        statusHandler?.('thinking');
        break;

      case 'user_speech_end':
        console.log('🤫 User finished speaking');
        statusHandler?.('thinking');
        break;

      case 'audio':
        console.log('🔊 Received audio chunk:', data);
        if (data.audio_event?.audio_base_64) {
          console.log('🎵 Playing audio chunk, length:', data.audio_event.audio_base_64.length);
          this.playAudioChunk(data.audio_event.audio_base_64, conversationId);
        } else {
          console.warn('⚠️ Audio event received but no audio_base_64 data');
        }
        break;

      case 'interruption':
        console.log('🛑 Interruption event:', data);
        statusHandler?.('listening');
        break;

      case 'vad_score':
        // Voice Activity Detection score - can be ignored for now
        break;

      case 'internal_tentative_agent_response':
        console.log('🤔 Tentative agent response:', data);
        break;

      case 'ping':
        // Respond to ping to keep connection alive
        if (session.websocket && session.websocket.readyState === WebSocket.OPEN) {
          const pongMessage = {
            type: 'pong',
            event_id: data.ping_event?.event_id || Date.now()
          };
          session.websocket.send(JSON.stringify(pongMessage));
          console.log('🏓 Responded to ping');
        }
        break;

      default:
        console.log('📨 Unknown message type:', data.type, data);
    }
  }

  /**
   * Send user audio input to agent using proper format
   */
  async sendAudioInput(conversationId: string, audioBlob: Blob): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    
    if (!session || !session.websocket || session.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('No active session or WebSocket connection');
    }

          try {
        // Send initialization message first if this is the first interaction
        if (!session.isInitialized && session.websocket.readyState === WebSocket.OPEN) {
          const initMessage = {
            type: 'conversation_initiation_client_data',
            conversation_config_override: {
              agent_does_not_speak_first: true,
              user_starts_speaking_first: true,
              require_user_input_to_start: true
            },
            custom_llm_extra_body: {},
            dynamic_variables: {}
          };
          session.websocket.send(JSON.stringify(initMessage));
          console.log('📤 Sent initialization message before audio');
          session.isInitialized = true;
          
          // Add a small delay to ensure initialization is processed
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      // Convert blob to base64 using FileReader for better compatibility
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Send the message in the exact format from ElevenLabs docs
      const message = {
        user_audio_chunk: base64Audio
      };

      console.log(`🎤 Sending audio to ${session.stakeholder.name}`, { 
        size: audioBlob.size, 
        type: audioBlob.type,
        base64Length: base64Audio.length
      });
      
      // Send as JSON string
      session.websocket.send(JSON.stringify(message));
      console.log('✅ Audio sent successfully');
    } catch (error) {
      console.error('❌ Error sending audio input:', error);
      throw error;
    }
  }

  /**
   * Send PCM audio input directly to agent
   */
  async sendAudioInputPCM(conversationId: string, base64Audio: string): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    
    if (!session || !session.websocket || session.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('No active session or WebSocket connection');
    }

    try {
      // Send initialization message first if this is the first interaction
      if (!session.isInitialized && session.websocket.readyState === WebSocket.OPEN) {
        const initMessage = {
          type: 'conversation_initiation_client_data',
          conversation_config_override: {
            agent_does_not_speak_first: true,
            user_starts_speaking_first: true,
            require_user_input_to_start: true
          },
          custom_llm_extra_body: {},
          dynamic_variables: {}
        };
        session.websocket.send(JSON.stringify(initMessage));
        console.log('📤 Sent initialization message before PCM audio');
        session.isInitialized = true;
        
        // Add a small delay to ensure initialization is processed
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Send the PCM audio directly
      const message = {
        user_audio_chunk: base64Audio
      };

      console.log(`🎤 Sending PCM audio to ${session.stakeholder.name}`, { 
        base64Length: base64Audio.length,
        format: 'PCM 16kHz'
      });
      
      // Send as JSON string
      session.websocket.send(JSON.stringify(message));
      console.log('✅ PCM Audio sent successfully');
    } catch (error) {
      console.error('❌ Error sending PCM audio input:', error);
      throw error;
    }
  }

  /**
   * Convert blob to base64 using FileReader for better compatibility
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Check if a session is active and connected
   */
  isSessionActive(conversationId: string): boolean {
    const session = this.activeSessions.get(conversationId);
    const isActive = session?.isActive === true && 
                    session.websocket?.readyState === WebSocket.OPEN;
    
    console.log(`🔍 DEBUG: Session active check for ${conversationId}:`, {
      hasSession: !!session,
      sessionIsActive: session?.isActive,
      websocketReadyState: session?.websocket?.readyState,
      websocketOpen: session?.websocket?.readyState === WebSocket.OPEN,
      finalResult: isActive
    });
    
    return isActive;
  }

  /**
   * Send text input to agent (for testing)
   */
  async sendTextInput(conversationId: string, text: string): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    
    if (!session || !session.websocket || session.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('No active session or WebSocket connection');
    }

    try {
      const message = {
        type: 'user_message',
        text: text
      };

      console.log(`💬 Sending text to ${session.stakeholder.name}:`, text);
      session.websocket.send(JSON.stringify(message));
      console.log('✅ Text sent successfully');
    } catch (error) {
      console.error('❌ Error sending text input:', error);
      throw error;
    }
  }

  /**
   * Interrupt agent (stop current response)
   */
  async interruptAgent(conversationId: string): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    
    if (!session || !session.websocket || session.websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const message = {
        type: 'interrupt'
      };

      session.websocket.send(JSON.stringify(message));
      console.log('🛑 Interrupted agent conversation');
    } catch (error) {
      console.error('Error interrupting agent:', error);
    }
  }

  /**
   * End conversation with agent
   */
  async endConversation(conversationId: string): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    
    if (session && session.websocket) {
      if (session.websocket.readyState === WebSocket.OPEN) {
        session.websocket.close();
      }
      session.isActive = false;
    }

    this.cleanup(conversationId);
  }

  // Static audio queue to prevent overlapping audio
  private static audioQueue: { buffer: AudioBuffer; context: AudioContext; conversationId: string; stakeholderName?: string; agentId?: string }[] = [];
  private static isPlaying = false;
  private static globalAudioContext: AudioContext | null = null;
  private static currentConversationId: string | null = null;

  /**
   * Play audio chunk from agent response using Web Audio API with queuing
   */
  private async playAudioChunk(base64Audio: string, conversationId?: string): Promise<void> {
    try {
      console.log('🎵 Processing audio chunk, base64 length:', base64Audio.length);
      
      // Decode base64 to binary
      const binaryString = atob(base64Audio);
      const pcmData = new Int16Array(binaryString.length / 2);
      
      // Convert bytes to 16-bit signed integers (little-endian)
      for (let i = 0; i < pcmData.length; i++) {
        const byte1 = binaryString.charCodeAt(i * 2);
        const byte2 = binaryString.charCodeAt(i * 2 + 1);
        pcmData[i] = byte1 | (byte2 << 8);
        // Convert to signed 16-bit
        if (pcmData[i] > 32767) pcmData[i] -= 65536;
      }

      console.log('🎵 PCM samples:', pcmData.length);

      // Use a single global audio context to prevent multiple contexts
      if (!ElevenLabsConversationalService.globalAudioContext) {
        ElevenLabsConversationalService.globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = ElevenLabsConversationalService.globalAudioContext;
      
      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(1, pcmData.length, 16000);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert 16-bit PCM to float32 (-1 to 1 range)
      for (let i = 0; i < pcmData.length; i++) {
        channelData[i] = pcmData[i] / 32768.0;
      }
      
      // Get stakeholder information for better logging
      const session = this.activeSessions.get(conversationId || '');
      const stakeholderName = session?.stakeholder.name || 'Unknown';
      const agentId = session?.stakeholder.agentId || 'unknown';
      
      console.log(`🎵 Audio from ${stakeholderName} (Agent ID: ${agentId})`);
      
      // Add to queue with stakeholder information
      ElevenLabsConversationalService.audioQueue.push({ 
        buffer: audioBuffer, 
        context: audioContext,
        conversationId: conversationId || 'unknown',
        stakeholderName,
        agentId
      });
      
      console.log(`🎵 Added audio chunk to queue. Queue length: ${ElevenLabsConversationalService.audioQueue.length}`);
      
      // Start playing queue if not already playing
      if (!ElevenLabsConversationalService.isPlaying) {
        this.playNextInQueue();
      }
      
    } catch (error) {
      console.error('❌ Error processing audio chunk:', error);
    }
  }

  /**
   * Play next audio buffer in queue
   */
  private playNextInQueue(): void {
    if (ElevenLabsConversationalService.audioQueue.length === 0) {
      ElevenLabsConversationalService.isPlaying = false;
      console.log('🎵 Audio queue empty, stopping playback');
      // Signal that no agent is speaking anymore
      (window as any).elevenLabsAgentSpeaking = false;
      return;
    }

    ElevenLabsConversationalService.isPlaying = true;
    const { buffer, context, conversationId, stakeholderName, agentId } = ElevenLabsConversationalService.audioQueue.shift()!;
    
    console.log(`🎵 Playing audio from ${stakeholderName || 'Unknown'} (Agent: ${agentId || 'unknown'}), remaining in queue: ${ElevenLabsConversationalService.audioQueue.length}`);
    
    // Signal that an agent is speaking
    (window as any).elevenLabsAgentSpeaking = true;
    
    // Create and play audio source
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    
    source.onended = () => {
      console.log('🎵 Audio chunk finished, playing next...');
      // Play next chunk in queue after a small delay to prevent gaps
      setTimeout(() => {
        this.playNextInQueue();
      }, 10);
    };
    
    source.onerror = (error) => {
      console.error('❌ Audio playback error:', error);
      // Continue with next chunk even if this one fails
      setTimeout(() => {
        this.playNextInQueue();
      }, 10);
    };
    
    console.log('🎵 Starting audio chunk playback...');
    source.start(0);
  }

  /**
   * Clear audio queue (for interruptions)
   */
  static clearAudioQueue(): void {
    ElevenLabsConversationalService.audioQueue = [];
    ElevenLabsConversationalService.isPlaying = false;
    console.log('🛑 Audio queue cleared');
  }



  /**
   * Clean up session resources
   */
  private cleanup(conversationId: string) {
    this.activeSessions.delete(conversationId);
    this.messageHandlers.delete(conversationId);
    this.statusHandlers.delete(conversationId);
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): ConversationSession[] {
    return Array.from(this.activeSessions.values()).filter(session => session.isActive);
  }

  /**
   * Check if agent is in conversation
   */
  isAgentActive(agentId: string): boolean {
    return Array.from(this.activeSessions.values()).some(
      session => session.agentId === agentId && session.isActive
    );
  }

  /**
   * End all conversations
   */
  async endAllConversations(): Promise<void> {
    const conversationIds = Array.from(this.activeSessions.keys());
    
    for (const conversationId of conversationIds) {
      await this.endConversation(conversationId);
    }
  }
}

export { ElevenLabsConversationalService, type ConversationSession, type ConversationMessage };