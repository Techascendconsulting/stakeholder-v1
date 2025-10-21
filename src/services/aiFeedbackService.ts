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
    const prompt = `You are evaluating a trainee Business Analyst.

Rule: ${ruleName}
Reference story: ${referenceStory}
Learner's response: ${userResponse}

Evaluate the response against the rule. Consider:
- Does it focus on what the user can do?
- Is it clear and specific?
- Does it align with the rule being taught?

Return JSON only with this exact format:
{"score": number (1-5), "feedback": "one short coaching sentence"}

Be encouraging but honest. If good, say why. If needs improvement, give one specific tip.`;

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

