// Drop-in, framework-agnostic conversation loop
// Manages: Speak once → auto turn-taking → End behavior
// No assumptions about your codebase - uses injected adapters

type ConversationState = "idle" | "listening" | "processing" | "speaking" | "ended";

interface AgentReply {
  reply: string;
  speaker?: string;
  voiceId?: string;
  stakeholderName?: string;
}

interface ConversationLoopOptions {
  transcribeOnce: () => Promise<string>;
  getAgentReply: (userText: string) => Promise<AgentReply>;
  speak: (text: string, options?: { voiceId?: string; stakeholderName?: string }) => Promise<void>;
  onState?: (state: ConversationState) => void;
  onUserUtterance?: (text: string) => void;
  onAgentUtterance?: (data: { text: string; speaker: string }) => void;
}

export function createStakeholderConversationLoop({
  transcribeOnce,
  getAgentReply,
  speak,
  onState = () => {},
  onUserUtterance = () => {},
  onAgentUtterance = () => {},
}: ConversationLoopOptions) {
  let active = false;
  let ending = false;

  const states = {
    IDLE: "idle" as const,
    LISTENING: "listening" as const,
    PROCESSING: "processing" as const,
    SPEAKING: "speaking" as const,
    ENDED: "ended" as const,
  };
  
  let state: ConversationState = states.IDLE;

  function setState(s: ConversationState) {
    console.log('🔄 Conversation Loop: State changed to:', s);
    state = s;
    onState(s);
  }

  async function loopOnce() {
    console.log('🔍 DEBUG LOOP: ========== loopOnce() CALLED ==========');
    console.log('🔍 DEBUG LOOP: active?', active, 'ending?', ending);
    
    // USER TURN
    console.log('🔍 DEBUG LOOP: Setting state to LISTENING');
    setState(states.LISTENING);
    
    console.log('🔍 DEBUG LOOP: Calling transcribeOnce()...');
    const userText = await transcribeOnce().catch((e) => {
      console.error('🔍 DEBUG LOOP: ❌ transcribeOnce error:', e);
      return "";
    });
    
    console.log('🔍 DEBUG LOOP: transcribeOnce() returned:', userText);
    
    if (!active) {
      console.log('🔍 DEBUG LOOP: 🛑 Not active, stopping');
      return; // user ended mid-turn
    }
    
    if (!userText || !userText.trim()) {
      console.log('🔍 DEBUG LOOP: ⚠️ No speech captured, retrying...');
      // No speech captured—idle listen again unless ending
      if (!ending) return loopOnce();
      return end();
    }
    
    console.log('🔍 DEBUG LOOP: ✅ User said:', userText);
    onUserUtterance(userText);

    // AGENT TURN
    setState(states.PROCESSING);
    const { reply, speaker, voiceId, stakeholderName } = await getAgentReply(userText).catch((e) => {
      console.error('❌ Conversation Loop: getAgentReply error:', e);
      return {
        reply: "Sorry, I didn't catch that. Could you repeat?",
        speaker: "Stakeholder",
      };
    });
    
    if (!active) {
      console.log('🛑 Conversation Loop: Not active after agent reply, stopping');
      return;
    }
    
    console.log('🤖 Conversation Loop: Agent replied:', { reply: reply.substring(0, 50), speaker, stakeholderName });
    onAgentUtterance({ text: reply, speaker: speaker || "Stakeholder" });

    setState(states.SPEAKING);
    await speak(reply, { voiceId, stakeholderName: stakeholderName || speaker }).catch((e) => {
      console.error('❌ Conversation Loop: speak error:', e);
    });
    
    if (!active) {
      console.log('🛑 Conversation Loop: Not active after speaking, stopping');
      return;
    }

    // Continue unless the user has ended
    if (!ending) {
      console.log('🔁 Conversation Loop: Continuing to next turn...');
      return loopOnce();
    }
    return end();
  }

  function start() {
    console.log('🔍 DEBUG LOOP: ========== START() CALLED ==========');
    console.log('🔍 DEBUG LOOP: Already active?', active);
    
    if (active) {
      console.log('🔍 DEBUG LOOP: ⚠️ Already active, ignoring start() call');
      return;
    }
    
    console.log('🔍 DEBUG LOOP: ▶️ Setting active = true, ending = false');
    active = true;
    ending = false;
    
    console.log('🔍 DEBUG LOOP: Setting state to LISTENING');
    setState(states.LISTENING);
    
    console.log('🔍 DEBUG LOOP: Calling loopOnce()...');
    loopOnce();
  }

  function end() {
    console.log('🛑 Conversation Loop: Ending...');
    active = false;
    ending = true;
    setState(states.ENDED);
  }

  return { 
    start, 
    end, 
    get state() { return state; } 
  };
}

