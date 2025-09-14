class GlobalAudioService {
  private audio: HTMLAudioElement | null = null
  private activeTrack: string | null = null
  private isPlaying: boolean = false
  private currentTitle: string = ''
  private listeners: Array<() => void> = []

  constructor() {
    this.audio = new Audio()
    this.audio.loop = true
    this.audio.preload = 'metadata'
    
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false
      this.activeTrack = null
      this.currentTitle = ''
      this.notifyListeners()
    })

    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e)
      this.isPlaying = false
      this.activeTrack = null
      this.currentTitle = ''
      this.notifyListeners()
    })

    this.audio.addEventListener('loadstart', () => {
      console.log('🎵 Global Audio: Loading audio...')
    })

    this.audio.addEventListener('canplay', () => {
      console.log('🎵 Global Audio: Audio can play')
    })
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  async playTrack(url: string, title: string) {
    if (!this.audio) return

    try {
      // If same track is paused, resume it
      if (this.activeTrack === title && !this.isPlaying) {
        await this.audio.play()
        this.isPlaying = true
        this.notifyListeners()
        console.log('🎵 Global Audio: Resumed track', title)
        return
      }

      // If same track is playing, pause it
      if (this.activeTrack === title && this.isPlaying) {
        this.audio.pause()
        this.isPlaying = false
        this.notifyListeners()
        console.log('🎵 Global Audio: Paused track', title)
        return
      }

      // New track - load and play
      this.audio.src = url
      
      // Wait for the audio to be ready
      return new Promise<void>((resolve, reject) => {
        const handleCanPlay = () => {
          this.audio?.removeEventListener('canplay', handleCanPlay)
          this.audio?.removeEventListener('error', handleError)
          
          this.audio?.play().then(() => {
            this.activeTrack = title
            this.currentTitle = title
            this.isPlaying = true
            this.notifyListeners()
            console.log('🎵 Global Audio: Playing new track', title)
            resolve()
          }).catch(reject)
        }

        const handleError = (e: Event) => {
          this.audio?.removeEventListener('canplay', handleCanPlay)
          this.audio?.removeEventListener('error', handleError)
          console.error('Error loading audio:', e)
          reject(new Error(`Unable to load: ${title}`))
        }

        this.audio.addEventListener('canplay', handleCanPlay)
        this.audio.addEventListener('error', handleError)
        
        // Start loading
        this.audio.load()
      })
    } catch (error) {
      console.error('Error playing audio:', error)
      alert(`Unable to play: ${title}`)
    }
  }

  pauseTrack() {
    if (this.audio) {
      this.audio.pause()
      this.isPlaying = false
      this.notifyListeners()
      console.log('🎵 Global Audio: Paused')
    }
  }

  stopTrack() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.isPlaying = false
      this.activeTrack = null
      this.currentTitle = ''
      this.notifyListeners()
      console.log('🎵 Global Audio: Stopped')
    }
  }

  getState() {
    return {
      activeTrack: this.activeTrack ? {
        title: this.currentTitle,
        src: this.audio?.src || ''
      } : null,
      isPlaying: this.isPlaying,
      currentTitle: this.currentTitle
    }
  }
}

// Create a singleton instance
export const globalAudioService = new GlobalAudioService()

