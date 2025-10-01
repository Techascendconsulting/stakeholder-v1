import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle, Eye, Edit } from 'lucide-react';

interface Suggestion {
  ruleId: string;
  severity: 'critical' | 'warning' | 'info';
  where?: { elementId: string };
  issue: string;
  suggestion: string;
  fix?: { newLabel: string };
}

interface AICoachSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: Suggestion[];
  onFocusElement: (elementId: string) => void;
  onApplyFix: (elementId: string, newLabel: string) => void;
  isLoading: boolean;
}

const AICoachSidebar: React.FC<AICoachSidebarProps> = ({
  isOpen,
  onClose,
  suggestions,
  onFocusElement,
  onApplyFix,
  isLoading
}) => {
  if (!isOpen) return null;

  const criticalSuggestions = suggestions.filter(s => s.severity === 'critical');
  const warningSuggestions = suggestions.filter(s => s.severity === 'warning');
  const infoSuggestions = suggestions.filter(s => s.severity === 'info');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const renderSuggestionGroup = (title: string, suggestions: Suggestion[], color: string) => {
    if (suggestions.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${color.includes('red') ? 'text-red-700' : color.includes('yellow') ? 'text-yellow-700' : 'text-blue-700'}`}>
          {getSeverityIcon(suggestions[0].severity)}
          {title} ({suggestions.length})
        </h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.ruleId}-${index}`}
              className={`p-3 rounded-lg border-l-4 ${getSeverityColor(suggestion.severity)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {suggestion.issue}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    {suggestion.suggestion}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {suggestion.where && (
                    <button
                      onClick={() => onFocusElement(suggestion.where!.elementId)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Focus on element"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  )}
                  {suggestion.fix && (
                    <button
                      onClick={() => onApplyFix(suggestion.where!.elementId, suggestion.fix!.newLabel)}
                      className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                      title="Apply fix"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          AI Coach
        </h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto h-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Analyzing your process...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Great job!</h3>
            <p className="text-sm text-gray-600">
              No issues found. Your process map looks good!
            </p>
          </div>
        ) : (
          <div>
            {renderSuggestionGroup('Critical Issues', criticalSuggestions, 'text-red-700')}
            {renderSuggestionGroup('Warnings', warningSuggestions, 'text-yellow-700')}
            {renderSuggestionGroup('Suggestions', infoSuggestions, 'text-blue-700')}
          </div>
        )}
      </div>
    </div>
  );
};

export default AICoachSidebar;














