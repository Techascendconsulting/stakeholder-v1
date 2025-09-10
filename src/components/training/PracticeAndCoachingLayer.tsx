import React, { useState, useEffect } from 'react';
import { getRandomScenario, Scenario } from '../../data/scenarios';
import { validateAcceptanceCriterion, ValidationResult } from '../../utils/useCoachingValidation';
import { checkUserStoryGPT } from '../../utils/validateUserStory';
import { checkAcceptanceCriteriaGPT } from '../../utils/validateAcceptanceCriteria';

interface CoachingStep {
  title: string;
  question: string;
  tip: string;
  expectedKeywords: string[];
}

const coachingSteps: CoachingStep[] = [
  {
    title: '1. User Story Structure Check',
    question: 'Does your user story have a clear role, what they want, and why?',
    tip: 'A good user story follows the format: "As a [role], I want [action/goal] so that [benefit/outcome]". Check that you have all three parts clearly defined.',
    expectedKeywords: ['as a', 'i want', 'so that', 'role', 'benefit'],
  },
  {
    title: '2. Match the User Goal (The "what")',
    question: 'What does the user want to do?',
    tip: 'Start by clearly reflecting the user\'s action from the story. If the user wants to upload a document, there must be an AC about uploading a document.',
    expectedKeywords: ['upload', 'document', 'action', 'goal', 'want'],
  },
  {
    title: '3. Trigger (The "when")',
    question: 'When or under what condition does this happen?',
    tip: 'Mention what event, screen, or action triggers the feature. E.g., "After clicking Submit..."',
    expectedKeywords: ['after', 'when', 'click', 'submit', 'trigger'],
  },
  {
    title: '4. Rules (What\'s allowed, restricted, required)',
    question: 'Are there any rules the feature must follow?',
    tip: 'Think of file types, required fields, time limits, or business rules. E.g., "Only JPG, PNG, or JPEG files are allowed."',
    expectedKeywords: ['only', 'must', 'required', 'allowed', 'restricted'],
  },
  {
    title: '5. Feedback (What the user sees after success)',
    question: 'What should the user see if it works?',
    tip: 'Think of confirmation messages, visual feedback, changes on screen, or what happens next.',
    expectedKeywords: ['see', 'message', 'confirmation', 'success', 'feedback'],
  },
  {
    title: '6. Error Handling (What happens if it fails)',
    question: 'What happens if something goes wrong?',
    tip: 'Describe failure scenarios (e.g., large file, invalid input) and how the system responds (error messages, etc).',
    expectedKeywords: ['error', 'fail', 'invalid', 'wrong', 'handling'],
  },
  {
    title: '7. Non-Functional Constraints (Performance, device, time, etc)',
    question: 'Does anything affect speed, devices, or limits?',
    tip: 'Mention timeouts, loading time, file size limits, mobile constraints, etc.',
    expectedKeywords: ['time', 'speed', 'limit', 'size', 'performance', 'mobile'],
  },
  {
    title: '8. Proof Sent (Confirmation that output was sent/shared)',
    question: 'What exactly gets sent or shared?',
    tip: 'E.g., "The email includes the document name, user reference, and date submitted." Helpful for audit trails or confirmations.',
    expectedKeywords: ['email', 'sent', 'includes', 'reference', 'proof', 'confirmation'],
  }
];

export default function PracticeAndCoachingLayer() {
  const [stepIndex, setStepIndex] = useState(0);
  const [acInputs, setAcInputs] = useState<string[]>(Array(coachingSteps.length).fill(''));
  const [feedbacks, setFeedbacks] = useState<string[]>(Array(coachingSteps.length).fill(''));
  const [userStory, setUserStory] = useState('');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [userStoryValidation, setUserStoryValidation] = useState<ValidationResult | null>(null);
  const [acValidation, setAcValidation] = useState<ValidationResult | null>(null);
  const [aiValidationLoading, setAiValidationLoading] = useState(false);
  const [aiValidationResults, setAiValidationResults] = useState<any[]>([]);

  // Load a random scenario on component mount
  useEffect(() => {
    setCurrentScenario(getRandomScenario());
  }, []);

  const handleInputChange = (value: string) => {
    const newInputs = [...acInputs];
    newInputs[stepIndex] = value;
    setAcInputs(newInputs);
    
    // Validate the AC input in real-time
    if (value.trim() && currentScenario) {
      const scenarioKeywords = currentScenario.tags || [];
      const validation = validateAcceptanceCriterion(value, scenarioKeywords, userStory);
      setAcValidation(validation);
    } else {
      setAcValidation(null);
    }
  };

  const handleUserStoryChange = (value: string) => {
    setUserStory(value);
    
    // Validate user story structure in real-time
    if (value.trim()) {
      const roleMatch = /as a[n]?\s+\w+/i.test(value);
      const actionMatch = /i want to\s+[a-z ]+/i.test(value);
      const outcomeMatch = /so that\s+[a-z ]+/i.test(value);
      
      if (!roleMatch || !actionMatch || !outcomeMatch) {
        setUserStoryValidation({
          type: 'missingRoleActionOutcome',
          message: 'The user story seems incomplete — check if it includes a role, what they want, and why.'
        });
      } else {
        setUserStoryValidation({ type: 'success' });
      }
    } else {
      setUserStoryValidation(null);
    }
  };


  const handleResetStep = () => {
    const newInputs = [...acInputs];
    newInputs[stepIndex] = '';
    setAcInputs(newInputs);
    const newFeedbacks = [...feedbacks];
    newFeedbacks[stepIndex] = '';
    setFeedbacks(newFeedbacks);
  };

  const handleNewScenario = () => {
    setCurrentScenario(getRandomScenario());
    setUserStory('');
    setStepIndex(0);
    setAcInputs(Array(coachingSteps.length).fill(''));
    setFeedbacks(Array(coachingSteps.length).fill(''));
    setUserStoryValidation(null);
    setAcValidation(null);
  };

  const handleCheck = async () => {
    console.log('Button clicked!', { stepIndex, userStory: userStory.trim() });
    if (stepIndex === 0) {
      // Step 1: Check user story structure with AI
      if (!userStory.trim()) {
        alert('Please enter a user story first.');
        return;
      }
      
      setAiValidationLoading(true);
      try {
        const aiResults = await checkUserStoryGPT(userStory);
        if (aiResults) {
          setAiValidationResults(aiResults);
          const passedRules = aiResults.filter((rule: any) => rule.status === '✅').length;
          const totalRules = aiResults.length;
          
          const newFeedbacks = [...feedbacks];
          if (passedRules === totalRules) {
            newFeedbacks[stepIndex] = `✔️ Excellent! Your user story passed all ${totalRules} quality checks.`;
          } else {
            newFeedbacks[stepIndex] = `⚠️ Your user story passed ${passedRules}/${totalRules} quality checks. See detailed feedback below.`;
          }
          setFeedbacks(newFeedbacks);
        } else {
          // Fallback to basic validation
          const roleMatch = /as a[n]?\s+\w+/i.test(userStory);
          const actionMatch = /i want to\s+[a-z ]+/i.test(userStory);
          const outcomeMatch = /so that\s+[a-z ]+/i.test(userStory);
          
          const newFeedbacks = [...feedbacks];
          if (roleMatch && actionMatch && outcomeMatch) {
            newFeedbacks[stepIndex] = '✔️ Excellent! Your user story has all required parts: role, action, and benefit.';
          } else {
            const missing = [];
            if (!roleMatch) missing.push('role (As a...)');
            if (!actionMatch) missing.push('action (I want to...)');
            if (!outcomeMatch) missing.push('benefit (so that...)');
            newFeedbacks[stepIndex] = `⚠️ Your user story is missing: ${missing.join(', ')}. Please add the missing parts.`;
          }
          setFeedbacks(newFeedbacks);
        }
      } catch (error) {
        console.error('AI validation error:', error);
        // Fallback to basic validation
        const newFeedbacks = [...feedbacks];
        newFeedbacks[stepIndex] = '⚠️ AI validation unavailable. Check console for details or ensure VITE_OPENAI_KEY is set.';
        setFeedbacks(newFeedbacks);
      } finally {
        setAiValidationLoading(false);
      }
    } else {
      // Steps 2-8: Check acceptance criteria with AI
      if (!userStory.trim()) {
        alert('Please enter a user story first before checking your acceptance criteria.');
        return;
      }
      
      setAiValidationLoading(true);
      try {
        const acList = acInputs.filter(ac => ac.trim());
        const aiResults = await checkAcceptanceCriteriaGPT(userStory, acList);
        if (aiResults) {
          setAiValidationResults(aiResults);
          const passedRules = aiResults.filter((rule: any) => rule.status === '✅').length;
          const totalRules = aiResults.length;
          
          const newFeedbacks = [...feedbacks];
          if (passedRules === totalRules) {
            newFeedbacks[stepIndex] = `✔️ Excellent! Your acceptance criteria passed all ${totalRules} quality checks.`;
          } else {
            newFeedbacks[stepIndex] = `⚠️ Your acceptance criteria passed ${passedRules}/${totalRules} quality checks. See detailed feedback below.`;
          }
          setFeedbacks(newFeedbacks);
        } else {
          // Fallback to basic validation
          const input = acInputs[stepIndex].toLowerCase();
          const storyText = userStory.toLowerCase();
          const keywords = coachingSteps[stepIndex].expectedKeywords;
          
          const storyKeywords = storyText.split(/\s+/).filter(word => word.length > 3);
          const hasStoryConnection = storyKeywords.some(word => input.includes(word));
          const hasExpectedKeywords = keywords.some(kw => input.includes(kw));
          
          const newFeedbacks = [...feedbacks];
          if (hasStoryConnection && hasExpectedKeywords) {
            newFeedbacks[stepIndex] = '✔️ Excellent! Your acceptance criterion clearly connects to your user story.';
          } else if (hasStoryConnection) {
            newFeedbacks[stepIndex] = '⚠️ Good connection to your story, but consider adding more specific details.';
          } else if (hasExpectedKeywords) {
            newFeedbacks[stepIndex] = '⚠️ Good structure, but make sure it relates to your specific user story.';
          } else {
            newFeedbacks[stepIndex] = '⚠️ Try to better connect this to your user story and include more specific details.';
          }
          setFeedbacks(newFeedbacks);
        }
      } catch (error) {
        console.error('AI validation error:', error);
        // Fallback to basic validation
        const newFeedbacks = [...feedbacks];
        newFeedbacks[stepIndex] = '⚠️ AI validation unavailable. Check console for details or ensure VITE_OPENAI_KEY is set.';
        setFeedbacks(newFeedbacks);
      } finally {
        setAiValidationLoading(false);
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Static Scenario and User Story Section */}
      <div className="space-y-4 mb-6">
        {/* Scenario */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm text-gray-500 dark:text-gray-400">Scenario:</h2>
            <button
              onClick={handleNewScenario}
              className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
            >
              🎲 New Scenario
            </button>
          </div>
          {currentScenario ? (
            <>
              <div className="mb-2">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                  {currentScenario.category}
                </span>
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                  {currentScenario.difficulty}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{currentScenario.title}</h3>
              <p className="font-medium text-gray-900 dark:text-white">{currentScenario.description}</p>
            </>
          ) : (
            <p className="font-medium text-gray-900 dark:text-white">Loading scenario...</p>
          )}
        </div>

        {/* User Story */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your User Story:</h2>
          <textarea
            placeholder=""
            value={userStory}
            onChange={(e) => handleUserStoryChange(e.target.value)}
            className={`w-full min-h-[80px] px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
              userStoryValidation?.type === 'success' 
                ? 'border-green-500 focus:ring-green-500' 
                : userStoryValidation?.type === 'missingRoleActionOutcome'
                ? 'border-orange-500 focus:ring-orange-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
            }`}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Write your user story following the format: "As a [role], I want [action] so that [benefit]"
          </p>
          {userStoryValidation && (
            <div className={`mt-2 p-2 rounded-md text-sm ${
              userStoryValidation.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
            }`}>
              {userStoryValidation.type === 'success' ? (
                <span>✅ {userStoryValidation.type === 'success' ? 'Great! Your user story has all required parts.' : ''}</span>
              ) : (
                <span>⚠️ {userStoryValidation.message}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {stepIndex + 1} of {coachingSteps.length}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(((stepIndex + 1) / coachingSteps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / coachingSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Coaching Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
        <div className="space-y-4 p-6">
          {/* Step Header */}
          <div>
            <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {coachingSteps[stepIndex].title}
            </h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Q: {coachingSteps[stepIndex].question}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Tip:</strong> {coachingSteps[stepIndex].tip}
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div>
            {stepIndex === 0 ? (
              // Step 1: User Story Structure Check
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your User Story (already entered above):
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userStory || "No user story entered yet. Please enter your user story in the section above."}
                  </p>
                </div>
                {!userStory.trim() && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                    ⚠️ Please enter a user story above to check its structure.
                  </p>
                )}
              </div>
            ) : (
              // Steps 2-8: Acceptance Criteria Input
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Acceptance Criterion for this rule:
                </label>
                <textarea
                  placeholder="Type your Acceptance Criterion for this rule..."
                  value={acInputs[stepIndex]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`w-full min-h-[120px] px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                    acValidation?.type === 'success' 
                      ? 'border-green-500 focus:ring-green-500' 
                      : acValidation && acValidation.type !== 'success'
                      ? 'border-orange-500 focus:ring-orange-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                  }`}
                />
                {!acInputs[stepIndex].trim() && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                    ⚠️ Please enter an acceptance criterion to continue to the next step.
                  </p>
                )}
                {acValidation && acInputs[stepIndex].trim() && (
                  <div className={`mt-2 p-2 rounded-md text-sm ${
                    acValidation.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                  }`}>
                    {acValidation.type === 'success' ? (
                      <span>✅ Great! This acceptance criterion looks good.</span>
                    ) : (
                      <span>⚠️ {acValidation.message}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Check Button */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log('Button click event fired');
                handleCheck();
              }}
              disabled={aiValidationLoading}
              className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                aiValidationLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
              style={{ pointerEvents: aiValidationLoading ? 'none' : 'auto' }}
            >
              {aiValidationLoading ? '🤖 AI Analyzing...' : (stepIndex === 0 ? 'Check User Story' : 'Check My Input')}
            </button>
            
            {/* Debug button */}
            <button
              onClick={() => {
                console.log('Debug button clicked!');
                alert('Debug button works!');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
            >
              Debug
            </button>
          </div>

          {/* Feedback */}
          {feedbacks[stepIndex] && (
            <div className="text-sm mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="text-gray-800 dark:text-gray-200">{feedbacks[stepIndex]}</p>
            </div>
          )}

          {/* AI Validation Results */}
          {aiValidationResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">🤖 AI Quality Analysis:</h4>
              <div className="space-y-2">
                {aiValidationResults.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border text-sm ${
                      result.status === '✅'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{result.status}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{result.rule}</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{result.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setStepIndex(prev => Math.max(prev - 1, 0))}
              disabled={stepIndex === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={handleResetStep}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Reset Step
              </button>
              
              <button
                onClick={() => {
                  if (stepIndex === 0) {
                    // Step 1: Check if user story is entered
                    if (!userStory.trim()) {
                      return;
                    }
                  } else {
                    // Steps 2-8: Check if AC is entered
                    if (!acInputs[stepIndex].trim()) {
                      return;
                    }
                  }
                  setStepIndex(prev => Math.min(prev + 1, coachingSteps.length - 1));
                }}
                disabled={
                  stepIndex === coachingSteps.length - 1 || 
                  (stepIndex === 0 ? !userStory.trim() : !acInputs[stepIndex].trim())
                }
                className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                  stepIndex === coachingSteps.length - 1 || 
                  (stepIndex === 0 ? !userStory.trim() : !acInputs[stepIndex].trim())
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                Next Tip →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Progress:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Completed Steps:</span>
            <p className="font-medium text-gray-900 dark:text-white">{acInputs.filter(ac => ac.trim()).length} / {coachingSteps.length}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Current Step:</span>
            <p className="font-medium text-gray-900 dark:text-white">{coachingSteps[stepIndex].title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
