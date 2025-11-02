// src/content/userStoryWalkthrough.ts
export const WalkthroughContent = {
  meta: {
    version: "1.0",
    title: "User Stories & Acceptance Criteria Walkthrough",
    subtitle: "Learn by comparing bad vs good, then practice with real scenarios.",
  },

  // -------------------------
  // SCENARIOS (match your acronyms & cards)
  // -------------------------
  scenarios: [
    {
      id: "COP",
      name: "Customer Onboarding Portal",
      context: `A new customer applies online. The flow is long (KYC + documents). Users lose progress if the session drops.`,
      personas: [
        { name: "Amaka", role: "Applicant", goal: "Finish onboarding without losing work" },
        { name: "Ops Analyst", role: "Back-office", goal: "Receive complete, valid applications" }
      ],
      glossary: ["KYC", "Document upload", "Auto-save", "Progress resume"],
      constraints: ["Low bandwidth users", "Mobile first", "Compliance audit logs"],

      stories: [
        {
          id: "COP-1",
          title: "Auto-save progress",
          userStory: "As an applicant, I want my form to auto-save while I type so that I don't lose progress if something interrupts me.",
          badACs: [
            "Auto-save works and restores and no errors happen.",
            "There is an auto-save button somewhere on the top right."
          ],
          goodACs: {
            bullets: [
              "When auto-save triggers after inactivity, the system shows a visible 'Saved' confirmation message.",
              "If the browser/tab closes, the next session resumes at the last saved step.",
              "If saving fails, an error message appears and unsaved fields are highlighted; typed data remains visible."
            ],
            gherkin: [
`Scenario: Auto-save after inactivity
  Given I am completing the onboarding form
  And I have typed in a field
  When I stop typing
  Then my progress is automatically saved
  And I see a visible 'Saved' indicator`,

`Scenario: Resume after interruption
  Given I previously saved progress on Step 3
  When I reopen the onboarding portal
  Then I am taken to Step 3
  And my previously entered answers are prefilled`,

`Scenario: Save failure does not lose data
  Given the network drops during auto-save
  When saving fails
  Then I see an error message
  And my typed data remains on screen
  And the field(s) needing attention are highlighted`
            ]
          }
        },
        {
          id: "COP-2",
          title: "Document upload validation",
          userStory: "As an applicant, I want clear rules for document uploads so that my submission is accepted on the first try.",
          badACs: [
            "Uploads work for any file and any size.",
            "User sees nice UI while uploading (spinner, progress)."
          ],
          goodACs: {
            bullets: [
              "Accept formats: PDF/JPG/PNG only; reject others with message including allowed types.",
              "Max size per file: 10 MB; show readable error if exceeded.",
              "Show upload progress and success/fail state for each file.",
              "On success, file name and size are shown with a remove action."
            ],
            gherkin: [
`Scenario: Reject unsupported file
  Given I attach a .docx file
  When I submit
  Then I see 'Unsupported format: PDF, JPG, PNG only'
  And the file is not uploaded`,

`Scenario: Enforce file size limit
  Given I attach a 15 MB PDF
  When I submit
  Then I see 'Max 10 MB per file'
  And the file is not uploaded`
            ]
          }
        }
      ]
    },

    {
      id: "DEM",
      name: "Daily Expense Management",
      context: `Employees submit expenses for reimbursement with receipts and policy checks.`,
      personas: [
        { name: "Kola", role: "Employee", goal: "Get reimbursed fast without rework" },
        { name: "Toyin", role: "Approver", goal: "Approve valid expenses quickly" }
      ],
      glossary: ["Per diem", "Receipt OCR", "Policy violation"],
      constraints: ["Mobile receipts", "Monthly limits"],

      stories: [
        {
          id: "DEM-1",
          title: "Receipt OCR and prefill",
          userStory: "As an employee, I want receipt data auto-extracted so that I don't have to type totals and dates.",
          badACs: ["OCR extracts everything perfectly.", "UI is nice and modern."],
          goodACs: {
            bullets: [
              "When a receipt image is uploaded, date and total are auto-filled if confidence ≥ 0.8.",
              "If confidence < 0.8, fields remain blank and a 'Please confirm' note appears.",
              "Users can edit any prefilled field; edits are saved."
            ],
            gherkin: [
`Scenario: High confidence extraction
  Given I upload a clear receipt image
  When OCR confidence is 0.9
  Then the 'date' and 'total' fields are auto-filled
  And I can edit them if needed`,

`Scenario: Low confidence extraction
  Given I upload a blurry receipt image
  When OCR confidence is 0.6
  Then 'date' and 'total' remain blank
  And I see 'Please confirm' beside those fields`
            ]
          }
        },
        {
          id: "DEM-2",
          title: "Policy violation warnings",
          userStory: "As an employee, I want to be warned about policy issues so that I can correct them before submission.",
          badACs: ["Block all violations with an error.", "Approver will figure it out."],
          goodACs: {
            bullets: [
              "If per-item > policy limit, show inline warning with limit amount.",
              "Submission allowed with warnings but requires justification text.",
              "Approver sees the same flagged items and justification."
            ]
          }
        }
      ]
    },

    {
      id: "MIM",
      name: "Manufacturing Inventory Management",
      context: `Warehouse needs real-time stock levels and automatic re-order suggestions.`,
      personas: [
        { name: "Ada", role: "Inventory Manager", goal: "Avoid stockouts" },
        { name: "Tunde", role: "Procurement", goal: "Receive accurate reorder lists" }
      ],
      glossary: ["Reorder point", "Lead time", "SKU"],

      stories: [
        {
          id: "MIM-1",
          title: "Low stock alerts",
          userStory: "As an inventory manager, I want alerts when stock drops below reorder point so that I can reorder on time.",
          badACs: ["Alert when stock is low or high or medium.", "System should be fast."],
          goodACs: {
            bullets: [
              "Alert triggers when `onHand <= reorderPoint`.",
              "Alert includes SKU, current onHand, reorderPoint, and recommended orderQty.",
              "No duplicate alerts within 24 hours per SKU."
            ]
          }
        },
        {
          id: "MIM-2",
          title: "Reorder suggestion generation",
          userStory: "As procurement, I want a daily reorder list so that I can create POs quickly.",
          badACs: ["Create the best reorder list.", "Use AI to decide everything."],
          goodACs: {
            bullets: [
              "Generate one list at 08:00 daily with SKUs needing reorder.",
              "Suggested quantity = (targetStock - onHand) rounded up to pack size.",
              "Download CSV with columns: SKU, onHand, reorderPoint, suggestedQty."
            ]
          }
        }
      ]
    },

    {
      id: "CSM",
      name: "Customer Support Management",
      context: `Support reps handle tickets with SLAs and escalations.`,
      personas: [
        { name: "Reza", role: "Support Rep", goal: "Resolve within SLA" },
        { name: "Shade", role: "Team Lead", goal: "Track breaches and escalations" }
      ],
      glossary: ["SLA", "Breach", "Escalation"],

      stories: [
        {
          id: "CSM-1",
          title: "SLA timers & breach flags",
          userStory: "As a support rep, I want a visible timer on each ticket so that I can avoid SLA breaches.",
          badACs: ["Timer shows and everything is fine.", "No ticket should ever breach."],
          goodACs: {
            bullets: [
              "Timer counts down to SLA deadline based on ticket priority.",
              "When remaining time < 15 minutes, show orange warning; on breach, show red 'Breached'.",
              "Breach events are logged with timestamp."
            ]
          }
        },
        {
          id: "CSM-2",
          title: "Escalation workflow",
          userStory: "As a team lead, I want auto-escalation on breach so that high-risk tickets are prioritized.",
          badACs: ["Escalate all tickets.", "Send many emails to everyone."],
          goodACs: {
            bullets: [
              "On breach, change owner to 'Escalation Queue' and notify team lead.",
              "Add an 'Escalated' tag and record the previous owner.",
              "Do not re-escalate the same ticket twice within 1 hour."
            ]
          }
        }
      ]
    },

    {
      id: "EPM",
      name: "Event/Project Management",
      context: `Coordinators manage tasks, due dates, and reminders for events.`,
      personas: [
        { name: "Chioma", role: "Coordinator", goal: "Keep tasks on track" },
        { name: "James", role: "Contributor", goal: "Know what to do and when" }
      ],
      glossary: ["Task dependency", "Reminder window"],

      stories: [
        {
          id: "EPM-1",
          title: "Task reminders",
          userStory: "As a coordinator, I want automatic reminders before due dates so that tasks don't slip.",
          badACs: ["Remind users frequently.", "Send push, SMS, email for everything."],
          goodACs: {
            bullets: [
              "Default reminders at 72h and 24h before due date.",
              "Assignees can opt-out per task; opt-out persists.",
              "Reminders list the task, due date, and a direct link."
            ]
          }
        },
        {
          id: "EPM-2",
          title: "Task dependency blocking",
          userStory: "As a contributor, I want dependent tasks blocked until prerequisites are done so that I don't waste time.",
          badACs: ["Block everything until manager says go.", "Complex rule engine."],
          goodACs: {
            bullets: [
              "If Task B depends on Task A, 'Start' on B is disabled until A is 'Done'.",
              "Hover explains dependency; link opens Task A.",
              "Audit log records when dependency is cleared."
            ]
          }
        }
      ]
    }
  ],

  // -------------------------
  // ACCEPTANCE CRITERIA WALKTHROUGH (8 rules)
  // Each rule is a teaching card: title, why, bad vs good, and a short exercise.
  // -------------------------
  acWalkthrough: [
    {
      id: "AC-1",
      rule: "One expectation per AC",
      why: "Atomic ACs are easier to test and don't hide failures.",
      badExample: "Auto-save works AND resume works AND no errors happen.",
      goodExamples: [
        "Auto-save triggers after inactivity and shows a 'Saved' indicator.",
        "Next session resumes at last saved step.",
        "On save failure, data is not lost and an error is shown."
      ],
      exercise: {
        type: "split",
        prompt: "Split this multi-part AC into 3 separate ACs.",
        seed: "User can upload PDF and JPG and PNG and gets progress and no errors."
      }
    },
    {
      id: "AC-2",
      rule: "Make it observable and measurable",
      why: "Testers must see pass/fail objectively.",
      badExample: "The page loads quickly.",
      goodExamples: [
        "When I upload a document, the system displays a confirmation message once it is saved."
      ],
      exercise: { type: "rewrite", prompt: "Rewrite this AC to be observable to a user.", seed: "The upload is fast." }
    },
    {
      id: "AC-3",
      rule: "State preconditions and postconditions",
      why: "Without starting state, results can't be reproduced.",
      badExample: "When I resume, I see my progress.",
      goodExamples: [
        "Given I previously saved Step 3, when I return, then I land on Step 3 with fields prefilled."
      ],
      exercise: { type: "gherkin", prompt: "Add Given/When/Then for the auto-save resume case." }
    },
    {
      id: "AC-4",
      rule: "Cover unhappy and edge paths",
      why: "Most defects hide in failure cases.",
      badExample: "Upload succeeds.",
      goodExamples: [
        "If the file type is unsupported, show 'PDF/JPG/PNG only' and do not upload.",
        "If the file size > 10 MB, show limit error and do not upload."
      ],
      exercise: { type: "list", prompt: "List two failure cases for document upload." }
    },
    {
      id: "AC-5",
      rule: "Avoid UI/implementation details",
      why: "Stories describe behavior, not specific UI widgets.",
      badExample: "There is a green 'Save' button in the top right.",
      goodExamples: [
        "Progress is auto-saved after 5 seconds of inactivity and a visible indicator confirms it."
      ],
      exercise: { type: "toggle", prompt: "Mark each statement as 'Behavior' or 'UI detail'." }
    },
    {
      id: "AC-6",
      rule: "Include data rules and limits",
      why: "Boundaries prevent ambiguity and security issues.",
      badExample: "Accept files of any size.",
      goodExamples: [
        "Max file size is 10 MB; larger files are rejected with an error.",
        "Only PDF/JPG/PNG allowed."
      ],
      exercise: { type: "rewrite", prompt: "Add proper bounds for 'Name' field length and character set." }
    },
    {
      id: "AC-7",
      rule: "Cover validation and business rules in ACs",
      why: "ACs should clearly describe business validations that must happen before a user can complete an action.",
      badExample: "Form accepts any date value.",
      goodExamples: [
        "Date of birth must not be in the future.",
        "Expense amount must not exceed the policy limit unless justification is provided."
      ],
      exercise: { type: "rewrite", prompt: "Write ACs to validate an email address field.", seed: "Email can be any text." }
    },
    {
      id: "AC-8",
      rule: "Trace to the user and value",
      why: "ACs should confirm the outcome the user cares about.",
      badExample: "Create database index for tickets table.",
      goodExamples: [
        "When I filter tickets by priority, I see only tickets with that priority and a total count of matches."
      ],
      exercise: { type: "map", prompt: "Rewrite the AC to express value to the user, not the technical change." }
    }
  ],

  // (Optional) light-weight heuristics if you score free-text ACs later
  scoringHints: {
    flags: {
      multiAnd: "Contains ' and ' 2+ times (likely multi-part).",
      vague: "Contains vague adjectives (fast, easy, nice) with no metric.",
      noGiven: "No 'Given/When/Then' structure in a Gherkin task."
    },
    positives: {
      measurable: "Contains a verifiable outcome (visible message, state change, specific data rule).",
      stateful: "Mentions preconditions or postconditions (resume at Step 3).",
      failureCases: "Includes at least one negative path."
    }
  }
};
