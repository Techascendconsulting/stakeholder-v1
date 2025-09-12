import { useState } from "react";
import { CheckCircle, ArrowRight, RotateCcw, FileText, User, Target, Lightbulb, AlertCircle } from "lucide-react";

interface UserStoryWalkthroughProps {
  onStartPractice: () => void;
  onBack: () => void;
  scenarioId?: string;
}

interface Step {
  key: string;
  question: string;
  tip: string;
  options: string[];
  correct: string;
  explanation: string;
  incorrectExplanations: Record<string, string>;
}

const getStepsForScenario = (scenarioId?: string): Step[] => {
  if (scenarioId === 'shopping-checkout') {
    return [
      {
        key: 'user',
        question: 'Who is this feature for?',
        tip: 'Choose the most appropriate user based on the scenario.',
        options: [
          'A shopper using mobile data',
          'A finance manager',
          'A new seller onboarding',
          'A warehouse staff member'
        ],
        correct: 'A shopper using mobile data',
        explanation: 'The shopper is the one experiencing the failure. They are the primary user affected by this issue.',
        incorrectExplanations: {
          'A finance manager': 'Not relevant to this scenario - they don\'t experience payment failures at checkout.',
          'A new seller onboarding': 'Wrong user - this is about customer checkout, not seller setup.',
          'A warehouse staff member': 'Not involved in the payment process - irrelevant to this scenario.'
        }
      },
      {
        key: 'action',
        question: 'What do they want to do?',
        tip: 'What is the key goal the user wants to achieve?',
        options: [
          'Complete the checkout successfully',
          'Know why their payment failed and what to do',
          'Get a refund',
          'Track their order'
        ],
        correct: 'Know why their payment failed and what to do',
        explanation: 'The user has already failed to pay. They now want clarity and next steps to resolve the issue.',
        incorrectExplanations: {
          'Complete the checkout successfully': 'This is no longer the goal at this stage - the payment has already failed.',
          'Get a refund': 'Too early - they haven\'t completed a purchase yet.',
          'Track their order': 'Not relevant - they haven\'t successfully placed an order.'
        }
      },
      {
        key: 'goal',
        question: 'Why do they want it?',
        tip: 'What value does the user get from this?',
        options: [
          'So they don\'t get charged twice',
          'So they can fix the issue and try again',
          'So they can report the issue to customer service',
          'So they can leave the site'
        ],
        correct: 'So they can fix the issue and try again',
        explanation: 'The user is trying to continue the transaction and needs guidance to complete their purchase.',
        incorrectExplanations: {
          'So they don\'t get charged twice': 'This is a concern, but not the primary motivation for understanding the failure.',
          'So they can report the issue to customer service': 'Reporting is not their first intention - they still want to complete the payment.',
          'So they can leave the site': 'Leaving is not their goal - they want to complete their purchase.'
        }
      }
    ];
  }

  // Default childcare voucher scenario
  return [
    {
      key: 'user',
      question: 'Who is this for?',
      tip: 'Choose the most specific user role that makes this story valuable.',
      options: [
        'A user',
        'A parent applying for a childcare voucher',
        'A first-time visitor',
        'A system admin'
      ],
      correct: 'A parent applying for a childcare voucher',
      explanation: 'This identifies a specific user in the scenario — not just "anyone." It shows the person with the real need and helps the team understand the human at the center of the story.',
      incorrectExplanations: {
        'A user': 'Too vague. Could be anyone. Doesn\'t help teams build empathy or focus on outcomes.',
        'A first-time visitor': 'Possible, but doesn\'t directly match the voucher context in the scenario.',
        'A system admin': 'They aren\'t the ones filling out the form. Wrong audience.'
      }
    },
    {
      key: 'action',
      question: 'What does this user want to do?',
      tip: 'Think about the action they\'re trying to take, based on the issue.',
      options: [
        'Fill out the form',
        'Access the childcare voucher system',
        'Save their progress on a form',
        'Submit their final application'
      ],
      correct: 'Save their progress on a form',
      explanation: 'This matches the problem in the scenario: parents are abandoning the form mid-way. They\'re not failing to start or submit — they\'re dropping off in the middle. Saving progress solves that pain.',
      incorrectExplanations: {
        'Fill out the form': 'Too broad. Doesn\'t zero in on the problem (losing progress).',
        'Access the childcare voucher system': 'Not the issue. They\'ve already accessed it.',
        'Submit their final application': 'Important, but not what was raised in this case.'
      }
    },
    {
      key: 'goal',
      question: 'Why does this matter?',
      tip: 'What\'s the benefit of letting them do this? What pain does it solve?',
      options: [
        'So the form can be saved on the server',
        'So they don\'t lose their place if they leave halfway',
        'So the system doesn\'t get overloaded',
        'So they can avoid customer service'
      ],
      correct: 'So they don\'t lose their place if they leave halfway',
      explanation: 'It clearly explains the benefit to the user. They can pause and return later — no rework, no frustration. This connects to real user value, not system function.',
      incorrectExplanations: {
        'So the form can be saved on the server': 'That\'s how it works, not why it matters to the user. Implementation detail.',
        'So the system doesn\'t get overloaded': 'Unrelated to the user\'s goal.',
        'So they can avoid customer service': 'Might be a side effect, but not the user\'s main intent.'
      }
    }
  ];
};

export default function UserStoryWalkthrough({ onStartPractice, onBack, scenarioId }: UserStoryWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [editableStory, setEditableStory] = useState("");
  const [investChecks, setInvestChecks] = useState<boolean[]>([true, true, true, true, true, true]);

  const steps = getStepsForScenario(scenarioId);
  const progress = ((currentStep + 1) / 5) * 100;

  const handleSelect = (option: string) => {
    const step = steps[currentStep];
    const key = step.key;
    
    setAnswers({ ...answers, [key]: option });
    setSelectedOption(option);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const generateUserStory = () => {
    if (!answers.user || !answers.action || !answers.goal) {
      return "Complete all steps to generate your user story.";
    }
    
    // Clean up the text for better grammar
    const user = answers.user.replace(/^A /, '').toLowerCase();
    const action = answers.action.toLowerCase();
    const goal = answers.goal.toLowerCase().replace(/^so they don't /, 'not ').replace(/^so /, '');
    
    return `As a ${user}, I want to ${action}, so that I ${goal}.`;
  };

  const handleInvestCheck = (index: number) => {
    const newChecks = [...investChecks];
    newChecks[index] = !newChecks[index];
    setInvestChecks(newChecks);
  };

  const resetWalkthrough = () => {
    setCurrentStep(0);
    setAnswers({});
    setSelectedOption(null);
    setShowExplanation(false);
    setEditableStory("");
    setInvestChecks([true, true, true, true, true, true]);
  };

  const investCriteria = [
    { name: 'Independent', explanation: 'Can ship by itself without needing 5 other features?' },
    { name: 'Negotiable', explanation: 'Team can shape the how during refinement?' },
    { name: 'Valuable', explanation: 'A human user gains real benefit — not just the system?' },
    { name: 'Estimable', explanation: 'Can the dev team size it today without guessing?' },
    { name: 'Small', explanation: 'Is it a manageable piece of work (one sprint)?' },
    { name: 'Testable', explanation: 'Can QA prove it works without asking devs?' }
  ];

  // Show completion screen
  if (currentStep >= steps.length) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ✅ You've Drafted a User Story
          </h1>
        </div>

        {/* Generated Story */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your User Story:</h2>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
              {generateUserStory()}
            </p>
          </div>
          
          {/* Editable Story */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Want to edit it?</h3>
            <textarea
              value={editableStory || generateUserStory()}
              onChange={(e) => setEditableStory(e.target.value)}
              className="w-full h-24 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Edit your story here..."
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              💬 You can tweak this, but keep the format: who → what → why. Don't explain how.
            </p>
          </div>
        </div>

        {/* INVEST Check */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Does It Pass INVEST?</h3>
          
          <div className="space-y-4">
            {investCriteria.map((criterion, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => handleInvestCheck(index)}
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  investChecks[index]
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {investChecks[index] && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{criterion.name}:</span>
                    <span className={`text-sm ${investChecks[index] ? 'text-green-600' : 'text-gray-500'}`}>
                      {investChecks[index] ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{criterion.explanation}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Helper tip:</strong> This INVEST check helps you test the story before refinement. Don't skip it.
              </p>
            </div>
          </div>
        </div>

        {/* Reflection Box */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
              You've written a strong story that passes INVEST
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm mb-4">
              Want to improve it further? Click Edit above or move to Acceptance Criteria next.
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
              Start Again
            </button>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mx-auto"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Learning</span>
          </button>
        </div>
      </div>
    );
  }

  // Show current step
  const step = steps[currentStep];
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Write a Strong User Story in 5 Guided Steps
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This walkthrough helps learners shape a complete user story using a real scenario.
        </p>
      </div>

      {/* Scenario */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">🧪 Scenario:</h2>
        <p className="text-blue-800 dark:text-blue-200">
          {scenarioId === 'shopping-checkout' 
            ? 'You\'re working on a shopping platform. A customer on mobile data tries to complete a checkout, but payment fails. They want a clear message explaining the failure and guidance on what to do next.'
            : 'The Childcare Services team says parents often abandon the voucher application form midway because it\'s too long and they don\'t always have the right documents. They want a "Save Progress" feature so users can pause and come back later.'
          }
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Step {currentStep + 1} of 5</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.question}</h2>
          <p className="text-gray-600 dark:text-gray-400 italic text-sm mb-4">💬 {step.tip}</p>
          
          <div className="grid grid-cols-1 gap-3">
            {step.options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={showExplanation}
                className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedOption === option
                    ? option === step.correct
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${showExplanation ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedOption === option
                      ? option === step.correct
                        ? 'border-green-500 bg-green-500'
                        : 'border-red-500 bg-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedOption === option && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                  </div>
                  <span className="text-gray-900 dark:text-white">{option}</span>
                  {selectedOption === option && (
                    <span className={`ml-auto text-sm font-semibold ${
                      option === step.correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {option === step.correct ? '✅' : '❌'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {showExplanation && selectedOption && (
            <div className="mt-6 space-y-4">
              {selectedOption === step.correct ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-800 dark:text-green-200 font-semibold mb-2">🟢 Why this is right:</p>
                      <p className="text-green-700 dark:text-green-300 text-sm">{step.explanation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 dark:text-red-200 font-semibold mb-2">🔴 Why this is wrong:</p>
                      <p className="text-red-700 dark:text-red-300 text-sm">{step.incorrectExplanations[selectedOption]}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 font-semibold mb-2">✅ Takeaway:</p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {currentStep === 0 && "Always anchor your story in a real role. \"User\" is a placeholder, not a person."}
                      {currentStep === 1 && "Focus on one core intent per story. This makes delivery clearer and testing easier."}
                      {currentStep === 2 && "Your \"why\" should speak in human language, not tech terms."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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

          {showExplanation && currentStep < steps.length - 1 && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {showExplanation && currentStep === steps.length - 1 && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>See My Story</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
