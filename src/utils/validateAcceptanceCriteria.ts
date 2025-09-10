// utils/validateAcceptanceCriteria.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY
});

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

// ✅ Step 2: GPT-assisted analysis
export async function checkAcceptanceCriteriaGPT(userStory: string, acList: string[]) {
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

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  });

  const content = res.choices[0].message.content;
  try {
    const parsed = JSON.parse(content || '');
    return parsed;
  } catch {
    return null;
  }
}
