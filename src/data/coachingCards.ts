import { CoachingCard, TrainingStage } from '../types/training';

// Stage-specific coaching cards that adapt to project context
export const getCoachingCards = (stage: TrainingStage, projectId: string): CoachingCard[] => {
  const baseCards = getBaseCards(stage);
  const projectCards = getProjectSpecificCards(stage, projectId);
  return [...baseCards, ...projectCards];
};

const getBaseCards = (stage: TrainingStage): CoachingCard[] => {
  switch (stage) {
    case 'problem_exploration':
      return [
        {
          id: 'warm-up',
          phase: stage,
          skill: 'Meeting Setup',
          title: 'Start the Conversation',
          description: 'Establish rapport and set the meeting context',
          whyItMatters: 'Creates a comfortable environment and ensures everyone understands the purpose',
          howToAsk: 'Greet warmly, explain your role, and state the meeting objective',
          examplePhrases: [
            'Hi [Name], thanks for your time today. I\'m here to understand your current challenges.',
            'Hello everyone, I appreciate you joining me. I\'d like to learn about your process pain points.'
          ],
          whatToListenFor: ['Their comfort level', 'Understanding of the meeting purpose', 'Initial concerns'],
          digDeeperOptions: [
            'What would make this conversation most useful for you?',
            'Are there specific areas you\'d like to focus on?'
          ],
          nextStep: 'Move to pain point exploration',
          isActive: true
        },
        {
          id: 'pain-points',
          phase: stage,
          skill: 'Problem Discovery',
          title: 'Uncover Pain Points',
          description: 'Identify the main challenges and frustrations',
          whyItMatters: 'Understanding pain points helps prioritize improvements and quantify impact',
          howToAsk: 'Ask open-ended questions about challenges and frustrations',
          examplePhrases: [
            'What are the biggest challenges you face in your current process?',
            'What frustrates you most about how things work right now?',
            'Where do things typically break down or slow down?'
          ],
          whatToListenFor: ['Specific pain points', 'Frequency of issues', 'Impact on work', 'Emotional responses'],
          digDeeperOptions: [
            'Can you give me a recent example of when this happened?',
            'How often does this occur?',
            'Who else is affected by this issue?'
          ],
          nextStep: 'Quantify the impact',
          isActive: false
        },
        {
          id: 'impact-quantification',
          phase: stage,
          skill: 'Impact Analysis',
          title: 'Understand the Impact',
          description: 'Understand how the problems affect work and processes',
          whyItMatters: 'Understanding impact helps prioritize improvements and design better solutions',
          howToAsk: 'Ask about time, efficiency, and operational impact',
          examplePhrases: [
            'Roughly how much time does this add to your work each week?',
            'How often does this issue occur?',
            'How does this affect your team\'s productivity?',
            'What happens when this problem occurs?'
          ],
          whatToListenFor: ['Time estimates', 'Frequency data', 'Process delays', 'Operational impact', 'User frustration'],
          digDeeperOptions: [
            'Can you break that down further?',
            'What\'s the worst-case scenario?',
            'How does this affect other teams or processes?'
          ],
          nextStep: 'Prioritize the problems',
          isActive: false
        },
        {
          id: 'prioritization',
          phase: stage,
          skill: 'Problem Prioritization',
          title: 'Prioritize Problems',
          description: 'Identify which issues to tackle first',
          whyItMatters: 'Focusing on high-impact, low-effort improvements creates quick wins',
          howToAsk: 'Ask stakeholders to rank or prioritize the issues discussed',
          examplePhrases: [
            'If we could fix one thing first, which would make the biggest difference?',
            'Which of these issues is most urgent for you?',
            'What would you tackle first if you had the resources?'
          ],
          whatToListenFor: ['Priority reasoning', 'Urgency indicators', 'Resource constraints', 'Success criteria'],
          digDeeperOptions: [
            'What makes this the highest priority?',
            'What would success look like for this issue?',
            'What\'s blocking you from addressing this now?'
          ],
          nextStep: 'Explore root causes',
          isActive: false
        }
      ];

    case 'as_is':
      return [
        {
          id: 'process-mapping',
          phase: stage,
          skill: 'Process Understanding',
          title: 'Map Current Process',
          description: 'Understand how things work today',
          whyItMatters: 'Accurate process mapping reveals inefficiencies and improvement opportunities',
          howToAsk: 'Walk through the current process step by step',
          examplePhrases: [
            'Can you walk me through your current process step by step?',
            'What happens when you receive a new request?',
            'How do you typically handle this type of situation?'
          ],
          whatToListenFor: ['Process steps', 'Decision points', 'Handoffs', 'Tools used', 'Timing'],
          digDeeperOptions: [
            'What happens if something goes wrong at this step?',
            'Who else is involved in this process?',
            'What systems do you use for this?'
          ],
          nextStep: 'Identify inefficiencies',
          isActive: true
        },
        {
          id: 'inefficiency-identification',
          phase: stage,
          skill: 'Gap Analysis',
          title: 'Find Inefficiencies',
          description: 'Identify where the process breaks down',
          whyItMatters: 'Understanding inefficiencies helps design better future processes',
          howToAsk: 'Look for bottlenecks, delays, and redundant steps',
          examplePhrases: [
            'Where does the process typically slow down?',
            'What steps feel unnecessary or redundant?',
            'Where do things most often go wrong?'
          ],
          whatToListenFor: ['Bottlenecks', 'Redundant steps', 'Error points', 'Delays', 'Frustrations'],
          digDeeperOptions: [
            'Why does this step take so long?',
            'What causes these errors?',
            'How often does this bottleneck occur?'
          ],
          nextStep: 'Document current state',
          isActive: false
        }
      ];

    case 'to_be':
      return [
        {
          id: 'future-vision',
          phase: stage,
          skill: 'Future State Design',
          title: 'Envision the Future',
          description: 'Design the ideal future state',
          whyItMatters: 'Clear vision of the future state guides solution design and implementation',
          howToAsk: 'Ask stakeholders to describe their ideal process',
          examplePhrases: [
            'What would the ideal process look like to you?',
            'If you could redesign this from scratch, what would you do?',
            'What would success look like in 6 months?'
          ],
          whatToListenFor: ['Desired outcomes', 'Success criteria', 'Key features', 'Benefits expected'],
          digDeeperOptions: [
            'What specific benefits would you see?',
            'How would this improve your work?',
            'What\'s most important to you in this new process?'
          ],
          nextStep: 'Define requirements',
          isActive: true
        },
        {
          id: 'requirements-gathering',
          phase: stage,
          skill: 'Requirements Definition',
          title: 'Define Requirements',
          description: 'Specify what the solution must do',
          whyItMatters: 'Clear requirements ensure the solution meets stakeholder needs',
          howToAsk: 'Break down the vision into specific requirements',
          examplePhrases: [
            'What specific capabilities do you need?',
            'What are the must-have features?',
            'What would make this solution successful?'
          ],
          whatToListenFor: ['Functional requirements', 'Non-functional requirements', 'Constraints', 'Success metrics'],
          digDeeperOptions: [
            'Can you prioritize these requirements?',
            'What\'s the business value of each requirement?',
            'Are there any constraints we need to consider?'
          ],
          nextStep: 'Design solutions',
          isActive: false
        }
      ];

    case 'solution_design':
      return [
        {
          id: 'solution-options',
          phase: stage,
          skill: 'Solution Design',
          title: 'Explore Solution Options',
          description: 'Generate and evaluate potential solutions',
          whyItMatters: 'Multiple solution options ensure the best approach is chosen',
          howToAsk: 'Brainstorm different ways to address the requirements',
          examplePhrases: [
            'What are some different ways we could solve this?',
            'What options have you considered?',
            'How might we approach this differently?'
          ],
          whatToListenFor: ['Solution ideas', 'Pros and cons', 'Feasibility concerns', 'Innovation opportunities'],
          digDeeperOptions: [
            'What are the trade-offs of each option?',
            'What would it take to implement this?',
            'What risks should we consider?'
          ],
          nextStep: 'Evaluate options',
          isActive: true
        },
        {
          id: 'option-evaluation',
          phase: stage,
          skill: 'Solution Evaluation',
          title: 'Evaluate Options',
          description: 'Assess the feasibility and impact of each option',
          whyItMatters: 'Thorough evaluation ensures the chosen solution is viable and valuable',
          howToAsk: 'Systematically evaluate each option against criteria',
          examplePhrases: [
            'How does this option compare to the others?',
            'What would it take to implement this solution?',
            'What are the risks and benefits?'
          ],
          whatToListenFor: ['Implementation effort', 'Cost considerations', 'Risk factors', 'Expected benefits'],
          digDeeperOptions: [
            'What resources would this require?',
            'How long would implementation take?',
            'What could go wrong?'
          ],
          nextStep: 'Recommend solution',
          isActive: false
        }
      ];

    default:
      return [];
  }
};

const getProjectSpecificCards = (stage: TrainingStage, projectId: string): CoachingCard[] => {
  // Project-specific coaching cards based on project context
  switch (projectId) {
    case 'proj-1': // E-commerce Platform
      return getEcommerceCards(stage);
    case 'proj-2': // Healthcare System
      return getHealthcareCards(stage);
    case 'proj-3': // Financial Services
      return getFinancialCards(stage);
    case 'proj-4': // Educational Platform
      return getEducationalCards(stage);
    case 'proj-5': // Employee Performance Management
      return getPerformanceManagementCards(stage);
    default:
      return [];
  }
};

const getEcommerceCards = (stage: TrainingStage): CoachingCard[] => {
  if (stage === 'problem_exploration') {
    return [
      {
        id: 'ecommerce-customer-experience',
        phase: stage,
        skill: 'Customer-Centric Analysis',
        title: 'Customer Experience Issues',
        description: 'Focus on customer-facing problems in the e-commerce platform',
        whyItMatters: 'Customer experience directly impacts sales and retention',
        howToAsk: 'Ask about customer pain points and conversion issues',
        examplePhrases: [
          'What customer complaints do you hear most often?',
          'Where do customers typically abandon their purchase?',
          'What frustrates customers about the current shopping experience?'
        ],
        whatToListenFor: ['Customer complaints', 'Abandonment points', 'Usability issues', 'Performance problems'],
        digDeeperOptions: [
          'How does this affect the customer experience?',
          'What\'s the operational impact of these issues?',
          'How do these problems affect your team\'s work?'
        ],
        nextStep: 'Analyze operational impact',
        isActive: false
      }
    ];
  }
  return [];
};

const getPerformanceManagementCards = (stage: TrainingStage): CoachingCard[] => {
  if (stage === 'problem_exploration') {
    return [
      {
        id: 'performance-feedback-cycle',
        phase: stage,
        skill: 'HR Process Analysis',
        title: 'Performance Feedback Issues',
        description: 'Focus on performance management and feedback challenges',
        whyItMatters: 'Effective performance management drives employee engagement and productivity',
        howToAsk: 'Ask about feedback cycles, evaluation processes, and employee development',
        examplePhrases: [
          'What challenges do you face with the current performance review process?',
          'How do employees typically feel about the feedback they receive?',
          'What\'s most frustrating about managing performance in your team?'
        ],
        whatToListenFor: ['Feedback frequency', 'Evaluation criteria', 'Employee engagement', 'Manager workload'],
        digDeeperOptions: [
          'How often should feedback be given?',
          'What makes feedback most effective?',
          'How do you currently track performance goals?'
        ],
        nextStep: 'Explore process inefficiencies',
        isActive: false
      }
    ];
  }
  return [];
};

const getHealthcareCards = (stage: TrainingStage): CoachingCard[] => {
  if (stage === 'problem_exploration') {
    return [
      {
        id: 'healthcare-compliance',
        phase: stage,
        skill: 'Compliance Understanding',
        title: 'Compliance and Regulatory Issues',
        description: 'Focus on healthcare compliance and regulatory challenges',
        whyItMatters: 'Compliance issues can have serious legal and financial consequences',
        howToAsk: 'Ask about regulatory requirements and compliance pain points',
        examplePhrases: [
          'What compliance challenges do you face most often?',
          'How do regulatory requirements impact your current processes?',
          'What\'s most difficult about maintaining compliance?'
        ],
        whatToListenFor: ['Regulatory requirements', 'Compliance gaps', 'Audit findings', 'Risk factors'],
        digDeeperOptions: [
          'What happens when compliance issues are found?',
          'How do you currently track compliance?',
          'What would make compliance easier to manage?'
        ],
        nextStep: 'Analyze patient care impact',
        isActive: false
      }
    ];
  }
  return [];
};

const getFinancialCards = (stage: TrainingStage): CoachingCard[] => {
  if (stage === 'problem_exploration') {
    return [
      {
        id: 'financial-risk-management',
        phase: stage,
        skill: 'Risk Analysis',
        title: 'Risk Management Issues',
        description: 'Focus on financial risk management and compliance challenges',
        whyItMatters: 'Risk management is critical for financial stability and regulatory compliance',
        howToAsk: 'Ask about risk assessment, monitoring, and mitigation challenges',
        examplePhrases: [
          'What risk management challenges do you face?',
          'How do you currently identify and assess risks?',
          'What\'s most difficult about monitoring financial risks?'
        ],
        whatToListenFor: ['Risk identification', 'Monitoring challenges', 'Compliance gaps', 'System limitations'],
        digDeeperOptions: [
          'What types of risks are most concerning?',
          'How do you currently report on risks?',
          'What would improve your risk visibility?'
        ],
        nextStep: 'Explore operational challenges',
        isActive: false
      }
    ];
  }
  return [];
};

const getEducationalCards = (stage: TrainingStage): CoachingCard[] => {
  if (stage === 'problem_exploration') {
    return [
      {
        id: 'educational-student-engagement',
        phase: stage,
        skill: 'Learning Analytics',
        title: 'Student Engagement Issues',
        description: 'Focus on student engagement and learning outcomes',
        whyItMatters: 'Student engagement directly impacts learning outcomes and retention',
        howToAsk: 'Ask about student engagement, learning analytics, and educational outcomes',
        examplePhrases: [
          'What challenges do you face with student engagement?',
          'How do you currently track student progress?',
          'What\'s most difficult about measuring learning outcomes?'
        ],
        whatToListenFor: ['Engagement metrics', 'Learning outcomes', 'Assessment challenges', 'Technology limitations'],
        digDeeperOptions: [
          'What engagement metrics are most important?',
          'How do you currently assess student progress?',
          'What would improve student engagement?'
        ],
        nextStep: 'Analyze assessment processes',
        isActive: false
      }
    ];
  }
  return [];
};
