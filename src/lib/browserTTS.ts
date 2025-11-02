// Browser Text-to-Speech utility
export function playBrowserTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Browser TTS not supported');
      resolve();
      return;
    }

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    // Try to use a specific voice if available
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer English voices
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (englishVoice) {
        utterance.voice = englishVoice;
        console.log('🎤 Using voice:', englishVoice.name, 'for browser TTS');
      }
    }
    
    // Handle completion
    utterance.onend = () => {
      console.log('🎤 Browser TTS completed');
      resolve();
    };
    
    // Handle errors
    utterance.onerror = (event) => {
      console.error('🎤 Browser TTS error:', event.error);
      resolve(); // Don't reject, just continue
    };
    
    // Start speaking
    console.log('🎤 Starting browser TTS for:', text.substring(0, 50) + '...');
    speechSynthesis.speak(utterance);
  });
}