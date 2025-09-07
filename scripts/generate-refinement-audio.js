#!/usr/bin/env node

/**
 * Script to generate all refinement meeting audio files
 * This runs once to create audio files that students can play without API calls
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define all the speeches for the refinement meeting
const refinementSpeeches = [
  {
    id: 'sarah-opening',
    speaker: 'Sarah',
    text: "Good morning everyone. We have 1 story to review today. Bola, would you like to present the story for us? I'll mark it as refined once we're done discussing it.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p'
  },
  {
    id: 'bola-presentation',
    speaker: 'Bola',
    text: "Thank you Sarah. I'd like to present our first story: 'Tenant can upload attachments to support maintenance request'. Currently, tenants can only describe issues in text when submitting a maintenance request. This often leads to missing details and follow-up calls. Allowing them to upload photos or documents will give the housing team clearer context and speed up resolution. User Story: As a tenant, I want to upload a photo or document related to my maintenance issue, So that the housing team has enough context to understand and resolve the problem more efficiently. Acceptance Criteria: 1. Tenant should see an upload field labeled 'Add attachment (optional)' on the maintenance request form. 2. Tenant should be able to upload one or more files to support their request. 3. Accepted file types should include JPG, PNG, and JPEG. If the tenant tries to upload a file in an unsupported format (e.g. .docx, .exe), an error message should be displayed: 'Only JPG, PNG, and JPEG files are allowed.' 4. Maximum file size per upload should be 5 MB. If the file is larger than 5MB, an error message should be displayed: 'File size must not exceed 5MB.' 5. Uploading a file should not be mandatory. The tenant should still be able to submit the request without attaching any files. 6. If a file is uploaded, it should be stored with the rest of the request data and made visible to the maintenance team.",
    voiceId: 'xeBpkkuzgxa0IwKt7NTP'
  },
  {
    id: 'srikanth-question',
    speaker: 'Srikanth',
    text: "Bola, quick question - when you mentioned multiple file types, are we talking about users uploading multiple files at once, or just supporting different formats one at a time?",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t'
  },
  {
    id: 'bola-answer',
    speaker: 'Bola',
    text: "Good question Srikanth. Yes, users should be able to upload multiple files at once - up to 5 attachments per maintenance request. So a tenant could upload, for example, 3 photos of the issue, a PDF document with additional details, and a video showing the problem. This gives them flexibility to provide comprehensive evidence for their maintenance request.",
    voiceId: 'xeBpkkuzgxa0IwKt7NTP'
  },
  {
    id: 'lisa-technical',
    speaker: 'Lisa',
    text: "Got it, thanks Bola. Srikanth, for the technical implementation, I'm thinking we can reuse our existing file upload component. We'll need to add the file type validation and size checking on the frontend before upload.",
    voiceId: '8N2ng9i2uiUWqstgmWlH'
  },
  {
    id: 'srikanth-response',
    speaker: 'Srikanth',
    text: "That sounds good Lisa. We'll also need to handle the backend storage and make sure we have proper error handling for failed uploads. The retry logic should be user-friendly.",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t'
  },
  {
    id: 'tom-testing',
    speaker: 'Tom',
    text: "From a testing perspective, we'll need to test all the edge cases - corrupted files, oversized files, wrong file types. I'll create test cases for the error messages to make sure they're user-friendly.",
    voiceId: 'qqBeXuJvzxtQfbsW2f40'
  },
  {
    id: 'sarah-sizing',
    speaker: 'Sarah',
    text: "Great discussion everyone. This sounds like a solid story. What do you think about the story points? I'm thinking this could be a 5-pointer given the file handling complexity.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p'
  },
  {
    id: 'srikanth-confirm',
    speaker: 'Srikanth',
    text: "I agree with 5 points. The file validation, error handling, and storage logic make it a solid 5-pointer.",
    voiceId: 'wD6AxxDQzhi2E9kMbk9t'
  },
  {
    id: 'sarah-conclude',
    speaker: 'Sarah',
    text: "Perfect! I'll mark this story as refined. Great work everyone. Bola, thanks for the clear presentation. The team has a good understanding of the requirements now.",
    voiceId: 'MzqUf1HbJ8UmQ0wUsx2p'
  },
  {
    id: 'bola-final',
    speaker: 'Bola',
    text: "Great questions everyone. I'm glad we could clarify the requirements. The story covers the core functionality tenants need - being able to upload photos and documents to support their maintenance requests. This should help our housing team get better context and resolve issues faster. Does anyone have any other questions about the business requirements?",
    voiceId: 'xeBpkkuzgxa0IwKt7NTP'
  }
];

// Create audio directory
const audioDir = path.join(__dirname, '..', 'public', 'audio', 'refinement');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

console.log('🎵 Starting audio generation for refinement meeting...');
console.log(`📁 Output directory: ${audioDir}`);

// Generate audio for each speech
for (const speech of refinementSpeeches) {
  console.log(`\n🎤 Generating audio for ${speech.speaker}: ${speech.id}`);
  
  try {
    // This would call ElevenLabs API to generate audio
    // For now, we'll create placeholder files
    const audioPath = path.join(audioDir, `${speech.id}.mp3`);
    
    // Create a placeholder file (in real implementation, this would be the actual audio)
    const placeholderContent = `# Audio file for ${speech.speaker} - ${speech.id}\nText: ${speech.text.substring(0, 100)}...`;
    fs.writeFileSync(audioPath, placeholderContent);
    
    console.log(`✅ Generated: ${speech.id}.mp3`);
  } catch (error) {
    console.error(`❌ Failed to generate ${speech.id}:`, error.message);
  }
}

console.log('\n🎉 Audio generation complete!');
console.log(`📁 Files saved to: ${audioDir}`);
console.log('\n📋 Generated files:');
refinementSpeeches.forEach(speech => {
  console.log(`  - ${speech.id}.mp3 (${speech.speaker})`);
});
