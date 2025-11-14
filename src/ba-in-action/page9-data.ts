import type { BAInActionProject } from '../contexts/BAInActionProjectContext';

export interface SprintScenario {
  sprint: string;
  scenario: string;
  developerQuestion: string;
  baAction: string;
  stakeholderResponse: string;
  requirementUpdate: string;
}

export interface ScrumMeetingExample {
  meeting: string;
  when: string;
  whatHappens: string;
  baRole: string;
  example: {
    context: string;
    conversation: string[];
    outcome: string;
  };
}

export interface Page9Data {
  sprintContext: {
    currentSprint: string;
    whatWasBuilt: string;
    whatQuestionsArose: string;
  };
  sprintScenarios: SprintScenario[];
  scrumMeetings: ScrumMeetingExample[];
  edgeCases: Array<{
    edgeCase: string;
    howDiscovered: string;
    baAction: string;
    resolution: string;
  }>;
  requirementsEvolution: Array<{
    original: string;
    whatChanged: string;
    why: string;
    when: string;
  }>;
  slackUpdate: string[];
}

export const PAGE_9_DATA: Record<BAInActionProject, Page9Data> = {
  cif: {
    sprintContext: {
      currentSprint: 'Sprint 3',
      whatWasBuilt: 'Risk classification system is live. Developers are building the manual review queue interface.',
      whatQuestionsArose: 'Edge cases appear during development. Developers need clarification on requirements.',
    },
    sprintScenarios: [
      {
        sprint: 'Sprint 3, Day 4',
        scenario: 'Developer is building the manual review queue interface',
        developerQuestion: 'What happens if a reviewer closes the case without making a decision? Should we auto-assign it to another reviewer, or flag it as incomplete?',
        baAction: 'BA doesn\'t know the answer. Goes back to Operations (James Walker) to clarify the workflow.',
        stakeholderResponse: 'James: "If a reviewer closes without decision, it should auto-reassign to the next available reviewer. We can\'t have cases sitting unassigned - that breaks our SLA."',
        requirementUpdate: 'BA updates AC: "If reviewer closes case without decision, system must auto-reassign to next available reviewer within 5 minutes. Case status remains \'In Review\' until decision is made."',
      },
      {
        sprint: 'Sprint 3, Day 7',
        scenario: 'Developer discovers edge case during testing',
        developerQuestion: 'What if a user has multiple accounts (personal + business) and one is flagged as high-risk? Should we block both accounts, or just the flagged one?',
        baAction: 'BA checks with Compliance (Marie Dupont) and Product Owner (Ben Carter) to understand business rules.',
        stakeholderResponse: 'Marie: "We must block only the flagged account. Blocking all accounts would violate GDPR - we can\'t penalize a user for having multiple accounts." Ben: "Agreed. But we should flag the user for review - having multiple accounts with different risk scores is suspicious."',
        requirementUpdate: 'BA creates new user story: "As a Risk Engine, I want to handle multi-account scenarios, so that we block only flagged accounts while maintaining compliance." AC: "If user has multiple accounts, block only the account with risk score ≤30. Flag user profile for manual review if accounts have conflicting risk scores."',
      },
      {
        sprint: 'Sprint 4, Day 2',
        scenario: 'During Backlog Refinement, developer asks about notification timing',
        developerQuestion: 'When should we send the notification to the reviewer? Immediately when case is assigned, or wait until the reviewer logs in?',
        baAction: 'BA checks with Operations to understand their workflow preferences.',
        stakeholderResponse: 'James: "Send immediately. Reviewers check their phones throughout the day. If they\'re not available, they\'ll see it when they log in. But immediate notification helps us meet SLA targets."',
        requirementUpdate: 'BA updates AC: "System must send notification to reviewer immediately upon case assignment. Notification must include: case ID, risk score, account details, and estimated review time."',
      },
    ],
    scrumMeetings: [
      {
        meeting: 'Backlog Refinement',
        when: 'Sprint 3, Day 1 (before Sprint Planning)',
        whatHappens: 'BA presents user stories for next sprint. Developers ask clarifying questions. BA answers what they can, notes what needs stakeholder input.',
        baRole: 'Present requirements, answer questions, note what needs clarification, update requirements based on questions.',
        example: {
          context: 'BA is presenting US-145: "As a Reviewer, I want to see case history, so that I can make informed decisions."',
          conversation: [
            'BA: "Here\'s US-145. The reviewer needs to see previous decisions on similar cases."',
            'Developer: "What counts as \'similar\'? Same risk score? Same account type? Same country?"',
            'BA: "Good question. Let me check with Operations. For now, let\'s assume \'same risk score range\' - I\'ll confirm and update the AC."',
            'Developer: "Also, how far back should we show history? Last 30 days? Last 100 cases?"',
            'BA: "Another good question. I\'ll ask Operations and update the AC before Sprint Planning."',
          ],
          outcome: 'BA updates AC with specific criteria after checking with Operations. Story is ready for Sprint Planning.',
        },
      },
      {
        meeting: 'Sprint Planning',
        when: 'Sprint 3, Day 1 (start of sprint)',
        whatHappens: 'Team decides what to build this sprint. BA presents requirements. Team estimates. BA answers questions. Team commits to work.',
        baRole: 'Present requirements clearly, answer questions, help team understand business context, adjust scope if needed.',
        example: {
          context: 'Team is planning Sprint 3. BA presents 3 user stories. Team needs to decide what fits.',
          conversation: [
            'BA: "We have 3 stories ready: US-142 (risk classification - ACs are clear), US-143 (review queue - needs one clarification), US-144 (notifications - ACs are clear)."',
            'Developer: "US-143 - what\'s the clarification?"',
            'BA: "I need to confirm with Operations: should reviewers be able to reassign cases, or only escalate?"',
            'Developer: "That affects the UI design. Can you get an answer today?"',
            'BA: "Yes, I\'ll check with James and update the AC by end of day."',
            'Developer: "If you get it today, we can commit to all 3. If not, we\'ll do US-142 and US-144, and push US-143 to next sprint."',
            'BA: "Understood. I\'ll update you by 4pm today."',
          ],
          outcome: 'BA gets answer from Operations, updates AC, team commits to all 3 stories.',
        },
      },
      {
        meeting: 'Daily Standup',
        when: 'Every day, 15 minutes',
        whatHappens: 'Team shares progress. Developers mention blockers. BA answers requirement questions or commits to getting answers.',
        baRole: 'Listen for requirement questions, answer what you can, commit to getting stakeholder input if needed, communicate what you\'re doing to unblock developers.',
        example: {
          context: 'Sprint 3, Day 5. Developer is working on the review queue interface.',
          conversation: [
            'Developer: "I\'m working on the review queue. I have a question about the AC - what if a case is assigned but the reviewer is on leave? Should it auto-reassign after 24 hours?"',
            'BA: "Good catch. I don\'t know the answer. Let me check with Operations today and update the AC by end of day."',
            'Developer: "Thanks. That affects the logic I\'m writing."',
            'BA: "I\'ll also check if there\'s a way to mark reviewers as \'on leave\' in the system, or if we need to handle this differently."',
          ],
          outcome: 'BA checks with Operations, updates AC with auto-reassignment logic and leave handling. Developer continues building.',
        },
      },
      {
        meeting: 'Sprint Review',
        when: 'End of Sprint 3',
        whatHappens: 'Team shows stakeholders what was built. Stakeholders give feedback. BA captures feedback and translates it into requirements for next sprint.',
        baRole: 'Present what was built, explain how it solves the problem, capture stakeholder feedback, translate feedback into user stories for next sprint.',
        example: {
          context: 'Sprint Review for Sprint 3. Team shows the manual review queue interface.',
          conversation: [
            'BA: "We built the manual review queue. Reviewers can see assigned cases, filter by risk score, and make decisions. Here\'s a demo..."',
            'Stakeholder (Marie - Compliance): "Can reviewers see the reason why the case was flagged? That would help them make faster decisions."',
            'BA: "Good feedback. Currently they see the risk score and account details, but not the specific flags. I\'ll add that as a user story for next sprint."',
            'Stakeholder (James - Operations): "The queue looks good, but can we add bulk actions? Sometimes we need to approve multiple low-risk cases at once."',
            'BA: "Another good point. I\'ll create a user story for bulk actions. Let me understand the use case better - when would you use bulk actions?"',
            'James: "When we get a batch of similar cases, like 20 accounts from the same company, all with risk score 31-40. We\'d review one, and if it\'s fine, approve the rest."',
            'BA: "Got it. I\'ll write a user story for bulk actions with proper safeguards - you can only bulk-approve cases with the same risk score range."',
          ],
          outcome: 'BA creates 2 new user stories for Sprint 4: "Show flag reasons" and "Bulk actions with safeguards".',
        },
      },
    ],
    edgeCases: [
      {
        edgeCase: 'User account is locked but tries to verify identity',
        howDiscovered: 'Developer asks during Sprint 3: "What if the account is locked? Should we still allow verification?"',
        baAction: 'BA doesn\'t know. Goes to Compliance and Product Owner to clarify business rules.',
        resolution: 'Compliance: "Locked accounts cannot verify. Block verification attempt and show message: \'Account is locked. Contact support.\'" BA updates AC with this rule.',
      },
      {
        edgeCase: 'Risk score calculation fails (system error)',
        howDiscovered: 'Developer asks during Sprint 3: "What if the risk engine is down? What should we do?"',
        baAction: 'BA checks with Operations and Product Owner about fallback behavior.',
        resolution: 'Product Owner: "If risk engine is down, default to \'send to manual review\' for all accounts. We can\'t auto-approve without risk score." BA documents this as a system requirement.',
      },
      {
        edgeCase: 'User verifies from a new country (not in their profile)',
        howDiscovered: 'QA tester finds this during Sprint 3 testing: "User profile says UK, but verification attempt is from France."',
        baAction: 'BA checks with Compliance about fraud detection rules for location mismatches.',
        resolution: 'Compliance: "Location mismatch is a high-risk signal. If user verifies from a country not in their profile, automatically set risk score to 25 (high-risk, block)." BA updates requirements.',
      },
    ],
    requirementsEvolution: [
      {
        original: 'AC01: Risk score ≥85 → Account approved automatically',
        whatChanged: 'Added: "If account is locked, block regardless of risk score."',
        why: 'Developer discovered edge case. Compliance clarified business rule.',
        when: 'Sprint 3, Day 4',
      },
      {
        original: 'US-143: Manual review queue shows assigned cases',
        whatChanged: 'Added AC: "Reviewers can see flag reasons (why case was flagged) to make faster decisions."',
        why: 'Stakeholder feedback during Sprint Review. Operations requested this feature.',
        when: 'Sprint 3 Review → Sprint 4',
      },
      {
        original: 'US-142: Risk classification routes cases',
        whatChanged: 'Added: "If risk engine is down, default all accounts to manual review (cannot auto-approve)."',
        why: 'Developer asked about system failure scenario. Product Owner defined fallback behavior.',
        when: 'Sprint 3, Day 6',
      },
    ],
    slackUpdate: [
      '📊 Sprint 3 Update - Risk Classification & Review Queue',
      '',
      '✅ Completed:',
      '• US-142: Risk classification system (routes cases by score)',
      '• US-143: Manual review queue interface (reviewers can see and process cases)',
      '',
      '🔄 Requirements Updated:',
      '• Added edge case handling: locked accounts cannot verify',
      '• Added fallback behavior: if risk engine down, default to manual review',
      '• Clarified multi-account scenarios (block only flagged account)',
      '',
      '📝 For Next Sprint:',
      '• US-145: Show flag reasons in review queue (stakeholder feedback)',
      '• US-146: Bulk actions for reviewers (Operations request)',
      '',
      '💬 Questions? Ping me in #proj-cifraud',
    ],
  },
  voids: {
    sprintContext: {
      currentSprint: 'Sprint 3',
      whatWasBuilt: 'Void inspection workflow is live. Developers are building the repairs assignment interface.',
      whatQuestionsArose: 'Edge cases appear during development. Developers need clarification on requirements.',
    },
    sprintScenarios: [
      {
        sprint: 'Sprint 3, Day 4',
        scenario: 'Developer is building the repairs assignment interface',
        developerQuestion: 'What happens if a repair is marked as "complete" but the inspector finds issues? Should we create a new work order, or reopen the existing one?',
        baAction: 'BA doesn\'t know the answer. Goes back to Repairs (Tom Richards) to clarify the workflow.',
        stakeholderResponse: 'Tom: "If inspector finds issues after repair is marked complete, we should reopen the existing work order. Creating a new one messes up our tracking and costs."',
        requirementUpdate: 'BA updates AC: "If inspector rejects repair after completion, system must reopen the existing work order and notify the original repair team. Work order status changes from \'Complete\' to \'Reopened - Requires Fix\'."',
      },
      {
        sprint: 'Sprint 3, Day 7',
        scenario: 'Developer discovers edge case during testing',
        developerQuestion: 'What if a property has multiple voids (e.g., 2-bedroom flat, one bedroom is void, one is occupied)? Should we treat it as a full void or partial void?',
        baAction: 'BA checks with Housing (Sarah Thompson) and Repairs (Tom Richards) to understand business rules.',
        stakeholderResponse: 'Sarah: "Partial voids are still voids - we lose rent on the empty room. But the repair process is different - we can\'t do major works if the other room is occupied." Tom: "We need to know if it\'s partial or full void - affects what repairs we can do and how long it takes."',
        requirementUpdate: 'BA creates new user story: "As a Housing Officer, I want to mark void type (full/partial), so that Repairs knows what work can be done." AC: "System must allow marking void as \'Full\' or \'Partial\'. Partial voids restrict repair types (no major works if occupied room present)."',
      },
      {
        sprint: 'Sprint 4, Day 2',
        scenario: 'During Backlog Refinement, developer asks about notification timing',
        developerQuestion: 'When should we notify the tenant that the property is ready? After final inspection passes, or after all paperwork is complete?',
        baAction: 'BA checks with Housing to understand their workflow preferences.',
        stakeholderResponse: 'Sarah: "Notify after final inspection passes. Paperwork can take 2-3 days, but tenants want to know immediately when the property is ready. We\'ll handle paperwork separately."',
        requirementUpdate: 'BA updates AC: "System must send \'Property Ready\' notification to tenant immediately upon final inspection approval. Paperwork completion is tracked separately and does not block notification."',
      },
    ],
    scrumMeetings: [
      {
        meeting: 'Backlog Refinement',
        when: 'Sprint 3, Day 1 (before Sprint Planning)',
        whatHappens: 'BA presents user stories for next sprint. Developers ask clarifying questions. BA answers what they can, notes what needs stakeholder input.',
        baRole: 'Present requirements, answer questions, note what needs clarification, update requirements based on questions.',
        example: {
          context: 'BA is presenting US-145: "As a Repairs Officer, I want to see void history, so that I can prioritize work orders."',
          conversation: [
            'BA: "Here\'s US-145. Repairs needs to see previous void inspections and repairs for the same property."',
            'Developer: "What counts as \'same property\'? Same address? What if it\'s a different flat in the same building?"',
            'BA: "Good question. Let me check with Repairs. For now, let\'s assume \'same property address\' - I\'ll confirm and update the AC."',
            'Developer: "Also, how far back should we show history? Last 12 months? Last 5 voids?"',
            'BA: "Another good question. I\'ll ask Repairs and update the AC before Sprint Planning."',
          ],
          outcome: 'BA updates AC with specific criteria after checking with Repairs. Story is ready for Sprint Planning.',
        },
      },
      {
        meeting: 'Sprint Planning',
        when: 'Sprint 3, Day 1 (start of sprint)',
        whatHappens: 'Team decides what to build this sprint. BA presents requirements. Team estimates. BA answers questions. Team commits to work.',
        baRole: 'Present requirements clearly, answer questions, help team understand business context, adjust scope if needed.',
        example: {
          context: 'Team is planning Sprint 3. BA presents 3 user stories. Team needs to decide what fits.',
          conversation: [
            'BA: "We have 3 stories ready: US-142 (inspection workflow - ACs are clear), US-143 (repairs assignment - needs one clarification), US-144 (tenant notifications - ACs are clear)."',
            'Developer: "US-143 - what\'s the clarification?"',
            'BA: "I need to confirm with Repairs: should repair teams be able to reassign work orders, or only escalate?"',
            'Developer: "That affects the UI design. Can you get an answer today?"',
            'BA: "Yes, I\'ll check with Tom and update the AC by end of day."',
            'Developer: "If you get it today, we can commit to all 3. If not, we\'ll do US-142 and US-144, and push US-143 to next sprint."',
            'BA: "Understood. I\'ll update you by 4pm today."',
          ],
          outcome: 'BA gets answer from Repairs, updates AC, team commits to all 3 stories.',
        },
      },
      {
        meeting: 'Daily Standup',
        when: 'Every day, 15 minutes',
        whatHappens: 'Team shares progress. Developers mention blockers. BA answers requirement questions or commits to getting answers.',
        baRole: 'Listen for requirement questions, answer what you can, commit to getting stakeholder input if needed, communicate what you\'re doing to unblock developers.',
        example: {
          context: 'Sprint 3, Day 5. Developer is working on the repairs assignment interface.',
          conversation: [
            'Developer: "I\'m working on the repairs assignment. I have a question about the AC - what if a work order is assigned but the repair team is on leave? Should it auto-reassign after 24 hours?"',
            'BA: "Good catch. I don\'t know the answer. Let me check with Repairs today and update the AC by end of day."',
            'Developer: "Thanks. That affects the logic I\'m writing."',
            'BA: "I\'ll also check if there\'s a way to mark repair teams as \'on leave\' in the system, or if we need to handle this differently."',
          ],
          outcome: 'BA checks with Repairs, updates AC with auto-reassignment logic and leave handling. Developer continues building.',
        },
      },
      {
        meeting: 'Sprint Review',
        when: 'End of Sprint 3',
        whatHappens: 'Team shows stakeholders what was built. Stakeholders give feedback. BA captures feedback and translates it into requirements for next sprint.',
        baRole: 'Present what was built, explain how it solves the problem, capture stakeholder feedback, translate feedback into user stories for next sprint.',
        example: {
          context: 'Sprint Review for Sprint 3. Team shows the repairs assignment interface.',
          conversation: [
            'BA: "We built the repairs assignment system. Teams can see assigned work orders, filter by priority, and update status. Here\'s a demo..."',
            'Stakeholder (Tom - Repairs): "Can repair teams see the inspection photos? That would help them understand what needs fixing before they arrive."',
            'BA: "Good feedback. Currently they see the inspection notes, but not photos. I\'ll add that as a user story for next sprint."',
            'Stakeholder (Sarah - Housing): "The assignment looks good, but can we add bulk actions? Sometimes we need to assign multiple similar repairs to the same team."',
            'BA: "Another good point. I\'ll create a user story for bulk actions. Let me understand the use case better - when would you use bulk actions?"',
            'Sarah: "When we have multiple voids in the same building, all needing the same repair (e.g., all need new boilers). We\'d assign them all to the heating team at once."',
            'BA: "Got it. I\'ll write a user story for bulk actions with proper safeguards - you can only bulk-assign repairs of the same type to the same team."',
          ],
          outcome: 'BA creates 2 new user stories for Sprint 4: "Show inspection photos" and "Bulk assignment with safeguards".',
        },
      },
    ],
    edgeCases: [
      {
        edgeCase: 'Property inspection fails (inspector unavailable)',
        howDiscovered: 'Developer asks during Sprint 3: "What if the inspector can\'t complete the inspection? Should we reschedule automatically?"',
        baAction: 'BA checks with Housing to understand their workflow.',
        resolution: 'Housing: "If inspector can\'t complete, reschedule within 48 hours. Don\'t auto-reschedule - Housing Officer needs to assign a different inspector." BA updates AC with this rule.',
      },
      {
        edgeCase: 'Repair cost exceeds budget threshold',
        howDiscovered: 'Developer asks during Sprint 3: "What if the repair cost is £5000 but the budget threshold is £3000? What should we do?"',
        baAction: 'BA checks with Housing and Finance about approval workflow.',
        resolution: 'Housing: "If repair cost exceeds threshold, require manager approval before assigning. System must flag and notify manager." BA documents this as a business rule.',
      },
      {
        edgeCase: 'Tenant moves in before final inspection',
        howDiscovered: 'QA tester finds this during Sprint 3 testing: "What if Housing assigns a tenant but final inspection hasn\'t passed yet?"',
        baAction: 'BA checks with Housing about their process for this scenario.',
        resolution: 'Housing: "This shouldn\'t happen, but if it does, block tenant move-in until inspection passes. System must prevent move-in if inspection status is not \'Approved\'." BA updates requirements.',
      },
    ],
    requirementsEvolution: [
      {
        original: 'AC01: Inspection complete → Work order created',
        whatChanged: 'Added: "If inspector is unavailable, reschedule within 48 hours with Housing Officer approval."',
        why: 'Developer discovered edge case. Housing clarified workflow.',
        when: 'Sprint 3, Day 4',
      },
      {
        original: 'US-143: Repairs assignment shows work orders',
        whatChanged: 'Added AC: "Repair teams can see inspection photos to understand repair needs before arriving."',
        why: 'Stakeholder feedback during Sprint Review. Repairs requested this feature.',
        when: 'Sprint 3 Review → Sprint 4',
      },
      {
        original: 'US-142: Inspection workflow routes to repairs',
        whatChanged: 'Added: "If repair cost exceeds budget threshold, require manager approval before assignment."',
        why: 'Developer asked about budget constraints. Housing defined approval workflow.',
        when: 'Sprint 3, Day 6',
      },
    ],
    slackUpdate: [
      '📊 Sprint 3 Update - Inspection Workflow & Repairs Assignment',
      '',
      '✅ Completed:',
      '• US-142: Inspection workflow (routes voids to repairs)',
      '• US-143: Repairs assignment interface (teams can see and accept work orders)',
      '',
      '🔄 Requirements Updated:',
      '• Added edge case handling: inspector unavailable → reschedule with approval',
      '• Added budget approval: repairs exceeding threshold require manager sign-off',
      '• Clarified partial void scenarios (affects repair types allowed)',
      '',
      '📝 For Next Sprint:',
      '• US-145: Show inspection photos in repairs interface (stakeholder feedback)',
      '• US-146: Bulk assignment for similar repairs (Housing request)',
      '',
      '💬 Questions? Ping me in #housing-voids-programme',
    ],
  },
};
