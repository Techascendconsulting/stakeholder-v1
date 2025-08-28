import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { TrainingService } from '../../services/trainingService';
import { TrainingSession, TrainingQuestion, TrainingFeedback } from '../../types/training';
import { mockProjects, mockStakeholders } from '../../data/mockData';
import { Stakeholder } from '../../types';
import { singleAgentSystem } from '../../services/singleAgentSystem';
import AIService from '../../services/aiService';
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
  const { setCurrentView } = useApp();
  const [currentStep, setCurrentStep] = useState<'meeting-prep' | 'live-meeting' | 'feedback'>('meeting-prep');
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<TrainingQuestion | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
  const [coaching, setCoaching] = useState<{
    suggestions: string[];
    warnings: string[];
    tips: string[];
    coverage: Record<string, boolean>;
    hintEvents: any[];
  }>({
    suggestions: [],
    warnings: [],
    tips: [],
    coverage: {},
    hintEvents: []
  });
  const [feedback, setFeedback] = useState<TrainingFeedback | null>(null);
  const [meetingTime, setMeetingTime] = useState(0);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const trainingService = TrainingService.getInstance();

  useEffect(() => {
    // Restore state from sessionStorage on page refresh
    const restoreState = async () => {
      try {
        // Restore session config
        const config = sessionStorage.getItem('trainingConfig');
        if (config) {
          const parsedConfig = JSON.parse(config);
          console.log('🔄 TrainingPracticeView: Restoring session config:', parsedConfig);
          
          const sessionData = await trainingService.getSession(parsedConfig.sessionId);
          if (sessionData) {
            setSession(sessionData);
            const question = trainingService.getCurrentQuestion(parsedConfig.sessionId);
            setCurrentQuestion(question);
          }
        }

        // Restore selected stakeholders
        const savedStakeholders = sessionStorage.getItem('trainingStakeholders');
        if (savedStakeholders) {
          const stakeholders = JSON.parse(savedStakeholders);
          console.log('🔄 TrainingPracticeView: Restoring stakeholders:', stakeholders);
          setSelectedStakeholders(stakeholders);
        }

        // Restore current step
        const savedStep = sessionStorage.getItem('trainingCurrentStep');
        if (savedStep) {
          console.log('🔄 TrainingPracticeView: Restoring current step:', savedStep);
          setCurrentStep(savedStep as any);
        }

        // Restore messages if in live meeting
        const savedMessages = sessionStorage.getItem('trainingMessages');
        if (savedMessages) {
          const messages = JSON.parse(savedMessages);
          console.log('🔄 TrainingPracticeView: Restoring messages:', messages.length);
          setMessages(messages);
        }

        // Restore meeting time
        const savedMeetingTime = sessionStorage.getItem('trainingMeetingTime');
        if (savedMeetingTime) {
          setMeetingTime(parseInt(savedMeetingTime));
        }

        // Restore meeting active state
        const savedMeetingActive = sessionStorage.getItem('trainingMeetingActive');
        if (savedMeetingActive) {
          setIsMeetingActive(JSON.parse(savedMeetingActive));
        }

      } catch (error) {
        console.error('❌ TrainingPracticeView: Error restoring state:', error);
      }
    };

    restoreState();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      // Save messages if in live meeting
      if (currentStep === 'live-meeting' && messages.length > 0) {
        sessionStorage.setItem('trainingMessages', JSON.stringify(messages));
      }

      // Save meeting time
      sessionStorage.setItem('trainingMeetingTime', meetingTime.toString());

      // Save meeting active state
      sessionStorage.setItem('trainingMeetingActive', JSON.stringify(isMeetingActive));

    } catch (error) {
      console.error('❌ TrainingPracticeView: Error saving state:', error);
    }
  }, [session, selectedStakeholders, currentStep, messages, meetingTime, isMeetingActive]);

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
        // Start real session with API
        const sessionData = await trainingService.startSession(
          session.stage,
          session.projectId,
          'practice',
          selectedStakeholders.map(s => s.id)
        );
        
        setSession(sessionData);
        
        // Initialize singleAgentSystem
        try {
          await singleAgentSystem.initialize();
        } catch (error) {
          console.error('Failed to initialize singleAgentSystem:', error);
        }

        setCurrentStep('live-meeting');
        setIsMeetingActive(true);
      } catch (error) {
        console.error('Failed to start session:', error);
      }
      
      // Add initial greeting with stakeholder context
      const stakeholderNames = selectedStakeholders.map(s => `${s.name} (${s.role})`).join(', ');
      const initialMessage = {
        id: 'initial',
        sender: 'system',
        content: `Welcome to your ${session.stage.replace('_', ' ')} practice session! 

You'll be meeting with ${stakeholderNames} from ${selectedStakeholders[0].department}.

Current Focus: ${currentQuestion?.text}

Remember to start with a professional greeting and introduce yourself. Then focus on addressing the current question while maintaining professional etiquette throughout the conversation.`,
        timestamp: new Date(),
        type: 'greeting'
      };
      setMessages([initialMessage]);
    }
  };

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
      } else if (inputMessage.toLowerCase().includes('hello') || inputMessage.toLowerCase().includes('hi') || inputMessage.toLowerCase().includes('hey') || inputMessage.toLowerCase().includes('greetings')) {
        // Greeting - all stakeholders can respond
        console.log('👋 Training: Greeting detected - all stakeholders will respond');
        respondingStakeholders = selectedStakeholders;
      } else {
        // General question - one stakeholder responds (first one)
        console.log('❓ Training: General question - one stakeholder will respond');
        respondingStakeholders = [selectedStakeholders[0]];
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
          expertise: stakeholder.expertise || []
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
              sender: 'ai',
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

    // Coach Trigger 1: Missing Greetings (first 30 seconds)
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
        newCoaching.warnings.push("Start with a professional greeting! Try: 'Hello [Name], thank you for taking the time to meet with me today.'");
        newCoaching.warnings.push("Remember to introduce yourself and explain the purpose of the meeting briefly.");
      }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    // Clear sessionStorage when going back
    sessionStorage.removeItem('trainingConfig');
    sessionStorage.removeItem('trainingStakeholders');
    sessionStorage.removeItem('trainingCurrentStep');
    sessionStorage.removeItem('trainingMessages');
    sessionStorage.removeItem('trainingMeetingTime');
    sessionStorage.removeItem('trainingMeetingActive');
    setCurrentView('training-hub');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPreBrief = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Meeting Preparation
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Prepare for your {session?.stage?.replace('_', ' ')} meeting
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Practice Mode</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Overview Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Session Overview</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Training Stage</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {session?.stage.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/30 dark:border-green-700/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-right max-w-xs">
                      {mockProjects.find(p => p.id === session?.projectId)?.name || session?.projectId}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200/30 dark:border-orange-700/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">8-12 minutes</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">Practice (with coaching)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Focus Card */}
            {currentQuestion && (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <Focus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Focus</h2>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                        {currentQuestion.skill}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                    {currentQuestion.text}
                  </p>
                </div>
              </div>
            )}

            {/* Meeting Booking Simulation */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Meeting Details</h2>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200/30 dark:border-blue-700/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Meeting Type</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Business Analysis Discovery Call</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Duration</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">30 minutes</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Format</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Video Conference</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Agenda</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{session?.stage.replace('_', ' ')} Discussion</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/30 dark:border-yellow-700/30">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Meeting Etiquette:</strong> Remember to start with a professional greeting, introduce yourself, and explain the purpose of the meeting before diving into questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Stakeholder Selection Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Your Stakeholders</h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">(Select multiple for group meetings)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockProjects.find(p => p.id === session?.projectId)?.relevantStakeholders?.map(stakeholderId => {
                  const stakeholder = mockStakeholders.find(s => s.id === stakeholderId);
                  if (!stakeholder) return null;
                  
                  const isSelected = selectedStakeholders.some(s => s.id === stakeholder.id);
                  
                  return (
                    <button
                      key={stakeholder.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStakeholders(prev => prev.filter(s => s.id !== stakeholder.id));
                        } else {
                          setSelectedStakeholders(prev => [...prev, stakeholder]);
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg transform scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {stakeholder.photo ? (
                          <img 
                            src={stakeholder.photo} 
                            alt={stakeholder.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {stakeholder.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{stakeholder.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{stakeholder.role}</p>
                        </div>
                        {isSelected && (
                          <div className="ml-auto">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{stakeholder.department}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">{stakeholder.bio}</p>
                    </button>
                  );
                })}
              </div>
              
              {selectedStakeholders.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/30 dark:border-green-700/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      {selectedStakeholders.length} Stakeholder{selectedStakeholders.length > 1 ? 's' : ''} Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedStakeholders.map(stakeholder => (
                      <div key={stakeholder.id} className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-green-200 dark:border-green-700">
                        {stakeholder.photo ? (
                          <img 
                            src={stakeholder.photo} 
                            alt={stakeholder.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {stakeholder.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300">{stakeholder.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Success Tips Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Success Strategies</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg border border-green-200/30 dark:border-green-700/30">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Open Questions</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ask detailed, open-ended questions to gather comprehensive information</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Follow Up</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Dig deeper with follow-up questions on stakeholder responses</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Problem First</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Understand the problem thoroughly before suggesting solutions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-lg border border-orange-200/30 dark:border-orange-700/30">
                  <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Coaching Panel</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Monitor the coaching panel for real-time guidance and tips</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Questions Available</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Time Limit</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">12 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Coaching</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Enabled</span>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ready to Start?</h3>
                <p className="text-green-100 text-sm mb-6">
                  Begin your practice session with real-time coaching and feedback
                </p>
                <button
                  onClick={handleStartMeeting}
                  disabled={selectedStakeholders.length === 0}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    selectedStakeholders.length > 0
                      ? 'bg-white text-green-600 hover:bg-gray-50'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedStakeholders.length > 0 ? 'Start Meeting' : 'Select Stakeholders First'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLiveMeeting = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Practice Meeting</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {session?.stage.replace('_', ' ')} • {formatTime(meetingTime)}
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
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.sender === 'system'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {message.stakeholderName ? message.stakeholderName.split(' ').map((n: string) => n[0]).join('').slice(0, 1) : 'S'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender === 'ai' && (
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {message.stakeholderName}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  rows={2}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Coaching and Progress */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Current Question */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Current Focus</span>
            </h3>
            {currentQuestion && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium">Skill:</span> {currentQuestion.skill}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {currentQuestion.text}
                </p>
              </div>
            )}
          </div>

          {/* Coaching */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>Coaching</span>
            </h3>
            
            {coaching.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Warnings</span>
                </h4>
                <ul className="space-y-1">
                  {coaching.warnings.map((warning, index) => (
                    <li key={index} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {coaching.suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>Suggestions</span>
                </h4>
                <ul className="space-y-1">
                  {coaching.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {coaching.tips.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Tips</span>
                </h4>
                <ul className="space-y-1">
                  {coaching.tips.map((tip, index) => (
                    <li key={index} className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {coaching.warnings.length === 0 && coaching.suggestions.length === 0 && coaching.tips.length === 0 && (
              <div className="text-center py-8">
                <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start asking questions to receive coaching feedback
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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
                  {feedback?.coverageAnalysis?.covered?.map((area, index) => (
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
                    {feedback.coverageAnalysis.missed.map((area, index) => (
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
      {feedback && feedback?.nextTimeScripts?.length > 0 && (
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
          onClick={handleBack}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Back to Training Hub
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
      {currentStep === 'meeting-prep' && renderPreBrief()}
      {currentStep === 'live-meeting' && renderLiveMeeting()}
              {currentStep === 'feedback' && renderPostBrief()}
    </div>
  );
};

export default TrainingPracticeView;
