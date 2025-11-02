export interface ElevenLabsStakeholder {
  id: string
  name: string
  role: string
  agentId: string
}

export interface ConversationMessage {
  id: string
  agentId: string
  content: string
  type: 'user_input' | 'agent_response'
  timestamp: Date
  metadata?: {
    audioUrl?: string
    duration?: number
  }
}

export class ElevenLabsConversationalService {
  constructor(_apiKey: string) {}

  async startConversation(_stakeholder: ElevenLabsStakeholder, _onMessage?: (message: ConversationMessage) => void, _onStatusChange?: (agentId: string, status: 'speaking' | 'listening' | 'thinking' | 'idle') => void): Promise<string> {
    throw new Error('ElevenLabs conversational API disabled (transcript-only mode)')
  }

  async endAllConversations(): Promise<void> {
    return
  }

  isSessionActive(_conversationId: string): boolean {
    return false
  }

  async sendTextInput(_conversationId: string, _text: string): Promise<void> {
    return
  }

  async sendAudioInputPCM(_conversationId: string, _base64Pcm: string): Promise<void> {
    return
  }

  async interruptAgent(_conversationId: string): Promise<void> {
    return
  }

  static clearAudioQueue(): void { return }
}

