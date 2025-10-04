import OpenAI from 'openai';

interface StakeholderResponseAnalysis {
  insights: string[];
  painPoints: string[];
  blockers: string[];
  nextQuestion: string;
  reasoning: string;
  technique: string;
}

class StakeholderResponseAnalysisService {
  private static instance: StakeholderResponseAnalysisService;
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  static getInstance(): StakeholderResponseAnalysisService {
    if (!StakeholderResponseAnalysisService.instance) {
      StakeholderResponseAnalysisService.instance = new StakeholderResponseAnalysisService();
    }
    return StakeholderResponseAnalysisService.instance;
  }

  async analyzeStakeholderResponse(response: string, context?: string): Promise<StakeholderResponseAnalysis> {
    console.log('🎯 STAKEHOLDER ANALYSIS: Analyzing response:', response);

    const systemPrompt = `You are a Business Analyst analyzing stakeholder responses to extract insights and generate the next question.

    Analyze the stakeholder's response and provide:
    1. Key insights about their situation
    2. Pain points they mentioned
    3. Potential blockers or challenges
    4. The next question to ask based on their response
    5. Reasoning for the next question
    6. BA technique being used

    Focus on:
    - Understanding their current situation
    - Identifying root causes
    - Finding opportunities for improvement
    - Building on their specific context

    Return JSON only with this structure:
    {
      "insights": ["insight1", "insight2"],
      "painPoints": ["pain1", "pain2"],
      "blockers": ["blocker1", "blocker2"],
      "nextQuestion": "The next question to ask",
      "reasoning": "Why this question is important based on their response",
      "technique": "BA technique being used"
    }`;

    const userPrompt = `Analyze this stakeholder response: "${response}"
    ${context ? `Context: ${context}` : ''}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(content);
      console.log('✅ STAKEHOLDER ANALYSIS: Analysis completed');
      return analysis;

    } catch (error) {
      console.error('❌ STAKEHOLDER ANALYSIS: Analysis failed:', error);

      // Fallback analysis
      return {
        insights: ["Stakeholder provided valuable context about their situation"],
        painPoints: ["Need to identify specific pain points from their response"],
        blockers: ["Need to understand potential blockers"],
        nextQuestion: "Can you tell me more about the specific challenges you're facing?",
        reasoning: "This question will help us dive deeper into their specific situation",
        technique: "Probing"
      };
    }
  }
}

export default StakeholderResponseAnalysisService;











