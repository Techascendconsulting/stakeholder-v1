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
        // Brief but warm greetings
        maxTokens: Math.max(
          Math.floor(teamComplexityFactor * 60), 
          Math.floor((6 - teamComplexityFactor) * 35)
        ),
        // Higher creativity for natural greetings, moderated by team size
        temperature: Math.min(
          0.9, 
          0.6 + (teamComplexityFactor * 0.1) + (stakeholderCount < 4 ? 0.1 : 0)
        ),
        historyLimit: Math.max(1, Math.min(stakeholderCount - 1, Math.floor(teamComplexityFactor * 2)))
      },
      discussion: {
        // More human-like response length: enough to express a complete thought
        maxTokens: Math.max(
          Math.floor(teamComplexityFactor * 120), 
          Math.min(
            Math.floor((8 - stakeholderCount) * 50), 
            Math.floor(280 + (conversationMaturityFactor * 100))
          )
        ),
        // Balanced creativity for natural conversation
        temperature: Math.min(
          0.85, 
          0.65 + (teamComplexityFactor * 0.08) + (conversationMaturityFactor * 0.05)
        ),
        historyLimit: Math.max(
          Math.floor(teamComplexityFactor * 2), 
          Math.min(stakeholderCount + Math.floor(conversationMaturityFactor * 3), 8)
        )
      },
      handoff: {
        // More sensitive detection
        maxTokens: Math.max(
          Math.floor(teamComplexityFactor * 20), 
          Math.floor((7 - stakeholderCount) * 12)
        ),
        // Slightly higher temperature for better natural language understanding
        temperature: Math.max(
          0.1, 
          Math.min(0.4, 0.2 + (teamComplexityFactor * 0.04))
        ),
        historyLimit: Math.max(1, Math.min(Math.floor(teamComplexityFactor), 4))
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

  // Generate comprehensive interview notes from meeting data
  async generateInterviewNotes(meetingData: any): Promise<string> {
    try {
      const { project, participants, messages, startTime, endTime, duration, user } = meetingData;
      
      // Format conversation for AI analysis
      const conversationTranscript = messages.map((msg: any) => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        if (msg.speaker === 'user') {
          return `[${time}] Business Analyst: ${msg.content}`;
        } else {
          return `[${time}] ${msg.stakeholderName} (${msg.stakeholderRole}): ${msg.content}`;
        }
      }).join('\n');

      const prompt = `You are a professional business analyst creating comprehensive interview notes from a stakeholder meeting. 

MEETING DETAILS:
- Project: ${project.name}
- Date: ${new Date(startTime).toLocaleDateString()} 
- Start Time: ${new Date(startTime).toLocaleTimeString()}
- End Time: ${new Date(endTime).toLocaleTimeString()}
- Duration: ${duration} minutes
- Facilitator: ${user}
- Participants: ${participants.map((p: any) => `${p.name} (${p.role}, ${p.department})`).join(', ')}

CONVERSATION TRANSCRIPT:
${conversationTranscript}

Please generate comprehensive interview notes in the following format:

# Interview Notes: ${project.name}

## Meeting Information
- **Date:** ${new Date(startTime).toLocaleDateString()}
- **Time:** ${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()} (${duration} minutes)
- **Facilitator:** ${user}
- **Project:** ${project.name}
- **Project Type:** ${project.type}

## Participants
${participants.map((p: any) => `- **${p.name}** - ${p.role}, ${p.department}`).join('\n')}

## Executive Summary
[Provide a 2-3 sentence overview of the meeting's main purpose and outcomes]

## Key Discussion Points
[Organize the main topics discussed with bullet points and sub-points]

## Stakeholder Insights
[For each stakeholder, summarize their key contributions, concerns, and perspectives]

## Process Information Gathered
[Document any process steps, workflows, or procedural information shared]

## Pain Points Identified
[List current challenges and issues mentioned by stakeholders]

## Requirements and Needs
[Document any requirements, needs, or requests identified]

## Action Items and Follow-ups
[List any next steps, action items, or follow-up meetings mentioned]

## Additional Notes
[Any other relevant information or observations]

---
*Notes generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*

Make the notes professional, comprehensive, and well-organized. Focus on extracting actionable insights and maintaining the context of who said what.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent, professional output
        max_tokens: 2000 // Longer output for comprehensive notes
      });

      return completion.choices[0]?.message?.content || this.getFallbackNotes(meetingData);
    } catch (error) {
      console.error('Error generating interview notes:', error);
      return this.getFallbackNotes(meetingData);
    }
  }

  // Fallback notes generation if AI fails
  private getFallbackNotes(meetingData: any): string {
    const { project, participants, messages, startTime, endTime, duration, user } = meetingData;
    
    return `# Interview Notes: ${project.name}

## Meeting Information
- **Date:** ${new Date(startTime).toLocaleDateString()}
- **Time:** ${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()} (${duration} minutes)
- **Facilitator:** ${user}
- **Project:** ${project.name}

## Participants
${participants.map((p: any) => `- **${p.name}** - ${p.role}, ${p.department}`).join('\n')}

## Conversation Summary
The meeting included ${messages.filter((m: any) => m.speaker !== 'user').length} stakeholder responses and covered various aspects of the ${project.name} project.

## Raw Transcript
${messages.map((msg: any) => {
  const time = new Date(msg.timestamp).toLocaleTimeString();
  if (msg.speaker === 'user') {
    return `[${time}] Business Analyst: ${msg.content}`;
  } else {
    return `[${time}] ${msg.stakeholderName} (${msg.stakeholderRole}): ${msg.content}`;
  }
}).join('\n')}

---
*Notes generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*
*Note: This is a basic transcript. For detailed analysis, please review the conversation manually.*`;
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
1. Respond naturally like a human in a business meeting - give complete thoughts but stay conversational
2. Share enough information to be helpful, but don't dump everything at once - think "one complete idea per response"
3. Use natural speech patterns: "Well,", "You know,", "Actually,", "Um,", "Let me think...", "I mean,"
4. Express your thoughts fully but then invite interaction: "What do you think about that?" or "Does that make sense?"
5. BE CONVERSATIONAL, not formal - you're having a discussion, not giving a presentation
6. When explaining processes, share a meaningful step or two, then check if they want more detail
7. Use phrases like "From my experience..." or "What I typically see is..." to make it personal and authentic
8. It's perfectly fine to say "I'm not sure about that part" or "That's really [colleague's] area"
9. Give enough context to be useful - humans don't speak in single sentences in business meetings
10. End with natural conversation connectors that invite engagement
11. Think out loud briefly: "Hmm, that's interesting..." or "You know, I've seen this before..."
12. Be authentic - pause to think, admit uncertainties, speak like you're genuinely considering the question
13. Share one meaningful point with enough detail to be useful, then see where the conversation goes
14. Use collaborative language: "Maybe [Name] has additional insights?" or "What's been your experience?"
15. Sound like a helpful colleague who's genuinely engaged in solving the problem together

CRITICAL: Respond like a real person who's thoughtfully contributing to a business discussion. Give enough information to be valuable, but stay conversational and invite continued dialogue.

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
      prompt += `\nCONVERSATION FLOW: You are participating in a natural business discussion with ${context.stakeholders?.length || 'several'} people. Give thoughtful, complete responses that contribute meaningfully to the discussion. After sharing your perspective, naturally invite continued conversation or collaboration.\n`;
    }

    const teamSize = context.stakeholders?.length || 3;
    const responseGuidance = teamSize > 5 ? 'focused and efficient' : teamSize > 3 ? 'clear and collaborative' : 'detailed and engaging';
    
    prompt += `\nRESPONSE APPROACH:
- Provide ${responseGuidance} responses appropriate for this ${teamSize}-person team
- Share one complete, meaningful idea with sufficient context
- Think out loud naturally and express your genuine perspective
- End with engagement that invites continued discussion
- Be authentically helpful while staying conversational
- Give enough detail to be valuable without overwhelming

User just said: "${userMessage}"\n\nRespond naturally as ${context.conversationHistory.length > 0 ? 'part of this ongoing conversation' : 'the start of this meeting'}. Share your perspective thoughtfully and keep the discussion flowing.`;

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
- "Sarah, could you please shed some light on what we cover in this call?"
- "Aisha, could you help us understand..."
- "What would you add to this, [Name]?"
- "[Name], from your experience..."
- "I think [Name] would know more about this"
- "[Name], what's your view?"
- "[Name], care to elaborate?"
- "Over to you, [Name]"

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