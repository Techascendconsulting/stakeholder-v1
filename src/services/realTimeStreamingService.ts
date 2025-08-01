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
  tokenBuffer: string;
  lastSentTime: number;
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
      // Correct Azure TTS WebSocket URL with authentication
      const wsUrl = `wss://${this.AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/websocket/v1?Ocp-Apim-Subscription-Key=${this.AZURE_TTS_KEY}`;
      session.websocket = new WebSocket(wsUrl);

      session.websocket.onopen = () => {
        console.log(`🔗 Azure TTS WebSocket connected for ${session.stakeholder.name}`);
        
        // Send configuration message with correct format
        const configMessage = `X-RequestId:${session.sessionId}\r\nContent-Type:application/json\r\nPath:speech.config\r\n\r\n{
          "context": {
            "synthesis": {
              "audio": {
                "metadataoptions": {
                  "sentenceBoundaryEnabled": "false",
                  "wordBoundaryEnabled": "false"
                },
                "outputFormat": "audio-24khz-48kbitrate-mono-mp3"
              }
            }
          }
        }`;

        session.websocket!.send(configMessage);
        resolve();
      };

      session.websocket.onmessage = (event) => {
        this.handleTTSResponse(session, event.data);
      };

      session.websocket.onerror = (error) => {
        console.error(`❌ Azure TTS WebSocket error for ${session.stakeholder.name}:`, error);
        reject(error);
      };

      session.websocket.onclose = () => {
        console.log(`🔌 Azure TTS WebSocket closed for ${session.stakeholder.name}`);
      };
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
    session.tokenBuffer += token;
    const now = Date.now();

    // Send to TTS if we have a natural break or enough time has passed
    const hasNaturalBreak = /[.!?,:;]\s*$/.test(session.tokenBuffer.trim());
    const timeToSend = (now - session.lastSentTime) >= this.BUFFER_DELAY_MS;
    const bufferFull = session.tokenBuffer.length >= 50;

    if ((hasNaturalBreak && session.tokenBuffer.trim().length > 10) || timeToSend || bufferFull) {
      await this.sendToTTS(session, session.tokenBuffer.trim());
      session.tokenBuffer = '';
      session.lastSentTime = now;
    }
  }

  private async flushTokenBuffer(session: StreamingSession): Promise<void> {
    if (session.tokenBuffer.trim()) {
      await this.sendToTTS(session, session.tokenBuffer.trim());
      session.tokenBuffer = '';
    }
  }

  private async sendToTTS(session: StreamingSession, text: string): Promise<void> {
    if (!session.websocket || !text.trim()) return;

    console.log(`📤 Sending to TTS for ${session.stakeholder.name}: "${text}"`);

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${session.voiceName}">${text}</voice></speak>`;

    const message = `X-RequestId:${session.sessionId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;

    try {
      session.websocket.send(message);
    } catch (error) {
      console.error(`❌ Failed to send to TTS for ${session.stakeholder.name}:`, error);
    }
  }

  private async completeSession(session: StreamingSession): Promise<void> {
    console.log(`🏁 Completing streaming session for ${session.stakeholder.name}`);

    // Send end message to TTS
    if (session.websocket) {
      const endMessage = `X-RequestId:${session.sessionId}\r\nPath:audio.end\r\n\r\n`;
      session.websocket.send(endMessage);
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