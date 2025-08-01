import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface StreamingSession {
  sessionId: string;
  stakeholder: any;
  voiceName: string;
  audioContext: AudioContext;
  sourceBuffer: SourceBuffer | null;
  mediaSource: MediaSource;
  audioElement: HTMLAudioElement;
  isPlaying: boolean;
  onComplete: () => void;
  onError: (error: Error) => void;
  websocket: WebSocket | null;
  useRestFallback?: boolean;
  tokenBuffer: string;
  lastSentTime: number;
  audioChunks?: Blob[];
}

export class RealTimeStreamingService {
  private static instance: RealTimeStreamingService;
  private sessions: Map<string, StreamingSession> = new Map();
  private readonly AZURE_TTS_REGION = import.meta.env.VITE_AZURE_TTS_REGION || 'eastus';
  private readonly AZURE_TTS_KEY = import.meta.env.VITE_AZURE_TTS_KEY;
  private readonly BUFFER_DELAY_MS = 200; // Send to TTS every 200ms or when natural break

  public static getInstance(): RealTimeStreamingService {
    if (!RealTimeStreamingService.instance) {
      RealTimeStreamingService.instance = new RealTimeStreamingService();
    }
    return RealTimeStreamingService.instance;
  }

  private constructor() {}

  async startStreamingSession(
    sessionId: string,
    stakeholder: any,
    voiceName: string,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    console.log(`🎤 Starting real-time streaming session for ${stakeholder.name}`);

    try {
      // Create audio context and media source for real-time playback
      const audioContext = new AudioContext();
      const mediaSource = new MediaSource();
      const audioElement = new Audio();
      
      audioElement.src = URL.createObjectURL(mediaSource);
      audioElement.preload = 'auto';

      const session: StreamingSession = {
        sessionId,
        stakeholder,
        voiceName,
        audioContext,
        sourceBuffer: null,
        mediaSource,
        audioElement,
        isPlaying: false,
        onComplete,
        onError,
        websocket: null,
        tokenBuffer: '',
        lastSentTime: Date.now()
      };

      this.sessions.set(sessionId, session);

      // Setup MediaSource
      await this.setupMediaSource(session);

      // Setup Azure TTS WebSocket
      await this.setupAzureTTSWebSocket(session);

      console.log(`✅ Streaming session ready for ${stakeholder.name}`);
    } catch (error) {
      console.error(`❌ Failed to start streaming session for ${stakeholder.name}:`, error);
      onError(error as Error);
    }
  }

  private async setupMediaSource(session: StreamingSession): Promise<void> {
    return new Promise((resolve, reject) => {
      session.mediaSource.addEventListener('sourceopen', () => {
        try {
          // Use MP3 format for better browser compatibility
          session.sourceBuffer = session.mediaSource.addSourceBuffer('audio/mpeg');
          
          session.sourceBuffer.addEventListener('updateend', () => {
            if (!session.isPlaying && session.audioElement.readyState >= 2) {
              session.isPlaying = true;
              session.audioElement.play().catch(console.error);
              console.log(`🎵 Started audio playback for ${session.stakeholder.name}`);
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      session.mediaSource.addEventListener('error', reject);
    });
  }

  private async setupAzureTTSWebSocket(session: StreamingSession): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`⚠️ FALLBACK: WebSocket streaming not available, falling back to REST API for ${session.stakeholder.name}`);
      
      // Since Azure TTS WebSocket requires complex binary protocol implementation,
      // we'll fall back to the REST API approach for now
      session.useRestFallback = true;
      resolve();
    });
  }

  private handleTTSResponse(session: StreamingSession, data: any): void {
    try {
      if (data instanceof ArrayBuffer) {
        // Audio data received - append to source buffer immediately
        if (session.sourceBuffer && !session.sourceBuffer.updating) {
          session.sourceBuffer.appendBuffer(data);
          console.log(`🎵 Audio chunk received for ${session.stakeholder.name} (${data.byteLength} bytes)`);
        }
      } else {
        // Text response - log for debugging
        console.log(`📝 TTS response for ${session.stakeholder.name}:`, data);
      }
    } catch (error) {
      console.error(`❌ Error handling TTS response for ${session.stakeholder.name}:`, error);
    }
  }

  async streamOpenAIResponse(
    sessionId: string,
    systemPrompt: string,
    userMessage: string
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    console.log(`🚀 Starting OpenAI streaming for ${session.stakeholder.name}`);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 300,
        stream: true // Enable streaming
      });

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          await this.processTokenChunk(session, content);
        }
      }

      // Send any remaining buffer
      await this.flushTokenBuffer(session);
      await this.completeSession(session);

    } catch (error) {
      console.error(`❌ OpenAI streaming error for ${session.stakeholder.name}:`, error);
      session.onError(error as Error);
    }
  }

  private async processTokenChunk(session: StreamingSession, token: string): Promise<void> {
    // Just accumulate tokens - don't send to TTS in chunks (causes poor quality)
    session.tokenBuffer += token;
  }

  private async flushTokenBuffer(session: StreamingSession): Promise<void> {
    if (session.tokenBuffer.trim()) {
      console.log(`📝 Sending complete response to TTS for ${session.stakeholder.name}: "${session.tokenBuffer.substring(0, 50)}..."`);
      await this.sendToTTS(session, session.tokenBuffer.trim());
      session.tokenBuffer = '';
    }
  }

  private async sendToTTS(session: StreamingSession, text: string): Promise<void> {
    if (!text.trim()) return;

    console.log(`📤 Sending to TTS for ${session.stakeholder.name}: "${text}"`);

    if (session.useRestFallback) {
      // Use REST API fallback for immediate synthesis
      await this.synthesizeWithRestAPI(session, text);
    } else {
      // Original WebSocket approach (not working currently)
      if (!session.websocket) return;
      
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${session.voiceName}">${text}</voice></speak>`;
      const message = `X-RequestId:${session.sessionId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;

      try {
        session.websocket.send(message);
      } catch (error) {
        console.error(`❌ Failed to send to TTS for ${session.stakeholder.name}:`, error);
      }
    }
  }

  private async synthesizeWithRestAPI(session: StreamingSession, text: string): Promise<void> {
    try {
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${session.voiceName}">${text}</voice></speak>`;
      
      const response = await fetch(`https://${this.AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.AZURE_TTS_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'StakeholderApp'
        },
        body: ssml
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        await this.playAudioChunk(session, audioBlob);
        console.log(`🎵 Audio chunk played for ${session.stakeholder.name} (${audioBlob.size} bytes)`);
      } else {
        console.error(`❌ TTS REST API error for ${session.stakeholder.name}:`, response.status, response.statusText);
      }
    } catch (error) {
      console.error(`❌ TTS REST API failed for ${session.stakeholder.name}:`, error);
    }
  }

  private async playAudioChunk(session: StreamingSession, audioBlob: Blob): Promise<void> {
    try {
      // SIMPLE APPROACH: Just use a basic audio element with blob URL
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      await new Promise<void>((resolve, reject) => {
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
      
      session.isPlaying = true;
    } catch (error) {
      console.error(`❌ Failed to play audio chunk for ${session.stakeholder.name}:`, error);
    }
  }

  private async completeSession(session: StreamingSession): Promise<void> {
    console.log(`🏁 Completing streaming session for ${session.stakeholder.name}`);

    if (session.useRestFallback) {
      // For REST fallback, we don't need to send end message to WebSocket
      console.log(`✅ REST fallback session completed for ${session.stakeholder.name}`);
    } else {
      // Send end message to TTS WebSocket
      if (session.websocket) {
        const endMessage = `X-RequestId:${session.sessionId}\r\nPath:audio.end\r\n\r\n`;
        session.websocket.send(endMessage);
      }
    }

    // Wait for audio to finish
    if (session.audioElement) {
      await new Promise<void>((resolve) => {
        if (session.audioElement.ended || session.audioElement.paused) {
          resolve();
        } else {
          session.audioElement.addEventListener('ended', () => resolve(), { once: true });
        }
      });
    }

    session.onComplete();
  }

  async stopSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`🛑 Stopping streaming session for ${session.stakeholder.name}`);

    // Close WebSocket
    if (session.websocket) {
      session.websocket.close();
    }

    // Stop audio
    if (session.audioElement) {
      session.audioElement.pause();
      URL.revokeObjectURL(session.audioElement.src);
    }

    // Close audio context
    if (session.audioContext.state !== 'closed') {
      await session.audioContext.close();
    }

    this.sessions.delete(sessionId);
  }

  async stopAllSessions(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys());
    await Promise.all(sessionIds.map(id => this.stopSession(id)));
  }
}

export default RealTimeStreamingService;