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

  constructor(config: ElevenLabsConfig) {
    this.client = new ElevenLabsClient({
      apiKey: config.apiKey
    });

    this.defaultSettings = {
      modelId: 'eleven_flash_v2_5', // Ultra-low latency for real-time conversations
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.3,
        useSpeakerBoost: true
      },
      outputFormat: 'mp3_44100_128'
    };
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getAvailableVoices() {
    try {
      const voices = await this.client.voices.search();
      return voices.voices || [];
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      return [];
    }
  }

  /**
   * Stream audio for a specific voice agent
   */
  async streamVoiceResponse(
    text: string, 
    voiceId: string, 
    options: Partial<StreamingOptions> = {}
  ): Promise<AsyncIterable<Buffer>> {
    const settings = { ...this.defaultSettings, ...options };
    
    try {
      const audioStream = await this.client.textToSpeech.stream(voiceId, {
        text,
        modelId: settings.modelId,
        voiceSettings: settings.voiceSettings,
        outputFormat: settings.outputFormat
      });

      return audioStream;
    } catch (error) {
      console.error('Error streaming audio from ElevenLabs:', error);
      throw error;
    }
  }

  /**
   * Generate audio for a voice agent (non-streaming)
   */
  async generateVoiceResponse(
    text: string, 
    voiceId: string, 
    options: Partial<StreamingOptions> = {}
  ): Promise<Buffer> {
    const settings = { ...this.defaultSettings, ...options };
    
    try {
      const audio = await this.client.textToSpeech.convert(voiceId, {
        text,
        modelId: settings.modelId,
        voiceSettings: settings.voiceSettings,
        outputFormat: settings.outputFormat
      });

      return audio;
    } catch (error) {
      console.error('Error generating audio from ElevenLabs:', error);
      throw error;
    }
  }

  /**
   * Create audio blob URL for playing in browser
   */
  createAudioBlobUrl(audioBuffer: Buffer): string {
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }

  /**
   * Stream and play audio directly
   */
  async streamAndPlayAudio(
    text: string,
    voiceId: string,
    onAudioStart?: () => void,
    onAudioEnd?: () => void,
    options: Partial<StreamingOptions> = {}
  ): Promise<void> {
    try {
      const audioStream = await this.streamVoiceResponse(text, voiceId, options);
      
      // Convert stream to blob and play
      const chunks: Buffer[] = [];
      
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }

      const audioBuffer = Buffer.concat(chunks);
      const audioUrl = this.createAudioBlobUrl(audioBuffer);
      
      const audio = new Audio(audioUrl);
      
      audio.onloadstart = () => onAudioStart?.();
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        onAudioEnd?.();
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Error streaming and playing audio:', error);
      throw error;
    }
  }

  /**
   * Validate voice ID
   */
  async validateVoiceId(voiceId: string): Promise<boolean> {
    try {
      const voices = await this.getAvailableVoices();
      return voices.some(voice => voice.voice_id === voiceId);
    } catch (error) {
      console.error('Error validating voice ID:', error);
      return false;
    }
  }
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