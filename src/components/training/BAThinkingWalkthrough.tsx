import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Target, Lightbulb, AlertCircle, Home, ChevronRight, FileText, Award, Sparkles } from 'lucide-react';
import { RULES, RULE_ORDER, RuleKey } from '../../config/rules';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface BAThinkingWalkthroughProps {
  onComplete: () => void;
  onBack: () => void;
}

type Phase = 'learn' | 'apply';

export default function BAThinkingWalkthrough({ onComplete, onBack }: BAThinkingWalkthroughProps) {
  const { user } = useAuth();
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('learn');
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [applyText, setApplyText] = useState('');
  const [reflectionChoice, setReflectionChoice] = useState<'yes' | 'no' | 'not-sure' | null>(null);
  const [saving, setSaving] = useState(false);

  const currentRuleKey = RULE_ORDER[currentRuleIndex] as RuleKey;
  const currentRule = RULES[currentRuleKey];
  const isLastRule = currentRuleIndex === RULE_ORDER.length - 1;
  const progress = ((currentRuleIndex + 1) / RULE_ORDER.length) * 100;

  // Auto-save apply response
  useEffect(() => {
    if (phase === 'apply' && applyText.trim() && user) {
      const timeoutId = setTimeout(() => {
        saveResponse();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [applyText, phase, user]);

  const saveResponse = async () => {
    if (!user || !applyText.trim()) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('story_responses')
        .upsert({
          user_id: user.id,
          rule_name: currentRuleKey,
          response_text: applyText,
          reflection_choice: reflectionChoice,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,rule_name',
        });

      if (error) {
        console.error('Error saving response:', error);
      }
    } catch (error) {
      console.error('Failed to save response:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLearnSelect = (option: 'A' | 'B' | 'C') => {
    setSelectedOption(option);
    setShowFeedback(true);
  };

  const handleNextFromLearn = () => {
    if (selectedOption === currentRule.learn.correct) {
      setPhase('apply');
      setShowFeedback(false);
    }
  };

  const handleNextFromApply = async () => {
    if (!applyText.trim()) {
      alert('Please write your answer before continuing.');
      return;
    }

    // Save final response
    await saveResponse();

    if (isLastRule) {
      // Show capstone
      onComplete();
    } else {
      // Move to next rule
      setCurrentRuleIndex(prev => prev + 1);
      setPhase('learn');
      setSelectedOption(null);
      setShowFeedback(false);
      setApplyText('');
      setReflectionChoice(null);
    }
  };

  const handlePrevious = () => {
    if (phase === 'apply') {
      setPhase('learn');
      setShowFeedback(true);
    } else if (currentRuleIndex > 0) {
      setCurrentRuleIndex(prev => prev - 1);
      setPhase('apply'); // Go back to apply phase of previous rule
      setSelectedOption(RULES[RULE_ORDER[currentRuleIndex - 1]].learn.correct);
      setShowFeedback(false);
    }
  };

  const isCorrect = selectedOption === currentRule.learn.correct;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Requirements Specification
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">BA Thinking Framework</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8 max-w-5xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            BA Thinking Framework
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Master the 10 core rules of Agile BA thinking through interactive learning
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rule {currentRuleIndex + 1} of {RULE_ORDER.length} - {phase === 'learn' ? 'Learn' : 'Apply'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* LEARN PHASE */}
        {phase === 'learn' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Reference Story */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-600 dark:border-blue-400 p-6">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">Reference User Story:</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-100 italic">{currentRule.learn.referenceStory}</p>
                  </div>
                </div>
              </div>

              {/* Rule Header */}
              <div className="p-6 border-b-2 border-purple-700 dark:border-0 dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">🎯</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rule {currentRuleIndex + 1}: {currentRule.name}
                  </h2>
                </div>
              </div>

              {/* Question */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-1" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentRule.learn.question}
                  </h3>
                </div>
              </div>

              {/* Options */}
              <div className="p-6">
                <div className="space-y-3">
                  {(['A', 'B', 'C'] as const).map((optionKey) => {
                    const isSelected = selectedOption === optionKey;
                    const isCorrectOption = optionKey === currentRule.learn.correct;
                    const showResult = showFeedback && isSelected;

                    return (
                      <button
                        key={optionKey}
                        onClick={() => handleLearnSelect(optionKey)}
                        disabled={showFeedback && isCorrect}
                        className={`w-full p-5 rounded-lg border-2 text-left transition-all duration-200 ${
                          showFeedback
                            ? isSelected
                              ? isCorrectOption
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'
                            : isSelected
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold ${
                            showFeedback
                              ? isSelected
                                ? isCorrectOption
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : 'border-red-500 bg-red-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 text-gray-400'
                              : isSelected
                              ? 'border-purple-500 bg-purple-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                          }`}>
                            {showFeedback && isSelected && isCorrectOption && '✓'}
                            {showFeedback && isSelected && !isCorrectOption && '✗'}
                            {!showFeedback || !isSelected ? optionKey : ''}
                          </div>
                          <div className="flex-1">
                            <p className="text-base text-gray-800 dark:text-gray-200">{currentRule.learn.options[optionKey]}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback */}
              {showFeedback && selectedOption && (
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className={`w-5 h-5 mt-0.5 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {isCorrect ? '✅ Correct!' : '❌ Not quite'}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentRule.learn.feedback[selectedOption]}
                      </p>
                      {!isCorrect && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Correct answer: {currentRule.learn.correct}</strong> - {currentRule.learn.options[currentRule.learn.correct]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    disabled={currentRuleIndex === 0 && phase === 'learn'}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {isCorrect && (
                    <button
                      onClick={handleNextFromLearn}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                    >
                      <span>Apply This Rule</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPLY PHASE */}
        {phase === 'apply' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Reference Story */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-600 dark:border-blue-400 p-6">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">Reference User Story:</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-100 italic">{currentRule.learn.referenceStory}</p>
                  </div>
                </div>
              </div>

              {/* Rule Header */}
              <div className="p-6 border-b-2 border-indigo-700 dark:border-0 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-600">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">✍️</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Apply: {currentRule.name}
                  </h2>
                </div>
              </div>

              {/* Scenario */}
              <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">New Scenario:</h3>
                    <p className="text-gray-800 dark:text-gray-200 italic">{currentRule.apply.scenario}</p>
                  </div>
                </div>
              </div>

              {/* Writing Input */}
              <div className="p-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {currentRule.apply.prompt}
                </label>
                <textarea
                  value={applyText}
                  onChange={(e) => setApplyText(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full min-h-[120px] px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={4}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {saving ? '💾 Saving...' : applyText.trim() ? '✓ Auto-saved' : 'Start typing to auto-save'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {applyText.length} characters
                  </p>
                </div>
              </div>

              {/* Reflection Question */}
              {applyText.trim() && (
                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Quick Reflection: Does your answer focus on what the user can do?
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'yes', label: '✅ Yes', color: 'green' },
                      { value: 'no', label: '❌ No', color: 'red' },
                      { value: 'not-sure', label: '🤔 Not sure', color: 'yellow' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setReflectionChoice(option.value as any)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          reflectionChoice === option.value
                            ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20 text-${option.color}-800 dark:text-${option.color}-200`
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Previous
                  </button>

                  <button
                    onClick={handleNextFromApply}
                    disabled={!applyText.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    <span>{isLastRule ? 'Complete Framework' : 'Next Rule'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

