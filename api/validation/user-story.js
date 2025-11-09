/**
 * Vercel Serverless Function: User Story Validation
 * Validates user stories against INVEST criteria
 */

import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userStory } = req.body;

    if (!userStory) {
      return res.status(400).json({ error: 'Missing userStory' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `You are an expert Business Analyst reviewing a user story.

User Story:
${userStory}

Evaluate this user story against the INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable).

Provide your response in JSON format:
{
  "isValid": true/false,
  "score": <number 0-100>,
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "feedback": "<overall feedback>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error('User Story Validation Error:', error);
    return res.status(500).json({ 
      error: 'Failed to validate user story',
      details: error.message 
    });
  }
}

