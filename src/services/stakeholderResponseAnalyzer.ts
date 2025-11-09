// Stakeholder Response Analyzer using secure backend API
// SECURITY: No OpenAI API key in frontend

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

  static getInstance(): StakeholderResponseAnalyzer {
    if (!StakeholderResponseAnalyzer.instance) {
      StakeholderResponseAnalyzer.instance = new StakeholderResponseAnalyzer();
    }
    return StakeholderResponseAnalyzer.instance;
  }

  async analyzeResponse(context: AnalysisContext): Promise<ResponseAnalysis> {
    console.log('🔍 STAKEHOLDER RESPONSE ANALYZER: Analyzing response from', context.stakeholderName);

    try {
      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: context.currentResponse,
          coachingType: 'general',
          context: `Analyzing response from ${context.stakeholderName} (${context.stakeholderRole}) in ${context.projectContext}`
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      // Parse feedback to extract key points
      return this.parseFeedbackToAnalysis(data.feedback, context);
    } catch (error) {
      console.error('❌ Error analyzing response:', error);
      return this.getFallbackAnalysis(context);
    }
  }

  private parseFeedbackToAnalysis(feedback: string, context: AnalysisContext): ResponseAnalysis {
    const response = context.currentResponse.toLowerCase();
    
    // Extract key points from the response
    const keyPoints = this.extractKeyPoints(context.currentResponse);
    const painPoints = this.extractPainPoints(context.currentResponse);
    const opportunities = this.extractOpportunities(context.currentResponse);

    return {
      keyPoints,
      painPoints,
      opportunities,
      followUpAreas: painPoints.length > 0 ? ['Explore pain points deeper'] : ['Understand requirements'],
      suggestedTechnique: painPoints.length > 0 ? '5 Whys' : 'Open-ended questioning',
      reasoning: feedback
    };
  }

  private extractKeyPoints(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
  }

  private extractPainPoints(text: string): string[] {
    const painKeywords = ['problem', 'issue', 'challenge', 'difficult', 'slow', 'frustrating', 'manual'];
    const lowerText = text.toLowerCase();
    const painPoints: string[] = [];
    
    painKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        const index = lowerText.indexOf(keyword);
        const context = text.substring(Math.max(0, index - 20), Math.min(text.length, index + 50));
        painPoints.push(context.trim());
      }
    });

    return painPoints.slice(0, 3);
  }

  private extractOpportunities(text: string): string[] {
    const oppKeywords = ['improve', 'better', 'automate', 'streamline', 'optimize', 'enhance'];
    const lowerText = text.toLowerCase();
    const opportunities: string[] = [];
    
    oppKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        opportunities.push(`Opportunity to ${keyword}`);
      }
    });

    return opportunities.slice(0, 2);
  }

  private getFallbackAnalysis(context: AnalysisContext): ResponseAnalysis {
    return {
      keyPoints: ['Response received from stakeholder'],
      painPoints: ['Unable to analyze pain points'],
      opportunities: ['Explore further in conversation'],
      followUpAreas: ['Continue questioning'],
      suggestedTechnique: 'Open-ended questioning',
      reasoning: 'Analysis service unavailable - using fallback'
    };
  }
}

export const stakeholderResponseAnalyzer = StakeholderResponseAnalyzer.getInstance();
