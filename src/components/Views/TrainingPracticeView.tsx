import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TrainingService } from '../../services/trainingService';
import { TrainingSession, TrainingQuestion, TrainingFeedback } from '../../types/training';
import { mockProjects, mockStakeholders } from '../../data/mockData';
import { Stakeholder } from '../../types';
import { singleAgentSystem } from '../../services/singleAgentSystem';
import AIService from '../../services/aiService';
import CompleteCoachingPanel from '../CompleteCoachingPanel';
import DynamicCoachingPanel from '../DynamicCoachingPanel';

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
  const { setCurrentView, selectedProject } = useApp();
  const [currentStep, setCurrentStep] = useState<'meeting-prep' | 'live-meeting' | 'feedback'>('meeting-prep');
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<TrainingQuestion | null>(null);
  const [selectedStakeholders, setSelectedStakeholders] = useState<Stakeholder[]>([]);
  
  // New coaching system state

  
  // Keep old coaching for backward compatibility during transition
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
  const [awaitingAcknowledgement, setAwaitingAcknowledgement] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dynamicPanelRef = useRef<{ onUserSubmitted: (messageId: string) => void } | null>(null);

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



  const handleAcknowledgementStateChange = useCallback((awaiting: boolean) => {
    console.log('🔄 TrainingPracticeView: handleAcknowledgementStateChange called with:', awaiting);
    console.log('🔄 TrainingPracticeView: Previous awaitingAcknowledgement:', awaitingAcknowledgement);
    setAwaitingAcknowledgement(prev => (prev === awaiting ? prev : awaiting));
    console.log('🔄 TrainingPracticeView: New awaitingAcknowledgement will be:', awaiting);
  }, [awaitingAcknowledgement]);

  const handleSuggestedRewrite = useCallback((rewrite: string) => {
    setInputMessage(rewrite);
    // Focus the text input
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  }, []);

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
        } else {
          // Fallback: Create a new session if no config exists
          console.log('🔄 TrainingPracticeView: No training config found, creating new session');
          if (selectedProject) {
            try {
              // Find the project ID from the selected project name
              const project = mockProjects.find(p => p.name === selectedProject.name);
              if (project) {
                console.log('🔄 TrainingPracticeView: Creating session for project:', project.name);
                const newSession = await trainingService.startSession('problem_exploration', project.id, 'practice', []);
                setSession(newSession);
                
                // Load the current question for the new session
                const question = trainingService.getCurrentQuestion(newSession.id);
                setCurrentQuestion(question);
                
                // Save the new session config
                const config = {
                  sessionId: newSession.id,
                  stage: newSession.stage,
                  projectId: newSession.projectId,
                  mode: newSession.mode
                };
                sessionStorage.setItem('trainingConfig', JSON.stringify(config));
                console.log('🔄 TrainingPracticeView: Saved new session config:', config);
              } else {
                console.error('❌ TrainingPracticeView: Could not find project for:', selectedProject.name);
              }
            } catch (error) {
              console.error('❌ TrainingPracticeView: Error creating new session:', error);
            }
          } else {
            console.error('❌ TrainingPracticeView: No selected project available for fallback session');
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
  }, [selectedProject]);

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
      const currentQuestionText = currentQuestion?.text || 'Understanding current process challenges';
      const initialMessage = {
        id: 'initial',
        sender: 'system',
        content: `Welcome to your ${session.stage.replace('_', ' ')} practice session! 

You'll be meeting with ${stakeholderNames} from ${selectedStakeholders[0].department}.

Current Focus: ${currentQuestionText}

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
            console.log('🔍 Debug - selectedStakeholders length:', selectedStakeholders.length);
            console.log('🔍 Debug - selectedStakeholders:', selectedStakeholders);
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
                console.log('🔍 Debug - Project found:', project?.name, 'Project ID:', session?.projectId);
                console.log('🔍 Debug - Project relevantStakeholders:', project?.relevantStakeholders);
                
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
                        console.log('🔍 Debug - Clicking stakeholder:', stakeholder.name, 'Currently selected:', isSelected);
                        if (isSelected) {
                          setSelectedStakeholders(prev => {
                            const newSelection = prev.filter(s => s.id !== stakeholder.id);
                            console.log('🔍 Debug - Removed stakeholder, new selection:', newSelection);
                            return newSelection;
                          });
                        } else {
                          setSelectedStakeholders(prev => {
                            const newSelection = [...prev, stakeholder];
                            console.log('🔍 Debug - Added stakeholder, new selection:', newSelection);
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
                    {(message.sender === 'ai' || message.sender === 'stakeholder') && (
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {message.stakeholderName ? message.stakeholderName.split(' ').map((n: string) => n[0]).join('').slice(0, 1) : 'S'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {(message.sender === 'ai' || message.sender === 'stakeholder') && (
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {message.stakeholderName}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString()}
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
                  placeholder={awaitingAcknowledgement ? "Please acknowledge the feedback above first..." : "Type your message here..."}
                  disabled={awaitingAcknowledgement}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    awaitingAcknowledgement 
                      ? 'border-gray-300 bg-gray-100 text-gray-500 placeholder-gray-400 cursor-not-allowed' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                  }`}
                  rows={2}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping || awaitingAcknowledgement}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Coaching Panel - New Response-Driven System */}
        <CoachingPanelWrapper
          ref={dynamicPanelRef}
          projectName={selectedProject?.name || ''}
          conversationHistory={messages}
          onAcknowledgementStateChange={handleAcknowledgementStateChange}
          onSuggestedRewrite={handleSuggestedRewrite}
        />
        
        {/* Debug Info */}
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded opacity-75">
          <div>Messages: {messages.length}</div>
          <div>User Messages: {messages.filter(m => m.sender === 'user').length}</div>
          <div>Stakeholder Messages: {messages.filter(m => m.sender === 'stakeholder' || m.sender === 'ai').length}</div>
          <div>Awaiting Ack: {awaitingAcknowledgement ? 'Yes' : 'No'}</div>
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
      {currentStep === 'meeting-prep' && renderMeetingPrep()}
      {currentStep === 'live-meeting' && renderLiveMeeting()}
              {currentStep === 'feedback' && renderPostBrief()}
    </div>
  );
};

// CoachingPanelWrapper component to fix Rules of Hooks violation
const CoachingPanelWrapper = React.forwardRef<{ onUserSubmitted: (messageId: string) => void }, {
  projectName: string;
  conversationHistory: any[];
  onAcknowledgementStateChange: (awaiting: boolean) => void;
  onSuggestedRewrite: (rewrite: string) => void;
}>(({
  projectName,
  conversationHistory,
  onAcknowledgementStateChange,
  onSuggestedRewrite,
}, ref) => {
  const useDynamic = useMemo(() => true, []); // Temporarily hardcoded to test dynamic system
  
  const handleSubmitMessage = useCallback((message: string) => {
    console.log('Dynamic panel submitted message:', message);
  }, []);

  return useDynamic ? (
    <DynamicCoachingPanel
      ref={ref}
      projectName={projectName}
      conversationHistory={conversationHistory}
      onAcknowledgementStateChange={onAcknowledgementStateChange}
      onSuggestedRewrite={onSuggestedRewrite}
      onSubmitMessage={handleSubmitMessage}
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

export default TrainingPracticeView;
