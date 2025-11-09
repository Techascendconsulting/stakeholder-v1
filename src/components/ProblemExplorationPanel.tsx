import React, { useState, useEffect } from 'react';
import { 
  CheckCircle,
  AlertTriangle,
  Copy,
  Send
} from 'lucide-react';
import { coachingEvaluatorService } from '../services/coachingEvaluatorService';
import { getCurrentQuestion, getProjectQuestions } from '../data/problemExplorationQuestions';

interface ProblemExplorationPanelProps {
  projectId: string;
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

const ProblemExplorationPanel: React.FC<ProblemExplorationPanelProps> = ({
  projectId,
  conversationHistory,
  onAcknowledgementStateChange,
  onSuggestedRewrite,
  onSubmitMessage
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionType, setCurrentQuestionType] = useState<'primary' | 'dig_deeper'>('primary');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [awaitingAcknowledgement, setAwaitingAcknowledgement] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [inputLocked, setInputLocked] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const evaluator = coachingEvaluatorService;

  // Get current question
  const currentQuestion = getCurrentQuestion(projectId, currentQuestionType, currentQuestionIndex);
  const projectQuestions = getProjectQuestions(projectId);
  
  // Debug logging
  console.log('🔍 ProblemExplorationPanel Debug:', {
    projectId,
    currentQuestionType,
    currentQuestionIndex,
    currentQuestion,
    hasProjectQuestions: !!projectQuestions,
    questionCount: projectQuestions ? 
      projectQuestions.problem_exploration.primary.length + projectQuestions.problem_exploration.dig_deeper.length : 0
  });

  // Calculate progress
  useEffect(() => {
    if (projectQuestions) {
      const totalQuestions = projectQuestions.problem_exploration.primary.length + 
                           projectQuestions.problem_exploration.dig_deeper.length;
      const completed = completedQuestions.size;
      setProgress(Math.round((completed / totalQuestions) * 100));
    }
  }, [completedQuestions, projectQuestions]);

  // Notify parent about acknowledgement state
  useEffect(() => {
    if (onAcknowledgementStateChange) {
      onAcknowledgementStateChange(awaitingAcknowledgement);
    }
  }, [awaitingAcknowledgement, onAcknowledgementStateChange]);

  const evaluateMessage = async (message: string) => {
    if (!currentQuestion) return;

    try {
      const context = {
        state: 'problem_exploration',
        suggested_question: currentQuestion,
        state_goal: 'Elicit 2–3 pain points with examples.',
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
          project: projectId
        }
      };

      const result = await evaluator.evaluateMessage(context);
      setEvaluationResult(result);

      // Handle different verdicts
      switch (result.verdict) {
        case 'GOOD':
          // Show success message and advance
          setSuccessMessage("Great — that's a well-structured, open question.");
          setTimeout(() => {
            setSuccessMessage(null);
            markQuestionComplete();
            advanceToNextQuestion();
          }, 2000);
          break;

        case 'AMBER':
        case 'OOS':
        case 'MISALIGNED':
          // Show coaching panel and lock input
          setAwaitingAcknowledgement(true);
          setInputLocked(true);
          break;

        default:
          // Handle RED as AMBER
          setAwaitingAcknowledgement(true);
          setInputLocked(true);
          break;
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
    }
  };

  const markQuestionComplete = () => {
    if (currentQuestion) {
      setCompletedQuestions(prev => new Set([...prev, currentQuestion]));
    }
  };

  const advanceToNextQuestion = () => {
    if (!projectQuestions) return;

    if (currentQuestionType === 'primary' && 
        currentQuestionIndex < projectQuestions.problem_exploration.primary.length - 1) {
      // Move to next primary question
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentQuestionType === 'primary') {
      // Move to dig deeper questions
      setCurrentQuestionType('dig_deeper');
      setCurrentQuestionIndex(0);
    } else if (currentQuestionType === 'dig_deeper' && 
               currentQuestionIndex < projectQuestions.problem_exploration.dig_deeper.length - 1) {
      // Move to next dig deeper question
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions completed
      console.log('All problem exploration questions completed!');
    }
  };

  const handleOkayClick = () => {
    setAwaitingAcknowledgement(false);
    setEvaluationResult(null);
    setInputLocked(false);
    markQuestionComplete();
    advanceToNextQuestion();
  };

  const handleUseSuggestedRewrite = () => {
    if (evaluationResult?.suggested_rewrite && onSuggestedRewrite) {
      onSuggestedRewrite(evaluationResult.suggested_rewrite);
    }
    setAwaitingAcknowledgement(false);
    setEvaluationResult(null);
    setInputLocked(false);
  };

  const handleSubmitMessage = (message: string) => {
    if (!message.trim() || !currentQuestion) return;
    if (onSubmitMessage) {
      onSubmitMessage(message);
    }
    evaluateMessage(message);
  };

  if (!projectQuestions || !currentQuestion) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Problem Exploration</h2>
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
            No questions available for this project.
          </div>
        </div>
      </div>
    );
  }

  const getVerdictUI = () => {
    if (!evaluationResult) return null;

    switch (evaluationResult.verdict) {
      case 'GOOD':
        return null; // Handled by success message

      case 'AMBER':
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
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle size={20} />
              <h3 className="font-semibold">That's outside the BA discussion</h3>
            </div>
            
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              Let's stay focused on Problem Exploration. Try asking: "{currentQuestion}"
            </p>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-yellow-200 dark:border-yellow-600 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{currentQuestion}</p>
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
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle size={20} />
              <h3 className="font-semibold">Good BA question, but not for this stage</h3>
            </div>
            
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              We're exploring stakeholder pain points now. Try: "{currentQuestion}"
            </p>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-yellow-200 dark:border-yellow-600 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{currentQuestion}</p>
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

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Problem Exploration</h2>
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
              {currentQuestionType === 'primary' ? 'Primary Question' : 'Follow-up Question'}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentQuestionIndex + 1} of {currentQuestionType === 'primary' 
                ? projectQuestions.problem_exploration.primary.length 
                : projectQuestions.problem_exploration.dig_deeper.length}
            </span>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">{currentQuestion}</p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Why this matters</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Helps identify specific pain points and challenges in the current process.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">How to ask</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ask neutrally and invite specific examples. Listen for emotional cues and process details.
              </p>
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
              {Array.from(completedQuestions).map((question, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="truncate">{question}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemExplorationPanel;
