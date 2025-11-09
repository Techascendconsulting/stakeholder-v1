export interface ProjectStakeholder {
  name: string;
  role: string;
  care: string;
  fear: string;
  cue: string;
}

export interface ProjectData {
  id: 'cif' | 'voids';
  name: string;
  shortName: string;
  industry: string;
  difficulty: 'beginner' | 'advanced';
  description: string;
  tagline: string;
  problemStatement: string;
  businessGoal: string;
  stakeholders: ProjectStakeholder[];
  kpis: {
    name: string;
    baseline: string;
    target: string;
  }[];
}

export const PROJECTS: Record<'cif' | 'voids', ProjectData> = {
  cif: {
    id: 'cif',
    name: 'Customer Identity & Fraud Prevention',
    shortName: 'CI&F',
    industry: 'FinTech',
    difficulty: 'advanced',
    description: 'Reduce fraudulent account creation while keeping signup smooth for legitimate customers',
    tagline: 'Complex fraud detection with regulatory compliance',
    problemStatement: 'Fraudulent account creation has increased 17% quarter-over-quarter. Current static KYC checks cause 9% checkout drop-off for legitimate users. We need dynamic risk-based verification.',
    businessGoal: 'Reduce fraud by 30% while protecting conversion rates',
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
    kpis: [
      { name: 'Fraud Loss', baseline: '£48,000/week', target: '£33,600/week (-30%)' },
      { name: 'Manual Review Rate', baseline: '12%', target: '7% (-42%)' },
      { name: 'Checkout Drop-off', baseline: '9%', target: '≤6%' },
    ],
  },
  voids: {
    id: 'voids',
    name: 'Housing Voids Reduction Programme',
    shortName: 'Voids',
    industry: 'Local Government / Housing',
    difficulty: 'beginner',
    description: 'Reduce time empty properties take to repair and re-let to minimize lost rental income',
    tagline: 'Simple, relatable housing management optimization',
    problemStatement: 'Council has 200+ void properties (empty homes). Average turnaround time is 45 days from tenant move-out to new tenant move-in. Each void day costs £18 in lost rent. Annual cost: £1.2M.',
    businessGoal: 'Reduce void turnaround time from 45 days to 21 days, saving £600k/year',
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
    kpis: [
      { name: 'Average Void Days', baseline: '45 days', target: '21 days (-53%)' },
      { name: 'Lost Rental Income', baseline: '£1.2M/year', target: '£600k/year (-50%)' },
      { name: 'Repair Completion Rate', baseline: '68% on time', target: '90% on time' },
    ],
  },
};

export const getProjectData = (projectId: 'cif' | 'voids'): ProjectData => {
  return PROJECTS[projectId];
};

