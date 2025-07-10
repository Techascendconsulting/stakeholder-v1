import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import VoiceInputModal from '../VoiceInputModal'
import { stakeholderAI } from '../../lib/stakeholderAI'
import { 
  ArrowLeft, 
  Mic, 
  Send, 
  Volume2, 
  VolumeX, 
  Users, 
  Clock,
  Settings,
  Loader2,
  Video,
  VideoOff,
  Phone,
  MoreHorizontal,
  MessageSquare,
  FileText,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react'
import { isAudioRecordingSupported } from '../../lib/whisper'
import { azureTTS, isAzureTTSAvailable, playBrowserTTS } from '../../lib/azureTTS'
import { Message, Meeting } from '../../types'

interface AudioPlaybackState {
  messageId: string
  isPlaying: boolean
  isLoading: boolean
  error?: string
}

const MeetingView: React.FC = () => {
  // ... rest of the component code ...

  const handleAIResponse = async (userMessageText: string, currentMessages: Message[]) => {
    if (!selectedProject || selectedStakeholders.length === 0) return

    const conversationContext = {
      projectId: selectedProject!.id,
      stakeholderIds: selectedStakeholders.map(s => s.id),
      messages: currentMessages,
      meetingType: selectedStakeholders.length > 1 ? 'group' as const : 'individual' as const
    }

    // Set loading state to show "Stakeholder is typing..." indicator
    setRespondingStakeholder('system') // Use 'system' to indicate general loading

    try {
      // Call the AI to get the stakeholder's response
      const aiResponseMessage = await stakeholderAI.generateGroupResponse(
        conversationContext,
        selectedProject,
        selectedStakeholders,
        userMessageText
      )

      // Add the AI's response to the chat history
      const newMessages = [...currentMessages, aiResponseMessage]
      setMessages(newMessages)

      // Update meeting with new message
      if (currentMeeting) {
        updateMeeting(currentMeeting.id, { transcript: newMessages })
      }

      // Auto-play audio if enabled
      if (globalAudioEnabled && aiResponseMessage.speaker !== 'user') {
        setTimeout(() => {
          playMessageAudio(aiResponseMessage)
        }, 300)
      }

    } catch (error) {
      console.error('Error generating AI response:', error)
      
      // Fallback response if AI fails
      const fallbackMessage: Message = {
        id: `msg-${Date.now()}-fallback`,
        speaker: selectedStakeholders[0]?.id || 'system',
        content: "I'm sorry, I seem to have encountered a technical issue. Could you please try asking that again?",
        timestamp: new Date().toISOString(),
        stakeholderName: selectedStakeholders[0]?.name || 'System',
        stakeholderRole: selectedStakeholders[0]?.role || 'System'
      }
      
      const newMessages = [...currentMessages, fallbackMessage]
      setMessages(newMessages)
      
      if (currentMeeting) {
        updateMeeting(currentMeeting.id, { transcript: newMessages })
      }
    } finally {
      // Clear loading state
      setRespondingStakeholder(null)
    }
  }

  // ... rest of the component code ...
}

export default MeetingView