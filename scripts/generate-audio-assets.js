#!/usr/bin/env node

/**
 * Audio Asset Generator
 * 
 * This script generates all the audio files for the refinement meeting
 * and stores them as static assets. Users will never need to call ElevenLabs API.
 * 
 * Usage: node scripts/generate-audio-assets.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ElevenLabs configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs
const VOICE_IDS = {
  sarah: 'MzqUf1HbJ8UmQ0wUsx2p',
  bola: 'xeBpkkuzgxa0IwKt7NTP', 
  srikanth: 'wD6AxxDQzhi2E9kMbk9t',
  lisa: '8N2ng9i2uiUWqstgmWlH',
  tom: 'qqBeXuJvzxtQfbsW2f40'
};

// All the audio content that needs to be generated
const AUDIO_CONTENT = [
  {
    id: 'sarah_opening',
    speaker: 'Sarah',
    text: "Good morning everyone. We have 1 story to review today. Bola, would you like to present the first story for us? I'll mark it as refined once we're done discussing it."
  },
  {
    id: 'bola_presentation',
    speaker: 'Bola', 
    text: "Thank you Sarah. I'd like to present our first story for refinement today. Story Title: Tenant can upload attachments to support maintenance request. Description: Currently, tenants can only describe issues in text when submitting a maintenance request. This often leads to missing details and follow-up calls. Allowing them to upload photos or documents will give the housing team clearer context and speed up resolution. User Story: As a tenant, I want to upload a photo or document related to my maintenance issue, So that the housing team has enough context to understand and resolve the problem more efficiently. Acceptance Criteria: 1. Tenant should see an upload field labeled 'Add attachment (optional)' on the maintenance request form. 2. Tenant should be able to upload one or more files to support their request. 3. Accepted file types should include JPG, PNG, and JPEG. If the tenant tries to upload a file in an unsupported format, an error message should be displayed: 'Only JPG, PNG, and JPEG files are allowed.' 4. Maximum file size per upload should be 5 MB. If the file is larger than 5MB, an error message should be displayed: 'File size must not exceed 5MB.' 5. Uploading a file should not be mandatory. The tenant should still be able to submit the request without attaching any files. 6. If a file is uploaded, it should be stored with the rest of the request data and made visible to the maintenance team."
  },
  {
    id: 'srikanth_question',
    speaker: 'Srikanth',
    text: "Bola, quick question - when you mentioned multiple file types, are we talking about users uploading multiple files at once, or just supporting different formats one at a time?"
  },
  {
    id: 'bola_answer',
    speaker: 'Bola',
    text: "Good question Srikanth. Yes, users should be able to upload multiple files at once - up to 5 attachments per maintenance request. So a tenant could upload, for example, 3 photos of the issue, a PDF document with additional details, and a video showing the problem. This gives them flexibility to provide comprehensive evidence for their maintenance request."
  },
  {
    id: 'lisa_technical',
    speaker: 'Lisa',
    text: "Got it, thanks Bola. Srikanth, for the technical implementation, I'm thinking we can reuse our existing file upload component. We'll need to add the file type validation and size checking on the frontend before upload."
  },
  {
    id: 'srikanth_response',
    speaker: 'Srikanth',
    text: "Good point Lisa. We should also consider the backend storage. Are we using the same S3 bucket as our other file uploads? And what about the retry logic if the upload fails partway through?"
  },
  {
    id: 'tom_testing',
    speaker: 'Tom',
    text: "For testing, we'll need to cover the error scenarios - what happens with corrupted files, network timeouts, and storage failures. Should we also test with files right at the 5MB limit?"
  },
  {
    id: 'sarah_sizing',
    speaker: 'Sarah',
    text: "Great discussion everyone. Before we wrap up, let's estimate this story. Given the file validation, multiple uploads, and error handling, I'm thinking this is around 5 story points. What do you think Srikanth?"
  },
  {
    id: 'srikanth_estimate',
    speaker: 'Srikanth',
    text: "Yes, 5 points sounds right. The file validation and error handling add some complexity, but it's mostly reusing existing components."
  },
  {
    id: 'sarah_conclusion',
    speaker: 'Sarah',
    text: "Perfect. I'll mark this story as refined with 5 story points. Thanks everyone for the great discussion. Bola, any final thoughts from the business side?"
  },
  {
    id: 'bola_final',
    speaker: 'Bola',
    text: "Great questions everyone. I'm glad we could clarify the requirements. The story covers the core functionality tenants need - being able to upload photos and documents to support their maintenance requests. This should help our housing team get better context and resolve issues faster. Does anyone have any other questions about the business requirements?"
  }
];

// Create output directory
const OUTPUT_DIR = path.join(__dirname, '../public/audio-assets');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to make ElevenLabs API call
async function generateAudio(text, voiceId, outputPath) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: text,
      model_id: "eleven_turbo_v2",
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.8,
        speaking_rate: 0.9,
        use_speaker_boost: true
      }
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'xi-api-key': ELEVENLABS_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      const file = fs.createWriteStream(outputPath);
      res.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Generated: ${outputPath}`);
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(outputPath, () => {}); // Delete the file on error
        reject(err);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Main function
async function main() {
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🎵 Starting audio asset generation...');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🎤 Total audio files to generate: ${AUDIO_CONTENT.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (const content of AUDIO_CONTENT) {
    try {
      const voiceId = VOICE_IDS[content.speaker.toLowerCase()];
      if (!voiceId) {
        console.error(`❌ No voice ID found for speaker: ${content.speaker}`);
        errorCount++;
        continue;
      }

      const outputPath = path.join(OUTPUT_DIR, `${content.id}.mp3`);
      
      // Skip if file already exists
      if (fs.existsSync(outputPath)) {
        console.log(`⏭️  Skipping existing file: ${content.id}.mp3`);
        successCount++;
        continue;
      }

      console.log(`🎤 Generating audio for ${content.speaker}: ${content.id}`);
      await generateAudio(content.text, voiceId, outputPath);
      successCount++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to generate ${content.id}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Generation Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📁 Files saved to: ${OUTPUT_DIR}`);

  if (errorCount === 0) {
    console.log('\n🎉 All audio assets generated successfully!');
    console.log('💡 Users will now use these pre-generated files instead of calling ElevenLabs API');
  } else {
    console.log('\n⚠️  Some files failed to generate. Check the errors above.');
  }
}

// Run the script
main().catch(console.error);















