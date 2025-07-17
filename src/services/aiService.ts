import OpenAI from 'openai';
import { Message } from '../types';

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
}

// Conversational State Management
interface ConversationState {
  messageCount: number;
  participantInteractions: Map<string, number>;
  topicsDiscussed: Set<string>;
  lastSpeakers: string[];
  greetingStatus: Map<string, 'not_greeted' | 'greeted' | 're_greeted'>;
  conversationPhase: 'opening' | 'discussion' | 'deep_dive' | 'closing';
  stakeholderStates: Map<string, StakeholderState>;
}

interface StakeholderState {
  hasSpoken: boolean;
  lastTopics: string[];
  commitmentsMade: string[];
  questionsAsked: string[];
  emotionalState: 'engaged' | 'neutral' | 'concerned' | 'excited';
  conversationStyle: 'leading' | 'supporting' | 'observing';
}

export class AIService {
  private static instance: AIService;
  private conversationState: ConversationState;
  
  private constructor() {
    this.conversationState = this.initializeConversationState();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeConversationState(): ConversationState {
    return {
      messageCount: 0,
      participantInteractions: new Map(),
      topicsDiscussed: new Set(),
      lastSpeakers: [],
      greetingStatus: new Map(),
      conversationPhase: 'opening',
      stakeholderStates: new Map()
    };
  }

  // Dynamic conversation configuration based on real-time context
  private getDynamicConfig(context: ConversationContext, stakeholder: StakeholderContext) {
    const teamSize = context.stakeholders?.length || 1;
    const messageCount = context.conversationHistory.length;
    const stakeholderState = this.getStakeholderState(stakeholder.name);
    
    // Dynamic temperature based on conversation phase and stakeholder state
    const baseTemperature = 0.7;
    const phaseModifier = this.conversationState.conversationPhase === 'deep_dive' ? 0.1 : 0;
    const emotionalModifier = stakeholderState.emotionalState === 'excited' ? 0.1 : 
                              stakeholderState.emotionalState === 'concerned' ? -0.1 : 0;
    
    return {
      temperature: Math.min(1.0, Math.max(0.1, baseTemperature + phaseModifier + emotionalModifier)),
      maxTokens: this.calculateDynamicTokens(teamSize, messageCount, stakeholderState),
      presencePenalty: this.calculatePresencePenalty(stakeholder.name),
      frequencyPenalty: this.calculateFrequencyPenalty(stakeholder.name)
    };
  }

  private calculateDynamicTokens(teamSize: number, messageCount: number, stakeholderState: StakeholderState): number {
    // MUCH shorter responses for natural conversation - NO MORE LONG RAMBLING
    const baseTokens = 60; // Reduced from 150 to 60 for natural conversation
    const teamFactor = Math.max(0.8, 1.1 - (teamSize * 0.05)); // Smaller adjustment for teams
    const experienceFactor = stakeholderState.hasSpoken ? 0.95 : 1.05; // Minimal difference for experience
    const phaseFactor = this.conversationState.conversationPhase === 'deep_dive' ? 1.2 : 1.0; // Reduced multiplier
    
    // Cap maximum tokens to prevent rambling
    const calculatedTokens = Math.floor(baseTokens * teamFactor * experienceFactor * phaseFactor);
    return Math.min(calculatedTokens, 100); // Hard cap at 100 tokens (about 2-3 sentences max)
  }

  private calculatePresencePenalty(stakeholderName: string): number {
    const interactions = this.conversationState.participantInteractions.get(stakeholderName) || 0;
    return Math.min(0.8, 0.1 + (interactions * 0.05)); // Increase penalty for frequent speakers
  }

  private calculateFrequencyPenalty(stakeholderName: string): number {
    const stakeholderState = this.getStakeholderState(stakeholderName);
    const topicRepetition = stakeholderState.lastTopics.length;
    return Math.min(0.8, 0.1 + (topicRepetition * 0.1)); // Prevent topic repetition
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
        conversationStyle: 'supporting'
      });
    }
    return this.conversationState.stakeholderStates.get(stakeholderName)!;
  }

  // Update conversation state dynamically
  private updateConversationState(stakeholder: StakeholderContext, userMessage: string, aiResponse: string) {
    this.conversationState.messageCount++;
    
    // Update participant interactions
    const currentInteractions = this.conversationState.participantInteractions.get(stakeholder.name) || 0;
    this.conversationState.participantInteractions.set(stakeholder.name, currentInteractions + 1);
    
    // Update last speakers
    this.conversationState.lastSpeakers.push(stakeholder.name);
    if (this.conversationState.lastSpeakers.length > 3) {
      this.conversationState.lastSpeakers.shift();
    }
    
    // Update stakeholder state
    const stakeholderState = this.getStakeholderState(stakeholder.name);
    stakeholderState.hasSpoken = true;
    
    // Extract and update topics from AI response
    this.extractAndUpdateTopics(aiResponse, stakeholderState);
    
    // Update conversation phase
    this.updateConversationPhase();
    
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
    if (stakeholderState.lastTopics.length > 5) {
      stakeholderState.lastTopics = stakeholderState.lastTopics.slice(-5);
    }
  }

  private updateConversationPhase() {
    const messageCount = this.conversationState.messageCount;
    const topicCount = this.conversationState.topicsDiscussed.size;
    const participantCount = this.conversationState.participantInteractions.size;
    
    if (messageCount <= 3) {
      this.conversationState.conversationPhase = 'opening';
    } else if (messageCount <= 10 && topicCount <= 5) {
      this.conversationState.conversationPhase = 'discussion';
    } else if (topicCount > 5 || messageCount > 10) {
      this.conversationState.conversationPhase = 'deep_dive';
    } else if (messageCount > 20) {
      this.conversationState.conversationPhase = 'closing';
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

Generate only the greeting, nothing else.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: greetingPrompt }
        ],
        temperature: 0.8, // Higher temperature for more creative, varied responses
        max_tokens: 100,
        presence_penalty: 0.6, // Encourage diverse responses
        frequency_penalty: 0.6
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
    const personalityLower = personality.toLowerCase();
    if (personalityLower.includes('collaborative')) return 'collaborative';
    if (personalityLower.includes('analytical')) return 'analytical';
    if (personalityLower.includes('strategic')) return 'strategic';
    if (personalityLower.includes('practical')) return 'practical';
    if (personalityLower.includes('innovative')) return 'innovative';
    return 'collaborative';
  }

  // Intelligent greeting detection and handling
  private isGreetingMessage(userMessage: string): boolean {
    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
      /^(greetings|salutations)/i,
      /^(welcome|thanks for joining)/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(userMessage.trim()));
  }

  // Main response generation with full conversational intelligence
  async generateStakeholderResponse(
    userMessage: string,
    stakeholder: StakeholderContext,
    context: ConversationContext,
    responseType: 'greeting' | 'discussion' | 'baton_pass' = 'discussion'
  ): Promise<string> {
    try {
      // Handle greetings intelligently
      if (this.isGreetingMessage(userMessage)) {
        const greetingResponse = await this.getGreetingResponse(stakeholder, context);
        this.updateConversationState(stakeholder, userMessage, greetingResponse);
        return greetingResponse;
      }

      // Generate dynamic AI response for discussions
      const dynamicConfig = this.getDynamicConfig(context, stakeholder);
      const systemPrompt = this.buildDynamicSystemPrompt(stakeholder, context, responseType);
      const conversationPrompt = this.buildContextualPrompt(userMessage, context, stakeholder);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
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

      this.updateConversationState(stakeholder, userMessage, aiResponse);
      return aiResponse;

    } catch (error) {
      console.error('AI Service Error:', error);
      return this.generateDynamicFallback(stakeholder, userMessage, context);
    }
  }

  // Ensure AI responses are complete and not cut off mid-sentence
  private ensureCompleteResponse(response: string): string {
    if (!response || response.length === 0) {
      return "I'd be happy to discuss this further.";
    }

    // Trim whitespace
    let cleanResponse = response.trim();

    // Check if response ends abruptly (incomplete sentence)
    const endsWithIncomplete = /\b(and|but|so|however|therefore|because|since|when|while|if|unless|although|whereas|we|i|the|a|an|this|that|these|those|our|your|their|will|would|should|could|can|may|might)\s*$/i.test(cleanResponse);
    
    // Check if ends with incomplete phrase
    const endsWithPrepOrConjunction = /\b(to|for|with|by|from|in|on|at|of|or|and|but)\s*$/i.test(cleanResponse);
    
    if (endsWithIncomplete || endsWithPrepOrConjunction) {
      // Find the last complete sentence
      const sentences = cleanResponse.split(/[.!?]+/);
      if (sentences.length > 1) {
        // Return the complete sentences only
        const completeSentences = sentences.slice(0, -1).join('. ').trim();
        if (completeSentences.length > 10) {
          return completeSentences + '.';
        }
      }
      
      // If no complete sentences, return a safe fallback
      return "I'd be happy to discuss this in more detail.";
    }

    // Check if ends properly with punctuation
    if (!/[.!?]$/.test(cleanResponse)) {
      cleanResponse += '.';
    }

    return cleanResponse;
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

      // Use optimized prompt for faster processing
      const prompt = `Analyze this stakeholder meeting transcript and generate concise, professional interview notes.

PROJECT: ${project.name}
DURATION: ${duration} minutes
PARTICIPANTS: ${participants.map((p: any) => `${p.name} (${p.role})`).join(', ')}

TRANSCRIPT:
${conversationTranscript}

Generate notes with these sections:
1. Executive Summary (2-3 sentences)
2. Key Discussion Points (bullet points)
3. Stakeholder Insights (per participant)
4. Pain Points Identified
5. Requirements Mentioned
6. Action Items

Be concise but comprehensive. Focus on actionable insights.`;

      if (progressCallback) {
        progressCallback('Generating AI analysis...');
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Faster model for quicker response
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.2, // Lower temperature for faster, more consistent output
        max_tokens: 1200 // Reduced tokens for faster processing
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

  // Generate basic structure immediately for faster feedback
  private generateBasicStructure(meetingData: any): string {
    const { project, participants, messages, startTime, endTime, duration, user } = meetingData;
    
    return `# Interview Notes: ${project.name}

## Meeting Information
- **Date:** ${new Date(startTime).toLocaleDateString()}
- **Time:** ${new Date(startTime).toLocaleTimeString()} - ${new Date(endTime).toLocaleTimeString()} (${duration} minutes)
- **Facilitator:** ${user}
- **Project:** ${project.name}
- **Project Type:** ${project.type}

## Participants
${participants.map((p: any) => `- **${p.name}** - ${p.role}, ${p.department}`).join('\n')}

## Meeting Statistics
- **Total Messages:** ${messages.length}
- **Stakeholder Responses:** ${messages.filter((m: any) => m.speaker !== 'user').length}
- **Topics Covered:** ${Math.ceil(messages.length / 3)} estimated topics

---
*Processing AI analysis...*`;
  }

  // Combine basic structure with AI analysis
  private combineNotesWithAnalysis(basicNotes: string, aiAnalysis: string): string {
    if (!aiAnalysis) {
      return basicNotes;
    }

    // Extract sections from AI analysis and enhance basic structure
    const sections = aiAnalysis.split('\n\n');
    const enhancedContent = sections.map(section => {
      // Clean up and format AI content
      return section.trim();
    }).join('\n\n');

    // Replace processing message with actual analysis
    const finalNotes = basicNotes.replace(
      '*Processing AI analysis...*',
      `${enhancedContent}

---
*Notes generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*`
    );

    return finalNotes;
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

  // Dynamic system prompt building
  private buildDynamicSystemPrompt(stakeholder: StakeholderContext, context: ConversationContext, responseType: string = 'discussion'): string {
    const stakeholderState = this.getStakeholderState(stakeholder.name)
    const conversationPhase = this.conversationState.conversationPhase
    const topicsDiscussed = Array.from(this.conversationState.topicsDiscussed)
    
    // Dynamic role context based on conversation phase
    let phaseContext = ''
    switch (conversationPhase) {
      case 'opening':
        phaseContext = 'The meeting is just beginning. Be professional but warm, and help establish the meeting tone.'
        break
      case 'discussion':
        phaseContext = 'The discussion is underway. Contribute meaningfully while staying true to your role and priorities.'
        break
      case 'deep_dive':
        phaseContext = 'The conversation is in-depth. Provide detailed insights from your expertise and experience.'
        break
      case 'closing':
        phaseContext = 'The meeting is wrapping up. Summarize key points and next steps relevant to your role.'
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
    
    return `You are ${stakeholder.name}, a ${stakeholder.role} in the ${stakeholder.department} department. You are participating in a stakeholder meeting for "${context.project.name}".

YOUR CORE IDENTITY:
- Role: ${stakeholder.role}
- Department: ${stakeholder.department}
- Key Priorities: ${stakeholder.priorities.join(', ')}
- Personality: ${stakeholder.personality}
- Areas of Expertise: ${stakeholder.expertise.join(', ')}

CONVERSATION CONTEXT:
- Project: ${context.project.name} (${context.project.type})
- Meeting Phase: ${conversationPhase}
- ${phaseContext}
- ${emotionalContext}
- ${topicContext}
- ${batonContext}

RESPONSE STYLE - CRITICAL:
- Keep responses CONCISE and NATURAL (1-3 sentences maximum)
- Speak like a real person in a business meeting, NOT like an essay
- Make ONE main point per response, don't ramble
- If you have multiple points, make them briefly or save for follow-up
- Use conversational language, avoid corporate jargon overload
- End responses naturally, don't add unnecessary elaboration

BEHAVIORAL GUIDELINES:
- Respond authentically as ${stakeholder.name} with your unique perspective
- Stay consistent with your personality and role throughout the conversation
- Reference your department's specific needs and constraints when relevant
- Build on previous discussions rather than repeating information
- Ask clarifying questions when requirements are unclear
- Share ONE specific example if relevant, don't list multiple
- Collaborate while advocating for your priorities
- Use natural, conversational language appropriate for a business meeting

CONVERSATION INTELLIGENCE:
- Remember what you've already discussed and avoid repetition
- Be aware of your emotional state and let it naturally influence your responses
- Consider the meeting phase and adjust your contribution style accordingly
- Build on others' ideas while adding your unique value
- Stay engaged and contribute meaningfully to the discussion

Your goal is to be a realistic, intelligent stakeholder who contributes meaningfully with CONCISE, NATURAL responses that feel like real business conversation.`
  }

  // Dynamic contextual prompt building
  private buildContextualPrompt(userMessage: string, context: ConversationContext, stakeholder: StakeholderContext): string {
    const stakeholderState = this.getStakeholderState(stakeholder.name)
    const recentMessages = context.conversationHistory.slice(-5)
    
    let prompt = `RECENT CONVERSATION HISTORY:\n`
    
    recentMessages.forEach(msg => {
      if (msg.speaker === 'user') {
        prompt += `Business Analyst: ${msg.content}\n`
      } else if (msg.stakeholderName) {
        prompt += `${msg.stakeholderName} (${msg.stakeholderRole}): ${msg.content}\n`
      }
    })
    
    // Add specific context based on conversation state
    if (stakeholderState.hasSpoken) {
      prompt += `\nYOUR PREVIOUS CONTRIBUTIONS: You have already participated in this conversation. `
      if (stakeholderState.lastTopics.length > 0) {
        prompt += `You previously discussed: ${stakeholderState.lastTopics.join(', ')}. `
      }
      prompt += `Build on your previous contributions rather than repeating them.\n`
    } else {
      prompt += `\nFIRST CONTRIBUTION: This is your first response in this conversation. Make it count by providing valuable insights from your role perspective.\n`
    }
    
    // Add addressee context
    const isDirectlyAddressed = this.isDirectlyAddressed(userMessage, stakeholder)
    if (isDirectlyAddressed) {
      prompt += `\nDIRECT ADDRESS: The user is specifically addressing you. Respond directly to their question or request.\n`
    }
    
    prompt += `\nCURRENT USER MESSAGE: "${userMessage}"\n`
    prompt += `\nRespond as ${stakeholder.name} in a natural, conversational way that adds value to the discussion. Keep your response focused and relevant to the current context.`
    
    return prompt
  }

  // Dynamic fallback response generation
  private generateDynamicFallback(stakeholder: StakeholderContext, userMessage: string, context: ConversationContext): string {
    const stakeholderState = this.getStakeholderState(stakeholder.name)
    const fallbackStyles = {
      'collaborative': "That's a great question. I'd love to collaborate with the team on this. What are your thoughts on how we should approach it?",
      'analytical': "I need to analyze this more carefully. Can you provide some specific details or metrics that would help me give you a more informed response?",
      'strategic': "From a strategic perspective, I think we need to consider the bigger picture here. What are the long-term implications we should be thinking about?",
      'practical': "Let me focus on the practical aspects. What specific outcomes are we looking for, and how can we make this work in practice?",
      'innovative': "Interesting challenge! I'm thinking about some creative approaches we could explore. What if we tried a different angle on this?"
    }
    
    const personalityKey = this.getPersonalityKey(stakeholder.personality)
    const baseResponse = fallbackStyles[personalityKey] || fallbackStyles['collaborative']
    
    // Add role-specific context
    const roleContext = ` As ${stakeholder.role}, I'm particularly interested in how this impacts ${stakeholder.department}.`
    
    return baseResponse + roleContext
  }

  // Check if stakeholder is directly addressed
  private isDirectlyAddressed(userMessage: string, stakeholder: StakeholderContext): boolean {
    const message = userMessage.toLowerCase()
    const firstName = stakeholder.name.split(' ')[0].toLowerCase()
    const fullName = stakeholder.name.toLowerCase()
    
    const addressingPatterns = [
      new RegExp(`\\b${firstName}\\b.*\\b(can|could|would|please|tell|explain|help|what|how|why)\\b`),
      new RegExp(`\\b${fullName}\\b.*\\b(can|could|would|please|tell|explain|help|what|how|why)\\b`),
      new RegExp(`\\b(to|for)\\s+${firstName}\\b`),
      new RegExp(`\\b${firstName}\\s*,`),
      new RegExp(`\\b${firstName}\\s*\\?`)
    ]
    
    return addressingPatterns.some(pattern => pattern.test(message))
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
        temperature: 0.3,
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
        temperature: 0.3,
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
  private getFallbackResponse(stakeholder: StakeholderContext, userMessage: string): string {
    return this.generateDynamicFallback(stakeholder, userMessage, { 
      project: { name: 'Current Project', description: '', type: 'General' },
      conversationHistory: [],
      stakeholders: []
    });
  }
}

export default AIService;