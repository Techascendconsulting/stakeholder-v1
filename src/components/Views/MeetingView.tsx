import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useVoice } from '../../contexts/VoiceContext'
import { Message } from '../../types'
import StakeholderMessageAudio from '../StakeholderMessageAudio'

const MeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, setCurrentView } = useApp()
  const { globalAudioEnabled, setGlobalAudioEnabled } = useVoice()
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showQuestionHelper, setShowQuestionHelper] = useState(false)
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<'as-is' | 'to-be'>('as-is')
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<string | null>(null)

  // Handle audio playback state - only one audio can play at a time
  const handleAudioPlayingChange = (messageId: string, isPlaying: boolean) => {
    if (isPlaying) {
      // Stop all other audio when new audio starts
      setCurrentlyPlayingAudio(messageId)
    } else if (currentlyPlayingAudio === messageId) {
      setCurrentlyPlayingAudio(null)
    }
  }

  // Mock questions for demonstration
  const mockQuestions = {
    'as-is': [
      'Can you walk me through the current process from start to finish?',
      'What are the main pain points in the existing system?',
      'How much time does the current process typically take?',
      'What manual steps are involved in the current workflow?',
      'Where do you see the biggest bottlenecks occurring?'
    ],
    'to-be': [
      'What would an ideal solution look like for your team?',
      'What specific improvements would you like to see?',
      'How would you measure success for this project?',
      'What features are most important to you?',
      'How should the new process differ from the current one?'
    ]
  }

  useEffect(() => {
    if (selectedProject && selectedStakeholders.length > 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        speaker: 'system',
        content: `Welcome to your meeting for ${selectedProject.name}. The following stakeholders are present: ${selectedStakeholders.map(s => s.name).join(', ')}.`,
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
  }, [selectedProject, selectedStakeholders])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    // Simulate AI response
    setTimeout(() => {
      // Determine which stakeholder should respond based on the message content
      const respondingStakeholder = determineRespondingStakeholder(inputMessage, selectedStakeholders)
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        speaker: respondingStakeholder.id || 'stakeholder',
        content: generateContextualResponse(inputMessage, respondingStakeholder, messages),
        timestamp: new Date().toISOString(),
        stakeholderName: respondingStakeholder.name,
        stakeholderRole: respondingStakeholder.role
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)

    setInputMessage('')
  }

  const determineRespondingStakeholder = (message: string, stakeholders: any[]) => {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase()
    
    // Look for stakeholder names in the message
    for (const stakeholder of stakeholders) {
      const firstName = stakeholder.name.split(' ')[0].toLowerCase()
      const fullName = stakeholder.name.toLowerCase()
      
      if (lowerMessage.includes(firstName) || lowerMessage.includes(fullName)) {
        return stakeholder
      }
    }
    
    // Look for role-based addressing
    for (const stakeholder of stakeholders) {
      const role = stakeholder.role.toLowerCase()
      if (lowerMessage.includes(role) || 
          lowerMessage.includes('operations') && role.includes('operations') ||
          lowerMessage.includes('customer') && role.includes('customer') ||
          lowerMessage.includes('hr') && role.includes('hr') ||
          lowerMessage.includes('it') && role.includes('it')) {
        return stakeholder
      }
    }
    
    // Default: rotate through stakeholders based on message count
    const messageCount = messages.filter(m => m.speaker !== 'user' && m.speaker !== 'system').length
    return stakeholders[messageCount % stakeholders.length] || stakeholders[0]
  }

  const generateContextualResponse = (question: string, stakeholder: any, conversationHistory: Message[]) => {
    const lowerQuestion = question.toLowerCase()
    
    // Role-specific response patterns
    const roleResponses = {
      'Head of Operations': [
        `From an operations perspective, ${getOperationsResponse(lowerQuestion)}`,
        `Operationally speaking, ${getOperationsResponse(lowerQuestion)}`,
        `In my experience managing operations, ${getOperationsResponse(lowerQuestion)}`
      ],
      'Customer Service Manager': [
        `From a customer service standpoint, ${getCustomerServiceResponse(lowerQuestion)}`,
        `In terms of customer experience, ${getCustomerServiceResponse(lowerQuestion)}`,
        `From our customer-facing perspective, ${getCustomerServiceResponse(lowerQuestion)}`
      ],
      'IT Systems Lead': [
        `From a technical perspective, ${getITResponse(lowerQuestion)}`,
        `Looking at this from a systems standpoint, ${getITResponse(lowerQuestion)}`,
        `From an IT infrastructure perspective, ${getITResponse(lowerQuestion)}`
      ],
      'HR Business Partner': [
        `From an HR perspective, ${getHRResponse(lowerQuestion)}`,
        `Considering the people aspect, ${getHRResponse(lowerQuestion)}`,
        `From a human resources standpoint, ${getHRResponse(lowerQuestion)}`
      ]
    }
    
    const responses = roleResponses[stakeholder.role] || [
      `That's a great question. From my perspective as ${stakeholder.role}, I can share some insights.`,
      `Let me address that from my role as ${stakeholder.role}.`,
      `From a ${stakeholder.role} standpoint, I can provide some context.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getOperationsResponse = (question: string) => {
    if (question.includes('process') || question.includes('workflow')) {
      return 'our current process involves several manual steps that could be streamlined. We typically handle 200-300 cases per day, and each one requires multiple touchpoints.'
    }
    if (question.includes('time') || question.includes('duration')) {
      return 'the current process typically takes about 2-3 hours per case, but with the right improvements, we could reduce that significantly.'
    }
    if (question.includes('problem') || question.includes('issue') || question.includes('challenge')) {
      return 'the main challenge we face is the lack of integration between our systems. This creates delays and potential for errors.'
    }
    if (question.includes('improve') || question.includes('better') || question.includes('optimize')) {
      return 'we need to ensure any new solution maintains our quality standards while improving efficiency. Automation would help, but we still need flexibility for exceptions.'
    }
    return 'we handle the operational aspects of the onboarding process, and there are definitely opportunities for improvement in our workflows.'
  }

  const getCustomerServiceResponse = (question: string) => {
    if (question.includes('customer') || question.includes('experience')) {
      return 'customer experience is our top priority. Currently, customers often have to wait for updates, and the process can feel fragmented from their perspective.'
    }
    if (question.includes('feedback') || question.includes('complaint')) {
      return 'we receive feedback about delays and lack of visibility into the process. Customers want to know where they stand in the onboarding journey.'
    }
    if (question.includes('communication') || question.includes('update')) {
      return 'we currently send manual updates, but they\'re not always timely. An automated system would help keep customers informed throughout the process.'
    }
    return 'from a customer service perspective, we need to ensure the onboarding process is smooth and transparent for our customers.'
  }

  const getITResponse = (question: string) => {
    if (question.includes('system') || question.includes('technology') || question.includes('technical')) {
      return 'our current systems are somewhat fragmented. We have different platforms that don\'t communicate well with each other, which creates data silos.'
    }
    if (question.includes('integration') || question.includes('data')) {
      return 'we need better integration between our CRM, billing system, and customer portal. Currently, data has to be manually transferred between systems.'
    }
    if (question.includes('automation') || question.includes('automate')) {
      return 'there are many opportunities for automation in our current process. We could automate document processing, status updates, and notifications.'
    }
    return 'from a technical standpoint, we have the infrastructure to support improvements, but we need better integration between our systems.'
  }

  const getHRResponse = (question: string) => {
    if (question.includes('training') || question.includes('skill') || question.includes('people')) {
      return 'our team would need proper training on any new system. Change management is crucial for successful implementation.'
    }
    if (question.includes('impact') || question.includes('affect') || question.includes('change')) {
      return 'any changes to the process will impact our team\'s daily work. We need to ensure proper support and training during the transition.'
    }
    if (question.includes('resource') || question.includes('staff')) {
      return 'we have the right people in place, but they need to be equipped with the right tools and training to succeed with any new process.'
    }
    return 'from an HR perspective, we need to consider the impact on our team and ensure they have the support they need during any transition.'
  }

  const handleQuestionClick = (question: string) => {
    setInputMessage(question)
    setShowQuestionHelper(false)
  }

  const handleSaveNotes = () => {
    alert('Meeting notes saved successfully!')
  }

  const handleAnalyzeAnswers = () => {
    if (messages.length <= 1) {
      alert('Please conduct the interview first before analyzing answers.')
      return
    }

    // Store analysis data
    const analysisData = {
      project: selectedProject,
      stakeholders: selectedStakeholders,
      messages: messages,
      meetingId: `meeting-${Date.now()}`
    }

    sessionStorage.setItem('meetingAnalysis', JSON.stringify(analysisData))
    setCurrentView('analysis')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!selectedProject || selectedStakeholders.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Meeting Active</h3>
          <p className="text-gray-600 mb-4">Select a project and stakeholders to start a meeting.</p>
          <button
            onClick={() => setCurrentView('stakeholders')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Stakeholder Selection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Meeting Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Meeting: {selectedProject.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Participants: {selectedStakeholders.map(s => s.name).join(', ')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Global Audio Toggle */}
            <button
              onClick={() => setGlobalAudioEnabled(!globalAudioEnabled)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border ${
                globalAudioEnabled
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
              title={globalAudioEnabled ? 'Disable Audio' : 'Enable Audio'}
            >
              {globalAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span>{globalAudioEnabled ? 'Audio On' : 'Audio Off'}</span>
            </button>

            {/* Question Helper Toggle */}
            <button
              onClick={() => setShowQuestionHelper(!showQuestionHelper)}
              className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Question Helper</span>
              {showQuestionHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Question Helper Panel */}
        {showQuestionHelper && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-blue-900">
                Question Bank for {selectedStakeholders[0]?.role || 'Stakeholder'}
              </h3>
              <div className="flex bg-white rounded-lg p-1 border border-blue-200">
                <button
                  onClick={() => setSelectedQuestionCategory('as-is')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedQuestionCategory === 'as-is'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  As-Is Process ({mockQuestions['as-is'].length})
                </button>
                <button
                  onClick={() => setSelectedQuestionCategory('to-be')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedQuestionCategory === 'to-be'
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  To-Be Vision ({mockQuestions['to-be'].length})
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockQuestions[selectedQuestionCategory].map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                >
                  <p className="text-sm text-gray-900 group-hover:text-blue-900 font-medium">
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.speaker === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.speaker === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.speaker === 'system'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.speaker !== 'user' && message.speaker !== 'system' && (
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {message.stakeholderName || 'Stakeholder'}
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs mt-1 opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              
                            {/* Audio Controls for Stakeholder Messages */}
              {message.speaker !== 'user' && message.speaker !== 'system' && (
                <StakeholderMessageAudio
                  message={message}
                  autoPlay={true}
                  shouldStop={currentlyPlayingAudio !== null && currentlyPlayingAudio !== message.id}
                  onPlayingChange={(isPlaying) => handleAudioPlayingChange(message.id, isPlaying)}
                />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">Stakeholder is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-4">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to the stakeholders..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        
        {/* Action Buttons */}
        {messages.length > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveNotes}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                <span>Save Notes</span>
              </button>
              <button
                onClick={handleAnalyzeAnswers}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analyze Answers</span>
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  )
}

export default MeetingView