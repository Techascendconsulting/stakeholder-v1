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
    // Software BA Role and Responsibilities
    {
      id: 'ba-role-1',
      topic: 'Software BA Role and Responsibilities',
      question: 'What is the role of a Software Business Analyst?',
      answer: 'A Software Business Analyst bridges the gap between business needs and technical solutions. They analyze business processes, gather requirements, document specifications, and ensure the final software meets business objectives. BAs act as translators between stakeholders and development teams.',
      examples: ['Gathering requirements from sales team for a new CRM feature', 'Documenting user stories for a mobile app', 'Analyzing current processes to identify automation opportunities'],
      relatedTopics: ['requirements-gathering', 'stakeholder-analysis'],
      difficulty: 'beginner'
    },
    {
      id: 'ba-role-2',
      topic: 'Software BA Role and Responsibilities',
      question: 'What are the key responsibilities of a Software BA?',
      answer: 'Key responsibilities include: Requirements elicitation and analysis, stakeholder management, process modeling, user story creation, acceptance criteria definition, testing coordination, and change management. BAs ensure software solutions align with business goals and user needs.',
      examples: ['Conducting stakeholder interviews', 'Creating process flow diagrams', 'Writing detailed user stories with acceptance criteria'],
      relatedTopics: ['requirements-gathering', 'agile-techniques'],
      difficulty: 'beginner'
    },
    {
      id: 'ba-role-3',
      topic: 'Software BA Role and Responsibilities',
      question: 'How does a BA contribute to software development?',
      answer: 'BAs contribute by understanding business problems, translating them into technical requirements, ensuring clear communication between business and IT teams, validating solutions meet business needs, and facilitating user acceptance testing. They are the voice of the business in technical discussions.',
      examples: ['Creating detailed requirements documents', 'Facilitating sprint planning sessions', 'Coordinating user acceptance testing'],
      relatedTopics: ['agile-techniques', 'requirements-gathering'],
      difficulty: 'beginner'
    },
    
    // Understanding Organizational Structure
    {
      id: 'org-structure-1',
      topic: 'Understanding Organizational Structure',
      question: 'How do organizations structure their departments?',
      answer: 'Organizations structure departments based on function (Sales, Marketing, IT), product lines, customer segments, or geographic regions. Each structure has implications for how information flows, decisions are made, and projects are managed. BAs need to understand these structures to identify stakeholders and process inefficiencies.',
      examples: ['Functional structure: separate Sales, Marketing, IT departments', 'Product-based: teams organized around specific products', 'Matrix structure: employees report to both functional and project managers'],
      relatedTopics: ['stakeholder-analysis', 'process-modeling'],
      difficulty: 'beginner'
    },
    {
      id: 'org-structure-2',
      topic: 'Understanding Organizational Structure',
      question: 'Why is understanding organizational structure important for BAs?',
      answer: 'Understanding organizational structure helps BAs identify all relevant stakeholders, understand reporting relationships, navigate organizational politics, identify process handoffs between departments, and ensure requirements capture needs across the entire organization, not just individual departments.',
      examples: ['Identifying that a CRM change affects Sales, Marketing, and Customer Service', 'Understanding that approval processes involve multiple management levels'],
      relatedTopics: ['stakeholder-analysis', 'requirements-gathering'],
      difficulty: 'beginner'
    },
    
    // Department Functions and Interactions
    {
      id: 'dept-functions-1',
      topic: 'Department Functions and Interactions',
      question: 'How do different departments interact in an organization?',
      answer: 'Departments interact through formal processes (handoffs, approvals) and informal communication (meetings, emails). Key interaction points include customer journey touchpoints, data sharing, and cross-functional projects. BAs map these interactions to identify inefficiencies and improvement opportunities.',
      examples: ['Sales hands off new customers to Customer Success', 'Marketing provides leads to Sales', 'IT supports all departments with technology'],
      relatedTopics: ['process-modeling', 'stakeholder-analysis'],
      difficulty: 'beginner'
    },
    
    // BA vs Product Manager vs Product Owner
    {
      id: 'ba-vs-pm-1',
      topic: 'BA vs Product Manager vs Product Owner',
      question: 'What is the difference between a BA, Product Manager, and Product Owner?',
      answer: 'A Business Analyst focuses on requirements analysis and process improvement. A Product Manager owns the product vision and strategy. A Product Owner (Agile role) manages the product backlog and works with development teams. BAs often work closely with both, providing detailed analysis and requirements.',
      examples: ['BA: analyzes current processes and documents requirements', 'Product Manager: defines product roadmap and business strategy', 'Product Owner: prioritizes user stories and works with Scrum team'],
      relatedTopics: ['agile-techniques', 'requirements-gathering'],
      difficulty: 'beginner'
    },
    
    // Software Development Lifecycle
    {
      id: 'sdlc-1',
      topic: 'Software Development Lifecycle',
      question: 'What is the Software Development Lifecycle (SDLC)?',
      answer: 'The SDLC is a framework for developing software applications. It includes phases like Requirements Gathering, Design, Development, Testing, Deployment, and Maintenance. BAs are primarily involved in the Requirements phase but may participate throughout to ensure business needs are met.',
      examples: ['Waterfall: sequential phases with detailed planning upfront', 'Agile: iterative development with frequent feedback', 'DevOps: continuous integration and deployment'],
      relatedTopics: ['agile-techniques', 'requirements-gathering'],
      difficulty: 'beginner'
    },
    
    // Agile vs Waterfall Overview
    {
      id: 'agile-waterfall-1',
      topic: 'Agile vs Waterfall Overview',
      question: 'What are the key differences between Agile and Waterfall?',
      answer: 'Waterfall is a sequential approach where all requirements are defined upfront, while Agile is iterative with evolving requirements. Waterfall has rigid phases, while Agile has flexible sprints. BAs in Waterfall focus on comprehensive documentation, while Agile BAs focus on user stories and continuous collaboration.',
      examples: ['Waterfall: detailed requirements document before development starts', 'Agile: user stories refined throughout development', 'Waterfall: testing at the end, Agile: continuous testing'],
      relatedTopics: ['agile-techniques', 'requirements-gathering'],
      difficulty: 'beginner'
    },
    
    // User Story Writing and Development
    {
      id: 'user-stories-1',
      topic: 'User Story Writing and Development',
      question: 'How do you write effective user stories?',
      answer: 'User stories follow the format: "As a [user], I want [feature] so that [benefit]." They should be user-focused, independent, negotiable, valuable, estimable, small, and testable (INVEST). Include acceptance criteria that define when the story is complete.',
      examples: ['"As a sales rep, I want to see customer history so that I can provide better service"', 'Acceptance criteria: customer data displays, search functionality works, data is current'],
      relatedTopics: ['agile-techniques', 'requirements-gathering'],
      difficulty: 'beginner'
    },
    
    // Sprint Planning and Backlog Management
    {
      id: 'sprint-planning-1',
      topic: 'Sprint Planning and Backlog Management',
      question: 'What is the BA role in sprint planning?',
      answer: 'BAs prepare user stories for sprint planning by ensuring they are well-defined with clear acceptance criteria. They participate in sprint planning to clarify requirements, answer questions from the development team, and help estimate story points. BAs also maintain the product backlog.',
      examples: ['Refining user stories before sprint planning', 'Clarifying acceptance criteria during planning', 'Updating backlog based on stakeholder feedback'],
      relatedTopics: ['agile-techniques', 'user-stories'],
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

    const systemPrompt = this.buildSystemPrompt(module, topic, context);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Start teaching me about ${topic}. Provide a comprehensive explanation with examples, then ask a question to test my understanding of what you just taught.` }
      ],
      max_tokens: 400,
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
    // Define the actual module data that matches BAAcademyView
    const modules = {
      'organizational-context': {
        id: 'organizational-context',
        title: 'Organizational Context & Business Operations',
        topics: [
          'Understanding Organizational Structure',
          'Department Functions and Interactions',
          'Customer Journey Across Departments',
          'IT Team Roles and Responsibilities',
          'Products/Services Impact on Structure',
          'Common Departmental Inefficiencies'
        ]
      },
      'project-lifecycle': {
        id: 'project-lifecycle',
        title: 'Project Lifecycle & IT Team Structure',
        topics: [
          'Project Emergence from Business Needs',
          'IT Team Structure and Roles',
          'Hardware and Software Implementation',
          'Problem Phase: Stakeholder Engagement',
          'Delivery Phase: Development Team Collaboration',
          'Cross-functional Team Dynamics'
        ]
      },
      'ba-fundamentals': {
        id: 'ba-fundamentals',
        title: 'Software BA Fundamentals',
        topics: [
          'Software BA Role and Responsibilities',
          'BA vs Product Manager vs Product Owner',
          'Software Development Lifecycle',
          'Agile vs Waterfall Overview',
          'Essential BA Tools'
        ]
      },
      'requirements-gathering': {
        id: 'requirements-gathering',
        title: 'Requirements Gathering',
        topics: [
          'User Story Writing and Development',
          'Stakeholder Interview Techniques',
          'Workshop Facilitation Skills',
          'Requirements Documentation Standards',
          'Acceptance Criteria Development'
        ]
      },
      'agile-techniques': {
        id: 'agile-techniques',
        title: 'Agile BA Techniques',
        topics: [
          'Sprint Planning and Backlog Management',
          'Agile Ceremonies for BAs',
          'User Story Refinement',
          'Sprint Review and Retrospective',
          'Agile Metrics and Reporting',
          'BA Team Management'
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
