import OpenAI from 'openai';

interface ResponseAnalysis {
  keyPoints: string[];
  painPoints: string[];
  opportunities: string[];
  followUpAreas: string[];
  suggestedTechnique: string;
  reasoning: string;
}

interface AnalysisContext {
  stakeholderName: string;
  stakeholderRole: string;
  projectContext: string;
  conversationHistory: Array<{
    speaker: string;
    content: string;
    timestamp: string;
  }>;
  currentResponse: string;
  questionCount: number;
}

class StakeholderResponseAnalyzer {
  private static instance: StakeholderResponseAnalyzer;
  private openai: OpenAI | null;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const hasValidApiKey = apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0;
    if (!hasValidApiKey) {
      console.warn('⚠️ VITE_OPENAI_API_KEY not set - Stakeholder response analyzer features will be disabled');
      this.openai = null;
    } else {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey.trim(),
          dangerouslyAllowBrowser: true
          // Removed baseURL - call OpenAI directly (backend server not required)
        });
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI client for stakeholder response analyzer:', error);
        this.openai = null;
      }
    }
  }

  static getInstance(): StakeholderResponseAnalyzer {
    if (!StakeholderResponseAnalyzer.instance) {
      StakeholderResponseAnalyzer.instance = new StakeholderResponseAnalyzer();
    }
    return StakeholderResponseAnalyzer.instance;
  }

  async analyzeResponse(context: AnalysisContext): Promise<ResponseAnalysis> {
    console.log('🔍 STAKEHOLDER RESPONSE ANALYZER: Analyzing response from', context.stakeholderName);

    const systemPrompt = `You are a Business Analyst expert analyzing stakeholder responses to generate contextual follow-up questions.

Your job is to:
1. Extract key insights from the stakeholder's response
2. Identify pain points and opportunities
3. Suggest areas for follow-up questions
4. Recommend BA techniques to use
5. Explain the reasoning behind your suggestions

Focus on:
- Specific issues mentioned
- Process problems
- Pain points
- Opportunities for improvement
- Areas that need deeper exploration

Return JSON only with this structure:
{
  "keyPoints": ["point1", "point2"],
  "painPoints": ["pain1", "pain2"],
  "opportunities": ["opp1", "opp2"],
  "followUpAreas": ["area1", "area2"],
  "suggestedTechnique": "technique name",
  "reasoning": "explanation of why these areas need follow-up"
}`;

    const userPrompt = JSON.stringify({
      stakeholder: {
        name: context.stakeholderName,
        role: context.stakeholderRole
      },
      project: context.projectContext,
      conversation_history: context.conversationHistory.slice(-3), // Last 3 exchanges
      current_response: context.currentResponse,
      question_number: context.questionCount
    });

    if (!this.openai) {
      console.warn('⚠️ OpenAI not configured, using fallback analysis');
      return this.fallbackAnalysis(context);
    }

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

      const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
      console.log('📊 STAKEHOLDER RESPONSE ANALYZER: Analysis complete:', analysis);
      
      return analysis;
    } catch (error) {
      console.error('❌ STAKEHOLDER RESPONSE ANALYZER: Analysis failed:', error);
      return this.fallbackAnalysis(context);
    }
  }

  private fallbackAnalysis(context: AnalysisContext): ResponseAnalysis {
    // Simple fallback analysis
    const response = context.currentResponse.toLowerCase();
    
    const keyPoints = [];
    const painPoints = [];
    const opportunities = [];
    const followUpAreas = [];

    // Basic keyword extraction
    if (response.includes('delay') || response.includes('slow')) {
      painPoints.push('Process delays');
      followUpAreas.push('Timeline and impact of delays');
    }
    
    if (response.includes('manual') || response.includes('manual process')) {
      painPoints.push('Manual processes');
      followUpAreas.push('Current manual workflow steps');
    }
    
    if (response.includes('system') || response.includes('tool')) {
      keyPoints.push('System/tool usage');
      followUpAreas.push('Current system capabilities and limitations');
    }

    return {
      keyPoints,
      painPoints,
      opportunities,
      followUpAreas,
      suggestedTechnique: 'Process mapping',
      reasoning: 'Extract specific details about mentioned processes and pain points'
    };
  }
}

export default StakeholderResponseAnalyzer;
