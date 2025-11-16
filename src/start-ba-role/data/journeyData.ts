export interface Step {
  number: number;
  title: string;
  summary: string;
  completed: boolean;
  contentType: 'email' | 'video' | 'task' | 'meeting' | 'document';
  content: any;
}

export interface EmailContent {
  from: string;
  subject: string;
  body: string[];
  actionItems?: string[];
}

export interface VideoContent {
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
}

export interface TaskContent {
  instructions: string[];
  deliverables: string[];
  resources?: string[];
}

export interface MeetingContent {
  title: string;
  attendees: string[];
  agenda: string[];
  notes?: string[];
}

export interface DocumentContent {
  title: string;
  sections: { heading: string; content: string }[];
}

export interface Phase {
  code: string;
  title: string;
  summary: string;
  description: string;
  status: 'locked' | 'in-progress' | 'completed';
  steps: Step[];
}

const generateSteps = (phaseCode: string, count: number): Step[] => {
  const steps: Step[] = [];
  for (let i = 1; i <= count; i++) {
    steps.push({
      number: i,
      title: `${phaseCode} Step ${i}: Sample Task`,
      summary: `Complete this step to progress through ${phaseCode}`,
      completed: i <= 2,
      contentType:
        i === 1 ? 'email' : i === 2 ? 'meeting' : i === 3 ? 'task' : i === 4 ? 'document' : 'video',
      content: getContent(i),
    });
  }
  return steps;
};

const getContent = (stepNum: number): any => {
  if (stepNum === 1) {
    return {
      from: 'Sarah Chen, Program Director',
      subject: 'Welcome Message',
      body: [
        'Dear New Business Analyst,',
        'Welcome to this phase of your BA WorkXP journey!',
        'This is a sample email content that demonstrates the email format.',
        'Each phase will have different content types to help you learn.',
      ],
      actionItems: [
        'Review the materials provided',
        'Complete the assigned tasks',
        'Schedule time with your mentor',
      ],
    } as EmailContent;
  } else if (stepNum === 2) {
    return {
      title: 'Team Meeting',
      attendees: ['You', 'Mentor', 'Team Members'],
      agenda: ['Introductions', 'Phase overview', 'Q&A session'],
      notes: ['Take notes during the meeting'],
    } as MeetingContent;
  } else if (stepNum === 3) {
    return {
      instructions: ['Read the documentation', 'Complete the exercise', 'Submit your work'],
      deliverables: ['Completed assignment', 'Reflection document'],
    } as TaskContent;
  } else if (stepNum === 4) {
    return {
      title: 'Reference Document',
      sections: [
        { heading: 'Overview', content: 'This document provides context for this phase.' },
        { heading: 'Key Concepts', content: 'Important concepts to understand.' },
      ],
    } as DocumentContent;
  } else {
    return {
      title: 'Video Tutorial',
      duration: '15 minutes',
      thumbnail:
        'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg',
      description: 'Watch this video to learn more about the topic.',
    } as VideoContent;
  }
};

export const journeyData: Phase[] = [
  {
    code: 'P0',
    title: 'Onboarding & Orientation',
    summary: 'Welcome to your BA journey',
    description:
      'Get familiar with the program structure, meet your mentor, and set up your workspace.',
    status: 'completed',
    steps: generateSteps('P0', 5),
  },
  {
    code: 'P1',
    title: 'Meet the Team & Tools',
    summary: 'Get familiar with your workspace',
    description:
      'Build relationships with team members and master the essential BA tools and techniques.',
    status: 'in-progress',
    steps: generateSteps('P1', 5),
  },
  {
    code: 'P2',
    title: 'First Requirements Workshop',
    summary: 'Observe and participate in requirements gathering',
    description:
      'Actively participate in elicitation sessions and learn to document requirements effectively.',
    status: 'locked',
    steps: generateSteps('P2', 5),
  },
  {
    code: 'P3',
    title: 'Document & Analyze',
    summary: 'Create your first business analysis artifacts',
    description:
      'Learn to create professional BA deliverables including process maps, data models, and wireframes.',
    status: 'locked',
    steps: generateSteps('P3', 5),
  },
  {
    code: 'P4',
    title: 'Stakeholder Management',
    summary: 'Build relationships and manage expectations',
    description:
      'Develop skills in stakeholder analysis, communication planning, and conflict resolution.',
    status: 'locked',
    steps: generateSteps('P4', 5),
  },
  {
    code: 'P5',
    title: 'Process Mapping',
    summary: 'Visualize and optimize business processes',
    description:
      'Master advanced process modeling techniques and identify opportunities for improvement.',
    status: 'locked',
    steps: generateSteps('P5', 5),
  },
  {
    code: 'P6',
    title: 'Data Analysis & Insights',
    summary: 'Extract meaningful insights from data',
    description:
      'Learn to work with data, create reports, and derive actionable insights.',
    status: 'locked',
    steps: generateSteps('P6', 5),
  },
  {
    code: 'P7',
    title: 'Solution Design',
    summary: 'Collaborate on solution architecture',
    description:
      'Work with technical teams to design and validate the solution approach.',
    status: 'locked',
    steps: generateSteps('P7', 5),
  },
  {
    code: 'P8',
    title: 'Implementation Support',
    summary: 'Guide development and testing phases',
    description:
      'Support the development team, clarify requirements, and ensure quality.',
    status: 'locked',
    steps: generateSteps('P8', 5),
  },
  {
    code: 'P9',
    title: 'Delivery & Reflection',
    summary: 'Complete your project and reflect on learnings',
    description:
      'Prepare for launch, document lessons learned, and complete your BA WorkXP journey.',
    status: 'locked',
    steps: generateSteps('P9', 5),
  },
];


