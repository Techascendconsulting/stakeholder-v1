// Import OpenAI only if available
let OpenAI: any = null
try {
  OpenAI = (await import('openai')).default
} catch (error) {
  console.warn('OpenAI package not available:', error)
}

// Initialize OpenAI client safely
const createOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  const hasValidApiKey = apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0
  
  if (!OpenAI || !hasValidApiKey) {
    console.warn('OpenAI not configured. Whisper transcription will not be available.')
    return null
  }
  
  return new OpenAI({
    apiKey: apiKey.trim(),
    dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
  })
}

const openai = createOpenAIClient()

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI not configured. Please add VITE_OPENAI_API_KEY to your environment variables.')
  }
  
  try {
    // Convert blob to File object for OpenAI API
    const audioFile = new File([audioBlob], 'recording.webm', {
      type: audioBlob.type
    })

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Optional: specify language for better accuracy
      response_format: 'text',
      temperature: 0.2 // Lower temperature for more consistent transcription
    })

    return transcription.trim()
  } catch (error) {
    console.error('Whisper transcription error:', error)
    
    if (error instanceof Error) {
      // Handle specific OpenAI API errors
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.')
      } else if (error.message.includes('quota')) {
        throw new Error('OpenAI API quota exceeded. Please check your usage limits.')
      } else if (error.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection and try again.')
      } else {
        throw new Error(`Transcription failed: ${error.message}`)
      }
    } else {
      throw new Error('Unknown transcription error occurred.')
    }
  }
}

// Helper function to check if audio recording is supported
export function isAudioRecordingSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)
}

// Helper function to check if Whisper is available
export function isWhisperAvailable(): boolean {
  return !!openai
}

// Helper function to get supported audio formats
export function getSupportedAudioFormat(): string {
  if (typeof MediaRecorder === 'undefined') {
    return 'audio/webm' // Fallback
  }
  
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus'
  } else if (MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm'
  } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
    return 'audio/mp4'
  } else {
    return 'audio/webm' // Fallback
  }
}