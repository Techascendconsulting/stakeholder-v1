import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

// Environment variables (Vite-style)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
const DEFAULT_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined

// ElevenLabs client (lazy)
let client: ElevenLabsClient | null = null

function getClient(): ElevenLabsClient {
  if (!client) {
    client = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY || '' })
  }
  return client!
}

export function isConfigured(): boolean {
  return Boolean(ELEVENLABS_API_KEY)
}

// Force fallback to env voice unless explicit voiceId is provided
export function resolveVoiceId(_: string = '', explicitVoiceId?: string): string | undefined {
  return (explicitVoiceId && explicitVoiceId.trim()) || DEFAULT_VOICE_ID
}

// Expose a single function speak(text) that returns MP3 bytes
export async function speak(text: string, options?: { stakeholderName?: string; voiceId?: string }): Promise<any> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured. Please set VITE_ELEVENLABS_API_KEY.')
  }
  const voiceId = resolveVoiceId('', options?.voiceId)
  if (!voiceId) {
    throw new Error('No ElevenLabs voice ID configured. Set VITE_ELEVENLABS_VOICE_ID or provide a voiceId.')
  }

  // Browser-safe: use REST API directly for correct audio bytes
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true
        },
        output_format: 'mp3_44100_128'
      })
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`ElevenLabs API error ${res.status}: ${errText}`)
    }

    const arrayBuffer = await res.arrayBuffer()
    return arrayBuffer
  }

  // Fallback (non-browser): use SDK
  const c = getClient()
  const audio = await c.textToSpeech.convert(voiceId, {
    text,
    modelId: 'eleven_flash_v2_5',
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.8,
      style: 0.3,
      useSpeakerBoost: true,
    },
    outputFormat: 'mp3_44100_128',
  })
  return audio
}

export function bufferToMp3Blob(buffer: ArrayBuffer | Uint8Array): Blob {
  return new Blob([buffer], { type: 'audio/mpeg' })
}

export function createAudioUrlFromBuffer(buffer: ArrayBuffer | Uint8Array): string {
  const blob = bufferToMp3Blob(buffer)
  return URL.createObjectURL(blob)
}

export async function synthesizeToBlob(text: string, options?: { voiceId?: string }): Promise<Blob> {
  const buffer = await speak(text, { voiceId: options?.voiceId })
  const blob = bufferToMp3Blob(buffer)
  return blob
}

export async function playBlob(audioBlob: Blob): Promise<void> {
  // Validate content quickly: MP3 should start with 'ID3' or 0xFF (frame sync)
  try {
    const head = await audioBlob.slice(0, 3).arrayBuffer()
    const bytes = new Uint8Array(head)
    const isLikelyMp3 = (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) || bytes[0] === 0xff
    if (!isLikelyMp3) {
      const txt = await audioBlob.text().catch(() => '')
      if (txt) throw new Error(`ElevenLabs non-audio response: ${txt}`)
    }
  } catch (e) {
    // If validation fails, continue to try playback which will error with a clear message
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(audioBlob)
    const audio = new Audio(url)
    audio.onended = () => { URL.revokeObjectURL(url); resolve() }
    audio.onerror = () => {
      console.error('Audio decode error', (audio as any).error)
      URL.revokeObjectURL(url)
      reject(new Error('Audio playback failed'))
    }
    audio.play().catch(err => { URL.revokeObjectURL(url); reject(err) })
  })
}

export async function speakAndPlay(text: string, options?: { voiceId?: string }): Promise<void> {
  const blob = await synthesizeToBlob(text, options)
  await playBlob(blob)
}