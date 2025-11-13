import React from 'react';
import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page3PowerInterestEntry {
  quadrant: string;
  label: string;
  color: string;
  textColor: string;
  stakeholders: string[];
  approach: string;
  interviewTip: string;
}

export interface Page3PressureSignal {
  name: string;
  signal: string;
}

export interface Page3Script {
  label: string;
  quote: string;
}

export interface Page3CommunicationTool {
  tool: string;
  icon: React.ReactNode | null;
  when: string;
  how: string;
  example: string;
}

export interface Page3Data {
  powerInterestGrid: Page3PowerInterestEntry[];
  pressureSignals: Page3PressureSignal[];
  scripts: Page3Script[];
  communicationTools: Page3CommunicationTool[];
  exampleNarrative: string[];
  slackUpdate: string[];
  taskTitle: string;
  taskPlaceholder: string;
}

export const PAGE_3_DATA: Record<BAInActionProject, Page3Data> = {
  cif: {
    powerInterestGrid: [
      {
        quadrant: 'High Power, High Interest',
        label: 'Key Players',
        color: 'bg-rose-600',
        textColor: 'text-white',
        stakeholders: ['Ben (Product Owner)', 'Marie (Compliance Lead)'],
        approach: 'Engage closely. Weekly 1:1s. They shape direction.',
        interviewTip: '"I prioritized weekly alignment with the Product Owner and Compliance Lead as they held decision rights and audit accountability."',
      },
      {
        quadrant: 'High Power, Low Interest',
        label: 'Keep Satisfied',
        color: 'bg-amber-600',
        textColor: 'text-white',
        stakeholders: ['CFO', 'CTO', 'Head of Risk'],
        approach: 'Milestone updates only. Use metrics. Never waste their time.',
        interviewTip: '"I kept senior leadership informed at key milestones with concise, metric-driven summaries."',
      },
      {
        quadrant: 'Low Power, High Interest',
        label: 'Keep Informed',
        color: 'bg-sky-600',
        textColor: 'text-white',
        stakeholders: ['James (Operations)', 'Fraud Analysts', 'CS Lead'],
        approach: 'Regular async updates. They provide ground truth and surface hidden blockers.',
        interviewTip: '"Operations had low decision power but high interest — they felt the pain daily and surfaced critical edge cases."',
      },
      {
        quadrant: 'Low Power, Low Interest',
        label: 'Monitor',
        color: 'bg-slate-400',
        textColor: 'text-white',
        stakeholders: ['IT Support', 'Marketing', 'External Auditor'],
        approach: 'Inform only when relevant. No regular cadence.',
        interviewTip: '"I monitored low-power, low-interest stakeholders and informed them only when their input was needed."',
      },
    ],
    pressureSignals: [
      { name: 'Product Owner', signal: 'Needs visible momentum for board updates — even if operational mess underneath.' },
      { name: 'Compliance', signal: 'Protects licence to operate. Audit exposure = personal accountability.' },
      { name: 'Operations', signal: 'Living the queue pain daily. Stress rarely seen by leadership.' },
      { name: 'Engineering', signal: 'Roadmap already full. They need trade-offs, not surprises.' },
      { name: 'Finance', signal: 'Must justify spend to leadership. Needs conversion of effort → £ saved.' },
    ],
    scripts: [
      {
        label: 'Product Owner',
        quote: `"I want to confirm how we're defining success before we go deeper. Here are the working targets and guardrails — tell me what's off."`,
      },
      {
        label: 'Compliance',
        quote: `"To stay audit-safe, I need to know which control points are non-negotiable. Walk me through the ones we can't compromise."`,
      },
      {
        label: 'Operations',
        quote: `"Show me a real case. Don't tidy it. I need to see exactly where it slows down."`,
      },
      {
        label: 'Engineering',
        quote: '"Before solutioning, can you walk me through where risk checks fire in code today and which events trigger review?"',
      },
      {
        label: 'Finance',
        quote: `"If manual reviews dropped 40%, what's the time or cost benefit? Directional numbers help me frame value."`,
      },
    ],
    communicationTools: [
      {
        tool: 'Microsoft Teams / Slack',
        icon: null, // Will be set in component
        when: 'Day-to-day updates, quick alignment, async decisions',
        how: 'Use threads. Tag specific people. Keep it structured but conversational.',
        example: '"Quick alignment: Marie, can you confirm if address-change verification needs manual approval or just high-risk flags?"',
      },
      {
        tool: 'Email',
        icon: null,
        when: 'Formal updates, decision logs, external stakeholders, approvals',
        how: 'Clear subject line (action/decision). Bullet points. Link to evidence.',
        example: 'Subject: "CI&F – Scope Baseline Confirmation Required by Friday 5pm"',
      },
      {
        tool: 'Video Calls (Teams/Zoom)',
        icon: null,
        when: 'Complex alignment, contentious topics, kickoffs, workshops',
        how: 'Lead with agenda. Summarise decisions at close. Assign actions with owners.',
        example: 'Open: "Our goal today is to align on verification touchpoints and confirm non-negotiables."',
      },
      {
        tool: 'In-Person / Walk-Ups',
        icon: null,
        when: 'Sensitive topics, relationship building, urgent blockers',
        how: 'Human first. Listen more. No laptop. Build trust before asking for commitments.',
        example: '"Can I grab 10 minutes? I want to understand your concern about the compliance flow before documenting it."',
      },
    ],
    exampleNarrative: [
      'Urgency: Ben and Finance need fraud losses down in £ before the board review. They set the tempo.',
      'Pain: Ops is breaching the 24h SLA 40% of the time. If we ignore their load, they will quietly stall the change.',
      "Risk: Marie owns audit exposure. If we don't prove traceability on account changes, she will veto the rollout.",
      'Priority: Decisions sit with Ben + Compliance, but Alicia (Engineering) influences sequencing via feasibility.',
      'Quiet block: Ops could resist if "automation" means more manual checks. Protect them by co-designing improvements.',
      'Protection: Finance needs directional ROI before approving time. Translate every option into £ impact.',
    ],
    slackUpdate: [
      'Working map of key people drafted.',
      'Validating pressure points with Ops + Compliance tomorrow.',
      'Aligning on decision owner + guardrails before defining the first slice.',
      'Will publish narrative summary once validated.',
    ],
    taskTitle: 'Map the CI&F Stakeholders Using the Power-Interest Grid',
    taskPlaceholder: 'Example:\nBen Carter (Product Owner) → High Power, High Interest → Weekly 1:1s via Teams → Prefers structured agendas with clear outcomes → Risk: scope creep under quarterly pressure.\n\nMarie Dupont (Compliance) → High Power, High Interest → ...',
  },
  voids: {
    powerInterestGrid: [
      {
        quadrant: 'High Power, High Interest',
        label: 'Key Players',
        color: 'bg-blue-700',
        textColor: 'text-white',
        stakeholders: ['Sarah (Housing Manager)', 'Tom (Repairs Lead)'],
        approach: 'Weekly steer with visuals of void turnaround, risks, and savings.',
        interviewTip: '"For the Voids programme I held weekly steer sessions with housing and repairs so decisions stayed aligned."',
      },
      {
        quadrant: 'High Power, Low Interest',
        label: 'Keep Satisfied',
        color: 'bg-slate-700',
        textColor: 'text-white',
        stakeholders: ['Director of Housing', 'Councillor Oversight'],
        approach: 'Fortnightly summaries with rent savings headlines. Minimal operational detail.',
        interviewTip: '"Leadership wanted assurance on rent savings and compliance, not day-to-day detail."',
      },
      {
        quadrant: 'Low Power, High Interest',
        label: 'Keep Informed',
        color: 'bg-emerald-600',
        textColor: 'text-white',
        stakeholders: ['Void Inspectors', 'Repairs Coordinators'],
        approach: 'Shadow work, async check-ins, gather evidence of delays. They own the pain points.',
        interviewTip: '"Frontline inspectors surfaced the true delays — they became design partners once we listened."',
      },
      {
        quadrant: 'Low Power, Low Interest',
        label: 'Monitor',
        color: 'bg-slate-400',
        textColor: 'text-white',
        stakeholders: ['Finance Analyst', 'IT Support'],
        approach: 'Bring them in when numbers or tooling decisions are needed. Keep updates concise.',
        interviewTip: '"Finance analysts only engaged when we translated delays into £. I kept them looped in at milestones."',
      },
    ],
    pressureSignals: [
      { name: 'Housing Manager', signal: 'References "families waiting" every meeting. Checks void list late at night.' },
      { name: 'Repairs Lead', signal: 'Talks about crews "firefighting" and jokes about double-booked electricians.' },
      { name: 'Finance Partner', signal: 'Asks for latest rent loss figure each meeting but never gets a confident answer.' },
      { name: 'Void Inspector', signal: 'Carries personal notebooks and WhatsApp photos because "system is too slow".' },
      { name: 'Contractor Manager', signal: 'Escalates when scope changes mid-job — means work orders lack detail.' },
    ],
    scripts: [
      {
        label: 'Housing Manager',
        quote: '"Walk me through the last void that stretched past 30 days. Where did it stall and who had the keys at that point?"',
      },
      {
        label: 'Repairs Lead',
        quote: `"I've mapped inspection-to-repair. Where does your crew get conflicting info or arrive without materials?"`,
      },
      {
        label: 'Finance Partner',
        quote: `"If we cut average void days from 45 to 30, what rent value hits the ledger? I'll draft the model for your sense-check."`,
      },
      {
        label: 'Void Inspector',
        quote: '"Can you show me the spreadsheet you keep for properties? I want to capture what the core system is missing."',
      },
      {
        label: 'Councillor Oversight',
        quote: `"Here's the before/after timeline for three properties. Does that give you enough to brief the housing committee?"`,
      },
    ],
    communicationTools: [
      {
        tool: 'Teams Channel #housing-voids',
        icon: null,
        when: 'Daily progress nuggets, quick blockers, photo evidence uploads',
        how: 'Plain language. Reference property IDs. Keep updates short and factual.',
        example: '"Void 27A – inspection booked for Tuesday 10am. Photos will be in this thread within the hour."',
      },
      {
        tool: 'Email',
        icon: null,
        when: 'Councillor briefings, finance updates, contractor escalations',
        how: 'Formal headings, rent impact highlighted, link to tracker.',
        example: 'Subject: "Voids Update – Properties 27A & 54C cost position (w/c 10 Mar)"',
      },
      {
        tool: 'On-site Walkthroughs',
        icon: null,
        when: 'Joint inspections, contractor handovers, quality checks',
        how: 'Capture materials and photos on site. Agree actions before leaving.',
        example: '"Tom, confirming: kitchen units 3 + worktop replace. Logging on tablet now so repairs have full scope."',
      },
      {
        tool: 'Phone Calls',
        icon: null,
        when: 'Urgent clarifications when a property risks missing re-let date',
        how: 'Lead with timeline impact. Close with clear next step.',
        example: '"Hi Rachel, property 27A risks exceeding 28 days void. Need latest spend to brief leadership today."',
      },
    ],
    exampleNarrative: [
      'Urgency: Sarah and Finance need void costs down before the budget review. They set the tempo.',
      'Pain: Repairs crews are double-booked 30% of the time. If we ignore their scheduling pain, they will quietly delay work.',
      "Risk: Councillor oversight owns public accountability. If we don't prove rent recovery, they will question the programme.",
      'Priority: Decisions sit with Sarah + Repairs, but Finance influences sequencing via budget approval.',
      'Quiet block: Repairs could resist if "streamlining" means more admin. Protect them by co-designing the workflow.',
      'Protection: Finance needs rent impact before approving spend. Translate every delay into £ lost per week.',
    ],
    slackUpdate: [
      'Working map of key people drafted.',
      'Validating pressure points with Housing + Repairs tomorrow.',
      'Aligning on decision owner + guardrails before defining the first slice.',
      'Will publish narrative summary once validated.',
    ],
    taskTitle: 'Map the Voids Stakeholders Using the Power-Interest Grid',
    taskPlaceholder: 'Example:\nSarah Thompson (Housing Manager) → High Power, High Interest → Weekly steer sessions → Prefers visual updates showing void turnaround → Risk: budget cuts if savings not visible.\n\nTom Richards (Repairs Lead) → High Power, High Interest → ...',
  },
};
