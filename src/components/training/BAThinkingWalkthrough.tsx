import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Target, Lightbulb, AlertCircle, Home, ChevronRight, FileText, Award, Sparkles } from 'lucide-react';
import { RULES, RULE_ORDER, RuleKey } from '../../config/rules';
import { SCENARIO_CONTENT } from '../../config/scenarioContent';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ENABLE_AI_FEEDBACK } from '../../config/app';
import { localValidation } from '../../utils/localValidation';
import { checkResponseWithAI } from '../../services/aiFeedbackService';
import FeedbackPanel from './FeedbackPanel';

interface BAThinkingWalkthroughProps {
  onComplete: () => void;
  onBack: () => void;
  scenarioId?: string;
}

type Phase = 'learn' | 'apply';

export default function BAThinkingWalkthrough({ onComplete, onBack, scenarioId }: BAThinkingWalkthroughProps) {
  console.log('🔍 DEBUG: BAThinkingWalkthrough rendered with scenarioId:', scenarioId);
  const { user } = useAuth();
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('learn');
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [applyText, setApplyText] = useState('');
  const [reflectionChoice, setReflectionChoice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localHint, setLocalHint] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [exampleAnswer, setExampleAnswer] = useState<string | null>(null);

  const currentRuleKey = RULE_ORDER[currentRuleIndex] as RuleKey;
  
  // Get scenario-specific content or fallback to default rules
  const getCurrentRule = () => {
    console.log('🔍 DEBUG: getCurrentRule called with scenarioId:', scenarioId, 'currentRuleKey:', currentRuleKey);
    if (scenarioId && SCENARIO_CONTENT[scenarioId] && SCENARIO_CONTENT[scenarioId][currentRuleKey]) {
      console.log('🔍 DEBUG: Using scenario-specific content for', scenarioId, currentRuleKey);
      return SCENARIO_CONTENT[scenarioId][currentRuleKey];
    }
    console.log('🔍 DEBUG: Using default rules for', currentRuleKey);
    return RULES[currentRuleKey];
  };
  
  const currentRule = getCurrentRule();
  console.log('🔍 DEBUG: currentRule referenceStory:', currentRule.learn.referenceStory);
  const isLastRule = currentRuleIndex === RULE_ORDER.length - 1;
  const progress = ((currentRuleIndex + 1) / RULE_ORDER.length) * 100;

  const getUserStoryForScenario = () => {
    console.log('🔍 DEBUG: getUserStoryForScenario called with scenarioId:', scenarioId);
    if (scenarioId === 'childcare-voucher') {
      console.log('🔍 DEBUG: Using childcare-voucher story');
      return 'As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don\'t have to start over if I need to gather documents or take a break.';
    } else if (scenarioId === 'customer-service') {
      console.log('🔍 DEBUG: Using customer-service story');
      return 'As a customer service representative handling support tickets, I want to see the customer\'s complete interaction history when they call, so that I can provide personalized assistance without asking them to repeat their story.';
    } else if (scenarioId === 'shopping-checkout') {
      console.log('🔍 DEBUG: Using shopping-checkout story');
      return 'As a tenant officer, I want to record when a tenant moves out so I can trigger the inspection.';
    }
    console.log('🔍 DEBUG: Using default story');
    return 'As a user, I want to complete this action, so that I can achieve my goal.';
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
    const scenarioExamples: Record<string, Record<string, string>> = {
      'student-homework': {
        'User Goal': "The student can see clear, actionable error messages during upload (e.g., 'PDF only, max 10MB').",
        'Trigger': "When the student selects a file and clicks 'Upload', validation begins immediately.",
        'Primary Flow': "Student selects file → clicks Upload → system validates type/size → shows progress → success message appears with timestamp.",
        'Alternative Flow': "Student drags-and-drops the file into the upload area instead of using the file picker; flow still completes.",
        'Rules & Validation': "Only PDF/DOCX allowed; max size 10MB; filenames must be alphanumeric with hyphens/underscores; no spaces.",
        'Roles & Permissions': "Only logged-in students can upload to their own assignment; teachers can view submissions; admins cannot upload on behalf of students.",
        'Success Feedback': "Show green banner: 'Upload successful' with file name, size, and submission time.",
        'Error Handling': "If upload fails due to size/type, show red banner with reason and 'Try Again' button.",
        'Empty State': "Show guidance: 'No files uploaded yet. Drag a PDF or DOCX here or click to browse.'",
        'Cancel/Undo': "Allow 'Replace file' within 60 seconds to undo the last upload and submit a new one."
      }
    };

    const exampleFromScenario = scenarioId && scenarioExamples[scenarioId]?.[currentRule.name];
    setExampleAnswer(exampleFromScenario || currentRule.apply.exampleAnswer);
  };

  const handleNextFromApply = async () => {
    if (!reflectionChoice) {
      alert('Please select how close your answer was to the example.');
      return;
    }

    // Save final response with all data
    await saveResponseFinal();

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumbs - Modern floating style */}
        <nav className="flex items-center space-x-2 text-sm mb-8 max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center px-3 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
          >
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Requirements Specification
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
          >
            Requirement Pods
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg">
            Acceptance Criteria Thinking Framework
          </span>
        </nav>

        {/* Header - 2025 style with glassmorphism */}
        <div className="text-center mb-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-3xl mb-6 shadow-2xl shadow-purple-500/30 relative group">
            <Target className="w-10 h-10 text-white relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 dark:from-purple-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent mb-3">
            Acceptance Criteria Thinking Framework
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Master the 10 core rules of Agile BA thinking through interactive learning
          </p>
        </div>

        {/* Progress Bar - Modern glassmorphic design */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {currentRuleIndex + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {currentRule.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {phase === 'learn' ? '📚 Learning Phase' : '✍️ Apply Phase'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Complete</p>
              </div>
            </div>
            <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>


        {/* LEARN PHASE */}
        {phase === 'learn' && (
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl overflow-hidden border border-white/50 dark:border-gray-700/50 transform transition-all duration-500 hover:shadow-purple-500/20 hover:shadow-3xl">
              {/* Reference Story */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-600 dark:border-blue-400 p-6">
                <div className="flex items-start space-x-4">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-blue-900 dark:text-blue-200 mb-2">Reference User Story:</h3>
                    <p className="text-base text-blue-800 dark:text-blue-100 italic leading-relaxed">
                      {currentRule.learn.referenceStory}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rule Header */}
              <div className="relative px-8 py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 dark:from-purple-700 dark:via-indigo-700 dark:to-purple-700">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                    🎯
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Rule {currentRuleIndex + 1}: {currentRule.name}
                    </h2>
                    <p className="text-purple-100 text-sm">Choose the best answer to continue</p>
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="px-8 py-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1.5">
                    {currentRule.learn.question}
                  </h3>
                </div>
              </div>

              {/* Options */}
              <div className="p-8">
                <div className="space-y-4">
                  {(['A', 'B', 'C'] as const).map((optionKey) => {
                    const isSelected = selectedOption === optionKey;
                    const isCorrectOption = optionKey === currentRule.learn.correct;
                    const showResult = showFeedback && isSelected;

                    return (
                      <button
                        key={optionKey}
                        onClick={() => handleLearnSelect(optionKey)}
                        disabled={showFeedback && isCorrect}
                        className={`group relative w-full p-6 rounded-2xl text-left transition-all duration-300 ${
                          showFeedback
                            ? isSelected
                              ? isCorrectOption
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-500 shadow-lg shadow-green-500/20'
                                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-2 border-red-500 shadow-lg shadow-red-500/20'
                              : 'border-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 opacity-50'
                            : isSelected
                            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]'
                            : 'border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg hover:scale-[1.01] hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg transition-all duration-300 ${
                            showFeedback
                              ? isSelected
                                ? isCorrectOption
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'
                                  : 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                              : isSelected
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/50'
                          }`}>
                            {showFeedback && isSelected && isCorrectOption && '✓'}
                            {showFeedback && isSelected && !isCorrectOption && '✗'}
                            {!showFeedback || !isSelected ? optionKey : ''}
                          </div>
                          <div className="flex-1">
                            <p className="text-base leading-relaxed text-gray-900 dark:text-gray-100">{currentRule.learn.options[optionKey]}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback */}
              {showFeedback && selectedOption && (
                <div className="mx-8 mb-8 animate-slideUp">
                  <div className={`rounded-2xl p-6 border-2 ${
                    isCorrect 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500/50 shadow-xl shadow-green-500/20' 
                      : 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-500/50 shadow-xl shadow-red-500/20'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-3 ${
                          isCorrect ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                        }`}>
                          {isCorrect ? 'Excellent! That\'s correct' : 'Not quite - let\'s learn from this'}
                        </h3>
                        <p className={`leading-relaxed mb-4 ${
                          isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {currentRule.learn.feedback[selectedOption]}
                        </p>
                        {!isCorrect && (
                          <div className="mt-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-green-300 dark:border-green-700 shadow-md">
                            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-2">
                              ✓ Correct answer: <span className="text-green-600 dark:text-green-400 font-bold">{currentRule.learn.correct}</span>
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {currentRule.learn.options[currentRule.learn.correct]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="px-8 pb-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevious}
                    disabled={currentRuleIndex === 0 && phase === 'learn'}
                    className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Previous
                  </button>

                  {isCorrect && (
                    <button
                      onClick={handleNextFromLearn}
                      className="group px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center space-x-2 font-semibold relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">Apply This Rule</span>
                      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPLY PHASE */}
        {phase === 'apply' && (
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl overflow-hidden border border-white/50 dark:border-gray-700/50 transform transition-all duration-500">
              {/* Reference Story */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-600 dark:border-blue-400 p-6">
                <div className="flex items-start space-x-4">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-blue-900 dark:text-blue-200 mb-2">Reference User Story:</h3>
                    <p className="text-base text-blue-800 dark:text-blue-100 italic leading-relaxed">
                      {currentRule.learn.referenceStory}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rule Header */}
              <div className="relative px-8 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-700 dark:via-purple-700 dark:to-indigo-700">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg">
                    ✍️
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Apply: {currentRule.name}
                    </h2>
                    <p className="text-indigo-100 text-sm">Write your own answer based on the scenario</p>
                  </div>
                </div>
              </div>

              {/* Scenario */}
              <div className="mx-8 mt-6 mb-6">
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-l-4 border-amber-500 dark:border-amber-400 p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2 text-base">New Scenario:</h3>
                      <p className="text-amber-800 dark:text-amber-100 italic leading-relaxed">{currentRule.apply.scenario}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Writing Input */}
              <div className="px-8 py-6">
                <label className="block text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    ✏️
                  </span>
                  <span>{currentRule.apply.prompt}</span>
                </label>
                <div className="relative">
                  <textarea
                    value={applyText}
                    onChange={(e) => setApplyText(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={submitted}
                    className="w-full min-h-[140px] px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-base leading-relaxed"
                    rows={5}
                  />
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {applyText.length} chars
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                {!submitted && applyText.trim() && (
                  <div className="mt-6 animate-fadeIn">
                    <button
                      onClick={handleSubmitApply}
                      className="group w-full px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center space-x-3 font-bold text-lg relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Sparkles className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="relative z-10">Check My Answer</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Feedback Panel */}
              {submitted && (
                <div className="px-6 pb-6">
                  <FeedbackPanel
                    localHint={localHint || undefined}
                    aiFeedback={aiFeedback || undefined}
                    exampleAnswer={exampleAnswer || undefined}
                    loading={loadingAI}
                    onReflectionSelect={setReflectionChoice}
                    onNext={handleNextFromApply}
                  />
                </div>
              )}

              {/* Navigation (only Previous button when not submitted) */}
              {!submitted && (
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-start">
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Previous
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

