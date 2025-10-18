// Voice Meeting V2 - Dark Meeting Interface with Visual Voice Activity
// Professional meeting experience with interruption handling and live feedback

import { useState, useRef, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { createStakeholderConversationLoop } from "../../services/conversationLoop";
import { playBrowserTTS } from "../../lib/browserTTS";
import DynamicCoachingPanel from "../DynamicCoachingPanel";
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Users, 
  Clock, 
  MessageSquare, 
  X,
  HelpCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

interface Message {
  who: "You" | string;
  text: string;
  timestamp: string;
}

export default function VoiceMeetingV2() {
  const { selectedProject, selectedStakeholders, setCurrentView, user } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationState, setConversationState] = useState<string>("idle");
  const [showTranscript, setShowTranscript] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const [showCoaching, setShowCoaching] = useState(true);
  const [awaitingAcknowledgement, setAwaitingAcknowledgement] = useState(false);
  const coachingPanelRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isUserSpeakingRef = useRef<boolean>(false);
  const conversationStateRef = useRef<string>("idle"); // Track current state for interruptions
  
  // Keep state ref in sync
  useEffect(() => {
    conversationStateRef.current = conversationState;
  }, [conversationState]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Meeting timer
  useEffect(() => {
    if (conversationState !== "idle" && conversationState !== "ended") {
      timerRef.current = setInterval(() => {
        setMeetingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [conversationState]);

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-scroll transcript
  useEffect(() => {
    if (showTranscript) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showTranscript]);

  // Redirect if no setup
  useEffect(() => {
    if (!selectedProject || !selectedStakeholders?.length) {
      setCurrentView("dashboard");
    }
  }, [selectedProject, selectedStakeholders, setCurrentView]);

  if (!selectedProject || !selectedStakeholders?.length) {
    return null;
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
        setActiveSpeaker(null);
      } catch (e) {
        console.error('Error stopping audio:', e);
      }
    }
  }

  // ADAPTER 1: Speech-to-text with better silence detection
  async function transcribeOnce(): Promise<string> {
    console.log('🔍 DEBUG: transcribeOnce() called');
    
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      console.log('🔍 DEBUG: SpeechRecognition available?', !!SpeechRecognition);
      
      if (!SpeechRecognition) {
        console.error('🔍 DEBUG: SpeechRecognition NOT SUPPORTED');
        reject(new Error("Speech recognition not supported"));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-GB";
      recognition.interimResults = true;
      recognition.continuous = true;  // CHANGED: Keep listening continuously
      recognition.maxAlternatives = 1;

      console.log('🔍 DEBUG: Recognition configured:', {
        lang: recognition.lang,
        interimResults: recognition.interimResults,
        continuous: recognition.continuous
      });

      recognitionRef.current = recognition;
      
      let finalTranscript = '';
      let silenceTimer: NodeJS.Timeout | null = null;
      const SILENCE_DELAY = 1500; // Wait 1.5 seconds of silence before finalizing

      recognition.onspeechstart = () => {
        console.log('🔍 DEBUG: ✅ SPEECH START EVENT FIRED');
        console.log('🔍 DEBUG: Current state from ref:', conversationStateRef.current);
        
        isUserSpeakingRef.current = true;
        setActiveSpeaker("You");
        setLiveTranscript("");
        
        // Clear any pending silence timer
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
        
        // INTERRUPT AI if currently speaking (use ref for current value!)
        if (conversationStateRef.current === 'speaking') {
          console.log('⚠️🚨 INTERRUPTION DETECTED - STOPPING AI NOW!');
          stopSpeaking();
        } else {
          console.log('🔍 DEBUG: Not interrupting, state is:', conversationStateRef.current);
        }
      };

      recognition.onaudiostart = () => {
        console.log('🔍 DEBUG: ✅ AUDIO START - Microphone receiving audio');
      };

      recognition.onsoundstart = () => {
        console.log('🔍 DEBUG: ✅ SOUND START - Sound detected');
      };

      recognition.onsoundend = () => {
        console.log('🔍 DEBUG: 🔇 SOUND END - Starting silence timer...');
        // Start silence timer when sound stops
        if (silenceTimer) clearTimeout(silenceTimer);
        
        silenceTimer = setTimeout(() => {
          console.log('🔍 DEBUG: ⏱️ SILENCE TIMEOUT - Finalizing transcript');
          if (finalTranscript.trim()) {
            console.log('🔍 DEBUG: ✅ AUTO-FINALIZED:', finalTranscript);
            try {
              recognition.stop();
            } catch {}
            setLiveTranscript("");
            setIsProcessingTranscript(true);
            isUserSpeakingRef.current = false;
            setActiveSpeaker(null);
            resolve(finalTranscript.trim());
          }
        }, SILENCE_DELAY);
      };

      recognition.onresult = (event: any) => {
        console.log('🔍 DEBUG: ✅ ON RESULT - Got recognition results', event.results.length, 'results');
        
        // Accumulate all results
        let interimTranscript = '';
        let hasNewFinal = false;
        
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const isFinal = event.results[i].isFinal;
          const confidence = event.results[i][0].confidence;
          
          console.log(`🔍 DEBUG: Result ${i}:`, {
            transcript,
            isFinal,
            confidence,
            length: transcript.length
          });
          
          if (isFinal) {
            finalTranscript += transcript;
            hasNewFinal = true;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Show current transcript (final + interim)
        const displayText = finalTranscript + interimTranscript;
        console.log('🔍 DEBUG: 📝 Display:', displayText);
        setLiveTranscript(displayText);
      };

      recognition.onerror = (event: any) => {
        console.error('🔍 DEBUG: ❌ RECOGNITION ERROR:', event.error);
        if (silenceTimer) clearTimeout(silenceTimer);
        isUserSpeakingRef.current = false;
        setActiveSpeaker(null);
        setLiveTranscript("");
        
        // Don't reject on 'no-speech' or 'aborted' - those are normal
        if (event.error === 'no-speech' || event.error === 'aborted') {
          resolve('');
        } else {
          reject(new Error(event.error));
        }
      };

      recognition.onend = () => {
        console.log('🔍 DEBUG: ⏹️ RECOGNITION ENDED');
        if (silenceTimer) clearTimeout(silenceTimer);
        isUserSpeakingRef.current = false;
      };

      recognition.onnomatch = () => {
        console.log('🔍 DEBUG: ⚠️ NO MATCH - Speech detected but not recognized');
      };

      try {
        console.log('🔍 DEBUG: 🎬 STARTING RECOGNITION...');
        recognition.start();
        console.log('🔍 DEBUG: ✅ Recognition.start() called successfully');
      } catch (e) {
        console.error('🔍 DEBUG: ❌ FAILED TO START RECOGNITION:', e);
        reject(e);
      }
    });
  }

  // ADAPTER 2: AI-driven agent reply
  async function getAgentReply(userText: string): Promise<{ reply: string; speaker: string; voiceId?: string; stakeholderName?: string }> {
    try {
      const participantNames = selectedStakeholders.map(s => s.name);
      const conversationHistory = messages.map(msg => ({
        role: msg.who === "You" ? "user" : "assistant",
        content: msg.who === "You" ? msg.text : `[${msg.who}]: ${msg.text}`
      }));

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
              content: `You are simulating a realistic stakeholder conversation. Participants: ${participantNames.join(", ")}.

Project: ${selectedProject.name}
Description: ${selectedProject.description}

Stakeholders:
${selectedStakeholders.map(s => `- ${s.name} (${s.role}, ${s.department}): ${s.bio?.substring(0, 150) || s.personality}`).join('\n')}

Rules:
- Only ONE stakeholder responds per turn
- Choose the most relevant stakeholder based on expertise
- If user addresses someone by name, that person MUST respond
- If user asks for someone NOT present, state they're not in this meeting
- Do NOT include names in spoken text (UI shows it)
- Keep responses brief (1-3 sentences) and conversational
- Return strict JSON: { "speaker": "<exact name>", "reply": "<text>" }`
            },
            ...conversationHistory,
            { role: "user", content: userText }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      const data = await openaiResponse.json();
      const payload = JSON.parse(data.choices?.[0]?.message?.content || "{}");

      const speaker = payload.speaker || participantNames[0];
      const reply = payload.reply?.trim() || "Let's clarify that.";
      const safeSpeaker = participantNames.includes(speaker) ? speaker : participantNames[0];

      // Map to ElevenLabs voice
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

      const firstName = safeSpeaker.split(' ')[0];
      const voiceId = VOICE_MAP[firstName] || VOICE_MAP[safeSpeaker] || import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA;

      return { reply, speaker: safeSpeaker, voiceId, stakeholderName: safeSpeaker };
    } catch (error) {
      console.error('❌ getAgentReply error:', error);
      return {
        reply: "Sorry, I didn't catch that.",
        speaker: selectedStakeholders[0]?.name || "Stakeholder",
        voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA,
      };
    }
  }

  // ADAPTER 3: ElevenLabs TTS with interruption support
  async function speak(text: string, options?: { voiceId?: string; stakeholderName?: string }): Promise<void> {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const voiceId = options?.voiceId || import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA;
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    // Set active speaker for visual feedback
    setActiveSpeaker(options?.stakeholderName || null);
    
    return new Promise(async (resolve) => {
      try {
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.4, similarity_boost: 0.75 },
          }),
        });

        if (!ttsResponse.ok) throw new Error(`TTS failed: ${ttsResponse.status}`);

        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;

        const checkInterruption = setInterval(() => {
          if (isUserSpeakingRef.current && currentAudioRef.current === audio) {
            clearInterval(checkInterruption);
            audio.pause();
            URL.revokeObjectURL(url);
            currentAudioRef.current = null;
            setActiveSpeaker(null);
            resolve();
          }
        }, 100);

        audio.onended = () => {
          clearInterval(checkInterruption);
          URL.revokeObjectURL(url);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
            setActiveSpeaker(null);
          }
          resolve();
        };

        audio.onerror = () => {
          clearInterval(checkInterruption);
          URL.revokeObjectURL(url);
          setActiveSpeaker(null);
          resolve();
        };

        await audio.play();
      } catch (error) {
        console.error('❌ TTS error:', error);
        setActiveSpeaker(null);
        await playBrowserTTS(text).catch(() => {});
        resolve();
      }
    });
  }

  // Initialize loop
  useEffect(() => {
    console.log('🔍 DEBUG: Creating conversation loop (ONCE)');
    
    const loop = createStakeholderConversationLoop({
      transcribeOnce,
      getAgentReply,
      speak,
      onState: (s) => {
        console.log('🔍 DEBUG: Loop state changed to:', s);
        setConversationState(s);
        if (s === 'processing') {
          setIsProcessingTranscript(false);
        }
      },
      onUserUtterance: (text) => {
        console.log('🔍 DEBUG: User utterance captured:', text);
        setLiveTranscript("");
        addMessage({ who: "You", text, timestamp: new Date().toISOString() });
      },
      onAgentUtterance: ({ text, speaker }) => {
        console.log('🔍 DEBUG: Agent utterance:', speaker, '-', text.substring(0, 50));
        addMessage({ who: speaker, text, timestamp: new Date().toISOString() });
      },
    });
    
    loopRef.current = loop;
    console.log('🔍 DEBUG: Loop created and stored in loopRef');

    return () => {
      console.log('🔍 DEBUG: Component unmounting, cleaning up...');
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // CRITICAL FIX: Empty deps array - only create loop ONCE!

  const handleSpeak = async () => {
    console.log('🔍 DEBUG: ========== SPEAK BUTTON CLICKED ==========');
    console.log('🔍 DEBUG: Current state:', conversationState);
    console.log('🔍 DEBUG: Loop ref exists?', !!loopRef.current);
    
    // Check microphone permission
    try {
      console.log('🔍 DEBUG: Checking microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🔍 DEBUG: ✅ Microphone permission granted');
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
    } catch (e) {
      console.error('🔍 DEBUG: ❌ Microphone permission denied:', e);
      alert('Microphone permission required. Please allow microphone access and try again.');
      return;
    }
    
    if (loopRef.current) {
      console.log('🔍 DEBUG: Calling loop.start()...');
      loopRef.current.start();
    } else {
      console.error('🔍 DEBUG: ❌ Loop ref is null!');
    }
  };
  const handleInterrupt = () => {
    console.log('🔍 DEBUG: ========== INTERRUPT BUTTON CLICKED ==========');
    console.log('🔍 DEBUG: Current state:', conversationStateRef.current);
    
    if (conversationStateRef.current === 'speaking') {
      console.log('⚠️🚨 MANUAL INTERRUPTION - Stopping AI');
      stopSpeaking();
      setActiveSpeaker(null);
      
      // Restart recognition immediately
      if (loopRef.current?.state === 'speaking') {
        console.log('🔍 DEBUG: Restarting loop to continue listening...');
        // The loop will auto-continue after speak() resolves
      }
    }
  };

  const handleEnd = () => {
    console.log('🔍 DEBUG: ========== END MEETING CLICKED ==========');
    loopRef.current?.end();
    stopSpeaking();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
  };

  const handleBack = () => {
    if (conversationState !== "idle" && conversationState !== "ended") {
      if (!window.confirm("Leave active meeting?")) return;
      handleEnd();
    }
    setCurrentView("meeting-mode-selection");
  };

  const allParticipants = [
    { name: user?.email?.split('@')[0] || "You", isUser: true },
    ...selectedStakeholders.map(s => ({ name: s.name, isUser: false, avatar: s.photo }))
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-[#121212] to-[#1A1A1A] border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{selectedProject.name}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live Meeting</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(meetingDuration)}</span>
            </div>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                showTranscript ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Transcript</span>
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{allParticipants.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Main meeting area */}
        <div className={`flex-1 overflow-y-auto transition-all ${showCoaching ? 'mr-0' : ''}`}>
          <div className="max-w-5xl mx-auto p-6">
            <div className="flex flex-col items-center space-y-6">
            
            {/* Debug Panel - Always visible during development */}
            <div className="mb-4 w-full max-w-3xl">
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3 text-xs">
                <p className="text-yellow-300 font-mono">
                  🔍 DEBUG: State={conversationState} | Speaker={activeSpeaker || 'none'} | 
                  Live={liveTranscript ? 'YES' : 'NO'} | Processing={isProcessingTranscript ? 'YES' : 'NO'}
                </p>
              </div>
            </div>

            {/* Live Transcript Display - ALWAYS SHOW WHEN LISTENING */}
            {conversationState === 'listening' && (
              <div className="mb-8 w-full max-w-3xl">
                <div className="bg-gradient-to-r from-green-900/60 to-emerald-900/60 border-2 border-green-500 rounded-2xl p-8 shadow-2xl shadow-green-500/30 backdrop-blur-sm animate-pulse-ring">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center animate-pulse shadow-lg shadow-green-500/50">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-green-200 font-bold mb-3 tracking-wide">🎤 LISTENING - SPEAK NOW:</p>
                      <p className="text-2xl text-white font-medium min-h-[3rem]">
                        {liveTranscript || "Waiting for your voice..."}
                        {liveTranscript && <span className="inline-block w-1 h-6 bg-green-400 ml-2 animate-pulse" />}
                      </p>
                      <p className="text-xs text-green-300 mt-3 opacity-75">
                        Your words will appear here as you speak
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Processing Indicator */}
            {isProcessingTranscript && (
              <div className="mb-8 w-full max-w-3xl">
                <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/50 rounded-2xl p-6 shadow-2xl shadow-yellow-500/20">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                    <p className="text-lg text-yellow-200 font-medium">Processing your message...</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Participant Grid - Always Full Width */}
            <div className={`w-full grid gap-6 ${
              allParticipants.length <= 2 ? 'grid-cols-2 max-w-2xl' :
              allParticipants.length <= 4 ? 'grid-cols-2 lg:grid-cols-4 max-w-5xl' :
              'grid-cols-2 lg:grid-cols-3 max-w-6xl'
            }`}>
              {allParticipants.map((participant, idx) => {
                const isSpeaking = activeSpeaker === participant.name;
                const isListening = conversationState === 'listening' && participant.isUser;
                const isActive = isSpeaking || isListening;
                
                return (
                  <div
                    key={idx}
                    className={`relative bg-gradient-to-br from-[#1A1A1A] to-[#242424] rounded-2xl p-6 border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-purple-500 shadow-lg shadow-purple-500/50' 
                        : 'border-gray-700'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className={`relative ${isActive ? 'animate-pulse-ring' : ''}`}>
                        {participant.avatar ? (
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className={`w-24 h-24 rounded-full object-cover border-4 transition-all ${
                              isActive ? 'border-purple-500 shadow-xl shadow-purple-500/50' : 'border-gray-600'
                            }`}
                          />
                        ) : (
                          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 transition-all ${
                            isActive 
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-500 shadow-xl shadow-purple-500/50' 
                              : 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-600'
                          }`}>
                            {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        
                        {/* Mic Indicator */}
                        {isSpeaking && (
                          <div className="absolute -bottom-2 -right-2 bg-purple-600 rounded-full p-2 shadow-lg animate-bounce">
                            <div className="flex gap-0.5">
                              <div className="w-1 bg-white rounded-full animate-sound-bar-1" style={{ height: '12px' }} />
                              <div className="w-1 bg-white rounded-full animate-sound-bar-2" style={{ height: '16px' }} />
                              <div className="w-1 bg-white rounded-full animate-sound-bar-3" style={{ height: '10px' }} />
                            </div>
                          </div>
                        )}
                        
                        {isListening && (
                          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg animate-pulse">
                            <Mic className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <p className="font-semibold text-white">{participant.name}</p>
                        {!participant.isUser && (
                          <p className="text-xs text-gray-400 mt-1">
                            {selectedStakeholders.find(s => s.name === participant.name)?.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conversation Transcript - Below Avatars */}
            {showTranscript && messages.length > 0 && (
              <div className="w-full max-w-4xl mt-8">
                <div className="bg-[#1C1C1E] rounded-2xl border border-gray-700 shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      <h2 className="font-semibold text-white">Conversation Transcript</h2>
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                        {messages.length} messages
                      </span>
                    </div>
                    <button 
                      onClick={() => setShowTranscript(false)} 
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto p-6 space-y-3">
                    {messages.map((msg, idx) => {
                      const isUser = msg.who === "You";
                      return (
                        <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            isUser 
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700' 
                              : 'bg-gray-700'
                          }`}>
                            <p className="text-xs font-semibold mb-1 opacity-80">{msg.who}</p>
                            <p className="text-sm text-white/95 leading-relaxed">{msg.text}</p>
                            <p className="text-xs opacity-60 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Dock */}
      <div className="bg-[#121212]/95 backdrop-blur-sm border-t border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Status Text */}
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              conversationState === 'listening' ? 'bg-green-500 animate-pulse' :
              conversationState === 'processing' ? 'bg-yellow-500 animate-pulse' :
              conversationState === 'speaking' ? 'bg-purple-500 animate-pulse' :
              'bg-gray-600'
            }`} />
            <span className="text-sm text-gray-300">
              {conversationState === 'idle' && 'Ready to start'}
              {conversationState === 'listening' && 'Listening...'}
              {conversationState === 'processing' && 'Processing...'}
              {conversationState === 'speaking' && `${activeSpeaker} is speaking...`}
              {conversationState === 'ended' && 'Meeting ended'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Question Bank */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50"
              title="Question Bank"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Questions</span>
            </button>

            {/* Interrupt Button - Shows when AI is speaking */}
            {conversationState === 'speaking' && (
              <button
                onClick={handleInterrupt}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-all hover:shadow-lg hover:shadow-orange-500/50 animate-pulse"
                title="Interrupt AI and speak"
              >
                <Mic className="w-4 h-4" />
                <span className="text-sm font-medium">Interrupt</span>
              </button>
            )}

            {/* Mic Button */}
            <button
              onClick={handleSpeak}
              disabled={conversationState !== "idle"}
              className={`relative h-14 w-14 rounded-full flex items-center justify-center transition-all transform ${
                conversationState === "idle"
                  ? "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 active:scale-95"
                  : "bg-gray-700 cursor-not-allowed opacity-50"
              }`}
            >
              {conversationState === "idle" ? (
                <Mic className="w-7 h-7 text-white" />
              ) : (
                <MicOff className="w-7 h-7 text-white" />
              )}
              {conversationState === "listening" && (
                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping" />
              )}
            </button>

            {/* End Meeting */}
            <button
              onClick={handleEnd}
              disabled={conversationState === "idle" || conversationState === "ended"}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                conversationState === "idle" || conversationState === "ended"
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-500/50"
              }`}
            >
              End Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        @keyframes sound-bar-1 {
          0%, 100% { height: 8px; }
          50% { height: 16px; }
        }
        @keyframes sound-bar-2 {
          0%, 100% { height: 12px; }
          50% { height: 20px; }
        }
        @keyframes sound-bar-3 {
          0%, 100% { height: 6px; }
          50% { height: 14px; }
        }
        .animate-sound-bar-1 { animation: sound-bar-1 0.6s ease-in-out infinite; }
        .animate-sound-bar-2 { animation: sound-bar-2 0.7s ease-in-out infinite 0.1s; }
        .animate-sound-bar-3 { animation: sound-bar-3 0.8s ease-in-out infinite 0.2s; }
      `}</style>
    </div>
  );
}
