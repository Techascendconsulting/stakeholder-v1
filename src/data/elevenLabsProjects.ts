interface ElevenLabsStakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  expertise: string[];
  personality: string;
  priorities: string[];
  agentId: string; // ElevenLabs Conversational AI Agent ID
  bio: string;
  gender: 'male' | 'female'; // For proper voice selection
}

interface ElevenLabsProject {
  id: string;
  name: string;
  description: string;
  objective: string;
  duration: number; // in minutes
  complexity: 'low' | 'medium' | 'high';
  industry: string;
  stakeholders: ElevenLabsStakeholder[];
  context: {
    currentState: string;
    challenges: string[];
    expectedOutcomes: string[];
    constraints: string[];
  };
}

// Customer Onboarding Optimization Project Configuration
export const ELEVENLABS_PROJECTS: ElevenLabsProject[] = [
  {
    id: 'customer-onboarding-optimization',
    name: 'Customer Onboarding Optimization',
    description: 'Streamline and enhance the customer onboarding process to reduce time-to-value and improve customer satisfaction',
    objective: 'Analyze current onboarding flows, identify pain points, and design an optimized digital-first onboarding experience',
    duration: 45,
    complexity: 'high',
    industry: 'SaaS Technology',
    stakeholders: [
      {
        id: 'james-walker',
        name: 'James Walker',
        role: 'Head of Customer Success',
        department: 'Customer Success',
        expertise: [
          'Customer journey mapping',
          'Onboarding optimization',
          'Customer retention strategies',
          'Success metrics and KPIs',
          'Team leadership'
        ],
        personality: 'Collaborative, data-driven, customer-focused, solution-oriented',
        priorities: [
          'Reducing customer churn during onboarding',
          'Improving time-to-first-value',
          'Enhancing customer satisfaction scores',
          'Streamlining team workflows'
        ],
        agentId: 'agent_5601k16eqj3sfznbe2eqnmf21nry', // James Walker agent ID
        bio: 'James leads the Customer Success team and has 8 years of experience in customer onboarding optimization. He specializes in creating seamless customer experiences and has successfully reduced churn by 40% in his previous roles.',
        gender: 'male'
      },
      {
        id: 'aisha-ahmed',
        name: 'Aisha Ahmed',
        role: 'Customer Service Manager',
        department: 'Customer Service',
        expertise: [
          'Customer support operations',
          'Service level management',
          'Customer satisfaction metrics',
          'Support team training',
          'Escalation management'
        ],
        personality: 'Empathetic, service-oriented, problem-solver, team-focused',
        priorities: [
          'Improving customer support experience',
          'Reducing resolution times',
          'Enhancing team efficiency',
          'Maintaining service quality standards'
        ],
        agentId: 'agent_3601k16fe93ject9vy38wev45tym', // Aisha Ahmed agent ID
        bio: 'Aisha manages the Customer Service team with 7 years of experience in customer support operations. She has successfully improved customer satisfaction scores by 45% and specializes in creating efficient support processes during customer onboarding.',
        gender: 'female'
      },
      {
        id: 'david-thompson',
        name: 'David Thompson',
        role: 'IT Systems Lead',
        department: 'Information Technology',
        expertise: [
          'System integration',
          'API development',
          'Data architecture',
          'Security implementation',
          'Technical infrastructure'
        ],
        personality: 'Technical, analytical, security-conscious, systematic',
        priorities: [
          'System security and compliance',
          'Technical feasibility assessment',
          'Integration capabilities',
          'Performance optimization'
        ],
        agentId: 'agent_9601k1768hj9ehraajtbxg0h32sj', // David Thompson agent ID
        bio: 'David leads IT systems architecture with 12 years of experience in enterprise technology solutions. He specializes in secure system integrations and has implemented onboarding automation systems that reduced manual processing by 80%.'
      }
    ],
    context: {
      currentState: 'Manual onboarding process taking 2-3 weeks, high customer confusion, 25% drop-off rate during first month',
      challenges: [
        'Lengthy manual verification processes',
        'Lack of clear progress indicators',
        'Multiple disconnected systems',
        'Inconsistent communication touchpoints',
        'Limited self-service options'
      ],
      expectedOutcomes: [
        'Reduce onboarding time to 3-5 days',
        'Decrease first-month churn by 50%',
        'Increase customer satisfaction scores to 4.5+',
        'Automate 70% of verification processes',
        'Create unified onboarding dashboard'
      ],
      constraints: [
        'Budget limit of $150,000',
        'Must integrate with existing CRM system',
        'Compliance with data protection regulations',
        '6-month implementation timeline',
        'Minimal disruption to current customers'
      ]
    }
  }
];

// Helper function to get project by ID
export const getElevenLabsProject = (projectId: string): ElevenLabsProject | undefined => {
  return ELEVENLABS_PROJECTS.find(project => project.id === projectId);
};

// Helper function to get stakeholder by ID from a project
export const getProjectStakeholder = (projectId: string, stakeholderId: string): ElevenLabsStakeholder | undefined => {
  const project = getElevenLabsProject(projectId);
  return project?.stakeholders.find(stakeholder => stakeholder.id === stakeholderId);
};

export type { ElevenLabsProject, ElevenLabsStakeholder };