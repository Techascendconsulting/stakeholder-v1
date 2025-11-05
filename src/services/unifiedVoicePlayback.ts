/**
 * Unified Voice Playback Service
 * 
 * Always tries ElevenLabs first, falls back to browser TTS only if ElevenLabs fails.
 * This ensures natural voices are used whenever possible.
 */

import { isConfigured, synthesizeToBlob } from './elevenLabsTTS';
import { playBrowserTTS } from '../lib/browserTTS';

interface PlayVoiceOptions {
  stakeholderName?: string;
  voiceId?: string;
  text: string;
}

/**
 * Play voice with automatic fallback
 * 
 * Strategy:
 * 1. Try ElevenLabs first (if API key is available)
 * 2. Fall back to browser TTS only if ElevenLabs fails or is unavailable
 * 
 * @param options - Voice playback options
 * @returns Promise that resolves when playback completes or fails
 */
export async function playVoice(options: PlayVoiceOptions): Promise<void> {
  const { text, stakeholderName, voiceId } = options;

  if (!text || text.trim().length === 0) {
    console.warn('⚠️ playVoice: Empty text provided');
    return;
  }

  // Step 1: Try ElevenLabs first (if configured)
  if (isConfigured()) {
    try {
      console.log(`🎤 UNIFIED VOICE: Attempting ElevenLabs for "${text.substring(0, 50)}..."`);
      
      const audioBlob = await synthesizeToBlob(text, { 
        stakeholderName, 
        voiceId 
      });

      if (audioBlob && audioBlob.size > 0) {
        console.log(`✅ UNIFIED VOICE: ElevenLabs audio generated (${audioBlob.size} bytes)`);
        
        // Create audio element and play
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        return new Promise((resolve) => {
          audio.onended = () => {
            console.log(`✅ UNIFIED VOICE: ElevenLabs playback completed`);
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          audio.onerror = (error) => {
            console.error(`❌ UNIFIED VOICE: ElevenLabs playback error:`, error);
            URL.revokeObjectURL(audioUrl);
            // Fall through to browser TTS
            playBrowserTTS(text).then(resolve).catch(() => resolve());
          };

          audio.play().catch((playError) => {
            console.error(`❌ UNIFIED VOICE: Failed to start ElevenLabs playback:`, playError);
            URL.revokeObjectURL(audioUrl);
            // Fall through to browser TTS
            playBrowserTTS(text).then(resolve).catch(() => resolve());
          });
        });
      } else {
        console.warn(`⚠️ UNIFIED VOICE: ElevenLabs returned empty blob, falling back to browser TTS`);
        // Fall through to browser TTS
      }
    } catch (error) {
      console.error(`❌ UNIFIED VOICE: ElevenLabs error:`, error);
      console.log(`🔄 UNIFIED VOICE: Falling back to browser TTS`);
      // Fall through to browser TTS
    }
  } else {
    console.log(`⚠️ UNIFIED VOICE: ElevenLabs not configured (no API key), using browser TTS`);
  }

  // Step 2: Fallback to browser TTS
  console.log(`🎤 UNIFIED VOICE: Using browser TTS fallback for "${text.substring(0, 50)}..."`);
  try {
    await playBrowserTTS(text);
    console.log(`✅ UNIFIED VOICE: Browser TTS completed`);
  } catch (error) {
    console.error(`❌ UNIFIED VOICE: Browser TTS also failed:`, error);
    throw error;
  }
}

/**
 * Create an Audio element from text (for advanced usage)
 * Tries ElevenLabs first, returns null if both fail
 */
export async function createAudioElement(
  text: string, 
  options?: { stakeholderName?: string; voiceId?: string }
): Promise<HTMLAudioElement | null> {
  if (!text || text.trim().length === 0) {
    return null;
  }

  // Try ElevenLabs first
  if (isConfigured()) {
    try {
      const audioBlob = await synthesizeToBlob(text, options);
      
      if (audioBlob && audioBlob.size > 0) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Clean up URL when audio ends or errors
        audio.addEventListener('ended', () => URL.revokeObjectURL(audioUrl), { once: true });
        audio.addEventListener('error', () => URL.revokeObjectURL(audioUrl), { once: true });
        
        return audio;
      }
    } catch (error) {
      console.error(`❌ createAudioElement: ElevenLabs failed:`, error);
    }
  }

  // Browser TTS doesn't return an Audio element, so return null
  // Caller should handle fallback separately
  return null;
}





