import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

// Environment variables (Vite-style)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
const DEFAULT_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined

// Stakeholder-specific voice mapping
// Aisha -> Leoni Vergara, David -> Mark, James -> Jonathan
const STAKEHOLDER_VOICE_MAP: Record<string, string> = {
  // provided voice ids
  'aisha': 'pBZVCk298iJlHAcHQwLr',
  'david': 'UgBBYS2sOqTuMpoF3BR0',
  'james': 'c6SfcYrb2t09NHXiT80T',
}

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

export function resolveVoiceId(stakeholderName?: string, explicitVoiceId?: string): string | undefined {
  if (explicitVoiceId && explicitVoiceId.trim()) return explicitVoiceId
  if (stakeholderName) {
    const key = stakeholderName.toLowerCase().split(' ')[0]
    if (STAKEHOLDER_VOICE_MAP[key]) return STAKEHOLDER_VOICE_MAP[key]
  }
  return DEFAULT_VOICE_ID
}

// Expose a single function speak(text) that returns an MP3 buffer
export async function speak(text: string, options?: { stakeholderName?: string; voiceId?: string }): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured. Please set VITE_ELEVENLABS_API_KEY.')
  }
  const voiceId = resolveVoiceId(options?.stakeholderName, options?.voiceId)
  if (!voiceId) {
    throw new Error('No ElevenLabs voice ID configured. Set VITE_ELEVENLABS_VOICE_ID or provide a voiceId.')
  }

  const c = getClient()
  // Use low-latency, realistic voice with MP3 output
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

// Convenience helper: convert Buffer to Blob for browser playback
export function bufferToMp3Blob(buffer: Buffer): Blob {
  return new Blob([buffer], { type: 'audio/mpeg' })
}

export function createAudioUrlFromBuffer(buffer: Buffer): string {
  const blob = bufferToMp3Blob(buffer)
  return URL.createObjectURL(blob)
}