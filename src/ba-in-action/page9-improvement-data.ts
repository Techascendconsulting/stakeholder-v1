import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page9ImprovementData {
  ticketId: string;
  weeksSinceLaunch: string;
  postLaunchContext: {
    title: string;
    whatsLive: string;
    kpis: string;
    focus: string;
  };
  retrospective: {
    wentWell: Array<{ text: string }>;
    didntGoWell: Array<{ text: string }>;
    actions: Array<{ text: string }>;
  };
  improvementStories: Array<{
    id: string;
    title: string;
    value: string;
    priority: string;
    priorityBg: string;
    priorityColor: string;
  }>;
  taskStory: {
    id: string;
    title: string;
  };
  warningSignals: Array<{
    signal: string;
    meaning: string;
    action: string;
  }>;
  lessonsLearned: {
    project: string;
    wentWell: string[];
    didntGoWell: string[];
    actions: string[];
    keyMetric: string;
  };
  slackUpdate: string[];
}

export const PAGE_9_IMPROVEMENT_DATA: Record<BAInActionProject, Page9ImprovementData> = {
  cif: {
    ticketId: 'US-142',
    weeksSinceLaunch: '6',
    postLaunchContext: {
      title: 'Post-Launch Context',
      whatsLive: 'Risk classification system and manual review queue',
      kpis: 'Fraud reduction: 30%, Manual review workload: -42%',
      focus: 'Retrospective and improvement backlog',
    },
    retrospective: {
      wentWell: [
        { text: 'Stakeholder engagement was strong throughout' },
        { text: 'Requirements were clear and well-documented' },
      ],
      didntGoWell: [
        { text: 'Some edge cases were discovered late in development' },
        { text: 'UAT feedback took longer than expected to incorporate' },
      ],
      actions: [
        { text: 'Add edge case checklist to requirements process' },
        { text: 'Schedule UAT earlier in the sprint cycle' },
      ],
    },
    improvementStories: [
      {
        id: 'US-150',
        title: 'Add audit log UI for Compliance',
        value: 'Regulatory requirement',
        priority: 'High',
        priorityBg: 'bg-red-100',
        priorityColor: 'text-red-800',
      },
      {
        id: 'US-151',
        title: 'Bulk actions for reviewers',
        value: 'Efficiency gain',
        priority: 'Medium',
        priorityBg: 'bg-amber-100',
        priorityColor: 'text-amber-800',
      },
    ],
    taskStory: {
      id: 'US-150',
      title: 'Add audit log UI for Compliance',
    },
    warningSignals: [
      {
        signal: 'Queue processing time increasing',
        meaning: 'System may be struggling with load',
        action: 'Investigate performance and scale if needed',
      },
    ],
    lessonsLearned: {
      project: 'Customer Identity & Fraud Programme',
      wentWell: ['Strong stakeholder engagement', 'Clear requirements'],
      didntGoWell: ['Edge cases discovered late', 'UAT feedback delayed'],
      actions: ['Add edge case checklist', 'Schedule UAT earlier'],
      keyMetric: 'Fraud reduction: 30%',
    },
    slackUpdate: [
      '📊 Post-Launch Retrospective Complete',
      '',
      '✅ What Went Well:',
      '• Strong stakeholder engagement',
      '• Clear requirements documentation',
      '',
      '📝 Improvements Identified:',
      '• Add edge case checklist',
      '• Schedule UAT earlier',
      '',
      '🎯 Next Steps:',
      '• US-150: Audit log UI (High priority)',
      '• US-151: Bulk actions (Medium priority)',
    ],
  },
  voids: {
    ticketId: 'US-142',
    weeksSinceLaunch: '6',
    postLaunchContext: {
      title: 'Post-Launch Context',
      whatsLive: 'Void inspection workflow and repairs assignment',
      kpis: 'Void days reduced: 25%, Repair completion: +18%',
      focus: 'Retrospective and improvement backlog',
    },
    retrospective: {
      wentWell: [
        { text: 'Housing and Repairs collaboration was effective' },
        { text: 'Inspection workflow streamlined the process' },
      ],
      didntGoWell: [
        { text: 'Some property types needed special handling' },
        { text: 'Tenant notifications could be improved' },
      ],
      actions: [
        { text: 'Document property type variations' },
        { text: 'Enhance tenant notification timing' },
      ],
    },
    improvementStories: [
      {
        id: 'US-150',
        title: 'Show inspection photos in repairs interface',
        value: 'Efficiency gain',
        priority: 'High',
        priorityBg: 'bg-red-100',
        priorityColor: 'text-red-800',
      },
      {
        id: 'US-151',
        title: 'Bulk assignment for similar repairs',
        value: 'Time savings',
        priority: 'Medium',
        priorityBg: 'bg-amber-100',
        priorityColor: 'text-amber-800',
      },
    ],
    taskStory: {
      id: 'US-150',
      title: 'Show inspection photos in repairs interface',
    },
    warningSignals: [
      {
        signal: 'Repair assignment delays',
        meaning: 'Workload may be exceeding capacity',
        action: 'Review team capacity and adjust assignments',
      },
    ],
    lessonsLearned: {
      project: 'Housing Voids Programme',
      wentWell: ['Effective collaboration', 'Streamlined workflow'],
      didntGoWell: ['Property type variations', 'Notification timing'],
      actions: ['Document variations', 'Enhance notifications'],
      keyMetric: 'Void days reduced: 25%',
    },
    slackUpdate: [
      '📊 Post-Launch Retrospective Complete',
      '',
      '✅ What Went Well:',
      '• Effective Housing and Repairs collaboration',
      '• Streamlined inspection workflow',
      '',
      '📝 Improvements Identified:',
      '• Document property type variations',
      '• Enhance tenant notification timing',
      '',
      '🎯 Next Steps:',
      '• US-150: Inspection photos in repairs (High priority)',
      '• US-151: Bulk assignment (Medium priority)',
    ],
  },
};


