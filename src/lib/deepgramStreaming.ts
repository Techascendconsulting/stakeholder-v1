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
  private silenceThreshold = 4000; // 4 seconds of silence (increased for better UX)
  private hasReceivedTranscript = false; // Track if we've received any transcripts

  constructor(options: DeepgramStreamingOptions = {}) {
    this.options = options;
  }

  /**
   * Start real-time streaming transcription
   */
  async startStreaming(): Promise<void> {
    console.log('🎤 DEEPGRAM: Starting streaming transcription...');
    
    try {
      // Test API key first
      if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY === 'your-deepgram-api-key-here') {
        throw new Error('Deepgram API key not configured');
      }
      
      // Get microphone access
      console.log('🎤 DEEPGRAM: Requesting microphone access...');
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      console.log('✅ DEEPGRAM: Microphone access granted');

      // Setup WebSocket connection
      console.log('🔌 DEEPGRAM: Connecting to WebSocket...');
      await this.connectWebSocket();
      console.log('✅ DEEPGRAM: WebSocket connected');

      // Setup audio recording
      console.log('🎙️ DEEPGRAM: Setting up audio recording...');
      this.setupMediaRecorder();
      console.log('✅ DEEPGRAM: Audio recording started');

      this.isRecording = true;
      this.hasReceivedTranscript = false; // Reset for new session
      this.lastTranscriptTime = Date.now(); // Initialize timestamp
      this.options.onOpen?.();
      
    } catch (error) {
      console.error('❌ DEEPGRAM: Failed to start streaming:', error);
      
      // Provide specific error messages
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          this.options.onError?.(new Error('Microphone permission denied. Please allow microphone access and try again.'));
        } else if (error.name === 'NotFoundError') {
          this.options.onError?.(new Error('No microphone found. Please check your audio devices.'));
        } else if (error.message.includes('API key')) {
          this.options.onError?.(new Error('Voice recognition service not configured. Please contact support.'));
        } else {
          this.options.onError?.(error);
        }
      } else {
        this.options.onError?.(new Error('Failed to start voice input. Please try again.'));
      }
      
      // Cleanup on error
      await this.cleanup();
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
          this.hasReceivedTranscript = true; // Mark that we've received a transcript
          this.resetSilenceTimer();
          this.startSilenceTimer(); // Start timer after receiving transcript
          
          // Notify callback
          this.options.onTranscript?.(transcript, isFinal);
        } else if (isFinal) {
          console.log('⚠️ Final result with empty transcript');
        }
      }
      
      // Handle voice activity detection
      if (message.type === 'SpeechStarted') {
        console.log('🎤 Speech detected');
        // Only reset timer if we haven't received transcripts yet
        if (!this.hasReceivedTranscript) {
          this.resetSilenceTimer();
        }
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
   * Start silence detection timer - only after receiving transcripts
   */
  private startSilenceTimer(): void {
    // Don't start timer if we haven't received any transcripts yet
    if (!this.hasReceivedTranscript) {
      return;
    }
    
    this.resetSilenceTimer();
    
    this.silenceTimer = setTimeout(() => {
      const timeSinceLastTranscript = Date.now() - this.lastTranscriptTime;
      
      // Only trigger silence detection if we've received transcripts and enough time has passed
      if (timeSinceLastTranscript >= this.silenceThreshold && this.isRecording && this.hasReceivedTranscript) {
        console.log(`🔇 Silence detected after ${timeSinceLastTranscript}ms - auto-stopping recording`);
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