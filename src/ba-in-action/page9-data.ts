import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page9RetrospectiveItem {
  text: string;
}

export interface Page9ImprovementStory {
  id: string;
  title: string;
  value: string;
  priority: 'High' | 'Medium' | 'Low';
  priorityColor: string;
  priorityBg: string;
}

export interface Page9WarningSignal {
  signal: string;
  meaning: string;
  action: string;
}

export interface Page9Data {
  ticketId: string;
  weeksSinceLaunch: string;
  postLaunchContext: {
    title: string;
    whatsLive: string;
    kpis: string;
    focus: string;
  };
  retrospective: {
    wentWell: Page9RetrospectiveItem[];
    didntGoWell: Page9RetrospectiveItem[];
    actions: Page9RetrospectiveItem[];
  };
  improvementStories: Page9ImprovementStory[];
  warningSignals: Page9WarningSignal[];
  lessonsLearned: {
    project: string;
    wentWell: string[];
    didntGoWell: string[];
    actions: string[];
    keyMetric: string;
  };
  slackUpdate: string[];
  taskStory: {
    id: string;
    title: string;
  };
}

export const PAGE_9_DATA: Record<BAInActionProject, Page9Data> = {
  cif: {
    ticketId: 'US-142',
    weeksSinceLaunch: '6',
    postLaunchContext: {
      title: 'Post-Launch Context for CI&F',
      whatsLive: 'US-142 (Risk-Based Verification) deployed 6 weeks ago',
      kpis: 'Fraud ↓30%, manual reviews ↓42%, conversion protected',
      focus: 'Retrospective + identify improvement stories for next quarter',
    },
    retrospective: {
      wentWell: [
        { text: 'Clear AC from Day 1 — dev estimated accurately' },
        { text: 'Compliance engaged early — no late-stage rework' },
        { text: 'Ops co-designed the review queue — adoption was smooth' },
        { text: 'KPIs tracked from baseline — easy to prove value' },
      ],
      didntGoWell: [
        { text: 'UAT found missing field (fraud flags) — should\'ve caught in refinement' },
        { text: 'Test data for edge cases wasn\'t ready — dev was blocked for 2 days' },
        { text: 'Ops wanted bulk actions in queue (we only built single-case view)' },
        { text: 'Audit log UI not in initial scope — Compliance needed it sooner' },
      ],
      actions: [
        { text: 'Add "edge case checklist" to refinement template' },
        { text: 'Coordinate test data 1 sprint ahead (not day-of)' },
        { text: 'Add US-157: Bulk actions for Ops queue to backlog' },
        { text: 'Prioritize US-156 (Audit Log UI) for Q2' },
      ],
    },
    improvementStories: [
      {
        id: 'US-156',
        title: 'Audit Log UI for Compliance',
        value: 'Regulatory requirement — blocks audit',
        priority: 'High',
        priorityColor: 'text-red-800',
        priorityBg: 'bg-red-100',
      },
      {
        id: 'US-157',
        title: 'Bulk Actions for Ops Review Queue',
        value: 'Ops efficiency — saves 2h/day',
        priority: 'Medium',
        priorityColor: 'text-amber-800',
        priorityBg: 'bg-amber-100',
      },
      {
        id: 'US-158',
        title: 'Threshold Auto-Tuning Based on Model Feedback',
        value: 'Reduces manual threshold updates',
        priority: 'Low',
        priorityColor: 'text-green-800',
        priorityBg: 'bg-green-100',
      },
      {
        id: 'TECH-042',
        title: 'Refactor Edge Case Test Data Setup',
        value: 'Prevents dev blockers in future sprints',
        priority: 'Medium',
        priorityColor: 'text-amber-800',
        priorityBg: 'bg-amber-100',
      },
    ],
    warningSignals: [
      {
        signal: 'Review queue aging > 24h',
        meaning: 'Model losing sharpness OR Ops understaffed',
        action: 'Investigate: threshold drift? Volume spike? Log improvement story.',
      },
      {
        signal: 'False positive rate increasing',
        meaning: 'Thresholds too aggressive',
        action: 'Alert Data Science team. Request model retrain.',
      },
      {
        signal: 'Conversion drop at sign-up',
        meaning: 'Verification friction increased',
        action: 'Run A/B test. Check for false blocks. Adjust thresholds.',
      },
      {
        signal: 'Ops Slack escalations resurfacing',
        meaning: 'Workarounds creeping back in',
        action: 'Shadow Ops again. Identify new pain points. Log stories.',
      },
    ],
    lessonsLearned: {
      project: 'Risk-Based Identity Verification (US-142)',
      wentWell: [
        'Clear AC from Day 1 enabled accurate estimation',
        'Early Compliance engagement prevented rework',
        'Co-designing Ops queue with users = high adoption',
      ],
      didntGoWell: [
        'Missing field (fraud flags) found in UAT — refinement gap',
        'Test data not ready — blocked dev for 2 days',
        'Bulk actions scope missed — Ops needed it sooner',
      ],
      actions: [
        'Add edge case checklist to refinement template',
        'Coordinate test data 1 sprint ahead',
        'Run "What are you imagining?" workshop with Ops before build',
      ],
      keyMetric: 'Fraud ↓30%, Manual Reviews ↓42%, Conversion Protected',
    },
    slackUpdate: [
      'Retrospective complete for US-142. Lessons captured in Confluence.',
      'Next quarter improvements prioritized:',
      '• US-156 (Audit Log UI) — HIGH (Compliance requirement)',
      '• US-157 (Bulk Actions) — MEDIUM (Ops efficiency)',
      '• TECH-042 (Test Data Refactor) — MEDIUM (prevents future blockers)',
      'Monitoring KPIs weekly. Early warning alerts configured.',
    ],
    taskStory: {
      id: 'US-157',
      title: 'Bulk Actions for Ops Review Queue',
    },
  },
  voids: {
    ticketId: 'US-156',
    weeksSinceLaunch: '6',
    postLaunchContext: {
      title: 'Post-Launch Context for Voids',
      whatsLive: 'US-156 (Streamlined Void-to-Re-let Process) deployed 6 weeks ago',
      kpis: 'Void days ↓38%, repairs queue ↓49%, rent loss ↓38%',
      focus: 'Retrospective + identify improvement stories for next quarter',
    },
    retrospective: {
      wentWell: [
        { text: 'Clear AC from Day 1 — dev estimated accurately' },
        { text: 'Housing engaged early — no late-stage rework' },
        { text: 'Repairs co-designed the work order queue — adoption was smooth' },
        { text: 'KPIs tracked from baseline — easy to prove value' },
      ],
      didntGoWell: [
        { text: 'UAT found missing field (access arrangements) — should\'ve caught in refinement' },
        { text: 'Test property data for edge cases wasn\'t ready — dev was blocked for 2 days' },
        { text: 'Repairs wanted bulk actions in queue (we only built single-property view)' },
        { text: 'Property history UI not in initial scope — Housing needed it sooner' },
      ],
      actions: [
        { text: 'Add "edge case checklist" to refinement template' },
        { text: 'Coordinate test property data 1 sprint ahead (not day-of)' },
        { text: 'Add US-167: Bulk actions for Repairs queue to backlog' },
        { text: 'Prioritize US-168 (Property History UI) for Q2' },
      ],
    },
    improvementStories: [
      {
        id: 'US-168',
        title: 'Property History UI for Housing',
        value: 'Regulatory requirement — blocks audit',
        priority: 'High',
        priorityColor: 'text-red-800',
        priorityBg: 'bg-red-100',
      },
      {
        id: 'US-167',
        title: 'Bulk Actions for Repairs Queue',
        value: 'Repairs efficiency — saves 2h/day',
        priority: 'Medium',
        priorityColor: 'text-amber-800',
        priorityBg: 'bg-amber-100',
      },
      {
        id: 'US-169',
        title: 'Auto-Routing Based on Property Complexity',
        value: 'Reduces manual routing decisions',
        priority: 'Low',
        priorityColor: 'text-green-800',
        priorityBg: 'bg-green-100',
      },
      {
        id: 'TECH-043',
        title: 'Refactor Test Property Data Setup',
        value: 'Prevents dev blockers in future sprints',
        priority: 'Medium',
        priorityColor: 'text-amber-800',
        priorityBg: 'bg-amber-100',
      },
    ],
    warningSignals: [
      {
        signal: 'Repairs queue aging > 7 days',
        meaning: 'Work order complexity increasing OR Repairs understaffed',
        action: 'Investigate: property complexity? Volume spike? Log improvement story.',
      },
      {
        signal: 'Void days trending upward',
        meaning: 'Decision states too conservative',
        action: 'Alert Housing team. Review decision thresholds.',
      },
      {
        signal: 'Rent loss increasing',
        meaning: 'Properties stuck in queue longer',
        action: 'Run analysis. Check for bottlenecks. Adjust routing.',
      },
      {
        signal: 'Repairs Slack escalations resurfacing',
        meaning: 'Workarounds creeping back in',
        action: 'Shadow Repairs again. Identify new pain points. Log stories.',
      },
    ],
    lessonsLearned: {
      project: 'Streamlined Void-to-Re-let Process (US-156)',
      wentWell: [
        'Clear AC from Day 1 enabled accurate estimation',
        'Early Housing engagement prevented rework',
        'Co-designing Repairs queue with users = high adoption',
      ],
      didntGoWell: [
        'Missing field (access arrangements) found in UAT — refinement gap',
        'Test property data not ready — blocked dev for 2 days',
        'Bulk actions scope missed — Repairs needed it sooner',
      ],
      actions: [
        'Add edge case checklist to refinement template',
        'Coordinate test property data 1 sprint ahead',
        'Run "What are you imagining?" workshop with Repairs before build',
      ],
      keyMetric: 'Void Days ↓38%, Repairs Queue ↓49%, Rent Loss ↓38%',
    },
    slackUpdate: [
      'Retrospective complete for US-156. Lessons captured in Confluence.',
      'Next quarter improvements prioritized:',
      '• US-168 (Property History UI) — HIGH (Housing requirement)',
      '• US-167 (Bulk Actions) — MEDIUM (Repairs efficiency)',
      '• TECH-043 (Test Property Data Refactor) — MEDIUM (prevents future blockers)',
      'Monitoring KPIs weekly. Early warning alerts configured.',
    ],
    taskStory: {
      id: 'US-167',
      title: 'Bulk Actions for Repairs Queue',
    },
  },
};

