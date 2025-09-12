import React, { useState } from 'react';
import { CheckCircle, User, Target, FileText, CheckSquare, Lightbulb, ArrowRight, RotateCcw } from 'lucide-react';

interface WalkthroughLayerProps {
  onStartPractice: () => void;
  onBack: () => void;
}

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Choose the Right User',
    icon: <User className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 2,
    title: 'Pinpoint the One Action',
    icon: <Target className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    id: 3,
    title: 'Write the User Story',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    id: 4,
    title: 'Check Against INVEST',
    icon: <CheckSquare className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    id: 5,
    title: 'Reflect Before Acceptance Criteria',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  }
];

export default function WalkthroughLayer({ onStartPractice, onBack }: WalkthroughLayerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [userStory, setUserStory] = useState<string>('');
  const [investChecks, setInvestChecks] = useState<boolean[]>([false, false, false, false, false, false]);
  const [reflectionChecks, setReflectionChecks] = useState<boolean[]>([false, false, false, false]);
  const [coachingMessage, setCoachingMessage] = useState<string>('');

  const userOptions = [
    'A new user',
    'A shopper using mobile data',
    'A returning student on a school laptop',
    'A first-time visitor'
  ];

  const actionOptions = [
    'Save work automatically',
    'Reuse a saved address',
    'Contact customer service',
    'Start a live chat'
  ];

  const investCriteria = [
    'Independent',
    'Negotiable',
    'Valuable',
    'Estimable',
    'Small',
    'Testable'
  ];

  const reflectionItems = [
    'What the user wants to see when it works',
    'What happens if something goes wrong',
    'What to do when the user has no data or weak connection',
    'What messages or confirmations the user should receive'
  ];

  const handleUserStoryChange = (value: string) => {
    setUserStory(value);
    
    // Live coaching
    if (value.toLowerCase().includes('as a user')) {
      setCoachingMessage("Try replacing 'user' with a more specific role.");
    } else if ((value.match(/i want to/g) || []).length > 1) {
      setCoachingMessage("Looks like you're squeezing in two actions. Can we split this into two stories?");
    } else if (value.includes('As a') && value.includes('I want to') && value.includes('so I can')) {
      setCoachingMessage("Great structure! Your story follows the standard format.");
    } else {
      setCoachingMessage('');
    }
  };

  const handleInvestCheck = (index: number) => {
    const newChecks = [...investChecks];
    newChecks[index] = !newChecks[index];
    setInvestChecks(newChecks);
  };

  const handleReflectionCheck = (index: number) => {
    const newChecks = [...reflectionChecks];
    newChecks[index] = !newChecks[index];
    setReflectionChecks(newChecks);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetWalkthrough = () => {
    setCurrentStep(1);
    setSelectedUser('');
    setSelectedAction('');
    setUserStory('');
    setInvestChecks([false, false, false, false, false, false]);
    setReflectionChecks([false, false, false, false]);
    setCoachingMessage('');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Who is this feature for? Be specific — avoid saying "user".
        </h3>
      </div>
      
      <div className="grid gap-3">
        {userOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedUser(option)}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              selectedUser === option
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedUser === option
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selectedUser === option && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
              </div>
              <span className="text-gray-900 dark:text-white">{option}</span>
              {option === 'A returning student on a school laptop' && (
                <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Tip:</strong> "User" is too vague. Choose a real role. This makes your story more valuable and testable.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          What do they need to do right now?
        </h3>
      </div>
      
      <div className="grid gap-3">
        {actionOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedAction(option)}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              selectedAction === option
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedAction === option
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selectedAction === option && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
              </div>
              <span className="text-gray-900 dark:text-white">{option}</span>
              {option === 'Reuse a saved address' && (
                <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-green-800 dark:text-green-200 text-sm">
            <strong>Tip:</strong> Keep one clear goal. If there are two verbs, it's two stories.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Write using the standard format:
        </h3>
        <p className="text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg inline-block">
          As a [role], I want to [action] so I can [benefit].
        </p>
      </div>
      
      <div>
        <textarea
          value={userStory}
          onChange={(e) => handleUserStoryChange(e.target.value)}
          placeholder="Type your user story here..."
          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
        
        {coachingMessage && (
          <div className={`mt-3 p-3 rounded-lg ${
            coachingMessage.includes('Great') 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
          }`}>
            <p className={`text-sm ${
              coachingMessage.includes('Great')
                ? 'text-green-800 dark:text-green-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              {coachingMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Check your story against INVEST criteria:
        </h3>
      </div>
      
      <div className="grid gap-3">
        {investCriteria.map((criterion, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
            onClick={() => handleInvestCheck(index)}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              investChecks[index]
                ? 'border-orange-500 bg-orange-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {investChecks[index] && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-900 dark:text-white font-medium">{criterion}</span>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Lightbulb className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <p className="text-orange-800 dark:text-orange-200 text-sm">
            <strong>Coaching tip:</strong> For example, if unchecked "Testable", ask: "Can someone verify this without reading code? If not, think about what they should see or receive."
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          What have you considered in your story?
        </h3>
      </div>
      
      <div className="grid gap-3">
        {reflectionItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
            onClick={() => handleReflectionCheck(index)}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              reflectionChecks[index]
                ? 'border-yellow-500 bg-yellow-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {reflectionChecks[index] && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-900 dark:text-white">{item}</span>
          </div>
        ))}
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
          Great! Now you're ready to write the Acceptance Criteria
        </h4>
        <p className="text-green-700 dark:text-green-300 text-sm">
          You've completed the user story walkthrough. Ready to move on to practice with real scenarios?
        </p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedUser !== '';
      case 2: return selectedAction !== '';
      case 3: return userStory.trim() !== '';
      case 4: return investChecks.some(check => check);
      case 5: return reflectionChecks.some(check => check);
      default: return false;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Walkthrough: Write a User Story in 5 Guided Steps
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          This walkthrough will guide you through the real process of shaping a clear user story that can be handed to developers with confidence.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                currentStep >= step.id
                  ? `${step.bgColor} ${step.color} border-current`
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-12 h-12 ${steps[currentStep - 1].bgColor} rounded-xl flex items-center justify-center ${steps[currentStep - 1].color} shadow-md`}>
            {steps[currentStep - 1].icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
          </div>
        </div>
        
        {renderStepContent()}
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

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onStartPractice}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span>Start Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
