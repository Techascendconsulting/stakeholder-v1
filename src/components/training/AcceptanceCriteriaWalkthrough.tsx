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
  if (scenarioId === 'student-homework') {
    return [
      {
        id: 1,
        title: "User-Observable",
        description: "Does it describe what the student sees or does?",
        icon: <Eye className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        scenario: "You are building a homework upload system. Students need clear feedback on file uploads.",
        options: [
          {
            value: "A",
            text: "System checks MIME type",
            correct: false,
            explanation: "System behavior, not user-facing"
          },
          {
            value: "B",
            text: "I see a message: \"Only PDF or DOC files allowed\"",
            correct: true,
            explanation: "Only the second option shows what the student sees"
          },
          {
            value: "C",
            text: "Backend validates file content type",
            correct: false,
            explanation: "Technical implementation, not user-facing"
          }
        ]
      },
      {
        id: 2,
        title: "Clear Outcome",
        description: "We must know when something worked.",
        icon: <Target className="w-6 h-6" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        scenario: "Homework upload needs to provide clear success feedback.",
        options: [
          {
            value: "A",
            text: "File rejected",
            correct: false,
            explanation: "Vague. Did it work? How would we know?"
          },
          {
            value: "B",
            text: "A red banner appears saying \"Upload failed: Only PDF or DOC allowed\"",
            correct: true,
            explanation: "Outcome should be clear and specific"
          },
          {
            value: "C",
            text: "Try again later",
            correct: false,
            explanation: "No clarity on what went wrong"
          }
        ]
      },
      {
        id: 3,
        title: "One Expectation Per AC",
        description: "Keep it focused — no multi-part ACs.",
        icon: <AlertCircle className="w-6 h-6" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        scenario: "File upload validation should be focused and clear.",
        options: [
          {
            value: "A",
            text: "File must be valid and named correctly and under 5MB",
            correct: false,
            explanation: "Multiple validations in one AC - should be split"
          },
          {
            value: "B",
            text: "If the file type is unsupported, I see an error message",
            correct: true,
            explanation: "Each AC should have one condition and one result"
          },
          {
            value: "C",
            text: "Validation occurs and upload resumes if successful",
            correct: false,
            explanation: "Too many things in one AC"
          }
        ]
      },
      {
        id: 4,
        title: "Edge Cases",
        description: "What happens in unusual situations?",
        icon: <Lightbulb className="w-6 h-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        scenario: "File uploads can fail for various reasons - network issues, server problems, etc.",
        options: [
          {
            value: "A",
            text: "System ignores unsupported files",
            correct: false,
            explanation: "No user guidance - leaves student confused"
          },
          {
            value: "B",
            text: "If I upload an image, I am told: \"Images are not accepted. Please upload a document.\"",
            correct: true,
            explanation: "Edge case handled clearly"
          },
          {
            value: "C",
            text: "Files silently fail",
            correct: false,
            explanation: "No feedback - confusing"
          }
        ]
      },
      {
        id: 5,
        title: "Error Handling",
        description: "Always tell the user what's wrong — clearly.",
        icon: <AlertCircle className="w-6 h-6" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        scenario: "When file upload fails, students need clear guidance on what to do next.",
        options: [
          {
            value: "A",
            text: "File size check runs silently",
            correct: false,
            explanation: "No explanation or guidance - leaves user confused"
          },
          {
            value: "B",
            text: "I see an alert if my file is too large: \"Max size: 5MB\"",
            correct: true,
            explanation: "Always explain the error visibly"
          },
          {
            value: "C",
            text: "Submission fails without explanation",
            correct: false,
            explanation: "No clarity on what went wrong"
          }
        ]
      },
      {
        id: 6,
        title: "IF/THEN Format",
        description: "AC should follow the IF → THEN structure where possible.",
        icon: <FileText className="w-6 h-6" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        scenario: "File upload error messages should follow clear format patterns.",
        options: [
          {
            value: "A",
            text: "Large files not accepted",
            correct: false,
            explanation: "No condition defined"
          },
          {
            value: "B",
            text: "If I upload a file over 5MB, I see: \"File too large. Max 5MB.\"",
            correct: true,
            explanation: "IF/THEN makes logic clear for QA"
          },
          {
            value: "C",
            text: "Upload rejected",
            correct: false,
            explanation: "Vague, untestable"
          }
        ]
      },
      {
        id: 7,
        title: "Business Rules",
        description: "Capture specific policy.",
        icon: <Users className="w-6 h-6" />,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        scenario: "Homework submission should follow academic policies.",
        options: [
          {
            value: "A",
            text: "System accepts common file types",
            correct: false,
            explanation: "Too vague - what are 'common' types?"
          },
          {
            value: "B",
            text: "Only PDF or DOC files under 5MB are accepted for homework uploads",
            correct: true,
            explanation: "Clear, defined rule the system must enforce"
          },
          {
            value: "C",
            text: "Uploads must follow school policy",
            correct: false,
            explanation: "Too vague - what policy?"
          }
        ]
      },
      {
        id: 8,
        title: "Testable",
        description: "Can QA test it? Can a dev confirm it works?",
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        scenario: "Homework upload should be easily testable by QA.",
        options: [
          {
            value: "A",
            text: "System logs message",
            correct: false,
            explanation: "Requires backend access, not user-facing"
          },
          {
            value: "B",
            text: "QA uploads wrong file and sees error",
            correct: true,
            explanation: "Always from the user's point of view"
          },
          {
            value: "C",
            text: "Upload returns false",
            correct: false,
            explanation: "Too backend-focused"
          }
        ]
      }
    ];
  }

  if (scenarioId === 'shopping-checkout') {
    return [
      {
        id: 1,
        title: "User-Observable",
        description: "Which AC line is correct?",
        icon: <Eye className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        scenario: "You are building a rent payment confirmation feature.",
        options: [
          {
            value: "A",
            text: "The system updates the payment database in real-time.",
            correct: false,
            explanation: "System-side behavior, not observable by the tenant"
          },
          {
            value: "B",
            text: "After I pay, I see \"Your rent was received. Confirmation ID: 124A.\"",
            correct: true,
            explanation: "This shows what the user sees"
          },
          {
            value: "C",
            text: "Back-end logs timestamp of successful payment.",
            correct: false,
            explanation: "System-side behavior, not observable by the tenant"
          }
        ]
      },
      {
        id: 2,
        title: "One Behaviour Per Line",
        description: "Which line follows this rule?",
        icon: <Target className="w-6 h-6" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        scenario: "Payment failure handling needs to guide users to next steps.",
        options: [
          {
            value: "A",
            text: "Show confirmation and email the receipt.",
            correct: false,
            explanation: "Multiple behaviors = harder to test"
          },
          {
            value: "B",
            text: "After I pay, I see \"Payment received.\"",
            correct: true,
            explanation: "One action only"
          },
          {
            value: "C",
            text: "Display confirmation, log payment, and notify landlord.",
            correct: false,
            explanation: "Multiple behaviors = harder to test"
          }
        ]
      },
      {
        id: 3,
        title: "Lead With the Happy Path",
        description: "Which AC line starts with a success state?",
        icon: <AlertCircle className="w-6 h-6" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        scenario: "Payment failure handling should be focused and clear.",
        options: [
          {
            value: "A",
            text: "If payment fails, show error.",
            correct: false,
            explanation: "Starts with failure, not success"
          },
          {
            value: "B",
            text: "After I pay rent, I see confirmation message with timestamp.",
            correct: true,
            explanation: "Start with success, then list exceptions"
          },
          {
            value: "C",
            text: "Error message for timeouts is shown first.",
            correct: false,
            explanation: "Starts with error, not success"
          }
        ]
      },
      {
        id: 4,
        title: "Make Rules Explicit",
        description: "Which has clear criteria?",
        icon: <Lightbulb className="w-6 h-6" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        scenario: "Payment failures can happen for various reasons - network issues, card problems, etc.",
        options: [
          {
            value: "A",
            text: "The tenant sees confirmation.",
            correct: false,
            explanation: "Too vague - what confirmation?"
          },
          {
            value: "B",
            text: "After payment, I see \"Payment of £500 received on 28th Sep, 10:02am.\"",
            correct: true,
            explanation: "Shows amount, date, time. All explicit"
          },
          {
            value: "C",
            text: "After payment, a message is shown.",
            correct: false,
            explanation: "Too vague - what message?"
          }
        ]
      },
      {
        id: 5,
        title: "Include Error and Recovery",
        description: "Which line includes recovery?",
        icon: <AlertCircle className="w-6 h-6" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        scenario: "When payment fails, users need clear guidance on what to do next.",
        options: [
          {
            value: "A",
            text: "If payment fails, I am told \"Payment failed.\"",
            correct: false,
            explanation: "No guidance on what to do next"
          },
          {
            value: "B",
            text: "If payment fails, I am told \"Payment failed. Try again or contact support.\"",
            correct: true,
            explanation: "Not just the error, but what to do next"
          },
          {
            value: "C",
            text: "Payment fails.",
            correct: false,
            explanation: "No explanation or guidance"
          }
        ]
      },
      {
        id: 6,
        title: "Predictable Edge Cases",
        description: "Which handles low-data issues?",
        icon: <FileText className="w-6 h-6" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        scenario: "Payment failure messages should follow clear format patterns.",
        options: [
          {
            value: "A",
            text: "After payment, I get confirmation.",
            correct: false,
            explanation: "Doesn't handle network issues"
          },
          {
            value: "B",
            text: "If network drops after payment, I am told \"Still processing, check status in history.\"",
            correct: true,
            explanation: "Covers real-world problem of network failure"
          },
          {
            value: "C",
            text: "If I click Submit twice, payment logs both times.",
            correct: false,
            explanation: "Doesn't handle network issues"
          }
        ]
      },
      {
        id: 7,
        title: "Make Pass/Fail Measurable",
        description: "Which line is measurable?",
        icon: <Users className="w-6 h-6" />,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        scenario: "Payment retry attempts should follow business rules.",
        options: [
          {
            value: "A",
            text: "After payment, confirmation shows within 10 seconds.",
            correct: true,
            explanation: "Has a timeframe. QA can measure"
          },
          {
            value: "B",
            text: "After payment, I see success.",
            correct: false,
            explanation: "Too vague - what is success?"
          },
          {
            value: "C",
            text: "Confirmation is timely.",
            correct: false,
            explanation: "Too vague - what is timely?"
          }
        ]
      },
      {
        id: 8,
        title: "State Visibility & Notifications",
        description: "Which one is complete?",
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        scenario: "Payment failure handling should be easily testable by QA.",
        options: [
          {
            value: "A",
            text: "I see a confirmation screen.",
            correct: false,
            explanation: "Only covers visibility, not notifications"
          },
          {
            value: "B",
            text: "After payment, I see confirmation on screen and get a receipt email.",
            correct: true,
            explanation: "Covers both visibility and messaging"
          },
          {
            value: "C",
            text: "Email is sent.",
            correct: false,
            explanation: "Only covers notifications, not visibility"
          }
        ]
      }
    ];
  }

  // Default childcare voucher scenario
  return [
    {
      id: 1,
      title: "User-Observable",
      description: "AC must describe what the user sees or does, not what the backend does.",
      icon: <Eye className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      scenario: "You are building a form save feature. Users need to know their progress is being saved.",
      options: [
        {
          value: "A",
          text: "The system checks local storage",
          correct: false,
          explanation: "This is backend logic"
        },
        {
          value: "B",
          text: "I see a message saying \"Progress saved\" after 5 seconds of inactivity",
          correct: true,
          explanation: "This is what the parent experiences"
        },
        {
          value: "C",
          text: "Backend writes state to cache",
          correct: false,
          explanation: "Tech stuff — not visible to Amaka"
        }
      ]
    },
    {
      id: 2,
      title: "Clear Outcome",
      description: "We must know when something worked.",
      icon: <Target className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      scenario: "Form saving needs to provide clear success feedback.",
      options: [
        {
          value: "A",
          text: "Saving is automatic",
          correct: false,
          explanation: "Vague. Did it work? How would we know?"
        },
        {
          value: "B",
          text: "I see \"Progress saved successfully\" once changes are stored",
          correct: true,
          explanation: "User gets confirmation"
        },
        {
          value: "C",
          text: "Save triggers silently",
          correct: false,
          explanation: "No way for user to confirm"
        }
      ]
    },
    {
      id: 3,
      title: "One Expectation per AC",
      description: "Keep it focused — no multi-part ACs.",
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      scenario: "Form progress saving should be focused and clear.",
      options: [
        {
          value: "A",
          text: "Auto-save works and browser restores and no errors",
          correct: false,
          explanation: "Too many things in one"
        },
        {
          value: "B",
          text: "If I close the browser and reopen, my form continues from where I stopped",
          correct: true,
          explanation: "One clear outcome"
        },
        {
          value: "C",
          text: "The user gets no errors and progress is retained and UI updates",
          correct: false,
          explanation: "This is 3 expectations jammed together"
        }
      ]
    },
    {
      id: 4,
      title: "Handle Edge Cases",
      description: "What happens in a real failure?",
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      scenario: "Form saving can fail for various reasons - network issues, server problems, etc.",
      options: [
        {
          value: "A",
          text: "Save fails quietly",
          correct: false,
          explanation: "No feedback — confusing"
        },
        {
          value: "B",
          text: "If my internet disconnects during save, I see: \"We couldn't save your progress. Try again.\"",
          correct: true,
          explanation: "Honest, helpful"
        },
        {
          value: "C",
          text: "Save retries 3 times before failing",
          correct: false,
          explanation: "Internal logic — doesn't tell user what's happening"
        }
      ]
    },
    {
      id: 5,
      title: "Error Handling",
      description: "Always tell the user what's wrong — clearly.",
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      scenario: "When form saving fails, users need clear guidance on what to do next.",
      options: [
        {
          value: "A",
          text: "Save fails",
          correct: false,
          explanation: "No clarity"
        },
        {
          value: "B",
          text: "I see a red banner if the save fails, with steps to retry",
          correct: true,
          explanation: "Human-centered, visual, supportive"
        },
        {
          value: "C",
          text: "Log error in console",
          correct: false,
          explanation: "Invisible to the user"
        }
      ]
    },
    {
      id: 6,
      title: "AC Format",
      description: "AC should follow the IF → THEN structure where possible.",
      icon: <FileText className="w-6 h-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      scenario: "Form saving should follow clear format patterns.",
      options: [
        {
          value: "A",
          text: "Saves occur regularly",
          correct: false,
          explanation: "No condition defined"
        },
        {
          value: "B",
          text: "If I stop typing for 30 seconds, the system saves automatically and shows \"Progress saved.\"",
          correct: true,
          explanation: "Clear trigger, clear output"
        },
        {
          value: "C",
          text: "The system knows when to save",
          correct: false,
          explanation: "Vague, untestable"
        }
      ]
    },
    {
      id: 7,
      title: "Business Rule Inclusion",
      description: "Capture specific policy.",
      icon: <Users className="w-6 h-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      scenario: "Form saving should follow business policies.",
      options: [
        {
          value: "A",
          text: "System tracks multiple sessions",
          correct: false,
          explanation: "Not user-facing"
        },
        {
          value: "B",
          text: "Only one form can be active per parent per child",
          correct: true,
          explanation: "Clear rule from policy"
        },
        {
          value: "C",
          text: "Forms stored under unique tokens",
          correct: false,
          explanation: "Implementation detail"
        }
      ]
    },
    {
      id: 8,
      title: "Testable",
      description: "Can QA test it? Can a dev confirm it works?",
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      scenario: "Form saving should be easily testable by QA.",
      options: [
        {
          value: "A",
          text: "Save logic triggers event",
          correct: false,
          explanation: "Not testable from user perspective"
        },
        {
          value: "B",
          text: "I reopen the form and my previously entered data is still there",
          correct: true,
          explanation: "Simple test case"
        },
        {
          value: "C",
          text: "System flags save success",
          correct: false,
          explanation: "Too backend-focused"
        }
      ]
    }
  ];
};

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
                ? 'You\'re working on a rent payment portal. Your stakeholder (the Property Ops Lead) tells you: "Tenants are paying online but sometimes the page freezes and they don\'t know if payment went through. They also want an option to see payment history clearly." This sounds simple. But clarity lives in the details. Don\'t just jump into writing "As a user, I want to pay rent online." That\'s vague, weak, and it puts the thinking burden on developers. Instead, shape a clear story that reflects: Who exactly is using the feature (be specific), What they want to do now, Why it matters at that moment.'
                : scenarioId === 'student-homework'
                ? 'Meet Daniel. Daniel is 15, in Year 11, and he just finished his homework at 10:47 p.m. He logs into his school portal to upload it — but nothing happens. He tries again. Still nothing. Finally, he sees the upload failed — but it didn\'t say why. He doesn\'t know if the file type was wrong, if it was too big, or if the system just broke. Now it\'s 11:02 p.m. The deadline has passed. The teacher will think he didn\'t try. He\'s frustrated. He did the work. The system failed him. You\'re the Business Analyst for the school platform. Your job is to make sure this never happens again.'
                : 'Meet Amaka. She\'s a single mother living in South London. She\'s finally found a government program that offers childcare vouchers — and she needs to apply online. The form is long. She\'s tired. Halfway through, her toddler spills juice on her laptop. She refreshes — and loses everything. The site had no save feature. No warning. No progress bar. Just silence. She has to start again from scratch. This is frustrating — and it\'s a real problem. Now you\'re the BA tasked with helping fix this experience.'
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

