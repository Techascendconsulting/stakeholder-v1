import OpenAI from 'openai';

interface ProblemExplorationGuidance {
  title: string;
  description: string;
  why: string;
  how: string;
  examples: string[];
}

interface ProblemExplorationEvaluation {
  verdict: 'GOOD' | 'AMBER' | 'OOS';
  message: string;
  suggestedRewrite?: string;
  reasoning: string;
  technique: string;
}

class ProblemExplorationService {
  private static instance: ProblemExplorationService;
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
      baseURL: 'http://localhost:3001/api/openai-proxy'
    });
  }

  static getInstance(): ProblemExplorationService {
    if (!ProblemExplorationService.instance) {
      ProblemExplorationService.instance = new ProblemExplorationService();
    }
    return ProblemExplorationService.instance;
  }

  async getProblemExplorationGuidance(): Promise<ProblemExplorationGuidance> {
    console.log('🎯 PROBLEM EXPLORATION: Getting guidance');

    const systemPrompt = `You are a Business Analyst trainer helping students learn problem exploration techniques.

    Provide guidance for the "What problems are we trying to solve?" question that explains:
    1. Why this question is crucial in stakeholder meetings
    2. How to effectively ask this question
    3. Examples of good problem exploration questions

    IMPORTANT: Use this exact format and content:
    {
      "title": "Problem Exploration Guide",
      "description": "Brief overview of what makes a good problem exploration question:",
      "why": "This question is crucial in project meetings because it helps ensure everyone is aligned on the core issue the project is meant to address.",
      "how": "Ask open-ended questions that prompt stakeholders to reflect on pain points, not just proposed solutions. Encourage them to describe real situations and the impact.",
      "examples": [
        "What challenges led to this project being initiated?",
        "Can you describe a recent issue that highlighted this need?",
        "What would success look like once this problem is solved?"
      ]
    }`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Provide guidance for problem exploration questions in stakeholder meetings.' }
        ],
        max_tokens: 300,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const guidance = JSON.parse(content);
      console.log('✅ PROBLEM EXPLORATION: Guidance generated');
      return guidance;

    } catch (error) {
      console.error('❌ PROBLEM EXPLORATION: Guidance failed:', error);

      // Fallback guidance
      return {
        title: "Problem Exploration Guide",
        description: "Brief overview of what makes a good problem exploration question:",
        why: "This question is crucial in project meetings because it helps ensure everyone is aligned on the core issue the project is meant to address.",
        how: "Ask open-ended questions that prompt stakeholders to reflect on pain points, not just proposed solutions. Encourage them to describe real situations and the impact.",
        examples: [
          "What challenges led to this project being initiated?",
          "Can you describe a recent issue that highlighted this need?",
          "What would success look like once this problem is solved?"
        ]
      };
    }
  }

  async evaluateProblemExplorationQuestion(question: string, context?: string): Promise<ProblemExplorationEvaluation> {
    console.log('🎯 PROBLEM EXPLORATION: Evaluating question:', question);

    const systemPrompt = `You are a Business Analyst trainer evaluating problem exploration questions in stakeholder meetings.

    Evaluate the question and provide:
    - VERDICT: GOOD (effective problem exploration), AMBER (needs improvement), or OOS (out of scope)
    - Clear feedback message
    - Suggested rewrite if AMBER
    - Reasoning for the evaluation
    - BA technique demonstrated

    Consider:
    - Focus on problems/pain points vs solutions
    - Open-ended vs closed questions
    - Professional tone and clarity
    - Alignment with problem exploration goals
    - Encourages stakeholder reflection

    GOOD questions focus on:
    - Problems, challenges, pain points
    - Root causes and impacts
    - Real situations and experiences
    - Open-ended exploration

    AMBER questions might:
    - Focus too much on solutions
    - Be too closed or leading
    - Lack clarity or professionalism
    - Miss the problem exploration goal

    Return JSON only with this structure:
    {
      "verdict": "GOOD|AMBER|OOS",
      "message": "Clear feedback message",
      "suggestedRewrite": "Better question (only if AMBER)",
      "reasoning": "Why this evaluation was given",
      "technique": "BA technique demonstrated"
    }`;

    const userPrompt = `Evaluate this problem exploration question: "${question}"
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
      console.log('✅ PROBLEM EXPLORATION: Evaluation completed:', evaluation.verdict);
      return evaluation;

    } catch (error) {
      console.error('❌ PROBLEM EXPLORATION: Evaluation failed:', error);

      // Fallback evaluation using simple rules
      const isProblemFocused = /(problem|challenge|issue|pain|difficulty|struggle|concern)/i.test(question);
      const isOpenEnded = /(what|how|why|when|where|describe|explain|tell)/i.test(question);
      const isSolutionFocused = /(solution|fix|implement|build|create|develop)/i.test(question);

      if (isProblemFocused && isOpenEnded && !isSolutionFocused) {
        return {
          verdict: 'GOOD',
          message: "Great problem exploration question!",
          reasoning: "The question effectively focuses on problems and encourages open-ended exploration.",
          technique: "Problem Exploration"
        };
      } else {
        return {
          verdict: 'AMBER',
          message: "This question could be more effective for problem exploration.",
          suggestedRewrite: "What specific challenges or pain points are you experiencing that led to this project being initiated?",
          reasoning: "The question could better focus on problems rather than solutions and encourage more detailed exploration.",
          technique: "Problem Exploration"
        };
      }
    }
  }
}

export default ProblemExplorationService;
