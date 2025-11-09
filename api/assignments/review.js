/**
 * Vercel Serverless Function: Assignment Review
 * Handles AI-powered assignment grading
 */

import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { moduleTitle, assignmentDescription, submission } = req.body;

    if (!moduleTitle || !assignmentDescription || !submission) {
      return res.status(400).json({ 
        error: 'Missing required fields: moduleTitle, assignmentDescription, submission' 
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `You are an expert Business Analyst educator reviewing a student assignment.

Module: ${moduleTitle}
Assignment: ${assignmentDescription}

Student Submission:
${submission}

Please provide:
1. A score from 0-100
2. Constructive feedback (2-3 sentences)
3. Specific strengths
4. Areas for improvement

Format your response as JSON:
{
  "score": <number>,
  "feedback": "<string>",
  "strengths": "<string>",
  "improvements": "<string>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
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
    console.error('Assignment Review Error:', error);
    return res.status(500).json({ 
      error: 'Failed to review assignment',
      details: error.message 
    });
  }
}


