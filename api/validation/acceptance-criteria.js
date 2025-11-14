/**
 * Vercel Serverless Function: Acceptance Criteria Validation
 * Validates acceptance criteria against BA best practices
 */

import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userStory, acList, specificStep } = req.body;

    if (!userStory) {
      return res.status(400).json({ error: 'Missing userStory' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let prompt = '';
    
    // Check if this is for a specific coaching step or full validation
    if (specificStep) {
      const { stepTitle, stepQuestion, stepTip, acInput } = specificStep;
      
      prompt = `You are an expert Business Analyst coach helping someone write acceptance criteria.

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

    } else {
      // Full validation of AC list
      if (!acList || !Array.isArray(acList)) {
        return res.status(400).json({ error: 'Missing or invalid acList' });
      }

      prompt = `You are a Business Analyst trainer. Review the following user story and its acceptance criteria based on these 8 rules:

1. Main Function (what user wants)
2. Why / Purpose
3. Feedback / Success Response
4. Input / Trigger
5. Business Rule / Constraint
6. Unhappy Path
7. Error Message
8. Non-Functional Requirement

Return a JSON array like:
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
${acList.map((ac, i) => `${i + 1}. ${ac}`).join('\n')}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    
    // Parse and clean the response
    let jsonContent = content || '{}';
    if (jsonContent.includes('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (jsonContent.includes('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }
    
    const result = JSON.parse(jsonContent.trim());

    return res.status(200).json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('Acceptance Criteria Validation Error:', error);
    return res.status(500).json({ 
      error: 'Failed to validate acceptance criteria',
      details: error.message 
    });
  }
}



