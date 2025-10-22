import { useState, useEffect } from 'react';
import { Target, Award, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { RULES, RULE_ORDER, RuleKey } from '../../config/rules';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ENABLE_AI_FEEDBACK } from '../../config/app';
import { localValidation } from '../../utils/localValidation';
import { checkResponseWithAI } from '../../services/aiFeedbackService';
import FeedbackPanel from './FeedbackPanel';

interface BAFrameworkPracticeProps {
  onComplete?: () => void;
}

export default function BAFrameworkPractice({ onComplete }: BAFrameworkPracticeProps) {
  const { user } = useAuth();
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [applyText, setApplyText] = useState('');
  const [reflectionChoice, setReflectionChoice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localHint, setLocalHint] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [exampleAnswer, setExampleAnswer] = useState<string | null>(null);
  const [completedRules, setCompletedRules] = useState<Set<number>>(new Set());

  const currentRuleKey = RULE_ORDER[currentRuleIndex] as RuleKey;
  const currentRule = RULES[currentRuleKey];
  const isLastRule = currentRuleIndex === RULE_ORDER.length - 1;
  const progress = ((currentRuleIndex + 1) / RULE_ORDER.length) * 100;

  const handleSubmitApply = async () => {
    if (!applyText.trim()) {
      alert('Please write your answer before submitting.');
      return;
    }

    setSubmitted(true);
    setLocalHint(null);
    setAiFeedback(null);
    setExampleAnswer(null);

    // Step 1: Local validation (instant)
    const localResult = localValidation(currentRule.name, applyText);
    
    if (!localResult.ok) {
      setLocalHint(localResult.hint || 'Please review your answer.');
    }

    // Step 2: AI feedback (if enabled)
    if (ENABLE_AI_FEEDBACK) {
      setLoadingAI(true);
      try {
        const aiResult = await checkResponseWithAI(
          currentRule.name,
          currentRule.learn.referenceStory,
          applyText
        );
        setAiFeedback(aiResult.feedback);
        setAiScore(aiResult.score);
      } catch (error) {
        console.error('AI feedback error:', error);
      } finally {
        setLoadingAI(false);
      }
    }

    // Step 3: Show example answer
    setExampleAnswer(currentRule.apply.exampleAnswer);
  };

  const handleNextRule = async () => {
    if (!reflectionChoice) {
      alert('Please select how close your answer was to the example.');
      return;
    }

    // Save final response
    await saveResponseFinal();

    // Mark rule as completed
    setCompletedRules(prev => new Set(prev).add(currentRuleIndex));

    if (isLastRule) {
      // All done
      onComplete?.();
    } else {
      // Move to next rule
      setCurrentRuleIndex(prev => prev + 1);
      setApplyText('');
      setReflectionChoice(null);
      setSubmitted(false);
      setLocalHint(null);
      setAiFeedback(null);
      setExampleAnswer(null);
      setAiScore(null);
    }
  };

  const saveResponseFinal = async () => {
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
          score: aiScore,
          ai_feedback: aiFeedback,
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

  const handlePrevious = () => {
    if (currentRuleIndex > 0) {
      setCurrentRuleIndex(prev => prev - 1);
      setApplyText('');
      setReflectionChoice(null);
      setSubmitted(false);
      setLocalHint(null);
      setAiFeedback(null);
      setExampleAnswer(null);
      setAiScore(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Test Your Knowledge
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Apply all 10 BA thinking rules to real scenarios
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Rule {currentRuleIndex + 1} of {RULE_ORDER.length}: {currentRule.name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Rule Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <span className="text-2xl">✍️</span>
            <span>Rule {currentRuleIndex + 1}: {currentRule.name}</span>
          </h3>
        </div>

        {/* Scenario */}
        <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Scenario:</h4>
          <p className="text-gray-800 dark:text-gray-200 italic">{currentRule.apply.scenario}</p>
        </div>

        {/* Writing Area */}
        <div className="p-6">
          <label className="block font-semibold text-gray-900 dark:text-white mb-3">
            {currentRule.apply.prompt}
          </label>
          <textarea
            value={applyText}
            onChange={(e) => setApplyText(e.target.value)}
            placeholder="Type your answer here..."
            disabled={submitted}
            className="w-full min-h-[120px] px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none disabled:opacity-60"
            rows={4}
          />

          {/* Submit Button */}
          {!submitted && applyText.trim() && (
            <div className="mt-4">
              <button
                onClick={handleSubmitApply}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold"
              >
                <Sparkles className="w-5 h-5" />
                <span>Check My Answer</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback */}
        {submitted && (
          <div className="px-6 pb-6">
            <FeedbackPanel
              localHint={localHint || undefined}
              aiFeedback={aiFeedback || undefined}
              exampleAnswer={exampleAnswer || undefined}
              loading={loadingAI}
              onReflectionSelect={setReflectionChoice}
              onNext={handleNextRule}
            />
          </div>
        )}

        {/* Navigation */}
        {!submitted && (
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentRuleIndex === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              Previous Rule
            </button>
          </div>
        )}
      </div>

      {/* Completion Celebration */}
      {completedRules.size === RULE_ORDER.length && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-2xl border-2 border-green-500 shadow-xl text-center animate-fadeIn">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Excellent Work!
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            You've completed all 10 Acceptance Criteria Thinking Framework rules. Your responses have been saved!
          </p>
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            Continue to Advanced Practice
          </button>
        </div>
      )}
    </div>
  );
}

