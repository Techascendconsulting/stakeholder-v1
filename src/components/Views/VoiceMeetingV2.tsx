// Voice Meeting V2 - Dark Meeting Interface with Visual Voice Activity
// Professional meeting experience with interruption handling and live feedback

import { useState, useRef, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationState, setConversationState] = useState<string>("idle");
  const [showTranscript, setShowTranscript] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  
  // Auto Send vs Review Mode
  const [autoSendMode, setAutoSendMode] = useState(true);
  const [pendingTranscript, setPendingTranscript] = useState<string>("");
  const [showReviewPanel, setShowReviewPanel] = useState(false);
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
            
            // After final result, wait 1.5s for more speech before finalizing
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
                
                // If Review Mode, show confirmation panel instead of auto-sending
                if (!autoSendMode) {
                  setPendingTranscript(result);
                  setShowReviewPanel(true);
                  resolve(""); // Empty string = don't send yet
                } else {
                  // Auto Send Mode - send immediately
                  resolve(result);
                }
              }
            }, 1500);
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
          console.error('❌ Audio error:', e);
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          setActiveSpeaker(null);
          resolve();
        };

        await audio.play();

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

  // Initialize loop
  useEffect(() => {
    console.log('🔍 DEBUG: Creating conversation loop (ONCE)');
    
    const loop = createStakeholderConversationLoop({
      transcribeOnce,
      getAgentReply,
      speak,
      onState: (s) => {
        // console.log('State:', s);
        setConversationState(s);
        if (s === 'processing') {
          setIsProcessingTranscript(false);
        }
      },
      onUserUtterance: (text) => {
        // console.log('User:', text);
        setLiveTranscript("");
        addMessage({ who: "You", text, timestamp: new Date().toISOString() });
      },
      onAgentUtterance: ({ text, speaker }) => {
        // console.log('Agent:', speaker, text);
        addMessage({ who: speaker, text, timestamp: new Date().toISOString() });
      },
    });
    
    loopRef.current = loop;
    // console.log('Loop initialized');
    
    return () => {
      // console.log('Cleaning up...');
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
      
      // Return to idle (ready for next input)
      setConversationState('idle');
      
      // If in auto-send mode, restart the loop
      if (autoSendMode) {
        loopRef.current?.start();
      }
    } catch (error) {
      console.error('❌ Manual send error:', error);
      setConversationState('idle');
    }
  };

  const handleSpeak = async () => {
    // Check microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone granted');
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
    } catch (e) {
      console.error('❌ Microphone denied:', e);
      alert('Microphone permission required. Please allow microphone access and try again.');
      return;
    }
    
    if (loopRef.current) {
      loopRef.current.start();
    } else {
      console.error('❌ Loop not initialized');
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
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-[#121212] to-[#1A1A1A] border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="hover:text-gray-300 transition-colors"
                >
                  Dashboard
                </button>
                <span>/</span>
                <button 
                  onClick={() => setCurrentView('practice-flow')}
                  className="hover:text-gray-300 transition-colors"
                >
                  Practice
                </button>
                <span>/</span>
                <button 
                  onClick={() => {
                    setSelectedProject(null);
                    setCurrentView('projects');
                  }}
                  className="hover:text-gray-300 transition-colors"
                >
                  Projects
                </button>
                <span>/</span>
                <button 
                  onClick={() => setCurrentView('project-brief')}
                  className="hover:text-gray-300 transition-colors"
                  title={selectedProject.name}
                >
                  {selectedProject.name.length > 20 ? selectedProject.name.substring(0, 20) + '...' : selectedProject.name}
                </button>
                <span>/</span>
                <button 
                  onClick={() => setCurrentView('meeting-mode-selection')}
                  className="hover:text-gray-300 transition-colors"
                >
                  Meeting Setup
                </button>
                <span>/</span>
                <span className="text-gray-400">Voice Meeting</span>
              </div>
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
            
            {/* Send Mode Selection */}
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setAutoSendMode(true)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  autoSendMode 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-300'
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
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                title="Review Mode: Edit your message before sending"
              >
                ✏️ Review
              </button>
            </div>
            
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                showTranscript ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20'
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
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-6 py-4 w-full">
          <div className="flex flex-col items-center space-y-4">
            
            {/* Compact Status Area - Prevents Layout Shift */}
            <div className="w-full max-w-3xl" style={{ minHeight: '60px' }}>
              {conversationState === 'listening' && (
                <div className="w-full">
                  <div className="bg-gradient-to-r from-green-900/60 to-emerald-900/60 border border-green-500 rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-green-200 font-semibold mb-1">Listening</p>
                        <p className="text-base text-white font-medium truncate">
                          {liveTranscript || "Speak now..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isProcessingTranscript && (
                <div className="w-full">
                  <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/50 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <p className="text-sm text-purple-200 font-medium">Processing...</p>
                    </div>
                  </div>
                </div>
              )}
              
              {conversationState === 'idle' && (
                <div className="w-full">
                  <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-400 text-center">Click "Start Speaking" to begin</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Review Panel - Only shown in Review Mode */}
            {showReviewPanel && pendingTranscript && (
              <div className="w-full max-w-3xl">
                <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-2 border-purple-500 rounded-lg p-4 shadow-xl">
                  <div className="mb-3">
                    <p className="text-xs text-purple-200 font-semibold mb-2">✏️ Review Your Message</p>
                    <textarea
                      value={pendingTranscript}
                      onChange={(e) => setPendingTranscript(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-purple-400"
                      rows={3}
                      placeholder="Your message..."
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowReviewPanel(false);
                        setPendingTranscript("");
                        // Restart listening
                        loopRef.current?.start();
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      ❌ Cancel
                    </button>
                    <button
                      onClick={() => {
                        const textToSend = pendingTranscript.trim();
                        if (textToSend) {
                          setShowReviewPanel(false);
                          setPendingTranscript("");
                          // Manually trigger the conversation flow with edited text
                          addMessage({ who: "You", text: textToSend, timestamp: new Date().toISOString() });
                          // Get AI response
                          handleManualSend(textToSend);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-sm font-medium transition-colors text-white"
                    >
                      ✅ Send Message
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Participant Grid - Compact Layout */}
            <div className={`w-full grid gap-4 ${
              allParticipants.length <= 2 ? 'grid-cols-2 max-w-xl mx-auto' :
              allParticipants.length <= 4 ? 'grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto' :
              'grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto'
            }`}>
              {allParticipants.map((participant, idx) => {
                const isSpeaking = activeSpeaker === participant.name;
                const isListening = conversationState === 'listening' && participant.isUser;
                const isActive = isSpeaking || isListening;
                
                return (
                  <div
                    key={idx}
                    className={`relative bg-gradient-to-br from-[#1A1A1A] to-[#242424] rounded-xl p-4 border-2 transition-colors duration-200 ${
                      isActive 
                        ? 'border-purple-500 shadow-lg shadow-purple-500/30' 
                        : 'border-gray-700'
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
                              isActive ? 'border-purple-500' : 'border-gray-600'
                            }`}
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-3 transition-colors duration-200 ${
                            isActive 
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-500' 
                              : 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-600'
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
                        <p className="font-semibold text-white text-sm">{participant.name}</p>
                        {!participant.isUser && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {selectedStakeholders.find(s => s.name === participant.name)?.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conversation Transcript - Clean & Compact */}
            {showTranscript && messages.length > 0 && (
              <div className="w-full max-w-3xl mt-4">
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <h3 className="text-white font-medium text-sm">Transcript</h3>
                      <span className="text-gray-400 text-xs">({messages.length})</span>
                    </div>
                    <button 
                      onClick={() => setShowTranscript(false)} 
                      className="text-gray-400 hover:text-white transition-colors p-1"
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
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isUser ? 'bg-blue-600' : 'bg-purple-600'
                          }`}>
                            {initials}
                          </div>
                          {/* Message */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-medium text-white">{msg.who}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed mt-0.5">{msg.text}</p>
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
              ) : conversationState === "listening" ? (
                <Mic className="w-7 h-7 text-white animate-pulse" />
              ) : (
                <MicOff className="w-7 h-7 text-white" />
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
