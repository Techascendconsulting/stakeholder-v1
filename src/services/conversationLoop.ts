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
    // console.log('🔍 DEBUG LOOP: ========== loopOnce() CALLED ==========');
    // console.log('🔍 DEBUG LOOP: active?', active, 'ending?', ending);
    
    // USER TURN
    // console.log('🔍 DEBUG LOOP: Setting state to LISTENING');
    setState(states.LISTENING);
    
    // console.log('🔍 DEBUG LOOP: Calling transcribeOnce()...');
    const userText = await transcribeOnce().catch((e) => {
      console.error('❌ Transcribe error:', e);
      return "";
    });
    
    // console.log('🔍 DEBUG LOOP: transcribeOnce() returned:', userText);
    
    if (!active) {
      console.log('🛑 Loop stopped (not active)');
      return; // user ended mid-turn
    }
    
    if (!userText || !userText.trim()) {
      console.log('⚠️ No speech captured, retrying...');
      // No speech captured—idle listen again unless ending
      if (!ending) return loopOnce();
      return end();
    }
    
    console.log('👤 User said:', userText);
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
    
    console.log(`🤖 ${speaker}: ${reply}`);
    onAgentUtterance({ text: reply, speaker: speaker || "Stakeholder" });

    setState(states.SPEAKING);
    await speak(reply, { voiceId, stakeholderName: stakeholderName || speaker }).catch((e) => {
      console.error('❌ Speak error:', e);
    });
    
    if (!active) {
      console.log('🛑 Loop stopped after speaking');
      return;
    }

    // Continue unless the user has ended
    if (!ending) {
      // console.log('🔁 Continuing to next turn...');
      return loopOnce();
    }
    return end();
  }

  function start() {
    if (active) {
      console.log('⚠️ Loop already active');
      return;
    }
    
    console.log('▶️ Starting conversation');
    active = true;
    ending = false;
    setState(states.LISTENING);
    loopOnce();
  }

  function end() {
    console.log('⏹️ Ending conversation');
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

