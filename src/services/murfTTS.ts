interface MurfTTSResponse {
  audioFile: string;
}

export class MurfTTSService {
  private static instance: MurfTTSService;
  private readonly API_URL = 'https://api.murf.ai/v1/speech/generate';
  private readonly API_KEY = import.meta.env.VITE_MURF_API_KEY;

  static getInstance(): MurfTTSService {
    if (!MurfTTSService.instance) {
      MurfTTSService.instance = new MurfTTSService();
    }
    return MurfTTSService.instance;
  }

  async synthesizeSpeech(text: string, voiceId: string = 'en-US-natalie'): Promise<Blob | null> {
    try {
      console.log(`🎤 MURF: Generating speech for voice ${voiceId}`);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.API_KEY
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: voiceId,
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
      console.log(`✅ MURF: Generated ${audioBlob.size} bytes of audio`);
      
      return audioBlob;

    } catch (error) {
      console.error('❌ MURF TTS Error:', error);
      return null;
    }
  }

  // Voice mapping for stakeholders
  getVoiceForStakeholder(stakeholderName: string): string {
    const voiceMap: Record<string, string> = {
      'James Walker': 'en-US-terrell',     // Male, business-like
      'Aisha Ahmed': 'en-US-natalie',      // Female, professional
      'David Thompson': 'en-US-alex'       // Male, technical
    };

    return voiceMap[stakeholderName] || 'en-US-natalie';
  }

  // Simple audio playback
  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };

      audio.play().catch(reject);
    });
  }
}