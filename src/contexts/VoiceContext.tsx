import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AZURE_VOICES, getDefaultVoiceForStakeholder } from '../lib/azureTTS'

interface StakeholderVoiceConfig {
  stakeholderId: string
  voiceName: string
  enabled: boolean
}

interface VoiceContextType {
  stakeholderVoices: StakeholderVoiceConfig[]
  setStakeholderVoice: (stakeholderId: string, voiceName: string) => void
  getStakeholderVoice: (stakeholderId: string, stakeholderRole?: string) => string
  toggleStakeholderVoice: (stakeholderId: string) => void
  isStakeholderVoiceEnabled: (stakeholderId: string) => boolean
  globalAudioEnabled: boolean
  setGlobalAudioEnabled: (enabled: boolean) => void
  availableVoices: typeof AZURE_VOICES
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

  const getStakeholderVoice = (stakeholderId: string, stakeholderRole?: string): string => {
    const config = stakeholderVoices.find(sv => sv.stakeholderId === stakeholderId)
    if (config) {
      return config.voiceName
    }
    
    // Return default voice based on role
    return getDefaultVoiceForStakeholder(stakeholderRole || '')
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
        // Create new config with default voice, disabled
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
    availableVoices: AZURE_VOICES
  }

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}