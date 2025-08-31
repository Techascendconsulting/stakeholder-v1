import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, CheckCircle, AlertTriangle, Copy, Lightbulb } from 'lucide-react';
import GreetingCoachingService from '../services/greetingCoachingService';
import ProblemExplorationService from '../services/problemExplorationService';
import StakeholderResponseAnalysisService from '../services/stakeholderResponseAnalysisService';

// Types
type Verdict = 'GOOD' | 'AMBER' | 'OOS';

type CoachingFeedback = {
  verdict: Verdict;
  message: string;
  suggestedRewrite?: string;
  reasoning?: string;
  technique?: string;
};

type WarmUpGuidance = {
  title: string;
  description: string;
  why: string;
  how: string;
  examples: string[];
};

type ProblemExplorationGuidance = {
  title: string;
  description: string;
  why: string;
  how: string;
  examples: string[];
};

type ProblemExplorationEvaluation = {
  verdict: 'GOOD' | 'AMBER' | 'OOS';
  message: string;
  suggestedRewrite?: string;
  reasoning: string;
  technique: string;
};

type StakeholderResponseAnalysis = {
  insights: string[];
  painPoints: string[];
  blockers: string[];
  nextQuestion: string;
  reasoning: string;
  technique: string;
};

interface DynamicCoachingPanelProps {
  projectName: string;
  conversationHistory: Array<{ id: string; sender: string; content: string; timestamp: Date; stakeholderName?: string }>;
  onAcknowledgementStateChange?: (awaitingAcknowledgement: boolean) => void;
  onSuggestedRewrite?: (rewrite: string) => void;
  onSubmitMessage?: (message: string) => void;
  onPopulateInput?: (message: string) => void;
}

const DynamicCoachingPanel = React.forwardRef<{ onUserSubmitted: (messageId: string) => void }, DynamicCoachingPanelProps>(({
  projectName,
  conversationHistory,
  onAcknowledgementStateChange,
  onSuggestedRewrite,
  onSubmitMessage,
}, ref) => {
  // State management - ONLY for greeting
  const [inputLocked, setInputLocked] = useState(false);
  const [awaitingAcknowledgement, setAwaitingAcknowledgement] = useState(false);
  const [coachingFeedback, setCoachingFeedback] = useState<CoachingFeedback | null>(null);
  const [greetingCompleted, setGreetingCompleted] = useState(false);
  const [warmUpGuidance, setWarmUpGuidance] = useState<WarmUpGuidance | null>(null);
  const [problemExplorationGuidance, setProblemExplorationGuidance] = useState<ProblemExplorationGuidance | null>(null);
  const [problemExplorationFeedback, setProblemExplorationFeedback] = useState<ProblemExplorationEvaluation | null>(null);
  const [showNextPhase, setShowNextPhase] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [problemExplorationCompleted, setProblemExplorationCompleted] = useState(false);
  const [stakeholderAnalysis, setStakeholderAnalysis] = useState<StakeholderResponseAnalysis | null>(null);
  const [showStakeholderAnalysis, setShowStakeholderAnalysis] = useState(false);
  const [isAnalyzingStakeholder, setIsAnalyzingStakeholder] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [lastAnalyzedMessageId, setLastAnalyzedMessageId] = useState<string | null>(null);

  // Load warm-up guidance on mount
  useEffect(() => {
    const loadWarmUpGuidance = async () => {
      try {
        const guidance = await GreetingCoachingService.getInstance().getWarmUpGuidance();
        setWarmUpGuidance(guidance);
      } catch (error) {
        console.error('Failed to load warm-up guidance:', error);
      }
    };
    loadWarmUpGuidance();
  }, []);



  // Mirror lock to parent - with guard to prevent unnecessary calls
  useEffect(() => {
    if (onAcknowledgementStateChange) {
      onAcknowledgementStateChange(awaitingAcknowledgement);
    }
  }, [awaitingAcknowledgement, onAcknowledgementStateChange]);

    // Instrumented stakeholder analysis with surgical debugging
  const lastMessage = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : null;
  const sender = (lastMessage?.sender ?? '').toLowerCase();
  const nextPhase = Boolean(showNextPhase);
  const probDone = Boolean(problemExplorationCompleted);
  const shown = Boolean(showStakeholderAnalysis);
  const isNewStakeholderMessage = lastMessage?.sender === 'stakeholder' && lastMessage?.id !== lastAnalyzedMessageId;
  const shouldAnalyze = isNewStakeholderMessage && nextPhase && probDone;

  const didAnalyzeRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-evaluate new user messages - for greeting and problem exploration
  useEffect(() => {
    if (conversationHistory.length > 0 && !isEvaluating) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      
      if (lastMessage.sender === 'user') {
        if (!greetingCompleted) {
          // Still in greeting phase
          console.log('🔍 EVALUATING GREETING');
          evaluateGreeting(lastMessage.content);
        } else if (showNextPhase && !problemExplorationCompleted) {
          // In problem exploration phase
          console.log('🔍 EVALUATING PROBLEM EXPLORATION');
          evaluateProblemExplorationQuestion(lastMessage.content);
        } else if (problemExplorationCompleted && showStakeholderAnalysis) {
          // Evaluate user questions in stakeholder analysis phase
          console.log('🔍 EVALUATING USER QUESTION');
          evaluateUserQuestion(lastMessage.content);
        }
      }
    }
  }, [conversationHistory, greetingCompleted, showNextPhase, problemExplorationCompleted, showStakeholderAnalysis, isEvaluating]);

  // Separate effect for stakeholder analysis with surgical debugging
  useEffect(() => {
    console.log('[DC] check', { sender, nextPhase, probDone, shown, shouldAnalyze });

    if (!shouldAnalyze || didAnalyzeRef.current) return;

    if (shouldAnalyze) console.log('[DC] CONDITION MET — firing analysis now');

    didAnalyzeRef.current = true;                 // idempotent (StrictMode safe)
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    
    // Show loading state
    setIsAnalyzingStakeholder(true);
    setShowStakeholderAnalysis(false);

    (async () => {
      console.log('[DC] -> calling /api/analyzeStakeholder');
      try {
        const lastMessage = conversationHistory[conversationHistory.length - 1];
        const res = await fetch('/api/analyzeStakeholder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            transcript: lastMessage?.content ?? '', 
            context: { nextPhase, probDone } 
          }),
          signal: ac.signal,
        });

        console.log('[DC] <- response', { status: res.status });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`${res.status} ${data?.error ?? 'Unknown error'}`);

        setStakeholderAnalysis(data.analysis);
        setShowStakeholderAnalysis(true);
        setIsAnalyzingStakeholder(false);
        setLastAnalyzedMessageId(lastMessage?.id || null);
        setCurrentQuestionNumber(prev => Math.min(prev + 1, 15)); // Increment question counter, max 15
        console.log('[DC] done - Question', currentQuestionNumber + 1);
      } catch (e) {
        didAnalyzeRef.current = false;           // allow retry if it failed
        setIsAnalyzingStakeholder(false);
        console.error('[DC] analysis error', e);
      }
    })();

    return () => ac.abort();
  }, [shouldAnalyze, conversationHistory]);

  // Evaluate greeting ONLY using AI
  const evaluateGreeting = async (message: string) => {
    console.log('🔍 Evaluating greeting:', message);
    setIsEvaluating(true);

    try {
      const evaluation = await GreetingCoachingService.getInstance().evaluateGreeting(message);
      
      if (evaluation.verdict === 'GOOD') {
        setCoachingFeedback({
          verdict: 'GOOD',
          message: evaluation.message,
          reasoning: evaluation.reasoning,
          technique: evaluation.technique
        });
        setGreetingCompleted(true);
        setInputLocked(false);
        
        // Show success briefly, then move to next phase
        setTimeout(async () => {
          setShowNextPhase(true);
          setCoachingFeedback(null);
          // Load problem exploration guidance immediately
          try {
            const guidance = await ProblemExplorationService.getInstance().getProblemExplorationGuidance();
            setProblemExplorationGuidance(guidance);
          } catch (error) {
            console.error('Failed to load problem exploration guidance:', error);
          }
        }, 2000);
      } else {
        setCoachingFeedback({
          verdict: evaluation.verdict,
          message: evaluation.message,
          suggestedRewrite: evaluation.suggestedRewrite,
          reasoning: evaluation.reasoning,
          technique: evaluation.technique
        });
        setAwaitingAcknowledgement(true);
        setInputLocked(true);
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
      // Fallback to simple evaluation
      const isCasual = /^(hi|hey|yo|what's up|hello\s*$)/i.test(message.trim());
      const hasProfessionalElements = /(thank|appreciate|business analyst|meet|understand|challenge)/i.test(message);
      
      if (isCasual && !hasProfessionalElements) {
        setCoachingFeedback({
          verdict: 'AMBER',
          message: "Let's refine this. Aim for neutral, open phrasing.",
          suggestedRewrite: "Hello [Name], thanks for taking the time to meet today. I'm the business analyst on this project, and I'd like to understand your current challenges."
        });
        setAwaitingAcknowledgement(true);
        setInputLocked(true);
      } else {
        setCoachingFeedback({
          verdict: 'GOOD',
          message: "Great professional greeting!"
        });
        setGreetingCompleted(true);
        setInputLocked(false);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // Evaluate problem exploration question using AI
  const evaluateProblemExplorationQuestion = async (message: string) => {
    console.log('🔍 Evaluating problem exploration question:', message);
    setIsEvaluating(true);

    try {
      const evaluation = await ProblemExplorationService.getInstance().evaluateProblemExplorationQuestion(message);
      
      if (evaluation.verdict === 'GOOD') {
        setProblemExplorationFeedback({
          verdict: 'GOOD',
          message: evaluation.message,
          reasoning: evaluation.reasoning,
          technique: evaluation.technique
        });
        setProblemExplorationCompleted(true);
        
        // Show success briefly, then move to next phase (stakeholder response analysis)
        setTimeout(() => {
          setProblemExplorationFeedback(null);
          // Don't set problemExplorationCompleted again - it's already set
          console.log('✅ Problem exploration completed - ready for stakeholder analysis');
        }, 2000);
      } else {
        setProblemExplorationFeedback({
          verdict: evaluation.verdict,
          message: evaluation.message,
          suggestedRewrite: evaluation.suggestedRewrite,
          reasoning: evaluation.reasoning,
          technique: evaluation.technique
        });
        setAwaitingAcknowledgement(true);
        setInputLocked(true);
      }
    } catch (error) {
      console.error('Problem exploration evaluation failed:', error);
      // Fallback evaluation
      const isProblemFocused = /(problem|challenge|issue|pain|difficulty|struggle|concern)/i.test(message);
      const isOpenEnded = /(what|how|why|when|where|describe|explain|tell)/i.test(message);
      
      if (isProblemFocused && isOpenEnded) {
        setProblemExplorationFeedback({
          verdict: 'GOOD',
          message: "Great problem exploration question!",
          reasoning: "The question effectively focuses on problems and encourages open-ended exploration.",
          technique: "Problem Exploration"
        });
        setProblemExplorationCompleted(true);
      } else {
        setProblemExplorationFeedback({
          verdict: 'AMBER',
          message: "This question could be more effective for problem exploration.",
          suggestedRewrite: "What specific challenges or pain points are you experiencing that led to this project being initiated?",
          reasoning: "The question could better focus on problems rather than solutions.",
          technique: "Problem Exploration"
        });
        setAwaitingAcknowledgement(true);
        setInputLocked(true);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // Evaluate user questions in stakeholder analysis phase
  const evaluateUserQuestion = async (message: string) => {
    console.log('🔍 Evaluating user question:', message);
    setIsEvaluating(true);
    
    // Reset analysis state for new user question
    setShowStakeholderAnalysis(false);
    setStakeholderAnalysis(null);
    didAnalyzeRef.current = false;

    try {
      // Simple evaluation logic for user questions
      const isRelevant = /(problem|challenge|issue|pain|difficulty|process|system|workflow|performance|management|review|feedback|goal|tracking|continuous|annual|evaluation|objective|data|driven|administrative|burden|time|consuming|manual|outdated|subjective)/i.test(message);
      const isOpenEnded = /(what|how|why|when|where|describe|explain|tell|can you|could you)/i.test(message);
      const isOffTopic = /(tennis|sport|hobby|personal|family|weather|politics|religion|entertainment|music|movie|book|food|travel|vacation|weekend|party|celebration|birthday|anniversary)/i.test(message);
      
      if (isOffTopic) {
        setCoachingFeedback({
          verdict: 'OOS',
          message: "This question is outside the scope of our business analysis interview. Let's focus on the performance management project.",
          reasoning: "The question is not related to the business problem we're analyzing.",
          technique: "Scope Management"
        });
        setAwaitingAcknowledgement(true);
        setInputLocked(true);
      } else if (isRelevant && isOpenEnded) {
        setCoachingFeedback({
          verdict: 'GOOD',
          message: "Great question! This will help us understand the stakeholder's perspective better.",
          reasoning: "The question is relevant to the project and encourages open-ended exploration.",
          technique: "Probing"
        });
        // Don't lock input - let stakeholder respond
        setInputLocked(false);
      } else {
        setCoachingFeedback({
          verdict: 'AMBER',
          message: "This question could be more effective for our analysis.",
          suggestedRewrite: "What specific challenges have you encountered with the current performance management process?",
          reasoning: "The question could better focus on specific problems and challenges.",
          technique: "Problem Exploration"
        });
        setAwaitingAcknowledgement(true);
        setInputLocked(true);
      }
    } catch (error) {
      console.error('User question evaluation failed:', error);
      // Fallback evaluation
      setCoachingFeedback({
        verdict: 'AMBER',
        message: "Let's focus on the performance management project.",
        suggestedRewrite: "What specific challenges have you encountered with the current performance management process?",
        reasoning: "This question will help us understand the specific problems.",
        technique: "Problem Exploration"
      });
      setAwaitingAcknowledgement(true);
      setInputLocked(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Analyze stakeholder response and generate next question
  const analyzeStakeholderResponse = async (response: string) => {
    console.log('🎯 ANALYZING STAKEHOLDER RESPONSE - FUNCTION CALLED:', response);
    setIsEvaluating(true);

    try {
      const analysis = await StakeholderResponseAnalysisService.getInstance().analyzeStakeholderResponse(response);
      setStakeholderAnalysis(analysis);
      setShowStakeholderAnalysis(true);
      console.log('✅ Stakeholder analysis completed:', analysis);
    } catch (error) {
      console.error('Stakeholder analysis failed:', error);
      // Fallback analysis
      setStakeholderAnalysis({
        insights: ["Stakeholder provided valuable context about their situation"],
        painPoints: ["Need to identify specific pain points from their response"],
        blockers: ["Need to understand potential blockers"],
        nextQuestion: "Can you tell me more about the specific challenges you're facing?",
        reasoning: "This question will help us dive deeper into their specific situation",
        technique: "Probing"
      });
      setShowStakeholderAnalysis(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle acknowledge button click
  const handleAcknowledge = async () => {
    setAwaitingAcknowledgement(false);
    setInputLocked(false);
    
    if (coachingFeedback) {
      if (!greetingCompleted) {
        // Greeting phase acknowledgment
        setCoachingFeedback(null);
        setGreetingCompleted(true);
        setShowNextPhase(true);
        // Load problem exploration guidance immediately
        try {
          const guidance = await ProblemExplorationService.getInstance().getProblemExplorationGuidance();
          setProblemExplorationGuidance(guidance);
        } catch (error) {
          console.error('Failed to load problem exploration guidance:', error);
        }
      } else if (problemExplorationCompleted && showStakeholderAnalysis) {
        // User question evaluation acknowledgment in stakeholder analysis phase
        setCoachingFeedback(null);
        // Keep user in stakeholder analysis phase - they can ask another question
        console.log('✅ User question feedback acknowledged - user can ask another question');
      }
    } else if (problemExplorationFeedback) {
      // Problem exploration phase acknowledgment
      setProblemExplorationFeedback(null);
      // Don't set problemExplorationCompleted to true here - keep user in problem exploration phase
      // Only set to completed when they ask a GOOD question
      console.log('✅ Problem exploration feedback acknowledged - user can ask another question');
    }
  };

  // Handle use suggested greeting
  const handleUseSuggestedGreeting = () => {
    if (coachingFeedback?.suggestedRewrite) {
      // Populate the input field with the suggested greeting
      onSuggestedRewrite?.(coachingFeedback.suggestedRewrite);
      // Don't auto-send, just populate the input field
    }
    // Don't move to next phase - let user edit and send manually
    setAwaitingAcknowledgement(false);
    setInputLocked(false);
    setCoachingFeedback(null);
  };

  // Handle use suggested question
  const handleUseSuggestedQuestion = () => {
    if (problemExplorationFeedback?.suggestedRewrite) {
      // Populate the input field with the suggested question
      onSuggestedRewrite?.(problemExplorationFeedback.suggestedRewrite);
      // Don't auto-send, just populate the input field
    }
    // Don't move to next phase - let user edit and send manually
    setAwaitingAcknowledgement(false);
    setInputLocked(false);
    setProblemExplorationFeedback(null);
  };

  // Handle use suggested user question
  const handleUseSuggestedUserQuestion = () => {
    if (coachingFeedback?.suggestedRewrite) {
      // Populate the input field with the suggested question
      onSuggestedRewrite?.(coachingFeedback.suggestedRewrite);
      // Don't auto-send, just populate the input field
    }
    // Don't move to next phase - let user edit and send manually
    setAwaitingAcknowledgement(false);
    setInputLocked(false);
    setCoachingFeedback(null);
  };

  // Expose onUserSubmitted through ref
  const onUserSubmitted = React.useCallback(
    (messageId: string) => {
      console.log('🔄 User submitted message:', messageId);
    },
    []
  );

  React.useImperativeHandle(ref, () => ({
    onUserSubmitted
  }), [onUserSubmitted]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <MessageSquare size={16} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {showStakeholderAnalysis ? 'Stakeholder Analysis' : (showNextPhase ? 'Problem Exploration' : 'Greeting')}
          </h2>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>
              {showStakeholderAnalysis 
                ? `Question ${currentQuestionNumber}/15 (${Math.round((currentQuestionNumber / 15) * 100)}%)`
                : (showNextPhase ? '7%' : (greetingCompleted ? '7%' : '0%'))
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: showStakeholderAnalysis 
                  ? `${Math.round((currentQuestionNumber / 15) * 100)}%`
                  : (showNextPhase ? '7%' : (greetingCompleted ? '7%' : '0%'))
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Warm-up Guidance - Only show during greeting phase */}
        {!greetingCompleted && !coachingFeedback && !showNextPhase && warmUpGuidance && (
          <div className="mb-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb size={20} className="text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-200">
                {warmUpGuidance.title}
              </h3>
            </div>
            <p className="text-sm mb-3 text-blue-700 dark:text-blue-300">
              {warmUpGuidance.description}
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">Why?</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">{warmUpGuidance.why}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">How?</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">{warmUpGuidance.how}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">Examples:</h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  {warmUpGuidance.examples.map((example, index) => (
                    <li key={index} className="pl-2">• {example}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Coaching Feedback */}
        {coachingFeedback && (
          <div className={`mb-4 p-4 rounded-lg border ${
            coachingFeedback.verdict === 'GOOD' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              {coachingFeedback.verdict === 'GOOD' ? (
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
              )}
              <h3 className="font-semibold text-sm">
                {coachingFeedback.verdict === 'GOOD' ? 'Great!' : 'Let\'s refine this'}
              </h3>
            </div>
            <p className="text-sm mb-3">{coachingFeedback.message}</p>
            
            {coachingFeedback.suggestedRewrite && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-amber-200 dark:border-amber-600 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {coachingFeedback.suggestedRewrite}
                </p>
                <button
                  onClick={!greetingCompleted ? handleUseSuggestedGreeting : handleUseSuggestedUserQuestion}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
                >
                  <Copy size={12} />
                  <span>{!greetingCompleted ? 'Use This Greeting' : 'Use This Question'}</span>
                </button>
              </div>
            )}

            {awaitingAcknowledgement && (
              <button
                onClick={handleAcknowledge}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Okay, I understand
              </button>
            )}
          </div>
        )}

        {/* Problem Exploration Feedback */}
        {problemExplorationFeedback && (
          <div className={`mb-4 p-4 rounded-lg border ${
            problemExplorationFeedback.verdict === 'GOOD' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              {problemExplorationFeedback.verdict === 'GOOD' ? (
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
              )}
              <h3 className="font-semibold text-sm">
                {problemExplorationFeedback.verdict === 'GOOD' ? 'Great!' : 'Let\'s refine this'}
              </h3>
            </div>
            <p className="text-sm mb-3">{problemExplorationFeedback.message}</p>
            
            {problemExplorationFeedback.suggestedRewrite && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-amber-200 dark:border-amber-600 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {problemExplorationFeedback.suggestedRewrite}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Consider using this improved question in your next interaction.
                </p>
              </div>
            )}

            {awaitingAcknowledgement && (
              <button
                onClick={handleAcknowledge}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Okay, I understand
              </button>
            )}
          </div>
        )}

                       {/* Greeting Completed Message */}
               {greetingCompleted && !coachingFeedback && !showNextPhase && (
                 <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                   <div className="flex items-center space-x-2 mb-2">
                     <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                     <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">
                       Greeting Complete!
                     </h3>
                   </div>
                   <p className="text-sm text-green-700 dark:text-green-300">
                     Ready to move to the next phase.
                   </p>
                 </div>
               )}

               {/* Next Phase Suggestion */}
               {showNextPhase && !problemExplorationFeedback && !showStakeholderAnalysis && !isAnalyzingStakeholder && (
                 <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                   <div className="flex items-center space-x-2 mb-3">
                     <MessageSquare size={20} className="text-gray-600 dark:text-gray-400" />
                     <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                       Current Question
                     </h3>
                   </div>
                   <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                     <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                       What Problem Are We Trying to Solve?
                     </p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                       Use the guidance below to help you ask this question effectively during project discussions.
                     </p>
                   </div>
                 </div>
               )}

               {/* Problem Exploration Guidance - Show during next phase */}
               {showNextPhase && problemExplorationGuidance && !problemExplorationFeedback && !showStakeholderAnalysis && !isAnalyzingStakeholder && (
                 <div className="mb-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                   <div className="flex items-center space-x-2 mb-3">
                     <Lightbulb size={20} className="text-blue-600 dark:text-blue-400" />
                     <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-200">
                       {problemExplorationGuidance.title}
                     </h3>
                   </div>
                   <p className="text-sm mb-3 text-blue-700 dark:text-blue-300">
                     {problemExplorationGuidance.description}
                   </p>
                   
                   <div className="space-y-3">
                     <div>
                       <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">Why?</h4>
                       <p className="text-xs text-blue-700 dark:text-blue-300">{problemExplorationGuidance.why}</p>
                     </div>
                     
                     <div>
                       <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">How?</h4>
                       <p className="text-xs text-blue-700 dark:text-blue-300">{problemExplorationGuidance.how}</p>
                     </div>
                     
                     <div>
                       <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">Examples:</h4>
                       <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                         {problemExplorationGuidance.examples.map((example, index) => (
                           <li key={index} className="pl-2">• {example}</li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 </div>
               )}

               {/* Loading State - Purple Thinking Dots */}
               {isAnalyzingStakeholder && (
                 <div className="mb-4 p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                   <div className="flex items-center space-x-2 mb-3">
                     <div className="flex space-x-1">
                       <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                       <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                     </div>
                     <h3 className="font-semibold text-sm text-purple-800 dark:text-purple-200">
                       Analyzing stakeholder response...
                     </h3>
                   </div>
                   <p className="text-sm text-purple-700 dark:text-purple-300">
                     Generating the next best question based on their insights.
                   </p>
                 </div>
               )}

               {/* Next Question Suggestion */}
               {showStakeholderAnalysis && stakeholderAnalysis && (
                 <div className="mb-4 p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                   <div className="flex items-center space-x-2 mb-3">
                     <Lightbulb size={20} className="text-green-600 dark:text-green-400" />
                     <h3 className="font-semibold text-sm text-green-800 dark:text-green-200">
                       Next Best Question
                     </h3>
                   </div>
                   
                   <div className="space-y-3">
                     <div>
                       <div className="text-sm text-green-700 dark:text-green-300">
                         {typeof stakeholderAnalysis === 'string' ? (
                           <p>{stakeholderAnalysis}</p>
                         ) : (
                           <div>
                             <div className="text-base font-medium text-gray-900 dark:text-white mb-2">
                               {stakeholderAnalysis.nextQuestion || 'What happened most recently that made this a priority?'}
                             </div>
                             
                             {stakeholderAnalysis.reasoning && (
                               <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                 <strong>Why:</strong> {stakeholderAnalysis.reasoning}
                               </div>
                             )}
                             
                             {stakeholderAnalysis.technique && (
                               <div className="text-xs text-gray-600 dark:text-gray-400">
                                 <strong>Technique:</strong> {stakeholderAnalysis.technique}
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
               )}
      </div>
    </div>
  );
});

export default DynamicCoachingPanel;
