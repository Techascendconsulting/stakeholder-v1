import { ConversationContext } from './personalityEngine';

interface TextAnalysis {
  complexity: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  intent: 'question' | 'statement' | 'greeting' | 'complaint' | 'request';
  emotionalTone: 'excited' | 'frustrated' | 'confused' | 'neutral' | 'engaged';
}

interface ConversationHistory {
  userMessages: string[];
  assistantMessages: string[];
  messageCount: number;
  avgResponseTime?: number;
}

class ContextAnalyzer {
  private greetingPatterns = [
    /^(hi|hello|hey|good morning|morning|good afternoon|afternoon|good evening|evening)/i,
    /^(how are you|how's it going|what's up)/i
  ];

  private questionPatterns = [
    /\?$/,
    /^(what|how|why|when|where|who|which|can|could|would|should|do|does|did|is|are|will)/i
  ];

  private frustrationPatterns = [
    /(not working|broken|error|problem|issue|wrong|fail|can't|won't|doesn't)/i,
    /(frustrated|annoyed|stuck|confused|help)/i
  ];

  private technicalPatterns = [
    /(api|system|integration|database|server|code|technical|bug|feature)/i,
    /(configure|setup|install|deploy|update|sync)/i
  ];

  private excitementPatterns = [
    /(great|awesome|excellent|perfect|amazing|love|fantastic)/i,
    /!{2,}|[A-Z]{3,}/
  ];

  /**
   * Analyze text to determine conversation context
   */
  analyzeText(text: string): TextAnalysis {
    const lowerText = text.toLowerCase();
    
    return {
      complexity: this.calculateComplexity(text),
      sentiment: this.analyzeSentiment(text),
      topics: this.extractTopics(text),
      intent: this.classifyIntent(text),
      emotionalTone: this.detectEmotionalTone(text)
    };
  }

  /**
   * Generate conversation context for personality engine
   */
  generateConversationContext(
    currentMessage: string,
    history: ConversationHistory,
    stakeholderRole: string
  ): ConversationContext {
    const analysis = this.analyzeText(currentMessage);
    const isFirstMessage = history.messageCount === 0;
    
    return {
      type: this.determineResponseType(analysis, history),
      emotion: this.selectEmotion(analysis, stakeholderRole),
      userMood: this.assessUserMood(analysis, history),
      complexity: analysis.complexity,
      isFirstMessage,
      messageHistory: [...history.userMessages, ...history.assistantMessages].slice(-5) // Last 5 messages
    };
  }

  /**
   * Calculate text complexity (0-1 scale)
   */
  private calculateComplexity(text: string): number {
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const wordsPerSentence = words.length / Math.max(sentenceCount, 1);
    
    // Technical terms increase complexity
    const technicalTerms = this.technicalPatterns.test(text) ? 0.3 : 0;
    
    // Base complexity on word length, sentence structure, and technical content
    const baseComplexity = Math.min(
      ((avgWordLength - 3) / 7) + // Word length factor
      ((wordsPerSentence - 5) / 15) + // Sentence complexity factor
      technicalTerms, // Technical content factor
      1
    );
    
    return Math.max(0, baseComplexity);
  }

  /**
   * Analyze sentiment of the text
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = /(good|great|excellent|perfect|love|like|happy|pleased|satisfied|awesome|amazing)/i;
    const negativeWords = /(bad|terrible|awful|hate|dislike|angry|frustrated|disappointed|problem|issue|error)/i;
    
    const positiveCount = (text.match(positiveWords) || []).length;
    const negativeCount = (text.match(negativeWords) || []).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extract main topics from text
   */
  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    
    if (this.technicalPatterns.test(text)) topics.push('technical');
    if (/customer|user|client/i.test(text)) topics.push('customer');
    if (/design|ui|ux|interface/i.test(text)) topics.push('design');
    if (/marketing|campaign|brand/i.test(text)) topics.push('marketing');
    if (/process|workflow|efficiency/i.test(text)) topics.push('process');
    
    return topics;
  }

  /**
   * Classify user intent
   */
  private classifyIntent(text: string): TextAnalysis['intent'] {
    if (this.greetingPatterns.some(pattern => pattern.test(text))) {
      return 'greeting';
    }
    
    if (this.questionPatterns.some(pattern => pattern.test(text))) {
      return 'question';
    }
    
    if (this.frustrationPatterns.test(text)) {
      return 'complaint';
    }
    
    if (/(can you|could you|please|help me)/i.test(text)) {
      return 'request';
    }
    
    return 'statement';
  }

  /**
   * Detect emotional tone in text
   */
  private detectEmotionalTone(text: string): TextAnalysis['emotionalTone'] {
    if (this.excitementPatterns.test(text)) return 'excited';
    if (this.frustrationPatterns.test(text)) return 'frustrated';
    if (/(confused|not sure|don't understand|unclear)/i.test(text)) return 'confused';
    if (this.technicalPatterns.test(text) || this.questionPatterns.some(p => p.test(text))) return 'engaged';
    
    return 'neutral';
  }

  /**
   * Determine response type based on analysis
   */
  private determineResponseType(
    analysis: TextAnalysis, 
    history: ConversationHistory
  ): ConversationContext['type'] {
    if (analysis.intent === 'greeting' || history.messageCount === 0) {
      return 'greeting';
    }
    
    if (analysis.topics.includes('technical') || analysis.complexity > 0.7) {
      return 'technical_explanation';
    }
    
    if (analysis.intent === 'question') {
      return 'question_response';
    }
    
    if (analysis.intent === 'complaint' || analysis.emotionalTone === 'frustrated') {
      return 'acknowledgment';
    }
    
    return 'explanation';
  }

  /**
   * Select appropriate emotion based on analysis and role
   */
  private selectEmotion(
    analysis: TextAnalysis, 
    stakeholderRole: string
  ): ConversationContext['emotion'] {
    // Role-based emotional tendencies
    const roleEmotions: Record<string, ConversationContext['emotion'][]> = {
      'Customer Service Manager': ['friendly', 'empathetic', 'excited'],
      'Head of Customer Success': ['confident', 'empathetic', 'thoughtful'],
      'IT Systems Lead': ['thoughtful', 'confident', 'friendly'],
      'UX Designer': ['friendly', 'excited', 'thoughtful'],
      'Marketing Director': ['excited', 'confident', 'friendly']
    };
    
    const preferredEmotions = roleEmotions[stakeholderRole] || ['friendly', 'confident'];
    
    // Adjust based on user's emotional state
    if (analysis.emotionalTone === 'frustrated') {
      return 'empathetic';
    }
    
    if (analysis.emotionalTone === 'excited') {
      return preferredEmotions.includes('excited') ? 'excited' : 'friendly';
    }
    
    if (analysis.emotionalTone === 'confused') {
      return 'empathetic';
    }
    
    if (analysis.complexity > 0.7 || analysis.topics.includes('technical')) {
      return 'thoughtful';
    }
    
    // Default to role preference
    return preferredEmotions[0];
  }

  /**
   * Assess overall user mood based on recent interaction
   */
  private assessUserMood(
    analysis: TextAnalysis, 
    history: ConversationHistory
  ): ConversationContext['userMood'] {
    // Check recent messages for mood patterns
    const recentMessages = history.userMessages.slice(-3).join(' ');
    
    if (this.frustrationPatterns.test(recentMessages) || analysis.emotionalTone === 'frustrated') {
      return 'frustrated';
    }
    
    if (/(confused|don't understand|not clear|help)/i.test(recentMessages) || analysis.emotionalTone === 'confused') {
      return 'confused';
    }
    
    if (this.excitementPatterns.test(recentMessages) || analysis.emotionalTone === 'excited') {
      return 'engaged';
    }
    
    return 'neutral';
  }

  /**
   * Analyze conversation flow and suggest personality adjustments
   */
  analyzeConversationFlow(history: ConversationHistory): {
    paceAdjustment: 'faster' | 'slower' | 'normal';
    formalityLevel: 'more_formal' | 'less_formal' | 'maintain';
    engagementLevel: 'increase' | 'decrease' | 'maintain';
  } {
    const avgUserMessageLength = history.userMessages.reduce((sum, msg) => sum + msg.length, 0) / 
                                 Math.max(history.userMessages.length, 1);
    
    return {
      paceAdjustment: avgUserMessageLength > 100 ? 'slower' : 
                     avgUserMessageLength < 30 ? 'faster' : 'normal',
      formalityLevel: this.assessRequiredFormality(history),
      engagementLevel: this.assessEngagementNeeds(history)
    };
  }

  private assessRequiredFormality(history: ConversationHistory): 'more_formal' | 'less_formal' | 'maintain' {
    const recentText = history.userMessages.slice(-3).join(' ').toLowerCase();
    
    if (/(please|thank you|appreciate|professional)/i.test(recentText)) {
      return 'more_formal';
    }
    
    if (/(hey|cool|awesome|yeah)/i.test(recentText)) {
      return 'less_formal';
    }
    
    return 'maintain';
  }

  private assessEngagementNeeds(history: ConversationHistory): 'increase' | 'decrease' | 'maintain' {
    if (history.messageCount > 10) {
      return 'decrease'; // User might be getting tired
    }
    
    if (history.messageCount < 3) {
      return 'increase'; // Build rapport
    }
    
    return 'maintain';
  }
}

export default new ContextAnalyzer();