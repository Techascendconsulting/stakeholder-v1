import OpenAI from 'openai'
import { Stakeholder, Project, Message } from '../types'

interface ConversationContext {
  projectId: string
  stakeholderIds: string[]
  messages: Message[]
  meetingType: 'individual' | 'group'
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

class StakeholderAI {
  private conversationHistory: Map<string, Message[]> = new Map()
  private stakeholderContext: Map<string, any> = new Map()

  constructor() {
    // Initialize conversation tracking for each stakeholder
  }

  async generateResponse(
    stakeholderId: string,
    userMessage: string,
    context: ConversationContext,
    project: Project,
    stakeholder: Stakeholder,
    isFollowUpIntroduction: boolean = false
  ): Promise<string> {
    try {
      // Get conversation history for this stakeholder
      const history = this.conversationHistory.get(stakeholderId) || []
      
      // Build the conversation context
      const conversationMessages = this.buildConversationMessages(
        stakeholder,
        project,
        context,
        history,
        userMessage,
        isFollowUpIntroduction
      )

      // Call OpenAI to generate response
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 250,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        stream: false
      })

      const response = completion.choices[0]?.message?.content || "I need to think about that question more carefully."

      // Update conversation history
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        speaker: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      }

      const stakeholderMsg: Message = {
        id: `stakeholder-${Date.now()}`,
        speaker: stakeholderId,
        content: response,
        timestamp: new Date().toISOString(),
        stakeholderName: stakeholder.name,
        stakeholderRole: stakeholder.role
      }

      this.conversationHistory.set(stakeholderId, [...history, userMsg, stakeholderMsg])

      return response

    } catch (error) {
      console.error('OpenAI API Error:', error)
      return this.getFallbackResponse(stakeholder, userMessage)
    }
  }

  private buildConversationMessages(
    stakeholder: Stakeholder,
    project: Project,
    context: ConversationContext,
    history: Message[],
    userMessage: string,
    isFollowUpIntroduction: boolean = false
  ) {
    const messages: any[] = []

    // System prompt - defines the stakeholder's persona and expertise
    messages.push({
      role: "system",
      content: this.buildSystemPrompt(stakeholder, project, context, isFollowUpIntroduction)
    })

    // Add conversation history (last 10 messages to keep context manageable)
    const recentHistory = history.slice(-10)
    recentHistory.forEach(msg => {
      if (msg.speaker === 'user') {
        messages.push({
          role: "user",
          content: msg.content
        })
      } else if (msg.speaker === stakeholder.id) {
        messages.push({
          role: "assistant",
          content: msg.content
        })
      }
    })

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage
    })

    return messages
  }

  private buildSystemPrompt(
    stakeholder: Stakeholder,
    project: Project,
    context: ConversationContext,
    isFollowUpIntroduction: boolean = false
  ): string {
    const isGroupMeeting = context.meetingType === 'group'
    const otherStakeholders = context.stakeholderIds.filter(id => id !== stakeholder.id)
    const isFirstMessage = context.messages.length <= 1
    const hasOtherIntroductions = context.messages.some(msg => 
      msg.speaker !== 'user' && msg.speaker !== stakeholder.id && 
      (msg.content.toLowerCase().includes('hello') || msg.content.toLowerCase().includes('hi') || msg.content.toLowerCase().includes('glad'))
    )

    return `You are ${stakeholder.name}, ${stakeholder.role} at a company. You are participating in a Business Analysis requirements gathering session for the project: "${project.name}".

PROJECT CONTEXT:
${project.description}

BUSINESS CONTEXT:
${project.businessContext}

PROBLEM STATEMENT:
${project.problemStatement}

CURRENT PROCESS:
${project.asIsProcess}

YOUR ROLE & EXPERTISE:
- Position: ${stakeholder.role}
- Department: ${stakeholder.department}
- Background: ${stakeholder.bio}
- Personality: ${stakeholder.personality}
- Key Priorities: ${stakeholder.priorities.join(', ')}

MEETING CONTEXT:
${isGroupMeeting ? 
  `This is a group meeting with multiple stakeholders. Other participants include stakeholders from different departments. You should respond when questions are relevant to your domain or when you have valuable input to add. You can also briefly interact with other stakeholders' points when appropriate.` :
  `This is a one-on-one interview between you and the Business Analyst. You should provide detailed, thoughtful responses about your domain expertise.`
}

${isFirstMessage ? 
  `IMPORTANT: This appears to be the start of the meeting. Begin with a brief, professional greeting and introduction. Mention your name, role, and express readiness to discuss the project. Keep it natural and conversational - like a real business meeting.` :
  isFollowUpIntroduction ? 
    `IMPORTANT: Another stakeholder just introduced themselves. You should now naturally introduce yourself as well, following their lead. Keep it brief but professional - mention your name, role, and readiness to contribute. This is natural meeting etiquette where participants introduce themselves in turn.` :
    `IMPORTANT: This is an ongoing conversation. Do not introduce yourself again unless specifically asked. Respond directly to the question or topic at hand.`
}

INSTRUCTIONS:
9. When discussing requirements, always include:
13. Be helpful and responsive - you're here to provide valuable insights
- Reference specific challenges you face in your role
- Use terminology appropriate for your department
- Keep responses focused but comprehensive (2-5 sentences)
${isFirstMessage ? '- Start with a brief greeting and introduction' : 
  isFollowUpIntroduction ? '- Introduce yourself naturally after the previous stakeholder' : 
  '- Respond directly to the question without re-introducing yourself'}
- Always provide actionable insights, not generic responses
- Include specific metrics, timelines, or examples when relevant

Remember: You are a real person with real expertise, not a generic AI assistant. Respond as ${stakeholder.name} would, drawing from your deep experience in ${stakeholder.department}.`
  }

  private getFallbackResponse(stakeholder: Stakeholder, userMessage: string): string {
    const fallbacks = [
      `That's an important question about our ${stakeholder.department} processes. Let me think about the specific requirements from our perspective and get back to you with details.`,
      `From my experience in ${stakeholder.role}, that touches on some key challenges we face. I'd like to provide you with a comprehensive answer that includes the business reasoning behind our needs.`,
      `That's definitely something we need to address in ${stakeholder.department}. Let me gather my thoughts on the specific requirements and business justification.`
    ]
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  // Method to check if OpenAI is configured
  isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY
  }

  // Clear conversation history for a stakeholder
  clearHistory(stakeholderId: string): void {
    this.conversationHistory.delete(stakeholderId)
  }

  // Get conversation history for a stakeholder
  getHistory(stakeholderId: string): Message[] {
    return this.conversationHistory.get(stakeholderId) || []
  }
}

export const stakeholderAI = new StakeholderAI()