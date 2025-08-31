import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Lightbulb, 
  FileText, 
  CheckSquare,
  ChevronRight,
  Send,
  ThumbsUp,
  Star,
  MessageSquare,
  AlertTriangle,
  Copy,
  CheckCircle
} from 'lucide-react';
import { CoachingSession, getCurrentState, canTransitionToNext, generateSummary } from '../services/coachingStateReducer';
import { coachingStateMachine } from '../data/coachingStates';
import CoachingAnalysisService from '../services/coachingAnalysisService';
import CoachingEvaluatorService from '../services/coachingEvaluatorService';

interface CoachingPanelProps {
  session: CoachingSession;
  onNext: () => void;
  onSendSummary: (summary: string) => void;
  onAddPainPoint: (painPoint: { text: string; who: string; example?: string }) => void;
  onAddSessionNote: (category: string, note: string) => void;
  // Add conversation context for dynamic coaching
  conversationHistory?: Array<{ sender: string; content: string; timestamp: Date }>;
  // Add callback to notify parent about acknowledgement state
  onAcknowledgementStateChange?: (awaitingAcknowledgement: boolean) => void;
}

const CoachingPanel: React.FC<CoachingPanelProps> = ({
  session,
  onNext,
  onSendSummary,
  onAddPainPoint,
  onAddSessionNote,
  conversationHistory = [],
  onAcknowledgementStateChange
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'dig-deeper' | 'interpret' | 'notes' | 'checklist'>('guide');
  const [summaryText, setSummaryText] = useState('');
  const [dynamicFeedback, setDynamicFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'constructive' | 'redirect'>('positive');
  const [aiUsageStats, setAiUsageStats] = useState({ aiCallsUsed: 0, maxAiCalls: 10, remainingCalls: 10 });
  const [greetingHandled, setGreetingHandled] = useState(false);
  const [awaitingAcknowledgement, setAwaitingAcknowledgement] = useState(false);
  const [addressedSuggestions, setAddressedSuggestions] = useState<Set<string>>(new Set());
  
  // New V2 evaluation system state
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [intraStateProgress, setIntraStateProgress] = useState<string[]>([]);
  
  // Feature flag for V2 coaching
  const coachV2 = import.meta.env.VITE_COACH_V2 === '1';

  // Notify parent when acknowledgement state changes
  useEffect(() => {
    onAcknowledgementStateChange?.(awaitingAcknowledgement);
  }, [awaitingAcknowledgement, onAcknowledgementStateChange]);

  const currentState = getCurrentState(session);
  if (!currentState) return null;

  // Initialize coaching analysis service
  const coachingAnalysis = CoachingAnalysisService.getInstance();

  // Analyze the last user question for dynamic coaching and auto-progression
  useEffect(() => {
    const lastUserMessage = conversationHistory
      .filter(msg => msg.sender === 'user')
      .pop();
    
    if (lastUserMessage) {
      evaluateUserMessage(lastUserMessage.content);
    }
  }, [conversationHistory, currentState]);

  // Update AI usage stats
  useEffect(() => {
    setAiUsageStats(coachingAnalysis.getUsageStats());
  }, [dynamicFeedback]);

  // Notify parent about acknowledgement state changes
  useEffect(() => {
    if (onAcknowledgementStateChange) {
      onAcknowledgementStateChange(awaitingAcknowledgement);
    }
  }, [awaitingAcknowledgement, onAcknowledgementStateChange]);

  // Old hybrid system for fallback
  const analyzeUserQuestionWithHybridSystem = async (question: string) => {
    console.log(`🔍 HYBRID ANALYSIS: Analyzing "${question}" in ${session.state} phase`);
    
    // If awaiting acknowledgement, don't process new messages
    if (awaitingAcknowledgement) {
      return;
    }
    
    // Count questions in current phase to prevent overwhelming stakeholders
    const questionsInCurrentPhase = conversationHistory
      .filter(msg => msg.sender === 'user')
      .length;
    
    const maxQuestionsPerPhase = 12; // Learning environment - more questions allowed for practice
    
    if (questionsInCurrentPhase >= maxQuestionsPerPhase) {
      setDynamicFeedback("Great questions! You've covered this phase well. Let's move to the next phase to keep the conversation focused.");
      setFeedbackType('positive');
      setTimeout(() => {
        onNext(); // Auto-progress to next phase
        setDynamicFeedback(null);
      }, 3000);
      return;
    }

    // Prepare context for analysis
    const phaseContext = {
      phase: session.state,
      goal: currentState.goal,
      suggestedQuestions: [
        currentState.cards.guide.prompt,
        ...currentState.cards.dig_deeper.map(q => q.prompt)
      ],
      conversationHistory: conversationHistory
        .filter(msg => msg.sender === 'user')
        .map(msg => msg.content)
    };

    try {
      const analysis = await coachingAnalysis.analyzeUserQuestion(question, phaseContext);
      
      console.log(`✅ HYBRID ANALYSIS: ${analysis.source} analysis - ${analysis.feedbackType} (confidence: ${analysis.confidence})`);
      
      // Set feedback based on analysis type
      setDynamicFeedback(analysis.feedback);
      setFeedbackType(analysis.feedbackType);
      
      // Track if this question addressed any suggested questions
      const currentSuggestions = [
        currentState.cards.guide.prompt,
        ...currentState.cards.dig_deeper.map(q => q.prompt)
      ];
      
      const addressedQuestion = currentSuggestions.find(suggestion => {
        const suggestionLower = suggestion.toLowerCase();
        const questionLower = question.toLowerCase();
        
        // Exact match
        if (suggestionLower === questionLower) return true;
        
        // Semantic match
        const keyConcepts = suggestionLower
          .replace(/[^\w\s]/g, '')
          .split(' ')
          .filter(word => word.length > 3);
        
        return keyConcepts.some(concept => questionLower.includes(concept));
      });
      
      if (addressedQuestion) {
        setAddressedSuggestions(prev => new Set([...prev, addressedQuestion]));
      }
      
      // Handle constructive feedback (like casual greetings) - require acknowledgement
      if (analysis.feedbackType === 'constructive' && session.state === 'warm_up') {
        setAwaitingAcknowledgement(true);
        setGreetingHandled(false);
        // Don't clear feedback - wait for acknowledgement
        return;
      }
      
      // Auto-progress if analysis suggests it and we have enough questions (learning environment)
      if (analysis.shouldProgress && questionsInCurrentPhase >= 6) {
        setTimeout(() => {
          onNext();
          setDynamicFeedback("Excellent progress! Moving to the next phase.");
          setTimeout(() => setDynamicFeedback(null), 3000);
        }, 2000);
      } else {
        // Clear feedback after appropriate time based on type
        const clearTime = analysis.feedbackType === 'constructive' ? 8000 : 5000;
        setTimeout(() => setDynamicFeedback(null), clearTime);
      }
      
    } catch (error) {
      console.error('❌ HYBRID ANALYSIS: Failed:', error);
      setDynamicFeedback("That's an interesting point. Consider using one of the suggested questions to guide the conversation.");
      setFeedbackType('redirect');
      setTimeout(() => setDynamicFeedback(null), 5000);
    }
  };

  const evaluateUserMessage = async (message: string) => {
    console.log(`🔍 V2 EVALUATION: Evaluating "${message}" in ${session.state} phase`);
    
    if (!coachV2) {
      // Fallback to old system if V2 is disabled
      return analyzeUserQuestionWithHybridSystem(message);
    }

    // If awaiting acknowledgement, don't process new messages
    if (awaitingAcknowledgement) {
      return;
    }

    const evaluator = CoachingEvaluatorService.getInstance();
    
    // Get current question to evaluate against
    const currentQuestion = currentQuestionIndex === 0 
      ? currentState.cards.guide.prompt 
      : currentState.cards.dig_deeper[currentQuestionIndex - 1]?.prompt || currentState.cards.guide.prompt;

    // Prepare evaluation context
    const evaluationContext = {
      state: session.state,
      suggested_question: currentQuestion,
      state_goal: currentState.goal,
      learner_message: message,
      context: {
        stakeholders: conversationHistory
          .filter(msg => msg.sender === 'ai')
          .map(msg => msg.stakeholderName || 'stakeholder')
          .filter((name, index, arr) => arr.indexOf(name) === index),
        recent_answers: conversationHistory
          .filter(msg => msg.sender === 'ai')
          .slice(-3)
          .map(msg => msg.content)
      }
    };

    try {
      const result = await evaluator.evaluateMessage(evaluationContext);
      setEvaluationResult(result);
      
      console.log(`✅ V2 EVALUATION: ${result.verdict} verdict - scores:`, result.scores);

      if (result.verdict === 'GOOD') {
        // Enable input, advance to next question or state
        setAwaitingAcknowledgement(false);
        setDynamicFeedback("Great question! Moving forward.");
        setFeedbackType('positive');
        
        // Update intra-state progress
        setIntraStateProgress(prev => [...prev, `✅ ${session.state} question ${currentQuestionIndex + 1}`]);
        
        // Check if we should advance to next question or next state
        if (currentQuestionIndex < currentState.cards.dig_deeper.length) {
          // Move to next question in same state
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // Move to next state
          onNext();
          setCurrentQuestionIndex(0);
          setIntraStateProgress([]);
        }
        
        setTimeout(() => setDynamicFeedback(null), 3000);
        
      } else {
        // AMBER or RED - disable input, show feedback
        setAwaitingAcknowledgement(true);
        setDynamicFeedback(result.reasons.join('. '));
        setFeedbackType(result.verdict === 'RED' ? 'constructive' : 'redirect');
        
        // Keep current question's why/how visible during feedback
        setGreetingHandled(false);
      }
      
    } catch (error) {
      console.error('❌ V2 EVALUATION: Failed:', error);
      setDynamicFeedback("Evaluation failed. Please try again.");
      setFeedbackType('redirect');
      setTimeout(() => setDynamicFeedback(null), 5000);
    }
  };

  const checkForPhaseProgression = (question: string) => {
    const questionLower = question.toLowerCase();
    const currentPhase = session.state;
    
    // Define progression criteria for each phase
    const progressionCriteria = {
      warm_up: {
        keywords: ['hello', 'hi', 'greetings', 'introduce', 'meet', 'purpose', 'goal'],
        minMessages: 2, // Need at least 2 exchanges to move on
        nextPhase: 'problem_exploration'
      },
      problem_exploration: {
        keywords: ['problem', 'issue', 'challenge', 'pain', 'difficulty', 'struggle', 'bottleneck'],
        minPainPoints: 2, // Need at least 2 pain points captured
        nextPhase: 'impact'
      },
      impact: {
        keywords: ['impact', 'effect', 'cost', 'time', 'money', 'frequency', 'how often', 'how much'],
        minImpactData: 1, // Need at least 1 impact quantified
        nextPhase: 'prioritisation'
      },
      prioritisation: {
        keywords: ['priority', 'important', 'urgent', 'critical', 'focus', 'main', 'biggest'],
        hasPriority: true, // Need a priority selected
        nextPhase: 'root_cause'
      },
      root_cause: {
        keywords: ['why', 'cause', 'root', 'underlying', 'reason', 'source'],
        minRootCauses: 1, // Need at least 1 root cause identified
        nextPhase: 'success_criteria'
      },
      success_criteria: {
        keywords: ['success', 'goal', 'outcome', 'measure', 'metric', 'target'],
        minSuccessCriteria: 1, // Need at least 1 success criteria
        nextPhase: 'constraints'
      },
      constraints: {
        keywords: ['constraint', 'limit', 'boundary', 'policy', 'deadline', 'budget'],
        minConstraints: 1, // Need at least 1 constraint identified
        nextPhase: 'wrap_up'
      }
    };

    const criteria = progressionCriteria[currentPhase as keyof typeof progressionCriteria];
    if (!criteria) return;

    // Check if we should progress to next phase
    const hasRelevantKeywords = criteria.keywords.some(keyword => questionLower.includes(keyword));
    const hasEnoughData = checkPhaseCompletion(criteria, session);
    
    if (hasRelevantKeywords && hasEnoughData) {
      // Auto-progress to next phase
      setTimeout(() => {
        onNext();
        setDynamicFeedback(`Great progress! Moving to ${criteria.nextPhase.replace('_', ' ')} phase.`);
        setTimeout(() => setDynamicFeedback(null), 3000);
      }, 2000); // Small delay to let user see the feedback
    }
  };

  const checkPhaseCompletion = (criteria: any, session: CoachingSession): boolean => {
    switch (session.state) {
      case 'warm_up':
        return conversationHistory.filter(msg => msg.sender === 'user').length >= criteria.minMessages;
      case 'problem_exploration':
        return session.data.pain_points.length >= criteria.minPainPoints;
      case 'impact':
        return session.data.impact_notes.length >= criteria.minImpactData;
      case 'prioritisation':
        return criteria.hasPriority && session.data.priority_choice.trim() !== '';
      case 'root_cause':
        return session.data.root_causes.length >= criteria.minRootCauses;
      case 'success_criteria':
        return session.data.success_measures.length >= criteria.minSuccessCriteria;
      case 'constraints':
        return session.data.constraints.length >= criteria.minConstraints;
      default:
        return false;
    }
  };

  const analyzeUserQuestion = (question: string) => {
    const questionLower = question.toLowerCase();
    const currentPhase = session.state;
    
    // Check for casual greetings that need improvement
    const casualGreetings = ['hey guys', 'hey people', 'hey everyone', 'hey team', 'yo', 'what\'s up'];
    const isCasualGreeting = casualGreetings.some(greeting => questionLower.includes(greeting));
    
    if (isCasualGreeting && currentPhase === 'warm_up') {
      // Provide constructive feedback for casual greetings
      setDynamicFeedback("We can make this greeting more professional. Try 'Hello everyone' or 'Good morning team' for a more polished start.");
      
      // Clear feedback after 8 seconds to give more time to read
      setTimeout(() => setDynamicFeedback(null), 8000);
      return; // Don't proceed with other analysis for casual greetings
    }
    
    // Define what makes a "good" question for each phase
    const phaseCriteria = {
      warm_up: {
        goodKeywords: ['hello', 'hi', 'greetings', 'introduce', 'meet', 'purpose', 'goal'],
        feedback: "Great way to start the conversation! You're building rapport and setting the right tone."
      },
      problem_exploration: {
        goodKeywords: ['problem', 'issue', 'challenge', 'pain', 'difficulty', 'struggle', 'bottleneck', 'inefficiency'],
        feedback: "Excellent problem-focused question! You're digging into the core issues stakeholders face."
      },
      impact: {
        goodKeywords: ['impact', 'effect', 'cost', 'time', 'money', 'frequency', 'how often', 'how much', 'consequence'],
        feedback: "Perfect impact question! You're quantifying the business value of solving this problem."
      },
      prioritisation: {
        goodKeywords: ['priority', 'important', 'urgent', 'critical', 'focus', 'main', 'biggest', 'top'],
        feedback: "Smart prioritization question! You're helping stakeholders focus on what matters most."
      },
      root_cause: {
        goodKeywords: ['why', 'cause', 'root', 'underlying', 'reason', 'source', 'origin', 'trigger'],
        feedback: "Excellent root cause analysis! You're getting to the heart of the problem."
      },
      success_criteria: {
        goodKeywords: ['success', 'goal', 'outcome', 'measure', 'metric', 'target', 'achieve', 'improve'],
        feedback: "Great success-focused question! You're defining what good looks like."
      },
      constraints: {
        goodKeywords: ['constraint', 'limit', 'boundary', 'policy', 'deadline', 'budget', 'resource', 'approval'],
        feedback: "Smart constraint question! You're understanding the boundaries and limitations."
      },
      wrap_up: {
        goodKeywords: ['next', 'follow', 'action', 'plan', 'summary', 'recap', 'close'],
        feedback: "Perfect wrap-up question! You're ensuring clear next steps and closure."
      }
    };

    const criteria = phaseCriteria[currentPhase as keyof typeof phaseCriteria];
    if (!criteria) return;

    // Check if the question aligns with the current phase
    const hasGoodKeywords = criteria.goodKeywords.some(keyword => questionLower.includes(keyword));
    
    // Check if it's a suggested question (exact match)
    const isSuggestedQuestion = currentState.cards.guide.prompt.toLowerCase() === questionLower ||
                               currentState.cards.dig_deeper.some(dq => dq.prompt.toLowerCase() === questionLower);

    if (hasGoodKeywords && !isSuggestedQuestion) {
      // This is a good question that wasn't from suggestions - give positive feedback!
      setDynamicFeedback(criteria.feedback);
      
      // Clear feedback after 5 seconds
      setTimeout(() => setDynamicFeedback(null), 5000);
    } else if (isSuggestedQuestion) {
      // They used a suggested question - also good!
      setDynamicFeedback("Great! You're following the coaching framework effectively.");
      setTimeout(() => setDynamicFeedback(null), 3000);
    }
  };

  const tabs = [
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'dig-deeper', label: 'Dig Deeper', icon: Search },
    { id: 'interpret', label: 'Interpret', icon: Lightbulb },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare }
  ] as const;

  const renderGuideTab = () => (
    <div className="space-y-4">
      {/* Dynamic Coaching Feedback */}
      {dynamicFeedback && (
        <div className={`rounded-lg p-4 animate-pulse ${
          feedbackType === 'constructive' 
            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700'
            : feedbackType === 'positive'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                feedbackType === 'constructive'
                  ? 'bg-amber-100 dark:bg-amber-800'
                  : feedbackType === 'positive'
                  ? 'bg-green-100 dark:bg-green-800'
                  : 'bg-blue-100 dark:bg-blue-800'
              }`}>
                {feedbackType === 'constructive' ? (
                  <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                ) : feedbackType === 'positive' ? (
                  <ThumbsUp size={16} className="text-green-600 dark:text-green-400" />
                ) : (
                  <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-medium mb-1 ${
                feedbackType === 'constructive'
                  ? 'text-amber-900 dark:text-amber-100'
                  : feedbackType === 'positive'
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-blue-900 dark:text-blue-100'
              }`}>
                {feedbackType === 'constructive' ? 'We Can Improve This! 💡' : 
                 feedbackType === 'positive' ? 'Great Question! 🌟' : 
                 'Coaching Tip 💭'}
              </h4>
              <p className={`text-sm ${
                feedbackType === 'constructive'
                  ? 'text-amber-800 dark:text-amber-200'
                  : feedbackType === 'positive'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}>
                {dynamicFeedback}
              </p>
              
              {/* V2 Evaluation Feedback */}
              {evaluationResult && awaitingAcknowledgement && (
                <div className="mt-4 space-y-3">
                  {/* Reasons and Fixes */}
                  {evaluationResult.reasons.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">What to fix:</h5>
                      <ul className="space-y-1">
                        {evaluationResult.reasons.map((reason: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {evaluationResult.fixes.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">How to improve:</h5>
                      <ul className="space-y-1">
                        {evaluationResult.fixes.map((fix: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {fix}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Suggested Rewrite */}
                  {evaluationResult.suggested_rewrite && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Suggested rewrite:</h5>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{evaluationResult.suggested_rewrite}</p>
                        <button
                          onClick={() => {
                            // This will be handled by parent component
                            if (onAcknowledgementStateChange) {
                              onAcknowledgementStateChange(false);
                            }
                            setAwaitingAcknowledgement(false);
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
                        >
                          <Copy size={12} />
                          <span>Use Suggested Rewrite</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Quick chips for greetings */}
                  {session.state === 'warm_up' && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Quick options:</h5>
                      <div className="flex flex-wrap gap-2">
                        {[
                          `Hello ${conversationHistory.find(msg => msg.sender === 'ai')?.stakeholderName?.split(' ')[0] || 'there'}, thanks for your time today...`,
                          `Good afternoon ${conversationHistory.find(msg => msg.sender === 'ai')?.stakeholderName?.split(' ')[0] || 'there'}—appreciate you meeting with me...`
                        ].map((chip, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (onAcknowledgementStateChange) {
                                onAcknowledgementStateChange(false);
                              }
                              setAwaitingAcknowledgement(false);
                            }}
                            className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded border transition-colors"
                          >
                            {chip.substring(0, 30)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Okay button */}
                  <button
                    onClick={() => {
                      setAwaitingAcknowledgement(false);
                      setEvaluationResult(null);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Okay, I understand
                  </button>
                </div>
              )}
              
              {/* Legacy Okay button for constructive feedback */}
              {!evaluationResult && feedbackType === 'constructive' && awaitingAcknowledgement && (
                <button
                  onClick={() => {
                    setAwaitingAcknowledgement(false);
                    setGreetingHandled(true);
                    // Immediately progress to next phase - no delay
                    onNext();
                    setDynamicFeedback("Got it! Moving to the next phase.");
                    setFeedbackType('redirect');
                    setTimeout(() => {
                      setDynamicFeedback(null);
                      // Show next coaching suggestion after phase transition
                      setTimeout(() => {
                        if (currentState.cards.dig_deeper.length > 0) {
                          const nextSuggestion = currentState.cards.dig_deeper[0];
                          setDynamicFeedback(`Next Question: "${nextSuggestion.prompt}"`);
                          setFeedbackType('redirect');
                          // Keep the suggestion visible much longer so users can remember it
                          setTimeout(() => setDynamicFeedback(null), 12000); // 12 seconds
                        }
                      }, 1000);
                    }, 2000);
                  }}
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Okay, I understand
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {currentState.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {currentState.goal}
        </p>
        
        {!greetingHandled && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Primary Question</h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">{currentState.cards.guide.prompt}</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Why this matters</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{currentState.cards.guide.why}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">How to ask</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{currentState.cards.guide.how}</p>
          </div>
        </div>
        
        {/* Intra-state progress badges */}
        {coachV2 && intraStateProgress.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Progress in this phase:</h4>
            <div className="flex flex-wrap gap-2">
              {intraStateProgress.map((progress, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle size={12} className="mr-1" />
                  {progress}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summarize So Far Feature - Only show when there's content to summarize */}
      {session.state !== 'warm_up' && session.data.pain_points.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Summarize So Far</h4>
          <textarea
            value={summaryText || generateSummary(session)}
            onChange={(e) => setSummaryText(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows={4}
            placeholder="Summarize what you've learned so far..."
          />
          <button
            onClick={() => onSendSummary(summaryText || generateSummary(session))}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
          >
            <Send size={16} />
            <span>Confirm & Send</span>
          </button>
        </div>
      )}


    </div>
  );

  const renderDigDeeperTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Follow-up Questions</h3>
        <div className="space-y-3">
          {currentState.cards.dig_deeper
            .filter(question => !addressedSuggestions.has(question.prompt))
            .map((question, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-900 dark:text-white mb-2">{question.prompt}</p>
              {question.when.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  When: {question.when.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInterpretTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What to Look For</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-green-700 dark:text-green-300 text-sm mb-2">Good Signs</h4>
            <ul className="space-y-1">
              {currentState.cards.interpret.good_signs.map((sign, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {sign}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-red-700 dark:text-red-300 text-sm mb-2">Warning Signs</h4>
            <ul className="space-y-1">
              {currentState.cards.interpret.warning_signs.map((sign, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="text-red-500 mr-2">⚠</span>
                  {sign}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300 text-sm mb-2">Listen For</h4>
            <ul className="space-y-1">
              {currentState.cards.interpret.what_to_listen_for.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="text-blue-500 mr-2">👂</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Session Notes</h3>
        
        <div className="space-y-4">
          {currentState.cards.notes_template.map((template, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {template}
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={2}
                placeholder={`Add ${template.toLowerCase()}...`}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    onAddSessionNote('session_notes', `${template} ${e.target.value}`);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChecklistTab = () => (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Phase Checklist</h3>
        
        <div className="space-y-3">
          {Object.entries(coachingStateMachine.states).map(([stateId, state]) => (
            <div key={stateId} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                session.completedStates.includes(stateId)
                  ? 'bg-green-500 border-green-500'
                  : session.state === stateId
                  ? 'border-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {session.completedStates.includes(stateId) && (
                  <span className="text-white text-xs">✓</span>
                )}
                {session.state === stateId && !session.completedStates.includes(stateId) && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              <span className={`text-sm ${
                session.completedStates.includes(stateId)
                  ? 'text-green-700 dark:text-green-300 line-through'
                  : session.state === stateId
                  ? 'text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {(state as any).title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pain Points Board */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Pain Points Board</h3>
        
        {session.data.pain_points.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No pain points captured yet.</p>
        ) : (
          <div className="space-y-3">
            {session.data.pain_points.map((painPoint, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">{painPoint.text}</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">Affects: {painPoint.who}</p>
                {painPoint.example && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Example: {painPoint.example}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'guide':
        return renderGuideTab();
      case 'dig-deeper':
        return renderDigDeeperTab();
      case 'interpret':
        return renderInterpretTab();
      case 'notes':
        return renderNotesTab();
      case 'checklist':
        return renderChecklistTab();
      default:
        return renderGuideTab();
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Coaching Panel</h2>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{session.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${session.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CoachingPanel;
