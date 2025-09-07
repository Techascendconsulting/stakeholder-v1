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
];

/**
 * Play pre-generated audio file
 */
export async function playPreGeneratedAudio(audioId: string): Promise<void> {
  const audioFile = refinementAudioFiles.find(file => file.id === audioId);
  
  if (!audioFile) {
    console.error(`❌ Pre-generated audio not found: ${audioId}`);
    return Promise.reject(new Error(`Audio file not found: ${audioId}`));
  }

  return new Promise((resolve, reject) => {
    const audio = new Audio(audioFile.audioPath);
    
    audio.onended = () => {
      console.log(`🎵 Pre-generated audio completed: ${audioId}`);
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error(`❌ Pre-generated audio error for ${audioId}:`, error);
      console.log(`🔄 Falling back to ElevenLabs for ${audioId}`);
      // Don't reject - let the calling code handle the fallback
      resolve();
    };
    
    console.log(`🎵 Playing pre-generated audio: ${audioId} (${audioFile.speaker})`);
    audio.play().catch((playError) => {
      console.error(`❌ Audio play failed for ${audioId}:`, playError);
      console.log(`🔄 Falling back to ElevenLabs for ${audioId}`);
      // Don't reject - let the calling code handle the fallback
      resolve();
    });
  });
}

/**
 * Get pre-generated audio by speaker and text (for dynamic matching)
 */
export function findPreGeneratedAudio(speaker: string, text: string): PreGeneratedAudio | null {
  // Try exact text match first
  let audioFile = refinementAudioFiles.find(file => 
    file.speaker === speaker && file.text === text
  );
  
  // If no exact match, try partial text match
  if (!audioFile) {
    audioFile = refinementAudioFiles.find(file => 
      file.speaker === speaker && text.includes(file.text.substring(0, 50))
    );
  }
  
  return audioFile || null;
}

/**
 * Check if audio file exists
 */
export function hasPreGeneratedAudio(audioId: string): boolean {
  return refinementAudioFiles.some(file => file.id === audioId);
}
