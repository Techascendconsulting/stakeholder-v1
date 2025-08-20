// Environment variables (Vite-style)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
const DEFAULT_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined
const VOICE_ID_AISHA = import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA as string | undefined
const VOICE_ID_JESS = import.meta.env.VITE_ELEVENLABS_VOICE_ID_JESS as string | undefined
const VOICE_ID_DAVID = import.meta.env.VITE_ELEVENLABS_VOICE_ID_DAVID as string | undefined
const VOICE_ID_JAMES = import.meta.env.VITE_ELEVENLABS_VOICE_ID_JAMES as string | undefined
const VOICE_ID_EMILY = import.meta.env.VITE_ELEVENLABS_VOICE_ID_EMILY as string | undefined
const ENABLE_ELEVENLABS = String(import.meta.env.VITE_ENABLE_ELEVENLABS || '').toLowerCase() === 'true'

export function isConfigured(): boolean {
  return Boolean(ENABLE_ELEVENLABS && ELEVENLABS_API_KEY)
}

// Resolve voice id by explicit option, stakeholderName mapping, then fallback
export function resolveVoiceId(stakeholderName: string = '', explicitVoiceId?: string): string | undefined {
  if (explicitVoiceId && explicitVoiceId.trim()) return explicitVoiceId
  const key = stakeholderName.toLowerCase().split(' ')[0]
  if ((key === 'jess' || key === 'jessica') && (VOICE_ID_JESS || VOICE_ID_AISHA)) return VOICE_ID_JESS || VOICE_ID_AISHA
  if (key === 'aisha' && (VOICE_ID_AISHA || VOICE_ID_JESS)) return VOICE_ID_AISHA || VOICE_ID_JESS
  if (key === 'david' && VOICE_ID_DAVID) return VOICE_ID_DAVID
  if (key === 'james' && VOICE_ID_JAMES) return VOICE_ID_JAMES
  if (key === 'emily' && VOICE_ID_EMILY) return VOICE_ID_EMILY
  return DEFAULT_VOICE_ID
}

// Helper for external debug
export function getResolvedVoiceIdFor(stakeholderName?: string, explicitVoiceId?: string): string | undefined {
  return resolveVoiceId(stakeholderName || '', explicitVoiceId)
}

export function bufferToMp3Blob(buffer: ArrayBuffer | Uint8Array): Blob {
  return new Blob([buffer], { type: 'audio/mpeg' })
}

export function createAudioUrlFromBuffer(buffer: ArrayBuffer | Uint8Array): string {
  const blob = bufferToMp3Blob(buffer)
  return URL.createObjectURL(blob)
}

// ElevenLabs API call (non-streaming) with defensive guards
export async function synthesizeToBlob(text: string, options?: { voiceId?: string; stakeholderName?: string }): Promise<Blob> {
  if (!isConfigured()) {
    return Promise.reject(new Error('ElevenLabs TTS is disabled'))
  }
  if (!ELEVENLABS_API_KEY) {
    return Promise.reject(new Error('ElevenLabs API key not configured'))
  }

  const voiceId = resolveVoiceId(options?.stakeholderName || '', options?.voiceId)
  if (!voiceId) {
    return Promise.reject(new Error('No ElevenLabs voice configured'))
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}` , {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
      })
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`ElevenLabs TTS request failed (${response.status}): ${errorText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return bufferToMp3Blob(arrayBuffer)
  } catch (error: any) {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
}

// Track active audio elements to allow global interruption
const activeAudios = new Set<HTMLAudioElement>()
const audioUrlMap = new WeakMap<HTMLAudioElement, string>()

export async function playBlob(audioBlob: Blob): Promise<void> {
  if (!audioBlob) return
  const url = URL.createObjectURL(audioBlob)
  const audio = new Audio(url)
  registerExternalAudio(audio, url)
  await audio.play().catch(() => {})
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

export async function speak(text: string, options?: { stakeholderName?: string; voiceId?: string }): Promise<ArrayBuffer> {
  const blob = await synthesizeToBlob(text, options)
  return blob.arrayBuffer()
}

export async function speakAndPlay(text: string, options?: { voiceId?: string; stakeholderName?: string }): Promise<void> {
  const blob = await synthesizeToBlob(text, options)
  await playBlob(blob)
}