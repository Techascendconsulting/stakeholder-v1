#!/usr/bin/env node

/**
 * Complete Audio Generation Script for Refinement Meeting
 * 
 * This script generates all 28 MP3 files needed for the refinement meeting
 * using ElevenLabs TTS API. It includes both Trial 1 and Trial 2 scenarios.
 * 
 * Usage: node scripts/generate-refinement-audio.js
 * 
 * Requirements:
 * - ELEVENLABS_API_KEY environment variable
 * - Node.js with fetch support
 * - Write permissions to public/audio/refinement/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'refinement');

// Voice IDs for each team member
const VOICE_IDS = {
  'Sarah': 'MzqUf1HbJ8UmQ0wUsx2p',      // Scrum Master
  'Bola': 'xeBpkkuzgxa0IwKt7NTP',       // Business Analyst (Trial 1)
  'Victor': 'neMPCpWtBwWZhxEC8qpe',     // Business Analyst (Trial 2) - Victor's own voice
  'Srikanth': 'wD6AxxDQzhi2E9kMbk9t',   // Senior Developer
  'Lisa': '8N2ng9i2uiUWqstgmWlH',       // Developer
  'Tom': 'qqBeXuJvzxtQfbsW2f40'         // QA Tester
};

// Complete transcript with all 27 audio files
const AUDIO_FILES = [
  // Trial 1: File Upload Story (Bola presents)
  {
    id: 'sarah-opening',
    speaker: 'Sarah',
    text: "Good morning everyone. We have 1 story to review today. Bola, could you please present the first story for us?",
    voiceId: VOICE_IDS.Sarah
  },
  // Trial 2: Password Reset Story (Victor presents)
  {
    id: 'sarah-opening-2',
    speaker: 'Sarah',
    text: "Good morning everyone. We have 1 story to review today. Victor, could you please present the first story for us?",
    voiceId: VOICE_IDS.Sarah
  },
  {
    id: 'bola-presentation',
    speaker: 'Bola',
    text: "Thanks Sarah. Let me walk through this quickly. Currently, tenants can only describe issues in text when submitting a maintenance request. This often leads to missing details and follow-up calls. Allowing them to upload photos or documents will give the housing team clearer context and speed up resolution. As a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to understand and resolve the problem more efficiently. Here's what needs to be true: 1. As part of submitting a request, tenants should have the ability to upload attachments and this should be optional. 2. Tenant should be able to upload one or more files to support their request. 3. Accepted file types should include JPG, PNG, and JPEG. If the tenant tries to upload a file in an unsupported format, an error message should be displayed: 'Only JPG, PNG, and JPEG files are allowed.' 4. Maximum file size per upload should be 5 MB. If the file is larger than 5MB, an error message should be displayed: 'File size must not exceed 5MB.' 5. Uploading a file should not be mandatory. The tenant should still be able to submit the request without attaching any files. 6. If a file is uploaded, it should be stored with the rest of the request data and made visible to the maintenance team.",
    voiceId: VOICE_IDS.Bola
  },
  {
    id: 'srikanth-question',
    speaker: 'Srikanth',
    text: "Thanks Bola, that's clear. Just one quick question - when you say 'one or more files', is there a maximum number of files a tenant can upload per request?",
    voiceId: VOICE_IDS.Srikanth
  },
  {
    id: 'bola-answer',
    speaker: 'Bola',
    text: "Good question Srikanth. Yes, users should be able to upload multiple files at once - up to 5 attachments per maintenance request. So a tenant could upload, for example, 3 photos of the issue, a PDF document with additional details, and a video showing the problem. This gives them flexibility to provide comprehensive evidence for their maintenance request.",
    voiceId: VOICE_IDS.Bola
  },
  {
    id: 'srikanth-question-2',
    speaker: 'Srikanth',
    text: "OK Bola, that's clear. it means you will need to include PDF in your acceptance criteria",
    voiceId: VOICE_IDS.Srikanth
  },
  {
    id: 'bola-answer-2',
    speaker: 'Bola',
    text: "Good should Srikanth, I will update the acceptance criteria to include PDF, thanks for that",
    voiceId: VOICE_IDS.Bola
  },
  {
    id: 'lisa-technical',
    speaker: 'Lisa',
    text: "Got it, thanks Bola. Srikanth, for the technical implementation, I'm thinking we can reuse our existing file upload component. We'll need to add the file type validation and size checking on the frontend before upload.",
    voiceId: VOICE_IDS.Lisa
  },
  {
    id: 'srikanth-response',
    speaker: 'Srikanth',
    text: "Good point Lisa. For the backend, we can store these in our existing S3 bucket. We'll need to implement proper error handling for failed uploads and maybe add a retry mechanism. The 5MB limit should be fine for images.",
    voiceId: VOICE_IDS.Srikanth
  },
  {
    id: 'tom-testing',
    speaker: 'Tom',
    text: "From a testing perspective, we'll need to test all the edge cases - corrupted files, oversized files, wrong file types. I'll create test cases for the error messages to make sure they're user-friendly.",
    voiceId: VOICE_IDS.Tom
  },
  {
    id: 'sarah-sizing',
    speaker: 'Sarah',
    text: "Great discussion team. Based on what I'm hearing, this feels like a solid 5-point story. Srikanth, as our senior developer, do you agree with that estimate?",
    voiceId: VOICE_IDS.Sarah
  },
  {
    id: 'srikanth-confirm',
    speaker: 'Srikanth',
    text: "Yes, I agree with 5 points. The file upload functionality is straightforward, and we can reuse existing components. The main work will be in the validation logic and error handling, but that's manageable.",
    voiceId: VOICE_IDS.Srikanth
  },
  {
    id: 'sarah-conclude',
    speaker: 'Sarah',
    text: "Perfect! Story estimated at 5 points. I'll mark this as refined and move it to our refined backlog. Great work everyone, this story is ready for sprint planning.",
    voiceId: VOICE_IDS.Sarah
  },

  // Trial 2: Password Reset Story (Victor presents)
  {
    id: 'victor-presentation-2',
    speaker: 'Victor',
    text: "Thanks Sarah. This one's about the password reset flow. Right now, customers see an on‑screen success but don't get a follow‑up email. We want to send a confirmation email after a successful reset so customers know their account was updated and can spot anything suspicious. The user story is: As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot any suspicious activity. Here's what needs to be true: 1. After a successful password reset, an email confirmation should be sent to the user's registered email address. 2. The email should contain a clear subject line indicating the password was reset. 3. The email body should confirm the password change and provide contact information if the user didn't initiate the reset. 4. The email should be sent within 5 minutes of the successful password reset. 5. If the email fails to send, the system should retry once and log the attempt. 6. No sensitive password information should be included in the email.",
    voiceId: VOICE_IDS.Victor
  },
  {
    id: 'srikanth-check-2',
    speaker: 'Srikanth',
    text: "Just to check, Victor — this only triggers after a successful password change, right? Not after a failed attempt?",
    voiceId: VOICE_IDS.Srikanth
  },
  {
    id: 'victor-confirm-2',
    speaker: 'Victor',
    text: "That's right, only when the reset has been completed successfully.",
    voiceId: VOICE_IDS.Victor
  },
  {
    id: 'lisa-email-2',
    speaker: 'Lisa',
    text: "Okay. We can plug into our existing email service. We'll just need a new template. Do we already have wording for that?",
    voiceId: VOICE_IDS.Lisa
  },
  {
    id: 'victor-template-2',
    speaker: 'Victor',
    text: "Yes — subject's 'Your Password Has Been Reset', and the body confirms the change and asks customers to contact support if it wasn't them.",
    voiceId: VOICE_IDS.Victor
  },
  {
    id: 'tom-tests-2',
    speaker: 'Tom',
    text: "I'll need to verify a few things: Email is only sent on successful reset. Subject and body match the template. No password data is exposed. Email goes to the registered address. Do we also need a log entry to show support that the email was sent?",
    voiceId: VOICE_IDS.Tom
  },
  {
    id: 'victor-log-2',
    speaker: 'Victor',
    text: "Yes, good point — a log entry should be created. Let's add that as a note.",
    voiceId: VOICE_IDS.Victor
  },
  {
    id: 'lisa-retry-ask-2',
    speaker: 'Lisa',
    text: "If the email fails to send, should we retry or just log it?",
    voiceId: VOICE_IDS.Lisa
  },
  {
    id: 'srikanth-retry-2',
    speaker: 'Srikanth',
    text: "Let's retry once, then log. That keeps it consistent with our other emails.",
    voiceId: VOICE_IDS.Srikanth
  },
  {
    id: 'sarah-size-2',
    speaker: 'Sarah',
    text: "Great, seems we've clarified the story. Let's size it. Remember, effort not hours. Ready? 3…2…1 — show.",
    voiceId: VOICE_IDS.Sarah
  },
  {
    id: 'srikanth-2pts-2',
    speaker: 'Srikanth',
    text: "2 points.",
    voiceId: VOICE_IDS.Srikanth
  },
  {
    id: 'lisa-2pts-2',
    speaker: 'Lisa',
    text: "2 points as well.",
    voiceId: VOICE_IDS.Lisa
  },
  {
    id: 'tom-2pts-2',
    speaker: 'Tom',
    text: "2 points.",
    voiceId: VOICE_IDS.Tom
  },
  {
    id: 'sarah-conclude-2',
    speaker: 'Sarah',
    text: "Perfect, consensus at 2 points. This story is refined and ready for Sprint Planning.",
    voiceId: VOICE_IDS.Sarah
  },

  // Common ending
  {
    id: 'sarah-goodbye',
    speaker: 'Sarah',
    text: "Great work team. That concludes refinement for this story.",
    voiceId: VOICE_IDS.Sarah
  }
];

// Utility functions
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function cleanMarkdownForTTS(text) {
  return text
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '') // Remove italic markers
    .replace(/^#+\s*/gm, '') // Remove markdown headers
    .replace(/^\d+\.\s*/gm, '') // Remove numbered list formatting
    .replace(/^-\s*/gm, '') // Remove bullet points
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
    .replace(/`([^`]+)`/g, '$1') // Remove code formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .trim();
}

async function generateAudio(text, voiceId, outputPath) {
  const cleanText = cleanMarkdownForTTS(text);
  
  console.log(`🎵 Generating audio for: ${path.basename(outputPath)}`);
  console.log(`📝 Text length: ${cleanText.length} characters`);
  console.log(`🎤 Voice ID: ${voiceId}`);
  
  try {
    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
          speaking_rate: 0.9
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    
    const fileSize = (audioBuffer.byteLength / 1024).toFixed(1);
    console.log(`✅ Generated: ${path.basename(outputPath)} (${fileSize} KB)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate ${path.basename(outputPath)}:`, error.message);
    return false;
  }
}

async function generateAllAudio() {
  console.log('🚀 Starting Refinement Meeting Audio Generation');
  console.log(`📊 Total files to generate: ${AUDIO_FILES.length}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🔑 API Key configured: ${ELEVENLABS_API_KEY ? 'Yes' : 'No'}`);
  console.log('');

  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY environment variable is required');
    process.exit(1);
  }

  // Ensure output directory exists
  ensureDirectoryExists(OUTPUT_DIR);

  let successCount = 0;
  let failureCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < AUDIO_FILES.length; i++) {
    const audioFile = AUDIO_FILES[i];
    const outputPath = path.join(OUTPUT_DIR, `${audioFile.id}.mp3`);
    
    console.log(`\n[${i + 1}/${AUDIO_FILES.length}] Processing: ${audioFile.id}`);
    console.log(`👤 Speaker: ${audioFile.speaker}`);
    
    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping (already exists): ${path.basename(outputPath)}`);
      successCount++;
      continue;
    }

    const success = await generateAudio(audioFile.text, audioFile.voiceId, outputPath);
    
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Add a small delay to avoid rate limiting
    if (i < AUDIO_FILES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`⏱️  Total time: ${duration} seconds`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All audio files generated successfully!');
    console.log('🎵 The refinement meeting is ready to run with zero API calls.');
  } else {
    console.log(`\n⚠️  ${failureCount} files failed to generate. Check the errors above.`);
  }

  // Generate a summary file
  const summaryPath = path.join(OUTPUT_DIR, 'generation-summary.json');
  const summary = {
    generatedAt: new Date().toISOString(),
    totalFiles: AUDIO_FILES.length,
    successful: successCount,
    failed: failureCount,
    duration: `${duration} seconds`,
    files: AUDIO_FILES.map(file => ({
      id: file.id,
      speaker: file.speaker,
      voiceId: file.voiceId,
      textLength: file.text.length,
      outputPath: `${file.id}.mp3`
    }))
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📄 Summary saved to: ${path.basename(summaryPath)}`);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllAudio().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

export { generateAllAudio, AUDIO_FILES, VOICE_IDS };