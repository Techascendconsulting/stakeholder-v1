import React from 'react';

interface TeachingStep {
  title: string;
  content: string;
}

const teachingSteps: TeachingStep[] = [
  {
    title: 'User Stories Training',
    content: `How to Write User Stories and Acceptance Criteria That Actually Get Built

When you walk into sprint planning and someone asks, "What exactly are we building?" your story should speak for itself. It should describe value clearly, for one person, in one moment — and it should never need a follow-up meeting to explain.

A user story is a short, simple promise of value from the user's perspective. It's not a spec, not a task list, and definitely not a design. It's a clear expression of who wants what, and why. As a Business Analyst, writing user stories well is how you make sure what gets delivered is aligned to the need. And it's how you keep Agile projects flowing.`
  },
  {
    title: 'What Is a User Story?',
    content: `A user story is a small chunk of work that delivers something meaningful to the user. In Agile, it represents a slice of value that a developer can build and a tester can verify. In Waterfall, stories often sit below larger functional requirements as detailed tasks or testable behaviours.

The classic format is:

As a [type of user]
I want to [do something]
So that [I get a benefit]

Example (Agile eCommerce project)
As a returning shopper, I want to reuse my saved address so I can check out faster without retyping it.

Example (Waterfall HR system project)
As an HR admin, I want to export payroll data to Excel so I can process monthly salaries.`
  },
  {
    title: 'INVEST: The 6 Criteria for a Strong User Story',
    content: `A well-written story passes the INVEST test. This checklist helps ensure that your story is worth writing and delivering. These aren't just abstract principles; they are what make stories actually buildable and testable in the real world.

Let's break them down with examples:

I = Independent
The story can be delivered on its own without relying on other stories.
Instead of: "As a customer, I want to track my order so I can know its status" (which depends on having order history first)
Try: "As a customer, I want to view my recent order confirmation so I can keep a record of what I purchased."

N = Negotiable
It isn't set in stone. The story is a conversation starter, not a fixed contract.
Example: A BA might write the story, but developers can suggest whether it's better to use a banner or a modal for an alert.

V = Valuable
The user or business gets a visible benefit.
If the story is only for code cleanup or API changes with no user impact, it might be a task, not a user story.
Good: "As a tenant, I want to download my rent receipts so I can track my payments."

E = Estimable
The team can size it because the scope is clear.
If devs say, "We can't estimate this yet," the story may be missing rules, formats, or decisions.
Fix: Add acceptance criteria or stakeholder clarifications.

S = Small
It fits within a sprint. If the AC looks like a full spec, split it.
Big: "As a user, I want a full dashboard with analytics, trends, downloads, sharing, and email alerts."
Small slice: "As a user, I want to see my daily usage in a line chart so I can track activity trends."

T = Testable
You can verify it through clear outcomes.
Weak: "The system should be fast."
Better: "After clicking 'Submit', I receive a confirmation within 5 seconds."

You can use INVEST to review each story before putting it into Jira, or even to improve stories written by someone else. If any part of INVEST fails, clarify with the stakeholder or split the story.`
  },
  {
    title: 'How It Fits in Agile and Scrum',
    content: `In Agile (especially Scrum), user stories live on the Product Backlog. During Refinement, they are discussed and shaped. During Sprint Planning, developers commit to delivering them. And during the Sprint Review, they demo the story to prove it's done.

The Business Analyst helps:
• Shape the story to be testable and small enough to deliver
• Clarify the purpose of the story
• Write or support the creation of acceptance criteria
• Ensure the story aligns with business needs and sprint goals

How It Fits in Waterfall
In a Waterfall environment, you may not use the word "user story", but you will still:
• Capture what users want to do (scenarios or functional requirements)
• Break requirements down into testable conditions
• Ensure each requirement delivers a specific business outcome
• You can still apply user story thinking to break up long documents into manageable, verifiable chunks.

Where Does Jira Come In?
In most companies using Agile, user stories are written directly in Jira. Each Jira story includes:
• The story title and description (your "As a..., I want..., so that..." format)
• Acceptance criteria (how we know it's done)
• Tags (like "Frontend", "Backend", "API")
• Story points (to estimate complexity)
• Status (To Do, In Progress, In Review, Done, etc.)

BAs often:
• Draft stories and review them with the team
• Add attachments (flows, mockups, requirements docs)
• Link stories to Epics and Features
• Ensure all acceptance criteria are visible and agreed`
  },
  {
    title: 'What Are Acceptance Criteria?',
    content: `Acceptance criteria (AC) are the conditions that must be true for a story to be accepted as complete. They turn vague ideas into checkable statements.

Think of AC like the referee's rulebook. They help developers know what to build and testers know what to verify.

Format:
AC are usually written as simple, user-facing behaviours:
• If I do X, I see Y
• If input is invalid, I get an error message
• When I complete the process, I receive confirmation

Example:
Story: As a tenant, I want to upload a photo when reporting an issue so the housing team can understand the problem.

Acceptance Criteria:
• I can upload one or more image files (.jpg, .png)
• If the file is too large (over 5MB), I see an error message
• Upload is optional; I can still submit without a photo
• After upload, the image preview is shown on the form`
  },
  {
    title: 'More Worked Examples',
    content: `Example 1: Healthcare Portal (Doctor Appointments)

Story: As a patient, I want to book an appointment with my GP online so I don't have to call the clinic.

Acceptance Criteria:
• I can view available slots for the selected GP
• I can choose a date and time and receive confirmation
• If no slots are available, I see an appropriate message
• I can cancel or reschedule from the booking summary
• If I double-book, I receive a warning and cannot proceed

Why it matters: This prevents unnecessary calls, reduces wait time, and improves user experience. Each AC ties directly to real-world frustrations.

Example 2: Banking App (Mobile Notifications)

Story: As a customer, I want to receive a push notification after each transaction so I can monitor my account activity in real time.

Acceptance Criteria:
• After any debit or credit, I receive a push notification within 10 seconds
• The notification includes the amount, merchant name, and remaining balance
• If notifications are disabled in settings, none are sent
• If network is offline, the notification is sent when back online
• If multiple transactions occur at once, I receive a summary alert

Why it matters: These ACs make sure the feature is reliable, timely, and respects user preferences — all while being testable.`
  }
];

interface TeachingLayerProps {
  onStartPractice: () => void;
}

export default function TeachingLayer({ onStartPractice }: TeachingLayerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        📚 User Stories Training
      </h1>

      <div className="space-y-6">
        {teachingSteps.map((step, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 transition hover:shadow-xl hover:scale-[1.02] duration-200"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{step.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={onStartPractice}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Start Practice →
        </button>
      </div>
    </div>
  );
}
