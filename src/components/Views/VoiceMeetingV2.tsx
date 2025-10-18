// Voice Meeting V2 - Continuous conversation with auto turn-taking
// Uses conversation loop pattern with proper multi-stakeholder support
// Integrated with existing app services

import { useState, useRef, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { createStakeholderConversationLoop } from "../../services/conversationLoop";
import { singleAgentSystem } from "../../services/singleAgentSystem";
import { synthesizeToBlob } from "../../services/elevenLabsTTS";
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

  // ADAPTER 1: Speech-to-text using Web Speech API
  async function transcribeOnce(): Promise<string> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-GB";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
        console.log('🎤 Transcribed:', transcript);
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('🎤 Recognition error:', event.error);
        reject(new Error(event.error));
      };

      recognition.onend = () => {
        console.log('🎤 Recognition ended');
      };

      try {
        recognition.start();
      } catch (e) {
        reject(e);
      }
    });
  }

  // ADAPTER 2: Agent reply using existing singleAgentSystem
  async function getAgentReply(userText: string): Promise<{ reply: string; speaker: string; voiceId?: string }> {
    console.log('🤖 Getting agent reply for:', userText);
    
    // Determine which stakeholder should respond
    // For simplicity: rotate through stakeholders based on message count
    // Or use AI to decide who should respond (more advanced)
    const stakeholderIndex = Math.floor(messages.filter(m => m.who !== "You").length % selectedStakeholders.length);
    const respondingStakeholder = selectedStakeholders[stakeholderIndex];
    
    console.log(`👤 ${respondingStakeholder.name} will respond (${stakeholderIndex + 1}/${selectedStakeholders.length})`);

    const stakeholderContext = {
      name: respondingStakeholder.name,
      role: respondingStakeholder.role,
      department: respondingStakeholder.department,
      priorities: respondingStakeholder.priorities || [],
      personality: respondingStakeholder.personality || 'Professional and helpful',
      expertise: respondingStakeholder.expertise || []
    };

    const projectContext = {
      id: selectedProject.id,
      name: selectedProject.name,
      description: selectedProject.description,
      type: selectedProject.type || 'General',
      painPoints: selectedProject.painPoints || [],
      asIsProcess: selectedProject.asIsProcess || ''
    };

    // Build conversation history
    const conversationHistory = messages.map(msg => ({
      speaker: msg.who === "You" ? "user" : msg.who,
      content: msg.text,
      stakeholderName: msg.who !== "You" ? msg.who : undefined
    }));

    const reply = await singleAgentSystem.processUserMessage(
      userText,
      stakeholderContext,
      projectContext,
      conversationHistory,
      selectedStakeholders.length
    );

    return { 
      reply, 
      speaker: respondingStakeholder.name,
      voiceId: respondingStakeholder.voice
    };
  }

  // ADAPTER 3: Text-to-speech using ElevenLabs with fallback
  async function speak(text: string, options?: { voiceId?: string }): Promise<void> {
    console.log('🔊 Speaking:', text.substring(0, 50));
    
    return new Promise(async (resolve) => {
      try {
        // Try ElevenLabs first
        const audioBlob = await synthesizeToBlob(text, { 
          voiceId: options?.voiceId 
        });

        if (audioBlob) {
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          currentAudioRef.current = audio;

          audio.onended = () => {
            console.log('✅ Audio finished');
            URL.revokeObjectURL(url);
            currentAudioRef.current = null;
            resolve();
          };

          audio.onerror = () => {
            console.error('❌ Audio playback error');
            URL.revokeObjectURL(url);
            currentAudioRef.current = null;
            resolve();
          };

          await audio.play();
        } else {
          // Fallback to browser TTS
          console.log('⚠️ Using browser TTS fallback');
          await playBrowserTTS(text);
          resolve();
        }
      } catch (error) {
        console.error('❌ TTS error:', error);
        // Fallback to browser TTS
        try {
          await playBrowserTTS(text);
        } catch {}
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
