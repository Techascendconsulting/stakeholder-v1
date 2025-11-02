/**
 * Deepgram Transcription Service
 * Fast, low-latency speech-to-text for stakeholder meetings
 */

const DEEPGRAM_API_KEY = 'b2f32f741671fbba48d868136eb7964fc571088b';
const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/listen';

interface DeepgramResponse {
  results: {
    channels: Array<{
      alternatives: Array<{
        transcript: string;
        confidence: number;
      }>;
    }>;
  };
}

/**
 * Transcribe audio blob using Deepgram REST API
 * Optimized for fast, clean transcription in voice meetings
 */
export const transcribeWithDeepgram = async (audioBlob: Blob): Promise<string> => {
  console.log('🎙️ Starting Deepgram transcription...', {
    blobSize: audioBlob.size,
    blobType: audioBlob.type
  });

  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Invalid audio blob provided');
  }

  try {
    // Prepare form data with audio blob
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    // Configure Deepgram parameters for optimal meeting transcription
    const params = new URLSearchParams({
      model: 'nova-2',           // Latest, most accurate model
      language: 'en-US',         // English language
      punctuate: 'true',         // Add punctuation
      smart_format: 'true',      // Smart formatting (numbers, dates, etc.)
      interim_results: 'false',  // Only final results for REST API
      endpointing: 'true',       // Better sentence boundaries
      utterances: 'false',       // Single transcript, not split by speaker
      diarize: 'false'          // No speaker diarization for simplicity
    });

    const response = await fetch(`${DEEPGRAM_API_URL}?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        // Don't set Content-Type - let browser handle it for FormData
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Deepgram API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Deepgram API failed: ${response.status} ${response.statusText}`);
    }

    const result: DeepgramResponse = await response.json();
    console.log('🔍 Deepgram raw response:', result);

    // Extract transcript from response
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    
    if (!transcript) {
      console.warn('⚠️ No transcript found in Deepgram response');
      return '';
    }

    const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
    
    console.log('✅ Deepgram transcription successful:', {
      transcript: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
      confidence: confidence,
      length: transcript.length
    });

    return transcript.trim();

  } catch (error) {
    console.error('❌ Deepgram transcription error:', error);
    
    // Graceful error handling - return empty string instead of throwing
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    // For meeting continuity, return empty string rather than breaking the flow
    return '';
  }
};

/**
 * Check if Deepgram service is available
 */
export const isDeepgramAvailable = (): boolean => {
  return !!DEEPGRAM_API_KEY && DEEPGRAM_API_KEY !== 'your-deepgram-api-key-here';
};

/**
 * Get supported audio formats for Deepgram
 */
export const getSupportedDeepgramFormats = () => {
  return {
    preferredMimeType: 'audio/webm;codecs=opus',
    fallbackMimeTypes: [
      'audio/webm',
      'audio/mp4',
      'audio/wav',
      'audio/ogg'
    ]
  };
};