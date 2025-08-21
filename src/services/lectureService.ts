import OpenAI from 'openai';

// Knowledge Base Structure
interface KnowledgeItem {
  id: string;
  topic: string;
  question: string;
  answer: string;
  examples?: string[];
  relatedTopics?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

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

  // Comprehensive BA Knowledge Base
  private knowledgeBase: KnowledgeItem[] = [
    // Phase 1: Foundation
    {
      id: 'org-context-1',
      topic: 'organizational-context',
      question: 'How do organizations operate and why do they need BAs?',
      answer: 'Organizations operate through interconnected departments that work together to deliver products/services to customers. Each department has specific functions, systems, and processes. BAs are needed because these systems often don\'t work together efficiently, creating pain points that impact customer experience and business performance.',
      examples: ['Sales team uses Salesforce, but customer service uses a different system', 'Marketing generates leads, but there\'s no clear handoff process'],
      relatedTopics: ['stakeholder-analysis', 'process-modeling'],
      difficulty: 'beginner'
    },
    {
      id: 'org-context-2',
      topic: 'organizational-context',
      question: 'What are the main departments in a typical organization?',
      answer: 'Typical organizations have: Sales (customer acquisition), Marketing (brand awareness), Customer Service (support), IT (technology), Operations (day-to-day processes), Finance (budgeting), HR (people management), and Product (development). Each department has specific goals, systems, and pain points that BAs help identify and solve.',
      examples: ['Sales focuses on closing deals', 'Customer Service focuses on retention', 'IT focuses on system stability'],
      relatedTopics: ['stakeholder-analysis', 'project-lifecycle'],
      difficulty: 'beginner'
    },
    {
      id: 'org-context-3',
      topic: 'organizational-context',
      question: 'How do departments work together to serve customers?',
      answer: 'Departments work in a customer journey flow: Marketing generates leads, Sales converts them to customers, Onboarding/Implementation teams set up the customer, Customer Service provides ongoing support, and Operations handles day-to-day delivery. Each department depends on the previous one and passes information to the next, creating handoff points where inefficiencies often occur.',
      examples: ['Marketing passes leads to Sales via CRM', 'Sales passes customer info to Onboarding team', 'Onboarding hands off to Customer Service for ongoing support'],
      relatedTopics: ['process-modeling', 'stakeholder-analysis'],
      difficulty: 'beginner'
    },
    {
      id: 'org-context-4',
      topic: 'organizational-context',
      question: 'What is the role of IT teams in organizations?',
      answer: 'IT teams provide technology infrastructure and support: Hardware (computers, servers, networks), Software (licenses, installations, updates), System Administration (user accounts, security, backups), and Implementation (customizing software for business needs). IT teams work with all departments to ensure technology supports business processes effectively.',
      examples: ['IT provides laptops and software to new employees', 'IT customizes CRM system for Sales team workflows', 'IT maintains servers and ensures system uptime'],
      relatedTopics: ['project-lifecycle', 'requirements-engineering'],
      difficulty: 'beginner'
    },
    {
      id: 'org-context-5',
      topic: 'organizational-context',
      question: 'How do products and services determine organizational structure?',
      answer: 'The products/services a company offers directly shape its departments and processes. Software companies need Product Development teams, service companies need Customer Success teams, and manufacturing companies need Supply Chain teams. The customer journey and delivery model determine which departments exist and how they interact.',
      examples: ['SaaS company: Sales → Onboarding → Customer Success → Support', 'Consulting firm: Sales → Project Delivery → Account Management', 'Manufacturing: Sales → Production → Quality Control → Shipping'],
      relatedTopics: ['process-modeling', 'stakeholder-analysis'],
      difficulty: 'intermediate'
    },
    {
      id: 'org-context-6',
      topic: 'organizational-context',
      question: 'What are common inefficiencies between departments?',
      answer: 'Common inefficiencies include: Manual data entry between systems, unclear handoff processes, duplicate work across departments, lack of shared visibility into customer status, and conflicting priorities between teams. These inefficiencies create delays, errors, and poor customer experience that BAs help identify and solve.',
      examples: ['Sales updates CRM but Customer Service doesn\'t see the updates', 'Onboarding team recreates customer data that Sales already collected', 'Marketing campaigns don\'t align with Sales capacity'],
      relatedTopics: ['process-modeling', 'requirements-elicitation'],
      difficulty: 'intermediate'
    },
    {
      id: 'stakeholder-1',
      topic: 'stakeholder-analysis',
      question: 'How do you identify stakeholders in a project?',
      answer: 'Stakeholder identification involves finding everyone affected by or affecting the project. Start with obvious stakeholders (end users, managers), then expand to indirect stakeholders (regulators, partners). Use techniques like stakeholder mapping, organizational charts, and process flows to ensure comprehensive coverage.',
      examples: ['For a CRM system: sales reps, sales managers, IT support, customers', 'For a payment system: finance team, customers, banks, compliance'],
      relatedTopics: ['requirements-elicitation', 'communication-planning'],
      difficulty: 'beginner'
    },
    {
      id: 'questions-1',
      topic: 'asking-right-questions',
      question: 'What\'s the difference between open and closed questions?',
      answer: 'Open questions encourage detailed responses and exploration (What, How, Why, Tell me about). Closed questions get specific yes/no or factual answers (Do you, Is it, How many). BAs use open questions to understand problems and closed questions to confirm details and validate assumptions.',
      examples: ['Open: "What problems do you face daily?"', 'Closed: "Do you use the current system more than 5 times per day?"'],
      relatedTopics: ['requirements-elicitation', 'stakeholder-interviews'],
      difficulty: 'beginner'
    },
    {
      id: 'questions-2',
      topic: 'asking-right-questions',
      question: 'How do you ask probing questions effectively?',
      answer: 'Probing questions dig deeper into initial responses. Use "Why?" to understand motivations, "How?" to understand processes, "What if?" to explore scenarios, and "Can you give me an example?" to get concrete details. Always follow up on vague or incomplete answers.',
      examples: ['"You mentioned it\'s slow - how long does it typically take?"', '"Why is that important to your team?"'],
      relatedTopics: ['requirements-elicitation', 'problem-discovery'],
      difficulty: 'intermediate'
    },
    {
      id: 'elicitation-1',
      topic: 'requirements-elicitation',
      question: 'What are the main requirements elicitation techniques?',
      answer: 'Key techniques include: Interviews (one-on-one conversations), Workshops (group sessions), Observation (watching users work), Document Analysis (reviewing existing materials), Surveys (questionnaires), and Prototyping (creating mockups). Each technique has strengths and is used based on stakeholder availability and project needs.',
      examples: ['Interviews for detailed understanding', 'Workshops for group consensus', 'Observation for process understanding'],
      relatedTopics: ['asking-right-questions', 'stakeholder-analysis'],
      difficulty: 'beginner'
    },
    {
      id: 'requirements-1',
      topic: 'requirements-engineering',
      question: 'What are the different types of requirements?',
      answer: 'Requirements fall into three main categories: Functional (what the system must do), Non-Functional (how well it must perform), and Business (why it\'s needed). Functional requirements describe features, Non-Functional cover performance, security, usability, and Business requirements explain the business value and objectives.',
      examples: ['Functional: "User must be able to login"', 'Non-Functional: "System must respond within 2 seconds"', 'Business: "Reduce customer support calls by 30%"'],
      relatedTopics: ['requirements-documentation', 'acceptance-criteria'],
      difficulty: 'beginner'
    },
    {
      id: 'process-modeling-1',
      topic: 'process-modeling',
      question: 'What is BPMN and why is it important?',
      answer: 'BPMN (Business Process Model and Notation) is a standard for modeling business processes. It uses visual symbols to represent activities, decisions, events, and flows. BPMN is important because it provides a common language for BAs, developers, and stakeholders to understand and communicate about business processes.',
      examples: ['Rectangles for activities', 'Diamonds for decisions', 'Circles for events', 'Arrows for flows'],
      relatedTopics: ['process-analysis', 'gap-analysis'],
      difficulty: 'intermediate'
    },
    {
      id: 'user-stories-1',
      topic: 'user-stories',
      question: 'What is the INVEST criteria for user stories?',
      answer: 'INVEST stands for: Independent (can be developed separately), Negotiable (details can be discussed), Valuable (provides user value), Estimable (can be sized), Small (can be completed in one sprint), and Testable (can be verified). These criteria help ensure user stories are well-formed and actionable.',
      examples: ['Independent: "As a user, I want to login" vs "As a user, I want to login and see my profile"', 'Small: Break large stories into smaller, focused ones'],
      relatedTopics: ['acceptance-criteria', 'story-points'],
      difficulty: 'intermediate'
    },
    {
      id: 'agile-1',
      topic: 'agile-techniques',
      question: 'What is the role of a BA in agile ceremonies?',
      answer: 'BAs participate in all agile ceremonies: Sprint Planning (clarify requirements), Daily Standups (report blockers), Sprint Review (demonstrate value), and Sprint Retrospective (improve process). BAs focus on ensuring requirements are clear, prioritized, and deliver business value while supporting the team\'s understanding of user needs.',
      examples: ['Sprint Planning: Clarify acceptance criteria', 'Sprint Review: Explain business value delivered'],
      relatedTopics: ['user-stories', 'backlog-management'],
      difficulty: 'intermediate'
    }
  ];

  private constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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

    const systemPrompt = this.buildSystemPrompt(module, topic, context);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Start teaching me about ${topic}. Begin with an engaging introduction and ask me a question to test my understanding.` }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const aiResponse = response.choices[0]?.message?.content || 'Let\'s start learning!';
    
    context.conversationHistory.push({ role: 'ai', content: aiResponse });
    
    return {
      content: aiResponse,
      phase: 'teach',
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

  // Search knowledge base for relevant answers
  private searchKnowledgeBase(topic: string, userInput: string): string | null {
    const relevantItems = this.knowledgeBase.filter(item => 
      item.topic === topic || 
      userInput.toLowerCase().includes(item.question.toLowerCase().split(' ')[0])
    );

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
    
    Guidelines:
    - Keep responses concise and focused on ${topic}
    - Ask follow-up questions to test understanding
    - Provide real-world examples when possible
    - If the user asks about other topics, relate it back to ${topic}
    - Be professional and direct - avoid over-enthusiastic language like "Great!" or "Excellent!"
    - Use simple, clear language
    - Respond like a knowledgeable colleague, not a cheerleader
    
    If the user asks about topics outside of ${topic}, redirect them back to the current topic or suggest how it relates to what we're learning.`;
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

  // Get module by ID
  private getModuleById(moduleId: string): any {
    // This would be replaced with actual module data
    return {
      id: moduleId,
      title: 'Sample Module',
      topics: ['Topic 1', 'Topic 2', 'Topic 3']
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
