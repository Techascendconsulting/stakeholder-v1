import OpenAI from 'openai';
import { Message } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here',
  dangerouslyAllowBrowser: true
});

export interface StakeholderContext {
  name: string;
  role: string;
  department: string;
  priorities: string[];
  personality: string;
  expertise: string[];
}

export interface ConversationContext {
  project: {
    name: string;
    description: string;
    type: string;
  };
  conversationHistory: Message[];
  stakeholders?: StakeholderContext[];
  currentTopic?: string;
}

export class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateStakeholderResponse(
    userMessage: string,
    stakeholder: StakeholderContext,
    context: ConversationContext
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(stakeholder, context);
      const conversationPrompt = this.buildConversationPrompt(userMessage, context);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: conversationPrompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return completion.choices[0]?.message?.content || 
        this.getFallbackResponse(stakeholder, userMessage);
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(stakeholder, userMessage);
    }
  }

  private buildSystemPrompt(stakeholder: StakeholderContext, context: ConversationContext): string {
    return `You are ${stakeholder.name}, a ${stakeholder.role} at a company. You are participating in a stakeholder requirements gathering meeting for the project "${context.project.name}".

Your Background:
- Role: ${stakeholder.role}
- Department: ${stakeholder.department}
- Key Priorities: ${stakeholder.priorities.join(', ')}
- Personality: ${stakeholder.personality}
- Areas of Expertise: ${stakeholder.expertise.join(', ')}

Project Context:
- Project Name: ${context.project.name}
- Project Description: ${context.project.description}
- Project Type: ${context.project.type}

Your Behavior Guidelines:
1. Respond naturally and conversationally, as if you're in a real business meeting
2. Draw from your role's perspective and expertise when answering
3. Reference specific challenges and insights from your department
4. Be helpful and collaborative, but also realistic about constraints
5. Ask clarifying questions when appropriate
6. Stay in character - you are this specific stakeholder, not a generic AI
7. Reference the project context when relevant
8. If greeted, respond warmly and professionally as yourself
9. Build on the conversation history - don't repeat previous responses
10. Keep responses focused and business-appropriate (2-4 paragraphs max)
11. When asked about areas outside your expertise, naturally redirect to the appropriate stakeholder using their full name
12. Use natural language to redirect: "That's a great question for [Full Name]" or "[Full Name], could you address that?"
13. Only redirect when the question is clearly outside your domain or when another stakeholder would provide better insight

Available stakeholders in this meeting: ${context.stakeholders?.map(s => `${s.name} (${s.role})`).join(', ') || 'Multiple stakeholders'}

Remember: You are a real person with real opinions and experiences in your role. Respond authentically from that perspective.`;
  }

  private buildConversationPrompt(userMessage: string, context: ConversationContext): string {
    let prompt = `Recent conversation history:\n`;
    
    // Include last 5 messages for context
    const recentMessages = context.conversationHistory.slice(-5);
    recentMessages.forEach(msg => {
      if (msg.speaker === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else if (msg.speaker !== 'system') {
        prompt += `${msg.stakeholderName || 'Stakeholder'}: ${msg.content}\n`;
      }
    });

    prompt += `\nUser just said: "${userMessage}"\n\nPlease respond as ${context.conversationHistory.length > 0 ? 'part of this ongoing conversation' : 'the start of this meeting'}.`;

    return prompt;
  }

  // Function to intelligently detect if a stakeholder's response redirects to another stakeholder
  async detectStakeholderRedirect(response: string, availableStakeholders: StakeholderContext[]): Promise<StakeholderContext | null> {
    try {
      const stakeholderNames = availableStakeholders.map(s => s.name).join(', ');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are analyzing a stakeholder's response in a business meeting to detect if they are redirecting a question to another stakeholder.

Available stakeholders: ${stakeholderNames}

Your task: Determine if the response redirects to another stakeholder and if so, return ONLY the exact name of the target stakeholder. If no redirect is detected, return "NO_REDIRECT".

Examples:
- "That's a great question for James Walker" → "James Walker"
- "Sarah, could you speak to that?" → "Sarah Patel" (if Sarah Patel is available)
- "I think David would be better suited to answer this" → "David Thompson" (if David Thompson is available)
- "I can answer that myself..." → "NO_REDIRECT"

Rules:
- Return only the exact full name from the available stakeholders list
- If the mentioned name doesn't match any available stakeholder, return "NO_REDIRECT"
- Be strict - only detect clear redirects, not just mentions`
          },
          {
            role: "user",
            content: `Response to analyze: "${response}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      });

      const result = completion.choices[0]?.message?.content?.trim();
      
      if (!result || result === "NO_REDIRECT") {
        return null;
      }

      // Find the stakeholder by exact name match
      const targetStakeholder = availableStakeholders.find(s => s.name === result);
      return targetStakeholder || null;

    } catch (error) {
      console.error('Error detecting stakeholder redirect:', error);
      return null;
    }
  }

  private getFallbackResponse(stakeholder: StakeholderContext, userMessage: string): string {
    const input = userMessage.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return `Hello! I'm ${stakeholder.name}, ${stakeholder.role}. Great to meet you and discuss this project. How can I help you understand our current processes and challenges?`;
    }

    return `Thanks for that question. As ${stakeholder.role}, I'd be happy to share my perspective. Could you help me understand what specific aspect you'd like me to focus on? I want to make sure I give you the most relevant information from my department's standpoint.`;
  }
}

export default AIService;