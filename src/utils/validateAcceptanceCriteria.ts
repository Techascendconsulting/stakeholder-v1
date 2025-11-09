// Acceptance Criteria Validation using secure backend API
// SECURITY: No OpenAI API key in frontend

// 8 rules baseline
const rules = [
  { key: 'mainFunction', label: 'Main Function (what they want)' },
  { key: 'why', label: 'Why / Purpose' },
  { key: 'feedback', label: 'Feedback / Success Response' },
  { key: 'input', label: 'Trigger / Input Condition' },
  { key: 'businessRule', label: 'Business Rule / Constraint' },
  { key: 'unhappyPath', label: 'Unhappy Path / What can go wrong' },
  { key: 'errorMessage', label: 'Error Message' },
  { key: 'nonFunctional', label: 'Non-Functional Requirement' }
];

// Local basic check (structure + gibberish)
export function isValidText(text: string) {
  const gibberishPattern = /^[a-z]{3,}$/i;
  return text.trim().length > 10 && !gibberishPattern.test(text.trim());
}

// API call helper
async function callValidationAPI(body: any) {
  try {
    const response = await fetch('/api/validation/acceptance-criteria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Validation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Validation API error:', error);
    return null;
  }
}

// GPT-powered validation for specific coaching step
export async function checkSpecificStepGPT(
  userStory: string, 
  acInput: string, 
  stepTitle: string, 
  stepQuestion: string, 
  stepTip: string
) {
  const result = await callValidationAPI({
    userStory,
    specificStep: {
      stepTitle,
      stepQuestion,
      stepTip,
      acInput,
    },
  });

  if (!result?.success) {
    console.warn('AC validation unavailable');
    return null;
  }

  return result.result;
}

// GPT-assisted full AC list analysis
export async function checkAcceptanceCriteriaGPT(userStory: string, acList: string[]) {
  const result = await callValidationAPI({
    userStory,
    acList,
  });

  if (!result?.success) {
    console.warn('AC validation unavailable');
    return null;
  }

  return result.result;
}
