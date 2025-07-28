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
      // Get signed URL for this agent
      const signedUrl = await this.getSignedUrl(stakeholder.agentId);
      
      // Create WebSocket connection
      const websocket = new WebSocket(signedUrl);
      
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
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(conversationId, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
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
        statusHandler?.('listening');
        break;

      case 'agent_response':
        console.log('🤖 Agent response:', data);
        statusHandler?.('speaking');
        
        if (messageHandler && data.agent_response) {
          const message: ConversationMessage = {
            id: `msg-${Date.now()}`,
            agentId: session.agentId,
            content: data.agent_response,
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
        
        if (messageHandler && data.user_transcript) {
          const message: ConversationMessage = {
            id: `msg-${Date.now()}`,
            agentId: session.agentId,
            content: data.user_transcript,
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

      case 'ping':
        // Respond to ping to keep connection alive
        if (session.websocket && session.websocket.readyState === WebSocket.OPEN) {
          session.websocket.send(JSON.stringify({ type: 'pong' }));
        }
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
        type: 'audio_input',
        audio: base64Audio,
        format: 'mp3' // or whatever format the blob is in
      };

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
        type: 'text_input',
        text: text
      };

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