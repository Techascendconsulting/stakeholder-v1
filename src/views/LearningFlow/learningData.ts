/**
 * Learning Flow Data - Real Content from Existing Pages
 * 
 * Extracts actual teaching content from Core Learning, Elicitation, etc.
 * and structures it into sequential modules with lessons
 */

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration?: string;
  type: 'reading' | 'video' | 'interactive';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  lessons: Lesson[];
  assignmentTitle: string;
  assignmentDescription: string;
}

// Helper to convert concept to markdown lesson content
const conceptToMarkdown = (title: string, description: string, keyPoints: string[]): string => {
  return `# ${title}

${description}

## Key Points

${keyPoints.map(point => `- ${point}`).join('\n')}

## What This Means for You

Understanding this concept is foundational to your work as a Business Analyst. As you progress, you'll apply these principles in real project scenarios.`;
};

/**
 * 10 BA Learning Modules - Using Real App Content
 */
export const LEARNING_MODULES: Module[] = [
  // MODULE 1: Core Learning (BA Fundamentals) - ALL 14 CONCEPTS
  {
    id: 'module-1-core-learning',
    title: 'Core Learning',
    description: 'Foundation concepts every Business Analyst must know',
    icon: '📚',
    color: 'blue',
    order: 1,
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Who Is a Business Analyst?',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Who Is a Business Analyst?',
          'A Business Analyst helps organisations solve business problems. They work across teams to understand needs and shape the right solutions. They don\'t build the solution — they define and clarify it. The BA role exists because businesses often struggle to explain problems clearly.',
          [
            'A Business Analyst helps organisations solve business problems.',
            'They work across teams to understand needs and shape the right solutions.',
            'They don\'t build the solution — they define and clarify it.',
            'The BA role exists because businesses often struggle to explain problems clearly.'
          ]
        )
      },
      {
        id: 'lesson-1-2',
        title: 'How Organisations Work',
        type: 'reading',
        duration: '7 min',
        content: conceptToMarkdown(
          'How Organisations Work',
          'Every organisation either sells products, services, or both. They exist to deliver value — money, time saved, or impact. Understanding what they sell helps you understand their goals. BA work always ties back to business performance and value.',
          [
            'Every organisation either sells products, services, or both.',
            'They exist to deliver value — money, time saved, or impact.',
            'Understanding what they sell helps you understand their goals.',
            'BA work always ties back to business performance and value.'
          ]
        )
      },
      {
        id: 'lesson-1-3',
        title: 'Departments in an Organisation',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Departments in an Organisation',
          'Common departments include Sales, Marketing, Finance, Operations, Compliance, and Customer Service. Each one has its own goals and pain points. BAs often work across departments to understand where processes break down. Knowing who does what helps you ask better questions and involve the right people.',
          [
            'Common departments include Sales, Marketing, Finance, Operations, Compliance, and Customer Service.',
            'Each one has its own goals and pain points.',
            'BAs often work across departments to understand where processes break down.',
            'Knowing who does what helps you ask better questions and involve the right people.'
          ]
        )
      },
      {
        id: 'lesson-1-4',
        title: 'Why Projects Happen',
        type: 'reading',
        duration: '7 min',
        content: conceptToMarkdown(
          'Why Projects Happen',
          'Projects are usually triggered by problems, regulations, inefficiencies, or growth plans. They are time-bound and goal-driven — not ongoing tasks. The BA helps define the project clearly before it begins. Your work prevents wasted time and money solving the wrong thing.',
          [
            'Projects are usually triggered by problems, regulations, inefficiencies, or growth plans.',
            'They are time-bound and goal-driven — not ongoing tasks.',
            'The BA helps define the project clearly before it begins.',
            'Your work prevents wasted time and money solving the wrong thing.'
          ]
        )
      },
      {
        id: 'lesson-1-5',
        title: 'Why BAs Are Hired',
        type: 'reading',
        duration: '6 min',
        content: conceptToMarkdown(
          'Why BAs Are Hired',
          'Without BAs, teams may waste time building the wrong solution. The BA adds clarity, structure, and alignment. They reduce risk, surface hidden needs, and ensure what gets delivered actually helps. BAs are paid to improve decision-making before the build starts.',
          [
            'Without BAs, teams may waste time building the wrong solution.',
            'The BA adds clarity, structure, and alignment.',
            'They reduce risk, surface hidden needs, and ensure what gets delivered actually helps.',
            'BAs are paid to improve decision-making before the build starts.'
          ]
        )
      },
      {
        id: 'lesson-1-6',
        title: 'What a BA Does (and Doesn\'t Do)',
        type: 'reading',
        duration: '7 min',
        content: conceptToMarkdown(
          'What a BA Does (and Doesn\'t Do)',
          'They ask questions, gather info, and document what the business really needs. They write clear requirements — not vague guesses. They don\'t code, design, or test directly — but support those who do. Their job is to define the \'what\' and \'why\' — not the \'how\'.',
          [
            'They ask questions, gather info, and document what the business really needs.',
            'They write clear requirements — not vague guesses.',
            'They don\'t code, design, or test directly — but support those who do.',
            'Their job is to define the \'what\' and \'why\' — not the \'how\'.'
          ]
        )
      },
      {
        id: 'lesson-1-7',
        title: 'How a BA Works',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'How a BA Works',
          'They speak with stakeholders to uncover goals, gaps, and conflicts. They map out current and future states. They write user stories, acceptance criteria, and sometimes process flows. They support delivery teams by keeping the focus on solving the right problem.',
          [
            'They speak with stakeholders to uncover goals, gaps, and conflicts.',
            'They map out current and future states.',
            'They write user stories, acceptance criteria, and sometimes process flows.',
            'They support delivery teams by keeping the focus on solving the right problem.'
          ]
        )
      },
      {
        id: 'lesson-1-8',
        title: 'Agile and Waterfall',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'Agile and Waterfall',
          'Waterfall means plan everything up front, then build. Agile means break the work into small chunks and adjust along the way. In Agile, BAs work closely with teams during each sprint. In Waterfall, BAs often define everything before development begins.',
          [
            'Waterfall means plan everything up front, then build.',
            'Agile means break the work into small chunks and adjust along the way.',
            'In Agile, BAs work closely with teams during each sprint.',
            'In Waterfall, BAs often define everything before development begins.'
          ]
        )
      },
      {
        id: 'lesson-1-9',
        title: 'Understanding the Problem',
        type: 'reading',
        duration: '7 min',
        content: conceptToMarkdown(
          'Understanding the Problem',
          'Most people focus on symptoms — BAs go deeper. Good BAs ask "What\'s really going wrong here?" You\'re not paid to guess — you\'re paid to confirm. The wrong solution to the wrong problem still fails.',
          [
            'Most people focus on symptoms — BAs go deeper.',
            'Good BAs ask "What\'s really going wrong here?"',
            'You\'re not paid to guess — you\'re paid to confirm.',
            'The wrong solution to the wrong problem still fails.'
          ]
        )
      },
      {
        id: 'lesson-1-10',
        title: 'Working With Stakeholders',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'Working With Stakeholders',
          'BAs interview stakeholders to understand different perspectives. You\'ll deal with conflict, uncertainty, and unclear needs. Listening well builds trust — guessing loses it. Keep stakeholders involved and aligned.',
          [
            'BAs interview stakeholders to understand different perspectives.',
            'You\'ll deal with conflict, uncertainty, and unclear needs.',
            'Listening well builds trust — guessing loses it.',
            'Keep stakeholders involved and aligned.'
          ]
        )
      },
      {
        id: 'lesson-1-11',
        title: 'Working With Developers',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Working With Developers',
          'Developers rely on you to explain what needs to be built — clearly. You don\'t need to know code, but you must speak clearly and be available. You remove confusion and answer questions — fast. When you\'re clear, developers build better and faster.',
          [
            'Developers rely on you to explain what needs to be built — clearly.',
            'You don\'t need to know code, but you must speak clearly and be available.',
            'You remove confusion and answer questions — fast.',
            'When you\'re clear, developers build better and faster.'
          ]
        )
      },
      {
        id: 'lesson-1-12',
        title: 'Understanding Systems and Processes',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Understanding Systems and Processes',
          'Processes = what people do. Systems = the tools they use to do it. BAs map out both — especially when things aren\'t working. A great system can still fail if the process behind it is broken. Always check how people and tech interact — that\'s where the truth is.',
          [
            'Processes = what people do. Systems = the tools they use to do it.',
            'BAs map out both — especially when things aren\'t working.',
            'A great system can still fail if the process behind it is broken.',
            'Always check how people and tech interact — that\'s where the truth is.'
          ]
        )
      },
      {
        id: 'lesson-1-13',
        title: 'Spotting Inefficiencies',
        type: 'reading',
        duration: '7 min',
        content: conceptToMarkdown(
          'Spotting Inefficiencies',
          'Look for delays, double entry, unclear handoffs, and manual rework. You may hear: "It\'s just how we do it." That\'s your cue. Inefficiencies hide inside normal routines. Your job is to question what everyone else ignores.',
          [
            'Look for delays, double entry, unclear handoffs, and manual rework.',
            'You may hear: "It\'s just how we do it." That\'s your cue.',
            'Inefficiencies hide inside normal routines.',
            'Your job is to question what everyone else ignores.'
          ]
        )
      },
      {
        id: 'lesson-1-14',
        title: 'Tools Business Analysts Use',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Tools Business Analysts Use',
          'Common tools: Jira (requirements), Confluence (documentation), Excel (data), Miro (flows), Lucidchart (diagrams). You\'ll use CRM systems, ticketing platforms, and internal apps too. You don\'t need to master them all — just know how to use them for clarity. Good thinking always matters more than flashy tools.',
          [
            'Common tools: Jira (requirements), Confluence (documentation), Excel (data), Miro (flows), Lucidchart (diagrams).',
            'You\'ll use CRM systems, ticketing platforms, and internal apps too.',
            'You don\'t need to master them all — just know how to use them for clarity.',
            'Good thinking always matters more than flashy tools.'
          ]
        )
      }
    ],
    assignmentTitle: 'BA Role Understanding',
    assignmentDescription: 'In your own words, explain what a Business Analyst does and why organizations hire them. Include at least 3 specific responsibilities.'
  },

  // MODULE 2: Project Initiation
  {
    id: 'module-2-project-initiation',
    title: 'Project Initiation',
    description: 'Learn how projects start and the BA\'s role from day one',
    icon: '🚀',
    color: 'purple',
    order: 2,
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'What a BA Does (and Doesn\'t Do)',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'What a BA Does (and Doesn\'t Do)',
          'They ask questions, gather info, and document what the business really needs. They write clear requirements — not vague guesses. They don\'t code, design, or test directly — but support those who do. Their job is to define the \'what\' and \'why\' — not the \'how\'.',
          [
            'They ask questions, gather info, and document what the business really needs.',
            'They write clear requirements — not vague guesses.',
            'They don\'t code, design, or test directly — but support those who do.',
            'Their job is to define the \'what\' and \'why\' — not the \'how\'.'
          ]
        )
      },
      {
        id: 'lesson-2-2',
        title: 'How a BA Works',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'How a BA Works',
          'They speak with stakeholders to uncover goals, gaps, and conflicts. They map out current and future states. They write user stories, acceptance criteria, and sometimes process flows. They support delivery teams by keeping the focus on solving the right problem.',
          [
            'They speak with stakeholders to uncover goals, gaps, and conflicts.',
            'They map out current and future states.',
            'They write user stories, acceptance criteria, and sometimes process flows.',
            'They support delivery teams by keeping the focus on solving the right problem.'
          ]
        )
      }
    ],
    assignmentTitle: 'BA Workflow Analysis',
    assignmentDescription: 'Describe the key activities a BA performs during project initiation. What questions should they ask first?'
  },

  // MODULE 3: Requirements Elicitation
  {
    id: 'module-3-elicitation',
    title: 'Requirements Elicitation',
    description: 'Master the art of gathering requirements from stakeholders',
    icon: '🎯',
    color: 'green',
    order: 3,
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Working With Stakeholders',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'Working With Stakeholders',
          'BAs interview stakeholders to understand different perspectives. You\'ll deal with conflict, uncertainty, and unclear needs. Listening well builds trust — guessing loses it. Keep stakeholders involved and aligned.',
          [
            'BAs interview stakeholders to understand different perspectives.',
            'You\'ll deal with conflict, uncertainty, and unclear needs.',
            'Listening well builds trust — guessing loses it.',
            'Keep stakeholders involved and aligned.'
          ]
        )
      },
      {
        id: 'lesson-3-2',
        title: 'Elicitation Techniques',
        type: 'reading',
        duration: '12 min',
        content: `# Elicitation Techniques

Different situations require different approaches to gathering requirements.

## Common Techniques

### 1. **Interviews** (One-on-One)
Best for deep dives with key stakeholders. Prepare open-ended questions and listen actively.

### 2. **Workshops** (Group Sessions)
Best for aligning multiple stakeholders and resolving conflicts. Use facilitation techniques.

### 3. **Observation**
Watch how people actually work vs. what they say they do. Identify workarounds and pain points.

### 4. **Document Analysis**
Review existing documentation, system manuals, and compliance requirements.

### 5. **Prototyping**
Build mockups to clarify unclear requirements and get visual feedback.

## Key Principle

Ask open-ended questions: "How does this work today?" not "Do you want feature X?"`
      }
    ],
    assignmentTitle: 'Elicitation Strategy',
    assignmentDescription: 'Choose an elicitation technique and explain when you would use it and why. Provide a specific scenario.'
  },

  // MODULE 4: Process Mapping
  {
    id: 'module-4-process-mapping',
    title: 'Process Mapping',
    description: 'Visualize and analyze business processes',
    icon: '🗺️',
    color: 'indigo',
    order: 4,
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'Understanding Systems and Processes',
        type: 'reading',
        duration: '8 min',
        content: conceptToMarkdown(
          'Understanding Systems and Processes',
          'Processes = what people do. Systems = the tools they use to do it. BAs map out both — especially when things aren\'t working. A great system can still fail if the process behind it is broken. Always check how people and tech interact — that\'s where the truth is.',
          [
            'Processes = what people do. Systems = the tools they use to do it.',
            'BAs map out both — especially when things aren\'t working.',
            'A great system can still fail if the process behind it is broken.',
            'Always check how people and tech interact — that\'s where the truth is.'
          ]
        )
      },
      {
        id: 'lesson-4-2',
        title: 'Spotting Inefficiencies',
        type: 'reading',
        duration: '7 min',
        content: conceptToMarkdown(
          'Spotting Inefficiencies',
          'Look for delays, double entry, unclear handoffs, and manual rework. You may hear: "It\'s just how we do it." That\'s your cue. Inefficiencies hide inside normal routines. Your job is to question what everyone else ignores.',
          [
            'Look for delays, double entry, unclear handoffs, and manual rework.',
            'You may hear: "It\'s just how we do it." That\'s your cue.',
            'Inefficiencies hide inside normal routines.',
            'Your job is to question what everyone else ignores.'
          ]
        )
      }
    ],
    assignmentTitle: 'Process Analysis',
    assignmentDescription: 'Map a simple "as-is" process (e.g., customer refund request) and identify 2-3 inefficiencies or bottlenecks.'
  },

  // MODULE 5: Requirements Engineering
  {
    id: 'module-5-requirements-engineering',
    title: 'Requirements Engineering',
    description: 'Document, validate, and manage requirements',
    icon: '⚙️',
    color: 'orange',
    order: 5,
    lessons: [
      {
        id: 'lesson-5-1',
        title: 'Types of Requirements',
        type: 'reading',
        duration: '10 min',
        content: `# Types of Requirements

Not all requirements are the same. Understanding types helps you organize and prioritize.

## Functional Requirements
What the system must DO:
- "System must allow photo upload"
- "System must send confirmation email"
- "System must validate email format"

## Non-Functional Requirements (NFRs)
How the system should PERFORM:
- Performance: "Page loads in < 2 seconds"
- Security: "Passwords must be encrypted"
- Usability: "Mobile responsive"

## Business Rules
Policies and logic:
- "Refunds only within 30 days"
- "Managers approve up to £5,000"
- "Students under 18 need parent consent"

## Constraints
Limitations you must work within:
- Budget caps
- Technology restrictions
- Compliance requirements`
      }
    ],
    assignmentTitle: 'Requirements Classification',
    assignmentDescription: 'Given a scenario, write 2 functional requirements, 2 non-functional requirements, and 1 business rule.'
  },

  // MODULE 6: Solution Options  
  {
    id: 'module-6-solution-options',
    order: 6,
    title: 'Solution Options',
    description: 'Evaluate and recommend solutions',
    icon: '💡',
    color: 'yellow',
    lessons: [
      {
        id: 'lesson-6-1',
        title: 'Evaluating Alternatives',
        type: 'reading',
        duration: '12 min',
        content: `# Evaluating Solution Alternatives

Rarely is there only one way to solve a problem.

## Common Solution Types

### 1. Build Custom
- Full control, exact fit
- High cost, high time

### 2. Buy Off-the-Shelf
- Fast deployment, proven
- Less flexibility

### 3. Configure Existing
- Leverage what you have
- Limited by current tech

### 4. SaaS/Outsource
- No maintenance
- Vendor dependency

## Decision Criteria
- Cost (initial + ongoing)
- Time to deploy
- Risk level
- Scalability
- Business fit

Use a decision matrix to score and compare options objectively.`
      }
    ],
    assignmentTitle: 'Solution Comparison',
    assignmentDescription: 'Evaluate 3 solution options for a business problem using a decision matrix. Recommend the best option and justify your choice.'
  },

  // MODULE 7: Documentation (User Stories & ACs)
  {
    id: 'module-7-documentation',
    title: 'Documentation',
    description: 'Write clear, testable user stories and acceptance criteria',
    icon: '✍️',
    color: 'teal',
    order: 7,
    lessons: [
      {
        id: 'lesson-7-1',
        title: 'User Story Format',
        type: 'reading',
        duration: '10 min',
        content: `# User Story Format

User stories are the building blocks of Agile development.

## The Standard Format

**As a** [role]  
**I want** [action]  
**So that** [benefit]

### Example
**As a** customer  
**I want** to reset my password  
**So that** I can regain access to my account

## INVEST Criteria
- **I**ndependent
- **N**egotiable  
- **V**aluable
- **E**stimable
- **S**mall
- **T**estable

Without "so that", you might build features nobody needs.`
      },
      {
        id: 'lesson-7-2',
        title: 'Acceptance Criteria',
        type: 'reading',
        duration: '12 min',
        content: `# Acceptance Criteria

ACs define when a story is "done."

## Given-When-Then Format

**Given** [context]  
**When** [action]  
**Then** [expected outcome]

### Example

**AC 1:**  
Given I am on the login page  
When I click "Forgot Password"  
Then I should see a password reset form

**AC 2:**  
Given I enter a valid email  
When I click "Send Reset Link"  
Then I receive an email within 5 minutes

Good ACs are specific, testable, and cover edge cases.`
      }
    ],
    assignmentTitle: 'User Story Writing',
    assignmentDescription: 'Write 2 user stories with 3 acceptance criteria each for a tenant repair request system. Follow INVEST principles.'
  },

  // MODULE 8: Design
  {
    id: 'module-8-design',
    title: 'Design',
    description: 'Understand design principles and collaborate with designers',
    icon: '🎨',
    color: 'pink',
    order: 8,
    lessons: [
      {
        id: 'lesson-8-1',
        title: 'BA Role in Design',
        type: 'reading',
        duration: '10 min',
        content: `# BA Role in Design

As a BA, you don't create pixel-perfect designs, but you must understand design principles.

## Your Responsibilities

### 1. Gather Design Requirements
- What must users be able to do?
- What information must be visible?
- What's the user's mental model?

### 2. Bridge Business and Design
- Translate business needs to design constraints
- Explain user workflows to designers
- Validate designs meet requirements

### 3. Review and Validate
- Do mockups support all user stories?
- Are acceptance criteria achievable?
- Is the flow intuitive?

## What You're NOT Doing
❌ Creating UI mockups  
❌ Choosing colors and fonts  
❌ Building prototypes

## What You ARE Doing
✅ Defining what must be included  
✅ Validating user flows  
✅ Ensuring business rules are reflected`
      }
    ],
    assignmentTitle: 'Design Requirements',
    assignmentDescription: 'Write design requirements for a user dashboard. What must be visible? What actions must users be able to take?'
  },

  // MODULE 9: MVP
  {
    id: 'module-9-mvp',
    title: 'MVP',
    description: 'Identify and prioritize minimum viable features',
    icon: '🎯',
    color: 'red',
    order: 9,
    lessons: [
      {
        id: 'lesson-9-1',
        title: 'What is an MVP?',
        type: 'reading',
        duration: '11 min',
        content: `# What is an MVP?

Minimum Viable Product - the smallest version that delivers value.

## MVP vs. Final Product

### ❌ Wrong Approach
"Build 10% of every feature"  
→ Result: Nothing works properly

### ✅ Correct Approach
"Build 100% of the most critical 10% of features"  
→ Result: Small but functional product

## MoSCoW Prioritization

- **Must Have**: Core functionality (MVP)
- **Should Have**: Important but not critical
- **Could Have**: Nice to have
- **Won't Have**: Out of scope

## The One-Feature Test

If you could only ship ONE feature, what would it be?
That's your starting point.

## Example

**Full Product**: Tenant repair system
- Submit request ✅ MVP
- Upload photos ✅ MVP
- Track status ✅ MVP
- Rate service ❌ Phase 2
- Schedule appointment ❌ Phase 2
- Live chat ❌ Future`
      }
    ],
    assignmentTitle: 'MVP Feature Prioritization',
    assignmentDescription: 'Given a full feature list for an app, identify the MVP using MoSCoW. Justify why you included/excluded each feature.'
  },

  // MODULE 10: Agile & Scrum
  {
    id: 'module-10-agile-scrum',
    title: 'Agile & Scrum Basics',
    description: 'Understand Agile methodologies and Scrum framework',
    icon: '🔄',
    color: 'cyan',
    order: 10,
    lessons: [
      {
        id: 'lesson-10-1',
        title: 'Agile and Waterfall',
        type: 'reading',
        duration: '9 min',
        content: conceptToMarkdown(
          'Agile and Waterfall',
          'Waterfall means plan everything up front, then build. Agile means break the work into small chunks and adjust along the way. In Agile, BAs work closely with teams during each sprint. In Waterfall, BAs often define everything before development begins.',
          [
            'Waterfall means plan everything up front, then build.',
            'Agile means break the work into small chunks and adjust along the way.',
            'In Agile, BAs work closely with teams during each sprint.',
            'In Waterfall, BAs often define everything before development begins.'
          ]
        )
      },
      {
        id: 'lesson-10-2',
        title: 'Scrum Framework',
        type: 'reading',
        duration: '14 min',
        content: `# Scrum Framework

Scrum is the most popular Agile framework.

## The Scrum Team

**Product Owner**
- Defines what to build
- Prioritizes the backlog

**Scrum Master**
- Facilitates the process
- Removes impediments

**Development Team**
- Builds the product
- Self-organizing

## Scrum Events

**Sprint** (2 weeks)
Fixed-length iteration

**Sprint Planning**
What will we build? How?

**Daily Stand-up** (15 min)
What did I do? What will I do? Blockers?

**Sprint Review**
Demo completed work, get feedback

**Sprint Retrospective**
What went well? What can we improve?

## BA's Role
You might BE the Product Owner or work closely with them to refine the backlog and clarify requirements.`
      }
    ],
    assignmentTitle: 'Scrum Ceremony Analysis',
    assignmentDescription: 'Describe what happens in each Scrum ceremony and what a BA contributes to each one.'
  }
];

/**
 * Get module by ID
 */
export const getModuleById = (moduleId: string): Module | undefined => {
  return LEARNING_MODULES.find(m => m.id === moduleId);
};

/**
 * Get lesson by ID within a module
 */
export const getLessonById = (moduleId: string, lessonId: string): Lesson | undefined => {
  const module = getModuleById(moduleId);
  return module?.lessons.find(l => l.id === lessonId);
};

/**
 * Get next module ID
 */
export const getNextModuleId = (currentModuleId: string): string | undefined => {
  const currentIndex = LEARNING_MODULES.findIndex(m => m.id === currentModuleId);
  if (currentIndex === -1 || currentIndex === LEARNING_MODULES.length - 1) {
    return undefined;
  }
  return LEARNING_MODULES[currentIndex + 1].id;
};
