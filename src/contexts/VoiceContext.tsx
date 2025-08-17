import React, { createContext, useContext, useState, ReactNode } from 'react'
import { resolveVoiceId } from '../services/elevenLabsTTS'

interface StakeholderVoiceConfig {
  stakeholderId: string
  voiceName: string
  enabled: boolean
}

// Default voice assignments based on stakeholder names using ElevenLabs mapping
export const getDefaultVoiceForStakeholder = (stakeholderName: string): string => {
  return resolveVoiceId(stakeholderName) || ''
}

interface VoiceContextType {
  stakeholderVoices: StakeholderVoiceConfig[]
  setStakeholderVoice: (stakeholderId: string, voiceName: string) => void
  getStakeholderVoice: (stakeholderId: string, stakeholderName?: string) => string
  toggleStakeholderVoice: (stakeholderId: string) => void
  isStakeholderVoiceEnabled: (stakeholderId: string) => boolean
  globalAudioEnabled: boolean
  setGlobalAudioEnabled: (enabled: boolean) => void
  availableVoices: Record<string, { id: string }>
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined)

export const useVoice = () => {
  const context = useContext(VoiceContext)
  if (!context) {
    // Provide safe no-op defaults to avoid crashes if provider isn't mounted yet
    return {
      stakeholderVoices: [],
      setStakeholderVoice: () => {},
      getStakeholderVoice: (_id: string, stakeholderName?: string) => getDefaultVoiceForStakeholder(stakeholderName || ''),
      toggleStakeholderVoice: () => {},
      isStakeholderVoiceEnabled: () => true,
      globalAudioEnabled: true,
      setGlobalAudioEnabled: () => {},
      availableVoices: {}
    } as VoiceContextType
  }
  return context
}

export const VoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stakeholderVoices, setStakeholderVoices] = useState<StakeholderVoiceConfig[]>([])
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(true)

  const setStakeholderVoice = (stakeholderId: string, voiceName: string) => {
    setStakeholderVoices(prev => {
      const existing = prev.find(sv => sv.stakeholderId === stakeholderId)
      if (existing) {
        return prev.map(sv => 
          sv.stakeholderId === stakeholderId 
            ? { ...sv, voiceName }
            : sv
        )
      } else {
        return [...prev, { stakeholderId, voiceName, enabled: true }]
      }
    })
  }

  const getStakeholderVoice = (stakeholderId: string, stakeholderName?: string): string => {
    const config = stakeholderVoices.find(sv => sv.stakeholderId === stakeholderId)
    if (config) {
      return config.voiceName
    }
    
    // Return default voice based on stakeholder name
    return getDefaultVoiceForStakeholder(stakeholderName || '')
  }

  const toggleStakeholderVoice = (stakeholderId: string) => {
    setStakeholderVoices(prev => {
      const existing = prev.find(sv => sv.stakeholderId === stakeholderId)
      if (existing) {
        return prev.map(sv => 
          sv.stakeholderId === stakeholderId 
            ? { ...sv, enabled: !sv.enabled }
            : sv
        )
      } else {
        // Create new config with default voice, enabled
        const defaultVoice = getDefaultVoiceForStakeholder('')
        return [...prev, { stakeholderId, voiceName: defaultVoice, enabled: true }]
      }
    })
  }

  const isStakeholderVoiceEnabled = (stakeholderId: string): boolean => {
    const config = stakeholderVoices.find(sv => sv.stakeholderId === stakeholderId)
    return config ? config.enabled : true // Default to enabled
  }

  const value = {
    stakeholderVoices,
    setStakeholderVoice,
    getStakeholderVoice,
    toggleStakeholderVoice,
    isStakeholderVoiceEnabled,
    globalAudioEnabled,
    setGlobalAudioEnabled,
    availableVoices: {}
  }

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}