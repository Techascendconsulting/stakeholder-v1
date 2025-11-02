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
    const prompt = `You are a Senior Business Analyst with 15 years of experience coaching acceptance criteria writing.

Rule: ${ruleName}
Reference story: ${referenceStory}
Learner's response: ${userResponse}

Apply 15 years of BA expertise to evaluate this acceptance criteria:

BUSINESS ANALYSIS INTELLIGENCE:
- Stakeholder Impact: Does it consider all affected parties?
- Business Value: Is the value proposition clear and measurable?
- Risk Assessment: Are potential failure points identified?
- Compliance: Does it address regulatory or policy requirements?
- Performance: Are performance expectations realistic?
- Integration: Does it consider system dependencies?

TECHNICAL SOPHISTICATION:
- Data Integrity: Are data validation rules comprehensive?
- Security: Are access controls and permissions properly defined?
- Scalability: Can the solution handle growth scenarios?
- Error Recovery: Are graceful degradation paths defined?
- Audit Trail: Is tracking and logging addressed?
- Performance Metrics: Are measurable outcomes defined?

USER EXPERIENCE MASTERY:
- Usability: Is the user journey intuitive and efficient?
- Accessibility: Are diverse user needs considered?
- Feedback Loops: Is user confirmation and error messaging clear?
- Edge Cases: Are unusual but valid scenarios covered?
- Mobile/Desktop: Are platform-specific considerations included?
- Internationalization: Are cultural and language factors addressed?

ENTERPRISE THINKING:
- Process Integration: How does this fit into larger workflows?
- Change Management: Are transition scenarios considered?
- Training Needs: Are user education requirements identified?
- Maintenance: Are ongoing support scenarios covered?
- Reporting: Are analytics and monitoring needs addressed?
- Documentation: Are knowledge transfer requirements clear?

ADVANCED AC PATTERNS:
- Given-When-Then: Proper scenario structure
- Boundary Testing: Edge cases and limits
- State Transitions: Clear before/after conditions
- Business Rules: Complex conditional logic
- Data Relationships: Cross-system dependencies
- Performance SLAs: Response time expectations

Return JSON only:
{"score": number (1-5), "feedback": "senior BA insight with specific enterprise-level guidance"}

Provide expert-level coaching that reflects deep industry experience and enterprise complexity.`;

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

