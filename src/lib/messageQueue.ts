// MessageQueue.ts - Handles parsing and queuing of multi-speaker responses
import { Stakeholder } from '../../types'
import { audioOrchestrator, AudioMessage } from './AudioOrchestrator'

export interface QueuedMessage {
  id: string
  content: string
  speakerId: string
  stakeholderName: string
  stakeholderRole: string
  timestamp: string
  isFromMultiSpeaker: boolean
  originalMessageId?: string
}

class MessageQueue {
  private messageQueue: QueuedMessage[] = []
  private isProcessing = false
  private messageCallbacks: ((message: QueuedMessage) => void)[] = []

  // Subscribe to new messages being processed
  public onMessageProcessed(callback: (message: QueuedMessage) => void): void {
    this.messageCallbacks.push(callback)
  }

  // Unsubscribe from message processing
  public offMessageProcessed(callback: (message: QueuedMessage) => void): void {
    const index = this.messageCallbacks.indexOf(callback)
    if (index > -1) {
      this.messageCallbacks.splice(index, 1)
    }
  }

  // Notify subscribers when a message is processed
  private notifyMessageProcessed(message: QueuedMessage): void {
    this.messageCallbacks.forEach(callback => callback(message))
  }

  // Parse and queue a response from the AI
  public async parseAndQueueResponse(
    aiResponse: {
      id: string
      content: string
      speaker: string
      stakeholderName: string
      stakeholderRole: string
      timestamp: string
    },
    allStakeholders: Stakeholder[],
    autoPlayAudio: boolean = true
  ): Promise<QueuedMessage[]> {
    const messages: QueuedMessage[] = []

    // Check if this is a multi-speaker response
    if (aiResponse.content.includes('[NEXT_SPEAKER]')) {
      // Parse multi-speaker response
      const segments = aiResponse.content.split('[NEXT_SPEAKER]')
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i].trim()
        if (!segment) continue

        // Extract speaker name and content from format "Speaker Name: Content"
        const speakerMatch = segment.match(/^([^:]+):\s*(.+)$/s)
        if (speakerMatch) {
          const speakerName = speakerMatch[1].trim()
          const content = speakerMatch[2].trim()

          // Find the stakeholder by name
          const stakeholder = allStakeholders.find(s => 
            s.name.toLowerCase() === speakerName.toLowerCase()
          )

          if (stakeholder) {
            const queuedMessage: QueuedMessage = {
              id: `${aiResponse.id}-segment-${i}`,
              content: content,
              speakerId: stakeholder.id,
              stakeholderName: stakeholder.name,
              stakeholderRole: stakeholder.role,
              timestamp: new Date().toISOString(),
              isFromMultiSpeaker: true,
              originalMessageId: aiResponse.id
            }

            messages.push(queuedMessage)
            this.messageQueue.push(queuedMessage)
          } else {
            console.warn(`Could not find stakeholder with name: ${speakerName}`)
          }
        } else {
          console.warn(`Could not parse speaker segment: ${segment}`)
        }
      }
    } else {
      // Single speaker response
      const stakeholder = allStakeholders.find(s => s.id === aiResponse.speaker)
      
      if (stakeholder && aiResponse.content.trim()) {
        const queuedMessage: QueuedMessage = {
          id: aiResponse.id,
          content: aiResponse.content,
          speakerId: aiResponse.speaker,
          stakeholderName: aiResponse.stakeholderName,
          stakeholderRole: aiResponse.stakeholderRole,
          timestamp: aiResponse.timestamp,
          isFromMultiSpeaker: false
        }

        messages.push(queuedMessage)
        this.messageQueue.push(queuedMessage)
      }
    }

    // Start processing the queue if not already processing
    if (autoPlayAudio && !this.isProcessing && this.messageQueue.length > 0) {
      this.processQueue(allStakeholders)
    }

    return messages
  }

  // Process the message queue sequentially
  private async processQueue(allStakeholders: Stakeholder[]): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!
      
      // Find the stakeholder for this message
      const stakeholder = allStakeholders.find(s => s.id === message.speakerId)
      
      if (stakeholder) {
        // Notify UI that this message is being processed
        this.notifyMessageProcessed(message)

        // Create audio message for the orchestrator
        const audioMessage: AudioMessage = {
          id: message.id,
          content: message.content,
          speakerId: message.speakerId,
          stakeholderName: message.stakeholderName
        }

        // Queue the audio and wait for it to complete
        await audioOrchestrator.queueMessage(audioMessage, stakeholder, true)

        // Wait for the audio to finish playing before proceeding to next message
        await this.waitForAudioCompletion()
      }
    }

    this.isProcessing = false
  }

  // Wait for current audio to finish playing
  private async waitForAudioCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const checkAudioState = () => {
        const state = audioOrchestrator.getState()
        
        if (!state.isPlaying && !state.isPaused && state.currentMessageId === null) {
          // Audio has finished
          resolve()
        } else {
          // Check again in 100ms
          setTimeout(checkAudioState, 100)
        }
      }

      // Start checking immediately
      checkAudioState()
    })
  }

  // Manually start processing the queue (useful for resuming after pause)
  public async startProcessing(allStakeholders: Stakeholder[]): Promise<void> {
    if (!this.isProcessing && this.messageQueue.length > 0) {
      this.processQueue(allStakeholders)
    }
  }

  // Pause queue processing
  public pauseProcessing(): void {
    this.isProcessing = false
    audioOrchestrator.pause()
  }

  // Resume queue processing
  public resumeProcessing(allStakeholders: Stakeholder[]): void {
    if (audioOrchestrator.isPaused()) {
      audioOrchestrator.resume()
    } else {
      this.startProcessing(allStakeholders)
    }
  }

  // Stop processing and clear queue
  public stopProcessing(): void {
    this.messageQueue = []
    this.isProcessing = false
    audioOrchestrator.stop()
  }

  // Skip current message and proceed to next
  public skipCurrent(allStakeholders: Stakeholder[]): void {
    audioOrchestrator.skipToNext()
    // Processing will continue automatically when current audio ends
  }

  // Get current queue length
  public getQueueLength(): number {
    return this.messageQueue.length
  }

  // Check if queue is currently processing
  public isProcessingQueue(): boolean {
    return this.isProcessing
  }

  // Get all queued messages
  public getQueuedMessages(): QueuedMessage[] {
    return [...this.messageQueue]
  }

  // Clear the queue without stopping current playback
  public clearQueue(): void {
    this.messageQueue = []
  }

  // Add a message directly to the queue (useful for system messages)
  public addMessage(
    message: QueuedMessage,
    allStakeholders: Stakeholder[],
    autoProcess: boolean = true
  ): void {
    this.messageQueue.push(message)
    
    if (autoProcess && !this.isProcessing) {
      this.processQueue(allStakeholders)
    }
  }
}

// Export singleton instance
export const messageQueue = new MessageQueue()
