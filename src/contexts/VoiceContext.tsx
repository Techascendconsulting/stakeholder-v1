import React, { createContext, useContext, useState, ReactNode } from 'react'
import { murfTTS } from '../services/murfTTS'

interface StakeholderVoiceConfig {
  stakeholderId: string
  voiceName: string
  enabled: boolean
}

interface MurfVoiceConfig {
  id: string
  name: string
  gender: 'Male' | 'Female'
  locale: string
  displayName: string
  description: string
}

// Murf voice configurations based on the voice mapping
export const MURF_VOICES: Record<string, MurfVoiceConfig> = {
  'en-UK-hazel': {
    id: 'en-UK-hazel',
    name: 'en-UK-hazel',
    gender: 'Female',
    locale: 'en-UK',
    displayName: 'Hazel (Female, UK)',
    description: 'Professional British female voice, ideal for customer service and HR roles'
  },
  'en-AU-leyton': {
    id: 'en-AU-leyton',
    name: 'en-AU-leyton',
    gender: 'Male',
    locale: 'en-AU',
    displayName: 'Leyton (Male, AU)',
    description: 'Professional Australian male voice, ideal for technical and IT roles'
  },
  'en-US-maverick': {
    id: 'en-US-maverick',
    name: 'en-US-maverick',
    gender: 'Male',
    locale: 'en-US',
    displayName: 'Maverick (Male, US)',
    description: 'Professional American male voice, ideal for operations and leadership roles'
  }
}

// Default voice assignments based on stakeholder names
export const getDefaultVoiceForStakeholder = (stakeholderName: string): string => {
  const voiceConfig = murfTTS.getVoiceForStakeholder(stakeholderName);
  return voiceConfig.voice_id;
}

interface VoiceContextType {
  stakeholderVoices: StakeholderVoiceConfig[]
  setStakeholderVoice: (stakeholderId: string, voiceName: string) => void
  getStakeholderVoice: (stakeholderId: string, stakeholderName?: string) => string
  toggleStakeholderVoice: (stakeholderId: string) => void
  isStakeholderVoiceEnabled: (stakeholderId: string) => boolean
  globalAudioEnabled: boolean
  setGlobalAudioEnabled: (enabled: boolean) => void
  availableVoices: typeof MURF_VOICES
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined)

export const useVoice = () => {
  const context = useContext(VoiceContext)
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider')
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
    availableVoices: MURF_VOICES
  }

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}