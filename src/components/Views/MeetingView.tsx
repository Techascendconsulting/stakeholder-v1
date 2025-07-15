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
    const stakeholderId = stakeholder.id || stakeholder.name
    
    // Get previous responses for this stakeholder
    const previousResponses = responseHistory.get(stakeholderId) || []
    
    // Get recent context from conversation
    const recentMessages = conversationHistory.slice(-6)
    const recentContext = recentMessages.map(m => m.content).join(' ').toLowerCase()
    
    // Get stakeholder context for variation functions
    const roleContext = getStakeholderContext(stakeholder)
    
    // Generate dynamic response based on stakeholder expertise and question context
    const response = generateDynamicResponse(stakeholder, question, recentContext, conversationHistory)
    
    // Enhanced duplicate detection and response variation
    let finalResponse = response
    let attempts = 0
    while (isSimilarResponse(finalResponse, previousResponses) && attempts < 5) {
      finalResponse = addResponseVariation(response, attempts, stakeholder, roleContext)
      attempts++
    }
    
    // If still similar after variations, force a completely different approach
    if (isSimilarResponse(finalResponse, previousResponses)) {
      finalResponse = generateAlternativeResponse(stakeholder, question, roleContext, conversationHistory)
    }
    
    // Track this response
    const updatedHistory = new Map(responseHistory)
    updatedHistory.set(stakeholderId, [...previousResponses, finalResponse])
    setResponseHistory(updatedHistory)
    
    return finalResponse
  }

  const generateDynamicResponse = (stakeholder: any, question: string, context: string, conversationHistory: Message[]) => {
    const questionAnalysis = analyzeQuestion(question, context)
    const roleContext = getStakeholderContext(stakeholder)
    const conversationContext = getConversationContext(conversationHistory)
    
    return buildResponse(questionAnalysis, roleContext, conversationContext, stakeholder)
  }

  const analyzeQuestion = (question: string, context: string) => {
    const lowerQuestion = question.toLowerCase()
    const lowerContext = context.toLowerCase()
    
    const analysis = {
      type: 'general',
      focus: [] as string[],
      intent: 'information',
      scope: 'specific',
      keywords: [] as string[],
      questionStarters: [] as string[]
    }
    
    // Determine question type
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
      analysis.type = 'greeting'
    } else if (lowerQuestion.includes('full') || lowerQuestion.includes('complete') || lowerQuestion.includes('entire')) {
      analysis.type = 'comprehensive'
      analysis.scope = 'full'
    } else if (lowerQuestion.includes('what') && (lowerQuestion.includes('information') || lowerQuestion.includes('data'))) {
      analysis.type = 'information'
    } else if (lowerQuestion.includes('process') || lowerQuestion.includes('workflow') || lowerQuestion.includes('steps')) {
      analysis.type = 'process'
    } else if (lowerQuestion.includes('time') || lowerQuestion.includes('duration') || lowerQuestion.includes('long')) {
      analysis.type = 'timing'
    } else if (lowerQuestion.includes('challenge') || lowerQuestion.includes('problem') || lowerQuestion.includes('issue')) {
      analysis.type = 'challenge'
    } else if (lowerQuestion.includes('improve') || lowerQuestion.includes('better') || lowerQuestion.includes('enhance')) {
      analysis.type = 'improvement'
    } else if (lowerQuestion.includes('what') || lowerQuestion.includes('how') || lowerQuestion.includes('why')) {
      analysis.type = 'inquiry'
      analysis.intent = 'explanation'
    }
    
    // Extract question starters
    if (lowerQuestion.includes('what')) analysis.questionStarters.push('what')
    if (lowerQuestion.includes('how')) analysis.questionStarters.push('how')
    if (lowerQuestion.includes('why')) analysis.questionStarters.push('why')
    if (lowerQuestion.includes('when')) analysis.questionStarters.push('when')
    if (lowerQuestion.includes('where')) analysis.questionStarters.push('where')
    
    // Extract focus areas
    if (lowerQuestion.includes('customer') || lowerContext.includes('customer')) {
      analysis.focus.push('customer')
    }
    if (lowerQuestion.includes('system') || lowerQuestion.includes('technical') || lowerQuestion.includes('technology')) {
      analysis.focus.push('technical')
    }
    if (lowerQuestion.includes('staff') || lowerQuestion.includes('team') || lowerQuestion.includes('people')) {
      analysis.focus.push('people')
    }
    if (lowerQuestion.includes('operation') || lowerQuestion.includes('workflow') || lowerQuestion.includes('process')) {
      analysis.focus.push('operational')
    }
    
    // Extract key terms
    const keyTerms = ['application', 'verification', 'approval', 'document', 'onboarding', 'department', 'efficiency', 'quality', 'security', 'training']
    analysis.keywords = keyTerms.filter(term => lowerQuestion.includes(term) || lowerContext.includes(term))
    
    return analysis
  }

  const getStakeholderContext = (stakeholder: any) => {
    const contexts = {
      'Customer Service Manager': {
        expertise: 'customer experience',
        perspective: 'customer-facing',
        priorities: ['customer satisfaction', 'service quality', 'communication'],
        metrics: ['response time', 'resolution rate', 'satisfaction scores'],
        challenges: ['customer expectations', 'communication gaps', 'process complexity'],
        solutions: ['better communication tools', 'streamlined processes', 'proactive support'],
        typical_responses: ['customer feedback shows', 'from our service experience', 'our customers often tell us']
      },
      'Head of Operations': {
        expertise: 'operational efficiency',
        perspective: 'process-focused',
        priorities: ['efficiency', 'quality control', 'resource optimization'],
        metrics: ['processing time', 'accuracy rates', 'throughput volume'],
        challenges: ['capacity constraints', 'coordination between teams', 'quality consistency'],
        solutions: ['process automation', 'resource allocation', 'workflow optimization'],
        typical_responses: ['operationally speaking', 'our workflow data shows', 'from a process perspective']
      },
      'IT Systems Lead': {
        expertise: 'technical systems',
        perspective: 'technology-focused',
        priorities: ['system reliability', 'security', 'integration'],
        metrics: ['system uptime', 'processing speed', 'error rates'],
        challenges: ['legacy system limitations', 'integration complexity', 'scalability issues'],
        solutions: ['system modernization', 'API integration', 'automated workflows'],
        typical_responses: ['technically speaking', 'our system architecture', 'from an IT standpoint']
      },
      'HR Business Partner': {
        expertise: 'people management',
        perspective: 'people-focused',
        priorities: ['team development', 'training effectiveness', 'change management'],
        metrics: ['employee satisfaction', 'training completion rates', 'retention'],
        challenges: ['skill development', 'change resistance', 'team coordination'],
        solutions: ['enhanced training programs', 'better collaboration tools', 'support systems'],
        typical_responses: ['from a people perspective', 'our team experience shows', 'in terms of human resources']
      }
    }
    
    return contexts[stakeholder.role] || {
      expertise: 'general business operations',
      perspective: 'holistic business view',
      priorities: ['effectiveness', 'efficiency', 'quality'],
      metrics: ['performance indicators', 'outcome measures', 'satisfaction levels'],
      challenges: ['complexity management', 'resource coordination', 'quality assurance'],
      solutions: ['process improvement', 'better coordination', 'optimization'],
      typical_responses: ['from my experience', 'in my role', 'based on our work']
    }
  }

  const getConversationContext = (conversationHistory: Message[]) => {
    const recentMessages = conversationHistory.slice(-4)
    const topics = new Set<string>()
    const concerns = new Set<string>()
    
    recentMessages.forEach(msg => {
      const content = msg.content.toLowerCase()
      
      // Extract topics
      if (content.includes('process') || content.includes('workflow')) topics.add('process flow')
      if (content.includes('information') || content.includes('data')) topics.add('information requirements')
      if (content.includes('department') || content.includes('team')) topics.add('organizational structure')
      if (content.includes('customer') || content.includes('client')) topics.add('customer experience')
      if (content.includes('system') || content.includes('technical')) topics.add('technical systems')
      if (content.includes('time') || content.includes('duration')) topics.add('timing and efficiency')
      
      // Extract concerns
      if (content.includes('repeat') || content.includes('duplicate')) concerns.add('redundancy')
      if (content.includes('fragmented') || content.includes('disconnected')) concerns.add('integration')
      if (content.includes('manual') || content.includes('complex')) concerns.add('complexity')
      if (content.includes('slow') || content.includes('delay')) concerns.add('efficiency')
    })
    
    return { 
      topics: Array.from(topics), 
      concerns: Array.from(concerns) 
    }
  }

  const buildResponse = (questionAnalysis: any, roleContext: any, conversationContext: any, stakeholder: any) => {
    // Build response based on question type
    switch (questionAnalysis.type) {
      case 'greeting':
        return buildGreetingResponse(roleContext, stakeholder)
      case 'comprehensive':
        return buildComprehensiveResponse(questionAnalysis, roleContext, conversationContext, stakeholder)
      case 'inquiry':
        return buildInquiryResponse(questionAnalysis, roleContext, conversationContext, stakeholder)
      case 'process':
        return buildProcessResponse(questionAnalysis, roleContext, conversationContext, stakeholder)
      case 'information':
        return buildInformationResponse(questionAnalysis, roleContext, conversationContext, stakeholder)
      case 'timing':
        return buildTimingResponse(questionAnalysis, roleContext, conversationContext, stakeholder)
      case 'challenge':
        return buildChallengeResponse(questionAnalysis, roleContext, conversationContext, stakeholder)
      case 'improvement':
        return buildImprovementResponse(questionAnalysis, roleContext, conversationContext, stakeholder)
      default:
        return buildGeneralResponse(questionAnalysis, roleContext, conversationContext, stakeholder)
    }
  }

  const buildGreetingResponse = (roleContext: any, stakeholder: any) => {
    const greetingStarters = ["Hello!", "Hi there!", "Good morning!", "Great to connect!"]
    const starter = greetingStarters[Math.floor(Math.random() * greetingStarters.length)]
    
    return `${starter} I'm ${stakeholder.name}, and I'm excited to share insights from my ${roleContext.expertise} perspective. I focus on ${roleContext.priorities.slice(0, 2).join(' and ')}, and I can provide valuable context on how our current processes impact ${roleContext.perspective} operations.`
  }

  const buildComprehensiveResponse = (questionAnalysis: any, roleContext: any, conversationContext: any, stakeholder: any) => {
    const intro = `Let me walk you through our complete process from my ${roleContext.expertise} perspective.`
    
    const processSteps = generateProcessSteps(roleContext, questionAnalysis)
    const metricsInfo = `We track ${roleContext.metrics.slice(0, 2).join(' and ')} to measure effectiveness.`
    const challenges = `Key challenges include ${roleContext.challenges.slice(0, 2).join(' and ')}.`
    const solutions = `We're addressing these through ${roleContext.solutions.slice(0, 2).join(' and ')}.`
    
    return `${intro} ${processSteps} ${metricsInfo} ${challenges} ${solutions}`
  }

  const buildInquiryResponse = (questionAnalysis: any, roleContext: any, conversationContext: any, stakeholder: any) => {
    const acknowledgments = ["That's an excellent question.", "I'm glad you asked about that.", "That's definitely something we deal with regularly."]
    const ack = acknowledgments[Math.floor(Math.random() * acknowledgments.length)]
    
    const explanation = generateExplanation(questionAnalysis, roleContext, conversationContext)
    
    return `${ack} ${explanation}`
  }

  const buildProcessResponse = (questionAnalysis: any, roleContext: any, conversationContext: any, stakeholder: any) => {
    const processVariants = [
      () => buildProcessResponseVariant1(roleContext, conversationContext, stakeholder),
      () => buildProcessResponseVariant2(roleContext, conversationContext, stakeholder),
      () => buildProcessResponseVariant3(roleContext, conversationContext, stakeholder)
    ]
    
    const selectedVariant = processVariants[Math.floor(Math.random() * processVariants.length)]
    return selectedVariant()
  }

  const buildProcessResponseVariant1 = (roleContext: any, conversationContext: any, stakeholder: any) => {
    const processOverview = `Our current process from a ${roleContext.expertise} perspective involves coordinated efforts to ensure ${roleContext.priorities.slice(0, 2).join(' and ')}.`
    const specificSteps = generateSpecificSteps(roleContext, conversationContext)
    const challenges = `We face challenges with ${roleContext.challenges.slice(0, 2).join(' and ')}.`
    const improvements = `We're working on ${roleContext.solutions.slice(0, 2).join(' and ')} to improve this.`
    
    return `${processOverview} ${specificSteps} ${challenges} ${improvements}`
  }

  const buildProcessResponseVariant2 = (roleContext: any, conversationContext: any, stakeholder: any) => {
    const priorities = getRandomSubset(roleContext.priorities, 2)
    const challenges = getRandomSubset(roleContext.challenges, 2)
    const solutions = getRandomSubset(roleContext.solutions, 2)
    
    return `Let me break down how we approach this from a ${roleContext.expertise} standpoint. The workflow centers around ${priorities[0]} as our primary focus, while maintaining ${priorities[1]} throughout. We've structured our process to handle ${challenges[0]} proactively, though ${challenges[1]} still presents ongoing difficulties. Our current improvement initiatives include ${solutions[0]} and ${solutions[1]}, which we believe will strengthen our overall approach.`
  }

  const buildProcessResponseVariant3 = (roleContext: any, conversationContext: any, stakeholder: any) => {
    const contextualReference = conversationContext.topics.length > 0 
      ? `Given our earlier discussion about ${conversationContext.topics[0]}, ` 
      : ''
    
    const metric = roleContext.metrics[Math.floor(Math.random() * roleContext.metrics.length)]
    const challenge = roleContext.challenges[Math.floor(Math.random() * roleContext.challenges.length)]
    const solution = roleContext.solutions[Math.floor(Math.random() * roleContext.solutions.length)]
    
    return `${contextualReference}our ${roleContext.expertise} process is designed around continuous improvement. We measure success through ${metric} and have identified ${challenge} as a key area for enhancement. The process itself prioritizes ${roleContext.priorities[0]} while balancing ${roleContext.priorities[1]} requirements. We're actively implementing ${solution} to address current limitations and improve overall effectiveness.`
  }

  const buildInformationResponse = (questionAnalysis: any, roleContext: any, conversationContext: any, stakeholder: any) => {
    const infoContext = questionAnalysis.keywords.length > 0 ? `regarding ${questionAnalysis.keywords.slice(0, 2).join(' and ')}` : 'for our process'
    const requirements = `The information we collect ${infoContext} is essential for ${roleContext.priorities.slice(0, 2).join(' and ')}.`
    const methods = `From my ${roleContext.expertise} perspective, we use multiple collection methods to ensure ${roleContext.priorities[0]}.`
    const support = `Our team provides support throughout this process, focusing on ${roleContext.priorities.slice(0, 2).join(' and ')}.`
    
    return `${requirements} ${methods} ${support}`
  }

  const buildTimingResponse = (questionAnalysis: any, roleContext: any, conversationContext: any, stakeholder: any) => {
    const timeContext = `From my ${roleContext.expertise} perspective, timing is influenced by our focus on ${roleContext.priorities.slice(0, 2).join(' and ')}.`
    const factors = `Key factors affecting timing include ${roleContext.challenges.slice(0, 2).join(' and ')}.`
    const metrics = `We monitor ${roleContext.metrics.slice(0, 2).join(' and ')} to track performance.`
    const improvements = `We're implementing ${roleContext.solutions.slice(0, 2).join(' and ')} to improve timing.`
    
    return `${timeContext} ${factors} ${metrics} ${improvements}`
  }

  const buildChallengeResponse = (questionAnalysis: any, roleContext: any, conversationContext: any, stakeholder: any) => {
    // Add randomness to structure and content
    const responseVariants = [
      () => buildChallengeResponseVariant1(roleContext, conversationContext),
      () => buildChallengeResponseVariant2(roleContext, conversationContext),
      () => buildChallengeResponseVariant3(roleContext, conversationContext),
      () => buildChallengeResponseVariant4(roleContext, conversationContext)
    ]
    
    const selectedVariant = responseVariants[Math.floor(Math.random() * responseVariants.length)]
    return selectedVariant()
  }

  const buildChallengeResponseVariant1 = (roleContext: any, conversationContext: any) => {
    const challengeIntros = [
      `The biggest obstacles we're dealing with right now are`,
      `What keeps me up at night from a ${roleContext.expertise} standpoint is`,
      `The most pressing concerns in our ${roleContext.expertise} area involve`,
      `If I'm being honest, our main struggles center around`
    ]
    
    const intro = challengeIntros[Math.floor(Math.random() * challengeIntros.length)]
    const challenges = getRandomSubset(roleContext.challenges, 2)
    const detail = generateChallengeDetail(challenges[0], roleContext)
    const impact = generateImpactStatement(roleContext)
    const action = generateActionStatement(roleContext)
    
    return `${intro} ${challenges.join(' and ')}. ${detail} ${impact} ${action}`
  }

  const buildChallengeResponseVariant2 = (roleContext: any, conversationContext: any) => {
    const contextualStart = conversationContext.topics.length > 0 
      ? `Building on what we've discussed about ${conversationContext.topics[0]}, `
      : ``
    
    const challenges = getRandomSubset(roleContext.challenges, 2)
    const metrics = getRandomSubset(roleContext.metrics, 2)
    
    return `${contextualStart}Our ${roleContext.expertise} team faces several key challenges. ${challenges[0]} is particularly problematic because it affects our ability to maintain ${roleContext.priorities[0]}. We're seeing this reflected in our ${metrics[0]} data. Meanwhile, ${challenges[1]} creates additional complexity that impacts ${roleContext.priorities[1]}. We're actively working on ${roleContext.solutions[0]} to address these issues.`
  }

  const buildChallengeResponseVariant3 = (roleContext: any, conversationContext: any) => {
    const priorities = getRandomSubset(roleContext.priorities, 2)
    const solutions = getRandomSubset(roleContext.solutions, 2)
    
    return `Let me share some specific examples of what we're dealing with. Our focus on ${priorities[0]} is being challenged by ${roleContext.challenges[0]}, which creates bottlenecks in our workflow. Additionally, ${roleContext.challenges[1]} makes it difficult to achieve our ${priorities[1]} goals. We measure the impact through ${roleContext.metrics[0]}, and we're implementing ${solutions[0]} alongside ${solutions[1]} to create sustainable improvements.`
  }

  const buildChallengeResponseVariant4 = (roleContext: any, conversationContext: any) => {
    const challenge = roleContext.challenges[Math.floor(Math.random() * roleContext.challenges.length)]
    const solution = roleContext.solutions[Math.floor(Math.random() * roleContext.solutions.length)]
    const metric = roleContext.metrics[Math.floor(Math.random() * roleContext.metrics.length)]
    
    return `From my day-to-day experience, ${challenge} stands out as our most significant challenge. This isn't just theory - it's something our team encounters regularly. The ripple effects touch everything from ${roleContext.priorities[0]} to ${roleContext.priorities[1]}. We're tracking progress through ${metric} and have committed resources to ${solution}. It's a complex situation, but we're seeing gradual improvements as we implement these changes.`
  }

  const generateChallengeDetail = (challenge: string, roleContext: any) => {
    const details = [
      `This creates bottlenecks that slow down our entire ${roleContext.expertise} process.`,
      `The impact on our ${roleContext.priorities[0]} is significant and measurable.`,
      `We see this affecting our team's ability to deliver on ${roleContext.priorities[1]}.`,
      `This challenge directly conflicts with our ${roleContext.expertise} objectives.`
    ]
    return details[Math.floor(Math.random() * details.length)]
  }

  const generateImpactStatement = (roleContext: any) => {
    const impacts = [
      `The consequences ripple through our ${roleContext.priorities[0]} metrics.`,
      `This affects our ability to meet ${roleContext.priorities[1]} expectations.`,
      `We're seeing direct impacts on ${roleContext.metrics[0]} performance.`,
      `The challenge creates cascading effects across our ${roleContext.expertise} operations.`
    ]
    return impacts[Math.floor(Math.random() * impacts.length)]
  }

  const generateActionStatement = (roleContext: any) => {
    const actions = [
      `We're tackling this through ${roleContext.solutions[0]} and monitoring progress closely.`,
      `Our response involves ${roleContext.solutions[1]} with regular assessment of ${roleContext.metrics[0]}.`,
      `We've prioritized ${roleContext.solutions[0]} as our primary intervention strategy.`,
      `The team is implementing ${roleContext.solutions[1]} while tracking ${roleContext.metrics[1]} improvements.`
    ]
    return actions[Math.floor(Math.random() * actions.length)]
  }

  const getRandomSubset = (array: any[], count: number) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  const buildImprovementResponse = (questionAnalysis: any, roleContext: any, conversationContext: any, stakeholder: any) => {
    const opportunities = `From my ${roleContext.expertise} perspective, we have several improvement opportunities.`
    const solutions = `Key areas for enhancement include ${roleContext.solutions.slice(0, 2).join(' and ')}.`
    const benefits = `These improvements would enhance our ${roleContext.priorities.slice(0, 2).join(' and ')} capabilities.`
    const metrics = `We'd measure success through improved ${roleContext.metrics.slice(0, 2).join(' and ')}.`
    
    return `${opportunities} ${solutions} ${benefits} ${metrics}`
  }

  const buildGeneralResponse = (questionAnalysis: any, roleContext: any, conversationContext: any, stakeholder: any) => {
    const context = `From my ${roleContext.expertise} perspective, this relates to our ${roleContext.priorities.slice(0, 2).join(' and ')} objectives.`
    const relevance = `This is particularly relevant because it affects ${roleContext.priorities[0]}, which we measure through ${roleContext.metrics[0]}.`
    const approach = `Our approach involves ${roleContext.solutions.slice(0, 2).join(' and ')}.`
    
    return `${context} ${relevance} ${approach}`
  }

  // Helper functions for generating dynamic content
  const generateProcessSteps = (roleContext: any, questionAnalysis: any) => {
    const stepTemplates = {
      'customer experience': 'We start with customer application intake, followed by verification and approval, then onboarding and ongoing support.',
      'operational efficiency': 'Our process involves intake, processing, quality control, and fulfillment with coordination between multiple teams.',
      'technical systems': 'The technical process includes system integration, automated workflows, validation, and quality assurance checks.',
      'people management': 'Our people process focuses on training, coordination, performance management, and continuous improvement.'
    }
    
    return stepTemplates[roleContext.expertise] || `Our process involves multiple coordinated steps focusing on ${roleContext.priorities.join(', ')}.`
  }

  const generateExplanation = (questionAnalysis: any, roleContext: any, conversationContext: any) => {
    const questionType = questionAnalysis.questionStarters[0] || 'general'
    
    const explanationTemplates = {
      'how': `From my ${roleContext.expertise} approach, we handle this through ${roleContext.solutions[0]} while focusing on ${roleContext.priorities[0]}.`,
      'what': `This involves ${roleContext.priorities.slice(0, 2).join(' and ')}, which are core to our ${roleContext.expertise} responsibilities.`,
      'why': `This is essential for maintaining ${roleContext.priorities[0]} in our ${roleContext.expertise} operations, as measured by ${roleContext.metrics[0]}.`,
      'when': `The timing depends on our ${roleContext.priorities[0]} requirements and ${roleContext.challenges[0]} constraints.`,
      'where': `This happens within our ${roleContext.expertise} domain, particularly affecting ${roleContext.priorities[0]}.`
    }
    
    return explanationTemplates[questionType] || `This is an important aspect of our ${roleContext.expertise} work that impacts ${roleContext.priorities[0]}.`
  }

  const generateSpecificSteps = (roleContext: any, conversationContext: any) => {
    const contextualSteps = conversationContext.topics.length > 0 
      ? `Specifically for ${conversationContext.topics[0]}, we follow structured procedures.`
      : `We follow established procedures for all activities.`
    
    return `${contextualSteps} This involves ${roleContext.priorities.slice(0, 2).join(' and ')} at each stage.`
  }

  const isSimilarResponse = (newResponse: string, previousResponses: string[]) => {
    const normalizeResponse = (text: string) => {
      return text.toLowerCase()
        .replace(/[.,!?;:]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    const normalizedNew = normalizeResponse(newResponse)
    const words = normalizedNew.split(' ')
    
    return previousResponses.some(prev => {
      const normalizedPrev = normalizeResponse(prev)
      const prevWords = normalizedPrev.split(' ')
      
      // Check for significant word overlap (>70%)
      const commonWords = words.filter(word => prevWords.includes(word))
      const similarity = commonWords.length / Math.max(words.length, prevWords.length)
      
      return similarity > 0.7
    })
  }

  const addResponseVariation = (response: string, attempt: number, stakeholder: any, roleContext: any) => {
    const variations = [
      () => response.replace(/^([A-Z][^.]*\.)/, `Looking at this from a ${roleContext.expertise} perspective, `),
      () => response.replace(/we face/g, 'our team encounters').replace(/We track/g, 'Our monitoring shows'),
      () => response.replace(/challenges/g, 'obstacles').replace(/solutions/g, 'approaches'),
      () => response.replace(/primary/g, 'main').replace(/particularly/g, 'especially'),
      () => `Based on my ${roleContext.expertise} experience, ` + response.replace(/^[A-Z][^.]*\.\s*/, ''),
      () => response.replace(/include/g, 'involve').replace(/through/g, 'via'),
      () => response.replace(/addressing/g, 'tackling').replace(/implementing/g, 'deploying')
    ]
    
    if (attempt < variations.length) {
      return variations[attempt]()
    }
    
    return response
  }

  const generateAlternativeResponse = (stakeholder: any, question: string, roleContext: any, conversationHistory: Message[]) => {
    const lowerQuestion = question.toLowerCase()
    
    // Generate completely different structure/approach
    if (lowerQuestion.includes('challenge') || lowerQuestion.includes('issue')) {
      return generatePersonalizedChallengeResponse(roleContext, stakeholder)
    }
    
    if (lowerQuestion.includes('process') || lowerQuestion.includes('workflow')) {
      return generatePersonalizedProcessResponse(roleContext, stakeholder)
    }
    
    return generatePersonalizedGeneralResponse(roleContext, stakeholder, question)
  }

  const generatePersonalizedChallengeResponse = (roleContext: any, stakeholder: any) => {
    const personalTouches = [
      `Speaking from ${stakeholder.name.split(' ')[0]}'s perspective,`,
      `In my role as ${stakeholder.role},`,
      `From where I sit in ${roleContext.expertise},`,
      `Having worked in ${roleContext.expertise} for years,`
    ]
    
    const challenge = roleContext.challenges[Math.floor(Math.random() * roleContext.challenges.length)]
    const solution = roleContext.solutions[Math.floor(Math.random() * roleContext.solutions.length)]
    const metric = roleContext.metrics[Math.floor(Math.random() * roleContext.metrics.length)]
    
    const personal = personalTouches[Math.floor(Math.random() * personalTouches.length)]
    
    return `${personal} I'd say our biggest hurdle right now is ${challenge}. This isn't just a theoretical problem - it's something I deal with every day. The way it manifests in our work is through reduced ${roleContext.priorities[0]} and impacts on ${roleContext.priorities[1]}. What we're doing about it is focusing on ${solution}, and we measure our progress through ${metric}. It's a work in progress, but we're committed to seeing it through.`
  }

  const generatePersonalizedProcessResponse = (roleContext: any, stakeholder: any) => {
    const processDescriptions = [
      `Our ${roleContext.expertise} workflow begins with`,
      `The way we handle ${roleContext.priorities[0]} starts with`,
      `From a ${roleContext.expertise} standpoint, we first`,
      `In terms of ${roleContext.priorities[1]}, our approach involves`
    ]
    
    const description = processDescriptions[Math.floor(Math.random() * processDescriptions.length)]
    
    return `${description} coordinated efforts across our team. We focus heavily on ${roleContext.priorities[0]} while ensuring ${roleContext.priorities[1]} remains a priority. The key metrics we watch are ${roleContext.metrics[0]} and ${roleContext.metrics[1]}. Our main challenge is ${roleContext.challenges[0]}, which we're addressing through ${roleContext.solutions[0]}. It's a complex process, but one that works well when all the pieces come together.`
  }

  const generatePersonalizedGeneralResponse = (roleContext: any, stakeholder: any, question: string) => {
    const generalStarters = [
      `That's a great question about`,
      `From my ${roleContext.expertise} background, I can tell you that`,
      `Having dealt with this in ${roleContext.expertise}, I'd say`,
      `In my experience with ${roleContext.priorities[0]},`
    ]
    
    const starter = generalStarters[Math.floor(Math.random() * generalStarters.length)]
    
    return `${starter} this touches on several aspects of our work. We prioritize ${roleContext.priorities[0]} and ${roleContext.priorities[1]} in everything we do. The challenge is balancing ${roleContext.challenges[0]} with our need for ${roleContext.solutions[0]}. We track success through ${roleContext.metrics[0]}, which gives us a clear picture of where we stand. It's an evolving situation that requires constant attention and adjustment.`
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