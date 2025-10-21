// BA Thinking Framework - 10 Core Rules
// Each rule has Learn (multiple choice) and Apply (writing exercise) phases

export interface RuleLearn {
  referenceStory: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
  };
  correct: 'A' | 'B' | 'C';
  feedback: {
    A: string;
    B: string;
    C: string;
  };
}

export interface RuleApply {
  scenario: string;
  prompt: string;
}

export interface Rule {
  name: string;
  learn: RuleLearn;
  apply: RuleApply;
}

export const RULES: Record<string, Rule> = {
  userGoal: {
    name: "User Goal",
    learn: {
      referenceStory:
        "As a parent applying for childcare vouchers, I want to save my application progress midway so I don't have to start over.",
      question:
        "Which statement focuses on what the USER wants, not the system?",
      options: {
        A: "The database stores form data in temporary tables.",
        B: "The user can save their progress and return later without losing data.",
        C: "Auto-save reduces server load by batching requests.",
      },
      correct: "B",
      feedback: {
        A: "Wrong — This describes database architecture, not what the user experiences or wants. Users don't care about temporary tables.",
        B: "Correct — Written from the user's perspective. Focuses on what the user CAN DO (save progress) and the BENEFIT (not losing data).",
        C: "Wrong — This describes a technical performance optimization. Users don't care about server load; they care about not losing their work.",
      },
    },
    apply: {
      scenario:
        "As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.",
      prompt:
        "In one sentence, write the user goal. Start with 'The user can…' or 'The user should be able to…'",
    },
  },

  trigger: {
    name: "Trigger",
    learn: {
      referenceStory:
        "As a finance officer, I want expense approvals to start when a manager submits a claim.",
      question: "What EVENT causes the approval process to start?",
      options: {
        A: "When the Submit Claim button is clicked.",
        B: "Every Monday at 9 AM, the system checks for pending claims.",
        C: "The approval process runs continuously in the background.",
      },
      correct: "A",
      feedback: {
        A: "Correct — A specific user action (clicking Submit) triggers the approval. Clear cause-and-effect relationship.",
        B: "Wrong — This is a scheduled batch process, not an event-driven trigger. The reference story says approval starts WHEN submitted, not on a schedule.",
        C: "Wrong — Continuous background processing has no clear trigger. The story requires a specific event (submission) to initiate approval.",
      },
    },
    apply: {
      scenario:
        "As a maintenance officer, I want an inspection to start once a void property is marked 'ready'.",
      prompt: "Describe the condition that triggers the action.",
    },
  },

  primaryFlow: {
    name: "Primary Flow",
    learn: {
      referenceStory:
        "As a parent, I want to submit my childcare voucher application online so it reaches the review team.",
      question: "What is the COMPLETE happy path from start to finish?",
      options: {
        A: "User fills form → clicks Submit → sees 'Application received' confirmation → application appears in review queue.",
        B: "User receives an email notification after 24 hours.",
        C: "The review team logs into their dashboard daily.",
      },
      correct: "A",
      feedback: {
        A: "Correct — Shows the full user journey: input → action → feedback → outcome. Every step is visible to the user.",
        B: "Wrong — This is a delayed notification, not the primary flow. The primary flow should show immediate steps the user experiences.",
        C: "Wrong — This describes what the review team does, not what the submitting user experiences. Focus on the user from the reference story.",
      },
    },
    apply: {
      scenario:
        "As a HR assistant, I want to add a new employee and submit their details for review.",
      prompt: "Write the main success flow in short, clear steps.",
    },
  },

  alternativeFlow: {
    name: "Alternative Flow",
    learn: {
      referenceStory:
        "As a parent, I want to upload supporting documents later if I don't have them now.",
      question:
        "Which is a valid ALTERNATIVE way to achieve the goal (not an error)?",
      options: {
        A: "User skips document upload now → saves application as draft → uploads documents later → submits successfully.",
        B: "User must upload all documents immediately or the form is rejected.",
        C: "System permanently locks the form if no documents are attached.",
      },
      correct: "A",
      feedback: {
        A: "Correct — Valid alternate route that still ends in success. User achieves the same goal (complete application) through a flexible path.",
        B: "Wrong — This is a rigid requirement, not an alternative flow. Alternative flows provide flexibility, not restrictions.",
        C: "Wrong — This is a failure/error condition. Alternative flows are SUCCESSFUL paths, just different from the primary flow.",
      },
    },
    apply: {
      scenario:
        "As a manager, I can approve requests in bulk instead of individually.",
      prompt: "Describe a valid alternate path that still completes successfully.",
    },
  },

  rulesValidation: {
    name: "Rules & Validation",
    learn: {
      referenceStory:
        "As an HR manager, I want to reject leave requests that exceed remaining allowance.",
      question: "Which rule ENFORCES the business constraint?",
      options: {
        A: "Leave requests cannot exceed the employee's remaining leave balance.",
        B: "The HR dashboard displays all pending leave requests in a table.",
        C: "Employees receive a confirmation email when leave is approved.",
      },
      correct: "A",
      feedback: {
        A: "Correct — This is a validation rule. It defines a constraint that MUST be checked before allowing the action. Prevents invalid data.",
        B: "Wrong — This describes UI display, not a validation rule. Showing data in a table doesn't enforce any business constraint.",
        C: "Wrong — This is a notification, not a validation rule. Emails inform users but don't prevent invalid actions.",
      },
    },
    apply: {
      scenario:
        "As a finance officer, I can't approve expenses above ₦500,000 without director review.",
      prompt:
        "Write one validation or business rule clearly and concisely (no system phrasing).",
    },
  },

  rolesPermissions: {
    name: "Roles & Permissions",
    learn: {
      referenceStory:
        "As a team lead, I want to see only requests from my department.",
      question:
        "Which statement defines WHO can access WHAT?",
      options: {
        A: "Team leads can view and manage requests from their own department only.",
        B: "Requests are displayed in chronological order on the dashboard.",
        C: "The system sends weekly summary reports to all managers.",
      },
      correct: "A",
      feedback: {
        A: "Correct — Defines WHO (team leads) can do WHAT (view and manage) with WHAT SCOPE (their own department). Clear role-based access control.",
        B: "Wrong — This describes UI sorting/display, not permissions. It doesn't define who can or cannot access specific data.",
        C: "Wrong — This is an automated notification feature, not a permission rule. It doesn't restrict or grant access to anyone.",
      },
    },
    apply: {
      scenario:
        "As a compliance officer, I should be able to edit only compliance forms I created.",
      prompt: "Define who can or can't perform this action.",
    },
  },

  feedbackSuccess: {
    name: "Feedback (Success)",
    learn: {
      referenceStory:
        "As a user, I want to see a confirmation once my report is submitted.",
      question: "What should the user SEE when their action succeeds?",
      options: {
        A: "Green checkmark appears with message: 'Report submitted successfully. Reference #12345'",
        B: "Nothing happens on screen, but the report is saved in the database.",
        C: "The page refreshes and shows a blank form.",
      },
      correct: "A",
      feedback: {
        A: "Correct — Clear, visible, immediate confirmation with helpful details (reference number). Users know exactly what happened.",
        B: "Wrong — Silent success is bad UX. Users don't know if it worked, failed, or is still processing. This creates anxiety and duplicate submissions.",
        C: "Wrong — Refreshing to a blank form is confusing. Users don't know if their report was submitted or lost. No confirmation provided.",
      },
    },
    apply: {
      scenario:
        "As a tenant, I want to see a 'Saved successfully' notice after updating my contact info.",
      prompt: "Describe what the user sees or experiences on success.",
    },
  },

  errorHandling: {
    name: "Error Handling",
    learn: {
      referenceStory:
        "As a user, I want to be notified if my upload fails so I can retry.",
      question: "What should happen when the upload FAILS?",
      options: {
        A: "Red error message: 'Upload failed. File too large (max 10MB)' + Retry button.",
        B: "Page goes blank and user has to refresh browser to try again.",
        C: "Upload silently fails and user never knows what happened.",
      },
      correct: "A",
      feedback: {
        A: "Correct — Clear error message (what failed + why) + recovery action (Retry button). User understands the problem and knows how to fix it.",
        B: "Wrong — Terrible UX. Blank page looks like a crash, not a recoverable error. User loses context and doesn't know what went wrong.",
        C: "Wrong — Silent failures are the worst UX. User thinks upload worked but it didn't. This causes confusion, distrust, and support tickets.",
      },
    },
    apply: {
      scenario:
        "As a user, if payment fails, I should see a retry option with reason for failure.",
      prompt: "Describe what happens when something goes wrong.",
    },
  },

  emptyState: {
    name: "Empty / Initial State",
    learn: {
      referenceStory:
        "As a recruiter, I want to see guidance text when there are no applicants yet.",
      question: "What should appear when NO data exists yet?",
      options: {
        A: "Helpful message: 'No applicants yet. New applications will appear here when received.'",
        B: "Spinning loader that never stops.",
        C: "Error message: 'Failed to load applicants. Please try again.'",
      },
      correct: "A",
      feedback: {
        A: "Correct — Sets clear expectation that this is normal (not an error) and explains what will happen when data arrives. Good empty state UX.",
        B: "Wrong — Endless loader implies something is broken or stuck. Empty state is NOT a loading state; it's the normal initial condition.",
        C: "Wrong — Error messages are for failures, not empty states. No applicants is NORMAL, not an error. This creates false alarm and confusion.",
      },
    },
    apply: {
      scenario:
        "As a student, I want to see a friendly message if I haven't submitted assignments yet.",
      prompt: "Describe what should appear before any data exists.",
    },
  },

  cancelUndo: {
    name: "Cancel / Undo",
    learn: {
      referenceStory:
        "As a finance admin, I want to cancel a pending invoice before it's approved.",
      question:
        "How should the user be able to REVERSE their action?",
      options: {
        A: "User clicks 'Cancel Invoice' → Invoice status changes to 'Draft' → User can edit or delete it.",
        B: "Once submitted, invoices cannot be changed under any circumstances.",
        C: "Admin must contact IT support to manually delete the invoice from the database.",
      },
      correct: "A",
      feedback: {
        A: "Correct — User has direct control to reverse their action. Invoice returns to a safe, editable state. No data loss, no support needed.",
        B: "Wrong — Too rigid. Users make mistakes and should be able to correct them before approval. No undo = frustration and workarounds.",
        C: "Wrong — Requiring IT support for user mistakes is terrible UX. Undo should be self-service, immediate, and not require technical intervention.",
      },
    },
    apply: {
      scenario:
        "As a user, I want to undo a comment immediately after posting it.",
      prompt: "Describe how users can safely reverse or cancel their action.",
    },
  },
};

// Helper to get rules in order
export const RULE_ORDER = [
  'userGoal',
  'trigger',
  'primaryFlow',
  'alternativeFlow',
  'rulesValidation',
  'rolesPermissions',
  'feedbackSuccess',
  'errorHandling',
  'emptyState',
  'cancelUndo',
] as const;

export type RuleKey = typeof RULE_ORDER[number];

