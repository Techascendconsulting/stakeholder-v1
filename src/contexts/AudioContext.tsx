import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { AppView } from '../types'

interface AudioContextType {
  activeTrack: string | null
  isPlaying: boolean
  currentTitle: string
  playTrack: (url: string, title: string) => void
  pauseTrack: () => void
  stopTrack: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}

interface AudioProviderProps {
  children: React.ReactNode
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [activeTrack, setActiveTrack] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTitle, setCurrentTitle] = useState<string>('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.loop = true
      audioRef.current.preload = 'metadata'
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        setActiveTrack(null)
        setCurrentTitle('')
      })
    }
  }, [])

  const playTrack = async (url: string, title: string) => {
    if (!audioRef.current) return

    try {
      if (activeTrack === title && isPlaying) {
        // Same track playing - pause it
        audioRef.current.pause()
        setIsPlaying(false)
        return
      }

      audioRef.current.src = url
      await audioRef.current.play()
      setActiveTrack(title)
      setCurrentTitle(title)
      setIsPlaying(true)
    } catch (error) {
      console.error('Error playing audio:', error)
      alert(`Unable to play: ${title}`)
    }
  }

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setActiveTrack(null)
      setCurrentTitle('')
    }
  }

  const value: AudioContextType = {
    activeTrack,
    isPlaying,
    currentTitle,
    playTrack,
    pauseTrack,
    stopTrack
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}
