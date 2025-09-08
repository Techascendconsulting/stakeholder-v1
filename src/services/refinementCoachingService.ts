/**
 * Coaching Service for Refinement Meeting
 * 
 * Provides educational coaching points that appear during the refinement meeting
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

// Coaching data for Trial 1: Maintenance Request Attachments
export const TRIAL_1_COACHING_DATA: AudioSegmentWithCoaching[] = [
  {
    id: 'sarah-opening',
    speaker: 'Sarah',
    text: "Good morning everyone. We have 1 story to review today. Bola, could you please present the first story for us?",
    coaching: {
      title: "How the Scrum Master Opens",
      body: "The Scrum Master sets the tone and scope: one story, clear outcome. As a BA, notice how this keeps the team focused.",
      useRegex: false,
      placement: "top-right",
      accent: "primary"
    }
  },
  {
    id: 'bola-presentation',
    speaker: 'Bola',
    text: "Thanks Sarah. Let me walk through this quickly. Currently, tenants can only describe issues in text when submitting a maintenance request. This often leads to missing details and follow-up calls. Allowing them to upload photos or documents will give the housing team clearer context and speed up resolution. As a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to understand and resolve the problem more efficiently. Here's what needs to be true: 1. As part of submitting a request, tenants should have the ability to upload attachments and this should be optional. 2. Tenant should be able to upload one or more files to support their request. 3. Accepted file types should include JPG, PNG, and JPEG. If the tenant tries to upload a file in an unsupported format, an error message should be displayed: 'Only JPG, PNG, and JPEG files are allowed.' 4. Maximum file size per upload should be 5 MB. If the file is larger than 5MB, an error message should be displayed: 'File size must not exceed 5MB.' 5. Uploading a file should not be mandatory. The tenant should still be able to submit the request without attaching any files. 6. If a file is uploaded, it should be stored with the rest of the request data and made visible to the maintenance team.",
    coaching: {
      title: "How a BA Frames the Story",
      body: "As a BA, notice how Bola sets the scene: first giving context, then the user story, and finally the acceptance criteria. This gives the team a clear picture before anyone jumps into solutions.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'srikanth-question',
    speaker: 'Srikanth',
    text: "Thanks Bola, that's clear. Just one quick question - when you say 'one or more files', is there a maximum number of files a tenant can upload per request?",
    coaching: {
      title: "Clarifying Boundaries",
      body: "The Tech Lead is checking boundaries. As a BA, your role is to confirm the rule and remove doubt. Clear rules prevent confusion later.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'bola-answer',
    speaker: 'Bola',
    text: "Good question Srikanth. Yes, users should be able to upload multiple files at once - up to 5 attachments per maintenance request. So a tenant could upload, for example, 3 photos of the issue, a PDF document with additional details, and a video showing the problem. This gives them flexibility to provide comprehensive evidence for their maintenance request.",
    coaching: null
  },
  {
    id: 'srikanth-question-2',
    speaker: 'Srikanth',
    text: "OK Bola, that's clear. it means you will need to include PDF in your acceptance criteria",
    coaching: {
      title: "Team Collaboration in Refinement",
      body: "Notice how the team member suggests improving the acceptance criteria. Good refinement is collaborative — the BA should be open to team input.",
      useRegex: false,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'bola-answer-2',
    speaker: 'Bola',
    text: "Good should Srikanth, I will update the acceptance criteria to include PDF, thanks for that",
    coaching: {
      title: "BA Flexibility",
      body: "The BA acknowledges the feedback and commits to updating the story. This shows good collaboration and responsiveness to team input.",
      useRegex: false,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'lisa-technical',
    speaker: 'Lisa',
    text: "Got it, thanks Bola. Srikanth, for the technical implementation, I'm thinking we can reuse our existing file upload component. We'll need to add the file type validation and size checking on the frontend before upload.",
    coaching: {
      title: "Spotting Reuse",
      body: "Developers think in terms of building blocks. As a BA, you should recognise reuse because it often means lower cost and less risk.",
      useRegex: false,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'srikanth-response',
    speaker: 'Srikanth',
    text: "Good point Lisa. For the backend, we can store these in our existing S3 bucket. We'll need to implement proper error handling for failed uploads and maybe add a retry mechanism. The 5MB limit should be fine for images.",
    coaching: {
      title: "Technical Risk Discussion",
      body: "The Tech Lead is thinking about implementation risks and edge cases. As a BA, listen for these discussions — they often reveal hidden complexity.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'tom-testing',
    speaker: 'Tom',
    text: "From a testing perspective, we'll need to test all the edge cases - corrupted files, oversized files, wrong file types. I'll create test cases for the error messages to make sure they're user-friendly.",
    coaching: {
      title: "Making Criteria Testable",
      body: "The Tester is turning acceptance criteria into checks. As a BA, make sure your criteria are written so they can be tested easily.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'sarah-sizing',
    speaker: 'Sarah',
    text: "Great discussion team. Based on what I'm hearing, this feels like a solid 5-point story. Srikanth, as our senior developer, do you agree with that estimate?",
    coaching: {
      title: "Estimation Ritual",
      body: "The Scrum Master reminds the team that story points are about effort, not hours. As a BA, you don't estimate, but you should understand how sizing works.",
      useRegex: false,
      placement: "center",
      accent: "slate"
    }
  },
  {
    id: 'srikanth-confirm',
    speaker: 'Srikanth',
    text: "Yes, I agree with 5 points. The file upload functionality is straightforward, and we can reuse existing components. The main work will be in the validation logic and error handling, but that's manageable.",
    coaching: null
  },
  {
    id: 'sarah-conclude',
    speaker: 'Sarah',
    text: "Perfect! Story estimated at 5 points. I'll mark this as refined and move it to our refined backlog. Great work everyone, this story is ready for sprint planning.",
    coaching: {
      title: "Definition of Refined",
      body: "Consensus means the story is refined: everyone understands it, it's testable, and it has an agreed effort. As a BA, this is the outcome you want from refinement.",
      useRegex: false,
      placement: "bottom-right",
      accent: "slate"
    }
  }
];

// Coaching data for Trial 2: Password Reset Confirmation Email
export const TRIAL_2_COACHING_DATA: AudioSegmentWithCoaching[] = [
  {
    id: 'victor-presentation-2',
    speaker: 'Victor',
    text: "Thanks Sarah. This one's about the password reset flow. Right now, customers see an on‑screen success but don't get a follow‑up email. We want to send a confirmation email after a successful reset so customers know their account was updated and can spot anything suspicious. The user story is: As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot any suspicious activity. Here's what needs to be true: 1. After a successful password reset, an email confirmation should be sent to the user's registered email address. 2. The email should contain a clear subject line indicating the password was reset. 3. The email body should confirm the password change and provide contact information if the user didn't initiate the reset. 4. The email should be sent within 5 minutes of the successful password reset. 5. If the email fails to send, the system should retry once and log the attempt. 6. No sensitive password information should be included in the email.",
    coaching: {
      title: "How a BA Frames the Story",
      body: "As a BA, notice how Victor sets the scene: first giving context, then the user story, and finally the acceptance criteria. This gives the team a clear picture before anyone jumps into solutions.",
      useRegex: true,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'srikanth-check-2',
    speaker: 'Srikanth',
    text: "Just to check, Victor — this only triggers after a successful password change, right? Not after a failed attempt?",
    coaching: {
      title: "Clarifying Boundaries",
      body: "The Tech Lead is checking boundaries. As a BA, your role is to confirm the rule and remove doubt. Clear rules prevent confusion later.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'victor-confirm-2',
    speaker: 'Victor',
    text: "That's right, only when the reset has been completed successfully.",
    coaching: null
  },
  {
    id: 'lisa-email-2',
    speaker: 'Lisa',
    text: "Okay. We can plug into our existing email service. We'll just need a new template. Do we already have wording for that?",
    coaching: {
      title: "Spotting Reuse",
      body: "Developers think in terms of building blocks. As a BA, you should recognise reuse because it often means lower cost and less risk.",
      useRegex: false,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'victor-template-2',
    speaker: 'Victor',
    text: "Yes — subject's 'Your Password Has Been Reset', and the body confirms the change and asks customers to contact support if it wasn't them.",
    coaching: null
  },
  {
    id: 'tom-tests-2',
    speaker: 'Tom',
    text: "I'll need to verify a few things: Email is only sent on successful reset. Subject and body match the template. No password data is exposed. Email goes to the registered address. Do we also need a log entry to show support that the email was sent?",
    coaching: {
      title: "Making Criteria Testable",
      body: "The Tester is turning acceptance criteria into checks. As a BA, make sure your criteria are written so they can be tested easily.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'victor-log-2',
    speaker: 'Victor',
    text: "Yes, good point — a log entry should be created. Let's add that as a note.",
    coaching: {
      title: "Collaboration in Refinement",
      body: "Good refinement is collaborative. The BA updates the story when the team suggests improvements — flexibility is key.",
      useRegex: false,
      placement: "bottom-right",
      accent: "accent"
    }
  },
  {
    id: 'lisa-retry-ask-2',
    speaker: 'Lisa',
    text: "If the email fails to send, should we retry or just log it?",
    coaching: null
  },
  {
    id: 'srikanth-retry-2',
    speaker: 'Srikanth',
    text: "Let's retry once, then log. That keeps it consistent with our other emails.",
    coaching: {
      title: "Resilience Decision",
      body: "This is a resilience decision. As a BA, you ensure such behaviours are documented so everyone understands how the system should act.",
      useRegex: false,
      placement: "bottom-right",
      accent: "primary"
    }
  },
  {
    id: 'sarah-size-2',
    speaker: 'Sarah',
    text: "Great, seems we've clarified the story. Let's size it. Remember, effort not hours. Ready? 3…2…1 — show.",
    coaching: {
      title: "Estimation Ritual",
      body: "The Scrum Master reminds the team that story points are about effort, not hours. As a BA, you don't estimate, but you should understand how sizing works.",
      useRegex: false,
      placement: "center",
      accent: "slate"
    }
  },
  {
    id: 'srikanth-2pts-2',
    speaker: 'Srikanth',
    text: "2 points.",
    coaching: null
  },
  {
    id: 'lisa-2pts-2',
    speaker: 'Lisa',
    text: "2 points as well.",
    coaching: null
  },
  {
    id: 'tom-2pts-2',
    speaker: 'Tom',
    text: "2 points.",
    coaching: null
  },
  {
    id: 'sarah-conclude-2',
    speaker: 'Sarah',
    text: "Perfect, consensus at 2 points. This story is refined and ready for Sprint Planning.",
    coaching: {
      title: "Definition of Refined",
      body: "Consensus means the story is refined: everyone understands it, it's testable, and it has an agreed effort. As a BA, this is the outcome you want from refinement.",
      useRegex: false,
      placement: "bottom-right",
      accent: "slate"
    }
  },
  {
    id: 'sarah-goodbye',
    speaker: 'Sarah',
    text: "Great work team. That concludes refinement for this story.",
    coaching: null
  }
];

/**
 * Get coaching data for a specific trial
 */
export function getCoachingDataForTrial(trialId: string): AudioSegmentWithCoaching[] {
  switch (trialId) {
    case 'trial-1':
      return TRIAL_1_COACHING_DATA;
    case 'trial-2':
      return TRIAL_2_COACHING_DATA;
    default:
      return [];
  }
}

/**
 * Find coaching point for a specific audio segment
 */
export function getCoachingForSegment(segmentId: string, trialId: string): CoachingPoint | null {
  const coachingData = getCoachingDataForTrial(trialId);
  const segment = coachingData.find(s => s.id === segmentId);
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

