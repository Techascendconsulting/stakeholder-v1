// Voice Meeting V2 - Dark Meeting Interface with Visual Voice Activity
// Professional meeting experience with interruption handling and live feedback

import { useState, useRef, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { createStakeholderConversationLoop } from "../../services/conversationLoop";
import { playBrowserTTS } from "../../lib/browserTTS";
import ProcessDocumentViewer from './ProcessDocumentViewer';
import VoiceMeetingTour from '../VoiceMeetingTour';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Users, 
  Clock, 
  MessageSquare, 
  X,
  FileText,
  ChevronRight,
  HelpCircle
} from "lucide-react";

interface Message {
  who: "You" | string;
  text: string;
  timestamp: string;
  document?: string; // Optional process document reference
}

export default function VoiceMeetingV2() {
  const { selectedProject, selectedStakeholders, setCurrentView, user } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Load messages from sessionStorage on mount (persist across refresh)
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('voiceMeeting_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [conversationState, setConversationState] = useState<string>("idle");
  const [showTranscript, setShowTranscript] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(() => {
    const saved = sessionStorage.getItem('voiceMeeting_duration');
    return saved ? parseInt(saved) : 0;
  });
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  
  // Auto Send vs Review Mode
  const [autoSendMode, setAutoSendMode] = useState(true);
  const [pendingTranscript, setPendingTranscript] = useState<string>("");
  
  // Process document viewer state
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  
  // Auto-show transcript when Review mode is active
  useEffect(() => {
    if (!autoSendMode) {
      setShowTranscript(true);
    }
  }, [autoSendMode]);
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
        setMeetingDuration(prev => {
          const newDuration = prev + 1;
          sessionStorage.setItem('voiceMeeting_duration', newDuration.toString());
          return newDuration;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [conversationState]);

  // Check for existing session and tour status on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('voiceMeeting_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed.length > 0) {
          setShowResumeModal(true);
        }
      } catch {}
    }

    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('voiceMeetingTourCompleted');
    if (!hasSeenTour) {
      // Show tour after a brief delay
      setTimeout(() => setShowTour(true), 1000);
    }
  }, []);

  // Browser refresh/close warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (messages.length > 0 && conversationState !== 'ended') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages.length, conversationState]);

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
    setMessages((m) => {
      const newMessages = [...m, msg];
      sessionStorage.setItem('voiceMeeting_messages', JSON.stringify(newMessages));
      return newMessages;
    });
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
            
            // Adaptive timeout based on phrase length
            if (silenceTimeout) clearTimeout(silenceTimeout);
            
            const currentText = (finalTranscript + newFinal).trim();
            const wordCount = currentText.split(/\s+/).filter(Boolean).length;
            
            // Short phrases (<5 words) → quick send (800ms)
            // Medium phrases (5-12 words) → moderate (1500ms)  
            // Long phrases (>12 words) → allow thinking (2500ms)
            let timeout;
            if (wordCount < 5) timeout = 800;
            else if (wordCount < 12) timeout = 1500;
            else timeout = 2500;
            
            console.log(`📊 Words: ${wordCount}, Timeout: ${timeout}ms`);
            
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
            }, timeout);
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
        console.warn('⚠️ Speech error:', event.error);
        
        if (silenceTimeout) clearTimeout(silenceTimeout);
        
        // Handle different error types
        if (event.error === 'network' || event.error === 'no-speech') {
          // Graceful recovery - just log, don't break the loop
          console.log('Network/no-speech error - will retry naturally');
        } else if (event.error === 'not-allowed') {
          alert('Microphone permission required for meeting.');
        }
        
        if (!isResolved) {
          isResolved = true;
          isUserSpeakingRef.current = false;
          setActiveSpeaker(null);
          setLiveTranscript("");
          resolve(finalTranscript.trim());
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended - loop handles restart');
        if (silenceTimeout) clearTimeout(silenceTimeout);
        if (!isResolved) {
          isResolved = true;
          isUserSpeakingRef.current = false;
          setActiveSpeaker(null);
          setLiveTranscript("");
          const result = finalTranscript.trim();
          console.log('✅ Captured:', result || '(empty)');
          resolve(result);
        }
        // Note: Loop manages its own restart - no auto-restart here to avoid conflicts
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
              content: `CUSTOMER Onboarding Optimization Meeting. Participants: ${participantNames.join(", ")}.
Return your reply strictly as a single JSON object only.

CRITICAL: This is about onboarding NEW CUSTOMERS/CLIENTS to our software platform, NOT employee onboarding.

Current Problems:
- NEW CUSTOMERS take 6 to 8 weeks to get up and running on our platform (target: 3 to 4 weeks)
- 23% of new CUSTOMERS churn in first 90 days
- Customer implementation involves 7 internal departments (Sales, Implementation, IT, Support, etc.)
- 4 disconnected software systems (Salesforce CRM, Monday.com, staging environment, production)
- Manual handoffs between departments cause 24 to 48 hour delays for CUSTOMERS
- Costs us $2.3M/year in lost revenue and inefficiency

Context: We sell enterprise software. When a customer buys, they need to be set up, trained, and go live. That's what we're optimizing.

Rules:
- ONE stakeholder responds per turn${mandatorySpeaker ? '' : ' (choose most relevant)'}
- Talk like a real person: "I'm good, thanks" not "I'm excited to dive into..."
- Keep replies natural and brief (2-3 sentences)
- This is about CUSTOMER onboarding (clients buying our software), NOT employee HR
- Be specific with metrics when relevant
- HARD RULE: NEVER use dashes in ranges. ALWAYS say "6 to 8 weeks" NEVER "6-8 weeks". Use "to" for all ranges.
- Output strict JSON: {"speaker":"<exact name>","reply":"<response text>"}${mandatorySpeaker}`
            },
            ...conversationHistory,
            { role: "user", content: userText }
          ],
          response_format: { type: "json_object" },
          temperature: 0.6,
          max_tokens: 150,
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('❌ OpenAI API Error:', openaiResponse.status, errorText);
        throw new Error(`OpenAI error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      
      // Fallback if model breaks JSON schema
      let payload = {};
      try {
        payload = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      } catch (err) {
        console.warn('⚠️ Non-JSON reply detected, using fallback');
        payload = { 
          speaker: participantNames[0], 
          reply: data.choices?.[0]?.message?.content || "Let's continue." 
        };
      }

      let speaker = (typeof payload.speaker === 'string' && payload.speaker.trim()) 
        ? payload.speaker.trim() 
        : participantNames[0];
      const reply = (typeof payload.reply === 'string' && payload.reply.trim())
        ? payload.reply.trim()
        : "Let's continue.";
      const document = payload.document || undefined; // Extract document reference
      
      // FORCE the mentioned stakeholder to respond (override AI if it chose wrong)
      if (mentionedStakeholder) {
        if (speaker !== mentionedStakeholder.name) {
          console.log(`🎯 OVERRIDE: User mentioned "${mentionedStakeholder.name}" but AI chose "${speaker}" - forcing correct speaker`);
        }
        speaker = mentionedStakeholder.name;
      }
      
      const safeSpeaker = participantNames.includes(speaker) ? speaker : participantNames[0];
      
      if (document) {
        console.log('📄 AI referenced document:', document);
      }

      // Map to ElevenLabs voice
      const VOICE_MAP: Record<string, string | undefined> = {
        "Aisha": import.meta.env.VITE_ELEVENLABS_VOICE_ID_AISHA,
        "Jess": import.meta.env.VITE_ELEVENLABS_VOICE_ID_JESS,
        "David": "L0Dsvb3SLTyegXwtm47J",
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

      return { reply, speaker: safeSpeaker, voiceId, stakeholderName: safeSpeaker, document };
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
      onAgentUtterance: ({ text, speaker, document }) => {
        console.log(`🤖 ${speaker}:`, text);
        addMessage({ who: speaker, text, timestamp: new Date().toISOString(), document });
      },
    });
    
    loopRef.current = loop;
    console.log('✅ Loop ready');
    
    return () => {
      console.log('Cleaning up loop - audio/speech only, preserving session');
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
      // Don't clear messages - they're preserved in sessionStorage
    };
  }, []); // Create loop ONCE on mount

  // End meeting and clear session
  const handleEndMeeting = () => {
    console.log('🔚 Ending meeting and clearing session');
    sessionStorage.removeItem('voiceMeeting_messages');
    sessionStorage.removeItem('voiceMeeting_duration');
    setMessages([]);
    setConversationState('ended');
    setMeetingDuration(0);
    setShowExitModal(false);
    setCurrentView('meeting-mode-selection');
  };

  // Start fresh meeting (clear saved session)
  const handleStartFresh = () => {
    console.log('🆕 Starting fresh meeting');
    sessionStorage.removeItem('voiceMeeting_messages');
    sessionStorage.removeItem('voiceMeeting_duration');
    setMessages([]);
    setMeetingDuration(0);
    setShowResumeModal(false);
  };

  // Resume previous meeting
  const handleResumeMeeting = () => {
    console.log('▶️ Resuming previous meeting');
    setShowResumeModal(false);
  };

  // Handle manual send in Review Mode
  const handleManualSend = async (text: string) => {
    try {
      setConversationState('processing');
      
      // Get AI response
      const agentReply = await getAgentReply(text);
      
      // Add AI message (with document if referenced)
      addMessage({ 
        who: agentReply.speaker, 
        text: agentReply.reply, 
        timestamp: new Date().toISOString(),
        document: agentReply.document
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
    if (messages.length > 0 && conversationState !== "ended") {
      setShowExitModal(true);
    } else {
      setCurrentView("meeting-mode-selection");
    }
  };

  const allParticipants = [
    { name: user?.email?.split('@')[0] || "You", isUser: true },
    ...selectedStakeholders.map(s => ({ name: s.name, isUser: false, avatar: s.photo }))
  ];

  return (
    <div className={`flex flex-col min-h-screen ${
      isDark 
        ? 'bg-[#0D0D0D] text-white' 
        : 'bg-gradient-to-br from-purple-50 via-white to-indigo-50 text-gray-900'
    }`}>
      {/* Modern Navigation Header */}
      <div className={`${
        isDark 
          ? 'bg-gradient-to-b from-gray-900 to-gray-900/95 border-gray-800/50' 
          : 'bg-white/80 backdrop-blur-md border-purple-200 shadow-sm'
      } border-b`}>
        <div className="px-6 py-2">
          {/* Top Row: Back Button + Breadcrumbs */}
          <div className="flex items-center gap-4 mb-2">
            <button 
              onClick={handleBack}
              className={`p-2 rounded-lg transition-all hover:scale-105 ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Back to Meeting Setup"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb Navigation */}
            <div className={`flex items-center gap-2 text-sm ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`hover:underline transition-colors ${
                  isDark ? 'hover:text-gray-300' : 'hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <ChevronRight className="w-4 h-4" />
              <button 
                onClick={() => setCurrentView('project-flow')}
                className={`hover:underline transition-colors ${
                  isDark ? 'hover:text-gray-300' : 'hover:text-gray-900'
                }`}
              >
                Projects
              </button>
              <ChevronRight className="w-4 h-4" />
              <button 
                onClick={() => setCurrentView('projects')}
                className={`hover:underline transition-colors ${
                  isDark ? 'hover:text-gray-300' : 'hover:text-gray-900'
                }`}
              >
                Select
              </button>
              <ChevronRight className="w-4 h-4" />
              <button 
                onClick={handleBack}
                className={`hover:underline transition-colors ${
                  isDark ? 'hover:text-gray-300' : 'hover:text-gray-900'
                }`}
              >
                Setup
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Meeting</span>
            </div>
          </div>

          {/* Bottom Row: Project Title + Status */}
          <div className="flex items-center justify-between" data-tour="meeting-header">
            <div className="flex items-center gap-4">
              <div>
                <h1 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedProject.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}>
                      Live Meeting
                    </span>
                  </div>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}>•</span>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {selectedStakeholders.length} stakeholder{selectedStakeholders.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(meetingDuration)}</span>
            </div>
            
            {/* Send Mode Selection */}
            <div 
              className={`flex items-center gap-1 rounded-lg p-0.5 ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-200'
              }`}
              data-tour="mode-toggle"
            >
              <button
                onClick={() => setAutoSendMode(true)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  autoSendMode 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Auto Send: Messages send immediately after you finish speaking"
              >
                Auto
              </button>
              <button
                onClick={() => setAutoSendMode(false)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  !autoSendMode 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Review Mode: Edit your message before sending"
              >
                Review
              </button>
            </div>
            
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              disabled={!autoSendMode}
              data-tour="transcript-toggle" 
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
            <button
              onClick={() => setShowTour(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title="View guided tour"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col items-center space-y-4">
            
            {/* Compact Status Area - Prevents Layout Shift */}
            <div className="w-full max-w-3xl" style={{ minHeight: '50px' }}>
              {conversationState === 'listening' && (
                <div className="w-full">
                  <div className={`rounded-xl p-3 border ${
                    isDark 
                      ? 'bg-gradient-to-r from-green-900/60 to-emerald-900/60 border-green-500 shadow-lg' 
                      : 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 border-green-300 shadow-md shadow-green-200/50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-green-500' : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg'
                      }`}>
                        <Mic className="w-5 h-5 text-white" />
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
                  <div className={`rounded-xl p-3 border ${
                    isDark 
                      ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/50 shadow-lg' 
                      : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-100 border-purple-300 shadow-md shadow-purple-200/50'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`} />
                      <p className={`text-sm font-medium ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>Processing...</p>
                    </div>
                  </div>
                </div>
              )}
              
              {conversationState === 'idle' && (
                <div className="w-full">
                  <div className={`rounded-xl p-3 border ${
                    isDark 
                      ? 'bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700' 
                      : 'bg-gradient-to-r from-gray-50 to-slate-100 border-gray-300 shadow-sm'
                  }`}>
                    <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                      Click the microphone button below to begin speaking
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Participant Grid - Compact Layout */}
            <div className={`w-full flex justify-center`} data-tour="participants">
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
                          ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-500 shadow-xl shadow-purple-400/40 ring-2 ring-purple-300'
                          : 'bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-md hover:border-purple-400 hover:shadow-lg hover:shadow-purple-200/50'
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
                              isActive ? 'border-purple-500 ring-2 ring-purple-300' : isDark ? 'border-gray-600' : 'border-purple-200'
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
              <div className="w-full max-w-3xl">
                <div className={`backdrop-blur-sm rounded-xl border ${
                  isDark 
                    ? 'bg-gray-800/90 border-gray-700 shadow-xl' 
                    : 'bg-white/95 border-purple-200 shadow-lg shadow-purple-100/50'
                }`}>
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${
                    isDark ? 'border-gray-700/50' : 'border-purple-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`} />
                      <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Transcript</h3>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-purple-600'}`}>({messages.length})</span>
                    </div>
                    <button 
                      onClick={() => setShowTranscript(false)} 
                      className={`transition-colors p-1 rounded-lg ${
                        isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title="Hide transcript"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: '280px' }}>
                    {messages.map((msg, idx) => {
                      const isUser = msg.who === "You";
                      const stakeholder = selectedStakeholders.find(s => s.name === msg.who);
                      const initials = isUser ? 'U' : (stakeholder?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'S');
                      
                      return (
                        <div key={idx} className="flex gap-3">
                          {/* Avatar */}
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white shadow-md ${
                            isUser 
                              ? isDark ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-600 to-blue-700' 
                              : isDark ? 'bg-purple-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'
                          }`}>
                            {initials}
                          </div>
                          {/* Message */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{msg.who}</span>
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-sm leading-relaxed mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{msg.text}</p>
                            
                            {/* Document Reference Button */}
                            {msg.document && (
                              <button
                                onClick={() => setIsDocumentViewerOpen(true)}
                                className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-medium transition-all shadow-md hover:shadow-lg"
                              >
                                <FileText className="w-3 h-3" />
                                <span>View {msg.document}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Review Mode - Compact Input */}
                    {!autoSendMode && (
                      <div className="mt-4 pt-3 border-t border-gray-200/50">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={pendingTranscript}
                            onChange={(e) => setPendingTranscript(e.target.value)}
                            placeholder="Type your message or click mic to speak..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && pendingTranscript.trim()) {
                                e.preventDefault();
                                const textToSend = pendingTranscript.trim();
                                setPendingTranscript("");
                                addMessage({ who: "You", text: textToSend, timestamp: new Date().toISOString() });
                                handleManualSend(textToSend);
                              }
                            }}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 transition-all ${
                              isDark 
                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500' 
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-purple-400 focus:border-purple-400 focus:bg-white'
                            }`}
                          />
                          <button
                            onClick={() => {
                              const textToSend = pendingTranscript.trim();
                              if (textToSend) {
                                setPendingTranscript("");
                                addMessage({ who: "You", text: textToSend, timestamp: new Date().toISOString() });
                                handleManualSend(textToSend);
                              }
                            }}
                            disabled={!pendingTranscript.trim()}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                              pendingTranscript.trim()
                                ? isDark 
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200/50 hover:shadow-xl'
                                : isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Send
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
      <div className={`backdrop-blur-md border-t px-6 py-4 ${
        isDark 
          ? 'bg-[#121212]/95 border-gray-800' 
          : 'bg-white/95 border-purple-100 shadow-lg shadow-purple-100/50'
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
              data-tour="mic-button"
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
              data-tour="end-meeting"
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                conversationState === "idle" || conversationState === "ended"
                  ? isDark ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : isDark 
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-500/50 text-white"
                    : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 hover:shadow-xl hover:shadow-red-300/50 text-white"
              }`}
            >
              End Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Process Document Viewer */}
      <ProcessDocumentViewer
        isOpen={isDocumentViewerOpen}
        onClose={() => setIsDocumentViewerOpen(false)}
        documentPath="/onboarding_process_document.md"
      />

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

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-xl shadow-2xl p-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              End Meeting?
            </h3>
            <p className={`text-sm mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Your conversation will be cleared. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleEndMeeting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                End Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Meeting Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-xl shadow-2xl p-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Previous Meeting Found
            </h3>
            <p className={`text-sm mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              You have an unfinished meeting with {messages.length} message{messages.length !== 1 ? 's' : ''}. Would you like to continue or start fresh?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStartFresh}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Start Fresh
              </button>
              <button
                onClick={handleResumeMeeting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Resume Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guided Tour */}
      {showTour && (
        <VoiceMeetingTour
          onComplete={() => {
            setShowTour(false);
            localStorage.setItem('voiceMeetingTourCompleted', 'true');
          }}
          onSkip={() => {
            setShowTour(false);
            localStorage.setItem('voiceMeetingTourCompleted', 'true');
          }}
        />
      )}
      </div>
    </div>
  );
}

