import React, { useState, useEffect } from 'react';

interface CoachingStep {
  id: number;
  label: string;
  key: string;
  tip: string;
  validator: (text: string) => boolean;
}

const coachingSteps: CoachingStep[] = [
  {
    id: 1,
    label: "What does the user want?",
    key: "main_function",
    tip: "📌 Try stating **exactly** what the user wants to do. This is usually the first and most obvious thing (e.g., upload a document, receive a receipt).",
    validator: (text: string) =>
      text.toLowerCase().includes("upload") ||
      text.toLowerCase().includes("receive") ||
      text.length > 20,
  },
  {
    id: 2,
    label: "Why does the user want this?",
    key: "why",
    tip: "🤔 Why is this important? Think from the user's point of view: What outcome or benefit do they get?",
    validator: (text: string) =>
      text.toLowerCase().includes("so that") || text.length > 25,
  },
  {
    id: 3,
    label: "What feedback will they see?",
    key: "feedback",
    tip: "🔔 Will they see a success message? Or an error if it fails? Try including what the user sees or hears.",
    validator: (text: string) =>
      text.toLowerCase().includes("message") ||
      text.toLowerCase().includes("notification"),
  },
  {
    id: 4,
    label: "What triggers this?",
    key: "input_trigger",
    tip: "⚡ What causes this to happen? E.g., submitting a form, clicking a button, changing a setting.",
    validator: (text: string) =>
      text.toLowerCase().includes("when") || text.toLowerCase().includes("after"),
  },
  {
    id: 5,
    label: "Any rules or limits?",
    key: "business_rule",
    tip: "📏 Is there a condition or rule? E.g., 'Only if it's within 3 months', 'Users must be verified'.",
    validator: (text: string) =>
      text.toLowerCase().includes("only if") ||
      text.toLowerCase().includes("must be") ||
      text.length > 20,
  },
  {
    id: 6,
    label: "What if something goes wrong?",
    key: "unhappy_path",
    tip: "😬 What's the worst-case scenario? E.g., wrong file type, network failure, incomplete form.",
    validator: (text: string) =>
      text.toLowerCase().includes("if") ||
      text.toLowerCase().includes("fails"),
  },
  {
    id: 7,
    label: "What message will they see if it fails?",
    key: "error_message",
    tip: "🚫 Make it user-friendly! E.g., 'Only JPG files allowed', or 'Please complete all fields'.",
    validator: (text: string) =>
      text.toLowerCase().includes("allowed") ||
      text.toLowerCase().includes("please"),
  },
  {
    id: 8,
    label: "Any non-functional requirements?",
    key: "non_functional",
    tip: "⚙️ Think about speed, accessibility, or compatibility. E.g., 'Must work on mobile', or 'Respond in under 3 seconds'.",
    validator: (text: string) =>
      text.toLowerCase().includes("mobile") ||
      text.toLowerCase().includes("seconds") ||
      text.toLowerCase().includes("accessibility"),
  },
];

export default function AcceptanceCriteriaChecker() {
  // Initialize state from localStorage or defaults
  const [step, setStep] = useState(() => {
    try {
      const saved = localStorage.getItem('ac_coach_step');
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      console.log('Error loading AC coach step from localStorage:', error);
      return 0;
    }
  });

  const [responses, setResponses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ac_coach_responses');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.log('Error loading AC coach responses from localStorage:', error);
      return [];
    }
  });

  const [validity, setValidity] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem('ac_coach_validity');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.log('Error loading AC coach validity from localStorage:', error);
      return [];
    }
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('ac_coach_step', step.toString());
    } catch (error) {
      console.log('Error saving AC coach step to localStorage:', error);
    }
  }, [step]);

  useEffect(() => {
    try {
      localStorage.setItem('ac_coach_responses', JSON.stringify(responses));
    } catch (error) {
      console.log('Error saving AC coach responses to localStorage:', error);
    }
  }, [responses]);

  useEffect(() => {
    try {
      localStorage.setItem('ac_coach_validity', JSON.stringify(validity));
    } catch (error) {
      console.log('Error saving AC coach validity to localStorage:', error);
    }
  }, [validity]);

  const current = coachingSteps[step];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const val = formData.get('ac-input') as string;
    const isValid = current.validator(val);
    setResponses((prev) => [...prev, val]);
    setValidity((prev) => [...prev, isValid]);
    setStep((prev) => prev + 1);
    e.currentTarget.reset();
  };

  const handleReset = () => {
    setStep(0);
    setResponses([]);
    setValidity([]);
  };

  if (step >= coachingSteps.length) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-10">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎉 Coaching Complete!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Great job working through all the acceptance criteria coaching steps. Here's your summary:
          </p>
          
          <div className="space-y-3 mb-6">
            {coachingSteps.map((rule, idx) => (
              <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <strong className="text-gray-900 dark:text-white">{rule.label}:</strong>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {responses[idx] || "No response provided"}
                  </p>
                </div>
                <div className="ml-4">
                  {validity[idx] ? (
                    <span className="text-green-600 font-semibold">✅ Good</span>
                  ) : (
                    <span className="text-orange-600 font-semibold">⚠️ Needs revision</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
            >
              Start Over
            </button>
            <button
              onClick={() => {
                // Copy all responses to clipboard
                const summary = responses.map((response, idx) => 
                  `${coachingSteps[idx].label}: ${response}`
                ).join('\n\n');
                navigator.clipboard.writeText(summary);
                alert('Summary copied to clipboard!');
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              Copy Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {step + 1} of {coachingSteps.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(((step + 1) / coachingSteps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / coachingSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{current.label}</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">{current.tip}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              name="ac-input"
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Enter your acceptance criterion for this step..."
              required
            />
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
              >
                Submit & Continue
              </button>
              
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  ← Previous
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}