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
        <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-400/50 dark:border-yellow-600/50 p-5 shadow-lg shadow-yellow-500/20 transition-all duration-500">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-xl shadow-lg">
              ⚡
            </div>
            <div className="flex-1">
              <p className="font-bold text-yellow-900 dark:text-yellow-100 mb-1">Quick Tip:</p>
              <p className="text-yellow-800 dark:text-yellow-200 leading-relaxed">{localHint}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Loading State */}
      {loading && (
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-300/50 dark:border-purple-600/50 p-5 shadow-lg animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 dark:border-purple-700 border-t-purple-600 dark:border-t-purple-400"></div>
              <div className="absolute inset-0 rounded-full bg-purple-400/20 blur-md"></div>
            </div>
            <span className="text-purple-800 dark:text-purple-200 font-semibold">AI Coach is analyzing your response...</span>
          </div>
        </div>
      )}

      {/* AI Coach Feedback Box (Appears after loading) */}
      {aiFeedback && !loading && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-400/50 dark:border-blue-600/50 p-6 shadow-xl shadow-blue-500/20 animate-slideUp">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-2xl shadow-lg">
              🧠
            </div>
            <div className="flex-1">
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-base">AI Coach Says:</p>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">{aiFeedback}</p>
            </div>
          </div>
        </div>
      )}

      {/* Example Answer Box */}
      {exampleAnswer && !loading && (
        <div className="rounded-2xl backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border-2 border-gray-200/50 dark:border-gray-600/50 p-6 shadow-xl animate-fadeIn">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg">
              💡
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white mb-3 text-base">Example Answer:</p>
              <p className="text-gray-800 dark:text-gray-200 italic leading-relaxed text-base bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                "{exampleAnswer}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reflection Section */}
      {exampleAnswer && !loading && (
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300/50 dark:border-purple-600/50 p-6 shadow-lg animate-fadeIn">
          <label className="block font-bold text-gray-900 dark:text-white mb-4 text-base flex items-center space-x-2">
            <span className="text-xl">🤔</span>
            <span>How close was your answer to the example?</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {reflectionOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleReflectionClick(option)}
                className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 font-semibold ${
                  selectedReflection === option
                    ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:scale-105'
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
            className="group px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 flex items-center space-x-3 font-bold text-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">Next Rule</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      )}
    </div>
  );
}

