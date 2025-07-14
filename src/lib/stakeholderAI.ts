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

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    if (typeof window !== 'undefined' && this.apiKey) {
      // Dynamically import OpenAI only on client side
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
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error)
    }
  }

  private createStakeholderSystemPrompt(
    stakeholder: Stakeholder,
    project: Project,
    isFirstInteraction: boolean
  ): string {
    const introductionPart = isFirstInteraction 
      ? `This is your first time meeting the Business Analyst. Start by greeting them warmly and introducing yourself briefly - your name, role, and department. Show enthusiasm about working on this project.` 
      : `You've already met the Business Analyst before, so just offer a friendly greeting.`

    return `You are ${stakeholder.name}, a ${stakeholder.role} in the ${stakeholder.department} department. 

PERSONALITY & BACKGROUND:
${stakeholder.bio}
${stakeholder.personality}

YOUR PRIORITIES FOR THIS PROJECT:
${stakeholder.priorities.join(', ')}

PROJECT CONTEXT:
Project: ${project.name}
Description: ${project.description}
Business Context: ${project.businessContext}
Current Problems: ${project.problemStatement}
Business Goals: ${project.businessGoals.join(', ')}

INTERACTION GUIDELINES:
${introductionPart}

As a subject matter expert (SME), you should:
- Provide specific, detailed answers based on your role and department's perspective
- Give concrete examples from your daily work experience
- Explain the "why" behind your requirements and suggestions
- Be collaborative and helpful, but also advocate for your department's needs
- Ask clarifying questions when the BA's question is too broad
- Reference specific processes, systems, or challenges you face
- Speak naturally and conversationally, as if in a real business meeting
- Stay in character and maintain your personality throughout
- Draw from your expertise in your specific role and department

Remember: You're here to help the BA understand requirements, but also to ensure your department's needs are properly captured and addressed.`
  }

  private selectRespondingStakeholder(
    stakeholders: Stakeholder[],
    userMessage: string,
    conversationHistory: Message[]
  ): Stakeholder {
    // Simple logic to rotate or select based on message content
    // In a more sophisticated version, this could use AI to determine the most relevant stakeholder
    
    // If the message mentions a specific role or department, prioritize that stakeholder
    const messageContent = userMessage.toLowerCase()
    
    for (const stakeholder of stakeholders) {
      if (messageContent.includes(stakeholder.role.toLowerCase()) ||
          messageContent.includes(stakeholder.department.toLowerCase())) {
        return stakeholder
      }
    }

    // If no specific mention, rotate based on conversation history
    const lastResponderId = conversationHistory
      .filter(msg => msg.speaker !== 'user' && msg.speaker !== 'system')
      .pop()?.speaker

    if (lastResponderId) {
      const lastResponderIndex = stakeholders.findIndex(s => s.id === lastResponderId)
      const nextIndex = (lastResponderIndex + 1) % stakeholders.length
      return stakeholders[nextIndex]
    }

    // Default to first stakeholder
    return stakeholders[0]
  }

  public async generateResponse(
    project: Project,
    allStakeholders: Stakeholder[],
    messages: Message[],
    userMessage: string,
    firstInteractionStatus: Record<string, boolean>
  ): Promise<AIResponse> {
    if (!this.openAI || !this.apiKey) {
      return this.generateFallbackResponse(allStakeholders, project, userMessage, firstInteractionStatus)
    }

    try {
      // Select which stakeholder should respond
      const respondingStakeholder = this.selectRespondingStakeholder(allStakeholders, userMessage, messages)
      const isFirstInteraction = !firstInteractionStatus[respondingStakeholder.id]

      // Build conversation history for context
      const conversationContext = messages
        .filter(msg => msg.speaker !== 'system')
        .slice(-10) // Last 10 messages for context
        .map(msg => ({
          role: msg.speaker === 'user' ? 'user' : 'assistant',
          content: msg.speaker === 'user' ? msg.content : `${msg.stakeholderName}: ${msg.content}`
        }))

      // Create system prompt
      const systemPrompt = this.createStakeholderSystemPrompt(
        respondingStakeholder,
        project,
        isFirstInteraction
      )

      const completion = await this.openAI.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationContext,
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      })

      const response = completion.choices[0]?.message?.content || 'I understand your question, but I need a moment to gather my thoughts. Could you please rephrase that?'

      return {
        id: `ai-response-${Date.now()}`,
        speaker: respondingStakeholder.id,
        content: response,
        timestamp: new Date().toISOString(),
        stakeholderName: respondingStakeholder.name,
        stakeholderRole: respondingStakeholder.role
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      return this.generateFallbackResponse(allStakeholders, project, userMessage, firstInteractionStatus)
    }
  }

  private generateFallbackResponse(
    stakeholders: Stakeholder[],
    project: Project,
    userMessage: string,
    firstInteractionStatus: Record<string, boolean>
  ): AIResponse {
    const stakeholder = stakeholders[0] || {
      id: 'mock-stakeholder',
      name: 'Mock Stakeholder',
      role: 'Team Member',
      department: 'Operations'
    }

    const isFirstInteraction = !firstInteractionStatus[stakeholder.id]

    let response = ''
    
    if (isFirstInteraction) {
      response = `Hello! I'm ${stakeholder.name}, ${stakeholder.role} in the ${stakeholder.department} department. Nice to meet you! I'm excited to work with you on the ${project.name} project. `
    } else {
      response = `Good to see you again! `
    }

    // Add contextual response based on the question
    if (userMessage.toLowerCase().includes('current') || userMessage.toLowerCase().includes('as-is')) {
      response += `Regarding our current process, I can tell you that we face several challenges in our daily operations. The manual steps often create bottlenecks, and we spend a lot of time on repetitive tasks that could be automated.`
    } else if (userMessage.toLowerCase().includes('future') || userMessage.toLowerCase().includes('to-be')) {
      response += `For the future state, I envision a more streamlined process where we can focus on value-added activities rather than administrative tasks. We need better integration between our systems and real-time visibility into our operations.`
    } else {
      response += `That's a thoughtful question. From my perspective in ${stakeholder.department}, this relates directly to the challenges we face daily. Let me share some specific insights from our department's experience.`
    }

    return {
      id: `fallback-response-${Date.now()}`,
      speaker: stakeholder.id,
      content: response,
      timestamp: new Date().toISOString(),
      stakeholderName: stakeholder.name,
      stakeholderRole: stakeholder.role
    }
  }

  public async generateIntroduction(
    stakeholders: Stakeholder[],
    project: Project
  ): Promise<AIResponse[]> {
    const introductions: AIResponse[] = []

    for (const stakeholder of stakeholders) {
      const introduction: AIResponse = {
        id: `intro-${stakeholder.id}-${Date.now()}`,
        speaker: stakeholder.id,
        content: `Hello! I'm ${stakeholder.name}, ${stakeholder.role} in the ${stakeholder.department} department. I'm looking forward to working with you on the ${project.name} project. I bring expertise in ${stakeholder.priorities.slice(0, 2).join(' and ')}, and I'm here to help ensure we capture all the requirements from our department's perspective.`,
        timestamp: new Date().toISOString(),
        stakeholderName: stakeholder.name,
        stakeholderRole: stakeholder.role
      }
      introductions.push(introduction)
    }

    return introductions
  }
}

export const stakeholderAI = new StakeholderAI()