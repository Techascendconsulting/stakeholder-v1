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
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get signed URL');
      }

      const data = await response.json();
      return data.signed_url;
    } catch (error) {
      console.error('Error getting signed URL:', error);
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
      let websocketUrl: string;
      
      try {
        // Try to get signed URL for this agent
        websocketUrl = await this.getSignedUrl(stakeholder.agentId);
        console.log(`🔗 Using signed URL for ${stakeholder.name}`);
      } catch (error) {
        // Fallback to direct connection
        websocketUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${stakeholder.agentId}`;
        console.log(`🔗 Using direct connection for ${stakeholder.name}`);
      }
      
      // Create WebSocket connection
      const websocket = new WebSocket(websocketUrl);
      
      const conversationId = `conv-${stakeholder.id}-${Date.now()}`;
      
      const session: ConversationSession = {
        conversationId,
        agentId: stakeholder.agentId,
        websocket,
        isActive: false,
        stakeholder
      };

      // Store handlers
      if (onMessage) {
        this.messageHandlers.set(conversationId, onMessage);
      }
      if (onStatusChange) {
        this.statusHandlers.set(conversationId, (status) => onStatusChange(stakeholder.agentId, status));
      }

      // Set up WebSocket event handlers
      websocket.onopen = () => {
        console.log(`✅ Connected to ElevenLabs agent: ${stakeholder.name}`);
        session.isActive = true;
        this.activeSessions.set(conversationId, session);
        onStatusChange?.(stakeholder.agentId, 'listening');
        
        // Send initialization message with conversation config
        const initMessage = {
          type: 'conversation_initiation_client_data',
          conversation_config_override: {
            agent: {
              prompt: null, // Use agent's configured prompt
              first_message: null, // Use agent's configured first message  
              language: 'en'
            },
            tts: {
              voice_id: null // Use agent's configured voice
            }
          },
          custom_llm_extra_body: {
            temperature: 0.7,
            max_tokens: 150
          },
          dynamic_variables: {
            user_name: 'User',
            project_context: 'Customer Onboarding Optimization Project',
            meeting_type: 'stakeholder_discussion'
          }
        };
        websocket.send(JSON.stringify(initMessage));
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
        console.log(`🔌 Connection closed for agent: ${stakeholder.name}`, event.code, event.reason);
        session.isActive = false;
        onStatusChange?.(stakeholder.agentId, 'idle');
        this.cleanup(conversationId);
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
        console.log('📋 Conversation metadata:', {
          conversationId: data.conversation_initiation_metadata_event?.conversation_id,
          agentAudioFormat: data.conversation_initiation_metadata_event?.agent_output_audio_format,
          userAudioFormat: data.conversation_initiation_metadata_event?.user_input_audio_format
        });
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
          this.playAudioChunk(data.audio_event.audio_base_64);
        } else {
          console.warn('⚠️ Audio event received but no audio_base_64 data');
        }
        break;

      case 'ping':
        // Respond to ping to keep connection alive
        if (session.websocket && session.websocket.readyState === WebSocket.OPEN) {
          const pongMessage = {
            type: 'pong',
            event_id: data.ping_event?.event_id || Date.now()
          };
          session.websocket.send(JSON.stringify(pongMessage));
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

      default:
        console.log('📨 Unknown message type:', data.type, data);
    }
  }

  /**
   * Send user audio input to agent
   */
  async sendAudioInput(conversationId: string, audioBlob: Blob): Promise<void> {
    const session = this.activeSessions.get(conversationId);
    
    if (!session || !session.websocket || session.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('No active session or WebSocket connection');
    }

    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const message = {
        user_audio_chunk: base64Audio
      };

      console.log(`🎤 Sending audio to ${session.stakeholder.name}`, { size: audioBlob.size, type: audioBlob.type });
      session.websocket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending audio input:', error);
      throw error;
    }
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
    } catch (error) {
      console.error('Error sending text input:', error);
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

  /**
   * Play audio chunk from agent response
   */
  private playAudioChunk(base64Audio: string): void {
    try {
      console.log('🎵 Processing audio chunk, base64 length:', base64Audio.length);
      
      // Decode base64 to binary
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('🎵 Audio bytes created, length:', bytes.length);

      // Create blob and play audio (try different formats)
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onloadstart = () => {
        console.log('🎵 Audio loading started');
      };
      
      audio.oncanplay = () => {
        console.log('🎵 Audio can play');
      };
      
      audio.onplay = () => {
        console.log('🎵 Audio started playing');
      };
      
      audio.onended = () => {
        console.log('🎵 Audio finished playing');
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (error) => {
        console.error('❌ Error playing audio:', error);
        console.error('❌ Audio error details:', audio.error);
        URL.revokeObjectURL(audioUrl);
      };
      
      console.log('🎵 Attempting to play audio...');
      audio.play().catch(error => {
        console.error('❌ Failed to play audio:', error);
        // Try with different MIME type
        const audioBlob2 = new Blob([bytes], { type: 'audio/wav' });
        const audioUrl2 = URL.createObjectURL(audioBlob2);
        const audio2 = new Audio(audioUrl2);
        audio2.play().catch(error2 => {
          console.error('❌ Failed to play audio with WAV format too:', error2);
          URL.revokeObjectURL(audioUrl2);
        });
      });
    } catch (error) {
      console.error('❌ Error processing audio chunk:', error);
    }
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