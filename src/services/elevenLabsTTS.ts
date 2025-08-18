import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

// Environment variables (Vite-style)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
const DEFAULT_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined
const VOICE_ID_AISHA = import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA as string | undefined
const VOICE_ID_JESS = import.meta.env.VITE_ELEVENLABS_VOICE_ID_JESS as string | undefined
const VOICE_ID_DAVID = import.meta.env.VITE_ELEVENLABS_VOICE_ID_DAVID as string | undefined
const VOICE_ID_JAMES = import.meta.env.VITE_ELEVENLABS_VOICE_ID_JAMES as string | undefined
const VOICE_ID_EMILY = import.meta.env.VITE_ELEVENLABS_VOICE_ID_EMILY as string | undefined

// ElevenLabs client (lazy)
let client: ElevenLabsClient | null = null

function getClient(): ElevenLabsClient {
  if (!client) {
    client = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY || '' })
  }
  return client!
}

export function isConfigured(): boolean {
  return false
}

// Resolve voice id by explicit option, stakeholderName mapping, then fallback
export function resolveVoiceId(stakeholderName: string = '', explicitVoiceId?: string): string | undefined {
  if (explicitVoiceId && explicitVoiceId.trim()) return explicitVoiceId
  const key = stakeholderName.toLowerCase().split(' ')[0]
  if ((key === 'jess' || key === 'jessica') && (VOICE_ID_JESS || VOICE_ID_AISHA)) return VOICE_ID_JESS || VOICE_ID_AISHA
  if (key === 'aisha' && (VOICE_ID_AISHA || VOICE_ID_JESS)) return VOICE_ID_AISHA || VOICE_ID_JESS
  if (key === 'david' && VOICE_ID_DAVID) return VOICE_ID_DAVID
  if (key === 'james' && (VOICE_ID_JAMES || 'tviRhmjyL6tfcfzX7J6t')) return VOICE_ID_JAMES || 'tviRhmjyL6tfcfzX7J6t'
  if (key === 'emily' && (VOICE_ID_EMILY || 'rfkTsdZrVWEVhDycUYn9')) return VOICE_ID_EMILY || 'rfkTsdZrVWEVhDycUYn9'
  return DEFAULT_VOICE_ID
}

// Helper for external debug
export function getResolvedVoiceIdFor(stakeholderName?: string, explicitVoiceId?: string): string | undefined {
  return resolveVoiceId(stakeholderName || '', explicitVoiceId)
}

// Expose a single function speak(text) that returns MP3 bytes
export async function speak(_text: string, _options?: { stakeholderName?: string; voiceId?: string }): Promise<any> {
  throw new Error('ElevenLabs TTS is disabled in transcript-only mode')
}

export function bufferToMp3Blob(buffer: ArrayBuffer | Uint8Array): Blob {
  return new Blob([buffer], { type: 'audio/mpeg' })
}

export function createAudioUrlFromBuffer(buffer: ArrayBuffer | Uint8Array): string {
  const blob = bufferToMp3Blob(buffer)
  return URL.createObjectURL(blob)
}

export async function synthesizeToBlob(_text: string, _options?: { voiceId?: string; stakeholderName?: string }): Promise<Blob> {
  return Promise.reject(new Error('ElevenLabs TTS is disabled in transcript-only mode'))
}

// Track active audio elements to allow global interruption
const activeAudios = new Set<HTMLAudioElement>()
const audioUrlMap = new WeakMap<HTMLAudioElement, string>()

export async function playBlob(_audioBlob: Blob): Promise<void> {
  return Promise.resolve()
}

export function stopAllAudio(): void {
  for (const audio of Array.from(activeAudios)) {
    try {
      audio.pause()
      audio.currentTime = 0
      const url = audioUrlMap.get(audio)
      if (url) URL.revokeObjectURL(url)
    } catch {}
    activeAudios.delete(audio)
  }
}

// Allow other modules to register externally created audio elements
export function registerExternalAudio(audio: HTMLAudioElement, url?: string): void {
  try {
    activeAudios.add(audio)
    if (url) audioUrlMap.set(audio, url)
  } catch {}
}

export async function speakAndPlay(text: string, options?: { voiceId?: string; stakeholderName?: string }): Promise<void> {
  const blob = await synthesizeToBlob(text, options)
  await playBlob(blob)
}