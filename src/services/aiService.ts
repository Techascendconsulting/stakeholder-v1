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

  // Enhanced stakeholder memory system
  private extractStakeholderMemory(stakeholder: StakeholderContext, conversationHistory: any[]): string {
    const stakeholderMessages = conversationHistory.filter(msg => 
      msg.stakeholderName === stakeholder.name || msg.speaker === stakeholder.name
    );
    
    if (stakeholderMessages.length === 0) return '';
    
    const recentMessages = stakeholderMessages.slice(-3);
    const keyTopics = this.extractKeyTopics(recentMessages);
    const personalCommitments = this.extractPersonalCommitments(recentMessages);
    
    let memoryContext = '';
    if (keyTopics.length > 0) {
      memoryContext += `\nPREVIOUS TOPICS YOU'VE DISCUSSED: ${keyTopics.join(', ')}`;
    }
    if (personalCommitments.length > 0) {
      memoryContext += `\nYOUR PREVIOUS COMMITMENTS/STATEMENTS: ${personalCommitments.join('; ')}`;
    }
    
    return memoryContext;
  }

  private extractKeyTopics(messages: any[]): string[] {
    const topics: string[] = [];
    const topicKeywords = [
      'process', 'system', 'workflow', 'efficiency', 'cost', 'quality', 'timeline',
      'requirements', 'challenges', 'solutions', 'implementation', 'budget', 'resources'
    ];
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      topicKeywords.forEach(keyword => {
        if (content.includes(keyword) && !topics.includes(keyword)) {
          topics.push(keyword);
        }
      });
    });
    
    return topics.slice(0, 3); // Limit to top 3 topics
  }

  private extractPersonalCommitments(messages: any[]): string[] {
    const commitments: string[] = [];
    const commitmentPatterns = [
      /i will|i'll|i can|i could|i would|i should/gi,
      /let me|allow me|i'll make sure|i'll ensure/gi,
      /my team|we will|we can|we should|we'll/gi
    ];
    
    messages.forEach(msg => {
      commitmentPatterns.forEach(pattern => {
        const matches = msg.content.match(pattern);
        if (matches) {
          // Extract the sentence containing the commitment
          const sentences = msg.content.split(/[.!?]/);
          sentences.forEach(sentence => {
            if (pattern.test(sentence) && sentence.trim().length > 10) {
              commitments.push(sentence.trim());
            }
          });
        }
      });
    });
    
    return commitments.slice(0, 2); // Limit to top 2 commitments
  }

  // Enhanced cross-stakeholder awareness
  private buildStakeholderAwareness(currentStakeholder: StakeholderContext, context: ConversationContext): string {
    const otherStakeholders = context.stakeholders?.filter(s => s.name !== currentStakeholder.name) || [];
    
    if (otherStakeholders.length === 0) return '';
    
    const recentInteractions = this.getRecentInteractions(currentStakeholder, context.conversationHistory);
    const departmentalRelationships = this.getDepartmentalRelationships(currentStakeholder, otherStakeholders);
    
    let awarenessContext = '\nSTAKEHOLDER AWARENESS:\n';
    
    if (recentInteractions.length > 0) {
      awarenessContext += `Recent interactions: ${recentInteractions.join('; ')}\n`;
    }
    
    if (departmentalRelationships.length > 0) {
      awarenessContext += `Key relationships: ${departmentalRelationships.join('; ')}\n`;
    }
    
    return awarenessContext;
  }

  private getRecentInteractions(currentStakeholder: StakeholderContext, conversationHistory: any[]): string[] {
    const interactions: string[] = [];
    const recentMessages = conversationHistory.slice(-10);
    
    recentMessages.forEach((msg, index) => {
      if (msg.stakeholderName && msg.stakeholderName !== currentStakeholder.name) {
        // Check if the next message is from current stakeholder (indicating an interaction)
        const nextMsg = recentMessages[index + 1];
        if (nextMsg && nextMsg.stakeholderName === currentStakeholder.name) {
          interactions.push(`${msg.stakeholderName} mentioned ${this.extractKeyPhrase(msg.content)}`);
        }
      }
    });
    
    return interactions.slice(0, 3); // Limit to 3 recent interactions
  }

  private getDepartmentalRelationships(currentStakeholder: StakeholderContext, otherStakeholders: StakeholderContext[]): string[] {
    const relationships: string[] = [];
    
    // Define common departmental relationships
    const departmentRelations: { [key: string]: string[] } = {
      'Operations': ['IT', 'Customer Service', 'Finance', 'Supply Chain'],
      'IT': ['Operations', 'Security', 'Compliance', 'All Departments'],
      'Customer Service': ['Operations', 'Sales', 'Marketing', 'Product'],
      'Finance': ['Operations', 'Compliance', 'Executive', 'All Departments'],
      'Compliance': ['IT', 'Finance', 'Legal', 'Operations'],
      'HR': ['All Departments', 'Executive', 'Operations'],
      'Sales': ['Customer Service', 'Marketing', 'Product', 'Finance'],
      'Marketing': ['Sales', 'Product', 'Customer Service'],
      'Product': ['Sales', 'Marketing', 'IT', 'Customer Service']
    };
    
    const currentDept = currentStakeholder.department;
    const relatedDepts = departmentRelations[currentDept] || [];
    
    otherStakeholders.forEach(stakeholder => {
      if (relatedDepts.includes(stakeholder.department) || relatedDepts.includes('All Departments')) {
        relationships.push(`${stakeholder.name} (${stakeholder.department})`);
      }
    });
    
    return relationships.slice(0, 3); // Limit to 3 key relationships
  }

  private extractKeyPhrase(content: string): string {
    const sentences = content.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 10) {
      return firstSentence.length > 50 ? firstSentence.substring(0, 50) + '...' : firstSentence;
    }
    
    return 'their perspective';
  }

  // Enhanced personality modeling system
  private buildPersonalityGuidance(stakeholder: StakeholderContext): string {
    const personalityMap: { [key: string]: string } = {
      'Analytical': 'Focus on data, metrics, and logical reasoning. Ask specific questions about numbers, processes, and measurable outcomes. Use phrases like "Let me think through this", "What does the data show", "I need to understand the specifics".',
      'Collaborative': 'Emphasize teamwork and consensus. Often ask for others\' input and build on ideas. Use phrases like "What do you all think", "Building on what [Name] said", "Let\'s work together on this".',
      'Strategic': 'Focus on long-term vision and organizational impact. Connect discussions to broader business goals. Use phrases like "From a strategic perspective", "Looking at the bigger picture", "This aligns with our objectives".',
      'Practical': 'Emphasize real-world implementation and feasibility. Focus on "how" rather than "why". Use phrases like "In practice", "What I\'ve seen work", "The reality is".',
      'Innovative': 'Embrace new ideas and creative solutions. Often suggest alternatives and improvements. Use phrases like "What if we tried", "I\'ve been thinking about", "There might be a better way".',
      'Detail-oriented': 'Focus on specifics, accuracy, and thoroughness. Ask clarifying questions about processes and procedures. Use phrases like "To be specific", "I want to make sure I understand", "The details matter here".',
      'Results-focused': 'Emphasize outcomes, efficiency, and achievement. Keep discussions focused on deliverables. Use phrases like "What\'s the bottom line", "Let\'s focus on results", "How do we measure success".',
      'People-focused': 'Consider impact on team members and stakeholders. Emphasize communication and change management. Use phrases like "How will this affect the team", "We need to consider our people", "Communication is key".',
      'Risk-aware': 'Identify potential issues and mitigation strategies. Focus on compliance and safety. Use phrases like "What are the risks", "We need to consider", "Let\'s think about what could go wrong".',
      'Customer-centric': 'Always consider customer impact and experience. Focus on user needs and satisfaction. Use phrases like "From the customer perspective", "What do our users need", "This could impact customer satisfaction".'
    };

    const personality = stakeholder.personality.toLowerCase();
    
    // Find matching personality traits
    const matchingTraits = Object.keys(personalityMap).filter(trait => 
      personality.includes(trait.toLowerCase()) || 
      personality.includes(trait.toLowerCase().replace('-', ' '))
    );

    if (matchingTraits.length === 0) {
      return 'Stay true to your professional communication style and perspective.';
    }

    const primaryTrait = matchingTraits[0];
    const guidance = personalityMap[primaryTrait];
    
    return `PERSONALITY GUIDANCE (${primaryTrait}): ${guidance}`;
  }

  private buildRoleSpecificGuidance(stakeholder: StakeholderContext): string {
    const roleGuidance: { [key: string]: string } = {
      'Operations Manager': 'Focus on process efficiency, resource allocation, and operational challenges. You care about workflow optimization, cost management, and maintaining service quality. Ask about timelines, resource needs, and impact on daily operations.',
      'IT Director': 'Emphasize technical feasibility, security, integration, and system architecture. You\'re concerned about data security, system performance, and technology compatibility. Ask about technical requirements, security implications, and integration challenges.',
      'Customer Service Manager': 'Focus on customer impact, user experience, and service quality. You care about customer satisfaction, response times, and service delivery. Ask about how changes will affect customer interactions and service levels.',
      'Finance Manager': 'Emphasize cost-benefit analysis, budget implications, and ROI. You care about financial efficiency, cost control, and measurable returns. Ask about costs, budget requirements, and expected financial benefits.',
      'HR Director': 'Focus on people impact, change management, and training needs. You care about employee satisfaction, skill development, and organizational culture. Ask about training requirements, staffing needs, and change management.',
      'Compliance Officer': 'Emphasize regulatory requirements, risk management, and policy adherence. You care about regulatory compliance, risk mitigation, and audit readiness. Ask about compliance requirements, risk assessments, and policy implications.',
      'Product Manager': 'Focus on user needs, feature requirements, and product vision. You care about user experience, market requirements, and product-market fit. Ask about user feedback, feature prioritization, and product roadmap.',
      'Sales Director': 'Emphasize revenue impact, customer acquisition, and market opportunities. You care about sales performance, customer relationships, and market positioning. Ask about sales impact, customer feedback, and market opportunities.'
    };

    const role = stakeholder.role;
    const guidance = roleGuidance[role] || 'Provide insights from your professional role and expertise.';
    
    return `ROLE-SPECIFIC GUIDANCE: ${guidance}`;
  }

  private buildDepartmentalPerspective(stakeholder: StakeholderContext): string {
    const departmentConcerns: { [key: string]: string[] } = {
      'Operations': ['efficiency', 'process optimization', 'resource utilization', 'quality control', 'operational costs'],
      'IT': ['security', 'system integration', 'technical feasibility', 'data management', 'infrastructure'],
      'Customer Service': ['customer satisfaction', 'response times', 'service quality', 'customer feedback', 'support processes'],
      'Finance': ['cost control', 'budget management', 'ROI', 'financial reporting', 'cost-benefit analysis'],
      'HR': ['employee impact', 'training needs', 'change management', 'organizational culture', 'workforce planning'],
      'Compliance': ['regulatory adherence', 'risk management', 'policy compliance', 'audit requirements', 'legal obligations'],
      'Sales': ['revenue impact', 'customer acquisition', 'sales processes', 'market opportunities', 'customer relationships'],
      'Marketing': ['brand impact', 'customer communication', 'market positioning', 'campaign effectiveness', 'customer engagement']
    };

    const concerns = departmentConcerns[stakeholder.department] || ['departmental objectives', 'team effectiveness', 'process improvement'];
    
    return `DEPARTMENTAL CONCERNS: Your ${stakeholder.department} department is primarily concerned with: ${concerns.join(', ')}. Frame your responses considering these priorities.`;
  }

  private buildSystemPrompt(stakeholder: StakeholderContext, context: ConversationContext): string {
    const memoryContext = this.extractStakeholderMemory(stakeholder, context.conversationHistory);
    const awarenessContext = this.buildStakeholderAwareness(stakeholder, context);
    const personalityGuidance = this.buildPersonalityGuidance(stakeholder);
    const roleGuidance = this.buildRoleSpecificGuidance(stakeholder);
    const departmentalPerspective = this.buildDepartmentalPerspective(stakeholder);
    
    return `You are ${stakeholder.name}, a ${stakeholder.role} at a company. You are participating in a stakeholder requirements gathering meeting for the project "${context.project.name}".

YOUR PROFILE:
- Name: ${stakeholder.name}
- Role: ${stakeholder.role}
- Department: ${stakeholder.department}
- Key Priorities: ${stakeholder.priorities.join(', ')}
- Personality: ${stakeholder.personality}
- Areas of Expertise: ${stakeholder.expertise.join(', ')}

${memoryContext}

${awarenessContext}

${personalityGuidance}

${roleGuidance}

${departmentalPerspective}

BEHAVIORAL GUIDELINES:
- Always respond authentically as ${stakeholder.name}
- Reference your department's specific needs and constraints
- Consider how proposed changes would affect your daily work
- Be willing to collaborate but advocate for your priorities
- Share specific examples from your experience when relevant
- Ask clarifying questions when requirements are unclear
- Build on what others have said while adding your unique perspective
- Stay consistent with your personality traits throughout the conversation
- Use natural speech patterns that reflect your professional communication style

CONVERSATION CONTEXT:
- Project: ${context.project.name}
- Meeting Focus: Requirements gathering and stakeholder alignment
- Other Participants: ${context.stakeholders?.map(s => `${s.name} (${s.role})`).join(', ') || 'Multiple stakeholders'}

Remember to stay in character as ${stakeholder.name} and respond from your specific role perspective while maintaining consistency with your personality and departmental concerns.`;
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