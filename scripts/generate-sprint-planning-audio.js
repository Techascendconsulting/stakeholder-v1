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
// Complete 25-segment Sprint Planning script with drag-and-drop triggers
const SPRINT_PLANNING_AUDIO_SEGMENTS = [
  // 1. Opening
  {
    id: 'sarah-opening',
    speaker: 'Sarah',
    text: "Welcome everyone. This is our Sprint Planning session. Our aim today is to agree on a Sprint Goal and decide which backlog items we can commit to for the sprint. Victor, can you walk us through the Sprint Goal?",
    dragAction: null
  },
  
  // 2. Sprint Goal
  {
    id: 'victor-goal',
    speaker: 'Victor',
    text: "Thanks Sarah. The Sprint Goal I'd like to propose is: Strengthen account security and verification—send confirmation after password resets and deliver the basic ID upload step. We have three refined backlog items on top: the tenant maintenance attachments, the password reset confirmation email, and the ID upload verification feature.",
    dragAction: null
  },
  
  // 3. Capacity Check
  {
    id: 'sarah-capacity',
    speaker: 'Sarah',
    text: "Great. Before we start pulling stories, let's quickly confirm capacity. Srikanth, how's the dev side looking this sprint?",
    dragAction: null
  },
  
  // 4. Dev Capacity
  {
    id: 'srikanth-capacity',
    speaker: 'Srikanth',
    text: "On the dev side, we have our full team except for Lisa taking a day off. That means about 80% of our usual capacity. I'd say around 20 story points.",
    dragAction: null
  },
  
  // 5. Dev Capacity Input
  {
    id: 'lisa-capacity',
    speaker: 'Lisa',
    text: "Yes, that's about right. I think we can take 2 medium stories and one larger one if we slice it properly.",
    dragAction: null
  },
  
  // 6. QA Capacity
  {
    id: 'tom-capacity',
    speaker: 'Tom',
    text: "From QA, I can handle the full regression and story testing, but if we take on too much edge-case work, it may spill over.",
    dragAction: null
  },
  
  // 7. Transition to First Story
  {
    id: 'sarah-transition',
    speaker: 'Sarah',
    text: "Alright, let's look at the first item together.",
    dragAction: 'move-maintenance-to-discussing'
  },
  
  // 8. Story 1: Attachments Recap
  {
    id: 'victor-attachments',
    speaker: 'Victor',
    text: "The first item is Tenant can upload attachments to support maintenance requests. The user story: As a tenant, I want to upload a photo or document related to my maintenance issue, so that the housing team has enough context to resolve the problem efficiently. It's already refined with file size and type rules.",
    dragAction: null
  },
  
  // 9. Attachments Feasibility
  {
    id: 'srikanth-attachments',
    speaker: 'Srikanth',
    text: "From dev, we can reuse our file upload component. Backend will go into S3, so this is straightforward.",
    dragAction: null
  },
  
  // 10. Attachments Test Scope
  {
    id: 'tom-attachments',
    speaker: 'Tom',
    text: "For QA, I'll cover oversized files, wrong formats, and multiple uploads. Should fit fine.",
    dragAction: null
  },
  
  // 11. Attachment Commitment
  {
    id: 'sarah-attachments',
    speaker: 'Sarah',
    text: "Great. Sounds like we're aligned. Let's commit this story to the sprint.",
    dragAction: 'move-maintenance-to-sprint'
  },
  
  // 12. Story 2: Password Reset Recap
  {
    id: 'victor-password',
    speaker: 'Victor',
    text: "Next is Password Reset Confirmation Email. User story: As a customer, I want to receive a confirmation email after resetting my password so that I know my account has been updated successfully and can spot suspicious activity. This was sized at 2 points.",
    dragAction: 'move-password-to-discussing'
  },
  
  // 13. Password Reset Effort
  {
    id: 'lisa-password',
    speaker: 'Lisa',
    text: "Very small effort. We just add a template to our existing email service.",
    dragAction: null
  },
  
  // 14. Password Reset Testing
  {
    id: 'tom-password',
    speaker: 'Tom',
    text: "Low test effort too. I just need to check subject, body, no password leakage, and logging.",
    dragAction: null
  },
  
  // 15. Password Reset Commitment
  {
    id: 'sarah-password',
    speaker: 'Sarah',
    text: "Excellent. Let's move this into the sprint backlog as well.",
    dragAction: 'move-password-to-sprint'
  },
  
  // 16. Story 3: ID Upload Intro
  {
    id: 'victor-idupload',
    speaker: 'Victor',
    text: "The last one is ID Upload Verification. The user story: As a customer, I want to upload my ID online so that I can complete my account verification. This is more advanced — it involves fraud detection and business rules.",
    dragAction: 'move-idupload-to-discussing'
  },
  
  // 17. ID Upload Concern
  {
    id: 'srikanth-idupload',
    speaker: 'Srikanth',
    text: "This could be too big for one sprint. Fraud checks and integrations are complex implementations for the sprint considering capacity and testing",
    dragAction: null
  },
  
  // 18. ID Upload Test Concern
  {
    id: 'tom-idupload',
    speaker: 'Tom',
    text: "True, Testing all fraud scenarios in one sprint isn't realistic. We risk rolling over.",
    dragAction: null
  },
  
  // 19. Suggestion to Slice
  {
    id: 'sarah-slice',
    speaker: 'Sarah',
    text: "Good point. Let's slice this. Maybe take only the basic upload form this sprint, and defer fraud detection rules.",
    dragAction: 'slice-idupload'
  },
  
  // 20. Agreement to Slice
  {
    id: 'victor-slice',
    speaker: 'Victor',
    text: "Yes, that makes sense. Let's commit the base ID upload capability, Sarah please go ahead and add the story to the sprint backlog, I will amend the acceptance criteri, and create a follow-up story for fraud checks.",
    dragAction: null
  },
  
  // 21. Feasibility of Slice
  {
    id: 'lisa-slice',
    speaker: 'Lisa',
    text: "That's much more manageable. We can do the form, validation, and storage within this sprint.",
    dragAction: null
  },
  
  // 22. ID Upload Commitment
  {
    id: 'sarah-idcommit',
    speaker: 'Sarah',
    text: "Perfect. We'll commit the sliced version to this sprint.",
    dragAction: 'move-idupload-slice-to-sprint'
  },
  
  // 23. Sprint Recap
  {
    id: 'sarah-recap',
    speaker: 'Sarah',
    text: "To recap: our Sprint Goal is to improve verification and account processes. We've committed three items — the attachment feature, the password reset confirmation email, and a sliced version of ID upload. Together, these fit our capacity and align with the goal.",
    dragAction: null
  },
  
  // 24. Closing Acknowledgement
  {
    id: 'victor-close',
    speaker: 'Victor',
    text: "Thanks everyone. I'm confident this sprint will deliver real improvements for both customers and the housing team.",
    dragAction: null
  },
  
  // 25. Closing
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
  console.log('');
  console.log('🎯 Total segments: 25 audio files');
  console.log('🎭 Participants: Sarah (SM), Victor (BA/PO), Srikanth (Tech Lead), Lisa (Dev), Tom (QA)');
  console.log('📁 Output directory: public/audio/planning/');
}

// Run the generation
generateSprintPlanningAudio().catch(console.error);
