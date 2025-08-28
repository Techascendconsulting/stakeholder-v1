import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

interface ElevenLabsConfig {
  apiKey: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

interface VoiceAgent {
  id: string;
  name: string;
  role: string;
  voiceId: string;
  personality: string;
  model: string;
}

interface StreamingOptions {
  modelId?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
  outputFormat?: string;
}

class ElevenLabsService {
  private client: ElevenLabsClient;
  private defaultSettings: StreamingOptions;

  constructor(_config: ElevenLabsConfig) {
    this.client = new ElevenLabsClient({ apiKey: '' });
    this.defaultSettings = { modelId: '', voiceSettings: { stability: 0, similarityBoost: 0 }, outputFormat: '' };
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getAvailableVoices() { return []; }

  /**
   * Stream audio for a specific voice agent
   */
  async streamVoiceResponse(_text: string, _voiceId: string, _options: Partial<StreamingOptions> = {}): Promise<AsyncIterable<Buffer>> { throw new Error('ElevenLabs streaming disabled') }

  /**
   * Generate audio for a voice agent (non-streaming)
   */
  async generateVoiceResponse(_text: string, _voiceId: string, _options: Partial<StreamingOptions> = {}): Promise<Buffer> { throw new Error('ElevenLabs generation disabled') }

  /**
   * Create audio blob URL for playing in browser
   */
  createAudioBlobUrl(_audioBuffer: Buffer): string { return '' }

  /**
   * Stream and play audio directly
   */
  async streamAndPlayAudio(_text: string, _voiceId: string, _onAudioStart?: () => void, _onAudioEnd?: () => void, _options: Partial<StreamingOptions> = {}): Promise<void> { return }

  /**
   * Validate voice ID
   */
  async validateVoiceId(_voiceId: string): Promise<boolean> { return false }
}

// Default voice agents configuration for stakeholder meetings
export const DEFAULT_VOICE_AGENTS: VoiceAgent[] = [
  {
    id: 'ceo-agent',
    name: 'Marcus Chen',
    role: 'Chief Executive Officer',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - Professional female
    personality: 'Authoritative, strategic, results-focused',
    model: 'eleven_flash_v2_5'
  },
  {
    id: 'cto-agent',
    name: 'David Rodriguez',
    role: 'Chief Technology Officer', 
    voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - Professional male
    personality: 'Technical, analytical, innovation-driven',
    model: 'eleven_flash_v2_5'
  },
  {
    id: 'product-manager-agent',
    name: 'Sarah Williams',
    role: 'Product Manager',
    voiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi - Friendly female
    personality: 'User-focused, collaborative, detail-oriented',
    model: 'eleven_flash_v2_5'
  },
  {
    id: 'ops-manager-agent',
    name: 'Michael Thompson',
    role: 'Operations Manager',
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - Professional male
    personality: 'Process-oriented, efficient, pragmatic',
    model: 'eleven_flash_v2_5'
  },
  {
    id: 'customer-success-agent',
    name: 'Lisa Chen',
    role: 'Customer Success Manager',
    voiceId: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - Warm female
    personality: 'Empathetic, customer-focused, solution-oriented',
    model: 'eleven_flash_v2_5'
  }
];

export { ElevenLabsService, type VoiceAgent, type StreamingOptions };