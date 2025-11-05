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
  
  // Enhanced Memory System
  const [meetingSummary, setMeetingSummary] = useState<string[]>([]);
  const [decisionsLog, setDecisionsLog] = useState<string[]>([]);
  const [topicsDiscussed, setTopicsDiscussed] = useState<Set<string>>(new Set());
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<any>(null);
  const isUserSpeakingRef = useRef<boolean>(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  
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
  
  // Auto-end meeting after 4 minutes of inactivity
  useEffect(() => {
    if (state.status === 'idle' || state.status === 'ended') return;
    
    // Check inactivity every 30 seconds
    inactivityTimerRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      const fourMinutes = 4 * 60 * 1000; // 4 minutes in milliseconds
      
      if (timeSinceLastActivity >= fourMinutes) {
        console.log('⏰ Auto-ending meeting due to 4 minutes of inactivity');
        confirmEnd();
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [state.status]);
  
  // Update last activity time whenever there's voice activity
  useEffect(() => {
    if (state.status === 'listening' || state.status === 'speaking') {
      lastActivityRef.current = Date.now();
    }
  }, [state.status, messages.length]);
  
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
  
  // Extract key topics from text
  const extractTopics = (text: string): string[] => {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Key topic keywords
    const topicKeywords = [
      'onboarding', 'implementation', 'training', 'integration',
      'delay', 'bottleneck', 'churn', 'timeline', 'department',
      'system', 'handoff', 'automation', 'process', 'customer',
      'revenue', 'cost', 'efficiency'
    ];
    
    topicKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        topics.push(keyword);
      }
    });
    
    return topics;
  };
  
  // Build memory context from meeting history
  const buildMemoryContext = (): string => {
    if (messages.length === 0) return '';
    
    const parts: string[] = [];
    
    // Recent conversation summary (last 3-4 exchanges)
    if (messages.length > 0) {
      const recentMessages = messages.slice(-6); // Last 6 messages (3 exchanges)
      const summary = recentMessages.map(m => `${m.who}: ${m.text}`).join('\n');
      parts.push(`RECENT DISCUSSION:\n${summary}`);
    }
    
    // Topics covered so far
    if (topicsDiscussed.size > 0) {
      parts.push(`\nTOPICS DISCUSSED: ${Array.from(topicsDiscussed).join(', ')}`);
    }
    
    // Decisions made (detect from keywords in messages)
    const decisions = messages
      .filter(m => {
        const lower = m.text.toLowerCase();
        return lower.includes('we should') || 
               lower.includes('let\'s') || 
               lower.includes('we need to') ||
               lower.includes('agreed') ||
               lower.includes('decision');
      })
      .slice(-3); // Last 3 decisions
    
    if (decisions.length > 0) {
      parts.push(`\nDECISIONS/ACTION ITEMS:\n${decisions.map(d => `- ${d.who}: ${d.text}`).join('\n')}`);
    }
    
    // Stakeholder contributions (who said what about what)
    const stakeholderContributions = new Map<string, string[]>();
    messages.forEach(msg => {
      if (msg.who !== 'You') {
        if (!stakeholderContributions.has(msg.who)) {
          stakeholderContributions.set(msg.who, []);
        }
        stakeholderContributions.get(msg.who)?.push(msg.text.substring(0, 100));
      }
    });
    
    if (stakeholderContributions.size > 0) {
      const contributions = Array.from(stakeholderContributions.entries())
        .map(([name, texts]) => `- ${name} has discussed: ${texts[texts.length - 1]}`)
        .join('\n');
      parts.push(`\nSTAKEHOLDER CONTEXT:\n${contributions}`);
    }
    
    return parts.join('\n');
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

  // ADAPTER 2: AI-driven agent reply with ENHANCED MEMORY & CONTEXT
  async function getAgentReply(userText: string): Promise<{ 
    reply: string; 
    speaker: string; 
    voiceId?: string; 
    stakeholderName?: string 
  }> {
    try {
      setAiThinking(true);
      
      const participantNames = selectedStakeholders.map(s => s.name);
      
      // Build CLEAN conversation history - ONLY what was actually said
      const conversationHistory = messages.map(msg => ({
        role: msg.who === "You" ? "user" : "assistant",
        content: msg.who === "You" ? msg.text : `[${msg.who}]: ${msg.text}`
      }));
      
      // SIMPLE memory: just last 2-3 exchanges for natural flow
      const recentContext = messages.length > 0 
        ? `\nRECENT CONVERSATION (for natural flow, don't repeat):\n${messages.slice(-4).map(m => `${m.who}: ${m.text}`).join('\n')}`
        : '';

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

      // DYNAMIC PROJECT CONTEXT - Uses actual selected project
      const projectContext = `
MEETING: ${selectedProject.name}

PEOPLE IN THIS MEETING:
${selectedStakeholders.map(s => `- ${s.name}: ${s.role}, ${s.department}`).join('\n')}

PROJECT DETAILS (everyone knows this, but ONLY mention if directly asked):
${selectedProject.description ? `- Description: ${selectedProject.description}` : ''}
${selectedProject.painPoints && selectedProject.painPoints.length > 0 ? `- Key Problems: ${selectedProject.painPoints.join(', ')}` : ''}
${selectedProject.asIsProcess ? `- Current Process: ${selectedProject.asIsProcess}` : ''}
${selectedProject.goals && selectedProject.goals.length > 0 ? `- Goals: ${selectedProject.goals.join(', ')}` : ''}
${selectedProject.constraints && selectedProject.constraints.length > 0 ? `- Constraints: ${selectedProject.constraints.join(', ')}` : ''}
${recentContext}
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

HOW TO ACT LIKE A REAL HUMAN:
1. **Social Greetings:** If asked "how are you", respond naturally: "I'm doing well, thanks! How about you?" or "Pretty good, thanks for asking"
2. **ONLY reference what was ACTUALLY said** - Don't make up context or hallucinate previous comments
3. **Natural flow:** Match the user's tone (casual chat vs. business discussion)
4. **Brief replies:** 1-2 sentences max unless asked for details
5. **Be helpful:** If asked about what someone said, ONLY quote if they actually said it. Otherwise say "I don't think they've mentioned that yet"
6. **Personality:** Each person has their own style - David is direct, Sarah is diplomatic, James is technical
7. Use "to" not dashes for ranges (e.g., "6 to 8 weeks")

Output JSON ONLY: {"speaker":"<exact name>","reply":"<natural response>"}${mandatorySpeaker}`
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
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
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
          
          <button
            onClick={endMeeting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">End</span>
          </button>
        </div>
      </div>
      
      {/* Main Content Area - ALIGNED TO TOP */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col p-6 overflow-auto">
          <div className="max-w-4xl w-full space-y-6">
            
            {/* Status Indicators - COMPACT */}
            <div className="w-full max-w-3xl">
              {state.status === 'listening' && (
              <div className={`w-full rounded-xl p-3 border ${
                isDark 
                  ? 'bg-green-900/40 border-green-500/50' 
                  : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-center gap-3">
                  <Mic className={`w-5 h-5 animate-pulse ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      Listening
                    </p>
                    {liveTranscript && (
                      <p className={`text-sm truncate ${isDark ? 'text-green-400/80' : 'text-green-600'}`}>
                        "{liveTranscript}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {(state.status === 'thinking' || aiThinking) && (
              <div className={`w-full rounded-xl p-3 border ${
                isDark 
                  ? 'bg-purple-900/40 border-purple-500/50' 
                  : 'bg-purple-50 border-purple-300'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-purple-400' : 'bg-purple-600'}`} style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    {generatingAudio ? 'Generating audio...' : 'Thinking...'}
                  </p>
                </div>
              </div>
            )}
            
            {state.status === 'speaking' && state.currentSpeaker && (
              <div className={`w-full rounded-xl p-3 border ${
                isDark 
                  ? 'bg-blue-900/40 border-blue-500/50' 
                  : 'bg-blue-50 border-blue-300'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    {state.currentSpeaker} speaking...
                  </p>
                </div>
              </div>
            )}
            </div>
            
            {/* STAKEHOLDER PARTICIPANT GRID */}
            <div className="flex-1 w-full flex flex-col items-center justify-center gap-4">
              {/* First Row */}
              <div className={`grid gap-4 ${
                selectedStakeholders.length + 1 === 2 ? 'grid-cols-2 max-w-xl' :
                selectedStakeholders.length + 1 === 3 ? 'grid-cols-3 max-w-3xl' :
                selectedStakeholders.length + 1 === 4 ? 'grid-cols-2 max-w-xl' :
                selectedStakeholders.length + 1 === 5 ? 'grid-cols-2 max-w-xl' :
                'grid-cols-3 max-w-4xl'
              }`}>
                {/* User Card */}
                <div
                  className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
                    isDark 
                      ? `bg-gradient-to-br from-[#1A1A1A] to-[#242424] ${state.status === 'listening' && state.currentSpeaker === 'You' ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-gray-700'}`
                      : state.status === 'listening' && state.currentSpeaker === 'You'
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-500 shadow-xl shadow-green-400/40 ring-2 ring-green-300'
                        : 'bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-md hover:border-purple-400'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-3 transition-colors duration-200 ${
                        state.status === 'listening' && state.currentSpeaker === 'You'
                          ? 'bg-gradient-to-br from-green-600 to-emerald-600 border-green-500 text-white' 
                          : isDark 
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white' 
                            : 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300 text-white'
                      }`}>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      {state.status === 'listening' && state.currentSpeaker === 'You' && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg">
                          <Mic className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        You
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Business Analyst
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* First Row Stakeholders */}
                {selectedStakeholders.slice(0, 
                  selectedStakeholders.length + 1 === 2 ? 1 :  // 2 total = show 1 stakeholder (+ user = 2)
                  selectedStakeholders.length + 1 === 3 ? 2 :  // 3 total = show 2 stakeholders (+ user = 3)
                  selectedStakeholders.length + 1 === 4 ? 1 :  // 4 total = show 1 stakeholder (+ user = 2 on top)
                  selectedStakeholders.length + 1 === 5 ? 1 :  // 5 total = show 1 stakeholder (+ user = 2 on top)
                  2  // 6+ total = show 2 stakeholders (+ user = 3 on top)
                ).map((stakeholder, idx) => {
                  const isSpeaking = state.status === 'speaking' && state.currentSpeaker === stakeholder.name;
                  
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
                        isDark 
                          ? `bg-gradient-to-br from-[#1A1A1A] to-[#242424] ${isSpeaking ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-gray-700'}`
                          : isSpeaking 
                            ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-500 shadow-xl shadow-purple-400/40 ring-2 ring-purple-300'
                            : 'bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-md hover:border-purple-400 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="relative">
                          {stakeholder.photo ? (
                            <img
                              src={stakeholder.photo}
                              alt={stakeholder.name}
                              className={`w-16 h-16 rounded-full object-cover border-3 transition-colors duration-200 ${
                                isSpeaking ? 'border-purple-500 ring-2 ring-purple-300' : isDark ? 'border-gray-600' : 'border-purple-200'
                              }`}
                            />
                          ) : (
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-3 transition-colors duration-200 ${
                              isSpeaking 
                                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-500 text-white' 
                                : isDark 
                                  ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-600 text-white' 
                                  : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-300 text-gray-700'
                            }`}>
                              {stakeholder.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </div>
                          )}
                          
                          {isSpeaking && (
                            <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1.5 shadow-lg">
                              <div className="flex gap-0.5 items-end">
                                <div className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '8px' }} />
                                <div className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '12px', animationDelay: '150ms' }} />
                                <div className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '6px', animationDelay: '300ms' }} />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {stakeholder.name}
                          </p>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {stakeholder.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Second Row (for 4+ participants) */}
              {selectedStakeholders.length + 1 >= 4 && (
                <div className={`grid gap-4 ${
                  selectedStakeholders.length + 1 === 4 ? 'grid-cols-2 max-w-xl' :
                  selectedStakeholders.length + 1 === 5 ? 'grid-cols-3 max-w-3xl' :
                  'grid-cols-3 max-w-4xl'
                }`}>
                  {selectedStakeholders.slice(
                    selectedStakeholders.length + 1 === 4 ? 1 :  // 4 total: skip first 1
                    selectedStakeholders.length + 1 === 5 ? 1 :  // 5 total: skip first 1
                    2  // 6+ total: skip first 2
                  ).map((stakeholder, idx) => {
                    const isSpeaking = state.status === 'speaking' && state.currentSpeaker === stakeholder.name;
                    
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
                          isDark 
                            ? `bg-gradient-to-br from-[#1A1A1A] to-[#242424] ${isSpeaking ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-gray-700'}`
                            : isSpeaking 
                              ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-500 shadow-xl shadow-purple-400/40 ring-2 ring-purple-300'
                              : 'bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-md hover:border-purple-400 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className="relative">
                            {stakeholder.photo ? (
                              <img
                                src={stakeholder.photo}
                                alt={stakeholder.name}
                                className={`w-16 h-16 rounded-full object-cover border-3 transition-colors duration-200 ${
                                  isSpeaking ? 'border-purple-500 ring-2 ring-purple-300' : isDark ? 'border-gray-600' : 'border-purple-200'
                                }`}
                              />
                            ) : (
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-3 transition-colors duration-200 ${
                                isSpeaking 
                                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-500 text-white' 
                                  : isDark 
                                    ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-600 text-white' 
                                    : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-300 text-gray-700'
                              }`}>
                                {stakeholder.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </div>
                            )}
                            
                            {isSpeaking && (
                              <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1.5 shadow-lg">
                                <div className="flex gap-0.5 items-end">
                                  <div className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '8px' }} />
                                  <div className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '12px', animationDelay: '150ms' }} />
                                  <div className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '6px', animationDelay: '300ms' }} />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-center">
                            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {stakeholder.name}
                            </p>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {stakeholder.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
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
