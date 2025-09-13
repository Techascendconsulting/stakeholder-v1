// Simple script to generate the motivational audio
// Run this in the browser console on your app

const motivationText = `Hello. Have you noticed how the very things that are meant to move your life forward often feel the heaviest at the beginning? The first week of training, you're excited. But then the jargon hits you — stakeholders, requirements, diagrams, frameworks. Suddenly your head feels full, your chest feels tight, and you start asking yourself, "Maybe this isn't for me?"

That feeling has a name. It's overwhelm. And let me assure you — overwhelm is not failure. It's proof that you are in the middle of growth.

When you step into Business Analysis, you're faced with new words, new diagrams, new ways of thinking. Requirements, stakeholders, process maps, acceptance criteria — at first, it all feels too much. You sit down to practice and your mind feels heavy. You wonder, "Is this really for me?"
But hear me clearly: that heaviness is not a sign that you should quit. It is a sign that you are stretching.

Every new skill carries a season of weight. Every transformation begins with a moment of overwhelm.

Let me remind you of this truth: No one you admire started confident. No Business Analyst walked into their first project fully sure of themselves.
They too felt lost. They too stared at their first process diagram and thought, "This makes no sense." They too sat in their first stakeholder meeting and felt like they didn't belong.
But they kept showing up. And with each step, the weight grew lighter.

Overwhelm is not failure. Overwhelm is training. It is your mind learning how to carry more than it did yesterday.
Think of it this way: if you feel heavy right now, it means you are standing exactly where you need to be — on the edge of growth.
So instead of running from the weight, lean into it. Embrace it. Carry it. Because very soon, what feels impossible today will become the thing you do with ease tomorrow.

Here's how you handle overwhelm:
Don't try to swallow everything in one gulp. Take it one step at a time.
One user story.
One stakeholder question.
One process diagram.
You don't need to master it all today. You only need to carry what is in front of you. And when you come back tomorrow, you'll find yourself carrying more with less strain.
That is growth. Quiet, steady, powerful growth.`;

// Import the existing ElevenLabs service
import { synthesizeToBlob } from './src/services/elevenLabsTTS.js';

async function generateMotivationAudio() {
  try {
    console.log('🎤 Generating motivational audio...');
    
    const audioBlob = await synthesizeToBlob(motivationText, {
      voiceId: 'eOHsvebhdtt0XFeHVMQY',
      stakeholderName: 'femalemotivation'
    });
    
    // Create download link
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'overcoming-overwhelm.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    console.log('✅ Audio generated and downloaded!');
    console.log('📁 Save this file as: public/audio/motivation/overcoming-overwhelm.mp3');
    
  } catch (error) {
    console.error('❌ Error generating audio:', error);
  }
}

generateMotivationAudio();
