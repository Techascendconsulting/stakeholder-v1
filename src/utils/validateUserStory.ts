// User Story Validation using secure backend API
// SECURITY: No OpenAI API key in frontend
import { validateUserStory as apiValidateUserStory } from '../lib/apiClient';

// Local structural check (optional before API call)
export function isUserStoryStructureValid(text: string) {
  const lowerText = text.toLowerCase();
  return (
    lowerText.includes('as a') &&
    lowerText.includes('i want') &&
    (lowerText.includes('so that') || lowerText.includes('so ')) &&
    text.length > 30
  );
}

// GPT-powered validation of user story quality via secure backend
export async function checkUserStoryGPT(userStory: string) {
  try {
    const result = await apiValidateUserStory({ userStory });
    
    if (!result.success) {
      console.warn('User story validation unavailable:', result.error);
      return null;
    }

    // Convert backend response to the format expected by frontend
    const rules = [];
    
    if (result.isValid) {
      rules.push({
        rule: "Overall Quality",
        status: "✅",
        explanation: result.feedback
      });
    } else {
      rules.push({
        rule: "Overall Quality",
        status: "❌",
        explanation: result.feedback
      });
    }

    // Add strengths
    result.strengths?.forEach((strength: string) => {
      rules.push({
        rule: "Strength",
        status: "✅",
        explanation: strength
      });
    });

    // Add improvements
    result.improvements?.forEach((improvement: string) => {
      rules.push({
        rule: "Improvement Needed",
        status: "⚠️",
        explanation: improvement
      });
    });

    return rules;
  } catch (error) {
    console.error('User story validation error:', error);
    return null;
  }
}
