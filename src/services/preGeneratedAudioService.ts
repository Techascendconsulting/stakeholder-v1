/**
 * Service for managing pre-generated audio files
 * This allows students to play high-quality ElevenLabs voices without API calls
 */

export interface PreGeneratedAudio {
  id: string;
  speaker: string;
  text: string;
  voiceId: string;
  audioPath: string;
}

// Define all pre-generated audio files for the refinement meeting
export const refinementAudioFiles: PreGeneratedAudio[] = [
  {
    id: 'sarah-opening',
    speaker: 'Sarah',
    text: "Good morning everyone. We have 1 story to review today. Bola, would you like to present the story for us? I'll mark it as refined once we're done discussing it.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/refinement/sarah-opening.mp3'
  },
  {
    id: 'sarah-opening-2',
    speaker: 'Sarah',
    text: "Good morning everyone. We have 1 story to review today. Victor, would you like to present the story for us? I'll mark it as refined once we're done discussing it.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/refinement/sarah-opening-2.mp3'
  },
  {
    id: 'bola-presentation',
    speaker: 'Bola',
    text: "Thank you Sarah. I'd like to present our first story: 'Tenant can upload attachments to support maintenance request'. Currently, tenants can only describe issues in text when submitting a maintenance request. This often leads to missing details and follow-up calls. Allowing them to upload photos or documents will give the housing team clearer context and speed up resolution. The User Story says As a tenant, I want to upload a photo or document related to my maintenance issue, So that the housing team has enough context to understand and resolve the problem more efficiently. Acceptance Criteria: 1. As part of submitting a request, tenants should have the ability to upload attachments and this should be optional. 2. Tenant should be able to upload one or more files to support their request. 3. Accepted file types should include JPG, PNG, and JPEG. If the tenant tries to upload a file in an unsupported format (e.g. .docx, .exe), an error message should be displayed: 'Only JPG, PNG, and JPEG files are allowed.' 4. Maximum file size per upload should be 5 MB. If the file is larger than 5MB, an error message should be displayed: 'File size must not exceed 5MB.' 5. Uploading a file should not be mandatory. The tenant should still be able to submit the request without attaching any files. 6. If a file is uploaded, it should be stored with the rest of the request data and made visible to the maintenance team.",
    voiceId: 'xeBpkkuzgxa0IwKt7NTP',
    audioPath: '/audio/refinement/bola-presentation.mp3'
  },
  {
    id: 'srikanth-question',
    speaker: 'Srikanth',
    text: "Thanks Bola, that's clear. Just one quick question - when you say 'one or more files', is there a maximum number of files a tenant can upload per request?",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/refinement/srikanth-question.mp3'
  },
  {
    id: 'bola-answer',
    speaker: 'Bola',
    text: "Good question Srikanth. Yes, users should be able to upload multiple files at once - up to 5 attachments per maintenance request. So a tenant could upload, for example, 3 photos of the issue, a PDF document with additional details, and a video showing the problem. This gives them flexibility to provide comprehensive evidence for their maintenance request.",
    voiceId: 'xeBpkkuzgxa0IwKt7NTP',
    audioPath: '/audio/refinement/bola-answer.mp3'
  },
  {
    id: 'srikanth-question-2',
    speaker: 'Srikanth',
    text: "OK Bola, that's clear. it means you will need to include PDF in your acceptance criteria",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/refinement/srikanth-question-2.mp3'
  },
  {
    id: 'bola-answer-2',
    speaker: 'Bola',
    text: "Good should Srikanth, I will update the acceptance criteria to include PDF, thanks for that",
    voiceId: 'xeBpkkuzgxa0IwKt7NTP',
    audioPath: '/audio/refinement/bola-answer-2.mp3'
  },
  {
    id: 'lisa-technical',
    speaker: 'Lisa',
    text: "Got it, thanks Bola. Srikanth, for the technical implementation, I'm thinking we can reuse our existing file upload component. We'll need to add the file type validation and size checking on the frontend before upload.",
    voiceId: '8N2ng9i2uiUWqstgmWlH',
    audioPath: '/audio/refinement/lisa-technical.mp3'
  },
  {
    id: 'srikanth-response',
    speaker: 'Srikanth',
    text: "That sounds good Lisa. We'll also need to handle the backend storage and make sure we have proper error handling for failed uploads. The retry logic should be user-friendly.",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/refinement/srikanth-response.mp3'
  },
  {
    id: 'tom-testing',
    speaker: 'Tom',
    text: "From a testing perspective, we'll need to test all the edge cases - corrupted files, oversized files, wrong file types. I'll create test cases for the error messages to make sure they're user-friendly.",
    voiceId: 'qqBeXuJvzxtQfbsW2f40',
    audioPath: '/audio/refinement/tom-testing.mp3'
  },
  {
    id: 'sarah-sizing',
    speaker: 'Sarah',
    text: "Great discussion everyone. This sounds like a solid story. What do you think about the story points? I'm thinking this could be a 5-pointer given the file handling complexity.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/refinement/sarah-sizing.mp3'
  },
  {
    id: 'srikanth-confirm',
    speaker: 'Srikanth',
    text: "I agree with 5 points. The file validation, error handling, and storage logic make it a solid 5-pointer.",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/refinement/srikanth-confirm.mp3'
  },
  {
    id: 'sarah-conclude',
    speaker: 'Sarah',
    text: "Perfect! I'll mark this story as refined. Great work everyone. Bola, thanks for the clear presentation. The team has a good understanding of the requirements now.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/refinement/sarah-conclude.mp3'
  },
  // Trial 2: Password Reset Confirmation Email
  {
    id: 'victor-presentation-2',
    speaker: 'Victor',
    text: "Thanks Sarah. This one's about the password reset flow. Right now, customers see an on‑screen success but don't get a follow‑up email. We want to send a confirmation email after a successful reset so customers know their account was updated and can spot anything suspicious. The user story is: As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot any suspicious activity. Here's what needs to be true: 1. After a successful password reset, an email confirmation should be sent to the user's registered email address. 2. The email should contain a clear subject line indicating the password was reset. 3. The email body should confirm the password change and provide contact information if the user didn't initiate the reset. 4. The email should be sent within 5 minutes of the successful password reset. 5. If the email fails to send, the system should retry once and log the attempt. 6. No sensitive password information should be included in the email.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/refinement/victor-presentation-2.mp3'
  },
  {
    id: 'srikanth-check-2',
    speaker: 'Srikanth',
    text: "Just to check, Victor — this only triggers after a successful password change, right? Not after a failed attempt?",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/refinement/srikanth-check-2.mp3'
  },
  {
    id: 'victor-confirm-2',
    speaker: 'Victor',
    text: "That's right, only when the reset has been completed successfully.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/refinement/victor-confirm-2.mp3'
  },
  {
    id: 'lisa-email-2',
    speaker: 'Lisa',
    text: "Okay. We can plug into our existing email service. We'll just need a new template. Do we already have wording for that?",
    voiceId: '8N2ng9i2uiUWqstgmWlH',
    audioPath: '/audio/refinement/lisa-email-2.mp3'
  },
  {
    id: 'victor-template-2',
    speaker: 'Victor',
    text: "Yes — subject's 'Your Password Has Been Reset', and the body confirms the change and asks customers to contact support if it wasn't them.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/refinement/victor-template-2.mp3'
  },
  {
    id: 'tom-tests-2',
    speaker: 'Tom',
    text: "I'll need to verify a few things: Email is only sent on successful reset. Subject and body match the template. No password data is exposed. Email goes to the registered address. Do we also need a log entry to show support that the email was sent?",
    voiceId: 'qqBeXuJvzxtQfbsW2f40',
    audioPath: '/audio/refinement/tom-tests-2.mp3'
  },
  {
    id: 'victor-log-2',
    speaker: 'Victor',
    text: "Yes, good point — a log entry should be created. Let's add that as a note.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/refinement/victor-log-2.mp3'
  },
  {
    id: 'lisa-retry-ask-2',
    speaker: 'Lisa',
    text: "If the email fails to send, should we retry or just log it?",
    voiceId: '8N2ng9i2uiUWqstgmWlH',
    audioPath: '/audio/refinement/lisa-retry-ask-2.mp3'
  },
  {
    id: 'srikanth-retry-2',
    speaker: 'Srikanth',
    text: "Let's retry once, then log. That keeps it consistent with our other emails.",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/refinement/srikanth-retry-2.mp3'
  },
  {
    id: 'sarah-size-2',
    speaker: 'Sarah',
    text: "Great, seems we've clarified the story. Let's size it. Remember, effort not hours. Ready? 3…2…1 — show.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/refinement/sarah-size-2.mp3'
  },
  {
    id: 'srikanth-2pts-2',
    speaker: 'Srikanth',
    text: "2 points.",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/refinement/srikanth-2pts-2.mp3'
  },
  {
    id: 'lisa-2pts-2',
    speaker: 'Lisa',
    text: "2 points as well.",
    voiceId: '8N2ng9i2uiUWqstgmWlH',
    audioPath: '/audio/refinement/lisa-2pts-2.mp3'
  },
  {
    id: 'tom-2pts-2',
    speaker: 'Tom',
    text: "2 points.",
    voiceId: 'qqBeXuJvzxtQfbsW2f40',
    audioPath: '/audio/refinement/tom-2pts-2.mp3'
  },
  {
    id: 'sarah-conclude-2',
    speaker: 'Sarah',
    text: "Perfect, consensus at 2 points. This story is refined and ready for Sprint Planning.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/refinement/sarah-conclude-2.mp3'
  },
  {
    id: 'sarah-goodbye',
    speaker: 'Sarah',
    text: "Great work team. That concludes refinement for this story.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/refinement/sarah-goodbye.mp3'
  }
];

// Define all pre-generated audio files for the Sprint Planning meeting
export const sprintPlanningAudioFiles: PreGeneratedAudio[] = [
  // 1. Opening
  {
    id: 'sarah-opening',
    speaker: 'Sarah',
    text: "Welcome everyone. This is our Sprint Planning session. Our aim today is to agree on a Sprint Goal and decide which backlog items we can commit to for the sprint. Victor, can you walk us through the Sprint Goal?",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/planning/sarah-opening.mp3'
  },
  
  // 2. Sprint Goal
  {
    id: 'victor-goal',
    speaker: 'Victor',
    text: "Thanks Sarah. The Sprint Goal I'd like to propose is: Strengthen account security and verification—send confirmation after password resets and deliver the basic ID upload step. We have three refined backlog items on top: the tenant maintenance attachments, the password reset confirmation email, and the ID upload verification feature.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/planning/victor-goal.mp3'
  },
  
  // 3. Capacity Check
  {
    id: 'sarah-capacity',
    speaker: 'Sarah',
    text: "Great. Before we start pulling stories, let's quickly confirm capacity. Srikanth, how's the dev side looking this sprint?",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/planning/sarah-capacity.mp3'
  },
  
  // 4. Dev Capacity
  {
    id: 'srikanth-capacity',
    speaker: 'Srikanth',
    text: "On the dev side, we have our full team except for Lisa taking a day off. That means about 80% of our usual capacity. I'd say around 20 story points.",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/planning/srikanth-capacity.mp3'
  },
  
  // 5. Dev Capacity Input
  {
    id: 'lisa-capacity',
    speaker: 'Lisa',
    text: "Yes, that's about right. I think we can take 2 medium stories and one larger one if we slice it properly.",
    voiceId: '8N2ng9i2uiUWqstgmWlH',
    audioPath: '/audio/planning/lisa-capacity.mp3'
  },
  
  // 6. QA Capacity
  {
    id: 'tom-capacity',
    speaker: 'Tom',
    text: "From QA, I can handle the full regression and story testing, but if we take on too much edge-case work, it may spill over.",
    voiceId: 'qqBeXuJvzxtQfbsW2f40',
    audioPath: '/audio/planning/tom-capacity.mp3'
  },
  
  // 7. Transition to First Story
  {
    id: 'sarah-transition',
    speaker: 'Sarah',
    text: "Alright, let's look at the first item together.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/planning/sarah-transition.mp3'
  },
  
  // 8. Story 1: Attachments Recap
  {
    id: 'victor-attachments',
    speaker: 'Victor',
    text: "The first item is Tenant can upload attachments to support maintenance requests. The user story: As a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to resolve the problem efficiently. It's already refined with file size and type rules.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/planning/victor-attachments.mp3'
  },
  
  // 9. Attachments Feasibility
  {
    id: 'srikanth-attachments',
    speaker: 'Srikanth',
    text: "From dev, we can reuse our file upload component. Backend will go into S3, so this is straightforward.",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/planning/srikanth-attachments.mp3'
  },
  
  // 10. Attachments Test Scope
  {
    id: 'tom-attachments',
    speaker: 'Tom',
    text: "For QA, I'll cover oversized files, wrong formats, and multiple uploads. Should fit fine.",
    voiceId: 'qqBeXuJvzxtQfbsW2f40',
    audioPath: '/audio/planning/tom-attachments.mp3'
  },
  
  // 11. Attachment Commitment
  {
    id: 'sarah-attachments',
    speaker: 'Sarah',
    text: "Great. Sounds like we're aligned. Let's commit this story to the sprint.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/planning/sarah-attachments.mp3'
  },
  
  // 12. Story 2: Password Reset Recap
  {
    id: 'victor-password',
    speaker: 'Victor',
    text: "Next is Password Reset Confirmation Email. User story: As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot suspicious activity. This was sized at 2 points.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/planning/victor-password.mp3'
  },
  
  // 13. Password Reset Effort
  {
    id: 'lisa-password',
    speaker: 'Lisa',
    text: "Very small effort. We just add a template to our existing email service.",
    voiceId: '8N2ng9i2uiUWqstgmWlH',
    audioPath: '/audio/planning/lisa-password.mp3'
  },
  
  // 14. Password Reset Testing
  {
    id: 'tom-password',
    speaker: 'Tom',
    text: "Low test effort too. I just need to check subject, body, no password leakage, and logging.",
    voiceId: 'qqBeXuJvzxtQfbsW2f40',
    audioPath: '/audio/planning/tom-password.mp3'
  },
  
  // 15. Password Reset Commitment
  {
    id: 'sarah-password',
    speaker: 'Sarah',
    text: "Excellent. Let's move this into the sprint backlog as well.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/planning/sarah-password.mp3'
  },
  
  // 16. Story 3: ID Upload Intro
  {
    id: 'victor-idupload',
    speaker: 'Victor',
    text: "The last one is ID Upload Verification. The user story: As a customer, I want to upload my ID online so that I can complete my account verification. This is more advanced — it involves fraud detection and business rules.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/planning/victor-idupload.mp3'
  },
  
  // 17. ID Upload Concern
  {
    id: 'srikanth-idupload',
    speaker: 'Srikanth',
    text: "This could be too big for one sprint. Fraud checks and integrations are complex implementations for the sprint considering capacity and testing",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t',
    audioPath: '/audio/planning/srikanth-idupload.mp3'
  },
  
  // 18. ID Upload Test Concern
  {
    id: 'tom-idupload',
    speaker: 'Tom',
    text: "True, Testing all fraud scenarios in one sprint isn't realistic. We risk rolling over.",
    voiceId: 'qqBeXuJvzxtQfbsW2f40',
    audioPath: '/audio/planning/tom-idupload.mp3'
  },
  
  // 19. Suggestion to Slice
  {
    id: 'sarah-slice',
    speaker: 'Sarah',
    text: "Good point. Let's slice this. Maybe take only the basic upload form this sprint, and defer fraud detection rules.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/planning/sarah-slice.mp3'
  },
  
  // 20. Agreement to Slice
  {
    id: 'victor-slice',
    speaker: 'Victor',
    text: "Yes, that makes sense. Let's commit the base ID upload capability, Sarah please go ahead and add the story to the sprint backlog, I will amend the acceptance criteri, and create a follow-up story for fraud checks.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/planning/victor-slice.mp3'
  },
  
  // 21. Feasibility of Slice
  {
    id: 'lisa-slice',
    speaker: 'Lisa',
    text: "That's much more manageable. We can do the form, validation, and storage within this sprint.",
    voiceId: '8N2ng9i2uiUWqstgmWlH',
    audioPath: '/audio/planning/lisa-slice.mp3'
  },
  
  // 22. ID Upload Commitment
  {
    id: 'sarah-idcommit',
    speaker: 'Sarah',
    text: "Perfect. We'll commit the sliced version to this sprint.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/planning/sarah-idcommit.mp3'
  },
  
  // 23. Sprint Recap
  {
    id: 'sarah-recap',
    speaker: 'Sarah',
    text: "To recap: our Sprint Goal is to improve verification and account processes. We've committed three items — the attachment feature, the password reset confirmation email, and a sliced version of ID upload. Together, these fit our capacity and align with the goal.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/planning/sarah-recap.mp3'
  },
  
  // 24. Closing Acknowledgement
  {
    id: 'victor-close',
    speaker: 'Victor',
    text: "Thanks everyone. I'm confident this sprint will deliver real improvements for both customers and the housing team.",
    voiceId: 'neMPCpWtBwWZhxEC8qpe',
    audioPath: '/audio/planning/victor-close.mp3'
  },
  
  // 25. Closing
  {
    id: 'sarah-close',
    speaker: 'Sarah',
    text: "Great collaboration. This sprint is now planned. Let's get ready to start tomorrow with confidence.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p',
    audioPath: '/audio/planning/sarah-close.mp3'
  }
];

/**
 * Play pre-generated audio file
 */
export async function playPreGeneratedAudio(audioId: string): Promise<void> {
  // Try refinement audio first, then sprint planning audio
  let audioFile = refinementAudioFiles.find(file => file.id === audioId);
  
  if (!audioFile) {
    audioFile = sprintPlanningAudioFiles.find(file => file.id === audioId);
  }
  
  if (!audioFile) {
    console.error(`❌ Pre-generated audio not found: ${audioId}`);
    return Promise.reject(new Error(`Audio file not found: ${audioId}`));
  }

  return new Promise((resolve, reject) => {
    const audio = new Audio(audioFile.audioPath);
    
    // Track this audio element globally
    trackAudioElement(audio);
    
    audio.onended = () => {
      console.log(`🎵 Pre-generated audio completed: ${audioId}`);
      // Remove from tracking when completed
      activeAudioElements = activeAudioElements.filter(a => a !== audio);
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error(`❌ Pre-generated audio error for ${audioId}:`, error);
      console.log(`🔄 Falling back to ElevenLabs for ${audioId}`);
      // Remove from tracking on error
      activeAudioElements = activeAudioElements.filter(a => a !== audio);
      // Reject so the calling code knows to fall back to ElevenLabs
      reject(new Error(`Pre-generated audio failed: ${audioId}`));
    };
    
    console.log(`🎵 Playing pre-generated audio: ${audioId} (${audioFile.speaker})`);
    audio.play().catch((playError) => {
      console.error(`❌ Audio play failed for ${audioId}:`, playError);
      console.log(`🔄 Falling back to ElevenLabs for ${audioId}`);
      // Remove from tracking on play error
      activeAudioElements = activeAudioElements.filter(a => a !== audio);
      // Reject so the calling code knows to fall back to ElevenLabs
      reject(new Error(`Audio play failed: ${audioId}`));
    });
  });
}

/**
 * Get pre-generated audio by speaker and text (for dynamic matching)
 */
export function findPreGeneratedAudio(speaker: string, text: string): PreGeneratedAudio | null {
  // Try refinement audio first
  let audioFile = refinementAudioFiles.find(file => 
    file.speaker === speaker && file.text === text
  );
  
  // If no exact match in refinement, try sprint planning audio
  if (!audioFile) {
    audioFile = sprintPlanningAudioFiles.find(file => 
      file.speaker === speaker && file.text === text
    );
  }
  
  // If no exact match, try partial text match in refinement
  if (!audioFile) {
    audioFile = refinementAudioFiles.find(file => 
      file.speaker === speaker && text.includes(file.text.substring(0, 50))
    );
  }
  
  // If no partial match in refinement, try sprint planning audio
  if (!audioFile) {
    audioFile = sprintPlanningAudioFiles.find(file => 
      file.speaker === speaker && text.includes(file.text.substring(0, 50))
    );
  }
  
  return audioFile || null;
}

/**
 * Check if audio file exists
 */
export function hasPreGeneratedAudio(audioId: string): boolean {
  return refinementAudioFiles.some(file => file.id === audioId) || 
         sprintPlanningAudioFiles.some(file => file.id === audioId);
}

// Global audio tracking
let activeAudioElements: HTMLAudioElement[] = [];

// Global function to stop all audio
export function stopAllAudio(): void {
  // Stop tracked audio elements
  activeAudioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  
  // Stop any other audio elements on the page
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  
  // Clear the tracking array
  activeAudioElements = [];
  console.log('🔇 Stopped all audio elements');
}

// Function to track audio elements
export function trackAudioElement(audio: HTMLAudioElement): void {
  activeAudioElements.push(audio);
}
