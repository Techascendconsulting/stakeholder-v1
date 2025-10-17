import OpenAI from 'openai';

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
  private openai: OpenAI;
  private aiCallCount = 0;
  private maxAiCallsPerSession = 10; // Limit AI calls to control costs
  private lastAiCallTime = 0;
  private minTimeBetweenAiCalls = 5000; // 5 seconds between AI calls

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
      // Removed baseURL - call OpenAI directly (backend server not required)
    });
  }

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

    // First, try hardcoded analysis
    const hardcodedResult = this.analyzeWithHardcodedRules(userMessage, phaseContext);
    
    if (hardcodedResult.confidence >= 0.7) {
      console.log(`✅ COACHING ANALYSIS: Using hardcoded result (confidence: ${hardcodedResult.confidence})`);
      return hardcodedResult;
    }

    // If hardcoded analysis is low confidence, try AI (with controls)
    if (this.canUseAI()) {
      console.log(`🤖 COACHING ANALYSIS: Hardcoded confidence low (${hardcodedResult.confidence}), trying AI...`);
      return await this.analyzeWithAI(userMessage, phaseContext);
    }

    // If AI is not available, return hardcoded result with lower confidence
    console.log(`⚠️ COACHING ANALYSIS: AI not available, using hardcoded result`);
    return {
      ...hardcodedResult,
      feedback: hardcodedResult.feedback || "That's an interesting point. Consider using one of the suggested questions to guide the conversation.",
      confidence: 0.3
    };
  }

  private analyzeWithHardcodedRules(
    userMessage: string,
    phaseContext: PhaseContext
  ): CoachingAnalysisResult {
    const messageLower = userMessage.toLowerCase();
    const phase = phaseContext.phase;

    // Check for casual greetings that need improvement
    const casualGreetings = ['hey guys', 'hey people', 'hey everyone', 'hey team', 'yo', 'what\'s up'];
    const isCasualGreeting = casualGreetings.some(greeting => messageLower.includes(greeting));
    
    if (isCasualGreeting && phase === 'warm_up') {
      return {
        feedback: "We can make this greeting more professional. Try 'Hello everyone' or 'Good morning team' for a more polished start.",
        feedbackType: 'constructive',
        shouldProgress: false,
        confidence: 0.9,
        source: 'hardcoded'
      };
    }

    // Check for simple greetings that need improvement (even "hi" is too casual)
    const simpleGreetings = ['hi', 'hey', 'hey there'];
    const isSimpleGreeting = simpleGreetings.some(greeting => messageLower.includes(greeting));
    
    if (isSimpleGreeting && phase === 'warm_up') {
      return {
        feedback: "Let's make this greeting more professional. Try 'Hello [Name]' or 'Good morning, thank you for your time' for a more polished start.",
        feedbackType: 'constructive',
        shouldProgress: false,
        confidence: 0.8,
        source: 'hardcoded'
      };
    }

    // Check for formal greetings
    const formalGreetings = ['hello', 'greetings', 'good morning', 'good afternoon'];
    const isFormalGreeting = formalGreetings.some(greeting => messageLower.includes(greeting));
    
    if (isFormalGreeting && phase === 'warm_up') {
      return {
        feedback: "Great way to start the conversation! You're building rapport and setting the right tone.",
        feedbackType: 'positive',
        shouldProgress: true,
        confidence: 0.8,
        source: 'hardcoded'
      };
    }

    // Phase-specific keyword analysis
    const phaseKeywords = {
      warm_up: {
        keywords: ['introduce', 'meet', 'purpose', 'goal', 'agenda'],
        feedback: "Great way to start the conversation! You're building rapport and setting the right tone."
      },
      problem_exploration: {
        keywords: ['problem', 'issue', 'challenge', 'pain', 'difficulty', 'struggle', 'bottleneck', 'inefficiency'],
        feedback: "Excellent problem-focused question! You're digging into the core issues stakeholders face."
      },
      impact: {
        keywords: ['impact', 'effect', 'cost', 'time', 'money', 'frequency', 'how often', 'how much', 'consequence'],
        feedback: "Perfect impact question! You're quantifying the business value of solving this problem."
      },
      prioritisation: {
        keywords: ['priority', 'important', 'urgent', 'critical', 'focus', 'main', 'biggest', 'top'],
        feedback: "Smart prioritization question! You're helping stakeholders focus on what matters most."
      },
      root_cause: {
        keywords: ['why', 'cause', 'root', 'underlying', 'reason', 'source', 'origin', 'trigger'],
        feedback: "Excellent root cause analysis! You're getting to the heart of the problem."
      },
      success_criteria: {
        keywords: ['success', 'goal', 'outcome', 'measure', 'metric', 'target', 'achieve', 'improve'],
        feedback: "Great success-focused question! You're defining what good looks like."
      },
      constraints: {
        keywords: ['constraint', 'limit', 'boundary', 'policy', 'deadline', 'budget', 'resource', 'approval'],
        feedback: "Smart constraint question! You're understanding the boundaries and limitations."
      },
      wrap_up: {
        keywords: ['next', 'follow', 'action', 'plan', 'summary', 'recap', 'close'],
        feedback: "Perfect wrap-up question! You're ensuring clear next steps and closure."
      }
    };

    const currentPhaseKeywords = phaseKeywords[phase as keyof typeof phaseKeywords];
    if (currentPhaseKeywords) {
      const hasRelevantKeywords = currentPhaseKeywords.keywords.some(keyword => messageLower.includes(keyword));
      
      if (hasRelevantKeywords) {
        return {
          feedback: currentPhaseKeywords.feedback,
          feedbackType: 'positive',
          shouldProgress: true,
          confidence: 0.7,
          source: 'hardcoded'
        };
      }
    }

    // Check if it's a suggested question (exact match or semantic match)
    const isSuggestedQuestion = phaseContext.suggestedQuestions.some(
      question => {
        const questionLower = question.toLowerCase();
        // Exact match
        if (questionLower === messageLower) return true;
        
        // Semantic match - check if user's message contains key concepts from suggested question
        const keyConcepts = questionLower
          .replace(/[^\w\s]/g, '') // Remove punctuation
          .split(' ')
          .filter(word => word.length > 3); // Only meaningful words
        
        return keyConcepts.some(concept => messageLower.includes(concept));
      }
    );

    if (isSuggestedQuestion) {
      return {
        feedback: "Great! You're following the coaching framework effectively.",
        feedbackType: 'positive',
        shouldProgress: true,
        confidence: 0.8,
        source: 'hardcoded'
      };
    }

    // No clear match found
    return {
      feedback: "",
      feedbackType: 'redirect',
      shouldProgress: false,
      confidence: 0.2,
      source: 'hardcoded'
    };
  }

  private async analyzeWithAI(
    userMessage: string,
    phaseContext: PhaseContext
  ): Promise<CoachingAnalysisResult> {
    try {
      this.aiCallCount++;
      this.lastAiCallTime = Date.now();

      const systemPrompt = `You are a coaching assistant for stakeholder interviews. Analyze the user's question and provide feedback.

Current Phase: ${phaseContext.phase}
Phase Goal: ${phaseContext.goal}
Suggested Questions: ${phaseContext.suggestedQuestions.join(', ')}

Recent Conversation Context:
${phaseContext.conversationHistory.slice(-3).join('\n')}

User's Question: "${userMessage}"

Analyze this question and respond with ONLY a JSON object in this exact format:
{
  "feedback": "Brief, encouraging feedback about the question quality",
  "feedbackType": "positive|constructive|redirect",
  "shouldProgress": true|false,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of your analysis"
}

Guidelines:
- "positive": Question aligns well with the phase goals
- "constructive": Question has potential but could be improved
- "redirect": Question is off-topic or needs redirection
- Keep feedback concise and encouraging
- Consider the conversation context and phase goals`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      const aiResponse = response.choices[0]?.message?.content?.trim();
      if (!aiResponse) {
        throw new Error('Empty AI response');
      }

      // Parse AI response
      const analysis = JSON.parse(aiResponse);
      console.log(`🤖 COACHING ANALYSIS: AI result - ${analysis.feedbackType} (confidence: ${analysis.confidence})`);

      return {
        feedback: analysis.feedback,
        feedbackType: analysis.feedbackType,
        shouldProgress: analysis.shouldProgress,
        confidence: analysis.confidence,
        source: 'ai'
      };

    } catch (error) {
      console.error('❌ COACHING ANALYSIS: AI analysis failed:', error);
      
      // Fallback to basic hardcoded response
      return {
        feedback: "That's an interesting point. Consider using one of the suggested questions to guide the conversation.",
        feedbackType: 'redirect',
        shouldProgress: false,
        confidence: 0.3,
        source: 'hardcoded'
      };
    }
  }

  private canUseAI(): boolean {
    const now = Date.now();
    
    // Check if we've exceeded the AI call limit
    if (this.aiCallCount >= this.maxAiCallsPerSession) {
      console.log(`⚠️ COACHING ANALYSIS: AI call limit reached (${this.aiCallCount}/${this.maxAiCallsPerSession})`);
      return false;
    }

    // Check if enough time has passed since last AI call
    if (now - this.lastAiCallTime < this.minTimeBetweenAiCalls) {
      console.log(`⏱️ COACHING ANALYSIS: Too soon for another AI call`);
      return false;
    }

    return true;
  }

  // Reset counters for new session
  resetSession(): void {
    this.aiCallCount = 0;
    this.lastAiCallTime = 0;
    console.log('🔄 COACHING ANALYSIS: Session reset');
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

export default CoachingAnalysisService;
