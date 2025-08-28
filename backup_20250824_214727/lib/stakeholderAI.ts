// Mock stakeholder AI service
import { Stakeholder, Project, Message, Student } from './database'

export interface AIResponse {
  id: string
  speaker: string
  content: string
  timestamp: string
  stakeholderName: string
  stakeholderRole: string
}

class StakeholderAI {
  public async generateResponse(
    project: Project,
    allStakeholders: Stakeholder[],
    messages: Message[],
    userMessage: string,
    baId: string,
    firstInteractionStatus: Record<string, boolean>
  ): Promise<AIResponse> {
    // Mock implementation
    const stakeholder = allStakeholders[0] || {
      id: 'mock-stakeholder',
      name: 'Mock Stakeholder',
      role: 'Team Member'
    }

    const responses = [
      `That's a great question about ${project.name}. From my perspective as ${stakeholder.role}, I can tell you that our current process involves several manual steps that could be streamlined.`,
      `In my experience, the main challenge we face is the lack of integration between our systems. This creates delays and potential for errors.`,
      `I think the ideal solution would automate much of what we do manually today, while still giving us the flexibility to handle exceptions.`,
      `The current process typically takes about 2 to 3 hours per case, but with the right improvements, we could reduce that significantly.`,
      `From our department's standpoint, we need to ensure any new solution maintains our quality standards while improving efficiency.`
    ]

    const response = responses[Math.floor(Math.random() * responses.length)]

    return {
      id: `ai-response-${Date.now()}`,
      speaker: stakeholder.id,
      content: response,
      timestamp: new Date().toISOString(),
      stakeholderName: stakeholder.name,
      stakeholderRole: stakeholder.role
    }
  }
}

export const stakeholderAI = new StakeholderAI()