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

// Voice ID for Sarah
const SARAH_VOICE_ID = 'MzqUf1HbJ8UmQ0wUsx2p';

// The correct text with "Victor" - making it very clear
const CORRECT_TEXT = "Welcome everyone. This is our Sprint Planning session. Our aim today is to agree on a Sprint Goal and decide which backlog items we can commit to for the sprint. Victor, can you walk us through the Sprint Goal?";

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'planning');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function synthesizeText(text, voiceId, outputPath) {
  try {
    console.log(`🎤 Generating audio with text: "${text}"`);
    
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
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    
    console.log(`✅ Generated: ${path.basename(outputPath)}`);
    
  } catch (error) {
    console.error(`❌ Error generating audio:`, error);
    throw error;
  }
}

async function createNewSarahAudio() {
  console.log('🎤 Creating NEW sarah-opening audio with correct "Victor" name...');
  console.log(`📝 Text: "${CORRECT_TEXT}"`);
  
  // Create a completely new filename
  const timestamp = Date.now();
  const newFileName = `sarah-opening-victor-${timestamp}.mp3`;
  const outputPath = path.join(OUTPUT_DIR, newFileName);
  
  await synthesizeText(CORRECT_TEXT, SARAH_VOICE_ID, outputPath);
  
  console.log(`✅ Successfully created: ${newFileName}`);
  console.log(`📁 Full path: ${outputPath}`);
  
  return newFileName;
}

// Run the creation
createNewSarahAudio().catch(console.error);
