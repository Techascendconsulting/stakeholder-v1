import OpenAI from 'openai';
import { ElevenLabsService, VoiceAgent } from './elevenLabsService';

interface ConversationParticipant {
  id: string;
  type: 'user' | 'agent';
  name: string;
  role?: string;
}

interface ConversationMessage {
  id: string;
  participantId: string;
  content: string;
  timestamp: Date;
  metadata?: {
    audioUrl?: string;
    duration?: number;
    voiceId?: string;
  };
}

interface ConversationState {
  currentSpeaker: string | null;
  lastSpeakers: string[];
  messageCount: number;
  phase: 'opening' | 'discussion' | 'decision' | 'closing';
  topicsDiscussed: Set<string>;
  agentStates: Map<string, AgentState>;
}

interface AgentState {
  hasSpoken: boolean;
  messageCount: number;
  lastTopics: string[];
  emotionalState: 'engaged' | 'neutral' | 'concerned' | 'excited';
  speakingTurn: number;
}

interface MeetingContext {
  topic: string;
  objective: string;
  duration: number; // minutes
  participants: ConversationParticipant[];
  constraints?: string[];
}

class MultiAgentOrchestrator {
  private openai: OpenAI;
  private elevenLabs: ElevenLabsService;
  private conversationHistory: ConversationMessage[] = [];
  private conversationState: ConversationState;
  private meetingContext: MeetingContext;
  private voiceAgents: Map<string, VoiceAgent> = new Map();
  private isProcessing = false;
  
  constructor(
    openaiApiKey: string,
    elevenLabsApiKey: string,
    meetingContext: MeetingContext
  ) {
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });
    
    this.elevenLabs = new ElevenLabsService({ apiKey: '' });

    this.meetingContext = meetingContext;
    this.conversationState = {
      currentSpeaker: null,
      lastSpeakers: [],
      messageCount: 0,
      phase: 'opening',
      topicsDiscussed: new Set(),
      agentStates: new Map()
    };
  }

  /**
   * Add voice agent to the meeting
   */
  addVoiceAgent(agent: VoiceAgent) {
    this.voiceAgents.set(agent.id, agent);
    this.conversationState.agentStates.set(agent.id, {
      hasSpoken: false,
      messageCount: 0,
      lastTopics: [],
      emotionalState: 'neutral',
      speakingTurn: 0
    });
  }

  /**
   * Process user input and orchestrate agent responses
   */
  async processUserInput(
    userInput: string,
    onAgentSpeaking?: (agentId: string, message: string) => void,
    onAgentFinished?: (agentId: string) => void
  ): Promise<void> {
    if (this.isProcessing) {
      console.log('Already processing, please wait...');
      return;
    }

    this.isProcessing = true;

    try {
      // Add user message to history
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        participantId: 'user',
        content: userInput,
        timestamp: new Date()
      };
      
      this.conversationHistory.push(userMessage);
      this.updateConversationState('user', userInput);

      // Determine which agents should respond and in what order
      const respondingAgents = await this.determineRespondingAgents(userInput);
      
      // Generate responses for each agent
      for (const agentId of respondingAgents) {
        const agent = this.voiceAgents.get(agentId);
        if (!agent) continue;

        // Generate agent response using OpenAI
        const agentResponse = await this.generateAgentResponse(agentId, userInput);
        
        if (agentResponse.trim()) {
          onAgentSpeaking?.(agentId, agentResponse);
          
          // Audio disabled in transcript-only mode; directly mark finished
          this.setCurrentSpeaker(agentId);
          this.setCurrentSpeaker(null);
          onAgentFinished?.(agentId);

          // Add agent message to history
          const agentMessage: ConversationMessage = {
            id: `${agentId}-${Date.now()}`,
            participantId: agentId,
            content: agentResponse,
            timestamp: new Date(),
            metadata: {
              voiceId: agent.voiceId
            }
          };
          
          this.conversationHistory.push(agentMessage);
          this.updateConversationState(agentId, agentResponse);

          // Add small delay between agents to prevent overlap
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

    } catch (error) {
      console.error('Error processing user input:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Determine which agents should respond based on context
   */
  private async determineRespondingAgents(userInput: string): Promise<string[]> {
    const prompt = `
    Given the current meeting context and user input, determine which agents should respond and in what order.
    
    Meeting Topic: ${this.meetingContext.topic}
    Meeting Objective: ${this.meetingContext.objective}
    Current Phase: ${this.conversationState.phase}
    
    Available Agents:
    ${Array.from(this.voiceAgents.values()).map(agent => 
      `- ${agent.id}: ${agent.name} (${agent.role}) - ${agent.personality}`
    ).join('\n')}
    
    Recent conversation:
    ${this.conversationHistory.slice(-5).map(msg => 
      `${msg.participantId}: ${msg.content}`
    ).join('\n')}
    
    User Input: "${userInput}"
    
    Return a JSON array of agent IDs who should respond, in order of speaking. Consider:
    - Relevance to the user's question/comment
    - Natural conversation flow
    - Agent expertise and role
    - Avoiding too many responses at once (max 2-3 agents)
    - Recent speaking patterns
    
    Example: ["ceo-agent", "cto-agent"]
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 150,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (content) {
        // Try to parse JSON response
        try {
          return JSON.parse(content);
        } catch {
          // Fallback: extract agent IDs from text
          const agentIds = Array.from(this.voiceAgents.keys());
          return agentIds.filter(id => content.includes(id)).slice(0, 2);
        }
      }
    } catch (error) {
      console.error('Error determining responding agents:', error);
    }

    // Fallback: return one random agent
    const agentIds = Array.from(this.voiceAgents.keys());
    return [agentIds[Math.floor(Math.random() * agentIds.length)]];
  }

  /**
   * Generate response for a specific agent using OpenAI
   */
  private async generateAgentResponse(agentId: string, userInput: string): Promise<string> {
    const agent = this.voiceAgents.get(agentId);
    if (!agent) return '';

    const agentState = this.conversationState.agentStates.get(agentId);
    
    const prompt = `
    You are ${agent.name}, ${agent.role}.
    Personality: ${agent.personality}
    
    Meeting Context:
    - Topic: ${this.meetingContext.topic}
    - Objective: ${this.meetingContext.objective}
    - Phase: ${this.conversationState.phase}
    
    Recent conversation:
    ${this.conversationHistory.slice(-8).map(msg => {
      const participant = msg.participantId === 'user' ? 'User' : 
        this.voiceAgents.get(msg.participantId)?.name || msg.participantId;
      return `${participant}: ${msg.content}`;
    }).join('\n')}
    
    User just said: "${userInput}"
    
    Respond as ${agent.name} in character. Keep responses:
    - Natural and conversational
    - 1-3 sentences (voice-friendly length)
    - Relevant to your role and expertise
    - Advancing the meeting objective
    - Professional but engaging
    
    ${agentState?.hasSpoken ? '' : 'This is your first time speaking in this meeting.'}
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 200,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error(`Error generating response for ${agentId}:`, error);
      return '';
    }
  }

  /**
   * Update conversation state after each message
   */
  private updateConversationState(speakerId: string, content: string) {
    this.conversationState.messageCount++;
    this.conversationState.lastSpeakers.push(speakerId);
    
    // Keep only last 5 speakers
    if (this.conversationState.lastSpeakers.length > 5) {
      this.conversationState.lastSpeakers = this.conversationState.lastSpeakers.slice(-5);
    }

    // Update agent state if it's an agent
    if (this.voiceAgents.has(speakerId)) {
      const agentState = this.conversationState.agentStates.get(speakerId);
      if (agentState) {
        agentState.hasSpoken = true;
        agentState.messageCount++;
        agentState.speakingTurn = this.conversationState.messageCount;
        this.conversationState.agentStates.set(speakerId, agentState);
      }
    }

    // Update conversation phase based on message count
    if (this.conversationState.messageCount < 3) {
      this.conversationState.phase = 'opening';
    } else if (this.conversationState.messageCount < 15) {
      this.conversationState.phase = 'discussion';
    } else if (this.conversationState.messageCount < 25) {
      this.conversationState.phase = 'decision';
    } else {
      this.conversationState.phase = 'closing';
    }

    // Extract topics from content (simple keyword extraction)
    const topics = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    topics.forEach(topic => this.conversationState.topicsDiscussed.add(topic));
  }

  /**
   * Set current speaker
   */
  private setCurrentSpeaker(speakerId: string | null) {
    this.conversationState.currentSpeaker = speakerId;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Get conversation state
   */
  getConversationState(): ConversationState {
    return { ...this.conversationState };
  }

  /**
   * Get current speaker
   */
  getCurrentSpeaker(): string | null {
    return this.conversationState.currentSpeaker;
  }

  /**
   * Reset conversation
   */
  resetConversation() {
    this.conversationHistory = [];
    this.conversationState = {
      currentSpeaker: null,
      lastSpeakers: [],
      messageCount: 0,
      phase: 'opening',
      topicsDiscussed: new Set(),
      agentStates: new Map()
    };
    
    // Reset agent states
    this.voiceAgents.forEach((agent, id) => {
      this.conversationState.agentStates.set(id, {
        hasSpoken: false,
        messageCount: 0,
        lastTopics: [],
        emotionalState: 'neutral',
        speakingTurn: 0
      });
    });
  }

  /**
   * Check if system is currently processing
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

export { MultiAgentOrchestrator, type ConversationMessage, type ConversationParticipant, type MeetingContext };