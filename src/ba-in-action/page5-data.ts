import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page5Signal {
  signal: string;
  example: string;
  meaning: string;
}

export interface Page5Gap {
  gap: string;
  reason: string;
  impact: string;
}


export interface Page5ObservationNote {
  time: string;
  event: string;
  observation: string;
  baNote: string;
}

export interface Page5Data {
  signals: Page5Signal[];
  gaps: Page5Gap[];
  toBePoints: string[];
  narrativeNow: string[];
  narrativeFuture: string[];
  asIsDraft: string;
  observedPain: string[];
  observationNotes: {
    context: string;
    notes: Page5ObservationNote[];
    summary: string[];
  };
  slackUpdate: string[];
  exampleNarrative: {
    asIs: string;
    gap: string;
    whyMatters: string;
    toBe: string;
  };
  taskPlaceholder: string;
}

export const PAGE_5_DATA: Record<BAInActionProject, Page5Data> = {
  cif: {
    signals: [
      {
        signal: 'Workarounds',
        example: 'Ops exports CSV and filters "suspected fraud" manually.',
        meaning: 'The system is not solving the problem under load.',
      },
      {
        signal: 'Slack pings of "can someone check this?"',
        example: 'No defined path when exceptions arrive at pace.',
        meaning: 'Process is fragile; ownership unclear in reality.',
      },
      {
        signal: 'Multiple spreadsheets tracking the same metric',
        example: 'Finance, Ops, and PO each track separate fraud views.',
        meaning: 'Coordination gap, not a tooling gap. Decision latency.',
      },
      {
        signal: '"We just do it like that"',
        example: 'Legacy rule exists but no one remembers why.',
        meaning: 'Constraint may be artificial; challenge it with evidence.',
      },
    ],
    gaps: [
      {
        gap: 'Verification thresholds are static',
        reason: 'System assumed stable behaviour; fraud patterns evolved.',
        impact: 'Spike in false results and Ops backlog.',
      },
      {
        gap: 'No feedback loop from manual decisions',
        reason: 'Model architecture not built for adaptive learning.',
        impact: 'Fraud patterns repeat; Ops re-fights same battles.',
      },
      {
        gap: 'Ops workflow unsupported by tooling',
        reason: 'Process evolved, UI did not. Reviews live in spreadsheets.',
        impact: 'Ops time wasted → SLA breach → customer frustration.',
      },
    ],
    toBePoints: [
      'Risk-based verification with adaptive scoring.',
      'Fewer reviews; faster decisions with confidence.',
      'Feedback loop where outcomes retrain the model.',
      'Ops supported with clear prompts and workload visibility.',
      'Conversion protected while fraud is reduced.',
    ],
    narrativeNow: [
      'Identity checks are static. Fraud behaviour shifts faster than control logic.',
      'Model does not learn from outcomes. Manual effort is a dead-end.',
      'Ops is overwhelmed — 40% of reviews breach the 24h SLA.',
      'Customer experience suffers: drop-offs, escalations, reputational noise.',
    ],
    narrativeFuture: [
      'Risk tiered dynamically; high-risk gets scrutiny, low-risk flows.',
      'System learns from outcomes — every decision feeds back.',
      'Ops sees what matters, not everything; workload fits capacity.',
      'Fraud reduction and conversion protection coexist.',
    ],
    asIsDraft: 'Customer signs up → system triggers verification check → if match score < threshold → manual review queue → Ops decision → account approved or rejected → decision outcome not fed back into scoring model.',
    observedPain: [
      'Review queue aging > 48h (SLA breach).',
      'False positives → customer drop-off + support escalations.',
      'No feedback loop → model does not learn → fraud patterns repeat.',
    ],
    observationNotes: {
      context: 'Shadowing James during peak period (10am-12pm). Observing manual review queue process for identity verification cases flagged as "mid-risk" (score 31-84).',
      notes: [
        {
          time: '10:05 AM',
          event: 'Case #4521 arrives in queue',
          observation: 'James opens case. System shows: Name, DOB, email. Missing: IP address, device fingerprint, previous fraud flags. James switches to separate admin panel to manually look up these fields.',
          baNote: 'Data fragmentation. Ops has to context-switch to 2 systems for one decision.',
        },
        {
          time: '10:12 AM',
          event: 'James checks fraud flag history',
          observation: 'James finds 2 previous fraud flags for this email domain. But there\'s no clear guidance on what to do with this information. James: "I usually block if there are 2+ flags, but sometimes Compliance overrules me."',
          baNote: 'Decision criteria not codified. Ops using tribal knowledge. Risk of inconsistency.',
        },
        {
          time: '10:18 AM',
          event: 'James makes decision: Block',
          observation: 'James clicks "Block" button. System updates status. No audit log visible. James doesn\'t know if his decision was logged with evidence. "I assume it\'s in the background somewhere?"',
          baNote: 'Compliance gap. Ops can\'t verify audit trail. Marie won\'t accept this.',
        },
        {
          time: '10:22 AM',
          event: 'Case #4522 arrives',
          observation: 'Same process. James switches systems again. Queue is aging — 14 cases now waiting. James: "This gets overwhelming around lunchtime when volume spikes. We breach SLA almost every day."',
          baNote: 'Process doesn\'t scale. SLA breaches are systemic, not Ops\' fault.',
        },
        {
          time: '11:45 AM',
          event: 'Compliance asks for evidence on blocked case',
          observation: 'Marie (Compliance) Slacks James: "Why did we block case #4521?" James has to manually reconstruct decision from memory + check multiple systems. Takes 15 minutes to respond.',
          baNote: 'No decision log accessible to Ops. Rework + friction with Compliance.',
        },
      ],
      summary: [
        'Ops switches between 2 systems for every case (fragmentation)',
        'No clear decision guidance (tribal knowledge risk)',
        'Audit trail not visible to Ops (Compliance friction)',
        'Process doesn\'t scale (SLA breaches daily)',
        'No decision log for retrospective queries (rework)',
      ],
    },
    slackUpdate: [
      'Completed first pass of the As-Is and identified key gaps:',
      '• Static verification thresholds not aligned with current fraud behaviour.',
      '• Manual review loop has no model feedback path.',
      '• Ops workload increases as volume scales.',
      'Drafting To-Be direction focused on risk-tiering + feedback loop + Ops clarity.',
      'Will validate with Ops + Compliance tomorrow.',
    ],
    exampleNarrative: {
      asIs: '"Fraud detection runs on static thresholds; manual reviews happen in spreadsheets; Ops escalates via Slack; conversion drops when manual queue spikes."',
      gap: '"Design assumed consistent behaviour, but fraud patterns evolved. Controls stayed rigid, Ops invented workarounds, feedback never retrained the model."',
      whyMatters: '"Without adaptive learning, we pay twice — fraud loss and lost customers. Ops morale erodes; compliance risk grows."',
      toBe: '"Solution: Adaptive risk-tiering system that learns from outcomes. Requirements: System must dynamically adjust risk thresholds, embed feedback loops to retrain the model, provide Ops interface that guides decisions, and build conversion guardrails into scoring."',
    },
    taskPlaceholder: 'Capture your As-Is narrative, gap explanation, why it matters, and the direction of the To-Be...',
  },
  voids: {
    signals: [
      {
        signal: 'Workarounds',
        example: 'Void inspectors use personal notebooks and WhatsApp photos because "system is too slow".',
        meaning: 'The system is not solving the problem under real-world pressure.',
      },
      {
        signal: 'Phone calls asking "where are the keys?"',
        example: 'No defined path when properties sit empty waiting for repairs.',
        meaning: 'Process is fragile; ownership unclear in reality.',
      },
      {
        signal: 'Multiple spreadsheets tracking the same property',
        example: 'Housing, Repairs, and Finance each track separate void views.',
        meaning: 'Coordination gap, not a tooling gap. Decision latency.',
      },
      {
        signal: '"We just do it like that"',
        example: 'Legacy rule exists but no one remembers why properties must wait 7 days before inspection.',
        meaning: 'Constraint may be artificial; challenge it with evidence.',
      },
    ],
    gaps: [
      {
        gap: 'Inspection-to-repair handover is manual',
        reason: 'System assumed stable workflow; void complexity evolved.',
        impact: 'Delays accumulate; properties sit empty longer than necessary.',
      },
      {
        gap: 'No feedback loop from completed voids',
        reason: 'Process not built to learn from what worked or failed.',
        impact: 'Same delays repeat; repairs crews double-booked; rent loss continues.',
      },
      {
        gap: 'Repairs workflow unsupported by tooling',
        reason: 'Process evolved, system did not. Work orders live in spreadsheets.',
        impact: 'Repairs time wasted → missed re-let dates → rent loss continues.',
      },
    ],
    toBePoints: [
      'Streamlined inspection-to-repair handover with clear ownership.',
      'Fewer delays; faster turnaround with visibility.',
      'Feedback loop where completed voids inform future process.',
      'Repairs supported with clear work orders and material requirements.',
      'Rent recovery protected while void costs are reduced.',
    ],
    narrativeNow: [
      'Void processes are manual. Property turnaround takes longer than targets.',
      'System does not learn from completed voids. Manual effort is a dead-end.',
      'Repairs is overwhelmed — 30% of properties have double-booked crews.',
      'Housing experience suffers: families waiting, rent loss, budget pressure.',
    ],
    narrativeFuture: [
      'Process streamlined dynamically; high-priority voids get fast-tracked, standard flows move smoothly.',
      'System learns from outcomes — every completed void feeds back.',
      'Repairs sees what matters, not everything; workload fits capacity.',
      'Rent recovery and void cost reduction coexist.',
    ],
    asIsDraft: 'Property becomes void → housing logs in system → inspector visits (often delayed) → photos taken on phone → repairs work order created manually → repairs crew assigned (sometimes double-booked) → work completed → re-let date missed → rent loss continues.',
    observedPain: [
      'Void periods averaging 45 days (target is 21 days).',
      'Double-booked repairs crews → delays → missed re-let dates.',
      'No feedback loop → same delays repeat → rent loss continues.',
    ],
    observationNotes: {
      context: 'Shadowing Tom (Repairs Lead) during peak period (9am-11am). Observing void-to-repair handover process for properties flagged as "ready for repairs" after inspection.',
      notes: [
        {
          time: '9:05 AM',
          event: 'Property 27A arrives in queue',
          observation: 'Tom opens work order. System shows: Property address, void date. Missing: Inspection photos, material requirements, access arrangements. Tom switches to WhatsApp to manually retrieve photos from inspector.',
          baNote: 'Data fragmentation. Repairs has to context-switch to multiple channels for one work order.',
        },
        {
          time: '9:12 AM',
          event: 'Tom checks material requirements',
          observation: 'Tom finds previous void notes for similar property. But there\'s no clear guidance on what materials are needed. Tom: "I usually order kitchen units + worktop, but sometimes Housing changes scope mid-job."',
          baNote: 'Decision criteria not codified. Repairs using tribal knowledge. Risk of scope creep.',
        },
        {
          time: '9:18 AM',
          event: 'Tom assigns crew',
          observation: 'Tom clicks "Assign" button. System updates status. No visibility of crew availability. Tom doesn\'t know if crew is already booked. "I assume they\'ll tell me if there\'s a conflict?"',
          baNote: 'Scheduling gap. Repairs can\'t verify crew availability. Double-booking risk.',
        },
        {
          time: '9:22 AM',
          event: 'Property 54C arrives',
          observation: 'Same process. Tom switches channels again. Queue is aging — 8 properties now waiting. Tom: "This gets overwhelming when multiple voids come in. We miss re-let dates almost every week."',
          baNote: 'Process doesn\'t scale. Missed re-let dates are systemic, not Repairs\' fault.',
        },
        {
          time: '10:45 AM',
          event: 'Housing asks for status on property 27A',
          observation: 'Sarah (Housing Manager) calls Tom: "Where are we with 27A? It\'s been 3 weeks." Tom has to manually reconstruct timeline from memory + check multiple systems. Takes 10 minutes to respond.',
          baNote: 'No status log accessible to Repairs. Rework + friction with Housing.',
        },
      ],
      summary: [
        'Repairs switches between multiple channels for every property (fragmentation)',
        'No clear material guidance (tribal knowledge risk)',
        'Crew availability not visible to Repairs (scheduling friction)',
        'Process doesn\'t scale (missed re-let dates weekly)',
        'No status log for retrospective queries (rework)',
      ],
    },
    slackUpdate: [
      'Completed first pass of the As-Is and identified key gaps:',
      '• Manual inspection-to-repair handover not aligned with current void complexity.',
      '• Void completion loop has no feedback path.',
      '• Repairs workload increases as void volume scales.',
      'Drafting To-Be direction focused on streamlined handover + feedback loop + Repairs clarity.',
      'Will validate with Housing + Repairs tomorrow.',
    ],
    exampleNarrative: {
      asIs: '"Void processes run on manual handovers; work orders happen in spreadsheets; Repairs escalates via phone; rent loss increases when void queue spikes."',
      gap: '"Design assumed simple workflow, but void complexity evolved. Process stayed manual, Repairs invented workarounds, feedback never informed future voids."',
      whyMatters: '"Without streamlined handover, we pay twice — rent loss and families waiting. Repairs morale erodes; budget pressure grows."',
      toBe: '"Solution: Streamlined handover system that adapts to void complexity. Requirements: System must automate handovers between teams, embed feedback loops to inform future voids, provide Repairs interface that guides work orders, and build rent recovery guardrails into the process."',
    },
    taskPlaceholder: 'Capture your As-Is narrative, gap explanation, why it matters, and the direction of the To-Be...',
  },
};
