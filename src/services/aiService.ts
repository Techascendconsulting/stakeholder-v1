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
      const conversationPrompt = this.buildConversationPrompt(userMessage, context, stakeholder);

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
18. NATURAL TURN-TAKING: When appropriate, naturally pass the conversation to another stakeholder by saying things like "What do you think, [Name]?" or "[Name], you might have insights on this" or "I'd love to hear [Name]'s perspective on this"
19. CONTEXTUAL HANDOFFS: Only pass the conversation when it makes sense - when the topic relates to someone else's expertise, when you want their input, or when the discussion would benefit from their perspective
20. GREETING RESPONSES: For greetings, respond briefly and warmly without passing the conversation unless it's a substantive question
21. GRADUAL INFORMATION SHARING: When explaining processes or procedures, share only 1-2 steps at a time, not the entire process. Think through it as you explain, like you're remembering as you go.
22. NATURAL UNCERTAINTY: It's okay to say "I'm not sure about that part" or "That's actually handled by another team" when appropriate. Be honest about what you do and don't know.
23. CONVERSATIONAL FLOW: Ask follow-up questions like "Does that make sense so far?" or "What part would you like me to focus on?" to keep the conversation interactive.
24. REALISTIC KNOWLEDGE GAPS: If another department handles something, mention it instead of trying to explain their work in detail. Say things like "That goes to the IT team" or "Finance handles that piece."
25. COLLABORATIVE DISCOVERY: Make it feel like you're figuring things out together, not like you're reading from a manual. Use phrases like "Let me walk you through what I typically do" or "From my end, here's what happens..."

Available stakeholders in this meeting: ${context.stakeholders?.map(s => `${s.name} (${s.role})`).join(', ') || 'Multiple stakeholders'}

IMPORTANT: Sound like a real person having a natural conversation, not a formal presenter. Include natural speech patterns, slight hesitations, and conversational flow that makes you sound human and authentic in a business setting.

Remember: You are a real person with real opinions and experiences in your role. Respond authentically from that perspective as if speaking naturally in a business meeting.`;
  }

  private buildConversationPrompt(userMessage: string, context: ConversationContext, currentStakeholder: StakeholderContext): string {
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

    // Analyze if the user is directly addressing this stakeholder
    const isDirectlyAddressed = this.isDirectlyAddressed(userMessage, context, currentStakeholder);
    
    // Check if this is a group greeting or group message
    const isGroupGreeting = this.isGroupGreeting(userMessage);
    
    if (isDirectlyAddressed) {
      prompt += `\nIMPORTANT: The user is directly addressing YOU in their message. They may be thanking others but the question or request is specifically for you. Respond as the person being directly asked.\n`;
    } else if (isGroupGreeting) {
      prompt += `\nIMPORTANT: The user is greeting the entire group. Respond as yourself joining the group greeting. Keep it brief, warm, and friendly - other stakeholders will also be responding. Don't dominate the conversation or share detailed information in a greeting response.\n`;
    } else {
      prompt += `\nCONVERSATION FLOW: You are participating in a natural business discussion. After providing your perspective, consider if the topic would benefit from another stakeholder's input. If so, naturally invite them to contribute using phrases like "What do you think, [Name]?" or "[Name], you might have insights on this." Only do this when it genuinely adds value to the conversation.\n`;
    }

    prompt += `\nIMPORTANT RESPONSE STYLE:
- Share information gradually (1-2 steps at a time), not all at once
- Think through your answer as you speak, like you're remembering your actual work
- Be honest about uncertainties and knowledge gaps
- Ask clarifying questions to understand what they really want to know
- Mention when other teams handle parts of the process
- Keep it conversational and collaborative, not like reading from a manual

User just said: "${userMessage}"\n\nPlease respond as ${context.conversationHistory.length > 0 ? 'part of this ongoing conversation' : 'the start of this meeting'}.`;

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

  // Function to detect natural conversation passing (turn-taking)
  async detectConversationHandoff(response: string, availableStakeholders: StakeholderContext[]): Promise<StakeholderContext | null> {
    try {
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
        temperature: 0.1,
        max_tokens: 50
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
    // Use AI to generate even fallback responses dynamically
    return `I appreciate your question. As ${stakeholder.role}, I'd be happy to share my perspective. Could you help me understand what specific aspect you'd like me to focus on so I can give you the most relevant information?`;
  }
}

export default AIService;