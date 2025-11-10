import { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page2Data {
  meetingTitle: string;
  meetingContext: string;
  
  // Initial meeting notes from Day 1
  initialMeetingNotes: string;
  
  // Meeting attendees with speaking indicators
  attendees: Array<{
    name: string;
    color: string;
    speaking: boolean;
    quote: string;
  }>;
  
  // Stakeholder quotes from the meeting
  stakeholderQuotes: Array<{
    name: string;
    role: string;
    quote: string;
  }>;
  
  // Meeting transcript
  transcript: Array<{
    speaker: string;
    avatar: string;
    quote: string;
  }>;
  
  // Key insights to extract
  keyInsights: {
    symptoms: string[];
    tensions: string[];
    gaps: string[];
  };
  
  // Example problem statement
  exampleProblemStatement: string;
  
  // Follow-up questions
  followUpQuestions: string[];
  
  // Engagement plan guidance
  engagementPlanGuidance: {
    whoToEngage: Array<{ person: string; why: string; when: string }>;
    dataNeeded: string[];
  };
}

export const PAGE_2_DATA: Record<BAInActionProject, Page2Data> = {
  cif: {
    meetingTitle: 'CI&F Intro Call',
    meetingContext: 'Promo periods drove fraud up +17%. Manual review queue breaching 24h SLA.',
    
    initialMeetingNotes: `• Fraud increased mainly during promotional periods.\n• Ops backlog is causing SLA breaches.\n• Compliance wants stronger audit trails.\n• PO is worried about conversion dropping if checks get too aggressive.`,
    
    attendees: [
      { name: 'Ben (PO)', color: 'from-blue-500 to-blue-700', speaking: true, quote: 'Board needs movement on fraud + conversion.' },
      { name: 'Marie (Compliance)', color: 'from-purple-500 to-purple-700', speaking: true, quote: 'Audit trail gaps are serious.' },
      { name: 'James (Ops)', color: 'from-orange-500 to-orange-700', speaking: true, quote: 'Queue is drowning us.' },
      { name: 'You (BA)', color: 'from-green-500 to-green-700', speaking: false, quote: '' },
    ],
    
    stakeholderQuotes: [
      { name: 'Ben Carter', role: 'Product Owner', quote: 'Need fraud losses down, but conversion must stay ≥95%.' },
      { name: 'Marie Dupont', role: 'Compliance', quote: 'Every decision needs audit trail. FCA will ask for evidence.' },
      { name: 'James Walker', role: 'Operations Manager', quote: "We're breaching SLA daily. Manual review queue hits 200+ cases." },
    ],
    
    transcript: [
      { speaker: 'Ben (PO)', avatar: 'bg-blue-600', quote: "We've got a board meeting next month. They want to see fraud numbers down and conversion stable. Right now we're hemorrhaging money on chargebacks." },
      { speaker: 'Marie (Compliance)', avatar: 'bg-purple-600', quote: "FCA audited us last quarter. They flagged our verification process as 'insufficient audit trail.' We need to show who approved what, when, and why." },
      { speaker: 'James (Ops)', avatar: 'bg-orange-600', quote: "My team is drowning. Manual review queue is hitting 200 cases a day. We're breaching 24-hour SLA constantly. People are burnt out." },
      { speaker: 'You (BA)', avatar: 'bg-green-600', quote: "Can I clarify — when you say fraud is up 17%, is that across all channels or specific to promo periods?" },
      { speaker: 'Ben (PO)', avatar: 'bg-blue-600', quote: "Good question. It spikes during Black Friday, flash sales — basically anything with discounts. Normal periods are fine." },
      { speaker: 'You (BA)', avatar: 'bg-green-600', quote: "And when manual review cases breach SLA, what happens? Do they auto-approve or stay in queue?" },
      { speaker: 'James (Ops)', avatar: 'bg-orange-600', quote: "They stay in queue. We never auto-approve. But customers get frustrated and some abandon checkout." },
      { speaker: 'You (BA)', avatar: 'bg-green-600', quote: "Marie, what specifically does FCA need to see in the audit trail?" },
      { speaker: 'Marie (Compliance)', avatar: 'bg-purple-600', quote: "Decision outcome, risk score that triggered it, which data points contributed, timestamp, and who reviewed it if manual. All of that, for 7 years." },
    ],
    
    keyInsights: {
      symptoms: [
        'Fraud ↑ 17% during promotional periods',
        'Manual review queue breaching 24h SLA daily',
        'Insufficient audit trail for FCA compliance',
        'Customer abandonment when cases breach SLA',
      ],
      tensions: [
        'Conflicting priorities (fraud vs conversion vs compliance vs ops capacity)',
        "Promo periods create spikes that Ops can't handle",
        "Compliance needs evidence trails that don't exist today",
      ],
      gaps: [
        'Where data is missing (need fraud breakdown by channel, exact SLA metrics)',
        'What triggers manual review vs auto-decision?',
        'How do we define "suspicious" behavior?',
      ],
    },
    
    exampleProblemStatement: `We are seeing <strong>fraud losses up +17% QoQ (£48k per week)</strong> and <strong>audit exposure on account verification</strong> in <strong>checkout and account flows</strong>, driven by <strong>promotional spikes overwhelming static verification rules and manual review capacity</strong>, causing <strong>24h SLA breaches (68% on-time) and customer abandonment</strong>. Without adaptive risk-based verification and audit-compliant decision logging, we risk regulatory penalties and continued fraud loss.`,
    
    followUpQuestions: [
      'What percentage of fraud happens during promo vs normal periods?',
      "What's the current manual review acceptance rate? (approve/reject ratio)",
      'Which data points does the current verification check? (email domain, IP, device fingerprint?)',
      'What happens to abandoned cases? Do they eventually get reviewed or timeout?',
      'Does Compliance have a template for what the audit log should contain?',
    ],
    
    engagementPlanGuidance: {
      whoToEngage: [
        { person: 'James (Ops)', why: 'Shadow manual review process, understand queue dynamics', when: 'This week' },
        { person: 'Marie (Compliance)', why: 'Get exact FCA audit requirements and log format', when: 'This week' },
        { person: 'Data/Analytics', why: 'Get fraud breakdown by channel, promo vs normal periods', when: 'Next week' },
        { person: 'Dev Team', why: 'Understand current verification logic and constraints', when: 'Next week' },
      ],
      dataNeeded: [
        'Fraud loss £ by month for last 12 months (broken down by promo vs normal)',
        'Manual review queue metrics (volume, SLA performance, approval rate)',
        'Verification rule logic (what triggers auto-approve, auto-reject, manual review)',
        'Customer abandonment rate when review exceeds 24h',
      ],
    },
  },
  
  voids: {
    meetingTitle: 'Voids Programme Kickoff',
    meetingContext: 'Average 45 days to turn around void properties. Costing £1.2M/year in lost rent.',
    
    initialMeetingNotes: `• Void turnaround averaging 45 days (target is 21 days).\n• Repairs team saying work orders are unclear and often wrong.\n• Finance tracking costs manually in spreadsheets.\n• Properties sitting empty while waiting for minor repairs.`,
    
    attendees: [
      { name: 'Sarah (Housing)', color: 'from-blue-500 to-blue-700', speaking: true, quote: "Council leader is asking why we're losing £1.2M." },
      { name: 'Tom (Repairs)', color: 'from-orange-500 to-orange-700', speaking: true, quote: "Work orders don't match reality." },
      { name: 'Rachel (Finance)', color: 'from-green-500 to-green-700', speaking: true, quote: 'No visibility on costs per void.' },
      { name: 'You (BA)', color: 'from-purple-500 to-purple-700', speaking: false, quote: '' },
    ],
    
    stakeholderQuotes: [
      { name: 'Sarah Thompson', role: 'Housing Services Manager', quote: '45-day turnaround is unacceptable. Tenants are waiting, costs are mounting.' },
      { name: 'Tom Richards', role: 'Repairs Team Lead', quote: "We get to site and find issues that weren't on the work order. Wasted trips." },
      { name: 'Rachel Green', role: 'Finance Business Partner', quote: "I can't forecast void costs because we don't track them properly." },
    ],
    
    transcript: [
      { speaker: 'Sarah (Housing)', avatar: 'bg-blue-600', quote: "Council leader is on my case. We've got 200+ void properties at any time. At £18 lost rent per day, that's £1.2M a year we're throwing away." },
      { speaker: 'Tom (Repairs)', avatar: 'bg-orange-600', quote: "The problem is the inspection process. Property officer walks through, writes 'kitchen needs work' on a form. My guys turn up and find the boiler's broken, electrics need rewiring — stuff that wasn't flagged." },
      { speaker: 'Rachel (Finance)', avatar: 'bg-green-600', quote: "I'm tracking void costs in Excel. Different teams using different systems. I can't even tell you cost per void accurately." },
      { speaker: 'You (BA)', avatar: 'bg-purple-600', quote: "Tom, when you say the work order doesn't match reality — how often does that happen?" },
      { speaker: 'Tom (Repairs)', avatar: 'bg-orange-600', quote: "At least 40% of the time. We either need to come back with different materials or escalate to another contractor. Adds days, sometimes weeks." },
      { speaker: 'You (BA)', avatar: 'bg-purple-600', quote: "Sarah, what causes the delays between tenant move-out and inspection?" },
      { speaker: 'Sarah (Housing)', avatar: 'bg-blue-600', quote: "Honestly? Property officers are stretched thin. They've got 300 properties each. Inspections get scheduled 5-7 days after move-out, sometimes longer." },
      { speaker: 'You (BA)', avatar: 'bg-purple-600', quote: "Rachel, if we could reduce void days from 45 to 21, what would that mean financially?" },
      { speaker: 'Rachel (Finance)', avatar: 'bg-green-600', quote: "That's halving the problem. £600k saved per year. But I need to track this properly to show ROI to the council." },
    ],
    
    keyInsights: {
      symptoms: [
        'Average 45-day void turnaround (target: 21 days)',
        'Poor inspection quality causing rework and wasted trips',
        'Manual cost tracking in spreadsheets (no system integration)',
        'Property officers stretched thin (300 properties each)',
      ],
      tensions: [
        'Speed vs quality (quick inspections miss issues, causing rework)',
        'Repairs team frustrated by inaccurate work orders',
        "Finance can't prove ROI without proper cost tracking",
      ],
      gaps: [
        'What causes delay between move-out and inspection? (5-7 days)',
        "What's the rework rate? (Tom says 40%, need to validate)",
        'Which void types take longest? (repairs vs cleaning vs compliance)',
      ],
    },
    
    exampleProblemStatement: `We are seeing <strong>average 45-day void turnaround (costing £1.2M/year in lost rent)</strong> across <strong>200+ properties</strong>, driven by <strong>poor initial inspection quality (40% rework rate), 5-7 day inspection delays, and manual cost tracking</strong>, causing <strong>budget unpredictability and tenant waiting lists growing</strong>. Without standardized inspection checklists, automated work order routing, and integrated cost tracking, we can't reduce void days or demonstrate ROI to the council.`,
    
    followUpQuestions: [
      "What's the breakdown of 45 days? (inspection delay, repair time, handover, etc.)",
      'What causes the 40% rework rate? Is it specific property types or inspectors?',
      'How do property officers currently prioritize which voids to inspect first?',
      'What systems do repairs, finance, and housing currently use? Can they integrate?',
      'Are there "quick win" voids that could be turned around faster? (cosmetic only, no major repairs)',
    ],
    
    engagementPlanGuidance: {
      whoToEngage: [
        { person: 'Tom (Repairs)', why: 'Shadow a site visit, understand work order gaps', when: 'This week' },
        { person: 'Property Officers', why: 'Understand inspection process and constraints', when: 'This week' },
        { person: 'Rachel (Finance)', why: 'Get current cost tracking method and requirements', when: 'Next week' },
        { person: 'Housing System Admin', why: 'Understand system capabilities and constraints', when: 'Next week' },
      ],
      dataNeeded: [
        'Void turnaround time breakdown (inspection delay, repair time, sign-off)',
        'Rework rate by property type and repair category',
        'Cost per void by type (repairs, cleaning, compliance)',
        'Property officer workload distribution (how many voids per officer)',
      ],
    },
  },
};

