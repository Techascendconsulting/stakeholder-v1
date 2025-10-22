// AI Feedback Service for BA Thinking Framework
// Uses OpenAI gpt-4o-mini for cost-effective coaching

import { AI_FEEDBACK_CONFIG } from '../config/app';

export interface AIFeedbackResult {
  score: number; // 1-5
  feedback: string;
}

export async function checkResponseWithAI(
  ruleName: string,
  referenceStory: string,
  userResponse: string
): Promise<AIFeedbackResult> {
  try {
    const prompt = `You are an expert Business Analyst coaching acceptance criteria writing.

Rule: ${ruleName}
Reference story: ${referenceStory}
Learner's response: ${userResponse}

Evaluate this as an acceptance criteria. Be specific and intelligent:

For User Goal: Look for clear user actions, avoid system jargon
For Triggers: Check for specific conditions (dates, statuses, events)
For Success Flow: Verify step-by-step user actions
For Alternative Paths: Ensure valid alternatives that still succeed
For Business Rules: Look for clear constraints and validations
For Permissions: Check role-based access clearly defined
For Success Messages: Verify observable user feedback
For Error Handling: Check for specific error scenarios
For Empty States: Ensure helpful guidance when no data exists
For Undo Actions: Verify safe reversal mechanisms

AC Writing Intelligence:
- Dates: Suggest specific formats (dd-mm-yyyy, ISO format)
- Data: Mention field names, validation rules
- UI: Reference buttons, messages, visual feedback
- Business Logic: Include specific thresholds, calculations
- User Roles: Name actual roles (tenant officer, manager, etc.)

Return JSON only:
{"score": number (1-5), "feedback": "specific AC writing tip with examples"}

Be encouraging but give concrete, actionable advice for better acceptance criteria.`;

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_FEEDBACK_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: AI_FEEDBACK_CONFIG.temperature,
        max_tokens: AI_FEEDBACK_CONFIG.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('AI feedback unavailable');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    
    return {
      score: parsed.score || 3,
      feedback: parsed.feedback || 'Good effort! Keep practicing.',
    };

  } catch (error) {
    console.error('AI feedback error:', error);
    // Return neutral feedback on error
    return {
      score: 3,
      feedback: 'Response recorded. Continue to see example answer.',
    };
  }
}

