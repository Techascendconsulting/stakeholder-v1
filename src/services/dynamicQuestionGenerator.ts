// Dynamic Question Generator using secure backend API
// SECURITY: No OpenAI API key in frontend

interface ResponseAnalysis {
  keyPoints: string[];
  painPoints: string[];
  opportunities: string[];
  followUpAreas: string[];
  suggestedTechnique: string;
  reasoning: string;
}

interface DynamicQuestion {
  question: string;
  reasoning: string;
  technique: string;
  expectedInsights: string[];
  followUpAreas: string[];
}

interface QuestionContext {
  stakeholderName: string;
  stakeholderRole: string;
  projectContext: string;
  conversationHistory: Array<{
    speaker: string;
    content: string;
    timestamp: string;
  }>;
  responseAnalysis: ResponseAnalysis;
  questionCount: number;
  totalQuestions: number;
}

class DynamicQuestionGenerator {
  private static instance: DynamicQuestionGenerator;

  static getInstance(): DynamicQuestionGenerator {
    if (!DynamicQuestionGenerator.instance) {
      DynamicQuestionGenerator.instance = new DynamicQuestionGenerator();
    }
    return DynamicQuestionGenerator.instance;
  }

  async generateFollowUpQuestion(context: QuestionContext): Promise<DynamicQuestion> {
    console.log('🎯 DYNAMIC QUESTION GENERATOR: Generating follow-up question', context.questionCount, 'of', context.totalQuestions);

    try {
      const response = await fetch('/api/stakeholder/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stakeholderProfile: {
            name: context.stakeholderName,
            role: context.stakeholderRole,
          },
          conversationHistory: context.conversationHistory.map(msg => ({
            role: msg.speaker === 'BA' ? 'user' : 'assistant',
            content: msg.content
          })),
          userQuestion: 'Generate a follow-up question based on the conversation',
          context: `${context.projectContext}. Pain points: ${context.responseAnalysis.painPoints.join(', ')}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const data = await response.json();

      return {
        question: data.response || this.getFallbackQuestion(context),
        reasoning: 'Generated based on conversation context',
        technique: context.responseAnalysis.suggestedTechnique || 'Open-ended questioning',
        expectedInsights: context.responseAnalysis.followUpAreas || [],
        followUpAreas: context.responseAnalysis.followUpAreas || []
      };
    } catch (error) {
      console.error('❌ Error generating follow-up question:', error);
      return this.getFallbackQuestionObject(context);
    }
  }

  private getFallbackQuestion(context: QuestionContext): string {
    const questions = [
      `${context.stakeholderName}, can you tell me more about the main challenges you're facing?`,
      'What would success look like from your perspective?',
      'How does this impact your day-to-day operations?',
      'What are the biggest pain points in the current process?',
      'Can you walk me through a typical scenario where this becomes an issue?'
    ];
    return questions[context.questionCount % questions.length];
  }

  private getFallbackQuestionObject(context: QuestionContext): DynamicQuestion {
    return {
      question: this.getFallbackQuestion(context),
      reasoning: 'Fallback question - service unavailable',
      technique: 'Open-ended questioning',
      expectedInsights: ['Understanding stakeholder needs'],
      followUpAreas: ['Pain points', 'Desired outcomes']
    };
  }
}

export const dynamicQuestionGenerator = DynamicQuestionGenerator.getInstance();
