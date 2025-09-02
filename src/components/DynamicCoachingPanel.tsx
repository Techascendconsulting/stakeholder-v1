import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MessageSquare, CheckCircle, AlertTriangle, Copy, Lightbulb } from 'lucide-react';
import GreetingCoachingService from '../services/greetingCoachingService';
import ProblemExplorationService from '../services/problemExplorationService';
import StakeholderResponseAnalysisService from '../services/stakeholderResponseAnalysisService';
import AsIsProcessService from '../services/asIsProcessService';

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

type AsIsProcessGuidance = {
  title: string;
  description: string;
  why: string;
  how: string;
  examples: string[];
};

type AsIsProcessEvaluation = {
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
  sessionStage?: string;
  onAcknowledgementStateChange?: (awaitingAcknowledgement: boolean) => void;
  onSuggestedRewrite?: (rewrite: string) => void;
  onSubmitMessage?: (message: string) => void;
  onPopulateInput?: (message: string) => void;
  onSessionComplete?: () => void;
}

const DynamicCoachingPanel = React.forwardRef<{ onUserSubmitted: (messageId: string) => void }, DynamicCoachingPanelProps>(({
  projectName,
  conversationHistory,
  sessionStage,
  onAcknowledgementStateChange,
  onSuggestedRewrite,
  onSubmitMessage,
  onSessionComplete,
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
  const [asIsProcessGuidance, setAsIsProcessGuidance] = useState<AsIsProcessGuidance | null>(null);
  const [asIsProcessFeedback, setAsIsProcessFeedback] = useState<AsIsProcessEvaluation | null>(null);
  const [asIsProcessCompleted, setAsIsProcessCompleted] = useState(false);
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

  // Normalize stage and derive guidance
  const stage = (sessionStage ?? '').toLowerCase().replace(/\s+/g, '_').trim();
  
  const guidance = useMemo(() => {
    switch (stage) {
      case 'as_is': return asIsProcessGuidance;
      case 'problem_exploration': return problemExplorationGuidance;
      default: return null;
    }
  }, [stage, asIsProcessGuidance, problemExplorationGuidance]);

  // Load guidance based on stage
  useEffect(() => {
    const loadGuidance = async () => {
      try {
        switch (stage) {
          case 'as_is':
            if (!asIsProcessGuidance) {
              const guidance = await AsIsProcessService.getInstance().getAsIsProcessGuidance();
              setAsIsProcessGuidance(guidance);
            }
            break;
          case 'problem_exploration':
            if (!problemExplorationGuidance) {
              const guidance = await ProblemExplorationService.getInstance().getProblemExplorationGuidance();
              setProblemExplorationGuidance(guidance);
            }
            break;
        }
      } catch (error) {
        console.error('Failed to load guidance:', error);
      }
    };
    loadGuidance();
  }, [stage, asIsProcessGuidance, problemExplorationGuidance]);

  // Reset showNextPhase when entering As-Is stage
  useEffect(() => {
    if (stage === 'as_is') {
      setShowNextPhase(false);
    }
  }, [stage]);

  // Debug logging
  useEffect(() => {
    console.log('[Panel] stage:', stage, 'showNextPhase:', showNextPhase, 'guidance:', guidance?.title);
  }, [stage, showNextPhase, guidance]);



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
  const shouldAnalyze = isNewStakeholderMessage && (
    (stage === 'problem_exploration' && nextPhase && probDone) ||
    (stage === 'as_is' && asIsProcessCompleted)
  );

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
        } else if (showNextPhase && !problemExplorationCompleted && sessionStage !== 'as_is') {
          // In problem exploration phase
          console.log('🔍 EVALUATING PROBLEM EXPLORATION');
          evaluateProblemExplorationQuestion(lastMessage.content);
        } else if (sessionStage === 'as_is' && !asIsProcessCompleted && asIsProcessGuidance) {
          // In As-Is process mapping phase
          console.log('🔍 EVALUATING AS-IS PROCESS MAPPING');
          evaluateAsIsProcessQuestion(lastMessage.content);
        } else if (asIsProcessCompleted && showStakeholderAnalysis) {
          // Evaluate user questions in stakeholder analysis phase
          console.log('🔍 EVALUATING USER QUESTION');
          evaluateUserQuestion(lastMessage.content);
        }
      }
    }
  }, [conversationHistory, greetingCompleted, showNextPhase, problemExplorationCompleted, asIsProcessCompleted, asIsProcessGuidance, showStakeholderAnalysis, isEvaluating]);

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
        // Extract previous questions to avoid repetition
        const previousQuestions = conversationHistory
          .filter(msg => msg.sender === 'user' && msg.content.length > 10)
          .map(msg => ({ question: msg.content }))
          .slice(-5); // Last 5 questions

        const res = await fetch('/api/analyzeStakeholder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            transcript: lastMessage?.content ?? '', 
            context: { nextPhase, probDone, projectName },
            conversationHistory: previousQuestions
          }),
          signal: ac.signal,
        });

        console.log('[DC] <- response', { status: res.status });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`${res.status} ${data?.error ?? 'Unknown error'}`);

        // Check if this is the final question (20/20)
        const nextQuestionNumber = Math.min(currentQuestionNumber + 1, 20);
        setCurrentQuestionNumber(nextQuestionNumber);
        
        if (nextQuestionNumber === 20) {
          // Force wrap-up question for the final question
          const wrapUpAnalysis = {
            nextQuestion: "Looking ahead, what changes would make the biggest difference for your team's success?",
            reasoning: "This wrap-up question helps summarize key insights and identify priority areas for improvement.",
            technique: "Summary & Prioritization"
          };
          setStakeholderAnalysis(wrapUpAnalysis);
          
          // Auto-end session after a delay to allow user to see the final question
          setTimeout(() => {
            console.log('🎯 Auto-ending session after 20 questions');
            onSessionComplete?.();
          }, 5000); // 5 second delay
        } else {
          setStakeholderAnalysis(data.analysis);
        }
        
        setShowStakeholderAnalysis(true);
        setIsAnalyzingStakeholder(false);
        setLastAnalyzedMessageId(lastMessage?.id || null);
        console.log('[DC] done - Question', nextQuestionNumber);
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
          if (stage === 'as_is') {
            // In As-Is stage, don't show next phase, just complete greeting
            setCoachingFeedback(null);
          } else {
            // In other stages, show next phase and load problem exploration guidance
            setShowNextPhase(true);
            setCoachingFeedback(null);
            // Load problem exploration guidance only for problem_exploration stage
            if (stage === 'problem_exploration') {
              try {
                const guidance = await ProblemExplorationService.getInstance().getProblemExplorationGuidance();
                setProblemExplorationGuidance(guidance);
              } catch (error) {
                console.error('Failed to load problem exploration guidance:', error);
              }
            }
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
          
          // Load As-Is process guidance for the next phase
          const loadAsIsGuidance = async () => {
            try {
              const guidance = await AsIsProcessService.getInstance().getAsIsProcessGuidance();
              setAsIsProcessGuidance(guidance);
            } catch (error) {
              console.error('Failed to load As-Is process guidance:', error);
            }
          };
          loadAsIsGuidance();
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

  // Evaluate As-Is process mapping questions
  const evaluateAsIsProcessQuestion = async (message: string) => {
    console.log('🔍 Evaluating As-Is process question:', message);
    setIsEvaluating(true);

    try {
      const evaluation = await AsIsProcessService.getInstance().evaluateAsIsProcessQuestion(message);
      
      if (evaluation.verdict === 'GOOD') {
        setAsIsProcessFeedback({
          verdict: 'GOOD',
          message: evaluation.message,
          reasoning: evaluation.reasoning,
          technique: evaluation.technique
        });
        setAsIsProcessCompleted(true);
        setInputLocked(false);
        
        // Show success briefly, then move to next phase
        setTimeout(() => {
          setAsIsProcessFeedback(null);
          console.log('✅ As-Is process mapping completed - ready for stakeholder analysis');
        }, 2000);
      } else {
        setAsIsProcessFeedback({
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
      console.error('As-Is process evaluation failed:', error);
      // Fallback evaluation
      const isProcessMapping = /(walk.*through|step.*step|process.*work|how.*work|current.*process|who.*what|systems|tools)/i.test(message);
      const isAsIs = /(today|current|now|existing|present)/i.test(message);
      
      if (isProcessMapping && isAsIs) {
        setAsIsProcessFeedback({
          verdict: 'GOOD',
          message: "Excellent process mapping question!",
          reasoning: "This question effectively asks for a step-by-step walkthrough of the current process.",
          technique: "Process Mapping"
        });
        setAsIsProcessCompleted(true);
      } else {
        setAsIsProcessFeedback({
          verdict: 'AMBER',
          message: "Let's refine this to focus more on the current process mapping.",
          suggestedRewrite: "From your perspective, can you walk me through how this process works today, from the moment it starts to the final outcome? Who does what, using which systems?",
          reasoning: "The question could be more specific about mapping the current process step-by-step.",
          technique: "Process Mapping"
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
      // Enhanced evaluation logic for user questions
      const isRelevant = /(problem|challenge|issue|pain|difficulty|process|system|workflow|performance|management|review|feedback|goal|tracking|continuous|annual|evaluation|objective|data|driven|administrative|burden|time|consuming|manual|outdated|subjective)/i.test(message);
      const isOpenEnded = /(what|how|why|when|where|describe|explain|tell|can you|could you)/i.test(message);
      const isClarifying = /(do we|do you|are there|is there|have we|have you|does it|does this|are these|is this)/i.test(message);
      const isSystemRelated = /(system|systems|platform|software|tool|tools|integration|connected|automation|manual|email|form|document|database)/i.test(message);
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
      } else if ((isRelevant && isOpenEnded) || isClarifying || isSystemRelated) {
        setCoachingFeedback({
          verdict: 'GOOD',
          message: "Excellent question! This will help us understand the current state and identify specific issues.",
          reasoning: "The question is relevant and will reveal important information about systems, processes, or current capabilities.",
          technique: isClarifying ? "Clarification" : isSystemRelated ? "System Analysis" : "Probing"
        });
        // Don't lock input - let stakeholder respond
        setInputLocked(false);
        // Increment question counter for user's own question
        setCurrentQuestionNumber(prev => Math.min(prev + 1, 20));
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
            {showStakeholderAnalysis ? 'Stakeholder Analysis' : 
             (stage === 'as_is') ? 'As-Is Process Mapping' :
             (stage === 'problem_exploration') ? 'Problem Exploration' : 'Greeting'}
          </h2>
        </div>
        <div className="mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Project: <span className="font-medium text-gray-800 dark:text-gray-200">{projectName}</span>
          </p>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>
              {showStakeholderAnalysis 
                ? `Question ${currentQuestionNumber}/20 (${Math.round((currentQuestionNumber / 20) * 100)}%)`
                : (sessionStage === 'as_is') ? '13%'
                : (showNextPhase ? '7%' : (greetingCompleted ? '7%' : '0%'))
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: showStakeholderAnalysis 
                  ? `${Math.round((currentQuestionNumber / 20) * 100)}%`
                  : (sessionStage === 'as_is') ? '13%'
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

        {/* As-Is Process Feedback */}
        {asIsProcessFeedback && (
          <div className={`mb-4 p-4 rounded-lg border ${
            asIsProcessFeedback.verdict === 'GOOD' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              {asIsProcessFeedback.verdict === 'GOOD' ? (
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
              )}
              <h3 className="font-semibold text-sm">
                {asIsProcessFeedback.verdict === 'GOOD' ? 'Great!' : 'Let\'s refine this'}
              </h3>
            </div>
            <p className="text-sm mb-3">{asIsProcessFeedback.message}</p>
            
            {asIsProcessFeedback.suggestedRewrite && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-amber-200 dark:border-amber-600 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {asIsProcessFeedback.suggestedRewrite}
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
               {showNextPhase && sessionStage !== 'as_is' && !problemExplorationFeedback && !showStakeholderAnalysis && !isAnalyzingStakeholder && currentQuestionNumber === 1 && (
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

               {/* As-Is Process Question */}
               {(problemExplorationCompleted || (sessionStage === 'as_is' && greetingCompleted)) && !asIsProcessFeedback && !showStakeholderAnalysis && !isAnalyzingStakeholder && currentQuestionNumber === 1 && (
                 <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                   <div className="flex items-center space-x-2 mb-3">
                     <MessageSquare size={20} className="text-blue-600 dark:text-blue-400" />
                     <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-200">
                       Current Question
                     </h3>
                   </div>
                   <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
                     <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                       From your perspective, can you walk me through how this process works today, from the moment it starts to the final outcome? Who does what, using which systems?
                     </p>
                     <p className="text-xs text-blue-600 dark:text-blue-400">
                       Use the guidance below to help you ask this question effectively during process mapping discussions.
                     </p>
                   </div>
                 </div>
               )}

               {/* Stage-based Guidance Rendering */}
               {stage === 'problem_exploration' && showNextPhase && guidance && !problemExplorationFeedback && !showStakeholderAnalysis && !isAnalyzingStakeholder && currentQuestionNumber === 1 && (
                 <div className="mb-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                   <div className="flex items-center space-x-2 mb-3">
                     <Lightbulb size={20} className="text-blue-600 dark:text-blue-400" />
                     <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-200">
                       {guidance.title}
                     </h3>
                   </div>
                   <p className="text-sm mb-3 text-blue-700 dark:text-blue-300">
                     {guidance.description}
                   </p>
                   
                   <div className="space-y-3">
                     <div>
                       <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">Why?</h4>
                       <p className="text-xs text-blue-700 dark:text-blue-300">{guidance.why}</p>
                     </div>
                     
                     <div>
                       <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">How?</h4>
                       <p className="text-xs text-blue-700 dark:text-blue-300">{guidance.how}</p>
                     </div>
                     
                     <div>
                       <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">Examples:</h4>
                       <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                         {guidance.examples.map((example, index) => (
                           <li key={index} className="pl-2">• {example}</li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 </div>
               )}

               {/* As-Is Process Mapping Guidance - Show only after greeting is completed */}
               {stage === 'as_is' && guidance && greetingCompleted && !asIsProcessFeedback && !showStakeholderAnalysis && !isAnalyzingStakeholder && currentQuestionNumber === 1 && (
                 <div className="mb-4 p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                   <div className="flex items-center space-x-2 mb-3">
                     <Lightbulb size={20} className="text-blue-600 dark:text-blue-400" />
                     <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-200">
                       {guidance.title}
                     </h3>
                   </div>
                   <p className="text-sm mb-3 text-blue-700 dark:text-blue-300">
                     {guidance.description}
                   </p>
                   
                   <div className="space-y-3">
                     <div>
                       <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">Why?</h4>
                       <p className="text-xs text-blue-700 dark:text-blue-300">{guidance.why}</p>
                     </div>
                     
                     <div>
                       <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">How?</h4>
                       <p className="text-xs text-blue-700 dark:text-blue-300">{guidance.how}</p>
                     </div>
                     
                     <div>
                       <h4 className="font-medium text-xs text-blue-800 dark:text-blue-200 mb-1">Examples:</h4>
                       <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                         {guidance.examples.map((example, index) => (
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
