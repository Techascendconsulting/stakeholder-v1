import { useState } from "react";
import { CheckCircle, ArrowRight, RotateCcw, FileText, Eye, Target, AlertCircle, Lightbulb, Users, Zap, Award, Bell } from "lucide-react";
import { WalkthroughContent } from "../../content/userStoryWalkthrough";

interface AcceptanceCriteriaWalkthroughProps {
  onStartPractice: () => void;
  onBack: () => void;
  scenarioId?: string;
}

interface Rule {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  scenario: string;
  options: {
    value: string;
    text: string;
    correct: boolean;
    explanation: string;
  }[];
}

const getRulesForScenario = (scenarioId?: string): Rule[] => {
  // Use the new walkthrough content
  return WalkthroughContent.acWalkthrough.map((rule, index) => ({
    id: index + 1,
    title: rule.rule,
    description: rule.why,
    icon: <Target className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    scenario: `Rule ${index + 1} of 8: ${rule.rule}`,
    options: [
      {
        value: "A",
        text: rule.badExample,
        correct: false,
        explanation: "This is a bad example - it violates the rule"
      },
      {
        value: "B", 
        text: rule.goodExamples[0],
        correct: true,
        explanation: "This is a good example - it follows the rule"
      },
      {
        value: "C",
        text: rule.goodExamples[1] || "Another good example",
        correct: true,
        explanation: "This is also a good example"
      }
    ]
  }));
};

export default function AcceptanceCriteriaWalkthrough({ onStartPractice, onBack, scenarioId }: AcceptanceCriteriaWalkthroughProps) {
  const [currentRule, setCurrentRule] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  const rules = getRulesForScenario(scenarioId);
  const currentRuleData = rules[currentRule];
  const isLastRule = currentRule === rules.length - 1;
  const selectedValue = selectedAnswers[currentRule];
  const hasAnswered = selectedValue !== undefined;
  const correctOption = currentRuleData.options.find(option => option.correct);
  const isSelectedCorrect = selectedValue !== undefined && selectedValue === (correctOption?.value || '');

  const handleAnswerSelect = (answer: string) => {
    // First selection shows explanation; subsequent selections allow correction
    setSelectedAnswers(prev => ({
      ...prev,
      [currentRule]: answer
    }));
    if (!showExplanation) setShowExplanation(true);
  };

  const handleNext = () => {
    if (!isSelectedCorrect) return;
    if (isLastRule) {
      onStartPractice();
    } else {
      setCurrentRule(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentRule > 0) {
      setCurrentRule(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrentRule(0);
    setSelectedAnswers({});
    setShowExplanation(false);
  };

  const getSelectedOption = () => {
    return currentRuleData.options.find(option => option.value === selectedValue);
  };

  const getProgressPercentage = () => {
    return ((currentRule + 1) / rules.length) * 100;
  };

  return (
    <div className="content-root min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-200 dark:bg-purple-900/30 rounded-full">
              <FileText className="w-8 h-8 text-purple-700 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Acceptance Criteria Walkthrough
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Learn the 8 key principles of writing effective acceptance criteria through interactive examples
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rule {currentRule + 1} of {rules.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(getProgressPercentage())}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Rule Header */}
            {/* Light: black text + darker purple accents; Dark: gradient */}
            <div className="p-6 border-b-2 border-purple-700 dark:border-0 dark:bg-gradient-to-r dark:from-purple-600 dark:to-blue-600">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-purple-700 dark:text-white">{currentRuleData.icon}</span>
                <h2 className="text-2xl font-bold text-black dark:text-white">{currentRuleData.title}</h2>
              </div>
              <p className="text-gray-800 dark:text-purple-100 text-lg">{currentRuleData.description}</p>
            </div>

            {/* Scenario */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Scenario</h3>
                  <p className="text-gray-700 dark:text-gray-300">{currentRuleData.scenario}</p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Which acceptance criteria follows this rule best?</h3>
              <div className="space-y-3">
                {currentRuleData.options.map((option) => {
                  const isSelected = selectedAnswers[currentRule] === option.value;
                  const isCorrect = option.correct;
                  const showResult = showExplanation && isSelected;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswerSelect(option.value)}
                      disabled={showExplanation && isSelectedCorrect}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        showExplanation
                          ? isSelected
                            ? isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                          : isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          showExplanation
                            ? isSelected
                              ? isCorrect
                                ? 'border-green-500 bg-green-500'
                                : 'border-red-500 bg-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                            : isSelected
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {showExplanation && isSelected && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                          {!showExplanation && isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {option.value}
                            </span>
                            {showExplanation && isSelected && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isCorrect
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{option.text}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Explanation</h3>
                    {!isSelectedCorrect && (
                      <div className="mb-2 text-red-700 dark:text-red-300">
                        Your choice is not correct. Review the guidance and select the correct answer below.
                      </div>
                    )}
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {getSelectedOption()?.explanation}
                    </p>
                    {!isSelectedCorrect && correctOption && (
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        Correct answer is <span className="font-semibold">{correctOption.value}</span>: {correctOption.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentRule === 0}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleRestart}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restart</span>
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Back to Training
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!isSelectedCorrect}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>{isLastRule ? 'Start Practice' : 'Next Rule'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

