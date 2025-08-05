/**
 * Streaming Text-to-Speech Service
 * Converts text chunks to audio in real-time and plays them immediately
 */

import { murfTTS } from './murfTTS';

interface StreamingChunk {
  text: string;
  audio?: Blob;
  timestamp: number;
  order: number;
}

interface StreamingSession {
  stakeholderName: string;
  chunks: StreamingChunk[];
  currentAudio: HTMLAudioElement | null;
  audioQueue: HTMLAudioElement[];
  isPlaying: boolean;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

class StreamingTTSService {
  private static instance: StreamingTTSService;
  private sessions: Map<string, StreamingSession> = new Map();

  private constructor() {}

  public static getInstance(): StreamingTTSService {
    if (!StreamingTTSService.instance) {
      StreamingTTSService.instance = new StreamingTTSService();
    }
    return StreamingTTSService.instance;
  }

  /**
   * Start a new streaming TTS session
   */
  public startStreamingSession(
    sessionId: string,
    stakeholderName: string,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): void {
    console.log(`🎤 Starting streaming TTS session for ${stakeholderName}`);
    
    // Stop any existing session
    this.stopStreamingSession(sessionId);
    
    const session: StreamingSession = {
      stakeholderName,
      chunks: [],
      currentAudio: null,
      audioQueue: [],
      isPlaying: false,
      onComplete,
      onError
    };
    
    this.sessions.set(sessionId, session);
  }

  /**
   * Add a text chunk to be converted to speech and played
   */
  public async addTextChunk(sessionId: string, text: string, order: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`❌ No streaming session found for ${sessionId}`);
      return;
    }

    console.log(`📝 Adding text chunk ${order}: "${text}"`);
    
    const chunk: StreamingChunk = {
      text,
      timestamp: Date.now(),
      order
    };

    session.chunks.push(chunk);

    // Convert to audio immediately (don't wait)
    this.convertChunkToAudio(sessionId, chunk);
  }

  /**
   * Convert text chunk to audio and add to play queue
   */
  private async convertChunkToAudio(sessionId: string, chunk: StreamingChunk): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    try {
      console.log(`🔊 Converting to audio: "${chunk.text}"`);
      
      // Use Murf TTS to convert chunk to audio
      const audioBlob = await murfTTS.synthesizeSpeech(chunk.text, session.stakeholderName, false);
      
      if (audioBlob) {
        chunk.audio = audioBlob;
        console.log(`✅ Audio ready for chunk ${chunk.order}: ${audioBlob.size} bytes`);
        
        // Create audio element and add to queue
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Set up audio event handlers
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.playNextInQueue(sessionId);
        };
        
        audio.onerror = (error) => {
          console.error(`❌ Audio playback error for chunk ${chunk.order}:`, error);
          URL.revokeObjectURL(audioUrl);
          this.playNextInQueue(sessionId);
        };
        
        // Add to queue in correct order
        this.addToAudioQueue(sessionId, audio, chunk.order);
        
        // Start playing if not already playing
        if (!session.isPlaying) {
          this.playNextInQueue(sessionId);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error converting chunk to audio:`, error);
      session.onError?.(error as Error);
    }
  }

  /**
   * Add audio to queue in correct order
   */
  private addToAudioQueue(sessionId: string, audio: HTMLAudioElement, order: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Insert audio in correct order
    let inserted = false;
    for (let i = 0; i < session.audioQueue.length; i++) {
      const existingOrder = (session.audioQueue[i] as any).order || 0;
      if (order < existingOrder) {
        session.audioQueue.splice(i, 0, audio);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      session.audioQueue.push(audio);
    }
    
    // Store order on audio element for reference
    (audio as any).order = order;
    
    console.log(`📋 Added audio to queue at position ${order}. Queue length: ${session.audioQueue.length}`);
  }

  /**
   * Play next audio in queue
   */
  private playNextInQueue(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Clear current audio
    session.currentAudio = null;
    session.isPlaying = false;

    // Get next audio from queue
    const nextAudio = session.audioQueue.shift();
    if (!nextAudio) {
      console.log(`🏁 Audio queue empty for ${session.stakeholderName}`);
      return;
    }

    console.log(`▶️ Playing audio chunk ${(nextAudio as any).order} for ${session.stakeholderName}`);
    
    session.currentAudio = nextAudio;
    session.isPlaying = true;

    // Play the audio
    nextAudio.play().catch(error => {
      console.error(`❌ Failed to play audio chunk:`, error);
      session.onError?.(error);
      this.playNextInQueue(sessionId); // Try next chunk
    });
  }

  /**
   * Mark streaming session as complete (no more chunks coming)
   */
  public completeStreamingSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`✅ Streaming session completed for ${session.stakeholderName}`);
    
    // Wait for all audio to finish playing
    this.waitForQueueToComplete(sessionId);
  }

  /**
   * Wait for all audio in queue to finish playing
   */
  private waitForQueueToComplete(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const checkComplete = () => {
      if (session.audioQueue.length === 0 && !session.isPlaying) {
        console.log(`🎉 All audio completed for ${session.stakeholderName}`);
        session.onComplete?.();
        this.sessions.delete(sessionId);
      } else {
        // Check again in 100ms
        setTimeout(checkComplete, 100);
      }
    };

    checkComplete();
  }

  /**
   * Stop streaming session immediately
   */
  public stopStreamingSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`🛑 Stopping streaming session for ${session.stakeholderName}`);

    // Stop current audio
    if (session.currentAudio) {
      session.currentAudio.pause();
      session.currentAudio = null;
    }

    // Clear audio queue and revoke URLs
    session.audioQueue.forEach(audio => {
      audio.pause();
      if (audio.src) {
        URL.revokeObjectURL(audio.src);
      }
    });

    session.audioQueue = [];
    session.isPlaying = false;
    
    this.sessions.delete(sessionId);
  }

  /**
   * Get session status for debugging
   */
  public getSessionStatus(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      stakeholderName: session.stakeholderName,
      chunksReceived: session.chunks.length,
      chunksWithAudio: session.chunks.filter(c => c.audio).length,
      queueLength: session.audioQueue.length,
      isPlaying: session.isPlaying,
      currentChunk: session.currentAudio ? (session.currentAudio as any).order : null
    };
  }
}

export default StreamingTTSService;