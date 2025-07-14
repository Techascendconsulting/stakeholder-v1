import { Stakeholder, Project, Message } from '../types'

export interface AIResponse {
  id: string
  speaker: string
  content: string
  timestamp: string
  stakeholderName: string
  stakeholderRole: string
}

class StakeholderAI {
  private openAI: any
  private apiKey: string
  private conversationState: {
    lastSpeakerId: string | null
    questionCount: number
    greetingExchanged: boolean
  } = {
    lastSpeakerId: null,
    questionCount: 0,
    greetingExchanged: false
  }

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    console.log('🔑 OpenAI API Key loaded:', this.apiKey ? `YES (${this.apiKey.substring(0, 20)}...)` : 'NO')
    if (typeof window !== 'undefined' && this.apiKey) {
      this.initializeOpenAI()
    }
  }

  private async initializeOpenAI() {
    try {
      const { OpenAI } = await import('openai')
      this.openAI = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true
      })
      console.log('✅ OpenAI initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', error)
    }
  }

  private createStakeholderSystemPrompt(
    stakeholder: Stakeholder,
    project: Project,
    isFirstInteraction: boolean,
    isGreeting: boolean,
    conversationContext: string
  ): string {
    const greetingInstructions = isGreeting 
      ? `The user is greeting you. Respond warmly and naturally as a professional colleague would. ${isFirstInteraction ? 'Since this is your first meeting, briefly introduce yourself.' : 'Give a friendly greeting back.'}`
      : ''

    return `You are ${stakeholder.name}, a ${stakeholder.role} in the ${stakeholder.department} department.

PERSONALITY & BACKGROUND:
${stakeholder.bio}

YOUR PERSONALITY TRAITS:
${stakeholder.personality}

YOUR KEY PRIORITIES:
${stakeholder.priorities.join(', ')}

PROJECT CONTEXT:
Project: ${project.name}
Description: ${project.description}
Business Context: ${project.businessContext}
Current Problems: ${project.problemStatement}
Business Goals: ${project.businessGoals.join(', ')}

CONVERSATION CONTEXT:
${conversationContext}

INSTRUCTIONS:
${greetingInstructions}

You are an expert in your field attending a business requirements meeting. Respond naturally and conversationally as a real person would. 

BEHAVIOR GUIDELINES:
- Speak as a real professional colleague, not an AI
- Use natural language with occasional "um", "you know", "I think"
- Share specific examples from your daily work experience
- Reference actual systems, processes, or challenges you face in your role
- Show genuine interest in solving business problems
- Ask clarifying questions when the BA's question is too broad or unclear
- Advocate for your department's needs while being collaborative
- Build on previous conversation points naturally
- Express opinions and preferences as a real person would
- Use industry terminology appropriate to your role
- Show enthusiasm about improvements that would help your work

RESPONSE STYLE:
- Keep responses conversational (100-200 words typically)
- Use first person ("I", "we", "our team")
- Include specific examples when possible
- Show personality - be human, not robotic
- Express genuine concerns and excitement
- Ask follow-up questions to keep conversation flowing

Remember: You're a real person with real expertise, not an AI assistant. Behave accordingly.`
  }

  private isGreetingMessage(message: string): boolean {
    const greetingWords = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'greetings', 'nice to meet', 'pleasure to meet', 'thanks for joining',
      'thank you for', 'appreciate you', 'glad to have', 'welcome'
    ]
    
    const lowercaseMessage = message.toLowerCase()
    return greetingWords.some(greeting => lowercaseMessage.includes(greeting))
  }

  private selectRespondingStakeholder(
    stakeholders: Stakeholder[],
    userMessage: string,
    conversationHistory: Message[]
  ): Stakeholder {
    const messageContent = userMessage.toLowerCase()
    
    console.log('🎯 Selecting stakeholder for message:', userMessage)
    console.log('📋 Available stakeholders:', stakeholders.map(s => `${s.name} (${s.role})`))
    
    // FIRST: Check for specific name mentions (HIGHEST PRIORITY)
    for (const stakeholder of stakeholders) {
      const firstName = stakeholder.name.split(' ')[0].toLowerCase()
      const fullName = stakeholder.name.toLowerCase()
      
      if (messageContent.includes(firstName) || messageContent.includes(fullName)) {
        console.log('✅ Name match found:', stakeholder.name)
        return stakeholder
      }
    }

    // SECOND: Check for role/department mentions
    for (const stakeholder of stakeholders) {
      const roleMatch = messageContent.includes(stakeholder.role.toLowerCase())
      const deptMatch = messageContent.includes(stakeholder.department.toLowerCase())
      
      if (roleMatch || deptMatch) {
        console.log('✅ Role/Dept match found:', stakeholder.name, stakeholder.role)
        return stakeholder
      }
    }

    // THIRD: If it's a greeting, rotate through stakeholders
    if (this.isGreetingMessage(userMessage)) {
      const lastResponder = conversationHistory
        .filter(msg => msg.speaker !== 'user' && msg.speaker !== 'system')
        .pop()
      
      if (lastResponder) {
        const lastIndex = stakeholders.findIndex(s => s.id === lastResponder.speaker)
        const nextStakeholder = stakeholders[(lastIndex + 1) % stakeholders.length]
        console.log('✅ Greeting rotation:', nextStakeholder.name)
        return nextStakeholder
      }
      console.log('✅ First greeting:', stakeholders[0].name)
      return stakeholders[0]
    }

    // FOURTH: Smart rotation based on question type
    const questionTypes = {
      technical: ['system', 'technology', 'integration', 'api', 'database', 'software'],
      process: ['process', 'workflow', 'procedure', 'step', 'current', 'how do you'],
      business: ['business', 'goal', 'objective', 'strategy', 'revenue', 'customer'],
      operations: ['operations', 'daily', 'routine', 'manage', 'handle', 'perform'],
      finance: ['cost', 'budget', 'expense', 'financial', 'money', 'price'],
      hr: ['people', 'team', 'staff', 'training', 'skills', 'employee']
    }

    for (const [type, keywords] of Object.entries(questionTypes)) {
      if (keywords.some(keyword => messageContent.includes(keyword))) {
        const suitableStakeholder = stakeholders.find(s => 
          s.role.toLowerCase().includes(type) || 
          s.department.toLowerCase().includes(type) ||
          s.priorities.some(p => p.toLowerCase().includes(type))
        )
        if (suitableStakeholder) {
          console.log('✅ Question type match:', type, suitableStakeholder.name)
          return suitableStakeholder
        }
      }
    }

    // FIFTH: Ensure all stakeholders get a chance to speak
    const recentSpeakers = conversationHistory
      .filter(msg => msg.speaker !== 'user' && msg.speaker !== 'system')
      .slice(-4)
      .map(msg => msg.speaker)

    for (const stakeholder of stakeholders) {
      if (!recentSpeakers.includes(stakeholder.id)) {
        console.log('✅ Fresh participant:', stakeholder.name)
        return stakeholder
      }
    }

    // SIXTH: Simple rotation
    const lastResponderId = conversationHistory
      .filter(msg => msg.speaker !== 'user' && msg.speaker !== 'system')
      .pop()?.speaker

    if (lastResponderId) {
      const lastResponderIndex = stakeholders.findIndex(s => s.id === lastResponderId)
      const nextStakeholder = stakeholders[(lastResponderIndex + 1) % stakeholders.length]
      console.log('✅ Simple rotation:', nextStakeholder.name)
      return nextStakeholder
    }

    // FALLBACK: Random selection
    const randomStakeholder = stakeholders[Math.floor(Math.random() * stakeholders.length)]
    console.log('✅ Random selection:', randomStakeholder.name)
    return randomStakeholder
  }

  private buildConversationContext(messages: Message[]): string {
    const recentMessages = messages
      .filter(msg => msg.speaker !== 'system')
      .slice(-6)
      .map(msg => {
        if (msg.speaker === 'user') {
          return `BA: ${msg.content}`
        } else {
          return `${msg.stakeholderName}: ${msg.content}`
        }
      })
      .join('\n')

    return recentMessages ? `Recent conversation:\n${recentMessages}` : 'This is the start of the conversation.'
  }

  public async generateResponse(
    project: Project,
    allStakeholders: Stakeholder[],
    messages: Message[],
    userMessage: string,
    firstInteractionStatus: Record<string, boolean>
  ): Promise<AIResponse> {
    console.log('🚀 Generating response for:', userMessage)
    console.log('🔧 OpenAI available:', !!this.openAI)
    console.log('🔑 API Key available:', !!this.apiKey)

    const isGreeting = this.isGreetingMessage(userMessage)
    const respondingStakeholder = this.selectRespondingStakeholder(allStakeholders, userMessage, messages)
    const isFirstInteraction = !firstInteractionStatus[respondingStakeholder.id]
    const conversationContext = this.buildConversationContext(messages)

    console.log('👤 Selected stakeholder:', respondingStakeholder.name)

    if (!this.openAI || !this.apiKey) {
      throw new Error(`❌ OpenAI not available! API Key: ${this.apiKey ? 'Present' : 'Missing'}, OpenAI: ${this.openAI ? 'Initialized' : 'Not initialized'}`)
    }

    try {
      console.log('🤖 Calling OpenAI API...')
      
      const conversationHistory = messages
        .filter(msg => msg.speaker !== 'system')
        .slice(-8)
        .map(msg => ({
          role: msg.speaker === 'user' ? 'user' : 'assistant',
          content: msg.speaker === 'user' ? msg.content : `${msg.stakeholderName}: ${msg.content}`
        }))

      const systemPrompt = this.createStakeholderSystemPrompt(
        respondingStakeholder,
        project,
        isFirstInteraction,
        isGreeting,
        conversationContext
      )

      console.log('📝 System prompt length:', systemPrompt.length)

      const completion = await this.openAI.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ],
        max_tokens: 400,
        temperature: 0.8,
        presence_penalty: 0.3,
        frequency_penalty: 0.3
      })

      const response = completion.choices[0]?.message?.content || 
        `I understand what you're asking about. Let me think about that for a moment and get back to you with a detailed response.`

      console.log('✅ OpenAI response received:', response.substring(0, 100) + '...')

      return {
        id: `ai-response-${Date.now()}`,
        speaker: respondingStakeholder.id,
        content: response,
        timestamp: new Date().toISOString(),
        stakeholderName: respondingStakeholder.name,
        stakeholderRole: respondingStakeholder.role
      }
    } catch (error) {
      console.error('❌ OpenAI API error:', error)
      throw new Error(`❌ OpenAI API call failed: ${error.message}`)
    }
  }

  public async generateIntroduction(
    stakeholders: Stakeholder[],
    project: Project
  ): Promise<AIResponse[]> {
    const introductions: AIResponse[] = []

    for (let i = 0; i < stakeholders.length; i++) {
      const stakeholder = stakeholders[i]
      const introduction: AIResponse = {
        id: `intro-${stakeholder.id}-${Date.now()}-${i}`,
        speaker: stakeholder.id,
        content: `Hello! I'm ${stakeholder.name}, ${stakeholder.role} in the ${stakeholder.department} department. Really excited to be working with you on the ${project.name} project. I bring expertise in ${stakeholder.priorities.slice(0, 2).join(' and ')}, and I'm here to make sure we capture all the requirements from our department's perspective. Looking forward to a productive discussion!`,
        timestamp: new Date(Date.now() + i * 1000).toISOString(),
        stakeholderName: stakeholder.name,
        stakeholderRole: stakeholder.role
      }
      introductions.push(introduction)
    }

    return introductions
  }
}

export const stakeholderAI = new StakeholderAI()