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
        "Which user story keeps the focus on what the user wants, not what the system does?",
      options: {
        A: "The system saves user progress automatically when inactive.",
        B: "The user can save their application progress and resume later.",
        C: "Auto-save occurs every 60 seconds in the backend.",
      },
      correct: "B",
      feedback: {
        A: "System-focused, not user-focused. Start with what the user can do, not what the system does.",
        B: "Correct — written from the user's perspective. The user is the subject, and the benefit is clear.",
        C: "Technical detail, not a user goal. This belongs in implementation notes, not the user story.",
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
      question: "Which statement best defines the trigger for this action?",
      options: {
        A: "When the claim is submitted, approval begins.",
        B: "After approval, the system saves data.",
        C: "Users can manually start approvals any time.",
      },
      correct: "A",
      feedback: {
        A: "Correct — it identifies the event that starts the process. This is the trigger: submission initiates approval.",
        B: "That describes after-effects, not the trigger. This is what happens AFTER the process completes.",
        C: "That removes the rule-based trigger logic. Approvals should start automatically based on submission, not manual intervention.",
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
      question: "Which version best describes a complete successful flow?",
      options: {
        A: "User clicks Submit, data saves, confirmation appears.",
        B: "System validates input fields.",
        C: "Back-end sends email notifications.",
      },
      correct: "A",
      feedback: {
        A: "Correct — it describes the visible steps of success from start to finish. User action → system response → user feedback.",
        B: "Too narrow; only one validation step. This misses the full journey from user action to confirmation.",
        C: "Focuses on system behaviour, not user journey. Email notifications are internal; users care about the confirmation they see.",
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
        "Which statement correctly describes an alternative flow, not an error?",
      options: {
        A: "The user uploads documents later and the form updates successfully.",
        B: "The system shows an error if no documents uploaded.",
        C: "The app crashes during upload.",
      },
      correct: "A",
      feedback: {
        A: "Correct — valid alternate route that still succeeds. The user achieves their goal through a different path.",
        B: "That's validation, not an alternative flow. Validation enforces rules; alternative flows provide flexibility.",
        C: "That's a failure case, not success. Alternative flows are valid paths to success, not errors.",
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
      question: "Which statement is a validation rule?",
      options: {
        A: "Leave requests over the limit are rejected.",
        B: "System emails HR for every new request.",
        C: "Manager can update profile data.",
      },
      correct: "A",
      feedback: {
        A: "Correct — defines what must be true or enforced. This is a business rule that prevents invalid data.",
        B: "That's workflow, not validation. Emails are notifications, not rules that enforce data integrity.",
        C: "Unrelated action, not rule. This describes a permission, not a validation constraint.",
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
        "Which option correctly applies a role or permission constraint?",
      options: {
        A: "All users can see every request.",
        B: "Only team leads can view their department's requests.",
        C: "System sorts requests alphabetically.",
      },
      correct: "B",
      feedback: {
        A: "Too broad — ignores role restriction. This violates the principle of least privilege and could expose sensitive data.",
        B: "Correct — defines who can access what. Clear role-based access control that protects data and respects hierarchy.",
        C: "That's interface, not permission. Sorting is a UI feature, not an access control rule.",
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
      question: "Which statement describes success feedback?",
      options: {
        A: "'Report submitted successfully' message appears.",
        B: "App freezes after submission.",
        C: "System runs background validations.",
      },
      correct: "A",
      feedback: {
        A: "Correct — user sees a visible confirmation. Clear, immediate, and reassuring. Users know their action succeeded.",
        B: "That's an error. Freezing indicates a problem, not success. This would cause user anxiety and support tickets.",
        C: "That's process detail, not feedback. Background processes are invisible to users; feedback must be visible.",
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
      question: "Which example best handles an error gracefully?",
      options: {
        A: "Show clear message and retry option.",
        B: "Fail silently with no response.",
        C: "Force user to restart the app.",
      },
      correct: "A",
      feedback: {
        A: "Correct — user knows what failed and what to do next. Clear error message + recovery path = good UX and fewer support tickets.",
        B: "No feedback = frustration. Users don't know if their action failed, succeeded, or is still processing. This destroys trust.",
        C: "Harsh recovery path. Restarting the app loses user data and context. Errors should be recoverable without drastic measures.",
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
      question: "Which option best represents an empty state?",
      options: {
        A: "'No applicants yet — new applications appear here.'",
        B: "Table loads with old data.",
        C: "Page stays blank.",
      },
      correct: "A",
      feedback: {
        A: "Correct — sets expectation before data exists. Users understand this is normal and know what to expect when data arrives.",
        B: "Misleading; not empty. Showing old data when expecting new data confuses users and makes them question data freshness.",
        C: "Poor UX; lacks guidance. A blank page looks broken and doesn't tell users what to expect or do next.",
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
        "Which statement best describes a cancel or undo function?",
      options: {
        A: "User clicks Cancel and invoice returns to draft.",
        B: "Invoice automatically deletes itself.",
        C: "Approval continues regardless.",
      },
      correct: "A",
      feedback: {
        A: "Correct — controlled reversal of an action. The user maintains control and can recover from mistakes without data loss.",
        B: "Deletion isn't a safe undo. Users might cancel by mistake and lose their work. Undo should preserve data in a recoverable state.",
        C: "No reversal logic. Users should always have the ability to change their mind before commitment, especially for important actions.",
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

