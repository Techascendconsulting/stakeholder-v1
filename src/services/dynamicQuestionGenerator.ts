import OpenAI from 'openai';
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
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
      // Removed baseURL - call OpenAI directly (backend server not required)
    });
  }

  static getInstance(): DynamicQuestionGenerator {
    if (!DynamicQuestionGenerator.instance) {
      DynamicQuestionGenerator.instance = new DynamicQuestionGenerator();
    }
    return DynamicQuestionGenerator.instance;
  }

  async generateFollowUpQuestion(context: QuestionContext): Promise<DynamicQuestion> {
    console.log('🎯 DYNAMIC QUESTION GENERATOR: Generating follow-up question', context.questionCount, 'of', context.totalQuestions);

    const systemPrompt = `You are a Business Analyst expert generating contextual follow-up questions based on stakeholder responses.

Your job is to create a natural, professional follow-up question that:
1. Builds on what the stakeholder just said
2. Explores the most important pain points or opportunities
3. Uses appropriate BA techniques
4. Feels conversational, not robotic
5. Moves the conversation forward meaningfully

Consider:
- What they mentioned that needs deeper exploration
- Which pain points are most impactful
- What opportunities could be pursued
- How to maintain rapport while digging deeper

Return JSON only with this structure:
{
  "question": "The actual follow-up question",
  "reasoning": "Why this question is important and what we're trying to learn",
  "technique": "The BA technique being demonstrated",
  "expectedInsights": ["insight1", "insight2"],
  "followUpAreas": ["area1", "area2"]
}`;

    const userPrompt = JSON.stringify({
      stakeholder: {
        name: context.stakeholderName,
        role: context.stakeholderRole
      },
      project: context.projectContext,
      conversation_history: context.conversationHistory.slice(-3),
      analysis: context.responseAnalysis,
      question_number: context.questionCount,
      total_questions: context.totalQuestions
    });

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 400,
        temperature: 0.4
      });

      const question = JSON.parse(response.choices[0]?.message?.content || '{}');
      console.log('🎯 DYNAMIC QUESTION GENERATOR: Generated question:', question);
      
      return question;
    } catch (error) {
      console.error('❌ DYNAMIC QUESTION GENERATOR: Question generation failed:', error);
      return this.fallbackQuestion(context);
    }
  }

  private fallbackQuestion(context: QuestionContext): DynamicQuestion {
    const analysis = context.responseAnalysis;
    
    // Generate a simple follow-up based on pain points
    let question = "Can you tell me more about that?";
    let reasoning = "Explore the mentioned issues further";
    let technique = "Open-ended probing";
    
    if (analysis.painPoints.length > 0) {
      const painPoint = analysis.painPoints[0];
      question = `Can you give me a specific example of when ${painPoint.toLowerCase()} caused problems?`;
      reasoning = `Get concrete examples to understand the impact of ${painPoint}`;
      technique = "Example gathering";
    } else if (analysis.keyPoints.length > 0) {
      const keyPoint = analysis.keyPoints[0];
      question = `How does ${keyPoint.toLowerCase()} typically work in your process?`;
      reasoning = `Understand the current process around ${keyPoint}`;
      technique = "Process mapping";
    }

    return {
      question,
      reasoning,
      technique,
      expectedInsights: analysis.keyPoints,
      followUpAreas: analysis.followUpAreas
    };
  }

  // Generate initial trigger question
  generateInitialQuestion(projectContext: string, stakeholderRole: string): DynamicQuestion {
    const questions = [
      {
        question: "What problems are we trying to solve?",
        reasoning: "Get straight to the point - what are we here to solve?",
        technique: "Problem identification",
        expectedInsights: ["Main problems", "Scope of issues", "Priority areas"],
        followUpAreas: ["Specific problems", "Impact assessment", "Root causes"]
      },
      {
        question: "What problems are we trying to solve?",
        reasoning: "Get straight to the point - what are we here to solve?",
        technique: "Problem identification",
        expectedInsights: ["Main problems", "Scope of issues", "Priority areas"],
        followUpAreas: ["Specific problems", "Impact assessment", "Root causes"]
      },
      {
        question: "What problems are we trying to solve?",
        reasoning: "Get straight to the point - what are we here to solve?",
        technique: "Problem identification",
        expectedInsights: ["Main problems", "Scope of issues", "Priority areas"],
        followUpAreas: ["Specific problems", "Impact assessment", "Root causes"]
      }
    ];

    // Select based on stakeholder role
    if (stakeholderRole.toLowerCase().includes('manager') || stakeholderRole.toLowerCase().includes('lead')) {
      return questions[0]; // Focus on challenges
    } else if (stakeholderRole.toLowerCase().includes('user') || stakeholderRole.toLowerCase().includes('agent')) {
      return questions[1]; // Focus on daily workflow
    } else {
      return questions[2]; // Focus on system frustrations
    }
  }

  // Generate wrap-up question
  generateWrapUpQuestion(conversationHistory: Array<{ speaker: string; content: string; timestamp: string }>): DynamicQuestion {
    return {
      question: "Thank you for sharing all of that. Let me quickly summarize what I've heard: [summary]. Is there anything I've missed that you feel is important to highlight?",
      reasoning: "Show active listening, confirm understanding, and give them a chance to add anything missed",
      technique: "Summary and validation",
      expectedInsights: ["Confirmation of understanding", "Additional insights", "Priority clarification"],
      followUpAreas: ["Final clarifications", "Next steps", "Priority ranking"]
    };
  }
}

export default DynamicQuestionGenerator;
