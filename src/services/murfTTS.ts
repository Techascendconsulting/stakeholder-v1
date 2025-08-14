import { speak as elevenSpeak, isConfigured as elevenConfigured, resolveVoiceId } from './elevenLabsTTS'

interface VoiceConfig {
  voice_id: string;
  style: string;
  pitch?: number;
  rate?: number;
}

class MurfTTSService {
  private static instance: MurfTTSService;
  private audioCache: Map<string, Blob> = new Map();
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;

  // Compatibility voice map retained for interface; actual voice selection uses ElevenLabs mapping
  private readonly voiceMap: Record<string, VoiceConfig> = {
    // Not used directly; kept to avoid breaking callers that might read config
    aisha: { voice_id: 'pBZVCk298iJlHAcHQwLr', style: 'Conversational' },
    david: { voice_id: 'UgBBYS2sOqTuMpoF3BR0', style: 'Conversational' },
    james: { voice_id: 'c6SfcYrb2t09NHXiT80T', style: 'Narration' },
  };

  static getInstance(): MurfTTSService {
    if (!MurfTTSService.instance) {
      MurfTTSService.instance = new MurfTTSService();
    }
    return MurfTTSService.instance;
  }

  private generateCacheKey(text: string, voiceId: string): string {
    const content = `${text}-${voiceId}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // Compatibility method: synthesizeSpeech returns Blob like before
  async synthesizeSpeech(text: string, stakeholderName: string, useCache: boolean = true): Promise<Blob | null> {
    try {
      if (!elevenConfigured()) {
        console.warn('ElevenLabs not configured. Please set VITE_ELEVENLABS_API_KEY.');
        return null;
      }

      const voiceId = resolveVoiceId(stakeholderName);
      const cacheKey = this.generateCacheKey(text, voiceId || 'default');
      if (useCache && this.audioCache.has(cacheKey)) {
        return this.audioCache.get(cacheKey)!;
      }

      const buffer = await elevenSpeak(text, { stakeholderName });
      const blob = new Blob([buffer], { type: 'audio/mpeg' });
      if (useCache) this.audioCache.set(cacheKey, blob);
      return blob;
    } catch (error) {
      console.error('TTS Error:', error);
      return null;
    }
  }

  getVoiceForStakeholder(stakeholderName: string): VoiceConfig {
    const key = (stakeholderName || '').toLowerCase().split(' ')[0] || 'aisha';
    const voiceId = resolveVoiceId(key) || 'pBZVCk298iJlHAcHQwLr';
    return { voice_id: voiceId, style: 'Conversational' };
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.stopCurrentAudio();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        this.isPlaying = true;
        audio.onended = () => { URL.revokeObjectURL(audioUrl); this.currentAudio = null; this.isPlaying = false; resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(audioUrl); this.currentAudio = null; this.isPlaying = false; reject(new Error('Audio playback failed')); };
        audio.onpause = () => { if (this.currentAudio === audio) { URL.revokeObjectURL(audioUrl); this.currentAudio = null; this.isPlaying = false; resolve(); } };
        audio.play().catch(err => { URL.revokeObjectURL(audioUrl); this.currentAudio = null; this.isPlaying = false; reject(err); });
      } catch (error) {
        this.currentAudio = null; this.isPlaying = false; reject(error);
      }
    });
  }

  stopCurrentAudio(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPlaying = false;
    }
  }

  isCurrentlyPlaying(): boolean { return this.isPlaying; }
  isConfigured(): boolean { return elevenConfigured(); }
  clearCache(): void { this.audioCache.clear(); }
  clearStakeholderCache(stakeholderName: string): void {
    const voiceId = resolveVoiceId(stakeholderName) || '';
    for (const key of Array.from(this.audioCache.keys())) {
      if (voiceId && key.includes(voiceId)) this.audioCache.delete(key);
    }
  }
  clearGreetingCache(): void { this.audioCache.clear(); }
  getCacheSize(): number { return this.audioCache.size; }
}

export const murfTTS = MurfTTSService.getInstance();

// Optional: clear cache on startup like before
murfTTS.clearCache();