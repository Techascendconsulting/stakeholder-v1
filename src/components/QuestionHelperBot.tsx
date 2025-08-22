import React, { useState, useEffect } from 'react';
import { MessageCircle, X, ChevronUp, ChevronDown, Lightbulb, Send } from 'lucide-react';
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

  const questionService = QuestionSuggestionsService.getInstance();

  useEffect(() => {
    const newSuggestions = questionService.getQuestionSuggestions(conversationHistory, stakeholderContext);
    const stage = questionService.getCurrentStage();
    
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
          title="Question suggestions"
        >
          <Lightbulb className="w-5 h-5" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-72 max-h-80 flex flex-col">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4" />
                <h3 className="font-semibold text-sm">Questions</h3>
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
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {(isExpanded ? suggestions : suggestions.slice(0, 4)).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="group cursor-pointer p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
                  onClick={() => {
                    onQuestionSelect(suggestion.text);
                    setIsOpen(false); // Close after selection
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 group-hover:text-indigo-900 font-medium leading-relaxed">
                        {suggestion.text}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(suggestion.difficulty)}`}>
                          {suggestion.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {suggestion.context}
                        </span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send className="w-4 h-4 text-indigo-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {suggestions.length > 4 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mt-3 text-center text-sm text-indigo-600 hover:text-indigo-800 py-2 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {isExpanded ? (
                  <span className="flex items-center justify-center space-x-1">
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-1">
                    <ChevronDown className="w-4 h-4" />
                    Show More ({suggestions.length - 4} more)
                  </span>
                )}
              </button>
            )}

            {/* Progress indicator */}
            {currentStage && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Learning Progress</span>
                  <span>{currentStage.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentStage.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Stage: {getStageName(currentStage.stage)}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Click any question to ask it automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionHelperBot;
