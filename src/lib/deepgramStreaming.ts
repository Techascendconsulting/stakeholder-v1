/**
 * Deepgram Real-Time Streaming Service
 * Ultra-low latency voice transcription for natural conversations
 */

const DEEPGRAM_API_KEY = 'b2f32f741671fbba48d868136eb7964fc571088b';
const DEEPGRAM_WS_URL = 'wss://api.deepgram.com/v1/listen';

interface DeepgramStreamingOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onSilenceDetected?: () => void;
}

interface DeepgramStreamingResult {
  transcript: string;
  is_final: boolean;
  confidence?: number;
}

interface DeepgramMessage {
  type: 'Results' | 'Metadata' | 'SpeechStarted' | 'UtteranceEnd';
  channel?: {
    alternatives: Array<{
      transcript: string;
      confidence: number;
    }>;
  };
  is_final?: boolean;
  speech_final?: boolean;
}

export class DeepgramStreaming {
  private websocket: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private isRecording = false;
  private silenceTimer: NodeJS.Timeout | null = null;
  private options: DeepgramStreamingOptions;
  private lastTranscriptTime = 0;
  private silenceThreshold = 2000; // 2 seconds of silence

  constructor(options: DeepgramStreamingOptions = {}) {
    this.options = options;
  }

  /**
   * Start real-time streaming transcription
   */
  async startStreaming(): Promise<void> {
    if (this.isRecording) {
      console.warn('🎙️ Already recording, stopping current session first');
      await this.stopStreaming();
    }

    try {
      console.log('🚀 Starting Deepgram real-time streaming...');
      
      // Get microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for Deepgram
        }
      });

      // Setup WebSocket connection to Deepgram
      await this.connectWebSocket();

      // Setup MediaRecorder for audio streaming
      this.setupMediaRecorder();

      this.isRecording = true;
      this.lastTranscriptTime = Date.now();
      
      console.log('✅ Deepgram streaming started successfully');
      this.options.onOpen?.();

    } catch (error) {
      console.error('❌ Failed to start streaming:', error);
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop streaming transcription
   */
  async stopStreaming(): Promise<string> {
    console.log('🛑 Stopping Deepgram streaming...');
    
    this.isRecording = false;
    
    // Clear silence timer
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    // Close WebSocket
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.close();
    }

    // Stop audio stream
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    console.log('✅ Deepgram streaming stopped');
    this.options.onClose?.();
    
    return ''; // Final transcript would be accumulated elsewhere
  }

  /**
   * Setup WebSocket connection to Deepgram
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        model: 'nova-2',
        language: 'en-US',
        punctuate: 'true',
        smart_format: 'true',
        interim_results: 'true',
        endpointing: 'true',
        utterances: 'true',
        vad_events: 'true', // Voice activity detection
        encoding: 'linear16',
        sample_rate: '16000',
        channels: '1'
      });

      const wsUrl = `${DEEPGRAM_WS_URL}?${params}`;
      
      this.websocket = new WebSocket(wsUrl, ['token', DEEPGRAM_API_KEY]);

      this.websocket.onopen = () => {
        console.log('🔗 Deepgram WebSocket connected');
        resolve();
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.websocket.onerror = (error) => {
        console.error('❌ Deepgram WebSocket error:', error);
        reject(error);
      };

      this.websocket.onclose = (event) => {
        console.log('🔌 Deepgram WebSocket closed:', event.code, event.reason);
      };
    });
  }

  /**
   * Setup MediaRecorder to stream audio to Deepgram
   */
  private setupMediaRecorder(): void {
    if (!this.audioStream) return;

    const options = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 16000,
    };

    // Fallback for browsers that don't support webm
    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(this.audioStream, options);
    } catch (e) {
      console.log('🎙️ WebM not supported, using default format');
      mediaRecorder = new MediaRecorder(this.audioStream);
    }

    this.mediaRecorder = mediaRecorder;

    // Stream audio data to Deepgram in real-time
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(event.data);
      }
    };

    // Start recording with small time slices for real-time streaming
    this.mediaRecorder.start(100); // Send data every 100ms
  }

  /**
   * Handle incoming WebSocket messages from Deepgram
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message: DeepgramMessage = JSON.parse(event.data);
      console.log('🔍 Deepgram message:', message.type, message);
      
      if (message.type === 'Results' && message.channel?.alternatives?.[0]) {
        const alternative = message.channel.alternatives[0];
        const transcript = alternative.transcript;
        const isFinal = message.is_final || false;
        
        console.log(`📝 Raw transcript - Final: ${isFinal}, Content: "${transcript}"`);
        
        if (transcript && transcript.trim()) {
          console.log(`📝 ${isFinal ? 'FINAL' : 'INTERIM'}: "${transcript}"`);
          
          // Update last transcript time for silence detection
          this.lastTranscriptTime = Date.now();
          this.resetSilenceTimer();
          
          // Notify callback
          this.options.onTranscript?.(transcript, isFinal);
        } else if (isFinal) {
          console.log('⚠️ Final result with empty transcript');
        }
      }
      
      // Handle voice activity detection
      if (message.type === 'SpeechStarted') {
        console.log('🎤 Speech detected');
        this.resetSilenceTimer();
      }
      
      if (message.type === 'UtteranceEnd') {
        console.log('🔇 Utterance ended');
        this.startSilenceTimer();
      }
      
    } catch (error) {
      console.error('❌ Error parsing Deepgram message:', error);
    }
  }

  /**
   * Reset silence detection timer
   */
  private resetSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Start silence detection timer
   */
  private startSilenceTimer(): void {
    this.resetSilenceTimer();
    
    this.silenceTimer = setTimeout(() => {
      const timeSinceLastTranscript = Date.now() - this.lastTranscriptTime;
      
      if (timeSinceLastTranscript >= this.silenceThreshold && this.isRecording) {
        console.log('🔇 Silence detected, auto-stopping recording');
        this.options.onSilenceDetected?.();
      }
    }, this.silenceThreshold);
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Update silence threshold
   */
  setSilenceThreshold(ms: number): void {
    this.silenceThreshold = ms;
  }
}

/**
 * Create a new Deepgram streaming instance
 */
export const createDeepgramStreaming = (options: DeepgramStreamingOptions) => {
  return new DeepgramStreaming(options);
};