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

  // Dynamic AI configuration based on context and conversation type
  private getAIConfig(responseType: 'greeting' | 'discussion' | 'handoff' = 'discussion', stakeholderCount: number = 3, conversationLength: number = 0) {
    // Derive all constants from contextual factors
    const teamComplexityFactor = Math.log(stakeholderCount + 1) / Math.log(2); // Logarithmic scaling for team complexity
    const conversationMaturityFactor = Math.min(conversationLength / 10, 1); // How established the conversation is
    
    const baseConfigs = {
      greeting: {
        // Shorter responses for larger groups to prevent chaos
        maxTokens: Math.max(
          Math.floor(teamComplexityFactor * 40), 
          Math.floor((6 - teamComplexityFactor) * 25)
        ),
        // Higher creativity for natural greetings, moderated by team size
        temperature: Math.min(
          0.9, 
          0.6 + (teamComplexityFactor * 0.1) + (stakeholderCount < 4 ? 0.1 : 0)
        ),
        historyLimit: Math.max(1, Math.min(stakeholderCount - 1, Math.floor(teamComplexityFactor * 2)))
      },
      discussion: {
        // Adaptive response length: shorter for larger groups, longer for complex topics
        maxTokens: Math.max(
          Math.floor(teamComplexityFactor * 60), 
          Math.min(
            Math.floor((8 - stakeholderCount) * 30), 
            Math.floor(180 + (conversationMaturityFactor * 70))
          )
        ),
        // Higher creativity for natural conversation, adjusted for group dynamics
        temperature: Math.min(
          0.9, 
          0.65 + (teamComplexityFactor * 0.08) + (conversationMaturityFactor * 0.05)
        ),
        historyLimit: Math.max(
          Math.floor(teamComplexityFactor * 2), 
          Math.min(stakeholderCount + Math.floor(conversationMaturityFactor * 3), 8)
        )
      },
      handoff: {
        // Very focused detection, minimal tokens needed
        maxTokens: Math.max(
          Math.floor(teamComplexityFactor * 15), 
          Math.floor((7 - stakeholderCount) * 8)
        ),
        // Low temperature for consistent detection, slightly higher for larger teams
        temperature: Math.max(
          0.05, 
          Math.min(0.3, 0.15 + (teamComplexityFactor * 0.03))
        ),
        historyLimit: Math.max(1, Math.min(Math.floor(teamComplexityFactor), 3))
      }
    }
    
    return baseConfigs[responseType]
  }

  async generateStakeholderResponse(
    userMessage: string,
    stakeholder: StakeholderContext,
    context: ConversationContext,
    responseType: 'greeting' | 'discussion' = 'discussion'
  ): Promise<string> {
    try {
      const aiConfig = this.getAIConfig(responseType, context.stakeholders?.length || 3, context.conversationHistory.length);
      const systemPrompt = this.buildSystemPrompt(stakeholder, context);
      const conversationPrompt = this.buildConversationPrompt(userMessage, context, stakeholder, aiConfig.historyLimit);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: conversationPrompt }
        ],
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens,
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
1. Keep responses VERY SHORT - aim for brief, natural conversation turns appropriate for a ${context.stakeholders?.length || 'small'}-person team
2. Share only ONE point or step at a time, then stop and wait for follow-up questions
3. Use natural speech patterns: "Well,", "You know,", "Actually,", "Um,", "Let me think...", "I mean,"
4. Ask questions back to keep the conversation flowing: "What specifically are you looking for?" or "Does that help?" or "Should I go into more detail on that?"
5. BE CONVERSATIONAL, not informative - you're chatting, not presenting
6. If explaining a process, share just the FIRST step, then ask if they want to hear what happens next
7. Use phrases like "From my side..." or "What I typically do is..." to make it personal
8. It's okay to say "I'm not sure about that part" or "That's handled by [team]"
9. Never list multiple steps or dump information - real people don't talk that way
10. End responses with questions or natural conversation enders to invite interaction
11. Think out loud: "Hmm, let me think about that..." or "Well, the way I see it..."
12. Be authentic - admit uncertainties, pause to think, speak like you're remembering
13. STOP after making ONE point - don't elaborate unless asked
14. Use collaborative language: "Maybe we should ask [Name] about that?" or "What do you think?"
15. Keep the energy conversational and light, not formal or instructional

CRITICAL: Your response should feel like someone briefly answering in a real meeting, not giving a presentation. Share one thing, then see what they say back.

Available stakeholders in this meeting: ${context.stakeholders?.map(s => `${s.name} (${s.role})`).join(', ') || 'Multiple stakeholders'}

IMPORTANT: Sound like a real person having a natural conversation, not a formal presenter. Include natural speech patterns, slight hesitations, and conversational flow that makes you sound human and authentic in a business setting.

Remember: You are a real person with real opinions and experiences in your role. Respond authentically from that perspective as if speaking naturally in a business meeting.`;
  }

  private buildConversationPrompt(userMessage: string, context: ConversationContext, currentStakeholder: StakeholderContext, historyLimit: number): string {
    let prompt = `Recent conversation history:\n`;
    
    // Include last 5 messages for context
    const recentMessages = context.conversationHistory.slice(-historyLimit);
    recentMessages.forEach(msg => {
      if (msg.speaker === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else if (msg.speaker !== 'system') {
        prompt += `${msg.stakeholderName || 'Stakeholder'}: ${msg.content}\n`;
      }
    });

    // Analyze if the user is directly addressing this stakeholder
    const isDirectlyAddressed = this.isDirectlyAddressed(userMessage, context, currentStakeholder);
    
    // Check if this is a group greeting or group message
    const isGroupGreeting = this.isGroupGreeting(userMessage);
    
    if (isDirectlyAddressed) {
      prompt += `\nIMPORTANT: The user is directly addressing YOU in their message. They may be thanking others but the question or request is specifically for you. Respond as the person being directly asked.\n`;
    } else if (isGroupGreeting) {
      prompt += `\nIMPORTANT: The user is greeting the entire group. Respond as yourself joining the group greeting. Keep it brief, warm, and friendly - other stakeholders will also be responding. Don't dominate the conversation or share detailed information in a greeting response.\n`;
    } else {
      prompt += `\nCONVERSATION FLOW: You are participating in a natural business discussion with ${context.stakeholders?.length || 'several'} people. Keep it brief and interactive. After sharing ONE point, consider asking a follow-up question or naturally inviting another stakeholder to contribute. Never dump multiple pieces of information at once.\n`;
    }

    const teamSize = context.stakeholders?.length || 3;
    const responseGuidance = teamSize > 5 ? 'extra brief' : teamSize > 3 ? 'concise' : 'conversational';
    
    prompt += `\nCRITICAL RESPONSE RULES:
- Keep responses ${responseGuidance} for this ${teamSize}-person team
- Share only ONE idea, step, or point per response
- End with a question or natural conversation opener
- Think out loud briefly, then ask for their thoughts
- Stop after making your point - don't elaborate unless asked
- Make it feel like a quick back-and-forth chat, not a lecture

User just said: "${userMessage}"\n\nRespond BRIEFLY as ${context.conversationHistory.length > 0 ? 'part of this ongoing conversation' : 'the start of this meeting'}. Remember: ONE point, then stop and engage.`;

    return prompt;
  }

  // Helper function to detect group greetings
  private isGroupGreeting(userMessage: string): boolean {
    const message = userMessage.toLowerCase();
    
    const groupGreetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)\s+(everyone|guys|team|all|folks)/,
      /^(hi|hello|hey)\s+(there|y'all)/,
      /^(good morning|good afternoon|good evening)(?:\s+everyone)?$/,
      /^(hi|hello|hey)(?:\s+team)?$/,
    ];
    
    return groupGreetingPatterns.some(pattern => pattern.test(message));
  }

  // Helper function to detect if a stakeholder is being directly addressed
  private isDirectlyAddressed(userMessage: string, context: ConversationContext, currentStakeholder: StakeholderContext): boolean {
    const message = userMessage.toLowerCase();
    const stakeholderFirstName = currentStakeholder.name.split(' ')[0].toLowerCase();
    const stakeholderFullName = currentStakeholder.name.toLowerCase();
    
    // Look for direct addressing patterns that mention this stakeholder's name
    const directAddressingPatterns = [
      // Pattern: "Name, verb" or "Name verb" 
      new RegExp(`(${stakeholderFirstName}|${stakeholderFullName}),?\\s+(let's|can you|could you|would you|please|tell me|what|how|why|where|when|share|explain|describe|walk me through)`),
      // Pattern: "Name, I want" or "Name, I need"
      new RegExp(`(${stakeholderFirstName}|${stakeholderFullName}),?\\s+(i want|i need|i would like|i'd like)`),
      // Pattern: "Thanks X, Name verb" - after acknowledgment
      new RegExp(`thanks?\\s+\\w+,?\\s+(${stakeholderFirstName}|${stakeholderFullName})\\s+(let's|can you|could you|would you|please|tell me|what|how|why|where|when|share|explain|describe|walk me through)`),
    ];
    
    for (const pattern of directAddressingPatterns) {
      if (pattern.test(message)) {
        return true;
      }
    }
    
    return false;
  }

  // Function to intelligently detect if a stakeholder's response redirects to another stakeholder
  async detectStakeholderRedirect(response: string, availableStakeholders: StakeholderContext[]): Promise<StakeholderContext | null> {
    try {
      const aiConfig = this.getAIConfig('handoff', availableStakeholders.length, 0);
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
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens
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

  // Function to detect natural conversation passing (turn-taking)
  async detectConversationHandoff(response: string, availableStakeholders: StakeholderContext[]): Promise<StakeholderContext | null> {
    try {
      const aiConfig = this.getAIConfig('handoff', availableStakeholders.length, 0);
      const stakeholderNames = availableStakeholders.map(s => s.name).join(', ');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are analyzing a stakeholder's response in a business meeting to detect if they are naturally passing the conversation to another stakeholder.

Available stakeholders: ${stakeholderNames}

Your task: Determine if the response contains a natural conversation handoff to another stakeholder and if so, return ONLY the exact name of the target stakeholder. If no handoff is detected, return "NO_HANDOFF".

Examples of natural handoffs:
- "What do you think, Sarah?"
- "James, you might have insights on this"
- "I'd love to hear Michael's perspective on this"
- "Sarah, what's your take on this?"
- "That's something David could speak to better"

Rules:
- Return only the exact full name from the available stakeholders list
- If the mentioned name doesn't match any available stakeholder, return "NO_HANDOFF"
- Detect natural conversation passing, not formal redirects
- Look for conversational cues that invite someone else to speak
- Be contextual - only detect when someone is genuinely inviting another person to contribute
- Ignore casual name mentions that don't invite participation
- Focus on end-of-response invitations and natural conversation flow cues`
          },
          {
            role: "user",
            content: `Response to analyze: "${response}"`
          }
        ],
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens
      });

      const result = completion.choices[0]?.message?.content?.trim();
      
      if (!result || result === "NO_HANDOFF") {
        return null;
      }

      // Find the stakeholder by exact name match
      const targetStakeholder = availableStakeholders.find(s => s.name === result);
      return targetStakeholder || null;

    } catch (error) {
      console.error('Error detecting conversation handoff:', error);
      return null;
    }
  }

  private getFallbackResponse(stakeholder: StakeholderContext, userMessage: string): string {
    // Generate dynamic fallback responses based on stakeholder context
    const questionStarters = [
      "Could you help me understand what specific part you're most interested in?",
      "What aspect would be most helpful for you to know about?", 
      "What would you like me to focus on first?",
      "What specific area are you looking to understand better?"
    ];
    
    const thoughtStarters = [
      "Hmm, let me think about that for a second.",
      "That's a good question.",
      "Well, let me start with what I know best.",
      "Good point. Let me think..."
    ];
    
    const roleContext = stakeholder.role ? `From my role as ${stakeholder.role}, ` : "";
    const randomThought = thoughtStarters[Math.floor(Math.random() * thoughtStarters.length)];
    const randomQuestion = questionStarters[Math.floor(Math.random() * questionStarters.length)];
    
    return `${randomThought} ${roleContext}${randomQuestion}`;
  }
}

export default AIService;