// Greeting Coaching Service using secure backend API
// SECURITY: No OpenAI API key in frontend

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

  static getInstance(): GreetingCoachingService {
    if (!GreetingCoachingService.instance) {
      GreetingCoachingService.instance = new GreetingCoachingService();
    }
    return GreetingCoachingService.instance;
  }

  async getWarmUpGuidance(): Promise<WarmUpGuidance> {
    console.log('🎯 GREETING COACHING: Getting warm-up guidance');

    try {
      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: 'Provide warm-up guidance for professional greetings in stakeholder meetings.',
          coachingType: 'greeting',
          context: 'warm-up-guidance'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get warm-up guidance');
      }

      const data = await response.json();
      
      // Parse the feedback as JSON if it's a string
      try {
        const parsed = JSON.parse(data.feedback);
        return parsed;
      } catch {
        // Return default guidance if parsing fails
        return {
          title: "Professional Greeting Guide",
          description: "Learn to make strong first impressions",
          why: "Professional greetings build rapport and credibility",
          how: "Introduce yourself clearly, state your purpose, and acknowledge the stakeholder's time",
          examples: [
            "Good morning Sarah, I'm Alex from the BA team. Thank you for taking time to meet with me today.",
            "Hi John, it's great to meet you. I'm here to understand your needs for the new system.",
            "Hello Ms. Chen, I appreciate you making time for this discussion. I'm looking forward to learning about your priorities."
          ]
        };
      }
    } catch (error) {
      console.error('❌ Error getting warm-up guidance:', error);
      // Return default guidance
      return {
        title: "Professional Greeting Guide",
        description: "Learn to make strong first impressions",
        why: "Professional greetings build rapport and credibility",
        how: "Introduce yourself clearly, state your purpose, and acknowledge the stakeholder's time",
        examples: [
          "Good morning Sarah, I'm Alex from the BA team. Thank you for taking time to meet with me today.",
          "Hi John, it's great to meet you. I'm here to understand your needs for the new system.",
          "Hello Ms. Chen, I appreciate you making time for this discussion. I'm looking forward to learning about your priorities."
        ]
      };
    }
  }

  async evaluateGreeting(
    userGreeting: string,
    stakeholderName: string,
    stakeholderRole: string,
    context: string
  ): Promise<GreetingEvaluation> {
    console.log('🎯 GREETING COACHING: Evaluating user greeting:', userGreeting);

    try {
      const response = await fetch('/api/coaching/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userGreeting,
          coachingType: 'greeting',
          context: `Stakeholder: ${stakeholderName} (${stakeholderRole}). Context: ${context}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate greeting');
      }

      const data = await response.json();
      
      // Parse the feedback
      const feedback = data.feedback.toLowerCase();
      
      // Determine verdict based on feedback
      let verdict: 'GOOD' | 'AMBER' | 'OOS' = 'GOOD';
      if (feedback.includes('inappropriate') || feedback.includes('unprofessional') || feedback.includes('too casual')) {
        verdict = 'OOS';
      } else if (feedback.includes('could improve') || feedback.includes('consider') || feedback.includes('might')) {
        verdict = 'AMBER';
      }

      return {
        verdict,
        message: data.feedback,
        reasoning: data.feedback,
        technique: 'Professional greeting techniques',
        suggestedRewrite: verdict !== 'GOOD' ? `Hello ${stakeholderName}, thank you for taking the time to meet with me today. I'm looking forward to our discussion.` : undefined
      };
    } catch (error) {
      console.error('❌ Error evaluating greeting:', error);
      return {
        verdict: 'AMBER',
        message: 'Unable to evaluate greeting at this time. Please try a professional greeting.',
        reasoning: 'Service unavailable',
        technique: 'Professional greeting techniques'
      };
    }
  }
}

export const greetingCoachingService = GreetingCoachingService.getInstance();
