import { useState } from "react";
import { CheckCircle, ArrowRight, RotateCcw, FileText, Eye, Target, AlertCircle, Lightbulb, Users, Zap, Award, Bell } from "lucide-react";

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
  if (scenarioId === 'shopping-checkout') {
    return [
      {
        id: 1,
        title: "Make It User-Observable",
        description: "AC should describe what the user sees, hears, or does — not what the system does. Avoid \"The system should...\". Focus on user-facing outcomes.",
        icon: <Eye className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        scenario: "You are building a payment failure handling system. When a payment fails, users need clear guidance.",
        options: [
          {
            value: "A",
            text: "The system logs the failed transaction to the backend.",
            correct: false,
            explanation: "It explains backend logic, not what the user sees."
          },
          {
            value: "B",
            text: "I see a clear message that says \"Payment failed. Please check your card details or try again.\"",
            correct: true,
            explanation: "It clearly describes what the user sees and what happens."
          },
          {
            value: "C",
            text: "Retry logic is implemented using a fallback payment service.",
            correct: false,
            explanation: "This is technical implementation, not user-facing behavior."
          }
        ]
      },
      {
        id: 2,
        title: "Clear Outcome",
        description: "Each AC should have a specific, measurable outcome. Avoid vague terms like \"should work\" or \"properly\". Be concrete about what success looks like.",
        icon: <Target className="w-6 h-6" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        scenario: "Payment failure handling needs to guide users to next steps.",
        options: [
          {
            value: "A",
            text: "A message is displayed and user is given retry option",
            correct: true,
            explanation: "Clear outcome: user sees message and can retry."
          },
          {
            value: "B",
            text: "System flags the payment attempt",
            correct: false,
            explanation: "System behavior, not user outcome."
          },
          {
            value: "C",
            text: "Payment gateway sends response code",
            correct: false,
            explanation: "Technical detail, not user-facing outcome."
          }
        ]
      },
      {
        id: 3,
        title: "One Expectation Per AC",
        description: "Each AC should test one thing. If you find yourself using \"and\" or listing multiple conditions, split it into separate ACs.",
        icon: <AlertCircle className="w-6 h-6" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        scenario: "Payment failure handling should be focused and clear.",
        options: [
          {
            value: "A",
            text: "Show error message, send confirmation email, log the issue",
            correct: false,
            explanation: "Multiple actions in one AC - should be split."
          },
          {
            value: "B",
            text: "I see a single error message if payment fails",
            correct: true,
            explanation: "One clear expectation: user sees error message."
          },
          {
            value: "C",
            text: "Payment error is handled quickly and professionally",
            correct: false,
            explanation: "Too vague - what does 'quickly and professionally' mean?"
          }
        ]
      },
      {
        id: 4,
        title: "Edge Cases",
        description: "Consider what happens in unusual situations. What if the user has no internet? What if they enter invalid data? What if the system is slow?",
        icon: <Lightbulb className="w-6 h-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        scenario: "Payment failures can happen for various reasons - network issues, card problems, etc.",
        options: [
          {
            value: "A",
            text: "If the card expires during checkout, I am told to update it",
            correct: true,
            explanation: "Specific edge case with clear user guidance."
          },
          {
            value: "B",
            text: "Use a payment fallback if latency is detected",
            correct: false,
            explanation: "System behavior, not user-facing edge case handling."
          },
          {
            value: "C",
            text: "Gateway returns 504",
            correct: false,
            explanation: "Technical error code, not user experience."
          }
        ]
      },
      {
        id: 5,
        title: "Error Handling",
        description: "What happens when things go wrong? Users should never be left confused or stuck. Always provide a path forward.",
        icon: <AlertCircle className="w-6 h-6" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        scenario: "When payment fails, users need clear guidance on what to do next.",
        options: [
          {
            value: "A",
            text: "If payment fails, I am told why and offered another option",
            correct: true,
            explanation: "Clear error handling with guidance and alternatives."
          },
          {
            value: "B",
            text: "Payment fails, user restarts",
            correct: false,
            explanation: "No explanation or guidance - leaves user confused."
          },
          {
            value: "C",
            text: "Send alert to support",
            correct: false,
            explanation: "System action, not user-facing error handling."
          }
        ]
      },
      {
        id: 6,
        title: "Acceptance Criteria Format",
        description: "Use \"If... then...\" or \"When... I...\" format. Start with the condition, then describe the expected outcome. Make it readable for non-technical stakeholders.",
        icon: <FileText className="w-6 h-6" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        scenario: "Payment failure messages should follow clear format patterns.",
        options: [
          {
            value: "A",
            text: "If my payment fails, I see an error with next steps",
            correct: true,
            explanation: "Proper 'If... I...' format with clear outcome."
          },
          {
            value: "B",
            text: "Payment outcome is determined based on token validation",
            correct: false,
            explanation: "Technical language, not user-focused format."
          },
          {
            value: "C",
            text: "Failover logic triggers within 2 seconds",
            correct: false,
            explanation: "System behavior, not user-facing format."
          }
        ]
      },
      {
        id: 7,
        title: "Business Rule Inclusion",
        description: "Include relevant business rules and constraints. What are the limits? What's not allowed? What are the business policies?",
        icon: <Users className="w-6 h-6" />,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        scenario: "Payment retry attempts should follow business rules.",
        options: [
          {
            value: "A",
            text: "I can retry payment up to 3 times before being redirected",
            correct: true,
            explanation: "Clear business rule with specific limit and outcome."
          },
          {
            value: "B",
            text: "Users must be redirected after failure",
            correct: false,
            explanation: "Too vague - when? how many attempts?"
          },
          {
            value: "C",
            text: "The system limits retries",
            correct: false,
            explanation: "System behavior, not user-facing business rule."
          }
        ]
      },
      {
        id: 8,
        title: "Testable",
        description: "Can a tester verify this without asking a developer? Can they see it, click it, or experience it? Avoid ACs that require code inspection.",
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        scenario: "Payment failure handling should be easily testable by QA.",
        options: [
          {
            value: "A",
            text: "I see a message and a \"Retry Payment\" button if payment fails",
            correct: true,
            explanation: "Easily testable - tester can see message and button."
          },
          {
            value: "B",
            text: "Backend triggers new API call",
            correct: false,
            explanation: "Requires backend access or code inspection."
          },
          {
            value: "C",
            text: "Payment fails and logs are captured",
            correct: false,
            explanation: "Requires log access, not user-facing testable behavior."
          }
        ]
      }
    ];
  }

  // Default childcare voucher scenario
  return [
  {
    id: 1,
    title: "Make It User-Observable",
    description: "AC should describe what the user sees, hears, or does — not what the system does. Avoid \"The system should...\". Focus on user-facing outcomes.",
    icon: <Eye className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    scenario: "You are building a checkout form. Users must enter a valid UK postcode before continuing.",
    options: [
      {
        value: "A",
        text: "The system should validate UK postcodes against the database and reject bad entries.",
        correct: false,
        explanation: "It explains backend logic, not what the user sees."
      },
      {
        value: "B",
        text: "If the postcode is invalid, I am told \"Enter a valid UK postcode\" and I cannot continue.",
        correct: true,
        explanation: "It clearly describes what the user sees and what happens."
      },
      {
        value: "C",
        text: "Validate all postcode fields before submission.",
        correct: false,
        explanation: "It lacks user-observable behavior and wording."
      }
    ]
  },
  {
    id: 2,
    title: "One Behavior Per Line",
    description: "Split out actions like edit/delete into separate lines. Each AC should test one specific behavior.",
    icon: <Target className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    scenario: "Users can manage their saved addresses in their profile. They need to edit or delete addresses.",
    options: [
      {
        value: "A",
        text: "I can edit or delete my saved addresses from my profile page.",
        correct: false,
        explanation: "This combines two different behaviors into one AC. Should be split."
      },
      {
        value: "B",
        text: "I can edit my saved addresses by clicking the edit button next to each address.",
        correct: true,
        explanation: "Focuses on one specific behavior - editing addresses."
      },
      {
        value: "C",
        text: "I can manage my address information.",
        correct: false,
        explanation: "Too vague. 'Manage' could mean many different things."
      }
    ]
  },
  {
    id: 3,
    title: "Lead with Happy Path",
    description: "What happens when things go right? Start with the successful scenario before covering errors.",
    icon: <CheckCircle className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    scenario: "Users are uploading a profile photo. The system needs to handle both successful uploads and errors.",
    options: [
      {
        value: "A",
        text: "If the file is too large, I see an error message and cannot upload.",
        correct: false,
        explanation: "Starts with the error case instead of the happy path."
      },
      {
        value: "B",
        text: "When I select a valid image file, I see a preview and can confirm the upload.",
        correct: true,
        explanation: "Leads with the successful scenario - what happens when it works."
      },
      {
        value: "C",
        text: "The system processes image uploads and handles errors appropriately.",
        correct: false,
        explanation: "Too vague and doesn't focus on user experience."
      }
    ]
  },
  {
    id: 4,
    title: "Make Rules Explicit",
    description: "Be specific with formats, numbers, messages. Avoid vague terms like 'appropriate' or 'reasonable'.",
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    scenario: "Users need to enter their phone number during registration. The system should validate the format.",
    options: [
      {
        value: "A",
        text: "I must enter a valid phone number in the correct format.",
        correct: false,
        explanation: "What is 'correct format'? Too vague - needs specific details."
      },
      {
        value: "B",
        text: "I must enter a UK phone number starting with 07, followed by 9 digits (e.g., 07123456789).",
        correct: true,
        explanation: "Specific format, example, and clear requirements."
      },
      {
        value: "C",
        text: "The system validates phone numbers appropriately.",
        correct: false,
        explanation: "Uses vague language like 'appropriately' - not testable."
      }
    ]
  },
  {
    id: 5,
    title: "Include Error & Recovery",
    description: "Not just \"show error\" — what happens next? How does the user recover from the error?",
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    scenario: "Users are trying to log in but enter the wrong password. The system needs to handle this gracefully.",
    options: [
      {
        value: "A",
        text: "If I enter the wrong password, I see an error message.",
        correct: false,
        explanation: "Shows the error but doesn't explain how to recover from it."
      },
      {
        value: "B",
        text: "If I enter the wrong password, I see \"Incorrect password\" and can try again or reset it.",
        correct: true,
        explanation: "Shows the error AND provides clear recovery options."
      },
      {
        value: "C",
        text: "The system handles login errors properly.",
        correct: false,
        explanation: "Too vague - doesn't specify what the user experiences."
      }
    ]
  },
  {
    id: 6,
    title: "Cover Edge Cases",
    description: "Low data, missing fields, double clicks, bad networks. Think about what could go wrong.",
    icon: <Users className="w-6 h-6" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    scenario: "Users are submitting a form on a mobile device with poor network connection.",
    options: [
      {
        value: "A",
        text: "When I submit the form, it processes my request.",
        correct: false,
        explanation: "Doesn't consider what happens with poor network - the edge case."
      },
      {
        value: "B",
        text: "If my connection is lost while submitting, I see \"Connection lost\" and can retry when back online.",
        correct: true,
        explanation: "Specifically addresses the edge case of poor network connectivity."
      },
      {
        value: "C",
        text: "The form submission works reliably.",
        correct: false,
        explanation: "Assumes everything works perfectly - doesn't cover edge cases."
      }
    ]
  },
  {
    id: 7,
    title: "Measurable Outcomes",
    description: "Can QA verify it with a stopwatch, eyes, or count? Make it objectively testable.",
    icon: <Zap className="w-6 h-6" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    scenario: "Users expect the app to load quickly. The system needs to meet performance expectations.",
    options: [
      {
        value: "A",
        text: "The app loads quickly and feels responsive.",
        correct: false,
        explanation: "'Quickly' and 'responsive' are subjective - not measurable."
      },
      {
        value: "B",
        text: "The app loads within 3 seconds on a 3G connection.",
        correct: true,
        explanation: "Specific, measurable criteria that QA can test with a stopwatch."
      },
      {
        value: "C",
        text: "The system performs well under normal conditions.",
        correct: false,
        explanation: "'Well' and 'normal' are vague - not objectively testable."
      }
    ]
  },
  {
    id: 8,
    title: "Visibility & Notifications",
    description: "Who sees what and when? Be clear about who gets notified and how.",
    icon: <Bell className="w-6 h-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    scenario: "A user submits a support ticket. The system needs to notify the right people.",
    options: [
      {
        value: "A",
        text: "The system sends notifications to the support team.",
        correct: false,
        explanation: "Doesn't specify what the user sees or when they get confirmation."
      },
      {
        value: "B",
        text: "After submitting, I see \"Ticket #1234 created\" and receive an email confirmation. The support team is notified.",
        correct: true,
        explanation: "Clear about who sees what: user gets confirmation, team gets notified."
      },
      {
        value: "C",
        text: "Notifications are sent to relevant parties.",
        correct: false,
        explanation: "Too vague - who are 'relevant parties' and what do they see?"
      }
    ]
  }
];

export default function AcceptanceCriteriaWalkthrough({ onStartPractice, onBack, scenarioId }: AcceptanceCriteriaWalkthroughProps) {
  const [currentRule, setCurrentRule] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  const rules = getRulesForScenario(scenarioId);
  const progress = ((currentRule + 1) / rules.length) * 100;

  const handleSelect = (value: string) => {
    setSelectedAnswers({ ...selectedAnswers, [currentRule]: value });
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentRule < rules.length - 1) {
      setCurrentRule(currentRule + 1);
      setShowExplanation(false);
    }
  };

  const handleBack = () => {
    if (currentRule > 0) {
      setCurrentRule(currentRule - 1);
      setShowExplanation(false);
    }
  };

  const resetWalkthrough = () => {
    setCurrentRule(0);
    setSelectedAnswers({});
    setShowExplanation(false);
  };

  const currentRuleData = rules[currentRule];
  const selectedAnswer = selectedAnswers[currentRule];

  // Show completion screen
  if (currentRule >= rules.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎉 You've Mastered the 8 AC Rules!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You now understand how to write clear, testable acceptance criteria
          </p>
        </div>

        {/* Complete AC Set Example */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Complete AC Set Example</h2>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">User Story: Save Progress on Form</h3>
            <div className="space-y-3 text-sm">
              <p><strong>1.</strong> When I click "Save Progress", I see "Progress saved" and can continue later.</p>
              <p><strong>2.</strong> If my connection is lost while saving, I see "Save failed - retry?" and can try again.</p>
              <p><strong>3.</strong> When I return, I see my previously entered data and can continue where I left off.</p>
              <p><strong>4.</strong> I can save progress up to 3 times per session.</p>
              <p><strong>5.</strong> Saved progress expires after 7 days and I'm notified before it expires.</p>
            </div>
          </div>
        </div>

        {/* Reflection Box */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
              Ready for Real Practice?
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm mb-4">
              You've learned all 8 rules. Now you can write your own acceptance criteria with confidence!
            </p>
          </div>
        </div>

        {/* Final Actions */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={onStartPractice}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Practice
            </button>
            <button
              onClick={resetWalkthrough}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Review Rules Again
            </button>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mx-auto"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Training Pods</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Acceptance Criteria Walkthrough
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Master the 8 rules of writing clear, testable acceptance criteria
        </p>
      </div>

      {/* Scenario Context */}
      {scenarioId && (
        <div className="mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              📋 Scenario Context:
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {scenarioId === 'shopping-checkout' 
                ? 'A shopper using mobile data tries to pay at checkout but the payment fails. They want to know why and what to do next.'
                : 'Parents often abandon the voucher application form midway because it\'s too long and they don\'t always have the right documents. They want a "Save Progress" feature.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Rule {currentRule + 1} of {rules.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Rule Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 mb-8">
        {/* Rule Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-12 h-12 ${currentRuleData.bgColor} rounded-xl flex items-center justify-center ${currentRuleData.color} shadow-md`}>
            {currentRuleData.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Rule {currentRuleData.id}: {currentRuleData.title}
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
          </div>
        </div>

        {/* Rule Description */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentRuleData.description}
          </p>
        </div>

        {/* Scenario */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📋 Scenario:</h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            {currentRuleData.scenario}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentRuleData.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={showExplanation}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === option.value
                  ? option.correct
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${showExplanation ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === option.value
                    ? option.correct
                      ? 'border-green-500 bg-green-500'
                      : 'border-red-500 bg-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedAnswer === option.value && <div className="w-3 h-3 bg-white rounded-full" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">{option.value}.</span>
                    <span className="text-gray-900 dark:text-white">{option.text}</span>
                    {selectedAnswer === option.value && (
                      <span className={`ml-auto text-sm font-semibold ${
                        option.correct ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {option.correct ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {showExplanation && selectedAnswer && (
          <div className="space-y-4">
            {currentRuleData.options.map((option) => (
              selectedAnswer === option.value && (
                <div key={option.value} className={`p-4 rounded-lg border ${
                  option.correct
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start space-x-2">
                    {option.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`font-semibold mb-1 ${
                        option.correct
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {option.correct ? '✅ Correct:' : '❌ Incorrect:'}
                      </p>
                      <p className={`text-sm ${
                        option.correct
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {option.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Learning</span>
        </button>

        <div className="flex items-center space-x-4">
          <button
            onClick={resetWalkthrough}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {currentRule > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back</span>
            </button>
          )}

          {showExplanation && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>{currentRule === rules.length - 1 ? 'Complete' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
