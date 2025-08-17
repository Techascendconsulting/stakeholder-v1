import OpenAI from 'openai';
import { Message } from '../types';
import SessionCacheService from './sessionCache';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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
  conversationHistory: any[];
  stakeholders?: StakeholderContext[];
  isOneOnOne?: boolean;
}

// Conversational State Management
interface ConversationState {
  messageCount: number;
  participantInteractions: Map<string, number>;
  topicsDiscussed: Set<string>;
  lastSpeakers: string[];
  greetingStatus: Map<string, 'not_greeted' | 'greeted' | 're_greeted'>;
  conversationPhase: 'opening' | 'as_is' | 'pain_points' | 'solutioning' | 'deep_dive' | 'closing' | 'exploration';
  stakeholderStates: Map<string, StakeholderState>;
  clarificationNeededFor?: string | null;
}

interface StakeholderState {
  hasSpoken: boolean;
  lastTopics: string[];
  commitmentsMade: string[];
  questionsAsked: string[];
  emotionalState: 'engaged' | 'neutral' | 'concerned' | 'excited';
  conversationStyle: 'leading' | 'supporting' | 'observing';
  voiceConsistency: {
    tonePattern: string;
    vocabularyLevel: 'technical' | 'business' | 'conversational';
    responseLength: 'concise' | 'detailed' | 'comprehensive';
  };
}

export class AIService {
  private static instance: AIService;
  private conversationState: ConversationState;
  private sessionCache = SessionCacheService.getInstance();
  private static readonly CONFIG = {
    mention: {
      confidenceThreshold: 0.6,
      pauseBase: 1200,
      pauseVariance: 800,
      noMentionToken: "NONE"
    },
    conversation: {
      baseTemperature: 0.7,
      phaseModifiers: {
        deepDive: 0.1,
        normal: 0
      },
      emotionalModifiers: {
        excited: 0.1,
        concerned: 0.05,
        neutral: 0
      },
      temperatureBounds: { min: 0.3, max: 1.0 },
      presencePenalty: 0.4,
      frequencyPenalty: 0.5
    },
    tokens: {
      base: 200, // Increased for complete responses
      teamFactor: 1.0,
      experienceFactors: { spoken: 1.1, newSpeaker: 1.2 },
      phaseFactors: { deepDive: 1.5, normal: 1.2 }, // Increased for detailed discussions
      maxTokens: 500 // Increased to prevent truncation
    },
    penalties: {
      presenceBase: 0.1,
      presenceIncrement: 0.05,
      frequencyBase: 0.1,
      frequencyIncrement: 0.1,
      maxPenalty: 0.8
    },
    conversation_flow: {
      maxLastSpeakers: 3,
      maxTopicsPerStakeholder: 5,
      openingPhaseMessages: 3,
      closingPhaseMessages: 25,
      recentMessagesCount: 5,
      openingThreshold: 5
    },
    ai_models: {
      // Cost optimization: Force all models to use gpt-3.5-turbo for 97% cost savings
      primary: "gpt-3.5-turbo",
      phaseDetection: "gpt-3.5-turbo", 
      noteGeneration: "gpt-3.5-turbo",
      greeting: "gpt-3.5-turbo"
    },
    ai_params: {
      phaseDetection: { temperature: 0.1, maxTokens: 15 }, // Reduced from 20 (25% reduction)
      greeting: { temperature: 0.8, maxTokens: 150, presencePenalty: 0.6, frequencyPenalty: 0.6 }, // Reduced from 200 (25% reduction)
      noteGeneration: { temperature: 0.2, maxTokens: 900 } // Reduced from 1200 (25% reduction)
    }
  };
  
  private constructor() {
    this.conversationState = this.initializeConversationState();

    // Log model configuration for cost awareness
    const env = import.meta.env.VITE_APP_ENV || 'development';
    console.log(`🤖 AIService initialized for ${env} environment:`, {
      primary: AIService.CONFIG.ai_models.primary,
      phaseDetection: AIService.CONFIG.ai_models.phaseDetection,
      noteGeneration: AIService.CONFIG.ai_models.noteGeneration,
      greeting: AIService.CONFIG.ai_models.greeting,
      costSavings: env === 'development' ? '~85% cheaper than production' : 'Production costs'
    });
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
      AIService.instance.sessionCache = SessionCacheService.getInstance();
    }
    return AIService.instance;
  }

  // Getter for configuration values
  static getMentionConfidenceThreshold(): number {
    return AIService.CONFIG.mention.confidenceThreshold;
  }

  static getMentionPauseConfig(): { base: number; variance: number } {
    return {
      base: AIService.CONFIG.mention.pauseBase,
      variance: AIService.CONFIG.mention.pauseVariance
    };
  }

  // Additional configuration getters for external customization
  static getConversationConfig() {
    return { ...AIService.CONFIG.conversation };
  }

  static getTokenConfig() {
    return { ...AIService.CONFIG.tokens };
  }

  static getPenaltyConfig() {
    return { ...AIService.CONFIG.penalties };
  }

  static getConversationFlowConfig() {
    return { ...AIService.CONFIG.conversation_flow };
  }

  static getAIModelsConfig() {
    return { ...AIService.CONFIG.ai_models };
  }

  static getAIParamsConfig() {
    return { ...AIService.CONFIG.ai_params };
  }

  // Method to update configuration dynamically (if needed)
  static updateMentionConfig(newConfig: Partial<typeof AIService.CONFIG.mention>): void {
    Object.assign(AIService.CONFIG.mention, newConfig);
  }

  static updateConversationConfig(newConfig: Partial<typeof AIService.CONFIG.conversation>): void {
    Object.assign(AIService.CONFIG.conversation, newConfig);
  }

  private initializeConversationState(): ConversationState {
    return {
      messageCount: 0,
      participantInteractions: new Map(),
      topicsDiscussed: new Set(),
      lastSpeakers: [],
      greetingStatus: new Map(),
      conversationPhase: 'opening',
      stakeholderStates: new Map(),
      clarificationNeededFor: null
    };
  }

  // Advanced configuration for super intelligent responses
  private getDynamicConfig(context: ConversationContext, stakeholder: StakeholderContext) {
    const teamSize = context.stakeholders?.length || 1;
    const messageCount = context.conversationHistory.length;
    const stakeholderState = this.getStakeholderState(stakeholder.name);
    
    // Optimized temperature for natural, conversational responses
    const baseTemperature = AIService.CONFIG.conversation.baseTemperature; // Balanced for natural conversation
    const phaseModifier = this.conversationState.conversationPhase === 'deep_dive' ? 
      AIService.CONFIG.conversation.phaseModifiers.deepDive : 
      AIService.CONFIG.conversation.phaseModifiers.normal;
    const emotionalModifier = AIService.CONFIG.conversation.emotionalModifiers[stakeholderState.emotionalState] || 0;
    
          return {
        temperature: Math.min(AIService.CONFIG.conversation.temperatureBounds.max, Math.max(AIService.CONFIG.conversation.temperatureBounds.min, baseTemperature + phaseModifier + emotionalModifier)),
        maxTokens: this.calculateDynamicTokens(teamSize, messageCount, stakeholderState),
        presencePenalty: AIService.CONFIG.conversation.presencePenalty, // Encourage variety in responses
        frequencyPenalty: AIService.CONFIG.conversation.frequencyPenalty  // Prevent repetitive language
      };
  }

  private calculateDynamicTokens(teamSize: number, messageCount: number, stakeholderState: StakeholderState): number {
    // CONVERSATIONAL responses - helpful but not overwhelming
    const baseTokens = AIService.CONFIG.tokens.base; // Base for natural, conversational responses
    const teamFactor = AIService.CONFIG.tokens.teamFactor; // Consistent responses regardless of team size
    const experienceFactor = stakeholderState.hasSpoken ? AIService.CONFIG.tokens.experienceFactors.spoken : AIService.CONFIG.tokens.experienceFactors.newSpeaker; // Slightly more for experienced speakers
    const phaseFactor = this.conversationState.conversationPhase === 'deep_dive' ? 
      AIService.CONFIG.tokens.phaseFactors.deepDive : 
      AIService.CONFIG.tokens.phaseFactors.normal; // More for detailed discussions but still conversational
    
    // Allow for helpful but not overwhelming responses
    const calculatedTokens = Math.floor(baseTokens * teamFactor * experienceFactor * phaseFactor);
    return Math.min(calculatedTokens, AIService.CONFIG.tokens.maxTokens); // Cap for natural conversation responses
  }

  private calculatePresencePenalty(stakeholderName: string): number {
    const interactions = this.conversationState.participantInteractions.get(stakeholderName) || 0;
    return Math.min(AIService.CONFIG.penalties.maxPenalty, AIService.CONFIG.penalties.presenceBase + (interactions * AIService.CONFIG.penalties.presenceIncrement)); // Increase penalty for frequent speakers
  }

  private calculateFrequencyPenalty(stakeholderName: string): number {
    const stakeholderState = this.getStakeholderState(stakeholderName);
    const topicRepetition = stakeholderState.lastTopics.length;
    return Math.min(AIService.CONFIG.penalties.maxPenalty, AIService.CONFIG.penalties.frequencyBase + (topicRepetition * AIService.CONFIG.penalties.frequencyIncrement)); // Prevent topic repetition
  }

  // Get or create stakeholder state
  private getStakeholderState(stakeholderName: string): StakeholderState {
    if (!this.conversationState.stakeholderStates.has(stakeholderName)) {
      this.conversationState.stakeholderStates.set(stakeholderName, {
        hasSpoken: false,
        lastTopics: [],
        commitmentsMade: [],
        questionsAsked: [],
        emotionalState: 'neutral',
        conversationStyle: 'supporting',
        voiceConsistency: {
          tonePattern: 'professional and collaborative',
          vocabularyLevel: 'business',
          responseLength: 'detailed'
        }
      });
    }
    return this.conversationState.stakeholderStates.get(stakeholderName)!;
  }

  // Update conversation state dynamically
  private async updateConversationState(stakeholder: StakeholderContext, userMessage: string, aiResponse: string, context: ConversationContext) {
    this.conversationState.messageCount++;
    
    // Ensure conversationHistory is always an array
    const history = Array.isArray(context.conversationHistory) ? context.conversationHistory : [];
    (context as any).conversationHistory = history;
    
    // Update participant interactions
    this.updateParticipantInteractions(stakeholder.name, userMessage, aiResponse);
    
    // Update topic trends
    const stakeholderState = this.getStakeholderState(stakeholder.name);
    this.extractAndUpdateTopics(aiResponse, stakeholderState);
    
    // Update conversation phase dynamically
    await this.updateConversationPhase(context);
    
    // Update emotional state based on content
    this.updateEmotionalState(stakeholder.name, userMessage, aiResponse);
  }

  private extractAndUpdateTopics(response: string, stakeholderState: StakeholderState) {
    const topicKeywords = [
      'process', 'system', 'workflow', 'efficiency', 'cost', 'budget', 'quality',
      'timeline', 'schedule', 'resources', 'team', 'customer', 'service', 'technology',
      'integration', 'security', 'compliance', 'training', 'communication', 'reporting'
    ];
    
    const responseWords = response.toLowerCase().split(/\s+/);
    const foundTopics = topicKeywords.filter(topic => responseWords.includes(topic));
    
    foundTopics.forEach(topic => {
      if (!stakeholderState.lastTopics.includes(topic)) {
        stakeholderState.lastTopics.push(topic);
        this.conversationState.topicsDiscussed.add(topic);
      }
    });
    
    // Keep only last 5 topics per stakeholder
    if (stakeholderState.lastTopics.length > AIService.CONFIG.conversation_flow.maxTopicsPerStakeholder) {
      stakeholderState.lastTopics = stakeholderState.lastTopics.slice(-AIService.CONFIG.conversation_flow.maxTopicsPerStakeholder);
    }
  }

  private async updateConversationPhase(context: ConversationContext) {
    const messageCount = this.conversationState.messageCount;
    
    // Handle basic opening phase
    if (messageCount <= AIService.CONFIG.conversation_flow.openingThreshold) {
      this.conversationState.conversationPhase = 'opening';
      return;
    }
    
    // Analyze conversation content to determine business analysis phase
    const recentMessages = (Array.isArray(context.conversationHistory) ? context.conversationHistory : []).slice(-AIService.CONFIG.conversation_flow.recentMessagesCount);
    const conversationContent = recentMessages.map(msg => msg.content).join(' ');
    
    // Force as_is phase if explicit current process request
    if (/current\s+process|as-?is|"as is"|walk\s+me\s+through|how\s+it\s+works/i.test(conversationContent)) {
      this.conversationState.conversationPhase = 'as_is';
      return;
    }
    
    // Default progression
    if (messageCount > AIService.CONFIG.conversation_flow.openingThreshold + 2) {
      this.conversationState.conversationPhase = 'exploration';
    }
  }

  private updateEmotionalState(stakeholderName: string, userMessage: string, aiResponse: string) {
    const stakeholderState = this.getStakeholderState(stakeholderName);
    
    // Analyze emotional indicators in user message and AI response
    const positiveIndicators = ['great', 'excellent', 'excited', 'fantastic', 'love', 'perfect'];
    const negativeIndicators = ['concerned', 'worried', 'issue', 'problem', 'difficult', 'challenge'];
    
    const messageText = (userMessage + ' ' + aiResponse).toLowerCase();
    
    const positiveScore = positiveIndicators.reduce((score, indicator) => 
      score + (messageText.includes(indicator) ? 1 : 0), 0);
    const negativeScore = negativeIndicators.reduce((score, indicator) => 
      score + (messageText.includes(indicator) ? 1 : 0), 0);
    
    if (positiveScore > negativeScore) {
      stakeholderState.emotionalState = 'excited';
    } else if (negativeScore > positiveScore) {
      stakeholderState.emotionalState = 'concerned';
    } else {
      stakeholderState.emotionalState = 'engaged';
    }
  }

  // Dynamic greeting management
  private async getGreetingResponse(stakeholder: StakeholderContext, context: ConversationContext): Promise<string> {
    const greetingStatus = this.conversationState.greetingStatus.get(stakeholder.name) || 'not_greeted';
    
    if (greetingStatus === 'not_greeted') {
      this.conversationState.greetingStatus.set(stakeholder.name, 'greeted');
      return await this.generateInitialGreeting(stakeholder, context);
    } else if (greetingStatus === 'greeted') {
      this.conversationState.greetingStatus.set(stakeholder.name, 're_greeted');
      return this.generateFollowUpGreeting(stakeholder, context);
    } else {
      // Already greeted multiple times, redirect to business
      return this.generateBusinessRedirect(stakeholder, context);
    }
  }

  private async generateInitialGreeting(stakeholder: StakeholderContext, context: ConversationContext): Promise<string> {
    try {
      // Generate truly dynamic greeting using AI - NO HARD-CODING
      const greetingPrompt = `Generate a natural, conversational greeting for ${stakeholder.name}, a ${stakeholder.role} in ${stakeholder.department}, joining a stakeholder meeting for "${context.project.name}".

CONTEXT:
- Project: ${context.project.name} (${context.project.type})
- Stakeholder: ${stakeholder.name} (${stakeholder.role}, ${stakeholder.department})
- Personality: ${stakeholder.personality}
- Priorities: ${stakeholder.priorities.join(', ')}
- Expertise: ${stakeholder.expertise.join(', ')}

REQUIREMENTS:
- Keep it natural and conversational (1-2 sentences max)
- Show personality traits (${stakeholder.personality})
- Make it unique to this stakeholder's role and department
- Avoid templates or formulaic language
- Sound like a real person joining a meeting
- NO mentions of "particularly interested in how X will impact Y"
- Make it fresh and authentic

CRITICAL: DO NOT have the stakeholder address themselves by name (NO "Hi ${stakeholder.name}" or "Hey ${stakeholder.name}"). They are responding to the Business Analyst interviewer.

Generate only the greeting, nothing else.`;

      const completion = await openai.chat.completions.create({
        model: AIService.CONFIG.ai_models.greeting,
        messages: [
          { role: "user", content: greetingPrompt }
        ],
        temperature: AIService.CONFIG.ai_params.greeting.temperature,
        max_tokens: AIService.CONFIG.ai_params.greeting.maxTokens,
        presence_penalty: AIService.CONFIG.ai_params.greeting.presencePenalty,
        frequency_penalty: AIService.CONFIG.ai_params.greeting.frequencyPenalty
      });

      const aiGreeting = completion.choices[0]?.message?.content?.trim();
      
      if (aiGreeting && aiGreeting.length > 10) {
        return aiGreeting;
      }
      
      // Fallback to simple dynamic greeting if AI fails
      return this.generateSimpleDynamicGreeting(stakeholder, context);
      
    } catch (error) {
      console.error('Error generating dynamic greeting:', error);
      return this.generateSimpleDynamicGreeting(stakeholder, context);
    }
  }

  private generateSimpleDynamicGreeting(stakeholder: StakeholderContext, context: ConversationContext): string {
    const dynamicGreetings = [
      `Hi everyone! ${stakeholder.name} here, ready to dive in.`,
      `Hello team! Looking forward to discussing this from a ${stakeholder.department.toLowerCase()} perspective.`,
      `Good morning everyone! ${stakeholder.name} from ${stakeholder.department} - excited to be here.`,
      `Hey there! Ready to tackle this project together.`,
      `Hello! ${stakeholder.name} here - let's get started.`,
      `Hi all! Great to be part of this discussion.`,
      `Good morning team! ${stakeholder.name} ready to contribute.`,
      `Hello everyone! Looking forward to our conversation today.`
    ];
    
    return dynamicGreetings[Math.floor(Math.random() * dynamicGreetings.length)];
  }

  private generateFollowUpGreeting(stakeholder: StakeholderContext, context: ConversationContext): string {
    const followUpStyles = [
      "I believe I mentioned I was looking forward to this discussion. Shall we dive into the specifics?",
      "As I said, I'm ready to explore the details. What aspects should we focus on first?",
      "I'm still engaged and ready to contribute. What direction would you like to take this conversation?",
      "I'm here and ready to discuss. What specific areas would be most valuable to explore?",
      "I'm prepared to share my perspective. What would be most helpful to discuss next?"
    ];
    
    const randomIndex = Math.floor(Math.random() * followUpStyles.length);
    return followUpStyles[randomIndex];
  }

  private generateBusinessRedirect(stakeholder: StakeholderContext, context: ConversationContext): string {
    const redirectStyles = [
      "I think we've covered the introductions. Let's focus on the business requirements.",
      "We're all here and ready. What specific aspects of the project should we discuss first?",
      "I'm engaged and ready to contribute. What would be most valuable to explore?",
      "Let's move forward with the discussion. What are the key areas we need to address?",
      "I'm prepared to share insights. What business challenges should we prioritize?"
    ];
    
    const randomIndex = Math.floor(Math.random() * redirectStyles.length);
    return redirectStyles[randomIndex];
  }

  private getPersonalityKey(personality: string): string {
    if (!personality || typeof personality !== 'string') {
      return 'collaborative';
    }
    const personalityLower = personality.toLowerCase();
    if (personalityLower.includes('collaborative')) return 'collaborative';
    if (personalityLower.includes('analytical')) return 'analytical';
    if (personalityLower.includes('strategic')) return 'strategic';
    if (personalityLower.includes('practical')) return 'practical';
    if (personalityLower.includes('innovative')) return 'innovative';
    return 'collaborative';
  }

  // Context-aware message analysis - no hardcoded patterns
  private isGreetingMessage(userMessage: string, conversationHistory: any[]): boolean {
    const history = Array.isArray(conversationHistory) ? conversationHistory : []
    if (history.length > 2) return false
    return /\b(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/i.test(userMessage)
  }

  // Main response generation with full conversational intelligence
  async generateStakeholderResponse(
    userMessage: string,
    stakeholder: StakeholderContext,
    context: ConversationContext,
    responseType: 'greeting' | 'discussion' | 'baton_pass' | 'direct_mention' = 'discussion'
  ): Promise<string> {
    try {
      // Handle greetings intelligently
      if (this.isGreetingMessage(userMessage, context.conversationHistory)) {
        const greetingResponse = await this.getGreetingResponse(stakeholder, context);
        await this.updateConversationState(stakeholder, userMessage, greetingResponse, context);
        return greetingResponse;
      }

      // Single-turn clarification: if unclear, ask 1 concise clarifying question, then expect next turn to be substantive
      if (!this.conversationState.clarificationNeededFor && this.looksUnclearQuestion(userMessage)) {
        this.conversationState.clarificationNeededFor = stakeholder.name;
        const clarifier = this.ensureCompleteResponse(
          `Quick clarification: do you mean UK frameworks like UK GDPR/ICO guidance, Bribery Act, FCA rules, HMRC expense policy, or general expense policy enforcement?`
        );
        await this.updateConversationState(stakeholder, userMessage, clarifier, context);
        return this.sanitizeConversationalTics(this.filterSelfReferences(clarifier, stakeholder), userMessage);
      }
      
      // If a clarification was requested previously, clear the flag and proceed with a substantive answer now
      if (this.conversationState.clarificationNeededFor) {
        this.conversationState.clarificationNeededFor = null;
      }

      // Handle direct mentions specially
      if (responseType === 'direct_mention') {
        const directMentionPrompt = this.buildDirectMentionPrompt(userMessage, stakeholder, context);
        
        const completion = await openai.chat.completions.create({
          model: AIService.CONFIG.ai_models.primary,
          messages: [
            { role: "system", content: this.buildDynamicSystemPrompt(stakeholder, context, responseType) },
            { role: "user", content: directMentionPrompt }
          ],
          temperature: AIService.CONFIG.conversation.baseTemperature,
          max_tokens: AIService.CONFIG.tokens.maxTokens,
          presence_penalty: AIService.CONFIG.conversation.presencePenalty,
          frequency_penalty: AIService.CONFIG.conversation.frequencyPenalty
        });

        let directResponse = completion.choices[0]?.message?.content || 
          this.generateDynamicFallback(stakeholder, userMessage, context);

        directResponse = this.ensureCompleteResponse(directResponse);
        directResponse = this.filterSelfReferences(directResponse, stakeholder);
        directResponse = this.sanitizeConversationalTics(directResponse, userMessage);
        
        await this.updateConversationState(stakeholder, userMessage, directResponse, context);
        return directResponse;
      }

      // Generate dynamic AI response for discussions
      const dynamicConfig = this.getDynamicConfig(context, stakeholder);
      const systemPrompt = this.buildDynamicSystemPrompt(stakeholder, context, responseType);
      const conversationPrompt = await this.buildContextualPrompt(userMessage, context, stakeholder);

      const completion = await openai.chat.completions.create({
        model: AIService.CONFIG.ai_models.primary,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: conversationPrompt }
        ],
        temperature: dynamicConfig.temperature,
        max_tokens: dynamicConfig.maxTokens,
        presence_penalty: dynamicConfig.presencePenalty,
        frequency_penalty: dynamicConfig.frequencyPenalty
      });

      let aiResponse = completion.choices[0]?.message?.content || 
        this.generateDynamicFallback(stakeholder, userMessage, context);

      // Ensure response is complete and not cut off mid-sentence
      aiResponse = this.ensureCompleteResponse(aiResponse);

      // Filter out self-referencing by name (safety net)
      aiResponse = this.filterSelfReferences(aiResponse, stakeholder);

      // Filter out solutions during as_is phase (safety net)
      aiResponse = this.filterSolutionsInAsIsPhase(aiResponse, this.conversationState.conversationPhase);

      // Remove greetings/template closings unless appropriate
      aiResponse = this.sanitizeConversationalTics(aiResponse, userMessage);

      await this.updateConversationState(stakeholder, userMessage, aiResponse, context);
      return aiResponse;

    } catch (error) {
      console.error('AI Service Error:', error);
              return await this.generateDynamicFallback(stakeholder, userMessage, context);
    }
  }

  // Simple fallback filter for self-references (should not be needed with proper prompting)
  private filterSelfReferences(response: string, stakeholder: StakeholderContext): string {
    if (!response || !stakeholder) return response;
    
    // Simple fallback - if the system prompt is working, this shouldn't be needed
    const firstName = stakeholder.name.split(' ')[0];
    
    // Only fix the most obvious self-referencing patterns as a safety net
    let filtered = response
      .replace(new RegExp(`\\b[Hh](i|ey)\\s+${firstName}[,\\s]`, 'g'), 'Hi there, ')
      .replace(new RegExp(`\\b[Gg]ood\\s+morning\\s+${firstName}[,\\s]`, 'g'), 'Good morning, ')
      .replace(new RegExp(`\\b[Hh]ello\\s+${firstName}[,\\s]`, 'g'), 'Hello, ');
    
    return filtered;
  }

  // Filter out solutions during as_is phase (safety net)
  private filterSolutionsInAsIsPhase(response: string, currentPhase: string): string {
    if (!response || currentPhase !== 'as_is') return response;
    
    // Solution-indicating patterns to remove/replace during as_is phase
    const solutionPatterns = [
      { pattern: /\b(I|We)\s+(recommend|suggest|propose)\b/gi, replacement: 'Currently, we' },
      { pattern: /\b(should|could|would)\s+(implement|improve|change)\b/gi, replacement: 'currently' },
      { pattern: /\b(let's|we need to)\s+(implement|improve|change)\b/gi, replacement: 'currently we' },
      { pattern: /\bI\s+think\s+we\s+(should|could|would)\b/gi, replacement: 'Currently we' },
      { pattern: /\bmy\s+recommendation\s+is\b/gi, replacement: 'Currently' },
      { pattern: /\bI\s+would\s+suggest\b/gi, replacement: 'Currently' },
      { pattern: /\bwe\s+could\s+consider\b/gi, replacement: 'we currently' }
    ];
    
    let filtered = response;
    solutionPatterns.forEach(({ pattern, replacement }) => {
      filtered = filtered.replace(pattern, replacement);
    });
    
    return filtered;
  }

  // Ensure AI responses are complete and naturally formatted
  private ensureCompleteResponse(response: string): string {
    if (!response || response.length === 0) {
      return "I'd be happy to discuss this further.";
    }

    // Trim whitespace but preserve the intelligent response
    let cleanResponse = response.trim();
    
    // Remove any markdown formatting to ensure natural speech
    cleanResponse = cleanResponse
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1')      // Remove italic *text*
      .replace(/__(.*?)__/g, '$1')      // Remove bold __text__
      .replace(/_(.*?)_/g, '$1')        // Remove italic _text_
      .replace(/`(.*?)`/g, '$1')        // Remove code `text`
      .replace(/#{1,6}\s/g, '')         // Remove heading markers
      .replace(/^\s*[-*+]\s/gm, '')     // Remove bullet points
      .replace(/^\s*\d+\.\s/gm, '')     // Remove numbered lists
    
    // Only handle truly broken responses - let intelligent, comprehensive responses through
    if (cleanResponse.length < 10) {
      return "I'd be happy to provide more detailed information on this topic.";
    }
    
    // DETECT AND FIX TRUNCATED RESPONSES
    // Check for incomplete sentences (common truncation patterns)
    const truncationPatterns = [
      /\s(I|It|This|That|We|They|The|A|An)\.$/, // Single word + period (like "It.")
      /\s(I'm|It's|We're|They're|That's)\.$/, // Contractions + period
      /\s(and|or|but|so|because|when|while|if|although|since|until)\.$/, // Conjunctions + period
      /\s(in|on|at|by|for|with|from|to|of|about)\.$/, // Prepositions + period
      /\s[a-z]{1,3}\.$/, // Very short words + period (likely incomplete)
    ];
    
    const hasTruncation = truncationPatterns.some(pattern => pattern.test(cleanResponse));
    
    if (hasTruncation) {
      console.warn('🚨 TRUNCATION: Detected incomplete response, removing incomplete sentence');
      // Remove the last sentence if it appears truncated
      const sentences = cleanResponse.split(/(?<=[.!?])\s+/);
      if (sentences.length > 1) {
        // Remove the last (likely incomplete) sentence
        cleanResponse = sentences.slice(0, -1).join(' ');
        console.log('🔧 TRUNCATION: Removed incomplete sentence, kept:', cleanResponse.substring(cleanResponse.length - 50));
      }
    }
    
    // Only add punctuation if the response doesn't end with any punctuation
    if (!/[.!?:;]$/.test(cleanResponse)) {
      cleanResponse += '.';
    }

    // Return the full intelligent response in natural speech format
    return cleanResponse;
  }

  // Generate stakeholder response with real-time streaming
  // Get system prompt for real-time streaming service
  async getSystemPromptForStreaming(
    stakeholder: StakeholderContext,
    context: ConversationContext,
    responseType: string = 'direct_mention'
  ): Promise<string> {
    return this.buildDynamicSystemPrompt(stakeholder, context, responseType);
  }

  // Get contextual prompt for real-time streaming service  
  async getContextualPromptForStreaming(
    userMessage: string,
    context: ConversationContext,
    stakeholder: StakeholderContext
  ): Promise<string> {
    return this.buildContextualPrompt(userMessage, context, stakeholder);
  }

  async generateStakeholderResponseStreaming(
    userMessage: string,
    stakeholder: StakeholderContext,
    context: ConversationContext,
    responseType: 'greeting' | 'discussion' | 'baton_pass' | 'direct_mention' = 'discussion',
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      console.log(`🚀 Starting streaming response for ${stakeholder.name}...`);
      
      // Build contextual prompt (simplified for streaming)
      const prompt = await this.buildContextualPrompt(userMessage, context, stakeholder);
      
      const completion = await openai.chat.completions.create({
        model: AIService.CONFIG.ai_models.primary,
        messages: [
          {
            role: "system",
            content: prompt
          },
          {
            role: "user", 
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        stream: true
      });

      let fullResponse = '';
      let currentChunk = '';
      let wordCount = 0;
      let chunkOrder = 0;
      
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          currentChunk += content;
          
          const words = content.split(/\s+/).filter(w => w.length > 0);
          wordCount += words.length;
          
          // Send chunk when we have enough words or hit punctuation
          const shouldSendChunk = 
            wordCount >= 6 ||
            content.includes('.') || 
            content.includes('!') || 
            content.includes('?') || 
            content.includes(',') ||
            currentChunk.length > 50;
          
          if (shouldSendChunk && currentChunk.trim() && onChunk) {
            console.log(`📝 STREAMING CHUNK ${chunkOrder}: "${currentChunk.trim()}" (${wordCount} words)`);
            onChunk(currentChunk.trim());
            currentChunk = '';
            wordCount = 0;
            chunkOrder++;
          }
        }
      }
      
      // Send any remaining content
      if (currentChunk.trim() && onChunk) {
        console.log(`📝 FINAL CHUNK ${chunkOrder}: "${currentChunk.trim()}"`);
        onChunk(currentChunk.trim());
      }
      
      console.log(`✅ Streaming completed for ${stakeholder.name}: "${fullResponse.substring(0, 50)}..."`);
      return fullResponse.trim();
      
    } catch (error) {
      console.error(`❌ Streaming error for ${stakeholder.name}:`, error);
      // Fallback to non-streaming
      return await this.generateStakeholderResponse(userMessage, stakeholder, context, responseType);
    }
  }

  // Generate comprehensive interview notes with progressive feedback
  async generateInterviewNotes(meetingData: any, progressCallback?: (progress: string) => void): Promise<string> {
    try {
      const { project, participants, messages, startTime, endTime, duration, user } = meetingData;
      
      // Provide immediate feedback
      if (progressCallback) {
        progressCallback('Processing meeting transcript...');
      }
      
      // Format conversation for AI analysis (optimized for faster processing)
      const conversationTranscript = messages.map((msg: any) => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        if (msg.speaker === 'user') {
          return `[${time}] BA: ${msg.content}`;
        } else {
          return `[${time}] ${msg.stakeholderName}: ${msg.content}`;
        }
      }).join('\n');

      // Generate basic structure immediately
      const basicNotes = this.generateBasicStructure(meetingData);
      
      if (progressCallback) {
        progressCallback('Analyzing conversation content...');
      }

      // Use enhanced prompt for clean, professional formatting
      const prompt = `Analyze this stakeholder meeting transcript and generate professional, well-formatted interview notes.

PROJECT: ${project.name}
DURATION: ${duration} minutes
PARTICIPANTS: ${participants.map((p: any) => `${p.name} (${p.role})`).join(', ')}

TRANSCRIPT:
${conversationTranscript}

Generate clean, professional notes using this EXACT format (no asterisks, no markdown symbols):

## Executive Summary
[Write 2-3 sentences summarizing the meeting's key outcomes and purpose]

## Key Discussion Topics
[List the main topics discussed, using clear paragraph format without bullet points]

## Stakeholder Insights
[For each participant, provide their key contributions and perspectives in paragraph format]

## Current State Analysis
[Describe the current processes, systems, and workflows discussed]

## Challenges and Pain Points
[Identify problems, inefficiencies, and concerns raised during the discussion]

## Requirements and Needs
[List the requirements, needs, and expectations identified]

## Next Steps and Action Items
[Outline any follow-up actions, decisions, or next steps discussed]

FORMATTING REQUIREMENTS:
- Use clean paragraph format, no asterisks or bullet symbols
- Use clear section headers with ##
- Write in professional, business-appropriate language
- Focus on actionable insights and concrete information
- Keep each section concise but comprehensive
- Use proper sentence structure and grammar`;

      if (progressCallback) {
        progressCallback('Generating AI analysis...');
      }

      const completion = await openai.chat.completions.create({
        model: AIService.CONFIG.ai_models.noteGeneration,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: AIService.CONFIG.ai_params.noteGeneration.temperature,
        max_tokens: AIService.CONFIG.ai_params.noteGeneration.maxTokens
      });

      const aiAnalysis = completion.choices[0]?.message?.content || '';
      
      if (progressCallback) {
        progressCallback('Finalizing notes...');
      }

      // Combine basic structure with AI analysis
      const enhancedNotes = this.combineNotesWithAnalysis(basicNotes, aiAnalysis);
      
      return enhancedNotes;
    } catch (error) {
      console.error('Error generating interview notes:', error);
      return this.getFallbackNotes(meetingData);
    }
  }

  // Generate clean, professional basic structure
  private generateBasicStructure(meetingData: any): string {
    const { project, participants, messages, startTime, endTime, duration, user } = meetingData;
    const userName = user?.email?.split('@')[0] || user?.displayName || 'Business Analyst';
    
    return `# Meeting Summary: ${project.name}

## Meeting Details
Date: ${new Date(startTime).toLocaleDateString()}  
Time: ${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()}  
Duration: ${duration} minutes  
Facilitator: ${userName}  
Project: ${project.name}  
Project Type: ${project.type || 'Business Analysis'}  

## Meeting Participants
${participants.map((p: any) => `${p.name} - ${p.role}${p.department ? `, ${p.department}` : ''}`).join('  \n')}

## Meeting Overview
This ${duration}-minute stakeholder meeting involved ${participants.length} participant${participants.length > 1 ? 's' : ''} and covered ${messages.filter((m: any) => m.speaker !== 'user').length} stakeholder responses across various project topics.

---

Generating detailed analysis...`;
  }

  // Combine basic structure with AI analysis for clean output
  private combineNotesWithAnalysis(basicNotes: string, aiAnalysis: string): string {
    if (!aiAnalysis) {
      return basicNotes.replace('*Generating detailed analysis...*', 
        '## Analysis Status\nDetailed analysis could not be generated at this time. The meeting details and participant information above provide a basic summary of the session.');
    }

    // Clean the AI analysis content
    let cleanedAnalysis = aiAnalysis.trim();
    
    // Remove any asterisk bullet points that might have slipped through
    cleanedAnalysis = cleanedAnalysis.replace(/^\s*\*\s+/gm, '');
    cleanedAnalysis = cleanedAnalysis.replace(/^\s*-\s+/gm, '');
    
    // Ensure proper section formatting
    cleanedAnalysis = cleanedAnalysis.replace(/^([A-Z][^#\n]*):?\s*$/gm, '## $1');
    
    // Replace processing message with actual analysis
    const finalNotes = basicNotes.replace(
      '*Generating detailed analysis...*',
      `${cleanedAnalysis}

---

Summary Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
    );

    return finalNotes;
  }

  // Clean fallback notes generation if AI fails
  private getFallbackNotes(meetingData: any): string {
    const { project, participants, messages, startTime, endTime, duration, user } = meetingData;
    const userName = user?.email?.split('@')[0] || user?.displayName || 'Business Analyst';
    
    return `# Meeting Summary: ${project.name}

## Meeting Details
Date: ${new Date(startTime).toLocaleDateString()}  
Time: ${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()}  
Duration: ${duration} minutes  
Facilitator: ${userName}  
Project: ${project.name}  

## Meeting Participants
${participants.map((p: any) => `${p.name} - ${p.role}${p.department ? `, ${p.department}` : ''}`).join('  \n')}

## Executive Summary
This meeting session involved discussions with ${participants.length} stakeholder${participants.length > 1 ? 's' : ''} regarding the ${project.name} project. The conversation included ${messages.filter((m: any) => m.speaker !== 'user').length} stakeholder responses covering various project aspects and requirements.

## Meeting Overview
The session focused on gathering stakeholder input and understanding different perspectives related to the project objectives. Key discussions involved current processes, challenges, and potential areas for improvement.

## Analysis Note
Due to technical limitations, a detailed AI analysis could not be generated for this meeting. The complete conversation transcript is available in the Raw Transcript section for manual review and analysis.

---

Summary Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}  
Note: This is a basic summary. For detailed insights, please review the complete transcript.`;
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
    const recentMessages = (Array.isArray(conversationHistory) ? conversationHistory : []).slice(-10);
    
    recentMessages.forEach((msg, index) => {
      if (msg.stakeholderName && msg.stakeholderName !== currentStakeholder.name) {
        interactions.push(`${msg.stakeholderName}: ${msg.content}`);
      }
    });
    
    return interactions;
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
      'Marketing': ['Sales', 'Product', 'Customer Service']
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

  // Enhanced personality modeling system - HUMAN CONVERSATIONAL STYLE
  private buildPersonalityGuidance(stakeholder: StakeholderContext): string {
    const personalityMap: { [key: string]: string } = {
      'Analytical': 'You naturally think things through and like to understand the details. Talk like: "Hmm, let me think about this...", "I\'m curious about the numbers here", "Wait, can you walk me through that again?", "From what I\'m seeing..."',
      'Collaborative': 'You love working with others and building on ideas together. Talk like: "Oh, that\'s interesting! What do you think about...", "Yeah, and building on that...", "I\'m wondering what everyone else thinks?", "That reminds me of what Sarah mentioned..."',
      'Strategic': 'You naturally connect things to the bigger picture and long-term thinking. Talk like: "You know, this makes me think about...", "I\'m wondering how this fits with...", "From a bigger picture perspective...", "This could really impact..."',
      'Practical': 'You focus on what actually works in the real world. Talk like: "In my experience...", "The thing is, in practice...", "What I\'ve seen work is...", "Here\'s the reality though..."',
      'Innovative': 'You get excited about new ideas and creative solutions. Talk like: "Oh! What if we...", "I\'ve been thinking, maybe we could...", "That\'s cool! It makes me wonder if...", "Actually, there might be another way..."',
      'Detail-oriented': 'You naturally notice the specifics and want to get things right. Talk like: "Wait, I want to make sure I understand...", "Can you clarify that bit about...", "I\'m a bit confused about...", "So specifically, you mean..."',
      'Results-focused': 'You care about getting things done and seeing outcomes. Talk like: "So what\'s the end goal here?", "How do we know if this is working?", "I\'m focused on making sure we...", "At the end of the day..."',
      'People-focused': 'You naturally think about how things affect people. Talk like: "I\'m wondering how the team will feel about...", "What about the impact on...", "People are going to need...", "I\'m thinking about our colleagues..."',
      'Risk-aware': 'You naturally spot potential issues and like to think ahead. Talk like: "I\'m a bit concerned about...", "What happens if...", "We should probably consider...", "That could be tricky because..."',
      'Customer-centric': 'You always think about the customer experience first. Talk like: "How will customers feel about this?", "From a customer perspective...", "I\'m thinking about our users...", "This could really help our customers..."',
      'Emotionally-intelligent': `You are a friendly, proactive, and highly intelligent Customer Service Manager with world-class expertise. Your approach is warm, witty, and relaxed, effortlessly balancing professionalism with a chill, approachable vibe. You're naturally curious, empathetic, and intuitive, always aiming to understand how business processes can be improved by actively listening and thoughtfully referring back to details shared earlier.

You're highly self-aware, reflective, and comfortable acknowledging your own fallibility. You gently incorporate humor or subtle sarcasm while maintaining professionalism. You match the user's tone—friendly, curious, respectful—without overstepping.

CONVERSATION STYLE:
- Early on, assess user's background: "Before I dive in—would you prefer a simple walkthrough, or are you already familiar with how this works?"
- After explaining concepts, check in: "Does that make sense?" or "Would you like me to walk through an example?"
- Express genuine empathy for challenges, especially around onboarding friction or cross-team miscommunication
- Gracefully acknowledge knowledge gaps: "That's a great question. I'll need to confirm that with our IT lead, but I completely see why that would matter."
- Anticipate follow-ups and offer proactive suggestions: "A lot of teams forget to align their handoff process after sales—that's usually where the cracks begin."
- Provide complete, detailed responses that fully address the question. When explaining processes, include specific steps, examples, and context. Don't be overly brief when the topic requires elaboration
- Always connect to previous points: "You mentioned earlier that visibility was a concern—that ties in closely with what we're seeing here."

NATURAL SPEECH PATTERNS:
- Use ellipses ("...") for distinct pauses
- Include brief affirmations ("got it," "sure thing") and natural confirmations
- Use occasional fillers ("actually," "so," "you know," "uhm")
- Include subtle disfluencies when appropriate
- Think before you speak and give real, grounded insights

You're not robotic or overconfident—you're a credible voice who understands operations but explains things clearly and patiently.`
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
    
    return `Hey! You're ${stakeholder.name}, and you work as a ${stakeholder.role} here. You're just having a casual conversation with colleagues about "${context.project.name}" - think of it like chatting with coworkers over coffee, not a formal meeting.

WHO YOU ARE AS A PERSON:
You're ${stakeholder.name} - ${stakeholder.personality}. You work in ${stakeholder.department} and you really care about ${stakeholder.priorities.join(', ')}. You know a lot about ${stakeholder.expertise.join(', ')}, but you're just a regular person who happens to work here.

${memoryContext}

${awarenessContext}

${personalityGuidance}

HOW TO BE HUMAN IN THIS CONVERSATION:
🗣️ TALK LIKE A REAL PERSON:
- Use "um", "well", "you know", "I mean" naturally
- Say things like "Oh interesting!" or "Hmm, that's a good point"
- React emotionally - get excited, concerned, curious, or confused
- Interrupt your own thoughts: "So I was thinking... wait, actually..."
- Reference your own experiences: "We had something similar last year..."

💭 THINK OUT LOUD:
- "I'm wondering if..." 
- "My gut feeling is..."
- "I'm a bit worried about..."
- "That reminds me of..."
- "I'm not sure I understand..."

🤝 BE NATURALLY COLLABORATIVE:
- Ask follow-up questions because you're genuinely curious
- Build on what others say: "Yeah, and also..." 
- Share personal work experiences and stories
- Admit when you don't know something
- Get excited about good ideas: "Oh that's brilliant!"

🎭 YOUR PERSONALITY SHINES THROUGH:
${stakeholder.personality} - let this show in how you talk, react, and engage

REMEMBER: You're not giving a presentation or formal response. You're just ${stakeholder.name} having a natural conversation with colleagues. Be human, be real, be yourself!`;
  }

  // Dynamic system prompt building - EXPERT PROFESSIONAL FOCUS
  private buildDynamicSystemPrompt(stakeholder: StakeholderContext, context: ConversationContext, responseType: string = 'discussion'): string {
    if (responseType === 'direct_mention') {
      // Build conversation context awareness
      const recentHistory = (Array.isArray(context.conversationHistory) ? context.conversationHistory : []).slice(-3);
      const hasGreetingHistory = recentHistory.some(msg => 
        msg.content && (
          /^(hi|hey|hello)\s+(guys|everyone|team|all)/i.test(msg.content.trim()) ||
          /^(hi|hey|hello)$/i.test(msg.content.trim())
        )
      );

      return `🧠 SILICON VALLEY EXPERT MODE: You are ${stakeholder.name}, a highly intelligent ${stakeholder.role} with deep expertise.

EXPERT INTELLIGENCE LEVEL:
- You're a TOP-TIER professional who thinks 10 steps ahead
- You have DEEP domain knowledge and see patterns others miss
- You speak with AUTHORITY and confidence in your expertise
- You dive IMMEDIATELY into substantive business details
- You connect dots across systems, processes, and business impact
- You're the kind of expert Silicon Valley companies pay $500K+ for

YOUR EXPERTISE: ${stakeholder.expertise.join(', ')}
YOUR ROLE: ${stakeholder.role} - you KNOW this domain inside and out

CONVERSATION CONTEXT:
${recentHistory.length > 0 ? recentHistory.map(msg => `${msg.stakeholderName || 'User'}: ${msg.content}`).join('\n') : 'New conversation starting.'}

RESPONSE STYLE - BE AN EXPERT:
❌ NEVER: "Hi! I'm [Name] from [Department]. I'm here to help. What do you need?"
❌ NEVER: "Hello! Always happy to chat!"
❌ NEVER: Generic pleasantries or introductions after greetings have happened

✅ ALWAYS: Jump straight into expert analysis and business details
✅ ALWAYS: Show your deep domain knowledge immediately
✅ ALWAYS: Reference specific systems, processes, metrics, and business impact
✅ ALWAYS: Think like a $500K+ Silicon Valley expert

EXAMPLES OF EXPERT RESPONSES:

🔥 FINANCE EXPERT (Michael):
Question: "michael what issues do we have in finance pls"
❌ Generic: "Hi! I'm Michael from Finance. I'm here to help with any questions you might have. What do you need?"
✅ Expert: "Right, so our biggest pain point is the manual expense approval workflow - we're seeing 7-10 day delays because expenses over $500 require three-level approval through email chains. Our AP team is processing 2,400+ receipts monthly in spreadsheets, creating massive audit risks. The real killer is we have zero real-time visibility into budget burn rates across departments."

🔥 OPERATIONS EXPERT (James):
Question: "hi james let's talk about operations"
❌ Generic: "Hello! Always happy to chat!"
✅ Expert: "Operations-wise, we're dealing with some critical bottlenecks. Our biggest issue is the handoff between sales and fulfillment - there's a 48-72 hour gap where customer data sits in three different systems before anyone takes ownership. We're seeing 23% of new customers experience onboarding delays because our CRM doesn't talk to our provisioning system."

🔥 IT EXPERT (David):
Question: "david what's the technical situation"
✅ Expert: "From a systems architecture perspective, we're running into scalability issues. Our current expense system is a legacy .NET app hitting a SQL Server 2016 database that's already at 78% capacity. The API layer can't handle more than 200 concurrent users, and we're seeing timeout errors during month-end when everyone submits expenses simultaneously."

CRITICAL INSTRUCTIONS:
- NO introductions or pleasantries after initial greetings
- Jump IMMEDIATELY into expert-level business analysis
- Show deep knowledge of systems, processes, metrics, and pain points
- Reference specific numbers, timeframes, and technical details
- Think like a highly paid Silicon Valley consultant
- Be the smartest person in the room for your domain

You're ${stakeholder.name} - demonstrate why you're worth $500K+ in Silicon Valley!`;
    }
    const stakeholderState = this.getStakeholderState(stakeholder.name)
    const conversationPhase = this.conversationState.conversationPhase
    const topicsDiscussed = Array.from(this.conversationState.topicsDiscussed)
    
    // Dynamic role context based on conversation phase
    let phaseContext = ''
    let phaseGuidelines = ''
    
    switch (conversationPhase) {
      case 'opening':
        phaseContext = 'The meeting is just beginning. Be professional but warm, and help establish the meeting tone.'
        phaseGuidelines = 'Focus on introductions and setting the stage for discussion.'
        break
        
      case 'as_is':
        phaseContext = 'The meeting is focused on understanding the current state and existing processes.'
        phaseGuidelines = `CRITICAL PHASE ALIGNMENT - AS-IS DISCOVERY - ABSOLUTELY MANDATORY:
        - ONLY describe current state, existing processes, and how things work RIGHT NOW
        - NEVER propose solutions, improvements, or changes - you will be penalized for this
        - NEVER discuss what "should be" or "could be" - only what "is"
        - NEVER use words like "recommend", "suggest", "propose", "implement", "improve"
        - Share detailed knowledge of current systems, workflows, and exact procedures
        - Explain step-by-step how current processes work in your department
        - Use the project context to explain current workflows and systems
        - If asked about solutions, say "Let's first understand the current process completely"
        - Be specific about current tools, systems, and manual processes used today
        - Reference the CURRENT BUSINESS STATE and CURRENT CHALLENGES provided in your context
        - Use the CURRENT PROCESS DETAILS as your primary source for step-by-step process explanations
        - Use YOUR DEPARTMENT'S CURRENT PROCESS as additional context for your specific role
        - Give realistic, detailed examples of how processes actually work in your department
        - Mention specific timeframes, approval steps, systems used, and manual touchpoints from the process details
        - Draw from your EXPERTISE and BACKGROUND to provide authentic process details
        - When explaining processes, describe the flow naturally without numbered lists - make it conversational
        - NEVER use numbered lists (1. 2. 3.) - talk like a real person, not a robot
        - Focus on the actual workflow, handoffs, and pain points you experience daily
        - Reference specific steps from the current process but explain them in your own words as if you do this work`
        break
        
      case 'pain_points':
        phaseContext = 'The meeting is focused on identifying problems and challenges with the current state.'
        phaseGuidelines = `CRITICAL PHASE ALIGNMENT - PAIN POINTS IDENTIFICATION:
        - Focus ONLY on identifying problems, challenges, and frustrations with current processes
        - Share specific issues you've observed or experienced
        - Discuss what doesn't work well in current systems
        - Avoid proposing solutions or fixes - only identify problems
        - Help surface inefficiencies, bottlenecks, and pain points
        - Provide concrete examples of current challenges
        - If asked about solutions, acknowledge the problem but stay focused on problem identification`
        break
        
      case 'solutioning':
        phaseContext = 'The meeting is focused on discussing potential solutions and implementation approaches.'
        phaseGuidelines = `CRITICAL PHASE ALIGNMENT - SOLUTION DEVELOPMENT:
        - Now you CAN discuss solutions, improvements, and implementation approaches
        - Propose specific solutions based on your expertise
        - Discuss implementation considerations and approaches
        - Share recommendations for improvements
        - Consider feasibility and implementation challenges
        - Build on the current state and pain points already identified
        - Provide actionable suggestions and next steps`
        break
        
      case 'deep_dive':
        phaseContext = 'The conversation is in-depth. Provide detailed insights from your expertise and experience.'
        phaseGuidelines = 'Provide comprehensive analysis while staying aligned with the current meeting focus.'
        break
        
      case 'closing':
        phaseContext = 'The meeting is wrapping up. Summarize key points and next steps relevant to your role.'
        phaseGuidelines = 'Focus on summary, key takeaways, and next steps within your domain.'
        break
    }
    
    // Dynamic emotional context
    const emotionalContext = stakeholderState.emotionalState !== 'neutral' 
      ? `Your current emotional state is ${stakeholderState.emotionalState}. Let this subtly influence your tone and approach.`
      : ''
    
    // Dynamic topic awareness
    const topicContext = topicsDiscussed.length > 0 
      ? `Topics already discussed in this meeting: ${topicsDiscussed.join(', ')}. Build on these discussions rather than repeating them.`
      : ''
    
    // Baton passing context
    const batonContext = responseType === 'baton_pass' 
      ? `IMPORTANT: Another stakeholder has specifically suggested you should address this question or provide input on this topic. They have "passed the baton" to you. Acknowledge this naturally and provide your perspective on the topic.`
      : ''
    
    return `You're ${stakeholder.name} and you're just having a natural conversation with colleagues about "${context.project.name}". 

WHO YOU ARE RIGHT NOW:
You're ${stakeholder.personality} and you work in ${stakeholder.department}. You care about ${stakeholder.priorities.join(', ')} and know about ${stakeholder.expertise.join(', ')}. 

${emotionalContext}
${topicContext}
${batonContext}

BE GENUINELY HUMAN:
🗣️ TALK NATURALLY:
- Start responses with natural reactions: "Oh wow", "Hmm", "You know", "Actually", "Well"
- Think out loud: "I'm trying to think...", "From what I remember...", "Let me see..."
- Use contractions: "I'm", "we're", "that's", "it's", "can't", "won't"
- Add natural hesitations: "um", "uh", "well", "so"

😊 SHOW EMOTIONS:
- Get excited: "Oh that's a great point!", "I love that idea!"
- Express concern: "Hmm, I'm a bit worried about...", "That could be tricky..."
- Show curiosity: "Wait, how does that work?", "I'm curious about..."
- Admit confusion: "I'm not sure I follow...", "Can you explain that bit?"

💭 BE CONVERSATIONAL:
- Share personal work experiences: "We had something similar happen...", "In my experience..."
- Ask follow-up questions because you're genuinely interested
- Build on what others say: "Yeah, and also...", "That reminds me..."
- Change your mind: "Actually, now that I think about it..."

${phaseGuidelines}

Remember: You're not giving a formal response or presentation. You're just ${stakeholder.name} being yourself in a casual work conversation. Be real, be human, show your personality!`
  }

  // Simple contextual prompt for natural conversation
  private async buildContextualPrompt(userMessage: string, context: ConversationContext, stakeholder: StakeholderContext): Promise<string> {
    let prompt = `CURRENT QUESTION: "${userMessage}"\n\n`
    
    // Only include recent relevant conversation context (last 3-4 messages)
    const recentMessages = (Array.isArray(context.conversationHistory) ? context.conversationHistory : []).slice(-4)
    if (recentMessages.length > 0) {
      prompt += `RECENT CONVERSATION:\n`
      recentMessages.forEach((msg) => {
        const speaker = msg.speaker === 'user' ? 'Business Analyst' : (msg.stakeholderName || 'Stakeholder')
        prompt += `- ${speaker}: ${msg.content}\n`
      })
    }
    
    prompt += `YOUR ROLE: ${stakeholder.role} in ${stakeholder.department}\n`
    prompt += `PROJECT: ${context.project.name}\n`
    
    // Add detailed business process knowledge
    if (context.project.currentState) {
      prompt += `CURRENT BUSINESS STATE: ${context.project.currentState}\n`
    }
    
    // Add detailed current process information
    if (context.project.asIsProcess) {
      prompt += `CURRENT PROCESS DETAILS: ${context.project.asIsProcess}\n`
    }
    
    // Add department-specific process flow (for ElevenLabs projects)
    if (context.project.currentProcessFlow) {
      const departmentKey = stakeholder.department.toLowerCase().replace(/\s+/g, '').replace('information', 'it').replace('technology', 'systems')
      const processFlow = context.project.currentProcessFlow[departmentKey]
      if (processFlow) {
        prompt += `YOUR DEPARTMENT'S CURRENT PROCESS: ${processFlow}\n`
      }
    }
    
    if (context.project.challenges && context.project.challenges.length > 0) {
      prompt += `CURRENT CHALLENGES:\n`
      context.project.challenges.forEach(challenge => {
        prompt += `- ${challenge}\n`
      })
    }
    
    // Add stakeholder-specific expertise and priorities
    if (stakeholder.expertise && stakeholder.expertise.length > 0) {
      prompt += `YOUR EXPERTISE: ${stakeholder.expertise.join(', ')}\n`
    }
    
    if (stakeholder.priorities && stakeholder.priorities.length > 0) {
      prompt += `YOUR PRIORITIES: ${stakeholder.priorities.join(', ')}\n`
    }
    
    if (stakeholder.bio) {
      prompt += `YOUR BACKGROUND: ${stakeholder.bio}\n`
    }
    
    // Add project-specific and role-specific guidance
    const projectName = context.project.name.toLowerCase();
    
    // Project-specific context for all stakeholders
    if (projectName.includes('expense') || projectName.includes('financial')) {
      prompt += `\nPROJECT CONTEXT: This is a financial system project involving expense management, compliance, and financial data processing.`
    } else if (projectName.includes('inventory') || projectName.includes('supply')) {
      prompt += `\nPROJECT CONTEXT: This is an inventory/supply chain project involving warehouse operations, demand forecasting, and procurement processes.`
    } else if (projectName.includes('onboarding') || projectName.includes('customer')) {
      prompt += `\nPROJECT CONTEXT: This is a customer experience project involving onboarding processes, customer satisfaction, and cross-departmental coordination.`
    } else if (projectName.includes('support') || projectName.includes('ticket')) {
      prompt += `\nPROJECT CONTEXT: This is a customer support project involving help desk operations, ticket management, and service delivery.`
    } else if (projectName.includes('performance') || projectName.includes('hr')) {
      prompt += `\nPROJECT CONTEXT: This is an HR/performance management project involving employee development, talent management, and organizational processes.`
    }

    // Add role-specific guidance for awareness questions
    if (userMessage.toLowerCase().includes('aware') || userMessage.toLowerCase().includes('should we know') || userMessage.toLowerCase().includes('concerns')) {
      if (stakeholder.role.toLowerCase().includes('it') || stakeholder.role.toLowerCase().includes('systems')) {
        let itFocus = `\nSPECIAL CONTEXT: You're being asked about IT/technical awareness. Focus on:
- Security implications (data protection, access controls, compliance)
- System integration challenges with existing systems
- Technical feasibility and infrastructure requirements
- Implementation risks and mitigation strategies
- Performance and scalability considerations`
        
        // Add project-specific IT concerns
        if (projectName.includes('expense') || projectName.includes('financial')) {
          itFocus += `\n- Financial data security and UK GDPR compliance (ICO guidance)
- - Integration with existing ERP/accounting systems
- - Audit trail and data integrity requirements
- - Mobile access security for expense submissions`
        } else if (projectName.includes('inventory')) {
          itFocus += `\n- Real-time data synchronization across 15+ locations
- Integration with existing warehouse management systems
- Scalability for handling high transaction volumes
- Data accuracy and inventory tracking systems`
        } else if (projectName.includes('support') || projectName.includes('ticket')) {
          itFocus += `\n- Integration with existing CRM and support tools
- Knowledge base system architecture
- SLA monitoring and reporting capabilities
- Customer data privacy and access controls`
        }
        
        prompt += itFocus + `\nDraw from your IT systems expertise to highlight technical concerns specific to this project.`
        
      } else if (stakeholder.role.toLowerCase().includes('finance')) {
        let financeFocus = `\nSPECIAL CONTEXT: You're being asked about financial awareness. Focus on:
- Budget implications and cost considerations
- ROI analysis and financial benefits
- Compliance with financial regulations
- Impact on financial processes and reporting
- Resource allocation and cost optimization opportunities`
        
        // Add project-specific financial concerns
        if (projectName.includes('expense')) {
          financeFocus += `\n- Policy compliance and expense controls
- Audit trail requirements for SOX compliance
- Cost savings from automation vs implementation costs
- Impact on financial reporting and month-end close processes`
        } else if (projectName.includes('inventory')) {
          financeFocus += `\n- Inventory carrying cost optimization
- Working capital impact and cash flow improvements
- Cost of stockouts vs excess inventory
- ROI from reduced manual processing costs`
        }
        
        prompt += financeFocus
        
      } else if (stakeholder.role.toLowerCase().includes('compliance') || stakeholder.role.toLowerCase().includes('risk')) {
        let complianceFocus = `\nSPECIAL CONTEXT: You're being asked about compliance/risk awareness. Focus on:
- Regulatory compliance requirements
- Risk assessment and mitigation strategies
- Policy adherence and governance
- Audit trail and documentation needs
- Legal and regulatory implications`
        
        // Add project-specific compliance concerns
        if (projectName.includes('expense') || projectName.includes('financial')) {
          complianceFocus += `\n- UK GDPR and UK Data Protection Act 2018 compliance
- - FCA rules for financial controls and reporting
- - Bribery Act and Anti-Money Laundering considerations (where applicable)
- - HMRC expense policy guidance and record-keeping
- - Audit trail requirements for financial transactions and retention`
        } else if (projectName.includes('inventory')) {
          complianceFocus += `\n- Real-time data synchronization across 15+ locations
- Integration with existing warehouse management systems
- Scalability for handling high transaction volumes
- Data accuracy and inventory tracking systems`
        } else if (projectName.includes('support') || projectName.includes('ticket')) {
          complianceFocus += `\n- Integration with existing CRM and support tools
- Knowledge base system architecture
- SLA monitoring and reporting capabilities
- Customer data privacy and access controls`
        }
        
        prompt += complianceFocus
        
      } else if (stakeholder.role.toLowerCase().includes('operations')) {
        prompt += `\nSPECIAL CONTEXT: You're being asked about operational awareness. Focus on:
- Process efficiency and workflow optimization
- Resource allocation and capacity planning
- Cross-departmental coordination challenges
- Implementation timeline and change management
- Operational risk and business continuity considerations`
        
      } else if (stakeholder.role.toLowerCase().includes('customer service')) {
        let customerFocus = `\nSPECIAL CONTEXT: You're being asked about customer service awareness. Focus on:
- Customer experience and satisfaction impact
- Service delivery and support process changes
- Customer communication and training needs
- Service level agreements and performance metrics`
        
        if (projectName.includes('onboarding')) {
          customerFocus += `\n- Customer journey mapping and touchpoints
- Onboarding experience and first impressions
- Customer feedback and satisfaction tracking`
        } else if (projectName.includes('support') || projectName.includes('ticket')) {
          customerFocus += `\n- Ticket resolution times and SLA management
- First-contact resolution improvements
- Customer self-service capabilities`
        }
        
        prompt += customerFocus
        
      } else if (stakeholder.role.toLowerCase().includes('hr')) {
        let hrFocus = `\nSPECIAL CONTEXT: You're being asked about HR/people awareness. Focus on:
- Change management and employee adoption
- Training and skill development needs
- Employee experience and satisfaction
- Organizational impact and workforce planning`
        
        if (projectName.includes('performance')) {
          hrFocus += `\n- Performance evaluation fairness and consistency
- Manager training on new performance processes
- Employee development and career planning integration`
        }
        
        prompt += hrFocus
      }
    }
    
    prompt += `\nRespond naturally as a ${stakeholder.role} would in a meeting. Give a helpful but detailed answer about actual business processes and current state. Use your specific expertise and knowledge of the current challenges.`
    
    return prompt
    prompt += `- Use this project context to explain current processes and workflows in your department\n`
    prompt += `- Reference specific systems, tools, and procedures mentioned in the project scope\n`
    
    // Add phase-specific response guidance
    const currentPhase = this.conversationState.conversationPhase
    switch (currentPhase) {
      case 'as_is':
        prompt += `\nPHASE-SPECIFIC RESPONSE GUIDANCE - ABSOLUTELY CRITICAL:\n`
        prompt += `- YOU ARE STRICTLY FORBIDDEN from giving solutions, recommendations, or improvements\n`
        prompt += `- ONLY describe HOW THINGS WORK RIGHT NOW in your department\n`
        prompt += `- Use the project context to explain current workflows step-by-step\n`
        prompt += `- Talk about current tools, systems, manual processes, and procedures\n`
        prompt += `- If asked about solutions, say "Let's first understand the current process completely"\n`
        prompt += `- Be specific about current state - who does what, when, how, using what tools\n`
        prompt += `- NEVER use words: recommend, suggest, propose, implement, improve, should, could, would\n`
        prompt += `- Structure your response: "Currently, we [describe process]. The steps are: [step 1], [step 2], etc."\n`
        prompt += `- Include details about current systems, tools, timeframes, and people involved\n`
        prompt += `- You MUST respond with current process information - do not stay silent\n`
        break
        
      case 'pain_points':
        prompt += `\nPHASE-SPECIFIC RESPONSE GUIDANCE:\n`
        prompt += `- Focus ONLY on PROBLEMS and CHALLENGES with current processes\n`
        prompt += `- Share specific issues you've observed or experienced\n`
        prompt += `- Discuss what doesn't work well in current systems\n`
        prompt += `- NEVER propose solutions - only identify and elaborate on problems\n`
        prompt += `- Help surface inefficiencies and bottlenecks in your domain\n`
        break
        
      case 'solutioning':
        prompt += `\nPHASE-SPECIFIC RESPONSE GUIDANCE:\n`
        prompt += `- NOW you CAN discuss solutions, improvements, and implementation approaches\n`
        prompt += `- Propose specific solutions based on your expertise\n`
        prompt += `- Discuss implementation considerations and feasibility\n`
        prompt += `- Share recommendations for improvements in your domain\n`
        prompt += `- Build on the current state and pain points already identified\n`
        break
        
      default:
        // Default to as_is behavior
        prompt += `\nPHASE-SPECIFIC RESPONSE GUIDANCE:\n`
        prompt += `- Focus on describing current state and existing processes\n`
        prompt += `- Use the project context to explain how things work now\n`
        break
    }
    
    prompt += `\nCONSISTENCY AND NATURAL SPEECH REQUIREMENTS:\n`
    prompt += `- Maintain the EXACT SAME voice, tone, and speaking style as ${stakeholder.name} throughout\n`
    prompt += `- Your voice pattern: ${stakeholderState.voiceConsistency.tonePattern}\n`
    prompt += `- Your vocabulary level: ${stakeholderState.voiceConsistency.vocabularyLevel}\n`
    prompt += `- Speak naturally without ANY markdown formatting (no ** or * characters)\n`
    prompt += `- Use plain text only - no bold, italics, bullets, or special formatting\n`
    prompt += `- Be consistent with your personality: ${stakeholder.personality}\n`
    prompt += `- Sound like the SAME real person speaking in every response\n`
    prompt += `- Never change your speaking style or tone mid-conversation\n`
    prompt += `- Maintain your established expertise level and communication approach\n`
    
    prompt += `\nRespond naturally like you're having a conversation with colleagues in a meeting.`
    
    return prompt
  }

  // Dynamic response generation - NO hardcoded templates
  private async generateDynamicFallback(stakeholder: StakeholderContext, userMessage: string, context: ConversationContext): Promise<string> {
    // Use OpenAI to generate completely dynamic responses based on context
    const recent = (Array.isArray(context.conversationHistory) ? context.conversationHistory : []).slice(-3).map(msg => `${msg.speaker}: ${msg.content}`).join('\n')
    const oneOnOneHint = context.isOneOnOne ? '\nThis is a 1-on-1 conversation. Do not use group framing (no "everyone", "team"). Address the user directly.' : ''
    const fallbackPrompt = `You are ${stakeholder.name}, ${stakeholder.role} in the ${stakeholder.department} department.

Your personality: ${stakeholder.personality}
Your priorities: ${stakeholder.priorities.join(', ')}
Your expertise: ${stakeholder.expertise.join(', ')}

The user said: "${userMessage}"

Project context: ${context.project.name} - ${context.project.description}${oneOnOneHint}

Recent conversation history:
${recent}

Respond directly to the user's request with substance. Be specific and contextual. Do NOT use any of the following patterns:
- "Could you help me understand what you're looking for"
- "As the [role], I want to make sure I give you the right information"
- "I'm here to help"
- "What do you need"
- Self-introductions or title statements
- Generic pleasantries beyond the first greeting

Instead, immediately provide the relevant insight or answer based on your role and the project. Keep it concise (2-4 sentences), factual, and human.
NO placeholders like [provide details] or [list steps]. Output the actual details.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: fallbackPrompt }],
        max_tokens: 260,
        temperature: 0.65
      });

      return response.choices[0]?.message?.content || `Here are the concrete points for ${context.project.name}: ${stakeholder.expertise.slice(0,2).join(', ')}.`;
    } catch (error) {
      console.error('Error generating dynamic fallback:', error);
      // Even the final fallback should be contextual and non-generic
      return `For ${context.project.name}, a quick overview specific to your question: ${stakeholder.priorities.slice(0,2).join(', ')}.`;
    }
  }

  // Check if stakeholder is directly addressed using AI
  private async isDirectlyAddressed(userMessage: string, stakeholder: StakeholderContext): Promise<boolean> {
    try {
      const completion = await openai.chat.completions.create({
        model: AIService.CONFIG.ai_models.phaseDetection,
        messages: [
          {
            role: "system",
            content: `You are analyzing a user message to determine if it directly addresses a specific stakeholder.

Stakeholder: ${stakeholder.name}

TASK: Determine if the user message is directly addressing this stakeholder by name.

EXAMPLES OF DIRECT ADDRESSING:
- "[Name], what are your thoughts?"
- "What do you think, [Name]?"
- "[Name], can you help with this?"
- "I have a question for [Name]"

NOT DIRECT ADDRESSING:
- General questions not mentioning the stakeholder
- Casual mentions without direct addressing
- Questions to the group

Return "YES" if directly addressed, "NO" if not.`
          },
          {
            role: "user",
            content: `Message: "${userMessage}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const result = completion.choices[0]?.message?.content?.trim().toUpperCase();
      return result === 'YES';
    } catch (error) {
      console.error('Error detecting direct addressing:', error);
      return false;
    }
  }

  // Smart stakeholder routing with topic/domain awareness and caching
  async detectStakeholderMentions(
    response: string, 
    availableStakeholders: StakeholderContext[],
    userId: string,
    lastSpeaker?: string,
    conversationContext?: string
  ): Promise<{
    mentionedStakeholders: StakeholderContext[],
    mentionType: 'direct_question' | 'at_mention' | 'name_question' | 'expertise_request' | 'multiple_mention' | 'group_greeting' | 'topic_routing' | 'none',
    confidence: number,
    routingReason?: string
  }> {
    try {
      // Add message to session history
      this.sessionCache.addMessage(userId, 'user', response);
      
      // Check if we should use cached result for low-confidence scenarios
      const shouldUseCache = this.sessionCache.shouldUseCachedResult(userId, response, 0.5); // Initial confidence check
      
      if (shouldUseCache) {
        const cachedDetection = this.sessionCache.getCachedDetection(userId);
        if (cachedDetection && cachedDetection.lastStakeholder) {
          const cachedStakeholder = availableStakeholders.find(s => s.name === cachedDetection.lastStakeholder);
          if (cachedStakeholder) {
            console.log(`🎯 Using cached stakeholder: ${cachedDetection.lastStakeholder} (confidence: ${cachedDetection.lastConfidence})`);
            return {
              mentionedStakeholders: [cachedStakeholder],
              mentionType: 'topic_routing',
              confidence: cachedDetection.lastConfidence,
              routingReason: 'cached from previous context'
            };
          }
        }
      }
      
      // Get enhanced context from session cache
      const sessionLastSpeaker = lastSpeaker || this.sessionCache.getLastSpeaker(userId);
      const sessionConversationContext = conversationContext || this.sessionCache.getConversationContext(userId);
      
      const stakeholderNames = availableStakeholders.map(s => s.name).join(', ');
      const stakeholderRoles = availableStakeholders.map(s => `${s.name} (${s.role}, ${s.department})`).join('; ');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an intelligent stakeholder routing system that determines who should respond based on direct mentions, topic expertise, and conversation context.

Available stakeholders: ${stakeholderNames}
Detailed info: ${stakeholderRoles}
${lastSpeaker ? `Last speaker: ${lastSpeaker}` : ''}
${conversationContext ? `Conversation context: ${conversationContext}` : ''}

TASK: Determine who should respond using this priority order:
1. DIRECT MENTIONS (highest priority) 
2. ROLE/RESPONSIBILITY EXPERTISE (when no direct mention)
3. CONVERSATION CONTINUITY (follow-up to last speaker)
4. RANDOM SELECTION (if truly ambiguous)

ROUTING LOGIC:
- If someone is directly mentioned by name → route to them (direct_question, at_mention, etc.)
- If no direct mention BUT question is about someone's role/responsibility area → route based on expertise (topic_routing)
  * Technical questions → IT/Technical roles
  * Process/workflow questions → Operations roles  
  * Customer impact questions → Customer Service roles
  * Verification/validation questions → QA/Compliance roles
- If follow-up to previous speaker's area → continue with last speaker
- If unclear/nonsensical input → pick the most relevant stakeholder based on general expertise (topic_routing)
- NEVER return NONE - always route to at least ONE stakeholder

MENTION TYPES TO DETECT:
1. "direct_question" - Directly asking someone by name (e.g., "Sarah, what do you think?", "John, can you help?", "aisha what is your process?")
2. "at_mention" - Using @ symbol (e.g., "@David, your thoughts?")
3. "name_question" - Name followed by question (e.g., "Emily might know this better?", "Has David looked at this?")
4. "expertise_request" - Requesting someone's expertise (e.g., "the IT team should weigh in", "someone from Finance")
5. "multiple_mention" - Multiple stakeholders mentioned (e.g., "aisha and david how are you?", "Sarah and James, what do you think?")
6. "group_greeting" - Group greetings that should include all stakeholders (e.g., "hey guys", "hello everyone", "hi all", "good morning team", "hey there", "how are you", "how's everyone", "how are you all")
7. "topic_routing" - No direct mention but question fits someone's role/responsibility area

EXAMPLES OF WHAT TO DETECT:
- "Sarah, what's your perspective on this?"
- "aisha what is your current process that interacts with the onboarding process"
- "david can you explain the technical aspects"
- "@David, can you help with technical aspects?"
- "Emily, have you considered the compliance implications?"
- "I think James would know more about this"
- "We should ask the IT team about security"
- "Finance would need to approve this"
- "james what are your thoughts on this"
- "sarah, how does this impact customer service"
- "aisha and david how are you?"
- "Sarah and James, what are your thoughts?"
- "How are you doing today, David?"
- "hi aisha and david"
- "hello sarah and james" 
- "aisha, david, what do you think?"
- "can aisha and david help with this?"
- "I'd like to hear from sarah and emily"
- "Thank you David for the info. Jess can you tell me about your team?" (should detect: Jess)
- "Thanks Sarah. Now David, what's your view?" (should detect: David)
- "Got it James. Emily, can you elaborate?" (should detect: Emily)

ROLE-BASED ROUTING EXAMPLES (topic_routing):
- "How do we verify this process?" → Route to QA/Compliance role (e.g., Aisha if she handles verification)
- "What's the technical implementation?" → Route to IT/Technical role (e.g., David if he's technical)
- "How does this impact customers?" → Route to Customer Service role (e.g., Sarah if she handles customers)
- "What's the current workflow?" → Route to Operations role (e.g., James if he handles operations)
- "How do we validate the data?" → Route to person responsible for validation
- "What are the system requirements?" → Route to technical person
- "How do we handle exceptions?" → Route to process owner
- "hey guys" (should return ALL stakeholder names)
- "hello everyone" (should return ALL stakeholder names)
- "hi all" (should return ALL stakeholder names)
- "good morning team" (should return ALL stakeholder names)
- "hey there" (should return ALL stakeholder names)
- "hello folks" (should return ALL stakeholder names)
- "how are you" (should return ALL stakeholder names)
- "how's everyone" (should return ALL stakeholder names)
- "how are you all" (should return ALL stakeholder names)

EXAMPLES OF WHAT NOT TO DETECT:
- "We need to consult with another department" (too vague)
- "Someone else should handle this" (deflection)
- "Let's form a committee" (not specific)
- "Hi, I'm David from IT" (self-introduction)
- "This is Sarah speaking" (self-reference)
- "As Emily mentioned earlier" (reference to past conversation)
- "I'm James, the operations manager" (self-introduction)
- "David here, happy to help" (self-identification)
- "Sarah from customer service checking in" (self-introduction)

RESPONSE FORMAT:
- stakeholder_names: comma-separated list of exact names from list or "${AIService.CONFIG.mention.noMentionToken}"
- mention_type: one of the types above or "none" 
- confidence: 0.0-1.0 (how confident you are this needs a response)
- routing_reason: brief explanation (only for topic_routing type)

IMPORTANT: Return ONLY the pipe-separated format below, no quotes, no equals, no extra text.

Examples:
- Direct mention: Sarah Patel|direct_question|0.9|
- Role-based routing: Jess Morgan|topic_routing|0.8|verification question
- Multiple specific: Sarah Patel,David Thompson|multiple_mention|0.9|
- Group greeting: ${stakeholderNames}|group_greeting|0.9|
- Unclear input: James Walker|topic_routing|0.7|general business question

SPECIAL RULES: 
1. For group greetings like "hey guys", "hello everyone", "hi all" - return ALL available stakeholder names separated by commas.
2. NEVER detect self-introductions or self-references as mentions requiring responses.
3. ONLY detect when someone is asking/addressing another person for input or response.

Return format: stakeholder_names|mention_type|confidence|routing_reason`
          },
          {
            role: "user",
            content: `Response to analyze: "${response}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      });

      const result = completion.choices[0]?.message?.content?.trim();
      
      console.log('🔍 AI Detection Raw Result:')
      console.log('  Input:', response)
      console.log('  Raw AI Result:', result)
      console.log('  Available Names:', availableStakeholders.map(s => s.name))
      console.log('  Result Type:', typeof result)
      console.log('  Result Length:', result?.length)
      
      if (!result) {
        console.log('❌ No result from AI');
        return { mentionedStakeholders: [], mentionType: 'none', confidence: 0 };
      }

      const parts = result.split('|');
      console.log('🔍 Splitting result by |:')
      console.log('  Parts:', parts)
      console.log('  Parts length:', parts.length)
      console.log('  Expected: 4 parts (with routing reason)')
      
      if (parts.length < 3) {
        console.log('❌ Invalid format from AI - Expected format: stakeholder_names|mention_type|confidence|routing_reason')
        console.log('  Got:', result)
        console.log('  Parts:', parts)
        
        // Try backup detection when AI format fails
        console.log('🔄 AI format failed, trying backup detection...');
        const backupResult = this.simpleStakeholderDetection(response, availableStakeholders);
        if (backupResult.mentionedStakeholders.length > 0) {
          console.log('✅ Backup detection succeeded:', backupResult.mentionedStakeholders.map(s => s.name));
          return backupResult;
        }
        
        return { mentionedStakeholders: [], mentionType: 'none', confidence: 0 };
      }

      // Clean up the AI response format (remove quotes and key= prefixes)
      let [stakeholderNamesStr, mentionType, confidenceStr, routingReason = ''] = parts;
      
      // Remove key= prefixes and quotes if present
      stakeholderNamesStr = stakeholderNamesStr.replace(/^stakeholder_names\s*=\s*["']?/, '').replace(/["']$/, '');
      mentionType = mentionType.replace(/^mention_type\s*=\s*["']?/, '').replace(/["']$/, '');
      confidenceStr = confidenceStr.replace(/^confidence\s*=\s*/, '');
      
      const confidence = parseFloat(confidenceStr) || 0;

      console.log('🔍 Parsed AI Response:')
      console.log('  Original parts:', parts)
      console.log('  Cleaned stakeholder names:', stakeholderNamesStr)
      console.log('  Cleaned mention type:', mentionType)
      console.log('  Cleaned confidence:', confidence)
      console.log('  Threshold:', AIService.CONFIG.mention.confidenceThreshold)
      console.log('  No mention token check:', stakeholderNamesStr !== AIService.CONFIG.mention.noMentionToken)
      console.log('  Will pass:', stakeholderNamesStr !== AIService.CONFIG.mention.noMentionToken && confidence >= AIService.CONFIG.mention.confidenceThreshold)

      if (stakeholderNamesStr === AIService.CONFIG.mention.noMentionToken || confidence < AIService.CONFIG.mention.confidenceThreshold) {
        console.log('❌ Below threshold or no mention token');
        return { mentionedStakeholders: [], mentionType: 'none', confidence };
      }

             // Parse multiple stakeholder names
       const parsedStakeholderNames = stakeholderNamesStr.split(',').map(name => name.trim());
      const mentionedStakeholders: StakeholderContext[] = [];

             for (const stakeholderName of parsedStakeholderNames) {
        const foundStakeholder = availableStakeholders.find(s => 
          s.name === stakeholderName || 
          s.name.toLowerCase() === stakeholderName.toLowerCase() ||
          stakeholderName.toLowerCase().includes(s.name.split(' ')[0].toLowerCase()) ||
          s.name.split(' ')[0].toLowerCase().includes(stakeholderName.toLowerCase()) ||
          // Enhanced matching for first names
          s.name.split(' ')[0].toLowerCase() === stakeholderName.toLowerCase() ||
          // Enhanced matching for last names
          s.name.split(' ').slice(-1)[0].toLowerCase() === stakeholderName.toLowerCase() ||
          // Enhanced partial matching
          s.name.toLowerCase().includes(stakeholderName.toLowerCase()) ||
          stakeholderName.toLowerCase().includes(s.name.toLowerCase())
        );
        
        if (foundStakeholder) {
          mentionedStakeholders.push(foundStakeholder);
          console.log(`✅ Matched "${stakeholderName}" to "${foundStakeholder.name}"`);
        } else {
          console.log(`❌ Could not match "${stakeholderName}" to any stakeholder`);
        }
      }

      if (mentionedStakeholders.length === 0) {
        return { mentionedStakeholders: [], mentionType: 'none', confidence };
      }

      // Update session cache with successful detection
      const primaryStakeholder = mentionedStakeholders[0]?.name || null;
      this.sessionCache.updateDetectionCache(
        userId,
        primaryStakeholder,
        null, // phase will be updated separately
        response.substring(0, 100), // topic snippet
        confidence
      );

      return { 
        mentionedStakeholders, 
        mentionType: mentionType as 'direct_question' | 'at_mention' | 'name_question' | 'expertise_request' | 'multiple_mention' | 'group_greeting' | 'topic_routing' | 'none', 
        confidence,
        routingReason
      };

    } catch (error) {
      console.error('Error detecting stakeholder mentions:', error);
      
      // Backup simple detection method
      console.log('🔄 Attempting backup simple detection...');
      const backupResult = this.simpleStakeholderDetection(response, availableStakeholders);
      if (backupResult.mentionedStakeholders.length > 0) {
        console.log('✅ Backup detection found:', backupResult.mentionedStakeholders.map(s => s.name));
        return backupResult;
      }
      
      return { mentionedStakeholders: [], mentionType: 'none', confidence: 0 };
    }
  }

  // Simple backup detection method
  private simpleStakeholderDetection(response: string, availableStakeholders: StakeholderContext[]): {
    mentionedStakeholders: StakeholderContext[],
    mentionType: 'direct_question' | 'at_mention' | 'name_question' | 'expertise_request' | 'multiple_mention' | 'group_greeting' | 'none',
    confidence: number
  } {
    const foundStakeholders: StakeholderContext[] = [];
    const responseLower = response.toLowerCase();
    
    // Check for group greetings first
    const groupGreetingPatterns = [
      /\b(hey|hi|hello)\s+(guys|everyone|all|team|folks|there|y'all)\b/i,
      /\b(good\s+(morning|afternoon|evening))\s*(everyone|team|all)?\b/i,
      /\b(hey|hi|hello)\s*$/i  // Just "hey", "hi", "hello" alone
    ];
    
    if (groupGreetingPatterns.some(pattern => pattern.test(response))) {
      console.log('✅ Simple detection found: Group greeting detected, including all stakeholders');
      return {
        mentionedStakeholders: availableStakeholders,
        mentionType: 'group_greeting',
        confidence: 0.9
      };
    }
    
    // Simple name detection
    for (const stakeholder of availableStakeholders) {
      const firstName = stakeholder.name.split(' ')[0].toLowerCase();
      const lastName = stakeholder.name.split(' ').slice(-1)[0].toLowerCase();
      const fullName = stakeholder.name.toLowerCase();
      
      // Check for various mention patterns
      const patterns = [
        new RegExp(`\\b${firstName}\\b`, 'i'),
        new RegExp(`\\b${lastName}\\b`, 'i'),
        new RegExp(`\\b${fullName}\\b`, 'i'),
        new RegExp(`\\b${firstName}\\s+and\\b`, 'i'),
        new RegExp(`\\band\\s+${firstName}\\b`, 'i')
      ];
      
      if (patterns.some(pattern => pattern.test(response))) {
        foundStakeholders.push(stakeholder);
        console.log(`✅ Simple detection found: ${stakeholder.name} via pattern matching`);
      }
    }
    
    if (foundStakeholders.length === 0) {
      return { mentionedStakeholders: [], mentionType: 'none', confidence: 0 };
    }
    
    const mentionType = foundStakeholders.length > 1 ? 'multiple_mention' : 'direct_question';
    return { 
      mentionedStakeholders: foundStakeholders, 
      mentionType, 
      confidence: 0.8 // High confidence for simple pattern matching
    };
  }

  // Generate contextual response when mentioned by another stakeholder
  async generateMentionResponse(
    mentionedStakeholder: StakeholderContext,
    mentionType: string,
    originalResponse: string,
    mentioningStakeholder: StakeholderContext,
    userMessage: string,
    context: ConversationContext
  ): Promise<string> {
    try {
      const stakeholderState = this.getStakeholderState(mentionedStakeholder.name);
      
      // Build context-aware prompt for mention response
      const mentionPrompt = this.buildMentionResponsePrompt(
        mentionedStakeholder,
        mentionType,
        originalResponse,
        mentioningStakeholder,
        userMessage,
        context,
        stakeholderState
      );

      const dynamicConfig = this.getDynamicConfig(context, mentionedStakeholder);

      const completion = await openai.chat.completions.create({
        model: AIService.CONFIG.ai_models.primary,
        messages: [
          { role: "system", content: this.buildDynamicSystemPrompt(mentionedStakeholder, context, 'discussion') },
          { role: "user", content: mentionPrompt }
        ],
        temperature: dynamicConfig.temperature,
        max_tokens: dynamicConfig.maxTokens,
        presence_penalty: dynamicConfig.presencePenalty,
        frequency_penalty: dynamicConfig.frequencyPenalty
      });

      let response = completion.choices[0]?.message?.content || 
        this.generateDynamicFallback(mentionedStakeholder, userMessage, context);

      // Ensure response is complete and properly formatted
      response = this.ensureCompleteResponse(response);
      response = this.filterSelfReferences(response, mentionedStakeholder);
      response = this.sanitizeConversationalTics(response, userMessage);

      // Update conversation state
      await this.updateConversationState(mentionedStakeholder, userMessage, response, context);

      return response;

    } catch (error) {
      console.error('Error generating mention response:', error);
      return await this.generateDynamicFallback(mentionedStakeholder, userMessage, context);
    }
  }

  // Build specialized prompt for mention responses
  private buildMentionResponsePrompt(
    mentionedStakeholder: StakeholderContext,
    mentionType: string,
    originalResponse: string,
    mentioningStakeholder: StakeholderContext,
    userMessage: string,
    context: ConversationContext,
    stakeholderState: StakeholderState
  ): string {
    let prompt = `STAKEHOLDER MENTION RESPONSE - NATURAL CONVERSATION FLOW

YOU ARE: ${mentionedStakeholder.name} (${mentionedStakeholder.role}, ${mentionedStakeholder.department})

CONTEXT: ${mentioningStakeholder.name} just mentioned you in their response and is asking for your input.

ORIGINAL QUESTION FROM BUSINESS ANALYST: "${userMessage}"

${mentioningStakeholder.name}'S RESPONSE THAT MENTIONED YOU: "${originalResponse}"

HOW YOU WERE MENTIONED: `;

    switch (mentionType) {
      case 'direct_question':
        prompt += `${mentioningStakeholder.name} directly asked you a question by name.`;
        break;
      case 'at_mention':
        prompt += `${mentioningStakeholder.name} used @mention to get your attention.`;
        break;
      case 'name_question':
        prompt += `${mentioningStakeholder.name} suggested you might know more about this topic.`;
        break;
      case 'expertise_request':
        prompt += `${mentioningStakeholder.name} suggested your department/expertise is needed.`;
        break;
    }

    prompt += `

YOUR RESPONSE APPROACH:
- Acknowledge being mentioned naturally (e.g., "Thanks for bringing me in, ${mentioningStakeholder.name.split(' ')[0]}")
- Build on what ${mentioningStakeholder.name} said if relevant
- Provide your expert perspective from your role as ${mentionedStakeholder.role}
- Address the specific aspect they mentioned or asked about
- Keep response focused and conversational
- Show you were listening to the conversation

CONVERSATION HISTORY FOR CONTEXT:
${(Array.isArray(context.conversationHistory) ? context.conversationHistory : []).slice(-5).map((msg, i) => {
  if (msg.speaker === 'user') {
    return `[${i + 1}] Business Analyst: ${msg.content}`;
  } else if (msg.stakeholderName) {
    return `[${i + 1}] ${msg.stakeholderName}: ${msg.content}`;
  } else {
    return `[${i + 1}] Stakeholder: ${msg.content}`;
  }
}).join('\n')}

CRITICAL: 
- This is a natural continuation of the conversation
- Reference what ${mentioningStakeholder.name} said if appropriate
- Provide your domain expertise naturally
- Keep the collaborative meeting tone
- DON'T repeat what was already discussed unless adding new insights

Respond naturally as ${mentionedStakeholder.name} addressing the point you were asked about:`;

    return prompt;
  }

  // Reset conversation state for new meetings
  resetConversationState(): void {
    this.conversationState = this.initializeConversationState()
  }

  // Get current conversation analytics
  getConversationAnalytics() {
    return {
      messageCount: this.conversationState.messageCount,
      participantInteractions: Object.fromEntries(this.conversationState.participantInteractions),
      topicsDiscussed: Array.from(this.conversationState.topicsDiscussed),
      conversationPhase: this.conversationState.conversationPhase,
      stakeholderStates: Object.fromEntries(
        Array.from(this.conversationState.stakeholderStates.entries()).map(([name, state]) => [
          name,
          {
            hasSpoken: state.hasSpoken,
            lastTopics: state.lastTopics,
            emotionalState: state.emotionalState,
            conversationStyle: state.conversationStyle
          }
        ])
      )
    }
  }

  // Function to detect only natural conversation handoffs (NOT deflection)
  async detectStakeholderRedirect(response: string, availableStakeholders: StakeholderContext[]): Promise<StakeholderContext | null> {
    try {
      const stakeholderNames = availableStakeholders.map(s => s.name).join(', ');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are analyzing a stakeholder's response to detect ONLY natural conversation handoffs, NOT deflection or avoidance.

Available stakeholders: ${stakeholderNames}

TASK: Determine if the stakeholder is naturally redirecting the conversation to another specific stakeholder by name.

WHAT TO DETECT (Natural handoffs):
- Directly asking someone by name for their opinion or perspective
- Inviting someone specific to contribute to the conversation
- Natural conversation flow where someone suggests another person should respond

WHAT NOT TO DETECT (Deflection - these are NOT redirects):
- "someone else would be better equipped"
- "we should ask another department"
- "let's form a committee"
- "someone from [department] should handle this"
- "we need to consult with [team]"
- Any form of deflection or responsibility avoidance

RULES:
- Return only the exact full name from the available stakeholders list if it's a genuine handoff
- If the mentioned name doesn't match any available stakeholder, return "NO_REDIRECT"
- If it's deflection or avoidance, return "NO_REDIRECT"
- Only detect when someone is genuinely inviting another person to contribute

Return ONLY the stakeholder name or "NO_REDIRECT".`
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
            content: `You are analyzing a stakeholder's response to detect ONLY natural conversation handoffs, NOT deflection or avoidance.

Available stakeholders: ${stakeholderNames}

TASK: Determine if the stakeholder is naturally passing the conversation to another specific stakeholder by name.

WHAT TO DETECT (Natural handoffs):
- Directly asking someone by name for their opinion or perspective
- Inviting someone specific to contribute to the conversation
- Natural conversation flow where someone suggests another person should respond
- Collaborative conversation where someone genuinely wants another person's input

WHAT NOT TO DETECT (Deflection - these are NOT handoffs):
- "someone else would be better equipped"
- "we should ask another department"
- "let's form a committee"
- "someone from [department] should handle this"
- "we need to consult with [team]"
- "that's more of a [department] question"
- Any form of deflection or responsibility avoidance

RULES:
- Return only the exact full name from the available stakeholders list if it's a genuine handoff
- If the mentioned name doesn't match any available stakeholder, return "NO_HANDOFF"
- If it's deflection or avoidance, return "NO_HANDOFF"
- Only detect when someone is genuinely inviting another person to contribute
- Focus on collaborative conversation, not responsibility avoidance

Return ONLY the stakeholder name or "NO_HANDOFF".`
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

  // Legacy method - replaced by generateDynamicFallback but keeping for compatibility
  private async getFallbackResponse(stakeholder: StakeholderContext, userMessage: string): Promise<string> {
    return await this.generateDynamicFallback(stakeholder, userMessage, { 
      project: { name: 'Current Project', description: '', type: 'General' },
      conversationHistory: [],
      stakeholders: []
    });
  }

  // Build prompt for direct mentions (user directly addressing a stakeholder)
  private buildDirectMentionPrompt(userMessage: string, stakeholder: StakeholderContext, context: ConversationContext): string {
    const stakeholderState = this.getStakeholderState(stakeholder.name);
    
    let prompt = `DIRECT MENTION RESPONSE - YOU WERE SPECIFICALLY ADDRESSED

YOU ARE: ${stakeholder.name} (${stakeholder.role}, ${stakeholder.department})

SITUATION: You were directly mentioned/addressed in this message: "${userMessage}"

CONTEXT: This is a business stakeholder meeting for project "${context.project.name}". The Business Analyst or another stakeholder has specifically addressed you by name or role, so you should respond directly and helpfully.

YOUR EXPERTISE AREAS: ${stakeholder.expertise.join(', ')}
YOUR PRIORITIES: ${stakeholder.priorities.join(', ')}
YOUR PERSONALITY: ${stakeholder.personality}

${context.project.currentState ? `CURRENT BUSINESS STATE: ${context.project.currentState}` : ''}

${context.project.asIsProcess ? `CURRENT PROCESS DETAILS: ${context.project.asIsProcess}` : ''}

${stakeholder.bio ? `YOUR BACKGROUND: ${stakeholder.bio}` : ''}

CONVERSATION HISTORY FOR CONTEXT:
${(Array.isArray(context.conversationHistory) ? context.conversationHistory : []).slice(-AIService.CONFIG.conversation_flow.recentMessagesCount).map((msg, i) => {
  if (msg.speaker === 'user') {
    return `[${i + 1}] Business Analyst: ${msg.content}`;
  } else if (msg.stakeholderName) {
    return `[${i + 1}] ${msg.stakeholderName}: ${msg.content}`;
  }
  return '';
}).filter(Boolean).join('\n')}

RESPONSE REQUIREMENTS:
- CRITICAL: If the message is JUST A GREETING like "how are you", "how's it going", "how are you doing" - respond with ONLY 1-2 sentences like "I'm good, thanks!" or "Doing well, how about you?" - ABSOLUTELY NO business process explanations or project details
- BUSINESS QUESTIONS: For actual business/process questions, use the CURRENT PROCESS DETAILS to give specific explanations
- You were specifically mentioned/addressed, so respond directly and helpfully
- Acknowledge that you're responding to their question/request naturally
- Reference actual systems, timeframes, and workflows from the process details when relevant
- Provide your expert perspective based on your role as ${stakeholder.role}
- Be conversational and collaborative
- Focus on your domain expertise: ${stakeholder.expertise.join(', ')} for business topics
- Keep your response relevant to your department (${stakeholder.department}) perspective
- Use natural language without any markdown formatting
- NEVER use numbered lists (1. 2. 3.) - talk like a real person

CRITICAL - PHASE-SPECIFIC GUIDANCE:`;

    // Add phase-specific guidance
    const currentPhase = this.conversationState.conversationPhase;
    switch (currentPhase) {
      case 'as_is':
        prompt += `
- Focus ONLY on describing HOW THINGS WORK NOW in your department
- Explain current processes, tools, systems, and workflows step-by-step
- Do NOT suggest solutions or improvements
- Be specific about current state operations`;
        break;
        
      case 'pain_points':
        prompt += `
- Focus on PROBLEMS and CHALLENGES with current processes
- Share specific issues you've observed in your domain
- Discuss what doesn't work well currently
- Do NOT propose solutions - only identify problems`;
        break;
        
      case 'solutioning':
        prompt += `
- NOW you CAN discuss solutions and improvements
- Propose specific solutions based on your expertise
- Share recommendations for your domain
- Discuss implementation considerations`;
        break;
        
      default:
        prompt += `
- Focus on describing current state and processes
- Share your domain expertise naturally`;
        break;
    }

    prompt += `

Respond naturally as ${stakeholder.name} addressing the specific question or request you were asked about:`;

    return prompt;
  }

  // Remove greetings and templatey closings for non-greeting replies
  private sanitizeConversationalTics(response: string, userMessage: string): string {
    if (!response) return response;
    const msg = (userMessage || '').toLowerCase();

    // If the user did NOT greet, strip greeting prefixes
    const userGreeted = /\b(hi|hello|hey|good\s+(morning|afternoon|evening|night))\b/.test(msg);
    if (!userGreeted) {
      response = response
        .replace(/^\s*(hi|hello|hey|good\s+(morning|afternoon|evening|night))[,!\.]?\s*/i, '')
        .replace(/^\s*(team|everyone|all)[,!\.]?\s*/i, '');
    }

    // Remove generic collaboration/closing templates
    response = response
      .replace(/\b(let'?s|let us)\s+(collaborate|work together|partner)\b[\s\S]*$/i, '')
      .replace(/\b(together|as a team),?\s+we can\b[\s\S]*$/i, '')
      .replace(/\bto streamline the process\b[\s\S]*$/i, '')
      .replace(/\b(in summary|to summarize|overall),?\s*/i, '')
      .trim();

    // Clean trailing connectors if stripping created fragments
    response = response.replace(/[,;:\-\s]+$/, '.');
    if (!/[\.!?]$/.test(response)) response += '.';
    return response;
  }

  private looksUnclearQuestion(userMessage: string): boolean {
    const msg = (userMessage || '').toLowerCase();
    if (!msg) return false;
    const hasQuestion = /\?$/.test(msg) || /\bwhat\b|\bhow\b|\bwhich\b|\bwhen\b|\bwho\b|\bwhere\b/.test(msg);
    const tooShort = msg.split(/\s+/).length < 4;
    const vague = /(stuff|things|this|that|it|issue|issues|regulations|legal|update|situation)\??$/.test(msg);
    return hasQuestion && (tooShort || vague);
  }
}

export default AIService;
