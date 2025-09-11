/**
 * Coaching Service for Sprint Planning Meeting
 * 
 * Provides educational coaching points that appear during the sprint planning meeting
 * to help students understand Scrum best practices and BA techniques.
 */

export interface CoachingPoint {
  title: string;
  body: string;
  useRegex: boolean;
  placement: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  accent: 'primary' | 'accent' | 'slate';
}

export interface AudioSegmentWithCoaching {
  id: string;
  speaker: string;
  text: string;
  coaching?: CoachingPoint | null;
}

// Coaching data for Sprint Planning Meeting
export const SPRINT_PLANNING_COACHING_DATA: AudioSegmentWithCoaching[] = [
  {
    id: 'sarah-opening-planning',
    speaker: 'Sarah',
    text: "Welcome everyone. This is our Sprint Planning session. Our aim today is to agree on a Sprint Goal and decide which backlog items we can commit to for the sprint. Victor, can you walk us through the Sprint Goal?",
    coaching: {
      title: "Planning = Goal + Commitment",
      body: "The Scrum Master frames Sprint Planning as agreeing a Sprint Goal and what the team will commit to. As a BA, keep the discussion anchored to the goal and defer new refinement.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'victor-goal',
    speaker: 'Victor',
    text: "Thanks Sarah. The Sprint Goal I'd like to propose is: Strengthen account security and verification—send confirmation after password resets and deliver the basic ID upload step. We have three refined backlog items on top: the tenant maintenance attachments, the password reset confirmation email, and the ID upload verification feature.",
    coaching: {
      title: "Sprint Goal Connects the Work",
      body: "Victor states a clear goal up front. As a BA, check each candidate story supports this goal and be ready to reshuffle or slice items that don't cleanly fit.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'tom-capacity',
    speaker: 'Tom',
    text: "From QA, I can handle the full regression and story testing, but if we take on too much edge-case work, it may spill over.",
    coaching: {
      title: "Capacity Sets the Boundaries",
      body: "Dev and QA capacity comes before picking stories. As a BA, listen for constraints—days off, test load—and be ready to trim scope or split stories.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'victor-attachments',
    speaker: 'Victor',
    text: "The first item is Tenant can upload attachments to support maintenance requests. The user story: As a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to resolve the problem efficiently. It's already refined with file size and type rules.",
    coaching: {
      title: "Refined Items Move Fast",
      body: "Because AC already cover file size and types, the team can decide quickly. Good refinement speeds up Sprint Planning.",
      useRegex: false,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'sarah-attachments',
    speaker: 'Sarah',
    text: "Great. Sounds like we're aligned. Let's commit this story to the sprint.",
    coaching: {
      title: "Commitment = Move to Sprint Backlog",
      body: "When the team agrees, the card moves to the Sprint Backlog. As a BA, confirm Definition of Ready (clear AC, testability, no blockers).",
      useRegex: false,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'victor-password',
    speaker: 'Victor',
    text: "Next is Password Reset Confirmation Email. User story: As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot suspicious activity. This was sized at 2 points.",
    coaching: {
      title: "Small, Clear Stories Build Momentum",
      body: "This is a low-risk item with tight AC (subject line, no secrets, logging). As a BA, highlight the clarity so the team can commit confidently.",
      useRegex: false,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'sarah-password',
    speaker: 'Sarah',
    text: "Excellent. Let's move this into the sprint backlog as well.",
    coaching: {
      title: "Balance Big and Small",
      body: "Mixing smaller items with a larger one helps the sprint stay predictable. As a BA, aim for a balanced set that fits capacity.",
      useRegex: false,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'victor-idupload',
    speaker: 'Victor',
    text: "The last one is ID Upload Verification. The user story: As a customer, I want to upload my ID online so that I can complete my account verification. This is more advanced — it involves fraud detection and business rules.",
    coaching: {
      title: "Call Out Complexity Early",
      body: "ID upload involves fraud rules and integrations. As a BA, name the complexity so the team can decide if slicing is needed.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'tom-idupload',
    speaker: 'Tom',
    text: "True, Testing all fraud scenarios in one sprint isn't realistic. We risk rolling over.",
    coaching: {
      title: "QA Signals Risk",
      body: "Testing all fraud scenarios in one sprint is heavy. As a BA, use QA feedback to justify slicing and narrow the initial scope.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'sarah-slice',
    speaker: 'Sarah',
    text: "Good point. Let's slice this. Maybe take only the basic upload form this sprint, and defer fraud detection rules.",
    coaching: {
      title: "Slice by Vertical Value",
      body: "Take a thin, valuable slice: basic upload form + storage now; defer fraud checks. As a BA, propose a slice that still delivers user value.",
      useRegex: false,
      placement: "bottom-right",
      accent: "slate"
    }
  },
  {
    id: 'victor-slice',
    speaker: 'Victor',
    text: "Yes, that makes sense. Let's commit the base ID upload capability, Sarah please go ahead and add the story to the sprint backlog, I will amend the acceptance criteri, and create a follow-up story for fraud checks.",
    coaching: {
      title: "BA Owns the Update",
      body: "Agree to the slice, amend acceptance criteria, and create a follow-up story for fraud rules. Keep traceability clear.",
      useRegex: false,
      placement: "bottom-right",
      accent: "slate"
    }
  },
  {
    id: 'sarah-idcommit',
    speaker: 'Sarah',
    text: "Perfect. We'll commit the sliced version to this sprint.",
    coaching: {
      title: "Commit the Slice",
      body: "Once agreed, the sliced story is committed. As a BA, ensure the board shows the new card name and links to the follow-up story.",
      useRegex: false,
      placement: "bottom-right",
      accent: "slate"
    }
  },
  {
    id: 'sarah-recap',
    speaker: 'Sarah',
    text: "To recap: our Sprint Goal is to improve verification and account processes. We've committed three items — the attachment feature, the password reset confirmation email, and a sliced version of ID upload. Together, these fit our capacity and align with the goal.",
    coaching: {
      title: "Goal–Backlog Alignment",
      body: "End by restating the Sprint Goal and exactly which stories were committed. As a BA, this locks the plan and builds shared understanding.",
      useRegex: false,
      placement: "bottom-right",
      accent: "slate"
    }
  },
  {
    id: 'sarah-close',
    speaker: 'Sarah',
    text: "Great collaboration. This sprint is now planned. Let's get ready to start tomorrow with confidence.",
    coaching: {
      title: "Planning Complete",
      body: "Clarity beats volume. The team leaves with a focused goal and a realistic backlog. As a BA, publish the Sprint Goal and links to committed items.",
      useRegex: false,
      placement: "bottom-right",
      accent: "slate"
    }
  }
];

/**
 * Find coaching point for a specific audio segment
 */
export function getCoachingForSegment(segmentId: string): CoachingPoint | null {
  const segment = SPRINT_PLANNING_COACHING_DATA.find(s => s.id === segmentId);
  return segment?.coaching || null;
}

/**
 * Check if text matches coaching trigger (simplified matching)
 */
export function shouldShowCoaching(currentText: string, coaching: CoachingPoint, segmentText: string): boolean {
  // For now, always show coaching if we have a coaching point for this segment
  // The audio ID matching is sufficient to determine if coaching should show
  return true;
}





