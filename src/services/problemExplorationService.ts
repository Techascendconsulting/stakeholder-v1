// Problem Exploration Service using secure backend API
// SECURITY: No OpenAI API key in frontend

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

  static getInstance(): ProblemExplorationService {
    if (!ProblemExplorationService.instance) {
      ProblemExplorationService.instance = new ProblemExplorationService();
    }
    return ProblemExplorationService.instance;
  }

  async getProblemExplorationGuidance(): Promise<ProblemExplorationGuidance> {
    console.log('🎯 PROBLEM EXPLORATION: Getting guidance');

    // Return default guidance (can be enhanced with API call if needed)
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

  async evaluateProblemExploration(
    userQuestion: string,
    stakeholderName: string,
    context: string
  ): Promise<ProblemExplorationEvaluation> {
    console.log('🎯 PROBLEM EXPLORATION: Evaluating question:', userQuestion);

    try {
      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userQuestion,
          coachingType: 'problem-exploration',
          context: `Stakeholder: ${stakeholderName}. ${context}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate problem exploration');
      }

      const data = await response.json();
      
      // Determine verdict based on feedback
      const feedback = data.feedback.toLowerCase();
      let verdict: 'GOOD' | 'AMBER' | 'OOS' = 'GOOD';
      
      if (feedback.includes('not relevant') || feedback.includes('off-topic') || feedback.includes('inappropriate')) {
        verdict = 'OOS';
      } else if (feedback.includes('could') || feedback.includes('consider') || feedback.includes('try')) {
        verdict = 'AMBER';
      }

      return {
        verdict,
        message: data.feedback,
        reasoning: data.feedback,
        technique: 'Problem exploration questioning',
        suggestedRewrite: verdict !== 'GOOD' ? 'What specific challenges are you facing that this project aims to address?' : undefined
      };
    } catch (error) {
      console.error('❌ Error evaluating problem exploration:', error);
      return {
        verdict: 'AMBER',
        message: 'Unable to evaluate at this time.',
        reasoning: 'Service unavailable',
        technique: 'Problem exploration questioning'
      };
    }
  }
}

export const problemExplorationService = ProblemExplorationService.getInstance();
