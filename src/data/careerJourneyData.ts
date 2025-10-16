import { Briefcase, Users, FileText, GitBranch, Lightbulb, Palette, Repeat, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface JourneyTopic {
  id: string;
  title: string;
  description: string;
  viewId?: string; // Maps to existing app views
  estimatedTime: string;
}

export interface JourneyPhase {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  topics: JourneyTopic[];
  realWorldContext: string;
  deliverables?: string[];
  stakeholders?: string[];
  learningModuleId?: string; // Primary learning module for navigation
  learningModuleIds?: string[]; // Multiple learning modules for this phase
  learningModuleNames?: string[]; // Display names for multiple modules
  practiceModuleId?: string; // Maps to Practice Journey module
  practiceModuleTitle?: string; // Display name for practice module
}

export const CAREER_JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: 'phase-1-onboarding',
    order: 1,
    title: 'Welcome & Onboarding',
    shortTitle: 'Onboarding',
    description: 'Your first days as a BA - orientation, setup, and project introduction',
    icon: Briefcase,
    color: 'purple',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-indigo-600',
    realWorldContext: 'You\'ve just been hired! HR sends your laptop, IT grants access, and you meet your manager to learn about the project you\'ll support.',
    learningModuleId: 'core-learning',
    topics: [
      {
        id: 'onboarding-hr',
        title: 'HR Orientation',
        description: 'Complete company onboarding, understand policies, and set up your workspace',
        estimatedTime: '30 min'
      },
      {
        id: 'onboarding-manager',
        title: 'Manager Welcome Meeting',
        description: 'Meet your line manager and learn about your role and responsibilities',
        viewId: 'training-practice', // Use existing stakeholder meeting
        estimatedTime: '20 min'
      },
      {
        id: 'onboarding-project',
        title: 'Project Introduction',
        description: 'Get introduced to the project you\'ll be working on and understand the business problem',
        estimatedTime: '45 min'
      },
      {
        id: 'onboarding-tools',
        title: 'BA Tools Overview',
        description: 'Learn the tools and systems BAs use daily (documentation tools, meeting software, etc.)',
        estimatedTime: '30 min'
      }
    ],
    deliverables: [
      'Completed onboarding checklist',
      'Initial project brief notes',
      'Stakeholder contact list (draft)'
    ],
    stakeholders: [
      'HR Team',
      'IT Support',
      'Line Manager',
      'Project Sponsor'
    ]
  },
  {
    id: 'phase-2-context',
    order: 2,
    title: 'Project Context & Discovery',
    shortTitle: 'Discovery',
    description: 'Review project documents and understand the business context',
    icon: FileText,
    color: 'blue',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-600',
    realWorldContext: 'Before you can analyze anything, you need to understand WHY this project exists and WHAT problem it\'s solving.',
    learningModuleId: 'project-initiation',
    practiceModuleId: 'practice-1-elicitation',
    practiceModuleTitle: 'Elicitation Practice',
    topics: [
      {
        id: 'context-business-case',
        title: 'Business Case Review',
        description: 'Analyze the business case to understand project justification and expected benefits',
        viewId: 'core-learning', // Or document analysis view
        estimatedTime: '1 hour'
      },
      {
        id: 'context-charter',
        title: 'Project Charter Analysis',
        description: 'Review project charter, scope, objectives, and constraints',
        estimatedTime: '45 min'
      },
      {
        id: 'context-org-chart',
        title: 'Organizational Chart Review',
        description: 'Study the org chart to identify departments, roles, and reporting lines',
        estimatedTime: '30 min'
      },
      {
        id: 'context-project-type',
        title: 'Identify Project Type',
        description: 'Determine if it\'s a greenfield (new) or brownfield (improvement) project',
        estimatedTime: '20 min'
      }
    ],
    deliverables: [
      'Document analysis summary',
      'Initial questions log',
      'Project context report',
      'Glossary of key terms'
    ],
    stakeholders: [
      'Project Manager',
      'Business Sponsor',
      'Subject Matter Experts'
    ]
  },
  {
    id: 'phase-3-stakeholders',
    order: 3,
    title: 'Stakeholder Analysis & Mapping',
    shortTitle: 'Stakeholders',
    description: 'Identify, categorize, and plan engagement with key stakeholders',
    icon: Users,
    color: 'emerald',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    realWorldContext: 'BAs don\'t work alone. You need to identify who has the information, who makes decisions, and who will be affected by changes.',
    learningModuleId: 'stakeholder-mapping',
    practiceModuleId: 'practice-1-elicitation',
    practiceModuleTitle: 'Elicitation Practice',
    topics: [
      {
        id: 'stakeholder-identification',
        title: 'Stakeholder Identification',
        description: 'Identify all stakeholders across departments (IT, Finance, Operations, etc.)',
        estimatedTime: '30 min'
      },
      {
        id: 'stakeholder-analysis',
        title: 'Power/Interest Analysis',
        description: 'Classify stakeholders by power and interest to prioritize engagement',
        estimatedTime: '45 min'
      },
      {
        id: 'stakeholder-communication',
        title: 'Communication Planning',
        description: 'Plan how and when to engage each stakeholder group',
        estimatedTime: '30 min'
      },
      {
        id: 'stakeholder-intro-meetings',
        title: 'Initial Stakeholder Meetings',
        description: 'Book and conduct intro meetings to understand roles and concerns',
        viewId: 'training-practice',
        estimatedTime: '1 hour'
      }
    ],
    deliverables: [
      'Stakeholder register',
      'Power/Interest grid',
      'Meeting notes & insights',
      'Engagement plan'
    ],
    stakeholders: [
      'Business Users',
      'Department Heads',
      'IT Team',
      'External Vendors'
    ]
  },
  {
    id: 'phase-4-as-is',
    order: 4,
    title: 'Current State Analysis (As-Is)',
    shortTitle: 'As-Is Analysis',
    description: 'Document and analyze current processes to identify inefficiencies',
    icon: GitBranch,
    color: 'amber',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    realWorldContext: 'Before proposing solutions, you must understand how things work TODAY - even if it\'s messy, manual, or inefficient.',
    learningModuleId: 'process-mapper',
    practiceModuleId: 'practice-1-elicitation',
    practiceModuleTitle: 'Elicitation Practice',
    topics: [
      {
        id: 'as-is-document-request',
        title: 'Request Process Documentation',
        description: 'Reach out to stakeholders to gather existing process documents and workflows',
        estimatedTime: '30 min'
      },
      {
        id: 'as-is-document-analysis',
        title: 'Document Analysis',
        description: 'Review existing documentation (often outdated or incomplete)',
        estimatedTime: '1 hour'
      },
      {
        id: 'as-is-process-mapping',
        title: 'Process Mapping (As-Is)',
        description: 'Create BPMN diagrams showing the current process flow',
        viewId: 'process-mapper',
        estimatedTime: '2 hours'
      },
      {
        id: 'as-is-gap-identification',
        title: 'Identify Inefficiencies',
        description: 'Spot bottlenecks, manual steps, errors, and improvement opportunities',
        estimatedTime: '45 min'
      },
      {
        id: 'as-is-validation',
        title: 'Validate with Stakeholders',
        description: 'Review your As-Is map with stakeholders to confirm accuracy',
        viewId: 'training-practice',
        estimatedTime: '30 min'
      }
    ],
    deliverables: [
      'As-Is process maps (BPMN)',
      'Pain points & gap analysis',
      'Current system documentation',
      'Stakeholder validation sign-off'
    ],
    stakeholders: [
      'Process Owners',
      'Business Users',
      'Operations Team',
      'IT Support'
    ]
  },
  {
    id: 'phase-5-to-be',
    order: 5,
    title: 'Future State Process (To-Be)',
    shortTitle: 'To-Be Process',
    description: 'Design improved processes, evaluate solution options, and identify MVP features',
    icon: Lightbulb,
    color: 'green',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-600',
    realWorldContext: 'Now that you know what\'s broken, propose HOW to fix it. Design the future state process, evaluate different solution options, and identify which features should be in the MVP for maximum value with minimum complexity.',
    learningModuleId: 'process-mapper',
    learningModuleIds: ['module-5-process-mapping', 'module-7-solution-options', 'module-10-mvp'],
    learningModuleNames: ['Module 5: Process Mapping', 'Module 7: Solution Options', 'Module 10: MVP'],
    practiceModuleId: 'practice-3-mvp',
    practiceModuleTitle: 'MVP Practice',
    topics: [
      {
        id: 'to-be-solution-options',
        title: 'Evaluate Solution Options',
        description: 'Identify multiple ways to solve the problem (automation, new system, process change)',
        viewId: 'solution-options',
        estimatedTime: '1 hour'
      },
      {
        id: 'to-be-process-design',
        title: 'Design To-Be Process',
        description: 'Create BPMN diagrams showing the improved future process',
        viewId: 'process-mapper',
        estimatedTime: '2 hours'
      },
      {
        id: 'to-be-comparison',
        title: 'As-Is vs To-Be Comparison',
        description: 'Highlight the improvements and changes between current and future state',
        estimatedTime: '30 min'
      },
      {
        id: 'to-be-sign-off',
        title: 'Get Stakeholder Sign-Off',
        description: 'Present To-Be design to stakeholders and obtain approval',
        viewId: 'training-practice',
        estimatedTime: '45 min'
      }
    ],
    deliverables: [
      'To-Be process maps',
      'Benefits realization plan',
      'Change impact assessment',
      'Stakeholder approval documentation'
    ],
    stakeholders: [
      'Business Sponsor',
      'Process Owners',
      'Change Management Team',
      'Executive Leadership'
    ]
  },
  {
    id: 'phase-6-requirements',
    order: 6,
    title: 'Requirements Elicitation & Gathering',
    shortTitle: 'Requirements',
    description: 'Conduct workshops and interviews to capture detailed requirements (Note: In Agile, this is iterative, not a complete upfront phase)',
    icon: Users,
    color: 'pink',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-rose-600',
    realWorldContext: 'With the To-Be process approved, you capture WHAT the solution must do. In Waterfall, this happens upfront. In Agile, you gather just enough for the next sprint and refine continuously.',
    learningModuleId: 'requirements-engineering',
    topics: [
      {
        id: 'req-elicitation-planning',
        title: 'Plan Elicitation Approach',
        description: 'Choose techniques: workshops, interviews, observations, surveys',
        viewId: 'elicitation',
        estimatedTime: '30 min'
      },
      {
        id: 'req-workshops',
        title: 'Conduct Requirements Workshops',
        description: 'Facilitate group sessions to gather requirements from multiple stakeholders',
        viewId: 'training-practice',
        estimatedTime: '2 hours'
      },
      {
        id: 'req-interviews',
        title: 'Stakeholder Interviews',
        description: 'One-on-one conversations to deep-dive into specific needs',
        viewId: 'training-practice',
        estimatedTime: '1 hour'
      },
      {
        id: 'req-documentation',
        title: 'Document Requirements',
        description: 'Structure and write clear functional and non-functional requirements',
        viewId: 'requirements-engineering',
        estimatedTime: '2 hours'
      },
      {
        id: 'req-prioritization',
        title: 'Requirements Prioritization',
        description: 'Work with stakeholders to prioritize must-have vs nice-to-have',
        estimatedTime: '1 hour'
      }
    ],
    deliverables: [
      'User stories backlog',
      'Acceptance criteria',
      'Requirements traceability matrix',
      'Functional & non-functional requirements'
    ],
    stakeholders: [
      'Product Owner',
      'Business Users',
      'Technical Lead',
      'QA Team'
    ]
  },
  {
    id: 'phase-7-documentation',
    order: 7,
    title: 'Requirements Documentation & User Stories',
    shortTitle: 'Documentation',
    description: 'Transform gathered requirements into clear, structured documentation and user stories',
    icon: FileText,
    color: 'teal',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-cyan-600',
    realWorldContext: 'You\'ve gathered requirements from stakeholders. Now you need to document them clearly so developers, testers, and designers can understand exactly what needs to be built. In Agile, this means writing user stories with acceptance criteria. In Waterfall, it means detailed requirements specifications.',
    learningModuleId: 'documentation',
    practiceModuleId: 'practice-2-documentation',
    practiceModuleTitle: 'Documentation Practice',
    topics: [
      {
        id: 'doc-user-stories',
        title: 'Writing User Stories',
        description: 'Write clear user stories following the "As a... I want... So that..." format',
        viewId: 'documentation',
        estimatedTime: '1 hour'
      },
      {
        id: 'doc-acceptance-criteria',
        title: 'Defining Acceptance Criteria',
        description: 'Write testable acceptance criteria that define "done"',
        viewId: 'documentation',
        estimatedTime: '1 hour'
      },
      {
        id: 'doc-functional-requirements',
        title: 'Functional Requirements Documentation',
        description: 'Document what the system must do using clear, unambiguous language',
        viewId: 'requirements-engineering',
        estimatedTime: '2 hours'
      },
      {
        id: 'doc-non-functional',
        title: 'Non-Functional Requirements',
        description: 'Capture performance, security, usability, and compliance requirements',
        viewId: 'requirements-engineering',
        estimatedTime: '1 hour'
      },
      {
        id: 'doc-validation',
        title: 'Requirements Validation',
        description: 'Review documentation with stakeholders to ensure accuracy and completeness',
        viewId: 'training-practice',
        estimatedTime: '45 min'
      },
      {
        id: 'doc-traceability',
        title: 'Requirements Traceability',
        description: 'Link requirements back to business objectives and forward to test cases',
        estimatedTime: '30 min'
      }
    ],
    deliverables: [
      'User stories with acceptance criteria',
      'Functional requirements document',
      'Non-functional requirements specification',
      'Requirements traceability matrix',
      'Stakeholder sign-off on requirements'
    ],
    stakeholders: [
      'Product Owner',
      'Development Team',
      'QA/Test Team',
      'Business Users',
      'Technical Lead'
    ]
  },
  {
    id: 'phase-8-design-collaboration',
    order: 8,
    title: 'Design & Architecture Collaboration',
    shortTitle: 'Design',
    description: 'Work with Solution Architects and UX/UI to shape the solution',
    icon: Palette,
    color: 'indigo',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-purple-600',
    realWorldContext: 'With documented requirements, you now work with architects and designers to determine HOW the solution will be built. BAs bridge business needs and technical delivery, ensuring designs are feasible and meet the documented requirements.',
    learningModuleId: 'design-hub',
    practiceModuleId: 'practice-2-documentation',
    practiceModuleTitle: 'Documentation Practice',
    topics: [
      {
        id: 'design-solution-arch',
        title: 'Solution Architecture Review',
        description: 'Work with Solution Architects to confirm technical feasibility',
        estimatedTime: '1 hour'
      },
      {
        id: 'design-ux-collaboration',
        title: 'UX/UI Collaboration',
        description: 'Partner with designers to create prototypes that meet business needs',
        viewId: 'design-hub',
        estimatedTime: '2 hours'
      },
      {
        id: 'design-prototype-review',
        title: 'Prototype Review & Feedback',
        description: 'Review wireframes and prototypes, ensuring they align with requirements',
        estimatedTime: '1 hour'
      },
      {
        id: 'design-traceability',
        title: 'Requirements Traceability',
        description: 'Link design elements back to business requirements for validation',
        estimatedTime: '45 min'
      }
    ],
    deliverables: [
      'Solution design document',
      'UX/UI prototypes',
      'Technical specifications',
      'Design approval sign-off'
    ],
    stakeholders: [
      'Solution Architects',
      'UX/UI Designers',
      'Development Team',
      'Technical Lead'
    ]
  },
  {
    id: 'phase-9-agile',
    order: 9,
    title: 'Agile Delivery Sprint Loop',
    shortTitle: 'Agile Sprint Loop',
    description: 'The continuous sprint cycle: plan, refine, build, review, retrospect, and repeat throughout delivery',
    icon: Repeat,
    color: 'cyan',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-600',
    realWorldContext: 'This is not a single phase—it\'s the ongoing Agile loop that continues throughout project delivery. You participate in sprint planning, daily standups, backlog refinement, sprint reviews, and retrospectives. Each sprint builds on the last, continuously delivering value. This loop continues through MVP launch and beyond.',
    learningModuleId: 'agile-scrum',
    learningModuleIds: ['module-11-agile-scrum', 'module-10-mvp', 'module-8-documentation', 'module-6-requirements-engineering'],
    learningModuleNames: ['Module 11: Agile/Scrum', 'Module 10: MVP', 'Module 8: Documentation', 'Module 6: Requirements Engineering'],
    practiceModuleId: 'practice-4-scrum',
    practiceModuleTitle: 'Scrum Practice',
    topics: [
      {
        id: 'agile-backlog',
        title: 'Backlog Refinement',
        description: 'Review and refine user stories, add acceptance criteria, clarify requirements',
        viewId: 'mvp-hub',
        estimatedTime: '1 hour'
      },
      {
        id: 'agile-sprint-planning',
        title: 'Sprint Planning',
        description: 'Help prioritize stories, clarify requirements, estimate complexity',
        viewId: 'agile-scrum',
        estimatedTime: '2 hours'
      },
      {
        id: 'agile-daily-scrum',
        title: 'Daily Scrum/Standup',
        description: 'Track progress, identify blockers, answer team questions',
        estimatedTime: '15 min'
      },
      {
        id: 'agile-sprint-review',
        title: 'Sprint Review',
        description: 'Demo completed work, validate against acceptance criteria',
        estimatedTime: '1 hour'
      },
      {
        id: 'agile-retrospective',
        title: 'Sprint Retrospective',
        description: 'Reflect on what went well and what to improve',
        estimatedTime: '1 hour'
      }
    ],
    deliverables: [
      'Refined user stories',
      'Sprint goals & commitments',
      'UAT scenarios',
      'Sprint reports'
    ],
    stakeholders: [
      'Scrum Master',
      'Development Team',
      'Product Owner',
      'QA Team'
    ]
  },
  {
    id: 'phase-10-delivery',
    order: 10,
    title: 'MVP Launch & Continuous Delivery',
    shortTitle: 'Continuous Delivery',
    description: 'Launch the MVP, gather user feedback, iterate based on real-world usage, and continuously improve the product',
    icon: Rocket,
    color: 'green',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-600',
    realWorldContext: 'The Agile sprint loop (Phase 9) continues, but now with real users. You launch the MVP, monitor how it\'s used, gather feedback, prioritize improvements, and keep iterating. The BA\'s role shifts from building the first version to ensuring continuous delivery of value based on actual user needs and business metrics.',
    learningModuleId: 'mvp-hub',
    learningModuleIds: ['module-10-mvp', 'module-11-agile-scrum', 'module-8-documentation'],
    learningModuleNames: ['Module 10: MVP', 'Module 11: Agile/Scrum', 'Module 8: Documentation'],
    topics: [
      {
        id: 'mvp-launch',
        title: 'MVP Launch',
        description: 'Launch the minimum viable product to real users',
        viewId: 'mvp-hub',
        estimatedTime: '1 hour'
      },
      {
        id: 'mvp-feedback',
        title: 'User Feedback Collection',
        description: 'Gather and analyze user feedback on the MVP',
        estimatedTime: '1 hour'
      },
      {
        id: 'mvp-metrics',
        title: 'Monitor Success Metrics',
        description: 'Track KPIs, usage analytics, and business impact',
        estimatedTime: '45 min'
      },
      {
        id: 'mvp-iteration',
        title: 'Prioritize Next Iteration',
        description: 'Based on feedback and metrics, prioritize improvements for next sprint',
        viewId: 'mvp-hub',
        estimatedTime: '1 hour'
      },
      {
        id: 'mvp-continuous-refinement',
        title: 'Continuous Backlog Refinement',
        description: 'Keep refining user stories based on real-world learnings',
        viewId: 'agile-scrum',
        estimatedTime: 'Ongoing'
      },
      {
        id: 'mvp-value-delivery',
        title: 'Incremental Value Delivery',
        description: 'Each sprint delivers additional value, building on the MVP',
        estimatedTime: 'Ongoing'
      }
    ],
    deliverables: [
      'MVP launch plan',
      'User feedback analysis',
      'Product metrics dashboard',
      'Prioritized backlog for next iterations',
      'Continuous improvement roadmap'
    ],
    stakeholders: [
      'Product Owner',
      'End Users',
      'Scrum Master',
      'Development Team',
      'Business Sponsor',
      'Operations Team'
    ]
  }
];

// Helper to get phase by ID
export const getPhaseById = (id: string) => CAREER_JOURNEY_PHASES.find(p => p.id === id);

// Helper to get next phase
export const getNextPhase = (currentPhaseId: string) => {
  const current = CAREER_JOURNEY_PHASES.find(p => p.id === currentPhaseId);
  if (!current) return null;
  return CAREER_JOURNEY_PHASES.find(p => p.order === current.order + 1);
};

// Helper to get previous phase
export const getPreviousPhase = (currentPhaseId: string) => {
  const current = CAREER_JOURNEY_PHASES.find(p => p.id === currentPhaseId);
  if (!current) return null;
  return CAREER_JOURNEY_PHASES.find(p => p.order === current.order - 1);
};

