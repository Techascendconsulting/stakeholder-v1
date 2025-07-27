// Azure Cognitive Services Text-to-Speech implementation
interface AzureTTSConfig {
  subscriptionKey: string
  region: string
  endpoint: string
}

interface VoiceConfig {
  name: string
  gender: 'Male' | 'Female'
  locale: string
  displayName: string
  description: string
}

// UK-accented voices for professional stakeholder responses
export const AZURE_VOICES: Record<string, VoiceConfig> = {
  'en-GB-RyanNeural': {
    name: 'en-GB-RyanNeural',
    gender: 'Male',
    locale: 'en-GB',
    displayName: 'Ryan (Male, UK)',
    description: 'Professional British male voice, ideal for senior executives'
  },
  'en-GB-LibbyNeural': {
    name: 'en-GB-LibbyNeural',
    gender: 'Female',
    locale: 'en-GB',
    displayName: 'Libby (Female, UK)',
    description: 'Professional British female voice, ideal for managers'
  },
  'en-GB-MaisieNeural': {
    name: 'en-GB-MaisieNeural',
    gender: 'Female',
    locale: 'en-GB',
    displayName: 'Maisie (Female, UK)',
    description: 'Warm British female voice, ideal for HR and customer service'
  },
  'en-GB-ThomasNeural': {
    name: 'en-GB-ThomasNeural',
    gender: 'Male',
    locale: 'en-GB',
    displayName: 'Thomas (Male, UK)',
    description: 'Authoritative British male voice, ideal for technical roles'
  },
  'en-GB-SoniaNeural': {
    name: 'en-GB-SoniaNeural',
    gender: 'Female',
    locale: 'en-GB',
    displayName: 'Sonia (Female, UK)',
    description: 'Professional mature British female voice, ideal for customer service'
  },
  'en-GB-AbbiNeural': {
    name: 'en-GB-AbbiNeural',
    gender: 'Female',
    locale: 'en-GB',
    displayName: 'Abbi (Female, UK)',
    description: 'Clear British female voice, ideal for compliance and risk'
  },
  'en-US-AlloyNeural': {
    name: 'en-US-AlloyNeural',
    gender: 'Male',
    locale: 'en-US',
    displayName: 'Alloy (Male, US)',
    description: 'Modern American male voice with clear articulation'
  }
}

// Default voice assignments based on stakeholder roles and gender
export const getDefaultVoiceForStakeholder = (role: string, preferredGender?: 'Male' | 'Female'): string => {
  const roleVoiceMap: Record<string, string> = {
    'Head of Operations': 'en-GB-RyanNeural',
    'Customer Service Manager': 'en-GB-SoniaNeural',
    'IT Systems Lead': 'en-US-AlloyNeural',
    'HR Business Partner': 'en-GB-LibbyNeural',
    'Compliance and Risk Manager': 'en-GB-AbbiNeural'
  }

  // Return role-specific voice or fallback based on gender preference
  if (roleVoiceMap[role]) {
    return roleVoiceMap[role]
  }

  // Fallback to gender-based selection
  if (preferredGender === 'Male') {
    return 'en-GB-RyanNeural'
  } else {
    return 'en-GB-LibbyNeural'
  }
}

class AzureTTSService {
  private config: AzureTTSConfig
  private audioCache: Map<string, Blob> = new Map()

  constructor() {
    const subscriptionKey = import.meta.env.VITE_AZURE_TTS_KEY
    const region = import.meta.env.VITE_AZURE_TTS_REGION || 'uksouth'

    if (!subscriptionKey) {
      console.warn('Azure TTS not configured. Please add VITE_AZURE_TTS_KEY to your environment variables.')
    }

    this.config = {
      subscriptionKey: subscriptionKey || '',
      region,
      endpoint: `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`
    }
  }

  private createSSML(text: string, voiceName: string): string {
    // Clean and escape text for SSML
    const cleanText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">
        <voice name="${voiceName}">
          <prosody rate="1.05" pitch="+2%" volume="+10%">
            ${cleanText}
          </prosody>
        </voice>
      </speak>
    `.trim()
  }

  private generateCacheKey(text: string, voiceName: string): string {
    // Create a simple hash for caching
    const content = `${text}-${voiceName}`
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  async synthesizeSpeech(
    text: string, 
    voiceName: string = 'en-GB-LibbyNeural',
    useCache: boolean = true
  ): Promise<Blob> {
    if (!this.config.subscriptionKey) {
      throw new Error('Azure TTS not configured. Please add VITE_AZURE_TTS_KEY to your environment variables.')
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(text, voiceName)
    if (useCache && this.audioCache.has(cacheKey)) {
      const cachedBlob = this.audioCache.get(cacheKey)!
      return cachedBlob
    }

    try {
      const ssml = this.createSSML(text, voiceName)

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'BA-Training-Platform'
        },
        body: ssml
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Azure TTS API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })

        if (response.status === 401) {
          throw new Error('Azure TTS authentication failed. Please check your subscription key.')
        } else if (response.status === 403) {
          throw new Error('Azure TTS access forbidden. Please check your subscription and region.')
        } else if (response.status === 429) {
          throw new Error('Azure TTS rate limit exceeded. Please try again later.')
        } else {
          throw new Error(`Azure TTS request failed: ${response.status} ${response.statusText}`)
        }
      }

      const audioBlob = await response.blob()

      // Validate that we received audio data
      if (audioBlob.size === 0) {
        throw new Error('Azure TTS returned empty audio data')
      }

      // Cache the result
      if (useCache) {
        this.audioCache.set(cacheKey, audioBlob)
      }

      return audioBlob

    } catch (error) {
      console.error('Azure TTS synthesis error:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.')
      }
      
      throw error
    }
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl)
          reject(new Error('Audio playback failed'))
        }

        audio.play().catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  isConfigured(): boolean {
    return !!this.config.subscriptionKey
  }

  getAvailableVoices(): VoiceConfig[] {
    return Object.values(AZURE_VOICES)
  }

  clearCache(): void {
    this.audioCache.clear()
  }

  getCacheSize(): number {
    return this.audioCache.size
  }
}

// Export singleton instance
export const azureTTS = new AzureTTSService()

// Helper function to check if Azure TTS is available
export function isAzureTTSAvailable(): boolean {
  return azureTTS.isConfigured()
}

// Helper function for fallback to browser TTS
export function playBrowserTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not supported'))
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    utterance.lang = 'en-GB'

    utterance.onend = () => resolve()
    utterance.onerror = (error) => reject(new Error('Browser TTS failed'))

    speechSynthesis.speak(utterance)
  })
}