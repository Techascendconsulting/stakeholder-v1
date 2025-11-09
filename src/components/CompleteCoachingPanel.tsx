import React, { useState, useEffect } from 'react';
import { 
  CheckCircle,
  AlertTriangle,
  Copy,
  Send,
  MessageSquare,
  Target,
  TrendingUp,
  CheckSquare
} from 'lucide-react';
import { coachingEvaluatorService } from '../services/coachingEvaluatorService';
import { 
  getCurrentQuestion, 
  getTotalQuestions,
  getProjectQuestions,
  InterviewQuestion
} from '../data/completeInterviewQuestions';

interface CompleteCoachingPanelProps {
  projectName: string;
  conversationHistory: Array<{ sender: string; content: string; timestamp: Date; stakeholderName?: string }>;
  onAcknowledgementStateChange?: (awaitingAcknowledgement: boolean) => void;
  onSuggestedRewrite?: (rewrite: string) => void;
  onSubmitMessage?: (message: string) => void;
}

interface EvaluationResult {
  scores: {
    intent_match: number;
    question_quality: number;
    professionalism: number;
    state_alignment: number;
  };
  verdict: 'GOOD' | 'AMBER' | 'RED' | 'OOS' | 'MISALIGNED';
  reasons: string[];
  fixes: string[];
  suggested_rewrite: string;
}

const CompleteCoachingPanel: React.FC<CompleteCoachingPanelProps> = ({
  projectName,
  conversationHistory,
  onAcknowledgementStateChange,
  onSuggestedRewrite,
  onSubmitMessage
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [awaitingAcknowledgement, setAwaitingAcknowledgement] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [inputLocked, setInputLocked] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastEvaluatedMessageIndex, setLastEvaluatedMessageIndex] = useState(-1);
  const [lastEvaluatedMessage, setLastEvaluatedMessage] = useState<string>('');
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const evaluator = coachingEvaluatorService;

  // Get current question
  const currentQuestion = getCurrentQuestion(projectName, currentQuestionIndex);
  const totalQuestions = getTotalQuestions(projectName);
  
  // Update current question ID when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.id !== currentQuestionId) {
      console.log('🔄 CompleteCoachingPanel: Question changed from', currentQuestionId, 'to', currentQuestion.id);
      setCurrentQuestionId(currentQuestion.id);
      setLastEvaluatedMessage(''); // Reset evaluation state for new question
    }
  }, [currentQuestion, currentQuestionId]);
  
  // Enhanced debug logging
  console.log('🔍 CompleteCoachingPanel Debug:', {
    projectName,
    currentQuestionIndex,
    currentQuestion: currentQuestion?.question?.substring(0, 50) + '...',
    totalQuestions,
    conversationHistoryLength: conversationHistory.length,
    lastUserMessage: conversationHistory.filter(msg => msg.sender === 'user').pop()?.content,
    awaitingAcknowledgement,
    inputLocked,
    evaluationResult: evaluationResult ? {
      verdict: evaluationResult.verdict,
      hasReasons: evaluationResult.reasons.length > 0,
      hasFixes: evaluationResult.fixes.length > 0,
      hasRewrite: !!evaluationResult.suggested_rewrite
    } : null,
    successMessage
  });

  // Calculate progress
  useEffect(() => {
    const completed = completedQuestions.size;
    setProgress(Math.round((completed / totalQuestions) * 100));
  }, [completedQuestions, totalQuestions]);

  // Notify parent about acknowledgement state
  useEffect(() => {
    console.log('🔄 CompleteCoachingPanel: Acknowledgement state changed to:', awaitingAcknowledgement);
    if (onAcknowledgementStateChange) {
      onAcknowledgementStateChange(awaitingAcknowledgement);
    }
  }, [awaitingAcknowledgement, onAcknowledgementStateChange]);

  // Track the last evaluated message to avoid re-evaluating

  // Evaluate user messages when they are added to conversation
  useEffect(() => {
    const lastUserMessage = conversationHistory
      .filter(msg => msg.sender === 'user')
      .pop();
    
    console.log('🔍 CompleteCoachingPanel: Checking for evaluation:', {
      hasLastUserMessage: !!lastUserMessage,
      lastUserMessageContent: lastUserMessage?.content,
      lastEvaluatedMessage,
      hasCurrentQuestion: !!currentQuestion,
      awaitingAcknowledgement,
      inputLocked,
      evaluationResultExists: !!evaluationResult
    });
    
    // Only evaluate if:
    // 1. There's a user message
    // 2. It's different from the last evaluated message
    // 3. We have a current question
    // 4. We're not awaiting acknowledgement
    // 5. Input is not locked
    // 6. The current question hasn't changed (to avoid re-evaluating old messages)
    // 7. The content is not auto-filled
    if (lastUserMessage && 
        lastUserMessage.content !== lastEvaluatedMessage && 
        currentQuestion && 
        !awaitingAcknowledgement && 
        !inputLocked &&
        currentQuestion.id === currentQuestionId &&
        !isAutoFilled) {
      console.log('🚀 CompleteCoachingPanel: Starting evaluation for:', lastUserMessage.content);
      setLastEvaluatedMessage(lastUserMessage.content);
      evaluateMessage(lastUserMessage.content);
    } else {
      console.log('⏸️ CompleteCoachingPanel: Skipping evaluation - conditions not met, question changed, or auto-filled content');
    }
  }, [conversationHistory, currentQuestion, awaitingAcknowledgement, inputLocked, lastEvaluatedMessage]);

  const getPhaseTitle = (questionType: string): string => {
    switch (questionType) {
      case 'warmup': return 'Warm-up';
      case 'problem': return 'Problem Exploration';
      case 'dig_deeper': return 'Dig Deeper';
      case 'impact': return 'Impact Assessment';
      case 'wrapup': return 'Wrap-up';
      default: return 'Interview';
    }
  };

  const getPhaseIcon = (questionType: string) => {
    switch (questionType) {
      case 'warmup': return <MessageSquare size={16} />;
      case 'problem': return <Target size={16} />;
      case 'dig_deeper': return <TrendingUp size={16} />;
      case 'impact': return <CheckSquare size={16} />;
      case 'wrapup': return <CheckCircle size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const evaluateMessage = async (message: string) => {
    if (!currentQuestion) {
      console.log('❌ CompleteCoachingPanel: No current question available for evaluation');
      return;
    }

    console.log('🎯 CompleteCoachingPanel: Evaluating message:', {
      message,
      currentQuestionType: currentQuestion.type,
      currentQuestionText: currentQuestion.question
    });

    try {
      const context = {
        state: currentQuestion.type,
        suggested_question: currentQuestion.question,
        state_goal: `Complete ${getPhaseTitle(currentQuestion.type)} phase successfully.`,
        learner_message: message,
        context: {
          stakeholders: conversationHistory
            .filter(msg => msg.sender === 'ai')
            .map(msg => msg.stakeholderName || 'stakeholder')
            .filter((name, index, arr) => arr.indexOf(name) === index),
          recent_answers: conversationHistory
            .filter(msg => msg.sender === 'ai')
            .slice(-3)
            .map(msg => msg.content),
          project: projectName
        }
      };

      console.log('📤 CompleteCoachingPanel: Sending to evaluator:', context);
      const result = await evaluator.evaluateMessage(context);
      console.log('📥 CompleteCoachingPanel: Received evaluation result:', {
        verdict: result.verdict,
        scores: result.scores,
        reasonsCount: result.reasons.length,
        fixesCount: result.fixes.length,
        hasRewrite: !!result.suggested_rewrite
      });

      setEvaluationResult(result);

      // Handle different verdicts
      switch (result.verdict) {
        case 'GOOD':
          console.log('✅ CompleteCoachingPanel: GOOD verdict - showing success message');
          // Show success message and advance
          setSuccessMessage("Great — that's a well-structured, open question.");
          setTimeout(() => {
            console.log('⏰ CompleteCoachingPanel: Success message timeout - advancing');
            setSuccessMessage(null);
            markQuestionComplete();
            advanceToNextQuestion();
          }, 4000); // Increased from 2000ms to 4000ms for better visibility
          break;

        case 'AMBER':
        case 'OOS':
        case 'MISALIGNED':
          console.log('🟡 CompleteCoachingPanel: AMBER/OOS/MISALIGNED verdict - showing coaching panel');
          // Show coaching panel and lock input
          setAwaitingAcknowledgement(true);
          setInputLocked(true);
          break;

        default:
          console.log('🔴 CompleteCoachingPanel: RED verdict - treating as AMBER');
          // Handle RED as AMBER
          setAwaitingAcknowledgement(true);
          setInputLocked(true);
          break;
      }
    } catch (error) {
      console.error('❌ CompleteCoachingPanel: Evaluation failed:', error);
    }
  };

  const markQuestionComplete = () => {
    if (currentQuestion) {
      console.log('✅ CompleteCoachingPanel: Marking question complete:', currentQuestion.id);
      setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
    }
  };

  const advanceToNextQuestion = () => {
    const projectQuestions = getProjectQuestions(projectName);
    
    console.log('➡️ CompleteCoachingPanel: Advancing to next question:', {
      currentIndex: currentQuestionIndex,
      totalQuestions: projectQuestions.length
    });
    
    // Check if there are more questions
    if (currentQuestionIndex < projectQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Reset evaluation state for new question
      setEvaluationResult(null);
      setAwaitingAcknowledgement(false);
      setInputLocked(false);
      setSuccessMessage(null);
      setLastEvaluatedMessage('');
    } else {
      // Interview complete
      console.log('🎉 CompleteCoachingPanel: Interview completed!');
    }
  };

  const handleOkayClick = () => {
    console.log('👌 CompleteCoachingPanel: Okay clicked - clearing feedback and advancing');
    setAwaitingAcknowledgement(false);
    setEvaluationResult(null);
    setInputLocked(false);
    setLastEvaluatedMessage(''); // Reset to allow evaluation of new messages
    markQuestionComplete();
    advanceToNextQuestion();
  };

  const handleUseSuggestedRewrite = () => {
    console.log('📝 CompleteCoachingPanel: Using suggested rewrite');
    if (evaluationResult?.suggested_rewrite && onSuggestedRewrite) {
      onSuggestedRewrite(evaluationResult.suggested_rewrite);
      // Mark this as auto-filled to prevent immediate evaluation
      setLastEvaluatedMessage(evaluationResult.suggested_rewrite);
      // Set a flag to skip evaluation of this auto-filled content
      setIsAutoFilled(true);
    }
    setAwaitingAcknowledgement(false);
    setEvaluationResult(null);
    setInputLocked(false);
  };

  const handleSubmitMessage = (message: string) => {
    console.log('📤 CompleteCoachingPanel: Submit message called:', message);
    if (!message.trim() || !currentQuestion) return;
    
    // Reset auto-filled flag when user actually submits
    setIsAutoFilled(false);
    
    if (onSubmitMessage) {
      onSubmitMessage(message);
    }
    evaluateMessage(message);
  };

  if (!currentQuestion) {
    console.log('❌ CompleteCoachingPanel: No current question - showing completion state');
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Interview Coaching</h2>
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Interview completed! 🎉
          </div>
        </div>
      </div>
    );
  }

  const getVerdictUI = () => {
    console.log('🎨 CompleteCoachingPanel: Rendering verdict UI:', {
      hasEvaluationResult: !!evaluationResult,
      verdict: evaluationResult?.verdict,
      awaitingAcknowledgement
    });

    if (!evaluationResult) {
      console.log('❌ CompleteCoachingPanel: No evaluation result to display');
      return null;
    }

    switch (evaluationResult.verdict) {
      case 'GOOD':
        console.log('✅ CompleteCoachingPanel: GOOD verdict - no UI needed (handled by success message)');
        return null; // Handled by success message

      case 'AMBER':
        console.log('🟡 CompleteCoachingPanel: Rendering AMBER feedback UI');
        return (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3 text-amber-800 dark:text-amber-200">
              <AlertTriangle size={20} />
              <h3 className="font-semibold">Let's refine this question</h3>
            </div>

            {/* Reasons */}
            {evaluationResult.reasons.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">Feedback:</h4>
                <ul className="space-y-1">
                  {evaluationResult.reasons.map((reason, index) => (
                    <li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fixes */}
            {evaluationResult.fixes.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">How to improve:</h4>
                <ul className="space-y-1">
                  {evaluationResult.fixes.map((fix, index) => (
                    <li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Rewrite */}
            {evaluationResult.suggested_rewrite && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">Suggested rewrite:</h4>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-amber-200 dark:border-amber-600">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{evaluationResult.suggested_rewrite}</p>
                  <button
                    onClick={handleUseSuggestedRewrite}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
                  >
                    <Copy size={12} />
                    <span>Use Suggested Rewrite</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleOkayClick}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Okay, I understand
            </button>
          </div>
        );

      case 'OOS':
        console.log('🟡 CompleteCoachingPanel: Rendering OOS feedback UI');
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle size={20} />
              <h3 className="font-semibold">That's outside the BA discussion</h3>
            </div>
            
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              Let's stay focused on the interview. Try asking: "{currentQuestion.question}"
            </p>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-yellow-200 dark:border-yellow-600 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{currentQuestion.question}</p>
              <button
                onClick={handleUseSuggestedRewrite}
                className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
              >
                <Copy size={12} />
                <span>Use This Question</span>
              </button>
            </div>

            <button
              onClick={handleOkayClick}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Okay, I understand
            </button>
          </div>
        );

      case 'MISALIGNED':
        console.log('🟡 CompleteCoachingPanel: Rendering MISALIGNED feedback UI');
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle size={20} />
              <h3 className="font-semibold">Good BA question, but not for this stage</h3>
            </div>
            
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              We're in the {getPhaseTitle(currentQuestion.type)} phase now. Try: "{currentQuestion.question}"
            </p>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-yellow-200 dark:border-yellow-600 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{currentQuestion.question}</p>
              <button
                onClick={handleUseSuggestedRewrite}
                className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
              >
                <Copy size={12} />
                <span>Use This Question</span>
              </button>
            </div>

            <button
              onClick={handleOkayClick}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Okay, I understand
            </button>
          </div>
        );

      case 'RED':
        console.log('🔴 CompleteCoachingPanel: Rendering RED feedback UI');
        return (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3 text-red-800 dark:text-red-200">
              <AlertTriangle size={20} />
              <h3 className="font-semibold">Let's improve this question</h3>
            </div>

            {/* Reasons */}
            {evaluationResult.reasons.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">Feedback:</h4>
                <ul className="space-y-1">
                  {evaluationResult.reasons.map((reason, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fixes */}
            {evaluationResult.fixes.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">How to improve:</h4>
                <ul className="space-y-1">
                  {evaluationResult.fixes.map((fix, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Rewrite */}
            {evaluationResult.suggested_rewrite && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">Suggested rewrite:</h4>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-red-200 dark:border-red-600">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{evaluationResult.suggested_rewrite}</p>
                  <button
                    onClick={handleUseSuggestedRewrite}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
                  >
                    <Copy size={12} />
                    <span>Use Suggested Rewrite</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleOkayClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Okay, I understand
            </button>
          </div>
        );

      default:
        console.log('❓ CompleteCoachingPanel: Unknown verdict:', evaluationResult.verdict);
        return null;
    }
  };

  console.log('🎨 CompleteCoachingPanel: Rendering main component');

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-2">
          {currentQuestion && getPhaseIcon(currentQuestion.type)}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentQuestion ? getPhaseTitle(currentQuestion.type) : 'Interview'}
          </h2>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <CheckCircle size={20} />
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Current Question Card - Always Pinned */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentQuestion?.type === 'problem' ? 'Project Question' : 'Interview Question'}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentQuestionIndex + 1} of {getProjectQuestions(projectName).length}
            </span>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">{currentQuestion.question}</p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Why this matters</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{currentQuestion.why}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">How to ask</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{currentQuestion.how}</p>
            </div>
          </div>
        </div>

        {/* Evaluation Feedback */}
        {getVerdictUI()}

        {/* Completed Questions */}
        {completedQuestions.size > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Completed Questions:</h3>
            <div className="space-y-1">
              {Array.from(completedQuestions).map((questionId, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="truncate">Question {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteCoachingPanel;
