// Browser Text-to-Speech fallback utility
export function playBrowserTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not supported'))
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    utterance.lang = 'en-GB'

    utterance.onend = () => resolve()
    utterance.onerror = (error) => reject(new Error('Browser TTS failed'))

    speechSynthesis.speak(utterance)
  })
}