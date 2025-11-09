import { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page1Data {
  // Welcome Email
  emailSubject: string;
  emailFrom: string;
  emailFromEmail: string;
  initiativeName: string;
  meetingTime: string;
  attachmentName: string;
  teamsChannel: string;
  
  // Meeting
  meetingTitle: string;
  meetingAttendees: Array<{ name: string; role: string }>;
  meetingPurpose: string;
  
  // Checklist
  checklistItems: Array<{
    id: string;
    task: string;
    owner: string;
    status: string;
  }>;
  
  // One-Pager
  onePager: {
    problem: string;
    impactStats: Array<{ label: string; value: string }>;
    goal: string;
    constraints: string[];
    keyStakeholders: Array<{ name: string; role: string; care: string }>;
    deliverables: string[];
    successMetrics: Array<{ metric: string; baseline: string; target: string }>;
  };
  
  // Stakeholder Grid
  stakeholders: Array<{
    name: string;
    role: string;
    care: string;
    fear: string;
    cue: string;
  }>;
  
  // Tasks
  tasks: Array<{
    title: string;
    placeholder: string;
  }>;
}

export const PAGE_1_DATA: Record<BAInActionProject, Page1Data> = {
  cif: {
    emailSubject: 'Welcome to the Customer Identity & Fraud Programme',
    emailFrom: 'Ben Carter',
    emailFromEmail: 'ben.carter@company.co.uk',
    initiativeName: 'Customer Identity Verification & Fraud Reduction',
    meetingTime: '11:00',
    attachmentName: 'CI&F Programme – One Pager (v3).pdf',
    teamsChannel: '#proj-cifraud',
    
    meetingTitle: 'Intro: CI&F Programme',
    meetingAttendees: [
      { name: 'Ben Carter', role: 'Product Owner' },
      { name: 'Marie Dupont', role: 'Compliance' },
      { name: 'James Walker', role: 'Operations' },
      { name: 'You', role: 'Business Analyst' },
    ],
    meetingPurpose: 'Get you context on the fraud problem, success metrics, and immediate priorities.',
    
    checklistItems: [
      { id: 'vpn', task: 'VPN & network access', owner: 'IT', status: 'Pending' },
      { id: 'jira', task: 'Jira & Confluence access', owner: 'IT', status: 'Pending' },
      { id: 'teams', task: 'Join #proj-cifraud channel', owner: 'You', status: 'Ready' },
      { id: 'drive', task: 'Shared drive permissions', owner: 'IT', status: 'Pending' },
      { id: 'training', task: 'Data protection & AML training', owner: 'HR', status: 'Scheduled' },
    ],
    
    onePager: {
      problem: 'Fraudulent account creation has increased 17% quarter-over-quarter. Current static KYC checks cause 9% checkout drop-off for legitimate users. We need dynamic risk-based verification.',
      impactStats: [
        { label: 'Fraud Loss', value: '£48,000/week' },
        { label: 'Customer Drop-off', value: '9% at checkout' },
        { label: 'Manual Review Rate', value: '12% of signups' },
      ],
      goal: 'Reduce fraudulent signups by 30% without increasing false positives or customer friction.',
      constraints: [
        'Must comply with FCA regulations (audit trail required)',
        'Cannot increase manual review workload for Ops team',
        'Must preserve or improve conversion rates',
        'Q2 go-live deadline (12 weeks)',
      ],
      keyStakeholders: [
        { name: 'Ben Carter', role: 'Product Owner', care: 'Deliver value, hit roadmap, manage scope' },
        { name: 'Marie Dupont', role: 'Compliance Lead', care: 'Regulatory safety, audit trails' },
        { name: 'James Walker', role: 'Operations Manager', care: 'Queue time, workload, SLA performance' },
      ],
      deliverables: [
        'Risk-based verification logic (rules engine)',
        'Ops manual review interface redesign',
        'Audit logging & reporting capabilities',
      ],
      successMetrics: [
        { metric: 'Fraud Loss', baseline: '£48,000/week', target: '£33,600/week (-30%)' },
        { metric: 'Manual Review Rate', baseline: '12%', target: '7% (-42%)' },
        { metric: 'Checkout Drop-off', baseline: '9%', target: '≤6%' },
      ],
    },
    
    stakeholders: [
      {
        name: 'Ben Carter',
        role: 'Product Owner',
        care: 'Deliver value quickly, keep roadmap credible, hit quarterly outcomes',
        fear: 'Scope creep, analysis paralysis, unclear framing',
        cue: 'Be structured. Be concise. Bring clarity, not chaos.',
      },
      {
        name: 'Marie Dupont',
        role: 'Compliance Lead',
        care: 'Regulatory safety, audit trails, zero breach exposure',
        fear: 'Controls weakened in the name of "speed" or "conversion"',
        cue: 'Speak in control points, traceability, evidence. No shortcuts.',
      },
      {
        name: 'James Walker',
        role: 'Operations Manager',
        care: 'Queue time, workload balance, SLA performance',
        fear: 'More manual work dumped on Ops without tooling or support',
        cue: 'Show the future state removes friction. Co-design with Ops.',
      },
      {
        name: 'Alicia Chen',
        role: 'Senior Software Engineer',
        care: 'Feasible changes, predictable delivery, clear specs',
        fear: 'Vague problem statements, requirement churn',
        cue: 'Bring decisions and rationale. Explain the "why".',
      },
    ],
    
    tasks: [
      {
        title: 'Write down the 3 most important things to clarify in the kickoff meeting',
        placeholder: 'Example: What does "risk-based" mean? Who defines fraud? How does the current process work?',
      },
      {
        title: 'Identify one constraint that worries you and why',
        placeholder: 'Example: FCA compliance — I need to understand what audit evidence is required...',
      },
    ],
  },
  
  voids: {
    emailSubject: 'Welcome to the Housing Voids Reduction Programme',
    emailFrom: 'Sarah Thompson',
    emailFromEmail: 'sarah.thompson@council.gov.uk',
    initiativeName: 'Housing Voids Reduction Programme',
    meetingTime: '10:00',
    attachmentName: 'Voids Programme – Overview & Objectives.pdf',
    teamsChannel: '#housing-voids-programme',
    
    meetingTitle: 'Intro: Voids Programme Kickoff',
    meetingAttendees: [
      { name: 'Sarah Thompson', role: 'Housing Services Manager' },
      { name: 'Tom Richards', role: 'Repairs Team Lead' },
      { name: 'Rachel Green', role: 'Finance Business Partner' },
      { name: 'You', role: 'Business Analyst' },
    ],
    meetingPurpose: 'Understand the void turnaround problem, review current process, and identify quick wins.',
    
    checklistItems: [
      { id: 'vpn', task: 'Council network access', owner: 'IT', status: 'Pending' },
      { id: 'housing', task: 'Housing system login', owner: 'IT', status: 'Pending' },
      { id: 'teams', task: 'Join #housing-voids-programme channel', owner: 'You', status: 'Ready' },
      { id: 'drive', task: 'Shared drive permissions (repairs data)', owner: 'IT', status: 'Pending' },
      { id: 'training', task: 'GDPR & data protection refresher', owner: 'HR', status: 'Scheduled' },
    ],
    
    onePager: {
      problem: 'Council has 200+ void properties (empty homes). Average turnaround time is 45 days from tenant move-out to new tenant move-in. Each void day costs £18 in lost rent. Annual cost: £1.2M.',
      impactStats: [
        { label: 'Lost Rental Income', value: '£1.2M/year' },
        { label: 'Average Void Days', value: '45 days' },
        { label: 'Properties Void', value: '200+ at any time' },
      ],
      goal: 'Reduce void turnaround time from 45 days to 21 days, saving £600k/year in lost rental income.',
      constraints: [
        'Limited budget for new tools or contractors',
        'Repairs team already at capacity',
        'Must maintain property safety standards',
        'Go-live target: End of Q3 (16 weeks)',
      ],
      keyStakeholders: [
        { name: 'Sarah Thompson', role: 'Housing Services Manager', care: 'Reduce void costs, improve tenant satisfaction' },
        { name: 'Tom Richards', role: 'Repairs Team Lead', care: 'Clear work orders, realistic timelines' },
        { name: 'Rachel Green', role: 'Finance Business Partner', care: 'Cost per void, budget forecasting, ROI' },
      ],
      deliverables: [
        'Streamlined void inspection & handover process',
        'Repairs triage & prioritization system',
        'Automated void tracking dashboard',
      ],
      successMetrics: [
        { metric: 'Average Void Days', baseline: '45 days', target: '21 days (-53%)' },
        { metric: 'Lost Rental Income', baseline: '£1.2M/year', target: '£600k/year (-50%)' },
        { metric: 'Repair Completion Rate', baseline: '68% on time', target: '90% on time' },
      ],
    },
    
    stakeholders: [
      {
        name: 'Sarah Thompson',
        role: 'Housing Services Manager',
        care: 'Reduce void costs, improve tenant satisfaction, hit performance targets',
        fear: 'Budget cuts, tenant complaints, missing KPI targets',
        cue: 'Focus on practical solutions. Show quick wins.',
      },
      {
        name: 'Tom Richards',
        role: 'Repairs Team Lead',
        care: 'Clear work orders, realistic timelines, team morale',
        fear: 'Unrealistic deadlines, blame for delays outside his control',
        cue: 'Acknowledge constraints. Listen to ground truth.',
      },
      {
        name: 'Rachel Green',
        role: 'Finance Business Partner',
        care: 'Cost per void, budget forecasting, ROI on improvements',
        fear: 'Overspend, untracked costs, no financial visibility',
        cue: 'Speak in £. Show cost/benefit clearly.',
      },
      {
        name: 'David Miller',
        role: 'IT Support Officer',
        care: 'System stability, manageable change requests',
        fear: 'Complex technical changes, no resources for support',
        cue: 'Keep technical changes simple. Explain clearly.',
      },
    ],
    
    tasks: [
      {
        title: 'Write down the 3 most important things to clarify in the kickoff meeting',
        placeholder: 'Example: What causes delays? Who decides repair priorities? How do we track void status now?',
      },
      {
        title: 'Identify one constraint that worries you and why',
        placeholder: 'Example: Limited budget — how do we improve without new tools or people?',
      },
    ],
  },
};

