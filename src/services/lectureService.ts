import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  timeout: 12000,
  maxRetries: 2,
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Use GPT-3.5 Turbo for cost-effective learning
const MODEL = "gpt-3.5-turbo";

interface LectureContext {
  moduleId: string;
  topicId: string;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  previousResponses: string[];
  currentPhase: 'teach' | 'practice' | 'assess';
}

interface LectureResponse {
  content: string;
  phase: 'teach' | 'practice' | 'assess';
  requiresUserInput: boolean;
  nextAction?: 'continue' | 'practice' | 'assess' | 'complete';
  feedback?: string;
  score?: number;
}

class LectureService {
  private static instance: LectureService;
  private lectureContexts: Map<string, LectureContext> = new Map();

  public static getInstance(): LectureService {
    if (!LectureService.instance) {
      LectureService.instance = new LectureService();
    }
    return LectureService.instance;
  }

  public async startLecture(moduleId: string, topicId: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Promise<LectureResponse> {
    const context: LectureContext = {
      moduleId,
      topicId,
      userLevel,
      progress: 0,
      previousResponses: [],
      currentPhase: 'teach'
    };

    this.lectureContexts.set(`${moduleId}-${topicId}`, context);

    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = `Start teaching me about ${topicId}. I'm a ${userLevel} level student. Begin with the fundamentals and make it engaging.`;

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
        presence_penalty: 0,
        frequency_penalty: 0
      });

      const content = response.choices[0]?.message?.content?.trim() || 'Let\'s start learning!';

      return {
        content,
        phase: 'teach',
        requiresUserInput: true,
        nextAction: 'continue'
      };

    } catch (error) {
      console.error('Error starting lecture:', error);
      return {
        content: 'Welcome to the BA Academy! Let\'s start learning together. What would you like to know about this topic?',
        phase: 'teach',
        requiresUserInput: true,
        nextAction: 'continue'
      };
    }
  }

  public async continueLecture(moduleId: string, topicId: string, userInput: string): Promise<LectureResponse> {
    const contextKey = `${moduleId}-${topicId}`;
    const context = this.lectureContexts.get(contextKey);

    if (!context) {
      return this.startLecture(moduleId, topicId);
    }

    context.previousResponses.push(userInput);

    const systemPrompt = this.buildSystemPrompt(context);
    const conversationHistory = context.previousResponses.map((response, index) => 
      `User ${index + 1}: ${response}`
    ).join('\n');

    const userPrompt = `User's latest response: ${userInput}\n\nConversation history:\n${conversationHistory}\n\nContinue the lecture based on the user's response. If they seem to understand the concept, move to practice. If they need clarification, provide it.`;

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
        presence_penalty: 0,
        frequency_penalty: 0
      });

      const content = response.choices[0]?.message?.content?.trim() || 'Let\'s continue learning!';

      // Determine next phase based on context and user input
      const nextPhase = this.determineNextPhase(context, userInput);
      context.currentPhase = nextPhase;

      return {
        content,
        phase: nextPhase,
        requiresUserInput: true,
        nextAction: nextPhase === 'teach' ? 'continue' : 'practice'
      };

    } catch (error) {
      console.error('Error continuing lecture:', error);
      return {
        content: 'I understand. Let\'s continue with the lesson. What would you like to explore next?',
        phase: context.currentPhase,
        requiresUserInput: true,
        nextAction: 'continue'
      };
    }
  }

  public async startPractice(moduleId: string, topicId: string): Promise<LectureResponse> {
    const contextKey = `${moduleId}-${topicId}`;
    const context = this.lectureContexts.get(contextKey);

    if (!context) {
      return this.startLecture(moduleId, topicId);
    }

    context.currentPhase = 'practice';

    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = `Now let's practice what we've learned about ${topicId}. Give me a practical exercise or scenario that the user can work through. Make it appropriate for a ${context.userLevel} level student.`;

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
        presence_penalty: 0,
        frequency_penalty: 0
      });

      const content = response.choices[0]?.message?.content?.trim() || 'Let\'s practice!';

      return {
        content,
        phase: 'practice',
        requiresUserInput: true,
        nextAction: 'practice'
      };

    } catch (error) {
      console.error('Error starting practice:', error);
      return {
        content: 'Great! Now let\'s practice what you\'ve learned. I\'ll give you a scenario to work through.',
        phase: 'practice',
        requiresUserInput: true,
        nextAction: 'practice'
      };
    }
  }

  public async assessUnderstanding(moduleId: string, topicId: string, userResponse: string): Promise<LectureResponse> {
    const contextKey = `${moduleId}-${topicId}`;
    const context = this.lectureContexts.get(contextKey);

    if (!context) {
      return this.startLecture(moduleId, topicId);
    }

    context.currentPhase = 'assess';

    const systemPrompt = this.buildSystemPrompt(context);
    const userPrompt = `Assess the user's understanding of ${topicId}. Their response: "${userResponse}". Provide constructive feedback and a score out of 10. If they score 7+ out of 10, they're ready to move on. If not, suggest areas for improvement.`;

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
        presence_penalty: 0,
        frequency_penalty: 0
      });

      const content = response.choices[0]?.message?.content?.trim() || 'Let me assess your understanding.';

      // Extract score from response (simple parsing)
      const scoreMatch = content.match(/(\d+)\/10|score.*?(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 7;

      const nextAction = score >= 7 ? 'complete' : 'practice';

      return {
        content,
        phase: 'assess',
        requiresUserInput: false,
        nextAction,
        feedback: content,
        score
      };

    } catch (error) {
      console.error('Error assessing understanding:', error);
      return {
        content: 'Thank you for your response! You\'re making good progress. Let\'s continue learning.',
        phase: 'assess',
        requiresUserInput: false,
        nextAction: 'continue',
        score: 7
      };
    }
  }

  private buildSystemPrompt(context: LectureContext): string {
    const basePrompt = [
      `You are an expert Software Business Analyst teaching a ${context.userLevel} level student.`,
      `Current topic: ${context.topicId}`,
      `Current phase: ${context.currentPhase}`,
      `Student progress: ${context.progress}%`,
      '',
      'Teaching Guidelines:',
      '- Be encouraging and supportive',
      '- Use real-world examples from software development',
      '- Keep responses concise but informative',
      '- Ask questions to engage the student',
      '- Provide constructive feedback',
      '- Adapt to the student\'s level and pace',
      '',
      'Current Phase Instructions:',
      context.currentPhase === 'teach' ? '- Explain concepts clearly with examples' : '',
      context.currentPhase === 'practice' ? '- Give practical exercises and scenarios' : '',
      context.currentPhase === 'assess' ? '- Evaluate understanding and provide feedback' : '',
      '',
      'Remember: You\'re teaching Software Business Analysis, not general business analysis. Focus on software projects, agile methodologies, and technical requirements.'
    ].filter(Boolean).join('\n');

    return basePrompt;
  }

  private determineNextPhase(context: LectureContext, userInput: string): 'teach' | 'practice' | 'assess' {
    const input = userInput.toLowerCase();
    
    // Check if user is ready for practice
    if (input.includes('understand') || input.includes('got it') || input.includes('ready') || input.includes('practice')) {
      return 'practice';
    }
    
    // Check if user needs more teaching
    if (input.includes('confused') || input.includes('don\'t understand') || input.includes('explain') || input.includes('what')) {
      return 'teach';
    }
    
    // Check if user wants assessment
    if (input.includes('test') || input.includes('assess') || input.includes('check')) {
      return 'assess';
    }
    
    // Default: continue teaching
    return 'teach';
  }

  public getLectureContext(moduleId: string, topicId: string): LectureContext | undefined {
    return this.lectureContexts.get(`${moduleId}-${topicId}`);
  }

  public updateProgress(moduleId: string, topicId: string, progress: number): void {
    const contextKey = `${moduleId}-${topicId}`;
    const context = this.lectureContexts.get(contextKey);
    if (context) {
      context.progress = progress;
    }
  }
}

export default LectureService;
export { LectureService, type LectureResponse, type LectureContext };
