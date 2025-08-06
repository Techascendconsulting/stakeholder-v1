interface MurfTTSResponse {
  audioFile: string;
}

interface VoiceConfig {
  voice_id: string;
  style: string;
  pitch?: number;
  rate?: number;
}

export class MurfTTSService {
  private static instance: MurfTTSService;
  private readonly API_URL = 'https://api.murf.ai/v1/speech/generate';
  private readonly API_KEY = import.meta.env.VITE_MURF_API_KEY;
  private audioCache: Map<string, Blob> = new Map();

  // Voice mapping as specified
  private readonly voiceMap: Record<string, VoiceConfig> = {
    aisha: { voice_id: "en-UK-hazel", style: "Conversational" },
    david: { voice_id: "en-AU-leyton", style: "Conversational", pitch: 3, rate: 7 },
    james: { voice_id: "en-US-maverick", style: "Narration" },
    sarah: { voice_id: "en-UK-hazel", style: "Conversational" }, // Fallback to hazel
    emily: { voice_id: "en-UK-hazel", style: "Conversational" }, // Fallback to hazel
    michael: { voice_id: "en-US-maverick", style: "Professional" } // Finance Manager - professional tone
  };

  static getInstance(): MurfTTSService {
    if (!MurfTTSService.instance) {
      MurfTTSService.instance = new MurfTTSService();
    }
    return MurfTTSService.instance;
  }

  private generateCacheKey(text: string, voiceId: string, style: string, pitch?: number, rate?: number): string {
    const content = `${text}-${voiceId}-${style}-${pitch || 0}-${rate || 0}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  async synthesizeSpeech(
    text: string, 
    stakeholderName: string, 
    useCache: boolean = true
  ): Promise<Blob | null> {
    try {
      // console.log('🔍 MURF DEBUG: synthesizeSpeech called with:', { text: text.substring(0, 50) + '...', stakeholderName, type: typeof stakeholderName });
      
      if (!this.API_KEY) {
        console.warn('Murf API key not configured. Please add VITE_MURF_API_KEY to your environment variables.');
        return null;
      }

      // Get voice config for stakeholder
      const voiceConfig = this.getVoiceForStakeholder(stakeholderName);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(text, voiceConfig.voice_id, voiceConfig.style, voiceConfig.pitch, voiceConfig.rate);
      if (useCache && this.audioCache.has(cacheKey)) {
        console.log(`🎤 MURF: Using cached audio for ${stakeholderName}`);
        return this.audioCache.get(cacheKey)!;
      }

      console.log(`🎤 MURF: Generating speech for ${stakeholderName} with voice ${voiceConfig.voice_id}`, {
        voice_id: voiceConfig.voice_id,
        style: voiceConfig.style,
        pitch: voiceConfig.pitch,
        rate: voiceConfig.rate
      });

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.API_KEY
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: voiceConfig.voice_id,
          style: voiceConfig.style,
          pitch: voiceConfig.pitch || 0,
          rate: voiceConfig.rate || 0,
          format: 'MP3',
          sampleRate: 24000,
          modelVersion: 'GEN2'
        })
      });

      if (!response.ok) {
        console.error(`❌ MURF API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: MurfTTSResponse = await response.json();
      
      if (!data.audioFile) {
        console.error('❌ MURF: No audio file URL in response');
        return null;
      }

      // Download the audio file
      const audioResponse = await fetch(data.audioFile);
      if (!audioResponse.ok) {
        console.error(`❌ MURF: Failed to download audio file: ${audioResponse.status}`);
        return null;
      }

      const audioBlob = await audioResponse.blob();
      console.log(`✅ MURF: Generated ${audioBlob.size} bytes of audio for ${stakeholderName}`);
      
      // Cache the result
      if (useCache) {
        this.audioCache.set(cacheKey, audioBlob);
      }

      return audioBlob;

    } catch (error) {
      console.error('❌ MURF TTS Error:', error);
      return null;
    }
  }

  // Get voice configuration for stakeholder
  getVoiceForStakeholder(stakeholderName: string): VoiceConfig {
    // console.log('🔍 MURF DEBUG: getVoiceForStakeholder called with:', stakeholderName, 'Type:', typeof stakeholderName);
    
    if (!stakeholderName || typeof stakeholderName !== 'string') {
      console.error('❌ MURF ERROR: Invalid stakeholderName:', stakeholderName);
      return this.voiceMap['aisha']; // Default fallback
    }
    
    // Normalize stakeholder name to match voice map keys
    const normalizedName = stakeholderName.toLowerCase().split(' ')[0]; // Get first name
    
    // Map stakeholder names to voice map keys
    const nameMapping: Record<string, string> = {
      'aisha': 'aisha',
      'david': 'david', 
      'james': 'james',
      'sarah': 'sarah',
      'emily': 'emily',
      'michael': 'michael'
    };

    const voiceKey = nameMapping[normalizedName] || 'aisha'; // Default to aisha
    return this.voiceMap[voiceKey];
  }

  // Audio playback with immediate start
  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        // Start playing as soon as possible
        audio.preload = 'auto';

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };

        // Play immediately
        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Check if Murf is configured
  isConfigured(): boolean {
    return !!this.API_KEY;
  }

  // Clear cache
  clearCache(): void {
    this.audioCache.clear();
    console.log('🧹 MURF: Cache cleared');
  }

  // Clear cache for specific stakeholder
  clearStakeholderCache(stakeholderName: string): void {
    const voiceConfig = this.getVoiceForStakeholder(stakeholderName);
    const keysToDelete: string[] = [];
    
    for (const [key] of this.audioCache) {
      if (key.includes(voiceConfig.voice_id)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.audioCache.delete(key));
    console.log(`🧹 MURF: Cleared ${keysToDelete.length} cached items for ${stakeholderName}`);
  }

  // Get cache size
  getCacheSize(): number {
    return this.audioCache.size;
  }
}

// Export singleton instance
export const murfTTS = MurfTTSService.getInstance();

// Clear cache on startup to ensure fresh voice configurations
murfTTS.clearCache();