import { useState, useEffect } from 'react'
import { globalAudioService } from '../services/GlobalAudioService'

export const useGlobalAudio = () => {
  const [state, setState] = useState(globalAudioService.getState())

  useEffect(() => {
    console.log('🎵 useGlobalAudio: Hook initialized, current state:', globalAudioService.getState())
    
    const unsubscribe = globalAudioService.subscribe(() => {
      const newState = globalAudioService.getState()
      console.log('🎵 useGlobalAudio: State updated:', newState)
      setState(newState)
    })

    return unsubscribe
  }, [])

  const result = {
    ...state,
    playTrack: globalAudioService.playTrack.bind(globalAudioService),
    pauseTrack: globalAudioService.pauseTrack.bind(globalAudioService),
    stopTrack: globalAudioService.stopTrack.bind(globalAudioService)
  }

  console.log('🎵 useGlobalAudio: Returning state:', result)
  return result
}
