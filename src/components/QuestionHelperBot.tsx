import React, { useState, useEffect } from 'react';
import { MessageCircle, X, ChevronUp, ChevronDown, Send } from 'lucide-react';
import QuestionSuggestionsService, { QuestionSuggestion, ConversationStage } from '../services/questionSuggestions';

interface QuestionHelperBotProps {
  conversationHistory: Array<{ role: string; content: string }>;
  onQuestionSelect: (question: string) => void;
  stakeholderContext?: any;
}

const QuestionHelperBot: React.FC<QuestionHelperBotProps> = ({
  conversationHistory,
  onQuestionSelect,
  stakeholderContext
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<QuestionSuggestion[]>([]);
  const [currentStage, setCurrentStage] = useState<ConversationStage | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());

  const questionService = QuestionSuggestionsService.getInstance();

  useEffect(() => {
    const newSuggestions = questionService.getQuestionSuggestions(conversationHistory, stakeholderContext);
    const stage = questionService.getCurrentStage();
    
    // Track which questions have been asked by checking conversation history
    const askedQuestions = new Set<string>();
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        askedQuestions.add(msg.content.toLowerCase().trim());
      }
    });
    setUsedQuestions(askedQuestions);
    
    setSuggestions(newSuggestions);
    setCurrentStage(stage);
  }, [conversationHistory, stakeholderContext]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'context': return '🔍';
      case 'analysis': return '📊';
      case 'process': return '⚙️';
      case 'stakeholders': return '👥';
      case 'goals': return '🎯';
      case 'challenges': return '⚠️';
      case 'solutions': return '💡';
      case 'next_steps': return '📋';
      default: return '❓';
    }
  };

  const getStageName = (stage: string) => {
    switch (stage) {
      case 'introduction': return 'Introduction';
      case 'problem_understanding': return 'Problem Understanding';
      case 'process_analysis': return 'Process Analysis';
      case 'stakeholder_mapping': return 'Stakeholder Mapping';
      case 'solution_brainstorming': return 'Solution Brainstorming';
      case 'implementation_planning': return 'Implementation Planning';
      default: return stage;
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {/* Floating Question Bank Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
          title="Question Bank"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Question Bank</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-64 max-h-96 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <h3 className="font-semibold text-sm">Question Bank</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {currentStage && (
              <div className="mt-1 text-xs opacity-90">
                {getStageName(currentStage.stage)} • {currentStage.progress}%
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {(isExpanded ? suggestions : suggestions.slice(0, 3)).map((suggestion) => {
                const isUsed = usedQuestions.has(suggestion.text.toLowerCase().trim());
                return (
                <div
                  key={suggestion.id}
                  className={`group p-2 rounded-lg border transition-all duration-200 ${
                    isUsed 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                      : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isUsed) {
                      onQuestionSelect(suggestion.text);
                      setIsOpen(false); // Close after selection
                    }
                  }}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-sm">{getCategoryIcon(suggestion.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-relaxed ${
                        isUsed ? 'text-gray-500' : 'text-gray-900 group-hover:text-indigo-900'
                      }`}>
                        {suggestion.text}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${
                          isUsed ? 'bg-gray-100 text-gray-500 border-gray-200' : getDifficultyColor(suggestion.difficulty)
                        }`}>
                          {isUsed ? 'Used' : suggestion.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send className="w-3 h-3 text-indigo-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {suggestions.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mt-2 text-center text-xs text-indigo-600 hover:text-indigo-800 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {isExpanded ? (
                  <span className="flex items-center justify-center space-x-1">
                    <ChevronUp className="w-3 h-3" />
                    Show Less
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-1">
                    <ChevronDown className="w-3 h-3" />
                    Show More ({suggestions.length - 3} more)
                  </span>
                )}
              </button>
            )}

            {/* Progress indicator */}
            {currentStage && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{currentStage.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${currentStage.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getStageName(currentStage.stage)}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Click to ask automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionHelperBot;
