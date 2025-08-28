import React, { useState, useEffect } from 'react';
import QuestionSuggestionsService, { QuestionSuggestion, ConversationStage } from '../services/questionSuggestions';

interface QuestionSuggestionsProps {
  conversationHistory: Array<{ role: string; content: string }>;
  onQuestionSelect: (question: string) => void;
  stakeholderContext?: any;
  className?: string;
}

const QuestionSuggestions: React.FC<QuestionSuggestionsProps> = ({
  conversationHistory,
  onQuestionSelect,
  stakeholderContext,
  className = ''
}) => {
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
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="text-sm font-medium text-gray-900">
              Suggested Questions
            </h3>
            {currentStage && (
              <span className="text-xs text-gray-500">
                • {getStageName(currentStage.stage)} ({currentStage.progress}%)
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="p-4">
        <div className="space-y-3">
          {(isExpanded ? suggestions : suggestions.slice(0, 3)).map((suggestion) => (
            <div
              key={suggestion.id}
              className="group cursor-pointer p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
              onClick={() => onQuestionSelect(suggestion.text)}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 group-hover:text-blue-900 font-medium">
                    {suggestion.text}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(suggestion.difficulty)}`}>
                      {suggestion.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      {suggestion.context}
                    </span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        {currentStage && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Learning Progress</span>
              <span>{currentStage.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentStage.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Stage: {getStageName(currentStage.stage)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionSuggestions;
