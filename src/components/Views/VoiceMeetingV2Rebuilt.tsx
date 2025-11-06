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
    // Full height container - Teams style
    <div 
      className="flex flex-col h-screen w-full"
      style={{ 
        backgroundColor: '#1F1F1F', // Teams dark background
      }}
    >
      {/* Top Bar - Minimal (Teams style) */}
      <div 
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: '#292929' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => endMeeting()}
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <h1 className="text-base font-medium text-white">
              {selectedProject.name}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(meetingDuration)}</span>
          </div>
        </div>
      </div>
      
      {/* Main Content Area - Teams Grid Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div className="w-full max-w-7xl space-y-4">
            
            {/* Subtle Status Banner - Teams style */}
            {liveTranscript && state.status === 'listening' && (
              <div className="w-full text-center py-2 px-4 rounded bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400">
                  <span className="text-green-500 font-medium">Listening:</span> "{liveTranscript}"
                </p>
              </div>
            )}
            
            {/* PARTICIPANT GRID - Teams Style Rectangular Tiles */}
            <div className="grid gap-3 w-full"
              style={{
                gridTemplateColumns: selectedStakeholders.length + 1 <= 2 
                  ? 'repeat(2, 1fr)' 
                  : selectedStakeholders.length + 1 === 3
                  ? 'repeat(3, 1fr)'
                  : 'repeat(2, 1fr)',
                gridAutoRows: '1fr'
              }}
            >
              {/* User Tile - Teams Style */}
              <div
                className="relative rounded-lg overflow-hidden bg-[#242424] transition-all duration-200"
                style={{
                  aspectRatio: '16/9',
                  border: state.status === 'listening' && state.currentSpeaker === 'You' 
                    ? '3px solid #00FFFF'  // Teams cyan glow for active speaker
                    : '2px solid #3A3A3A'
                }}
              >
                {/* Video tile background with avatar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-semibold text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                
                {/* Bottom overlay with name - Teams style */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {state.status === 'listening' && state.currentSpeaker === 'You' && (
                        <div className="flex items-center gap-1 text-green-400">
                          <Mic className="w-3 h-3" />
                        </div>
                      )}
                      <span className="text-white text-sm font-medium">
                        You
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stakeholder Tiles - Teams Style */}
              {selectedStakeholders.map((stakeholder, idx) => {
                const isSpeaking = state.status === 'speaking' && state.currentSpeaker === stakeholder.name;
                
                return (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden bg-[#242424] transition-all duration-200"
                    style={{
                      aspectRatio: '16/9',
                      border: isSpeaking 
                        ? '3px solid #00FFFF'  // Teams cyan glow for active speaker
                        : '2px solid #3A3A3A'
                    }}
                  >
                    {/* Video tile background with avatar or photo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {stakeholder.photo ? (
                        <img
                          src={stakeholder.photo}
                          alt={stakeholder.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-semibold text-white">
                          {stakeholder.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {/* Speaking indicator */}
                    {isSpeaking && (
                      <div className="absolute top-3 right-3">
                        <div className="flex gap-0.5 items-end bg-black/50 rounded px-2 py-1">
                          <div className="w-1 bg-cyan-400 rounded-full animate-pulse" style={{ height: '8px' }} />
                          <div className="w-1 bg-cyan-400 rounded-full animate-pulse" style={{ height: '12px', animationDelay: '150ms' }} />
                          <div className="w-1 bg-cyan-400 rounded-full animate-pulse" style={{ height: '6px', animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    
                    {/* Bottom overlay with name - Teams style */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div>
                        <span className="text-white text-sm font-medium block">
                          {stakeholder.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {stakeholder.role}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            
          </div>
        </div>
      </div>
      
      {/* Bottom Control Bar - Teams Style */}
      <div className="border-t border-gray-800 px-6 py-4" style={{ backgroundColor: '#292929' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left - Mic controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => state.status === 'idle' ? startConversation() : null}
              disabled={state.status !== 'idle'}
              className={`p-3 rounded-full transition-colors ${
                state.status === 'listening'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              title={state.status === 'idle' ? 'Start meeting' : state.status === 'listening' ? 'Listening...' : 'In meeting'}
            >
              {state.status === 'listening' ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Center - Meeting info */}
          <div className="text-center">
            <div className="text-sm text-gray-400">
              {state.status === 'idle' ? 'Ready to start' : 
               state.status === 'ended' ? 'Meeting ended' : 
               'Meeting in progress'}
            </div>
          </div>
          
          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`p-3 rounded-full transition-colors ${
                showTranscript 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Toggle transcript"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            
            <button
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={`${selectedStakeholders.length + 1} participants`}
            >
              <Users className="w-5 h-5" />
            </button>
            
            <button
              onClick={endMeeting}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Transcript Sidebar - Teams Style */}
      {showTranscript && messages.length > 0 && (
        <div 
          className="fixed right-0 top-0 bottom-0 w-80 border-l border-gray-800 flex flex-col"
          style={{ backgroundColor: '#292929' }}
        >
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-medium">Meeting chat</h3>
            <button 
              onClick={() => setShowTranscript(false)}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">
                    {msg.who}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {msg.timestamp}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  {msg.text}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
      
      {/* Exit Modal - Teams Style */}
      {showExitModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 max-w-md w-full mx-4 bg-[#292929] border border-gray-700">
            <h3 className="text-xl font-semibold mb-2 text-white">
              Leave meeting?
            </h3>
            <p className="mb-6 text-gray-400">
              Your transcript will be saved automatically.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmEnd}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                Leave
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-4 py-2 rounded font-medium transition-colors bg-white/10 hover:bg-white/20 text-white"
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
