// Voice Meeting V2 - Continuous conversation with auto turn-taking
// Uses conversation loop pattern with proper multi-stakeholder support
// Integrated with existing app services

import { useState, useRef, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { createStakeholderConversationLoop } from "../../services/conversationLoop";
import { playBrowserTTS } from "../../lib/browserTTS";
import { ArrowLeft, Mic, Users } from "lucide-react";

interface Message {
  who: "You" | string;
  text: string;
  timestamp: string;
}

export default function VoiceMeetingV2() {
  const { selectedProject, selectedStakeholders, setCurrentView } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("Click Speak to begin your conversation.");
  const [conversationState, setConversationState] = useState<string>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isUserSpeakingRef = useRef<boolean>(false);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect if no project or stakeholders selected
  useEffect(() => {
    if (!selectedProject || !selectedStakeholders?.length) {
      console.log("🔄 VoiceMeetingV2: No project/stakeholders, redirecting...");
      setCurrentView("dashboard");
    }
  }, [selectedProject, selectedStakeholders, setCurrentView]);

  if (!selectedProject || !selectedStakeholders?.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No meeting configured</h2>
          <p className="text-gray-600 dark:text-gray-400">Please select a project and stakeholders first.</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const addMessage = (msg: Message) => {
    setMessages((m) => [...m, msg]);
  };

  // Helper: Stop AI speaking immediately (for interruptions)
  function stopSpeaking() {
    if (currentAudioRef.current) {
      try {
        console.log('⚠️ INTERRUPTION: Stopping AI audio');
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      } catch (e) {
        console.error('Error stopping audio:', e);
      }
    }
  }

  // ADAPTER 1: Speech-to-text using Web Speech API with interruption detection
  async function transcribeOnce(): Promise<string> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-GB";
      recognition.interimResults = true;  // Enable interim results for faster interruption detection
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      // Detect when user STARTS speaking (for interruption)
      recognition.onspeechstart = () => {
        console.log('🎤 User started speaking');
        isUserSpeakingRef.current = true;
        
        // If AI is currently speaking, STOP IT IMMEDIATELY
        if (conversationState === 'speaking') {
          console.log('⚠️ INTERRUPTION DETECTED: User interrupted AI');
          stopSpeaking();
        }
      };

      recognition.onresult = (event: any) => {
        // Get final transcript
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
        
        // Only process final results
        if (event.results?.[0]?.isFinal) {
          console.log('🎤 Final transcribed:', transcript);
          isUserSpeakingRef.current = false;
          resolve(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('🎤 Recognition error:', event.error);
        isUserSpeakingRef.current = false;
        reject(new Error(event.error));
      };

      recognition.onend = () => {
        console.log('🎤 Recognition ended');
        isUserSpeakingRef.current = false;
      };

      try {
        recognition.start();
      } catch (e) {
        reject(e);
      }
    });
  }

  // ADAPTER 2: AI-driven agent reply - AI selects which stakeholder responds
  async function getAgentReply(userText: string): Promise<{ reply: string; speaker: string; voiceId?: string; stakeholderName?: string }> {
    console.log('🤖 Getting agent reply for:', userText);
    
    try {
      // Build participant list (names only)
      const participantNames = selectedStakeholders.map(s => s.name);
      
      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.who === "You" ? "user" : "assistant",
        content: msg.who === "You" ? msg.text : `[${msg.who}]: ${msg.text}`
      }));

      console.log('📋 Participants:', participantNames.join(', '));

      // Call OpenAI to decide which stakeholder should respond
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are simulating a realistic stakeholder conversation. Participants in this meeting are: ${participantNames.join(", ")}.

Project: ${selectedProject.name}
Description: ${selectedProject.description}

Stakeholder Details:
${selectedStakeholders.map(s => `- ${s.name} (${s.role}, ${s.department}): ${s.bio?.substring(0, 150) || s.personality}`).join('\n')}

Rules:
- Only ONE stakeholder responds per turn.
- Choose the most relevant stakeholder based on the user's message and their expertise.
- If the user explicitly addresses someone by name, that person MUST respond.
- If the user asks for someone NOT in the participants list, clearly state they are not in this meeting.
- Do NOT include participant names inside the spoken text (the app shows the name separately).
- Speak naturally as the chosen stakeholder with their personality.
- Keep responses conversational and brief (1-3 sentences).
- Return strict JSON: { "speaker": "<exact name from participants>", "reply": "<spoken text>" }`
            },
            ...conversationHistory,
            {
              role: "user",
              content: userText
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI request failed: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      let payload: any = {};
      
      try {
        payload = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      } catch {
        payload = {};
      }

      console.log('🤖 AI Response:', payload);

      // Validate & sanitize
      const speaker = typeof payload.speaker === "string" ? payload.speaker : participantNames[0];
      const reply = typeof payload.reply === "string" && payload.reply.trim()
        ? payload.reply.trim()
        : "Let's clarify that and proceed.";

      // Ensure speaker is in the meeting
      const safeSpeaker = participantNames.includes(speaker) ? speaker : participantNames[0];

      console.log(`👤 ${safeSpeaker} will respond`);

      // Map speaker name to ElevenLabs voice ID
      const VOICE_MAP: Record<string, string | undefined> = {
        "Aisha": import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA,
        "Jess": import.meta.env.VITE_ELEVENLABS_VOICE_ID_JESS,
        "David": import.meta.env.VITE_ELEVENLABS_VOICE_ID_DAVID,
        "James": import.meta.env.VITE_ELEVENLABS_VOICE_ID_JAMES,
        "Emily": import.meta.env.VITE_ELEVENLABS_VOICE_ID_EMILY,
        "Sarah": import.meta.env.VITE_ELEVENLABS_VOICE_ID_SARAH,
        "Srikanth": import.meta.env.VITE_ELEVENLABS_VOICE_ID_SRIKANTH,
        "Bola": import.meta.env.VITE_ELEVENLABS_VOICE_ID_BOLA,
        "Lisa": import.meta.env.VITE_ELEVENLABS_VOICE_ID_LISA,
        "Robert": import.meta.env.VITE_ELEVENLABS_VOICE_ID_ROBERT,
      };

      // Try to match by first name
      const firstName = safeSpeaker.split(' ')[0];
      const voiceId = VOICE_MAP[firstName] || VOICE_MAP[safeSpeaker] || import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA;

      console.log('🎤 Mapped voice ID:', voiceId, 'for:', safeSpeaker);

      return {
        reply,
        speaker: safeSpeaker,
        voiceId,
        stakeholderName: safeSpeaker
      };

    } catch (error) {
      console.error('❌ getAgentReply error:', error);
      const fallbackSpeaker = selectedStakeholders[0]?.name || "Stakeholder";
      return {
        reply: "Sorry, I didn't catch that. Could you repeat?",
        speaker: fallbackSpeaker,
        voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA,
        stakeholderName: fallbackSpeaker
      };
    }
  }

  // ADAPTER 3: Text-to-speech using ElevenLabs with interruption support
  async function speak(text: string, options?: { voiceId?: string; stakeholderName?: string }): Promise<void> {
    // Stop any previous audio before starting new one
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      } catch {}
    }

    const voiceId = options?.voiceId || import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA;
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    console.log('🔊 Speaking:', text.substring(0, 50), 'with voice ID:', voiceId, 'for:', options?.stakeholderName);
    
    return new Promise(async (resolve) => {
      try {
        // Call ElevenLabs TTS directly
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.4, similarity_boost: 0.75 },
          }),
        });

        if (!ttsResponse.ok) {
          const errorText = await ttsResponse.text();
          console.error('❌ ElevenLabs TTS failed:', ttsResponse.status, errorText);
          throw new Error(`TTS failed: ${ttsResponse.status}`);
        }

        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;

        console.log('✅ Got audio from ElevenLabs, playing...');

        audio.onended = () => {
          console.log('✅ Audio finished playing normally');
          URL.revokeObjectURL(url);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          resolve();
        };

        audio.onerror = (e) => {
          console.error('❌ Audio playback error:', e);
          URL.revokeObjectURL(url);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          resolve();
        };

        // Listen for interruptions
        const checkInterruption = setInterval(() => {
          if (isUserSpeakingRef.current && currentAudioRef.current === audio) {
            console.log('⚠️ INTERRUPTION: User started speaking, stopping AI audio');
            clearInterval(checkInterruption);
            audio.pause();
            URL.revokeObjectURL(url);
            currentAudioRef.current = null;
            resolve();
          }
        }, 100); // Check every 100ms

        await audio.play();

        // Clean up interval when audio ends
        audio.addEventListener('ended', () => clearInterval(checkInterruption));
        audio.addEventListener('pause', () => clearInterval(checkInterruption));

      } catch (error) {
        console.error('❌ TTS error, using browser TTS fallback:', error);
        // Fallback to browser TTS
        try {
          await playBrowserTTS(text);
        } catch (e) {
          console.error('❌ Browser TTS also failed:', e);
        }
        resolve();
      }
    });
  }

  // Initialize conversation loop
  useEffect(() => {
    const loop = createStakeholderConversationLoop({
      transcribeOnce,
      getAgentReply,
      speak,
      
      onState: (s) => {
        setConversationState(s);
        const statusMap = {
          idle: "Click Speak to begin your conversation.",
          listening: "Listening…",
          processing: "Processing your message…",
          speaking: "Speaking…",
          ended: "Conversation ended. You can review your dialogue.",
        };
        setStatus(statusMap[s] || "");
      },

      onUserUtterance: (text) => {
        addMessage({ 
          who: "You", 
          text, 
          timestamp: new Date().toISOString() 
        });
      },

      onAgentUtterance: ({ text, speaker }) => {
        addMessage({ 
          who: speaker || "Stakeholder", 
          text, 
          timestamp: new Date().toISOString() 
        });
      },
    });

    loopRef.current = loop;

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
        } catch {}
      }
    };
  }, [messages, selectedStakeholders, selectedProject]);

  const handleSpeak = () => {
    loopRef.current?.start();
  };

  const handleEnd = () => {
    loopRef.current?.end();
    // Stop any ongoing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    // Stop any ongoing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
  };

  const handleBack = () => {
    if (conversationState !== "idle" && conversationState !== "ended") {
      const confirmLeave = window.confirm("Are you sure you want to leave? Your conversation is still active.");
      if (!confirmLeave) return;
      handleEnd();
    }
    setCurrentView("meeting-mode-selection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Back to Meeting Selection"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedProject.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <Users className="w-4 h-4" />
                  <span>{selectedStakeholders.map(s => s.name).join(', ')}</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full border border-purple-200 dark:border-purple-700">
                Voice Meeting V2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                  <Mic className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Ready to start your conversation
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click "Speak" below to begin talking with {selectedStakeholders.map(s => s.name).join(', ')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.who === "You";
                  const stakeholder = selectedStakeholders.find(s => s.name === msg.who);
                  const initials = isUser 
                    ? "You" 
                    : (stakeholder?.name.split(' ').map(n => n[0]).join('').toUpperCase() || "ST");
                  
                  return (
                    <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
                      <div className={`flex items-start gap-3 max-w-[75%]`}>
                        {!isUser && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                              {initials}
                            </div>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            isUser
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                              : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          {!isUser && (
                            <div className="font-semibold text-sm mb-1 text-purple-700 dark:text-purple-300">
                              {msg.who}
                            </div>
                          )}
                          <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                            {msg.text}
                          </div>
                          <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {isUser && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                              You
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Control Bar */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Status Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  conversationState === 'listening' ? 'bg-green-500 animate-pulse' :
                  conversationState === 'processing' ? 'bg-yellow-500 animate-pulse' :
                  conversationState === 'speaking' ? 'bg-blue-500 animate-pulse' :
                  'bg-gray-400'
                }`} />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {status}
                </p>
              </div>
            </div>

            {/* Speak Button */}
            <button
              onClick={handleSpeak}
              disabled={conversationState !== "idle"}
              className={`relative h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all transform ${
                conversationState === "idle"
                  ? "bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-110 active:scale-95"
                  : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50"
              }`}
              title="Speak"
            >
              <Mic className="w-7 h-7 text-white" />
              {conversationState === "listening" && (
                <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75"></span>
              )}
            </button>

            {/* End Conversation Button */}
            <button
              onClick={handleEnd}
              disabled={conversationState === "idle" || conversationState === "ended"}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all transform ${
                conversationState === "idle" || conversationState === "ended"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:scale-105 active:scale-95 shadow-md"
              }`}
            >
              End Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
