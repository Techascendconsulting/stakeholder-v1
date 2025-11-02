// utils/validateAcceptanceCriteria.ts
import { OpenAI } from 'openai';

// Initialize OpenAI client only when needed
function getOpenAIClient() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const hasValidApiKey = apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0;
  if (!hasValidApiKey) {
    return null;
  }
  try {
    return new OpenAI({ 
      apiKey: apiKey.trim(),
      dangerouslyAllowBrowser: true, // Required for browser environment
      baseURL: 'http://localhost:3001/api/openai-proxy'
    });
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI client for validation:', error);
    return null;
  }
}

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

// ✅ Step 1: Local basic check (structure + gibberish)
export function isValidText(text: string) {
  const gibberishPattern = /^[a-z]{3,}$/i;
  return text.trim().length > 10 && !gibberishPattern.test(text.trim());
}

// GPT-powered validation for specific coaching step
export async function checkSpecificStepGPT(userStory: string, acInput: string, stepTitle: string, stepQuestion: string, stepTip: string) {
  const openai = getOpenAIClient();
  if (!openai) {
    console.warn('OpenAI API key not found. Using fallback validation.');
    return null;
  }

  const prompt = `
You are an expert Business Analyst coach helping someone write acceptance criteria.

Current Coaching Step: ${stepTitle}
Question: ${stepQuestion}
Tip: ${stepTip}

User Story: "${userStory}"
Acceptance Criteria Input: "${acInput}"

Analyze if the acceptance criteria input properly addresses the specific coaching step requirements.

Return a JSON object with:
{
  "status": "✅" or "⚠️" or "❌",
  "explanation": "Specific feedback on how well this AC addresses the coaching step",
  "suggestion": "Specific improvement suggestion if needed"
}

Focus ONLY on whether this specific AC addresses the coaching step's requirements, not general AC quality.`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    });

    const content = res.choices[0].message.content;
    console.log('AI Response for specific step:', content);
    
    try {
      // Remove markdown code blocks if present
      let jsonContent = content || '';
      if (jsonContent.includes('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (jsonContent.includes('```')) {
        jsonContent = jsonContent.replace(/```\n?/g, '');
      }
      
      const parsed = JSON.parse(jsonContent.trim());
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', content);
      return null;
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

// ✅ Step 2: GPT-assisted analysis
export async function checkAcceptanceCriteriaGPT(userStory: string, acList: string[]) {
  const openai = getOpenAIClient();
  if (!openai) {
    console.warn('OpenAI API key not found. Using fallback validation.');
    return null;
  }

  const prompt = `
You are a Business Analyst trainer. Review the following user story and its acceptance criteria based on these 8 rules:

1. Main Function (what user wants)
2. Why / Purpose
3. Feedback / Success Response
4. Input / Trigger
5. Business Rule / Constraint
6. Unhappy Path
7. Error Message
8. Non-Functional Requirement

Return a JSON object like:
[
  {
    rule: 'Main Function',
    status: '✅',
    explanation: 'Clear and specific – user wants to upload photo'
  },
  ...
]

User Story:
"${userStory}"

Acceptance Criteria:
${acList.map((ac, i) => `${i + 1}. ${ac}`).join('\n')}
`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    const content = res.choices[0].message.content;
    console.log('AI Response:', content);
    
    try {
      // Remove markdown code blocks if present
      let jsonContent = content || '';
      if (jsonContent.includes('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (jsonContent.includes('```')) {
        jsonContent = jsonContent.replace(/```\n?/g, '');
      }
      
      const parsed = JSON.parse(jsonContent.trim());
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', content);
      return null;
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}
