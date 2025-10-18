// Teams-style UI: header, message thread, floating mic bar.
// Flow: Click "Speak" once -> talk -> auto-send -> AI replies with voice -> auto-resume.
// End with "End Conversation".
// Integrated with existing app: uses selectedProject, selectedStakeholders, singleAgentSystem, ElevenLabs

import { useState, useRef, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useVoiceEngine } from "../../hooks/useVoiceEngine";
import { processVoiceTurn, playAudioBlob } from "../../services/voicePipeline";
import { playBrowserTTS } from "../../lib/browserTTS";
import { ArrowLeft } from "lucide-react";

interface Message {
  who: "You" | "Stakeholder";
  text: string;
  stakeholderName?: string;
}

const Header = ({ projectName, stakeholderName, onBack }: { projectName: string; stakeholderName: string; onBack: () => void }) => (
  <div className="w-full bg-[#464775] text-white px-4 py-3 flex items-center justify-between shadow">
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        title="Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
        {stakeholderName.substring(0, 2).toUpperCase()}
      </div>
      <div>
        <h1 className="text-sm sm:text-base font-semibold">{projectName}</h1>
        <p className="text-xs opacity-90">with {stakeholderName}</p>
      </div>
    </div>
    <span className="text-xs opacity-90 hidden sm:block">Voice Meeting V2</span>
  </div>
);

const Bubble = ({ who, text, stakeholderName }: Message) => {
  const isUser = who === "You";
  const initials = isUser ? "Y" : (stakeholderName?.substring(0, 2).toUpperCase() || "ST");
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div className={`flex items-start gap-2 max-w-[80%]`}>
        {!isUser && (
          <div className="w-8 h-8 shrink-0 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
            {initials}
          </div>
        )}
        <div
          className={`rounded-2xl px-3 py-2 text-sm leading-snug shadow-sm ${
            isUser
              ? "bg-[#6264a7] text-white"
              : "bg-[#e6e6e6] text-black"
          }`}
        >
          <div className="font-semibold mb-0.5">{isUser ? "You" : stakeholderName}</div>
          <div>{text}</div>
        </div>
        {isUser && (
          <div className="w-8 h-8 shrink-0 rounded-full bg-[#6264a7] flex items-center justify-center text-xs font-semibold text-white">
            {initials}
          </div>
        )}
      </div>
    </div>
  );
};

export default function VoiceMeetingV2() {
  const { selectedProject, selectedStakeholders, setCurrentView } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("Click Speak to begin your conversation.");
  const audioPlayingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use first selected stakeholder (for single stakeholder meetings)
  // For multiple stakeholders, you could enhance this to rotate or detect who should respond
  const stakeholder = selectedStakeholders[0];

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect if no project or stakeholder selected
  useEffect(() => {
    if (!selectedProject || !selectedStakeholders?.length) {
      console.log("🔄 VoiceMeetingV2: No project/stakeholders, redirecting...");
      setCurrentView("dashboard");
    }
  }, [selectedProject, selectedStakeholders, setCurrentView]);

  if (!selectedProject || !selectedStakeholders?.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-2">No meeting configured</h2>
          <p className="text-gray-400">Please select a project and stakeholders first.</p>
        </div>
      </div>
    );
  }

  const append = (who: "You" | "Stakeholder", text: string, stakeholderName?: string) => {
    setMessages((m) => [...m, { who, text, stakeholderName }]);
  };

  const { state, startListening, resumeListening, endConversation } = useVoiceEngine({
    onTranscribed: async (userText) => {
      console.log('👤 VoiceMeetingV2: User said:', userText);
      append("You", userText);
      
      try {
        setStatus("Processing your message…");
        
        // Build conversation history for context
        const conversationHistory = messages.map(msg => ({
          speaker: msg.who === "You" ? "user" : stakeholder.id,
          content: msg.text,
          stakeholderName: msg.stakeholderName
        }));

        const { reply, audioBlob } = await processVoiceTurn({
          transcript: userText,
          stakeholder,
          project: selectedProject,
          conversationHistory,
          totalStakeholders: selectedStakeholders.length
        });

        console.log('🤖 VoiceMeetingV2: Got reply:', reply);
        append("Stakeholder", reply, stakeholder.name);
        setStatus("Speaking…");
        audioPlayingRef.current = true;

        if (audioBlob) {
          // Use ElevenLabs audio
          playAudioBlob(audioBlob, () => {
            console.log('✅ VoiceMeetingV2: Audio finished, resuming listening...');
            audioPlayingRef.current = false;
            setStatus("Listening…");
            // auto-resume new turn
            resumeListening();
          });
        } else {
          // Fallback to browser TTS
          console.log('⚠️ VoiceMeetingV2: Using browser TTS fallback');
          await playBrowserTTS(reply);
          audioPlayingRef.current = false;
          setStatus("Listening…");
          resumeListening();
        }
      } catch (e) {
        console.error('❌ VoiceMeetingV2: Error:', e);
        setStatus("Something went wrong. Please try again.");
        // Try to resume listening to avoid dead ends
        resumeListening();
      }
    },
    onStateChange: (s) => {
      console.log('🔄 VoiceMeetingV2: State changed to:', s);
      if (s === "listening") setStatus("Listening…");
      if (s === "processing") setStatus("Processing your message…");
      if (s === "speaking") setStatus("Speaking…");
      if (s === "ended") setStatus("Conversation ended. You can review your dialogue above.");
      if (s === "idle") setStatus("Click Speak to begin your conversation.");
    },
  });

  const handleSpeak = () => {
    if (state === "idle") {
      console.log('🎤 VoiceMeetingV2: Starting listening...');
      setStatus("Listening…");
      startListening();
    }
  };

  const handleEnd = () => {
    console.log('🛑 VoiceMeetingV2: Ending conversation...');
    if (audioPlayingRef.current) {
      // Let the browser stop the current audio naturally; we only change state
    }
    endConversation();
  };

  const handleBack = () => {
    if (state !== "idle" && state !== "ended") {
      const confirmLeave = window.confirm("Are you sure you want to leave? Your conversation is still active.");
      if (!confirmLeave) return;
    }
    setCurrentView("meeting-mode-selection");
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#f3f3f3] flex flex-col">
      <Header 
        projectName={selectedProject.name} 
        stakeholderName={stakeholder.name}
        onBack={handleBack}
      />

      {/* Thread */}
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 h-[68vh] overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              <div className="text-center">
                <p className="mb-2">Your conversation will appear here.</p>
                <p className="text-xs text-gray-400">Click "Speak" below to start talking with {stakeholder.name}</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, idx) => (
                <Bubble key={idx} who={m.who} text={m.text} stakeholderName={m.stakeholderName} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Floating mic bar (Teams-like) */}
      <div className="w-full sticky bottom-0">
        <div className="mx-auto max-w-3xl mb-5">
          <div className="bg-white/95 backdrop-blur rounded-full shadow-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
            {/* Left: status */}
            <div className="text-xs sm:text-sm text-gray-600 flex-1">{status}</div>

            {/* Center: mic */}
            <button
              onClick={handleSpeak}
              disabled={state !== "idle"}
              className={`mx-3 sm:mx-6 h-12 w-12 rounded-full flex items-center justify-center shadow transition-all
                ${state === "idle" ? "bg-[#6264a7] hover:bg-[#54579a] hover:scale-110" : "bg-gray-300 cursor-not-allowed"}`}
              title="Speak"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H9v2h6v-2h-2v-3.08A7 7 0 0 0 19 11h-2Z" />
              </svg>
            </button>

            {/* Right: End */}
            <button
              onClick={handleEnd}
              disabled={state === "idle" || state === "ended"}
              className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full transition-all
                ${state === "idle" || state === "ended"
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700 hover:scale-105"}`}
            >
              End Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

