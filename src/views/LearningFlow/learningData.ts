/**
 * Learning Flow Data Structure
 * 
 * Defines modules (learning topics) and lessons (subtopics)
 * Maps to the sidebar menu items under "My Learning"
 */

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration?: string; // e.g., "15 min"
  type: 'reading' | 'video' | 'interactive';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  color: string; // for card styling
  lessons: Lesson[];
  assignmentTitle: string;
  assignmentDescription: string;
}

/**
 * 10 BA Learning Modules (matching sidebar menu)
 */
export const LEARNING_MODULES: Module[] = [
  // Module 1: Core Learning (BA Fundamentals)
  {
    id: 'module-1-core-learning',
    title: 'Core Learning',
    description: 'Foundation concepts every Business Analyst must know',
    icon: '📚',
    color: 'blue',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'What is a Business Analyst?',
        type: 'reading',
        duration: '10 min',
        content: `# What is a Business Analyst?

A Business Analyst (BA) is a professional who bridges the gap between business needs and technology solutions.

## Key Responsibilities

- **Elicit Requirements**: Gather and document what the business needs
- **Analyze Processes**: Understand current workflows and identify improvements  
- **Facilitate Communication**: Translate between technical teams and stakeholders
- **Document Solutions**: Create clear, actionable requirements

## Why BAs Matter

Without a BA, projects often fail because:
- Requirements are unclear or incomplete
- Stakeholders and developers misunderstand each other
- Business value gets lost in translation

A good BA ensures everyone is aligned on what needs to be built and why.`
      },
      {
        id: 'lesson-1-2',
        title: 'The BA Skillset',
        type: 'reading',
        duration: '12 min',
        content: `# The BA Skillset

Business Analysts need a blend of technical, analytical, and soft skills.

## Core Skills

### 1. **Communication**
- Active listening
- Asking the right questions
- Explaining complex concepts simply

### 2. **Analysis**
- Critical thinking
- Problem-solving
- Data interpretation

### 3. **Technical Knowledge**
- Understanding systems and processes
- Basic knowledge of development workflows
- Familiarity with tools (JIRA, Confluence, etc.)

### 4. **Documentation**
- User stories
- Process diagrams
- Requirements specifications

## The 80/20 Rule

80% of your work is communication and collaboration.
20% is technical documentation.

Your ability to build relationships and ask good questions matters more than technical wizardry.`
      }
    ],
    assignmentTitle: 'BA Role Clarity Assignment',
    assignmentDescription: 'Write a short reflection on how you would explain the BA role to someone who has never heard of it.'
  },

  // Module 2: Project Initiation
  {
    id: 'module-2-project-initiation',
    title: 'Project Initiation',
    description: 'Learn how projects start and how BAs contribute from day one',
    icon: '🚀',
    color: 'purple',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Understanding Project Context',
        type: 'reading',
        duration: '15 min',
        content: `# Understanding Project Context

Before diving into requirements, you need to understand the bigger picture.

## Key Questions to Ask

### About the Business
- What problem are we solving?
- Who are the stakeholders?
- What's the expected business value?

### About the Project
- What's the timeline and budget?
- Who's on the team?
- What are the constraints?

### About Success
- How will we measure success?
- What does "done" look like?
- What could cause this to fail?

## The Business Case

Every project should have a business case that answers:
- **Why** are we doing this?
- **What** will it cost?
- **What** will we gain?
- **When** do we need it?

Your job as a BA is to help clarify and validate this business case.`
      },
      {
        id: 'lesson-2-2',
        title: 'Stakeholder Analysis',
        type: 'reading',
        duration: '18 min',
        content: `# Stakeholder Analysis

Not all stakeholders are equal. Understanding who they are and what they need is critical.

## Types of Stakeholders

### Primary Stakeholders
- **End users**: People who will actually use the solution
- **Business owners**: People who pay for it
- **Executives**: People who make strategic decisions

### Secondary Stakeholders
- **Technical teams**: Developers, architects, QA
- **Support teams**: Help desk, training
- **Compliance**: Legal, security, audit

## Power vs. Interest Matrix

| High Power, High Interest | High Power, Low Interest |
|---------------------------|--------------------------|
| **Key Players** - Manage closely | **Keep Satisfied** - Keep informed |

| Low Power, High Interest | Low Power, Low Interest |
|-------------------------|-------------------------|
| **Keep Informed** - Consult regularly | **Monitor** - Minimal effort |

## Your BA Strategy

- **Identify** all stakeholders early
- **Understand** their needs and concerns
- **Prioritize** who to engage when
- **Communicate** in their language (business vs. technical)`
      }
    ],
    assignmentTitle: 'Stakeholder Mapping Exercise',
    assignmentDescription: 'Given a project scenario, identify and categorize all stakeholders using the Power/Interest matrix.'
  },

  // Module 3: Requirements Elicitation
  {
    id: 'module-3-elicitation',
    title: 'Requirements Elicitation',
    description: 'Master the art of gathering requirements from stakeholders',
    icon: '🎯',
    color: 'green',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Elicitation Techniques',
        type: 'reading',
        duration: '20 min',
        content: `# Elicitation Techniques

Different situations require different approaches to gathering requirements.

## 1. Interviews (One-on-One)

**Best for**: Deep dive with key stakeholders

**How to prepare**:
- Research the stakeholder's role
- Prepare open-ended questions
- Book 60-90 minutes
- Record with permission

## 2. Workshops (Group Sessions)

**Best for**: Aligning multiple stakeholders, resolving conflicts

**How to run**:
- Set clear agenda
- Use facilitation techniques (dot voting, brainstorming)
- Capture decisions visually
- Time-box discussions

## 3. Observation (Job Shadowing)

**Best for**: Understanding "as-is" processes

**What to watch**:
- What do they actually do vs. what they say they do?
- Where do they struggle?
- What workarounds exist?
- What slows them down?

## 4. Document Analysis

**Best for**: Understanding existing systems and rules

**What to review**:
- Current process documentation
- System manuals
- Compliance requirements
- User feedback and complaints

## 5. Prototyping

**Best for**: Unclear requirements, UI/UX decisions

**Approach**:
- Build low-fidelity mockups
- Show to stakeholders
- Iterate based on feedback
- Clarify assumptions`
      },
      {
        id: 'lesson-3-2',
        title: 'Asking Powerful Questions',
        type: 'interactive',
        duration: '15 min',
        content: `# Asking Powerful Questions

The quality of your questions determines the quality of your requirements.

## Open vs. Closed Questions

### ❌ Closed Questions (avoid)
- "Do you want a login feature?" → Yes/No
- "Is this process important?" → Doesn't reveal insights

### ✅ Open Questions (use these)
- "How does the login process work today?"
- "What happens when users forget their password?"
- "Can you walk me through a typical scenario?"

## The 5 Whys Technique

**Example:**
1. "We need a faster approval process"
2. **Why?** "Because it takes too long"
3. **Why does it take long?** "Managers don't check emails"
4. **Why don't they check?** "They're in meetings all day"
5. **Why so many meetings?** "They approve requests individually"

**Root cause**: Need batch approval, not just faster email!`
      }
    ],
    assignmentTitle: 'Question Design Challenge',
    assignmentDescription: 'Write 10 open-ended questions for a stakeholder interview about a tenant repair request process.'
  },

  // Module 4: Process Mapping
  {
    id: 'module-4-process-mapping',
    title: 'Process Mapping',
    description: 'Visualize and analyze business processes',
    icon: '🗺️',
    color: 'indigo',
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'Introduction to Process Mapping',
        type: 'reading',
        duration: '12 min',
        content: `# Introduction to Process Mapping

Process maps visualize how work flows through an organization.

## Why Map Processes?

- **Clarity**: Everyone sees the same picture
- **Analysis**: Identify bottlenecks and inefficiencies
- **Communication**: Easier to discuss improvements
- **Documentation**: Captures tribal knowledge

## Types of Process Maps

### 1. As-Is Process
Shows how things work **today** (including problems)

### 2. To-Be Process
Shows how things **should work** after improvement

### 3. BPMN Diagrams
Business Process Model and Notation - industry standard

## What to Include

- **Activities**: What gets done (rectangles)
- **Decisions**: Where choices are made (diamonds)
- **Actors**: Who does what (swimlanes)
- **Flow**: Order of activities (arrows)`
      }
    ],
    assignmentTitle: 'Process Mapping Exercise',
    assignmentDescription: 'Map an as-is process for a simple business scenario (e.g., customer refund request).'
  },

  // Module 5: Requirements Engineering
  {
    id: 'module-5-requirements-engineering',
    title: 'Requirements Engineering',
    description: 'Document, validate, and manage requirements throughout the project',
    icon: '⚙️',
    color: 'orange',
    lessons: [
      {
        id: 'lesson-5-1',
        title: 'Types of Requirements',
        type: 'reading',
        duration: '15 min',
        content: `# Types of Requirements

Not all requirements are created equal. Understanding the different types helps you organize and prioritize.

## Functional Requirements

**What the system must do**

Examples:
- "System must allow users to upload photos"
- "System must send confirmation email"
- "System must validate email format"

## Non-Functional Requirements (NFRs)

**How the system should perform**

### Performance
- "Page must load in under 2 seconds"
- "System must handle 1000 concurrent users"

### Security
- "Passwords must be encrypted"
- "Users must verify email before access"

### Usability
- "Forms must be mobile-responsive"
- "Error messages must be clear"

## Business Rules

**Policies and logic**

Examples:
- "Refunds only allowed within 30 days"
- "Managers can approve up to £5,000"
- "Students under 18 require parent consent"

## Constraints

**Limitations you must work within**

- Budget caps
- Technology restrictions
- Compliance requirements
- Timeline deadlines`
      }
    ],
    assignmentTitle: 'Requirements Classification',
    assignmentDescription: 'Categorize a list of mixed requirements into functional, non-functional, business rules, and constraints.'
  },

  // Module 6: Solution Options
  {
    id: 'module-6-solution-options',
    title: 'Solution Options',
    description: 'Evaluate and recommend the best approach to solve business problems',
    icon: '💡',
    color: 'yellow',
    lessons: [
      {
        id: 'lesson-6-1',
        title: 'Evaluating Alternatives',
        type: 'reading',
        duration: '18 min',
        content: `# Evaluating Solution Alternatives

Rarely is there only one way to solve a problem. Your job is to explore options and recommend the best fit.

## Common Solution Types

### 1. Build Custom
- Full control
- Fits exact needs
- High cost, high time

### 2. Buy Off-the-Shelf
- Fast deployment
- Proven solution
- Less flexibility

### 3. Configure Existing System
- Leverage what you have
- Lower cost
- Limited by current tech

### 4. Outsource/SaaS
- No maintenance burden
- Subscription cost
- Dependency on vendor

## Evaluation Criteria

- **Cost**: Initial + ongoing
- **Time**: How fast can we deploy?
- **Risk**: What could go wrong?
- **Scalability**: Will it grow with us?
- **Fit**: Does it solve the actual problem?

## Decision Matrix

| Option | Cost | Time | Risk | Fit | Total Score |
|--------|------|------|------|-----|-------------|
| Build  | 2    | 1    | 2    | 5   | 10          |
| Buy    | 4    | 5    | 4    | 3   | 16          |
| SaaS   | 5    | 5    | 3    | 4   | 17          |

Higher score = better option`
      }
    ],
    assignmentTitle: 'Solution Comparison',
    assignmentDescription: 'Evaluate 3 solution options for a given business problem using a decision matrix.'
  },

  // Module 7: Documentation
  {
    id: 'module-7-documentation',
    title: 'Documentation',
    description: 'Write clear, testable user stories and acceptance criteria',
    icon: '✍️',
    color: 'teal',
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

Good user stories are:
- **I**ndependent: Can be built separately
- **N**egotiable: Details can be discussed
- **V**aluable: Delivers business value
- **E**stimable: Team can estimate effort
- **S**mall: Can be completed in one sprint
- **T**estable: Clear acceptance criteria`
      },
      {
        id: 'lesson-7-2',
        title: 'Acceptance Criteria',
        type: 'reading',
        duration: '15 min',
        content: `# Acceptance Criteria

Acceptance Criteria (ACs) define when a story is "done."

## Given-When-Then Format

**Given** [context]  
**When** [action]  
**Then** [outcome]

### Example

**AC 1:**  
Given I am on the login page  
When I click "Forgot Password"  
Then I should see a password reset form

**AC 2:**  
Given I enter a valid email  
When I click "Send Reset Link"  
Then I should receive an email within 5 minutes

**AC 3:**  
Given I enter an invalid email  
When I click "Send Reset Link"  
Then I should see "Email not found"`
      }
    ],
    assignmentTitle: 'User Story Writing',
    assignmentDescription: 'Write 3 user stories with acceptance criteria for a tenant repair request system.'
  },

  // Module 8: Design
  {
    id: 'module-8-design',
    title: 'Design Thinking for BAs',
    description: 'Understand design principles and collaborate effectively with designers',
    icon: '🎨',
    color: 'pink',
    lessons: [
      {
        id: 'lesson-8-1',
        title: 'BA Role in Design',
        type: 'reading',
        duration: '12 min',
        content: `# BA Role in Design

As a BA, you're not expected to create designs, but you must understand design principles.

## Your Responsibilities

### 1. **Gather Design Requirements**
- What must users be able to do?
- What information must be visible?
- What's the user's mental model?

### 2. **Bridge Business and Design**
- Translate business needs to design constraints
- Explain user workflows to designers
- Validate that designs meet requirements

### 3. **Review and Validate**
- Do mockups support all user stories?
- Are acceptance criteria achievable?
- Is the flow intuitive?

## What You're NOT Doing

❌ Creating pixel-perfect UI mockups  
❌ Choosing colors and fonts  
❌ Building prototypes (unless explicitly asked)

✅ Defining what must be included  
✅ Validating user flows  
✅ Ensuring business rules are reflected`
      }
    ],
    assignmentTitle: 'Design Requirements Document',
    assignmentDescription: 'Write design requirements for a user dashboard showing project status and notifications.'
  },

  // Module 9: MVP Development
  {
    id: 'module-9-mvp',
    title: 'MVP Strategy',
    description: 'Learn to identify and prioritize minimum viable features',
    icon: '🎯',
    color: 'red',
    lessons: [
      {
        id: 'lesson-9-1',
        title: 'What is an MVP?',
        type: 'reading',
        duration: '12 min',
        content: `# What is an MVP?

Minimum Viable Product - the smallest version that delivers value.

## MVP vs. Final Product

### ❌ Common Mistake
"Let's build 10% of every feature"
→ Result: Nothing works properly

### ✅ Correct Approach
"Let's build 100% of the most critical 10% of features"
→ Result: Small but functional product

## How to Identify MVP Features

### MoSCoW Prioritization

- **Must Have**: Core functionality (MVP)
- **Should Have**: Important but not critical (Phase 2)
- **Could Have**: Nice to have (Future)
- **Won't Have**: Out of scope

### The One-Feature Test

If you could only ship ONE feature, what would it be?

That's your starting point.

## Example

**Full Product**: Tenant repair request system
- Submit request ✅ **MVP**
- Upload photos ✅ **MVP**
- Track status ✅ **MVP**
- Rate service ❌ Phase 2
- Schedule appointment ❌ Phase 2
- Chat with maintenance ❌ Future`
      }
    ],
    assignmentTitle: 'MVP Feature Prioritization',
    assignmentDescription: 'Given a full feature list, identify the MVP using MoSCoW and justify your choices.'
  },

  // Module 10: Agile & Scrum (Foundation)
  {
    id: 'module-10-agile-scrum',
    title: 'Agile & Scrum Basics',
    description: 'Understand Agile methodologies and the Scrum framework',
    icon: '🔄',
    color: 'cyan',
    lessons: [
      {
        id: 'lesson-10-1',
        title: 'Agile Principles',
        type: 'reading',
        duration: '15 min',
        content: `# Agile Principles

Agile is a mindset, not just a process.

## The Agile Manifesto

**We value:**
- **Individuals and interactions** over processes and tools
- **Working software** over comprehensive documentation
- **Customer collaboration** over contract negotiation
- **Responding to change** over following a plan

## What This Means for BAs

### Traditional (Waterfall)
1. Gather ALL requirements upfront
2. Document everything in detail
3. Hand off to development
4. Hope it's still relevant 6 months later

### Agile (Iterative)
1. Gather high-level requirements
2. Prioritize what's most valuable
3. Build in 2-week sprints
4. Get feedback and adapt

## Key Mindset Shifts

❌ "Requirements are fixed"  
✅ "Requirements evolve as we learn"

❌ "Document everything"  
✅ "Document what's necessary"

❌ "Big bang release"  
✅ "Incremental delivery"`
      },
      {
        id: 'lesson-10-2',
        title: 'Scrum Framework',
        type: 'reading',
        duration: '18 min',
        content: `# Scrum Framework

Scrum is the most popular Agile framework.

## The Scrum Team

### Product Owner
- Defines what to build
- Prioritizes the backlog
- Accepts or rejects work

### Scrum Master
- Facilitates the process
- Removes impediments
- Coaches the team

### Development Team
- Builds the product
- Self-organizing
- Cross-functional

## Scrum Events

### Sprint (2 weeks)
The heartbeat of Scrum - fixed-length iteration

### Sprint Planning
- What will we build this sprint?
- How will we build it?

### Daily Stand-up (15 min)
- What did I do yesterday?
- What will I do today?
- Any blockers?

### Sprint Review
- Demo completed work
- Get stakeholder feedback

### Sprint Retrospective
- What went well?
- What can we improve?

## BA's Role in Scrum

You might be the **Product Owner** or work closely with them to:
- Refine the backlog
- Write user stories
- Clarify requirements
- Accept completed work`
      }
    ],
    assignmentTitle: 'Scrum Ceremony Analysis',
    assignmentDescription: 'Describe what happens in each Scrum ceremony and what a BA contributes to each.'
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
