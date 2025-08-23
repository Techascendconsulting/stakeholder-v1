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

  // Comprehensive BA Knowledge Base - Authoritative BCS/IIBA/BABOK Content
  private knowledgeBase: KnowledgeItem[] = [
    // Business Analysis Definition (BABOK)
    {
      id: 'ba-definition-1',
      topic: 'Business Analysis Definition (BABOK)',
      question: 'What is Business Analysis and what does it involve?',
      answer: `Business Analysis is the practice of enabling change in organizations by identifying business needs and recommending solutions that deliver value to stakeholders. It's about understanding how organizations work and helping them improve their processes, systems, and capabilities.

**Core Purpose of Business Analysis**:
Business Analysis exists to bridge the gap between business problems and technical solutions. It helps organizations understand what they need to change, why they need to change it, and how to implement those changes successfully.

**What Business Analysts Do**:
- **Understand Business Context**: Analyze how organizations function, their goals, challenges, and operating environment
- **Identify Problems and Opportunities**: Discover inefficiencies, gaps, and areas for improvement in business processes
- **Define Requirements**: Document what the organization needs to achieve its goals and solve its problems
- **Recommend Solutions**: Propose changes to processes, systems, or organizational structures
- **Facilitate Change**: Help organizations implement and adopt new ways of working
- **Validate Outcomes**: Ensure that changes deliver the expected value and benefits

**Key Areas of Focus**:
1. **Strategic Analysis**: Understanding organizational goals, market position, and competitive landscape
2. **Process Analysis**: Examining current workflows, identifying inefficiencies, and designing improved processes
3. **Requirements Engineering**: Gathering, analyzing, and documenting what stakeholders need
4. **Solution Assessment**: Evaluating proposed solutions and their impact on the organization
5. **Change Management**: Helping organizations adapt to new processes and systems
6. **Stakeholder Management**: Working with people across the organization to understand their needs and concerns

**The Business Analysis Process**:
1. **Discovery**: Understanding the current state and identifying problems or opportunities
2. **Analysis**: Breaking down complex problems into manageable components
3. **Design**: Creating solutions that address identified needs
4. **Implementation**: Supporting the rollout of changes
5. **Validation**: Ensuring that changes deliver the expected benefits

**Value Delivered by Business Analysis**:
- **Reduced Costs**: Identifying inefficiencies and eliminating waste
- **Improved Efficiency**: Streamlining processes and workflows
- **Better Customer Experience**: Understanding customer needs and improving service delivery
- **Risk Mitigation**: Identifying potential problems before they occur
- **Informed Decision Making**: Providing clear analysis and recommendations
- **Successful Change**: Ensuring that organizational changes are implemented effectively

**Business Analysis vs Other Roles**:
- **Project Managers**: Focus on delivering projects on time and budget; BAs focus on delivering the right solution
- **Systems Analysts**: Focus on technical system requirements; BAs focus on business needs and processes
- **Product Managers**: Focus on product strategy and roadmap; BAs focus on organizational change and improvement
- **Consultants**: May provide strategic advice; BAs provide detailed analysis and implementation support

**Skills Required for Business Analysis**:
- **Analytical Thinking**: Breaking down complex problems and understanding root causes
- **Communication**: Explaining complex concepts to different audiences
- **Facilitation**: Leading workshops and meetings to gather information
- **Documentation**: Creating clear, comprehensive requirements and process documents
- **Stakeholder Management**: Working effectively with people at all levels of the organization
- **Technical Understanding**: Knowing enough about technology to understand possibilities and constraints
- **Business Acumen**: Understanding how organizations work and what drives success

**Common Business Analysis Deliverables**:
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
    {
      id: 'ba-competencies-1',
      topic: 'Core BA Competencies (IIBA)',
      question: 'What are the core competencies of a Business Analyst according to IIBA?',
      answer: 'IIBA defines six core competencies: Analytical Thinking and Problem Solving, Behavioral Characteristics, Business Knowledge, Communication Skills, Interaction Skills, and Tools and Technology. These competencies enable BAs to effectively perform their role and deliver value to organizations.',
      examples: ['Using analytical thinking to break down complex business problems', 'Applying business knowledge to understand industry context', 'Using communication skills to bridge business and technical teams'],
      relatedTopics: ['business-analysis-definition', 'requirements-engineering'],
      difficulty: 'beginner'
    },
    {
      id: 'ba-planning-1',
      topic: 'Business Analysis Planning and Monitoring',
      question: 'What is Business Analysis Planning and Monitoring?',
      answer: 'Business Analysis Planning and Monitoring is a BABOK knowledge area that involves planning how to approach business analysis activities, monitoring the performance of business analysis work, and ensuring the business analysis approach is appropriate for the situation. It includes stakeholder analysis, governance, information management, and performance improvement.',
      examples: ['Creating a business analysis plan for a new project', 'Identifying and analyzing stakeholders', 'Establishing requirements governance processes'],
      relatedTopics: ['business-analysis-definition', 'stakeholder-management'],
      difficulty: 'beginner'
    },
    
    // Organizational Structure Analysis (BCS)
    {
      id: 'org-structure-1',
      topic: 'Organizational Structure Analysis (BCS)',
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
1. **The Official Structure** - what's on the org chart
2. **The Real Structure** - how things actually get done

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
1. **Who needs to be involved?** (Not just who should be involved)
2. **How do decisions really get made?** (Not how they're supposed to get made)
3. **What will make this project succeed or fail?** (Based on how the organization actually works)

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
    
    // Requirements Elicitation Techniques (BABOK)
    {
      id: 'requirements-elicitation-1',
      topic: 'Requirements Elicitation Techniques (BABOK)',
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
    {
      id: 'requirements-analysis-1',
      topic: 'Requirements Analysis and Documentation',
      question: 'What is Requirements Analysis and Design Definition according to BABOK?',
      answer: 'Requirements Analysis and Design Definition is a BABOK knowledge area that involves organizing, specifying, and modeling requirements and designs. It includes specifying and modeling requirements, verifying requirements, validating requirements, defining requirements architecture, defining design options, analyzing potential value, and recommending solutions.',
      examples: ['Creating requirements models using UML or BPMN', 'Specifying functional and non-functional requirements', 'Validating requirements with stakeholders'],
      relatedTopics: ['requirements-engineering', 'solution-evaluation'],
      difficulty: 'intermediate'
    },
    {
      id: 'requirements-classification-1',
      topic: 'Requirements Classification and Types',
      question: 'How does BABOK classify different types of requirements?',
      answer: 'BABOK classifies requirements into several categories: Business Requirements (high-level goals), Stakeholder Requirements (needs of specific stakeholders), Solution Requirements (functional and non-functional), and Transition Requirements (temporary needs for change). Understanding these classifications helps BAs organize and prioritize requirements effectively.',
      examples: ['Business requirement: "Increase customer satisfaction by 20%"', 'Functional requirement: "System must allow users to reset passwords"', 'Non-functional requirement: "System must respond within 2 seconds"'],
      relatedTopics: ['requirements-engineering', 'requirements-analysis'],
      difficulty: 'intermediate'
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
      id: 'requirements-analysis-1',
      topic: 'Requirements Analysis and Documentation',
      question: 'What is Requirements Analysis and Design Definition according to BABOK?',
      answer: 'Requirements Analysis and Design Definition is a BABOK knowledge area that involves organizing, specifying, and modeling requirements and designs. It includes specifying and modeling requirements, verifying requirements, validating requirements, defining requirements architecture, defining design options, analyzing potential value, and recommending solutions.',
      examples: ['Creating requirements models using UML or BPMN', 'Specifying functional and non-functional requirements', 'Validating requirements with stakeholders'],
      relatedTopics: ['requirements-engineering', 'solution-evaluation'],
      difficulty: 'intermediate'
    },
    {
      id: 'agile-principles-1',
      topic: 'Agile BA Principles and Values',
      question: 'What are the core principles of Agile Business Analysis according to IIBA?',
      answer: 'IIBA Agile Extension defines key principles: See the Whole, Think as a Customer, Analyze to Determine What is Valuable, Get Real Using Examples, Understand What is Doable, Stimulate Collaboration and Continuous Improvement, and Avoid Waste. These principles guide BAs in delivering value through iterative, collaborative approaches.',
      examples: ['Using customer journey mapping to see the whole experience', 'Creating user stories with real examples and acceptance criteria', 'Collaborating with development teams to understand technical constraints'],
      relatedTopics: ['agile-business-analysis', 'requirements-engineering'],
      difficulty: 'intermediate'
    },

    // Technical Analysis Topics
    {
      id: 'system-analysis-1',
      topic: 'System Analysis Techniques',
      question: 'What are the key system analysis techniques for BAs?',
      answer: 'Key system analysis techniques include: System context diagrams, data flow diagrams, entity relationship diagrams, use case modeling, and system interface analysis. These techniques help BAs understand how systems interact, identify integration points, and document technical requirements for software solutions.',
      examples: ['Creating system context diagrams to show system boundaries', 'Mapping data flows between systems', 'Documenting API requirements for system integration'],
      relatedTopics: ['technical-analysis', 'requirements-gathering'],
      difficulty: 'intermediate'
    },
    {
      id: 'api-integration-1',
      topic: 'API and Integration Requirements',
      question: 'How do BAs gather requirements for API and system integration?',
      answer: 'BAs gather API integration requirements by understanding data exchange needs, identifying system interfaces, documenting data formats, defining authentication requirements, and specifying error handling. They work with technical teams to ensure APIs meet business needs while following technical standards.',
      examples: ['Documenting data exchange requirements between CRM and ERP systems', 'Specifying API endpoints for mobile app integration', 'Defining authentication and security requirements'],
      relatedTopics: ['technical-analysis', 'system-analysis'],
      difficulty: 'intermediate'
    },
    {
      id: 'database-requirements-1',
      topic: 'Database Requirements Analysis',
      question: 'What is involved in database requirements analysis for BAs?',
      answer: 'Database requirements analysis involves understanding data needs, identifying data entities and relationships, documenting data validation rules, specifying reporting requirements, and ensuring data quality standards. BAs translate business data needs into technical database specifications.',
      examples: ['Mapping customer data requirements for a CRM system', 'Defining data validation rules for user input', 'Specifying reporting and analytics data needs'],
      relatedTopics: ['technical-analysis', 'data-modeling'],
      difficulty: 'intermediate'
    },
    {
      id: 'technical-docs-1',
      topic: 'Technical Documentation Standards',
      question: 'What are the key technical documentation standards for BAs?',
      answer: 'Key technical documentation standards include: Requirements specifications, technical specifications, API documentation, data dictionaries, and system architecture documents. BAs ensure documentation is clear, complete, and follows industry standards for technical teams.',
      examples: ['Writing detailed requirements specifications', 'Creating API documentation for developers', 'Maintaining data dictionaries for system integration'],
      relatedTopics: ['technical-analysis', 'documentation'],
      difficulty: 'intermediate'
    },
    {
      id: 'technical-feasibility-1',
      topic: 'Technical Feasibility Assessment',
      question: 'How do BAs assess technical feasibility of requirements?',
      answer: 'BAs assess technical feasibility by evaluating technology constraints, resource availability, timeline requirements, and risk factors. They collaborate with technical teams to understand implementation challenges and ensure requirements are achievable within project constraints.',
      examples: ['Evaluating if a requirement can be implemented with current technology', 'Assessing development effort and timeline requirements', 'Identifying technical risks and mitigation strategies'],
      relatedTopics: ['technical-analysis', 'project-management'],
      difficulty: 'intermediate'
    },

    // Process Modeling Topics
    {
      id: 'bpmn-1',
      topic: 'BPMN Notation',
      question: 'What is BPMN and how do BAs use it?',
      answer: 'BPMN (Business Process Model and Notation) is a standard for modeling business processes using visual symbols. BAs use BPMN to create process flow diagrams, document business workflows, identify inefficiencies, and communicate process requirements to technical teams.',
      examples: ['Creating process flow diagrams for customer onboarding', 'Mapping current vs future state processes', 'Identifying process bottlenecks and improvement opportunities'],
      relatedTopics: ['process-modeling', 'business-processes'],
      difficulty: 'intermediate'
    },
    {
      id: 'swimlane-1',
      topic: 'Swimlane Diagrams',
      question: 'How do BAs use swimlane diagrams?',
      answer: 'Swimlane diagrams show process flows across different departments or roles. BAs use them to identify handoffs between teams, clarify responsibilities, and identify process inefficiencies. They help visualize how work flows through an organization.',
      examples: ['Mapping customer service process across Sales, Support, and Billing teams', 'Identifying handoff points and responsibilities', 'Documenting approval workflows across management levels'],
      relatedTopics: ['process-modeling', 'organizational-structure'],
      difficulty: 'intermediate'
    },
    {
      id: 'current-future-state-1',
      topic: 'Current vs Future State Mapping',
      question: 'How do BAs map current vs future state processes?',
      answer: 'BAs map current state processes to understand existing workflows, then design future state processes to show desired improvements. This gap analysis helps identify changes needed, resource requirements, and implementation steps for process optimization.',
      examples: ['Documenting current manual process vs future automated workflow', 'Identifying process improvements and efficiency gains', 'Planning change management for process transitions'],
      relatedTopics: ['process-modeling', 'change-management'],
      difficulty: 'intermediate'
    },
    {
      id: 'gap-analysis-1',
      topic: 'Gap Analysis',
      question: 'What is gap analysis in BA work?',
      answer: 'Gap analysis identifies the difference between current state and desired future state. BAs use it to identify missing capabilities, process inefficiencies, technology gaps, and resource needs. It helps prioritize improvements and plan implementation strategies.',
      examples: ['Identifying missing system capabilities for business needs', 'Analyzing process gaps between departments', 'Assessing technology gaps for digital transformation'],
      relatedTopics: ['process-modeling', 'requirements-analysis'],
      difficulty: 'intermediate'
    },
    {
      id: 'process-optimization-1',
      topic: 'Process Optimization',
      question: 'How do BAs optimize business processes?',
      answer: 'BAs optimize processes by identifying inefficiencies, eliminating redundant steps, automating manual tasks, improving handoffs, and enhancing user experience. They use data analysis, stakeholder feedback, and process modeling to design improved workflows.',
      examples: ['Automating manual data entry processes', 'Streamlining approval workflows', 'Improving customer service response times'],
      relatedTopics: ['process-modeling', 'efficiency-improvement'],
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

    // First, try to get content from knowledge base for this specific topic
    const knowledgeBaseContent = this.getKnowledgeBaseContentForTopic(topic);
    
    if (knowledgeBaseContent) {
      // Use knowledge base content directly
      const aiResponse = `Let me teach you about ${topic}.\n\n${knowledgeBaseContent}\n\nBased on what I just taught you about ${topic}, what questions do you have?`;
      
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
    const systemPrompt = `You are teaching about the specific topic: "${topic}". 

CRITICAL: You must ONLY teach about "${topic}" and nothing else. Do not teach about other BA topics.

If the topic is "Requirements Classification and Types", teach ONLY about how requirements are classified and the different types of requirements.
If the topic is "Business Analysis Definition (BABOK)", teach ONLY about BABOK's definition of business analysis.
If the topic is "Core BA Competencies (IIBA)", teach ONLY about IIBA's core competencies.
If the topic is "Requirements Elicitation Techniques (BABOK)", teach ONLY about BABOK's elicitation techniques.

Stay focused on the exact topic. Do not deviate to other subjects.`;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Teach me specifically about ${topic}. Provide a comprehensive explanation with examples, then ask a question about ${topic}.` }
      ],
      max_tokens: 400,
      temperature: 0.3
    });

    const aiResponse = response.choices[0]?.message?.content || `Let me teach you about ${topic}.`;
    
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

  // Build practice prompt for hands-on exercises
  private buildPracticePrompt(module: any, topic: string, context: LectureContext): string {
    return `You are an expert Business Analyst mentor creating practice exercises for ${topic} in the context of ${module.title}.

    Current Phase: ${context.currentPhase}
    Questions Asked: ${context.questionsAsked}/${context.maxQuestions}
    
    PRACTICE GUIDELINES:
    - Create realistic, practical scenarios that BAs would encounter in real work
    - Provide clear context and background information
    - Ask specific questions that test practical application of concepts
    - Give students opportunities to think through problems step-by-step
    - Focus on real-world application, not just theoretical knowledge
    
    EXERCISE TYPES:
    - Case studies with business scenarios
    - Requirements gathering exercises
    - Process modeling challenges
    - Stakeholder analysis scenarios
    - Documentation exercises
    
    RESPONSE STYLE:
    - Be professional and direct - avoid over-enthusiastic language
    - Use simple, clear language
    - Provide constructive feedback on student responses
    - Keep exercises focused on ${topic}
    - Encourage critical thinking and practical problem-solving
    
    Create exercises that help students apply ${topic} concepts in realistic business situations.`;
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
      'organizational-context': {
        id: 'organizational-context',
        title: 'Organizational Context & Business Operations',
        topics: [
          'Organizational Structure Analysis (BCS)',
          'Business Operating Models',
          'Organizational Culture Assessment',
          'Stakeholder Landscape Mapping',
          'Business Context Understanding',
          'Organizational Change Readiness'
        ]
      },
      'project-lifecycle': {
        id: 'project-lifecycle',
        title: 'Project Lifecycle & IT Team Structure',
        topics: [
          'Project Lifecycle Management (BABOK)',
          'IT Team Structure and Roles',
          'Software Development Lifecycle',
          'Requirements Lifecycle Management',
          'Solution Evaluation Planning',
          'Cross-functional Team Collaboration'
        ]
      },
      'ba-fundamentals': {
        id: 'ba-fundamentals',
        title: 'Business Analysis Fundamentals',
        topics: [
          'Business Analysis Definition (BABOK)',
          'Core BA Competencies (IIBA)',
          'Business Analysis Planning and Monitoring',
          'Elicitation and Collaboration',
          'Requirements Analysis and Design Definition',
          'Solution Evaluation'
        ]
      },
      'requirements-gathering': {
        id: 'requirements-gathering',
        title: 'Requirements Engineering',
        topics: [
          'Requirements Elicitation Techniques (BABOK)',
          'Requirements Analysis and Documentation',
          'Requirements Classification and Types',
          'Requirements Validation and Verification',
          'Requirements Traceability Management',
          'Requirements Change Management'
        ]
      },
      'agile-techniques': {
        id: 'agile-techniques',
        title: 'Agile Business Analysis',
        topics: [
          'Agile BA Principles and Values',
          'User Story Development and Refinement',
          'Sprint Planning and Backlog Management',
          'Agile Requirements Lifecycle',
          'Continuous Stakeholder Engagement',
          'Agile Solution Evaluation'
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
