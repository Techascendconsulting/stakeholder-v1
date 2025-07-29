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
    console.log(`📝 Enhanced text: "${text}" -> "${enhancedText}"`);
    
    // Step 2: Apply emotional context
    const emotionalSettings = this.calculateEmotionalSettings(personality, context);
    console.log(`🎯 Emotional settings:`, emotionalSettings);
    
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
    
    // Always add fillers for personality demonstration - ElevenLabs style
    if (Math.random() < Math.max(probability, 0.95)) { // Very high minimum probability like ElevenLabs
      const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
      
      // Add filler at the beginning with natural capitalization
      const capitalizedFiller = randomFiller.charAt(0).toUpperCase() + randomFiller.slice(1);
      
      // Also sometimes add mid-sentence fillers for more personality - ElevenLabs style
      if (text.length > 20 && Math.random() < 0.7) { // Increased chance and lower threshold
        const sentences = text.split('. ');
        if (sentences.length > 1) {
          const midFiller = fillers[Math.floor(Math.random() * fillers.length)];
          sentences.splice(1, 0, `${midFiller}`);
          return `${capitalizedFiller}, ${sentences.join('. ').charAt(0).toLowerCase() + sentences.join('. ').slice(1)}`;
        }
      }
      
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
    // Check for James Walker specific templates
    let template = this.ssmlTemplates[context.type] || this.ssmlTemplates.explanation;
    
    if (personality.id === 'james_walker') {
      template = this.getJamesWalkerTemplate(text, context) || template;
    }
    
    // Build SSML with voice and style
    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">`;
    ssml += `<voice name="${personality.voice}">`;
    
    // Add expression style if available - adjust for James's context
    let styleIntensity = "0.8";
    if (personality.id === 'james_walker') {
      styleIntensity = this.getJamesStyleIntensity(context, emotionalSettings);
    }
    
    if (personality.baseStyle) {
      ssml += `<mstts:express-as style="${personality.baseStyle}" styledegree="${styleIntensity}">`;
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
   * Get appropriate James Walker template based on content analysis
   */
  private getJamesWalkerTemplate(text: string, context: ConversationContext): any {
    const jamesTemplates = (this.personalitiesConfig as any).james_walker_ssml_templates;
    if (!jamesTemplates) return null;
    
    // Analyze text content to determine best template
    const lowerText = text.toLowerCase();
    
    // Check for customer insights
    if (lowerText.includes('customer') || lowerText.includes('experience') || lowerText.includes('satisfaction')) {
      return jamesTemplates.customer_insight;
    }
    
    // Check for experience sharing
    if (lowerText.includes('experience') || lowerText.includes('we\'ve found') || lowerText.includes('years')) {
      return jamesTemplates.experience_sharing;
    }
    
    // Check for empathetic responses
    if (lowerText.includes('understand') || lowerText.includes('hear you') || lowerText.includes('appreciate')) {
      return jamesTemplates.empathetic_response;
    }
    
    // Check for data presentation
    if (/\d+/.test(text) || lowerText.includes('data') || lowerText.includes('metrics') || lowerText.includes('numbers')) {
      return jamesTemplates.data_presentation;
    }
    
    // Check for solution proposals
    if (lowerText.includes('solution') || lowerText.includes('approach') || lowerText.includes('strategy') || lowerText.includes('plan')) {
      return jamesTemplates.solution_proposal;
    }
    
    // Check for relationship building
    if (lowerText.includes('partnership') || lowerText.includes('together') || lowerText.includes('collaborate')) {
      return jamesTemplates.relationship_building;
    }
    
    // Check for passionate advocacy
    if (lowerText.includes('passionate') || lowerText.includes('believe') || lowerText.includes('committed') || context.emotion === 'excited') {
      return jamesTemplates.passionate_advocacy;
    }
    
    return null;
  }

  /**
   * Get appropriate style intensity for James Walker based on context
   */
  private getJamesStyleIntensity(context: ConversationContext, emotionalSettings: any): string {
    // Higher intensity for confident or passionate moments
    if (context.emotion === 'confident' || context.emotion === 'excited') {
      return "1.0";
    }
    
    // Lower intensity for empathetic or thoughtful moments
    if (context.emotion === 'empathetic' || context.emotion === 'thoughtful') {
      return "0.6";
    }
    
    // Medium intensity for analytical content
    if (context.type === 'technical_explanation' || context.complexity > 0.7) {
      return "0.7";
    }
    
    return "0.8"; // Default
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
    
    // James Walker specific enhancements
    if (personality.id === 'james_walker') {
      processed = this.applyJamesWalkerSSMLEnhancements(processed, personality, context);
    }
    
    // Always add a natural thinking pause at the beginning - ElevenLabs style
    const initialPause = `<break time="${pausePatterns.medium}ms"/>`;
    processed = `${initialPause}${processed}`;
    
    // Add longer thinking pause for complex responses - more human-like
    if (context.complexity > 0.6 || context.type === 'technical_explanation') {
      const thinkingPause = `<break time="${pausePatterns.long}ms"/>`;
      processed = `${thinkingPause}${processed}`;
    }
    
    // Add breathing-like pauses randomly throughout - ElevenLabs natural feel
    if (text.length > 50 && Math.random() < 0.6) {
      const words = processed.split(' ');
      const breathPosition = Math.floor(words.length * 0.4); // Around 40% through
      if (breathPosition > 0 && breathPosition < words.length - 1) {
        words.splice(breathPosition, 0, `<break time="${pausePatterns.short}ms"/>`);
        processed = words.join(' ');
      }
    }
    
    // Add greeting pause
    if (context.type === 'greeting') {
      const greetingPause = `<break time="${pausePatterns.afterGreeting}ms"/>`;
      processed = processed.replace(/!/g, `!${greetingPause}`);
    }
    
    // Add natural pauses at sentence boundaries (more aggressive)
    processed = processed.replace(/\. /g, `.<break time="${pausePatterns.medium}ms"/> `);
    processed = processed.replace(/\? /g, `?<break time="${pausePatterns.medium}ms"/> `);
    processed = processed.replace(/\, /g, `,<break time="${pausePatterns.short}ms"/> `);
    
    // Add pauses before important words
    processed = processed.replace(/\b(however|but|and|also|actually|specifically|basically)\b/gi, 
      `<break time="${pausePatterns.short}ms"/>$1`);
    
    return processed;
  }

  /**
   * Add emphasis to personality-specific keywords
   */
  private addEmphasis(text: string, personality: PersonalityConfig): string {
    const { emphasis_words } = personality.characteristics;
    let processed = text;
    
    // James Walker specific emphasis handling
    if (personality.id === 'james_walker') {
      processed = this.applyJamesWalkerEmphasis(processed, personality);
    } else {
      emphasis_words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        processed = processed.replace(regex, `<emphasis level="moderate">${word}</emphasis>`);
      });
    }
    
    return processed;
  }

  /**
   * Apply James Walker specific SSML enhancements
   */
  private applyJamesWalkerSSMLEnhancements(text: string, personality: PersonalityConfig, context: ConversationContext): string {
    let processed = text;
    const ssmlEnhancements = personality.characteristics.ssml_enhancements;
    
    if (!ssmlEnhancements) return processed;
    
    // Apply breath patterns based on content type
    if (text.includes('customer') || text.includes('experience')) {
      processed = processed.replace(/\b(customer|experience)\b/gi, 
        `${ssmlEnhancements.breath_patterns.before_key_points}$1`);
    }
    
    // Add thoughtful pauses before sharing insights
    if (text.match(/\b(I think|my perspective|what we've found|the reality is)\b/gi)) {
      processed = processed.replace(/\b(I think|my perspective|what we've found|the reality is)\b/gi, 
        `${ssmlEnhancements.breath_patterns.thoughtful_pause}$1`);
    }
    
    // Add confidence pauses before strong statements
    if (text.match(/\b(absolutely|exactly|precisely|indeed)\b/gi)) {
      processed = processed.replace(/\b(absolutely|exactly|precisely|indeed)\b/gi, 
        `${ssmlEnhancements.breath_patterns.confidence_pause}$1`);
    }
    
    // Add pauses after presenting statistics or numbers
    const numberPattern = /\b\d+(\.\d+)?%?\b/g;
    processed = processed.replace(numberPattern, 
      `$&${ssmlEnhancements.breath_patterns.after_statistics}`);
    
    return processed;
  }

  /**
   * Apply James Walker specific emphasis patterns
   */
  private applyJamesWalkerEmphasis(text: string, personality: PersonalityConfig): string {
    let processed = text;
    const { emphasis_words, ssml_enhancements } = personality.characteristics;
    
    if (!ssml_enhancements) return processed;
    
    // Strong emphasis for customer-related words
    const customerWords = ['customer', 'experience', 'success', 'satisfaction', 'value', 'relationship', 'trust', 'loyalty'];
    customerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processed = processed.replace(regex, `<emphasis level="${ssml_enhancements.emphasis_levels.customer_words}">${word}</emphasis>`);
    });
    
    // Moderate emphasis for statistics and numbers
    const numberPattern = /\b\d+(\.\d+)?%?\b/g;
    processed = processed.replace(numberPattern, 
      `<emphasis level="${ssml_enhancements.emphasis_levels.numbers_stats}">$&</emphasis>`);
    
    // Moderate emphasis for solution-oriented words
    const solutionWords = ['solution', 'approach', 'strategy', 'plan', 'results', 'impact', 'growth', 'improvement'];
    solutionWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processed = processed.replace(regex, `<emphasis level="${ssml_enhancements.emphasis_levels.solutions}">${word}</emphasis>`);
    });
    
    // Reduced emphasis for experience references to sound more natural
    const experienceWords = ['experience', 'years', 'background', 'expertise'];
    experienceWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processed = processed.replace(regex, `<emphasis level="${ssml_enhancements.emphasis_levels.experience_references}">${word}</emphasis>`);
    });
    
    return processed;
  }

  // Helper methods
  private shouldAddTransition(context: ConversationContext): boolean {
    // ElevenLabs-style aggressive transition adding for natural conversation
    return context.type === 'explanation' || 
           context.type === 'technical_explanation' || 
           context.type === 'question_response' ||
           Math.random() < 0.7; // 70% chance to add transitions - much more natural
  }

  private shouldAddAcknowledgment(context: ConversationContext): boolean {
    // ElevenLabs-style natural acknowledgment - very human-like
    return context.type === 'acknowledgment' || 
           (context.userMood === 'confused' || context.userMood === 'frustrated') ||
           (!context.isFirstMessage && Math.random() < 0.8); // 80% chance for non-first messages - very natural
  }

  private getFillerProbability(context: ConversationContext): number {
    // ElevenLabs-style high probabilities for natural conversation
    if (context.type === 'greeting') return 0.95;
    if (context.complexity > 0.7) return 0.98;
    if (context.type === 'question_response') return 0.9;
    return 0.85; // Very high base probability like ElevenLabs
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