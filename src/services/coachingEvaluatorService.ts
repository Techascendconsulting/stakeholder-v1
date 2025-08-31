import OpenAI from 'openai';

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
  private openai: OpenAI;
  private aiCallCount = 0;
  private maxAiCallsPerSession = 20; // Increased for more detailed evaluation
  private lastAiCallTime = 0;
  private minTimeBetweenAiCalls = 3000; // 3 seconds between calls

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  static getInstance(): CoachingEvaluatorService {
    if (!CoachingEvaluatorService.instance) {
      CoachingEvaluatorService.instance = new CoachingEvaluatorService();
    }
    return CoachingEvaluatorService.instance;
  }

  async evaluateMessage(context: EvaluationContext): Promise<EvaluationResult> {
    console.log(`🔍 COACHING EVALUATOR: Starting evaluation for "${context.learner_message}" in ${context.state} phase`);
    console.log(`🔍 COACHING EVALUATOR: Context details:`, {
      state: context.state,
      suggested_question: context.suggested_question.substring(0, 50) + '...',
      state_goal: context.state_goal,
      stakeholders: context.context.stakeholders,
      project: context.context.project
    });

    if (!this.canUseAI()) {
      console.log(`⚠️ COACHING EVALUATOR: AI not available, using fallback evaluation`);
      const fallbackResult = this.fallbackEvaluation(context);
      console.log(`🔄 COACHING EVALUATOR: Fallback result:`, {
        verdict: fallbackResult.verdict,
        reasons: fallbackResult.reasons,
        fixes: fallbackResult.fixes
      });
      return fallbackResult;
    }

    try {
      this.aiCallCount++;
      this.lastAiCallTime = Date.now();
      console.log(`🤖 COACHING EVALUATOR: Making AI call #${this.aiCallCount}`);

      const systemPrompt = `You are a Business Analyst coaching evaluator. 
Your job is to evaluate the learner's latest message against the expected coaching question for the current stage.

Rules:
- Do NOT require exact wording. Accept paraphrases and semantic equivalents.
- Always return JSON only.

Evaluation Flow:
Step 1: Check if learner's message is nonsense or out-of-scope (sports, weather, politics, entertainment, personal chit-chat).
    - If yes → verdict = "OOS" (Out of Scope)
    - reasons[] = "Message unrelated to BA discussion"
    - fixes[] = "Stay focused on Business Analysis and the current stage"
    - suggested_rewrite = expected_question

Step 2: For warm-up stage, check if it's a casual greeting (hi, hey, hello, etc.).
    - If yes → verdict = "AMBER"
    - reasons[] = "This is a casual greeting that could be more professional"
    - fixes[] = "Use a formal greeting with purpose statement"
    - suggested_rewrite = formal greeting with purpose

Step 3: Check if learner's message is BA-related but not aligned to this stage (e.g., general BA theory while stage is Problem Exploration).
    - If yes → verdict = "MISALIGNED"
    - reasons[] = "Valid BA question, but not aligned to the current stage"
    - fixes[] = "Redirect focus to stakeholder problem exploration"
    - suggested_rewrite = expected_question

Step 3: If learner's message is BA-related and aligned, score it (0–5 scale):
    1. intent_match → is it semantically the same type of question? (accept paraphrases and variations)
    2. quality → is it open-ended, non-leading, one clear ask?
    3. professionalism → is it polite, professional, contextual?
    4. state_alignment → does it fit this stage's goal (Problem Exploration = uncovering pain points)?
- Verdicts:
    - "GOOD" if all 4 ≥ 4
    - "AMBER" if intent ≥ 3 but any other < 4
    - "RED" if intent ≤ 2 (treat as "AMBER" in verdict for UI)

Always return:
- scores{} (0–5, empty if OOS or MISALIGNED)
- verdict (GOOD, AMBER, OOS, MISALIGNED)
- reasons[]
- fixes[]
- suggested_rewrite (clearer phrasing of expected question)`;

      const userPrompt = JSON.stringify({
        stage: context.state,
        expected_question: context.suggested_question,
        state_goal: context.state_goal,
        learner_message: context.learner_message,
        context: {
          stakeholder: context.context.stakeholders[0] || 'stakeholder',
          project: context.context.project || 'unknown'
        }
      });

      console.log(`📤 COACHING EVALUATOR: Sending to OpenAI:`, {
        model: 'gpt-3.5-turbo',
        max_tokens: 300,
        temperature: 0.1,
        userPromptLength: userPrompt.length
      });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.1
      });

      const aiResponse = response.choices[0]?.message?.content?.trim();
      console.log(`📥 COACHING EVALUATOR: Raw AI response:`, aiResponse);
      
      if (!aiResponse) {
        throw new Error('Empty AI response');
      }

      const evaluation = JSON.parse(aiResponse);
      console.log(`🤖 COACHING EVALUATOR: Parsed evaluation:`, {
        verdict: evaluation.verdict,
        scores: evaluation.scores,
        reasonsCount: evaluation.reasons?.length || 0,
        fixesCount: evaluation.fixes?.length || 0,
        hasRewrite: !!evaluation.suggested_rewrite
      });

      return evaluation;

    } catch (error) {
      console.error('❌ COACHING EVALUATOR: AI evaluation failed:', error);
      console.log(`🔄 COACHING EVALUATOR: Falling back to hardcoded evaluation`);
      const fallbackResult = this.fallbackEvaluation(context);
      console.log(`🔄 COACHING EVALUATOR: Fallback result:`, {
        verdict: fallbackResult.verdict,
        reasons: fallbackResult.reasons,
        fixes: fallbackResult.fixes
      });
      return fallbackResult;
    }
  }

  private fallbackEvaluation(context: EvaluationContext): EvaluationResult {
    const message = context.learner_message.toLowerCase();
    
    // Check for out-of-scope content
    const outOfScopeKeywords = [
      'football', 'soccer', 'basketball', 'sports', 'game', 'team', 'score',
      'weather', 'rain', 'sunny', 'temperature', 'forecast',
      'politics', 'election', 'vote', 'president', 'government',
      'movie', 'film', 'music', 'song', 'entertainment', 'tv', 'show',
      'food', 'restaurant', 'cooking', 'recipe',
      'personal', 'family', 'friend', 'hobby', 'vacation', 'weekend'
    ];
    
    const isOutOfScope = outOfScopeKeywords.some(keyword => message.includes(keyword));
    if (isOutOfScope) {
      return {
        scores: {
          intent_match: 0,
          question_quality: 0,
          professionalism: 0,
          state_alignment: 0
        },
        verdict: 'OOS',
        reasons: ['Message unrelated to BA discussion'],
        fixes: ['Stay focused on Business Analysis and the current stage'],
        suggested_rewrite: context.suggested_question
      };
    }
    
    // Check for BA-related but misaligned questions
    const baTheoryKeywords = [
      'what is a ba', 'who is a ba', 'business analyst', 'ba role', 'ba definition',
      'requirements', 'stakeholder', 'process', 'methodology', 'framework',
      'agile', 'waterfall', 'scrum', 'kanban', 'jira', 'confluence'
    ];
    
    const isBaTheory = baTheoryKeywords.some(keyword => message.includes(keyword));
    if (isBaTheory && context.state === 'problem_exploration') {
      return {
        scores: {
          intent_match: 0,
          question_quality: 0,
          professionalism: 0,
          state_alignment: 0
        },
        verdict: 'MISALIGNED',
        reasons: ['Valid BA question, but not aligned to the current stage'],
        fixes: ['Redirect focus to stakeholder problem exploration'],
        suggested_rewrite: context.suggested_question
      };
    }
    
    // Check for casual greetings (for warm-up stage)
    if (context.state === 'warm_up') {
      const casualGreetings = ['hi', 'hey', 'hello', 'yo', 'what\'s up'];
      const isCasualGreeting = casualGreetings.some(greeting => message.includes(greeting));
      
      if (isCasualGreeting) {
        return {
          scores: {
            intent_match: 2,
            question_quality: 1,
            professionalism: 2,
            state_alignment: 3
          },
          verdict: 'AMBER',
          reasons: ['This is a casual greeting that could be more professional'],
          fixes: ['Use a formal greeting with purpose statement'],
          suggested_rewrite: `Hello ${context.context.stakeholders[0]?.split(' ')[0] || 'there'}, thanks for taking the time to meet today. I'm the business analyst on this project, and I'd like to understand your current challenges.`
        };
      }
    }

    // Default fallback for BA-related questions
    return {
      scores: {
        intent_match: 3,
        question_quality: 3,
        professionalism: 3,
        state_alignment: 3
      },
      verdict: 'AMBER',
      reasons: ['Message could be improved'],
      fixes: ['Consider the suggested question format'],
      suggested_rewrite: context.suggested_question
    };
  }

  private canUseAI(): boolean {
    const now = Date.now();
    
    if (this.aiCallCount >= this.maxAiCallsPerSession) {
      console.log(`⚠️ COACHING EVALUATOR: AI call limit reached (${this.aiCallCount}/${this.maxAiCallsPerSession})`);
      return false;
    }

    if (now - this.lastAiCallTime < this.minTimeBetweenAiCalls) {
      console.log(`⏱️ COACHING EVALUATOR: Too soon for another AI call`);
      return false;
    }

    return true;
  }

  // Reset counters for new session
  resetSession(): void {
    this.aiCallCount = 0;
    this.lastAiCallTime = 0;
    console.log('🔄 COACHING EVALUATOR: Session reset');
  }

  // Get current usage stats
  getUsageStats(): { aiCallsUsed: number; maxAiCalls: number; remainingCalls: number } {
    return {
      aiCallsUsed: this.aiCallCount,
      maxAiCalls: this.maxAiCallsPerSession,
      remainingCalls: this.maxAiCallsPerSession - this.aiCallCount
    };
  }
}

export default CoachingEvaluatorService;
