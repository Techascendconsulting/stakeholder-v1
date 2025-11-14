import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page8TestScenario {
  id: string;
  title: string;
  color: string;
  borderColor: string;
  bgColor: string;
  testData: string;
  expectedScore: string;
  steps: string[];
  passCriteria: string;
}

export interface Page8Metric {
  kpi: string;
  baseline: string;
  current: string;
  interpretation: string;
}

export interface Page8Data {
  sprint: string;
  ticketId: string;
  uatContext: {
    whatBeingTested: string;
    whoTests: string;
    successCriteria: string;
  };
  testScenarios: Page8TestScenario[];
  uatFeedback: {
    stakeholderName: string;
    stakeholderEmail: string;
    stakeholderRole: string;
    subject: string;
    issueDescription: string;
    whyItMatters: string;
  };
  metrics: Page8Metric[];
  handover: {
    decisionLogQuestion: string;
    hint: string;
    thresholds: string;
    sla: string;
  };
  slackUpdate: string[];
}

export const PAGE_8_DATA: Record<BAInActionProject, Page8Data> = {
  cif: {
    sprint: 'Sprint 12',
    ticketId: 'US-142',
    uatContext: {
      whatBeingTested: 'US-142 (Risk-Based Verification) deployed to staging',
      whoTests: 'Marie (Compliance), James (Ops), Ben (PO)',
      successCriteria: 'AC met, no critical bugs, KPIs moving in right direction',
    },
    testScenarios: [
      {
        id: 'SCENARIO 1',
        title: 'High Confidence Auto-Approve (AC01)',
        color: 'bg-green-600',
        borderColor: 'border-green-300',
        bgColor: 'bg-green-50/30',
        testData: 'Test account "test_user_high_trust@example.com" with clean history, verified device',
        expectedScore: '≥ 85',
        steps: [
          'User completes sign-up form in staging',
          'System calculates risk score',
          'Verify account approved automatically (no manual review)',
          'Check audit log shows: timestamp, decision ("approved"), score (≥85)',
        ],
        passCriteria: 'Account approved within 2 seconds, no Ops queue entry, audit log complete',
      },
      {
        id: 'SCENARIO 2',
        title: 'High Risk Auto-Block (AC02)',
        color: 'bg-red-600',
        borderColor: 'border-red-300',
        bgColor: 'bg-red-50/30',
        testData: 'Test account "test_user_fraud_risk@example.com" with suspicious IP, previous fraud flags',
        expectedScore: '≤ 30',
        steps: [
          'User completes sign-up form',
          'System calculates risk score',
          'Verify account creation fails',
          'Verify generic error message (NOT revealing fraud logic)',
          'Check fraud audit log flags this case',
        ],
        passCriteria: 'Account blocked, error: "Unable to complete registration. Please contact support.", flagged in audit',
      },
      {
        id: 'SCENARIO 3',
        title: 'Manual Review Queue (AC03)',
        color: 'bg-amber-600',
        borderColor: 'border-amber-300',
        bgColor: 'bg-amber-50/30',
        testData: 'Test account "test_user_mid_risk@example.com" with mixed signals',
        expectedScore: '31-84',
        steps: [
          'User completes sign-up form',
          'System calculates risk score',
          'Verify case appears in Ops review queue',
          'Check evidence summary shows: IP, email domain, device fingerprint, fraud flags',
          'Verify user sees "Verification in progress" message',
          'Verify 24h SLA timer started',
        ],
        passCriteria: 'Ops queue entry created, evidence fields populated, SLA active, user notified',
      },
    ],
    uatFeedback: {
      stakeholderName: 'Marie Dupont (Compliance)',
      stakeholderEmail: 'marie.dupont@company.co.uk',
      stakeholderRole: 'Compliance',
      subject: 'UAT Feedback - US-142 Scenario 3 Issue',
      issueDescription: 'evidence summary is missing the "previous fraud flags" field',
      whyItMatters: 'For regulatory compliance, we need to show all risk signals that contributed to the decision. Without fraud flags visible, Ops can\'t make fully informed decisions, and we may not pass audit.',
    },
    metrics: [
      {
        kpi: 'Fraud Loss £/week',
        baseline: '£48,000/week',
        current: '£33,400/week',
        interpretation: '↓ 30% — Target met (30% reduction)',
      },
      {
        kpi: 'Manual Review Rate %',
        baseline: '12%',
        current: '7%',
        interpretation: '↓ 42% — Ops workload reduced significantly',
      },
      {
        kpi: 'Checkout Drop-off %',
        baseline: '9%',
        current: '6%',
        interpretation: '↓ 33% — Conversion protected (target: ≥95% baseline)',
      },
    ],
    handover: {
      decisionLogQuestion: 'Why are thresholds 85/30? Why 24h SLA?',
      hint: 'Reference Compliance requirements (Day 3), business case (Day 1), and requirements (Day 5).',
      thresholds: '85/30',
      sla: '24h',
    },
    slackUpdate: [
      'UAT complete for US-142. All scenarios passed after fraud flags fix.',
      'Metrics validated: Fraud ↓30%, manual reviews ↓42%, conversion protected.',
      'Handover pack delivered to BAU team (runbook, decision log, KPI dashboard).',
      'Handover session scheduled for Thursday 2pm.',
      'US-142 officially closed. Project objectives met.',
    ],
  },
  voids: {
    sprint: 'Sprint 8',
    ticketId: 'US-156',
    uatContext: {
      whatBeingTested: 'US-156 (Streamlined Void-to-Re-let Process) deployed to staging',
      whoTests: 'Tom (Repairs), Sarah (Housing), Sarah Thompson (PO)',
      successCriteria: 'AC met, no critical bugs, KPIs moving in right direction',
    },
    testScenarios: [
      {
        id: 'SCENARIO 1',
        title: 'Auto-Approve Ready Properties (AC01)',
        color: 'bg-green-600',
        borderColor: 'border-green-300',
        bgColor: 'bg-green-50/30',
        testData: 'Test property "PROP-12345" with all checks passed, void status = "ready"',
        expectedScore: 'All checks passed',
        steps: [
          'Property inspection completed in staging',
          'System evaluates void status and checks',
          'Verify property approved for re-let automatically (no additional steps)',
          'Check decision log shows: timestamp, decision ("ready"), property ID, status',
        ],
        passCriteria: 'Property approved within 2 seconds, no Repairs queue entry, decision log complete',
      },
      {
        id: 'SCENARIO 2',
        title: 'Block Unsafe Properties (AC02)',
        color: 'bg-red-600',
        borderColor: 'border-red-300',
        bgColor: 'bg-red-50/30',
        testData: 'Test property "PROP-67890" with safety hazards identified, void status = "blocked"',
        expectedScore: 'Safety issues detected',
        steps: [
          'Property inspection completed',
          'System identifies safety hazards',
          'Verify property flagged and cannot proceed to re-let',
          'Verify work order created with safety requirements',
          'Check decision log flags this case',
        ],
        passCriteria: 'Property blocked, work order created, flagged in log, cannot proceed to re-let',
      },
      {
        id: 'SCENARIO 3',
        title: 'Repairs Queue Routing (AC03)',
        color: 'bg-amber-600',
        borderColor: 'border-amber-300',
        bgColor: 'bg-amber-50/30',
        testData: 'Test property "PROP-11111" with repairs pending, void status = "in-progress"',
        expectedScore: 'Repairs needed',
        steps: [
          'Property inspection completed',
          'System identifies work needed',
          'Verify case appears in Repairs queue',
          'Check work order details show: property ID, inspection photos, material requirements, access arrangements',
          'Verify 7-day SLA timer started',
        ],
        passCriteria: 'Repairs queue entry created, work order fields populated, SLA active',
      },
    ],
    uatFeedback: {
      stakeholderName: 'Tom Richards (Repairs Lead)',
      stakeholderEmail: 'tom.richards@company.co.uk',
      stakeholderRole: 'Repairs',
      subject: 'UAT Feedback - US-156 Scenario 3 Issue',
      issueDescription: 'work order details are missing the "access arrangements" field',
      whyItMatters: 'For repairs scheduling, we need to know access arrangements (tenant keys, appointment times, special instructions). Without this visible, Repairs can\'t schedule efficiently, and we may miss SLA targets.',
    },
    metrics: [
      {
        kpi: 'Average Void Days',
        baseline: '45 days',
        current: '28 days',
        interpretation: '↓ 38% — Target met (21-day target, on track)',
      },
      {
        kpi: 'Repairs Queue Size',
        baseline: '35 properties',
        current: '18 properties',
        interpretation: '↓ 49% — Repairs workload reduced significantly',
      },
      {
        kpi: 'Rent Loss £/week',
        baseline: '£23,000/week',
        current: '£14,200/week',
        interpretation: '↓ 38% — Rent recovery improved (target: reduce by 30%)',
      },
    ],
    handover: {
      decisionLogQuestion: 'Why are decision states ready/needs work/quality check? Why 7-day SLA?',
      hint: 'Reference Housing requirements (Day 3), business case (Day 1), and requirements (Day 5).',
      thresholds: 'ready/needs work/quality check',
      sla: '7-day',
    },
    slackUpdate: [
      'UAT complete for US-156. All scenarios passed after access arrangements fix.',
      'Metrics validated: Void days ↓38%, repairs queue ↓49%, rent loss ↓38%.',
      'Handover pack delivered to BAU team (runbook, decision log, KPI dashboard).',
      'Handover session scheduled for Thursday 2pm.',
      'US-156 officially closed. Project objectives met.',
    ],
  },
};


