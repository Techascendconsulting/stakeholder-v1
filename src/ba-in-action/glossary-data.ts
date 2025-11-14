/**
 * Glossary terms organized by project and page
 * Terms are contextual to what appears on each page
 */

export type GlossaryTerm = {
  term: string;
  definition: string;
  context?: string; // Optional: when/where this term is used
};

export type PageGlossary = {
  [key: string]: GlossaryTerm[];
};

export type ProjectGlossary = {
  [pageKey: string]: PageGlossary;
};

// CI&F Project Glossary
export const CIF_GLOSSARY: ProjectGlossary = {
  'join-orientation': {
    common: [
      {
        term: 'Initiative',
        definition: 'A project or program aimed at achieving a specific business goal. In this case, the Customer Identity & Fraud initiative.',
      },
      {
        term: 'Stakeholder',
        definition: 'Anyone who has an interest in or is affected by the project. This includes customers, team members, managers, and external partners.',
      },
      {
        term: 'One-pager',
        definition: 'A concise document (usually one page) that summarizes the key information about a project: problem, goal, constraints, and success metrics.',
      },
      {
        term: 'Brief',
        definition: 'A short document providing essential context about a project. It helps you understand what you\'re working on before diving into details.',
      },
      {
        term: 'Project Manager (PM)',
        definition: 'The person responsible for planning, executing, and delivering the project on time and within budget. They coordinate resources and timelines.',
      },
      {
        term: 'Product Manager',
        definition: 'The person who defines what product features to build and why. They focus on customer needs and business value.',
      },
      {
        term: 'Line Manager',
        definition: 'Your direct manager who oversees your day-to-day work and career development. They assign you to projects.',
      },
    ],
  },
  'understand-problem': {
    common: [
      {
        term: 'Baseline',
        definition: 'The current measured value before any changes. For example, "fraud loss is £125k per week" is a baseline. You need this to measure improvement.',
        context: 'Used when setting targets and measuring success',
      },
      {
        term: 'Guardrail',
        definition: 'A constraint or limit you must not cross. For example, "do not degrade conversion below 95%" is a guardrail that protects business outcomes.',
        context: 'Prevents solutions from causing unintended harm',
      },
      {
        term: 'KPI (Key Performance Indicator)',
        definition: 'A measurable value that shows how well you\'re achieving a goal. Examples: fraud loss (£/week), conversion rate (%), manual review time (hours).',
        context: 'Used to track progress and success',
      },
      {
        term: 'SLA (Service Level Agreement)',
        definition: 'A commitment about the level of service you\'ll provide. For example, "manual reviews must be completed within 24 hours" is an SLA.',
        context: 'Defines performance expectations',
      },
      {
        term: 'KYC (Know Your Customer)',
        definition: 'The process of verifying a customer\'s identity to prevent fraud. This includes checking ID documents, addresses, and other personal information.',
        context: 'Common in financial services and regulated industries',
      },
      {
        term: 'AML (Anti-Money Laundering)',
        definition: 'Regulations and processes designed to prevent criminals from disguising illegally obtained funds as legitimate income.',
        context: 'Legal requirement in financial services',
      },
      {
        term: 'Chargeback',
        definition: 'When a customer disputes a transaction and the bank reverses the payment. This costs the business money and can indicate fraud.',
        context: 'Financial impact of fraud',
      },
      {
        term: 'Conversion Rate',
        definition: 'The percentage of users who complete a desired action. For example, if 95 out of 100 users complete checkout, the conversion rate is 95%.',
        context: 'Measures business success',
      },
      {
        term: 'Drop-off',
        definition: 'When users start a process but don\'t complete it. For example, "9% drop-off at KYC step" means 9% of users abandon the process there.',
        context: 'Indicates where users are struggling',
      },
      {
        term: 'Risk-based Verification',
        definition: 'A system that applies different levels of identity checks based on how risky a transaction appears. Low-risk = quick check, high-risk = thorough check.',
        context: 'Balances security with user experience',
      },
      {
        term: 'Audit Trail',
        definition: 'A record of who did what, when, and why. Required for compliance to prove that decisions were made correctly and can be reviewed later.',
        context: 'Legal and compliance requirement',
      },
      {
        term: 'Compliance',
        definition: 'Following laws, regulations, and industry standards. In financial services, this includes KYC, AML, and data protection requirements.',
        context: 'Non-negotiable legal requirements',
      },
      {
        term: 'Engagement Plan',
        definition: 'A plan for who you need to talk to, what information you need, and when. This helps you gather the right information efficiently.',
        context: 'Your roadmap for the next 48 hours',
      },
      {
        term: 'Problem Statement',
        definition: 'A clear, one-sentence description of the problem you\'re solving. It includes: what\'s wrong, where it happens, the impact, and what you need to change.',
        context: 'The foundation of your analysis',
      },
      {
        term: 'Evidence vs Assumptions',
        definition: 'Evidence = facts you can prove (data, reports, confirmed information). Assumptions = things you believe but haven\'t verified yet. Always separate these.',
        context: 'Critical for credibility',
      },
      {
        term: 'Scope',
        definition: 'What is included in your project. Defining scope prevents "scope creep" where the project keeps expanding beyond what you can deliver.',
        context: 'Boundaries of your work',
      },
      {
        term: 'Non-goals',
        definition: 'Things explicitly NOT included in your project. Stating these prevents stakeholders from expecting work you\'re not doing.',
        context: 'Prevents scope expansion',
      },
      {
        term: 'Constraints',
        definition: 'Limitations you must work within. Examples: legal requirements, budget limits, technical limitations, or business rules you can\'t change.',
        context: 'Boundaries you must respect',
      },
      {
        term: 'False Positive Rate',
        definition: 'The percentage of legitimate users incorrectly flagged as fraud. High false positives = good customers blocked, which hurts business.',
        context: 'Balance between security and user experience',
      },
      {
        term: 'Manual Review Queue',
        definition: 'A list of transactions that need human review because automated systems couldn\'t decide if they\'re legitimate or fraudulent.',
        context: 'Operational workload indicator',
      },
      {
        term: 'QoQ (Quarter over Quarter)',
        definition: 'Comparing one quarter (3 months) to the previous quarter. For example, "fraud loss +17% QoQ" means it increased 17% compared to last quarter.',
        context: 'Time-based comparison metric',
      },
    ],
  },
  'whos-involved': {
    common: [
      {
        term: 'Power-Interest Grid',
        definition: 'A tool that maps stakeholders based on two dimensions: their power (ability to approve/block) and their interest (how much they care). This helps you decide how to engage with each person.',
        context: 'Your most important stakeholder analysis tool',
      },
      {
        term: 'High Power, High Interest',
        definition: 'Stakeholders who can approve or block the project AND care deeply about the outcome. These are your "Key Players" - engage them closely with weekly updates and involve them in decisions.',
        context: 'Manage closely - weekly engagement',
      },
      {
        term: 'High Power, Low Interest',
        definition: 'Stakeholders who can approve or block but don\'t care about day-to-day details. Keep them satisfied with monthly summaries and only escalate when budget/timeline issues arise.',
        context: 'Keep satisfied - monthly updates',
      },
      {
        term: 'Low Power, High Interest',
        definition: 'Stakeholders who care deeply but don\'t have decision-making authority. Often your primary users. Keep them informed with newsletters, workshops, and beta testing opportunities.',
        context: 'Keep informed - regular communication',
      },
      {
        term: 'Low Power, Low Interest',
        definition: 'Stakeholders peripherally connected to the project. Monitor them with quarterly updates and only contact when you need something specific.',
        context: 'Monitor - minimal contact',
      },
      {
        term: 'Veto Power',
        definition: 'The ability to stop or block a project. Understanding who has this prevents you from building solutions that get rejected.',
        context: 'Critical to identify early',
      },
      {
        term: 'Pressure Signals',
        definition: 'Indicators of what motivates or concerns stakeholders. Examples: budget pressure, reputation risk, operational workload, compliance requirements.',
        context: 'Helps you understand their behavior',
      },
      {
        term: 'Stakeholder Narrative',
        definition: 'A story that explains who drives urgency, who controls risk, who can block quietly, and who needs protection. Used to defend scope and prevent derailment.',
        context: 'Your strategic understanding of the landscape',
      },
      {
        term: 'Engagement Approach',
        definition: 'How often and in what depth you interact with each stakeholder. Based on their power and interest level.',
        context: 'Prevents wasted time and missed stakeholders',
      },
    ],
  },
  'stakeholder-communication': {
    common: [
      {
        term: 'Communication Channel',
        definition: 'The method you use to communicate: Email (formal, documented), Teams/Slack (quick, async), Video calls (complex discussions), In-person (sensitive topics).',
        context: 'Choose based on purpose and stakeholder preference',
      },
      {
        term: 'Meeting Framework',
        definition: 'A structured 5-step approach BAs use: 1) Set the frame (purpose), 2) Reflect what you know, 3) Surface differences, 4) Clarify constraints, 5) Define next steps with owners.',
        context: 'Keeps meetings productive and focused',
      },
      {
        term: 'Analytical Notes',
        definition: 'Notes that capture meaning, decisions, and implications - not just what was said. These become your decision trail and are referenced in requirements docs.',
        context: 'Strong BAs analyze, weak BAs transcribe',
      },
      {
        term: 'Decision Trail',
        definition: 'A clear record of what was decided, why, who owns it, and what happens next. Essential for accountability and preventing "I thought we agreed..." situations.',
        context: 'Created through structured notes and follow-ups',
      },
      {
        term: 'Follow-Up Message',
        definition: 'A summary posted after meetings in project channels. Includes: what was discussed, decisions made, owners assigned, and next steps. Builds trust and creates documentation.',
        context: 'Shows you\'re structured and reliable',
      },
      {
        term: 'Conversation Script',
        definition: 'Prepared phrases and approaches for different stakeholder types. Helps you adapt your tone and focus based on who you\'re talking to.',
        context: 'Copy, adapt, use in interviews',
      },
      {
        term: 'Context',
        definition: 'The background information that explains why you\'re reaching out. Always include this in your first message so stakeholders understand the purpose.',
        context: 'First element of effective communication',
      },
      {
        term: 'Specific Ask',
        definition: 'A clear, actionable request. Instead of "I need your input," say "Can you review the requirements doc by Friday and confirm if the KYC flow matches your team\'s process?"',
        context: 'Makes it easy for stakeholders to respond',
      },
    ],
  },
  'as-is-to-be': {
    common: [
      {
        term: 'As-Is',
        definition: 'The current state of a process or system - what actually happens in reality, not what the documentation says. Captured by observing people work under pressure.',
        context: 'The foundation of gap analysis',
      },
      {
        term: 'Gap Analysis',
        definition: 'Identifying the difference between what you have (As-Is) and what you need (To-Be). A gap is what\'s missing or broken that prevents you from reaching your goal. You document what the gap is, why it exists, and what impact it has.',
        context: 'The difference between current state and what you need',
      },
      {
        term: 'To-Be',
        definition: 'Your solution. It describes how things will work in the future and includes the requirements (what the system must do) to make it happen. To-Be solves the gaps you identified.',
        context: 'The solution with requirements',
      },
      {
        term: 'Workaround',
        definition: 'A temporary solution people create when the official process doesn\'t work. Reveals where the system is broken.',
        context: 'Signals process failure',
      },
      {
        term: 'Shadowing',
        definition: 'Observing someone do their actual work (with permission). Watching behavior reveals more than asking questions.',
        context: 'Best way to capture real As-Is',
      },
      {
        term: 'Pain Point',
        definition: 'A specific moment where the process causes frustration, delay, or error. These are what you\'re solving.',
        context: 'Where to focus your analysis',
      },
      {
        term: 'Process Map',
        definition: 'A visual or narrative representation of how work flows. Can be simple (step-by-step) or detailed (swimlane diagram).',
        context: 'Makes As-Is visible',
      },
      {
        term: 'Constraint vs Preference',
        definition: 'Constraints are non-negotiable (legal, regulatory, technical limits). Preferences are "nice to have" but can be challenged.',
        context: 'Critical distinction for To-Be design',
      },
      {
        term: 'Success Metrics',
        definition: 'Measurable indicators that show the To-Be state is working. Defined with stakeholders before designing solutions.',
        context: 'How you\'ll know it worked',
      },
    ],
  },
  'implementation': {
    common: [
      {
        term: 'SDLC (Software Development Life Cycle)',
        definition: 'The process of planning, creating, testing, and deploying software. Includes phases like requirements, design, development, testing, and deployment.',
        context: 'The overall process of building software',
      },
      {
        term: 'Waterfall',
        definition: 'A traditional approach where you collect ALL requirements upfront, then design, then build, then test, then deploy. Linear and sequential.',
        context: 'Used when requirements are unlikely to change',
      },
      {
        term: 'Agile',
        definition: 'An approach where you start with high-level requirements, build in small chunks (sprints), get feedback, and iterate. Requirements evolve as you learn.',
        context: 'Most modern teams use this approach',
      },
      {
        term: 'Sprint',
        definition: 'A time-boxed period (usually 2 weeks) where a team works on a set of features. At the end, they show stakeholders what was built and get feedback.',
        context: 'The basic unit of work in Agile/Scrum',
      },
      {
        term: 'Scrum',
        definition: 'A framework for Agile development. Teams work in sprints, with regular ceremonies (meetings) like Sprint Planning, Daily Standup, and Sprint Review.',
        context: 'The most common Agile framework',
      },
      {
        term: 'Backlog Refinement',
        definition: 'A meeting where the BA presents requirements, developers ask questions, and requirements get clarified and updated. Happens before Sprint Planning.',
        context: 'Where requirements get refined before building',
      },
      {
        term: 'Sprint Planning',
        definition: 'A meeting at the start of each sprint where the team decides what to build. BA presents requirements, team estimates effort, decides what fits.',
        context: 'Where the team commits to work for the sprint',
      },
      {
        term: 'Daily Standup',
        definition: 'A 15-minute daily meeting where team members share: what I did yesterday, what I\'m doing today, any blockers. BA answers requirement questions.',
        context: 'Daily sync to keep team aligned',
      },
      {
        term: 'Sprint Review',
        definition: 'A meeting at the end of each sprint where the team shows stakeholders what was built. Stakeholders give feedback. BA presents and captures feedback.',
        context: 'Where stakeholders see progress and give feedback',
      },
      {
        term: 'High-Level Requirements',
        definition: 'Broad statements of what needs to be built, usually from stakeholders. Example: "We need to reduce fraud losses while maintaining conversion rates."',
        context: 'What you start with in Agile',
      },
      {
        term: 'Decomposition',
        definition: 'Breaking down high-level requirements into specific, detailed, testable statements. Happens during Backlog Refinement and as questions arise.',
        context: 'How you turn high-level into detailed requirements',
      },
      {
        term: 'Iterative',
        definition: 'Repeating a process with improvements each time. In Agile, you build, get feedback, refine requirements, and build more. Requirements evolve.',
        context: 'The core principle of Agile',
      },
      {
        term: 'Edge Case',
        definition: 'A scenario that happens rarely or in unusual circumstances. Developers discover these during implementation and ask BAs to clarify.',
        context: 'Why you go back to stakeholders during implementation',
      },
    ],
  },
};

// Voids Project Glossary (to be populated with housing/property management terms)
export const VOIDS_GLOSSARY: ProjectGlossary = {
  'join-orientation': {
    common: [
      {
        term: 'Initiative',
        definition: 'A project or program aimed at achieving a specific business goal. In this case, the Housing Voids Reduction initiative.',
      },
      {
        term: 'Stakeholder',
        definition: 'Anyone who has an interest in or is affected by the project. This includes tenants, housing officers, maintenance teams, and local authorities.',
      },
      {
        term: 'One-pager',
        definition: 'A concise document (usually one page) that summarizes the key information about a project: problem, goal, constraints, and success metrics.',
      },
      {
        term: 'Brief',
        definition: 'A short document providing essential context about a project. It helps you understand what you\'re working on before diving into details.',
      },
      {
        term: 'Project Manager (PM)',
        definition: 'The person responsible for planning, executing, and delivering the project on time and within budget. They coordinate resources and timelines.',
      },
      {
        term: 'Product Manager',
        definition: 'The person who defines what product features to build and why. They focus on customer needs and business value.',
      },
      {
        term: 'Line Manager',
        definition: 'Your direct manager who oversees your day-to-day work and career development. They assign you to projects.',
      },
    ],
  },
  'understand-problem': {
    common: [
      {
        term: 'Baseline',
        definition: 'The current measured value before any changes. For example, "average void duration is 45 days" is a baseline. You need this to measure improvement.',
        context: 'Used when setting targets and measuring success',
      },
      {
        term: 'Guardrail',
        definition: 'A constraint or limit you must not cross. For example, "maintain tenant satisfaction above 80%" is a guardrail that protects service quality.',
        context: 'Prevents solutions from causing unintended harm',
      },
      {
        term: 'KPI (Key Performance Indicator)',
        definition: 'A measurable value that shows how well you\'re achieving a goal. Examples: void duration (days), re-let time (days), tenant satisfaction (%).',
        context: 'Used to track progress and success',
      },
      {
        term: 'Void',
        definition: 'A property that is empty and not generating rental income. The goal is to reduce the time properties spend as voids.',
        context: 'Core concept of this project',
      },
      {
        term: 'Re-let',
        definition: 'The process of finding a new tenant for a void property and completing all necessary checks and paperwork.',
        context: 'Key process in void reduction',
      },
      {
        term: 'Void Duration',
        definition: 'The number of days a property remains empty between tenants. Lower duration = less lost rental income.',
        context: 'Primary metric for this project',
      },
      {
        term: 'Tenant Turnover',
        definition: 'The rate at which tenants move out and new ones move in. High turnover = more voids, more work, more costs.',
        context: 'Drives void numbers',
      },
      {
        term: 'Property Condition',
        definition: 'The state of repair and cleanliness of a property. Poor condition = longer void duration and higher costs to make it rentable.',
        context: 'Affects re-let time',
      },
      {
        term: 'Compliance',
        definition: 'Following laws, regulations, and housing standards. This includes gas safety, electrical checks, fire safety, and energy efficiency requirements.',
        context: 'Legal requirements before re-letting',
      },
      {
        term: 'Engagement Plan',
        definition: 'A plan for who you need to talk to, what information you need, and when. This helps you gather the right information efficiently.',
        context: 'Your roadmap for the next 48 hours',
      },
      {
        term: 'Problem Statement',
        definition: 'A clear, one-sentence description of the problem you\'re solving. It includes: what\'s wrong, where it happens, the impact, and what you need to change.',
        context: 'The foundation of your analysis',
      },
      {
        term: 'Evidence vs Assumptions',
        definition: 'Evidence = facts you can prove (data, reports, confirmed information). Assumptions = things you believe but haven\'t verified yet. Always separate these.',
        context: 'Critical for credibility',
      },
      {
        term: 'Scope',
        definition: 'What is included in your project. Defining scope prevents "scope creep" where the project keeps expanding beyond what you can deliver.',
        context: 'Boundaries of your work',
      },
      {
        term: 'Non-goals',
        definition: 'Things explicitly NOT included in your project. Stating these prevents stakeholders from expecting work you\'re not doing.',
        context: 'Prevents scope expansion',
      },
      {
        term: 'Constraints',
        definition: 'Limitations you must work within. Examples: budget limits, legal requirements, available maintenance resources, or property standards you must meet.',
        context: 'Boundaries you must respect',
      },
    ],
  },
  'whos-involved': {
    common: [
      {
        term: 'Power-Interest Grid',
        definition: 'A tool that maps stakeholders based on two dimensions: their power (ability to approve/block) and their interest (how much they care). This helps you decide how to engage with each person.',
        context: 'Your most important stakeholder analysis tool',
      },
      {
        term: 'High Power, High Interest',
        definition: 'Stakeholders who can approve or block the project AND care deeply about the outcome. These are your "Key Players" - engage them closely with weekly updates and involve them in decisions.',
        context: 'Manage closely - weekly engagement',
      },
      {
        term: 'High Power, Low Interest',
        definition: 'Stakeholders who can approve or block but don\'t care about day-to-day details. Keep them satisfied with monthly summaries and only escalate when budget/timeline issues arise.',
        context: 'Keep satisfied - monthly updates',
      },
      {
        term: 'Low Power, High Interest',
        definition: 'Stakeholders who care deeply but don\'t have decision-making authority. Often your primary users (tenants, housing officers). Keep them informed with newsletters, workshops, and involvement opportunities.',
        context: 'Keep informed - regular communication',
      },
      {
        term: 'Low Power, Low Interest',
        definition: 'Stakeholders peripherally connected to the project. Monitor them with quarterly updates and only contact when you need something specific.',
        context: 'Monitor - minimal contact',
      },
      {
        term: 'Veto Power',
        definition: 'The ability to stop or block a project. Understanding who has this prevents you from building solutions that get rejected.',
        context: 'Critical to identify early',
      },
      {
        term: 'Pressure Signals',
        definition: 'Indicators of what motivates or concerns stakeholders. Examples: budget pressure, reputation risk, operational workload, compliance requirements.',
        context: 'Helps you understand their behavior',
      },
      {
        term: 'Stakeholder Narrative',
        definition: 'A story that explains who drives urgency, who controls risk, who can block quietly, and who needs protection. Used to defend scope and prevent derailment.',
        context: 'Your strategic understanding of the landscape',
      },
      {
        term: 'Engagement Approach',
        definition: 'How often and in what depth you interact with each stakeholder. Based on their power and interest level.',
        context: 'Prevents wasted time and missed stakeholders',
      },
    ],
  },
  'stakeholder-communication': {
    common: [
      {
        term: 'Communication Channel',
        definition: 'The method you use to communicate: Email (formal, documented), Teams/Slack (quick, async), Video calls (complex discussions), In-person (sensitive topics).',
        context: 'Choose based on purpose and stakeholder preference',
      },
      {
        term: 'Meeting Framework',
        definition: 'A structured 5-step approach BAs use: 1) Set the frame (purpose), 2) Reflect what you know, 3) Surface differences, 4) Clarify constraints, 5) Define next steps with owners.',
        context: 'Keeps meetings productive and focused',
      },
      {
        term: 'Analytical Notes',
        definition: 'Notes that capture meaning, decisions, and implications - not just what was said. These become your decision trail and are referenced in requirements docs.',
        context: 'Strong BAs analyze, weak BAs transcribe',
      },
      {
        term: 'Decision Trail',
        definition: 'A clear record of what was decided, why, who owns it, and what happens next. Essential for accountability and preventing "I thought we agreed..." situations.',
        context: 'Created through structured notes and follow-ups',
      },
      {
        term: 'Follow-Up Message',
        definition: 'A summary posted after meetings in project channels. Includes: what was discussed, decisions made, owners assigned, and next steps. Builds trust and creates documentation.',
        context: 'Shows you\'re structured and reliable',
      },
      {
        term: 'Conversation Script',
        definition: 'Prepared phrases and approaches for different stakeholder types. Helps you adapt your tone and focus based on who you\'re talking to.',
        context: 'Copy, adapt, use in interviews',
      },
      {
        term: 'Context',
        definition: 'The background information that explains why you\'re reaching out. Always include this in your first message so stakeholders understand the purpose.',
        context: 'First element of effective communication',
      },
      {
        term: 'Specific Ask',
        definition: 'A clear, actionable request. Instead of "I need your input," say "Can you review the requirements doc by Friday and confirm if the void process matches your team\'s workflow?"',
        context: 'Makes it easy for stakeholders to respond',
      },
    ],
  },
  'as-is-to-be': {
    common: [
      {
        term: 'As-Is',
        definition: 'The current state of a process or system - what actually happens in reality, not what the documentation says. Captured by observing people work under pressure.',
        context: 'The foundation of gap analysis',
      },
      {
        term: 'Gap Analysis',
        definition: 'Identifying the difference between what you have (As-Is) and what you need (To-Be). A gap is what\'s missing or broken that prevents you from reaching your goal. You document what the gap is, why it exists, and what impact it has.',
        context: 'The difference between current state and what you need',
      },
      {
        term: 'To-Be',
        definition: 'Your solution. It describes how things will work in the future and includes the requirements (what the system must do) to make it happen. To-Be solves the gaps you identified.',
        context: 'The solution with requirements',
      },
      {
        term: 'Workaround',
        definition: 'A temporary solution people create when the official process doesn\'t work. Reveals where the system is broken.',
        context: 'Signals process failure',
      },
      {
        term: 'Shadowing',
        definition: 'Observing someone do their actual work (with permission). Watching behavior reveals more than asking questions.',
        context: 'Best way to capture real As-Is',
      },
      {
        term: 'Pain Point',
        definition: 'A specific moment where the process causes frustration, delay, or error. These are what you\'re solving.',
        context: 'Where to focus your analysis',
      },
      {
        term: 'Process Map',
        definition: 'A visual or narrative representation of how work flows. Can be simple (step-by-step) or detailed (swimlane diagram).',
        context: 'Makes As-Is visible',
      },
      {
        term: 'Constraint vs Preference',
        definition: 'Constraints are non-negotiable (legal, regulatory, technical limits). Preferences are "nice to have" but can be challenged.',
        context: 'Critical distinction for To-Be design',
      },
      {
        term: 'Success Metrics',
        definition: 'Measurable indicators that show the To-Be state is working. Defined with stakeholders before designing solutions.',
        context: 'How you\'ll know it worked',
      },
    ],
  },
  'implementation': {
    common: [
      {
        term: 'SDLC (Software Development Life Cycle)',
        definition: 'The process of planning, creating, testing, and deploying software. Includes phases like requirements, design, development, testing, and deployment.',
        context: 'The overall process of building software',
      },
      {
        term: 'Waterfall',
        definition: 'A traditional approach where you collect ALL requirements upfront, then design, then build, then test, then deploy. Linear and sequential.',
        context: 'Used when requirements are unlikely to change',
      },
      {
        term: 'Agile',
        definition: 'An approach where you start with high-level requirements, build in small chunks (sprints), get feedback, and iterate. Requirements evolve as you learn.',
        context: 'Most modern teams use this approach',
      },
      {
        term: 'Sprint',
        definition: 'A time-boxed period (usually 2 weeks) where a team works on a set of features. At the end, they show stakeholders what was built and get feedback.',
        context: 'The basic unit of work in Agile/Scrum',
      },
      {
        term: 'Scrum',
        definition: 'A framework for Agile development. Teams work in sprints, with regular ceremonies (meetings) like Sprint Planning, Daily Standup, and Sprint Review.',
        context: 'The most common Agile framework',
      },
      {
        term: 'Backlog Refinement',
        definition: 'A meeting where the BA presents requirements, developers ask questions, and requirements get clarified and updated. Happens before Sprint Planning.',
        context: 'Where requirements get refined before building',
      },
      {
        term: 'Sprint Planning',
        definition: 'A meeting at the start of each sprint where the team decides what to build. BA presents requirements, team estimates effort, decides what fits.',
        context: 'Where the team commits to work for the sprint',
      },
      {
        term: 'Daily Standup',
        definition: 'A 15-minute daily meeting where team members share: what I did yesterday, what I\'m doing today, any blockers. BA answers requirement questions.',
        context: 'Daily sync to keep team aligned',
      },
      {
        term: 'Sprint Review',
        definition: 'A meeting at the end of each sprint where the team shows stakeholders what was built. Stakeholders give feedback. BA presents and captures feedback.',
        context: 'Where stakeholders see progress and give feedback',
      },
      {
        term: 'High-Level Requirements',
        definition: 'Broad statements of what needs to be built, usually from stakeholders. Example: "We need to reduce void duration while maintaining tenant satisfaction."',
        context: 'What you start with in Agile',
      },
      {
        term: 'Decomposition',
        definition: 'Breaking down high-level requirements into specific, detailed, testable statements. Happens during Backlog Refinement and as questions arise.',
        context: 'How you turn high-level into detailed requirements',
      },
      {
        term: 'Iterative',
        definition: 'Repeating a process with improvements each time. In Agile, you build, get feedback, refine requirements, and build more. Requirements evolve.',
        context: 'The core principle of Agile',
      },
      {
        term: 'Edge Case',
        definition: 'A scenario that happens rarely or in unusual circumstances. Developers discover these during implementation and ask BAs to clarify.',
        context: 'Why you go back to stakeholders during implementation',
      },
    ],
  },
  'requirements-documentation': {
    common: [
      {
        term: 'High-Level Requirements',
        definition: 'Broad statements of what needs to be built, written at the start. They describe the big picture, not every detail. Example: "Evaluate identity risk at account creation."',
        context: 'What you write on Page 6 before breaking down in tools',
      },
      {
        term: 'User Story',
        definition: 'A small piece of functionality written from the user\'s perspective. Format: "As a [user], I want [goal], so that [benefit]." Provides context for why you\'re building something.',
        context: 'A container that holds acceptance criteria',
      },
      {
        term: 'Acceptance Criteria (AC)',
        definition: 'Specific, testable conditions that must be met for a user story to be considered complete. Written as clear statements that developers can build and QA can test.',
        context: 'The detailed requirements that developers use to build',
      },
      {
        term: 'Epic',
        definition: 'A large feature or capability that\'s too big to build in one sprint. Contains multiple user stories. Example: "Risk-Based Identity Verification" is an epic.',
        context: 'Used in Jira to organize related user stories',
      },
      {
        term: 'Intent Statement',
        definition: 'A single, clear explanation of what you\'re trying to achieve. The anchor that keeps stakeholders focused on the goal, not wishlists.',
        context: 'The foundation of all requirements',
      },
      {
        term: 'Functional Truths',
        definition: 'Real constraints or facts that must be respected. They prevent naive solutions. Example: "Not all users share the same risk level."',
        context: 'Protects against oversimplified solutions',
      },
      {
        term: 'Traceability',
        definition: 'Linking every requirement to a business outcome. Shows how requirements solve problems and defend scope in steering meetings.',
        context: 'How you prove requirements solve business problems',
      },
      {
        term: 'Stakeholder Sign-Off',
        definition: 'Getting approval from stakeholders before development starts. Usually done via Excel or Jira after breaking down high-level requirements.',
        context: 'Critical step before development begins',
      },
      {
        term: 'QA (Quality Assurance)',
        definition: 'The team or person responsible for testing software to ensure it works correctly and meets requirements. QA uses acceptance criteria to verify features work as expected.',
        context: 'Tests features based on acceptance criteria you write',
      },
      {
        term: 'Developer / Engineering',
        definition: 'The team members who write code and build the software. They use your requirements and acceptance criteria to know exactly what to build.',
        context: 'The people who build what you specify',
      },
      {
        term: 'Confluence',
        definition: 'A collaboration tool where teams document requirements, decisions, and project information. BAs often write requirements documents in Confluence for the team to review.',
        context: 'Where you document requirements for the team',
      },
      {
        term: 'Decision States',
        definition: 'The possible outcomes or results a system can produce. For example: "approve", "reject", or "send to manual review". Defining these removes ambiguity for developers.',
        context: 'Clear boundaries that remove ambiguity',
      },
      {
        term: 'Testable',
        definition: 'A requirement or acceptance criterion that can be verified through testing. If you can\'t test it, it\'s not clear enough. Example: "User sees error message" is testable; "User feels happy" is not.',
        context: 'Requirements must be testable to be useful',
      },
    ],
  },
  'requirements-documentation': {
    common: [
      {
        term: 'High-Level Requirements',
        definition: 'Broad statements of what needs to be built, written at the start. They describe the big picture, not every detail. Example: "Evaluate void readiness at inspection completion."',
        context: 'What you write on Page 6 before breaking down in tools',
      },
      {
        term: 'User Story',
        definition: 'A small piece of functionality written from the user\'s perspective. Format: "As a [user], I want [goal], so that [benefit]." Provides context for why you\'re building something.',
        context: 'A container that holds acceptance criteria',
      },
      {
        term: 'Acceptance Criteria (AC)',
        definition: 'Specific, testable conditions that must be met for a user story to be considered complete. Written as clear statements that developers can build and QA can test.',
        context: 'The detailed requirements that developers use to build',
      },
      {
        term: 'Epic',
        definition: 'A large feature or capability that\'s too big to build in one sprint. Contains multiple user stories. Example: "Streamlined Void-to-Re-let Process" is an epic.',
        context: 'Used in Jira to organize related user stories',
      },
      {
        term: 'Intent Statement',
        definition: 'A single, clear explanation of what you\'re trying to achieve. The anchor that keeps stakeholders focused on the goal, not wishlists.',
        context: 'The foundation of all requirements',
      },
      {
        term: 'Functional Truths',
        definition: 'Real constraints or facts that must be respected. They prevent naive solutions. Example: "Not all voids have the same repair complexity."',
        context: 'Protects against oversimplified solutions',
      },
      {
        term: 'Traceability',
        definition: 'Linking every requirement to a business outcome. Shows how requirements solve problems and defend scope in steering meetings.',
        context: 'How you prove requirements solve business problems',
      },
      {
        term: 'Stakeholder Sign-Off',
        definition: 'Getting approval from stakeholders before development starts. Usually done via Excel or Jira after breaking down high-level requirements.',
        context: 'Critical step before development begins',
      },
      {
        term: 'QA (Quality Assurance)',
        definition: 'The team or person responsible for testing software to ensure it works correctly and meets requirements. QA uses acceptance criteria to verify features work as expected.',
        context: 'Tests features based on acceptance criteria you write',
      },
      {
        term: 'Developer / Engineering',
        definition: 'The team members who write code and build the software. They use your requirements and acceptance criteria to know exactly what to build.',
        context: 'The people who build what you specify',
      },
      {
        term: 'Confluence',
        definition: 'A collaboration tool where teams document requirements, decisions, and project information. BAs often write requirements documents in Confluence for the team to review.',
        context: 'Where you document requirements for the team',
      },
      {
        term: 'Decision States',
        definition: 'The possible outcomes or results a system can produce. For example: "approve", "reject", or "send to manual review". Defining these removes ambiguity for developers.',
        context: 'Clear boundaries that remove ambiguity',
      },
      {
        term: 'Testable',
        definition: 'A requirement or acceptance criterion that can be verified through testing. If you can\'t test it, it\'s not clear enough. Example: "User sees error message" is testable; "User feels happy" is not.',
        context: 'Requirements must be testable to be useful',
      },
    ],
  },
};

/**
 * Get glossary terms for a specific project and page
 */
export function getGlossaryTerms(
  project: 'cif' | 'voids',
  pageKey: string
): GlossaryTerm[] {
  const glossary = project === 'cif' ? CIF_GLOSSARY : VOIDS_GLOSSARY;
  const pageGlossary = glossary[pageKey];
  
  if (!pageGlossary) {
    return [];
  }
  
  // Combine all term categories for the page
  return Object.values(pageGlossary).flat();
}

