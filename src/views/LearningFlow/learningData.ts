/**
 * Learning Flow Data Structure
 * 
 * Defines modules (learning topics) and lessons (subtopics)
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
 * Sample BA Learning Modules
 */
export const LEARNING_MODULES: Module[] = [
  {
    id: 'module-1-ba-fundamentals',
    title: 'BA Fundamentals',
    description: 'Core concepts every Business Analyst must know',
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
      },
      {
        id: 'lesson-1-3',
        title: 'BA vs. Other Roles',
        type: 'reading',
        duration: '8 min',
        content: `# BA vs. Other Roles

Understanding how a BA differs from other roles helps you define your responsibilities.

## BA vs. Product Manager

| Business Analyst | Product Manager |
|------------------|-----------------|
| Focuses on "how" to build it | Focuses on "what" to build |
| Requirements and processes | Vision and roadmap |
| Works with dev teams | Works with stakeholders |

## BA vs. Project Manager

| Business Analyst | Project Manager |
|------------------|-----------------|
| Defines requirements | Manages timeline and resources |
| Process improvement | Risk and scope management |
| Quality of solution | Delivery on time/budget |

## BA vs. Developer

| Business Analyst | Developer |
|------------------|-----------|
| Defines what to build | Builds the solution |
| Documents requirements | Writes code |
| Validates business logic | Implements technical logic |

## The BA Sweet Spot

You sit at the intersection of:
- Business needs
- Technical feasibility
- User experience

Your job is to ensure all three align.`
      }
    ],
    assignmentTitle: 'BA Role Clarity Assignment',
    assignmentDescription: 'Write a short reflection on how you would explain the BA role to someone who has never heard of it. What makes a BA valuable?'
  },
  {
    id: 'module-2-requirements-elicitation',
    title: 'Requirements Elicitation',
    description: 'Master the art of gathering requirements from stakeholders',
    icon: '🎯',
    color: 'purple',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Introduction to Elicitation',
        type: 'reading',
        duration: '15 min',
        content: `# Introduction to Elicitation

Elicitation is the process of drawing out information from stakeholders to understand business needs.

## Why Elicitation Matters

Many projects fail not because of bad technology, but because:
- Requirements were never properly gathered
- Stakeholders weren't asked the right questions
- Assumptions were made instead of verified

## Types of Elicitation

### 1. **Interviews**
One-on-one conversations with stakeholders

### 2. **Workshops**
Group sessions to align multiple stakeholders

### 3. **Observation**
Watching users perform their current process

### 4. **Document Analysis**
Reviewing existing documentation and systems

### 5. **Prototyping**
Building mockups to elicit feedback

## The Golden Rule

Never assume you know what the business needs.
Always ask, always verify, always document.`
      },
      {
        id: 'lesson-2-2',
        title: 'Asking Powerful Questions',
        type: 'interactive',
        duration: '20 min',
        content: `# Asking Powerful Questions

The quality of your questions determines the quality of your requirements.

## Open vs. Closed Questions

### ❌ Closed Questions (avoid)
- "Do you want a login feature?" → Yes/No answer
- "Is this process important?" → Doesn't reveal insights

### ✅ Open Questions (use these)
- "How does the login process work today?"
- "What happens when users forget their password?"
- "Can you walk me through a typical scenario?"

## The 5 Whys Technique

Keep asking "why" to uncover root causes:

**Example:**
1. "We need a faster approval process" 
2. **Why?** "Because it takes too long"
3. **Why does it take too long?** "Managers don't check emails"
4. **Why don't they check?** "They're in meetings all day"
5. **Why are they in so many meetings?** "They approve requests individually"

**Root cause discovered**: Need batch approval, not just a faster email system!

## Follow-Up Questions

- "Can you give me an example?"
- "What happens next?"
- "Who else is involved in this step?"
- "What could go wrong here?"

These reveal edge cases and business rules you'd otherwise miss.`
      }
    ],
    assignmentTitle: 'Question Design Challenge',
    assignmentDescription: 'Given a stakeholder scenario, write 5 open-ended questions that would help you understand their requirements.'
  },
  {
    id: 'module-3-user-stories',
    title: 'Writing User Stories',
    description: 'Learn to write clear, testable user stories',
    icon: '✍️',
    color: 'green',
    lessons: [
      {
        id: 'lesson-3-1',
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

## Why This Format Works

- **Role**: Clarifies who benefits
- **Action**: Defines what they need to do
- **Benefit**: Explains the business value

Without the "so that", you might build features nobody needs.

## Common Mistakes

❌ "As a user, I want a login button"  
→ Missing the "so that" - what's the benefit?

❌ "As a developer, I want an API"  
→ Developers aren't users - this is a technical task, not a user story

✅ "As a tenant, I want to upload photos of my apartment issue so that maintenance can see the problem before arriving"  
→ Clear role, action, and business value`
      },
      {
        id: 'lesson-3-2',
        title: 'Acceptance Criteria',
        type: 'reading',
        duration: '15 min',
        content: `# Acceptance Criteria

Acceptance Criteria (ACs) define when a user story is "done."

## Purpose

ACs answer the question: "How will we know this story is complete and working correctly?"

## Format

Use **Given-When-Then** for clarity:

**Given** [context/starting state]  
**When** [action occurs]  
**Then** [expected outcome]

### Example

User Story: "As a customer, I want to reset my password..."

**AC 1:**  
Given I am on the login page  
When I click "Forgot Password"  
Then I should see a password reset form

**AC 2:**  
Given I enter my email and click "Send Reset Link"  
When the email is valid  
Then I should receive a reset link within 5 minutes

**AC 3:**  
Given I enter an invalid email  
When I click "Send Reset Link"  
Then I should see an error message: "Email not found"

## Good ACs are:

- **Specific**: No vague terms like "user-friendly"
- **Testable**: QA can verify them
- **Complete**: Cover happy path AND edge cases
- **Independent**: Each AC stands alone`
      }
    ],
    assignmentTitle: 'User Story Writing Exercise',
    assignmentDescription: 'Write 3 user stories with acceptance criteria for a given scenario. Your stories will be reviewed for INVEST criteria compliance.'
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

