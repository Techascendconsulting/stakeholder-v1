// utils/validateUserStory.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY
});

// Local structural check (optional before GPT)
export function isUserStoryStructureValid(text: string) {
  return (
    text.includes('As a') &&
    text.includes('I want') &&
    text.includes('so that') &&
    text.length > 30
  );
}

// GPT-powered validation of user story quality
export async function checkUserStoryGPT(userStory: string) {
  // Check if API key is available
  if (!import.meta.env.VITE_OPENAI_KEY) {
    console.warn('OpenAI API key not found. Using fallback validation.');
    return null;
  }

  const prompt = `
You are an expert Business Analyst coach.

Analyze the following user story using these rules:
1. Role is clear (e.g., "As a tenant")
2. Action is clear (e.g., "I want to upload a photo")
3. Outcome is clear (e.g., "so that the housing team…")
4. Uses correct format: "As a [role], I want to [action], so that [outcome]"
5. Avoids system-centered language ("The system should...")
6. Describes ONE clear thing (Independent, Small)
7. Testable: observable outcome when complete

Return a JSON object like:
[
  {
    rule: "Role",
    status: "✅",
    explanation: "The role 'tenant' is clearly stated."
  },
  ...
]

User Story:
"${userStory}"
`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    });

    const content = res.choices[0].message.content;
    console.log('AI Response:', content);
    
    try {
      const parsed = JSON.parse(content || '');
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}
