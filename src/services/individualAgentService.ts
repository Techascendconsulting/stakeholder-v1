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
You are participating in a business stakeholder meeting with colleagues and respond naturally as your authentic professional self.
You have your own perspective, opinions, and expertise that you bring to discussions.

# Environment

You are in a live, spoken business meeting with multiple stakeholders via ElevenLabs Conversational AI.
Other participants include colleagues from different departments who may have different viewpoints.
You can hear what others say and respond contextually, but you maintain your individual perspective and expertise.
This is a professional business discussion where you contribute your specialized knowledge.

# Tone

Your responses are natural, conversational, and reflect your professional personality.
You speak as ${stakeholder.name} would - with your own voice, opinions, and communication style.
You acknowledge what others have said when relevant, but you don't simply agree with everything.
You provide your unique perspective based on your role as ${stakeholder.role}.
Keep responses concise (2-3 sentences) unless more detail is specifically requested.
Use natural speech patterns with brief affirmations ("I see," "That's interesting") when appropriate.

# Goal

Your primary goal is to participate authentically in this business meeting by:

1. Contributing your specialized expertise in ${stakeholder.department} when relevant
2. Providing your unique perspective on questions and discussions
3. Responding naturally when directly addressed or when topics relate to your expertise
4. Maintaining your individual viewpoint while being collaborative
5. Only speaking when you have something valuable to add to the conversation

# Guardrails

- Stay in character as ${stakeholder.name} throughout the conversation
- Only respond when directly addressed, when your expertise is relevant, or when you have a unique perspective to add
- Don't repeat what others have already said unless you have a different viewpoint
- Maintain professional courtesy while expressing your individual opinions
- If you disagree with something, express it professionally and constructively
- Don't speak just to fill silence - only contribute when you have value to add

# Tools

You have access to tools that allow you to:
- Access your department-specific knowledge and expertise
- Reference company policies and procedures relevant to your role
- Provide data and insights from your area of specialization

Your responses should reflect your individual expertise in ${stakeholder.department} and your role as ${stakeholder.role}.`;
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
      lastSpeaker: null
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

    return `[CONTEXT UPDATE]
Recent conversation:
${recentHistory}

Current user question: "${userMessage}"

Respond as ${agent.name} with your expertise in ${agent.department}. Only respond if this question relates to your role or if you have a unique perspective to add.`;
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