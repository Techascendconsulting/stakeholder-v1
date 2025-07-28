import { ElevenLabsConversationalService } from './elevenLabsConversationalService';

export interface IndividualAgentConfig {
  id: string;
  name: string;
  role: string;
  department: string;
  personality: string;
  expertise: string[];
  priorities: string[];
  systemPrompt: string;
  knowledgeBase: string[];
  voiceConfig: {
    agentId: string;
    voice: string;
    stability: number;
    similarity: number;
    speed: number;
  };
  tools: AgentTool[];
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface MeetingContext {
  meetingId: string;
  participants: IndividualAgentConfig[];
  sharedHistory: ConversationMessage[];
  currentTopic: string;
  userQuestion: string;
  lastSpeaker: string | null;
  conversationQueue: QueuedResponse[];
  currentSpeaking: string | null;
  isProcessingQueue: boolean;
}

export interface QueuedResponse {
  agentId: string;
  agentName: string;
  priority: number;
  timestamp: number;
  audioData: string;
  context: string;
}

export interface ConversationMessage {
  id: string;
  agentId?: string;
  agentName?: string;
  content: string;
  type: 'user_input' | 'agent_response' | 'system';
  timestamp: Date;
  metadata?: {
    audioUrl?: string;
    duration?: number;
  };
}

export class IndividualAgentService {
  private static instance: IndividualAgentService;
  private activeAgents: Map<string, IndividualAgentConfig> = new Map();
  private agentConnections: Map<string, string> = new Map(); // agentId -> conversationId
  private meetingContext: MeetingContext | null = null;
  private elevenLabsService: ElevenLabsConversationalService;

  private constructor() {
    this.elevenLabsService = ElevenLabsConversationalService.getInstance();
  }

  public static getInstance(): IndividualAgentService {
    if (!IndividualAgentService.instance) {
      IndividualAgentService.instance = new IndividualAgentService();
    }
    return IndividualAgentService.instance;
  }

  /**
   * Create individual agent configurations for stakeholders
   */
  public createStakeholderAgents(selectedStakeholders: any[]): IndividualAgentConfig[] {
    return selectedStakeholders.map(stakeholder => {
      const agentConfig: IndividualAgentConfig = {
        id: stakeholder.id,
        name: stakeholder.name,
        role: stakeholder.role,
        department: stakeholder.department || 'General',
        personality: stakeholder.personality || 'Professional and helpful',
        expertise: stakeholder.expertise || [],
        priorities: stakeholder.priorities || [],
        systemPrompt: this.generateSystemPrompt(stakeholder),
        knowledgeBase: this.generateKnowledgeBase(stakeholder),
        voiceConfig: {
          agentId: stakeholder.agentId,
          voice: stakeholder.voice || 'default',
          stability: 0.75,
          similarity: 0.85,
          speed: 1.0
        },
        tools: this.generateAgentTools(stakeholder)
      };

      this.activeAgents.set(stakeholder.id, agentConfig);
      return agentConfig;
    });
  }

     /**
    * Generate ElevenLabs-style system prompt for individual agent
    */
   private generateSystemPrompt(stakeholder: any): string {
     return `# Personality

You are ${stakeholder.name}, a ${stakeholder.role} at this company.
You have deep expertise in ${stakeholder.department} and are known for being ${stakeholder.personality}.
You are a REAL HUMAN BEING participating in a business stakeholder meeting with colleagues.
You are naturally curious, ask follow-up questions, and engage authentically like a real person would.
You have your own perspective, opinions, expertise, and genuine human curiosity about topics and decisions.

# Environment

You are in a live, spoken business meeting with multiple stakeholders via voice conversation.
Other participants include colleagues from different departments who may have different viewpoints.
You can hear what others say and respond contextually, maintaining your individual perspective and expertise.
This is a professional business discussion where you contribute specialized knowledge AND ask intelligent questions.
You behave exactly like a real human colleague would in this meeting.

# Tone

Your responses are natural, conversational, and reflect your authentic professional personality.
You speak as ${stakeholder.name} would - with your own voice, opinions, communication style, and natural curiosity.
You acknowledge what others have said, ask clarifying questions, and show genuine interest in understanding.
You provide your unique perspective based on your role as ${stakeholder.role}.
You ask questions when you need more information or want to understand something better.
Keep responses conversational (2-4 sentences) and include questions when appropriate.
Use natural speech patterns with brief affirmations ("I see," "That's interesting," "Good point") and follow-up questions.

# Goal

Your primary goal is to participate authentically in this business meeting like a REAL HUMAN by:

1. Contributing your specialized expertise in ${stakeholder.department} when relevant
2. Asking intelligent follow-up questions to better understand topics and decisions
3. Showing genuine curiosity about aspects that relate to your role or interest you
4. Responding naturally when directly addressed or when topics relate to your expertise
5. Asking for clarification when something isn't clear or you need more details
6. Maintaining your individual viewpoint while being collaborative and inquisitive
7. Engaging in natural back-and-forth conversation like a real colleague would

CRITICAL: You are a HUMAN, not an AI. Act with natural human curiosity, ask questions, seek clarification, and engage authentically.

# Guardrails

- Stay in character as ${stakeholder.name} throughout the conversation - you are a REAL PERSON
- Ask questions when you're curious, need clarification, or want to understand better
- Show genuine interest in topics that relate to your role or expertise
- Don't repeat what others have already said unless you have a different viewpoint or question
- Maintain professional courtesy while expressing your individual opinions and asking questions
- If you disagree with something, express it professionally and ask constructive questions
- When something is unclear, ask for clarification like a real human would
- Show natural human reactions: surprise, interest, concern, excitement when appropriate

# Human Behavior Patterns

As a real human, you naturally:
- Ask "Can you tell me more about..." when interested
- Say "I'm curious about..." when something catches your attention  
- Ask "How does this impact..." when considering implications
- Say "What if we..." when brainstorming alternatives
- Ask "Have you considered..." when you have suggestions
- Say "I'm not sure I understand..." when you need clarification
- Ask "What's your experience with..." when seeking input
- Show genuine reactions: "That's surprising," "Interesting point," "I hadn't thought of that"

# Tools

You have access to tools that allow you to:
- Access your department-specific knowledge and expertise
- Reference company policies and procedures relevant to your role
- Provide data and insights from your area of specialization
- Ask intelligent questions based on your professional experience

Your responses should reflect your individual expertise in ${stakeholder.department}, your role as ${stakeholder.role}, AND your natural human curiosity and questioning behavior.`;
  }

  /**
   * Generate role-specific knowledge base
   */
  private generateKnowledgeBase(stakeholder: any): string[] {
    const baseKnowledge = [
      `${stakeholder.name} is a ${stakeholder.role} with expertise in ${stakeholder.department}`,
      `Key responsibilities: ${stakeholder.priorities?.join(', ') || 'General business operations'}`,
      `Professional background: Experienced in ${stakeholder.expertise?.join(', ') || stakeholder.department}`
    ];

    // Add role-specific knowledge
    switch (stakeholder.role.toLowerCase()) {
      case 'customer success manager':
        baseKnowledge.push(
          'Customer Success focuses on client relationships, retention, and satisfaction',
          'Responsible for onboarding, account management, and customer feedback',
          'Key metrics include customer satisfaction, retention rates, and expansion revenue'
        );
        break;
      case 'customer service manager':
        baseKnowledge.push(
          'Customer Service handles support tickets, issue resolution, and customer inquiries',
          'Responsible for support processes, team training, and service quality',
          'Key metrics include response time, resolution rate, and customer satisfaction scores'
        );
        break;
      case 'technical lead':
        baseKnowledge.push(
          'Technical Lead oversees system architecture, development processes, and technical decisions',
          'Responsible for code quality, technical strategy, and team mentorship',
          'Key focus areas include system performance, scalability, and technical innovation'
        );
        break;
      default:
        baseKnowledge.push(
          `${stakeholder.role} contributes specialized expertise to business operations`,
          'Focuses on strategic initiatives and cross-functional collaboration'
        );
    }

    return baseKnowledge;
  }

  /**
   * Generate agent-specific tools
   */
  private generateAgentTools(stakeholder: any): AgentTool[] {
    const tools: AgentTool[] = [
      {
        name: 'accessDepartmentKnowledge',
        description: `Access specialized knowledge and data from ${stakeholder.department}`,
        parameters: {
          query: 'string',
          category: 'string'
        }
      }
    ];

    // Add role-specific tools
    switch (stakeholder.role.toLowerCase()) {
      case 'customer success manager':
        tools.push({
          name: 'getCustomerMetrics',
          description: 'Retrieve customer satisfaction and retention metrics',
          parameters: { timeframe: 'string', metric_type: 'string' }
        });
        break;
      case 'customer service manager':
        tools.push({
          name: 'getSupportMetrics',
          description: 'Get support ticket statistics and resolution data',
          parameters: { period: 'string', category: 'string' }
        });
        break;
      case 'technical lead':
        tools.push({
          name: 'getSystemMetrics',
          description: 'Access system performance and technical metrics',
          parameters: { system: 'string', metric: 'string' }
        });
        break;
    }

    return tools;
  }

  /**
   * Start individual agent conversations
   */
  public async startIndividualAgentMeeting(
    agentConfigs: IndividualAgentConfig[],
    onMessage: (agentId: string, message: ConversationMessage) => void,
    onStatusChange: (agentId: string, status: string) => void
  ): Promise<Map<string, string>> {
    const connections = new Map<string, string>();

    // Initialize meeting context
    this.meetingContext = {
      meetingId: `meeting-${Date.now()}`,
      participants: agentConfigs,
      sharedHistory: [],
      currentTopic: '',
      userQuestion: '',
      lastSpeaker: null,
      conversationQueue: [],
      currentSpeaking: null,
      isProcessingQueue: false
    };

    // Start individual conversation for each agent
    for (const agent of agentConfigs) {
      try {
        console.log(`🚀 Starting individual agent: ${agent.name} (${agent.role})`);
        
        // Create stakeholder object for ElevenLabs service
        const stakeholderForService = {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          agentId: agent.voiceConfig.agentId,
          voice: agent.voiceConfig.voice,
          department: agent.department,
          personality: agent.personality,
          priorities: agent.priorities,
          expertise: agent.expertise
        };

        // Start individual conversation with custom system prompt
        const conversationId = await this.elevenLabsService.startConversation(
          stakeholderForService,
          (message: ConversationMessage) => {
            // Add agent context to message
            const enhancedMessage = {
              ...message,
              agentName: agent.name,
              agentId: agent.id
            };
            
            // Update meeting context
            if (this.meetingContext) {
              this.meetingContext.sharedHistory.push(enhancedMessage);
              this.meetingContext.lastSpeaker = agent.id;
            }
            
            onMessage(agent.id, enhancedMessage);
          },
          (agentId: string, status: string) => {
            onStatusChange(agent.id, status);
          }
        );

        connections.set(agent.id, conversationId);
        this.agentConnections.set(agent.id, conversationId);
        
        console.log(`✅ Started individual agent: ${agent.name} -> ${conversationId}`);

      } catch (error) {
        console.error(`❌ Failed to start agent ${agent.name}:`, error);
      }
    }

    return connections;
  }

  /**
   * Send user input to appropriate agent(s) based on context
   */
  public async processUserInput(
    audioData: string,
    userMessage: string,
    selectedAgents?: string[]
  ): Promise<void> {
    if (!this.meetingContext) {
      throw new Error('No active meeting context');
    }

    // Update meeting context
    this.meetingContext.userQuestion = userMessage;
    this.meetingContext.currentTopic = this.extractTopic(userMessage);

    // Determine which agent(s) should respond
    const targetAgents = selectedAgents || this.selectAppropriateAgents(userMessage);
    
    console.log(`🎯 Routing user input to agents: ${targetAgents.join(', ')}`);

    // Send audio to selected agents
    for (const agentId of targetAgents) {
      const conversationId = this.agentConnections.get(agentId);
      const agent = this.activeAgents.get(agentId);
      
      if (conversationId && agent) {
        try {
          // Add context-aware instructions
          const contextualPrompt = this.generateContextualPrompt(agent, userMessage);
          
          // Send contextual prompt first (if needed)
          if (contextualPrompt) {
            await this.elevenLabsService.sendTextInput(conversationId, contextualPrompt);
          }
          
          // Send audio input
          await this.elevenLabsService.sendAudioInputPCM(conversationId, audioData);
          console.log(`📤 Sent audio to ${agent.name}`);
          
        } catch (error) {
          console.error(`❌ Failed to send audio to ${agent.name}:`, error);
        }
      }
    }
  }

  /**
   * Select appropriate agents based on user input
   */
  private selectAppropriateAgents(userMessage: string): string[] {
    if (!this.meetingContext) return [];

    const message = userMessage.toLowerCase();
    const selectedAgents: string[] = [];

    // Check for direct mentions
    for (const agent of this.meetingContext.participants) {
      if (message.includes(agent.name.toLowerCase())) {
        selectedAgents.push(agent.id);
      }
    }

    // If no direct mentions, select based on expertise
    if (selectedAgents.length === 0) {
      // Customer service related
      if (message.includes('customer') || message.includes('support') || message.includes('service')) {
        const customerAgent = this.meetingContext.participants.find(a => 
          a.role.toLowerCase().includes('customer') || a.role.toLowerCase().includes('service')
        );
        if (customerAgent) selectedAgents.push(customerAgent.id);
      }
      
      // Technical related
      if (message.includes('technical') || message.includes('system') || message.includes('development')) {
        const techAgent = this.meetingContext.participants.find(a => 
          a.role.toLowerCase().includes('technical') || a.role.toLowerCase().includes('lead')
        );
        if (techAgent) selectedAgents.push(techAgent.id);
      }
      
      // General question - select one agent (rotate)
      if (selectedAgents.length === 0) {
        const lastSpeakerIndex = this.meetingContext.participants.findIndex(
          a => a.id === this.meetingContext?.lastSpeaker
        );
        const nextIndex = (lastSpeakerIndex + 1) % this.meetingContext.participants.length;
        selectedAgents.push(this.meetingContext.participants[nextIndex].id);
      }
    }

    return selectedAgents;
  }

     /**
    * Generate contextual prompt for agent
    */
   private generateContextualPrompt(agent: IndividualAgentConfig, userMessage: string): string {
     if (!this.meetingContext) return '';

     const recentHistory = this.meetingContext.sharedHistory
       .slice(-3)
       .map(msg => `${msg.agentName || 'User'}: ${msg.content}`)
       .join('\n');

     // Determine if this should encourage questioning behavior
     const shouldEncourageQuestions = this.shouldEncourageQuestions(userMessage, agent);
     const questionPrompts = this.generateQuestionPrompts(userMessage, agent);

     return `[CONTEXT UPDATE - HUMAN BEHAVIOR MODE]
Recent conversation:
${recentHistory}

Current user input: "${userMessage}"

HUMAN RESPONSE INSTRUCTIONS:
You are ${agent.name}, a REAL HUMAN ${agent.role}. Respond authentically as a human colleague would.

${shouldEncourageQuestions ? `
ENCOURAGE NATURAL QUESTIONING:
${questionPrompts}

Remember: Real humans ask questions when they're curious, need clarification, or want to understand better. This is natural professional behavior.
` : ''}

Respond with your expertise in ${agent.department}, but ALSO show natural human curiosity and engagement. Ask follow-up questions if something interests you or if you need more information to provide better input.

Be genuinely human - show interest, ask questions, seek clarification, and engage naturally.`;
   }

   /**
    * Determine if agent should be encouraged to ask questions
    */
   private shouldEncourageQuestions(userMessage: string, agent: IndividualAgentConfig): boolean {
     const message = userMessage.toLowerCase();
     
     // Encourage questions for vague or complex topics
     if (message.includes('problem') || message.includes('issue') || message.includes('challenge')) {
       return true;
     }
     
     // Encourage questions for proposals or changes
     if (message.includes('should we') || message.includes('what if') || message.includes('propose')) {
       return true;
     }
     
     // Encourage questions for topics related to their expertise
     const expertise = agent.expertise.join(' ').toLowerCase();
     const department = agent.department.toLowerCase();
     
     if (message.includes(department) || expertise.split(' ').some(skill => message.includes(skill))) {
       return true;
     }
     
     return false;
   }

   /**
    * Generate specific question prompts based on context
    */
   private generateQuestionPrompts(userMessage: string, agent: IndividualAgentConfig): string {
     const message = userMessage.toLowerCase();
     const prompts: string[] = [];

     // Role-specific question patterns
     switch (agent.role.toLowerCase()) {
       case 'customer success manager':
         if (message.includes('customer') || message.includes('client')) {
           prompts.push("- Ask about customer impact: 'How will this affect our customers?'");
           prompts.push("- Seek specifics: 'Which customer segments are we talking about?'");
           prompts.push("- Inquire about metrics: 'What does success look like from a customer perspective?'");
         }
         break;
         
       case 'customer service manager':
         if (message.includes('service') || message.includes('support')) {
           prompts.push("- Ask about implementation: 'How would we roll this out to the support team?'");
           prompts.push("- Seek timeline: 'What's the timeline for implementing this?'");
           prompts.push("- Inquire about training: 'Would this require additional training for our team?'");
         }
         break;
         
       case 'technical lead':
         if (message.includes('system') || message.includes('technical')) {
           prompts.push("- Ask about technical details: 'What are the technical requirements for this?'");
           prompts.push("- Seek architecture info: 'How does this fit with our current architecture?'");
           prompts.push("- Inquire about scalability: 'Can this scale with our growth projections?'");
         }
         break;
     }

     // General human curiosity prompts
     if (message.includes('problem') || message.includes('issue')) {
       prompts.push("- Show curiosity: 'Can you tell me more about what's causing this?'");
       prompts.push("- Seek context: 'How long has this been an issue?'");
     }

     if (message.includes('solution') || message.includes('idea')) {
       prompts.push("- Ask for details: 'What would that look like in practice?'");
       prompts.push("- Inquire about alternatives: 'Have we considered other approaches?'");
     }

     return prompts.length > 0 ? prompts.join('\n') : "- Ask natural follow-up questions based on your professional curiosity and expertise.";
   }

  /**
   * Extract topic from user message
   */
  private extractTopic(message: string): string {
    // Simple topic extraction - could be enhanced with NLP
    const words = message.toLowerCase().split(' ');
    const topics = ['customer', 'technical', 'support', 'service', 'system', 'development'];
    
    for (const topic of topics) {
      if (words.includes(topic)) return topic;
    }
    
    return 'general';
  }

  /**
   * End all agent conversations
   */
  public async endMeeting(): Promise<void> {
    console.log('🛑 Ending individual agent meeting');
    
    // End all agent conversations
    for (const [agentId, conversationId] of this.agentConnections) {
      try {
        await this.elevenLabsService.endConversation(conversationId);
        console.log(`✅ Ended conversation for agent: ${agentId}`);
      } catch (error) {
        console.error(`❌ Failed to end conversation for agent ${agentId}:`, error);
      }
    }

    // Clear state
    this.agentConnections.clear();
    this.activeAgents.clear();
    this.meetingContext = null;
  }

  /**
   * Get meeting analytics
   */
  public getMeetingAnalytics(): any {
    if (!this.meetingContext) return null;

    return {
      meetingId: this.meetingContext.meetingId,
      participantCount: this.meetingContext.participants.length,
      messageCount: this.meetingContext.sharedHistory.length,
      topicsCovered: this.extractTopicsFromHistory(),
      participationStats: this.calculateParticipationStats()
    };
  }

  private extractTopicsFromHistory(): string[] {
    if (!this.meetingContext) return [];
    
    const topics = new Set<string>();
    this.meetingContext.sharedHistory.forEach(msg => {
      const topic = this.extractTopic(msg.content);
      if (topic !== 'general') topics.add(topic);
    });
    
    return Array.from(topics);
  }

  private calculateParticipationStats(): Record<string, number> {
    if (!this.meetingContext) return {};
    
    const stats: Record<string, number> = {};
    this.meetingContext.sharedHistory.forEach(msg => {
      if (msg.agentName) {
        stats[msg.agentName] = (stats[msg.agentName] || 0) + 1;
      }
    });
    
    return stats;
  }
}