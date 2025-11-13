import React from 'react';
import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page4PowerInterestEntry {
  quadrant: string;
  label: string;
  color: string;
  textColor: string;
  stakeholders: string[];
  approach: string;
}

export interface Page4CommunicationChannel {
  tool: string;
  icon: React.ReactNode | null;
  when: string;
  tone: string;
  example: string;
}

export interface Page4ConversationScript {
  stakeholder: string;
  goal: string;
  script: string;
  why: string;
}

export interface Page4MeetingFramework {
  stage: string;
  action: string;
  script: string;
}

export interface Page4NotesComparison {
  type: string;
  color: string;
  textColor: string;
  notes: string[];
}

export interface Page4Data {
  powerInterestGrid: Page4PowerInterestEntry[];
  communicationChannels: Page4CommunicationChannel[];
  conversationScripts: Page4ConversationScript[];
  meetingFramework: Page4MeetingFramework[];
  notesComparison: Page4NotesComparison[];
  taskTitle: string;
  taskPlaceholder: string;
  firstMessagePlaceholder: string;
  followUpMessage: string[];
  exampleStakeholderMap: Array<{
    name: string;
    role: string;
    quadrant: string;
    engagement: string;
    risk: string;
  }>;
  exampleMessages: Array<{
    to: string;
    content: string[];
    why: string;
  }>;
}

export const PAGE_4_DATA: Record<BAInActionProject, Page4Data> = {
  cif: {
    powerInterestGrid: [
      {
        quadrant: 'High Power, High Interest',
        label: 'Key Players',
        color: 'bg-rose-600',
        textColor: 'text-white',
        stakeholders: ['Ben (Product Owner)', 'Marie (Compliance Lead)'],
        approach: 'Engage closely. Weekly updates. They shape direction.',
      },
      {
        quadrant: 'High Power, Low Interest',
        label: 'Keep Satisfied',
        color: 'bg-amber-600',
        textColor: 'text-white',
        stakeholders: ['CFO', 'CTO'],
        approach: `Keep informed at milestones. Don't over-communicate.`,
      },
      {
        quadrant: 'Low Power, High Interest',
        label: 'Keep Informed',
        color: 'bg-sky-600',
        textColor: 'text-white',
        stakeholders: ['James (Operations)', 'Customer Service Lead'],
        approach: 'Regular updates. They provide ground truth.',
      },
      {
        quadrant: 'Low Power, Low Interest',
        label: 'Monitor',
        color: 'bg-slate-400',
        textColor: 'text-white',
        stakeholders: ['IT Support', 'External auditor'],
        approach: 'Inform as needed. No regular cadence.',
      },
    ],
    communicationChannels: [
      {
        tool: 'Microsoft Teams / Slack',
        icon: null,
        when: 'Day-to-day updates, quick questions, async alignment',
        tone: 'Professional but conversational. Use threads. Tag appropriately.',
        example: '"Quick check: does the address-change flow require manual approval at KYC, or only for high-risk flags?"',
      },
      {
        tool: 'Email',
        icon: null,
        when: 'Formal summaries, decision logs, external stakeholders',
        tone: 'Structured. Subject line = decision/action. Use bullet points.',
        example: 'Subject: "CI&F – Scope Confirmation Required by EOD Friday"',
      },
      {
        tool: 'Video Calls (Teams/Zoom)',
        icon: null,
        when: 'Complex topics, alignment on contentious issues, kickoffs',
        tone: 'Calm, measured. Lead with agenda. Close with actions.',
        example: 'Start: "Our goal today is to align on verification touchpoints and confirm non-negotiables."',
      },
      {
        tool: 'In-Person / Walk-Ups',
        icon: null,
        when: 'Sensitive topics, building trust, urgent blockers',
        tone: 'Human. Listen more than you speak. No laptop.',
        example: '"Can I grab 10 minutes? I want to understand your concern about the compliance flow before I document it."',
      },
    ],
    conversationScripts: [
      {
        stakeholder: 'Product Owner',
        goal: 'Align on outcomes without stepping on authority',
        script: `"Before we define how, I want to confirm the success targets and guardrails. Here's what I'm working with — tell me where it's wrong."`,
        why: 'Shows respect for ownership. Invites correction, not confrontation.',
      },
      {
        stakeholder: 'Compliance',
        goal: 'Understand immovable constraints',
        script: '"Help me understand where verification cannot weaken under any circumstance. I want to design around those anchor points."',
        why: 'You become a protector, not a risk. Compliance becomes your ally.',
      },
      {
        stakeholder: 'Operations',
        goal: 'Get real-world pain, not sanitised dashboards',
        script: `"Show me a real case. Don't clean it up. Walk me through what happens step by step when an exception lands."`,
        why: `Ops finally feels heard. You'll get the truth, not the story.`,
      },
      {
        stakeholder: 'Engineering',
        goal: 'Understand feasibility early',
        script: '"Before we talk solutions, can you walk me through where identity verification is invoked today and what triggers a manual review?"',
        why: `You speak their language. They'll trust your requirements.`,
      },
      {
        stakeholder: 'Finance',
        goal: 'Ground the ROI story',
        script: `"If we cut manual reviews by 40%, what's the rough cost-per-case or time-per-case impact? Directional is fine."`,
        why: 'Finance gets a number they can champion upwards.',
      },
    ],
    meetingFramework: [
      {
        stage: '1. Set the Frame',
        action: 'State the purpose clearly',
        script: '"Our goal today is to confirm success criteria and align on constraints."',
      },
      {
        stage: '2. Reflect the Known',
        action: 'Summarise shared understanding',
        script: '"Fraud increased ~17%, review queues breach SLA, conversion drops at KYC."',
      },
      {
        stage: '3. Surface Differences',
        action: 'Ask where people disagree',
        script: '"Does anyone see this differently before we continue?"',
      },
      {
        stage: '4. Clarify Constraints',
        action: 'Identify non-negotiables',
        script: '"Which verification points cannot change due to regulatory controls?"',
      },
      {
        stage: '5. Define Next Step',
        action: 'Assign real actions with owners',
        script: `"Analytics confirms baselines. Compliance shares audit notes. I'll draft the problem statement and post it EOD."`,
      },
    ],
    notesComparison: [
      {
        type: 'Weak BA Notes',
        color: 'border-rose-200 bg-rose-50',
        textColor: 'text-rose-800',
        notes: [
          'Ops: queues are long',
          'Compliance: worried about audit',
          'PO: needs quick wins',
        ],
      },
      {
        type: 'Strong BA Notes',
        color: 'border-emerald-200 bg-emerald-50',
        textColor: 'text-emerald-800',
        notes: [
          'Ops pain = reviews >48h → SLA breach → reputational risk',
          'Compliance pain = audit flagged address-change flow → must maintain chain-of-proof',
          'PO pressure = quarterly outcomes → needs visible momentum, not long discovery',
        ],
      },
    ],
    taskTitle: 'Map the CI&F Stakeholders',
    taskPlaceholder: `Example:\nBen Carter (Product Owner) → High Power, High Interest → Weekly updates, close collaboration → Risk: scope creep under quarterly pressure.\n\nMarie Dupont (Compliance) → High Power, High Interest → ...`,
    firstMessagePlaceholder: `Example:\nHi Marie — following our intro yesterday, I want to understand the regulatory anchor points for identity verification (particularly at signup and address change).\n\nCould we grab 20 minutes this week to walk through the controls that cannot weaken? I'll take notes and share them back for review.\n\nThanks,\n[Your name]`,
    followUpMessage: [
      'Good session — summarising decisions to ensure shared clarity:',
      '• Outcome: Reduce fraud loss while protecting conversion baseline.',
      '• Constraints: KYC control points at signup + address change remain non-negotiable (regulatory).',
      '• Next steps:',
      '  – Analytics confirming fraud loss baselines by EOD Wednesday',
      '  – Ops providing 3 real exception cases for review flow analysis',
      '  – Compliance sharing audit notes on address-change flow',
      `• BA action: I'll draft the problem statement and post it EOD tomorrow for review.`,
    ],
    exampleStakeholderMap: [
      {
        name: 'Ben Carter',
        role: 'Product Owner',
        quadrant: 'High Power, High Interest (Key Player)',
        engagement: 'Weekly 1:1s + ad-hoc alignment. Share drafts early for feedback.',
        risk: 'Quarterly pressure → scope creep. Keep him grounded in success criteria.',
      },
      {
        name: 'Marie Dupont',
        role: 'Compliance Lead',
        quadrant: 'High Power, High Interest (Key Player)',
        engagement: 'Bi-weekly check-ins. Always frame changes through a regulatory lens.',
        risk: `Audit defensibility. If she's not comfortable, nothing moves.`,
      },
      {
        name: 'James Walker',
        role: 'Operations Manager',
        quadrant: 'Low Power, High Interest (Keep Informed)',
        engagement: 'Async updates in Slack + monthly walkthrough of queue changes.',
        risk: 'Ground truth. He knows where the process breaks.',
      },
    ],
    exampleMessages: [
      {
        to: 'Marie (Compliance)',
        content: [
          'Hi Marie — following our intro yesterday, I want to understand the regulatory anchor points for identity verification (particularly at signup and address change).',
          `Could we grab 20 minutes this week to walk through the controls that cannot weaken under any circumstance? I'll take notes and share them back for your review.`,
          'Thanks,',
          '[Your name]',
        ],
        why: 'Clear purpose. Specific ask. Respectful of her expertise. Offers to document.',
      },
      {
        to: 'James (Operations)',
        content: [
          `Hi James — I'm mapping the manual review process to understand where delays occur.`,
          `Could you show me 2-3 real exception cases (don't clean them up)? I want to see what actually happens step-by-step when they land in the queue.`,
          '15 minutes over Teams works — or I can swing by your desk.',
          'Cheers,',
          '[Your name]',
        ],
        why: 'Shows you want the real story, not dashboards. Low-friction ask. Flexible format.',
      },
    ],
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
      },
      {
        quadrant: 'High Power, Low Interest',
        label: 'Keep Satisfied',
        color: 'bg-slate-700',
        textColor: 'text-white',
        stakeholders: ['Director of Housing', 'Councillor Oversight'],
        approach: 'Fortnightly summaries with rent savings headlines. Minimal operational detail.',
      },
      {
        quadrant: 'Low Power, High Interest',
        label: 'Keep Informed',
        color: 'bg-emerald-600',
        textColor: 'text-white',
        stakeholders: ['Void Inspectors', 'Repairs Coordinators'],
        approach: 'Shadow work, async check-ins, gather evidence of delays. They own the pain points.',
      },
      {
        quadrant: 'Low Power, Low Interest',
        label: 'Monitor',
        color: 'bg-slate-400',
        textColor: 'text-white',
        stakeholders: ['Finance Analyst', 'IT Support'],
        approach: 'Bring them in when numbers or tooling decisions are needed. Keep updates concise.',
      },
    ],
    communicationChannels: [
      {
        tool: 'Teams Channel #housing-voids',
        icon: null,
        when: 'Daily progress nuggets, quick blockers, photo evidence uploads',
        tone: 'Plain language. Reference property IDs. Keep updates short and factual.',
        example: '"Void 27A – inspection booked for Tuesday 10am. Photos will be in this thread within the hour."',
      },
      {
        tool: 'Email',
        icon: null,
        when: 'Councillor briefings, finance updates, contractor escalations',
        tone: 'Formal headings, rent impact highlighted, link to tracker.',
        example: 'Subject: "Voids Update – Properties 27A & 54C cost position (w/c 10 Mar)"',
      },
      {
        tool: 'On-site Walkthroughs',
        icon: null,
        when: 'Joint inspections, contractor handovers, quality checks',
        tone: 'Capture materials and photos on site. Agree actions before leaving.',
        example: '"Tom, confirming: kitchen units 3 + worktop replace. Logging on tablet now so repairs have full scope."',
      },
      {
        tool: 'Phone Calls',
        icon: null,
        when: 'Urgent clarifications when a property risks missing re-let date',
        tone: 'Lead with timeline impact. Close with clear next step.',
        example: '"Hi Rachel, property 27A risks exceeding 28 days void. Need latest spend to brief leadership today."',
      },
    ],
    conversationScripts: [
      {
        stakeholder: 'Housing Manager',
        goal: 'Align on outcomes without stepping on authority',
        script: `"Before we define how, I want to confirm the success targets. Here's what I understand — tell me where it's wrong."`,
        why: 'Shows respect for ownership. Invites correction, not confrontation.',
      },
      {
        stakeholder: 'Repairs Lead',
        goal: 'Understand real-world constraints',
        script: '"Help me understand where the inspection-to-repair process actually breaks. I want to design around those anchor points."',
        why: 'You become a partner, not a burden. Repairs becomes your ally.',
      },
      {
        stakeholder: 'Void Inspector',
        goal: 'Get real-world pain, not sanitised reports',
        script: `"Show me a real property. Don't clean it up. Walk me through what happens step by step from inspection to re-let."`,
        why: `Inspectors finally feel heard. You'll get the truth, not the story.`,
      },
      {
        stakeholder: 'Finance Partner',
        goal: 'Ground the cost story',
        script: `"If we cut average void days from 45 to 30, what's the rough rent value that hits the ledger? Directional is fine."`,
        why: `Finance gets a number they can champion upwards.`,
      },
      {
        stakeholder: 'Councillor Oversight',
        goal: 'Understand political constraints',
        script: '"Before we talk solutions, can you walk me through what the housing committee needs to see to approve this programme?"',
        why: `You speak their language. They'll trust your approach.`,
      },
    ],
    meetingFramework: [
      {
        stage: '1. Set the Frame',
        action: 'State the purpose clearly',
        script: '"Our goal today is to confirm success criteria and align on constraints."',
      },
      {
        stage: '2. Reflect the Known',
        action: 'Summarise shared understanding',
        script: '"Void periods average 45 days, costing £1.2M annually. Repairs crews are double-booked 30% of the time."',
      },
      {
        stage: '3. Surface Differences',
        action: 'Ask where people disagree',
        script: '"Does anyone see this differently before we continue?"',
      },
      {
        stage: '4. Clarify Constraints',
        action: 'Identify non-negotiables',
        script: '"Which parts of the void process cannot change due to health and safety or budget constraints?"',
      },
      {
        stage: '5. Define Next Step',
        action: 'Assign real actions with owners',
        script: `"Housing confirms baseline void days. Repairs shares 3 real property cases. I'll draft the problem statement and post it EOD."`,
      },
    ],
    notesComparison: [
      {
        type: 'Weak BA Notes',
        color: 'border-rose-200 bg-rose-50',
        textColor: 'text-rose-800',
        notes: [
          'Housing: voids are expensive',
          'Repairs: teams are busy',
          'Finance: needs cost savings',
        ],
      },
      {
        type: 'Strong BA Notes',
        color: 'border-emerald-200 bg-emerald-50',
        textColor: 'text-emerald-800',
        notes: [
          'Housing pain = 45-day voids → £1.2M lost rent → tenant waiting lists → public pressure',
          'Repairs pain = double-booked crews 30% → delays → blame for missed re-let dates',
          'Finance pressure = budget review → needs rent recovery proof → needs cost per void breakdown',
        ],
      },
    ],
    taskTitle: 'Map the Voids Stakeholders',
    taskPlaceholder: `Example:\nSarah Thompson (Housing Manager) → High Power, High Interest → Weekly steer sessions → Risk: budget cuts if savings not visible.\n\nTom Richards (Repairs Lead) → High Power, High Interest → ...`,
    firstMessagePlaceholder: `Example:\nHi Sarah — following our intro yesterday, I want to understand the void turnaround process and where delays occur.\n\nCould we grab 20 minutes this week to walk through the last void that stretched past 30 days? I'll take notes and share them back for review.\n\nThanks,\n[Your name]`,
    followUpMessage: [
      'Good session — summarising decisions to ensure shared clarity:',
      '• Outcome: Reduce void period from 45 to 21 days, saving £600k annually.',
      '• Constraints: Health and safety checks remain non-negotiable. Budget limited to process improvements, not new tools.',
      '• Next steps:',
      '  – Housing confirming baseline void days and rent loss by EOD Wednesday',
      '  – Repairs providing 3 real property cases showing where delays occur',
      '  – Finance sharing cost per void breakdown',
      `• BA action: I'll draft the problem statement and post it EOD tomorrow for review.`,
    ],
    exampleStakeholderMap: [
      {
        name: 'Sarah Thompson',
        role: 'Housing Manager',
        quadrant: 'High Power, High Interest (Key Player)',
        engagement: 'Weekly steer sessions + ad-hoc alignment. Share visual updates showing void turnaround.',
        risk: 'Budget cuts if savings not visible. Keep her grounded in rent recovery targets.',
      },
      {
        name: 'Tom Richards',
        role: 'Repairs Lead',
        quadrant: 'High Power, High Interest (Key Player)',
        engagement: 'Weekly check-ins. Always frame changes through a practical lens.',
        risk: `If he's not comfortable with workflow changes, nothing moves.`,
      },
      {
        name: 'Void Inspector',
        role: 'Void Inspector',
        quadrant: 'Low Power, High Interest (Keep Informed)',
        engagement: 'Shadow inspections + async updates in Teams. Gather evidence of delays.',
        risk: 'Ground truth. They know where the process actually breaks.',
      },
    ],
    exampleMessages: [
      {
        to: 'Sarah (Housing Manager)',
        content: [
          'Hi Sarah — following our intro yesterday, I want to understand the void turnaround process and where delays occur.',
          `Could we grab 20 minutes this week to walk through the last void that stretched past 30 days? I'll take notes and share them back for your review.`,
          'Thanks,',
          '[Your name]',
        ],
        why: 'Clear purpose. Specific ask. Respectful of her expertise. Offers to document.',
      },
      {
        to: 'Tom (Repairs Lead)',
        content: [
          `Hi Tom — I'm mapping the inspection-to-repair process to understand where delays occur.`,
          `Could you show me 2-3 real property cases (don't clean them up)? I want to see what actually happens step-by-step from inspection to re-let.`,
          '15 minutes over Teams works — or I can join you on-site.',
          'Cheers,',
          '[Your name]',
        ],
        why: 'Shows you want the real story, not reports. Low-friction ask. Flexible format.',
      },
    ],
  },
};
