import { useState } from "react";
import { CheckCircle, ArrowRight, RotateCcw, FileText, Eye, Target, AlertCircle, Lightbulb, Users, Zap, Award, Bell, ChevronRight, Home } from "lucide-react";
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
  // Use the new walkthrough content with detailed, teaching-focused explanations
  return WalkthroughContent.acWalkthrough.map((rule, index) => {
    let badExplanation = "";
    let goodExplanation1 = "";
    let goodExplanation2 = "";

    // Detailed explanations for each rule
    switch(index) {
      case 0: // One expectation per AC
        badExplanation = "This combines THREE separate expectations (auto-save, resume, and no errors) into one AC. If testing fails, you won't know which part broke. Each expectation should be its own AC so it can be tested independently.";
        goodExplanation1 = "Perfect! This AC tests ONE thing: auto-save triggers and shows confirmation. It's specific, testable, and if it fails, you know exactly what broke.";
        goodExplanation2 = "Excellent! This AC focuses on ONE behavior: resuming at the last saved step. It's clear, testable, and separate from the auto-save trigger.";
        break;
      case 1: // Make it observable and measurable
        badExplanation = "'Quickly' is subjective and vague. What's quick to one person might be slow to another. How do testers verify this? Without an observable action or specific measurement, this AC is untestable.";
        goodExplanation1 = "Perfect! This AC is observable - the tester can SEE the confirmation message. It's measurable - either the message appears or it doesn't. No subjectivity, clear pass/fail.";
        goodExplanation2 = "Great! This provides an observable outcome that anyone can verify. The confirmation is either there or it isn't - no room for interpretation.";
        break;
      case 2: // State preconditions and postconditions
        badExplanation = "This is too vague. Resume from where? What progress? Starting from what state? Without the precondition (Given), testers can't reproduce the scenario reliably. Always state the starting condition.";
        goodExplanation1 = "Excellent! This follows Given-When-Then: GIVEN (previously saved Step 3) sets the starting state, WHEN (I return) is the action, THEN (land on Step 3 with prefilled fields) is the expected result. Fully reproducible!";
        goodExplanation2 = "Perfect! The Given clause establishes the precondition, making this AC reproducible. Any tester can set up the same starting state and verify the outcome.";
        break;
      case 3: // Cover unhappy and edge paths
        badExplanation = "This only covers the happy path. What about when upload FAILS? Most bugs hide in error cases. Real users will try unsupported files, oversized files, no internet connection, etc. ACs must cover these.";
        goodExplanation1 = "Perfect! This covers an unhappy path: unsupported file type. It specifies the error message AND the system behavior (do not upload). This is where most real-world bugs are caught.";
        goodExplanation2 = "Excellent! This covers an edge case: file too large. It defines the limit (10 MB), the error message, and the expected behavior. Prevents system crashes and poor UX.";
        break;
      case 4: // Avoid UI/implementation details
        badExplanation = "This describes HOW the UI looks (green button, top right position) instead of WHAT behavior happens. If designers change the button color or position, this AC becomes outdated. Focus on behavior, not UI specifics.";
        goodExplanation1 = "Perfect! This describes the BEHAVIOR (auto-save after inactivity, visible confirmation) without dictating UI specifics. Designers have freedom to implement it beautifully while still meeting the requirement.";
        goodExplanation2 = "Great! Focuses on the outcome and behavior, not the specific UI implementation. This gives the team flexibility while ensuring the user gets the value.";
        break;
      case 5: // Include data rules and limits
        badExplanation = "No limits specified! This opens security risks (users could upload gigabytes), performance issues (system crashes), and UX problems (users wait forever). Always define boundaries for data inputs.";
        goodExplanation1 = "Perfect! This sets a clear boundary (10 MB max) and defines what happens when violated (rejection + error). Prevents system abuse, crashes, and unclear UX. Testable and secure.";
        goodExplanation2 = "Excellent! Defines allowed formats explicitly. QA can test with .exe, .zip, .mp4 files and verify they're rejected. Prevents security issues and bad UX.";
        break;
      case 6: // Cover validation and business rules
        badExplanation = "Accepting ANY date value is dangerous. Users could enter future dates for birthdate, dates from year 1, or invalid formats. Business rules must be explicitly stated in ACs to ensure proper validation.";
        goodExplanation1 = "Perfect! This AC defines a clear business rule: date of birth cannot be in the future. It's logical, testable, and prevents nonsensical data. QA knows exactly what to validate.";
        goodExplanation2 = "Excellent! This captures a business rule with a conditional: expense must not exceed limit UNLESS justification is provided. Clear logic for testers and developers.";
        break;
      case 7: // Trace to the user and value
        badExplanation = "This describes a technical change (database index) without explaining the user benefit. ACs should focus on what the USER experiences and values, not backend implementation. Developers need to know WHY, not just WHAT.";
        goodExplanation1 = "Perfect! This AC describes the outcome from the USER's perspective: filter by priority, see matching tickets, see total count. The user gets value. The technical implementation is flexible.";
        goodExplanation2 = "Excellent! Describes what the user can do and what value they get, without mentioning technical details. Keeps focus on user outcomes.";
        break;
    }

    return {
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
          explanation: badExplanation
        },
        {
          value: "B", 
          text: rule.goodExamples[0],
          correct: true,
          explanation: goodExplanation1
        },
        {
          value: "C",
          text: rule.goodExamples[1] || "Another good example",
          correct: true,
          explanation: goodExplanation2
        }
      ]
    };
  });
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

  const getUserStoryForScenario = () => {
    if (scenarioId === 'childcare-voucher') {
      return 'As a parent applying for childcare vouchers, I want to save my application progress midway, so that I don\'t have to start over if I need to gather documents or take a break.';
    } else if (scenarioId === 'student-homework') {
      return 'As a Year 11 student uploading homework, I want to see clear error messages when my file upload fails, so that I know exactly what went wrong and can fix it before the deadline.';
    } else if (scenarioId === 'shopping-checkout') {
      return 'As a tenant paying rent online, I want instant confirmation that my payment went through, so that I know my rent is paid and I can see my payment history clearly.';
    }
    return 'As a user, I want to complete this action, so that I can achieve my goal.';
  };

  return (
    <div className="content-root min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Requirements Specification
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={onBack}
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Training Pods
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">Acceptance Criteria Walkthrough</span>
        </nav>

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

        {/* User Story Context */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-600 dark:border-blue-400 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  User Story for this Walkthrough:
                </h3>
                <p className="text-base text-blue-800 dark:text-blue-100 italic leading-relaxed">
                  "{getUserStoryForScenario()}"
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
                  You're writing acceptance criteria to define when this story is "done"
                </p>
              </div>
            </div>
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

