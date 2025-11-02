import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Users, 
  Lightbulb 
} from 'lucide-react';

// Types
type Verdict = 'GOOD' | 'AMBER' | 'OOS' | 'MISALIGNED';

type QuestionCard = {
  text: string;
  why: string;
  how: string;
  technique: string;
  stage: 'greeting' | 'problem' | 'dynamic' | 'wrapup';
  index: number;
};

type CoachingFeedback = {
  verdict: Verdict;
  message: string;
  suggestedRewrite?: string;
};

// Initial question for problem exploration
const initialQuestion: QuestionCard = {
  text: "What problem are we trying to solve?",
  why: "Every BA conversation must begin by establishing the core issue the project aims to fix.",
  how: "This opens up the discussion, giving the stakeholder space to share their key frustrations or goals.",
  technique: "Problem identification",
  stage: 'problem',
  index: 0
};

interface DynamicCoachingPanelProps {
  projectName: string;
  conversationHistory: Array<{ id: string; sender: string; content: string; timestamp: Date; stakeholderName?: string }>;
  onAcknowledgementStateChange?: (awaitingAcknowledgement: boolean) => void;
  onSuggestedRewrite?: (rewrite: string) => void;
  onSubmitMessage?: (message: string) => void;
}

const DynamicCoachingPanel = React.forwardRef<{ onUserSubmitted: (messageId: string) => void }, DynamicCoachingPanelProps>(({
  projectName,
  conversationHistory,
  onAcknowledgementStateChange,
  onSuggestedRewrite,
  onSubmitMessage,
}, ref) => {
  // State management
  const [currentQuestion, setCurrentQuestion] = useState<QuestionCard>(initialQuestion);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [inputLocked, setInputLocked] = useState(false);
  const [awaitingAcknowledgement, setAwaitingAcknowledgement] = useState(false);
  const [coachingFeedback, setCoachingFeedback] = useState<CoachingFeedback | null>(null);
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalQuestions = 15;

  // Mirror lock to parent
  useEffect(() => {
    onAcknowledgementStateChange?.(awaitingAcknowledgement);
  }, [awaitingAcknowledgement, onAcknowledgementStateChange]);

  // Auto-evaluate new user messages in conversation history
  useEffect(() => {
    if (conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage.sender === 'user') {
        // Evaluate the message content directly
        evaluateUserMessage(lastMessage.content);
      }
    }
  }, [conversationHistory]);

  // On user submit (parent calls this)
  const onUserSubmitted = useCallback(
    (messageId: string) => {
      console.log('🔄 DynamicCoachingPanel: User submitted message:', messageId);
      handleUserMessage(messageId);
    },
    []
  );

  // Expose onUserSubmitted through ref
  React.useImperativeHandle(ref, () => ({
    onUserSubmitted
  }), [onUserSubmitted]);

  // Helper functions
  const findMessageById = (messageId: string) => {
    return conversationHistory.find(msg => msg.id === messageId);
  };

  const getLastStakeholderMessage = () => {
    return conversationHistory
      .filter(msg => msg.sender === 'ai')
      .pop();
  };

  // Handle user message evaluation
  const handleUserMessage = async (messageId: string) => {
    const message = findMessageById(messageId);
    if (!message) return;

    console.log('🔍 DynamicCoachingPanel: Evaluating message:', message.content);

    try {
      // For greeting phase (question 0), evaluate greeting
      if (questionIndex === 0) {
        const casualGreetings = ['hi', 'hey', 'hello', 'yo', 'what\'s up'];
        const isCasualGreeting = casualGreetings.some(greeting => 
          message.content.toLowerCase().includes(greeting)
        );
        
        if (isCasualGreeting) {
          setCoachingFeedback({
            verdict: 'AMBER',
            message: "Let's refine this. Aim for neutral, open phrasing.",
            suggestedRewrite: 'Hello [Name], thanks for taking the time to meet today. I\'m the business analyst on this project, and I\'d like to understand your current challenges.'
          });
          setAwaitingAcknowledgement(true);
          setInputLocked(true);
          return;
        } else {
          // Good professional greeting
          advanceToNextQuestion();
          return;
        }
      }

      // For other phases, evaluate as GOOD for now (you can add your evaluator here)
      advanceToNextQuestion();

    } catch (error) {
      console.error('❌ DynamicCoachingPanel: Evaluation failed:', error);
      advanceToNextQuestion(); // Fallback to GOOD
    }
  };

  // Advance to next question
  const advanceToNextQuestion = async () => {
    setQuestionIndex(prev => prev + 1);
    setProgress(prev => prev + 1);
    setCoachingFeedback(null);
    setAwaitingAcknowledgement(false);
    setInputLocked(false);

    // Generate next question based on stakeholder response
    if (questionIndex > 0) {
      await generateNextQuestion();
    }
  };

  // Generate next question based on stakeholder response
  const generateNextQuestion = async () => {
    const lastStakeholderMessage = getLastStakeholderMessage();
    if (!lastStakeholderMessage) {
      // No stakeholder response, use fallback question
      const fallbackQuestion: QuestionCard = {
        text: "Could you share a recent example of that?",
        why: "Get concrete details to understand the current process",
        how: "Ask for specific examples to make abstract concepts tangible",
        technique: "Example probing",
        stage: 'dynamic',
        index: questionIndex
      };
      setCurrentQuestion(fallbackQuestion);
      return;
    }

    setIsGenerating(true);
    try {
      // Here you would call your AI service to generate contextual questions
      // For now, using a simple fallback based on common patterns
      const contextualQuestion = generateContextualQuestion(lastStakeholderMessage.content);
      setCurrentQuestion(contextualQuestion);
    } catch (error) {
      console.error('❌ DynamicCoachingPanel: Question generation failed:', error);
      // Fallback question
      const fallbackQuestion: QuestionCard = {
        text: "Could you walk me through a recent example of that?",
        why: "Get concrete details to understand the current process",
        how: "Ask for specific examples to make abstract concepts tangible",
        technique: "Example probing",
        stage: 'dynamic',
        index: questionIndex
      };
      setCurrentQuestion(fallbackQuestion);
    } finally {
      setIsGenerating(false);
    }
  };

  // Simple contextual question generator (replace with AI service)
  const generateContextualQuestion = (stakeholderResponse: string): QuestionCard => {
    const response = stakeholderResponse.toLowerCase();
    
    if (response.includes('delay') || response.includes('slow') || response.includes('wait')) {
      return {
        text: 'Can you describe what usually causes delays during these handoffs?',
        why: 'You mentioned delays. Understanding delay points helps target process gaps.',
        how: 'Ask for specific examples of when delays occur',
        technique: 'Follow-up question based on stakeholder pain point',
        stage: 'dynamic',
        index: questionIndex
      };
    }
    
    if (response.includes('manual') || response.includes('handoff') || response.includes('process')) {
      return {
        text: 'Which steps in this process are most prone to errors?',
        why: 'Manual processes often have error-prone steps that need automation.',
        how: 'Ask for specific examples of errors or issues',
        technique: 'Error analysis questioning',
        stage: 'dynamic',
        index: questionIndex
      };
    }
    
    return {
      text: 'Can you give me a recent example of when this didn\'t go as planned?',
      why: 'Looking for specific incidents uncovers hidden process issues.',
      how: 'Ask for concrete examples with details',
      technique: 'Incident-based questioning',
      stage: 'dynamic',
      index: questionIndex
    };
  };

  // Handle acknowledge button click
  const handleAcknowledge = () => {
    setAwaitingAcknowledgement(false);
    setInputLocked(false);
    setCoachingFeedback(null);
    advanceToNextQuestion();
  };

  // Handle use suggested rewrite
  const handleUseSuggestedRewrite = () => {
    if (questionIndex === 0 && awaitingAcknowledgement) {
      // For greeting phase, auto-send the suggested greeting
      const suggestedGreeting = 'Hello [Name], thanks for taking the time to meet today. I\'m the business analyst on this project, and I\'d like to understand your current challenges.';
      if (onSubmitMessage) {
        onSubmitMessage(suggestedGreeting);
      }
      handleAcknowledge();
    } else {
      // For other phases, just fill the textarea
      if (onSuggestedRewrite) {
        onSuggestedRewrite(currentQuestion.text);
      }
      handleAcknowledge();
    }
  };

  const getProgressPercentage = () => {
    return Math.round(((questionIndex + 1) / totalQuestions) * 100);
  };

  const getPhaseTitle = () => {
    if (questionIndex === 0) return 'Greeting';
    if (questionIndex === 1) return 'Initial Exploration';
    if (questionIndex === totalQuestions - 1) return 'Wrap-up';
    return 'Dynamic Follow-up';
  };

  const getPhaseIcon = () => {
    if (questionIndex === 0) return <MessageSquare size={16} />;
    if (questionIndex === 1) return <Target size={16} />;
    if (questionIndex === totalQuestions - 1) return <CheckCircle size={16} />;
    return <TrendingUp size={16} />;
  };

  // Debug logging
  useEffect(() => {
    console.log('🔍 DynamicCoachingPanel Debug:', {
      projectName,
      questionIndex,
      totalQuestions,
      conversationHistoryLength: conversationHistory.length,
      inputLocked,
      awaitingAcknowledgement,
      coachingFeedback: coachingFeedback?.verdict,
      isAnalyzing,
      isGenerating
    });
  }, [projectName, questionIndex, totalQuestions, conversationHistory.length, inputLocked, awaitingAcknowledgement, coachingFeedback, isAnalyzing, isGenerating]);

  if (isAnalyzing || isGenerating) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dynamic BA Interview</h2>
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-gray-500 dark:text-gray-400">
            {isAnalyzing ? 'Analyzing response...' : 'Generating question...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 w-96 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-2">
          {getPhaseIcon()}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getPhaseTitle()}
          </h2>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
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
                {coachingFeedback.verdict === 'GOOD' ? 'Great question!' : 'Let\'s refine this'}
              </h3>
            </div>
            <p className="text-sm mb-3">{coachingFeedback.message}</p>
            
            {coachingFeedback.suggestedRewrite && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-amber-200 dark:border-amber-600 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {coachingFeedback.suggestedRewrite}
                </p>
                <button
                  onClick={handleUseSuggestedRewrite}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
                >
                  <Copy size={12} />
                  <span>Use This Greeting</span>
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

        {/* Current Question Card */}
        {!awaitingAcknowledgement && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Question {questionIndex + 1} of {totalQuestions}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentQuestion.technique}
              </span>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">{currentQuestion.text}</p>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 flex items-center">
                  <Lightbulb size={14} className="mr-1" />
                  Why this question?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentQuestion.why}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 flex items-center">
                  <Target size={14} className="mr-1" />
                  How to ask
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentQuestion.how}</p>
              </div>
            </div>

            {/* Action Buttons - Only show for non-greeting questions */}
            {questionIndex > 0 && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleUseSuggestedRewrite}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Copy size={16} />
                  <span>Use This Question</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default DynamicCoachingPanel;
