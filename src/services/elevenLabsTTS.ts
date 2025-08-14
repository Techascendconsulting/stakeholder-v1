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

// Expose a single function speak(text) that returns an MP3 buffer
export async function speak(text: string, options?: { stakeholderName?: string; voiceId?: string }): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured. Please set VITE_ELEVENLABS_API_KEY.')
  }
  const voiceId = resolveVoiceId('', options?.voiceId)
  if (!voiceId) {
    throw new Error('No ElevenLabs voice ID configured. Set VITE_ELEVENLABS_VOICE_ID or provide a voiceId.')
  }

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

export function bufferToMp3Blob(buffer: Buffer): Blob {
  return new Blob([buffer], { type: 'audio/mpeg' })
}

export function createAudioUrlFromBuffer(buffer: Buffer): string {
  const blob = bufferToMp3Blob(buffer)
  return URL.createObjectURL(blob)
}

export async function synthesizeToBlob(text: string, options?: { voiceId?: string }): Promise<Blob> {
  const buffer = await speak(text, { voiceId: options?.voiceId })
  const blob = bufferToMp3Blob(buffer)
  return blob
}

export async function playBlob(audioBlob: Blob): Promise<void> {
  // Quick validation: small blobs are likely error bodies
  if (audioBlob.size < 1000 || (audioBlob as any).type && (audioBlob as any).type !== 'audio/mpeg') {
    try {
      const txt = await (audioBlob as any).text?.()
      if (txt) throw new Error(`ElevenLabs non-audio response: ${txt}`)
    } catch {}
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(audioBlob)
    const audio = new Audio(url)
    audio.onended = () => { URL.revokeObjectURL(url); resolve() }
    audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Audio playback failed')) }
    audio.play().catch(err => { URL.revokeObjectURL(url); reject(err) })
  })
}

export async function speakAndPlay(text: string, options?: { voiceId?: string }): Promise<void> {
  const blob = await synthesizeToBlob(text, options)
  await playBlob(blob)
}