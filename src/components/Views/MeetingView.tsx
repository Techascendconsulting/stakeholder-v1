import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, HelpCircle, Save, BarChart3, ChevronDown, ChevronUp, Search, Filter, Plus, Star, Tag } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { Message } from '../../types'

const MeetingView: React.FC = () => {
  const { selectedProject, selectedStakeholders, user, setCurrentView } = useApp()
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showQuestionHelper, setShowQuestionHelper] = useState(false)
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<'as-is' | 'to-be'>('as-is')

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
      const stakeholder = selectedStakeholders[0] || { name: 'Stakeholder', role: 'Team Member' }
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        speaker: stakeholder.id || 'stakeholder',
        content: generateMockResponse(inputMessage, stakeholder),
        timestamp: new Date().toISOString(),
        stakeholderName: stakeholder.name,
        stakeholderRole: stakeholder.role
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)

    setInputMessage('')
  }

  const generateMockResponse = (userInput: string, stakeholder: any) => {
    // Analyze the user's input for context and intent
    const input = userInput.toLowerCase().trim()
    const conversationHistory = messages.slice(-5) // Consider last 5 messages for context
    
    // Check if this is a greeting
    if (isGreeting(input)) {
      return generateGreetingResponse(stakeholder, userInput)
    }
    
    // Check if this is a follow-up question
    if (isFollowUpQuestion(input, conversationHistory)) {
      return generateFollowUpResponse(input, stakeholder, conversationHistory)
    }
    
    // Check if this is a specific business question
    if (isBusinessQuestion(input)) {
      return generateBusinessResponse(input, stakeholder)
    }
    
    // Check if this is a casual conversation
    if (isCasualConversation(input)) {
      return generateCasualResponse(input, stakeholder)
    }
    
    // Default: treat as a general inquiry
    return generateContextualResponse(input, stakeholder)
  }

  const isGreeting = (input: string) => {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings']
    return greetings.some(greeting => input.includes(greeting))
  }

  const generateGreetingResponse = (stakeholder: any, originalInput: string) => {
    const responses = [
      `Hello! Great to meet you. I'm ${stakeholder.name}, ${stakeholder.role} here at ${stakeholder.department}. I'm looking forward to discussing the ${selectedProject?.name} project with you.`,
      `Hi there! Thanks for bringing us together for this discussion. As ${stakeholder.role}, I'm excited to share my perspective on how we can improve our processes.`,
      `Good to see you! I'm ${stakeholder.name} from ${stakeholder.department}. I've been looking forward to this conversation about the ${selectedProject?.name} initiative.`,
      `Hello! I appreciate you taking the time to gather our input. From my role as ${stakeholder.role}, I'm ready to discuss how this project can benefit our operations.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const isFollowUpQuestion = (input: string, history: any[]) => {
    const followUpIndicators = ['what about', 'how about', 'can you tell me more', 'elaborate', 'explain further', 'what do you mean', 'clarify']
    return followUpIndicators.some(indicator => input.includes(indicator)) || 
           (history.length > 2 && (input.includes('and') || input.includes('also') || input.includes('but')))
  }

  const generateFollowUpResponse = (input: string, stakeholder: any, history: any[]) => {
    const lastStakeholderMessage = history.filter(msg => msg.speaker === stakeholder.id).slice(-1)[0]
    
    if (lastStakeholderMessage) {
      // Build upon the previous response
      const responses = [
        `To expand on what I mentioned earlier, from my experience in ${stakeholder.department}, I think it's important to consider how this connects to our daily operations and the impact on our team.`,
        `That's a great follow-up question. Building on my previous point, I should mention that in my role as ${stakeholder.role}, I've seen how these kinds of changes can really transform our workflow.`,
        `Let me elaborate on that. When I think about this from the ${stakeholder.department} perspective, there are several additional factors we should consider...`,
        `Good point to dig deeper into. From my experience, this also relates to our priorities around ${stakeholder.priorities[0]} and ${stakeholder.priorities[1]}.`
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
    
    return generateContextualResponse(input, stakeholder)
  }

  const isBusinessQuestion = (input: string) => {
    const businessKeywords = ['process', 'workflow', 'system', 'problem', 'solution', 'improvement', 'challenge', 'pain point', 'efficiency', 'time', 'cost', 'budget', 'team', 'staff', 'training', 'implementation']
    return businessKeywords.some(keyword => input.includes(keyword))
  }

  const generateBusinessResponse = (input: string, stakeholder: any) => {
    // Analyze the specific business topic
    if (input.includes('process') || input.includes('workflow')) {
      return generateProcessResponse(input, stakeholder)
    }
    
    if (input.includes('problem') || input.includes('challenge') || input.includes('pain point')) {
      return generateProblemResponse(input, stakeholder)
    }
    
    if (input.includes('solution') || input.includes('improvement')) {
      return generateSolutionResponse(input, stakeholder)
    }
    
    if (input.includes('time') || input.includes('timeline')) {
      return generateTimeResponse(input, stakeholder)
    }
    
    if (input.includes('cost') || input.includes('budget')) {
      return generateCostResponse(input, stakeholder)
    }
    
    if (input.includes('team') || input.includes('staff') || input.includes('people')) {
      return generateTeamResponse(input, stakeholder)
    }
    
    return generateContextualResponse(input, stakeholder)
  }

  const generateProcessResponse = (input: string, stakeholder: any) => {
    const responses = {
      'Head of Operations': [
        `From an operational standpoint, our current process has several steps that could be streamlined. We're looking at about 6-8 touchpoints that require manual intervention, and I believe we could reduce that significantly with the right approach.`,
        `When I think about our workflow, the main bottleneck is the handoff between departments. Each transition requires manual verification, which creates delays and potential for errors.`
      ],
      'Customer Service Manager': [
        `From a customer perspective, our current process creates some friction points. Customers have to wait for updates, and we don't have great visibility into where their request stands in the workflow.`,
        `The customer-facing side of our process needs improvement. Right now, customers interact with multiple people, and the experience isn't as smooth as it could be.`
      ],
      'IT Systems Lead': [
        `From a technical perspective, our current process involves multiple disconnected systems. We're dealing with data silos and manual data entry that could be eliminated with better integration.`,
        `The technical workflow has some inefficiencies. We're using legacy systems that weren't designed to work together, which creates integration challenges.`
      ],
      'HR Business Partner': [
        `From a people perspective, our current process puts a lot of manual burden on our team members. They're spending time on administrative tasks that could be automated.`,
        `The human side of our process needs attention. Our team members are dealing with repetitive tasks that don't leverage their skills effectively.`
      ],
      'default': [
        `From my perspective in ${stakeholder.department}, the current process has some areas for improvement. We're seeing inefficiencies that impact our ability to deliver the best results.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateProblemResponse = (input: string, stakeholder: any) => {
    const responses = {
      'Head of Operations': [
        `The biggest challenge I see is the lack of standardization across our processes. Each case is handled slightly differently, which makes it hard to predict outcomes and timelines.`,
        `From an operational standpoint, we're dealing with visibility issues. We don't have real-time insight into where bottlenecks are occurring until they become critical.`
      ],
      'Customer Service Manager': [
        `Our main challenge is communication with customers. They often don't know where their request stands, which leads to frustration and additional calls to our support team.`,
        `The biggest pain point for customers is the lack of transparency. They submit a request and then feel like it disappears into a black hole until we get back to them.`
      ],
      'IT Systems Lead': [
        `The technical challenges are significant. We're maintaining multiple systems that should be integrated, and the manual data transfers create opportunities for errors.`,
        `Our biggest problem is system fragmentation. We have data in different places, and keeping everything synchronized is a constant challenge.`
      ],
      'HR Business Partner': [
        `The people-related challenges are concerning. Our team members are experiencing burnout from repetitive tasks, and job satisfaction is declining.`,
        `From an HR perspective, we're seeing efficiency issues that affect morale. People want to do meaningful work, but they're stuck with administrative tasks.`
      ],
      'default': [
        `The main challenges we face relate to ${stakeholder.priorities[0]} and ${stakeholder.priorities[1]}. These issues are impacting our ability to deliver quality results efficiently.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateSolutionResponse = (input: string, stakeholder: any) => {
    const responses = {
      'Head of Operations': [
        `The ideal solution would provide end-to-end visibility and automation. We need standardized workflows with real-time tracking and automated notifications.`,
        `From an operational perspective, we need a unified system that can handle the entire process with minimal manual intervention and clear performance metrics.`
      ],
      'Customer Service Manager': [
        `The perfect solution would give customers real-time visibility into their requests, similar to package tracking. They'd know exactly where things stand without having to call us.`,
        `I envision a solution that provides transparency and proactive communication. Customers should receive automated updates and have self-service options for common requests.`
      ],
      'IT Systems Lead': [
        `The technical solution should be a modern, integrated platform that eliminates our current system silos. We need real-time data synchronization and automated workflows.`,
        `Ideally, we'd have a unified architecture that can scale with our business while providing the integration capabilities we need for current and future systems.`
      ],
      'HR Business Partner': [
        `The solution should automate routine tasks and enable our team to focus on strategic work. We need user-friendly interfaces and clear role definitions.`,
        `From a people perspective, the ideal solution would make work more meaningful by eliminating repetitive tasks and providing better collaboration tools.`
      ],
      'default': [
        `The solution should address our key priorities of ${stakeholder.priorities.join(', ')} while providing the flexibility we need to adapt to changing requirements.`
      ]
    }
    
    const roleResponses = responses[stakeholder.role] || responses['default']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateTimeResponse = (input: string, stakeholder: any) => {
    const responses = [
      `From my experience, timing is crucial for this type of project. We're currently averaging 6-8 weeks for our process, but I believe we can reduce that to 3-4 weeks with the right improvements.`,
      `The timeline depends on several factors, but based on similar initiatives I've been involved in, I'd estimate we could see significant improvements within 3-6 months of implementation.`,
      `Time is definitely a factor we need to consider carefully. We can't afford significant disruptions to our current operations while we're implementing changes.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const generateCostResponse = (input: string, stakeholder: any) => {
    const responses = [
      `Budget considerations are important, but we also need to think about the cost of not making these improvements. The inefficiencies in our current process are costing us both time and money.`,
      `From a cost perspective, we should consider both the upfront investment and the ongoing operational savings. The ROI should be positive within 12-18 months.`,
      `Cost is always a consideration, but we need to balance that against the business impact. The current inefficiencies are affecting our competitive position.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const generateTeamResponse = (input: string, stakeholder: any) => {
    const responses = [
      `Our team is ready for change, but we need to ensure adequate training and support during the transition. Change management will be crucial for success.`,
      `The people aspect is really important. We need to make sure our team members understand the benefits and have the support they need to adapt to new processes.`,
      `From a team perspective, we need to consider both the learning curve and the long-term benefits. Our people are our most valuable asset in making this successful.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const isCasualConversation = (input: string) => {
    const casualKeywords = ['how are you', 'nice to meet', 'thanks', 'thank you', 'appreciate', 'great', 'excellent', 'perfect', 'sounds good']
    return casualKeywords.some(keyword => input.includes(keyword))
  }

  const generateCasualResponse = (input: string, stakeholder: any) => {
    if (input.includes('how are you')) {
      return `I'm doing well, thank you for asking! I'm excited to be part of this discussion about the ${selectedProject?.name} project. It's great to have the opportunity to share insights from the ${stakeholder.department} perspective.`
    }
    
    if (input.includes('nice to meet') || input.includes('pleasure to meet')) {
      return `Likewise! It's great to meet you too. I'm looking forward to this conversation and sharing how we can improve our processes from my experience in ${stakeholder.department}.`
    }
    
    if (input.includes('thank') || input.includes('appreciate')) {
      return `You're very welcome! I'm happy to contribute to this discussion. It's important that we get input from all perspectives to make this project successful.`
    }
    
    if (input.includes('great') || input.includes('excellent') || input.includes('perfect')) {
      return `I'm glad you think so! I believe this collaborative approach will help us identify the best solutions for everyone involved.`
    }
    
    return `I appreciate your engagement in this process. It's this kind of collaborative discussion that leads to the best outcomes for projects like ${selectedProject?.name}.`
  }

  const generateContextualResponse = (input: string, stakeholder: any) => {
    // This is the fallback for general inquiries - analyze the input and respond contextually
    const projectContext = selectedProject?.name || 'our project'
    
    // Try to understand what the user is asking about
    if (input.includes('what') || input.includes('tell me')) {
      return `That's a great question. From my role as ${stakeholder.role} in ${stakeholder.department}, I can share that this relates to our work on ${projectContext}. My main priorities are ${stakeholder.priorities.join(', ')}, so I'm thinking about how this impacts those areas.`
    }
    
    if (input.includes('how') || input.includes('why')) {
      return `From my perspective as ${stakeholder.role}, I think about this in terms of ${stakeholder.priorities[0]} and ${stakeholder.priorities[1]}. In my experience with ${projectContext}, the key is to balance effectiveness with practical implementation.`
    }
    
    if (input.includes('when') || input.includes('timeline')) {
      return `Timing is important for this. Based on my experience in ${stakeholder.department}, I'd say we need to consider both our current capabilities and the time needed for proper implementation of ${projectContext}.`
    }
    
    // Default contextual response
    return `I understand what you're asking about. From my position as ${stakeholder.role}, this connects to our work on ${projectContext} and our priorities around ${stakeholder.priorities[0]}. Let me share my perspective on how this relates to our ${stakeholder.department} operations.`
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