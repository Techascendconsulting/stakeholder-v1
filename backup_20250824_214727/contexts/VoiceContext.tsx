import React, { createContext, useContext, useState, ReactNode } from 'react'

interface StakeholderVoiceConfig {
  stakeholderId: string
  voiceName: string
  enabled: boolean
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
    return {
      stakeholderVoices: [],
      setStakeholderVoice: () => {},
      getStakeholderVoice: () => '',
      toggleStakeholderVoice: () => {},
      isStakeholderVoiceEnabled: () => false,
      globalAudioEnabled: false,
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

  const getStakeholderVoice = (_stakeholderId: string, _stakeholderName?: string): string => {
    return ''
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
        return [...prev, { stakeholderId, voiceName: '', enabled: false }]
      }
    })
  }

  const isStakeholderVoiceEnabled = (stakeholderId: string): boolean => {
    const config = stakeholderVoices.find(sv => sv.stakeholderId === stakeholderId)
    return config ? config.enabled : false
  }

  const value: VoiceContextType = {
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
