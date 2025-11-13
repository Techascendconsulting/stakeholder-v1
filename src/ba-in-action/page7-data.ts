import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Page7JiraComment {
  author: string;
  authorInitials: string;
  time: string;
  content: string;
}

export interface Page7AcceptanceCriteria {
  id: string;
  title: string;
  color: string;
  borderColor: string;
  items: string[];
}

export interface Page7MeetingParticipant {
  initials: string;
  name: string;
  role: string;
  color: string;
}

export interface Page7MeetingMessage {
  participant: string;
  content: string;
}

export interface Page7Data {
  sprintContext: {
    sprint: string;
    team: string;
    tools: string;
  };
  jiraTicket: {
    id: string;
    title: string;
    storyPoints: string;
    description: {
      as: string;
      want: string;
      so: string;
    };
    businessContext: string;
    acceptanceCriteria: Page7AcceptanceCriteria[];
    attachment: string;
    comments: Page7JiraComment[];
  };
  sprintPlanning: {
    scene: string;
    participants: Page7MeetingParticipant[];
    messages: Page7MeetingMessage[];
  };
  standup: {
    scene: string;
    messages: Page7MeetingMessage[];
    jiraUpdate: {
      title: string;
      fields: Array<{ name: string; type: string }>;
      note: string;
    };
  };
  slackUpdate: string[];
  tasks: {
    jiraComment: {
      question: string;
      hint: string;
    };
    standupResponse: {
      scenario: string;
      hint: string;
    };
  };
}

export const PAGE_7_DATA: Record<BAInActionProject, Page7Data> = {
  cif: {
    sprintContext: {
      sprint: '2-week sprints. Currently in Sprint 12.',
      team: 'BA (you), 3 devs, 1 QA, 1 Scrum Master, PO (Ben Carter)',
      tools: 'Jira for backlog, Slack for daily comms, Confluence for docs',
    },
    jiraTicket: {
      id: 'US-142',
      title: 'Risk-Based Identity Verification',
      storyPoints: '8',
      description: {
        as: 'Risk Engine',
        want: 'classify identity verification outcomes into approve / block / review',
        so: 'we reduce fraud while minimizing manual workload and customer friction',
      },
      businessContext: 'Fraudulent account creation increased 17% QoQ. Current KYC creates 9% checkout drop-off. We need adaptive verification that protects conversion while reducing fraud.',
      acceptanceCriteria: [
        {
          id: 'AC01',
          title: 'Auto-Approve High Confidence',
          color: 'bg-green-50/50',
          borderColor: 'border-green-500',
          items: [
            'Risk score is ≥ 85',
            'Verification completes',
            'Account is approved automatically',
            'Decision is logged with timestamp',
          ],
        },
        {
          id: 'AC02',
          title: 'Auto-Block High Risk',
          color: 'bg-red-50/50',
          borderColor: 'border-red-500',
          items: [
            'Risk score is ≤ 30',
            'Verification completes',
            'Account creation fails',
            'Generic error message is shown to user',
            'Case is flagged for audit',
          ],
        },
        {
          id: 'AC03',
          title: 'Manual Review Queue',
          color: 'bg-amber-50/50',
          borderColor: 'border-amber-500',
          items: [
            'Risk score is between 31–84',
            'Verification completes',
            'Case routes to Ops queue with evidence summary',
            'User sees "verification in progress" message',
            '24h SLA timer starts',
          ],
        },
      ],
      attachment: 'Risk_Scoring_Logic_v2.pdf',
      comments: [
        {
          author: 'You (BA)',
          authorInitials: 'YOU',
          time: '2 days ago',
          content: 'Confirmed with Marie (Compliance): Thresholds align with FCA requirements. Audit trail must include timestamp, decision, score, and input signals.',
        },
        {
          author: 'Dev (Maria)',
          authorInitials: 'DM',
          time: '1 day ago',
          content: 'Question: What data fields go into the evidence summary for manual review cases?',
        },
      ],
    },
    sprintPlanning: {
      scene: 'Monday morning, 10am. Sprint 12 planning. BA presents US-142 to the team.',
      participants: [
        { initials: 'YOU', name: 'You (BA)', role: 'BA', color: 'bg-purple-600' },
        { initials: 'BC', name: 'Ben (PO)', role: 'PO', color: 'bg-orange-600' },
        { initials: 'DM', name: 'Dev (Maria)', role: 'Dev', color: 'bg-blue-600' },
        { initials: 'DT', name: 'Dev (Tom)', role: 'Dev', color: 'bg-blue-600' },
        { initials: 'QA', name: 'QA (Sarah)', role: 'QA', color: 'bg-green-600' },
      ],
      messages: [
        {
          participant: 'YOU',
          content: '"Okay, let\'s walk through US-142: Risk-Based Verification. The business problem: fraud is up 17%, but our current KYC causes 9% drop-off. We need smarter verification."',
        },
        {
          participant: 'YOU',
          content: '"Three decision states: auto-approve if score is 85 or higher, auto-block if 30 or lower, manual review for everything in between. The thresholds came from Compliance—they align with regulatory requirements."',
        },
        {
          participant: 'DM',
          content: '"Do we have the risk scoring API endpoint ready?"',
        },
        {
          participant: 'YOU',
          content: '"Yes, Data team confirmed it\'s live in staging. I\'ll add the endpoint docs to the Jira ticket after this call."',
        },
        {
          participant: 'QA',
          content: '"For AC03, how do we test the 24-hour SLA timer without waiting 24 hours?"',
        },
        {
          participant: 'YOU',
          content: '"Good question. We can use a test account with time-mocking, or we manually trigger the SLA flag in the database. I\'ll coordinate with you offline to set up test data."',
        },
        {
          participant: 'DT',
          content: '"I\'m estimating this at 8 story points. Complexity is medium—mainly integration work."',
        },
        {
          participant: 'BC',
          content: '"Great. This is our top priority for the sprint. Let\'s commit to US-142."',
        },
      ],
    },
    standup: {
      scene: 'Wednesday, 10am. Day 3 of Sprint 12. Dev is blocked on US-142.',
      messages: [
        {
          participant: 'DM',
          content: '"Yesterday I started on US-142. Today I\'m building the decision logic. Blocked: I need the exact threshold values for the evidence summary fields."',
        },
        {
          participant: 'YOU',
          content: '"Got it. The evidence summary needs: IP address, email domain, device fingerprint, and previous fraud flags. I\'ll update the Jira ticket with the exact field names by noon."',
        },
        {
          participant: 'DM',
          content: '"Perfect. I\'ll check Jira at noon and continue building."',
        },
      ],
      jiraUpdate: {
        title: 'Evidence Summary Fields (for AC03):',
        fields: [
          { name: 'ip_address', type: 'string' },
          { name: 'email_domain', type: 'string' },
          { name: 'device_fingerprint', type: 'string' },
          { name: 'previous_fraud_flags', type: 'array' },
        ],
        note: 'Confirmed with Data team. All fields available in staging DB.',
      },
    },
    slackUpdate: [
      'Sprint 12 planning complete. Committed to US-142 (Risk-Based Verification) as top priority.',
      'Dev started implementation. Unblocked data field questions—updated Jira with evidence summary spec.',
      'Coordinating with QA on test approach for SLA timer.',
      'US-142 on track for Sprint 12 completion.',
    ],
    tasks: {
      jiraComment: {
        question: 'What data fields go into the evidence summary for manual review cases?',
        hint: 'Day 5 mentioned IP address, email domain, device signals, and previous fraud flags.',
      },
      standupResponse: {
        scenario: 'In tomorrow\'s standup, QA (Sarah) says: "I\'m blocked on testing AC02. I don\'t know what \'generic error message\' should say to the user."',
        hint: 'Error message must NOT reveal fraud detection logic (security requirement).',
      },
    },
  },
  voids: {
    sprintContext: {
      sprint: '2-week sprints. Currently in Sprint 8.',
      team: 'BA (you), 2 devs, 1 QA, 1 Scrum Master, PO (Sarah Thompson)',
      tools: 'Jira for backlog, Teams for daily comms, Confluence for docs',
    },
    jiraTicket: {
      id: 'US-156',
      title: 'Streamlined Void-to-Re-let Process',
      storyPoints: '5',
      description: {
        as: 'Void Management System',
        want: 'classify void properties into ready / needs work / quality check',
        so: 'we reduce void turnaround time while minimizing repairs workload and ensuring tenant safety',
      },
      businessContext: 'Void periods average 45 days (target is 21 days). Rent loss is £1.2M annually. Repairs crews are double-booked 30% of the time. We need streamlined handover from inspection to repairs to re-let.',
      acceptanceCriteria: [
        {
          id: 'AC01',
          title: 'Auto-Approve Ready Properties',
          color: 'bg-green-50/50',
          borderColor: 'border-green-500',
          items: [
            'Inspection is completed',
            'Void status = "ready" and all checks passed',
            'Property is approved for re-let automatically',
            'Decision is logged with timestamp',
          ],
        },
        {
          id: 'AC02',
          title: 'Block Unsafe Properties',
          color: 'bg-red-50/50',
          borderColor: 'border-red-500',
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
          color: 'bg-amber-50/50',
          borderColor: 'border-amber-500',
          items: [
            'Inspection identifies work needed',
            'Void status = "in-progress" with repairs pending',
            'Case routes to Repairs queue with work order details (property ID, photos, material requirements, access)',
            '7-day SLA timer starts',
          ],
        },
      ],
      attachment: 'Void_Process_Flow_v2.pdf',
      comments: [
        {
          author: 'You (BA)',
          authorInitials: 'YOU',
          time: '2 days ago',
          content: 'Confirmed with Tom (Repairs): Work order details must include property ID, inspection photos, material requirements, and access arrangements. Health and safety checks are non-negotiable.',
        },
        {
          author: 'Dev (Rachel)',
          authorInitials: 'DR',
          time: '1 day ago',
          content: 'Question: What exact fields go into the work order details for Repairs queue cases?',
        },
      ],
    },
    sprintPlanning: {
      scene: 'Monday morning, 10am. Sprint 8 planning. BA presents US-156 to the team.',
      participants: [
        { initials: 'YOU', name: 'You (BA)', role: 'BA', color: 'bg-purple-600' },
        { initials: 'ST', name: 'Sarah (PO)', role: 'PO', color: 'bg-orange-600' },
        { initials: 'DR', name: 'Dev (Rachel)', role: 'Dev', color: 'bg-blue-600' },
        { initials: 'DL', name: 'Dev (Liam)', role: 'Dev', color: 'bg-blue-600' },
        { initials: 'QA', name: 'QA (Emma)', role: 'QA', color: 'bg-green-600' },
      ],
      messages: [
        {
          participant: 'YOU',
          content: '"Okay, let\'s walk through US-156: Streamlined Void-to-Re-let Process. The business problem: voids average 45 days, costing £1.2M annually. Repairs crews are double-booked 30% of the time. We need faster handover."',
        },
        {
          participant: 'YOU',
          content: '"Three decision states: ready for re-let if all checks passed, needs work if safety issues, quality check if repairs pending. The process came from Housing and Repairs—they align with health and safety requirements."',
        },
        {
          participant: 'DR',
          content: '"Do we have the inspection system API endpoint ready?"',
        },
        {
          participant: 'YOU',
          content: '"Yes, Housing team confirmed it\'s live in staging. I\'ll add the endpoint docs to the Jira ticket after this call."',
        },
        {
          participant: 'QA',
          content: '"For AC03, how do we test the 7-day SLA timer without waiting 7 days?"',
        },
        {
          participant: 'YOU',
          content: '"Good question. We can use a test property with time-mocking, or we manually trigger the SLA flag in the database. I\'ll coordinate with you offline to set up test data."',
        },
        {
          participant: 'DL',
          content: '"I\'m estimating this at 5 story points. Complexity is low—mainly workflow routing."',
        },
        {
          participant: 'ST',
          content: '"Great. This is our top priority for the sprint. Let\'s commit to US-156."',
        },
      ],
    },
    standup: {
      scene: 'Wednesday, 10am. Day 3 of Sprint 8. Dev is blocked on US-156.',
      messages: [
        {
          participant: 'DR',
          content: '"Yesterday I started on US-156. Today I\'m building the routing logic. Blocked: I need the exact field names for the work order details."',
        },
        {
          participant: 'YOU',
          content: '"Got it. The work order details need: property_id, inspection_photos, material_requirements, and access_arrangements. I\'ll update the Jira ticket with the exact field names by noon."',
        },
        {
          participant: 'DR',
          content: '"Perfect. I\'ll check Jira at noon and continue building."',
        },
      ],
      jiraUpdate: {
        title: 'Work Order Details Fields (for AC03):',
        fields: [
          { name: 'property_id', type: 'string' },
          { name: 'inspection_photos', type: 'array' },
          { name: 'material_requirements', type: 'array' },
          { name: 'access_arrangements', type: 'string' },
        ],
        note: 'Confirmed with Housing team. All fields available in staging DB.',
      },
    },
    slackUpdate: [
      'Sprint 8 planning complete. Committed to US-156 (Streamlined Void-to-Re-let Process) as top priority.',
      'Dev started implementation. Unblocked work order field questions—updated Jira with work order spec.',
      'Coordinating with QA on test approach for SLA timer.',
      'US-156 on track for Sprint 8 completion.',
    ],
    tasks: {
      jiraComment: {
        question: 'What exact fields go into the work order details for Repairs queue cases?',
        hint: 'Day 5 mentioned property ID, inspection photos, material requirements, and access arrangements.',
      },
      standupResponse: {
        scenario: 'In tomorrow\'s standup, QA (Emma) says: "I\'m blocked on testing AC02. I don\'t know what \'safety issues\' should trigger the block."',
        hint: 'Safety issues must align with health and safety regulations (non-negotiable requirement).',
      },
    },
  },
};

