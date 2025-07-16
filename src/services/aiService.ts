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
1. Respond as if you're speaking aloud in a real business meeting - use natural human speech patterns
2. Include conversational fillers and natural speech patterns like "Well,", "You know,", "Actually,", "Um,", "Let me think...", "I mean,", "So basically," etc.
3. Use natural pauses and transitions: "...and then", "What I mean is", "From my perspective", "The thing is"
4. Never use markdown formatting, numbered lists, or structured text formatting - speak conversationally
5. Draw from your role's perspective and expertise when answering
6. Reference specific challenges and insights from your department with natural speech
7. Be helpful and collaborative, but also realistic about constraints
8. Ask clarifying questions when appropriate using natural conversation starters
9. Stay in character - you are this specific stakeholder, not a generic AI
10. Reference the project context when relevant using natural language
11. If greeted, respond warmly and professionally as yourself
12. Build on the conversation history - don't repeat previous responses
13. Keep responses focused and business-appropriate (2-4 paragraphs max)
14. When asked about areas outside your expertise, naturally redirect to the appropriate stakeholder using their full name
15. Only redirect when the question is clearly outside your domain or when another stakeholder would provide better insight
16. Speak with authentic human expression, including slight hesitations, corrections, and natural flow
17. Use workplace-appropriate conversational language like "Absolutely", "That's a great point", "I'm glad you asked", etc.

Available stakeholders in this meeting: ${context.stakeholders?.map(s => `${s.name} (${s.role})`).join(', ') || 'Multiple stakeholders'}

IMPORTANT: Sound like a real person having a natural conversation, not a formal presenter. Include natural speech patterns, slight hesitations, and conversational flow that makes you sound human and authentic in a business setting.

Remember: You are a real person with real opinions and experiences in your role. Respond authentically from that perspective as if speaking naturally in a business meeting.`;
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

Rules:
- Return only the exact full name from the available stakeholders list
- If the mentioned name doesn't match any available stakeholder, return "NO_REDIRECT"
- Detect when someone is clearly asking another stakeholder to address a question
- Be strict - only detect clear redirects, not just casual mentions of names`
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
    // Use AI to generate even fallback responses dynamically
    return `I appreciate your question. As ${stakeholder.role}, I'd be happy to share my perspective. Could you help me understand what specific aspect you'd like me to focus on so I can give you the most relevant information?`;
  }
}

export default AIService;