// Environment variables (Vite-style)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
const DEFAULT_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined
const VOICE_ID_AISHA = import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA as string | undefined
const VOICE_ID_JESS = import.meta.env.VITE_ELEVENLABS_VOICE_ID_JESS as string | undefined
const VOICE_ID_DAVID = import.meta.env.VITE_ELEVENLABS_VOICE_ID_DAVID as string | undefined
const VOICE_ID_JAMES = import.meta.env.VITE_ELEVENLABS_VOICE_ID_JAMES as string | undefined
const VOICE_ID_EMILY = import.meta.env.VITE_ELEVENLABS_VOICE_ID_EMILY as string | undefined
const VOICE_ID_SRIKANTH = import.meta.env.VITE_ELEVENLABS_VOICE_ID_SRIKANTH as string | undefined
const VOICE_ID_BOLA = import.meta.env.VITE_ELEVENLABS_VOICE_ID_BOLA as string | undefined
const VOICE_ID_SARAH = import.meta.env.VITE_ELEVENLABS_VOICE_ID_SARAH as string | undefined
const VOICE_ID_LISA = import.meta.env.VITE_ELEVENLABS_VOICE_ID_LISA as string | undefined
const ENABLE_ELEVENLABS = String(import.meta.env.VITE_ENABLE_ELEVENLABS || '').toLowerCase() === 'true'

// Audio cache for frequently used phrases (in-memory fallback)
const audioCache = new Map<string, Blob>()

// Import persistent cache service
let persistentCache: any = null;
(async () => {
  try {
    const { audioCacheService } = await import('./audioCacheService');
    persistentCache = audioCacheService;
    await persistentCache.init();
    console.log('✅ ELEVENLABS: Persistent audio cache initialized');
  } catch (error) {
    console.warn('⚠️ ELEVENLABS: Failed to initialize persistent cache, using in-memory only:', error);
  }
})();

export function isConfigured(): boolean {
  const configured = Boolean(ENABLE_ELEVENLABS && ELEVENLABS_API_KEY)
  console.log("🔊 ELEVENLABS DEBUG:", {
    ENABLE_ELEVENLABS,
    hasApiKey: !!ELEVENLABS_API_KEY,
    apiKeyLength: ELEVENLABS_API_KEY?.length || 0,
    isConfigured: configured,
    voiceIds: {
      AISHA: VOICE_ID_AISHA,
      JESS: VOICE_ID_JESS,
      DAVID: VOICE_ID_DAVID,
      JAMES: VOICE_ID_JAMES,
      EMILY: VOICE_ID_EMILY,
      SRIKANTH: VOICE_ID_SRIKANTH,
      BOLA: VOICE_ID_BOLA,
      SARAH: VOICE_ID_SARAH,
      LISA: VOICE_ID_LISA,
      DEFAULT: DEFAULT_VOICE_ID
    }
  });
  return configured
}

// Resolve voice id by explicit option, stakeholderName mapping, then fallback
export function resolveVoiceId(stakeholderName: string = '', explicitVoiceId?: string): string | undefined {
  console.log(`🎤 VOICE RESOLUTION: Resolving voice for "${stakeholderName}" with explicit ID: "${explicitVoiceId}"`);
  
  if (explicitVoiceId && explicitVoiceId.trim()) {
    console.log(`🎤 VOICE RESOLUTION: Using explicit voice ID: ${explicitVoiceId}`);
    return explicitVoiceId
  }
  
  const key = stakeholderName.toLowerCase().split(' ')[0]
  console.log(`🎤 VOICE RESOLUTION: Extracted key: "${key}" from name: "${stakeholderName}"`);
  
  let resolvedVoiceId: string | undefined
  
  if ((key === 'jess' || key === 'jessica') && (VOICE_ID_JESS || VOICE_ID_AISHA)) {
    resolvedVoiceId = VOICE_ID_JESS || VOICE_ID_AISHA
    console.log(`🎤 VOICE RESOLUTION: Jess/Jessica -> ${resolvedVoiceId} (${resolvedVoiceId === VOICE_ID_JESS ? 'JESS' : 'AISHA'})`)
  } else if (key === 'aisha' && (VOICE_ID_AISHA || VOICE_ID_JESS)) {
    resolvedVoiceId = VOICE_ID_AISHA || VOICE_ID_JESS
    console.log(`🎤 VOICE RESOLUTION: Aisha -> ${resolvedVoiceId} (${resolvedVoiceId === VOICE_ID_AISHA ? 'AISHA' : 'JESS'})`)
  } else if (key === 'david' && VOICE_ID_DAVID) {
    resolvedVoiceId = VOICE_ID_DAVID
    console.log(`🎤 VOICE RESOLUTION: David -> ${resolvedVoiceId}`)
  } else if (key === 'james' && VOICE_ID_JAMES) {
    resolvedVoiceId = VOICE_ID_JAMES
    console.log(`🎤 VOICE RESOLUTION: James -> ${resolvedVoiceId}`)
  } else if (key === 'emily' && VOICE_ID_EMILY) {
    resolvedVoiceId = VOICE_ID_EMILY
    console.log(`🎤 VOICE RESOLUTION: Emily -> ${resolvedVoiceId}`)
  } else if (key === 'srikanth' && VOICE_ID_SRIKANTH) {
    resolvedVoiceId = VOICE_ID_SRIKANTH
    console.log(`🎤 VOICE RESOLUTION: Srikanth -> ${resolvedVoiceId}`)
  } else if (key === 'bola' && VOICE_ID_BOLA) {
    resolvedVoiceId = VOICE_ID_BOLA
    console.log(`🎤 VOICE RESOLUTION: Bola -> ${resolvedVoiceId}`)
  } else if (key === 'sarah' && VOICE_ID_SARAH) {
    resolvedVoiceId = VOICE_ID_SARAH
    console.log(`🎤 VOICE RESOLUTION: Sarah -> ${resolvedVoiceId}`)
  } else if (key === 'lisa' && VOICE_ID_LISA) {
    resolvedVoiceId = VOICE_ID_LISA
    console.log(`🎤 VOICE RESOLUTION: Lisa -> ${resolvedVoiceId}`)
  } else {
    resolvedVoiceId = DEFAULT_VOICE_ID
    console.log(`🎤 VOICE RESOLUTION: No specific match, using DEFAULT -> ${resolvedVoiceId}`)
  }
  
  if (!resolvedVoiceId) {
    console.warn(`⚠️ VOICE RESOLUTION: No voice ID found for stakeholder "${stakeholderName}"`)
  }
  
  return resolvedVoiceId
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

// Generate cache key for audio
function generateCacheKey(text: string, voiceId: string): string {
  return `${voiceId}:${text.toLowerCase().trim()}`
}

// ElevenLabs API call (non-streaming) with defensive guards and caching
export async function synthesizeToBlob(text: string, options?: { voiceId?: string; stakeholderName?: string }): Promise<Blob> {
  console.log(`🎤 SYNTHESIZE: Starting synthesis for text: "${text.substring(0, 50)}..."`)
  console.log(`🎤 SYNTHESIZE: Options:`, options)
  
  if (!isConfigured()) {
    console.error('❌ SYNTHESIZE: ElevenLabs TTS is disabled')
    return Promise.reject(new Error('ElevenLabs TTS is disabled'))
  }
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ SYNTHESIZE: ElevenLabs API key not configured')
    return Promise.reject(new Error('ElevenLabs API key not configured'))
  }

  const voiceId = resolveVoiceId(options?.stakeholderName || '', options?.voiceId)
  if (!voiceId) {
    console.error('❌ SYNTHESIZE: No ElevenLabs voice configured')
    return Promise.reject(new Error('No ElevenLabs voice configured'))
  }

  console.log(`🎤 SYNTHESIZE: Using voice ID: ${voiceId} for stakeholder: ${options?.stakeholderName || 'unknown'}`)

  // Check persistent cache first
  if (persistentCache) {
    try {
      const cachedAudio = await persistentCache.getAudio(text, voiceId, 'refinement');
      if (cachedAudio) {
        console.log(`🎤 SYNTHESIZE: Using persistent cached audio for "${text.substring(0, 30)}..."`)
        return cachedAudio;
      }
    } catch (error) {
      console.warn('⚠️ SYNTHESIZE: Failed to check persistent cache, falling back to in-memory:', error);
    }
  }

  // Check in-memory cache as fallback
  const cacheKey = generateCacheKey(text, voiceId)
  if (audioCache.has(cacheKey)) {
    console.log(`🎤 SYNTHESIZE: Using in-memory cached audio for "${text.substring(0, 30)}..."`)
    return audioCache.get(cacheKey)!
  }

  try {
    const requestBody = {
      text,
      model_id: 'eleven_turbo_v2',  // Use faster turbo model
      voice_settings: { 
        stability: 0.5,         // Reduced for faster generation
        similarity_boost: 0.8,  // Keep high for voice consistency
        style: 0.0,             // No style boost for natural speech
        use_speaker_boost: false // Disable for faster generation
      }
    }
    
    console.log(`🎤 SYNTHESIZE: Making API request to ElevenLabs...`)
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`🎤 SYNTHESIZE: Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`❌ SYNTHESIZE: ElevenLabs TTS request failed (${response.status}): ${errorText}`)
      throw new Error(`ElevenLabs TTS request failed (${response.status}): ${errorText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log(`🎤 SYNTHESIZE: Received ${arrayBuffer.byteLength} bytes from ElevenLabs`)
    
    const blob = bufferToMp3Blob(arrayBuffer)
    console.log(`🎤 SYNTHESIZE: Successfully created blob of size ${blob.size} bytes`)
    
    // Cache the result for future use
    audioCache.set(cacheKey, blob)
    console.log(`🎤 SYNTHESIZE: Cached audio in memory for future use`)
    
    // Also store in persistent cache
    if (persistentCache) {
      try {
        await persistentCache.storeAudio(text, voiceId, blob, 'refinement');
        console.log(`🎤 SYNTHESIZE: Stored audio in persistent cache`);
      } catch (error) {
        console.warn('⚠️ SYNTHESIZE: Failed to store in persistent cache:', error);
      }
    }
    
    return blob
  } catch (error: any) {
    console.error(`❌ SYNTHESIZE: Error during synthesis:`, error)
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
}

// Track active audio elements to allow global interruption
const activeAudios = new Set<HTMLAudioElement>()
const audioUrlMap = new WeakMap<HTMLAudioElement, string>()

export async function playBlob(audioBlob: Blob): Promise<void> {
  if (!audioBlob) {
    console.warn('⚠️ PLAYBLOB: No audio blob provided')
    return
  }
  
  console.log(`🎵 PLAYBLOB: Playing blob of size ${audioBlob.size} bytes`)
  
  const url = URL.createObjectURL(audioBlob)
  const audio = new Audio(url)
  registerExternalAudio(audio, url)
  
  try {
    await audio.play()
    console.log(`🎵 PLAYBLOB: Audio started playing successfully`)
  } catch (error) {
    console.error(`❌ PLAYBLOB: Error playing audio:`, error)
    throw error
  }
}

export function stopAllAudio(): void {
  console.log(`🛑 STOPAUDIO: Stopping ${activeAudios.size} active audio elements`)
  
  for (const audio of Array.from(activeAudios)) {
    try {
      audio.pause()
      audio.currentTime = 0
      const url = audioUrlMap.get(audio)
      if (url) URL.revokeObjectURL(url)
      console.log(`🛑 STOPAUDIO: Stopped audio element`)
    } catch (error) {
      console.error(`❌ STOPAUDIO: Error stopping audio:`, error)
    }
    activeAudios.delete(audio)
  }
}

// Allow other modules to register externally created audio elements
export function registerExternalAudio(audio: HTMLAudioElement, url?: string): void {
  try {
    activeAudios.add(audio)
    if (url) audioUrlMap.set(audio, url)
    console.log(`📝 REGISTER: Registered external audio element`)
  } catch (error) {
    console.error(`❌ REGISTER: Error registering audio:`, error)
  }
}

export async function speak(text: string, options?: { stakeholderName?: string; voiceId?: string }): Promise<ArrayBuffer> {
  const blob = await synthesizeToBlob(text, options)
  return blob.arrayBuffer()
}

export async function speakAndPlay(text: string, options?: { voiceId?: string; stakeholderName?: string }): Promise<void> {
  const blob = await synthesizeToBlob(text, options)
  await playBlob(blob)
}

// Clear audio cache
export function clearAudioCache(): void {
  audioCache.clear()
  console.log('🧹 AUDIO CACHE: Cleared in-memory audio cache')
}

// Clear persistent audio cache
export async function clearPersistentAudioCache(): Promise<void> {
  if (persistentCache) {
    try {
      await persistentCache.clearCache();
      console.log('🧹 AUDIO CACHE: Cleared persistent audio cache');
    } catch (error) {
      console.error('❌ AUDIO CACHE: Failed to clear persistent cache:', error);
    }
  }
}

// Get cache statistics
export async function getAudioCacheStats(): Promise<any> {
  if (persistentCache) {
    try {
      const stats = await persistentCache.getCacheStats();
      console.log('📊 AUDIO CACHE: Cache stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ AUDIO CACHE: Failed to get cache stats:', error);
      return null;
    }
  }
  return null;
}

// Pre-generate refinement meeting audio
export async function preGenerateRefinementAudio(): Promise<void> {
  if (persistentCache) {
    try {
      await persistentCache.preGenerateRefinementMeetingAudio();
      console.log('🎬 AUDIO CACHE: Pre-generation completed');
    } catch (error) {
      console.error('❌ AUDIO CACHE: Failed to pre-generate audio:', error);
    }
  }
}