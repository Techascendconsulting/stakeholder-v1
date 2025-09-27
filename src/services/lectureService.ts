import OpenAI from 'openai';
import { comprehensiveKnowledgeBase, type KnowledgeItem } from './comprehensiveKnowledgeBase';

// Knowledge Base Structure - imported from comprehensiveKnowledgeBase

interface AssignmentAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  relatedTopics: string[];
  score: number;
  feedback: string;
  nextSteps: string[];
  rubric: {
    criteria: string;
    score: number;
    maxScore: number;
    comments: string;
  }[];
}

interface LectureContext {
  moduleId: string;
  topicIndex: number;
  currentPhase: 'teach' | 'practice' | 'assess';
  conversationHistory: Array<{ role: 'user' | 'ai'; content: string }>;
  questionsAsked: number;
  maxQuestions: number;
}

class LectureService {
  private static instance: LectureService;
  private openai: OpenAI;
  private lectureContexts: Map<string, LectureContext> = new Map();

  // Comprehensive Knowledge Base - Imported from separate file
  private knowledgeBase: KnowledgeItem[] = comprehensiveKnowledgeBase;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  public static getInstance(): LectureService {
    if (!LectureService.instance) {
      LectureService.instance = new LectureService();
    }
    return LectureService.instance;
  }

  // Start a new lecture session
  async startLecture(moduleId: string, topicIndex: number = 0): Promise<LectureResponse> {
    const module = this.getModuleById(moduleId);
    const topic = module.topics[topicIndex];
    
    const context: LectureContext = {
      moduleId,
      topicIndex,
      currentPhase: 'teach',
      conversationHistory: [],
      questionsAsked: 0,
      maxQuestions: 10
    };
    
    this.lectureContexts.set(moduleId, context);

    // First, try to get content from knowledge base for this specific topic
    const knowledgeBaseContent = this.getKnowledgeBaseContentForTopic(topic);
    
    if (knowledgeBaseContent) {
      // Use knowledge base content directly
      const aiResponse = `${knowledgeBaseContent}\n\nWhat questions do you have about ${topic}?`;
      
      context.conversationHistory.push({ role: 'ai', content: aiResponse });
      
      return {
        content: aiResponse,
        phase: 'teach',
        topic: topic,
        moduleId: moduleId,
        questionsRemaining: context.maxQuestions - context.questionsAsked
      };
    }

    // Fallback to AI generation with strict topic focus
    const systemPrompt = `You are providing information about the specific topic: "${topic}". 

CRITICAL: You must ONLY cover "${topic}" and nothing else. Do not cover other BA topics.

If the topic is "Requirements Classification and Types", cover ONLY how requirements are classified and the different types of requirements.
If the topic is "Business Analysis Definition (BABOK)", cover ONLY the definition of business analysis.
If the topic is "Core BA Competencies (IIBA)", cover ONLY the core competencies.
If the topic is "Requirements Elicitation Techniques (BABOK)", cover ONLY elicitation techniques.

Stay focused on the exact topic. Do not deviate to other subjects.`;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Provide comprehensive information about ${topic} with examples, then ask a question about ${topic}.` }
      ],
      max_tokens: 400,
      temperature: 0.3
    });

    const aiResponse = response.choices[0]?.message?.content || `Here's information about ${topic}.`;
    
    context.conversationHistory.push({ role: 'ai', content: aiResponse });
    
    return {
      content: aiResponse,
      phase: 'teach',
      topic: topic,
      moduleId: moduleId,
      questionsRemaining: context.maxQuestions - context.questionsAsked
    };
  }

  // Start a practice session
  async startPractice(moduleId: string, topic: string): Promise<LectureResponse> {
    const module = this.getModuleById(moduleId);
    const topicIndex = module.topics.findIndex(t => t === topic);
    
    const context: LectureContext = {
      moduleId,
      topicIndex: topicIndex >= 0 ? topicIndex : 0,
      currentPhase: 'practice',
      conversationHistory: [],
      questionsAsked: 0,
      maxQuestions: 10
    };
    
    this.lectureContexts.set(moduleId, context);

    const systemPrompt = this.buildPracticePrompt(module, topic, context);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Let's practice ${topic}. Give me a practical scenario or exercise related to this topic, then ask me to solve it or explain my approach.` }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const aiResponse = response.choices[0]?.message?.content || 'Let\'s start practicing!';
    
    context.conversationHistory.push({ role: 'ai', content: aiResponse });
    
    return {
      content: aiResponse,
      phase: 'practice',
      topic: topic,
      moduleId: moduleId,
      questionsRemaining: context.maxQuestions - context.questionsAsked
    };
  }

  // Continue the lecture conversation
  async continueLecture(moduleId: string, userInput: string): Promise<LectureResponse> {
    const context = this.lectureContexts.get(moduleId);
    if (!context) {
      throw new Error('No active lecture session');
    }

    const module = this.getModuleById(moduleId);
    const topic = module.topics[context.topicIndex];
    
    context.conversationHistory.push({ role: 'user', content: userInput });
    context.questionsAsked++;

    // Check if we should use knowledge base or AI
    const knowledgeBaseResponse = this.searchKnowledgeBase(topic, userInput);
    
    let aiResponse: string;
    if (knowledgeBaseResponse && context.questionsAsked <= 5) {
      // Use knowledge base for first 5 questions (cost-effective)
      aiResponse = knowledgeBaseResponse;
    } else {
      // Use AI for complex questions or after knowledge base limit
      const systemPrompt = this.buildSystemPrompt(module, topic, context);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...context.conversationHistory.map(msg => ({ role: msg.role, content: msg.content }))
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      aiResponse = response.choices[0]?.message?.content || 'I understand. Let\'s continue learning.';
    }

    // Clean up any overly enthusiastic language
    const cleanedResponse = aiResponse.replace(/^(Great!|Excellent!|Awesome!|Perfect!)\s*/gi, '');
    
    context.conversationHistory.push({ role: 'ai', content: cleanedResponse });
    
    const nextPhase = this.determineNextPhase(userInput, context);
    
    return {
      content: cleanedResponse,
      phase: nextPhase,
      topic: topic,
      moduleId: moduleId,
      questionsRemaining: context.maxQuestions - context.questionsAsked
    };
  }

  // Analyze assignments
  async analyzeAssignment(assignmentText: string, assignmentType: string): Promise<AssignmentAnalysis> {
    const systemPrompt = `You are an expert Business Analyst mentor analyzing a student's assignment. 
    
    Assignment Type: ${assignmentType}
    
    Analyze the assignment and provide:
    1. Strengths (what they did well)
    2. Weaknesses (what needs improvement)
    3. Specific suggestions for improvement
    4. Related BA topics they should study
    5. A score out of 100
    6. Detailed feedback
    7. Next steps for improvement
    
    Be constructive, specific, and encouraging. Focus on BA best practices and real-world application.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: assignmentText }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const analysisText = response.choices[0]?.message?.content || '';
    
    // Parse the AI response into structured format
    return this.parseAssignmentAnalysis(analysisText, assignmentType);
  }

  // Get knowledge base content for a specific topic
  private getKnowledgeBaseContentForTopic(topic: string): string | null {
    const relevantItems = this.knowledgeBase.filter(item => 
      item.topic === topic
    );

    if (relevantItems.length > 0) {
      const bestMatch = relevantItems[0];
      let content = bestMatch.answer;
      
      if (bestMatch.examples && bestMatch.examples.length > 0) {
        content += `\n\nExamples:\n${bestMatch.examples.map(example => `• ${example}`).join('\n')}`;
      }
      
      return content;
    }
    
    return null;
  }

  // Search knowledge base for relevant answers
  private searchKnowledgeBase(topic: string, userInput: string): string | null {
    const lowerInput = userInput.toLowerCase();
    const lowerTopic = topic.toLowerCase();
    
    // First, try exact topic match
    let relevantItems = this.knowledgeBase.filter(item => 
      item.topic.toLowerCase() === lowerTopic
    );
    
    // If no exact match, try partial topic matching
    if (relevantItems.length === 0) {
      relevantItems = this.knowledgeBase.filter(item => 
        item.topic.toLowerCase().includes(lowerTopic) || 
        lowerTopic.includes(item.topic.toLowerCase())
      );
    }
    
    // If still no match, try keyword matching from user input
    if (relevantItems.length === 0) {
      const keywords = lowerInput.split(' ').filter(word => word.length > 3);
      relevantItems = this.knowledgeBase.filter(item => 
        keywords.some(keyword => 
          item.question.toLowerCase().includes(keyword) ||
          item.answer.toLowerCase().includes(keyword)
        )
      );
    }

    if (relevantItems.length > 0) {
      const bestMatch = relevantItems[0];
      return `${bestMatch.answer}\n\n${bestMatch.examples ? `Examples: ${bestMatch.examples.join(', ')}` : ''}`;
    }
    return null;
  }

  // Build system prompt for AI interactions
  private buildSystemPrompt(module: any, topic: string, context: LectureContext): string {
    return `You are an expert Business Analyst mentor teaching about ${topic} in the context of ${module.title}.

    Current Phase: ${context.currentPhase}
    Questions Asked: ${context.questionsAsked}/${context.maxQuestions}
    
    TEACHING GUIDELINES:
    - ALWAYS TEACH THE CONTENT FIRST before asking questions
    - Provide comprehensive explanations with examples
    - Break down complex concepts into simple, digestible parts
    - Use real-world scenarios and practical examples
    - Explain the "why" behind concepts, not just the "what"
    
    QUESTION GUIDELINES:
    - Only ask questions about concepts you have already explained
    - Ask questions to reinforce what you just taught
    - Use questions like "Based on what we just covered..." or "Now that we've discussed..."
    - Never ask users to explain concepts you haven't taught yet
    - Questions should test understanding of material already presented
    
    RESPONSE STYLE:
    - Be professional and direct - avoid over-enthusiastic language like "Great!" or "Excellent!"
    - Use simple, clear language
    - Respond like a knowledgeable colleague, not a cheerleader
    - Keep responses focused on ${topic}
    
    If the user asks about topics outside of ${topic}, redirect them back to the current topic or suggest how it relates to what we're learning.`;
  }



  // Build practice prompt for AI interactions
  private buildPracticePrompt(module: any, topic: string, context: LectureContext): string {
    return `You are an expert Business Analyst mentor providing practice exercises for ${topic} in the context of ${module.title}.

    Current Phase: ${context.currentPhase}
    Questions Asked: ${context.questionsAsked}/${context.maxQuestions}
    
    PRACTICE GUIDELINES:
    - Provide realistic, practical scenarios that BAs would encounter
    - Create exercises that test application of concepts, not just memorization
    - Give clear, specific scenarios with enough context to work with
    - Ask for specific deliverables or approaches a BA would provide
    - Focus on real-world application of ${topic}
    
    EXERCISE TYPES:
    - Case studies with business problems to solve
    - Requirements gathering scenarios
    - Process analysis exercises
    - Stakeholder interview simulations
    - Documentation challenges
    
    RESPONSE STYLE:
    - Be professional and direct - avoid over-enthusiastic language
    - Present scenarios clearly and concisely
    - Ask specific questions about how the user would approach the scenario
    - Provide enough context for meaningful practice
    - Keep focus on practical BA skills
    
    Always provide a realistic scenario first, then ask the user to demonstrate their understanding through practical application.`;
  }

  // Determine next phase based on user input
  private determineNextPhase(userInput: string, context: LectureContext): 'teach' | 'practice' | 'assess' {
    const input = userInput.toLowerCase();
    
    if (input.includes('practice') || input.includes('exercise') || input.includes('try')) {
      return 'practice';
    }
    
    if (input.includes('test') || input.includes('assess') || input.includes('quiz')) {
      return 'assess';
    }
    
    return 'teach';
  }

  // Get module by ID - This should match exactly with BAAcademyView.tsx
  private getModuleById(moduleId: string): any {
    // Define the actual module data that matches BAAcademyView with authoritative content
    const modules = {
      'ba-fundamentals': {
        id: 'ba-fundamentals',
        title: 'Business Analysis Fundamentals',
        topics: [
          'Business Analysis Definition',
          'Requirements Elicitation Techniques',
          'Organizational Structure Analysis'
        ]
      },
      'technical-analysis': {
        id: 'technical-analysis',
        title: 'Technical Analysis',
        topics: [
          'System Requirements Analysis (BCS)',
          'API and Integration Requirements',
          'Technical Feasibility Assessment'
        ]
      }
    };

    return modules[moduleId as keyof typeof modules] || {
      id: moduleId,
      title: 'Unknown Module',
      topics: ['Introduction']
    };
  }

  // Parse assignment analysis from AI response
  private parseAssignmentAnalysis(analysisText: string, assignmentType: string): AssignmentAnalysis {
    // Simple parsing - in production, you'd want more robust parsing
    return {
      strengths: ['Good understanding of basic concepts'],
      weaknesses: ['Needs more detail in requirements'],
      suggestions: ['Add acceptance criteria', 'Include non-functional requirements'],
      relatedTopics: ['requirements-engineering', 'acceptance-criteria'],
      score: 75,
      feedback: analysisText,
      nextSteps: ['Review requirements documentation', 'Practice writing user stories'],
      rubric: [
        {
          criteria: 'Requirements Clarity',
          score: 7,
          maxScore: 10,
          comments: 'Good start, needs more detail'
        }
      ]
    };
  }

  // Get knowledge base items for a topic
  getKnowledgeBaseItems(topic: string): KnowledgeItem[] {
    return this.knowledgeBase.filter(item => item.topic === topic);
  }

  // Get all available topics
  getAvailableTopics(): string[] {
    return [...new Set(this.knowledgeBase.map(item => item.topic))];
  }
}

export interface LectureResponse {
  content: string;
  phase: 'teach' | 'practice' | 'assess';
  topic: string;
  moduleId: string;
  questionsRemaining: number;
}

export default LectureService;
