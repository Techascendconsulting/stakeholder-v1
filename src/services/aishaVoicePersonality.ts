import aishaTemplates from '../config/aisha-ssml-templates.json';

interface VoiceContext {
  intent: 'greeting' | 'acknowledgment' | 'explanation' | 'question' | 'empathy' | 'thinking' | 'closing' | 'clarification';
  emotionalTone: 'warm' | 'empathetic' | 'thoughtful' | 'reassuring' | 'concerned';
  complexity: 'simple' | 'moderate' | 'complex';
  userMood?: 'frustrated' | 'confused' | 'neutral' | 'engaged';
}

interface EnhancedText {
  content: string;
  ssml: string;
  template: string;
}

class AishaVoicePersonality {
  private templates = aishaTemplates.templates;
  private contextMapping = aishaTemplates.context_mapping;
  private enhancementRules = aishaTemplates.enhancement_rules;

  /**
   * Main method to enhance text with Aisha's personality
   */
  public enhanceWithPersonality(text: string, context: VoiceContext): EnhancedText {
    // Step 1: Analyze and enhance the text content
    const enhancedContent = this.enhanceTextContent(text, context);
    
    // Step 2: Select appropriate SSML template
    const templateKey = this.selectTemplate(context);
    const template = this.templates[templateKey];
    
    // Step 3: Apply context-specific enhancements
    const finalContent = this.applyContextEnhancements(enhancedContent, context);
    
    // Step 4: Generate SSML
    const ssml = this.generateSSML(finalContent, template, context);
    
    return {
      content: finalContent,
      ssml: ssml,
      template: templateKey
    };
  }

  /**
   * Enhance text content with Aisha's personality patterns
   */
  private enhanceTextContent(text: string, context: VoiceContext): string {
    let enhanced = text;

    // Add natural openings based on context
    enhanced = this.addNaturalOpenings(enhanced, context);
    
    // Add empathetic acknowledgments
    enhanced = this.addEmpathticElements(enhanced, context);
    
    // Add thinking patterns
    enhanced = this.addThinkingPatterns(enhanced, context);
    
    // Add proactive suggestions (ElevenLabs style)
    enhanced = this.addProactiveSuggestions(enhanced, context);
    
    // Add connection to previous points
    enhanced = this.addConnectionToPrevious(enhanced, context);
    
    // Add warm closings
    enhanced = this.addWarmClosings(enhanced, context);
    
    return enhanced;
  }

  /**
   * Add natural, ElevenLabs Alexis-like openings
   */
  private addNaturalOpenings(text: string, context: VoiceContext): string {
    const openings = {
      greeting: ["Hi there", "Hello", "Good morning", "Hey"],
      acknowledgment: ["That's a great observation", "You're absolutely right to flag that", "I hear what you're saying", "Got it", "Sure thing", "Alright"],
      explanation: ["Let me break that down for you", "Here's how I see it", "From my experience", "So here's the thing", "Actually", "You know what"],
      question: ["Before I dive in—would you prefer a simple walkthrough, or are you already familiar with how this works?", "Can I double-check—are you asking about", "Help me understand", "Just to clarify"],
      empathy: ["Trust me, I completely get why that would be frustrating", "That sounds challenging", "I appreciate you bringing this up", "I can see why that would be concerning"],
      thinking: ["Let me think through this with you", "Here's what I'm processing", "From my perspective", "Actually, you know what", "So"],
      clarification: ["Just so we're aligned", "Let me confirm what I'm hearing", "To make sure we're on the same page", "Can I double-check"]
    };

    const contextOpenings = openings[context.intent] || openings.explanation;
    
    // 70% chance to add an opening (high for natural conversation)
    if (Math.random() < 0.7) {
      const opening = contextOpenings[Math.floor(Math.random() * contextOpenings.length)];
      
      // Don't add if text already starts with similar pattern
      if (!this.startsWithSimilarPattern(text, opening)) {
        return `${opening}. ${text}`;
      }
    }
    
    return text;
  }

  /**
   * Add empathetic elements based on user mood
   */
  private addEmpathticElements(text: string, context: VoiceContext): string {
    if (context.userMood === 'frustrated' || context.userMood === 'confused') {
      const empathyPhrases = [
        "Trust me, we feel the same way when customers disappear during setup",
        "I completely get why that would be concerning",
        "That does sound frustrating",
        "I hear the challenge you're facing",
        "Your concerns are completely valid",
        "I can see why that would matter"
      ];
      
      if (Math.random() < 0.8) { // High chance for empathy when needed
        const phrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
        return `${phrase}... ${text}`;
      }
    }
    
    return text;
  }

  /**
   * Add natural thinking patterns
   */
  private addThinkingPatterns(text: string, context: VoiceContext): string {
    if (context.complexity === 'complex' || context.intent === 'thinking') {
      const thinkingPhrases = [
        "Let me work through this",
        "Here's what I'm thinking",
        "From what I'm seeing",
        "The way I look at it"
      ];
      
      if (Math.random() < 0.6) {
        const phrase = thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)];
        return `${phrase} - ${text}`;
      }
    }
    
    return text;
  }

  /**
   * Add proactive suggestions based on ElevenLabs Alexis style
   */
  private addProactiveSuggestions(text: string, context: VoiceContext): string {
    if (context.intent === 'explanation' && Math.random() < 0.4) {
      const suggestions = [
        "A lot of teams forget to align their handoff process after sales—that's usually where the cracks begin",
        "What I've seen work well is setting up clear checkpoints during the process",
        "One thing to watch out for is when customers go quiet during setup—that's often a red flag",
        "From experience, the teams that succeed usually have someone dedicated to following up",
        "Here's something most people miss—the communication gaps between departments"
      ];
      
      const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      return `${text} ${suggestion}.`;
    }
    
    return text;
  }

  /**
   * Add connections to previous conversation points
   */
  private addConnectionToPrevious(text: string, context: VoiceContext): string {
    if (Math.random() < 0.3) {
      const connections = [
        "You mentioned earlier that visibility was a concern—that ties in closely with what we're seeing here",
        "This connects back to what you were saying about",
        "Going back to your point about",
        "This is exactly what you were getting at when you mentioned"
      ];
      
      const connection = connections[Math.floor(Math.random() * connections.length)];
      return `${connection}... ${text}`;
    }
    
    return text;
  }

  /**
   * Add warm, checking closings
   */
  private addWarmClosings(text: string, context: VoiceContext): string {
    const closings = [
      "Does that make sense?",
      "Would you like me to walk through an example?",
      "Does that help clarify things?",
      "How does that sound to you?",
      "What are your thoughts on that approach?",
      "Does that resonate with what you're experiencing?",
      "What questions do you have about that?",
      "Should I go deeper on any of that?"
    ];
    
    // Add closings for explanations and confirmations
    if ((context.intent === 'explanation' || context.intent === 'acknowledgment') && Math.random() < 0.6) {
      const closing = closings[Math.floor(Math.random() * closings.length)];
      return `${text} ${closing}`;
    }
    
    return text;
  }

  /**
   * Apply context-specific enhancements
   */
  private applyContextEnhancements(text: string, context: VoiceContext): string {
    let enhanced = text;

    // Add natural fillers for realism
    enhanced = this.addNaturalFillers(enhanced, context);
    
    // Add breathing pauses in longer texts
    enhanced = this.addBreathingPauses(enhanced, context);
    
    return enhanced;
  }

  /**
   * Add natural fillers like "well", "you know", "I mean" - ElevenLabs style
   */
  private addNaturalFillers(text: string, context: VoiceContext): string {
    const fillers = ["well", "you know", "I mean", "so", "actually", "honestly", "uhm", "like"];
    const confirmations = ["got it", "sure thing", "alright", "yes", "right"];
    
    // Higher chance for thinking and complex contexts
    const fillerChance = context.intent === 'thinking' ? 0.9 : 0.6;
    
    if (Math.random() < fillerChance && text.length > 20) {
      const allFillers = [...fillers, ...confirmations];
      const filler = allFillers[Math.floor(Math.random() * allFillers.length)];
      const words = text.split(' ');
      
      // Insert filler after first few words
      if (words.length > 3) {
        // Sometimes add subtle disfluency
        if (Math.random() < 0.2) {
          words.splice(2, 0, `${filler}... actually,`);
        } else {
          words.splice(2, 0, `${filler},`);
        }
        return words.join(' ');
      }
    }
    
    return text;
  }

  /**
   * Add natural breathing pauses
   */
  private addBreathingPauses(text: string, context: VoiceContext): string {
    // For longer texts, add natural breath markers
    if (text.length > 100) {
      const sentences = text.split('. ');
      if (sentences.length > 2) {
        // Add breath after first sentence
        sentences[1] = `${sentences[0]}. [breath] ${sentences.slice(1).join('. ')}`;
        return sentences[1];
      }
    }
    
    return text;
  }

  /**
   * Select appropriate SSML template based on context
   */
  private selectTemplate(context: VoiceContext): string {
    // Special cases first
    if (context.userMood === 'frustrated' || context.userMood === 'confused') {
      return 'empathetic_response';
    }
    
    if (context.intent === 'clarification') {
      return 'clarifying_question';
    }
    
    // Use context mapping
    return this.contextMapping[context.intent] || this.contextMapping.default;
  }

  /**
   * Generate final SSML with template and enhancements
   */
  private generateSSML(content: string, template: any, context: VoiceContext): string {
    let ssml = template.ssml || template.fallback_ssml;
    
    // Replace content placeholder
    ssml = ssml.replace('{{content}}', content);
    
    // Apply enhancement rules
    ssml = this.applySSMLEnhancements(ssml, context);
    
    // Replace breath markers with actual SSML breaks
    ssml = ssml.replace(/\[breath\]/g, '<break time="250ms"/>');
    
    // Handle ellipses for distinct, audible pauses (ElevenLabs style)
    ssml = ssml.replace(/\.\.\./g, '<break time="400ms"/>');
    
    // Handle em dashes for thoughtful pauses
    ssml = ssml.replace(/—/g, '<break time="300ms"/>');
    
    // Clean up and validate SSML
    ssml = this.cleanupSSML(ssml);
    
    return ssml;
  }

  /**
   * Clean up and validate SSML for Azure TTS compatibility
   */
  private cleanupSSML(ssml: string): string {
    let cleaned = ssml;
    
    // Remove consecutive breaks (invalid SSML)
    cleaned = cleaned.replace(/(<break[^>]*\/>)\s*(<break[^>]*\/>)/g, '$2');
    
    // Ensure prosody rate values are within valid range (0.5 to 2.0)
    cleaned = cleaned.replace(/rate="([^"]*)"/, (match, rate) => {
      const numRate = parseFloat(rate);
      if (isNaN(numRate) || numRate < 0.5) return 'rate="0.5"';
      if (numRate > 2.0) return 'rate="2.0"';
      return match;
    });
    
    // Ensure pitch values are valid (Azure TTS accepts -50% to +50%)
    cleaned = cleaned.replace(/pitch="([^"]*)"/, (match, pitch) => {
      if (pitch.includes('%')) {
        const numPitch = parseFloat(pitch.replace('%', ''));
        if (isNaN(numPitch)) return 'pitch="+0%"';
        if (numPitch < -50) return 'pitch="-50%"';
        if (numPitch > 50) return 'pitch="+50%"';
      }
      return match;
    });
    
    // Remove any double spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    return cleaned;
  }

  /**
   * Apply SSML enhancements based on rules
   */
  private applySSMLEnhancements(ssml: string, context: VoiceContext): string {
    let enhanced = ssml;
    
    // Add breath before important points
    if (this.enhancementRules.add_breath_before_important && context.intent === 'explanation') {
      enhanced = enhanced.replace('<break time="400ms"/>', '<break time="600ms"/>');
    }
    
    // Slow down for complex content
    if (this.enhancementRules.slow_down_for_complex && context.complexity === 'complex') {
      enhanced = enhanced.replace(/rate="([^"]*)"/, (match, rate) => {
        const numRate = parseFloat(rate);
        return `rate="${(numRate * 0.9).toFixed(2)}"`;
      });
    }
    
    // Add empathy for frustration
    if (this.enhancementRules.add_empathy_for_frustration && context.userMood === 'frustrated') {
      enhanced = enhanced.replace(/volume="([^"]*)"/, 'volume="soft"');
      enhanced = enhanced.replace(/pitch="([^"]*)"/, 'pitch="-1%"');
    }
    
    return enhanced;
  }

  /**
   * Helper method to check if text starts with similar pattern
   */
  private startsWithSimilarPattern(text: string, pattern: string): boolean {
    const textStart = text.toLowerCase().substring(0, 20);
    const patternWords = pattern.toLowerCase().split(' ');
    
    return patternWords.some(word => textStart.includes(word));
  }

  /**
   * Analyze text to determine context automatically
   */
  public analyzeContext(text: string, conversationHistory?: string[]): VoiceContext {
    const lowerText = text.toLowerCase();
    
    // Determine intent
    let intent: VoiceContext['intent'] = 'explanation';
    
    if (lowerText.includes('hello') || lowerText.includes('hi ') || lowerText.includes('good morning')) {
      intent = 'greeting';
    } else if (lowerText.includes('?')) {
      intent = 'question';
    } else if (lowerText.includes('understand') || lowerText.includes('got it') || lowerText.includes('right')) {
      intent = 'acknowledgment';
    } else if (lowerText.includes('think') || lowerText.includes('consider') || lowerText.includes('process')) {
      intent = 'thinking';
    } else if (lowerText.includes('clarify') || lowerText.includes('explain') || lowerText.includes('mean')) {
      intent = 'clarification';
    }
    
    // Determine emotional tone
    let emotionalTone: VoiceContext['emotionalTone'] = 'warm';
    
    if (lowerText.includes('concern') || lowerText.includes('worry') || lowerText.includes('problem')) {
      emotionalTone = 'concerned';
    } else if (lowerText.includes('understand') || lowerText.includes('feel')) {
      emotionalTone = 'empathetic';
    } else if (lowerText.includes('think') || lowerText.includes('consider')) {
      emotionalTone = 'thoughtful';
    } else if (lowerText.includes('help') || lowerText.includes('support')) {
      emotionalTone = 'reassuring';
    }
    
    // Determine complexity
    const complexity: VoiceContext['complexity'] = 
      text.length > 150 ? 'complex' : 
      text.length > 50 ? 'moderate' : 'simple';
    
    // Determine user mood from conversation history
    let userMood: VoiceContext['userMood'] = 'neutral';
    
    if (conversationHistory && conversationHistory.length > 0) {
      const recentText = conversationHistory.slice(-2).join(' ').toLowerCase();
      if (recentText.includes('frustrat') || recentText.includes('annoying') || recentText.includes('problem')) {
        userMood = 'frustrated';
      } else if (recentText.includes('confus') || recentText.includes('understand') || recentText.includes('?')) {
        userMood = 'confused';
      } else if (recentText.includes('great') || recentText.includes('good') || recentText.includes('thanks')) {
        userMood = 'engaged';
      }
    }
    
    return {
      intent,
      emotionalTone,
      complexity,
      userMood
    };
  }
}

export default new AishaVoicePersonality();