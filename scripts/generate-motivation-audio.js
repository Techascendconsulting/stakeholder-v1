#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const envPath = path.join(__dirname, '..', 'env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const SUPABASE_URL = envVars.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY
const ELEVENLABS_API_KEY = envVars.VITE_ELEVENLABS_API_KEY
const VOICE_ID = envVars.VITE_ELEVENLABS_VOICE_ID_FEMALEMOTIVATION

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ELEVENLABS_API_KEY || !VOICE_ID) {
  console.error('❌ Missing required environment variables')
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ELEVENLABS_API_KEY, VITE_ELEVENLABS_VOICE_ID_FEMALEMOTIVATION')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const MOTIVATION_TEXT = `Hello

Have you noticed how the very things that are meant to move your life forward often feel the heaviest at the beginning?

The first week of training, you're excited. But then the jargon hits you — stakeholders, requirements, diagrams, frameworks. Suddenly your head feels full, your chest feels tight, and you start asking yourself, "Maybe this isn't for me?" 

That feeling has a name. It's overwhelm.

And let me assure you — overwhelm is not failure. It's proof that you are in the middle of growth. When you step into Business Analysis, you're faced with new words, new diagrams, new ways of thinking. Requirements, stakeholders, process maps, acceptance criteria — at first, it all feels too much. You sit down to practice and your mind feels heavy. You wonder, "Is this really for me?" 

But hear me clearly: that heaviness is not a sign that you should quit. It is a sign that you are stretching. Every new skill carries a season of weight.

Every transformation begins with a moment of overwhelm. Let me remind you of this truth:

No one you admire started confident.

No Business Analyst walked into their first project fully sure of themselves. They too felt lost. They too stared at their first process diagram and thought, "This makes no sense." They too sat in their first stakeholder meeting and felt like they didn't belong. But they kept showing up.

And with each step, the weight grew lighter. Overwhelm is not failure. Overwhelm is training.

It is your mind learning how to carry more than it did yesterday. Think of it this way: if you feel heavy right now, it means you are standing exactly where you need to be — on the edge of growth. So instead of running from the weight, lean into it. Embrace it. Carry it. Because very soon, what feels impossible today will become the thing you do with ease tomorrow.

Here's how you handle overwhelm: Don't try to swallow everything in one gulp.

Take it one step at a time.
* One user story.
* One stakeholder question.
* One process diagram.

You don't need to master it all today. You only need to carry what is in front of you. And when you come back tomorrow, you'll find yourself carrying more with less strain. That is growth. Quiet, steady, powerful growth.`

async function generateAudio() {
  try {
    console.log('🎤 Generating audio with ElevenLabs...')
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: MOTIVATION_TEXT,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`)
    }

    const audioBuffer = await response.arrayBuffer()
    console.log(`✅ Audio generated successfully (${audioBuffer.byteLength} bytes)`)
    
    return audioBuffer
  } catch (error) {
    console.error('❌ Error generating audio:', error)
    throw error
  }
}

async function saveAudioLocally(audioBuffer) {
  try {
    console.log('💾 Saving audio locally...')
    
    const fileName = 'overcoming-overwhelm.mp3'
    const outputPath = path.join(__dirname, '..', 'public', 'audio', fileName)
    
    // Ensure the directory exists
    const audioDir = path.dirname(outputPath)
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true })
    }
    
    // Save the audio file
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer))
    
    console.log('✅ Audio saved locally:', outputPath)
    console.log('🔗 Local URL: /audio/overcoming-overwhelm.mp3')
    return `/audio/${fileName}`
  } catch (error) {
    console.error('❌ Error saving audio locally:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting motivation audio generation...')
    
    // Generate audio
    const audioBuffer = await generateAudio()
    
    // Save locally
    const localUrl = await saveAudioLocally(audioBuffer)
    
    console.log('🎉 Success! Audio is now available at:', localUrl)
    console.log('📝 The audio file has been saved to public/audio/overcoming-overwhelm.mp3')
    console.log('📝 Update MotivationPage.tsx to use the local URL instead of AI_GENERATED')
    
  } catch (error) {
    console.error('💥 Failed to generate audio:', error)
    process.exit(1)
  }
}

main()

