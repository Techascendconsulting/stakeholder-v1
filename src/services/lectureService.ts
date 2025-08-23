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

  // Clean Knowledge Base - Only Correct Content
  private knowledgeBase: KnowledgeItem[] = [
    // Business Analysis Definition
    {
      id: 'ba-definition-1',
      topic: 'Business Analysis Definition',
      question: 'What is Business Analysis and what does it involve?',
      answer: `Business Analysis is the practice of enabling change in organizations by identifying business needs and recommending solutions that deliver value to stakeholders. It's about understanding how organizations work and helping them improve their processes, systems, and capabilities.

**Core Purpose of Business Analysis**
Business Analysis exists to bridge the gap between business problems and technical solutions. It helps organizations understand what they need to change, why they need to change it, and how to implement those changes successfully.

**What Business Analysts Do**
- Understand Business Context: Analyze how organizations function, their goals, challenges, and operating environment
- Identify Problems and Opportunities: Discover inefficiencies, gaps, and areas for improvement in business processes
- Define Requirements: Document what the organization needs to achieve its goals and solve its problems
- Recommend Solutions: Propose changes to processes, systems, or organizational structures
- Facilitate Change: Help organizations implement and adopt new ways of working
- Validate Outcomes: Ensure that changes deliver the expected value and benefits

**Key Areas of Focus**
1. Strategic Analysis: Understanding organizational goals, market position, and competitive landscape
2. Process Analysis: Examining current workflows, identifying inefficiencies, and designing improved processes
3. Requirements Engineering: Gathering, analyzing, and documenting what stakeholders need
4. Solution Assessment: Evaluating proposed solutions and their impact on the organization
5. Change Management: Helping organizations adapt to new processes and systems
6. Stakeholder Management: Working with people across the organization to understand their needs and concerns

**The Business Analysis Process**
1. Discovery: Understanding the current state and identifying problems or opportunities
2. Analysis: Breaking down complex problems into manageable components
3. Design: Creating solutions that address identified needs
4. Implementation: Supporting the rollout of changes
5. Validation: Ensuring that changes deliver the expected benefits

**Value Delivered by Business Analysis**
- Reduced Costs: Identifying inefficiencies and eliminating waste
- Improved Efficiency: Streamlining processes and workflows
- Better Customer Experience: Understanding customer needs and improving service delivery
- Risk Mitigation: Identifying potential problems before they occur
- Informed Decision Making: Providing clear analysis and recommendations
- Successful Change: Ensuring that organizational changes are implemented effectively

**Business Analysis vs Other Roles**
- Project Managers: Focus on delivering projects on time and budget; BAs focus on delivering the right solution
- Systems Analysts: Focus on technical system requirements; BAs focus on business needs and processes
- Product Managers: Focus on product strategy and roadmap; BAs focus on organizational change and improvement
- Consultants: May provide strategic advice; BAs provide detailed analysis and implementation support

**Skills Required for Business Analysis**
- Analytical Thinking: Breaking down complex problems and understanding root causes
- Communication: Explaining complex concepts to different audiences
- Facilitation: Leading workshops and meetings to gather information
- Documentation: Creating clear, comprehensive requirements and process documents
- Stakeholder Management: Working effectively with people at all levels of the organization
- Technical Understanding: Knowing enough about technology to understand possibilities and constraints
- Business Acumen: Understanding how organizations work and what drives success

**Common Business Analysis Deliverables**
- Business requirements documents
- Process models and flowcharts
- Stakeholder analysis and communication plans
- Requirements traceability matrices
- Solution assessment reports
- Change management plans
- User stories and acceptance criteria
- Business cases and feasibility studies`,
      examples: [
        'Analyzing a customer service process to identify why response times are slow and recommending improvements',
        'Working with sales teams to understand their needs for a new CRM system and documenting requirements',
        'Facilitating workshops with multiple departments to design a new order fulfillment process',
        'Creating a business case for implementing an automated invoicing system to reduce manual work',
        'Leading the requirements gathering for a new e-commerce platform that will increase online sales'
      ],
      relatedTopics: ['requirements-engineering', 'stakeholder-management'],
      difficulty: 'beginner'
    },

    // Requirements Elicitation Techniques
    {
      id: 'requirements-elicitation-1',
      topic: 'Requirements Elicitation Techniques',
      question: 'What are the key requirements elicitation techniques and how do you use them effectively?',
      answer: `Requirements elicitation is the process of gathering information from stakeholders to understand their needs and requirements. Here are the key techniques and how to use them effectively:

**Interviews**: One-on-one or group conversations with stakeholders to understand their needs, pain points, and expectations. Prepare structured questions, listen actively, and document responses thoroughly. Use open-ended questions to explore needs and closed questions to confirm understanding.

**Workshops**: Collaborative sessions with multiple stakeholders to gather requirements, resolve conflicts, and reach consensus. Facilitate discussions, use visual aids like whiteboards, and ensure all voices are heard. Workshops are excellent for complex requirements that need input from multiple perspectives.

**Document Analysis**: Review existing documentation, processes, and systems to understand current state and identify requirements. Analyze user manuals, process flows, system documentation, and business rules. This technique helps understand what exists and what needs to change.

**Observation**: Watch users perform their work to understand actual processes and identify unstated requirements. Observe in the natural work environment, take detailed notes, and look for workarounds and inefficiencies that users might not mention in interviews.

**Surveys and Questionnaires**: Collect information from large groups of stakeholders efficiently. Design clear, focused questions, use both quantitative and qualitative approaches, and follow up with interviews for deeper insights.

**Prototyping**: Create mockups or working models to help stakeholders visualize and refine requirements. Use wireframes, storyboards, or interactive prototypes to gather feedback and iterate on requirements.

**Focus Groups**: Bring together representative stakeholders to discuss requirements in a moderated setting. Use this technique to understand group dynamics, identify common needs, and explore different perspectives on requirements.

**Brainstorming**: Generate creative ideas and solutions through structured group sessions. Set clear objectives, encourage all ideas without criticism, and use techniques like mind mapping to organize thoughts.

**Interface Analysis**: Examine how systems and processes interact to identify integration requirements and dependencies. Map data flows, system interfaces, and user interactions to understand complete requirements.

**Process Modeling**: Create visual representations of current and future processes to identify requirements. Use flowcharts, swim lane diagrams, and process maps to understand workflows and identify improvement opportunities.

**When to Use Each Technique**:
- Use interviews for initial exploration and detailed requirements gathering
- Use workshops for complex requirements involving multiple stakeholders
- Use document analysis when understanding existing systems and processes
- Use observation when users can't articulate their needs clearly
- Use surveys for gathering input from large groups efficiently
- Use prototyping when requirements are unclear or need visualization
- Use focus groups for understanding group perspectives and priorities
- Use brainstorming for generating creative solutions and alternatives
- Use interface analysis for system integration and data flow requirements
- Use process modeling for understanding workflows and identifying improvements

**Best Practices**:
- Always prepare thoroughly for each technique
- Use multiple techniques to validate and cross-check requirements
- Document everything clearly and consistently
- Involve the right stakeholders for each technique
- Follow up on unclear or conflicting information
- Validate requirements with stakeholders after gathering them
- Consider the context and constraints when selecting techniques
- Be flexible and adapt techniques to the specific situation`,
      examples: [
        'Conducting structured interviews with sales managers to understand CRM requirements',
        'Facilitating a requirements workshop with IT, business, and end users to define a new customer portal',
        'Analyzing existing order processing documentation to identify gaps in current system',
        'Observing customer service representatives to understand their actual workflow and pain points',
        'Creating wireframe prototypes of a mobile app to gather user feedback on interface requirements'
      ],
      relatedTopics: ['requirements-engineering', 'stakeholder-management'],
      difficulty: 'beginner'
    },

    // Organizational Structure Analysis
    {
      id: 'org-structure-1',
      topic: 'Organizational Structure Analysis',
      question: 'How do Business Analysts analyze organizational structure?',
      answer: `Imagine you're starting a new project at a company you've never worked with before. You walk in on day one and everyone seems to know who to talk to about what, but you're completely lost. That's exactly why Business Analysts need to understand organizational structure.

**The Real Problem**
When you don't understand how an organization works, you end up:
- Talking to the wrong people about the wrong things
- Missing key stakeholders who will block your project
- Designing solutions that don't fit how the company actually operates
- Wasting time going through the wrong approval channels

**The Simple Truth**
Every organization has two structures:
1. The Official Structure - what's on the org chart
2. The Real Structure - how things actually get done

**A Real Example**
Let's say you're implementing a new CRM system. The org chart shows that IT reports to the CFO, so you think you need the CFO's approval. But in reality, the IT director has a direct line to the CEO and makes all the technology decisions. If you don't know this, you'll waste weeks going through the wrong approval process.

**What You Actually Need to Do**

**Step 1: Draw the Picture**
Start with the official org chart, but then add the real relationships. Who actually makes decisions? Who do people go to when they need something done quickly? Who has influence even though they're not in charge?

**Step 2: Follow the Money (and Information)**
- Where do decisions actually get made?
- How does information flow through the organization?
- Who gets copied on important emails?
- Who gets invited to key meetings?

**Step 3: Understand the Culture**
- How do people prefer to communicate? (Email, meetings, hallway conversations?)
- What's the decision-making style? (Consensus, top-down, collaborative?)
- How do they handle change? (Embrace it, resist it, need lots of explanation?)

**The Three Questions That Matter**
1. Who needs to be involved? (Not just who should be involved)
2. How do decisions really get made? (Not how they're supposed to get made)
3. What will make this project succeed or fail? (Based on how the organization actually works)

**Practical Tools You'll Actually Use**

**The Stakeholder Map**
Draw a simple diagram with three circles:
- Inner circle: People who can kill your project
- Middle circle: People who can help or hurt your project
- Outer circle: People who need to know what's happening

**The Communication Plan**
Based on how the organization actually works:
- Who needs to hear what, when, and how?
- What's the best way to reach each person?
- Who should deliver each message?

**The Change Readiness Assessment**
- How has this organization handled similar changes?
- Who are the natural champions and resistors?
- What's the best approach for this specific organization?

**Real-World Application**
When you understand organizational structure, you can:
- Identify the right stakeholders early
- Plan communications that actually reach people
- Design solutions that fit the organization's style
- Anticipate and avoid common pitfalls
- Build support for your recommendations

**The Bottom Line**
Organizational structure analysis isn't about memorizing theories or creating complex diagrams. It's about understanding how to get things done in the specific organization you're working with. The better you understand how the organization really works, the more successful your projects will be.`,
      examples: [
        'Mapping reporting relationships to understand who needs to approve a new system implementation',
        'Analyzing communication patterns between sales and operations to identify process improvement opportunities',
        'Identifying key influencers in the organization who can help drive adoption of a new process',
        'Assessing how a matrix structure affects decision-making for a cross-functional project',
        'Understanding cultural norms to plan effective change management for a new technology rollout'
      ],
      relatedTopics: ['business-operating-models', 'stakeholder-management'],
      difficulty: 'beginner'
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
          'Business Analysis Definition (BABOK)',
          'Requirements Elicitation Techniques (BABOK)',
          'Organizational Structure Analysis (BCS)'
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
