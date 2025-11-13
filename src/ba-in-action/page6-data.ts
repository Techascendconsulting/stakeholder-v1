import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page6Traceability {
  outcome: string;
  requirement: string;
  measure: string;
}

export interface Page6ConfluenceComment {
  author: string;
  time: string;
  content: string;
}

export interface Page6Data {
  intentExample: string;
  functionalTruths: string[];
  requirements: string[];
  acceptanceCriteria: string[];
  traceability: Page6Traceability[];
  userStory: string;
  confluencePage: {
    title: string;
    sprint: string;
    intent: string;
    functionalTruths: string[];
    decisionStates: Array<{
      state: string;
      description: string;
    }>;
    acceptanceCriteria: Array<{
      id: string;
      title: string;
      items: string[];
    }>;
    comments: Page6ConfluenceComment[];
  };
  slackUpdate: string[];
  exampleContent: {
    intent: string;
    functionalTruths: string[];
    decisionStates: Array<{
      state: string;
      description: string;
    }>;
    userStory: {
      id: string;
      title: string;
      as: string;
      want: string;
      so: string;
    };
    acceptanceCriteria: Array<{
      id: string;
      title: string;
      items: string[];
    }>;
    traceability: Page6Traceability[];
  };
  taskPlaceholder: string;
}

export const PAGE_6_DATA: Record<BAInActionProject, Page6Data> = {
  cif: {
    intentExample: 'We want to reduce fraudulent account creation while keeping customer sign-up smooth for legitimate users.',
    functionalTruths: [
      'Not all users share the same risk level.',
      'Identity signals come from multiple sources.',
      'Manual review queues grow when the model is unsure.',
      'Ops capacity is finite.',
    ],
    requirements: [
      'The system must evaluate identity risk at account creation, high-value checkout, and change of delivery address.',
      'The system must output one of three decision states: approve automatically, block automatically, send to manual review.',
      'Decision logic must be explainable for audit purposes.',
      'Manual review decisions must feed back into the scoring model within 24 hours.',
    ],
    acceptanceCriteria: [
      'AC01: When risk score ≥ threshold_A, account is approved with no manual step.',
      'AC02: When risk score ≤ threshold_C, account is blocked and flagged for audit.',
      'AC03: When threshold_C < risk score < threshold_A, case routes to manual review queue.',
      'AC04: Manual review outcome updates the risk model within 24 hours.',
      'AC05: All decisions are logged with timestamp, decision reason, and source signals.',
    ],
    traceability: [
      { outcome: 'Reduce fraud', requirement: 'AC02, AC04', measure: 'Fraud loss £/week' },
      { outcome: 'Reduce manual workload', requirement: 'AC03, AC04', measure: 'Review queue size/aging' },
      { outcome: 'Protect conversion', requirement: 'AC01', measure: 'Checkout success %' },
    ],
    userStory: `As a Risk Engine
I want to classify identity verification outcomes into approve / block / review
So that we reduce fraud while minimising manual workload and customer friction.`,
    confluencePage: {
      title: 'US-142: Risk-Based Identity Verification',
      sprint: 'Sprint 3',
      intent: 'Reduce fraudulent account creation while keeping customer sign-up smooth for legitimate users.',
      functionalTruths: [
        'Not all users share the same risk level',
        'Identity signals come from multiple sources (IP, email domain, device fingerprint, address history)',
        'Manual review capacity is finite (Ops can handle ~200 cases/day)',
        'Audit proof required for regulatory compliance (FCA rules)',
      ],
      decisionStates: [
        {
          state: 'Approve automatically',
          description: 'Risk score ≥ 85. Customer proceeds immediately.',
        },
        {
          state: 'Block automatically',
          description: 'Risk score ≤ 30. Account creation fails with generic message.',
        },
        {
          state: 'Manual review',
          description: 'Risk score 31–84. Case routed to Ops queue with evidence summary.',
        },
      ],
      acceptanceCriteria: [
        {
          id: 'AC01',
          title: 'Auto-Approve High Confidence',
          items: [
            'Risk score is ≥ 85',
            'Account is approved automatically',
            'No manual review is triggered',
            'Decision is logged with timestamp and score',
          ],
        },
        {
          id: 'AC02',
          title: 'Auto-Block High Risk',
          items: [
            'Risk score is ≤ 30',
            'Account creation fails',
            'Generic error message is shown to user',
            'Case is flagged for fraud audit',
            'Decision is logged',
          ],
        },
        {
          id: 'AC03',
          title: 'Manual Review Queue',
          items: [
            'Risk score is between 31–84',
            'Case routes to Ops queue with evidence summary',
            'User sees "verification in progress" message',
            'SLA timer starts (24h target)',
          ],
        },
      ],
      comments: [
        {
          author: 'Alicia Chen (Dev Lead)',
          time: 'Yesterday, 4:15 PM',
          content: 'Quick question on AC03: You mention "evidence summary" — can you specify exactly which fields? We need to know what to pull from the risk engine API.',
        },
        {
          author: 'You (BA)',
          time: 'Yesterday, 4:45 PM',
          content: 'Good catch, Alicia. Evidence summary should include: IP address, email domain, device fingerprint, previous fraud flags. I\'ve updated AC03 above to make this explicit. Does that work?',
        },
        {
          author: 'Alicia Chen (Dev Lead)',
          time: 'Yesterday, 5:02 PM',
          content: 'Perfect. That\'s what I needed. We can pull all of those from the risk engine. Marking this as ready for sprint.',
        },
      ],
    },
    slackUpdate: [
      'Drafted requirements and acceptance criteria for identity verification logic.',
      'Defined decision states (approve / block / review) and linked them to fraud reduction + conversion protection targets.',
      'Prepared traceability matrix for stakeholder review.',
      'Will walk PO + Compliance through the decision boundaries before detailing screen flows.',
    ],
    exampleContent: {
      intent: '"We want to reduce fraudulent account creation while keeping customer sign-up smooth for legitimate users."',
      functionalTruths: [
        'Not all users share the same risk level',
        'Identity signals come from multiple sources (IP, email domain, device fingerprint, address history)',
        'Manual review capacity is finite (Ops can handle ~200 cases/day)',
        'Audit proof required for regulatory compliance (FCA rules)',
      ],
      decisionStates: [
        {
          state: 'Approve automatically',
          description: 'Risk score ≥ 85. Customer proceeds immediately.',
        },
        {
          state: 'Block automatically',
          description: 'Risk score ≤ 30. Account creation fails with generic message (fraud prevention).',
        },
        {
          state: 'Manual review',
          description: 'Risk score 31–84. Case routed to Ops queue with evidence summary.',
        },
      ],
      userStory: {
        id: 'US-142',
        title: 'Risk-Based Identity Verification',
        as: 'As a Risk Engine',
        want: 'I want to classify identity verification outcomes into approve / block / review',
        so: 'So that we reduce fraud while minimizing manual workload and customer friction.',
      },
      acceptanceCriteria: [
        {
          id: 'AC01',
          title: 'Auto-Approve High Confidence',
          items: [
            'User completes sign-up form',
            'Risk score is ≥ 85',
            'Account is approved automatically',
            'No manual review is triggered',
            'Decision is logged with timestamp and score',
          ],
        },
        {
          id: 'AC02',
          title: 'Auto-Block High Risk',
          items: [
            'User completes sign-up form',
            'Risk score is ≤ 30',
            'Account creation fails',
            'Generic error message is shown (no fraud signal revealed)',
            'Case is flagged for fraud audit',
            'Decision is logged',
          ],
        },
        {
          id: 'AC03',
          title: 'Manual Review Queue',
          items: [
            'User completes sign-up form',
            'Risk score is between 31–84',
            'Case routes to Ops manual review queue with evidence summary (IP, email domain, device signals)',
            'User sees "verification in progress" message',
            'SLA timer starts (24h target)',
          ],
        },
        {
          id: 'AC04',
          title: 'Feedback Loop',
          items: [
            'Ops completes a manual review',
            'Decision is made (approve/reject)',
            'Outcome feeds back into risk model within 24 hours',
            'Future scoring accuracy is improved',
          ],
        },
        {
          id: 'AC05',
          title: 'Audit Trail',
          items: [
            'Any verification decision is made',
            'Record includes timestamp, decision (approve/block/review), risk score',
            'Input signals used are logged',
            'Outcome (if reviewed) is recorded',
            'Record is retained for 7 years (regulatory requirement)',
          ],
        },
      ],
      traceability: [
        { outcome: 'Reduce fraud', requirement: 'AC02, AC04', measure: 'Fraud loss £/week' },
        { outcome: 'Reduce manual workload', requirement: 'AC01, AC03, AC04', measure: 'Review queue size' },
        { outcome: 'Protect conversion', requirement: 'AC01', measure: 'Sign-up success %' },
      ],
    },
    taskPlaceholder: 'Draft your intent, truths, decision states, and acceptance criteria here...',
  },
  voids: {
    intentExample: 'We want to reduce void turnaround time while ensuring properties are safe and ready for new tenants.',
    functionalTruths: [
      'Not all voids have the same repair complexity.',
      'Property information comes from multiple sources (inspection reports, repairs history, photos).',
      'Repairs crew capacity is finite (can handle ~15 properties/week).',
      'Health and safety checks are non-negotiable (regulatory requirement).',
    ],
    requirements: [
      'The system must evaluate void readiness at inspection completion, repairs completion, and final sign-off.',
      'The system must output one of three decision states: ready for re-let, needs more work, send to quality check.',
      'Decision logic must be traceable for audit purposes.',
      'Completed void outcomes must feed back into the process within 24 hours.',
    ],
    acceptanceCriteria: [
      'AC01: When void status = "ready" and all checks passed, property is approved for re-let with no additional steps.',
      'AC02: When void status = "blocked" due to safety issues, property is flagged and cannot proceed to re-let.',
      'AC03: When void status = "in-progress" with repairs pending, case routes to Repairs queue with work order details.',
      'AC04: Completed void outcome updates the process tracking within 24 hours.',
      'AC05: All decisions are logged with timestamp, decision reason, and property details.',
    ],
    traceability: [
      { outcome: 'Reduce void days', requirement: 'AC01, AC04', measure: 'Average void days' },
      { outcome: 'Reduce repairs workload', requirement: 'AC03, AC04', measure: 'Repairs queue size/aging' },
      { outcome: 'Protect rent recovery', requirement: 'AC01', measure: 'Rent loss £/week' },
    ],
    userStory: `As a Void Management System
I want to classify void properties into ready / needs work / quality check
So that we reduce void turnaround time while minimising repairs workload and ensuring tenant safety.`,
    confluencePage: {
      title: 'US-156: Streamlined Void-to-Re-let Process',
      sprint: 'Sprint 3',
      intent: 'Reduce void turnaround time while ensuring properties are safe and ready for new tenants.',
      functionalTruths: [
        'Not all voids have the same repair complexity',
        'Property information comes from multiple sources (inspection reports, repairs history, photos)',
        'Repairs crew capacity is finite (can handle ~15 properties/week)',
        'Health and safety checks are non-negotiable (regulatory requirement)',
      ],
      decisionStates: [
        {
          state: 'Ready for re-let',
          description: 'All checks passed, repairs complete. Property can be listed immediately.',
        },
        {
          state: 'Needs more work',
          description: 'Safety issues or major repairs required. Property cannot proceed to re-let.',
        },
        {
          state: 'Quality check',
          description: 'Minor repairs pending or inspection needed. Case routed to Repairs queue with work order.',
        },
      ],
      acceptanceCriteria: [
        {
          id: 'AC01',
          title: 'Auto-Approve Ready Properties',
          items: [
            'Inspection is completed',
            'Void status = "ready" and all checks passed',
            'Property is approved for re-let automatically',
            'No additional steps required',
            'Decision is logged with timestamp and status',
          ],
        },
        {
          id: 'AC02',
          title: 'Block Unsafe Properties',
          items: [
            'Inspection identifies hazards',
            'Void status = "blocked" due to safety issues',
            'Property is flagged and cannot proceed to re-let',
            'Work order is created with safety requirements',
            'Decision is logged',
          ],
        },
        {
          id: 'AC03',
          title: 'Repairs Queue Routing',
          items: [
            'Inspection identifies work needed',
            'Void status = "in-progress" with repairs pending',
            'Case routes to Repairs queue with work order details (property ID, photos, material requirements, access)',
            'SLA timer starts (7 days target)',
          ],
        },
      ],
      comments: [
        {
          author: 'Tom Richards (Repairs Lead)',
          time: 'Yesterday, 4:15 PM',
          content: 'Quick question on AC03: You mention "work order details" — can you specify exactly which fields? We need to know what to pull from the inspection system.',
        },
        {
          author: 'You (BA)',
          time: 'Yesterday, 4:45 PM',
          content: 'Good catch, Tom. Work order details should include: property ID, inspection photos, material requirements, access arrangements, priority level. I\'ve updated AC03 above to make this explicit. Does that work?',
        },
        {
          author: 'Tom Richards (Repairs Lead)',
          time: 'Yesterday, 5:02 PM',
          content: 'Perfect. That\'s what I needed. We can pull all of those from the inspection system. Marking this as ready for sprint.',
        },
      ],
    },
    slackUpdate: [
      'Drafted requirements and acceptance criteria for void-to-re-let process.',
      'Defined decision states (ready / needs work / quality check) and linked them to void reduction + rent recovery targets.',
      'Prepared traceability matrix for stakeholder review.',
      'Will walk Housing + Repairs through the decision boundaries before detailing workflow steps.',
    ],
    exampleContent: {
      intent: '"We want to reduce void turnaround time while ensuring properties are safe and ready for new tenants."',
      functionalTruths: [
        'Not all voids have the same repair complexity',
        'Property information comes from multiple sources (inspection reports, repairs history, photos)',
        'Repairs crew capacity is finite (can handle ~15 properties/week)',
        'Health and safety checks are non-negotiable (regulatory requirement)',
      ],
      decisionStates: [
        {
          state: 'Ready for re-let',
          description: 'All checks passed, repairs complete. Property can be listed immediately.',
        },
        {
          state: 'Needs more work',
          description: 'Safety issues or major repairs required. Property cannot proceed to re-let.',
        },
        {
          state: 'Quality check',
          description: 'Minor repairs pending or inspection needed. Case routed to Repairs queue with work order.',
        },
      ],
      userStory: {
        id: 'US-156',
        title: 'Streamlined Void-to-Re-let Process',
        as: 'As a Void Management System',
        want: 'I want to classify void properties into ready / needs work / quality check',
        so: 'So that we reduce void turnaround time while minimizing repairs workload and ensuring tenant safety.',
      },
      acceptanceCriteria: [
        {
          id: 'AC01',
          title: 'Auto-Approve Ready Properties',
          items: [
            'Property inspection is completed',
            'Void status is "ready" and all checks passed',
            'Property is approved for re-let automatically',
            'No additional steps required',
            'Decision is logged with timestamp and status',
          ],
        },
        {
          id: 'AC02',
          title: 'Block Unsafe Properties',
          items: [
            'Property inspection is completed',
            'Void status is "blocked" due to safety issues',
            'Property is flagged and cannot proceed to re-let',
            'Work order is created with safety requirements',
            'Decision is logged',
          ],
        },
        {
          id: 'AC03',
          title: 'Repairs Queue Routing',
          items: [
            'Property inspection is completed',
            'Void status is "in-progress" with repairs pending',
            'Case routes to Repairs queue with work order details (property ID, photos, material requirements, access)',
            'SLA timer starts (7 days target)',
          ],
        },
        {
          id: 'AC04',
          title: 'Feedback Loop',
          items: [
            'Repairs completes work on a void property',
            'Work is signed off',
            'Outcome feeds back into void tracking within 24 hours',
            'Status is updated and future inspections are informed',
          ],
        },
        {
          id: 'AC05',
          title: 'Audit Trail',
          items: [
            'Any void decision is made',
            'Record includes timestamp, decision (ready/needs work/quality check), property ID',
            'Inspection details and repairs history are logged',
            'Record is retained for 7 years (regulatory requirement)',
          ],
        },
      ],
      traceability: [
        { outcome: 'Reduce void days', requirement: 'AC01, AC04', measure: 'Average void days' },
        { outcome: 'Reduce repairs workload', requirement: 'AC03, AC04', measure: 'Repairs queue size' },
        { outcome: 'Protect rent recovery', requirement: 'AC01', measure: 'Rent loss £/week' },
      ],
    },
    taskPlaceholder: 'Draft your intent, truths, decision states, and acceptance criteria here...',
  },
};

