// Audio transcription using secure backend API
// SECURITY: No OpenAI API key in frontend
import { transcribeAudio as apiTranscribeAudio } from './apiClient';

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Convert blob to base64 for API transmission
    const base64Audio = await blobToBase64(audioBlob);
    
    // Call secure backend API
    const result = await apiTranscribeAudio({
      audioData: base64Audio,
      language: 'en'
    });

    if (!result.success) {
      throw new Error(result.error || 'Transcription failed');
    }

    return result.text.trim();
  } catch (error) {
    console.error('Whisper transcription error:', error);
    
    if (error instanceof Error) {
      // Handle specific errors
      if (error.message.includes('API key')) {
        throw new Error('Transcription service not configured. Please contact support.');
      } else if (error.message.includes('quota')) {
        throw new Error('Transcription service quota exceeded. Please try again later.');
      } else if (error.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(`Transcription failed: ${error.message}`);
      }
    } else {
      throw new Error('Unknown transcription error occurred.');
    }
  }
}

// Helper function to convert Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert audio to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Helper function to check if audio recording is supported
export function isAudioRecordingSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
}

// Helper function to check if Whisper is available
export function isWhisperAvailable(): boolean {
  // Always return true since backend handles availability
  return true;
}

// Helper function to get supported audio formats
export function getSupportedAudioFormat(): string {
  if (typeof MediaRecorder === 'undefined') {
    return 'audio/webm'; // Fallback
  }
  
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus';
  } else if (MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm';
  } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
    return 'audio/mp4';
  } else {
    return 'audio/webm'; // Fallback
  }
}


