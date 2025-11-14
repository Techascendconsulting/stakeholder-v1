import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface Challenge {
  challenge: string;
  whatItIs: string;
  example: {
    situation: string;
    whatHappened: string;
    baResponse: string;
    outcome: string;
  };
  howToHandle: string[];
  interviewTip: string;
}

export interface Page10Data {
  challenges: Challenge[];
  slackUpdate: string[];
}

export const PAGE_10_DATA: Record<BAInActionProject, Page10Data> = {
  cif: {
    challenges: [
      {
        challenge: 'Scope Creep',
        whatItIs: 'When stakeholders keep adding new requirements or features that weren\'t in the original scope. This happens gradually and can derail the project.',
        example: {
          situation: 'Sprint 3, Day 2. You\'re in a meeting with Compliance (Marie) and Operations (James).',
          whatHappened: 'Marie: "While we\'re building the risk classification, can we also add a feature to export all high-risk cases to Excel? That would help with our monthly audit reports." James: "Actually, can we also add email notifications when cases are stuck in the queue for more than 24 hours? That would help us catch bottlenecks."',
          baResponse: 'You: "Those are both valuable features, but they\'re not in the current sprint scope. Let me capture them as new user stories for the backlog, and we can prioritize them in the next sprint planning. For now, let\'s focus on getting the core risk classification working." You document both as new user stories, link them to business value, and add them to the backlog.',
          outcome: 'Features are captured but not added to current sprint. Project stays on track. BA shows they can say "no" while still being helpful.',
        },
        howToHandle: [
          'Acknowledge the request: "That\'s a good idea, let me capture it."',
          'Link to original scope: "But it\'s not in our current sprint. Let me show you what we committed to..."',
          'Document as new story: Create user story, link to business value, add to backlog.',
          'Get prioritization: "We can discuss this in next sprint planning - how does it compare to other backlog items?"',
          'Don\'t say yes immediately: "Let me check with the team if this fits in the sprint" (even if you know it doesn\'t).',
        ],
        interviewTip: '"During Sprint 3, Compliance requested an export feature mid-sprint. I acknowledged the value, documented it as a new user story, but kept it out of the current sprint. I explained that adding it would delay our core deliverables. We prioritized it for Sprint 4 instead."',
      },
      {
        challenge: 'Difficult Stakeholder',
        whatItIs: 'A stakeholder who is unresponsive, constantly changes their mind, or is hostile to the project. This makes requirements gathering and sign-off difficult.',
        example: {
          situation: 'You need sign-off from Finance (David Chen) on the fraud loss metrics. You\'ve sent 3 emails over 2 weeks. No response.',
          whatHappened: 'You email David: "Hi David, I need your sign-off on the fraud loss baseline metrics for the project. I sent this 2 weeks ago - can you confirm if the numbers are correct?" David replies: "I don\'t have time for this. The numbers are in the monthly report. Use those." But the monthly report has different numbers than what you need.',
          baResponse: 'You: "I understand you\'re busy. The monthly report shows £100k/week, but I need to confirm if that\'s the right baseline for this project. Can I schedule a 15-minute call this week? Or if you prefer, I can send you a one-page summary and you can just confirm yes/no." You also CC David\'s manager (Ben Carter, the PO) so they\'re aware of the blocker.',
          outcome: 'David agrees to a 15-minute call. You get the confirmation you need. By involving the PO, you show you\'re escalating appropriately, not just complaining.',
        },
        howToHandle: [
          'Be persistent but respectful: Don\'t give up after one email. Follow up politely.',
          'Make it easy: Offer options (call, email, one-pager) so they can choose what works.',
          'Show the impact: "Without this, we can\'t proceed with..." (shows why it matters).',
          'Escalate appropriately: CC their manager or PO if they\'re blocking progress.',
          'Document everything: Keep records of attempts to contact, so you can show you tried.',
          'Find alternatives: Can you get the information from someone else? Can you use existing data?',
        ],
        interviewTip: '"Finance was unresponsive to sign-off requests. I persisted with follow-ups, made it easy by offering a 15-minute call, and escalated to the PO when it was blocking progress. I got the sign-off and documented the process for future reference."',
      },
      {
        challenge: 'Conflicting Priorities',
        whatItIs: 'Different stakeholders want different things prioritized. One says Feature A is urgent, another says Feature B is critical. You need to resolve the conflict.',
        example: {
          situation: 'Sprint Planning. Compliance (Marie) says: "We must prioritize the audit log feature - it\'s required for our Q4 audit." Operations (James) says: "We need the bulk actions feature - it will save us 10 hours per week."',
          whatHappened: 'Both features can\'t fit in one sprint. Team can only commit to one. Both stakeholders are pushing for their feature. Tension in the room.',
          baResponse: 'You: "Both features are valuable. Let me help us decide. Marie, when is the Q4 audit deadline?" Marie: "End of November." You: "James, how urgent is the bulk actions?" James: "We\'re struggling now, but it\'s not a blocker." You: "Based on this, I recommend we prioritize the audit log (regulatory deadline) for this sprint, and commit to bulk actions for Sprint 4. Does that work?" You get agreement from both.',
          outcome: 'Conflict resolved using objective criteria (regulatory deadline vs. efficiency gain). Both stakeholders feel heard. Sprint planning proceeds.',
        },
        howToHandle: [
          'Get objective criteria: Deadlines, business impact, regulatory requirements, user pain.',
          'Compare, don\'t choose: "Let\'s look at the criteria - which has a hard deadline?"',
          'Show you understand both: "I see why both are important. Let\'s prioritize based on..."',
          'Get stakeholder agreement: "Does this prioritization work for both of you?"',
          'Document the decision: Write it down so you can reference it later.',
          'Commit to the other: "We\'ll do Feature B in Sprint 4 - I\'ll make sure it\'s prioritized."',
        ],
        interviewTip: '"During sprint planning, Compliance and Operations had conflicting priorities. I facilitated a discussion using objective criteria (regulatory deadline vs. efficiency), got agreement on prioritization, and committed to the other feature for next sprint. Both stakeholders felt heard."',
      },
      {
        challenge: 'Missing Information',
        whatItIs: 'You need information to write requirements, but stakeholders don\'t have it, don\'t know who has it, or it doesn\'t exist yet. This blocks your work.',
        example: {
          situation: 'You\'re writing requirements for the risk classification system. You need to know: "What is the exact risk score calculation formula?" You ask the Data Science team. They say: "We\'re still building the model. We don\'t have the formula yet."',
          whatHappened: 'You can\'t write detailed requirements without knowing how risk scores are calculated. But the model isn\'t ready. You\'re stuck.',
          baResponse: 'You: "I understand the model isn\'t ready. For now, can we agree on the decision boundaries? For example, can we say: \'Risk score will be a number 0-100. Scores 85-100 = low risk (auto-approve). Scores 31-84 = medium risk (manual review). Scores 0-30 = high risk (block).\' We can refine the exact thresholds later when the model is ready." You write high-level requirements now, with a note that detailed thresholds will be updated when the model is complete.',
          outcome: 'You unblock yourself by writing requirements at the right level of detail. You document what\'s known now, and what needs to be updated later. Project continues.',
        },
        howToHandle: [
          'Don\'t wait: Write requirements at the level of detail you CAN write now.',
          'Document assumptions: "We assume risk score is 0-100. Exact thresholds TBD when model is ready."',
          'Set expectations: "I\'ll update these requirements when we have the model. For now, this is what we\'re building to."',
          'Create placeholders: Use "TBD" or "To be confirmed" for missing details.',
          'Follow up: Schedule check-ins to get the missing information when it\'s available.',
          'Find alternatives: Can you use similar systems as reference? Can you make reasonable assumptions?',
        ],
        interviewTip: '"The risk model wasn\'t ready, but I needed to write requirements. I wrote high-level requirements with decision boundaries, documented assumptions, and set expectations that detailed thresholds would be updated when the model was ready. This unblocked development while maintaining accuracy."',
      },
      {
        challenge: 'Changing Requirements Mid-Sprint',
        whatItIs: 'Stakeholders want to change requirements after the sprint has started. This disrupts development and can delay delivery.',
        example: {
          situation: 'Sprint 3, Day 5. Development is 60% complete. Compliance (Marie) emails: "We just got new regulatory guidance. The risk score threshold for auto-approval needs to change from 85 to 90. Can we update this in the current sprint?"',
          whatHappened: 'The team has already built logic for the 85 threshold. Changing it now means rework. But it\'s a regulatory requirement - can\'t ignore it.',
          baResponse: 'You: "I understand this is a regulatory requirement. However, we\'re 60% through the sprint. Changing the threshold now means rework and might delay other stories. Let me check with the team: can we fit this change, or should we complete current stories and do this in Sprint 4?" You discuss with the team. They say: "We can do it, but we\'ll need to drop one story." You: "Marie, we can do this, but we\'ll need to drop US-144 (notifications) to next sprint. Is that acceptable, or can this wait until Sprint 4?" Marie: "It can wait until Sprint 4 - the guidance takes effect in 6 weeks."',
          outcome: 'Change is deferred to next sprint. Current sprint stays on track. BA shows they can negotiate and protect the team while still addressing stakeholder needs.',
        },
        howToHandle: [
          'Assess impact: "This change affects X stories. It will require Y hours of rework."',
          'Present options: "We can do this now (but drop Story Z) or do it in next sprint (no impact)."',
          'Get stakeholder decision: "Which option works for you?"',
          'Document the change: If approved, update requirements, notify team, update sprint scope.',
          'If rejected: "Understood. I\'ll prioritize this for Sprint 4."',
          'Protect the team: Don\'t just say yes. Show the trade-offs.',
        ],
        interviewTip: '"Compliance requested a threshold change mid-sprint. I assessed the impact, presented options (do now vs. next sprint), and got agreement to defer to next sprint since the deadline was 6 weeks away. This protected the current sprint while addressing the need."',
      },
      {
        challenge: 'Technical Constraints Discovered Late',
        whatItIs: 'During development, technical limitations are discovered that prevent the solution from working as designed. You need to adjust requirements.',
        example: {
          situation: 'Sprint 3, Day 8. Developer discovers: "The legacy system we\'re integrating with can only process 100 cases per minute. But our requirements say we need to process 500 cases per minute during peak times."',
          whatHappened: 'The requirement can\'t be met with the current technical architecture. You need to either change the requirement or find a workaround.',
          baResponse: 'You: "This is a constraint we didn\'t know about. Let me check with Operations: is 100 cases/minute acceptable, or do we need a different solution?" You discuss with Operations. They say: "100/minute is fine for now, but we need a plan to scale to 500/minute in 6 months." You: "Got it. Let me update the requirement: \'System must process 100 cases/minute initially. Architecture must support scaling to 500 cases/minute within 6 months.\' We\'ll build the current solution, and plan the scaling work for a future sprint."',
          outcome: 'Requirement is adjusted to match technical reality, with a plan for future scaling. Stakeholders understand the constraint and agree to the adjusted requirement.',
        },
        howToHandle: [
          'Don\'t blame: "This is a constraint we discovered. Let\'s work with it."',
          'Assess impact: "What does this mean for the business? Is 100/minute acceptable?"',
          'Find alternatives: Can we work around it? Can we phase it?',
          'Update requirements: Adjust to match technical reality, document the constraint.',
          'Plan for future: "We\'ll address the scaling in a future sprint."',
          'Communicate clearly: Explain the constraint and the adjusted solution to stakeholders.',
        ],
        interviewTip: '"We discovered a technical constraint mid-development: legacy system could only process 100 cases/minute, not 500. I worked with Operations to adjust the requirement, documented the constraint, and created a plan to scale in future sprints. Stakeholders understood and agreed."',
      },
      {
        challenge: 'Stakeholder Disagreements',
        whatItIs: 'Two or more stakeholders disagree on requirements, priorities, or approach. You need to facilitate resolution without taking sides.',
        example: {
          situation: 'Requirements review meeting. Compliance (Marie) says: "We must log every single action for audit purposes - even viewing a case." Operations (James) says: "That will slow down the system. We only need to log decisions, not views."',
          whatHappened: 'They\'re both right from their perspective. Compliance needs audit trails. Operations needs performance. Conflict.',
          baResponse: 'You: "I see both perspectives. Marie, you need audit trails for compliance. James, you need performance for operations. Let me propose a solution: We log all decisions (approve, reject, escalate) for audit, and we log views only for high-risk cases (score ≤30). This gives us audit coverage where it matters most, without impacting performance for routine cases. Does this work for both of you?"',
          outcome: 'Compromise solution satisfies both stakeholders. Requirements are updated. Both feel heard.',
        },
        howToHandle: [
          'Acknowledge both sides: "I see why both perspectives matter."',
          'Find common ground: "What do we both agree on?"',
          'Propose compromise: "What if we..." (offer a solution that addresses both concerns).',
          'Get agreement: "Does this work for both of you?"',
          'Document the decision: Write down what was agreed and why.',
          'Don\'t take sides: You\'re facilitating, not choosing winners.',
        ],
        interviewTip: '"Compliance and Operations disagreed on audit logging requirements. I facilitated a discussion, acknowledged both perspectives, and proposed a compromise (log decisions always, log views only for high-risk cases). Both stakeholders agreed, and requirements were updated."',
      },
    ],
    slackUpdate: [
      '📋 BA Challenges & How to Handle Them',
      '',
      'This week we encountered several common BA challenges:',
      '',
      '✅ Scope Creep:',
      '• Compliance requested export feature mid-sprint',
      '• Captured as new story, kept out of current sprint',
      '• Prioritized for Sprint 4',
      '',
      '✅ Difficult Stakeholder:',
      '• Finance was unresponsive to sign-off requests',
      '• Persisted with follow-ups, offered 15-min call',
      '• Escalated to PO when blocking progress',
      '• Got sign-off and documented process',
      '',
      '✅ Conflicting Priorities:',
      '• Compliance vs Operations priority conflict',
      '• Used objective criteria (regulatory deadline)',
      '• Got agreement, committed other feature to next sprint',
      '',
      '💡 Key Learning: BAs don\'t avoid challenges - they handle them systematically.',
    ],
  },
  voids: {
    challenges: [
      {
        challenge: 'Scope Creep',
        whatItIs: 'When stakeholders keep adding new requirements or features that weren\'t in the original scope. This happens gradually and can derail the project.',
        example: {
          situation: 'Sprint 3, Day 2. You\'re in a meeting with Housing (Sarah) and Repairs (Tom).',
          whatHappened: 'Sarah: "While we\'re building the inspection workflow, can we also add a feature to track tenant satisfaction surveys? That would help us measure service quality." Tom: "Actually, can we also add a dashboard showing repair costs by property type? That would help us budget better."',
          baResponse: 'You: "Those are both valuable features, but they\'re not in the current sprint scope. Let me capture them as new user stories for the backlog, and we can prioritize them in the next sprint planning. For now, let\'s focus on getting the core inspection workflow working." You document both as new user stories, link them to business value, and add them to the backlog.',
          outcome: 'Features are captured but not added to current sprint. Project stays on track. BA shows they can say "no" while still being helpful.',
        },
        howToHandle: [
          'Acknowledge the request: "That\'s a good idea, let me capture it."',
          'Link to original scope: "But it\'s not in our current sprint. Let me show you what we committed to..."',
          'Document as new story: Create user story, link to business value, add to backlog.',
          'Get prioritization: "We can discuss this in next sprint planning - how does it compare to other backlog items?"',
          'Don\'t say yes immediately: "Let me check with the team if this fits in the sprint" (even if you know it doesn\'t).',
        ],
        interviewTip: '"During Sprint 3, Housing requested a tenant satisfaction tracking feature mid-sprint. I acknowledged the value, documented it as a new user story, but kept it out of the current sprint. I explained that adding it would delay our core deliverables. We prioritized it for Sprint 4 instead."',
      },
      {
        challenge: 'Difficult Stakeholder',
        whatItIs: 'A stakeholder who is unresponsive, constantly changes their mind, or is hostile to the project. This makes requirements gathering and sign-off difficult.',
        example: {
          situation: 'You need sign-off from Finance (Michael Brown) on the void cost metrics. You\'ve sent 3 emails over 2 weeks. No response.',
          whatHappened: 'You email Michael: "Hi Michael, I need your sign-off on the void cost baseline for the project. I sent this 2 weeks ago - can you confirm if the numbers are correct?" Michael replies: "I don\'t have time for this. The numbers are in the quarterly report. Use those." But the quarterly report has different numbers than what you need.',
          baResponse: 'You: "I understand you\'re busy. The quarterly report shows £45k/month, but I need to confirm if that\'s the right baseline for this project. Can I schedule a 15-minute call this week? Or if you prefer, I can send you a one-page summary and you can just confirm yes/no." You also CC Michael\'s manager (Sarah Thompson, the PO) so they\'re aware of the blocker.',
          outcome: 'Michael agrees to a 15-minute call. You get the confirmation you need. By involving the PO, you show you\'re escalating appropriately, not just complaining.',
        },
        howToHandle: [
          'Be persistent but respectful: Don\'t give up after one email. Follow up politely.',
          'Make it easy: Offer options (call, email, one-pager) so they can choose what works.',
          'Show the impact: "Without this, we can\'t proceed with..." (shows why it matters).',
          'Escalate appropriately: CC their manager or PO if they\'re blocking progress.',
          'Document everything: Keep records of attempts to contact, so you can show you tried.',
          'Find alternatives: Can you get the information from someone else? Can you use existing data?',
        ],
        interviewTip: '"Finance was unresponsive to sign-off requests. I persisted with follow-ups, made it easy by offering a 15-minute call, and escalated to the PO when it was blocking progress. I got the sign-off and documented the process for future reference."',
      },
      {
        challenge: 'Conflicting Priorities',
        whatItIs: 'Different stakeholders want different things prioritized. One says Feature A is urgent, another says Feature B is critical. You need to resolve the conflict.',
        example: {
          situation: 'Sprint Planning. Housing (Sarah) says: "We must prioritize the tenant notification feature - tenants are complaining they don\'t know when properties are ready." Repairs (Tom) says: "We need the bulk assignment feature - it will save us 15 hours per week."',
          whatHappened: 'Both features can\'t fit in one sprint. Team can only commit to one. Both stakeholders are pushing for their feature. Tension in the room.',
          baResponse: 'You: "Both features are valuable. Let me help us decide. Sarah, how many tenant complaints are we getting?" Sarah: "About 20 per week." You: "Tom, how urgent is the bulk assignment?" Tom: "We\'re struggling now, but it\'s not blocking us." You: "Based on this, I recommend we prioritize tenant notifications (customer satisfaction impact) for this sprint, and commit to bulk assignment for Sprint 4. Does that work?" You get agreement from both.',
          outcome: 'Conflict resolved using objective criteria (customer impact vs. efficiency gain). Both stakeholders feel heard. Sprint planning proceeds.',
        },
        howToHandle: [
          'Get objective criteria: Deadlines, business impact, user pain, customer satisfaction.',
          'Compare, don\'t choose: "Let\'s look at the criteria - which has higher customer impact?"',
          'Show you understand both: "I see why both are important. Let\'s prioritize based on..."',
          'Get stakeholder agreement: "Does this prioritization work for both of you?"',
          'Document the decision: Write it down so you can reference it later.',
          'Commit to the other: "We\'ll do Feature B in Sprint 4 - I\'ll make sure it\'s prioritized."',
        ],
        interviewTip: '"During sprint planning, Housing and Repairs had conflicting priorities. I facilitated a discussion using objective criteria (customer satisfaction impact vs. efficiency), got agreement on prioritization, and committed to the other feature for next sprint. Both stakeholders felt heard."',
      },
      {
        challenge: 'Missing Information',
        whatItIs: 'You need information to write requirements, but stakeholders don\'t have it, don\'t know who has it, or it doesn\'t exist yet. This blocks your work.',
        example: {
          situation: 'You\'re writing requirements for the inspection workflow. You need to know: "What is the standard inspection checklist?" You ask Housing. They say: "We don\'t have a standard checklist. Each inspector uses their own."',
          whatHappened: 'You can\'t write detailed requirements without knowing what inspectors need to check. But there\'s no standard checklist. You\'re stuck.',
          baResponse: 'You: "I understand there\'s no standard checklist. For now, can we agree on the key inspection areas? For example: Property condition (clean, safe, habitable), Repairs needed (list of issues), Compliance checks (gas, electrical, fire safety). We can refine the detailed checklist later when we standardize the process." You write high-level requirements now, with a note that detailed checklist will be updated when standardized.',
          outcome: 'You unblock yourself by writing requirements at the right level of detail. You document what\'s known now, and what needs to be updated later. Project continues.',
        },
        howToHandle: [
          'Don\'t wait: Write requirements at the level of detail you CAN write now.',
          'Document assumptions: "We assume inspection covers property condition, repairs, and compliance. Detailed checklist TBD."',
          'Set expectations: "I\'ll update these requirements when we standardize the checklist. For now, this is what we\'re building to."',
          'Create placeholders: Use "TBD" or "To be confirmed" for missing details.',
          'Follow up: Schedule check-ins to get the missing information when it\'s available.',
          'Find alternatives: Can you use similar processes as reference? Can you make reasonable assumptions?',
        ],
        interviewTip: '"There was no standard inspection checklist, but I needed to write requirements. I wrote high-level requirements covering key inspection areas, documented assumptions, and set expectations that detailed checklist would be updated when standardized. This unblocked development while maintaining accuracy."',
      },
      {
        challenge: 'Changing Requirements Mid-Sprint',
        whatItIs: 'Stakeholders want to change requirements after the sprint has started. This disrupts development and can delay delivery.',
        example: {
          situation: 'Sprint 3, Day 5. Development is 60% complete. Housing (Sarah) emails: "We just got new health & safety guidance. The inspection must now include a new check for carbon monoxide detectors. Can we add this to the current sprint?"',
          whatHappened: 'The team has already built the inspection workflow. Adding a new check means rework. But it\'s a regulatory requirement - can\'t ignore it.',
          baResponse: 'You: "I understand this is a regulatory requirement. However, we\'re 60% through the sprint. Adding this check now means rework and might delay other stories. Let me check with the team: can we fit this change, or should we complete current stories and do this in Sprint 4?" You discuss with the team. They say: "We can do it, but we\'ll need to drop one story." You: "Sarah, we can do this, but we\'ll need to drop US-144 (tenant notifications) to next sprint. Is that acceptable, or can this wait until Sprint 4?" Sarah: "It can wait until Sprint 4 - the guidance takes effect in 8 weeks."',
          outcome: 'Change is deferred to next sprint. Current sprint stays on track. BA shows they can negotiate and protect the team while still addressing stakeholder needs.',
        },
        howToHandle: [
          'Assess impact: "This change affects X stories. It will require Y hours of rework."',
          'Present options: "We can do this now (but drop Story Z) or do it in next sprint (no impact)."',
          'Get stakeholder decision: "Which option works for you?"',
          'Document the change: If approved, update requirements, notify team, update sprint scope.',
          'If rejected: "Understood. I\'ll prioritize this for Sprint 4."',
          'Protect the team: Don\'t just say yes. Show the trade-offs.',
        ],
        interviewTip: '"Housing requested a new inspection check mid-sprint due to regulatory guidance. I assessed the impact, presented options (do now vs. next sprint), and got agreement to defer to next sprint since the deadline was 8 weeks away. This protected the current sprint while addressing the need."',
      },
      {
        challenge: 'Technical Constraints Discovered Late',
        whatItIs: 'During development, technical limitations are discovered that prevent the solution from working as designed. You need to adjust requirements.',
        example: {
          situation: 'Sprint 3, Day 8. Developer discovers: "The legacy property management system we\'re integrating with can only handle 50 inspections per day. But our requirements say we need to process 200 inspections per day during peak times."',
          whatHappened: 'The requirement can\'t be met with the current technical architecture. You need to either change the requirement or find a workaround.',
          baResponse: 'You: "This is a constraint we didn\'t know about. Let me check with Housing: is 50 inspections/day acceptable, or do we need a different solution?" You discuss with Housing. They say: "50/day is fine for now, but we need a plan to scale to 200/day in 3 months." You: "Got it. Let me update the requirement: \'System must process 50 inspections/day initially. Architecture must support scaling to 200 inspections/day within 3 months.\' We\'ll build the current solution, and plan the scaling work for a future sprint."',
          outcome: 'Requirement is adjusted to match technical reality, with a plan for future scaling. Stakeholders understand the constraint and agree to the adjusted requirement.',
        },
        howToHandle: [
          'Don\'t blame: "This is a constraint we discovered. Let\'s work with it."',
          'Assess impact: "What does this mean for the business? Is 50/day acceptable?"',
          'Find alternatives: Can we work around it? Can we phase it?',
          'Update requirements: Adjust to match technical reality, document the constraint.',
          'Plan for future: "We\'ll address the scaling in a future sprint."',
          'Communicate clearly: Explain the constraint and the adjusted solution to stakeholders.',
        ],
        interviewTip: '"We discovered a technical constraint mid-development: legacy system could only handle 50 inspections/day, not 200. I worked with Housing to adjust the requirement, documented the constraint, and created a plan to scale in future sprints. Stakeholders understood and agreed."',
      },
      {
        challenge: 'Stakeholder Disagreements',
        whatItIs: 'Two or more stakeholders disagree on requirements, priorities, or approach. You need to facilitate resolution without taking sides.',
        example: {
          situation: 'Requirements review meeting. Housing (Sarah) says: "We must notify tenants immediately when a property is ready - even if paperwork isn\'t complete." Finance (Michael) says: "We can\'t notify until all paperwork is done - we need to ensure rent can be collected from day one."',
          whatHappened: 'They\'re both right from their perspective. Housing needs to reduce void days. Finance needs to ensure revenue. Conflict.',
          baResponse: 'You: "I see both perspectives. Sarah, you need to reduce void days by notifying tenants quickly. Michael, you need to ensure rent collection starts immediately. Let me propose a solution: We notify tenants when the property is ready (inspection passed), but we include a note that \'rent starts from [date]\' which is when paperwork is complete. This gives tenants advance notice while protecting revenue. Does this work for both of you?"',
          outcome: 'Compromise solution satisfies both stakeholders. Requirements are updated. Both feel heard.',
        },
        howToHandle: [
          'Acknowledge both sides: "I see why both perspectives matter."',
          'Find common ground: "What do we both agree on?"',
          'Propose compromise: "What if we..." (offer a solution that addresses both concerns).',
          'Get agreement: "Does this work for both of you?"',
          'Document the decision: Write down what was agreed and why.',
          'Don\'t take sides: You\'re facilitating, not choosing winners.',
        ],
        interviewTip: '"Housing and Finance disagreed on tenant notification timing. I facilitated a discussion, acknowledged both perspectives, and proposed a compromise (notify when ready, but include rent start date). Both stakeholders agreed, and requirements were updated."',
      },
    ],
    slackUpdate: [
      '📋 BA Challenges & How to Handle Them',
      '',
      'This week we encountered several common BA challenges:',
      '',
      '✅ Scope Creep:',
      '• Housing requested tenant satisfaction tracking mid-sprint',
      '• Captured as new story, kept out of current sprint',
      '• Prioritized for Sprint 4',
      '',
      '✅ Difficult Stakeholder:',
      '• Finance was unresponsive to sign-off requests',
      '• Persisted with follow-ups, offered 15-min call',
      '• Escalated to PO when blocking progress',
      '• Got sign-off and documented process',
      '',
      '✅ Conflicting Priorities:',
      '• Housing vs Repairs priority conflict',
      '• Used objective criteria (customer impact)',
      '• Got agreement, committed other feature to next sprint',
      '',
      '💡 Key Learning: BAs don\'t avoid challenges - they handle them systematically.',
    ],
  },
};


