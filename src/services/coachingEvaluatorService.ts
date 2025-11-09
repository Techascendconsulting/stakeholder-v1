// Coaching Evaluator Service using secure backend API
// SECURITY: No OpenAI API key in frontend

interface EvaluationScores {
  intent_match: number;
  question_quality: number;
  professionalism: number;
  state_alignment: number;
}

interface EvaluationResult {
  scores: EvaluationScores;
  verdict: 'GOOD' | 'AMBER' | 'RED' | 'OOS' | 'MISALIGNED';
  reasons: string[];
  fixes: string[];
  suggested_rewrite: string;
}

interface EvaluationContext {
  state: string;
  suggested_question: string;
  state_goal: string;
  learner_message: string;
  context: {
    stakeholders: string[];
    recent_answers: string[];
    project: string;
  };
}

class CoachingEvaluatorService {
  private static instance: CoachingEvaluatorService;
  private aiCallCount = 0;
  private maxAiCallsPerSession = 20;
  private lastAiCallTime = 0;
  private minTimeBetweenAiCalls = 3000;

  static getInstance(): CoachingEvaluatorService {
    if (!CoachingEvaluatorService.instance) {
      CoachingEvaluatorService.instance = new CoachingEvaluatorService();
    }
    return CoachingEvaluatorService.instance;
  }

  private canUseAI(): boolean {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastAiCallTime;
    
    if (this.aiCallCount >= this.maxAiCallsPerSession) {
      console.warn(`⚠️ COACHING EVALUATOR: AI call limit reached (${this.maxAiCallsPerSession})`);
      return false;
    }
    
    if (timeSinceLastCall < this.minTimeBetweenAiCalls) {
      console.warn(`⚠️ COACHING EVALUATOR: Rate limit - wait ${Math.ceil((this.minTimeBetweenAiCalls - timeSinceLastCall) / 1000)}s`);
      return false;
    }
    
    return true;
  }

  async evaluateMessage(context: EvaluationContext): Promise<EvaluationResult> {
    console.log(`🔍 COACHING EVALUATOR: Starting evaluation for "${context.learner_message}"`);

    if (!this.canUseAI()) {
      return this.fallbackEvaluation(context);
    }

    try {
      this.aiCallCount++;
      this.lastAiCallTime = Date.now();

      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: context.learner_message,
          coachingType: 'questioning',
          context: `State: ${context.state}. Goal: ${context.state_goal}. Expected: ${context.suggested_question}. Project: ${context.context.project}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate message');
      }

      const data = await response.json();
      
      // Parse feedback and determine verdict
      return this.parseEvaluationFeedback(data.feedback, context);
    } catch (error) {
      console.error('❌ Error in coaching evaluation:', error);
      return this.fallbackEvaluation(context);
    }
  }

  private parseEvaluationFeedback(feedback: string, context: EvaluationContext): EvaluationResult {
    const lowerFeedback = feedback.toLowerCase();
    
    // Determine verdict
    let verdict: 'GOOD' | 'AMBER' | 'RED' | 'OOS' | 'MISALIGNED' = 'GOOD';
    
    if (lowerFeedback.includes('out of scope') || lowerFeedback.includes('off-topic')) {
      verdict = 'OOS';
    } else if (lowerFeedback.includes('not aligned') || lowerFeedback.includes('misaligned')) {
      verdict = 'MISALIGNED';
    } else if (lowerFeedback.includes('poor') || lowerFeedback.includes('unclear') || lowerFeedback.includes('inappropriate')) {
      verdict = 'RED';
    } else if (lowerFeedback.includes('could improve') || lowerFeedback.includes('consider')) {
      verdict = 'AMBER';
    }

    return {
      scores: {
        intent_match: verdict === 'GOOD' ? 90 : verdict === 'AMBER' ? 70 : 40,
        question_quality: verdict === 'GOOD' ? 85 : verdict === 'AMBER' ? 65 : 35,
        professionalism: verdict === 'OOS' ? 20 : 75,
        state_alignment: verdict === 'MISALIGNED' ? 30 : 80
      },
      verdict,
      reasons: [feedback],
      fixes: verdict !== 'GOOD' ? ['Consider using the suggested question format'] : [],
      suggested_rewrite: verdict !== 'GOOD' ? context.suggested_question : context.learner_message
    };
  }

  private fallbackEvaluation(context: EvaluationContext): EvaluationResult {
    const learnerLower = context.learner_message.toLowerCase();
    const suggestedLower = context.suggested_question.toLowerCase();

    // Simple keyword matching
    const hasKeywords = suggestedLower.split(' ').some(word => 
      word.length > 4 && learnerLower.includes(word)
    );

    return {
      scores: {
        intent_match: hasKeywords ? 70 : 50,
        question_quality: 65,
        professionalism: 70,
        state_alignment: hasKeywords ? 75 : 55
      },
      verdict: hasKeywords ? 'AMBER' : 'RED',
      reasons: ['AI evaluation unavailable - using basic validation'],
      fixes: hasKeywords ? [] : ['Try to align your question with the suggested format'],
      suggested_rewrite: context.suggested_question
    };
  }

  resetSession(): void {
    this.aiCallCount = 0;
    this.lastAiCallTime = 0;
  }
}

export const coachingEvaluatorService = CoachingEvaluatorService.getInstance();
