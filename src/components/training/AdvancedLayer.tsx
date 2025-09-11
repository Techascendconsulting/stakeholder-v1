import { useState, useEffect } from 'react';
import { Scenario } from '../../data/scenarios';
import { scenariosNew } from '../../data/scenarios_new';
import { validateAcceptanceCriterion, ValidationResult } from '../../utils/useCoachingValidation';
import { checkUserStoryGPT } from '../../utils/validateUserStory';
import { checkSpecificStepGPT } from '../../utils/validateAcceptanceCriteria';
import AdvancedTrainingIntro from './AdvancedTrainingIntro';
import { saveAdvancedAttempt, updateAdvancedAttempt, getLastAdvancedAttempt } from '../../hooks/useAdvancedAttempts';
import { StakeholderBotLauncher } from '../StakeholderBotLauncher';
import { StakeholderBotPanel } from '../StakeholderBotPanel';
import { useStakeholderBot } from '../../context/StakeholderBotContext';

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
    tip: 'Focus on what the user wants to do, this is usually found in the "I want to..." part of the user story. Let that guide your acceptance criterion, e.g. the user wants to upload a document, there must be an AC about uploading a document.',
    expectedKeywords: ['upload', 'document', 'action', 'goal', 'want'],
  },
  {
    title: '3. Trigger (The "when")',
    question: 'When or under what condition does this happen?',
    tip: 'Say when this should happen, like after clicking a button or opening a screen. For example: "After clicking the Submit button".',
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
    title: '7. Integration Points (System connections)',
    question: 'What systems or services does this connect to?',
    tip: 'Think about APIs, databases, email services, or external systems. E.g., "The system sends data to the CRM" or "Validates against the NHS database".',
    expectedKeywords: ['api', 'database', 'email', 'system', 'integration', 'sync'],
  },
  {
    title: '8. Data Mapping & Validation (Advanced)',
    question: 'How is data transformed or validated between systems?',
    tip: 'Specify how data flows between systems, validation rules, and data transformations. E.g., "Maps NHS number to patient ID" or "Validates age ≥ 65".',
    expectedKeywords: ['map', 'validate', 'transform', 'data', 'field', 'rule'],
  }
];

export default function AdvancedLayer() {
  const { setCurrentUserStory, setCurrentStep } = useStakeholderBot();
  // Track whether user is in intro or practice mode
  const [showPractice, setShowPractice] = useState(() => {
    try {
      const saved = localStorage.getItem('advanced_show_practice');
      return saved === 'true';
    } catch (error) {
      return false;
    }
  });

  // Initialize state from localStorage or defaults
  const [stepIndex, setStepIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('advanced_coaching_stepIndex');
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      return 0;
    }
  });

  const [acInputs, setAcInputs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('advanced_coaching_acInputs');
      if (saved) {
        const parsed = JSON.parse(saved);
        const inputs = Array(coachingSteps.length).fill('');
        parsed.forEach((input: string, index: number) => {
          if (index < inputs.length) inputs[index] = input;
        });
        return inputs;
      }
    } catch (error) {
      console.log('Error loading acInputs from localStorage:', error);
    }
    return Array(coachingSteps.length).fill('');
  });

  const [feedbacks, setFeedbacks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('advanced_coaching_feedbacks');
      if (saved) {
        const parsed = JSON.parse(saved);
        const feedbacks = Array(coachingSteps.length).fill('');
        parsed.forEach((feedback: string, index: number) => {
          if (index < feedbacks.length) feedbacks[index] = feedback;
        });
        return feedbacks;
      }
    } catch (error) {
      console.log('Error loading feedbacks from localStorage:', error);
    }
    return Array(coachingSteps.length).fill('');
  });

  const [userStory, setUserStory] = useState(() => {
    try {
      return localStorage.getItem('advanced_coaching_userStory') || '';
    } catch (error) {
      return '';
    }
  });

  const [userStoryValidation, setUserStoryValidation] = useState<ValidationResult | null>(null);
  const [acValidation, setAcValidation] = useState<ValidationResult | null>(null);
  const [aiValidationLoading, setAiValidationLoading] = useState(false);
  const [aiValidationResults, setAiValidationResults] = useState<any[]>([]);
  
  // Persistence state
  const [savedAttemptId, setSavedAttemptId] = useState<string | null>(null);
  const [isLoadingFromServer, setIsLoadingFromServer] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  // Advanced scenarios (IDs 26-35)
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(() => {
    try {
      const saved = localStorage.getItem('advanced_coaching_scenario');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.log('Error loading scenario from localStorage:', error);
    }
    return null;
  });

  // Load a random advanced scenario on component mount if none is saved
  useEffect(() => {
    if (!currentScenario) {
      const advancedScenarios = scenariosNew.filter(scenario => {
        const id = parseInt(scenario.id);
        return id >= 26 && id <= 35;
      });
      if (advancedScenarios.length > 0) {
        const randomAdvanced = advancedScenarios[Math.floor(Math.random() * advancedScenarios.length)];
        setCurrentScenario(randomAdvanced);
      }
    }
  }, [currentScenario]);

  // Save showPractice state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('advanced_show_practice', showPractice.toString());
    } catch (error) {
      console.log('Error saving showPractice to localStorage:', error);
    }
  }, [showPractice]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('advanced_coaching_stepIndex', stepIndex.toString());
    } catch (error) {
      console.log('Error saving stepIndex to localStorage:', error);
    }
  }, [stepIndex]);

  // Sync current step with StakeholderBot context
  useEffect(() => {
    try { setCurrentStep(stepIndex); } catch {}
  }, [stepIndex, setCurrentStep]);

  useEffect(() => {
    try {
      localStorage.setItem('advanced_coaching_acInputs', JSON.stringify(acInputs));
    } catch (error) {
      console.log('Error saving acInputs to localStorage:', error);
    }
  }, [acInputs]);

  useEffect(() => {
    try {
      localStorage.setItem('advanced_coaching_feedbacks', JSON.stringify(feedbacks));
    } catch (error) {
      console.log('Error saving feedbacks to localStorage:', error);
    }
  }, [feedbacks]);

  useEffect(() => {
    try {
      localStorage.setItem('advanced_coaching_userStory', userStory);
    } catch (error) {
      console.log('Error saving userStory to localStorage:', error);
    }
    try { setCurrentUserStory(userStory); } catch {}
  }, [userStory]);

  useEffect(() => {
    try {
      if (currentScenario) {
        localStorage.setItem('advanced_coaching_scenario', JSON.stringify(currentScenario));
      }
    } catch (error) {
      console.log('Error saving scenario to localStorage:', error);
    }
  }, [currentScenario]);

  // Load from server when component mounts or scenario changes
  useEffect(() => {
    if (currentScenario && showPractice) {
      loadFromServer();
    }
  }, [currentScenario, showPractice]);

  // Auto-save to server when key data changes (debounced)
  useEffect(() => {
    if (!currentScenario || isLoadingFromServer || !showPractice) return;

    const timeoutId = setTimeout(() => {
      saveToServer(true); // Auto-save
    }, 2000); // 2 second delay

    return () => clearTimeout(timeoutId);
  }, [userStory, acInputs, stepIndex, feedbacks, aiValidationResults, showPractice]);

  // Save to server when completing a step
  useEffect(() => {
    if (stepIndex > 0 && acInputs[stepIndex - 1]?.trim() && showPractice) {
      saveToServer(false); // Manual save on step completion
    }
  }, [stepIndex, showPractice]);

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
    try { setCurrentUserStory(value); } catch {}
    
    // Validate user story structure in real-time
    if (value.trim()) {
      const roleMatch = /as a[n]?\s+\w+/i.test(value);
      const actionMatch = /i want\s+[a-z ]+/i.test(value);
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
    setAcValidation(null);
    setAiValidationResults([]); // Clear AI feedback when resetting step
  };

  const handleNewScenario = () => {
    const advancedScenarios = scenariosNew.filter(scenario => {
      const id = parseInt(scenario.id);
      return id >= 26 && id <= 35;
    });
    
    if (advancedScenarios.length > 0) {
      const randomAdvanced = advancedScenarios[Math.floor(Math.random() * advancedScenarios.length)];
      setCurrentScenario(randomAdvanced);
      setUserStory('');
      setStepIndex(0);
      setAcInputs(Array(coachingSteps.length).fill(''));
      setFeedbacks(Array(coachingSteps.length).fill(''));
      setUserStoryValidation(null);
      setAcValidation(null);
      setAiValidationResults([]); // Clear AI feedback when getting new scenario
    }
  };

  const handleStartPractice = () => {
    setShowPractice(true);
  };

  // Persistence functions
  const saveToServer = async (isAutoSave = false) => {
    if (!currentScenario) return;

    try {
      const feedbackHistory: Record<string, any> = {};
      
      // Store feedback for each step
      feedbacks.forEach((feedback, index) => {
        if (feedback.trim()) {
          feedbackHistory[`step_${index + 1}`] = feedback;
        }
      });

      // Store AI validation results
      if (aiValidationResults.length > 0) {
        feedbackHistory.aiValidationResults = aiValidationResults;
      }

      const attemptData = {
        scenarioId: currentScenario.id,
        step: stepIndex,
        userStory,
        acceptanceCriteria: acInputs,
        feedbackHistory,
        advancedMetadata: {
          form_fields: currentScenario.form_fields || [],
          validation_rules: currentScenario.validation_rules || [],
          integrations: currentScenario.integrations || []
        },
        completed: stepIndex === coachingSteps.length - 1 && acInputs[stepIndex].trim() ? true : false
      };

      let result;
      if (savedAttemptId) {
        // Update existing attempt
        result = await updateAdvancedAttempt(savedAttemptId, attemptData);
      } else {
        // Create new attempt
        result = await saveAdvancedAttempt(attemptData);
        if (result.success && result.data?.id) {
          setSavedAttemptId(result.data.id);
        }
      }

      if (result.success) {
        setLastSavedAt(new Date());
        if (!isAutoSave) {
          console.log('Advanced progress saved successfully');
        }
      } else {
        console.warn('Failed to save advanced progress:', result.error);
      }
    } catch (error) {
      console.error('Error saving to server:', error);
    }
  };

  const loadFromServer = async () => {
    if (!currentScenario) return;

    setIsLoadingFromServer(true);
    try {
      const result = await getLastAdvancedAttempt(currentScenario.id);
      
      if (result.success && result.data) {
        const savedAttempt = result.data;
        
        // Restore state from saved attempt
        setUserStory(savedAttempt.user_story || '');
        setAcInputs(savedAttempt.acceptance_criteria || Array(coachingSteps.length).fill(''));
        setStepIndex(savedAttempt.step || 0);
        setSavedAttemptId(savedAttempt.id);
        setLastSavedAt(new Date(savedAttempt.updated_at));
        
        // Restore feedback history
        if (savedAttempt.feedback_history) {
          const feedbacks = Array(coachingSteps.length).fill('');
          Object.entries(savedAttempt.feedback_history).forEach(([key, value]) => {
            if (key.startsWith('step_')) {
              const stepNum = parseInt(key.replace('step_', '')) - 1;
              if (stepNum >= 0 && stepNum < feedbacks.length) {
                feedbacks[stepNum] = value as string;
              }
            }
          });
          setFeedbacks(feedbacks);
          
          // Restore AI validation results
          if (savedAttempt.feedback_history.aiValidationResults) {
            setAiValidationResults(savedAttempt.feedback_history.aiValidationResults);
          }
        }
        
        console.log('Loaded previous advanced progress from server');
      }
    } catch (error) {
      console.error('Error loading from server:', error);
    } finally {
      setIsLoadingFromServer(false);
    }
  };

  const handleCheck = async () => {
    if (stepIndex === 0) {
      // Step 1: Check user story structure with AI
      if (!userStory.trim()) {
        alert('Please enter a user story first.');
        return;
      }
      
      if (userStory.trim().length < 30) {
        alert('Please write at least 30 characters for your user story.');
        return;
      }
      
      setAiValidationLoading(true);
      try {
        const aiResults = await checkUserStoryGPT(userStory);
        if (aiResults && aiResults.length > 0) {
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
          console.log('Using fallback validation for user story:', userStory);
          const roleMatch = /as a[n]?\s+\w+/i.test(userStory);
          const actionMatch = /i want\s+[a-z ]+/i.test(userStory);
          const outcomeMatch = /so that\s+[a-z ]+/i.test(userStory);
          
          console.log('Validation results:', { roleMatch, actionMatch, outcomeMatch });
          
          if (!roleMatch || !actionMatch || !outcomeMatch) {
            const missing = [];
            if (!roleMatch) missing.push('role (As a...)');
            if (!actionMatch) missing.push('action (I want...)');
            if (!outcomeMatch) missing.push('outcome (so that...)');
            
            const newFeedbacks = [...feedbacks];
            newFeedbacks[stepIndex] = `❌ Your user story is missing: ${missing.join(', ')}. Please include all three parts.`;
            setFeedbacks(newFeedbacks);
          } else {
            const newFeedbacks = [...feedbacks];
            newFeedbacks[stepIndex] = '✅ Great! Your user story has all required parts: role, action, and outcome.';
            setFeedbacks(newFeedbacks);
          }
        }
      } catch (error) {
        console.log('AI validation error:', error);
        // Fallback to basic validation
        const roleMatch = /as a[n]?\s+\w+/i.test(userStory);
        const actionMatch = /i want\s+[a-z ]+/i.test(userStory);
        const outcomeMatch = /so that\s+[a-z ]+/i.test(userStory);
        
        if (!roleMatch || !actionMatch || !outcomeMatch) {
          const missing = [];
          if (!roleMatch) missing.push('role (As a...)');
          if (!actionMatch) missing.push('action (I want...)');
          if (!outcomeMatch) missing.push('outcome (so that...)');
          
          const newFeedbacks = [...feedbacks];
          newFeedbacks[stepIndex] = `❌ Your user story is missing: ${missing.join(', ')}. Please include all three parts.`;
          setFeedbacks(newFeedbacks);
        } else {
          const newFeedbacks = [...feedbacks];
          newFeedbacks[stepIndex] = '✅ Great! Your user story has all required parts: role, action, and outcome.';
          setFeedbacks(newFeedbacks);
        }
      } finally {
        setAiValidationLoading(false);
      }
    } else {
      // Steps 2-8: Check acceptance criteria with AI
      if (!acInputs[stepIndex].trim()) {
        alert('Please enter an acceptance criterion first.');
        return;
      }
      
      setAiValidationLoading(true);
      try {
        const currentStep = coachingSteps[stepIndex];
        const aiResults = await checkSpecificStepGPT(
          acInputs[stepIndex],
          currentStep.title,
          currentStep.question,
          currentStep.tip,
          userStory
        );
        
        if (aiResults && aiResults.length > 0) {
          setAiValidationResults(aiResults);
          const passedRules = aiResults.filter((rule: any) => rule.status === '✅').length;
          const totalRules = aiResults.length;
          
          const newFeedbacks = [...feedbacks];
          if (passedRules === totalRules) {
            newFeedbacks[stepIndex] = `✔️ Excellent! Your acceptance criterion passed all ${totalRules} quality checks for this step.`;
          } else {
            newFeedbacks[stepIndex] = `⚠️ Your acceptance criterion passed ${passedRules}/${totalRules} quality checks. See detailed feedback below.`;
          }
          setFeedbacks(newFeedbacks);
        } else {
          // Fallback to basic validation
          const newFeedbacks = [...feedbacks];
          newFeedbacks[stepIndex] = '✅ Good! Your acceptance criterion looks well-structured.';
          setFeedbacks(newFeedbacks);
        }
      } catch (error) {
        console.log('AI validation error:', error);
        // Fallback to basic validation
        const newFeedbacks = [...feedbacks];
        newFeedbacks[stepIndex] = '✅ Good! Your acceptance criterion looks well-structured.';
        setFeedbacks(newFeedbacks);
      } finally {
        setAiValidationLoading(false);
      }
    }
  };

  const handleNext = () => {
    if (stepIndex < coachingSteps.length - 1) {
      setStepIndex(stepIndex + 1);
      setAcValidation(null);
      setAiValidationResults([]); // Clear AI feedback when moving to next step
    }
  };

  const handlePrevious = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      setAcValidation(null);
      setAiValidationResults([]); // Clear AI feedback when moving to previous step
    }
  };

  // Show intro page first, then practice
  if (!showPractice) {
    return <AdvancedTrainingIntro onStartPractice={handleStartPractice} />;
  }

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowPractice(false)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
        >
          ← Back to Introduction
        </button>
      </div>

      {/* Save Status Indicator */}
      {lastSavedAt && (
        <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400 text-sm">💾</span>
            <span className="text-green-700 dark:text-green-300 text-sm">
              Progress saved {lastSavedAt.toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
      
      {isLoadingFromServer && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 text-sm">🔄</span>
            <span className="text-blue-700 dark:text-blue-300 text-sm">
              Loading previous progress...
            </span>
          </div>
        </div>
      )}

      {/* Static Scenario and User Story Section */}
      <div className="space-y-4 mb-6">
        {/* Scenario */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm text-gray-500 dark:text-gray-400">Advanced Scenario:</h2>
            <button
              onClick={handleNewScenario}
              className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
            >
              🚀 New Advanced Scenario
            </button>
          </div>
          {currentScenario ? (
            <>
              <div className="mb-2">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                  {currentScenario.category}
                </span>
                <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full font-semibold">
                  🚀 Advanced
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{currentScenario.title}</h3>
              <p className="font-medium text-gray-900 dark:text-white">{currentScenario.description}</p>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Loading scenario...</p>
          )}
        </div>

        {/* User Story Input */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your User Story:</h2>
          <textarea
            placeholder="Write your user story based on the scenario above..."
            value={userStory}
            onChange={(e) => handleUserStoryChange(e.target.value)}
            className={`w-full min-h-[100px] px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
              userStoryValidation?.type === 'success' 
                ? 'border-green-500 focus:ring-green-500' 
                : userStoryValidation && userStoryValidation.type !== 'success'
                ? 'border-orange-500 focus:ring-orange-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          />
          {userStoryValidation && userStoryValidation.type === 'success' && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              ✅ Great! Your user story has all required parts.
            </p>
          )}
          {userStoryValidation && userStoryValidation.type !== 'success' && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              ⚠️ {userStoryValidation.message}
            </p>
          )}
          {stepIndex === 0 && userStory.trim().length > 0 && userStory.trim().length < 30 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              ⚠️ Please write at least 30 characters before checking your user story.
            </p>
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
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / coachingSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Column - Main Coaching Content (70% width) */}
        <div className="flex flex-col" style={{ flex: '0 0 70%' }}>
          {/* Coaching Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg flex-1 flex flex-col">
            <div className="space-y-4 p-6 flex-1 flex flex-col">
          {/* Step Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {coachingSteps[stepIndex].title}
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full">
                🚀 Advanced Mode
              </span>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Q: {coachingSteps[stepIndex].question}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 {coachingSteps[stepIndex].tip}
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 flex flex-col">
            <textarea
              placeholder="Type your Acceptance Criterion for this rule..."
              value={acInputs[stepIndex]}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full min-h-[120px] px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                acValidation?.type === 'success' 
                  ? 'border-green-500 focus:ring-green-500' 
                  : acValidation && (acValidation.type as string) !== 'success'
                  ? 'border-orange-500 focus:ring-orange-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
            />
            {!acInputs[stepIndex].trim() && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                ⚠️ Please enter an acceptance criterion to continue to the next step.
              </p>
            )}
            {acValidation && acValidation.type === 'success' && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ✅ Great! Your acceptance criterion looks well-structured.
              </p>
            )}
            {acValidation && acValidation.type !== 'success' && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                ⚠️ {acValidation.message}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={stepIndex === 0}
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                stepIndex === 0
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              ← Previous
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleResetStep}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Reset Step
              </button>
              
              <button
                onClick={handleCheck}
                disabled={aiValidationLoading || (stepIndex === 0 && userStory.trim().length < 30)}
                className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                  aiValidationLoading
                    ? 'bg-blue-500 text-white cursor-not-allowed animate-pulse'
                    : (stepIndex === 0 && userStory.trim().length < 30)
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {aiValidationLoading ? '🤖 AI Analyzing...' : (stepIndex === 0 ? 'Check User Story' : 'Check My Input')}
              </button>

              {stepIndex === 0 && userStory.trim().length > 0 && userStory.trim().length < 30 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  ⚠️ Please write at least 30 characters before checking your user story.
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={stepIndex === coachingSteps.length - 1 || !acInputs[stepIndex].trim()}
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                stepIndex === coachingSteps.length - 1 || !acInputs[stepIndex].trim()
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              Next Tip →
            </button>
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

        {/* Right Column - AI Feedback (30% width) */}
        <div className="flex flex-col" style={{ flex: '0 0 30%' }}>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg h-full">
            <div className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🤖 AI Feedback
              </h3>
              <div className="flex-1 overflow-y-auto">
                {aiValidationResults.length > 0 ? (
                  <div className="space-y-4">
                    {aiValidationResults.map((result, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-lg">{result.status}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.rule}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {result.feedback}
                        </p>
                        {result.suggestion && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            💡 {result.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p className="text-sm">Click "Check My Input" to get AI feedback on your acceptance criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
