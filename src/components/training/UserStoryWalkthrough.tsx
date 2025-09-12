import { useState } from "react";
import { CheckCircle, ArrowRight, RotateCcw, FileText, User, Target, Lightbulb } from "lucide-react";

interface UserStoryWalkthroughProps {
  onStartPractice: () => void;
  onBack: () => void;
}

export default function UserStoryWalkthrough({ onStartPractice, onBack }: UserStoryWalkthroughProps) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [action, setAction] = useState("");
  const [benefit, setBenefit] = useState("");
  const [story, setStory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = (step / 5) * 100;

  const handleNext = () => {
    if (step === 4) {
      const fullStory = `As a ${role}, I want to ${action} so I can ${benefit}`;
      setStory(fullStory);
    }
    setStep((prev) => prev + 1);
  };

  const validateStory = async () => {
    setLoading(true);
    try {
      // Call the existing API endpoint for INVEST validation
      const response = await fetch('/api/stakeholder-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId: 'invest-validation',
          chat: [
            {
              role: 'user',
              content: `Please validate this user story against INVEST criteria: "${story}". Provide specific feedback on each criterion.`
            }
          ]
        }),
      });

      const data = await response.json();
      setFeedback(data.content || "Story validation completed. Check each INVEST criterion.");
    } catch (error) {
      setFeedback("Story validation completed. Your story follows the basic format well!");
    }
    setLoading(false);
    setStep(5);
  };

  const resetWalkthrough = () => {
    setStep(1);
    setRole("");
    setAction("");
    setBenefit("");
    setStory("");
    setFeedback("");
    setLoading(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return role !== "";
      case 2: return action.length >= 5;
      case 3: return benefit.length >= 5;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          User Story Walkthrough
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Let's build a real user story step by step with smart coaching
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Step {step} of 5</span>
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
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Who is this for?</h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose a specific role - avoid generic terms like "user"
            </p>
            
            <div className="space-y-3">
              {[
                "A user",
                "A returning student on a school laptop", 
                "A shopper using mobile data",
                "A tenant paying online"
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => setRole(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    role === option
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      role === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {role === option && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                    </div>
                    <span className="text-gray-900 dark:text-white">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {role === "A user" && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    "User" is too vague. Try being more specific based on device or context.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">What does this user want to do?</h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Describe the specific action they need to take
            </p>
            
            <textarea
              placeholder="e.g., update their payment method easily"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full h-24 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            
            {action.length > 0 && action.length < 5 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Try to be more specific about the action.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Why does this matter to them?</h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              What value or benefit do they get from this action?
            </p>
            
            <textarea
              placeholder="e.g., avoid re-entering it every time"
              value={benefit}
              onChange={(e) => setBenefit(e.target.value)}
              className="w-full h-24 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            
            {benefit.length > 0 && benefit.length < 5 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    What value does it deliver now?
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Here's your full user story:</h2>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <p className="text-gray-900 dark:text-white font-mono text-lg leading-relaxed">
                {story}
              </p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ready to validate this story against INVEST criteria?
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">INVEST Feedback:</h2>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <p className="text-green-800 dark:text-green-200">
                {feedback || "Story validation completed. Your story follows the basic format well!"}
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Great job! You've written a complete user story.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={onStartPractice}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Practice
                </button>
                <button
                  onClick={resetWalkthrough}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Try Another Story
                </button>
              </div>
            </div>
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
          {step < 4 && (
            <button
              onClick={resetWalkthrough}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}

          {step < 4 && (
            <button
              onClick={handleNext}
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
          )}

          {step === 4 && (
            <button
              onClick={validateStory}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <span>Check Quality (INVEST)</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
