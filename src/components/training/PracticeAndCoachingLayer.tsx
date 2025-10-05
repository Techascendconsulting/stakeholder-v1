import { useState, useEffect, useRef } from 'react';
import { Scenario } from '../../data/scenarios';
import { scenariosNew } from '../../data/scenarios_new';
import { validateAcceptanceCriterion, ValidationResult } from '../../utils/useCoachingValidation';
import { validateTriggerScope } from '../../utils/validators/validateTriggerScope';
import { checkUserStoryGPT } from '../../utils/validateUserStory';
import { checkSpecificStepGPT } from '../../utils/validateAcceptanceCriteria';
import { getAdvancedTriggersFound } from '../../coaching/utils/triggerUtils';
import AdvancedExplainer from '../modals/AdvancedExplainer';
import { savePracticeStory, updatePracticeStory } from '../../hooks/useSavePracticeStory';
import { loadLastPracticeStory } from '../../hooks/useLoadPracticeStory';
import { useStakeholderBot } from '../../context/StakeholderBotContext';
import { StakeholderBotLauncher } from '../StakeholderBotLauncher';
import { StakeholderBotPanel } from '../StakeholderBotPanel';

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

// Helper: pick ONLY non-advanced practice scenarios (IDs 1–25)
const getRandomPracticeScenario = (): Scenario => {
  const practiceOnly = scenariosNew.filter((s) => {
    const idNum = parseInt(s.id, 10);
    return !Number.isNaN(idNum) && idNum >= 1 && idNum <= 25;
  });
  const idx = Math.floor(Math.random() * practiceOnly.length);
  return practiceOnly[idx];
};

interface PracticeAndCoachingLayerProps {
  onSwitchToAdvanced?: () => void;
}

export default function PracticeAndCoachingLayer({ onSwitchToAdvanced }: PracticeAndCoachingLayerProps) {
  const { setCurrentUserStory, setCurrentStep, setBotCurrentScenario } = useStakeholderBot();
  // Initialize state from localStorage or defaults
  const [stepIndex, setStepIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('practice_coaching_stepIndex');
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      console.log('Error loading stepIndex from localStorage:', error);
      return 0;
    }
  });

  const [acInputs, setAcInputs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('practice_coaching_acInputs');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure we have the right length array
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
      const saved = localStorage.getItem('practice_coaching_feedbacks');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure we have the right length array
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
      const saved = localStorage.getItem('practice_coaching_userStory');
      return saved || 'As a [role]\nI want [action]\nSo that [benefit]';
    } catch (error) {
      console.log('Error loading userStory from localStorage:', error);
      return 'As a [role]\nI want [action]\nSo that [benefit]';
    }
  });

  // Timeout ref for debouncing validation
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(() => {
    try {
      const saved = localStorage.getItem('practice_coaching_scenario');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.log('Error loading scenario from localStorage:', error);
    }
    return null;
  });

  const [userStoryValidation, setUserStoryValidation] = useState<ValidationResult | null>(null);
  const [acValidation, setAcValidation] = useState<ValidationResult | null>(null);
  const [aiValidationLoading, setAiValidationLoading] = useState(false);
  const [aiValidationResults, setAiValidationResults] = useState<any[]>([]);
  const [feedbackApplied, setFeedbackApplied] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem('practice_coaching_feedbackApplied');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array(coachingSteps.length).fill(false).map((_, index) => parsed[index] || false);
      }
    } catch (error) {
      console.log('Error loading feedbackApplied from localStorage:', error);
    }
    return Array(coachingSteps.length).fill(false);
  });
  
  // Persistence state
  const [savedStoryId, setSavedStoryId] = useState<string | null>(null);
  const [isLoadingFromServer, setIsLoadingFromServer] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isStartingFresh, setIsStartingFresh] = useState(false);
  
  // Advanced coaching mode state
  const [showAdvancedExplainer, setShowAdvancedExplainer] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(() => {
    try {
      const saved = localStorage.getItem('practice_coaching_advancedMode');
      return saved === 'true';
    } catch (error) {
      return false;
    }
  });
  const [userHasSeenAdvancedCoach, setUserHasSeenAdvancedCoach] = useState(() => {
    try {
      return localStorage.getItem('seenAdvancedCoach') === 'true';
    } catch (error) {
      return false;
    }
  });
  const [advancedTriggersFound, setAdvancedTriggersFound] = useState<string[]>([]);

  // Load a random scenario on component mount if none is saved
  useEffect(() => {
    if (!currentScenario) {
      const newScenario = getRandomPracticeScenario();
      setCurrentScenario(newScenario);
    } else {
      // If a previously saved scenario is an advanced one (id >= 26), replace with a practice scenario
      const idNum = parseInt((currentScenario as any).id, 10);
      if (!Number.isNaN(idNum) && idNum >= 26) {
        setCurrentScenario(getRandomPracticeScenario());
      }
    }
  }, [currentScenario]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('practice_coaching_stepIndex', stepIndex.toString());
    } catch (error) {
      console.log('Error saving stepIndex to localStorage:', error);
    }
  }, [stepIndex]);

  // Debounced localStorage save for acInputs to prevent performance issues
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('practice_coaching_acInputs', JSON.stringify(acInputs));
      } catch (error) {
        console.log('Error saving acInputs to localStorage:', error);
      }
    }, 2000); // 2 second debounce for localStorage saves

    return () => clearTimeout(timeoutId);
  }, [acInputs]);

  useEffect(() => {
    try {
      localStorage.setItem('practice_coaching_feedbacks', JSON.stringify(feedbacks));
    } catch (error) {
      console.log('Error saving feedbacks to localStorage:', error);
    }
  }, [feedbacks]);

  useEffect(() => {
    try {
      localStorage.setItem('practice_coaching_feedbackApplied', JSON.stringify(feedbackApplied));
    } catch (error) {
      console.log('Error saving feedbackApplied to localStorage:', error);
    }
  }, [feedbackApplied]);

  useEffect(() => {
    try {
      localStorage.setItem('practice_coaching_userStory', userStory);
    } catch (error) {
      console.log('Error saving userStory to localStorage:', error);
    }
    try { setCurrentUserStory(userStory); } catch {}
  }, [userStory]);

  // Sync current step with StakeholderBot context
  useEffect(() => {
    try { setCurrentStep(stepIndex); } catch {}
  }, [stepIndex, setCurrentStep]);

  // Sync current scenario with StakeholderBot context
  useEffect(() => {
    try { setBotCurrentScenario(currentScenario); } catch {}
  }, [currentScenario, setBotCurrentScenario]);

  useEffect(() => {
    try {
      if (currentScenario) {
        localStorage.setItem('practice_coaching_scenario', JSON.stringify(currentScenario));
      }
    } catch (error) {
      console.log('Error saving scenario to localStorage:', error);
    }
  }, [currentScenario]);

  // Persist advanced mode state
  useEffect(() => {
    try {
      localStorage.setItem('practice_coaching_advancedMode', isAdvancedMode.toString());
    } catch (error) {
      console.log('Error saving advancedMode to localStorage:', error);
    }
  }, [isAdvancedMode]);

  // Load from server when component mounts or scenario changes
  useEffect(() => {
    if (currentScenario && !isStartingFresh && savedStoryId !== null) {
      loadFromServer();
    }
    // Reset the fresh start flag after checking
    if (isStartingFresh) {
      setIsStartingFresh(false);
    }
  }, [currentScenario, isStartingFresh, savedStoryId]);

  // Auto-save to server when key data changes (debounced)
  useEffect(() => {
    if (!currentScenario || isLoadingFromServer) return;

    const timeoutId = setTimeout(() => {
      saveToServer(true); // Auto-save
    }, 10000); // Increased to 10 second delay to reduce server calls

    return () => clearTimeout(timeoutId);
  }, [userStory, acInputs, stepIndex, feedbacks, aiValidationResults, feedbackApplied]);

  // Save to server when completing a step
  useEffect(() => {
    if (stepIndex > 0 && acInputs[stepIndex - 1]?.trim()) {
      saveToServer(false); // Manual save on step completion
    }
  }, [stepIndex]);

  // Detect advanced triggers when user story or AC inputs change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const combinedInput = userStory + ' ' + acInputs.join(' ');
      if (combinedInput.trim().length > 0) {
        const triggers = getAdvancedTriggersFound(combinedInput);
        setAdvancedTriggersFound(triggers);
        
        // Show advanced explainer if triggers found and user hasn't seen it
        if (triggers.length > 0 && !userHasSeenAdvancedCoach && !isAdvancedMode) {
          setShowAdvancedExplainer(true);
        }
      }
    }, 2000); // 2 second debounce for trigger detection

    return () => clearTimeout(timeoutId);
  }, [userStory, acInputs, userHasSeenAdvancedCoach, isAdvancedMode]);

  const handleInputChange = (value: string) => {
    const newInputs = [...acInputs];
    newInputs[stepIndex] = value;
    setAcInputs(newInputs);
    
    // Clear AI results on edit to allow re-check
    setAiValidationResults([]);
    
    // Reset feedback applied status when user edits
    const newFeedbackApplied = [...feedbackApplied];
    newFeedbackApplied[stepIndex] = false;
    setFeedbackApplied(newFeedbackApplied);
    
    // Disable real-time validation completely to prevent performance issues
    // Validation will only happen when user clicks "Check My Input"
    setAcValidation(null);
  };

  const handleUserStoryChange = (value: string) => {
    setUserStory(value);
    try { setCurrentUserStory(value); } catch {}
    
    // Clear AI results on edit to allow re-check
    setAiValidationResults([]);
    
    // Reset feedback applied status when user edits
    const newFeedbackApplied = [...feedbackApplied];
    newFeedbackApplied[0] = false; // User story is step 0
    setFeedbackApplied(newFeedbackApplied);
    
    // Disable real-time validation to prevent performance issues
    // Validation will only happen when user clicks "Check My Input"
    setUserStoryValidation(null);
  };

  // Advanced coaching handlers
  const handleAcceptAdvanced = () => {
    setIsAdvancedMode(true);
    setShowAdvancedExplainer(false);
    localStorage.setItem('seenAdvancedCoach', 'true');
    setUserHasSeenAdvancedCoach(true);
    // Switch to advanced tab to start advanced coaching
    if (onSwitchToAdvanced) {
      onSwitchToAdvanced();
    }
  };

  const handleDismissAdvanced = () => {
    setShowAdvancedExplainer(false);
    localStorage.setItem('seenAdvancedCoach', 'true');
    setUserHasSeenAdvancedCoach(true);
  };

  // Persistence functions
  const saveToServer = async (isAutoSave = false) => {
    if (!currentScenario) return;

    try {
      const feedbackResult = {
        userStoryValidation,
        acValidation,
        aiValidationResults,
        feedbacks,
        feedbackApplied,
        lastCheckedAt: new Date().toISOString()
      };

      const storyData = {
        scenarioId: currentScenario.id,
        userStory,
        acceptanceCriteria: acInputs,
        feedbackResult,
        currentStep: stepIndex,
        status: (stepIndex === coachingSteps.length - 1 && acInputs[stepIndex].trim() ? 'completed' : 'in_progress') as 'completed' | 'in_progress' | 'abandoned'
      };

      let result;
      if (savedStoryId) {
        // Update existing story
        result = await updatePracticeStory(savedStoryId, storyData);
      } else {
        // Create new story
        result = await savePracticeStory(storyData);
        if (result.success && result.data?.[0]?.id) {
          setSavedStoryId(result.data[0].id);
        }
      }

      if (result.success) {
        setLastSavedAt(new Date());
        if (!isAutoSave) {
          console.log('Progress saved successfully');
        }
      } else {
        console.warn('Failed to save progress:', result.error);
      }
    } catch (error) {
      console.error('Error saving to server:', error);
    }
  };

  const loadFromServer = async () => {
    if (!currentScenario) return;

    setIsLoadingFromServer(true);
    try {
      const result = await loadLastPracticeStory(currentScenario.id);
      
      if (result.success && result.data) {
        const savedStory = result.data;
        
        // Restore state from saved story
        setUserStory(savedStory.user_story || '');
        setAcInputs(savedStory.acceptance_criteria || Array(coachingSteps.length).fill(''));
        setStepIndex(savedStory.current_step || 0);
        setSavedStoryId(savedStory.id);
        setLastSavedAt(new Date(savedStory.updated_at));
        
        // Restore feedback if available
        if (savedStory.feedback_result) {
          const feedback = savedStory.feedback_result;
          if (feedback.feedbacks) {
            setFeedbacks(feedback.feedbacks);
          }
          if (feedback.aiValidationResults) {
            setAiValidationResults(feedback.aiValidationResults);
          }
          if (feedback.feedbackApplied) {
            setFeedbackApplied(feedback.feedbackApplied);
          }
        }
        
        console.log('Loaded previous progress from server');
      }
    } catch (error) {
      console.error('Error loading from server:', error);
    } finally {
      setIsLoadingFromServer(false);
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
    
    // Reset feedback applied status
    const newFeedbackApplied = [...feedbackApplied];
    newFeedbackApplied[stepIndex] = false;
    setFeedbackApplied(newFeedbackApplied);
  };

  const handleNewScenario = () => {
    // Set flag to prevent loading from server
    setIsStartingFresh(true);
    
    // Clear saved story ID and reset state
    setSavedStoryId(null);
    setLastSavedAt(null);
    
    // Reset all state
    setCurrentScenario(getRandomPracticeScenario());
    setUserStory('As a [role]\nI want [action]\nSo that [benefit]');
    setStepIndex(0);
    setAcInputs(Array(coachingSteps.length).fill(''));
    setFeedbacks(Array(coachingSteps.length).fill(''));
    setUserStoryValidation(null);
    setAcValidation(null);
    setAiValidationResults([]); // Clear AI feedback when getting new scenario
    setFeedbackApplied(Array(coachingSteps.length).fill(false)); // Reset feedback applied status
  };


  const handleCheck = async () => {
    if (stepIndex === 0) {
      // Step 1: Check user story structure with AI
      if (!userStory.trim()) {
        alert('Please enter a user story first.');
        return;
      }
      if (userStory.trim().length < 30) {
        alert('Please enter at least 30 characters for your user story before checking.');
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
          const outcomeMatch = /so\s+[a-z ]+/i.test(userStory);
          
          console.log('Validation results:', { roleMatch, actionMatch, outcomeMatch });
          
          const newFeedbacks = [...feedbacks];
          if (roleMatch && actionMatch && outcomeMatch) {
            newFeedbacks[stepIndex] = '✔️ Excellent! Your user story has all required parts: role, action, and benefit.';
          } else {
            const missing = [];
            if (!roleMatch) missing.push('role (As a...)');
            if (!actionMatch) missing.push('action (I want...)');
            if (!outcomeMatch) missing.push('benefit (so that...)');
            newFeedbacks[stepIndex] = `⚠️ Your user story is missing: ${missing.join(', ')}. Please add the missing parts.`;
          }
          setFeedbacks(newFeedbacks);
        }
      } catch (error) {
        console.error('AI validation error:', error);
        // Fallback to basic validation
        const newFeedbacks = [...feedbacks];
        newFeedbacks[stepIndex] = '⚠️ AI validation unavailable. Check console for details or ensure VITE_OPENAI_API_KEY is set.';
        setFeedbacks(newFeedbacks);
      } finally {
        setAiValidationLoading(false);
      }
    } else {
      // Steps 2-8: Check acceptance criteria with AI for specific step
      if (!userStory.trim()) {
        alert('Please enter a user story first before checking your acceptance criteria.');
        return;
      }
      
      const currentAcInput = acInputs[stepIndex];
      if (!currentAcInput.trim()) {
        alert('Please enter some acceptance criteria before checking.');
        return;
      }
      
      setAiValidationLoading(true);
      try {
        const currentStep = coachingSteps[stepIndex];
        const aiResult = await checkSpecificStepGPT(
          userStory, 
          currentAcInput, 
          currentStep.title, 
          currentStep.question, 
          currentStep.tip
        );
        
        if (aiResult) {
          setAiValidationResults([aiResult]); // Wrap in array for consistency
          
          const newFeedbacks = [...feedbacks];
          if (aiResult.status === '✅') {
            newFeedbacks[stepIndex] = `✔️ Excellent! ${aiResult.explanation}`;
          } else if (aiResult.status === '⚠️') {
            newFeedbacks[stepIndex] = `⚠️ ${aiResult.explanation}`;
          } else {
            newFeedbacks[stepIndex] = `❌ ${aiResult.explanation}`;
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
        newFeedbacks[stepIndex] = '⚠️ AI validation unavailable. Check console for details or ensure VITE_OPENAI_API_KEY is set.';
        setFeedbacks(newFeedbacks);
      } finally {
        setAiValidationLoading(false);
      }
    }
  };

  const handleApplyFeedback = (suggestion: string) => {
    // Only apply if it's a real suggestion, not considerations or explanations
    if (suggestion.toLowerCase().includes('consider') || 
        suggestion.toLowerCase().includes('think about') ||
        suggestion.toLowerCase().includes('improvement needed') ||
        suggestion.length < 20) {
      return; // Don't apply considerations or short text
    }

    if (stepIndex === 0) {
      // Apply to user story
      setUserStory(suggestion);
    } else {
      // Apply to acceptance criteria
      const newInputs = [...acInputs];
      newInputs[stepIndex] = suggestion;
      setAcInputs(newInputs);
    }
    
    // Mark feedback as applied
    const newFeedbackApplied = [...feedbackApplied];
    newFeedbackApplied[stepIndex] = true;
    setFeedbackApplied(newFeedbackApplied);
  };

  const handleNext = () => {
    const canProceed = stepIndex === 0 ? 
      // For user story step, check if AI validation passed
      userStory.trim() && aiValidationResults.length > 0 && aiValidationResults.every((r: any) => r.status === '✅')
      : 
      // For other steps, check if input is provided
      acInputs[stepIndex].trim();
      
    if (stepIndex < coachingSteps.length - 1 && canProceed) {
      setStepIndex(stepIndex + 1);
      setAcValidation(null);
      setAiValidationResults([]); // Clear AI feedback when moving to next step
    }
  };

  return (
    <>
    <div className="p-4 h-full flex flex-col">
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
                <span className={`ml-2 text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300`}>
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

      {/* Two Column Layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Column - Main Coaching Content (70% width) */}
        <div className="flex flex-col" style={{ flex: '0 0 70%' }}>
          {/* Coaching Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg flex-1 flex flex-col">
            <div className="space-y-4 p-6 flex-1 flex flex-col">
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
                      : acValidation && (acValidation.type as string) !== 'success'
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

                {/* Trigger Scope Rule (Step 3) */}
                {stepIndex === 2 && acInputs[stepIndex].trim() && (
                  (() => {
                    const trg = validateTriggerScope(userStory, acInputs[stepIndex]);
                    if (trg.passed) return null;
                    return (
                      <div className="mt-2 p-2 rounded-md text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                        <p>{trg.coachingMessage}</p>
                        {trg.mismatchFound && trg.expectedScope && (
                          <button
                            onClick={() => {
                              const suggestion = `After completing a ${trg.expectedScope}, ...`;
                              handleApplyFeedback(suggestion);
                            }}
                            className="mt-2 px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                          >
                            Apply Suggested Trigger
                          </button>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>

          {/* Check Button */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setStepIndex(prev => Math.max(prev - 1, 0));
                setAcValidation(null);
                setAiValidationResults([]); // Clear AI feedback when moving to previous step
              }}
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
              
              {(() => {
                const isAiPassed = aiValidationResults.length > 0 && aiValidationResults.every((r: any) => r.status === '✅');
                const isTooShort = (stepIndex === 0 && userStory.trim().length < 30);
                const isFeedbackApplied = feedbackApplied[stepIndex];
                const isDisabled = aiValidationLoading || isTooShort || isAiPassed || isFeedbackApplied;
                return (
                  <button
                    onClick={handleCheck}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                    title={isFeedbackApplied ? 'Feedback applied — edit to re-check' : isAiPassed ? 'Already passed — edit to re-check' : undefined}
                    className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium min-w-[160px] ${
                      aiValidationLoading
                        ? 'bg-blue-500 text-white cursor-not-allowed animate-pulse'
                        : isDisabled
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md'
                    }`}
                  >
                    {aiValidationLoading ? '🤖 AI Analyzing...' : (stepIndex === 0 ? 'Check User Story' : 'Check My Input')}
                  </button>
                );
              })()}

            {/* Keep some space between Check and Next so they remain visually distinct */}
            <div className="w-2" />

            <button
              onClick={handleNext}
              disabled={
                stepIndex === coachingSteps.length - 1 || 
                (stepIndex === 0 ? 
                  // For user story step (step 0), check if AI validation passed
                  !userStory.trim() || !aiValidationResults.length || !aiValidationResults.every((r: any) => r.status === '✅')
                  : 
                  // For other steps, check if input is provided
                  !acInputs[stepIndex].trim()
                )
              }
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                stepIndex === coachingSteps.length - 1 || 
                (stepIndex === 0 ? 
                  !userStory.trim() || !aiValidationResults.length || !aiValidationResults.every((r: any) => r.status === '✅')
                  : 
                  !acInputs[stepIndex].trim()
                )
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {stepIndex === 0 ? 'Next' : 'Next AC'}
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
      </div>

        {/* Right Column - AI Feedback (30% width) */}
        <div className="flex flex-col" style={{ flex: '0 0 30%' }}>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg h-full">
            <div className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🤖 AI Feedback
              </h3>
              
              <div className="flex-1 overflow-y-auto">
                {aiValidationLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Analyzing...</span>
                  </div>
                ) : aiValidationResults.length > 0 ? (
                  <div className="space-y-3">
                    {aiValidationResults.map((result, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-start space-x-2">
                          <span className="text-lg">{result.status}</span>
                          <div className="flex-1">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {result.explanation}
                            </p>
                            {result.suggestion && !feedbackApplied[stepIndex] && 
                             result.suggestion.toLowerCase().includes('improvement needed') === false &&
                             result.suggestion.toLowerCase().includes('consider') === false &&
                             result.suggestion.toLowerCase().includes('think about') === false &&
                             result.suggestion.length > 20 && (
                              <div className="mt-2">
                                <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                                  💡 {result.suggestion}
                                </p>
                                <button
                                  onClick={() => handleApplyFeedback(result.suggestion)}
                                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                  Apply Suggestion
                                </button>
                              </div>
                            )}
                            {feedbackApplied[stepIndex] && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                ✅ Feedback applied
                              </p>
                            )}
                          </div>
                        </div>
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
      
      {/* Advanced Explainer Modal */}
      {showAdvancedExplainer && (
        <AdvancedExplainer
          onAccept={handleAcceptAdvanced}
          onDismiss={handleDismissAdvanced}
          triggersFound={advancedTriggersFound}
        />
      )}
    </div>
    <StakeholderBotLauncher />
    <StakeholderBotPanel />
    </>
  );
}
