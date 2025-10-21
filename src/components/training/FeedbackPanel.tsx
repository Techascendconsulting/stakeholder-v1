import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FeedbackPanelProps {
  localHint?: string;
  aiFeedback?: string;
  exampleAnswer?: string;
  reflectionOptions?: string[];
  onReflectionSelect?: (choice: string) => void;
  onNext?: () => void;
  loading?: boolean;
}

export default function FeedbackPanel({
  localHint,
  aiFeedback,
  exampleAnswer,
  reflectionOptions = ['Very close', 'Somewhat', 'Not close'],
  onReflectionSelect,
  onNext,
  loading = false,
}: FeedbackPanelProps) {
  const [showLocalHint, setShowLocalHint] = useState(true);
  const [selectedReflection, setSelectedReflection] = useState<string | null>(null);

  // Fade out local hint after AI feedback arrives
  useEffect(() => {
    if (aiFeedback && localHint) {
      const timer = setTimeout(() => {
        setShowLocalHint(false);
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [aiFeedback, localHint]);

  const handleReflectionClick = (choice: string) => {
    setSelectedReflection(choice);
    onReflectionSelect?.(choice);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Local Hint Box (Instant, fades out when AI arrives) */}
      {localHint && showLocalHint && !aiFeedback && (
        <div className="rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 p-4 text-sm transition-all duration-500">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚡</span>
            <div className="flex-1">
              <span className="font-semibold text-yellow-900 dark:text-yellow-200">Quick Tip:</span>
              <span className="text-yellow-800 dark:text-yellow-300 ml-2">{localHint}</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Loading State */}
      {loading && (
        <div className="rounded-lg border border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600 p-4 text-sm">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <span className="text-purple-700 dark:text-purple-300 font-medium">AI Coach is analyzing your response...</span>
          </div>
        </div>
      )}

      {/* AI Coach Feedback Box (Appears after loading) */}
      {aiFeedback && !loading && (
        <div className="rounded-lg border border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600 p-4 text-sm animate-slideUp">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400 text-lg">🧠</span>
            <div className="flex-1">
              <span className="font-semibold text-blue-900 dark:text-blue-200">AI Coach:</span>
              <span className="text-blue-800 dark:text-blue-300 ml-2">{aiFeedback}</span>
            </div>
          </div>
        </div>
      )}

      {/* Example Answer Box */}
      {exampleAnswer && !loading && (
        <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 shadow-sm animate-fadeIn">
          <div className="flex items-start space-x-2">
            <span className="text-gray-500 dark:text-gray-400 text-lg">💡</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Example Answer:</p>
              <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">"{exampleAnswer}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Reflection Section */}
      {exampleAnswer && !loading && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 animate-fadeIn">
          <label className="block font-semibold text-gray-900 dark:text-white mb-3 text-sm">
            How close was your answer to the example?
          </label>
          <div className="flex flex-wrap gap-3">
            {reflectionOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleReflectionClick(option)}
                className={`px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm font-medium ${
                  selectedReflection === option
                    ? 'border-purple-600 bg-purple-600 text-white shadow-md scale-105'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next Step CTA */}
      {exampleAnswer && !loading && selectedReflection && (
        <div className="flex justify-end pt-2 animate-fadeIn">
          <button
            onClick={onNext}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="font-semibold">Next Rule</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

