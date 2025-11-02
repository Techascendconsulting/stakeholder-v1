export interface CoachingTip {
  id: string;
  type: 'question' | 'technique' | 'warning' | 'suggestion';
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: 'communication' | 'analysis' | 'stakeholder' | 'process';
  timestamp: Date;
}

export interface ConversationAnalysis {
  questionQuality: number; // 0-100
  stakeholderEngagement: number; // 0-100
  processAdherence: number; // 0-100
  communicationStyle: 'directive' | 'collaborative' | 'investigative' | 'passive';
  areasForImprovement: string[];
  strengths: string[];
}

class CoachingService {
  private static instance: CoachingService;
  private coachingHistory: CoachingTip[] = [];

  public static getInstance(): CoachingService {
    if (!CoachingService.instance) {
      CoachingService.instance = new CoachingService();
    }
    return CoachingService.instance;
  }

  // Analyze user's message and provide coaching tips
  public analyzeUserMessage(userMessage: string, context: any): CoachingTip[] {
    const tips: CoachingTip[] = [];
    const lowerMessage = userMessage.toLowerCase();

    // Question Quality Analysis
    if (this.isClosedQuestion(lowerMessage)) {
      tips.push({
        id: `tip-${Date.now()}-1`,
        type: 'suggestion',
        message: 'Try asking open-ended questions to get more detailed responses. Instead of "Do you like the current process?", ask "What aspects of the current process work well for you?"',
        priority: 'medium',
        category: 'communication',
        timestamp: new Date()
      });
    }

    if (this.isLeadingQuestion(lowerMessage)) {
      tips.push({
        id: `tip-${Date.now()}-2`,
        type: 'warning',
        message: 'This question might be leading the stakeholder toward a specific answer. Try asking neutrally to get unbiased responses.',
        priority: 'high',
        category: 'communication',
        timestamp: new Date()
      });
    }

    // Stakeholder Engagement Analysis
    if (this.isGreetingOnly(lowerMessage)) {
      tips.push({
        id: `tip-${Date.now()}-3`,
        type: 'suggestion',
        message: 'Great to establish rapport! Now try asking a specific question about their role or current challenges.',
        priority: 'low',
        category: 'stakeholder',
        timestamp: new Date()
      });
    }

    // Process Adherence Analysis
    if (this.isJumpingToSolutions(lowerMessage)) {
      tips.push({
        id: `tip-${Date.now()}-4`,
        type: 'warning',
        message: 'You\'re jumping to solutions too quickly. Focus on understanding the problem first before suggesting solutions.',
        priority: 'high',
        category: 'process',
        timestamp: new Date()
      });
    }

    // Communication Style Analysis
    if (this.isTooDirective(lowerMessage)) {
      tips.push({
        id: `tip-${Date.now()}-5`,
        type: 'suggestion',
        message: 'Try a more collaborative approach. Ask "What do you think?" or "How do you see this working?"',
        priority: 'medium',
        category: 'communication',
        timestamp: new Date()
      });
    }

    return tips;
  }

  // Analyze stakeholder response for coaching opportunities
  public analyzeStakeholderResponse(stakeholderResponse: string, context: any): CoachingTip[] {
    const tips: CoachingTip[] = [];
    const lowerResponse = stakeholderResponse.toLowerCase();

    // Check if stakeholder is being vague
    if (this.isVagueResponse(lowerResponse)) {
      tips.push({
        id: `tip-${Date.now()}-6`,
        type: 'suggestion',
        message: 'The stakeholder is being vague. Try asking follow-up questions like "Can you give me a specific example?" or "What does that look like in practice?"',
        priority: 'medium',
        category: 'analysis',
        timestamp: new Date()
      });
    }

    // Check if stakeholder is resistant
    if (this.isResistantResponse(lowerResponse)) {
      tips.push({
        id: `tip-${Date.now()}-7`,
        type: 'technique',
        message: 'The stakeholder seems resistant. Try acknowledging their concerns first: "I understand your concern about..." then ask about their perspective.',
        priority: 'high',
        category: 'stakeholder',
        timestamp: new Date()
      });
    }

    // Check if stakeholder is overwhelmed
    if (this.isOverwhelmedResponse(lowerResponse)) {
      tips.push({
        id: `tip-${Date.now()}-8`,
        type: 'suggestion',
        message: 'The stakeholder seems overwhelmed. Try breaking down your questions into smaller, more manageable parts.',
        priority: 'medium',
        category: 'communication',
        timestamp: new Date()
      });
    }

    return tips;
  }

  // Generate overall conversation analysis
  public generateConversationAnalysis(conversation: any[]): ConversationAnalysis {
    let questionQuality = 70; // Default score
    let stakeholderEngagement = 75;
    let processAdherence = 80;
    let communicationStyle: 'directive' | 'collaborative' | 'investigative' | 'passive' = 'collaborative';
    const areasForImprovement: string[] = [];
    const strengths: string[] = [];

    // Analyze user messages
    const userMessages = conversation.filter(msg => msg.sender === 'user');
    
    if (userMessages.length > 0) {
      // Question quality analysis
      const openQuestions = userMessages.filter(msg => this.isOpenQuestion(msg.content.toLowerCase())).length;
      const closedQuestions = userMessages.filter(msg => this.isClosedQuestion(msg.content.toLowerCase())).length;
      
      if (openQuestions > closedQuestions) {
        questionQuality += 15;
        strengths.push('Good use of open-ended questions');
      } else {
        questionQuality -= 10;
        areasForImprovement.push('Use more open-ended questions');
      }

      // Communication style analysis
      const directiveCount = userMessages.filter(msg => this.isTooDirective(msg.content.toLowerCase())).length;
      const collaborativeCount = userMessages.filter(msg => this.isCollaborative(msg.content.toLowerCase())).length;
      
      if (collaborativeCount > directiveCount) {
        communicationStyle = 'collaborative';
        strengths.push('Collaborative communication style');
      } else if (directiveCount > collaborativeCount) {
        communicationStyle = 'directive';
        areasForImprovement.push('Consider more collaborative approach');
      }
    }

    // Analyze stakeholder responses
    const stakeholderMessages = conversation.filter(msg => msg.sender !== 'user');
    const engagedResponses = stakeholderMessages.filter(msg => !this.isVagueResponse(msg.content.toLowerCase())).length;
    
    if (engagedResponses > stakeholderMessages.length * 0.7) {
      stakeholderEngagement += 15;
      strengths.push('Good stakeholder engagement');
    } else {
      stakeholderEngagement -= 10;
      areasForImprovement.push('Improve stakeholder engagement');
    }

    return {
      questionQuality: Math.max(0, Math.min(100, questionQuality)),
      stakeholderEngagement: Math.max(0, Math.min(100, stakeholderEngagement)),
      processAdherence: Math.max(0, Math.min(100, processAdherence)),
      communicationStyle,
      areasForImprovement,
      strengths
    };
  }

  // Helper methods for analysis
  private isClosedQuestion(message: string): boolean {
    return /\b(do|does|did|is|are|was|were|can|could|will|would|should|have|has|had)\s+\w+\s+\?/.test(message);
  }

  private isOpenQuestion(message: string): boolean {
    return /\b(what|how|why|when|where|which|who|tell me about|describe|explain)\b/i.test(message);
  }

  private isLeadingQuestion(message: string): boolean {
    return /\b(don't you think|wouldn't you agree|isn't it true|obviously|clearly)\b/i.test(message);
  }

  private isGreetingOnly(message: string): boolean {
    return /^(hi|hello|hey|good morning|good afternoon|good evening)\s*$/i.test(message.trim());
  }

  private isJumpingToSolutions(message: string): boolean {
    return /\b(we should|let's|I suggest|I recommend|the solution is|we need to)\b/i.test(message);
  }

  private isTooDirective(message: string): boolean {
    return /\b(you must|you have to|you need to|you should|I want you to)\b/i.test(message);
  }

  private isCollaborative(message: string): boolean {
    return /\b(what do you think|how do you see|what's your perspective|can you help me understand)\b/i.test(message);
  }

  private isVagueResponse(message: string): boolean {
    return /\b(it depends|maybe|possibly|I'm not sure|I don't know|that's hard to say)\b/i.test(message);
  }

  private isResistantResponse(message: string): boolean {
    return /\b(we've always done it this way|this won't work|I don't see the point|this is a waste of time)\b/i.test(message);
  }

  private isOverwhelmedResponse(message: string): boolean {
    return /\b(I'm too busy|I don't have time|this is too much|I'm overwhelmed)\b/i.test(message);
  }

  // Get coaching history
  public getCoachingHistory(): CoachingTip[] {
    return this.coachingHistory;
  }

  // Clear coaching history
  public clearCoachingHistory(): void {
    this.coachingHistory = [];
  }
}

export default CoachingService;
