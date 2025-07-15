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
  const [responseHistory, setResponseHistory] = useState<Map<string, string[]>>(new Map())

  // Handle audio playback state - only one audio can play at a time
  const handleAudioPlayingChange = (messageId: string, isPlaying: boolean) => {
    if (isPlaying) {
      // Force stop all browser speech before starting new audio
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      
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
    const stakeholderId = stakeholder.id || stakeholder.name
    
    // Get previous responses for this stakeholder
    const previousResponses = responseHistory.get(stakeholderId) || []
    
    // Generate response based on question type and context
    let response = ''
    
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
      response = getGreetingResponse(stakeholder, lowerQuestion)
    } else if (lowerQuestion.includes('process') || lowerQuestion.includes('workflow')) {
      response = getProcessResponse(stakeholder, lowerQuestion)
    } else if (lowerQuestion.includes('challenge') || lowerQuestion.includes('problem')) {
      response = getChallengeResponse(stakeholder, lowerQuestion)
    } else if (lowerQuestion.includes('improve') || lowerQuestion.includes('better')) {
      response = getImprovementResponse(stakeholder, lowerQuestion)
    } else if (lowerQuestion.includes('time') || lowerQuestion.includes('duration')) {
      response = getTimeResponse(stakeholder, lowerQuestion)
    } else {
      response = getDefaultResponse(stakeholder, lowerQuestion)
    }
    
    // Avoid duplicate responses
    let finalResponse = response
    let attempts = 0
    while (previousResponses.includes(finalResponse) && attempts < 3) {
      finalResponse = addVariation(response, attempts)
      attempts++
    }
    
    // Track this response
    const updatedHistory = new Map(responseHistory)
    updatedHistory.set(stakeholderId, [...previousResponses, finalResponse])
    setResponseHistory(updatedHistory)
    
    return finalResponse
  }

  const getGreetingResponse = (stakeholder: any, question: string) => {
    const greetings = {
      'Customer Service Manager': [
        'Hello! Great to be here discussing how we can improve our customer experience.',
        'Hi there! I\'m looking forward to sharing our customer service perspective.',
        'Hello! I\'m excited to discuss how we can make things better for our customers.'
      ],
      'Head of Operations': [
        'Hello! Ready to dive into our operational processes and improvements.',
        'Hi! I\'m here to discuss our current workflows and optimization opportunities.',
        'Hello! Looking forward to sharing operational insights with you.'
      ],
      'IT Systems Lead': [
        'Hello! Excited to discuss our technical infrastructure and possibilities.',
        'Hi! I\'m here to share our IT perspective on system improvements.',
        'Hello! Ready to talk about our technology challenges and solutions.'
      ],
      'HR Business Partner': [
        'Hello! I\'m here to discuss the people side of any changes we make.',
        'Hi! Looking forward to sharing HR insights on team impact and training.',
        'Hello! Ready to talk about change management and team support.'
      ]
    }
    
    const responses = greetings[stakeholder.role] || [
      `Hello! I'm ${stakeholder.name}, and I'm here to help with your questions about ${stakeholder.role.toLowerCase()}.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getProcessResponse = (stakeholder: any, question: string) => {
    const processResponses = {
      'Customer Service Manager': [
        'From a customer perspective, our current process has several touchpoints that could be streamlined. Customers often ask us for status updates because they don\'t have visibility.',
        'The customer-facing part of our process involves multiple handoffs. We receive inquiries, coordinate with different teams, and try to keep customers informed throughout.',
        'Our process currently requires customers to provide the same information multiple times to different departments, which creates frustration.'
      ],
      'Head of Operations': [
        'Our operational process involves 15 distinct steps, with manual handoffs between departments. We process approximately 200-300 cases daily.',
        'The current workflow requires multiple approvals and data entry points. Each case moves through 4 different systems before completion.',
        'Operationally, we see bottlenecks in the verification stage and final approval process. These create delays that ripple through the entire workflow.'
      ],
      'IT Systems Lead': [
        'From a technical standpoint, our process involves 3 separate systems that don\'t communicate well. Data has to be manually transferred between platforms.',
        'Our current process relies on legacy systems that require significant manual intervention. Integration between our CRM and processing systems is limited.',
        'The technical architecture behind our process involves point-to-point connections that are fragile and hard to maintain.'
      ],
      'HR Business Partner': [
        'From a people perspective, our current process requires extensive training because it\'s complex and has many manual steps.',
        'The process impacts our team\'s daily work significantly. Staff spend about 60% of their time on administrative tasks rather than value-add activities.',
        'Our current process requires different skill sets across departments, which creates dependencies and potential bottlenecks when people are unavailable.'
      ]
    }
    
    const responses = processResponses[stakeholder.role] || [
      `From my ${stakeholder.role} perspective, our process involves several key steps that could be optimized.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getChallengeResponse = (stakeholder: any, question: string) => {
    const challengeResponses = {
      'Customer Service Manager': [
        'Our biggest challenge is managing customer expectations when there are delays. They want transparency and timely updates.',
        'The main issue we face is customers having to repeat information to different departments. It creates a fragmented experience.',
        'Communication gaps between departments mean customers sometimes receive conflicting information, which damages trust.'
      ],
      'Head of Operations': [
        'Our primary challenge is the lack of real-time visibility into case status. Managers spend too much time on status updates instead of strategic work.',
        'The biggest operational challenge is managing peak volumes with our current manual processes. We often have to add temporary staff.',
        'Data quality issues cause rework and delays. Information gets lost or corrupted during handoffs between systems.'
      ],
      'IT Systems Lead': [
        'Our main technical challenge is system integration. Our platforms were built at different times and don\'t communicate effectively.',
        'Legacy system maintenance consumes significant IT resources. We spend more time keeping old systems running than building new capabilities.',
        'Data inconsistency across systems creates problems. The same customer information exists in multiple places with different formats.'
      ],
      'HR Business Partner': [
        'Change resistance is our biggest challenge. Staff are comfortable with current processes, even if they\'re inefficient.',
        'Skills gaps in our team mean we rely heavily on a few key people. When they\'re unavailable, processes slow down significantly.',
        'Training new staff takes 6-8 weeks because our processes are complex and not well-documented.'
      ]
    }
    
    const responses = challengeResponses[stakeholder.role] || [
      `The main challenge from my ${stakeholder.role} perspective is ensuring smooth operations while managing complexity.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getImprovementResponse = (stakeholder: any, question: string) => {
    const improvementResponses = {
      'Customer Service Manager': [
        'We need self-service options for customers to check status and update information. This would reduce inquiry volume and improve satisfaction.',
        'Automated notifications at key process milestones would help customers stay informed without having to contact us.',
        'A unified customer portal where they can see all their interactions and documents would significantly improve the experience.'
      ],
      'Head of Operations': [
        'Process automation would eliminate many manual handoffs and reduce errors. We could probably automate 70% of our current manual tasks.',
        'Real-time dashboards would give managers better visibility into bottlenecks and help with resource allocation.',
        'Standardized workflows with built-in quality checks would reduce variability and improve consistency.'
      ],
      'IT Systems Lead': [
        'A unified data platform would eliminate the need for manual data transfers and reduce errors significantly.',
        'API-based integrations would make our systems more flexible and easier to maintain than current point-to-point connections.',
        'Cloud-based solutions would give us better scalability and reduce the maintenance burden on our IT team.'
      ],
      'HR Business Partner': [
        'Simplified processes with better documentation would reduce training time and make staff more confident.',
        'Role-based dashboards would help staff focus on their specific responsibilities without getting overwhelmed.',
        'Better change management support would help the team adapt more quickly to new processes and technologies.'
      ]
    }
    
    const responses = improvementResponses[stakeholder.role] || [
      `From my ${stakeholder.role} perspective, we should focus on streamlining our most common workflows first.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getTimeResponse = (stakeholder: any, question: string) => {
    const timeResponses = {
      'Customer Service Manager': [
        'Customers currently wait 2-3 days for initial processing, and the entire process takes 1-2 weeks depending on complexity.',
        'Response times vary significantly. Simple cases might take 24 hours, but complex ones can take up to 10 business days.',
        'Our service level agreement is 5 business days, but we often struggle to meet that during peak periods.'
      ],
      'Head of Operations': [
        'Each case takes approximately 3-4 hours of actual work time, but calendar time is 7-10 days due to queuing and handoffs.',
        'Processing time breaks down to: initial review (30 minutes), verification (2 hours), approval (1 hour), but waiting time between steps adds days.',
        'During peak periods, processing times can double due to resource constraints and system performance issues.'
      ],
      'IT Systems Lead': [
        'System response times are generally good, but batch processing jobs that run overnight can cause morning delays.',
        'Data synchronization between systems happens every 4 hours, which can delay real-time updates.',
        'System downtime for maintenance occurs monthly for 2-3 hours, which impacts processing during those windows.'
      ],
      'HR Business Partner': [
        'Staff typically spend 15-20 minutes per case on administrative tasks, but complex cases can take up to an hour.',
        'Training new staff takes 6-8 weeks to reach full productivity due to process complexity.',
        'Our team spends about 30% of their time on status updates and coordination rather than core processing work.'
      ]
    }
    
    const responses = timeResponses[stakeholder.role] || [
      `From my ${stakeholder.role} perspective, timing is definitely an area where we can improve efficiency.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getDefaultResponse = (stakeholder: any, question: string) => {
    const defaultResponses = {
      'Customer Service Manager': [
        'From a customer experience standpoint, that\'s an important consideration. We always need to think about how changes affect our customers.',
        'I can share some insights from our customer feedback. This is definitely something that comes up in our customer conversations.',
        'That\'s a great question. From our customer-facing perspective, we see this impact our service quality regularly.'
      ],
      'Head of Operations': [
        'From an operational standpoint, that\'s definitely something we need to consider in our daily workflows.',
        'That\'s a good point. Operationally, we see this affecting our efficiency and resource allocation.',
        'I can provide some context from our operations experience. This touches on several areas of our work.'
      ],
      'IT Systems Lead': [
        'From a technical perspective, that\'s an interesting challenge. Our systems architecture plays a role in this.',
        'That\'s a valid concern. From an IT standpoint, we need to consider the technical implications and feasibility.',
        'I can share some insights from our technical infrastructure. This relates to several system components.'
      ],
      'HR Business Partner': [
        'From a people perspective, that\'s something we need to carefully consider in terms of team impact.',
        'That\'s an important consideration. From an HR standpoint, we need to think about training and change management.',
        'I can provide some context from our team experience. This affects how our staff work and collaborate.'
      ]
    }
    
    const responses = defaultResponses[stakeholder.role] || [
      `That's a thoughtful question. From my ${stakeholder.role} perspective, I can share some relevant insights.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const addVariation = (response: string, attempt: number) => {
    const variations = [
      response.replace('From a ', 'Looking at this from a '),
      response.replace('From my ', 'In my experience as '),
      response.replace('Our ', 'We see that our '),
      response.replace('The ', 'I\'d say the '),
      response.replace('We ', 'In our department, we ')
    ]
    
    return variations[attempt % variations.length] || response
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