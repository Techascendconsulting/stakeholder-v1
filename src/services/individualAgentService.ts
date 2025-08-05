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
  
  // Queue system - EXACT COPY from voice-only meeting
  private conversationQueue: string[] = [];
  private currentSpeaking: string | null = null;
  private onStatusChange: ((agentId: string, status: string) => void) | null = null;
  private responsePromises: Map<string, { resolve: () => void; reject: (error: any) => void }> = new Map();

  private constructor() {
    // Get API key from environment
    const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      throw new Error('ElevenLabs API key not found in environment variables');
    }
    this.elevenLabsService = new ElevenLabsConversationalService(elevenLabsKey);
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
    this.onStatusChange = onStatusChange;

    // Initialize meeting context
    this.meetingContext = {
      meetingId: `meeting-${Date.now()}`,
      participants: agentConfigs,
      sharedHistory: [],
      currentTopic: '',
      userQuestion: '',
      lastSpeaker: null
    };

    // Reset queue state
    this.conversationQueue = [];
    this.currentSpeaking = null;

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
            
            // Handle response completion for queue management
            if (status === 'listening' && this.currentSpeaking === agent.id) {
              console.log(`🎯 Agent ${agent.name} finished speaking, resolving response promise`);
              const promise = this.responsePromises.get(agent.id);
              if (promise) {
                promise.resolve();
                this.responsePromises.delete(agent.id);
              }
            }
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
   * Send user input to appropriate agent(s) with queue processing - EXACT COPY from voice-only
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

    // Process ONLY THE FIRST agent - no multiple agents at once to prevent talking over themselves
    if (targetAgents.length > 0) {
      const firstAgentId = targetAgents[0];
      const agent = this.activeAgents.get(firstAgentId);
      if (agent) {
        console.log(`🎯 Processing ONLY ${agent.name} to prevent simultaneous speaking`);
        await this.processDynamicAgentResponse(agent, audioData, userMessage);
      }
    }
  }

  /**
   * Process agent response with queue system - EXACT COPY from voice-only meeting
   */
  private async processDynamicAgentResponse(agent: IndividualAgentConfig, audioData: string, userMessage: string): Promise<void> {
    if (!this.meetingContext) return;

    console.log(`🚀 QUEUE DEBUG: ${agent.name} starting processDynamicAgentResponse`);
    console.log(`🚀 QUEUE DEBUG: Current speaker before: ${this.currentSpeaking}`);
    console.log(`🚀 QUEUE DEBUG: Current queue before: [${this.conversationQueue.join(', ')}]`);
    
    try {
      // Add to conversation queue to prevent simultaneous speaking - EXACT COPY
      this.conversationQueue = [...this.conversationQueue, agent.id];
      console.log(`🚀 QUEUE DEBUG: ${agent.name} added to queue. New queue: [${this.conversationQueue.join(', ')}]`);
      
      // Wait for turn if someone else is speaking - EXACT COPY
      let waitCount = 0;
      while (this.currentSpeaking !== null && this.currentSpeaking !== agent.id) {
        waitCount++;
        console.log(`🚀 QUEUE DEBUG: ${agent.name} waiting (attempt ${waitCount}). Current speaker: ${this.currentSpeaking}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Safety break after 100 attempts (10 seconds) - EXACT COPY
        if (waitCount > 100) {
          console.error(`🚨 QUEUE ERROR: ${agent.name} waited too long! Breaking wait loop.`);
          break;
        }
      }
      
      // Start speaking - EXACT COPY
      console.log(`🚀 QUEUE DEBUG: ${agent.name} now taking turn to speak`);
      this.currentSpeaking = agent.id;
      
      // Notify UI of speaking status
      if (this.onStatusChange) {
        this.onStatusChange(agent.id, 'speaking');
      }
      
      // Send audio to this agent
      const conversationId = this.agentConnections.get(agent.id);
      if (conversationId) {
        try {
          // Create promise to wait for actual response completion
          const responsePromise = new Promise<void>((resolve, reject) => {
            this.responsePromises.set(agent.id, { resolve, reject });
            
            // Safety timeout after 30 seconds
            setTimeout(() => {
              console.warn(`⏰ Response timeout for ${agent.name}`);
              const promise = this.responsePromises.get(agent.id);
              if (promise) {
                promise.resolve();
                this.responsePromises.delete(agent.id);
              }
            }, 30000);
          });
          
          // Send audio input directly (no text prompts that get spoken)
          console.log(`📤 Sending audio to ${agent.name}, data length: ${audioData.length}, conversationId: ${conversationId}`);
          await this.elevenLabsService.sendAudioInputPCM(conversationId, audioData);
          console.log(`✅ Successfully sent audio to ${agent.name}`);
          
          // Wait for actual response to complete
          await responsePromise;
          console.log(`✅ ${agent.name} response completed`);
          
        } catch (error) {
          console.error(`❌ Failed to send audio to ${agent.name}:`, error);
          // Clean up promise on error
          this.responsePromises.delete(agent.id);
        }
      }
      
      // Finish speaking - EXACT COPY from voice-only
      console.log(`🚀 QUEUE DEBUG: ${agent.name} finished speaking, clearing currentSpeaking`);
      this.currentSpeaking = null;
      this.conversationQueue = this.conversationQueue.filter(id => id !== agent.id);
      console.log(`🚀 QUEUE DEBUG: ${agent.name} removed from queue. New queue: [${this.conversationQueue.join(', ')}]`);
      
      // Notify UI of listening status
      if (this.onStatusChange) {
        this.onStatusChange(agent.id, 'listening');
      }
      
    } catch (error) {
      console.error(`🚨 QUEUE ERROR: Error in ${agent.name} response:`, error);
      
      // Clean up conversation state on error - EXACT COPY from voice-only
      console.log(`🚀 QUEUE DEBUG: ${agent.name} error cleanup - clearing currentSpeaking`);
      this.currentSpeaking = null;
      this.conversationQueue = this.conversationQueue.filter(id => id !== agent.id);
      console.log(`🚀 QUEUE DEBUG: ${agent.name} error cleanup - removed from queue. New queue: [${this.conversationQueue.join(', ')}]`);
      
      // Clean up response promise on error
      const promise = this.responsePromises.get(agent.id);
      if (promise) {
        promise.resolve();
        this.responsePromises.delete(agent.id);
      }
      
      // Notify UI of error status
      if (this.onStatusChange) {
        this.onStatusChange(agent.id, 'error');
      }
      
      throw error;
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

    // Dynamic role-based curiosity - no hardcoded templates
    const roleContext = {
      'customer success manager': 'customer impact and satisfaction',
      'customer service manager': 'service delivery and team implementation',
      'technical lead': 'technical architecture and scalability',
      'it systems lead': 'system integration and security',
      'head of operations': 'operational efficiency and process',
      'hr business partner': 'people impact and change management',
      'compliance manager': 'regulatory compliance and risk'
    };
    
    const context = roleContext[agent.role.toLowerCase()] || 'this topic';
    prompts.push(`- Be naturally curious about ${context} aspects of what's being discussed`);
    prompts.push(`- Ask follow-up questions that ${agent.role} would naturally ask`);
    prompts.push(`- Show genuine interest in understanding the implications for ${agent.department}`);
    

    // Dynamic curiosity based on message content - no hardcoded questions
    prompts.push("- Respond naturally and authentically as a real person would");
    prompts.push("- Ask questions that arise from genuine professional curiosity");
    prompts.push("- Build on the conversation organically without using template phrases");

    return prompts.join('\n');
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
    
    // Clear queue state - EXACT COPY from voice-only
    this.conversationQueue = [];
    this.currentSpeaking = null;
    
    // Clean up any pending response promises
    this.responsePromises.forEach(promise => promise.resolve());
    this.responsePromises.clear();
    
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
    this.onStatusChange = null;
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