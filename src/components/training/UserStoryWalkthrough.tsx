import { useState } from "react";
import { CheckCircle, ArrowRight, RotateCcw, FileText, User, Target, Lightbulb, AlertCircle, ChevronRight, Home } from "lucide-react";
import { getEpicSelectionScenario } from "../../data/epicSelectionSteps";

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
  // Get Epic selection step if scenario ID exists in our data
  const epicScenario = getEpicSelectionScenario(scenarioId || '1');
  const epicStep = epicScenario ? {
    key: 'epic',
    question: epicScenario.epicStep.question,
    tip: 'Choose the Epic that best fits this requirement.',
    options: epicScenario.epicStep.options.map(opt => opt.label),
    correct: epicScenario.epicStep.options.find(opt => opt.isCorrect)?.label || '',
    explanation: epicScenario.epicStep.options.find(opt => opt.isCorrect)?.feedback || '',
    incorrectExplanations: epicScenario.epicStep.options
      .filter(opt => !opt.isCorrect)
      .reduce((acc, opt) => ({ ...acc, [opt.label]: opt.feedback }), {})
  } : null;

  if (scenarioId === 'student-homework') {
    const studentHomeworkEpicStep = {
      key: 'epic',
      question: 'Which Epic does this requirement belong to?',
      tip: 'Choose the Epic that best fits this requirement.',
      options: [
        'File Upload Feedback',
        'Student Services',
        'Assignment Management',
        'User Experience'
      ],
      correct: 'File Upload Feedback',
      explanation: 'Correct — this is about providing clear feedback during file uploads.',
      incorrectExplanations: {
        'Student Services': 'Too broad. The focus is specifically on upload feedback.',
        'Assignment Management': 'Close, but the Epic is about upload feedback, not general assignment management.',
        'User Experience': 'Not quite. This is about specific upload feedback, not general UX improvements.'
      }
    };
    const baseSteps = [
      {
        key: 'user',
        question: 'Who is this feature for?',
        tip: 'Pick the most appropriate user role for this scenario.',
        options: [
          'A tenant paying rent online',
          'A parent applying for childcare',
          'A teacher checking submissions',
          'A student uploading homework',
          'A librarian editing reading lists'
        ],
        correct: 'A student uploading homework',
        explanation: 'This feature supports the student who is uploading homework.',
        incorrectExplanations: {
          'A tenant paying rent online': 'Wrong context - this is about homework submission, not rent payments.',
          'A parent applying for childcare': 'Wrong context - this is about student homework, not parent applications.',
          'A teacher checking submissions': 'Wrong user - this is about student upload, not teacher review.',
          'A librarian editing reading lists': 'Wrong context - this is about homework submission, not library management.'
        }
      },
      {
        key: 'action',
        question: 'What does the user want?',
        tip: 'Choose the real need.',
        options: [
          'Submit work late',
          'Send files by email',
          'Get clear, real-time feedback during the upload',
          'Skip validation',
          'See the upload date'
        ],
        correct: 'Get clear, real-time feedback during the upload',
        explanation: 'Yes: The main need is to know when something fails and why. Students need instant clarity.',
        incorrectExplanations: {
          'Submit work late': 'Wrong action - this is about getting feedback, not late submission.',
          'Send files by email': 'Wrong action - this is about platform upload, not email.',
          'Skip validation': 'Wrong action - this is about getting feedback, not avoiding validation.',
          'See the upload date': 'Wrong action - this is about upload feedback, not date display.'
        }
      },
      {
        key: 'benefit',
        question: 'Why do they want it?',
        tip: 'What is the real-world benefit?',
        options: [
          'To avoid penalties',
          'To trick the system',
          'To ask the teacher for more time',
          'So they know if they need to fix the file and re-upload before the deadline',
          'To notify classmates'
        ],
        correct: 'So they know if they need to fix the file and re-upload before the deadline',
        explanation: 'Absolutely: Students need time to react and re-submit, not be left in the dark.',
        incorrectExplanations: {
          'To avoid penalties': 'That\'s a consequence, not the main benefit of getting feedback.',
          'To trick the system': 'Wrong benefit - this is about legitimate feedback, not gaming the system.',
          'To ask the teacher for more time': 'Wrong benefit - this is about fixing files, not requesting extensions.',
          'To notify classmates': 'Wrong benefit - this is about personal upload feedback, not communication.'
        }
      },
      {
        key: 'story',
        question: 'Write the user story',
        tip: 'Let them tweak it, but keep the core structure. Remind them: no "how" — just the who, what, and why.',
        options: [],
        correct: 'As a student uploading homework, I want clear feedback if my file is invalid, So I can fix it and submit before the deadline.',
        explanation: 'This follows the proper format: As a [role], I want [action], so that [benefit].',
        incorrectExplanations: {}
      },
      {
        key: 'invest',
        question: 'INVEST Check',
        tip: 'Review your story against the INVEST criteria.',
        options: [],
        correct: 'Independent: ✅ Can be delivered separately from other features\nNegotiable: ✅ Dev can choose toast, modal, banner, etc.\nValuable: ✅ Prevents unfair penalties for students\nEstimable: ✅ Simple scope: show file errors\nSmall: ✅ Fits in sprint\nTestable: ✅ QA can upload invalid files and check for feedback',
        explanation: 'Well done — your story passes INVEST. Let\'s make it buildable.',
        incorrectExplanations: {}
      }
    ];
    return [studentHomeworkEpicStep, ...baseSteps];
  }

  if (scenarioId === 'shopping-checkout') {
    const shoppingCheckoutEpicStep = {
      key: 'epic',
      question: 'Which Epic does this requirement belong to?',
      tip: 'Choose the Epic that best fits this requirement.',
      options: [
        'Payment Confirmation',
        'Rent Management',
        'Online Transactions',
        'Customer Support'
      ],
      correct: 'Payment Confirmation',
      explanation: 'Correct — this is about providing instant confirmation after payment submission.',
      incorrectExplanations: {
        'Rent Management': 'Too broad. The focus is specifically on payment confirmation.',
        'Online Transactions': 'Close, but payment confirmation is more specific.',
        'Customer Support': 'Not quite. This is about payment feedback, not general support.'
      }
    };
    const baseSteps = [
      {
        key: 'user',
        question: 'Who is the feature for?',
        tip: 'Choose the most specific, relevant user role.',
        options: [
          'A user',
          'A tenant paying rent online',
          'A property manager',
          'A developer working on the system'
        ],
        correct: 'A tenant paying rent online',
        explanation: 'This story is about the rent-paying experience, not managing the portal or building the backend.',
        incorrectExplanations: {
          'A user': '"User" is too generic. It tells the team nothing about the needs, context, or pain points.',
          'A property manager': 'This story is about the rent-paying experience, not managing the portal.',
          'A developer working on the system': 'This story is about the rent-paying experience, not building the backend.'
        }
      },
      {
        key: 'action',
        question: 'What action do they want to perform right now?',
        tip: 'What\'s the specific thing they\'re trying to do in this sprint?',
        options: [
          'Manage tenancy accounts',
          'Pay rent using an online portal',
          'Access system logs',
          'Improve data security'
        ],
        correct: 'Pay rent using an online portal',
        explanation: 'This is the specific action the tenant is trying to perform.',
        incorrectExplanations: {
          'Manage tenancy accounts': 'That\'s the landlord\'s goal, not the tenant\'s.',
          'Access system logs': 'That\'s not what the user sees — it\'s a backend concern.',
          'Improve data security': 'That\'s not what the user sees — it\'s a backend concern.'
        }
      },
      {
        key: 'goal',
        question: 'Why is this action important to the user right now?',
        tip: 'What pain or outcome makes this story valuable?',
        options: [
          'So they can stop calling support when unsure if payment went through',
          'So the system can log all activity',
          'So compliance can check payment data',
          'So their internet connection is stable'
        ],
        correct: 'So they can stop calling support when unsure if payment went through',
        explanation: 'The problem isn\'t the user\'s internet — it\'s feedback clarity.',
        incorrectExplanations: {
          'So the system can log all activity': 'These help the business, not the tenant.',
          'So compliance can check payment data': 'These help the business, not the tenant.',
          'So their internet connection is stable': 'The problem isn\'t the user\'s internet — it\'s feedback clarity.'
        }
      },
      {
        key: 'story',
        question: 'Write the user story',
        tip: 'Let them tweak it, but keep the core structure. Remind them: no "how" — just the who, what, and why.',
        options: [],
        correct: 'As a tenant paying rent online, I want to receive instant confirmation after submitting payment, so I can be sure my rent was received and avoid calling support.',
        explanation: 'This follows the proper format: As a [role], I want [action], so that [benefit].',
        incorrectExplanations: {}
      },
      {
        key: 'invest',
        question: 'INVEST Check',
        tip: 'Review your story against the INVEST criteria.',
        options: [],
        correct: 'Independent: ✅ Can ship without relying on other features\nNegotiable: ✅ Refinement will shape how confirmation is shown\nValuable: ✅ Reduces confusion, saves tenants time\nEstimable: ✅ Developers can size this\nSmall: ✅ One clear goal, not overloaded\nTestable: ✅ QA can test confirmation message, payment state, etc.',
        explanation: 'Your story passes all INVEST criteria. It\'s well-structured and ready for development.',
        incorrectExplanations: {}
      }
    ];
    return [shoppingCheckoutEpicStep, ...baseSteps];
  }

  // Default childcare voucher scenario
  const baseSteps = [
    {
      key: 'user',
      question: 'Who is this feature for?',
      tip: 'Pick the most appropriate user role.',
      options: [
        'A returning student on a school laptop',
        'A shopper using mobile data',
        'A parent applying for a childcare voucher',
        'A first-time visitor',
        'A tenant paying rent'
      ],
      correct: 'A parent applying for a childcare voucher',
      explanation: 'The main person using this feature is the parent applying for a voucher.',
      incorrectExplanations: {
        'A returning student on a school laptop': 'Wrong context - this is about childcare vouchers, not student homework.',
        'A shopper using mobile data': 'Wrong context - this is about government voucher applications, not shopping.',
        'A first-time visitor': 'Too vague - doesn\'t capture the specific user with the real need.',
        'A tenant paying rent': 'Wrong context - this is about childcare vouchers, not rent payments.'
      }
    },
    {
      key: 'action',
      question: 'What does the user want?',
      tip: 'Choose the real need.',
      options: [
        'Save their place in a form',
        'Check voucher status',
        'Save progress while completing a form',
        'Get faster approval',
        'Print the form'
      ],
      correct: 'Save progress while completing a form',
      explanation: 'The real need is to save progress. This stops the frustration if something goes wrong.',
      incorrectExplanations: {
        'Save their place in a form': 'Close, but not as specific as "save progress while completing".',
        'Check voucher status': 'Wrong action - this is about the application process, not checking status.',
        'Get faster approval': 'Wrong action - this is about the application process, not approval speed.',
        'Print the form': 'Wrong action - this is about saving progress, not printing.'
      }
    },
    {
      key: 'benefit',
      question: 'Why do they want it?',
      tip: 'What is the real-world benefit?',
      options: [
        'So they don\'t lose everything if they close the tab',
        'So they get a voucher',
        'So they can apply for multiple children',
        'So they can print later'
      ],
      correct: 'So they don\'t lose everything if they close the tab',
      explanation: 'Yes: They want to avoid losing their work unexpectedly. That\'s the pain point you\'re solving.',
      incorrectExplanations: {
        'So they get a voucher': 'That\'s the end goal, but not the immediate benefit of saving progress.',
        'So they can apply for multiple children': 'Wrong benefit - this is about saving progress, not multiple applications.',
        'So they can print later': 'Wrong benefit - this is about saving progress, not printing.'
      }
    },
    {
      key: 'story',
      question: 'Write the user story',
      tip: 'Let them tweak it, but keep the core structure. Remind them: no "how" — just the who, what, and why.',
      options: [],
      correct: 'As a parent applying for a childcare voucher, I want to save my progress while completing the form, So I don\'t lose everything if I have to close the browser.',
      explanation: 'This follows the proper format: As a [role], I want [action], so that [benefit].',
      incorrectExplanations: {}
    },
    {
      key: 'invest',
      question: 'INVEST Check',
      tip: 'Review your story against the INVEST criteria.',
      options: [],
      correct: 'Independent: ✅ Saving progress can be built without the full application system changing\nNegotiable: ✅ The dev team can choose auto-save, manual button, etc.\nValuable: ✅ The parent avoids loss and frustration\nEstimable: ✅ Clear scope — saving progress is well-understood\nSmall: ✅ Can be done in a sprint\nTestable: ✅ QA can simulate browser crash and confirm progress is saved',
      explanation: 'Well done — your story passes INVEST. Let\'s make it buildable.',
      incorrectExplanations: {}
    }
  ];
  // Always add Epic selection for default scenario (childcare voucher)
  const defaultEpicStep = {
    key: 'epic',
    question: 'Which Epic does this requirement belong to?',
    tip: 'Choose the Epic that best fits this requirement.',
    options: [
      'Form Progress Saving',
      'User Experience Improvements', 
      'Data Persistence',
      'Application Management'
    ],
    correct: 'Form Progress Saving',
    explanation: 'Correct — this is about saving progress while completing a form.',
    incorrectExplanations: {
      'User Experience Improvements': 'Too broad. The focus is specifically on saving form progress.',
      'Data Persistence': 'Close, but form progress saving is more specific.',
      'Application Management': 'Not quite. This is about saving progress, not managing applications.'
    }
  };
  return [defaultEpicStep, ...baseSteps];
};

export default function UserStoryWalkthrough({ onStartPractice, onBack, scenarioId }: UserStoryWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [editableStory, setEditableStory] = useState("");
  const [investChecks, setInvestChecks] = useState<boolean[]>([true, true, true, true, true, true]);

  const steps = getStepsForScenario(scenarioId);
  const progress = ((currentStep + 1) / 6) * 100;

  const handleSelect = (option: string) => {
    const step = steps[currentStep];
    const key = step.key;
    
    setAnswers({ ...answers, [key]: option });
    setSelectedOption(option);
    setIsCorrect(option === step.correct);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
    setSelectedOption(null);
    setShowExplanation(false);
    setIsCorrect(null);
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setIsCorrect(null);
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
    setIsCorrect(null);
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
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
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
            Requirement Pods
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">User Story Walkthrough</span>
        </nav>

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
        </div>
      </div>
    );
  }

  // Show current step
  const step = steps[currentStep];
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
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
          Requirement Pods
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white font-medium">User Story Walkthrough</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Write a Strong User Story in 6 Guided Steps
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
            ? 'You\'re working on a rent payment portal. Your stakeholder (the Property Ops Lead) tells you: "Tenants are paying online but sometimes the page freezes and they don\'t know if payment went through. They also want an option to see payment history clearly." This sounds simple. But clarity lives in the details. Don\'t just jump into writing "As a user, I want to pay rent online." That\'s vague, weak, and it puts the thinking burden on developers. Instead, shape a clear story that reflects: Who exactly is using the feature (be specific), What they want to do now, Why it matters at that moment.'
            : scenarioId === 'student-homework'
            ? 'Meet Daniel. Daniel is 15, in Year 11, and he just finished his homework at 10:47 p.m. He logs into his school portal to upload it — but nothing happens. He tries again. Still nothing. Finally, he sees the upload failed — but it didn\'t say why. He doesn\'t know if the file type was wrong, if it was too big, or if the system just broke. Now it\'s 11:02 p.m. The deadline has passed. The teacher will think he didn\'t try. He\'s frustrated. He did the work. The system failed him. You\'re the Business Analyst for the school platform. Your job is to make sure this never happens again.'
            : 'Meet Amaka. She\'s a single mother living in South London. She\'s finally found a government program that offers childcare vouchers — and she needs to apply online. The form is long. She\'s tired. Halfway through, her toddler spills juice on her laptop. She refreshes — and loses everything. The site had no save feature. No warning. No progress bar. Just silence. She has to start again from scratch. This is frustrating — and it\'s a real problem. Now you\'re the BA tasked with helping fix this experience.'
          }
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Step {currentStep + 1} of 6</span>
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
                disabled={showExplanation && isCorrect}
                className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedOption === option
                    ? option === step.correct
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${showExplanation && isCorrect ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
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
                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 dark:text-red-200 font-semibold mb-2">🔴 Why this is wrong:</p>
                        <p className="text-red-700 dark:text-red-300 text-sm">{step.incorrectExplanations[selectedOption]}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-800 dark:text-green-200 font-semibold mb-2">✅ Correct answer:</p>
                        <p className="text-green-700 dark:text-green-300 text-sm font-medium mb-2">{step.correct}</p>
                        <p className="text-green-700 dark:text-green-300 text-sm">{step.explanation}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleTryAgain}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 font-semibold mb-2">✅ Takeaway:</p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {currentStep === 0 && "Epics organize related stories. Choose the Epic that best captures the business capability."}
                      {currentStep === 1 && "Always anchor your story in a real role. \"User\" is a placeholder, not a person."}
                      {currentStep === 2 && "Focus on one core intent per story. This makes delivery clearer and testing easier."}
                      {currentStep === 3 && "Your \"why\" should speak in human language, not tech terms."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={resetWalkthrough}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {showExplanation && isCorrect && currentStep < steps.length - 1 && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {showExplanation && isCorrect && currentStep === steps.length - 1 && (
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











