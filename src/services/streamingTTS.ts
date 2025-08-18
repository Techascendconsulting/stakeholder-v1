/**
 * Streaming Text-to-Speech Service
 * Converts text chunks to audio in real-time and plays them immediately
 */

import { synthesizeToBlob } from './elevenLabsTTS';

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
    console.log(`🎤 Streaming TTS disabled (transcript-only mode) for ${stakeholderName}`);
    
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

    // Audio generation disabled
    return;
  }

  /**
   * Convert text chunk to audio and add to play queue
   */
  private async convertChunkToAudio(_sessionId: string, _chunk: StreamingChunk): Promise<void> { return; }

  /**
   * Add audio to queue in correct order
   */
  private addToAudioQueue(_sessionId: string, _audio: HTMLAudioElement, _order: number): void { return; }

  /**
   * Play next audio in queue
   */
  private playNextInQueue(_sessionId: string): void { return; }

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