// Voice Meeting V2 - REBUILT FOR PERFORMANCE & PROPER LAYOUT
// Full working implementation with conversation loop, AI, and TTS

import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { createStakeholderConversationLoop } from "../../services/conversationLoop";
import { synthesizeToBlob, resolveVoiceId } from "../../services/elevenLabsTTS";
import { playBrowserTTS } from "../../lib/browserTTS";
import { 
  ArrowLeft, Mic, MicOff, Users, Clock, MessageSquare, X, 
  FileText, HelpCircle, Loader2
} from "lucide-react";

interface Message {
  who: "You" | string;
  text: string;
  timestamp: string;
  document?: string;
}

interface ConversationState {
  status: 'idle' | 'listening' | 'thinking' | 'speaking' | 'ended';
  currentSpeaker: string | null;
}

export default function VoiceMeetingV2Rebuilt() {
  const { selectedProject, selectedStakeholders, setCurrentView, user } = useApp();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Core state
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('voiceMeeting_messages');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [state, setState] = useState<ConversationState>({
    status: 'idle',
    currentSpeaker: null
  });
  
  const [meetingDuration, setMeetingDuration] = useState(() => {
    const saved = sessionStorage.getItem('voiceMeeting_duration');
    return saved ? parseInt(saved) : 0;
  });
  
  const [showTranscript, setShowTranscript] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<any>(null);
  const isUserSpeakingRef = useRef<boolean>(false);
  
  // Meeting timer
  useEffect(() => {
    if (state.status !== 'idle' && state.status !== 'ended') {
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
  }, [state.status]);
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Redirect if no setup
  useEffect(() => {
    if (!selectedProject || !selectedStakeholders?.length) {
      setCurrentView("dashboard");
    }
  }, [selectedProject, selectedStakeholders, setCurrentView]);
  
  if (!selectedProject || !selectedStakeholders?.length) {
    return null;
  }
  
  const addMessage = useCallback((msg: Message) => {
    setMessages(m => {
      const newMessages = [...m, msg];
      sessionStorage.setItem('voiceMeeting_messages', JSON.stringify(newMessages));
      return newMessages;
    });
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // ADAPTER 1: Fast transcription using Web Speech API
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
      recognition.continuous = true;
      recognition.interimResults = true;

      recognitionRef.current = recognition;
      
      let finalTranscript = "";
      let isResolved = false;
      let silenceTimeout: any = null;

      recognition.onspeechstart = () => {
        console.log('🎤 Listening');
        isUserSpeakingRef.current = true;
        setState({ status: 'listening', currentSpeaker: 'You' });
        setLiveTranscript("");
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
            
            if (silenceTimeout) clearTimeout(silenceTimeout);
            
            const currentText = (finalTranscript + newFinal).trim();
            const wordCount = currentText.split(/\s+/).filter(Boolean).length;
            
            // Adaptive timeout
            let timeout;
            if (wordCount < 5) timeout = 800;
            else if (wordCount < 12) timeout = 1500;
            else timeout = 2500;
            
            silenceTimeout = setTimeout(() => {
              if (!isResolved && finalTranscript.trim()) {
                isResolved = true;
                try { recognition.stop(); } catch {}
                isUserSpeakingRef.current = false;
                setState({ status: 'thinking', currentSpeaker: null });
                setLiveTranscript("");
                resolve(finalTranscript.trim());
              }
            }, timeout);
          } else {
            interim += transcript;
          }
        }

        if (newFinal) finalTranscript += newFinal;
        setLiveTranscript(interim || finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('⚠️ Speech error:', event.error);
        if (silenceTimeout) clearTimeout(silenceTimeout);
        if (!isResolved) {
          isResolved = true;
          isUserSpeakingRef.current = false;
          setState({ status: 'idle', currentSpeaker: null });
          setLiveTranscript("");
          resolve(finalTranscript.trim());
        }
      };

      recognition.onend = () => {
        if (silenceTimeout) clearTimeout(silenceTimeout);
        if (!isResolved) {
          isResolved = true;
          isUserSpeakingRef.current = false;
          resolve(finalTranscript.trim());
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

  // ADAPTER 2: AI-driven agent reply with IMPROVED CONTEXT
  async function getAgentReply(userText: string): Promise<{ 
    reply: string; 
    speaker: string; 
    voiceId?: string; 
    stakeholderName?: string 
  }> {
    try {
      setAiThinking(true);
      
      const participantNames = selectedStakeholders.map(s => s.name);
      const conversationHistory = messages.map(msg => ({
        role: msg.who === "You" ? "user" : "assistant",
        content: msg.who === "You" ? msg.text : `[${msg.who}]: ${msg.text}`
      }));

      // DETECT MENTIONED NAMES
      const userTextLower = userText.toLowerCase();
      const mentionedStakeholder = selectedStakeholders.find(s => {
        const fullName = s.name.toLowerCase();
        const firstName = s.name.split(' ')[0].toLowerCase();
        const namePattern = new RegExp(`\\b${firstName}\\b|\\b${fullName}\\b`, 'i');
        return namePattern.test(userText);
      });
      
      const mandatorySpeaker = mentionedStakeholder 
        ? `\n\n🚨 MANDATORY: User mentioned "${mentionedStakeholder.name}" so this person MUST respond.`
        : '';

      // ENHANCED PROJECT CONTEXT
      const projectContext = `
PROJECT: ${selectedProject.name}
DESCRIPTION: ${selectedProject.description || 'Customer onboarding optimization'}

KEY PROBLEMS:
- New customers take 6 to 8 weeks to get up and running (target: 3 to 4 weeks)
- 23% churn in first 90 days
- 7 internal departments involved (Sales, Implementation, IT, Support)
- 4 disconnected systems (Salesforce, Monday.com, staging, production)
- Manual handoffs cause 24 to 48 hour delays
- Costs $2.3M per year in lost revenue

STAKEHOLDERS IN THIS MEETING:
${selectedStakeholders.map(s => `- ${s.name} (${s.role}, ${s.department}): ${s.priorities?.join(', ') || 'General concerns'}`).join('\n')}

CONTEXT: This is about onboarding NEW CUSTOMERS/CLIENTS to our software platform, NOT employee onboarding.
`.trim();

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
              content: `${projectContext}

MEETING RULES:
- ONE stakeholder responds per turn${mandatorySpeaker ? '' : ' (choose most relevant based on their role)'}
- Natural conversation: "I'm good, thanks" not "I'm excited to dive into..."
- Brief replies (2-3 sentences max)
- Be specific with YOUR role's perspective and metrics
- HARD RULE: Use "to" for ranges, never dashes (e.g., "6 to 8 weeks" not "6-8 weeks")
- Output strict JSON: {"speaker":"<exact name>","reply":"<response text>"}${mandatorySpeaker}`
            },
            ...conversationHistory,
            { role: "user", content: userText }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 120,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      let payload = {};
      try {
        payload = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      } catch {
        payload = { 
          speaker: participantNames[0], 
          reply: "Could you elaborate on that?" 
        };
      }

      const speaker = (payload as any).speaker || participantNames[0];
      const reply = (payload as any).reply || "I see what you mean.";
      
      // Find matching stakeholder for voice
      const matchedStakeholder = selectedStakeholders.find(s => 
        s.name.toLowerCase() === speaker.toLowerCase()
      );
      
      const voiceId = matchedStakeholder?.voiceId || resolveVoiceId(speaker);

      setAiThinking(false);
      return { 
        reply, 
        speaker, 
        voiceId,
        stakeholderName: speaker 
      };

    } catch (error) {
      console.error('❌ getAgentReply error:', error);
      setAiThinking(false);
      return {
        reply: "Sorry, could you repeat that?",
        speaker: selectedStakeholders[0]?.name || "Stakeholder",
      };
    }
  }

  // ADAPTER 3: High-quality TTS playback
  async function speak(text: string, options?: { voiceId?: string; stakeholderName?: string }): Promise<void> {
    try {
      setGeneratingAudio(true);
      setState(prev => ({ ...prev, status: 'speaking', currentSpeaker: options?.stakeholderName || 'Stakeholder' }));
      
      console.log('🔊 Generating audio with ElevenLabs...');
      const audioBlob = await synthesizeToBlob(text, { 
        stakeholderName: options?.stakeholderName 
      });
      
      setGeneratingAudio(false);

      if (!audioBlob) {
        console.warn('⚠️ No audio blob, falling back to browser TTS');
        await playBrowserTTS(text);
        return;
      }

      // Play audio
      return new Promise((resolve, reject) => {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          setState(prev => ({ ...prev, status: 'listening', currentSpeaker: null }));
          resolve();
        };

        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          console.error('❌ Audio playback error:', e);
          reject(e);
        };

        audio.play().catch(reject);
      });

    } catch (error) {
      console.error('❌ speak error:', error);
      setGeneratingAudio(false);
      setState(prev => ({ ...prev, status: 'listening', currentSpeaker: null }));
    }
  }

  // Auto-start meeting
  useEffect(() => {
    if (state.status === 'idle' && !loopRef.current) {
      console.log('🚀 Auto-starting meeting...');
      
      const loop = createStakeholderConversationLoop({
        transcribeOnce,
        getAgentReply,
        speak,
        onState: (loopState) => {
          console.log('🔄 Loop state:', loopState);
        },
        onUserUtterance: (text) => {
          addMessage({
            who: "You",
            text,
            timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          });
        },
        onAgentUtterance: ({ text, speaker }) => {
          addMessage({
            who: speaker,
            text,
            timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          });
        }
      });

      loopRef.current = loop;
      loop.start();
      setState({ status: 'listening', currentSpeaker: null });
    }

    return () => {
      if (loopRef.current) {
        loopRef.current.end();
        loopRef.current = null;
      }
    };
  }, []);
  
  const endMeeting = () => {
    setShowExitModal(true);
  };
  
  const confirmEnd = () => {
    if (loopRef.current) {
      loopRef.current.end();
      loopRef.current = null;
    }
    setState({ status: 'ended', currentSpeaker: null });
    sessionStorage.removeItem('voiceMeeting_messages');
    sessionStorage.removeItem('voiceMeeting_duration');
    setCurrentView('dashboard');
  };
  
  return (
    // Full height container with sidebar
    <div 
      className="flex flex-col h-screen w-full"
      style={{ 
        backgroundColor: isDark ? '#0D0D0D' : '#FAFAFF',
      }}
    >
      {/* Header Bar */}
      <div 
        className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark 
            ? 'bg-gray-900/95 border-gray-800' 
            : 'bg-white/90 border-purple-200 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => endMeeting()}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
              <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>•</span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedStakeholders.length} stakeholder{selectedStakeholders.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatTime(meetingDuration)}
            </span>
          </div>
          
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              showTranscript 
                ? 'bg-blue-600 text-white' 
                : isDark ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Transcript</span>
          </button>
        </div>
      </div>
      
      {/* Main Content Area - ALIGNED TO TOP */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col p-6 overflow-auto">
          <div className="max-w-4xl w-full space-y-6">
            
            {/* Status Indicators - FULL WIDTH, TOP ALIGNED */}
            {state.status === 'listening' && (
              <div className={`w-full rounded-xl p-6 border ${
                isDark 
                  ? 'bg-green-900/40 border-green-500/50' 
                  : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-center gap-4">
                  <Mic className={`w-6 h-6 animate-pulse ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      Listening...
                    </p>
                    {liveTranscript && (
                      <p className={`text-base mt-2 ${isDark ? 'text-green-400/80' : 'text-green-600'}`}>
                        "{liveTranscript}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {(state.status === 'thinking' || aiThinking) && (
              <div className={`w-full rounded-xl p-6 border ${
                isDark 
                  ? 'bg-purple-900/40 border-purple-500/50' 
                  : 'bg-purple-50 border-purple-300'
              }`}>
                <div className="flex items-center gap-4">
                  <Loader2 className={`w-6 h-6 animate-spin ${
                    isDark ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                      {generatingAudio ? 'Generating audio...' : 'Thinking...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {state.status === 'speaking' && state.currentSpeaker && (
              <div className={`w-full rounded-xl p-6 border ${
                isDark 
                  ? 'bg-blue-900/40 border-blue-500/50' 
                  : 'bg-blue-50 border-blue-300'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className={`w-3 h-3 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-3 h-3 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-3 h-3 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className={`font-semibold text-lg ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    {state.currentSpeaker} is speaking...
                  </p>
                </div>
              </div>
            )}
            
            {/* Transcript */}
            {showTranscript && messages.length > 0 && (
              <div className={`rounded-xl border max-h-96 overflow-y-auto ${
                isDark 
                  ? 'bg-gray-800/90 border-gray-700' 
                  : 'bg-white/95 border-purple-200'
              }`}>
                <div className={`sticky top-0 px-4 py-3 border-b ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-purple-100'
                }`}>
                  <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Transcript ({messages.length})
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-xs font-medium ${
                          msg.who === "You" 
                            ? isDark ? 'text-green-400' : 'text-green-600'
                            : isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          {msg.who}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {msg.text}
                      </p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
      
      {/* Exit Modal */}
      {showExitModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 max-w-md w-full mx-4 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              End Meeting?
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to end this meeting? Your transcript will be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmEnd}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                End Meeting
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
