import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TrainingService } from '../../services/trainingService';
import { TrainingSession, TrainingQuestion, TrainingFeedback } from '../../types/training';
import { mockProjects, mockStakeholders } from '../../data/mockData';
import { Stakeholder } from '../../types';
import { singleAgentSystem } from '../../services/singleAgentSystem';
import AIService from '../../services/aiService';
// OLD COACHING COMPONENTS - REPLACED WITH NEW ARCHITECTURE
// import CompleteCoachingPanel from '../CompleteCoachingPanel';
// import DynamicCoachingPanel from '../DynamicCoachingPanel';
// import QuestionHelperBot from '../QuestionHelperBot';

// NEW ELICITATION ENGINE COMPONENTS
import StakeholderChat, { StakeholderChatRef } from '../StakeholderChat';
import NewCoachingPanel from '../NewCoachingPanel';
import FollowUpSuggestions from '../FollowUpSuggestions';
import StageProgress from '../StageProgress';
import ContextTracker from '../ContextTracker';
import { MeetingStage } from '../../lib/meeting/meetingContext';
import { ELEVENLABS_PROJECTS } from '../../data/elevenLabsProjects';

import { 
  ArrowLeft, 
  Send, 
  Target, 
  Lightbulb, 
  Clock, 
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Users,
  TrendingUp,
  ChevronRight,
  HelpCircle,
  Play,
  Pause,
  Square,
  Focus,
  Calendar
} from 'lucide-react';

const TrainingPracticeView: React.FC = () => {
  const { setCurrentView, selectedProject, setSelectedStakeholders: setAppSelectedStakeholders, selectedStakeholders: appSelectedStakeholders } = useApp();
  const [currentStep, setCurrentStep] = useState<'meeting-prep' | 'live-meeting' | 'feedback'>('meeting-prep');

  const [session, setSession] = useState<TrainingSession | null>(null);
  // OLD STATE - Still needed for session management but not for chat
  // const [messages, setMessages] = useState<any[]>([]);
  // const [inputMessage, setInputMessage] = useState('');
  // const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<TrainingQuestion | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
  
  const [feedback, setFeedback] = useState<TrainingFeedback | null>(null);
  const [meetingTime, setMeetingTime] = useState(0);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  // OLD STATE - REPLACED
  // const [awaitingAcknowledgement, setAwaitingAcknowledgement] = useState(false);
  // const messagesEndRef = useRef<HTMLDivElement>(null);
  // const dynamicPanelRef = useRef<{ onUserSubmitted: (messageId: string) => void } | null>(null);

  // NEW ELICITATION ENGINE STATE
  const [coaching, setCoaching] = useState<any>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [context, setContext] = useState<any>(null);
  const [isInputLocked, setIsInputLocked] = useState(false);
  const chatRef = useRef<StakeholderChatRef>(null);
  const previousProjectRef = useRef<string | undefined>(undefined);

  // Session initialization refs to prevent race conditions
  const initRef = useRef(false);        // prevents double init (StrictMode)
  const restoringRef = useRef(false);   // blocks other effects during restore
  // Initialize stakeholders from AppContext when component loads (especially when coming from meeting-mode-selection)
  useEffect(() => {
    if (appSelectedStakeholders && appSelectedStakeholders.length > 0 && selectedStakeholders.length === 0) {
      console.log('🔄 TrainingPracticeView: Initializing stakeholders from AppContext:', appSelectedStakeholders.map(s => s.name));
      setSelectedStakeholders(appSelectedStakeholders);
      // Also save to sessionStorage for consistency
      sessionStorage.setItem('trainingStakeholders', JSON.stringify(appSelectedStakeholders));
    }
  }, [appSelectedStakeholders, selectedStakeholders.length]);
  // Reset context when project changes
  useEffect(() => {
    const currentProjectId = selectedProject?.id || selectedProject?.name;
    if (previousProjectRef.current !== undefined && previousProjectRef.current !== currentProjectId) {
      console.log('🔄 TrainingPracticeView: Project changed, clearing context');
      console.log('🔄 Previous project:', previousProjectRef.current);
      console.log('�� New project:', currentProjectId);
      setContext(null);
      setCoaching(null);
      setFollowUps([]);
      // Also clear any saved chat messages for the old project
      if (previousProjectRef.current) {
        const stages = ['problem_exploration', 'as_is', 'to_be', 'wrap_up'];
        stages.forEach(stage => {
          sessionStorage.removeItem(`chat-meeting-${previousProjectRef.current}-${stage}`);
        });
      }
    }
    previousProjectRef.current = currentProjectId;
  }, [selectedProject?.id, selectedProject?.name]);



  type StoredConfig = {
    sessionId: string;
    projectId?: string;
    stage?: 'as_is' | 'problem_exploration' | 'to_be' | string;
    mode?: 'practice' | 'assessment' | string;
  };

  function readStoredConfig(): StoredConfig | null {
    const raw =
      sessionStorage.getItem('trainingConfig') ??
      localStorage.getItem('trainingConfig');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed.sessionId === 'string' ? parsed : null;
    } catch {
      return null;
    }
  }

  function writeStoredConfig(cfg: StoredConfig) {
    sessionStorage.setItem('trainingConfig', JSON.stringify(cfg));
  }

  const trainingService = TrainingService.getInstance();

  // Pure AI response generator without KB integration
  const generatePureAIResponse = async (
    userMessage: string,
    stakeholderContext: any,
    projectContext: any
  ): Promise<string> => {
    try {
      const prompt = `You are ${stakeholderContext.name}, a ${stakeholderContext.role} at ${stakeholderContext.department}. 

Project Context: ${projectContext.name} - ${projectContext.description}

User's question: "${userMessage}"

Respond as ${stakeholderContext.name} would in a professional business meeting. Keep your response natural, helpful, and focused on the question. Don't mention that you're an AI - just respond as the stakeholder would.

Response:`;

      const response = await fetch('/api/analyzeStakeholder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: prompt,
          context: { type: 'stakeholder_response' }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.analysis || 'I understand your question. Let me think about that...';
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'Thank you for your question. I appreciate you taking the time to understand our perspective.';
    }
  };



  // OLD HANDLERS - REPLACED BY NEW ELICITATION ENGINE
  // const handleAcknowledgementStateChange = useCallback((awaiting: boolean) => {
  //   console.log('🔄 TrainingPracticeView: handleAcknowledgementStateChange called with:', awaiting);
  //   setAwaitingAcknowledgement(prev => (prev === awaiting ? prev : awaiting));
  // }, []);

  // const handleSuggestedRewrite = useCallback((rewrite: string) => {
  //   setInputMessage(rewrite);
  //   const textarea = document.querySelector('textarea');
  //   if (textarea) {
  //     textarea.focus();
  //   }
  // }, []);

  // Single-threaded session initialization to prevent race conditions
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    restoringRef.current = true;

    (async () => {
      try {
        const cfg = readStoredConfig();

        if (cfg?.sessionId) {
          console.log('🔄 Restoring session from storage:', cfg);
          const existing = await trainingService.getSession(cfg.sessionId);

          if (existing) {
            setSession(existing);
            const q = trainingService.getCurrentQuestion(cfg.sessionId);
            setCurrentQuestion(q);
            console.log('✅ Restored existing session:', existing.id);
            
            // Restore other state for existing session
            const savedStakeholders = sessionStorage.getItem('trainingStakeholders');
            if (savedStakeholders) {
              const stakeholders = JSON.parse(savedStakeholders);
              console.log('🔄 TrainingPracticeView: Restoring stakeholders:', stakeholders);
              setSelectedStakeholders(stakeholders);
            }

            const savedStep = sessionStorage.getItem('trainingCurrentStep');
            if (savedStep) {
              console.log('🔄 TrainingPracticeView: Restoring current step:', savedStep);
              setCurrentStep(savedStep as any);
            } else {
              // Check if we should skip directly to live-meeting (coming from meeting mode selection)
              const skipToLiveMeeting = sessionStorage.getItem('skipToLiveMeeting');
              if (skipToLiveMeeting === 'true') {
                console.log('🔄 TrainingPracticeView: Skipping to live-meeting from meeting mode selection');
                setCurrentStep('live-meeting');
                setIsMeetingActive(true);
                sessionStorage.removeItem('skipToLiveMeeting'); // Clear flag after use
              }
            }

            const savedMessages = sessionStorage.getItem('trainingMessages');
            if (savedMessages) {
              const messages = JSON.parse(savedMessages);
              console.log('🔄 TrainingPracticeView: Restoring messages:', messages.length);
              setMessages(messages);
            }

            const savedMeetingTime = sessionStorage.getItem('trainingMeetingTime');
            if (savedMeetingTime) {
              setMeetingTime(parseInt(savedMeetingTime));
            }

            const savedMeetingActive = sessionStorage.getItem('trainingMeetingActive');
            if (savedMeetingActive) {
              setIsMeetingActive(JSON.parse(savedMeetingActive));
            }
            
            return; // IMPORTANT: stop here, do NOT create a new session
          }

          console.log('ℹ️ Stored sessionId not found on service, will create a new one.');
        } else {
          console.log('ℹ️ No stored config. Will create a new session.');
        }

        // Fallback ONLY if we couldn't restore
        if (selectedProject) {
          const project = mockProjects.find(p => p.name === selectedProject.name);
          if (project) {
            console.log('🔄 TrainingPracticeView: Creating session for project:', project.name);
            const stage = cfg?.stage || 'problem_exploration';
            const newSession = await trainingService.startSession(stage, project.id, 'practice', []);
            
            writeStoredConfig({
              sessionId: newSession.id,
              projectId: newSession.projectId,
              stage: newSession.stage,
              mode: newSession.mode,
            });

            setSession(newSession);
            const q2 = trainingService.getCurrentQuestion(newSession.id);
            setCurrentQuestion(q2);
            console.log('🆕 Created new session:', newSession.id);
            
            // Check if we should skip directly to live-meeting (coming from meeting mode selection)
            const skipToLiveMeeting = sessionStorage.getItem('skipToLiveMeeting');
            if (skipToLiveMeeting === 'true') {
              console.log('🔄 TrainingPracticeView: Skipping to live-meeting from meeting mode selection (new session)');
              setCurrentStep('live-meeting');
              setIsMeetingActive(true);
              sessionStorage.removeItem('skipToLiveMeeting'); // Clear flag after use
            }
          } else {
            console.error('❌ TrainingPracticeView: Could not find project for:', selectedProject.name);
          }
        } else {
          console.error('❌ TrainingPracticeView: No selected project available for fallback session');
        }
      } catch (e) {
        console.error('❌ Session init failed:', e);
      } finally {
        restoringRef.current = false;
      }
    })();
  }, [selectedProject]);

  // OLD SCROLL EFFECT - Handled by StakeholderChat component
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      // Save session config
      if (session) {
        const config = {
          sessionId: session.id,
          stage: session.stage,
          projectId: session.projectId,
          mode: session.mode
        };
        sessionStorage.setItem('trainingConfig', JSON.stringify(config));
      }

      // Save selected stakeholders
      if (selectedStakeholders.length > 0) {
        sessionStorage.setItem('trainingStakeholders', JSON.stringify(selectedStakeholders));
      }

      // Save current step
      sessionStorage.setItem('trainingCurrentStep', currentStep);

      // OLD MESSAGE SAVING - Handled by StakeholderChat component
      // if (currentStep === 'live-meeting' && messages.length > 0) {
      //   sessionStorage.setItem('trainingMessages', JSON.stringify(messages));
      // }

      // Save meeting time
      sessionStorage.setItem('trainingMeetingTime', meetingTime.toString());

      // Save meeting active state
      sessionStorage.setItem('trainingMeetingActive', JSON.stringify(isMeetingActive));

    } catch (error) {
      console.error('❌ TrainingPracticeView: Error saving state:', error);
    }
  }, [session, selectedStakeholders, currentStep, meetingTime, isMeetingActive]);

  // Cleanup sessionStorage when component unmounts
  useEffect(() => {
    return () => {
      // Only clear if we're not in an active meeting
      if (!isMeetingActive) {
        sessionStorage.removeItem('trainingConfig');
        sessionStorage.removeItem('trainingStakeholders');
        sessionStorage.removeItem('trainingCurrentStep');
        sessionStorage.removeItem('trainingMessages');
        sessionStorage.removeItem('trainingMeetingTime');
        sessionStorage.removeItem('trainingMeetingActive');
      }
    };
  }, [isMeetingActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMeetingActive && currentStep === 'live-meeting') {
      interval = setInterval(() => {
        setMeetingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeetingActive, currentStep]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartMeeting = async () => {
    if (session && selectedStakeholders.length > 0) {
      try {
        // Store stakeholders in global context for meeting mode selection
        setAppSelectedStakeholders(selectedStakeholders);
        
        // Save training config to sessionStorage for meeting views
        sessionStorage.setItem('trainingConfig', JSON.stringify({ isTrainingHub: true,
          sessionId: session.id,
          stage: session.stage,
          projectId: session.projectId,
          selectedStakeholders: selectedStakeholders.map(s => s.id)
        }));
        
        // Navigate to meeting mode selection so user can choose Voice/Video/Transcript
        console.log('🎯 Navigating to meeting mode selection with stakeholders:', selectedStakeholders.map(s => s.name));
        setCurrentView('meeting-mode-selection');
      } catch (error) {
        console.error('Failed to navigate to meeting mode selection:', error);
      }
    }
  };

  // OLD HANDLE SEND MESSAGE - REPLACED BY NEW ELICITATION ENGINE
  // The new StakeholderChat component handles all message sending internally
  /*
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      // Update session with new messages
      if (session) {
        trainingService.updateSessionMessages(session.id, newMessages);
      }
      return newMessages;
    });
    setInputMessage('');
    setIsTyping(true);

    // Notify the dynamic panel about the new message
    if (dynamicPanelRef.current) {
      dynamicPanelRef.current.onUserSubmitted(userMessage.id);
    }

    // Update coaching session with user message
    

    try {
      // Get project context from mockProjects
      const project = mockProjects.find(p => p.id === session?.projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      console.log('🎯 PROJECT CONTEXT:', {
        sessionProjectId: session?.projectId,
        foundProject: {
          id: project.id,
          name: project.name,
          description: project.description.substring(0, 100) + '...'
        }
      });

      // Format project context for singleAgentSystem
      const projectContext = {
        id: project.id,
        name: project.name,
        description: project.description,
        type: 'business_analysis',
        painPoints: [], // Project interface doesn't have painPoints
        asIsProcess: project.asIsProcess || ''
      };

      console.log('📋 PROJECT CONTEXT BEING SENT TO AI:', {
        id: projectContext.id,
        name: projectContext.name,
        descriptionLength: projectContext.description.length,
        description: projectContext.description.substring(0, 100) + '...'
      });

      // Use AIService to detect stakeholder mentions (same logic as VoiceOnlyMeetingView)
      const userMentionResult = await AIService.getInstance().detectStakeholderMentions(
        inputMessage,
        selectedStakeholders,
        'user',
        null,
        'training'
      );

      console.log('🔍 Training: User message analysis:', {
        messageContent: inputMessage,
        availableStakeholders: selectedStakeholders.map(s => s.name),
        mentionResult: userMentionResult,
        threshold: AIService.getMentionConfidenceThreshold()
      });

      let respondingStakeholders: Stakeholder[] = [];

      // Check for direct name mentions first (case-insensitive)
      const mentionedNames = selectedStakeholders.filter(stakeholder => 
        inputMessage.toLowerCase().includes(stakeholder.name.toLowerCase())
      );

      if (mentionedNames.length > 0) {
        // User directly mentioned stakeholder name(s)
        console.log(`🎯 Training: Direct name mention detected: ${mentionedNames.map(s => s.name).join(', ')}`);
        respondingStakeholders = mentionedNames;
      } else if (userMentionResult.mentionedStakeholders.length > 0 && userMentionResult.confidence >= AIService.getMentionConfidenceThreshold()) {
        // User specifically mentioned stakeholder(s) via AI detection - only those should respond
        console.log(`🎯 Training: AI detected stakeholder mention(s): ${userMentionResult.mentionedStakeholders.map(s => s.name).join(', ')}`);
        respondingStakeholders = userMentionResult.mentionedStakeholders;
      } else {
        // General question or greeting - pick one random stakeholder to respond (same as VoiceOnlyMeetingView)
        console.log('❓ Training: General question/greeting - one random stakeholder will respond');
        const randomStakeholder = selectedStakeholders[Math.floor(Math.random() * selectedStakeholders.length)];
        respondingStakeholders = [randomStakeholder];
      }

      // Process responses for the determined stakeholders with delays
      for (let i = 0; i < respondingStakeholders.length; i++) {
        const stakeholder = respondingStakeholders[i];
        const stakeholderContext = {
          name: stakeholder.name,
          role: stakeholder.role,
          department: stakeholder.department,
          priorities: stakeholder.priorities || [],
          personality: stakeholder.personality || 'professional',
          expertise: Array.isArray(stakeholder.expertise) ? stakeholder.expertise : (stakeholder.expertise ? [stakeholder.expertise] : [])
        };

        // Add a small delay between responses to make them feel more natural
        setTimeout(async () => {
          try {
            const response = await singleAgentSystem.processUserMessage(
              inputMessage,
              stakeholderContext,
              projectContext
            );
            
            const aiMessage = {
              id: (Date.now() + Math.random() + i).toString(),
              sender: 'stakeholder',
              content: response,
              timestamp: new Date(),
              stakeholderName: stakeholder.name,
              stakeholderRole: stakeholder.role
            };

            setMessages(prev => {
              const newMessages = [...prev, aiMessage];
              // Update session with new messages
              if (session) {
                trainingService.updateSessionMessages(session.id, newMessages);
              }
              return newMessages;
            });

            // Update coaching session with stakeholder response
            
          } catch (error) {
            console.error(`Error generating response for ${stakeholder.name}:`, error);
          }
        }, i * 1000); // 1 second delay between responses
      }

      setIsTyping(false);

      // Update progress
      const nextQuestion = trainingService.nextQuestion(session.id);
      setCurrentQuestion(nextQuestion);

      // Update coaching
      updateCoaching(inputMessage, respondingStakeholders.length > 0 ? 'Response generated' : 'No response');

      // Check if session should end (after more interaction or 15 minutes)
      if (messages.length >= 40 || meetingTime >= 900) {
        handleEndMeeting();
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
    }
  };
  */

  // OLD UPDATE COACHING - REPLACED BY NEW COACHING ENGINE
  /*
  const updateCoaching = (userMessage: string, aiResponse: string) => {
    const newCoaching = { ...coaching };
    const message = userMessage.toLowerCase();
    
    // Track hint events for independence scoring
    const hintEvent = {
      id: Date.now().toString(),
      sessionId: session?.id,
      stageId: session?.stage,
      eventType: 'user_input',
      payload: { message: userMessage, timestamp: new Date() }
    };
    newCoaching.hintEvents.push(hintEvent);

    // Coach Trigger 1: Missing Greetings (first 30 seconds only)
    if (meetingTime <= 30 && messages.length <= 2) {
      const hasGreeting = messages.some(m => 
        m.sender === 'user' && (
          m.content.toLowerCase().includes('hello') ||
          m.content.toLowerCase().includes('hi') ||
          m.content.toLowerCase().includes('hey') ||
          m.content.toLowerCase().includes('good morning') ||
          m.content.toLowerCase().includes('good afternoon') ||
          m.content.toLowerCase().includes('nice to meet') ||
          m.content.toLowerCase().includes('thank you for') ||
          m.content.toLowerCase().includes('appreciate your time') ||
          m.content.toLowerCase().includes('greetings')
        )
      );
      
      if (!hasGreeting) {
        newCoaching.warnings.push("Start with a greeting and briefly explain why you're meeting.");
      }
    }

    // Coach Trigger 1.5: Clear old warnings after conversation starts
    if (messages.length > 3) {
      newCoaching.warnings = newCoaching.warnings.filter(warning => 
        !warning.includes('Start with a greeting') && 
        !warning.includes('introduce yourself')
      );
    }

    // Coach Trigger 2: Silence ≥ 40s → surface 3 cards
    if (meetingTime > 40 && newCoaching.suggestions.length === 0) {
      newCoaching.suggestions.push("You've been quiet for a while. Try asking: 'What are the biggest pain points in your current process?'");
      newCoaching.suggestions.push("Consider asking: 'How do these problems impact your team's productivity?'");
      newCoaching.suggestions.push("You could ask: 'What would happen if these issues continue for another 6 months?'");
    }

    // Coach Trigger 3: 3 closed Qs in a row → 1 open rewrite
    const recentMessages = messages.slice(-6).filter(m => m.sender === 'user');
    const closedQuestionWords = ['do you', 'are you', 'is it', 'can you', 'will you', 'have you', 'does it'];
    const closedQuestions = recentMessages.filter(m => 
      closedQuestionWords.some(word => m.content.toLowerCase().includes(word))
    );
    
    if (closedQuestions.length >= 3) {
      newCoaching.tips.push("You've asked several closed questions. Try rewording to open questions: 'What specific problems are you experiencing?' instead of 'Do you have problems?'");
    }

    // Coach Trigger 4: Minute 5/6/7 "missed must-cover" nudges
    if (meetingTime >= 300 && meetingTime <= 420) { // 5-7 minutes
      const learnContent = trainingService.getLearnContent(session?.stage || 'problem_exploration');
      const uncoveredAreas = learnContent.mustCovers.filter(area => 
        !newCoaching.coverage[area.area]
      );
      
      if (uncoveredAreas.length > 0) {
        newCoaching.warnings.push(`You haven't covered: ${uncoveredAreas.slice(0, 2).map(a => a.area.replace('_', ' ')).join(', ')}. Consider asking about these areas.`);
      }
    }

    // Coach Trigger 5: Early solutioning in Problem/As-Is if <3 flags covered
    const coveredCount = Object.values(newCoaching.coverage).filter(Boolean).length;
    const solutionWords = ['solution', 'fix', 'implement', 'change', 'improve', 'should', 'need to'];
    const isEarlySolutioning = solutionWords.some(word => message.includes(word));
    
    if (isEarlySolutioning && (session?.stage === 'problem_exploration' || session?.stage === 'as_is') && coveredCount < 3) {
      newCoaching.warnings.push("You're jumping to solutions too early. Focus on understanding the problem first. Ask more questions about the current situation.");
    }

    // Update coverage based on current question
    if (currentQuestion) {
      const learnContent = trainingService.getLearnContent(session?.stage || 'problem_exploration');
      const relevantArea = learnContent.mustCovers.find(area => 
        area.keywords.some(keyword => 
          message.includes(keyword) || currentQuestion.text.toLowerCase().includes(keyword)
        )
      );
      
      if (relevantArea) {
        newCoaching.coverage[relevantArea.area] = true;
      }
    }

    setCoaching(newCoaching);
  };
  */

  const handleEndMeeting = async () => {
    if (session) {
      setIsMeetingActive(false);
      await trainingService.updateSessionStatus(session.id, 'post_brief');
      
      // Generate feedback
      const feedbackData = await trainingService.generateFeedback(session.id);
      setFeedback(feedbackData);
      
      setCurrentStep('feedback');
    }
  };

  // OLD HANDLE KEY PRESS - REPLACED BY NEW ELICITATION ENGINE
  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     handleSendMessage();
  //   }
  // };

  const handleBack = () => {
    // Clear sessionStorage when going back
    sessionStorage.removeItem('trainingConfig');
    sessionStorage.removeItem('trainingStakeholders');
    sessionStorage.removeItem('trainingCurrentStep');
    sessionStorage.removeItem('trainingMessages');
    sessionStorage.removeItem('trainingMeetingTime');
    sessionStorage.removeItem('trainingMeetingActive');
    setCurrentView('training-hub-stage-selection');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMeetingPrep = () => {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Meeting Preparation
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Prepare for your meeting
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Practice Mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Indicator */}
        {selectedProject && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Current Project:
                </span>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {selectedProject.name}
                </span>
                {session?.projectId && (
                  <span className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                    ID: {session.projectId}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Ready to Start - Moved to TOP */}
          {(() => {
            return selectedStakeholders.length > 0;
          })() && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Ready to Start!</h2>
                  <p className="text-purple-100 mb-4">
                    You'll be practicing with {selectedStakeholders.length} stakeholder{selectedStakeholders.length > 1 ? 's' : ''}: <strong>{selectedStakeholders.map(s => s.name).join(', ')}</strong>
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>12 min session</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Coaching enabled</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6">
                  <button
                    onClick={handleStartMeeting}
                    className="px-8 py-4 rounded-lg font-semibold transition-all duration-200 bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl"
                  >
                    Start Practice Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stakeholder Selection - PROMINENT */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="w-6 h-6 text-purple-600 mr-3" />
              Select Your Stakeholders
            </h2>
            
            {/* Clear Instructions */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">How to Select Stakeholders</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="mb-2">For this <strong>{session?.stage?.replace('_', ' ') || 'Requirements Gathering'}</strong> practice session, you'll be meeting with key stakeholders to understand their needs.</p>
                    <p><strong>Select 1-3 stakeholders</strong> who would typically be involved in this type of meeting. You can select multiple for a group meeting scenario.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Available Stakeholders */}
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Available Stakeholders for {selectedProject?.name || 'Current Project'}:
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const project = mockProjects.find(p => p.id === session?.projectId);
                
                if (!project) {
                  return <div className="col-span-3 text-center text-gray-500">Project not found</div>;
                }
                
                if (!project.relevantStakeholders || project.relevantStakeholders.length === 0) {
                  return <div className="col-span-3 text-center text-gray-500">No stakeholders available for this project</div>;
                }
                
                return project.relevantStakeholders.map(stakeholderId => {
                  const stakeholder = mockStakeholders.find(s => s.id === stakeholderId);
                  if (!stakeholder) return null;
                  
                  const isSelected = selectedStakeholders.some(s => s.id === stakeholder.id);
                  
                  return (
                    <button
                      key={stakeholder.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStakeholders(prev => {
                            const newSelection = prev.filter(s => s.id !== stakeholder.id);
                            return newSelection;
                          });
                        } else {
                          setSelectedStakeholders(prev => {
                            const newSelection = [...prev, stakeholder];
                            return newSelection;
                          });
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {stakeholder.photo ? (
                          <img 
                            src={stakeholder.photo} 
                            alt={stakeholder.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {stakeholder.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{stakeholder.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{stakeholder.role}</div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">{stakeholder.department}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Focus:</strong> {stakeholder.priorities?.join(', ') || 'Process optimization'}
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                        {stakeholder.bio}
                      </div>
                      
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                        {isSelected ? '✓ Selected' : 'Click to select'}
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
            
            {/* Selection Summary */}
            {selectedStakeholders.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    {selectedStakeholders.length} Stakeholder{selectedStakeholders.length > 1 ? 's' : ''} Selected
                  </span>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mb-3">
                  You'll be practicing with: <strong>{selectedStakeholders.map(s => s.name).join(', ')}</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedStakeholders.map(stakeholder => (
                    <div key={stakeholder.id} className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-green-200 dark:border-green-700">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{stakeholder.name}</span>
                      <span className="text-xs text-gray-500">({stakeholder.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Meeting Details - Only show after stakeholder selection */}
          {selectedStakeholders.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                Meeting Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meeting Type</div>
                  <div className="font-medium text-gray-900 dark:text-white">Business Analysis Discovery Call</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</div>
                  <div className="font-medium text-gray-900 dark:text-white">30 minutes</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Format</div>
                  <div className="font-medium text-gray-900 dark:text-white">Video Conference</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agenda</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {session?.stage?.replace('_', ' ') || 'Requirements Gathering'} Discussion
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">Meeting Etiquette</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      Remember to start with a professional greeting, introduce yourself, and explain the purpose of the meeting before diving into questions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Strategies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 text-orange-600 mr-2" />
              Success Strategies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Open Questions</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Ask detailed, open-ended questions to gather comprehensive information</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Follow Up</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Dig deeper with follow-up questions on stakeholder responses</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Problem First</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Understand the problem thoroughly before suggesting solutions</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">Coaching Panel</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monitor the coaching panel for real-time guidance and tips</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Memoize project context calculation to prevent infinite loops
  const { projectContext, project } = useMemo(() => {
    // Normalize names for matching (handle variations like "Process" vs no "Process")
    const normalizeName = (name: string) => {
      if (!name) return '';
      return name.toLowerCase()
        .replace(/\s+(process|system|platform|management|implementation|enhancement)\s+/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    // First, try to find in ELEVENLABS_PROJECTS (has full context)
    const foundProject = ELEVENLABS_PROJECTS.find(
      p => p.id === selectedProject?.id || 
           p.name === selectedProject?.name ||
           (selectedProject?.name && normalizeName(p.name) === normalizeName(selectedProject.name))
    );
    
    let context;
    if (foundProject) {
      // Use full context from ELEVENLABS_PROJECTS
      context = {
        id: foundProject.id,
        name: foundProject.name,
        description: foundProject.description,
        objective: foundProject.objective,
        industry: foundProject.industry,
        complexity: foundProject.complexity,
        challenges: foundProject.context.challenges,
        currentState: foundProject.context.currentState,
        expectedOutcomes: foundProject.context.expectedOutcomes,
        constraints: foundProject.context.constraints
      };
    } else if (selectedProject) {
      // Build context from selectedProject (mockProjects data)
      context = {
        id: selectedProject.id,
        name: selectedProject.name,
        description: selectedProject.description || '',
        objective: selectedProject.businessContext || selectedProject.problemStatement || '',
        industry: selectedProject.companyProducts || '',
        complexity: selectedProject.complexity || 'medium',
        challenges: selectedProject.problemStatement ? [selectedProject.problemStatement] : [],
        currentState: selectedProject.asIsProcess || selectedProject.businessContext || '',
        expectedOutcomes: selectedProject.businessGoals || [],
        constraints: []
      };
    } else {
      // Last resort fallback
      context = {
        name: 'Unknown Project',
        description: '',
        challenges: [],
        currentState: '',
        expectedOutcomes: [],
        constraints: []
      };
    }
    
    return { projectContext: context, project: foundProject };
  }, [selectedProject?.id, selectedProject?.name]);

  const renderLiveMeeting = () => {

    // Get stakeholder profile (use first selected or default to James Walker)
    const stakeholder = selectedStakeholders[0] || project?.stakeholders[0];
    const stakeholderProfile = stakeholder ? {
      id: stakeholder.id,
      name: stakeholder.name,
      role: stakeholder.role,
      department: stakeholder.department,
      personality: stakeholder.personality || 'professional',
      priorities: stakeholder.priorities || []
    } : {
      id: 'james-walker',
      name: 'James Walker',
      role: 'Head of Customer Success',
      department: 'Customer Success',
      personality: 'Collaborative, data-driven, customer-focused, solution-oriented',
      priorities: ['Reducing customer churn', 'Improving time-to-first-value']
    };

    // Map session stage to MeetingStage
    const currentStage = (session?.stage || 'problem_exploration') as MeetingStage;

    return (
      <div className="content-root h-full flex flex-col">
        {/* Header - KEEP EXACTLY AS IS */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {projectContext?.name || 'Practice Meeting'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Meeting with {selectedStakeholders.length > 0 ? (
                    <span className="font-medium">
                      {selectedStakeholders.length === 1 
                        ? `${selectedStakeholders[0].name} (${selectedStakeholders[0].role})`
                        : `${selectedStakeholders.length} stakeholders: ${selectedStakeholders.map(s => s.name).join(', ')}`
                      }
                    </span>
                  ) : (
                    <span className="font-medium">{stakeholderProfile?.name || 'Stakeholder'}</span>
                  )} • {session?.stage?.replace('_', ' ') || 'Problem Exploration'} • {formatTime(meetingTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{formatTime(meetingTime)}</span>
              </div>
              <button
                onClick={handleEndMeeting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Area - NEW ELICITATION ENGINE */}
          <div className="flex-1 flex flex-col">
            {projectContext && stakeholderProfile ? (
              <StakeholderChat
                ref={chatRef}
                currentStage={currentStage}
                stakeholderProfile={stakeholderProfile}
                availableStakeholders={selectedStakeholders.length > 0 ? selectedStakeholders.map(s => ({
                  id: s.id,
                  name: s.name,
                  role: s.role,
                  department: s.department || '',
                  personality: s.personality || 'professional',
                  priorities: s.priorities || []
                })) : undefined}
                projectContext={projectContext}
                onCoachingUpdate={(coachingData) => {
                  setCoaching(coachingData);
                  if (coachingData?.acknowledgement_required) {
                    setIsInputLocked(true);
                  }
                }}
                onContextUpdate={(contextData) => {
                  setContext(contextData);
                }}
                onFollowUpsUpdate={(followUpsData) => {
                  setFollowUps(followUpsData || []);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Loading meeting context...</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - NEW COMPONENTS */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4 space-y-4">
            {/* Stage Progress */}
            <StageProgress
              currentStage={currentStage}
              progress={context?.stage_progress?.[currentStage]?.percent_complete || 0}
              milestone={context?.next_milestone || 'Continue gathering information'}
            />

            {/* Coaching Panel */}
            {coaching && (
              <NewCoachingPanel
                coaching={coaching}
                onAcknowledge={() => {
                  setIsInputLocked(false);
                  setCoaching(null);
                  // "Got it" should NOT process the original question
                  // Just dismiss coaching panel and unlock input
                  // User can then ask a new question
                  if (chatRef.current && chatRef.current.clearPendingState) {
                    chatRef.current.clearPendingState();
                  }
                }}
                onUseRewrite={(rewrite) => {
                  // Use the suggested rewrite as a new question
                  setCoaching(null);
                  setIsInputLocked(false);
                  if (chatRef.current) {
                    chatRef.current.sendQuestion(rewrite);
                  }
                }}
              />
            )}

            {/* Context Tracker */}
            {context && (
              <ContextTracker
                topicsCovered={context.topics_covered || []}
                painPoints={context.pain_points_identified || []}
                informationLayer={context.information_layers_unlocked || 1}
              />
            )}

            {/* Follow-up Suggestions */}
            {followUps.length > 0 && (
              <FollowUpSuggestions
                followUps={followUps}
                onSelect={(question) => {
                  // Trigger the full message cycle: evaluate → coaching → stakeholder response → follow-ups → context
                  if (chatRef.current) {
                    chatRef.current.sendQuestion(question);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPostBrief = () => (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
          Practice Session Complete
        </h2>
        <p className="text-green-700 dark:text-green-300">
          Great job! Here's your feedback and areas for improvement.
        </p>
      </div>

      {feedback && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Overall Performance</h3>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                feedback.passed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {Math.round(feedback.overallScore)}%
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Coverage</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Math.round(feedback?.coverageAnalysis?.score || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feedback?.coverageAnalysis?.score || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Technique</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Math.round(feedback?.techniqueAnalysis?.score || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feedback?.techniqueAnalysis?.score || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coverage Analysis</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Covered Areas</h4>
                <ul className="space-y-1">
                  {feedback?.coverageAnalysis?.covered?.map((area: any, index: any) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>{area}</span>
                    </li>
                  )) || []}
                </ul>
              </div>
              
              {feedback?.coverageAnalysis?.missed?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Missed Areas</h4>
                  <ul className="space-y-1">
                    {feedback.coverageAnalysis.missed.map((area: any, index: any) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Next Time Scripts */}
      {feedback && feedback?.nextTimeScripts && feedback.nextTimeScripts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Next Time Scripts</h3>
          <ul className="space-y-2">
            {feedback.nextTimeScripts.map((script, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{script}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCurrentView('practice')}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Back to Practice Hub
        </button>
        <button
          onClick={() => setCurrentView('training-assess')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          Try Assessment
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {currentStep === 'meeting-prep' && renderMeetingPrep()}
      {currentStep === 'live-meeting' && renderLiveMeeting()}
              {currentStep === 'feedback' && renderPostBrief()}
    </div>
  );
};

// OLD COACHING PANEL WRAPPER - REPLACED BY NEW COACHING ENGINE
// The new NewCoachingPanel component handles all coaching display
/*
const CoachingPanelWrapper = React.forwardRef<{ onUserSubmitted: (messageId: string) => void }, {
  projectName: string;
  conversationHistory: any[];
  sessionStage?: string;
  onAcknowledgementStateChange: (awaiting: boolean) => void;
  onSuggestedRewrite: (rewrite: string) => void;
  onSessionComplete?: () => void;
}>(({
  projectName,
  conversationHistory,
  sessionStage,
  onAcknowledgementStateChange,
  onSuggestedRewrite,
  onSessionComplete,
}, ref) => {
  const useDynamic = useMemo(() => true, []);
  
  const handleSubmitMessage = useCallback((message: string) => {
    console.log('Dynamic panel submitted message:', message);
  }, []);

  return useDynamic ? (
    <DynamicCoachingPanel
      ref={ref}
      projectName={projectName}
      conversationHistory={conversationHistory}
      sessionStage={sessionStage}
      onAcknowledgementStateChange={onAcknowledgementStateChange}
      onSuggestedRewrite={onSuggestedRewrite}
      onSubmitMessage={handleSubmitMessage}
      onSessionComplete={onSessionComplete}
    />
  ) : (
    <CompleteCoachingPanel
      projectName={projectName}
      conversationHistory={conversationHistory}
      onAcknowledgementStateChange={onAcknowledgementStateChange}
      onSuggestedRewrite={onSuggestedRewrite}
      onSubmitMessage={handleSubmitMessage}
    />
  );
});
*/

export default TrainingPracticeView;
