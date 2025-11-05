// Sends user transcript to meeting agent, then converts the reply to speech via ElevenLabs.
// Returns { reply, audioBlob } to the UI.
// Integrated with existing app services: singleAgentSystem + ElevenLabs

import { singleAgentSystem } from './singleAgentSystem';
import { synthesizeToBlob } from './elevenLabsTTS';

interface VoiceTurnResult {
  reply: string;
  audioBlob: Blob | null;
}

interface ProcessVoiceTurnOptions {
  transcript: string;
  stakeholder: any;
  project: any;
  conversationHistory: any[];
  totalStakeholders: number;
}

export async function processVoiceTurn({
  transcript,
  stakeholder,
  project,
  conversationHistory,
  totalStakeholders
}: ProcessVoiceTurnOptions): Promise<VoiceTurnResult> {
  console.log('🔄 Voice Pipeline: Processing turn...', { transcript: transcript.substring(0, 50) });
  
  try {
    // 1) Your AI meeting agent (singleAgentSystem)
    const stakeholderContext = {
      name: stakeholder.name,
      role: stakeholder.role,
      department: stakeholder.department,
      priorities: stakeholder.priorities || [],
      personality: stakeholder.personality || 'Professional and helpful',
      expertise: stakeholder.expertise || []
    };

    const projectContext = {
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type || 'General',
      painPoints: project.painPoints || [],
      asIsProcess: project.asIsProcess || ''
    };

    console.log('🤖 Voice Pipeline: Calling singleAgentSystem...');
    const reply = await singleAgentSystem.processUserMessage(
      transcript,
      stakeholderContext,
      projectContext,
      conversationHistory,
      totalStakeholders
    );

    console.log('✅ Voice Pipeline: Got reply:', reply.substring(0, 50));

    // 2) ElevenLabs TTS - Generate audio in PARALLEL (don't await yet)
    console.log('🔊 Voice Pipeline: Starting ElevenLabs audio generation (parallel)...');
    const audioPromise = synthesizeToBlob(reply, { 
      stakeholderName: stakeholder.name 
    });

    // Return reply immediately with audio promise
    // This allows UI to show text while audio is still generating
    return { 
      reply, 
      audioBlob: await audioPromise // Await here so caller gets blob
    };
  } catch (error) {
    console.error('❌ Voice Pipeline: Error processing turn:', error);
    throw error;
  }
}

// New: Process voice turn with immediate text callback
export async function processVoiceTurnWithCallback({
  transcript,
  stakeholder,
  project,
  conversationHistory,
  totalStakeholders,
  onTextReady
}: ProcessVoiceTurnOptions & { onTextReady?: (reply: string, speaker: string) => void }): Promise<VoiceTurnResult> {
  console.log('🔄 Voice Pipeline: Processing turn with callback...', { transcript: transcript.substring(0, 50) });
  
  try {
    const stakeholderContext = {
      name: stakeholder.name,
      role: stakeholder.role,
      department: stakeholder.department,
      priorities: stakeholder.priorities || [],
      personality: stakeholder.personality || 'Professional and helpful',
      expertise: stakeholder.expertise || []
    };

    const projectContext = {
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type || 'General',
      painPoints: project.painPoints || [],
      asIsProcess: project.asIsProcess || ''
    };

    console.log('🤖 Voice Pipeline: Calling singleAgentSystem...');
    const reply = await singleAgentSystem.processUserMessage(
      transcript,
      stakeholderContext,
      projectContext,
      conversationHistory,
      totalStakeholders
    );

    console.log('✅ Voice Pipeline: Got reply:', reply.substring(0, 50));
    
    // 🚀 OPTIMIZATION: Notify UI immediately with text
    if (onTextReady) {
      console.log('⚡ Voice Pipeline: Calling onTextReady callback - UI can show text now');
      onTextReady(reply, stakeholder.name);
    }

    // Start audio generation in parallel (UI already showing text)
    console.log('🔊 Voice Pipeline: Generating ElevenLabs audio (parallel while UI shows text)...');
    const audioBlob = await synthesizeToBlob(reply, { 
      stakeholderName: stakeholder.name 
    });

    if (!audioBlob) {
      console.warn('⚠️ Voice Pipeline: ElevenLabs returned null');
    } else {
      console.log('✅ Voice Pipeline: Audio ready');
    }

    return { reply, audioBlob };
  } catch (error) {
    console.error('❌ Voice Pipeline: Error processing turn:', error);
    throw error;
  }
}

export function playAudioBlob(audioBlob: Blob, onEnded?: () => void): HTMLAudioElement {
  console.log('▶️ Voice Pipeline: Playing audio blob...');
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  
  audio.onended = () => {
    console.log('✅ Voice Pipeline: Audio playback ended');
    URL.revokeObjectURL(url);
    onEnded?.();
  };
  
  audio.onerror = (e) => {
    console.error('❌ Voice Pipeline: Audio playback error:', e);
    URL.revokeObjectURL(url);
    onEnded?.();
  };
  
  audio.play().catch(error => {
    console.error('❌ Voice Pipeline: Error starting playback:', error);
    URL.revokeObjectURL(url);
    onEnded?.();
  });
  
  return audio;
}








