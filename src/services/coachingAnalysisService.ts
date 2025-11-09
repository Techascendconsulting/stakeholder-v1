// Coaching Analysis Service using secure backend API
// SECURITY: No OpenAI API key in frontend

interface CoachingAnalysisResult {
  feedback: string;
  feedbackType: 'positive' | 'constructive' | 'redirect';
  shouldProgress: boolean;
  confidence: number;
  source: 'hardcoded' | 'ai';
}

interface PhaseContext {
  phase: string;
  goal: string;
  suggestedQuestions: string[];
  conversationHistory: string[];
}

class CoachingAnalysisService {
  private static instance: CoachingAnalysisService;
  private aiCallCount = 0;
  private maxAiCallsPerSession = 10;
  private lastAiCallTime = 0;
  private minTimeBetweenAiCalls = 5000;

  static getInstance(): CoachingAnalysisService {
    if (!CoachingAnalysisService.instance) {
      CoachingAnalysisService.instance = new CoachingAnalysisService();
    }
    return CoachingAnalysisService.instance;
  }

  async analyzeUserQuestion(
    userMessage: string,
    phaseContext: PhaseContext
  ): Promise<CoachingAnalysisResult> {
    console.log(`🔍 COACHING ANALYSIS: Analyzing "${userMessage}" in ${phaseContext.phase} phase`);

    // Try hardcoded analysis first
    const hardcodedResult = this.analyzeWithHardcodedRules(userMessage, phaseContext);
    
    if (hardcodedResult.confidence >= 0.7) {
      return hardcodedResult;
    }

    // Try AI if available
    if (this.canUseAI()) {
      return await this.analyzeWithAI(userMessage, phaseContext);
    }

    return {
      ...hardcodedResult,
      feedback: hardcodedResult.feedback || "That's an interesting point. Consider using one of the suggested questions.",
      confidence: 0.3
    };
  }

  private analyzeWithHardcodedRules(userMessage: string, phaseContext: PhaseContext): CoachingAnalysisResult {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if question matches phase
    const phaseKeywords = this.getPhaseKeywords(phaseContext.phase);
    const hasKeywords = phaseKeywords.some(kw => lowerMessage.includes(kw));

    if (hasKeywords) {
      return {
        feedback: "Good question! That aligns well with this phase.",
        feedbackType: 'positive',
        shouldProgress: true,
        confidence: 0.8,
        source: 'hardcoded'
      };
    }

    return {
      feedback: "Consider focusing on the suggested questions for this phase.",
      feedbackType: 'constructive',
      shouldProgress: false,
      confidence: 0.5,
      source: 'hardcoded'
    };
  }

  private async analyzeWithAI(userMessage: string, phaseContext: PhaseContext): Promise<CoachingAnalysisResult> {
    try {
      this.aiCallCount++;
      this.lastAiCallTime = Date.now();

      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          coachingType: 'questioning',
          context: `Phase: ${phaseContext.phase}. Goal: ${phaseContext.goal}`
        })
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const data = await response.json();
      const feedback = data.feedback;
      
      return {
        feedback,
        feedbackType: feedback.toLowerCase().includes('good') ? 'positive' : 'constructive',
        shouldProgress: !feedback.toLowerCase().includes('reconsider'),
        confidence: 0.85,
        source: 'ai'
      };
    } catch (error) {
      console.error('❌ AI analysis error:', error);
      return this.analyzeWithHardcodedRules(userMessage, phaseContext);
    }
  }

  private getPhaseKeywords(phase: string): string[] {
    const keywordMap: Record<string, string[]> = {
      greeting: ['hello', 'hi', 'thank you', 'appreciate', 'meet'],
      problem: ['problem', 'challenge', 'issue', 'difficulty', 'pain'],
      impact: ['impact', 'affect', 'consequence', 'result', 'outcome'],
      solution: ['solution', 'resolve', 'fix', 'improve', 'better'],
      priority: ['priority', 'important', 'critical', 'urgent', 'first']
    };
    return keywordMap[phase.toLowerCase()] || [];
  }

  private canUseAI(): boolean {
    const now = Date.now();
    return this.aiCallCount < this.maxAiCallsPerSession && 
           (now - this.lastAiCallTime) >= this.minTimeBetweenAiCalls;
  }

  resetSession(): void {
    this.aiCallCount = 0;
    this.lastAiCallTime = 0;
  }
}

export const coachingAnalysisService = CoachingAnalysisService.getInstance();
