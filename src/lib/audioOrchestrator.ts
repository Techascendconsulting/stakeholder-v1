// AudioOrchestrator.ts - Manages Murf TTS integration and audio playback
import { Stakeholder } from '../../types'
import { murfTTS } from '../services/murfTTS'

export interface AudioMessage {
  id: string
  content: string
  speakerId: string
  stakeholderName: string
  audioUrl?: string
}

export interface AudioPlaybackState {
  isPlaying: boolean
  isPaused: boolean
  currentMessageId: string | null
  queueLength: number
  currentPosition: number
  duration: number
}

class AudioOrchestrator {
  private audioQueue: AudioMessage[] = []
  private currentAudio: HTMLAudioElement | null = null
  private isProcessingQueue = false
  private playbackState: AudioPlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentMessageId: null,
    queueLength: 0,
    currentPosition: 0,
    duration: 0
  }
  private stateChangeCallbacks: ((state: AudioPlaybackState) => void)[] = []
  private murfApiKey: string

  constructor() {
    this.murfApiKey = import.meta.env.VITE_MURF_API_KEY || ''
  }

  // Subscribe to playback state changes
  public onStateChange(callback: (state: AudioPlaybackState) => void): void {
    this.stateChangeCallbacks.push(callback)
  }

  // Unsubscribe from state changes
  public offStateChange(callback: (state: AudioPlaybackState) => void): void {
    const index = this.stateChangeCallbacks.indexOf(callback)
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1)
    }
  }

  // Notify all subscribers of state changes
  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach(callback => callback({ ...this.playbackState }))
  }

  // Add a message to the audio queue
  public async queueMessage(
    message: AudioMessage, 
    stakeholder: Stakeholder,
    autoPlay: boolean = true
  ): Promise<void> {
    try {
              // Generate audio using Murf TTS
        const audioUrl = await this.generateAudio(message.content, stakeholder.name)
      
      const audioMessage: AudioMessage = {
        ...message,
        audioUrl
      }

      this.audioQueue.push(audioMessage)
      this.playbackState.queueLength = this.audioQueue.length
      this.notifyStateChange()

      if (autoPlay && !this.isProcessingQueue) {
        this.processQueue()
      }
    } catch (error) {
      console.error('Error queueing message for audio:', error)
    }
  }

  // Generate audio using Murf TTS
  private async generateAudio(text: string, stakeholderName: string): Promise<string> {
    if (!this.murfApiKey) {
      throw new Error('Murf TTS configuration missing')
    }

    // Use Murf TTS to generate audio
    const audioBlob = await murfTTS.synthesizeSpeech(text, stakeholderName)
    
    if (!audioBlob) {
      throw new Error('Murf TTS request failed')
    }

    return URL.createObjectURL(audioBlob)
  }

  // Process the audio queue
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.audioQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.audioQueue.length > 0) {
      const message = this.audioQueue.shift()!
      
      if (message.audioUrl) {
        await this.playAudio(message)
      }

      this.playbackState.queueLength = this.audioQueue.length
      this.notifyStateChange()
    }

    this.isProcessingQueue = false
    this.playbackState.isPlaying = false
    this.playbackState.currentMessageId = null
    this.notifyStateChange()
  }

  // Play a single audio message
  private async playAudio(message: AudioMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!message.audioUrl) {
        reject(new Error('No audio URL provided'))
        return
      }

      this.currentAudio = new Audio(message.audioUrl)
      this.playbackState.currentMessageId = message.id
      this.playbackState.isPlaying = true
      this.playbackState.isPaused = false
      this.notifyStateChange()

      this.currentAudio.addEventListener('loadedmetadata', () => {
        if (this.currentAudio) {
          this.playbackState.duration = this.currentAudio.duration
          this.notifyStateChange()
        }
      })

      this.currentAudio.addEventListener('timeupdate', () => {
        if (this.currentAudio) {
          this.playbackState.currentPosition = this.currentAudio.currentTime
          this.notifyStateChange()
        }
      })

      this.currentAudio.addEventListener('ended', () => {
        this.playbackState.isPlaying = false
        this.playbackState.currentPosition = 0
        this.playbackState.duration = 0
        this.notifyStateChange()
        resolve()
      })

      this.currentAudio.addEventListener('error', (error) => {
        console.error('Audio playback error:', error)
        this.playbackState.isPlaying = false
        this.notifyStateChange()
        reject(error)
      })

      this.currentAudio.play().catch(error => {
        console.error('Failed to play audio:', error)
        this.playbackState.isPlaying = false
        this.notifyStateChange()
        reject(error)
      })
    })
  }

  // Pause current audio playback
  public pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause()
      this.playbackState.isPaused = true
      this.playbackState.isPlaying = false
      this.notifyStateChange()
    }
  }

  // Resume audio playback
  public resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().then(() => {
        this.playbackState.isPaused = false
        this.playbackState.isPlaying = true
        this.notifyStateChange()
      }).catch(error => {
        console.error('Failed to resume audio:', error)
      })
    }
  }

  // Stop current audio and clear queue
  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
    }

    this.audioQueue = []
    this.isProcessingQueue = false
    this.playbackState = {
      isPlaying: false,
      isPaused: false,
      currentMessageId: null,
      queueLength: 0,
      currentPosition: 0,
      duration: 0
    }
    this.notifyStateChange()
  }

  // Skip to next message in queue
  public skipToNext(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.dispatchEvent(new Event('ended'))
    }
  }

  // Get current playback state
  public getState(): AudioPlaybackState {
    return { ...this.playbackState }
  }

  // Check if audio is currently playing
  public isPlaying(): boolean {
    return this.playbackState.isPlaying
  }

  // Check if audio is paused
  public isPaused(): boolean {
    return this.playbackState.isPaused
  }

  // Get queue length
  public getQueueLength(): number {
    return this.audioQueue.length
  }

  // Clear the audio queue without stopping current playback
  public clearQueue(): void {
    this.audioQueue = []
    this.playbackState.queueLength = 0
    this.notifyStateChange()
  }
}

// Export singleton instance
export const audioOrchestrator = new AudioOrchestrator()
