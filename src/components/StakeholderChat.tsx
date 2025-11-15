/**
 * StakeholderChat Component
 * Main chat interface for elicitation practice
 * Replaces old chat logic with new architecture
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { MeetingStage } from '../lib/meeting/meetingContext';
import { MeetingContextEngine } from '../lib/meeting/meetingContext';

interface Message {
  id: string;
  role: 'user' | 'stakeholder' | 'system';
  content: string;
  speaker_name?: string;
  timestamp: Date;
}

export interface StakeholderChatRef {
  sendQuestion: (question: string) => void;
  acknowledgeAndContinue: () => void;
  clearPendingState: () => void;
}

interface StakeholderChatProps {
  currentStage: MeetingStage;
  stakeholderProfile: {
    id: string;
    name: string;
    role: string;
    department: string;
    personality: string;
    priorities: string[];
  };
  availableStakeholders?: Array<{
    id: string;
    name: string;
    role: string;
    department: string;
    personality: string;
    priorities: string[];
  }>;
  projectContext: {
    id?: string;
    name: string;
    description?: string;
    objective?: string;
    industry?: string;
    complexity?: string;
    challenges: string[];
    currentState: string;
    expectedOutcomes?: string[];
    constraints?: string[];
  };
  onCoachingUpdate?: (coaching: any) => void;
  onContextUpdate?: (context: any) => void;
  onFollowUpsUpdate?: (followUps: any[]) => void;
}

const StakeholderChat = React.forwardRef<StakeholderChatRef, StakeholderChatProps>(({
  currentStage,
  stakeholderProfile,
  availableStakeholders,
  projectContext,
  onCoachingUpdate,
  onContextUpdate,
  onFollowUpsUpdate
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputLocked, setIsInputLocked] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [pendingEvaluation, setPendingEvaluation] = useState<any>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);
  const [justResumed, setJustResumed] = useState(false);
  const [contextEngine] = useState(() => new MeetingContextEngine(currentStage));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for saved conversation on mount
  useEffect(() => {
    if (hasCheckedResume) return;
    setHasCheckedResume(true);
    
    // Use a stable key based on project name (normalized) and stage
    const projectKey = (projectContext.id || projectContext.name || 'unknown').toLowerCase().replace(/\s+/g, '-');
    const storageKey = `chat-meeting-${projectKey}-${currentStage}`;
    console.log('🔍 StakeholderChat: Checking for saved conversation with key:', storageKey);
    
    const savedMessages = sessionStorage.getItem(storageKey);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        console.log('🔍 StakeholderChat: Found saved messages:', parsed.length);
        if (parsed && parsed.length > 0) {
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error('Error parsing saved messages:', e);
      }
    } else {
      console.log('🔍 StakeholderChat: No saved conversation found');
    }
  }, [hasCheckedResume, projectContext.id, projectContext.name, currentStage]);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      // Use a stable key based on project name (normalized) and stage
      const projectKey = (projectContext.id || projectContext.name || 'unknown').toLowerCase().replace(/\s+/g, '-');
      const storageKey = `chat-meeting-${projectKey}-${currentStage}`;
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
      console.log('💾 StakeholderChat: Saved', messages.length, 'messages to', storageKey);
    }
  }, [messages, projectContext.id, projectContext.name, currentStage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle resume or start new
  const handleResume = () => {
    const projectKey = (projectContext.id || projectContext.name || 'unknown').toLowerCase().replace(/\s+/g, '-');
    const storageKey = `chat-meeting-${projectKey}-${currentStage}`;
    const savedMessages = sessionStorage.getItem(storageKey);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((m: any) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
        }));
        setMessages(messagesWithDates);
        setJustResumed(true); // Show resume notification
        console.log('✅ StakeholderChat: Resumed conversation with', messagesWithDates.length, 'messages');
        
        // Auto-hide resume notification after 8 seconds
        setTimeout(() => {
          setJustResumed(false);
        }, 8000);
      } catch (e) {
        console.error('Error loading saved messages:', e);
      }
    }
    setShowResumeModal(false);
  };

  const handleStartNew = () => {
    const projectKey = (projectContext.id || projectContext.name || 'unknown').toLowerCase().replace(/\s+/g, '-');
    const storageKey = `chat-meeting-${projectKey}-${currentStage}`;
    sessionStorage.removeItem(storageKey);
    setMessages([]);
    setShowResumeModal(false);
    console.log('🆕 StakeholderChat: Starting new conversation');
  };

  const handleSendMessage = useCallback(async (questionOverride?: string) => {
    const questionToSend = questionOverride || inputMessage;
    if (!questionToSend.trim() || isLoading || isInputLocked) return;
    
    // Hide resume notification when user sends a message
    if (justResumed) {
      setJustResumed(false);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: questionToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!questionOverride) {
      setInputMessage('');
    }
    setIsLoading(true);

    try {
      // Step 1: Evaluate question
      const evaluationResponse = await fetch('/api/stakeholder/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: userMessage.content,
          currentStage,
          projectContext,
          conversationHistory: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        })
      });

      if (!evaluationResponse.ok) {
        let errorMessage = 'Failed to evaluate question';
        try {
          const errorData = await evaluationResponse.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('Evaluation API error:', errorData);
        } catch (parseError) {
          errorMessage = `HTTP ${evaluationResponse.status}: ${evaluationResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const evaluationData = await evaluationResponse.json();
      const evaluation = evaluationData.question_evaluation;

      // Step 2: Generate coaching
      const coachingResponse = await fetch('/api/stakeholder/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: userMessage.content,
          evaluationResult: evaluation,
          currentStage,
          projectContext
        })
      });

      if (!coachingResponse.ok) {
        let errorMessage = 'Failed to generate coaching';
        try {
          const errorData = await coachingResponse.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('Coaching API error:', errorData);
        } catch (parseError) {
          errorMessage = `HTTP ${coachingResponse.status}: ${coachingResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const coachingData = await coachingResponse.json();
      const coaching = coachingData.coaching_feedback;

      // Notify parent about coaching
      if (onCoachingUpdate) {
        onCoachingUpdate(coaching);
      }

      // Lock input if AMBER or RED
      if (coaching.action !== 'CONTINUE') {
        setIsInputLocked(true);
      }

      // Step 3: Generate stakeholder response
      // For GREEN: generate immediately, but coaching panel stays visible so user can read feedback
      // For AMBER/RED: store question and wait for acknowledgement
      if (evaluation.verdict === 'GREEN') {
        const stakeholdersToSend = availableStakeholders || [stakeholderProfile];
        console.log('🔍 [Frontend] Sending to /api/stakeholder/respond');
        console.log('🔍 [Frontend] Question:', userMessage.content);
        console.log('🔍 [Frontend] Available stakeholders:', stakeholdersToSend.map(s => `${s.name} (${s.role}, ${s.department})`).join(', '));
        console.log('🔍 [Frontend] Stakeholder profile:', stakeholderProfile.name);
        
        const responseResponse = await fetch('/api/stakeholder/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userQuestion: userMessage.content,
            questionVerdict: evaluation.verdict,
            currentStage,
            stakeholderProfile,
            allStakeholders: stakeholdersToSend,
            conversationHistory: [...messages, userMessage].map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            projectContext
          })
        });

        if (!responseResponse.ok) {
          let errorMessage = 'Failed to generate stakeholder response';
          try {
            const errorData = await responseResponse.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
            console.error('Response API error:', errorData);
          } catch (parseError) {
            errorMessage = `HTTP ${responseResponse.status}: ${responseResponse.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const responseData = await responseResponse.json();
        const stakeholderResponse = responseData.stakeholder_response;

        const stakeholderMessage: Message = {
          id: `stakeholder-${Date.now()}`,
          role: 'stakeholder',
          content: stakeholderResponse.content,
          speaker_name: stakeholderResponse.speaker_name,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, stakeholderMessage]);

        // Step 4: Generate follow-ups
        const followUpsResponse = await fetch('/api/stakeholder/followups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stakeholderResponse: stakeholderResponse.content,
            currentStage,
            conversationHistory: [...messages, userMessage, stakeholderMessage].map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            projectContext
          })
        });

        if (followUpsResponse.ok) {
          const followUpsData = await followUpsResponse.json();
          if (onFollowUpsUpdate) {
            onFollowUpsUpdate(followUpsData.suggested_follow_ups || []);
          }
        }

        // Step 5: Update context
        const contextResponse = await fetch('/api/stakeholder/context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationHistory: [...messages, userMessage, stakeholderMessage].map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            currentStage,
            projectContext
          })
        });

        if (contextResponse.ok) {
          const contextData = await contextResponse.json();
          if (onContextUpdate) {
            onContextUpdate(contextData.context_updates);
          }
        }
      } else {
        // AMBER or RED - store the question and evaluation for after acknowledgement
        setPendingQuestion(userMessage.content);
        setPendingEvaluation(evaluation);
        // Don't generate stakeholder response yet - wait for acknowledgement
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      let errorText = 'Sorry, there was an error processing your message. Please try again.';
      
      // Check for fetch errors (network or API errors)
      if (error?.message) {
        errorText = `Error: ${error.message}`;
      } else if (error?.toString) {
        errorText = `Error: ${error.toString()}`;
      }
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: errorText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentStage, stakeholderProfile, availableStakeholders, projectContext, messages, onCoachingUpdate, onContextUpdate, onFollowUpsUpdate, isLoading, isInputLocked, inputMessage, pendingQuestion, pendingEvaluation, justResumed]);

  // Handle acknowledgement - generate stakeholder response for pending question
  const handleAcknowledgeAndContinue = useCallback(async () => {
    if (!pendingQuestion || !pendingEvaluation) return;

    setIsInputLocked(false);
    setIsLoading(true);

    try {
      const stakeholdersToSend = availableStakeholders || [stakeholderProfile];
      console.log('🔍 [Frontend] Acknowledge - Sending to /api/stakeholder/respond');
      console.log('🔍 [Frontend] Acknowledge - Question:', pendingQuestion);
      console.log('🔍 [Frontend] Acknowledge - Available stakeholders:', stakeholdersToSend.map(s => `${s.name} (${s.role}, ${s.department})`).join(', '));
      
      // Now generate stakeholder response for the pending question
      const responseResponse = await fetch('/api/stakeholder/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: pendingQuestion,
          questionVerdict: pendingEvaluation.verdict,
          currentStage,
          stakeholderProfile,
          allStakeholders: stakeholdersToSend,
          conversationHistory: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          projectContext
        })
      });

      if (!responseResponse.ok) {
        let errorMessage = 'Failed to generate stakeholder response';
        try {
          const errorData = await responseResponse.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('Response API error (acknowledge):', errorData);
        } catch (parseError) {
          errorMessage = `HTTP ${responseResponse.status}: ${responseResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await responseResponse.json();
      const stakeholderResponse = responseData.stakeholder_response;

      const stakeholderMessage: Message = {
        id: `stakeholder-${Date.now()}`,
        role: 'stakeholder',
        content: stakeholderResponse.content,
        speaker_name: stakeholderResponse.speaker_name,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, stakeholderMessage]);

      // Generate follow-ups
      const followUpsResponse = await fetch('/api/stakeholder/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stakeholderResponse: stakeholderResponse.content,
          currentStage,
          conversationHistory: [...messages, stakeholderMessage].map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          projectContext
        })
      });

      const followUpsData = await followUpsResponse.json();
      if (onFollowUpsUpdate) {
        onFollowUpsUpdate(followUpsData.suggested_follow_ups || []);
      }

      // Update context
      const contextResponse = await fetch('/api/stakeholder/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: [...messages, stakeholderMessage].map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          currentStage,
          projectContext
        })
      });

      const contextData = await contextResponse.json();
      if (onContextUpdate) {
        onContextUpdate(contextData.context_updates);
      }

      // Clear pending state
      setPendingQuestion(null);
      setPendingEvaluation(null);

    } catch (error: any) {
      console.error('Error generating stakeholder response after acknowledgement:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: error?.message || 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [pendingQuestion, pendingEvaluation, currentStage, stakeholderProfile, availableStakeholders, projectContext, messages, onContextUpdate, onFollowUpsUpdate]);

  // Clear pending state (used when "Got it" is clicked - don't process bad question)
  const clearPendingState = useCallback(() => {
    setPendingQuestion(null);
    setPendingEvaluation(null);
    setIsInputLocked(false);
  }, []);

  // Expose methods to parent via ref
  React.useImperativeHandle(ref, () => ({
    sendQuestion: (question: string) => {
      // Clear any pending question/evaluation when using a rewrite
      // This ensures the input unlocks and the new question is processed fresh
      setPendingQuestion(null);
      setPendingEvaluation(null);
      setIsInputLocked(false);
      // Call handleSendMessage directly with the question
      handleSendMessage(question);
    },
    acknowledgeAndContinue: () => {
      handleAcknowledgeAndContinue();
    },
    clearPendingState: () => {
      clearPendingState();
    }
  }), [handleSendMessage, handleAcknowledgeAndContinue, clearPendingState]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isInputLocked) {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Continue Previous Discussion?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              We found a previous conversation for this project and stage. Would you like to continue where you left off or start a new discussion?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleResume}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Continue Previous
              </button>
              <button
                onClick={handleStartNew}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Start New
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Resume Notification Banner */}
      {justResumed && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 px-6 py-4 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Continuing from where you left off.</span> You're picking up your previous conversation. Feel free to exchange pleasantries or continue with your questions.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setJustResumed(false)}
                className="inline-flex text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header with Project and Stakeholder Info - Enhanced */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {projectContext.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Meeting with {availableStakeholders && availableStakeholders.length > 1 
                ? `${availableStakeholders.length} stakeholders: ${availableStakeholders.map(s => s.name).join(', ')}`
                : <><span className="font-medium">{stakeholderProfile.name}</span> ({stakeholderProfile.role})</>
              }
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium uppercase tracking-wide">
              {currentStage.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => {
          // Helper to get initials for avatar
          const getInitials = (name: string) => {
            return name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
          };

          const isUser = message.role === 'user';
          const isStakeholder = message.role === 'stakeholder';
          const speakerName = isStakeholder ? message.speaker_name : 'You';
          const initials = getInitials(speakerName || 'U');

          return (
            <div
              key={message.id}
              className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar - More prominent with better shadow */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : isStakeholder
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-400 text-white'
                }`}
              >
                {initials}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl flex-1`}>
                {/* Name and Role for Stakeholder */}
                {isStakeholder && message.speaker_name && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {message.speaker_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {availableStakeholders?.find(s => s.name === message.speaker_name)?.role || stakeholderProfile.role}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                
                {/* User message header */}
                {isUser && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">You</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Message Content - Enhanced bubble styling */}
                <div
                  className={`px-5 py-3 rounded-2xl shadow-md ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : message.role === 'system'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
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
              placeholder={isInputLocked ? "Please acknowledge the coaching feedback above first..." : "Type your question here..."}
              disabled={isInputLocked || isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                isInputLocked || isLoading
                  ? 'border-gray-300 bg-gray-100 text-gray-500 placeholder-gray-400 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
              }`}
              rows={2}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isInputLocked}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
});

StakeholderChat.displayName = 'StakeholderChat';

export default StakeholderChat;








