import { TTSRequest, AzureTTSConfig } from '../lib/types';

class AzureTTSService {
  private config: AzureTTSConfig;
  private audioCache: Map<string, string> = new Map();

  constructor() {
    this.config = {
      endpoint: import.meta.env.VITE_AZURE_TTS_ENDPOINT || '',
      apiKey: import.meta.env.VITE_AZURE_TTS_KEY || '',
      region: import.meta.env.VITE_AZURE_TTS_REGION || 'eastus'
    };
  }

  private generateCacheKey(request: TTSRequest): string {
    return `${request.voiceId}-${request.text}-${request.rate || 'default'}-${request.pitch || 'default'}`;
  }

  async synthesizeSpeech(request: TTSRequest): Promise<string> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    // Check if Azure TTS is configured
    if (!this.config.endpoint || !this.config.apiKey) {
      console.warn('Azure TTS not configured. Skipping audio synthesis.');
      return ''; // Return empty string when not configured
    }

    try {
      const ssml = this.buildSSML(request);
      
      const response = await fetch(`${this.config.endpoint}/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'RefinementMeeting'
        },
        body: ssml
      });

      if (!response.ok) {
        console.warn(`Azure TTS API error: ${response.status}. Meeting will continue without audio.`);
        return ''; // Return empty string on API error
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the result
      this.audioCache.set(cacheKey, audioUrl);
      
      return audioUrl;
    } catch (error) {
      console.warn('Azure TTS Error:', error, 'Meeting will continue without audio.');
      return ''; // Return empty string on error
    }
  }

  private buildSSML(request: TTSRequest): string {
    const rate = request.rate || 'medium';
    const pitch = request.pitch || 'medium';
    
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${request.voiceId}">
          <prosody rate="${rate}" pitch="${pitch}">
            ${request.text}
          </prosody>
        </voice>
      </speak>
    `;
  }

  // Clean up cached audio URLs
  cleanup(): void {
    this.audioCache.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.audioCache.clear();
  }

  // Get team member configurations
  getTeamMembers() {
    return {
      sarah: {
        id: 'sarah',
        name: 'Sarah',
        role: 'Scrum Master' as const,
        voiceId: 'en-GB-LibbyNeural',
        nationality: 'British',
        personality: 'Collaborative, process-focused, keeps meetings on track',
        focusAreas: ['Story sizing', 'Sprint readiness', 'Delivery risks', 'Team coordination'],
        avatar: '👩‍💼'
      },
      srikanth: {
        id: 'srikanth',
        name: 'Srikanth',
        role: 'Senior Developer' as const,
        voiceId: 'en-IN-PrabhatNeural',
        nationality: 'Indian',
        personality: 'Technical depth, architectural thinking, system perspective',
        focusAreas: ['System limitations', 'Scalability', 'Architecture', 'Technical complexity'],
        avatar: '👨‍💻'
      },
      lisa: {
        id: 'lisa',
        name: 'Lisa',
        role: 'Developer' as const,
        voiceId: 'pl-PL-ZofiaNeural',
        nationality: 'Polish',
        personality: 'Implementation-focused, detail-oriented, integration expert',
        focusAreas: ['Task clarity', 'Integration questions', 'Implementation details'],
        avatar: '👩‍💻'
      },
      tom: {
        id: 'tom',
        name: 'Tom',
        role: 'QA Tester' as const,
        voiceId: 'en-GB-RyanNeural',
        nationality: 'British',
        personality: 'Quality-focused, edge case finder, testability advocate',
        focusAreas: ['Testability', 'Edge cases', 'Acceptance criteria gaps', 'Quality assurance'],
        avatar: '👨‍🔬'
      }
    };
  }
}

export const azureTTSService = new AzureTTSService();