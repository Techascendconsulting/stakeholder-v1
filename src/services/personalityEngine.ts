import personalitiesConfig from '../config/personalities.json';

interface PersonalityConfig {
  id: string;
  name: string;
  role: string;
  voice: string;
  baseStyle: string;
  characteristics: {
    fillers: string[];
    greetings: string[];
    transitions: string[];
    acknowledgments: string[];
    pausePatterns: Record<string, number>;
    prosody: {
      baseRate: number;
      basePitch: string;
      baseVolume: string;
    };
    emotionalRanges: Record<string, {
      pitch: string;
      rate: number;
      volume: string;
    }>;
    emphasis_words: string[];
    personality_traits: Record<string, number>;
  };
}

interface ConversationContext {
  type: 'greeting' | 'explanation' | 'acknowledgment' | 'question_response' | 'technical_explanation';
  emotion: 'confident' | 'empathetic' | 'excited' | 'thoughtful' | 'friendly';
  userMood?: 'confused' | 'frustrated' | 'neutral' | 'engaged';
  complexity: number; // 0-1 scale
  isFirstMessage: boolean;
  messageHistory: string[];
}

interface EnhancementOptions {
  addFillers: boolean;
  addPauses: boolean;
  adjustEmotion: boolean;
  emphasizeKeywords: boolean;
  useTransitions: boolean;
}

class PersonalityEngine {
  private personalities: Map<string, PersonalityConfig>;
  private enhancementRules: any;
  private contextMappings: any;
  private ssmlTemplates: any;

  constructor() {
    this.personalities = new Map();
    this.loadPersonalities();
    this.enhancementRules = personalitiesConfig.enhancement_rules;
    this.contextMappings = personalitiesConfig.context_mappings;
    this.ssmlTemplates = personalitiesConfig.ssml_templates;
  }

  private loadPersonalities() {
    Object.values(personalitiesConfig.personalities).forEach((personality: any) => {
      this.personalities.set(personality.id, personality as PersonalityConfig);
    });
    console.log(`🎭 Loaded ${this.personalities.size} personality configurations`);
  }

  /**
   * Main method to generate personality-enhanced SSML
   */
  generatePersonalizedSSML(
    text: string, 
    stakeholderId: string, 
    context: ConversationContext,
    options: Partial<EnhancementOptions> = {}
  ): string {
    const personality = this.personalities.get(stakeholderId);
    if (!personality) {
      console.warn(`⚠️ Personality not found for ${stakeholderId}, using plain SSML`);
      return this.createBasicSSML(text);
    }

    console.log(`🎭 Generating personalized SSML for ${personality.name}`, { context, options });

    // Step 1: Analyze and enhance text content
    const enhancedText = this.enhanceTextContent(text, personality, context, options);
    
    // Step 2: Apply emotional context
    const emotionalSettings = this.calculateEmotionalSettings(personality, context);
    
    // Step 3: Generate dynamic SSML
    const ssml = this.buildSSML(enhancedText, personality, emotionalSettings, context);
    
    console.log(`✅ Generated SSML for ${personality.name}:`, ssml);
    return ssml;
  }

  /**
   * Enhance text content with personality elements
   */
  private enhanceTextContent(
    text: string, 
    personality: PersonalityConfig, 
    context: ConversationContext,
    options: Partial<EnhancementOptions>
  ): string {
    let enhanced = text;

    // Add greeting enhancements
    if (context.type === 'greeting') {
      enhanced = this.enhanceGreeting(enhanced, personality);
    }

    // Add fillers for naturalness
    if (options.addFillers !== false) {
      enhanced = this.addFillers(enhanced, personality, context);
    }

    // Add transitions for flow
    if (options.useTransitions !== false && this.shouldAddTransition(context)) {
      enhanced = this.addTransition(enhanced, personality, context);
    }

    // Add acknowledgments for active listening
    if (this.shouldAddAcknowledgment(context)) {
      enhanced = this.addAcknowledgment(enhanced, personality);
    }

    return enhanced;
  }

  /**
   * Add natural fillers based on personality
   */
  private addFillers(text: string, personality: PersonalityConfig, context: ConversationContext): string {
    const { fillers } = personality.characteristics;
    const probability = this.getFillerProbability(context);
    
    if (Math.random() < probability) {
      const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
      
      // Add filler at the beginning with natural capitalization
      const capitalizedFiller = randomFiller.charAt(0).toUpperCase() + randomFiller.slice(1);
      return `${capitalizedFiller}, ${text.charAt(0).toLowerCase() + text.slice(1)}`;
    }
    
    return text;
  }

  /**
   * Add transitions for better flow
   */
  private addTransition(text: string, personality: PersonalityConfig, context: ConversationContext): string {
    const { transitions } = personality.characteristics;
    
    if (context.type === 'explanation' || context.type === 'technical_explanation') {
      const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
      return `${randomTransition}, ${text.charAt(0).toLowerCase() + text.slice(1)}`;
    }
    
    return text;
  }

  /**
   * Add acknowledgments for active listening
   */
  private addAcknowledgment(text: string, personality: PersonalityConfig): string {
    const { acknowledgments } = personality.characteristics;
    const randomAck = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    
    return `${randomAck.charAt(0).toUpperCase() + randomAck.slice(1)}. ${text}`;
  }

  /**
   * Enhance greeting specifically
   */
  private enhanceGreeting(text: string, personality: PersonalityConfig): string {
    const { greetings } = personality.characteristics;
    
    // If text is a simple greeting, enhance it
    const simpleGreetings = ['hi', 'hello', 'hey', 'good morning', 'morning'];
    const lowerText = text.toLowerCase().trim();
    
    if (simpleGreetings.some(greeting => lowerText.includes(greeting))) {
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      return `${randomGreeting}! ${text}`;
    }
    
    return text;
  }

  /**
   * Calculate emotional settings based on context
   */
  private calculateEmotionalSettings(
    personality: PersonalityConfig, 
    context: ConversationContext
  ): any {
    const baseEmotion = context.emotion;
    const emotionalRange = personality.characteristics.emotionalRanges[baseEmotion];
    
    if (!emotionalRange) {
      console.warn(`⚠️ Emotional range '${baseEmotion}' not found for ${personality.name}`);
      return personality.characteristics.prosody;
    }

    // Adjust based on context mappings
    const contextMapping = this.contextMappings[this.getContextKey(context)];
    
    return {
      ...personality.characteristics.prosody,
      ...emotionalRange,
      ...(contextMapping && this.applyContextMapping(contextMapping, emotionalRange))
    };
  }

  /**
   * Build the final SSML structure
   */
  private buildSSML(
    text: string, 
    personality: PersonalityConfig, 
    emotionalSettings: any, 
    context: ConversationContext
  ): string {
    const template = this.ssmlTemplates[context.type] || this.ssmlTemplates.explanation;
    
    // Build SSML with voice and style
    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">`;
    ssml += `<voice name="${personality.voice}">`;
    
    // Add expression style if available
    if (personality.baseStyle) {
      ssml += `<mstts:express-as style="${personality.baseStyle}" styledegree="0.8">`;
    }
    
    // Add prosody settings
    ssml += `<prosody rate="${emotionalSettings.rate}" pitch="${emotionalSettings.pitch}" volume="${emotionalSettings.volume}">`;
    
    // Process text with pauses and emphasis
    const processedText = this.processTextWithTemplate(text, personality, context, template);
    ssml += processedText;
    
    ssml += `</prosody>`;
    
    if (personality.baseStyle) {
      ssml += `</mstts:express-as>`;
    }
    
    ssml += `</voice></speak>`;
    
    return ssml;
  }

  /**
   * Process text using template patterns
   */
  private processTextWithTemplate(
    text: string, 
    personality: PersonalityConfig, 
    context: ConversationContext,
    template: any
  ): string {
    let processed = text;
    
    // Add pauses based on context
    processed = this.addContextualPauses(processed, personality, context);
    
    // Add emphasis to key words
    processed = this.addEmphasis(processed, personality);
    
    return processed;
  }

  /**
   * Add contextual pauses
   */
  private addContextualPauses(text: string, personality: PersonalityConfig, context: ConversationContext): string {
    const { pausePatterns } = personality.characteristics;
    let processed = text;
    
    // Add thinking pause for complex responses
    if (context.complexity > 0.6 || context.type === 'technical_explanation') {
      const thinkingPause = `<break time="${pausePatterns.thinking}ms"/>`;
      processed = `${thinkingPause}${processed}`;
    }
    
    // Add greeting pause
    if (context.type === 'greeting') {
      const greetingPause = `<break time="${pausePatterns.afterGreeting}ms"/>`;
      processed = processed.replace(/!/g, `!${greetingPause}`);
    }
    
    // Add natural pauses at sentence boundaries
    processed = processed.replace(/\. /g, `.<break time="${pausePatterns.medium}ms"/> `);
    processed = processed.replace(/\? /g, `?<break time="${pausePatterns.short}ms"/> `);
    
    return processed;
  }

  /**
   * Add emphasis to personality-specific keywords
   */
  private addEmphasis(text: string, personality: PersonalityConfig): string {
    const { emphasis_words } = personality.characteristics;
    let processed = text;
    
    emphasis_words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processed = processed.replace(regex, `<emphasis level="moderate">${word}</emphasis>`);
    });
    
    return processed;
  }

  // Helper methods
  private shouldAddTransition(context: ConversationContext): boolean {
    return context.type === 'explanation' || context.type === 'technical_explanation';
  }

  private shouldAddAcknowledgment(context: ConversationContext): boolean {
    return context.type === 'acknowledgment' || (context.userMood === 'confused' || context.userMood === 'frustrated');
  }

  private getFillerProbability(context: ConversationContext): number {
    if (context.type === 'greeting') return 0.2;
    if (context.complexity > 0.7) return 0.4;
    return 0.3;
  }

  private getContextKey(context: ConversationContext): string {
    if (context.userMood === 'confused') return 'user_confused';
    if (context.userMood === 'frustrated') return 'user_frustrated';
    if (context.type === 'technical_explanation') return 'technical_discussion';
    if (context.type === 'greeting') return 'greeting';
    return 'problem_solving';
  }

  private applyContextMapping(mapping: any, emotionalRange: any): any {
    const adjustments: any = {};
    
    if (mapping.pace === 'slower') adjustments.rate = emotionalRange.rate * 0.9;
    if (mapping.pace === 'faster') adjustments.rate = emotionalRange.rate * 1.1;
    
    return adjustments;
  }

  private createBasicSSML(text: string): string {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">${text}</speak>`;
  }

  /**
   * Public method to get available personalities
   */
  getAvailablePersonalities(): string[] {
    return Array.from(this.personalities.keys());
  }

  /**
   * Public method to get personality info
   */
  getPersonality(stakeholderId: string): PersonalityConfig | undefined {
    return this.personalities.get(stakeholderId);
  }
}

export { PersonalityEngine, ConversationContext, EnhancementOptions };
export default new PersonalityEngine();