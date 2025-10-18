// Voice Meeting V2 - Dark Meeting Interface with Visual Voice Activity
// Professional meeting experience with interruption handling and live feedback

import { useState, useRef, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { createStakeholderConversationLoop } from "../../services/conversationLoop";
import { playBrowserTTS } from "../../lib/browserTTS";
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Users, 
  Clock, 
  MessageSquare, 
  X
} from "lucide-react";

interface Message {
  who: "You" | string;
  text: string;
  timestamp: string;
}

export default function VoiceMeetingV2() {
  const { selectedProject, selectedStakeholders, setCurrentView, user } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationState, setConversationState] = useState<string>("idle");
  const [showTranscript, setShowTranscript] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  
  // Auto Send vs Review Mode
  const [autoSendMode, setAutoSendMode] = useState(true);
  const [pendingTranscript, setPendingTranscript] = useState<string>("");
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  
  // Auto-show transcript when Review mode is active or when review panel appears
  useEffect(() => {
    if (!autoSendMode || showReviewPanel) {
      setShowTranscript(true);
    }
  }, [autoSendMode, showReviewPanel]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  
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

  // ADAPTER 1: Fast transcription - NO delays, NO interruption logic
  async function transcribeOnce(): Promise<string> {
    return new Promise((resolve) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.error('❌ SpeechRecognition not supported');
        resolve('');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-GB";
      recognition.continuous = true; // Keep listening for complete thoughts
      recognition.interimResults = true;

      recognitionRef.current = recognition;
      
      let finalTranscript = "";
      let isResolved = false;
      let silenceTimeout: any = null;

      recognition.onspeechstart = () => {
        console.log('🎤 Listening');
        isUserSpeakingRef.current = true;
        setActiveSpeaker("You");
        setLiveTranscript("");
        // Clear any pending timeout
        if (silenceTimeout) clearTimeout(silenceTimeout);
      };

      recognition.onresult = (event: any) => {
        if (isResolved) return;
        
        let interim = "";
        let newFinal = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            newFinal += transcript + " ";
            
            // After final result, wait 3s for more speech (allows thinking time)
            if (silenceTimeout) clearTimeout(silenceTimeout);
            silenceTimeout = setTimeout(() => {
              if (!isResolved && finalTranscript.trim()) {
                isResolved = true;
                try { recognition.stop(); } catch {}
                isUserSpeakingRef.current = false;
                setActiveSpeaker(null);
                setLiveTranscript("");
                
                const result = finalTranscript.trim();
                console.log('✅ Done:', result);
                resolve(result);
              }
            }, 3000);
          } else {
            interim += transcript;
          }
        }

        if (newFinal) {
          finalTranscript += newFinal;
        }

        // Show live transcript
        setLiveTranscript(interim || finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Error:', event.error);
        if (silenceTimeout) clearTimeout(silenceTimeout);
        if (!isResolved) {
          isResolved = true;
          isUserSpeakingRef.current = false;
          setActiveSpeaker(null);
          setLiveTranscript("");
          resolve(finalTranscript.trim());
        }
      };

      recognition.onend = () => {
        if (silenceTimeout) clearTimeout(silenceTimeout);
        if (!isResolved) {
          isResolved = true;
          isUserSpeakingRef.current = false;
          setActiveSpeaker(null);
          setLiveTranscript("");
          const result = finalTranscript.trim();
          console.log('✅ Ended:', result || '(empty)');
          resolve(result);
        }
      };

      try {
        recognition.start();
      } catch (e) {
        console.error('❌ Start failed:', e);
        resolve('');
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

      // DETECT MENTIONED NAMES FIRST - before calling AI
      const userTextLower = userText.toLowerCase();
      const mentionedStakeholder = selectedStakeholders.find(s => {
        const fullName = s.name.toLowerCase();
        const firstName = s.name.split(' ')[0].toLowerCase();
        
        // Check for exact name match with word boundaries
        const namePattern = new RegExp(`\\b${firstName}\\b|\\b${fullName}\\b`, 'i');
        return namePattern.test(userText);
      });
      
      if (mentionedStakeholder) {
        console.log(`🎯 DETECTED: User mentioned "${mentionedStakeholder.name}"`);
      }
      
      // Build mandatory speaker instruction if name was mentioned
      const mandatorySpeaker = mentionedStakeholder 
        ? `\n\n🚨 MANDATORY: The user specifically mentioned "${mentionedStakeholder.name}" so this person MUST respond. Set "speaker" to "${mentionedStakeholder.name}".`
        : '';

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
              content: `Stakeholder meeting. Participants: ${participantNames.join(", ")}.

PROJECT: ${selectedProject.name}
${selectedProject.description}

KNOWN PROBLEMS (you all know these):
${selectedProject.problemStatement}

CURRENT PROCESS PAIN POINTS:
${selectedProject.asIsProcess}

Stakeholders:
${selectedStakeholders.map(s => `${s.name} (${s.role}, ${s.department}): ${s.personality || 'Professional stakeholder'}`).join('\n')}

RULES:
1. ONE stakeholder per turn
2. If user says a name, THAT person responds
3. Speak with SPECIFIC knowledge (use actual metrics, pain points, process steps from above)
4. Be direct and knowledgeable - you've read the project brief
5. Brief responses (2-3 sentences)
6. JSON: { "speaker": "<exact name>", "reply": "<text>" }${mandatorySpeaker}`
            },
            ...conversationHistory,
            { role: "user", content: userText }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 180,
        }),
      });

      const data = await openaiResponse.json();
      const payload = JSON.parse(data.choices?.[0]?.message?.content || "{}");

      let speaker = payload.speaker || participantNames[0];
      const reply = payload.reply?.trim() || "Let's clarify that.";
      
      // FORCE the mentioned stakeholder to respond (override AI if it chose wrong)
      if (mentionedStakeholder) {
        if (speaker !== mentionedStakeholder.name) {
          console.log(`🎯 OVERRIDE: User mentioned "${mentionedStakeholder.name}" but AI chose "${speaker}" - forcing correct speaker`);
        }
        speaker = mentionedStakeholder.name;
      }
      
      const safeSpeaker = participantNames.includes(speaker) ? speaker : participantNames[0];

      // Map to ElevenLabs voice
      const VOICE_MAP: Record<string, string | undefined> = {
        "Aisha": import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA,
        "Jess": import.meta.env.VITE_ELEVENLABS_VOICE_ID_JESS,
        "David": import.meta.env.VITE_ELEVENLABS_VOICE_ID_DAVID,
        "James": "pYDLV125o4CgqP8i49Lg",
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

  // ADAPTER 3: ElevenLabs TTS - Clean playback without interruption
  async function speak(text: string, options?: { voiceId?: string; stakeholderName?: string }): Promise<void> {
    // Stop any previous audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const voiceId = options?.voiceId || import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA;
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    setActiveSpeaker(options?.stakeholderName || null);
    console.log('🔊 Speaking:', text.substring(0, 50));
    
    return new Promise(async (resolve) => {
      try {
        // Get TTS audio from ElevenLabs
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            "xi-api-key": apiKey 
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.4, similarity_boost: 0.75 },
          }),
        });

        if (!ttsResponse.ok) {
          throw new Error(`TTS failed: ${ttsResponse.status}`);
        }

        const audioBuffer = await ttsResponse.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;

        audio.onended = () => {
          console.log('✅ Audio finished');
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          setActiveSpeaker(null);
          resolve();
        };

        audio.onerror = (e) => {
          console.error('❌ Audio playback error:', e);
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          setActiveSpeaker(null);
          resolve();
        };

        console.log('▶️ Starting audio playback...');
        await audio.play().catch((playError) => {
          console.error('❌ Play failed:', playError);
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          setActiveSpeaker(null);
          resolve();
        });

      } catch (error) {
        console.error('❌ TTS error:', error);
        setActiveSpeaker(null);
        // Fallback to browser TTS if ElevenLabs fails
        try {
          await playBrowserTTS(text);
        } catch (e) {
          console.error('❌ Browser TTS also failed:', e);
        }
        resolve();
      }
    });
  }

  // Initialize loop - recreate when key dependencies change
  useEffect(() => {
    console.log('Creating conversation loop');
    
    const loop = createStakeholderConversationLoop({
      transcribeOnce,
      getAgentReply,
      speak,
      onState: (s) => {
        console.log('Loop state:', s);
        setConversationState(s);
        if (s === 'processing') {
          setIsProcessingTranscript(false);
        }
      },
      onUserUtterance: (text) => {
        console.log('User said:', text);
        setLiveTranscript("");
        addMessage({ who: "You", text, timestamp: new Date().toISOString() });
      },
      onAgentUtterance: ({ text, speaker }) => {
        console.log('Agent said:', speaker, '-', text.substring(0, 50));
        addMessage({ who: speaker, text, timestamp: new Date().toISOString() });
      },
    });
    
    loopRef.current = loop;
    console.log('✅ Loop ready');
    
    return () => {
      console.log('Cleaning up loop');
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
  }, []); // Create loop ONCE on mount

  // Handle manual send in Review Mode
  const handleManualSend = async (text: string) => {
    try {
      setConversationState('processing');
      
      // Get AI response
      const agentReply = await getAgentReply(text);
      
      // Add AI message
      addMessage({ 
        who: agentReply.speaker, 
        text: agentReply.reply, 
        timestamp: new Date().toISOString() 
      });
      
      // Speak the response
      setConversationState('speaking');
      await speak(agentReply.reply, { 
        voiceId: agentReply.voiceId, 
        stakeholderName: agentReply.speaker 
      });
      
      // After AI finishes, return to idle
      setConversationState('idle');
      
      // In Review mode, wait for next manual input (don't auto-restart)
      // User will click mic button again when ready
    } catch (error) {
      console.error('❌ Manual send error:', error);
      setConversationState('idle');
    }
  };

  const handleSpeak = async () => {
    console.log('🎤 SPEAK BUTTON CLICKED - Mode:', autoSendMode ? 'Auto Send' : 'Review');
    console.log('🎤 Loop ref exists?', !!loopRef.current);
    
    // Check microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone granted');
      stream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.error('❌ Microphone denied:', e);
      alert('Microphone permission required. Please allow microphone access and try again.');
      return;
    }
    
    // Review Mode: One-shot capture, show review panel
    if (!autoSendMode) {
      console.log('📝 Review Mode: Capturing one utterance');
      try {
        setConversationState('listening');
        const text = await transcribeOnce();
        console.log('📝 Captured:', text);
        if (text && text.trim()) {
          setPendingTranscript(text);
          setShowReviewPanel(true);
        }
        setConversationState('idle');
      } catch (error) {
        console.error('❌ Review mode error:', error);
        setConversationState('idle');
      }
    } else {
      // Auto Send Mode: Start free-flowing loop
      console.log('⚡ Auto Send Mode: Starting loop');
      if (loopRef.current) {
        console.log('✅ Calling loop.start()');
        loopRef.current.start();
      } else {
        console.error('❌ Loop not initialized - this should never happen!');
      }
    }
  };

  const handleEnd = () => {
    console.log('⏹️ Ending meeting');
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
    <div className={`min-h-screen flex flex-col ${
      isDark 
        ? 'bg-[#0D0D0D] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Top Bar */}
      <div className={`px-6 py-3 border-b ${
        isDark 
          ? 'bg-gradient-to-b from-[#121212] to-[#1A1A1A] border-gray-800' 
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              {/* Breadcrumbs */}
              <div className={`flex items-center gap-1.5 text-xs mb-1 ${
                isDark ? 'text-gray-500' : 'text-gray-600'
              }`}>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className={isDark ? 'hover:text-gray-300 transition-colors' : 'hover:text-gray-800 transition-colors'}
                >
                  Dashboard
                </button>
                <span>/</span>
                <button 
                  onClick={() => setCurrentView('project-flow')}
                  className={isDark ? 'hover:text-gray-300 transition-colors' : 'hover:text-gray-800 transition-colors'}
                >
                  Projects
                </button>
                <span>/</span>
                <button 
                  onClick={() => setCurrentView('projects')}
                  className={isDark ? 'hover:text-gray-300 transition-colors' : 'hover:text-gray-800 transition-colors'}
                >
                  Select Project
                </button>
                <span>/</span>
                <button 
                  onClick={() => setCurrentView('project-brief')}
                  className={isDark ? 'hover:text-gray-300 transition-colors' : 'hover:text-gray-800 transition-colors'}
                  title={selectedProject.name}
                >
                  {selectedProject.name.length > 20 ? selectedProject.name.substring(0, 20) + '...' : selectedProject.name}
                </button>
                <span>/</span>
                <button 
                  onClick={() => setCurrentView('meeting-mode-selection')}
                  className={isDark ? 'hover:text-gray-300 transition-colors' : 'hover:text-gray-800 transition-colors'}
                >
                  Meeting Setup
                </button>
                <span>/</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Voice Meeting</span>
              </div>
              <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedProject.name}
              </h1>
              <div className={`flex items-center gap-2 text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live Meeting</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(meetingDuration)}</span>
            </div>
            
            {/* Send Mode Selection */}
            <div className={`flex items-center gap-2 rounded-lg p-1 ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-200'
            }`}>
              <button
                onClick={() => setAutoSendMode(true)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  autoSendMode 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Auto Send: Messages send immediately after you finish speaking"
              >
                ⚡ Auto Send
              </button>
              <button
                onClick={() => setAutoSendMode(false)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  !autoSendMode 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Review Mode: Edit your message before sending"
              >
                ✏️ Review
              </button>
            </div>
            
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              disabled={!autoSendMode} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                !autoSendMode 
                  ? 'bg-blue-600 text-white cursor-default' 
                  : showTranscript 
                    ? 'bg-blue-600 text-white' 
                    : isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title={!autoSendMode ? 'Transcript always shown in Review mode' : showTranscript ? 'Hide transcript' : 'Show transcript'}
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
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-6 py-4 w-full">
          <div className="flex flex-col items-center space-y-4">
            
            {/* Compact Status Area - Prevents Layout Shift */}
            <div className="w-full max-w-3xl" style={{ minHeight: '60px' }}>
              {conversationState === 'listening' && (
                <div className="w-full">
                  <div className={`rounded-lg p-3 shadow-lg border ${
                    isDark 
                      ? 'bg-gradient-to-r from-green-900/60 to-emerald-900/60 border-green-500' 
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-green-200' : 'text-green-700'}`}>Listening</p>
                        <p className={`text-base font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {liveTranscript || "Speak now..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isProcessingTranscript && (
                <div className="w-full">
                  <div className={`rounded-lg p-3 border ${
                    isDark 
                      ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/50' 
                      : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <p className={`text-sm font-medium ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>Processing...</p>
                    </div>
                  </div>
                </div>
              )}
              
              {conversationState === 'idle' && (
                <div className="w-full">
                  <div className={`rounded-lg p-3 border ${
                    isDark 
                      ? 'bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700' 
                      : 'bg-gray-100 border-gray-300'
                  }`}>
                    <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click the microphone button below to begin speaking
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Participant Grid - Compact Layout */}
            <div className={`w-full flex justify-center`}>
              <div className={`grid gap-4 ${
                allParticipants.length <= 2 ? 'grid-cols-2 max-w-xl' :
                allParticipants.length === 3 ? 'grid-cols-3 max-w-3xl' :
                allParticipants.length === 4 ? 'grid-cols-2 lg:grid-cols-4 max-w-4xl' :
                allParticipants.length === 5 ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-6xl' :
                'grid-cols-2 lg:grid-cols-3 max-w-5xl'
              }`}>
              {allParticipants.map((participant, idx) => {
                const isSpeaking = activeSpeaker === participant.name;
                const isListening = conversationState === 'listening' && participant.isUser;
                const isActive = isSpeaking || isListening;
                
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
                      isDark 
                        ? `bg-gradient-to-br from-[#1A1A1A] to-[#242424] ${isActive ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-gray-700'}`
                        : isActive 
                          ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-400 shadow-lg shadow-purple-400/30'
                          : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 shadow-md hover:border-purple-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative">
                        {participant.avatar ? (
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className={`w-16 h-16 rounded-full object-cover border-3 transition-colors duration-200 ${
                              isActive ? 'border-purple-500' : isDark ? 'border-gray-600' : 'border-gray-300'
                            }`}
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-3 transition-colors duration-200 ${
                            isActive 
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-500 text-white' 
                              : isDark 
                                ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-600 text-white' 
                                : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-300 text-gray-700'
                          }`}>
                            {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        
                        {/* Mic Indicator - Fixed Position */}
                        {isSpeaking && (
                          <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1.5 shadow-lg">
                            <div className="flex gap-0.5 items-end">
                              <div className="w-0.5 bg-white rounded-full animate-sound-bar-1" style={{ height: '8px' }} />
                              <div className="w-0.5 bg-white rounded-full animate-sound-bar-2" style={{ height: '12px' }} />
                              <div className="w-0.5 bg-white rounded-full animate-sound-bar-3" style={{ height: '6px' }} />
                            </div>
                          </div>
                        )}
                        
                        {isListening && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg">
                            <Mic className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{participant.name}</p>
                        {!participant.isUser && (
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedStakeholders.find(s => s.name === participant.name)?.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Conversation Transcript - Clean & Compact */}
            {showTranscript && messages.length > 0 && (
              <div className="w-full max-w-3xl mt-4">
                <div className={`backdrop-blur-sm rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800/90 border-gray-700' 
                    : 'bg-white border-gray-300 shadow-lg'
                }`}>
                  <div className={`flex items-center justify-between px-3 py-2 border-b ${
                    isDark ? 'border-gray-700/50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Transcript</h3>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({messages.length})</span>
                    </div>
                    <button 
                      onClick={() => setShowTranscript(false)} 
                      className={`transition-colors p-1 ${
                        isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Hide transcript"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto p-3 space-y-2" style={{ maxHeight: '200px' }}>
                    {messages.map((msg, idx) => {
                      const isUser = msg.who === "You";
                      const stakeholder = selectedStakeholders.find(s => s.name === msg.who);
                      const initials = isUser ? 'U' : (stakeholder?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'S');
                      
                      return (
                        <div key={idx} className="flex gap-2">
                          {/* Avatar */}
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                            isUser ? 'bg-blue-600' : 'bg-purple-600'
                          }`}>
                            {initials}
                          </div>
                          {/* Message */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{msg.who}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-sm leading-relaxed mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Review Mode - Inline Edit */}
                    {showReviewPanel && pendingTranscript && (
                      <div className={`border-2 border-purple-500 rounded-lg p-3 ${
                        isDark ? 'bg-purple-900/30' : 'bg-purple-50'
                      }`}>
                        <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>✏️ Review & Edit</p>
                        <textarea
                          value={pendingTranscript}
                          onChange={(e) => setPendingTranscript(e.target.value)}
                          className={`w-full border rounded p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDark 
                              ? 'bg-gray-800 border-gray-600 text-white' 
                              : 'bg-white border-purple-300 text-gray-900'
                          }`}
                          rows={2}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setShowReviewPanel(false);
                              setPendingTranscript("");
                              loopRef.current?.start();
                            }}
                            className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              const textToSend = pendingTranscript.trim();
                              if (textToSend) {
                                setShowReviewPanel(false);
                                setPendingTranscript("");
                                addMessage({ who: "You", text: textToSend, timestamp: new Date().toISOString() });
                                handleManualSend(textToSend);
                              }
                            }}
                            className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded text-xs font-medium text-white transition-colors"
                          >
                            ✅ Send
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Dock */}
      <div className={`backdrop-blur-sm border-t px-6 py-4 ${
        isDark 
          ? 'bg-[#121212]/95 border-gray-800' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Status Text */}
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              conversationState === 'listening' ? 'bg-green-500 animate-pulse' :
              conversationState === 'processing' ? 'bg-yellow-500 animate-pulse' :
              conversationState === 'speaking' ? 'bg-purple-500 animate-pulse' :
              'bg-gray-600'
            }`} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {conversationState === 'idle' && 'Ready to start'}
              {conversationState === 'listening' && 'Listening...'}
              {conversationState === 'processing' && 'Processing...'}
              {conversationState === 'speaking' && `${activeSpeaker} is speaking...`}
              {conversationState === 'ended' && 'Meeting ended'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Mic Button */}
            <button
              onClick={handleSpeak}
              disabled={conversationState !== "idle"}
              className={`relative h-14 w-14 rounded-full flex items-center justify-center transition-all transform ${
                conversationState === "idle"
                  ? "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 active:scale-95"
                  : isDark 
                    ? "bg-gray-700 cursor-not-allowed opacity-50"
                    : "bg-gray-300 cursor-not-allowed opacity-50"
              }`}
            >
              {conversationState === "idle" ? (
                <Mic className="w-7 h-7 text-white" />
              ) : conversationState === "listening" ? (
                <Mic className="w-7 h-7 text-white animate-pulse" />
              ) : (
                <MicOff className={`w-7 h-7 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              )}
            </button>

            {/* End Meeting */}
            <button
              onClick={handleEnd}
              disabled={conversationState === "idle" || conversationState === "ended"}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                conversationState === "idle" || conversationState === "ended"
                  ? isDark ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-500/50 text-white"
              }`}
            >
              End Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        /* Sound bar animations for speaking indicator */
        @keyframes sound-bar-1 {
          0%, 100% { height: 8px; }
          50% { height: 14px; }
        }
        @keyframes sound-bar-2 {
          0%, 100% { height: 12px; }
          50% { height: 18px; }
        }
        @keyframes sound-bar-3 {
          0%, 100% { height: 6px; }
          50% { height: 12px; }
        }
        .animate-sound-bar-1 { animation: sound-bar-1 0.5s ease-in-out infinite; }
        .animate-sound-bar-2 { animation: sound-bar-2 0.6s ease-in-out infinite 0.1s; }
        .animate-sound-bar-3 { animation: sound-bar-3 0.7s ease-in-out infinite 0.2s; }
      `}</style>
    </div>
  );
}
