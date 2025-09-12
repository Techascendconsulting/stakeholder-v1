import { useState } from "react";
import { CheckCircle, ArrowRight, RotateCcw, FileText, User, Target, Lightbulb, AlertCircle } from "lucide-react";

interface UserStoryWalkthroughProps {
  onStartPractice: () => void;
  onBack: () => void;
}

interface Step {
  key: string;
  question: string;
  tip: string;
  options: string[];
  correct: string;
}

const steps: Step[] = [
  {
    key: 'user',
    question: 'Who is this feature for?',
    tip: 'Choose the person this feature is solving a problem for right now. Be specific — "user" is too vague.',
    options: [
      'A tenant paying rent online',
      'A shopper using mobile data',
      'A parent applying for a childcare voucher',
      'A student submitting homework',
      'A first-time visitor browsing services'
    ],
    correct: 'A parent applying for a childcare voucher'
  },
  {
    key: 'action',
    question: 'What do they want to do?',
    tip: 'Zoom into the immediate task they\'re struggling with — not the whole journey.',
    options: [
      'Submit a complaint',
      'Upload multiple files at once',
      'Save their progress on a form',
      'Apply for a voucher',
      'Share the form with a partner'
    ],
    correct: 'Save their progress on a form'
  },
  {
    key: 'goal',
    question: 'Why do they need it?',
    tip: 'What\'s the problem we\'re solving? This is the "so I can" part of the story.',
    options: [
      'So they can print the form',
      'So they don\'t lose their place or data if they leave halfway',
      'So they can apply for more than one child',
      'So they can get faster support',
      'So they can avoid retyping their address'
    ],
    correct: 'So they don\'t lose their place or data if they leave halfway'
  }
];

export default function UserStoryWalkthrough({ onStartPractice, onBack }: UserStoryWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editableStory, setEditableStory] = useState("");
  const [investChecks, setInvestChecks] = useState<boolean[]>([false, false, false, false, false, false]);

  const progress = ((currentStep + 1) / 5) * 100;

  const handleSelect = (option: string) => {
    const step = steps[currentStep];
    const key = step.key;
    const isCorrect = option === step.correct;
    
    setAnswers({ ...answers, [key]: option });

    if (!isCorrect) {
      setFeedback("That's not quite right. Read the tip below to try again.");
    } else {
      setFeedback(null);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 500);
    }
  };

  const generateUserStory = () => {
    return `As a ${answers.user}, I want to ${answers.action.toLowerCase()}, so I can ${answers.goal.toLowerCase()}.`;
  };

  const handleInvestCheck = (index: number) => {
    const newChecks = [...investChecks];
    newChecks[index] = !newChecks[index];
    setInvestChecks(newChecks);
  };

  const resetWalkthrough = () => {
    setCurrentStep(0);
    setAnswers({});
    setFeedback(null);
    setEditableStory("");
    setInvestChecks([false, false, false, false, false, false]);
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
          The Childcare Services team says parents often abandon the voucher application form midway because it's too long and they don't always have the right documents. They want a "Save Progress" feature so users can pause and come back later.
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
                className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  answers[step.key] === option
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    answers[step.key] === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {answers[step.key] === option && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                  </div>
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>
          
          {feedback && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 dark:text-red-200 text-sm font-medium">{feedback}</p>
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

        <button
          onClick={resetWalkthrough}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
