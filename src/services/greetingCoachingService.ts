import OpenAI from 'openai';

interface GreetingEvaluation {
  verdict: 'GOOD' | 'AMBER' | 'OOS';
  message: string;
  suggestedRewrite?: string;
  reasoning: string;
  technique: string;
}

interface WarmUpGuidance {
  title: string;
  description: string;
  why: string;
  how: string;
  examples: string[];
}

class GreetingCoachingService {
  private static instance: GreetingCoachingService;
  private openai: OpenAI | null;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VITE_OPENAI_API_KEY not set - Greeting coaching features will be disabled');
      this.openai = null;
    } else {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
          // Removed baseURL - call OpenAI directly (backend server not required)
        });
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI client for greeting coaching:', error);
        this.openai = null;
      }
    }
  }

  static getInstance(): GreetingCoachingService {
    if (!GreetingCoachingService.instance) {
      GreetingCoachingService.instance = new GreetingCoachingService();
    }
    return GreetingCoachingService.instance;
  }

  async getWarmUpGuidance(): Promise<WarmUpGuidance> {
    console.log('🎯 GREETING COACHING: Getting warm-up guidance');

    const systemPrompt = `You are a Business Analyst trainer helping students learn professional greeting techniques.

Provide warm-up guidance that explains:
1. Why professional greetings matter in stakeholder meetings
2. How to structure a good greeting
3. Examples of professional vs casual greetings

Return JSON only with this structure:
{
  "title": "Professional Greeting Guide",
  "description": "Brief overview of what makes a good greeting",
  "why": "Why professional greetings are important",
  "how": "How to structure a professional greeting",
  "examples": ["example1", "example2", "example3"]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Provide warm-up guidance for professional greetings in stakeholder meetings.' }
        ],
        max_tokens: 300,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const guidance = JSON.parse(content);
      console.log('✅ GREETING COACHING: Warm-up guidance generated');
      return guidance;

    } catch (error) {
      console.error('❌ GREETING COACHING: Warm-up guidance failed:', error);
      
      // Fallback guidance
      return {
        title: "Professional Greeting Guide",
        description: "Start your stakeholder meeting with a professional, welcoming greeting that sets the right tone.",
        why: "Professional greetings establish credibility, show respect for stakeholders' time, and create a positive foundation for the conversation.",
        how: "1. Use formal language (Hello, Good morning/afternoon) 2. Introduce yourself and your role 3. Acknowledge their time 4. State the meeting purpose briefly",
        examples: [
          "Hello [Name], thank you for taking the time to meet today. I'm [Your Name], the business analyst on this project, and I'd like to understand your current challenges.",
          "Good morning everyone, I appreciate you joining us. I'm [Your Name] and I'm here to help analyze the current process and identify improvement opportunities.",
          "Hello [Name], thanks for making time in your schedule. I'm [Your Name], and I'm working on understanding the pain points in your current workflow."
        ]
      };
    }
  }

  async evaluateGreeting(greeting: string, context?: string): Promise<GreetingEvaluation> {
    console.log('🎯 GREETING COACHING: Evaluating greeting:', greeting);

    const systemPrompt = `You are a Business Analyst trainer evaluating greeting quality in stakeholder meetings.

Evaluate the greeting and provide:
- VERDICT: GOOD (professional), AMBER (needs improvement), or OOS (out of scope)
- Clear feedback message
- Suggested rewrite if AMBER
- Reasoning for the evaluation
- BA technique demonstrated

Consider:
- Professional tone and language
- Proper introduction and role clarity
- Respect for stakeholder time
- Clear meeting purpose
- Appropriate formality level

IMPORTANT: For AMBER verdicts, the suggested rewrite must be SUBSTANTIALLY more professional and include:
1. Formal greeting (Hello, Good morning/afternoon)
2. Introduction of yourself and your role
3. Acknowledgment of their time
4. Clear statement of meeting purpose
5. Professional tone throughout

Examples of good suggestions:
- "Hello everyone, thank you for taking the time to meet today. I'm [Name], the business analyst on this project, and I'm here to understand the current pain points in your process."
- "Good morning, I appreciate you joining us. I'm [Name], and I'm working on analyzing your current workflow to identify improvement opportunities."

Return JSON only with this structure:
{
  "verdict": "GOOD|AMBER|OOS",
  "message": "Clear feedback message",
  "suggestedRewrite": "Professional alternative (only if AMBER)",
  "reasoning": "Why this evaluation was given",
  "technique": "BA technique demonstrated"
}`;

    const userPrompt = `Evaluate this greeting: "${greeting}"
${context ? `Context: ${context}` : ''}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 400,
        temperature: 0.2
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const evaluation = JSON.parse(content);
      console.log('✅ GREETING COACHING: Evaluation completed:', evaluation.verdict);
      return evaluation;

    } catch (error) {
      console.error('❌ GREETING COACHING: Evaluation failed:', error);
      
      // Fallback evaluation using simple rules
      const isCasual = /^(hi|hey|yo|what's up|hello\s*$)/i.test(greeting.trim());
      const hasProfessionalElements = /(thank|appreciate|business analyst|meet|understand|challenge|welcome|aim|discuss|issues|process)/i.test(greeting);
      
      if (isCasual && !hasProfessionalElements) {
        return {
          verdict: 'AMBER',
          message: "The greeting could be more professional by using a formal tone and addressing the stakeholders more respectfully.",
          suggestedRewrite: "Good morning everyone, thank you for taking the time to meet today. I'm the business analyst on this project, and I'm here to understand the current pain points and challenges in your process so we can work together to identify improvement opportunities.",
          reasoning: "The greeting is too casual for a professional stakeholder meeting.",
          technique: "Professional Communication"
        };
      } else {
        return {
          verdict: 'GOOD',
          message: "Great professional greeting!",
          reasoning: "The greeting demonstrates appropriate professional tone and structure.",
          technique: "Professional Communication"
        };
      }
    }
  }
}

export default GreetingCoachingService;
