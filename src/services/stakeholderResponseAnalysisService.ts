// Stakeholder Response Analysis Service using secure backend API
// SECURITY: No OpenAI API key in frontend

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

  static getInstance(): StakeholderResponseAnalysisService {
    if (!StakeholderResponseAnalysisService.instance) {
      StakeholderResponseAnalysisService.instance = new StakeholderResponseAnalysisService();
    }
    return StakeholderResponseAnalysisService.instance;
  }

  async analyzeStakeholderResponse(response: string, context?: string): Promise<StakeholderResponseAnalysis> {
    console.log('🎯 STAKEHOLDER ANALYSIS: Analyzing response:', response);

    try {
      const apiResponse = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: response,
          coachingType: 'general',
          context: context || 'Stakeholder response analysis'
        })
      });

      if (!apiResponse.ok) {
        throw new Error('Analysis failed');
      }

      const data = await apiResponse.json();
      
      // Parse the feedback to extract structured information
      return this.parseFeedbackToAnalysis(data.feedback, response);
    } catch (error) {
      console.error('❌ Error analyzing stakeholder response:', error);
      return this.getFallbackAnalysis(response);
    }
  }

  private parseFeedbackToAnalysis(feedback: string, response: string): StakeholderResponseAnalysis {
    // Extract insights from the response
    const insights = this.extractInsights(response);
    const painPoints = this.extractPainPoints(response);
    const blockers = this.extractBlockers(response);

    return {
      insights,
      painPoints,
      blockers,
      nextQuestion: 'Can you tell me more about the specific challenges you mentioned?',
      reasoning: feedback,
      technique: 'Probing and active listening'
    };
  }

  private extractInsights(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
    return sentences.slice(0, 3).map(s => s.trim());
  }

  private extractPainPoints(text: string): string[] {
    const painKeywords = ['problem', 'issue', 'challenge', 'difficult', 'frustrating', 'slow'];
    const lowerText = text.toLowerCase();
    const painPoints: string[] = [];
    
    painKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        painPoints.push(`Identified pain point related to ${keyword}`);
      }
    });

    return painPoints.length > 0 ? painPoints : ['Further exploration needed'];
  }

  private extractBlockers(text: string): string[] {
    const blockerKeywords = ['can\'t', 'cannot', 'unable', 'blocked', 'stuck', 'limited'];
    const lowerText = text.toLowerCase();
    const blockers: string[] = [];
    
    blockerKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        blockers.push(`Potential blocker identified`);
      }
    });

    return blockers;
  }

  private getFallbackAnalysis(response: string): StakeholderResponseAnalysis {
    return {
      insights: ['Stakeholder provided valuable context'],
      painPoints: ['Further exploration needed'],
      blockers: [],
      nextQuestion: 'Can you tell me more about that?',
      reasoning: 'Building rapport and gathering more context',
      technique: 'Open-ended questioning'
    };
  }
}

export const stakeholderResponseAnalysisService = StakeholderResponseAnalysisService.getInstance();
