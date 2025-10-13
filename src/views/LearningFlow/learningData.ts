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
        content: `# Who Is a Business Analyst?

Picture this: You're frustrated with your favorite food delivery app. Sometimes your order arrives cold, sometimes the wrong items show up, and tracking is confusing. You complain to customer service, but nothing changes. Why? Because somewhere in that company, there's a disconnect between what customers need and what the tech team is building.

**This is exactly where a Business Analyst steps in.**

## The Bridge Builder

A Business Analyst (BA) is like a translator between two worlds: the business side (people who know the problems) and the solution side (people who build fixes). Think of them as the person who:

- **Listens** to frustrated customers and employees
- **Asks** the right questions to understand the real problem (not just symptoms)
- **Documents** exactly what needs to change and why
- **Guides** the team to build the right solution

They don't write code. They don't design the app. They don't manage the project timeline. Instead, they make sure everyone is solving the **right problem** before anyone starts building.

## A Real-Life Example: Netflix Recommendations

When Netflix realized people were spending too long browsing without watching anything, they didn't just hire developers to "fix browsing." First, a BA would:

1. **Investigate**: Talk to users - "Why do you spend 20 minutes browsing?"
2. **Analyze**: Discover patterns - "People feel overwhelmed by too many choices"
3. **Define the need**: "We need personalized recommendations that feel curated, not random"
4. **Document requirements**: "Show 5-7 highly relevant picks, not 50 okay options"

Only then would developers build the recommendation algorithm. The BA ensured they built the right thing.

## Why Companies Hire BAs

Imagine your company wants to "improve the checkout process." Without a BA, the team might:
- Build features nobody asked for
- Miss critical security requirements
- Create a solution that works in the UK but fails in other markets
- Waste 6 months building something that doesn't solve the actual problem

**A BA prevents this.** They dig deeper:
- "What specifically is wrong with checkout?"
- "Is it speed? Payment options? Mobile usability?"
- "Who struggles most - new customers or returning ones?"
- "What does success actually look like?"

Their work saves time, money, and frustration.

## What BAs Do Every Day

Think of a BA working on a project to improve Uber's driver app:

- **Morning**: Meet with drivers to understand their biggest frustrations
- **Midday**: Document findings - "Drivers lose time because they can't see the next ride while dropping off a passenger"
- **Afternoon**: Work with designers and developers to clarify exactly what "see next ride" means (distance? fare estimate? pickup time?)
- **Evening**: Write clear requirements so the team knows what to build

They don't decide *how* the app will show this info (that's for designers/developers). They clarify *what* needs to happen and *why* it matters.

## What BAs Don't Do

Let's be clear - BAs are not:
- **Developers** - They don't write code (but they work closely with those who do)
- **Project Managers** - They don't manage timelines or budgets (but they help PMs understand scope)
- **Designers** - They don't create mockups (but they define what the design must achieve)
- **Testers** - They don't run tests (but they define what "working correctly" means)

Their superpower is **clarity**. They make sure everyone understands the problem and agrees on the solution *before* anyone starts building.

## Why This Role Exists

Think about the last time you used an app and thought, "Who designed this?! This makes no sense!" That usually happens when:
- Nobody asked users what they actually needed
- Teams assumed they understood the problem
- Requirements were vague or contradictory
- Different departments worked in silos

A good BA prevents all of this. They're the person who ensures that when Spotify adds a feature, it's because users actually want it - not because someone in a meeting thought it sounded cool.

## Your Journey as a BA

As you learn this role, you'll discover it's less about technical skills and more about:
- **Curiosity** - Always asking "why?"
- **Clarity** - Turning messy conversations into clear documents
- **Communication** - Helping technical and non-technical people understand each other
- **Critical thinking** - Spotting gaps, risks, and hidden assumptions

You're not just learning a job - you're learning to be the person who makes sure good ideas become great solutions.

---

**Next up**: We'll explore how organizations actually work, so you can understand the environment where BAs make their impact.
`
      },
      {
        id: 'lesson-1-2',
        title: 'How Organisations Work',
        type: 'reading',
        duration: '10 min',
        content: `# How Organisations Work

Think about the apps on your phone right now. Spotify sells you music streaming. Amazon sells products and delivery. WhatsApp is free but owned by Meta, who sells advertising. Every single organization exists to deliver value - and to make money doing it.

**Understanding how organizations work is critical for BAs** because you can't improve what you don't understand.

## The Simple Truth: Every Business Sells Something

At its core, every organization falls into one of three categories:

### 1. Product Companies
They make or sell physical or digital things you can own.

**Examples:**
- **Apple** - Sells iPhones, MacBooks, iPads
- **Amazon** - Sells products from books to groceries
- **PlayStation** - Sells gaming consoles and games

**What this means for BAs:** Product companies care about inventory, supply chains, manufacturing quality, and customer satisfaction. When you work on a project for a product company, you'll often hear about "reducing defects," "faster shipping," or "better product recommendations."

### 2. Service Companies
They sell expertise, time, or experiences - not physical products.

**Examples:**
- **Uber** - Sells transportation as a service
- **Netflix** - Sells entertainment streaming (access, not ownership)
- **Airbnb** - Sells temporary accommodation
- **Deliveroo** - Sells food delivery service

**What this means for BAs:** Service companies obsess over customer experience, speed, and reliability. Projects often focus on "reducing wait times," "improving driver ratings," or "better matching customers with providers."

### 3. Hybrid Companies
They sell both products and services.

**Examples:**
- **Apple** - Sells iPhones (product) + Apple Music & iCloud (services)
- **Amazon** - Sells products + Amazon Prime (service)
- **Tesla** - Sells cars (product) + charging network & software updates (service)

**What this means for BAs:** Hybrid companies are complex. You might work on projects that impact both sides - like Amazon Prime, which offers free shipping (service) and exclusive products (product).

## Why Organizations Exist: The Value Equation

Every organization exists to deliver **value**. But what does "value" actually mean?

### For Customers
- **Save time** - Uber gets you there faster than public transport
- **Save money** - Amazon often has lower prices than physical stores
- **Solve a problem** - Spotify solves "I want to listen to any song, anytime"
- **Feel good** - Instagram makes people feel connected

### For the Business
- **Make profit** - Revenue must exceed costs
- **Grow market share** - Beat competitors
- **Build brand loyalty** - Keep customers coming back
- **Comply with regulations** - Avoid fines and legal issues

## Real Example: Deliveroo's Business Model

Let's break down how Deliveroo works to see why understanding the business matters:

**What Deliveroo Sells:** Food delivery service

**Who Pays Them:**
1. **Customers** - Pay delivery fees + service charges
2. **Restaurants** - Pay commission (25-35% of order value)
3. **Advertisers** - Pay to appear higher in search results

**Their Costs:**
- Rider payments
- Technology (app development, servers)
- Customer support
- Marketing

**Their Goals:**
- Increase number of orders
- Reduce delivery time
- Increase average order value
- Keep riders and customers happy

**Why This Matters for a BA:**
Imagine your boss says, "We need to improve the app." That's too vague. But if you understand Deliveroo's business model, you'd ask:
- "Do we want customers to order more often?"
- "Do we want to increase the average order value?"
- "Do we want to reduce delivery time?"
- "Do we want to reduce rider cancellations?"

Each of these requires a **completely different solution**. The BA's job is to clarify **which business goal** the project serves.

## Departments: How Work Gets Done

Organizations divide work into departments. Each department has different priorities - and sometimes they conflict.

### Common Departments You'll Work With

**1. Sales**
- **Goal:** Bring in new customers and revenue
- **Pain Points:** "The website doesn't show product availability, so we promise things we can't deliver"
- **BA Impact:** Help build better customer data systems

**2. Marketing**
- **Goal:** Build brand awareness and attract leads
- **Pain Points:** "We run campaigns but can't track which ones actually work"
- **BA Impact:** Define requirements for analytics and tracking

**3. Finance**
- **Goal:** Manage money, reduce costs, ensure profitability
- **Pain Points:** "We can't get real-time revenue reports - everything is manual in Excel"
- **BA Impact:** Automate reporting and financial workflows

**4. Operations**
- **Goal:** Deliver products/services efficiently
- **Pain Points:** "Our warehouse system is so slow, orders take 3 days to process"
- **BA Impact:** Streamline processes and reduce bottlenecks

**5. Customer Service**
- **Goal:** Keep customers happy and resolve issues
- **Pain Points:** "Customers call about their order status because the app doesn't show tracking"
- **BA Impact:** Build self-service features to reduce call volume

**6. Compliance/Legal**
- **Goal:** Ensure the business follows laws and regulations
- **Pain Points:** "We're not GDPR compliant - customers can't delete their data"
- **BA Impact:** Define data privacy requirements

**7. IT/Technology**
- **Goal:** Build and maintain systems
- **Pain Points:** "Business teams keep asking for features without explaining why"
- **BA Impact:** You're the bridge - you translate business needs into clear requirements

## Why BAs Must Understand the Business

Here's a real scenario:

**Situation:** A clothing retailer wants to "improve the mobile app."

**Bad BA Approach:**
"Okay, we'll add more features and make it look nicer."

**Good BA Approach:**
- **Ask:** "What's the business goal? Increase sales? Reduce returns? Improve brand loyalty?"
- **Discover:** "Sales team says customers abandon carts because shipping costs are only shown at checkout."
- **Analyze:** "Customer service says 40% of calls are about delivery delays."
- **Define:** "We need to: (1) Show shipping costs earlier in the journey, (2) Provide real-time delivery tracking."

The good BA ties every feature back to a **business outcome**. That's why you need to understand:
- What the business sells
- How they make money
- Which departments are involved
- What success looks like

## Your Role: The Business Translator

As a BA, you're not just a "requirements writer." You're a **business translator** who:
- Understands the business model (how they make money)
- Knows each department's priorities
- Connects projects to business value
- Ensures solutions actually solve the right problem

When you start a new project, always ask:
1. What does this organization sell?
2. How do they make money?
3. Which departments are impacted?
4. What business goal does this project support?

Answer these, and you'll always deliver valuable work.

---

**Next up:** We'll explore why projects happen in the first place - and how BAs make sure they're worth doing.
`
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

