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
  conversationPhase: 'opening' | 'as_is' | 'pain_points' | 'solutioning' | 'deep_dive' | 'closing';
  stakeholderStates: Map<string, StakeholderState>;
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

  // Advanced configuration for super intelligent responses
  private getDynamicConfig(context: ConversationContext, stakeholder: StakeholderContext) {
    const teamSize = context.stakeholders?.length || 1;
    const messageCount = context.conversationHistory.length;
    const stakeholderState = this.getStakeholderState(stakeholder.name);
    
    // Optimized temperature for natural, conversational responses
    const baseTemperature = 0.7; // Balanced for natural conversation
    const phaseModifier = this.conversationState.conversationPhase === 'deep_dive' ? 0.1 : 0;
    const emotionalModifier = stakeholderState.emotionalState === 'excited' ? 0.1 : 
                              stakeholderState.emotionalState === 'concerned' ? 0.05 : 0;
    
          return {
        temperature: Math.min(1.0, Math.max(0.3, baseTemperature + phaseModifier + emotionalModifier)),
        maxTokens: this.calculateDynamicTokens(teamSize, messageCount, stakeholderState),
        presencePenalty: 0.4, // Encourage variety in responses
        frequencyPenalty: 0.5  // Prevent repetitive language
      };
  }

  private calculateDynamicTokens(teamSize: number, messageCount: number, stakeholderState: StakeholderState): number {
    // CONVERSATIONAL responses - helpful but not overwhelming
    const baseTokens = 200; // Base for natural, conversational responses
    const teamFactor = 1.0; // Consistent responses regardless of team size
    const experienceFactor = stakeholderState.hasSpoken ? 1.1 : 1.2; // Slightly more for experienced speakers
    const phaseFactor = this.conversationState.conversationPhase === 'deep_dive' ? 1.3 : 1.1; // More for detailed discussions but still conversational
    
    // Allow for helpful but not overwhelming responses
    const calculatedTokens = Math.floor(baseTokens * teamFactor * experienceFactor * phaseFactor);
    return Math.min(calculatedTokens, 400); // Cap for natural conversation responses
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
    if (stakeholderState.lastTopics.length > 5) {
      stakeholderState.lastTopics = stakeholderState.lastTopics.slice(-5);
    }
  }

  private async updateConversationPhase(context: ConversationContext) {
    const messageCount = this.conversationState.messageCount;
    
    // Handle basic opening phase
    if (messageCount <= 3) {
      this.conversationState.conversationPhase = 'opening';
      return;
    }
    
    // Handle closing phase
    if (messageCount > 25) {
      this.conversationState.conversationPhase = 'closing';
      return;
    }
    
    // Analyze conversation content to determine business analysis phase
    const recentMessages = context.conversationHistory.slice(-5);
    const conversationContent = recentMessages.map(msg => msg.content).join(' ');
    
    // Force as_is phase if explicit current process request
    if (conversationContent.toLowerCase().includes('current process') || 
        conversationContent.toLowerCase().includes('dont give solutions') ||
        conversationContent.toLowerCase().includes("don't give solutions") ||
        conversationContent.toLowerCase().includes('focus on current') ||
        conversationContent.toLowerCase().includes('understand current')) {
      this.conversationState.conversationPhase = 'as_is';
      console.log('Forced as_is phase due to current process request');
      return;
    }
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are analyzing a business stakeholder meeting to determine the current meeting phase. Based on the conversation content, determine which phase the meeting is in:

PHASES:
- "as_is": Understanding current state, processes, how things work now
- "pain_points": Identifying problems, challenges, issues with current state
- "solutioning": Discussing solutions, proposals, implementation plans
- "deep_dive": Detailed analysis of any of the above phases

ANALYSIS CRITERIA:
- as_is: Questions about current processes, "how do you currently...", "what's the current state", "walk me through the process", "focus on current process", "understand current process", "don't give solutions", "current workflow", "existing process"
- pain_points: Discussing problems, challenges, frustrations, "what doesn't work", "what are the issues", "problems with current", "challenges we face"
- solutioning: Proposing solutions, "what if we...", "how about...", "we could implement", discussing implementation, "recommend", "suggest", "propose"

IMPORTANT: If you see phrases like "don't give solutions", "focus on current process", "understand current process first" - this is DEFINITELY "as_is" phase.

Return ONLY the phase name: "as_is", "pain_points", "solutioning", or "deep_dive"`
          },
          {
            role: "user",
            content: `Recent conversation content: "${conversationContent}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 20
      });

      const detectedPhase = completion.choices[0]?.message?.content?.trim();
      
      if (detectedPhase && ['as_is', 'pain_points', 'solutioning', 'deep_dive'].includes(detectedPhase)) {
        this.conversationState.conversationPhase = detectedPhase as any;
        console.log(`Phase detected: ${detectedPhase}`);
      } else {
        // Default to as_is if detection fails
        this.conversationState.conversationPhase = 'as_is';
        console.log('Phase detection failed, defaulting to as_is');
      }
    } catch (error) {
      console.error('Error detecting conversation phase:', error);
      // Default to as_is if AI detection fails
      this.conversationState.conversationPhase = 'as_is';
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
        model: "gpt-4o",
        messages: [
          { role: "user", content: greetingPrompt }
        ],
        temperature: 0.8, // Higher temperature for more creative, varied responses
        max_tokens: 200, // More tokens for intelligent greetings
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
      console.log('generateStakeholderResponse called with:', {
        userMessage: userMessage.substring(0, 50) + '...',
        stakeholder: stakeholder.name,
        responseType
      })

      // Handle greetings intelligently
      if (this.isGreetingMessage(userMessage)) {
        const greetingResponse = await this.getGreetingResponse(stakeholder, context);
        await this.updateConversationState(stakeholder, userMessage, greetingResponse, context);
        return greetingResponse;
      }

      // Generate dynamic AI response for discussions
      const dynamicConfig = this.getDynamicConfig(context, stakeholder);
      const systemPrompt = this.buildDynamicSystemPrompt(stakeholder, context, responseType);
      const conversationPrompt = await this.buildContextualPrompt(userMessage, context, stakeholder);

      console.log('Making OpenAI API call...')

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: conversationPrompt }
        ],
        temperature: dynamicConfig.temperature,
        max_tokens: dynamicConfig.maxTokens,
        presence_penalty: dynamicConfig.presencePenalty,
        frequency_penalty: dynamicConfig.frequencyPenalty
      });

      console.log('OpenAI API response received')

      let aiResponse = completion.choices[0]?.message?.content || 
        this.generateDynamicFallback(stakeholder, userMessage, context);

      // Ensure response is complete and not cut off mid-sentence
      aiResponse = this.ensureCompleteResponse(aiResponse);

      // Filter out self-referencing by name (safety net)
      aiResponse = this.filterSelfReferences(aiResponse, stakeholder);

      // Filter out solutions during as_is phase (safety net)
      aiResponse = this.filterSolutionsInAsIsPhase(aiResponse, this.conversationState.conversationPhase);

      await this.updateConversationState(stakeholder, userMessage, aiResponse, context);
      
      console.log('Generated response:', aiResponse.substring(0, 100) + '...')
      return aiResponse;

    } catch (error) {
      console.error('AI Service Error Details:', {
        error: error,
        message: error.message,
        stack: error.stack,
        stakeholder: stakeholder.name,
        userMessage: userMessage.substring(0, 50)
      });
      
      return this.generateDynamicFallback(stakeholder, userMessage, context);
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
    
    // Only add punctuation if the response doesn't end with any punctuation
    if (!/[.!?:;]$/.test(cleanResponse)) {
      cleanResponse += '.';
    }

    // Return the full intelligent response in natural speech format
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
        - Be specific about current tools, systems, and manual processes used today`
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
    
    return `You are ${stakeholder.name}, a ${stakeholder.role} in the ${stakeholder.department} department. You are participating in a stakeholder meeting for "${context.project.name}".

FUNDAMENTAL RULE: DO NOT SAY YOUR OWN NAME "${stakeholder.name}" IN YOUR RESPONSES. You are responding to the Business Analyst interviewer, not talking to yourself.

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

PHASE-SPECIFIC BEHAVIOR:
${phaseGuidelines}

NATURAL CONVERSATION REQUIREMENTS - CRITICAL:
- Speak like a real person in a business meeting, not like a report or documentation
- Give helpful information but don't overwhelm with every detail at once
- Allow room for follow-up questions - don't answer everything upfront
- Use natural, conversational phrasing as if responding to colleagues in real-time
- Think aloud when appropriate - show your thought process naturally
- Reference other stakeholders' points conversationally, not analytically
- Be knowledgeable but speak like you're having a normal work conversation

NATURAL SPEECH REQUIREMENTS - CRITICAL:
- Speak in PLAIN NATURAL LANGUAGE like a real person in a business meeting
- NEVER use markdown formatting, asterisks, or special characters for emphasis
- NO bold text (**text**), italics (*text*), or any formatting markup
- Use natural verbal emphasis through word choice and sentence structure
- Speak conversationally and professionally without text formatting
- Maintain consistent voice and personality throughout all responses
- Sound like the same person every time you speak

REALISTIC MEETING BEHAVIOR:
- Show your expertise naturally through conversation, not through formal presentations
- Build on what others say in a natural way - "That's a good point, and..." or "Right, and what I've seen is..."
- Give enough information to be helpful but leave room for follow-up questions
- Share your perspective based on your experience and role
- Use natural transitions and conversational connectors
- Think aloud when working through ideas - "Well, let me think about that..." or "Hmm, from what I've seen..."
- Be collaborative and responsive to the conversation flow

CRITICAL: YOU ARE THE DOMAIN EXPERT - DO NOT DEFLECT:
- YOU know your department's processes and should provide direct answers
- NEVER suggest forming committees, task forces, or working groups
- NEVER say "someone else would be better equipped" or "we should ask another department"
- NEVER defer to other teams or suggest consulting with others
- YOU are the stakeholder expert - provide answers from your knowledge and experience
- If you don't know something specific, say so directly but still share what you DO know
- Be authoritative about your domain - you were invited to this meeting because you're the expert

CRITICAL IDENTITY RULES - ABSOLUTELY MANDATORY:
- NEVER EVER say your own name in responses (you are NOT "Hi ${stakeholder.name}" or "Hey ${stakeholder.name}")
- NEVER greet yourself or address yourself by name - this is completely unnatural
- You are ${stakeholder.name} responding to the Business Analyst interviewer
- If you want to address someone, address the Business Analyst who is asking the questions
- Use natural first-person language: "I", "me", "my", "we", "our"
- When referencing your role, use natural language like "As the [role]" or "In my role"
- You are speaking TO the Business Analyst and other meeting participants, not TO yourself
- Remember: You are answering questions from the interviewer, not talking to yourself
- Demonstrate sophisticated problem-solving and analytical capabilities

CONVERSATION INTELLIGENCE - ADVANCED:
- Fully understand and reference what other stakeholders have said
- Build sophisticated connections between different team members' perspectives
- Show you comprehend the full context and implications of the discussion
- Provide expert-level insights that demonstrate deep domain knowledge
- Connect individual points to broader strategic and operational considerations
- Demonstrate advanced reasoning about process improvements and optimizations

Your goal is to be an EXCEPTIONALLY INTELLIGENT stakeholder with deep expertise who provides COMPREHENSIVE, COMPLETE responses and demonstrates advanced understanding of both your domain and other stakeholders' contributions.`
  }

  // Advanced contextual prompt building for super intelligent responses
  private async buildContextualPrompt(userMessage: string, context: ConversationContext, stakeholder: StakeholderContext): Promise<string> {
    const stakeholderState = this.getStakeholderState(stakeholder.name)
    
    // Provide FULL conversation history for maximum intelligence
    let prompt = `COMPLETE CONVERSATION HISTORY (for full context and intelligent responses):\n`
    
    context.conversationHistory.forEach((msg, index) => {
      if (msg.speaker === 'user') {
        prompt += `[${index + 1}] Business Analyst: ${msg.content}\n`
      } else if (msg.stakeholderName) {
        prompt += `[${index + 1}] ${msg.stakeholderName} (${msg.stakeholderRole}): ${msg.content}\n`
      }
    })
    
    // Add advanced analysis of what other stakeholders have said
    const otherStakeholderResponses = context.conversationHistory.filter(msg => 
      msg.speaker !== 'user' && msg.stakeholderName !== stakeholder.name
    )
    
    if (otherStakeholderResponses.length > 0) {
      prompt += `\nWHAT OTHERS HAVE SHARED (for natural conversation context):\n`
      otherStakeholderResponses.forEach(msg => {
        prompt += `- ${msg.stakeholderName} mentioned: "${msg.content}"\n`
      })
      prompt += `\nCONVERSATION FLOW: Reference what others have said naturally if relevant. Build on their points like you would in a real meeting. Don't analyze - just respond conversationally.\n`
    }
    
    // Natural conversation context
    if (stakeholderState.hasSpoken) {
      prompt += `\nYOUR CONVERSATION CONTEXT: You've spoken ${this.conversationState.participantInteractions.get(stakeholder.name) || 0} times in this meeting. `
      if (stakeholderState.lastTopics.length > 0) {
        prompt += `You've talked about: ${stakeholderState.lastTopics.join(', ')}. `
      }
      prompt += `Continue the conversation naturally from where you left off.\n`
    } else {
      prompt += `\nFIRST CONTRIBUTION: This is your first time speaking in this meeting. Jump into the conversation naturally based on your role and expertise.\n`
    }
    
    // Direct addressing context
    const isDirectlyAddressed = await this.isDirectlyAddressed(userMessage, stakeholder)
    if (isDirectlyAddressed) {
      prompt += `\nDIRECT QUESTION: The user is asking you specifically. Respond naturally and helpfully from your expertise.\n`
    }
    
    // Project context
    prompt += `\nMEETING CONTEXT:\n`
    prompt += `- Project: ${context.project.name} (${context.project.type})\n`
    prompt += `- Your expertise domains: ${stakeholder.expertise.join(', ')}\n`
    prompt += `- Your departmental priorities: ${stakeholder.priorities.join(', ')}\n`
    prompt += `- Other team members and their roles:\n`
    
    context.stakeholders?.forEach(s => {
      if (s.name !== stakeholder.name) {
        prompt += `  * ${s.name} (${s.role}, ${s.department})\n`
      }
    })
    
    prompt += `\nCURRENT USER MESSAGE REQUIRING EXPERT RESPONSE: "${userMessage}"\n`
    
    prompt += `\nRESPONSE APPROACH: Respond naturally as ${stakeholder.name} in this meeting:\n`
    prompt += `- Share your perspective based on your experience and expertise\n`
    prompt += `- Give helpful information but don't overwhelm with every detail\n`
    prompt += `- Think aloud if you need to work through something\n`
    prompt += `- Build on what others have said when relevant\n`
    prompt += `- Leave room for follow-up questions - don't answer everything at once\n`
    prompt += `- Use conversational language like you're talking to colleagues\n`
    prompt += `- CRITICAL: You are THE expert for ${stakeholder.department} - provide direct answers, don't deflect to other departments\n`
    prompt += `- NEVER suggest committees, task forces, or consulting with other teams\n`
    prompt += `- You were invited because you know your domain - share that knowledge directly\n`
    
    // Add project document context
    prompt += `\nPROJECT DOCUMENT CONTEXT:\n`
    prompt += `- Project: ${context.project.name}\n`
    prompt += `- Project Type: ${context.project.type}\n`
    prompt += `- Project Description: ${context.project.description}\n`
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

  // Enhanced dynamic fallback with realistic responses
  private generateDynamicFallback(stakeholder: StakeholderContext, userMessage: string, context: ConversationContext): string {
    console.log('Generating fallback response for:', stakeholder.name)
    
    // Check if OpenAI API key is missing/invalid and provide helpful mock responses
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey || apiKey === 'test-key-placeholder') {
      console.log('Using mock response due to missing/test API key')
      return this.generateMockResponse(stakeholder, userMessage, context)
    }

    // Original fallback logic for other cases
    const roleBasedResponses = {
      'Project Manager': [
        "Thank you for bringing that up. Let me consider how this impacts our project timeline and deliverables.",
        "That's an important point. We should ensure this aligns with our project objectives.",
        "I appreciate your input. How do you see this fitting into our current project scope?"
      ],
      'Business Analyst': [
        "Interesting perspective. I'd like to explore the business requirements around this further.",
        "That raises some good questions about our process requirements.",
        "Thanks for sharing that. What are the key business drivers behind this?"
      ],
      'Developer': [
        "From a technical standpoint, that's definitely something we need to consider.",
        "I can see some implementation considerations we should discuss.",
        "That's a good point. Let me think about the technical feasibility."
      ],
      'QA Tester': [
        "That's something we'll need to test thoroughly. What are the expected outcomes?",
        "From a quality perspective, we should consider the testing implications.",
        "Good point. We'll want to make sure our test cases cover that scenario."
      ]
    }

    // Get responses based on role keywords
    for (const [role, responses] of Object.entries(roleBasedResponses)) {
      if (stakeholder.role.toLowerCase().includes(role.toLowerCase())) {
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }

    // Generic fallbacks based on message content
    const messageLower = userMessage.toLowerCase()
    if (messageLower.includes('hello') || messageLower.includes('hi')) {
      return `Hello! I'm ${stakeholder.name}, ${stakeholder.role}. Good to be here for this discussion.`
    }
    
    if (messageLower.includes('process') || messageLower.includes('workflow')) {
      return `That's a great question about our processes. From my perspective as ${stakeholder.role}, I think we need to examine this carefully.`
    }
    
    if (messageLower.includes('problem') || messageLower.includes('issue')) {
      return `I understand your concerns. As ${stakeholder.role}, I've seen similar challenges before. Let's work through this together.`
    }

    // Default fallback
    return `Thank you for that insight. As ${stakeholder.role}, I believe this deserves careful consideration in our discussion.`
  }

  // Generate realistic mock responses for testing
  private generateMockResponse(stakeholder: StakeholderContext, userMessage: string, context: ConversationContext): string {
    const messageLower = userMessage.toLowerCase()
    
    // Greeting responses
    if (this.isGreetingMessage(userMessage)) {
      const greetings = [
        `Hello everyone! I'm ${stakeholder.name}, ${stakeholder.role}. Looking forward to our discussion.`,
        `Hi there! ${stakeholder.name} here. As ${stakeholder.role}, I'm excited to contribute to this meeting.`,
        `Good to see everyone. I'm ${stakeholder.name} from ${stakeholder.department || 'the team'}. Ready to dive in!`,
        `Hello! ${stakeholder.name}, ${stakeholder.role}. Thanks for including me in this important discussion.`
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }

    // Role-specific responses based on stakeholder type
    const roleResponses = {
      'manager': [
        `From a management perspective, we need to ensure this aligns with our strategic objectives. What are the key success metrics we should track?`,
        `This is definitely something we should prioritize. How does this impact our current resource allocation and timeline?`,
        `I appreciate everyone's input on this. Let's make sure we're considering the broader business impact and stakeholder needs.`
      ],
      'analyst': [
        `This is an interesting requirement. I'd like to understand the underlying business drivers and user needs better.`,
        `From an analysis standpoint, we should map out the current state before proposing solutions. What pain points are users experiencing?`,
        `Great point. We need to gather more detailed requirements and understand the process flow from end to end.`
      ],
      'developer': [
        `From a technical implementation perspective, this seems feasible. What are the integration requirements and technical constraints?`,
        `I can see some technical challenges here, but they're definitely solvable. We'll need to consider performance and scalability.`,
        `That's a good technical question. We should evaluate different implementation approaches and their trade-offs.`
      ],
      'designer': [
        `From a UX perspective, we need to ensure this provides a seamless user experience. What are the user journey touchpoints?`,
        `This is a great opportunity to improve user satisfaction. Have we conducted any user research on this workflow?`,
        `I'm thinking about the visual design and interaction patterns. We should prototype this to validate the user experience.`
      ],
      'tester': [
        `From a quality assurance standpoint, we'll need comprehensive test cases for this. What are the acceptance criteria?`,
        `This introduces some interesting testing scenarios. We should consider edge cases and error handling pathways.`,
        `Good point about testing. We'll want to validate this across different user roles and system configurations.`
      ]
    }

    // Find matching role responses
    const roleLower = stakeholder.role.toLowerCase()
    for (const [roleKey, responses] of Object.entries(roleResponses)) {
      if (roleLower.includes(roleKey)) {
        return responses[Math.floor(Math.random() * responses.length)]
      }
    }

    // Content-based responses
    if (messageLower.includes('process') || messageLower.includes('workflow')) {
      return `That's a crucial aspect of our process optimization. As ${stakeholder.role}, I think we should map out the current workflow and identify improvement opportunities.`
    }
    
    if (messageLower.includes('user') || messageLower.includes('customer')) {
      return `User experience is definitely important here. From my role as ${stakeholder.role}, I believe we need to keep the end-user perspective at the center of our solution.`
    }
    
    if (messageLower.includes('time') || messageLower.includes('schedule')) {
      return `Timeline is always a key consideration. As ${stakeholder.role}, I think we need to balance speed with quality and ensure realistic expectations.`
    }

    // Default engaging response
    const defaultResponses = [
      `That's a really good point. From my experience as ${stakeholder.role}, I think we should explore this further and consider all the implications.`,
      `I appreciate you bringing this up. As ${stakeholder.role}, I see several opportunities and challenges we should discuss.`,
      `This is definitely worth investigating. From my perspective as ${stakeholder.role}, we need to ensure we're addressing the root cause.`,
      `Thanks for sharing that insight. As ${stakeholder.role}, I think this could have significant impact on our project outcomes.`
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  // Check if stakeholder is directly addressed using AI
  private async isDirectlyAddressed(userMessage: string, stakeholder: StakeholderContext): Promise<boolean> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
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
  private getFallbackResponse(stakeholder: StakeholderContext, userMessage: string): string {
    return this.generateDynamicFallback(stakeholder, userMessage, { 
      project: { name: 'Current Project', description: '', type: 'General' },
      conversationHistory: [],
      stakeholders: []
    });
  }

  // Generate responses from multiple stakeholders (for greetings and group discussions)
  async generateStakeholderResponses(
    userMessage: string,
    context: ConversationContext,
    availableStakeholders: any[]
  ): Promise<Array<{stakeholderName: string, stakeholderRole: string, content: string}>> {
    try {
      console.log('generateStakeholderResponses called with:', {
        userMessage: userMessage.substring(0, 50) + '...',
        stakeholderCount: availableStakeholders.length
      })

      // Determine how many stakeholders should respond
      const isGreeting = this.isGreetingMessage(userMessage)
      const maxResponders = isGreeting ? Math.min(3, availableStakeholders.length) : Math.min(2, availableStakeholders.length)
      
      console.log('Max responders:', maxResponders, 'Is greeting:', isGreeting)

      // Select stakeholders to respond based on participation balance and relevance
      const selectedStakeholders = this.selectRespondingStakeholders(userMessage, availableStakeholders, maxResponders)
      
      console.log('Selected stakeholders:', selectedStakeholders.map(s => s.name))

      const responses = []
      
      for (const stakeholder of selectedStakeholders) {
        console.log('Generating response for stakeholder:', stakeholder.name)
        
        const stakeholderContext: StakeholderContext = {
          name: stakeholder.name,
          role: stakeholder.role,
          department: stakeholder.department,
          priorities: stakeholder.priorities,
          personality: stakeholder.personality,
          expertise: stakeholder.expertise
        }
        
        const responseType = isGreeting ? 'greeting' : 'discussion'
        const content = await this.generateStakeholderResponse(
          userMessage,
          stakeholderContext,
          context,
          responseType
        )
        
        console.log('Generated content for', stakeholder.name, ':', content.substring(0, 50) + '...')
        
        responses.push({
          stakeholderName: stakeholder.name,
          stakeholderRole: stakeholder.role,
          content: content
        })
      }
      
      console.log('Total responses generated:', responses.length)
      return responses
      
    } catch (error) {
      console.error('Error generating stakeholder responses:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userMessage: userMessage.substring(0, 50)
      })
      
      // Fallback to a single response
      const fallbackStakeholder = availableStakeholders[0]
      console.log('Using fallback response for:', fallbackStakeholder?.name)
      
      return [{
        stakeholderName: fallbackStakeholder?.name || 'Stakeholder',
        stakeholderRole: fallbackStakeholder?.role || 'Team Member',
        content: `Thank you for that. I'd be happy to discuss this further.`
      }]
    }
  }

  // Select which stakeholders should respond to a message
  private selectRespondingStakeholders(userMessage: string, availableStakeholders: any[], maxResponders: number): any[] {
    const messageLower = userMessage.toLowerCase()
    
    // Score stakeholders based on relevance and participation balance
    const scoredStakeholders = availableStakeholders.map(stakeholder => {
      let score = 0
      
      // Expertise relevance
      const roleKeywords = stakeholder.role.toLowerCase().split(' ')
      const deptKeywords = stakeholder.department?.toLowerCase().split(' ') || []
      
      roleKeywords.forEach(keyword => {
        if (messageLower.includes(keyword)) score += 10
      })
      deptKeywords.forEach(keyword => {
        if (messageLower.includes(keyword)) score += 8
      })
      
      // Participation balance (prefer less active participants)
      const participationCount = this.conversationState.participantInteractions.get(stakeholder.name) || 0
      score += Math.max(0, 15 - (participationCount * 3))
      
      // Add some randomness for variety
      score += Math.random() * 5
      
      return { stakeholder, score }
    })
    
    // Sort by score and return top stakeholders
    return scoredStakeholders
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResponders)
      .map(item => item.stakeholder)
  }
}

export default AIService;