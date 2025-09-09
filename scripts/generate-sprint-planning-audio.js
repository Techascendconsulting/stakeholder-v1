import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Voice IDs - Make sure these match the correct voices
const VOICE_IDS = {
  Sarah: 'MzqUf1HbJ8UmQ0wUsx2p',     // Sarah (Scrum Master)
  Victor: 'neMPCpWtBwWZhxEC8qpe',    // Victor (BA/PO)
  Srikanth: 'wD6AxxDQzhi2E9kMbk9t',  // Srikanth (Tech Lead)
  Lisa: '8N2ng9i2uiUWqstgmWlH',      // Lisa (Developer)
  Tom: 'qqBeXuJvzxtQfbsW2f40'        // Tom (QA Tester)
};

// Sprint Planning Meeting Audio Segments
// Based on the complete Sprint Planning script with drag-and-drop triggers
const SPRINT_PLANNING_AUDIO_SEGMENTS = [
  // Opening & Goal Setting
  {
    id: 'sarah-opening',
    speaker: 'Sarah',
    text: "Welcome everyone. This is our Sprint Planning session. Our goal today is to agree on a Sprint Goal and decide which backlog items we can commit to for the sprint. Victor, can you walk us through the Sprint Goal?",
    dragAction: null
  },
  {
    id: 'victor-goal',
    speaker: 'Victor',
    text: "Thanks Sarah. The Sprint Goal I'd like to propose is: Improve security and user experience by strengthening verification and account processes. We have three refined backlog items on top: the tenant maintenance attachments, the password reset confirmation email, and the ID upload verification feature.",
    dragAction: null
  },
  
  // Capacity Discussion
  {
    id: 'sarah-capacity',
    speaker: 'Sarah',
    text: "Great. Before we start pulling stories, let's quickly confirm capacity. Srikanth, how's the dev side looking this sprint?",
    dragAction: null
  },
  {
    id: 'srikanth-capacity',
    speaker: 'Srikanth',
    text: "On the dev side, we have our full team except for Lisa taking a day off. That means about 80% of our usual capacity. I'd say around 20 story points.",
    dragAction: null
  },
  {
    id: 'lisa-capacity',
    speaker: 'Lisa',
    text: "Yes, that's about right. I think we can take 2 medium stories and one larger one if we slice it properly.",
    dragAction: null
  },
  {
    id: 'tom-capacity',
    speaker: 'Tom',
    text: "From QA, I can handle the full regression and story testing, but if we take on too much edge-case work, it may spill over.",
    dragAction: null
  },
  
  // Story 1: Maintenance Attachments
  {
    id: 'sarah-transition',
    speaker: 'Sarah',
    text: "Alright, let's look at the first item together.",
    dragAction: 'move-maintenance-to-discussing' // Sarah moves Maintenance Request Attachments to Currently Discussing
  },
  {
    id: 'victor-attachments',
    speaker: 'Victor',
    text: "The first item is Tenant can upload attachments to support maintenance requests. The user story: As a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to resolve the problem efficiently. It's already refined with file size and type rules.",
    dragAction: null
  },
  {
    id: 'srikanth-attachments',
    speaker: 'Srikanth',
    text: "From dev, we can reuse our file upload component. Backend will go into S3, so this is straightforward.",
    dragAction: null
  },
  {
    id: 'tom-attachments',
    speaker: 'Tom',
    text: "For QA, I'll cover oversized files, wrong formats, and multiple uploads. Should fit fine.",
    dragAction: null
  },
  {
    id: 'sarah-attachments',
    speaker: 'Sarah',
    text: "Great. Sounds like we're aligned. Let's commit this story to the sprint.",
    dragAction: 'move-maintenance-to-sprint' // Sarah moves to Sprint Backlog
  },
  
  // Story 2: Password Reset
  {
    id: 'victor-password',
    speaker: 'Victor',
    text: "Next is Password Reset Confirmation Email. User story: As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot suspicious activity. This was sized at 3 points.",
    dragAction: 'move-password-to-discussing' // Sarah moves Password Reset to Currently Discussing
  },
  {
    id: 'lisa-password',
    speaker: 'Lisa',
    text: "Very small effort. We just add a template to our existing email service.",
    dragAction: null
  },
  {
    id: 'tom-password',
    speaker: 'Tom',
    text: "Low test effort too. I just need to check subject, body, no password leakage, and logging.",
    dragAction: null
  },
  {
    id: 'sarah-password',
    speaker: 'Sarah',
    text: "Excellent. Let's move this into the sprint backlog as well.",
    dragAction: 'move-password-to-sprint' // Sarah moves to Sprint Backlog
  },
  
  // Story 3: ID Upload (with slicing)
  {
    id: 'victor-idupload',
    speaker: 'Victor',
    text: "The last one is ID Upload Verification. The user story: As a customer, I want to upload my ID online so that I can complete my account verification. This is more advanced — it involves fraud detection and business rules.",
    dragAction: 'move-idupload-to-discussing' // Sarah moves ID Upload to Currently Discussing
  },
  {
    id: 'srikanth-idupload',
    speaker: 'Srikanth',
    text: "This could be too big for one sprint. Fraud checks and integrations are complex.",
    dragAction: null
  },
  {
    id: 'tom-idupload',
    speaker: 'Tom',
    text: "Testing all fraud scenarios in one sprint isn't realistic. We risk rolling over.",
    dragAction: null
  },
  {
    id: 'sarah-slice',
    speaker: 'Sarah',
    text: "Good point. Let's slice this. Maybe take only the basic upload form this sprint, and defer fraud detection rules.",
    dragAction: 'slice-idupload' // Sarah slices the story
  },
  {
    id: 'victor-slice',
    speaker: 'Victor',
    text: "Yes, that makes sense. Let's commit the base ID upload capability now, and we'll create a follow-up story for fraud checks.",
    dragAction: null
  },
  {
    id: 'lisa-slice',
    speaker: 'Lisa',
    text: "That's much more manageable. We can do the form, validation, and storage within this sprint.",
    dragAction: null
  },
  {
    id: 'sarah-idcommit',
    speaker: 'Sarah',
    text: "Perfect. We'll commit the sliced version to this sprint.",
    dragAction: 'move-idupload-slice-to-sprint' // Sarah moves sliced version to Sprint Backlog
  },
  
  // Sprint Closing
  {
    id: 'sarah-recap',
    speaker: 'Sarah',
    text: "To recap: our Sprint Goal is to improve verification and account processes. We've committed three items — the attachment feature, the password reset confirmation email, and a sliced version of ID upload. Together, these fit our capacity and align with the goal.",
    dragAction: null
  },
  {
    id: 'victor-close',
    speaker: 'Victor',
    text: "Thanks everyone. I'm confident this sprint will deliver real improvements for both customers and the housing team.",
    dragAction: null
  },
  {
    id: 'sarah-close',
    speaker: 'Sarah',
    text: "Great collaboration. This sprint is now planned. Let's get ready to start tomorrow with confidence.",
    dragAction: null
  }
];

// Function to synthesize text to speech using ElevenLabs
async function synthesizeText(text, voiceId, filename) {
  console.log(`🎤 Generating audio for: ${filename}`);
  
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioPath = path.join(__dirname, '..', 'public', 'audio', 'planning', `${filename}.mp3`);
    
    // Ensure directory exists
    const audioDir = path.dirname(audioPath);
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
    console.log(`✅ Generated: ${filename}.mp3`);
    
    // Add delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error(`❌ Error generating ${filename}:`, error);
  }
}

// Main function to generate all audio files
async function generateSprintPlanningAudio() {
  console.log('🎬 Starting Sprint Planning audio generation...');
  
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ VITE_ELEVENLABS_API_KEY not found in environment variables');
    return;
  }
  
  console.log('🔊 Voice mappings:');
  console.log('  Sarah (Scrum Master):', VOICE_IDS.Sarah);
  console.log('  Victor (BA/PO):', VOICE_IDS.Victor);
  console.log('  Srikanth (Tech Lead):', VOICE_IDS.Srikanth);
  console.log('  Lisa (Developer):', VOICE_IDS.Lisa);
  console.log('  Tom (QA Tester):', VOICE_IDS.Tom);
  console.log('');
  
  let count = 0;
  for (const segment of SPRINT_PLANNING_AUDIO_SEGMENTS) {
    count++;
    console.log(`[${count}/${SPRINT_PLANNING_AUDIO_SEGMENTS.length}] Processing: ${segment.id}`);
    
    const voiceId = VOICE_IDS[segment.speaker];
    if (!voiceId) {
      console.error(`❌ No voice ID found for speaker: ${segment.speaker}`);
      continue;
    }
    
    await synthesizeText(segment.text, voiceId, segment.id);
    
    if (segment.dragAction) {
      console.log(`   🎯 Drag action: ${segment.dragAction}`);
    }
  }
  
  console.log('');
  console.log('🎉 Sprint Planning audio generation complete!');
  console.log(`📁 Audio files saved to: public/audio/planning/`);
  console.log('');
  console.log('📋 Drag-and-drop sequence:');
  console.log('  1. sarah-transition → Move Maintenance Attachments to Currently Discussing');
  console.log('  2. sarah-attachments → Move Maintenance Attachments to Sprint Backlog');
  console.log('  3. victor-password → Move Password Reset to Currently Discussing');
  console.log('  4. sarah-password → Move Password Reset to Sprint Backlog');
  console.log('  5. victor-idupload → Move ID Upload to Currently Discussing');
  console.log('  6. sarah-slice → Slice ID Upload story');
  console.log('  7. sarah-idcommit → Move ID Upload (sliced) to Sprint Backlog');
}

// Run the generation
generateSprintPlanningAudio().catch(console.error);
